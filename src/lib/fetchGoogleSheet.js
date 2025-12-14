import { AK_ALGUS, AK_LOPP } from "../constants";

/**
 * Vormindab kuupäeva kujule DD.MM.YYYY
 * @param {string} dateStr - Kuupäev stringina (formaadis YYYY-MM-DD või DD.MM.YYYY)
 * @returns {string} Vormindatud kuupäev
 */
function formatDate(dateStr) {
  const parts = dateStr.includes(".")
    ? dateStr.split(".")
    : dateStr.split("-").reverse();
  const [day, month, year] = parts.map((p) => p.padStart(2, "0"));
  return `${day}.${month}.${year}`;
}

/**
 * Laeb Google Sheeti CSV-andmed ja töötleb need objektideks
 * @param {string} csvUrl - Google Sheetsi CSV URL
 * @returns {Promise<{ headers: string[], rows: object[] }>}
 */
export async function fetchGoogleSheetCsv(csvUrl) {
  const res = await fetch(csvUrl);
  const text = await res.text();

  const [headerLine, ...lines] = text.trim().split("\n");
  const headers = headerLine.split(",").map((h) => h.trim());

  const rows = lines.map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row = Object.fromEntries(values.map((v, i) => [headers[i], v || ""]));

    // Täienda AKL kuupäevi kui tühjad
    const aklAlgusRaw = row["AKL_algus"] || AK_ALGUS;
    const aklLoppRaw = row["AKL_lõpp"] || AK_LOPP;

    // Vorminda kuupäevad
    const formattedAlgus = formatDate(aklAlgusRaw);
    const formattedLopp = formatDate(aklLoppRaw);

    // Arvuta päevade arv (Date võtab formaadis YYYY-MM-DD)
    const startDate = new Date(
      aklAlgusRaw.includes(".")
        ? aklAlgusRaw.split(".").reverse().join("-")
        : aklAlgusRaw
    );
    const endDate = new Date(
      aklLoppRaw.includes(".")
        ? aklLoppRaw.split(".").reverse().join("-")
        : aklLoppRaw
    );
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.round((endDate - startDate) / msPerDay);

    return {
      ...row,
      AKL_algus: formattedAlgus,
      AKL_lõpp: formattedLopp,
      päevi_ametis: days >= 0 ? days : "",
    };
  });

  return { headers, rows };
}

/**
 * Laeb komisjonide vaikimisi alguskuupäevad CSV-st
 * @param {string} csvUrl - Komisjonide sheet CSV URL
 * @returns {Promise<Map<string, string>>} - Map kus võti on komisjoni nimi ja väärtus on vaikimisi alguskuupäev
 */
export async function fetchKomisjonidMetadata(csvUrl) {
  try {
    const res = await fetch(csvUrl);
    const text = await res.text();

    const [headerLine, ...lines] = text.trim().split("\n");

    // Loome Map komisjoni nimega kui võti ja Valimised kuupäevaga kui väärtus
    const komisjonDefaultDates = new Map();

    lines.forEach((line) => {
      const values = line.split(",").map((v) => v.trim());
      const komisjonNimi = values[0]; // Esimene veerg on "Komisjon"
      const valimisedKuupaev = values[1]; // Teine veerg on "Valimised"

      if (komisjonNimi && valimisedKuupaev) {
        komisjonDefaultDates.set(komisjonNimi, valimisedKuupaev);
      }
    });

    return komisjonDefaultDates;
  } catch (error) {
    console.error("Viga komisjonide metadata laadimisel:", error);
    return new Map();
  }
}

/**
 * Laeb komisjoni kuulumise andmed CSV-st koos kuupäevadega
 * @param {string} csvUrl - Komisjoni kuulumise CSV URL
 * @param {Map<string, string>} defaultDates - Komisjonide vaikimisi alguskuupäevad
 * @param {string} akLopp - Asutava Kogu lõpp kuupäev (vaikimisi lõpp)
 * @returns {Promise<Map<string, Array>>} - Map kus võti on liikme ID ja väärtus on komisjonide massiiv objektidega
 */
export async function fetchKomisjonData(csvUrl, defaultDates, akLopp) {
  try {
    const res = await fetch(csvUrl);
    const text = await res.text();

    const [headerLine, ...lines] = text.trim().split("\n");

    // Grupeerime komisjonid liikme ID järgi
    const komisjonMap = new Map();

    lines.forEach((line) => {
      const values = line.split(",").map((v) => v.trim());
      const liigeId = values[0]; // "liige" (ID)
      const komisjon = values[1]; // "komisjon"
      const kuulumineAlgus = values[2]; // "kuulumine_algus"
      const kuulumineLopp = values[3]; // "kuulumine_lopp"

      if (liigeId && komisjon) {
        if (!komisjonMap.has(liigeId)) {
          komisjonMap.set(liigeId, []);
        }

        // Määrame alguskuupäeva: kas antud kuupäev või vaikimisi komisjoni valimiste kuupäev
        let algus = kuulumineAlgus;
        if (!algus || algus === "") {
          algus = defaultDates.get(komisjon) || "";
        }

        // Määrame lõpukuupäeva: kas antud kuupäev või AK_LOPP
        let lopp = kuulumineLopp;
        if (!lopp || lopp === "") {
          lopp = akLopp;
        }

        komisjonMap.get(liigeId).push({
          nimi: komisjon,
          algus: algus,
          lopp: lopp,
        });
      }
    });

    return komisjonMap;
  } catch (error) {
    console.error("Viga komisjoni andmete laadimisel:", error);
    return new Map();
  }
}
