<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import mapCollection from "../../../src/core/maps/js/mapCollection";
import AbimoSlider from "./AbimoSlider.vue";
import Feature from "ol/Feature";
import { Select } from "ol/interaction";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { singleClick, never } from "ol/events/condition.js";

/**
 * AbimoBlockAreaSelectorAmarex
 * @module modules/AbimoBlockAreaSelectorAmarex
 */
export default {
  name: "AbimoBlockAreaSelectorAmarex",
  data() {
    return {
      layer: null,
      selectedCount: 0,
    };
  },
  components: {
    AbimoSlider,
  },
  computed: {
    ...mapGetters("Modules/AbimoHandler", [
      "selectedFeatures",
      "accumulatedAbimoStats",
      "areaTypesData",
      "selectInteraction",
    ]),
  },
  mounted() {
    this.createInteractions();
    this.layer_abimo_calculated = mapCollection
      .getMap("2D")
      .getLayers()
      .getArray()
      .find((layer) => layer.get("id") === "planung_abimo");
  },
  methods: {
    ...mapActions("Maps", {
      addInteractionToMap: "addInteraction",
      removeInteractionFromMap: "removeInteraction",
    }),
    ...mapActions("Modules/AbimoHandler", ["updateAccumulatedStats"]),
    ...mapMutations("Modules/AbimoHandler", [
      "setSelectedFeatures",
      "setSelectInteraction",
    ]),
    createInteractions: function () {
      // From open layers we imported the Select class. This adds the possibility to add "blocks" to our feature layer. For further info check OpenLayers Docs
      const selectInteraction = new Select({
        multi: true,
        condition: singleClick,
        addCondition: singleClick,
        removeCondition: singleClick,
        // Disable the default toggle behavior
        toggleCondition: never,
        layers: function (layer) {
          return layer.get("id") === "rabimo_input_2020";
        },
      });

      // Add the interaction to the components methods
      this.setSelectInteraction(selectInteraction);

      // Checks for condition "is selected" loads data from abimo and rabimo_input and creates a merged feature out of them
      selectInteraction.on("select", (event) => {
        event.selected.forEach((feature) => {
          const inputFeature = new Feature({
            geometry: feature.getGeometry(),
            ...feature.getProperties(),
          });
          this.selectedFeatures.push(inputFeature);
          this.setSelectedFeatures(this.selectedFeatures);
          this.selectedCount++;
        });

        event.deselected.forEach((feature) => {
          const featureCode = feature.values_.code;
          this.selectedCount--;
          if (!this.selectedCount) {
            this.selectedFeatures.splice(0, this.selectedFeatures.length);
          } else {
            this.selectedFeatures.filter((f) => f.values_.code !== featureCode);
          }
          this.setSelectedFeatures(this.selectedFeatures);
        });

        this.updateAccumulatedStats();
      });
      // registers interaction in module - check masterportal docu
      this.addInteractionToMap(selectInteraction);
    },
    handleBlockAreaConfirm() {
      const olFeatures = this.selectedFeatures.map((featureData) => {
        return new Feature({
          ...featureData.values_,
          geometry: featureData.getGeometry(),
        });
      });

      for (const feature of olFeatures) {
        feature.setStyle(
          new Style({
            stroke: new Stroke({
              color: `rgba(84, 187, 168, 1)`,
              width: 2,
            }),
            fill: new Fill({
              color: `rgba(84, 187, 168, 0.4)`,
            }),
          }),
        );
      }
      this.layer_abimo_calculated.values_.source.addFeatures(olFeatures);
      this.removeInteractionFromMap(this.selectInteraction);
    },
  },
};
</script>

<template lang="html">
  <div class="block-selector-container w-100 d-flex flex-column">
    <span>
      <p class="title">Status Quo</p>
      <p class="description">
        Hier wird Ihnen die aktuelle Verteilung der unversiegelten, bebaut
        versiegelten und unbebaut versiegelten Flächen in Ihrem ausgewählten
        Gebiet angezeigt.
      </p>
    </span>
    <span></span>
    <span>
      <AbimoSlider :areaTypes="areaTypesData" />
      <div class="d-flex justify-content-between area">
        <p class="description-with-bigger-lineheight">Gesamtfläche</p>
        <p class="description-with-bigger-lineheight">
          {{ accumulatedAbimoStats.totalArea.toFixed(0) }}m²
        </p>
      </div>
    </span>
    <span class="line"></span>
    <div
      v-for="(areaType, index) in areaTypesData"
      :key="index"
      class="stats-wrapper d-flex justify-content-center"
    >
      <div :class="['color-indicator', `${areaType.id}`]"></div>
      <div
        class="stats-container d-flex justify-content-between w-100 align-items-center"
      >
        <p>{{ areaType.name }}</p>
        <p>{{ Math.round(areaType.max * 100).toFixed(0) }} %</p>
      </div>
    </div>
    <span class="line"></span>
    <span>
      <p class="title">Gründächer</p>
      <p class="description">Anteil der Gründächer im ausgewählten Bereich</p>
    </span>
    <div
      class="stats-container d-flex justify-content-between w-100 align-items-center"
    >
      <p>% von Dachfläche</p>
      <p>
        {{
          Math.round(accumulatedAbimoStats.maxGreenRoofToRoof * 100).toFixed(0)
        }}
        %
      </p>
    </div>
    <div
      class="stats-container d-flex justify-content-between w-100 align-items-center last"
    >
      <p>% von Gesamtfläche</p>
      <p>
        {{ Math.round(accumulatedAbimoStats.meanGreenRoof * 100).toFixed(0) }}
        %
      </p>
    </div>
    <span class="line"></span>
    <span>
      <p class="title">Mulden</p>
      <p class="description">
        Anteil der an Mulden angeschlossenen Flächen im ausgewählten Bereich
      </p>
    </span>
    <div
      class="stats-container d-flex justify-content-between w-100 align-items-center"
    >
      <p>% versiegelter Fläche</p>
      <p>
        {{
          Math.round(
            accumulatedAbimoStats.maxSwaleConnectedToPvd * 100,
          ).toFixed(0)
        }}
        %
      </p>
    </div>
    <div
      class="stats-container d-flex justify-content-between w-100 align-items-center last"
    >
      <p>% von Gesamtfläche</p>
      <p>
        {{
          Math.round(accumulatedAbimoStats.meanSwaleConnected * 100).toFixed(0)
        }}
        %
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.block-selector-container {
  margin-top: 32px;
  gap: 16px;
  .area {
    margin-top: 8px;
  }
  .abimo-slider-bar {
    background-color: $amarex_grey_light !important;
  }
  .stats-wrapper {
    gap: 10px;
    .color-indicator {
      width: 24px;
      height: 24px;
      border: 2px solid;
      flex-shrink: 0;
    }
    .unpvd {
      background-color: $amarex_extras_lightgreen;
      border-color: $amarex_extras_darkgreen;
    }
    .roof {
      background-color: $amarex_extras_lightred;
      border-color: $amarex_extras_darkred;
    }
    .pvd {
      background-color: $amarex_extras_lightyellow;
      border-color: $amarex_extras_darkyellow;
    }
  }
  .stats-container {
    p {
      font-size: 16px;
      font-weight: 400;
      line-height: 16px;
    }
    &.last {
      margin-bottom: 8px;
    }
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
.description {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
}
.description-with-bigger-lineheight {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 400;
  line-height: 32px;
}
</style>

