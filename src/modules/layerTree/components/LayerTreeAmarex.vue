<script>
import {mapActions, mapMutations, mapGetters} from "vuex";
import LayerTreeNodeAmarex from "./LayerTreeNodeAmarex.vue";
import {treeBaselayersKey, treeSubjectsKey} from "../../../shared/js/utils/constants";
import sortBy from "../../../shared/js/utils/sortBy";

/**
 * Module to display the layers in menu.
 * @module modules/layerTree/components/LayerTree
 */
export default {
    name: "LayerTreeAmarex",
    components: {
        LayerTreeNodeAmarex
    },
    computed: {
        ...mapGetters(["allLayerConfigsStructured", "allLayerConfigs"]),
        ...mapGetters("Modules/LayerTree", ["menuSide"]),
        ...mapGetters("Modules/LayerSelection", {layerSelectionType: "type", layerSelectionName: "name"})
    },
    methods: {
        ...mapActions("Modules/LayerSelection", ["navigateForward"]),
        ...mapActions("Menu", ["changeCurrentComponent"]),
        ...mapMutations("Modules/LayerSelection", {setLayerSelectionVisible: "setVisible"}),
        /**
         * Sorts the configs by type: first folder, then layer.
         * @param {Array} configs list of layer and folder configs
         * @returns {Array} the sorted configs
         */
        sort (configs) {
            return sortBy(configs, (conf) => conf.type !== "folder");
        },
    },
    props: {
        openInfo: {
            type: Function,
            required: true
        },
        showInfo: {
            type: Object
        }
    }
};
</script>

<template lang="html">
    <LayerTreeNodeAmarex :openInfo="openInfo" :showInfo="showInfo" />
</template>
