<script>
import { mapGetters } from "vuex";
import { getReport } from "../api/getReport";
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

      const payload = {
        title: this.report.title,
        description: this.report.description,
        date: this.report.date,
        automaticallyAdjustPrintScale: this.automaticallyAdjustPrintScale,
        withLegend: this.withLegend,
      };

      try {
        await getReport(payload);
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
        placeholder="Hier können Sie einen Titel für Ihren Report eingeben ..."
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
      <p class="description bold">Druckmaßstab automatisch anpassen</p>
    </div>
    <div
      class="d-flex align-items-center custom-gap mt-3 mb-4 toggle-container"
      @click="withLegend = !withLegend"
    >
      <ToggleBTN
        :isActive="withLegend"
        :size="32"
      />
      <p class="description bold">Mit Legende</p>
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

