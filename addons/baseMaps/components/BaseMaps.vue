<script>
import SearchBar from "../../../src/modules/searchBar/components/SearchBar.vue";
import LayerTree from "../../../src/modules/layerTree/components/LayerTree.vue";
import { mapGetters } from "vuex";
import layerFactory from "../../../src/core/layers/js/layerFactory";

/**
 * BaseMaps
 * @module modules/BaseMaps
 */
export default {
  name: "BaseMaps",
  components: {
    SearchBar,
    LayerTree,
  },
  data() {
    return {
      selectedBaseLayer: null,
    };
  },
  computed: {
    ...mapGetters("Maps", ["mode"]),
    ...mapGetters("Modules/LayerSelection", ["baselayerConfs"]),
    filteredBaseLayers() {
      return this.filterBaseLayer();
    },
  },
  methods: {
    filterBaseLayer() {
      if (this.mode === "3D") {
        return this.baselayerConfs.filter(
          (conf) =>
            !layerFactory
              .getLayerTypesNotVisibleIn3d()
              .includes(conf.typ?.toUpperCase()),
        );
      }
      console.log('[BaseMaps] this.baselayerConfs::', this.baselayerConfs);
      return this.baselayerConfs;
    },
  },
};
</script>

<template>
  <div class="base-layer-selection">
    <div class="base-layer-list">
      <div
        v-for="(layer, index) in filteredBaseLayers"
        :key="index"
        class="base-layer-item"
      >
        <input
          :id="'base-layer-' + layer.id"
          v-model="selectedBaseLayer"
          :value="layer.id"
          type="radio"
          name="base-layer"
        />
        <label
          :for="'base-layer-' + layer.id"
          class="base-layer-label"
        >
          <img
            :src="layer.thumbnail"
            :alt="layer.name"
            class="base-layer-thumbnail"
          />
          <span class="base-layer-name">{{ layer.name }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.base-layer-selection {
  background-color: #f8f9fa;
  padding: 15px;
}

.base-layer-selection-headline {
  margin-bottom: 15px;
}

.base-layer-list {
  display: flex;
  flex-direction: column;
}

.base-layer-item {
  margin-bottom: 10px;
}

.base-layer-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.base-layer-thumbnail {
  width: 50px;
  height: 50px;
  margin-right: 10px;
  border: 1px solid #ddd;
}

.base-layer-name {
  font-size: 14px;
}

input[type="radio"] {
  margin-right: 10px;
}
</style>
