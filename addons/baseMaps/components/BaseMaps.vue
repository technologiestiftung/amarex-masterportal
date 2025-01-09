<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import { CircleCheckBig, LoaderCircle } from "lucide-vue-next";
import colors from "../../../src/shared/js/utils/amarex-colors.json";

export default {
  name: "BaseMaps",
  components: {
    CircleCheckBig,
    LoaderCircle,
  },
  data() {
    return {
      selectedBaseLayer: 0,
      colors,
    };
  },
  computed: {
    ...mapGetters("Maps", ["mode"]),
    ...mapGetters([
      "isMobile",
      "visibleBaselayerConfigs",
      "allBaselayerConfigs",
      "layerConfigsByAttributes",
      "allLayerConfigs",
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
        :class="{ selected: selectedBaseLayer === index }"
        @click="selectItem(layer, index)"
      >
        <!-- Masked Image -->
        <div
          class="preview-image"
          :style="{
            backgroundImage: `url(${layer.preview.src})`,
          }"
        ></div>
        <!-- Text Content -->
        <div class="text-container">
          <h5>
            {{ layer.name }}
          </h5>
          <p class="amarex-tooltips">
            {{ layer.preview.abstract }}
          </p>
        </div>

        <CircleCheckBig
          v-if="selectedBaseLayer === index"
          :color="colors.amarex_accent"
          :size="20"
        />
        <LoaderCircle
          v-else
          :color="colors.amarex_grey_mid"
          :size="20"
        />
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
  .base-layer-item {
    border: 1px solid $amarex_grey_mid;
    border-radius: 4px;
    display: grid;
    grid-template-columns: 90px minmax(100px, 1fr) 20px;
    align-items: center;
    gap: 20px;
    padding: 15px;
    cursor: pointer;
    user-select: none;
    margin: 3px;
    &.selected {
      border: 4px solid $amarex_accent;
      margin: 0;
      .circle {
        border: 4px solid $amarex_accent;
      }
    }
    .preview-image {
      width: 90px;
      height: 90px;
      border-radius: 4px;
      background-size: cover;
      background-position: center;
    }
    .text-container {
      overflow: hidden;
    }
    .circle {
      width: 20px;
      height: 20px;
      border: 1px solid $amarex_grey_mid;
      border-radius: 50%;
    }
  }
}
</style>

