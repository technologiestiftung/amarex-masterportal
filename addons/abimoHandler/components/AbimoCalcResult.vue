<script>
import { mapActions, mapGetters } from "vuex";
import { EyeOff, EyeIcon, Settings, Map as MapIcon } from "lucide-vue-next";
import colors from "../../../src/shared/js/utils/amarex-colors.json";
import SliderItem from "../../../src/shared/modules/slider/components/SliderItem.vue";
/**
 * AbimoCalcResult
 * @module modules/AbimoCalcResult
 */
export default {
  name: "AbimoCalcResult",
  components: {
    EyeOff,
    EyeIcon,
    Settings,
    SliderItem,
    MapIcon,
  },
  props: {
    openInfoFromResults: {
      type: Function,
      required: true,
    },
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
      if (id === "abimo_result_infiltration") return "Infiltration";
      if (id === "abimo_evaporatio") return "Verdunstung";
      return "Abimo";
    },
  },
  data() {
    return {
      colors,
      resultLayers: [],
      selectedThemeMap: null,
    };
  },
  mounted() {
    // @Luise: Please check if these are the correct names of the needed result layers
    this.resultLayers = this.allLayerConfigs.filter(
      (layer) =>
        layer.id === "delta_w_wfs" ||
        layer.id === "rabimo_input_2020" ||
        layer.id === "abimo_result_infiltration" ||
        layer.id === "abimo_evaporatio",
    );
    //
    // @Luise: Do the layers need to be sorted?
    // If yes, adjust the sort function accordingly
    //
    /* .sort((a, b) => {
        if (a.id === "delta_w_wfs") return -1;
        if (b.id === "delta_w_wfs") return 1;
        return 0;
      }); */
    this.resultLayers.forEach((layer) => {
      const isLayerVisible = layer.visibility;
      if (!isLayerVisible) {
        this.changeVisibility({ layerId: layer.id, value: true });
      }
    });
  },
  computed: {
    ...mapGetters(["allLayerConfigs"]),
  },
};
</script>

<!-- @Luise: Please remove the Result Overlay on the Map -->

<template lang="html">
  <div class="result-container d-flex flex-column">
    <p class="title">Ergebnisse Berechnung</p>
    <!-- @Luise: Please add all the 4 missing [Ergebnis]-->
    <div
      class="stats-container d-flex justify-content-between w-100 align-items-center"
    >
      <p class="description">Oberflächenabfluss</p>
      <p class="description">[Ergebnis]</p>
    </div>
    <div
      class="stats-container d-flex justify-content-between w-100 align-items-center"
    >
      <p class="description">Infiltration</p>
      <p class="description">[Ergebnis]</p>
    </div>
    <div
      class="stats-container d-flex justify-content-between w-100 align-items-center"
    >
      <p class="description">Verdunstung</p>
      <p class="description">[Ergebnis]</p>
    </div>
    <div
      class="stats-container d-flex justify-content-between w-100 align-items-center last"
    >
      <p class="description">Delta ∆W</p>
      <p class="description">[Ergebnis]</p>
    </div>
    <span class="line"></span>
    <!-- @Luise: Please add all the missing XX value -->
    <p
      class="description"
      v-html="
        `Durch die von Ihnen vorgenommenen Planungs-maßnahmen würde sich der Wert <strong>∆W um ${'XX'}</strong> verändern.`
      "
    ></p>
    <p class="description">
      <strong>∆W</strong> bezeichnet die Abweichung vom natürlichen
      Wasser-haushalt in Prozent.
    </p>
    <div class="layer-container d-flex flex-column">
      <p class="title">Berechnete Ergebnislayer</p>
      <p class="description">
        Sie können nun die verschiedenen Ergebnislayer Ihrer Ansicht hinzufügen.
      </p>
      <span v-if="resultLayers.length > 0">
        <span
          v-for="(themeMap, themeMapIndex) in resultLayers"
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
              @click.stop="openInfoFromResults(themeMap)"
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
              :id="
                'layer-component-sub-menu-transparency-input-' + themeMap?.id
              "
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
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.result-container {
  gap: 16px;
  .stats-container {
    p {
      line-height: 20px;
    }
    &.last {
      margin-bottom: 16px;
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
  .line {
    height: 1px;
    width: 100%;
    background: $amarex_grey_mid;
  }
}
.title {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 700;
  line-height: 32px;
}
.layer-container {
  margin-top: 24px;
  gap: 8px;
}
.description {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
}
</style>

