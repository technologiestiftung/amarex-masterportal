<script>
import { mapActions, mapGetters } from "vuex";
import {
  ChevronDown,
  EyeOff,
  EyeIcon,
  Settings,
  Map as MapIcon,
} from "lucide-vue-next";
import colors from "../../../src/shared/js/utils/amarex-colors.json";
import SliderItem from "../../../src/shared/modules/slider/components/SliderItem.vue";

/**
 * Abimo
 * @module modules/PreComputedModelsAmarex
 */
export default {
  name: "PreComputedModelsAmarex",
  components: {
    ChevronDown,
    EyeOff,
    EyeIcon,
    Settings,
    SliderItem,
    MapIcon,
  },
  props: {
    openInfo: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      colors,
      preComputedModelsShown: true,
      preComputedModels: [],
      selectedThemeMap: null,
    };
  },
  methods: {
    ...mapActions("Modules/LayerSelection", ["changeVisibility"]),
    ...mapActions("Modules/LayerTree", ["updateTransparency"]),
    themeMapClick(conf) {
      const isLayerVisible = conf.visibility;
      this.changeVisibility({ layerId: conf.id, value: !isLayerVisible });
    },
    updateTransparencyOfSelectedThemeMap($event) {
      this.updateTransparency({
        layerConf: this.selectedThemeMap,
        transparency: 100 - parseInt($event.target.value, 10),
      });
    },
    openTransparencySubMenu(themeMap) {
      if (!themeMap.visibility) return;
      if (this.selectedThemeMap?.id === themeMap.id) {
        this.selectedThemeMap = null;
      } else {
        this.selectedThemeMap = themeMap;
      }
    },
    setNames(id) {
      // @Luise: Please check if these are the correct names of the needed result layers
      if (id === "delta_w_wfs")
        return "∆W - Abweichung vom natürlichen Wasserhaushalt";
      return "Abimo";
    },
  },
  computed: {
    ...mapGetters(["allLayerConfigs"]),
  },
  mounted() {
    // @Luise: Please check if these are the correct names of the needed result layers
    this.preComputedModels = this.allLayerConfigs
      .filter(
        (layer) =>
          layer.id === "delta_w_wfs" || layer.id === "rabimo_input_2020",
      )
      .sort((a, b) => {
        if (a.id === "delta_w_wfs") return -1;
        if (b.id === "delta_w_wfs") return 1;
        return 0;
      });
    this.preComputedModels.forEach((layer) => {
      const isLayerVisible = layer.visibility;
      if (!isLayerVisible) {
        this.changeVisibility({ layerId: layer.id, value: true });
      }
    });
  },
};
</script>

<template lang="html">
  <div class="precomputedmodels-container">
    <div
      class="toggle-container d-flex justify-content-between align-items-center"
      :class="{ active: preComputedModelsShown }"
      @click="preComputedModelsShown = !preComputedModelsShown"
    >
      <p class="title">Vorberechnete Modelle</p>
      <ChevronDown
        :color="colors.amarex_secondary"
        :size="20"
      />
    </div>
    <span v-if="preComputedModels.length > 0 && preComputedModelsShown">
      <span
        v-for="(themeMap, themeMapIndex) in preComputedModels"
        :key="themeMapIndex"
      >
        <div
          class="theme-map"
          :class="{
            'theme-map-active': selectedThemeMap?.id === themeMap?.id,
          }"
        >
          <button @click="themeMapClick(themeMap)">
            <EyeOff
              v-if="themeMap?.visibility"
              :color="colors.amarex_secondary"
              :size="20"
            />
            <EyeIcon
              v-else
              :color="colors.amarex_secondary"
              :size="20"
            />
          </button>
          <p
            class="thememap-name"
            v-html="setNames(themeMap?.id)"
          ></p>
          <button @click="openTransparencySubMenu(themeMap)">
            <Settings
              :color="
                themeMap.visibility
                  ? colors.amarex_secondary
                  : colors.amarex_grey_light
              "
              :size="20"
            />
          </button>
          <button
            v-if="themeMap?.legend && typeof themeMap?.legend !== 'boolean'"
            @click.stop="openInfo(themeMap)"
          >
            <MapIcon
              :color="colors.amarex_secondary"
              :size="20"
            />
          </button>
        </div>
        <div
          class="theme-map-sub"
          v-if="themeMap?.id === selectedThemeMap?.id"
        >
          <p>Deckkraft:</p>
          <SliderItem
            :id="'layer-component-sub-menu-transparency-input-' + themeMap?.id"
            :aria="
              $t('common:modules.aria.sliderAria') +
              `${100 - themeMap?.transparency}%`
            "
            :label="`${100 - themeMap?.transparency}%`"
            :value="100 - themeMap?.transparency"
            :min="0"
            :max="100"
            :step="10"
            :interaction="updateTransparencyOfSelectedThemeMap"
          />
        </div>
      </span>
    </span>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.title {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 700;
  line-height: 32px;
}
.description {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
}
.precomputedmodels-container {
  border-bottom: 1px solid $amarex_grey_mid;
  padding-bottom: 16px;
  .toggle-container {
    cursor: pointer;
    svg {
      transition: transform 0.3s ease-in-out;
    }
    &.active {
      margin-bottom: 16px;
      svg {
        transform: rotate(180deg);
      }
    }
  }
  .theme-map {
    border: 1px solid $amarex_grey_light !important;
    padding: 12px 16px !important;
    display: flex;
    align-items: center;
    gap: 8px;
    svg {
      cursor: pointer;
    }
    &.theme-map-active {
      background-color: $amarex_secondary_mid;
      border-bottom: 1px solid $amarex_secondary_mid !important;
    }
    .thememap-name {
      font-size: 16px !important;
      font-weight: 700 !important;
      user-select: none;
      margin-right: auto;
    }
    button {
      border: none !important;
      padding: 4px !important;
      background: none !important;
      margin: 0 !important;
    }
  }
  .theme-map-sub {
    padding: 0 16px 12px 16px;
    background: $amarex_secondary_mid;
    display: flex;
    align-items: center;
    gap: 8px;
    border-left: 1px solid $amarex_grey_light !important;
    border-right: 1px solid $amarex_grey_light !important;
    border-bottom: 1px solid $amarex_grey_light !important;
    border-top: 1px solid $amarex_secondary_mid !important;
  }
}
</style>

