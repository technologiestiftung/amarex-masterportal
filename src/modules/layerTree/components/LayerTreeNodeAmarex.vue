<script>
import draggable from "vuedraggable";
import {mapActions, mapGetters, mapMutations} from "vuex";
import Layer from "./LayerComponent.vue";
import LayerAmarex from "./LayerComponentAmarex.vue";
import {sortObjects} from "../../../shared/js/utils/sortObjects";
import {
    ToggleRight,
    ToggleLeft
} from "lucide-vue-next";
import colors from "../../../shared/js/utils/amarex-colors.json";

// CHANGED JS

/**
 * Representation of a node in layertree containing folders or layers.
 * @module modules/layerTree/components/LayerTreeNodeAmarex
 * @vue-data {Boolean} isOpen - Shows if node is open.
 * @vue-computed {Object} sortedLayerConfig - The v-model for sorted layerConfig.
 */
export default {
    name: "LayerTreeNodeAmarex",
    components: {
        Draggable: draggable,
        Layer,
        LayerAmarex,
        ToggleRight,
        ToggleLeft
    },
    data () {
        return {
            isOpen: false,
            showToggle: false,
            colors
        };
    },
    computed: {
        ...mapGetters(["portalConfig", "allLayerConfigs", "layerConfigsByAttributes", "showLayerAddButton"]),
        ...mapGetters("Modules/LayerTree", ["delay", "delayOnTouchOnly", "removeOnSpill", "touchStartThreshold"]),

        /**
         * v-model for sorted layerConfig.
         */
        sortedLayerConfig: {
            /**
             * Gets the layerconfigs sorted by zIndex.
             * @returns {void}
             */
            get () {
                let sortedLayerConfig;

                if (this.showLayerAddButton) {
                    sortedLayerConfig = this.layerConfigsByAttributes({showInLayerTree: true});
                }
                else {
                    sortedLayerConfig = this.allLayerConfigs;
                }
                sortObjects(sortedLayerConfig, "zIndex", "desc");

                return sortedLayerConfig;
            },
            /**
             * Sets the changed layer Configs order.
             * @param {Object[]} changedLayerConfig The layer configs with changed order
             * @returns {void}
             */
            set (changedLayerConfig) {
                let configLength = changedLayerConfig.length;

                changedLayerConfig.forEach(conf => {
                    conf.zIndex = --configLength;
                    this.replaceByIdInLayerConfig(conf);
                });
            }
        }
    },
    mounted () {
        const getCacheShowToggle = localStorage.getItem(
            "cacheShowToggle"
        );
        this.showToggle = getCacheShowToggle ? JSON.parse(getCacheShowToggle) : false;
        if (!this.showLayerAddButton) {
            this.setRemoveOnSpill(false);
        }
    },
    methods: {
        ...mapActions("Modules/LayerTree", ["removeLayer", "replaceByIdInLayerConfig"]),
        ...mapMutations("Modules/LayerTree", ["setRemoveOnSpill"]),

        /**
         * Indicates if a conf is a layer and showInlayerTree is true and isNeverVisibleInTree is not true
         * @param {Object} conf The current layer configuration.
         * @returns {void}
         */
        isLayerShowInLayerTree (conf) {
            return conf?.type === "layer" && conf?.showInLayerTree === true && conf?.isNeverVisibleInTree !== true;
        },

        /**
         * Returns a layer array element.
         * @param {Object} conf The current layer configuration.
         * @returns {void}
         */
        getLayerArray (conf) {
            return conf?.elements ? conf.elements.filter(el => el.type === "layer" && el.showInLayerTree === true) : [];
        },

        /**
         * Removes the spilled layer from layer tree if showLayerAddButton is true.
         * @param {Event} event The spill event.
         * @returns {void}
         */
        removeLayerOnSpill (event) {
            if (this.showLayerAddButton) {
                this.removeLayer(this.sortedLayerConfig[event.oldIndex]);
            }
        },

        toggleSettings () {
            this.showToggle = !this.showToggle;
        },
    },
    unmounted () {
        localStorage.setItem(
            "cacheShowToggle",
            JSON.stringify(this.showToggle),
        );
        this.setRemoveOnSpill(true);
    }
};
</script>

<template>
    <!-- eslint-disable vue/attribute-hyphenation -->
    <div class="amarex-themenkarten-toggle-settings-container" @click="toggleSettings" v-if="sortedLayerConfig.some((element) => !element.baselayer && element.parentId !== `folder-1` && element.visibility)">
        <p class="amarex-bold">Themekarten Einstellungen {{ showToggle ? "ausblenden" : "anzeigen" }}</p>
        <ToggleRight
            v-if="showToggle"
            :color="colors.amarex_secondary"
            :size="30"
            />
        <ToggleLeft
            v-else
            :color="colors.amarex_secondary_light"
            :size="30"
        />
    </div>
    <div v-else class="mt-4"></div>

    <p class="amarex-bold" v-if="!sortedLayerConfig.some((element) => !element.baselayer && element.parentId !== `folder-1` && element.visibility)">&ndash; Wählen Sie im unten stehenden Katalog Ebenen aus verschiedenen Themenkarten aus für Ihre Untersuchung. &ndash; </p>

    <Draggable
        v-model="sortedLayerConfig"
        class="dragArea no-list ps-0 ms-2"
        tag="ul"
        item-key="name"
        chosen-class="chosen"
        handle=".handle-layer-component-drag"
        :delay-on-touch-only="delayOnTouchOnly"
        :delay="delay"
        :touch-start-threshold="touchStartThreshold"
    >
        <template #item="{ element }">
            <li v-if="!element.baselayer && element.parentId !== `folder-1` && element.visibility">
                <LayerAmarex
                    :showToggle="showToggle"
                    :conf="element"
                />
            </li>
        </template>
    </Draggable>
</template>


<style lang="scss" scoped>
    @import "~variables";
    .no-list{
        list-style: none;
    }
    .amarex-themenkarten-toggle-settings-container {
        @include clickable();
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        p {
            max-width: calc(100% - 50px);
        }
    }
</style>
