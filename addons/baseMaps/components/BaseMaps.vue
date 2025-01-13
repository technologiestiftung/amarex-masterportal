<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import colors from "../../../src/shared/js/utils/amarex-colors.json";

export default {
  name: "BaseMaps",
  data() {
    return {
      selectedBaseLayer: 0,
      colors,
    };
  },
  computed: {
    ...mapGetters("Maps", ["mode"]),
    ...mapGetters([
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
    const baselayerConfigIds = [];
    const baselayers = this.layerConfigsByAttributes({
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
    ...mapActions("Modules/BaseMaps", ["updateLayerVisibilityAndZIndex"]),
    ...mapActions("Modules/LayerSelection", ["changeVisibility"]),
    switchActiveBaselayer(layerId) {
      const selectableBackroundLayerIds = this.baselayerIds;
      this.updateLayerVisibilityAndZIndex(layerId);
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
    selectItem(layer, index) {
      this.switchActiveBaselayer(layer.id);
      this.selectedBaseLayer = index;
    },
  },
  mounted() {
    const objectWithHighestZIndex = this.visibleBaselayerConfigs.reduce(
      (max, current) => {
        return current.zIndex > max.zIndex ? current : max;
      },
      this.visibleBaselayerConfigs[0],
    );
    this.selectedBaseLayer = this.allBaselayerConfigs.findIndex(
      (layer) => layer.id === objectWithHighestZIndex.id,
    );
  },
};
</script>

<template>
  <div class="base-layer-selection">
    <div class="base-layer-list">
      <div
        v-for="(layer, index) in this.allBaselayerConfigs"
        :key="index"
        class="base-layer-item"
        :class="{
          selected: selectedBaseLayer === index,
        }"
        @click="selectItem(layer, index)"
      >
        <div class="circle">
          <div v-if="selectedBaseLayer === index"></div>
        </div>
        <!-- Text Content -->
        <div class="text-container">
          <h5>
            {{ layer?.preview?.title || layer.name }}
          </h5>
          <p v-if="!!layer?.preview?.abstract">
            {{ layer?.preview?.abstract }}
          </p>
        </div>
        <!-- Masked Image -->
        <div
          class="preview-image"
          :style="{
            backgroundImage: `url(${layer.preview.src})`,
          }"
        ></div>
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
  gap: 24px;
  .base-layer-item {
    border-bottom: 2px solid $amarex_grey_light;
    border-left: 2px solid $primary;
    border-right: 2px solid $primary;
    border-top: 2px solid $primary;
    display: grid;
    grid-template-columns: 26px minmax(100px, 1fr) 56px;
    align-items: center;
    gap: 16px;
    padding: 16px 10px 16px 16px;
    cursor: pointer;
    user-select: none;
    &.selected {
      border: 2px solid $amarex_secondary;
      .circle {
        border: 2px solid $amarex_secondary;
        display: flex;
        justify-content: center;
        align-items: center;
        div {
          background-color: $amarex_secondary;
          width: 14px;
          height: 14px;
          border-radius: 50%;
        }
      }
    }
    .preview-image {
      width: 56px;
      height: 80px;
      background-size: cover;
      background-position: center;
    }
    .text-container {
      overflow: hidden;
      h5 {
        color: $amarex_secondary;
        font-family: Arial;
        font-size: 16px;
        font-style: normal;
        font-weight: 700;
        line-height: 16px;
        margin-bottom: 4px;
      }
      p {
        overflow: hidden;
        color: $amarex_grey_mid;
        // text-overflow: ellipsis;
        // white-space: nowrap;
        font-family: Arial;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 16px;
      }
    }
    .circle {
      width: 26px;
      height: 26px;
      border: 2px solid $amarex_grey_mid;
      border-radius: 50%;
    }
  }
}
</style>

