// src/constants/index.js

export const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1A8rcM-TrdTEAFRH6fP4TfwnFCvqpZnrTpRGCsatSyvo/export?format=csv&gid=0";

// Komisjoni kuulumise sheet URL - pead asendama KOMISJON_GID õige gid numbriga
// Saad gid numbri Google Sheetsi URL-ist, kui valid "Komisjoni kuulumine" sheet'i
export const KOMISJON_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1A8rcM-TrdTEAFRH6fP4TfwnFCvqpZnrTpRGCsatSyvo/export?format=csv&gid=565553555";

// Komisjonide metadata (vaikimisi alguskuupäevad) - pead asendama KOMISJONID_GID õige gid numbriga
export const KOMISJONID_METADATA_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1A8rcM-TrdTEAFRH6fP4TfwnFCvqpZnrTpRGCsatSyvo/export?format=csv&gid=1024923097";

export const TABLE_TITLE = "Asutava Kogu liikmed";

export const AK_ALGUS = "23.04.1919";
export const AK_LOPP = "20.12.1920";
export const DISPLAY_COLUMNS = [
  "eesnimi",
  "perekonnanimi",
  "pol_rühm",
  "AKL_algus",
  "AKL_lõpp",
  "päevi_ametis",
  "komisjonide_arv",
];

export const COLUMN_LABELS = {
  eesnimi: "Eesnimi",
  perekonnanimi: "Perekonnanimi",
  pol_rühm: "Poliitiline rühm",
  AKL_algus: "Ametiaja algus",
  AKL_lõpp: "Ametiaja lõpp",
  päevi_ametis: "Päevi ametis",
  komisjonide_arv: "Komisjonid",
};
