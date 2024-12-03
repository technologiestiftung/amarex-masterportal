<script>
import { mapGetters, mapMutations } from "vuex";
import { jsPDF } from "jspdf";
import mapCollection from "../../../src/core/maps/js/mapCollection";

/**
 * ReportPrinter
 * @description Report Printer
 * @module addons/ReportPrinter
 */
export default {
  name: "ReportPrinter",
  data() {
    return {
      projectData: [
        { name: "Projekt A", value: 100 },
        { name: "Projekt B", value: 200 },
        { name: "Projekt C", value: 300 },
      ],
      report: {
        title: "",
        description: "",
        editor: "Nachname, Vorname",
        date: new Date().toDateString(),
      },
      layerData: [],
      pdf: {
        fontSize: {
          xs: 10,
          s: 12,
          m: 16,
          l: 20,
          xl: 24,
        },
        max: { height: 300, width: 210 },
        margin: { top: 8, right: 8, bottom: 9, left: 8 },
      },
      map: {
        center: [0, 0],
      },
      lineHeight: 10,
    };
  },
  computed: {
    ...mapGetters([
      "allLayerConfigs",
      "Maps/projectionCode",
      "layerConfig",
      "portalConfig",
    ]),
    ...mapGetters("Modules/ProjectStarter", [
      "projectTitle",
      "projectDescription",
    ]),
  },
  created() {
    this.report.title = this.projectTitle;
    this.report.description = this.projectDescription;
  },
  methods: {
    ...mapMutations("Modules/ProjectStarter", [
      "setProjectTitle",
      "setProjectDescription",
    ]),
    splitTextToFit(doc, text, maxWidth, fontSize) {
      doc.setFontSize(fontSize);
      const words = text.split(" ");
      let lines = [],
        currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i],
          width =
            (doc.getStringUnitWidth(currentLine + " " + word) * fontSize) /
            doc.internal.scaleFactor;

        if (width < maxWidth) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    },
    addTextWithWordWrap(doc, text, x, y, maxWidth, fontSize, lineHeight) {
      const lines = this.splitTextToFit(doc, text, maxWidth, fontSize);

      lines.forEach((line, index) => {
        doc.text(line, x, y + index * lineHeight);
      });
      return y + lines.length * lineHeight;
    },
    async takeScreenshot() {
      const mapElement = document.getElementById("map");

      if (!mapElement) {
        throw new Error("Kartencontainer nicht gefunden");
      }

      const canvas = mapElement.querySelector("canvas");

      if (!canvas) {
        throw new Error("Canvas-Element in der Karte nicht gefunden");
      }

      try {
        return canvas.toDataURL("image/png");
      } catch (e) {
        console.error("Fehler beim direkten Zugriff auf das Canvas:", e);
        throw new Error("Konnte keinen Screenshot erstellen");
      }
    },

    addHeader(doc) {
      let y = 1,
        x = 0;

      doc.setFillColor("#29A992");
      // rect: x, y, w, h, style
      doc.rect(x, y, this.pdf.max.width, 8, "F");
      doc.setFontSize(this.pdf.fontSize.m);
      y += this.pdf.margin.bottom + 8;
      doc.text("AMAREX Webtool", 150, y);
      doc.setFontSize(this.pdf.fontSize.s);
      y += this.pdf.margin.bottom;
      doc.text(`Report Nr. xxx, Bearbeiter: ${this.report.editor}`, 100, y);
      y += this.pdf.margin.bottom;

      return y; // return y position
    },
    getData() {
      const mapView = mapCollection.getMapView("2D");

      this.map.center = mapView.getCenter();
    },

    async generatePDF() {
      // set state title and description
      this.setProjectTitle(this.report.title);
      this.setProjectDescription(this.report.description);

      const doc = new jsPDF();

      this.getData();

      // start at x = 10, y = 10
      let x = 10,
        y = 10;

      // INFO: add new page if needed
      // const addNewPageIfNeeded = (yPosition, doc) => {
      //   if (yPosition > this.pdf.max.width - this.pdf.margin.bottom) {
      //     doc.addPage();
      //     yPosition = this.addHeader(doc);
      //   }
      //   return yPosition;
      // };

      y = this.addHeader(doc);

      y += this.pdf.margin.top;
      y = this.addTextWithWordWrap(
        doc,
        this.report.title,
        x,
        y,
        this.pdf.max.width - 2 * x,
        this.pdf.fontSize.m,
        this.lineHeight,
      );
      y += this.pdf.margin.bottom;

      doc
        .setFontSize(this.pdf.fontSize.m)
        .text("Steckbrief Untersuchungsgebiet", x, y);
      y += this.pdf.margin.bottom;

      y += this.pdf.margin.top;

      doc
        .setFontSize(this.pdf.fontSize.m)
        .text(`X-Koordinate: ${this.map.center[0].toFixed(2)}`, x, y);
      y += this.pdf.margin.bottom;
      doc
        .setFontSize(this.pdf.fontSize.m)
        .text(`Y-Koordinate: ${this.map.center[1].toFixed(2)}`, x, y);
      y += this.pdf.margin.bottom;

      try {
        doc.save("report.pdf");
      } catch (error) {
        console.error("Fehler beim Erstellen des PDFs:", error);
      }
    },
  },
};
</script>

<template lang="html">
  <div
    id="report-printer"
    ref="test"
    class="ReportPrinter-root mb-3"
  >
    <div class="mb-3">
      <label
        for="reportTitle"
        class="form-label"
        >Reporttitel:</label
      >
      <textarea
        id="reportTitle"
        v-model="report.title"
        class="form-control"
        rows="2"
      />
    </div>
    <div class="mb-3">
      <label
        for="projectDescription"
        class="form-label"
        >Projektbeschreibung:</label
      >
      <textarea
        id="projectDescription"
        v-model="report.description"
        class="form-control"
        rows="3"
      />
    </div>
    <button
      class="btn btn-primary"
      @click="generatePDF"
    >
      Download Report
    </button>
  </div>
</template>

<style lang="scss">
.ReportPrinter-root {
  width: 100%;
  height: 100px;
}
</style>
