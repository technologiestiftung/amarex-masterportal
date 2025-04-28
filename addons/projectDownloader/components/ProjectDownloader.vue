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
      const layerCollectionData = layerCollection.getLayers(),
        projectionCode = this.$store.getters["Maps/projectionCode"];

      this.fileSources = []; // Reset the fileSources array

      try {
        layerCollectionData.forEach((layer) => {
          if (!layer.attributes.showInLayerTree) {
            return;
          }

          if (
            layer.layer instanceof VectorLayer &&
            (layer.attributes.typ !== "WFS" || "WMS")
          ) {
            const geoJSONData = exportLayerAsGeoJSON(
              layer.layer,
              projectionCode,
            );

            if (geoJSONData) {
              this.fileSources.push({
                title: `${layer.attributes.id}.geojson`,
                src: URL.createObjectURL(
                  new Blob([geoJSONData], { type: "application/json" }),
                ),
              });
            }
          }
        });
      } catch (error) {
        console.error(error);
      }
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
        .catch((error) => console.log(error));
    },
    async downloadWithFetch(zipName) {
      await this.prepareConfigForDownload();
      await this.prepareVectorLayerForDownload();
      const zip = new JSZip(),
        // Create config.json
        configJson = JSON.stringify(this.configToExport);

      zip.file("config.json", configJson);

      const fetchPromises = this.fileSources.map(async (file) => {
        const response = await fetch(file.src),
          buffer = await response.arrayBuffer();

        zip.file(file.title, buffer);
      });

      await Promise.all(fetchPromises);
      this.forceFileDownload(zip, sanitizeSelector(zipName));
    },
  },
};
</script>

<template lang="html">
  <div id="exporter-addon">
    <button
      v-if="!projectDownloaderOpen"
      class="amarex-btn-primary full-with-icon"
      @click="projectDownloaderOpen = !projectDownloaderOpen"
    >
      <SaveIcon
        :color="colors.secondary"
        :size="16"
      />
      <p>Herunterladen</p>
    </button>
    <div
      v-else
      class="expanded-project-downloader"
    >
      <div
        class="button-overview d-flex align-items-center justify-content-center"
        @click="projectDownloaderOpen = !projectDownloaderOpen"
      >
        <SaveIcon
          :color="colors.secondary"
          :size="16"
        />
        <p>Herunterladen</p>
      </div>
      <p>
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
  padding: 10px 15px 25px 15px;
  background: $amarex_secondary_mid;
  .button-overview {
    cursor: pointer;
    gap: 8px;
    margin-bottom: 25px;
  }
  & > p {
    margin-bottom: 15px;
  }
}
</style>

