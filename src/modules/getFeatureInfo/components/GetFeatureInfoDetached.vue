<script>
import DefaultTheme from "../themes/default/components/DefaultTheme.vue";
import SensorTheme from "../themes/sensor/components/SensorTheme.vue";
import getTheme from "../js/getTheme";
import {mapActions, mapGetters, mapMutations} from "vuex";
import layerCollection from "../../../core/layers/js/layerCollection";
import {
    X as CloseIcon
} from "lucide-vue-next";
import colors from "../../../shared/js/utils/amarex-colors.json";

/**
 * Get Feature Info Detached
 * @module modules/getFeatureInfo/components/GetFeatureInfoDetached
 * @vue-prop {Object} feature - The required feature.
 * @vue-prop {Boolean} isUpdated - true, if feature was updated.
 * @vue-data {Boolean} isContentHtml - Shows if content is html.
 * @vue-computed {String} title - The title of the gfi.
 * @vue-computed {String} theme - The theme in which the feature should be displayed.
 */
export default {
    name: "GetFeatureInfoDetached",
    components: {
        DefaultTheme,
        SensorTheme,
        CloseIcon
    },
    props: {
        feature: {
            type: Object,
            required: true
        },
        isUpdated: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    emits: ["updateFeatureDone"],
    data () {
        return {
            isContentHtml: false,
            lastFeature: null,
            colors
        };
    },
    computed: {
        ...mapGetters("Maps", ["clickCoordinate"]),
        ...mapGetters("Modules/SearchBar", ["searchInput"]),
        ...mapGetters("Modules/GetFeatureInfo", [
            "centerMapToClickPoint",
            "currentFeature",
            "highlightVectorRules",
            "menuSide",
            "showMarker",
            "hideMapMarkerOnVectorHighlight"
        ]),

        /**
         * Returns the title of the gfi.
         * @returns {String} the title
         */
        title: function () {
            return this.feature.getTitle();
        },

        /**
         * Returns the theme in which the feature should be displayed.
         * It only works if the theme has the same name as the theme component, otherwise the default theme will be used
         * @returns {String} the name of the theme
         */
        theme: function () {
            return getTheme(this.feature.getTheme(), this.$options.components, this.$gfiThemeAddons);
        }
    },
    created () {
        if (this.feature?.getMimeType() === "text/html") {
            this.isContentHtml = true;
        }
    },
    mounted () {
        console.log('GetFeatureInfoDetached mounted :>> ', this.feature);
        console.log('GetFeatureInfoDetached mounted :>> ', this.feature.getMappedProperties());
        this.highlightVectorFeature();
        this.setMarker();
    },
    updated: function () {
        if (this.isUpdated) {
            this.highlightVectorFeature();
            this.setMarker();
            this.$emit("updateFeatureDone");
        }
    },
    beforeUnmount: function () {
        if (this.searchInput === "") {
            this.removePointMarker();
            this.removeHighlighting();
        }
    },
    methods: {
        ...mapMutations("Modules/GetFeatureInfo", [
            "setShowMarker",
            "setVisible"
        ]),
        ...mapActions("Maps", [
            "placingPointMarker",
            "removePointMarker",
            "highlightFeature",
            "removeHighlightFeature",
            "setCenter"
        ]),
        ...mapActions("Menu", ["navigateBack", "resetMenu"]),

        /**
         * Sets the center of the view on the clickCoord and place the MapMarker on it
         * Set Marker and Center.
         * @returns {void}
         */
        setMarker () {
            if (this.clickCoordinate) {
                if (this.centerMapToClickPoint) {
                    this.setCenter(this.clickCoordinate);
                }
                if (this.showMarker) {
                    this.placingPointMarker(this.clickCoordinate);
                }
            }

        },

        /**
         * Hides the map marker
         * @returns {void}
         */
        hideMarker () {
            this.setShowMarker(false);
        },

        /**
         * Highlights a vector feature if highlightVectorRules is configured in config.json.
         * @returns {void}
         */
        highlightVectorFeature () {
            if (this.highlightVectorRules) {
                const layer = layerCollection.getLayerById(this.feature.getLayerId()),
                    styleId = layer?.get("styleId"),
                    highlightObject = {
                        feature: this.feature.getOlFeature(),
                        layer: {id: this.feature.getLayerId()},
                        styleId
                    };

                if (this.hideMapMarkerOnVectorHighlight) {
                    this.hideMarker();
                    this.removePointMarker();
                }
                this.removeHighlighting();

                if (this.feature.getOlFeature() && typeof this.feature.getOlFeature().getGeometry === "function") {
                    switch (this.feature.getOlFeature().getGeometry()?.getType()) {
                        case "Point":
                        {
                            highlightObject.type = "increase";
                            highlightObject.scale = this.highlightVectorRules.image.scale;
                            break;
                        }
                        case "Polygon":
                        {
                            highlightObject.type = "highlightPolygon";
                            highlightObject.highlightStyle = {
                                fill: this.highlightVectorRules.fill,
                                stroke: this.highlightVectorRules.stroke
                            };
                            break;
                        }
                        case "MultiPolygon":
                        {
                            highlightObject.type = "highlightMultiPolygon";
                            highlightObject.highlightStyle = {
                                fill: this.highlightVectorRules.fill,
                                stroke: this.highlightVectorRules.stroke
                            };
                            break;
                        }
                        case "LineString":
                        {
                            highlightObject.type = "highlightLine";
                            highlightObject.highlightStyle = {
                                stroke: this.highlightVectorRules.stroke
                            };
                            break;
                        }
                        default:
                            break;
                    }
                }
                if (highlightObject.type) {
                    this.highlightFeature(highlightObject);
                }
                this.lastFeature = this.feature;
            }
        },
        /**
         * Removes the feature highlighting
         * @returns {void}
         */
        removeHighlighting: function () {
            if (this.lastFeature) {
                this.removeHighlightFeature(this.lastFeature.getOlFeature());
            }
        },


        /**
         * In case they key exists, returns its translation. In case the key doesn't exist returns the key.
         * @param {String} key the key to translate
         * @param {Object} [options=null] for interpolation, formating and plurals
         * @returns {String} the translation or the key itself
         */
        translate (key, options = null) {
            return this.$t(key, options);
        },

        mappedPropertiesExists (feature) {
            return typeof feature === "object" && feature !== null && typeof feature.getMappedProperties === "function";
        },
        hasMappedProperties (feature) {
            return Object.keys(feature.getMappedProperties()).length !== 0;
        },
        closeFeatureInfo() {
            console.log('closeFeatureInfo');
            this.setVisible(false);
            const targetElement = document.querySelector('.step-indicator.active');
            if (targetElement) {
                setTimeout(() => {
                    targetElement.click();
                }, 100);
            } else {
                console.warn('Element with classes ".step-indicator.active" not found.');
            }
        }
    }
};
</script>

<template>
    <div>
        <!-- <div class="d-flex align-items-center justify-content-between mt-3 mb-4">
            <slot name="pager-left" />
            <span class="gfi-title mx-3 font-bold">
                {{ translate(title) }}
            </span>
            <slot name="pager-right" />
        </div> -->
        <!-- <component
        :is="theme"
        :feature="feature"
        /> -->
        <!-- Masterportal change: give the FeatureInfoContainer a new Title Element -->
        <!-- NEW TITLE -->
        <div class="close-container w-100 d-flex justify-content-end align-items-center" @click="closeFeatureInfo">
            <p>Schließen</p>
            <CloseIcon
                :color="colors.amarex_secondary"
                :size="24"
            />
        </div>
        <hr>
        <h5 class="my-4">LAYER: Topographische Senkenanalyse</h5>
        <table
            class="table table-hover"
        >
            <tbody v-if="mappedPropertiesExists(feature) && !hasMappedProperties(feature)">
                <tr>
                    <td>
                        {{ $t("common:modules.getFeatureInfo.themes.default.noAttributeAvailable") }}
                    </td>
                </tr>
            </tbody>
            <tbody v-else-if="mappedPropertiesExists(feature)">
                <tr>
                    <td>
                        ID
                    </td>
                    <td>
                        XXXXXXXX
                    </td>
                </tr>
                <tr>
                    <td>
                        Fläche Einzugsgebiet [m²]
                    </td>
                    <td>
                        XXXXXXXX
                    </td>
                </tr>
                <tr>
                    <td>
                        Fläche Senke [m²]
                    </td>
                    <td>
                        XXXXXXXX
                    </td>
                </tr>
                <tr>
                    <td>
                        Maximale Tiefe der Senke [cm]
                    </td>
                    <td>
                        XXXXXXXX
                    </td>
                </tr>
                <tr>
                    <td>
                        Geländehöhe Senkenbasis [m]
                    </td>
                    <td>
                        XXXXXXXX
                    </td>
                </tr>
                <tr>
                    <td>
                        Geländehöhe maximaler Füllstand [m]
                    </td>
                    <td>
                        XXXXXXXX
                    </td>
                </tr>
                <tr>
                    <td>
                        Füllvolumen [m³]
                    </td>
                    <td>
                        XXXXXXXX
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.gfi-title {
    font-size: 1.5rem;
 }
 .table {
    margin-bottom: 0;
    border: 1px solid $amarex_secondary;
    td {
        border: 1px solid $amarex_secondary;
        padding: 0.5rem;
    }
    @include media-breakpoint-up(sm) {
        max-width: 400px;
    }
}
.close-container {
    p, svg {
        cursor: pointer;
        user-select: none;
    }
}
</style>
