<script>
import { mapGetters } from "vuex";
import { writePDF } from "../api/getReport";
import colors from "../../../src/shared/js/utils/amarex-colors.json";
import { Info as InfoIcon, FileDown, LoaderCircle } from "lucide-vue-next";
import ToggleBTN from "./ToggleBTN.vue";

/**
 * ReportPrinter
 * @description Report Printer
 * @module addons/ReportPrinter
 */
export default {
  name: "ReportPrinter",
  data() {
    return {
      colors,
      report: {
        title: "",
        description: "",
        date: new Date().toDateString(),
      },
      reportLoading: false,
      automaticallyAdjustPrintScale: true,
      withLegend: false,
      warning: null,
    };
  },
  components: {
    InfoIcon,
    ToggleBTN,
    FileDown,
    LoaderCircle,
  },
  computed: {
    ...mapGetters("Modules/ProjectStarter", [
      "projectTitle",
      "projectDescription",
    ]),
    ...mapGetters("Modules/AbimoHandler", [
      "areaTypesData",
      // "selectedFeatures",
      // "accumulatedAbimoStats",
      // "selectInteraction",
      // "blockAreaConfirmed",
      // "preselectedFeatures",
      // "selectedCount",
    ]),
  },
  created() {
    this.report.title = this.projectTitle || "Amarex Report";
    this.report.description = this.projectDescription;
  },
  methods: {
    /**
     * Generate Report
     * @description Calls the getReport function with the prepared payload and toggles the reportLoading flag accordingly.
     * @fires getReport
     */
    async generateReport() {
      this.warning = null;
      if (!this.report.title) {
        this.warning = "Bitte einen Titel eingeben";
        return;
      }

      this.reportLoading = true;

      // Gather Data
      let seite_1_kennzahlen_flaechenanteil_prozente = this.areaTypesData.find(
        (findAreaTypeData) => findAreaTypeData.id === "unpvd",
      );
      seite_1_kennzahlen_flaechenanteil_prozente = Math.round(
        seite_1_kennzahlen_flaechenanteil_prozente?.max * 100,
      ).toFixed(0);

      const payload = {
        title: this.report.title,
        description: this.report.description,
        date: this.report.date,
        automaticallyAdjustPrintScale: this.automaticallyAdjustPrintScale,
        withLegend: this.withLegend,
        // Data
        seite_1_kennzahlen_flaechenanteil_flaeche: "1",
        seite_1_kennzahlen_flaechenanteil_prozente,
        seite_1_kennzahlen_dachflaeche_flaeche: "3",
        seite_1_kennzahlen_dachflaeche_prozente: "4",
        seite_1_kennzahlen_davonbegruent_flaeche: "5",
        seite_1_kennzahlen_davonbegruent_prozente: "6",
        seite_1_kennzahlen_versiegelteflaeche_flaeche: "7",
        seite_1_kennzahlen_versiegelteflaeche_prozente: "8",
        seite_1_kennzahlen_unversiegelteflaeche_flaeche: "9",
        seite_1_kennzahlen_unversiegelteflaeche_prozente: "10",
        seite_1_kennzahlen_anschlussgradkanalisation: "11",
        seite_3_status_quo_oberflaechenabfluss: "12",
        seite_3_status_quo_versickerung: "13",
        seite_3_status_quo_evapotranspiration: "14",
        seite_3_status_quo_deltaw: "15",
        seite_4_gebietsbetrachtung_betrachteteblockteilflaechen: "16",
        seite_4_gebietsbetrachtung_mulde_percentage: "17",
        seite_4_gebietsbetrachtung_entsiegelung_percentage: "18",
        seite_4_gebietsbetrachtung_dachbegruenung_percentage: "19",
        seite_4_gebietsbetrachtung_linkmaßnahmenkatalog: "20",
        seite_5_status_quo_dachflaeche_flaeche: "21",
        seite_5_status_quo_dachflaeche_prozente: "22",
        seite_5_status_quo_davonbegruent_flaeche: "23",
        seite_5_status_quo_davonbegruent_prozente: "24",
        seite_5_status_quo_versiegelteflaeche_flaeche: "25",
        seite_5_status_quo_versiegelteflaeche_prozente: "26",
        seite_5_status_quo_unversiegelteflaeche_flaeche: "27",
        seite_5_status_quo_unversiegelteflaeche_prozente: "28",
        seite_5_status_quo_anschlussgradkanalisation: "29",
        seite_5_simulation_dachflaeche_flaeche: "30",
        seite_5_simulation_dachflaeche_prozente: "31",
        seite_5_simulation_davonbegruent_flaeche: "32",
        seite_5_simulation_davonbegruent_prozente: "33",
        seite_5_simulation_versiegelteflaeche_flaeche: "34",
        seite_5_simulation_versiegelteflaeche_prozente: "35",
        seite_5_simulation_unversiegelteflaeche_flaeche: "36",
        seite_5_simulation_unversiegelteflaeche_prozente: "37",
        seite_5_simulation_anschlussgradkanalisation: "38",
        seite_5_simulation_variante: "39",
        seite_5_status_quo_oberflaechenabfluss_mma: "40",
        seite_5_status_quo_oberflaechenabfluss_prozente: "41",
        seite_5_status_quo_versickerung_mma: "42",
        seite_5_status_quo_versickerung_prozente: "43",
        seite_5_status_quo_evapotranspiration_mma: "44",
        seite_5_status_quo_evapotranspiration_prozente: "45",
        seite_5_status_quo_deltaw: "46",
        seite_5_simulation_oberflaechenabfluss_mma: "47",
        seite_5_simulation_oberflaechenabfluss_prozente: "48",
        seite_5_simulation_versickerung_mma: "49",
        seite_5_simulation_versickerung_prozente: "50",
        seite_5_simulation_evapotranspiration_mma: "51",
        seite_5_simulation_evapotranspiration_prozente: "52",
        seite_5_simulation_deltaw: "53",
        seite_6_betrachteteblockteilflaeche_blockteilnummer: "54",
        seite_6_dachbegruenung_anzahl: "55",
        seite_6_entsiegelung_anzahl: "56",
        seite_6_muldenversickerung_anzahl: "57",
        seite_6_summe_mulde_flaeche: "58",
        seite_6_summe_mulde_volumen: "59",
        seite_6_summe_mulde_angeschlosseneflaeche: "60",
        seite_6_summe_dachbegruenung_flaeche: "61",
        seite_6_summe_entsiegelung_flaeche: "62",
        seite_7_status_quo_dachflaeche_flaeche: "63",
        seite_7_status_quo_dachflaeche_prozente: "64",
        seite_7_status_quo_davonbegruent_flaeche: "65",
        seite_7_status_quo_davonbegruent_prozente: "66",
        seite_7_status_quo_versiegelteflaeche_flaeche: "67",
        seite_7_status_quo_versiegelteflaeche_prozente: "68",
        seite_7_status_quo_unversiegelteflaeche_flaeche: "69",
        seite_7_status_quo_unversiegelteflaeche_prozente: "70",
        seite_7_status_quo_anschlussgradkanalisation: "71",
        seite_7_simulation_dachflaeche_flaeche: "72",
        seite_7_simulation_dachflaeche_prozente: "73",
        seite_7_simulation_davonbegruent_flaeche: "74",
        seite_7_simulation_davonbegruent_prozente: "75",
        seite_7_simulation_versiegelteflaeche_flaeche: "76",
        seite_7_simulation_versiegelteflaeche_prozente: "77",
        seite_7_simulation_unversiegelteflaeche_flaeche: "78",
        seite_7_simulation_unversiegelteflaeche_prozente: "79",
        seite_7_simulation_anschlussgradkanalisation: "80",
        seite_7_simulation_variante: "81",
        seite_7_status_quo_oberflaechenabfluss_mma: "82",
        seite_7_status_quo_oberflaechenabfluss_prozente: "83",
        seite_7_status_quo_versickerung_mma: "84",
        seite_7_status_quo_versickerung_prozente: "85",
        seite_7_status_quo_evapotranspiration_mma: "86",
        seite_7_status_quo_evapotranspiration_prozente: "87",
        seite_7_status_quo_deltaw: "88",
        seite_7_simulation_oberflaechenabfluss_mma: "89",
        seite_7_simulation_oberflaechenabfluss_prozente: "90",
        seite_7_simulation_versickerung_mma: "91",
        seite_7_simulation_versickerung_prozente: "92",
        seite_7_simulation_evapotranspiration_mma: "93",
        seite_7_simulation_evapotranspiration_prozente: "94",
        seite_7_simulation_deltaw: "95",
      };

      console.log("payload :>> ", payload);
      /* if (true) {
        return (this.reportLoading = false);
      } */

      try {
        await writePDF(payload, "_blank");
        this.reportLoading = false;
        return;
      } catch (error) {
        this.reportLoading = false;
        this.warning = "Fehler beim Erstellen des Reports:" + error;
        return;
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
    <p class="title">Report erstellen</p>
    <p class="description with-margin">
      Hier können Sie eine Reportdatei Ihrer Ergebnisse erstellen.<br /><br />Wählen
      Sie dafür einen Kartenausschnitt und füllen Sie die unten stehenden Felder
      aus. Sie können im Anschluss Ihren Report als pdf-Datei herunterladen.<br /><br />Hinweis:
      Der Report enthält keine Ergebnisse, wenn Sie keine
      Wasserhaushalts&shy;berechnungen durchgeführt haben.
    </p>
    <div class="input-wrapper">
      <p class="input-wrapper-title">Titel des Reports</p>
      <input
        type="text"
        name="title"
        id="title"
        v-model="report.title"
        placeholder="Hier können Sie einen Titel eingeben ..."
      />
    </div>
    <div class="input-wrapper">
      <p class="input-wrapper-title">Kommentar (Optional)</p>
      <textarea
        name="title"
        id="title"
        rows="10"
        v-model="report.description"
        placeholder="Hier können Sie einen Kommentar für Ihren Report eingeben ..."
      ></textarea>
    </div>
    <div class="d-flex align-items-center justify-content-center custom-gap">
      <div class="flex-grow-1">
        <InfoIcon
          :color="colors.amarex_secondary"
          :size="20"
        />
      </div>
      <p class="description">
        Wenn der ausgewählte Druckmaßstab vom Maßstab im Kartenfenster abweicht,
        kann dies zu einem veränderten Kartenlayout im Druck führen.
      </p>
    </div>
    <div
      class="d-flex align-items-center custom-gap mt-3 toggle-container"
      @click="automaticallyAdjustPrintScale = !automaticallyAdjustPrintScale"
    >
      <ToggleBTN
        :isActive="automaticallyAdjustPrintScale"
        :size="32"
      />
      <p class="description bold user-select-none">
        Druckmaßstab automatisch anpassen
      </p>
    </div>
    <div
      class="d-flex align-items-center custom-gap mt-3 mb-4 toggle-container"
      @click="withLegend = !withLegend"
    >
      <ToggleBTN
        :isActive="withLegend"
        :size="32"
      />
      <p class="description bold user-select-none">Mit Legende</p>
    </div>
    <p
      v-if="warning"
      class="description bold mb-3 warning"
    >
      {{ warning }}
    </p>
    <button
      class="amarex-btn-primary accent full-with-icon"
      v-if="!reportLoading"
      @click="generateReport"
    >
      <FileDown
        :color="colors.secondary"
        :size="24"
      />
      <p>Datei herunterladen</p>
    </button>
    <span
      v-else
      class="loading-container d-flex flex-column align-items-center"
    >
      <LoaderCircle
        :color="colors.amarex_secondary"
        :size="24"
      />
      <p class="title">Ihr Report wird geladen...</p>
    </span>
    <div></div>
  </div>
</template>

<style lang="scss">
@import "~variables";
#report-printer {
  .title {
    color: $amarex_secondary;
    font-size: 16px;
    font-weight: 700;
    line-height: 32px;
  }
  .description {
    color: $amarex_secondary;
    font-size: 16px;
    font-weight: 400;
    line-height: 22px;
    &.with-margin {
      margin-bottom: 32px;
    }
    &.bold {
      font-weight: 700;
    }
  }
  .input-wrapper {
    padding: 12px 16px;
    border: 1px solid $amarex_grey_dark;
    margin-bottom: 32px;
    .input-wrapper-title {
      color: $amarex_secondary;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px;
      margin-bottom: 5px;
    }
    input,
    textarea {
      width: 100%;
      border: none !important;
      color: $amarex_secondary;
      font-size: 16px;
      font-weight: 700;
      line-height: 16px;
      padding: 0 !important;
      resize: none;
      &:focus {
        outline: none !important;
        box-shadow: none !important;
      }
      &::placeholder {
        color: $amarex_grey_dark;
        font-size: 16px;
        font-weight: 700;
        line-height: 16px;
      }
    }
  }
  .custom-gap {
    gap: 10px;
  }
  .toggle-container {
    cursor: pointer;
  }
  .warning {
    color: $amarex_red;
    font-size: 16px;
    font-weight: 700;
    line-height: 22px;
  }
  .loading-container {
    gap: 16px;
    margin-top: 48px;
    svg {
      animation: spin 1s linear infinite;
    }
    p {
      text-align: center;
    }
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>

