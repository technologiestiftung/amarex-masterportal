<script>
import axios from "axios";
import Cluster from "ol/source/Cluster";
import {mapGetters, mapMutations, mapActions} from "vuex";
import {Vector} from "ol/layer.js";

import isObject from "../../../shared/js/utils/isObject";
import mutations from "../store/mutationsPrint";
import layerProvider from "../js/getVisibleLayer";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import BuildSpec from "../js/buildSpec";
import layerCollection from "../../../core/layers/js/layerCollection";
import SpinnerItem from "../../../shared/modules/spinner/components/SpinnerItem.vue";

import colors from "../../../shared/js/utils/amarex-colors.json";
import { Info as InfoIcon, FileDown, LoaderCircle } from "lucide-vue-next";
import { getReport } from "../api/getReport";

/**
 * Tool to print a part of the map
 * @module modules/PrintMap
 * @vue-computed {Number} currentScale - The current scale that is set in the drop down.
 * @vue-computed {Number} dpiForPdf - The current dpi that is set in the drop down.
 * @vue-computed {Array} dpiList - The list of available dpis.
 * @vue-computed {Array} shownLayoutList - The list of available layouts.
 * @vue-computed {Array} shownFormatList - The list of available formats.
 * @vue-computed {String} outputTitle - The title for the file.
 */
export default {
    name: "PrintMap",
    components: {
        SpinnerItem, 
        InfoIcon,
        FileDown,
        LoaderCircle
    },
    data () {
        return {
            subtitle: "Das ist der Untertitel",
            textField: "Das ist das Textfeld",
            author: "Hier steht der Author",
            colors,
            report: {
                title: "",
                description: "",
                date: new Date().toDateString(),
            },
            reportLoading: false,
            warning: null,
        };
    },
    computed: {
        ...mapGetters("Modules/ProjectStarter", [
            "projectTitle",
            "projectDescription",
        ]),
        ...mapGetters("Modules/Print", [
            "capabilitiesFilter",
            "currentLayout",
            "defaultCapabilitiesFilter",
            "fileDownloads",
            "filename",
            "formatList",
            "is3d",
            "isIncreased3DResolutionSelected",
            "layoutList",
            "overviewmapLayerId",
            "printMapMarker",
            "printService",
            "printServiceId",
            "title",
            "visibleLayerList"
        ]),
        ...mapGetters("Maps", ["mode", "scale"]),
        ...mapGetters("Modules/GetFeatureInfo", ["currentFeature"]),
        ...mapGetters("Menu", [
            "mainMenu",
            "secondaryMenu"
        ]),
        ...mapGetters("Modules/AbimoHandler", [
            "areaTypesData",
            "accumulatedAbimoStats",
            "selectedFeatures",
            "resultAbimoStats"
        ]),
        currentScale: {
            get () {
                return this.$store.state.Modules.Print.currentScale;
            },
            set (value) {
                this.setCurrentScale(value);
            }
        },
        dpiForPdf: {
            get () {
                return this.$store.state.Modules.Print.dpiForPdf;
            },
            set (value) {
                this.setDpiForPdf(value);
            }
        },
        dpiList: {
            get () {
                return this.$store.state.Modules.Print.dpiList;
            },
            set (value) {
                this.setDpiList(value);
            }
        },
        shownLayoutList: {
            get () {
                let filterArray = [];

                if (Object.keys(this.capabilitiesFilter).length > 0 &&
                    this.capabilitiesFilter.layouts &&
                    this.capabilitiesFilter.layouts.length > 0) {
                    filterArray = this.capabilitiesFilter.layouts;
                }
                else if (Object.keys(this.defaultCapabilitiesFilter).length > 0 &&
                    this.defaultCapabilitiesFilter.layouts &&
                    this.defaultCapabilitiesFilter.layouts.length > 0) {
                    filterArray = this.defaultCapabilitiesFilter.layouts;
                }
                return this.layoutList.filter(function (el) {
                    let res = filterArray.length === 0;

                    filterArray.forEach(function (layoutFilter) {
                        if (el.name.match(layoutFilter) !== null) {
                            res = true;
                        }
                        return !res;
                    });
                    return res;
                }, this);
            },
            set (value) {
                this.setLayoutList(value);
            }
        },
        shownFormatList: {
            get () {
                let filterArray = [];

                if (Object.keys(this.capabilitiesFilter).length > 0 &&
                    this.capabilitiesFilter.outputFormats &&
                    this.capabilitiesFilter.outputFormats.length > 0) {
                    filterArray = this.capabilitiesFilter.outputFormats;
                }
                else if (Object.keys(this.defaultCapabilitiesFilter).length > 0 &&
                    this.defaultCapabilitiesFilter.outputFormats &&
                    this.defaultCapabilitiesFilter.outputFormats.length > 0) {
                    filterArray = this.defaultCapabilitiesFilter.outputFormats;
                }
                return this.formatList.filter(function (el) {
                    return filterArray.indexOf(el.name) > -1 || filterArray.length === 0;
                }, this);
            },
            set (value) {
                this.setFormatList(value);
            }
        },
        outputTitle: {
            get () {
                return this.filename;
            },
            set (value) {
                this.setFilename(value);
                this.isValid(value);
            }
        },
        firstFinishState() {
            return this.fileDownloads.length > 0 ? this.fileDownloads[0].finishState : null;
        }
    },
    watch: {
        scale: function (value) {
            this.setCurrentMapScale(value);
        },
        currentFeature: function (value) {
            if (value === null) {
                this.setIsGfiSelected(false);
            }
        },
        mode: function (value) {
            if (value === "3D") {
                this.setIs3d(true);
                this.togglePostrenderListener();
            }
            else {
                this.setIs3d(false);
            }
        },
        isIncreased3DResolutionSelected: function (value) {
            this.update3DResolutionScale(value);
        },
        firstFinishState(newVal) {
            if (newVal) {
                const newPrintFile = this.fileDownloads[0]
                if (newPrintFile && newPrintFile?.finishState) {
                    const downloadURL = newPrintFile.downloadUrl
                    if (downloadURL) {
                        this.generateReport(downloadURL)
                    }
                }
            }
        }
    },
    created () {
        this.setServiceId(this.printServiceId);
        this.report.title = this.projectTitle || "Amarex Report PDF";
        this.report.description = this.projectDescription;
    },
    mounted () {
        if (this.mode === "3D") {
            this.setIs3d(true);
        }
        else {
            this.setIs3d(false);
        }
        this.$nextTick(() => {
            if (this.shownLayoutList.length === 0) {
                this.retrieveCapabilites();
                this.setCurrentMapScale(this.scale);
                this.togglePostrenderListener();
                this.updateCanvasByFeaturesLoadend(this.visibleLayerList);
                this.setIsScaleSelectedManually(false);
                this.setCurrentMapScale(this.scale);
                this.setIsIncreased3DResolutionSelected(false);
            }
        });
        this.setCurrentFormat("png")
        this.setCurrentMapScale(this.scale);
    },
    unmounted () {
        this.resetAll()
    },
    methods: {
        ...mapMutations("Modules/Print", Object.keys(mutations)),
        ...mapActions("Modules/Print", [
            "retrieveCapabilites",
            "togglePostrenderListener",
            "startPrint",
            "startPrint3d",
            "updateCanvasLayer",
            "update3DResolutionScale"
        ]),
        ...mapActions("Alerting", ["addSingleAlert"]),

        /**
         * Waits until the features of Vector layers are loaded and then renders the canvas again.
         * Cluster layer are considered.
         * @param {module:ol/layer/Base~BaseLayer[]} visibleLayerList A list which contains the visible layers.
         * @returns {void}
         */
        updateCanvasByFeaturesLoadend (visibleLayerList) {
            visibleLayerList.forEach(layer => {
                if (layer instanceof Vector) {
                    let layerSource = layer.getSource();

                    if (layer.getSource() instanceof Cluster) {
                        layerSource = layerSource.getSource();
                    }

                    layerSource.once("featuresloadend", () => {
                        if (this.mainMenu.currentComponent === "print" || this.secondaryMenu.currentComponent === "print") {
                            layerProvider.getVisibleLayer(this.printMapMarker);
                            this.updateCanvasLayer();
                            this.togglePostrenderListener();
                        }
                    });
                }
            });
        },

        /**
         * Starts the print
         * @returns {void}
         */
        print () {
            const currentPrintLength = this.fileDownloads.filter(file => file.finishState === false).length;

            if (currentPrintLength <= 10) {
                const index = this.fileDownloads.length,
                    layoutAttributes = this.getLayoutAttributes(this.currentLayout, ["subtitle", "textField", "author", "overviewMap", "source"]);

                this.addFileDownload({
                    index: index,
                    title: this.title,
                    finishState: false,
                    downloadUrl: null,
                    filename: this.filename,
                    outputFormat: this.outputFormat
                });

                this.setPrintStarted(true);
                if (this.is3d) {
                    this.startPrint3d({
                        index,
                        getResponse: async (url, payload) => {
                            return axios.post(url, payload);
                        },
                        layoutAttributes
                    });
                }
                else {
                    this.startPrint({
                        index,
                        getResponse: async (url, payload) => {
                            return axios.post(url, payload);
                        },
                        layoutAttributes
                    });
                }
            }
            else {
                this.addSingleAlert({
                    category: "error",
                    content: this.$t("common:modules.print.alertMessage")
                });
            }
        },


        /**
         * Checks if the layout has a certain attribute by its name.
         * @param {Object} layout - The selected layout.
         * @param {String} attributeName - The name of the attribute to be checked.
         * @returns {Boolean} True if it has otherwise false.
         */
        hasLayoutAttribute (layout, attributeName) {
            if (isObject(layout) && typeof attributeName === "string" && this.printService !== "plotservice") {
                return layout.attributes.some(attribute => {
                    return attribute.name === attributeName;
                });
            }
            return false;
        },

        /**
         * Gets the layout attributes by the given names.
         * @param {Object} layout - The selected layout.
         * @param {String[]} nameList - A list of attribute names.
         * @returns {Object} The layout attributes or an empty object.
         */
        getLayoutAttributes (layout, nameList) {
            const layoutAttributes = {};

            if (!isObject(layout) || !Array.isArray(nameList)) {
                return layoutAttributes;
            }
            nameList.forEach(name => {
                if (this.hasLayoutAttribute(layout, name)) {
                    if (name === "overviewMap") {
                        layoutAttributes[name] = {
                            "layers": [BuildSpec.buildTileWms(layerCollection.getLayerById(this.getOverviewmapLayerId()).getLayer(), this.dpiForPdf)]
                        };
                    }
                    else if (name === "source") {
                        layoutAttributes[name] = [];
                        this.visibleLayerList.forEach(layer => {
                            const foundRawLayer = rawLayerList.getLayerWhere({id: layer.get("id")});

                            if (foundRawLayer) {
                                layoutAttributes[name].push(foundRawLayer?.datasets[0].show_doc_url + foundRawLayer.datasets[0].md_id);
                            }
                        });
                        layoutAttributes[name] = layoutAttributes[name].join("\n");
                    }
                    else {
                        layoutAttributes[name] = this[name];
                    }
                }
            });
            return layoutAttributes;
        },

        /**
         * Gets a layer id depending on its layer visibility.
         * @returns {String} The layer id for overviewMap.
         */
        getOverviewmapLayerId () {
            const defaultLayerId = this.visibleLayerList[0].values_.id,
                visibleLayerId = this.visibleLayerList.filter(id => id.values_.id === this.overviewmapLayerId).map(val => val.values_.id).toString();

            if (this.overviewmapLayerId !== undefined && visibleLayerId !== "") {
                return visibleLayerId;
            }
            return defaultLayerId;
        },
        mathRoundAndToFixed(num) {
            return Number(Math.round(num).toFixed(0))
        },
        fullPercentage(num) {
            return Number(Math.round(num * 100).toFixed(0))
        },

        /* Report PDF Amarex */
        async generateReport(downloadURL) {

            // 1.1 => Gesamtfläche
            const gesamtFläche = this.accumulatedAbimoStats.totalArea;
            // 1.2 => Unversiegelt
            const unversiegelt = this.areaTypesData.find((areaType) => areaType.id === "unpvd").max // < 1
            // 1.3 => Bebaut versiegelt
            const bebautVersiegelt = this.areaTypesData.find((areaType) => areaType.id === "roof").max // < 1
            // 1.4 => Unbebaut versiegelt
            const unbebautVersiegelt = this.areaTypesData.find((areaType) => areaType.id === "pvd").max // < 1
            // 1.5 => % von Dachfläche
            const begrünteDachfläche = this.accumulatedAbimoStats.maxGreenRoofToRoof // < 1
            // 2.1 => Zielwert Dachbegrünung
            const zielwertDachbegrünung = this.accumulatedAbimoStats.targetValueGreenRoof || 0 // < 100
            // 3.1 => Zielwert unversiegelte Fläche
            const zielwertUnversiegelt = this.accumulatedAbimoStats.targetValueUnsealed || 0 // < 100

            // Dachfläche "D" => 1.1 * 1.3
            const dachFläche = this.mathRoundAndToFixed(gesamtFläche * bebautVersiegelt)

            // Unversiegelte Fläche "U" => 1.1 * 3.1
            const unversiegelteFläche = this.mathRoundAndToFixed(gesamtFläche * (zielwertUnversiegelt / 100))
            
            // Versiegelte Fläche "V" => 1.1 - U - D
            const versiegelteFläche = this.mathRoundAndToFixed(gesamtFläche - unversiegelteFläche - dachFläche)

            const abimo_result_runoff = this.mathRoundAndToFixed(this.resultAbimoStats.runoff)
            const abimo_result_infiltration = this.mathRoundAndToFixed(this.resultAbimoStats.infiltration)
            const abimo_result_evaporation = this.mathRoundAndToFixed(this.resultAbimoStats.evaporation)
            const abimo_results_added = abimo_result_runoff + abimo_result_infiltration + abimo_result_evaporation

            const makePercentageForAbimo = (value) => {
                return this.mathRoundAndToFixed((100 / abimo_results_added) * value)
            }
            
            const payload = {
                title: this.report.title,
                description: this.report.description,
                date: this.report.date,
                downloadURL,
                // 1.1 * 1.3 => m² | 1.3 => % 
                flächenanteile_dachfläche: `${dachFläche} m² (${this.fullPercentage(bebautVersiegelt)}) %`,
                // 1.5 * dachFläche "D" => m² | 1.5 => %
                flächenanteile_davon_begrünt_status_quo: `${this.mathRoundAndToFixed(dachFläche * begrünteDachfläche)} m² (${this.fullPercentage(begrünteDachfläche)}) %`,
                // 2.1 * 1.1 => m² | 2.1 / 1.3 => % 
                flächenanteile_davon_begrünt_simulation: `${this.mathRoundAndToFixed(gesamtFläche * (zielwertDachbegrünung / 100))} m² (${this.fullPercentage((zielwertDachbegrünung / 100) / bebautVersiegelt)}) %`,
                // 1.4 * 1.1 => m² | 1.4 => %
                flächenanteile_unbebaut_versiegelte_flächen_status_quo: `${this.mathRoundAndToFixed(gesamtFläche * unbebautVersiegelt)} m² (${this.fullPercentage(unbebautVersiegelt)}) %`,
                // "V" => m² | V / 1.1 => %
                flächenanteile_unbebaut_versiegelte_flächen_simulation: `${versiegelteFläche} m² (${this.fullPercentage(versiegelteFläche / gesamtFläche)}) %`,
                // 1.2 * 1.1 => m² | 1.2 => %
                flächenanteile_unversiegelte_flächen_status_quo: `${this.mathRoundAndToFixed(gesamtFläche * unversiegelt)} m² (${this.fullPercentage(unversiegelt)}) %`,
                // "U" => m² | 3.1 => % 
                flächenanteile_unversiegelte_flächen_simulation: `${unversiegelteFläche} m² (${zielwertUnversiegelt}) %`,
                // gesetzte Maßnahmen
                an_mulde_angeschlossene_fläche: this.accumulatedAbimoStats.targetValueSwaleConnected || 0,
                dachbegrünung_prozente: this.accumulatedAbimoStats.targetValueGreenRoof || 0,
                entsiegelung_prozente: this.accumulatedAbimoStats.targetValueUnsealed || 0,
                // Abimo Result
                abimo_result: {
                    runoff: abimo_result_runoff,
                    runoff_prozente: makePercentageForAbimo(abimo_result_runoff),
                    infiltration: abimo_result_infiltration,
                    infiltration_prozente: makePercentageForAbimo(abimo_result_infiltration),
                    evaporation: abimo_result_evaporation,
                    evaporation_prozente: makePercentageForAbimo(abimo_result_evaporation),
                    deltaW: this.mathRoundAndToFixed(this.resultAbimoStats.deltaW),
                },
            }


            try {
                await getReport(payload, "gebiet", "_blank"); // "lokal" | "gebiet"
                this.reportLoading = false;
                this.setFileDownloads([]);
                return;
            } catch (error) {
                this.reportLoading = false;
                this.warning = "Fehler beim Erstellen des Reports: " + error;
                return;
            }
        },
        async triggerGenerate() {
            this.warning = null;
            if (!this.report.title) {
                this.warning = "Bitte einen Titel eingeben";
                return;
            }
            this.reportLoading = true;
            this.print()
        },
        resetAll() {
            this.setFileDownloads([]);
            this.togglePostrenderListener(false);
            this.shownLayoutList = [];
        }
    }
};
</script>

<template lang="html">
    <div id="modules-print">
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
                maxlength="40"
            />
        </div>
        <div class="input-wrapper">
        <p class="input-wrapper-title">Kommentar (Optional)</p>
        <textarea
            name="title"
            id="title"
            rows="10"
            v-model="report.description"
            placeholder="Hier können Sie einen Kommentar für Ihren Report eingeben (max. 300 Zeichen) ..."
            maxlength="300"
        ></textarea>
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
            @click="triggerGenerate"
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
            <p class="title">Ihr Report wird erstellt...</p>
        </span>
    </div>
</template>

<style lang="scss">
@import "~variables";
#modules-print {
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
  .last-form-element {
    margin-bottom: 32px;
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
