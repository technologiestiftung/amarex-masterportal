import { jsPDF } from "jspdf";
import ArialNormal from "./assets/arial-normal";
import ArialBold from "./assets/arial-bold";
import ArialItalic from "./assets/arial-italic";
import logo from "./assets/amarex_logo_webtool.png";
import EntsiegelungIcon from "./assets/EntsiegelungIcon.jpg";
import GruendachIcon from "./assets/GruendachIcon.jpg";
import MuldeIcon from "./assets/MuldeIcon.jpg";
import autoTable from "jspdf-autotable";

function toFileSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

async function getAspectRatio(imageSrc) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      const originalWidth = img.naturalWidth;
      const originalHeight = img.naturalHeight;
      const aspectRatio = originalWidth / originalHeight;

      resolve({
        aspectRatio,
      });
    };
    img.onerror = function () {
      reject(new Error("Failed to load image."));
    };
    img.src = imageSrc;
  });
}

async function getPngBlobFromUrl(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return await response.blob(); // This is your PNG blob
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function writePDF(payload, savingType, blob) {
  if (!payload) {
    throw new Error("🚨 payload fehlt");
  }

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  const pixelsToMM = 0.3529411765;
  const paddingHorizontal = 40 * pixelsToMM;
  const paddingVertical = 30 * pixelsToMM;
  const pageInnerWidth = 515 * pixelsToMM;
  const pageInnerHeight = 782 * pixelsToMM;
  const iconSizes = 28 * pixelsToMM;
  const leftHalfOfThePage = pageInnerWidth / 2 - mm(24);
  const rightHalfOfThePage = paddingVertical + pageInnerWidth / 2
  const showTableOnPageFive = true

  let vertical = paddingVertical;
  let pageCounter = 0;

  function mm(px) {
    return px * pixelsToMM;
  }
  function text(props) {
    if (!props) {
      return;
    }

    const {
      text,
      size,
      weight,
      x,
      y,
      noLineBreak,
      extraMarginBottom,
      maxWidth,
      url,
    } = props;

    if (!text) {
      return;
    }

    const posX = x ?? paddingHorizontal;
    const posY = y ?? vertical;
    const setSize = size ?? 14;
    const setLineHeight = 24;
    const setlineHeightFactor = setLineHeight / setSize;
    const setMaxWidth = maxWidth ? leftHalfOfThePage : pageInnerWidth;

    doc.setFontSize(setSize);

    if (weight === "b") {
      doc.setFont("Arial", "bold");
    } else if (weight === "i") {
      doc.setFont("Arial", "italic");
    } else {
      doc.setFont("Arial", "normal");
    }

    const lines = doc.splitTextToSize(text, pageInnerWidth);

    if (url) {
      doc.setTextColor(0, 0, 255);
      doc.textWithLink(text, posX, posY, {
        url,
        maxWidth: setMaxWidth,
        lineHeightFactor: setlineHeightFactor,
      });
      const textWidth = doc.getTextWidth(text);
      doc.setDrawColor(0, 0, 255);
      doc.setLineWidth(0.5);
      doc.line(posX, posY + 1, posX + textWidth, posY + 1);
    } else {
      doc.setTextColor(0, 0, 0);
      doc.text(text, posX, posY, {
        maxWidth: setMaxWidth,
        lineHeightFactor: setlineHeightFactor,
      });
    }

    if (!noLineBreak) {
      vertical += mm(lines.length * setLineHeight);
    }

    if (typeof extraMarginBottom === "number") {
      vertical += mm(extraMarginBottom);
    }
  }
  function drawLine(setMarginBottom) {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(
      paddingHorizontal,
      vertical,
      pageInnerWidth + paddingHorizontal,
      vertical,
    );
    if (typeof setMarginBottom === "number") {
      vertical += mm(setMarginBottom);
    }
  }
  function makeHeader(headerText) {
    if (headerText !== "Report") {
      doc.addPage();
      vertical = paddingVertical;
    }
    pageCounter++;
    const pageNumber = `Seite ${pageCounter}`;
    text({
      text: pageNumber,
      size: 12,
      x: pageInnerWidth + paddingHorizontal - doc.getTextWidth(pageNumber),
      y: pageInnerHeight + paddingVertical,
    });
    const logoWidth = 247.708 * pixelsToMM;
    const logoHeight = logoWidth * 0.1211101766;
    doc.addImage(
      logo,
      "PNG",
      paddingHorizontal + (pageInnerWidth - logoWidth),
      vertical,
      logoWidth,
      logoHeight,
    );
    vertical += logoHeight + mm(60);
    text({
      text: headerText,
      size: 24,
      weight: "b",
    });
    drawLine();
    vertical += mm(40);
  }
  function getMarginLeft(text) {
    return paddingHorizontal + doc.getTextWidth(text);
  }

  doc.addFileToVFS("Arial.ttf", ArialNormal);
  doc.addFont("Arial.ttf", "Arial", "normal");
  doc.addFileToVFS("Arial-Bold.ttf", ArialBold);
  doc.addFont("Arial-Bold.ttf", "Arial", "bold");
  doc.addFileToVFS("Arial-Italic.ttf", ArialItalic);
  doc.addFont("Arial-Italic.ttf", "Arial", "italic");

  // 1. Page
  makeHeader("Report");

  text({
    text: "Allgemein",
    size: 18,
    weight: "b",
    extraMarginBottom: 10,
  });
  text({
    text: "Name des Projekts: ",
    noLineBreak: true,
  });
  text({
    text: payload.title,
    weight: "b",
    x: getMarginLeft("Name des Projekts: "),
    extraMarginBottom: 10,
  });
  if (payload.description) {
    text({
      text: "Kommentar zum eigenen Projekt:",
      extraMarginBottom: 10,
    });
    text({
      text: payload.description,
      weight: "i",
      noLineBreak: true,
      extraMarginBottom: 94,
    });
  }
  drawLine(36);
  text({
    text: "Siedlungswasserwirtschaftliche Kennzahlen zum Gebiet im Status Quo:",
    weight: "b",
    extraMarginBottom: 14,
  });
  text({
    text: payload.isMeasurePlanning || payload.betrachteteblockteilflaechen === 1 ? "Flächenanteile von der Gesamtfläche der ausgewählten Blockteilfläche:" : `Flächenanteile von der Gesamtfläche der ausgewählten ${payload.betrachteteblockteilflaechen} Blockteilflächen:`,
  });
  text({
    text: " • Dachfläche: ",
    noLineBreak: true,
  });
  text({
    text: payload.flächenanteile_dachfläche,
    x: getMarginLeft(" • Dachfläche: "),
  });
  text({
    text: "      • Davon begrünt: ",
    noLineBreak: true,
  });
  text({
    text: ` ${payload.flächenanteile_davon_begrünt_status_quo}`,
    x: getMarginLeft("      • Davon begrünt: ")
  });
  text({
    text: " • Unbebaut versiegelte Fläche: ",
    noLineBreak: true,
  });
  text({
    text: payload.flächenanteile_unbebaut_versiegelte_flächen_status_quo,
    x: getMarginLeft(" • Unbebaut versiegelte Fläche: ")
  });
  text({
    text: " • Unversiegelte Fläche: ",
    noLineBreak: true,
  });
  text({
    text: payload.flächenanteile_unversiegelte_flächen_status_quo,
    x: getMarginLeft(" • Unversiegelte Fläche: "),
    extraMarginBottom: 28,
  });

  // 2. Page
  makeHeader("Eigene Karte");
  text({
    text: "Ausgewählter Kartenbereich:",
    weight: "b",
  });

  if (blob) {
    const base64Image = await blobToBase64(blob);
    const imgAspect = await getAspectRatio(base64Image);
    const mapHeight = pageInnerHeight - vertical + paddingVertical;
    const mapWidth = imgAspect.aspectRatio * mapHeight;
    doc.addImage(
      base64Image,
      "PNG",
      paddingHorizontal + (pageInnerWidth - mapWidth) / 2,
      vertical,
      mapWidth,
      mapHeight,
    );
  }

  // 3. Page
  makeHeader("Status Quo Analyse");

  text({
    text: "Wasserhaushalt",
    size: 18,
    weight: "b",
    extraMarginBottom: 10,
  });
  text({
    text: "Der lokale Wasserhaushalt setzt sich aus den drei Komponenten Oberflächenabfluss, Infiltration und Verdunstung zusammen. In Ihrem ausgewählten Untersuchungsgebiet setzen sich die Komponenten wie folgt zusammen:",
    extraMarginBottom: 14,
  });
  text({
    text: `Oberflächenabfluss: ${payload.oberflächenabfluss_status_quo} mm/Jahr`,
  });
  text({
    text: `Infiltration: ${payload.infiltration_status_quo} mm/Jahr`,
  });
  text({
    text: `Verdunstung: ${payload.verdunstung_status_quo} mm/Jahr`,
    extraMarginBottom: 14,
  });
  text({
    text: "Der natürliche Wasserhaushalt (natürliches Referenzszenario) wurde mit dem Modell ABIMO für Ihr ausgewähltes Untersuchungsgebiet berechnet. Dabei wird von einer vollständig unbebauten und unversiegelten Oberfläche ausgegangen, während die Vegetationsstufe im Modell so eingestellt wird, dass sie der eines urbanen Parks entspricht. Andere natürliche Faktoren, wie die Tiefe des Grundwasserspiegels sowie klimatische Eingangsgrößen, wie die Niederschlagshöhe und die potenzielle Verdunstung, bleiben im Vergleich zum Status-quo-Szenario unverändert.",
    extraMarginBottom: 14,
  });
  text({
    text: "Die Abweichung von diesem hypothetischen, natürlichen Szenario kann durch den sogenannten Delta-W-Faktor in Prozent ausgedrückt werden. Delta-W umfasst die drei oben genannten Komponenten des Wasserhaushalts.",
    extraMarginBottom: 14,
  });
  text({
    text: "Für Ihr ausgewähltes Untersuchungsgebiet liegt Delta-W bei ",
    noLineBreak: true,
  });
  text({
    text: `${payload.delta_w_status_quo} %.`,
    x: getMarginLeft("Für Ihr ausgewähltes Untersuchungsgebiet liegt Delta-W bei "),
    weight: "b",
  });

  // 4. Page
  makeHeader(payload.isMeasurePlanning ? "Maßnahmenplanung: Lokale Betrachtung" : "Maßnahmenplanung: Gebietsbetrachtung");

  text({
    text: `Betrachtete Blockteilflächen: ${payload.betrachteteblockteilflaechen}`,
    extraMarginBottom: 14,
  });
  text({
    text: payload.isMeasurePlanning ? "Hier sehen Sie eine Auflistung der von Ihnen gesetzten Maßnahmen. Bitte beachten Sie, dass bereits vorhandene Maßnahmen hier nicht aufgelistet sind." : "Gewählte Maßnahmen:",
  });

  doc.addImage(
    GruendachIcon,
    "JPEG",
    paddingHorizontal,
    vertical,
    iconSizes,
    iconSizes,
  );
  vertical += mm(18);
  text({
    text: "Dachbegrünung",
    extraMarginBottom: 14,
    x: paddingVertical + iconSizes + 6,
  });
  text({
    text: "Dachbegrünungen existieren in verschiedener Bauweise und umfassen das Auftragen von Vegetation auf Gebäudedächern. Die Begrünung nimmt das anfallende Regenwasser auf und bringt es durch gezielte Retention (Verdunstung) verzögert zum Abfluss.",
    weight: "i",
  });
  text({
    text: `Anteil der Gesamtfläche: ${payload.dachbegrünung_prozente || 0} %`,
    extraMarginBottom: 14,
    weight: "b"
  });


  doc.addImage(
    EntsiegelungIcon,
    "JPEG",
    paddingHorizontal,
    vertical,
    iconSizes,
    iconSizes,
  );
  vertical += mm(18);
  text({
    text: "Entsiegelung",
    extraMarginBottom: 14,
    x: paddingVertical + iconSizes + 6,
  });
  text({
    text: "Entsieglung bezeichnet das Abtragen von wasserundurchlässigen Flächen wie Beton und Asphalt, um Regenwasser im Untergrund versickern zu lassen. ",
    weight: "i",
  });
  text({
    text: `Anteil der Gesamtfläche: ${payload.entsiegelung_prozente || 0} %`,
    extraMarginBottom: 14,
    weight: "b"
  });

  doc.addImage(
    MuldeIcon,
    "JPEG",
    paddingHorizontal,
    vertical,
    iconSizes,
    iconSizes,
  );
  vertical += mm(18);
  text({
    text: "Mulde",
    extraMarginBottom: 14,
    x: paddingVertical + iconSizes + 6,
  });
  text({
    text: "Mulden sind dauerhaft begrünte Versickerungsanlagen, die durch ihre Einstautiefe einen kurzfristigen oberirdischen Speicher vorweisen.",
    weight: "i",
  });
  text({
    text: `An Mulde angeschlossene Fläche: ${payload.an_mulde_angeschlossene_fläche || 0} %`,
    extraMarginBottom: 28,
    weight: "b"
  });

  const linkKatalog = 'resources/docs/massnahmenkatalog-mit-steckbriefen.pdf';
  const absoluteLinkKatalog = `${window.location.href}${linkKatalog}`;

  text({
    text: "Link zu Maßnahmenkatalog",
    url: absoluteLinkKatalog,
  });

  // 5. Page
  makeHeader(payload.isMeasurePlanning ? "Maßnahmenplanung: Lokale Betrachtung" : "Maßnahmenplanung: Gebietsbetrachtung");

  const tableStyle = {
    theme: "grid",
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: 0,
      fontSize: 12,
      cellPadding: 2,
      font: "Arial",
      fontStyle: "bold",
      lineColor: 0,
      lineWidth: 0.5,
    },
    styles: {
      fontSize: 12,
      cellPadding: 2,
      textColor: 0,
      font: "Arial",
      fontStyle: "normal",
      lineColor: 0,
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 37 },
      2: { cellWidth: 37 },
      3: { cellWidth: 37 },
    },
    didParseCell: function (data) {
      if (data.column.index === 0) {
        data.cell.styles.fillColor = [230, 230, 230];
        data.cell.styles.fontStyle = "bold";
      }
      data.cell.styles.textColor = 0;
    },
  };

  const columnStylesForPageFive = {
    0: { cellWidth: 50 },
    1: { cellWidth: 65 },
    2: { cellWidth: 65 },
  }

  if (showTableOnPageFive) {
    autoTable(doc, {
      ...tableStyle,
      startY: vertical,
      head: [["", "Status Quo", "Simulation"]],
      body: [
        ["Dachfläche", payload.flächenanteile_dachfläche, payload.flächenanteile_dachfläche],
        ["- davon begrünt", payload.flächenanteile_davon_begrünt_status_quo, payload.flächenanteile_davon_begrünt_simulation],
        ["Unbebaut versiegelte Fläche", payload.flächenanteile_unbebaut_versiegelte_flächen_status_quo, payload.flächenanteile_unbebaut_versiegelte_flächen_simulation],
        ["Unversiegelte Fläche", payload.flächenanteile_unversiegelte_flächen_status_quo, payload.flächenanteile_unversiegelte_flächen_simulation],
      ],
      columnStyles: columnStylesForPageFive
    });
    vertical += 57;
    text({
      text: "Alle Prozentangaben in Klammern beziehen sich auf die Gesamtfläche.",
      size: 12,
      extraMarginBottom: 36,
    });
  } else {
    text({
      text: "Status Quo",
      size: 18,
      weight: "b",
      noLineBreak: true,
    });
    text({
      text: "Simulation",
      size: 18,
      weight: "b",
      extraMarginBottom: 10,
      x: rightHalfOfThePage,
    });
    text({
      text: "Flächenanteile:",
      noLineBreak: true,
    });
    text({
      text: "Flächenanteile:",
      x: rightHalfOfThePage,
    });
    text({
      text: ` • Dachfläche:`,
      noLineBreak: true,
    });
    text({
      text: ` • Dachfläche:`,
      x: rightHalfOfThePage,
    });
    text({
      text: `     ${payload.flächenanteile_dachfläche}`,
      noLineBreak: true,
    });
    text({
      text: `     ${payload.flächenanteile_dachfläche}`,
      x: rightHalfOfThePage,
    });
    text({
      text: ` • Davon begrünt:`,
      noLineBreak: true,
      maxWidth: true,
    });
    text({
      text: ` • Davon begrünt:`,
      x: rightHalfOfThePage,
      maxWidth: true,
    });
    text({
      text: `     ${payload.flächenanteile_davon_begrünt_status_quo}`,
      noLineBreak: true,
      maxWidth: true,
    });
    text({
      text: `     ${payload.flächenanteile_davon_begrünt_simulation}`,
      x: rightHalfOfThePage,
      maxWidth: true,
    });
    text({
      text: ` • Unbebaut versiegelte Fläche:`,
      noLineBreak: true,
      maxWidth: true,
    });
    text({
      text: ` • Unbebaut versiegelte Fläche:`,
      x: rightHalfOfThePage,
      maxWidth: true,
    });
    text({
      text: `     ${payload.flächenanteile_unbebaut_versiegelte_flächen_status_quo}`,
      noLineBreak: true,
      maxWidth: true,
    });
    text({
      text: `     ${payload.flächenanteile_unbebaut_versiegelte_flächen_simulation}`,
      x: rightHalfOfThePage,
      maxWidth: true,
    });
    text({
      text: ` • Unversiegelte Fläche:`,
      noLineBreak: true,
      maxWidth: true,
    });
    text({
      text: ` • Unversiegelte Fläche:`,
      x: rightHalfOfThePage,
      maxWidth: true,
    });
    text({
      text: `     ${payload.flächenanteile_unversiegelte_flächen_status_quo}`,
      noLineBreak: true,
      maxWidth: true,
    });
    text({
      text: `     ${payload.flächenanteile_unversiegelte_flächen_simulation}`,
      x: rightHalfOfThePage,
      maxWidth: true,
      extraMarginBottom: 28,
    });
  }

  text({
    text: "Wasserhaushalt",
    size: 18,
    weight: "b",
    extraMarginBottom: 10,
  });
  text({
    text: "Durch die Variierung der Parameter für die Maßnahmen der Regenwasserbewirtschaftung haben Sie den Wasserhaushalt beeinflusst. Die Ergebnisse Ihrer Simulation sind im Folgenden dem Wasserhaushalt des Status Quo für das Untersuchungsgebiet gegenübergestellt. Die Prozente in den Klammern beziehen sich auf den Jahresniederschlag.",
    extraMarginBottom: 10,
  });
  if (showTableOnPageFive) {
    autoTable(doc, {
      ...tableStyle,
      startY: vertical,
      head: [["", "Status Quo", "Simulation"]],
      // head: [["", "Status Quo-Szenario:", "Ihre Simulation:"]],
      body: [
        ["Oberflächenabfluss", payload.wasserhaushalt_oberflächenabfluss_status_quo, `${payload.abimo_result.runoff} mm/Jahr (${payload.abimo_result.runoff_prozente} %)`],
        ["Infiltration", payload.wasserhaushalt_infiltration_status_quo, `${payload.abimo_result.infiltration} mm/Jahr (${payload.abimo_result.infiltration_prozente} %)`],
        ["Verdunstung", payload.wasserhaushalt_verdunstung_status_quo, `${payload.abimo_result.evaporation} mm/Jahr (${payload.abimo_result.evaporation_prozente} %)`],
        ["Delta W", `${payload.delta_w_status_quo} %`, `${payload.abimo_result.deltaW} %`],
      ],
      columnStyles: columnStylesForPageFive
    });
  } else {
    text({
      text: "Status Quo-Szenario:",
      noLineBreak: true,
    });
    text({
      text: "Ihre Simulation:",
      x: rightHalfOfThePage,
    });
    text({
      text: ` • Oberflächenabfluss:`,
      noLineBreak: true,
      maxWidth: true,
    });
    text({
      text: ` • Oberflächenabfluss: `,
      x: rightHalfOfThePage,
    });
    text({
      text: `     ${payload.wasserhaushalt_oberflächenabfluss_status_quo}`,
      noLineBreak: true
    });
    text({
      text: `     ${payload.abimo_result.runoff} mm/Jahr (${payload.abimo_result.runoff_prozente} %)`,
      x: rightHalfOfThePage,
    });
    text({
      text: ` • Infiltration:`,
      noLineBreak: true,
      maxWidth: true,
    });
    text({
      text: ` • Infiltration:`,
      x: rightHalfOfThePage,
    });
    text({
      text: `     ${payload.wasserhaushalt_infiltration_status_quo}`,
      noLineBreak: true
    });
    text({
      text: `     ${payload.abimo_result.infiltration} mm/Jahr (${payload.abimo_result.infiltration_prozente} %)`,
      x: rightHalfOfThePage,
    });
    text({
      text: ` • Verdunstung:`,
      noLineBreak: true,
      maxWidth: true,
    });
    text({
      text: ` • Verdunstung:`,
      x: rightHalfOfThePage,
    });
    text({
      text: `     ${payload.wasserhaushalt_verdunstung_status_quo}`,
      noLineBreak: true
    });
    text({
      text: `     ${payload.abimo_result.evaporation} mm/Jahr (${payload.abimo_result.evaporation_prozente} %)`,
      x: rightHalfOfThePage,
    });
    text({
      text: ` • Delta W: ${payload.delta_w_status_quo} %`,
      noLineBreak: true,
    });
    text({
      text: ` • Delta W: ${payload.abimo_result.deltaW} %`,
      x: rightHalfOfThePage,
    });
  }

  // 8. Page
  makeHeader("Anlage");
  text({
    text: "AMAREX:",
    noLineBreak: true,
  });
  text({
    text: "Website-Link",
    url: "https://amarex-projekt.de/de",
    x: getMarginLeft("AMAREX: ")
  });
  text({
    text: "Maßnahmenkatalog:",
    noLineBreak: true,
  });
  text({
    text: "Link zum Katalog",
    url: absoluteLinkKatalog,
    x: getMarginLeft("Maßnahmenkatalog: "),
    extraMarginBottom: payload.zisternenrechner_link ? 0 : 28,
  });

  if (payload.zisternenrechner_link) {
    text({
      text: "Zisternenrechner:",
      noLineBreak: true,
    });
    text({
      text: "Link zum Rechner",
      url: payload.zisternenrechner_link,
      x: getMarginLeft("Zisternenrechner: "),
      extraMarginBottom: 28,
    });
  }
  if (payload.isMeasurePlanning) {
    
    text({
      text: "Auflistung der Maßnahmendimensionen:"
    });

    autoTable(doc, {
      ...tableStyle,
      startY: vertical,
      head: [["Mulde", "klein", "mittel", "groß"]],
      body: [
        ["Länge", "10 m", "10 m", "20 m"],
        ["Breite", "1 m", "5 m", "10 m"],
        ["Tiefe", "0,3 m", "0,3 m", "0,3 m"],
        ["Oberfläche", "10 m²", "50 m²", "200 m²"],
        ["Volumen", "3 m³", "30 m³", "150 m³"],
        ["angeschlossene Fläche", "50 m²", "250 m²", "1000 m²"],
      ],
    });

    vertical += 70;

    autoTable(doc, {
      ...tableStyle,
      startY: vertical,
      head: [["Entsiegelung", "klein", "mittel", "groß"]],
      body: [
        ["Länge", "2 m", "25 m", "50 m"],
        ["Breite", "5 m", "2 m", "10 m"],
        ["Oberfläche", "10 m²", "50 m²", "500 m²"],
      ],
    });

    vertical += 45;

    autoTable(doc, {
      ...tableStyle,
      startY: vertical,
      head: [["Dachbegrünung", "klein", "mittel", "groß"]],
      body: [
        ["Länge", "5 m", "12,5 m", "25 m"],
        ["Breite", "4 m", "8 m", "10 m"],
        ["Höhe", "0,1 m", "0,1 m", "0,1 m"],
        ["Oberfläche", "20 m²", "100 m²", "250 m²"],
      ],
    });

  }

  // save the PDF
  if (savingType === "_blank") {
    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl);
  } else {
    doc.save(`${toFileSlug(payload.title)}.pdf`);
  }

  return "pdfWritten & downloaded ✅";
}

async function getReport(payload, download) {
  try {
    const pngBlob = await getPngBlobFromUrl(payload.downloadURL);
    await writePDF(payload, download, pngBlob);
    return "Report created successfully, yeayi 🎉🎉🎉";
  } catch (error) {
    console.error("Fehler bei der Berichtserstellung:", error);
    throw error;
  }
}

export { getReport };

