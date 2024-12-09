<script>
import {mapActions, mapGetters} from "vuex";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";
import layerFactory from "../../../core/layers/js/layerFactory";
import SliderItem from "../../../shared/modules/slider/components/SliderItem.vue";
import {
    View,
    Trash2
} from "lucide-vue-next";
import colors from "../../../shared/js/utils/amarex-colors.json";

/**
 * Layer Component Sub Menu
 * @module modules/layerTree/components/LayerComponentSubMenu
 * @vue-prop {Object} layerConf - The current layer configuration.
 * @vue-computed {Number} transparency - Returns the transparency of the layer config.
 * @vue-computed {Number} supportedTransparency - Indicates if the layer type supports transparency settings.
 */
export default {
    name: "LayerComponentSubMenuAmarex",
    components: {
        FlatButton,
        SliderItem,
        View,
        Trash2
    },
    props: {
        /** current layer configuration */
        layerConf: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters(["folderById", "showFolderPath"]),
        /**
         * Returns the transparency of the layer config.
         * @returns {Number} Transparency of the layer config.
         */
        transparency () {
            return this.layerConf.transparency || 0;
        },

        /**
         * Indicates if the layer type supports transparency settings.
         * NOte: The type Tileset3D is supported.
         * @returns {Boolean} Supports transparency.
         */
        supportedTransparency () {
            const unSupportedLayerTypes = layerFactory.getLayerTypes3d().filter(layerType => layerType !== "TILESET3D");

            return !unSupportedLayerTypes.includes(this.layerConf.typ?.toUpperCase());
        }
    },
    methods: {
        ...mapActions("Modules/LayerTree", ["removeLayer", "updateTransparency"]),
        /**
         * Returns the names of all parent folders reversed and separated.
         * @returns {String} the names of all parent folders
         */
        getPath () {
            let names = [];

            if (this.showFolderPath === true) {
                this.getNamesOfParentFolder(this.layerConf.parentId, names);
                names = names.reverse();
            }
            return names.length > 0 ? names.join("/") : null;
        },
        /**
         * Looks up for the names of all parent folders.
         * @param {String} parentId id of the parent folder
         * @param {Array} names to store names
         * @returns {Array}  the names of all parent folders
         */
        getNamesOfParentFolder (parentId, names) {
            if (parentId !== undefined) {
                const parent = this.folderById(parentId);

                if (parent) {
                    names.push(parent.name);
                    this.getNamesOfParentFolder(parent.parentId, names);
                }
            }
            return names;
        }
    },
    data () {
        return {
            colors
        };
    }
};
</script>

<template lang="html">
    <div
        :id="'layer-component-sub-menu-' + layerConf.id"
        class="d-flex flex-column layer-component-sub-menu"
    >
        <div
            v-if="getPath()"
            class="ms-3"
        >
            <i class="bi-folder foldericon" />
            <span
                class="path"
            >
                {{ getPath() }}
            </span>
        </div>
        <div
            v-if="supportedTransparency"
            :id="'layer-component-icon-sub-menu-transparency-container-' + layerConf.id"
        >
            <div >
                <View
                    :color="colors.amarex_secondary"
                    :size="24"
                />
                <label
                    :for="'layer-component-sub-menu-transparency-input-' + layerConf.id"
                    class="transparency-label"
                >
                    Deckkraft
                </label
            ></div>
            <div class="slider-container d-flex align-items-center">
                <SliderItem
                    :id="'layer-component-sub-menu-transparency-input-' + layerConf.id"
                    :aria="$t('common:modules.aria.sliderAria') + `${100 - transparency}%`"
                    :label="`${100 - transparency}%`"
                    :value="100 - transparency"
                    :min="0"
                    :max="100"
                    :step="10"
                    :interaction="$event => updateTransparency({layerConf, transparency: 100 - parseInt($event.target.value, 10)})"
                />
            </div>
        </div>
        <div class="remove-layer-container d-flex align-items-center" @click="() => removeLayer(layerConf)">
            <Trash2
                :color="colors.amarex_secondary"
                :size="24"
                :style="{paddingRight: '0.5rem'}"
            />
            <span class="btn-texts">Ebene entfernen</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";
    .path{
        font-size: $font-size-sm;
        text-align: start;
    }
    .foldericon{
        font-size: 1.3rem;
        padding-right: 0.5rem;
    }
    .remove-layer-container {
        @include clickable();
        width: fit-content;
        span {
            // @include transform-p();
        }
    }
    .layer-component-sub-menu {
        font-size: $font-size-base;
        padding: 2rem;
        .transparency-label {
            padding-left: 10px;
        }
        button {
            margin: 0 !important;
        }
    }
</style>
