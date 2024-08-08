<script>
import { mapGetters, mapMutations, mapActions } from "vuex";

export default {
  name: "BaseMaps",
  data() {
    return {
      selectedBaseLayer: null,
    };
  },
  computed: {
    ...mapGetters("Maps", ["mode"]),
    ...mapGetters("Modules/LayerSelection", ["visible", "baselayerConfs"]),
    ...mapGetters([
      "allBaselayerConfigs",
      "isMobile",
      "visibleBaselayerConfigs",
      "allBaselayerConfigs",
      "layerConfigsByAttributes",
    ]),
    ...mapGetters("Modules/BaseMaps", [
      "active",
      "baselayerIds",
      "topBaselayerId",
    ]),
  },
  watch: {
    visibleBaselayerConfigs: {
      handler(newVal) {
        const baselayerConfigIds = Object.values(this.allBaselayerConfigs).map(
          (layer) => layer.id,
        );
        let maxZIndex = null,
          topLayer = null;

        newVal.forEach((val) => {
          maxZIndex = Math.max(maxZIndex, val.zIndex);
          if (val.zIndex === maxZIndex) {
            topLayer = val;
          }
        });

        if (topLayer?.id !== undefined) {
          const baselayerIds = baselayerConfigIds.filter(
            (layerId) => layerId !== topLayer.id,
          );
          this.setTopBaselayerId(topLayer.id);
          this.setBaselayerIds(baselayerIds);
        } else {
          this.setTopBaselayerId(null);
          this.setBaselayerIds(baselayerConfigIds);
        }
      },
      deep: true,
    },
  },
  created() {
    const baselayerConfigIds = [],
      baselayers = this.layerConfigsByAttributes({
        baselayer: true,
        showInLayerTree: true,
      });

    if (baselayers.length > 1) {
      const maxZIndexLayer = baselayers.reduce((max, layer) =>
        layer.zIndex > max.zIndex ? layer : max,
      );
      this.setTopBaselayerId(maxZIndexLayer.id);
    } else if (baselayers.length === 0) {
      this.setTopBaselayerId(null);
    } else {
      this.setTopBaselayerId(baselayers[0].id);
    }

    baselayerConfigIds.push(
      ...Object.values(this.allBaselayerConfigs)
        .filter((layer) => layer.id !== this.topBaselayerId)
        .map((layer) => layer.id),
    );
    this.setBaselayerIds(baselayerConfigIds);
  },
  methods: {
    ...mapMutations("Modules/BaseMaps", [
      "setBaselayerIds",
      "setTopBaselayerId",
    ]),
    ...mapMutations(["setBaselayerVisibility"]),
    ...mapActions("Modules/BaseMaps", ["updateLayerVisibilityAndZIndex"]),

    switchActiveBaselayer(layerId) {
      this.updateLayerVisibilityAndZIndex(layerId);

      const selectableBackroundLayerIds = this.baselayerIds;
      selectableBackroundLayerIds.splice(
        selectableBackroundLayerIds.indexOf(layerId),
        1,
      );
      if (this.topBaselayerId !== null) {
        selectableBackroundLayerIds.push(this.topBaselayerId);
      }
      this.setBaselayerIds(selectableBackroundLayerIds);

      this.setTopBaselayerId(layerId);
    },
  },
};
</script>

<template>
  <div class="base-layer-selection">
    <div class="base-layer-list">
      <div
        v-for="(layer, index) in this.allBaselayerConfigs"
        :key="index"
        class="base-layer-item d-flex flex-column gap-3"
      >
        <div>
          <img
            :src="`https://picsum.photos/id/237/200/300`"
            :alt="layer.name"
            class="base-layer-thumbnail"
          />
          <span class="base-layer-name pl-3">{{ layer.name }}</span>
        </div>
        <button
          class="btn btn-primary"
          @click="switchActiveBaselayer(layer.id)"
        >
          <span class="pl-2">Diese Karte wählen</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.base-layer-selection {
  padding: 4px;
}

.base-layer-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.base-layer-item {
  padding: 12px;
  background-color: #ececed;
  border: solid 1px #e4e4e4;
}

.base-layer-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.base-layer-thumbnail {
  width: 35px;
  height: 30px;
  margin-right: 10px;
  overflow: hidden;
  border-radius: 4px;
  object-fit: cover;
}

.base-layer-name {
  font-size: 14px;
}

input[type="radio"] {
  margin-right: 10px;
}
</style>

