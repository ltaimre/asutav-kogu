// XML parsimise abifunktsioonid Asutava Kogu protokollide jaoks

export function extractTeiMetadata(xmlString) {
  if (typeof window === "undefined") {
    return null;
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  const metadata = {
    title: "",
    date: "",
    author: "",
    description: "",
    year: "",
    documentId: "",
    content: [],
  };

  // Ekstrakti dokumendi ID ja aasta root elemendist
  const textEl = xmlDoc.querySelector("text");
  if (textEl) {
    metadata.documentId = textEl.getAttribute("id") || "";
    metadata.year = textEl.getAttribute("aasta") || "";
  }

  // Ekstrakti pealkiri
  const titleEl = xmlDoc.querySelector("title");
  if (titleEl) {
    metadata.title = titleEl.textContent.trim();
  }

  // Ekstrakti dokumendi andmed
  const estTitleEl = xmlDoc.querySelector("document_title estonian");
  if (estTitleEl) {
    metadata.description = estTitleEl.textContent.trim();
  }

  // Ekstrakti aastaarv bibliograafiast
  const yearEl = xmlDoc.querySelector("bibliographical_data year");
  if (yearEl) {
    metadata.date = yearEl.textContent.trim();
  }

  // Ekstrakti looja info
  const creatorEl = xmlDoc.querySelector("creator");
  if (creatorEl) {
    metadata.author = creatorEl.textContent.trim();
  }

  // Ekstrakti sisu sisukord (esimene lõik sisuga)
  const firstContentP = xmlDoc.querySelector("p");
  if (firstContentP) {
    const sentences = firstContentP.querySelectorAll("s");
    if (sentences.length > 0) {
      const contentList = [];
      sentences.forEach((s) => {
        const text = s.textContent.trim();
        if (text) {
          contentList.push(text);
        }
      });
      if (contentList.length > 0) {
        metadata.content.push({
          type: "toc",
          text: contentList.join(" "),
        });
      }
    }
  }

  // Ekstrakti kõik kõned ja tekstiread
  const allElements = xmlDoc.querySelectorAll("div1, h, p");
  allElements.forEach((el) => {
    if (el.tagName === "h") {
      // Pealkirjad
      metadata.content.push({
        type: "heading",
        text: el.textContent.trim(),
      });
    } else if (el.tagName === "div1") {
      // Kõned
      const speaker = el.querySelector("spk");
      if (speaker) {
        metadata.content.push({
          type: "speaker",
          text: speaker.textContent.trim(),
        });
      }
      const paragraphs = el.querySelectorAll("p");
      paragraphs.forEach((p) => {
        const sentences = p.querySelectorAll("s");
        const texts = [];
        sentences.forEach((s) => texts.push(s.textContent.trim()));
        if (texts.length > 0) {
          metadata.content.push({
            type: "speech",
            text: texts.join(" "),
          });
        }
      });
    } else if (el.tagName === "p" && !el.closest("div1")) {
      // Tavalised lõigud (mis ei ole kõnede sees)
      const sentences = el.querySelectorAll("s");
      if (sentences.length > 0) {
        const texts = [];
        sentences.forEach((s) => texts.push(s.textContent.trim()));
        if (texts.length > 0) {
          metadata.content.push({
            type: "paragraph",
            text: texts.join(" "),
          });
        }
      }
    }
  });

  return metadata;
}
