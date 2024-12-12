<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import layerFactory from "../../../core/layers/js/layerFactory";
import thousandsSeparator from "../../../shared/js/utils/thousandsSeparator";
import LayerCheckBox from "./LayerCheckBox.vue";
import LayerComponentIconInfo from "./LayerComponentIconInfo.vue";
import LayerComponentIconSubMenu from "./LayerComponentIconSubMenu.vue";
import LayerComponentSubMenuAmarex from "./LayerComponentSubMenuAmarex.vue";
import layerCollection from "../../../core/layers/js/layerCollection";
import {
    EllipsisVertical,
    Eye,
    EyeOff,
    SquareChevronRight
} from "lucide-vue-next";
import colors from "../../../shared/js/utils/amarex-colors.json";

// CHANGED JS

/**
 * Representation of a layer in layerTree.
 * @module modules/layerTree/components/LayerComponentAmarex
 * @vue-prop {Object} conf - The current layer configuration.
 * @vue-data {String} tooltipText - Contains information about scales, when the layer shall be disabled and is not shown in the map.
 */
export default {
    name: "LayerComponentAmarex",
    components: {
        LayerCheckBox,
        LayerComponentIconInfo,
        LayerComponentIconSubMenu,
        LayerComponentSubMenuAmarex,
        EllipsisVertical,
        Eye,
        EyeOff,
        SquareChevronRight
    },
    props: {
        conf: {
            type: Object,
            required: true
        },
        showToggle: {
            type: Boolean,
            required: true
        },
        openInfo: {
            type: Function,
            required: true
        },
        showInfo: {
            type: Object
        }
    },
    data () {
        return {
            tooltipText: "",
            colors
        };
    },
    computed: {
        ...mapGetters("Maps", ["mode", "scale", "scales"]),
        isLayerVisible () {
            return typeof this.conf.visibility === "boolean" ? this.conf.visibility : false;
        },
        applyBorderStyle() {
        return this.showToggle
            ? { borderBottomRightRadius: '4px', borderBottomLeftRadius: '0px' }
            : {};
        },
    },
    mounted () {
        if (this.conf.maxScale && this.conf.minScale) {
            let minScale = parseInt(this.conf.minScale, 10);

            if (minScale === 0) {
                minScale = this.scales[this.scales.length - 1];
            }
            this.tooltipText = this.$t("common:modules.layerTree.invisibleLayer", {
                minScale: "1: " + thousandsSeparator(minScale),
                maxScale: "1: " + thousandsSeparator(parseInt(this.conf.maxScale, 10), ".")
            });
        }
        else if (this.conf.maxScale || this.conf.minScale) {
            this.tooltipText = this.$t("common:modules.layerTree.invisibleLayerNoScale");
        }
    },
    methods: {
        ...mapActions("Modules/LayerTree", ["updateTransparency"]),
        ...mapActions("Modules/ThemeMaps", [
            "changeVisibility",
        ]),
        ...mapActions("Modules/LayerInformation", ["startLayerInformation"]),
        ...mapMutations("Modules/LayerSelection", ["setLayerInfoVisible"]),
        /**
         * Returns true, if layer configuration shall be shown in tree in current map mode.
         * Filteres by attribute 'showInLayerTree' and respects 'isNeverVisibleInTree' is not true.
         * @returns {Boolean} true, if layer configuration shall be shown in tree
         */
        show () {
            const showLayerTyp = this.mode === "2D" ? !layerFactory.getLayerTypes3d().includes(this.conf.typ?.toUpperCase()) : !layerFactory.getLayerTypesNotVisibleIn3d().includes(this.conf.typ?.toUpperCase());
            if (this.isLayerTree()) {
                return this.conf.showInLayerTree === true && showLayerTyp && this.conf.isNeverVisibleInTree !== true;
            }
            return showLayerTyp && this.conf.isNeverVisibleInTree !== true;
        },
        /**
         * Returns true, if this parent is a 'LayerTreeNode' in layer-tree and false if parent is 'LayerSelectionTreeNode' in layer-selection.
         * @returns {Boolean} true, if this parent is a 'LayerTreeNode' in layer-tree
         */
        isLayerTree () {
            return this.$parent.$options.name !== "LayerSelectionTreeNode";
        },
        /**
         * Returns true, if this layer is not visible in the maps current scale. Returns false, if this is not the layerTree or mode is '3D'.
         * @returns {Boolean}  true, if this layer is not visible in the maps current scale
         */
        scaleIsOutOfRange () {
            if (!this.isLayerTree() || this.conf.maxScale === undefined) {
                return false;
            }
            if (this.mode === "3D" && this.conf.visibility === true && (this.scale > parseInt(this.conf.maxScale, 10) || this.scale < parseInt(this.conf.minScale, 10))) {
                const layer = layerCollection.getLayerById(this.conf.id).layer;

                layer.setVisible(false);
            }
            else if (this.mode === "3D" && this.conf.visibility === true) {
                const layer = layerCollection.getLayerById(this.conf.id).layer;

                layer.setVisible(true);
            }

            return this.scale > parseInt(this.conf.maxScale, 10) || this.scale < parseInt(this.conf.minScale, 10);
        },
        toggleVisibility() {
            const layerConf = this.conf;
            if (layerConf.transparency === 100) {
                this.updateTransparency({layerConf, transparency: 0});
            }
            else {
                this.updateTransparency({layerConf, transparency: 100})
            }
        },
        /* openInfo(conf) {
            console.log("openInfo", conf);

            return
            this.startLayerInformation(conf);
            if (!this.isLayerTree) {
                // this.setLayerInfoVisible(true);
            }
        } */
    }
};
</script>

<template lang="html">
    <div :id="'layer-tree-layer-' + conf.id" class="draggable-wrapper">
        <div class="draggable-container">
            <div class="handle-layer-component-drag" :style="applyBorderStyle">
                <div ></div>
                <div ></div>
            </div>
            <!-- <div class="legend"></div> -->
            <p class="amarex-bold amarex-layer-tree-label">
                {{ conf.name }}
            </p>
            <div class="d-flex">
                <div class="clickable" @click="toggleVisibility">
                    <Eye
                        v-if="conf.transparency === 0"
                        :color="colors.amarex_secondary"
                        :size="24"
                        />
                    <EyeOff
                        v-else
                        :color="colors.amarex_secondary"
                        :size="24"
                    />
                </div>
                <div class="ani clickable" @click="openInfo(conf)" :style="{ transform: showInfo?.id === conf?.id ? 'rotate(90deg)' : 'rotate(0deg)' }">
                    <SquareChevronRight
                        :color="colors.amarex_secondary"
                        :size="24"
                    />
                </div>
            </div>
        </div>
        <div
            v-if="showToggle"
            :id="'collapse-sub-menu-' + conf.id.split('.').join('_')"
        >
            <LayerComponentSubMenuAmarex :layer-conf="conf" />
        </div>
    </div>
    
</template>

<style lang="scss" scoped>
    @import "~variables";
    @import "~mixins";

    .draggable-wrapper {
        @include radius();
        background: $amarex_primary;
        border: 1px solid $amarex_grey_mid;
        margin: 7.5px 0;
        .draggable-container {
            padding-right: 10px;
            gap: 20px;
            display: grid;
            // grid-template-columns: 30px 18px minmax(0, 1fr) 44px 44px;
            grid-template-columns: 30px minmax(0, 1fr) 88px;
            align-items: center;
            min-height: 55px;
            overflow: hidden;
            cursor: pointer;
            .handle-layer-component-drag {
                background: $amarex_grey_light;
                height: 100%;
                width: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 7.5px;
                cursor: grab;
                flex-direction: column;
                border-top-left-radius: 4px;
                border-bottom-left-radius: 4px;
                div {
                    background: $amarex_grey_mid;
                    height: 2px;
                    width: 15px;
                    margin: 2.5px 0;
                }
            }
            .legend {
                background: blue;
                border-radius: 100%;
                height: 18px;
                width: 18px;
            }
            .amarex-layer-tree-label {
                word-wrap: break-word;
                overflow-wrap: break-word;
                // @include transform-p();
                user-select: none;
                margin: 15px 0;
            }
        }
    }

    .chosen {
        .draggable-container {
            // color: $amarex_secondary;
            background-color: $amarex_secondary_light;
            // opacity: 0.5;
        }
    }
    .ani {
        transition: all 0.3s ease-in-out;
    }
</style>
