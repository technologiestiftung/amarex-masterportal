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
      // allen Content ändern in portal/amarex/resources/services-internet.json
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
      // console.log("this.allBaselayerConfigs :>> ", this.allBaselayerConfigs);
      this.switchActiveBaselayer(layer.id);
      this.selectedBaseLayer = index;
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
            {{ "Das ist der Beschreibungstext der Ebene" }}
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

        <!-- Selection Indicator -->
        <!-- <div class="indicator">
          <div class="circle"></div>
        </div> -->
      </div>
      <!-- <div
        v-for="(layer, index) in this.allBaselayerConfigs"
        :key="index"
        class="base-layer-item d-flex flex-column gap-3"
      >
        <div>
          <img
            :src="
              layer.preview.src
                ? layer.preview.src
                : `https://picsum.photos/id/237/200/300`
            "
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
      </div> -->
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
    grid-template-columns: 75px minmax(100px, 1fr) 20px;
    align-items: center;
    gap: 10px;
    padding: 20px;
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
      width: 75px;
      height: 75px;
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

