<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import { EyeOff, EyeIcon, Settings, Map as MapIcon } from "lucide-vue-next";
import colors from "../../../src/shared/js/utils/amarex-colors.json";
import SliderItem from "../../../src/shared/modules/slider/components/SliderItem.vue";

/**
 * AbimoResult
 * @module modules/AbimoResult
 */
export default {
  name: "AbimoResult",
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
  data() {
    return {
      colors,
      selectedThemeMap: null,
    };
  },
  computed: {
    ...mapGetters(["allLayerConfigs"]),
    ...mapGetters("Modules/AbimoHandler", [
      "resultAbimoStats",
      "resultLayers",
      "preComputedStats",
    ]),
  },
  mounted() {
    this.setPreComputedModelsShown(false);

    if (this.resultLayers.length === 0) {
      // result layers
      let resultLayers = this.allLayerConfigs.filter(
        (layer) =>
          layer.id === "abimo_result_delta_w" ||
          layer.id === "abimo_result_surface_run_off" ||
          layer.id === "abimo_result_infiltration" ||
          layer.id === "abimo_result_evaporation",
      );
      resultLayers.forEach((layer) => {
        const isLayerVisible = layer.visibility;
        if (!isLayerVisible) {
          this.changeVisibility({ layerId: layer.id, value: true });
        }
      });
      this.setResultLayers(resultLayers);
    }
  },
  methods: {
    ...mapActions("Modules/LayerSelection", ["changeVisibility"]),
    ...mapActions("Modules/LayerTree", ["updateTransparency"]),
    ...mapMutations("Modules/AbimoHandler", [
      "setPreComputedModelsShown",
      "setResultLayers",
    ]),
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
  },
};
</script>

<template lang="html">
  <div class="result-container d-flex flex-column">
    <p class="title">Ergebnisse Berechnung</p>

    <div class="comparison-table">
      <!-- Header row -->
      <div class="comparison-header">
        <div class="metric-label"></div>
        <div class="status-quo-header">Status Quo</div>
        <div class="berechnung-header">Berechnung</div>
      </div>

      <!-- Data rows -->
      <div class="comparison-row">
        <div class="metric-label">∆W</div>
        <div class="status-quo-value">
          {{ this.preComputedStats.deltaW.toFixed(1) }} %
        </div>
        <div class="berechnung-value">
          {{ this.resultAbimoStats.deltaW.toFixed(1) }} %
        </div>
      </div>

      <div class="comparison-row">
        <div class="metric-label">Verdunstung</div>
        <div class="status-quo-value">
          {{ this.preComputedStats.evaporation.toFixed(0) }} mm/Jahr
        </div>
        <div class="berechnung-value">
          {{ this.resultAbimoStats.evaporation.toFixed(0) }} mm/Jahr
        </div>
      </div>

      <div class="comparison-row">
        <div class="metric-label">Infiltration</div>
        <div class="status-quo-value">
          {{ this.preComputedStats.infiltration.toFixed(0) }} mm/Jahr
        </div>
        <div class="berechnung-value">
          {{ this.resultAbimoStats.infiltration.toFixed(0) }} mm/Jahr
        </div>
      </div>

      <div class="comparison-row">
        <div class="metric-label">Oberflächenabfluss</div>
        <div class="status-quo-value">
          {{ this.preComputedStats.runoff.toFixed(0) }} mm/Jahr
        </div>
        <div class="berechnung-value">
          {{ this.resultAbimoStats.runoff.toFixed(0) }} mm/Jahr
        </div>
      </div>
    </div>

    <span class="line"></span>
    <div>
      <p
        class="description"
        v-html="
          `Durch die von Ihnen vorgenommenen Planungsmaßnahmen würde sich der Wert ∆W von <strong>${this.preComputedStats.deltaW.toFixed(1)}%</strong> auf <strong>${this.resultAbimoStats.deltaW.toFixed(1)}% </strong> verändern.`
        "
      ></p>
    </div>

    <div>
      <p class="description">
        <strong>∆W</strong> bezeichnet die Abweichung vom natürlichen
        Wasserhaushalt in Prozent.
      </p>
    </div>

    <div class="layer-container d-flex flex-column">
      <p class="title">Berechnete Ergebnislayer</p>
      <p class="description">
        Sie können nun die verschiedenen Ergebnislayer Ihrer Ansicht hinzufügen.
      </p>
      <div
        v-if="resultLayers.length > 0"
        class="d-flex flex-column-reverse"
      >
        <div
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
              <EyeIcon
                v-if="themeMap?.visibility"
                :color="colors.amarex_secondary"
                :size="20"
              />
              <EyeOff
                v-else
                :color="colors.amarex_secondary"
                :size="20"
              />
            </button>
            <p
              class="thememap-name"
              v-html="themeMap.name"
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
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.result-container {
  gap: 16px;

  .comparison-table {
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .comparison-header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    > div {
      text-align: end;
      font-weight: 700;
      color: $amarex_secondary;

      &:first-child {
        text-align: end;
        color: $amarex_secondary;
        background-color: transparent;
      }
    }
  }

  .comparison-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    &:last-child {
      border-bottom: none;
    }
    > div {
      font-size: 16px;
      line-height: 20px;
      color: $amarex_secondary;
    }

    .metric-label {
      color: $amarex_secondary;
    }

    .status-quo-value {
      text-align: end;
      color: $amarex_secondary;
    }

    .berechnung-value {
      text-align: end;
      color: $amarex_secondary;
    }
  }

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

