<script>
import { mapGetters } from "vuex";
import JSZip from "jszip";
import sanitizeSelector from "../../utils/sanitizeSelector";
import { exportLayerAsGeoJSON } from "../utils/download";
import layerCollection from "../../../src/core/layers/js/layerCollection";
import mapCollection from "../../../src/core/maps/js/mapCollection";
import VectorLayer from "ol/layer/Vector";
import { Save as SaveIcon, FileDown } from "lucide-vue-next";
import colors from "../../../src/shared/js/utils/amarex-colors.json";

/**
 * ProjectDownloader
 * @description Project Downloader
 * @module addons/ProjectDownloader
 */
export default {
  name: "ProjectDownloader",
  data() {
    return {
      configToExport: null,
      abimoConfigToExport: null,
      fileSources: [],
      projectTitle: "",
      colors,
      projectDownloaderOpen: false,
    };
  },
  components: {
    SaveIcon,
    FileDown,
  },
  computed: {
    ...mapGetters([
      "allLayerConfigs",
      "Maps/projectionCode",
      "layerConfig",
      "portalConfig",
    ]),
    ...mapGetters("Modules/AbimoHandler", [
      "selectedFeatures",
      "accumulatedAbimoStats",
      "areaTypesData",
      "selectInteraction",
      "blockAreaConfirmed",
      "preselectedFeatures",
      "selectedCount",
      "isMeasurePlanning",
      "preComputedStats",
      "newGreenRoof",
      "newUnpvd",
      "newToSwale",
      "preComputedModels",
      "activeStep",
      "preComputedModelsShown",
      "preComputedModelsAdded",
      "selectedMeasures",
      "hasMeasures",
      "resultAbimoStats",
      "resultLayers",
      "isMeasureDrawing",
      "accumulatedMeasureStats",
    ]),
  },
  methods: {
    /**
     * Prepare config for download
     * @function prepareConfigForDownload
     * @returns {Promise}
     */
    async prepareConfigForDownload() {
      const layerConfig = this.layerConfig,
        portalConfig = this.portalConfig,
        mapView = await mapCollection.getMapView("2D");

      try {
        portalConfig.map.mapView.startZoomLevel = mapView.getZoom();
        portalConfig.map.mapView.startCenter = mapView.getCenter();

        this.configToExport = {
          portalConfig,
          layerConfig,
        };
      } catch (error) {
        console.error(error);
      }
    },
    /**
     * Prepare VectorLayer for download
     * @function prepareVectorLayerForDownload
     * @returns {Promise}
     */
    async prepareVectorLayerForDownload() {
      const layerCollectionData = layerCollection.getLayers();
      const projectionCode = this.$store.getters["Maps/projectionCode"];

      this.fileSources = []; // Reset the fileSources array

      // Define layers to exclude from export
      const excludeGEOJSONFilesFromExport = [
        "abimo_2025_wfs:preCompute",
        "delta_w_2025_wfs:preCompute",
        "planung_abimo",
        "rabimo_input_2025",
      ];

      // Define layers to exclude if they have no features
      const excludeIfEmptyLayers = [
        "abimo_result_delta_w",
        "abimo_result_evaporation",
        "abimo_result_infiltration",
        "abimo_result_surface_run_off",
        "abimo_measures",
      ];

      try {
        layerCollectionData.forEach((layer) => {

          // Skip layers not shown in layer tree
          if (!layer.attributes.showInLayerTree) {
            return;
          }

          const layerID = layer.get("id");

          // Skip layers in the exclusion list
          if (excludeGEOJSONFilesFromExport.includes(layerID)) {
            return;
          }

          // Only process vector layers with correct type
          if (
            layer.layer instanceof VectorLayer &&
            (layer.attributes.typ !== "WFS" || "WMS")
          ) {
            const geoJSONData = exportLayerAsGeoJSON(
              layer.layer,
              projectionCode,
            );

            if (!geoJSONData) {
              return;
            }

            // Check if layer should be excluded when empty
            if (excludeIfEmptyLayers.includes(layerID)) {
              const parsedData = JSON.parse(geoJSONData);
              const hasFeatures = parsedData?.features?.length > 0;

              if (!hasFeatures) {
                console.log(
                  `[ProjectDownloader] Excluding empty layer: ${layerID}`,
                );
                return;
              }
            }

            // Add layer to file sources
            this.fileSources.push({
              title: `${layer.attributes.id}.geojson`,
              src: URL.createObjectURL(
                new Blob([geoJSONData], { type: "application/json" }),
              ),
            });
          }
        });
      } catch (error) {
        console.error(
          "[ProjectDownloader] Error preparing vector layers:",
          error,
        );
      }
    },
    serializeFeatures(features) {
      return features.map((f) => ({
        ...f.getProperties(),
        geometry: f
          .getGeometry()
          .clone()
          .transform("EPSG:3857", "EPSG:4326")
          .getCoordinates(), // OR GeoJSON
        geometryType: f.getGeometry().getType(),
      }));
    },
    /**
     * Prepare abimo-config.json for download
     * @function prepareAbimoConfigForDownload
     * @returns {Promise}
     */
    prepareAbimoConfigForDownload() {
      const abimoState = {
        accumulatedAbimoStats: this.accumulatedAbimoStats,
        areaTypesData: this.areaTypesData,
        blockAreaConfirmed: this.blockAreaConfirmed,
        selectedCount: this.selectedCount,
        isMeasurePlanning: this.isMeasurePlanning,
        preComputedStats: this.preComputedStats,
        newGreenRoof: this.newGreenRoof,
        newUnpvd: this.newUnpvd,
        newToSwale: this.newToSwale,
        activeStep: this.activeStep,
        preComputedModelsShown: this.preComputedModelsShown,
        preComputedModelsAdded: this.preComputedModelsAdded,
        hasMeasures: this.hasMeasures,
        resultAbimoStats: this.resultAbimoStats,
        isMeasureDrawing: this.isMeasureDrawing,
        accumulatedMeasureStats: this.accumulatedMeasureStats,
        //
        // Features that need to be serialized
        //
        selectedFeatures: this.serializeFeatures(this.selectedFeatures),
        preselectedFeatures: this.serializeFeatures(this.preselectedFeatures),
        selectedMeasures: this.serializeFeatures(this.selectedMeasures),
        //
        // Features that are not serializable
        //
        // selectInteraction: this.selectInteraction,
        // preComputedModels: this.preComputedModels,
        // resultLayers: this.resultLayers,
      };
      console.log("abimoState :>> ", abimoState);
      this.abimoConfigToExport = abimoState;
    },
    forceFileDownload(zip, zipName) {
      zip
        .generateAsync({ type: "blob" })
        .then((blob) => {
          const url = window.URL.createObjectURL(blob),
            link = document.createElement("a");

          link.href = url;
          link.setAttribute("download", `${zipName}.zip`);
          document.body.appendChild(link);
          link.click();
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => console.error(error));
    },
    async downloadWithFetch(zipName) {
      this.prepareAbimoConfigForDownload();
      await this.prepareConfigForDownload();
      await this.prepareVectorLayerForDownload();
      const zip = new JSZip(),
        // Create config.json
        configJson = JSON.stringify(this.configToExport);

      zip.file("config.json", configJson);

      if (this.abimoConfigToExport) {
        // Create abimo-config.json
        const abimoConfigJson = JSON.stringify(this.abimoConfigToExport);
        zip.file("abimo-config.json", abimoConfigJson);
      }

      const fetchPromises = this.fileSources.map(async (file) => {
        const response = await fetch(file.src),
          buffer = await response.arrayBuffer();

        zip.file(file.title, buffer);
      });

      await Promise.all(fetchPromises);
      this.forceFileDownload(zip, sanitizeSelector(zipName));
    },
    toggleProjectDownloader() {
      this.projectDownloaderOpen = !this.projectDownloaderOpen;
    },
  },
  props: {
    mainMenuWidth: {
      type: Number,
      required: true,
    },
    openProjectManagement: {
      type: String,
      required: true,
    },
    setOpenProjectManagement: {
      type: Function,
      required: true,
    },
  },
  watch: {
    openProjectManagement: {
      immediate: true,
      handler(newValue) {
        if (newValue !== "projectDownloader") {
          this.projectDownloaderOpen = false;
        }
      },
    },
    projectDownloaderOpen: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.setOpenProjectManagement("projectDownloader");
        }
      },
    },
  },
};
</script>

<template lang="html">
  <div
    id="exporter-addon"
    :style="{ width: mainMenuWidth + 'px' }"
  >
    <button
      v-if="!projectDownloaderOpen"
      class="amarex-btn-primary full-with-icon"
      @click="toggleProjectDownloader"
    >
      <SaveIcon
        :color="colors.secondary"
        :size="16"
      />
      <p>Projekt herunterladen</p>
    </button>
    <div
      v-else
      class="expanded-project-downloader"
      id="project-downloader-expanded"
    >
      <div
        class="button-overview d-flex align-items-center justify-content-center"
        @click="toggleProjectDownloader"
      >
        <SaveIcon
          :color="colors.secondary"
          :size="16"
        />
        <p>Projekt herunterladen</p>
      </div>
      <p class="description">
        Laden Sie hier Ihr Projekt als ZIP-Datei herunter, um sie später erneut
        im AMAREX-Webtool zu öffnen oder um einzelne Layer in einer
        GIS-Anwendung zu laden und zu bearbeiten.
      </p>
      <button
        class="amarex-btn-primary accent full-with-icon"
        @click="downloadWithFetch(projectTitle || 'amarex-download')"
      >
        <FileDown
          :color="colors.amarex_primary"
          :size="16"
        />
        <p>ZIP-Datei herunterladen</p>
      </button>
    </div>
  </div>
</template>

<style lang="scss">
@import "~variables";
.expanded-project-downloader {
  padding: 10px 16px 25px 16px;
  background: $amarex_secondary_mid;
  .button-overview {
    cursor: pointer;
    gap: 8px;
    margin-bottom: 8px;
  }
  & > p {
    margin-bottom: 16px;
  }
  .description {
    overflow: hidden;
    color: $amarex_grey_dark;
    font-family: Arial;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
    user-select: none;
  }
}
</style>

