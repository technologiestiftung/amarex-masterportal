<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import FileUpload from "../../../src/shared/modules/inputs/components/FileUpload.vue";
import JSZip from "jszip";
import layerCollection from "../../../src/core/layers/js/layerCollection.js";
import colors from "../../../src/shared/js/utils/amarex-colors.json";
import { FileIcon, LoaderCircle, Trash2 } from "lucide-vue-next";

/**
 * Project Uploader
 * @module modules/ProjectUploader
 */
export default {
  name: "ProjectUploader",
  components: {
    FileUpload,
    FileIcon,
    LoaderCircle,
    Trash2,
  },
  data() {
    return {
      fileUploaded: false,
      filesToUpload: [],
      selectedFiles: {},
      colors,
      projectUploaderOpen: false,
      loading: false,
      success: false,
    };
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
  computed: {
    ...mapGetters("Modules/ProjectUploader", [
      "importedFileNames",
      "enableZoomToExtend",
      "featureExtents",
      "addLayerConfig",
    ]),
    ...mapGetters("Menu", ["currentComponent"]),
    ...mapGetters(["Maps/projectionCode", "layerConfig", "portalConfig"]),
    dropZoneAdditionalClass: function () {
      return this.dzIsDropHovering ? "dzReady" : "";
    },
  },
  mounted() {
    this.setFocusToFirstControl();
    this.modifyImportedFileNames(this.importedFileNames);
    this.modifyImportedFileExtent(this.featureExtents, this.importedFileNames);
  },
  methods: {
    ...mapActions("Modules/ProjectUploader", [
      "importFile",
      "importGeoJSON",
      "openDrawTool",
      "processConfigJsonOnload",
    ]),
    ...mapActions("Maps", ["zoomToExtent"]),
    ...mapActions("Alerting", ["addSingleAlert"]),
    ...mapMutations("Modules/ProjectUploader", ["setFeatureExtents"]),
    ...mapActions("Menu", ["changeCurrentComponent", "toggleMenu"]),
    ...mapActions("Modules/AbimoHandler", [
      "updateAccumulatedStats",
      "updatePreComputedStats",
      "updateMeasureStats",
      "updateResultStats",
    ]),
    ...mapMutations("Modules/AbimoHandler", [
      "setSelectedCount",
      "setPreComputedModelsShown",
      "setPreComputedModels",
      "setActiveStep",
      "setPreComputedModelsAdded",
      "setVisiblePreComputedModelIDs",
      "setAccumulatedAbimoStats",
      "setAreaTypesData",
      "setIsMeasurePlanning",
    ]),

    /**
     * Sets the focus to the first control
     * @returns {void}
     */
    setFocusToFirstControl() {
      this.$nextTick(() => {
        if (this.$refs["upload-label"]) {
          this.$refs["upload-label"].focus();
        }
      });
    },

    /**
     * Unzip file
     * @param {abimoConfigFileContent} content of the abimo config file
     * @returns {void}
     */
    async handleAbimoConfigFile(abimoConfigFileContent) {
      const abimoConfig = JSON.parse(abimoConfigFileContent);

      if (abimoConfig.preComputedModelsAdded) {
        this.setPreComputedModelsAdded(abimoConfig.preComputedModelsAdded);
        this.setVisiblePreComputedModelIDs(
          abimoConfig.visiblePreComputedModelIDs,
        );
      }

      // run actions
      await this.setAccumulatedAbimoStats(abimoConfig.accumulatedAbimoStats);
      await this.updateResultStats(abimoConfig.dataResultCalc);
      await this.updatePreComputedStats(abimoConfig.dataPreComputedCalc);
      await this.updateMeasureStats(abimoConfig.accumulatedMeasureStats);

      this.setIsMeasurePlanning(abimoConfig.isMeasurePlaning);
      this.setAreaTypesData(abimoConfig.areaTypesData);
      this.setSelectedCount(abimoConfig.selectedCount);
      this.setPreComputedModelsShown(abimoConfig.preComputedModelsShown);
      this.setActiveStep(abimoConfig.activeStep);
    },

    /**
     * Unzip file
     * @param {FileList} files The files
     * @returns {void}
     */
    async processFiles(files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.type.includes("zip")) {
          await this.processZipFile(file);
        } else if (this.checkValid(file)) {
          this.filesToUpload.push(file);
          this.fileUploaded = true;
        }
      }
      this.fileUploaded = true;
    },
    async processZipFile(file) {
      const zip = await JSZip.loadAsync(file),
        filesInZip = Object.values(zip.files).filter(
          (file) => !file.dir && file.name.indexOf("__") !== 0,
        );

      for (const fileInZip of filesInZip) {
        const fileContent = await fileInZip.async("blob");

        this.filesToUpload.push(
          new File([fileContent], fileInZip.name, {
            type: fileInZip.contentType,
          }),
        );
      }
    },
    triggerClickOnFileInput(event) {
      if (event.which === 32 || event.which === 13) {
        this.$refs["upload-input-file"].click();
      }
    },
    onInputChange(event) {
      const files = event.target.files;

      if (files !== undefined) {
        this.processFiles(files);
        event.target.value = null;
      }
    },
    onDrop(event) {
      event.preventDefault();
      this.processFiles(event.dataTransfer.files);
    },
    /**
     * Checks if the file is valid
     * @param {File} file The file
     * @returns {boolean} true, if the file is valid
     */
    checkValid(file) {
      const validExtensions = [".json", ".geojson", ".kml", ".gpx"];

      if (validExtensions.some((ext) => file.name.includes(ext))) {
        return true;
      }
      this.addSingleAlert({
        category: "error",
        content: this.$t(
          "common:modules.appFileImport.alertingMessages.formatError",
          { filename: file.name },
        ),
      });
      return false;
    },

    async isValidConfigFile(file) {
      try {
        const fileContent = await file.text(),
          parsedJson = JSON.parse(fileContent),
          isValid =
            typeof parsedJson === "object" &&
            parsedJson !== null &&
            "portalConfig" in parsedJson &&
            "layerConfig" in parsedJson;

        return isValid;
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        return false;
      }
    },

    /**
     * Finds first config file
     * @returns {File | null}
     */
    async findFirstConfigFile() {
      const validConfigFiles = await Promise.all(
        this.filesToUpload.map(async (file) => {
          const isValid = await this.isValidConfigFile(file);

          return isValid ? file : null;
        }),
      );

      return validConfigFiles.find((file) => file !== null) || null;
    },

    /**
     * Removes the file
     * @param {File} file file to remove
     * @returns {void}
     */
    removeFile(file) {
      if (this.filesToUpload.includes(file)) {
        const index = this.filesToUpload.indexOf(file);
        this.filesToUpload.splice(index, 1);
        if (this.filesToUpload.length === 0) {
          this.fileUploaded = false;
        }
      }
    },

    /**
     * Adds the project
     * @returns {void}
     */
    async addProject() {
      this.loading = true;
      this.projectUploaderOpen = false;
      const getCurrentSecondaryMenuComponent =
        this.currentComponent("secondaryMenu").type;
      this.toggleMenu("secondaryMenu", false);
      this.changeCurrentComponent({
        type:
          getCurrentSecondaryMenuComponent === "baseMaps"
            ? "themeMaps"
            : "baseMaps",
        side: "secondaryMenu",
      });
      setTimeout(() => {
        this.changeCurrentComponent({
          type: getCurrentSecondaryMenuComponent,
          side: "secondaryMenu",
        });
        this.toggleMenu("secondaryMenu", false);
        this.loading = false;
        this.success = true;
        setTimeout(() => {
          this.success = false;
        }, 5000);
      }, 2000);
      await this.addConfig();
      await this.addFiles();
    },

    /**
     * Adds the config
     * @returns {void}
     */
    async addConfig() {
      const configFile = await this.findFirstConfigFile();

      if (configFile) {
        if (!this.checkValid(configFile)) {
          return;
        }

        const reader = new FileReader();

        reader.onload = (evt) => {
          this.processConfigJsonOnload(evt);
        };
        reader.readAsText(configFile);
      }
    },

    /**
     * Adds files to the project
     * @returns {Promise<void>}
     */
    async addFiles() {
      this.filesToUpload.forEach(async (file) => {
        if (!this.checkValid(file)) {
          return;
        }

        // Check for a specific filename first
        if (file.name === "abimo-config.json") {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const configContent = event.target.result;
            this.handleAbimoConfigFile(configContent);
          };
          reader.readAsText(file);
          return;
        }

        const isValidConfig = await this.isValidConfigFile(file),
          reader = new FileReader();

        if (!isValidConfig) {
          const fileName = file.name.split(".")[0],
            layer = await layerCollection.getLayerById(fileName);

          reader.onload = async (event) => {
            if (layer) {
              const raw = event.target.result,
                importAction =
                  layer.attributes.typ.toUpperCase() === "GEOJSON"
                    ? this.importGeoJSON
                    : this.importFile;

              importAction({
                raw,
                layer: layer.layer,
                filename: file.name,
              });
            }
          };
        }
        reader.readAsText(file);
        this.filesToUpload = [];
      });
    },

    /**
     * Check if there are still features from the imported file.
     * If there are no features existed from the same imported file, the file name will be removed.
     * @param {String[]} fileNames the imported file name lists
     * @returns {void}
     */
    modifyImportedFileNames(fileNames) {
      const modifiedFileNames = [];

      if (
        typeof this.layer !== "undefined" &&
        Array.isArray(fileNames) &&
        fileNames.length
      ) {
        fileNames.forEach((name) => {
          if (this.selectedFiles[name]) {
            this.layer
              .getSource()
              .getFeatures()
              .forEach((feature) => {
                if (
                  feature.get("source") &&
                  feature.get("source") === name &&
                  !modifiedFileNames.includes(name)
                ) {
                  modifiedFileNames.push(name);
                }
              });
          }
        });

        this.setImportedFileNames(modifiedFileNames);
      }
    },

    /**
     * Check if there are still features from the imported file.
     * If there are no features existed from the same imported file, the file name will be removed.
     * @param {Object} featureExtents the feature extent object, key is the file name and value is the feature extent
     * @param {String[]} fileNames the imported file name lists
     * @returns {void}
     */
    modifyImportedFileExtent(featureExtents, fileNames) {
      const modifiedFeatureExtents = {};

      fileNames.forEach((name) => {
        if (this.selectedFiles[name]) {
          modifiedFeatureExtents[name] = featureExtents[name];
        }
      });

      this.setFeatureExtents(modifiedFeatureExtents);
    },
    toggleProjectUploader() {
      this.projectUploaderOpen = !this.projectUploaderOpen;
    },
  },
  watch: {
    openProjectManagement: {
      immediate: true,
      handler(newValue) {
        if (newValue !== "projectUploader") {
          this.projectUploaderOpen = false;
        }
      },
    },
    projectUploaderOpen: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.setOpenProjectManagement("projectUploader");
        }
      },
    },
  },
};
</script>

<template lang="html">
  <div
    id="file-import"
    :style="{ width: mainMenuWidth + 'px' }"
  >
    <p
      v-if="success"
      class="mb-2"
      :style="{ fontWeight: 700 }"
    >
      Projekt erfolgreich geöffnet!
    </p>
    <span
      v-if="loading"
      class="loading-container d-flex justify-content-center w-100 mb-2"
    >
      <LoaderCircle
        :color="colors.amarex_secondary"
        :size="24"
      />
    </span>
    <button
      v-if="!projectUploaderOpen"
      class="amarex-btn-primary full-with-icon"
      @click="toggleProjectUploader"
    >
      <FileIcon
        :color="colors.secondary"
        :size="16"
      />
      <p>Projekt öffnen</p>
    </button>
    <div
      v-else
      class="expanded-project-uploader"
      id="project-uploader-expanded"
    >
      <div
        class="button-overview d-flex align-items-center justify-content-center"
        @click="toggleProjectUploader"
      >
        <FileIcon
          :color="colors.secondary"
          :size="16"
        />
        <p>Projekt öffnen</p>
      </div>
      <p
        class="description"
        v-html="
          $t(
            'Laden Sie hier Ihr Projekt hoch, dass Sie im Amarex Webtool erstellt haben. Es können Projektdateien (.zip) und Konfigurationsdateien (.json) importiert werden.',
          )
        "
      />
      <FileUpload
        :id="'fileUpload'"
        :keydown="(e) => triggerClickOnFileInput(e)"
        :change="(e) => onInputChange(e)"
        :drop="(e) => onDrop(e)"
      >
        <div
          v-if="fileUploaded"
          class="mt-2"
        >
          <div
            v-for="file in filesToUpload"
            :key="file"
            :class="enableZoomToExtend ? 'hasZoom' : ''"
            class="d-flex flex-nowrap align-items-center gap-1 mb-2"
          >
            <div
              @click="() => removeFile(file)"
              class="remove-btn"
            >
              <Trash2
                :color="colors.secondary"
                :size="20"
              />
            </div>
            <p
              class="text-truncate text-start mb-0"
              style="
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                min-width: 0;
              "
            >
              {{ file.name }}
            </p>
          </div>
        </div>
      </FileUpload>
      <button
        v-if="filesToUpload?.length > 0 && !loading"
        class="amarex-btn-primary accent full-with-icon mt-3"
        @click="addProject"
      >
        <p>Ausgewählte Dateien importieren</p>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";

#file-import .form-floating {
  max-height: 25vh; // 170px
  overflow-y: scroll;
}
#file-import .form-floating::-webkit-scrollbar {
  display: none;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.loading-container {
  svg {
    animation: spin 1s linear infinite;
  }
}

.expanded-project-uploader {
  padding: 10px 16px 16px 16px;
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
  .btn {
    width: 24px !important;
    height: 24px !important;
    border-radius: 0 !important;
    border: none !important;
    padding: 0 !important;
  }
}

.remove-btn {
  z-index: 20;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}

input[type="file"] {
  display: none;
}
input[type="button"] {
  display: none;
}
</style>

