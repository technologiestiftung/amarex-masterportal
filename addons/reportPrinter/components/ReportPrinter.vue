<script>
import { mapGetters, mapMutations } from "vuex";
import mapCollection from "../../../src/core/maps/js/mapCollection";
import getReport from "../api/getReport";

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
    getData() {
      // set state title and description
      this.setProjectTitle(this.report.title);
      this.setProjectDescription(this.report.description);
      const mapView = mapCollection.getMapView("2D");
      const mapElement = document.getElementById("map");
      if (!mapElement) {
        throw new Error("Kartencontainer nicht gefunden");
      }
      this.map.center = mapView.getCenter();
    },

    async generateReport() {
      console.log("[ReportPrinter] :: generate Report");

      let payload = {};

      getReport(payload)
        .then(() => {
          console.log("Report Data: successfully retrieved");
        })
        .catch((error) => {
          console.error("Fehler beim Abrufen des Reports:", error);
        });
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
      @click="generateReport"
    >
      Get Mapfish Print Report
    </button>
  </div>
</template>

<style lang="scss">
.ReportPrinter-root {
  width: 100%;
  height: 100px;
}
</style>

