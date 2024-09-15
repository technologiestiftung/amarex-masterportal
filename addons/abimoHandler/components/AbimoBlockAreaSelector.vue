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
 * AbimoBlockAreaSelector
 * @module modules/AbimoBlockAreaSelector
 */
export default {
  name: "AbimoBlockAreaSelector",

  data() {
    return {
      selectInteraction: null,
      layer: null,
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
    ...mapActions("Modules/AbimoHandler", [
      "updateAccumulatedStats",
      "updateAccordionSteps",
    ]),
    ...mapMutations("Modules/AbimoHandler", ["setSelectedFeatures"]),

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
      this.selectInteraction = selectInteraction;

      // Checks for condition "is selected" loads data from abimo and rabimo_input and creates a merged feature out of them
      selectInteraction.on("select", (event) => {
        event.selected.forEach((feature) => {
          const inputFeature = new Feature({
            geometry: feature.getGeometry(),
            ...feature.getProperties(),
          });
          this.selectedFeatures.push(inputFeature);
          this.setSelectedFeatures(this.selectedFeatures);
        });

        event.deselected.forEach((feature) => {
          const featureCode = feature.values_.code;
          this.selectedFeatures = this.selectedFeatures.filter(
            (f) => f.values_.code !== featureCode,
          );
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
      this.updateAccordionSteps(3);
    },
  },
};
</script>

<template lang="html">
  <div
    id="AbimoBlockAreaSelector-root"
    class="w-100"
  >
    <div class="area-types-visualization w-100">
      <AbimoSlider :areaTypes="areaTypesData" />

      <p class="area">
        GESAMTFLÄCHE: {{ accumulatedAbimoStats.totalArea.toFixed(0) }} m²
      </p>
      <!-- <p class="area">
        Anzahl Flächen: {{ accumulatedAbimoStats.featuresSelected }}
      </p> -->

      <hr />

      <div class="area-types-legend d-flex flex-column w-100">
        <div
          v-for="(areaType, index) in areaTypesData"
          :key="index"
          class="legend-item"
        >
          <div :class="['color-indicator mr-3', `${areaType.id}`]"></div>
          <div class="stats-display">
            <span>{{ areaType.name }}</span>
            <strong>{{ Math.round(areaType.max * 100).toFixed(0) }} %</strong>
          </div>
        </div>
      </div>

      <hr />

      <!-- Green Roofs -->
      <div class="stats-container green-roofs">
        <h6>GRÜNDÄCHER</h6>
        <div class="stats-display">
          <span>% VON DACHFLÄCHE</span>
          <strong
            >{{
              Math.round(
                accumulatedAbimoStats.maxGreenRoofToRoof * 100,
              ).toFixed(0)
            }}
            %</strong
          >
        </div>
        <div class="stats-display">
          <span>% VON GESAMTFLÄCHE</span>
          <strong
            >{{
              Math.round(accumulatedAbimoStats.meanGreenRoof * 100).toFixed(0)
            }}
            %</strong
          >
        </div>
      </div>

      <hr />

      <!-- Disconnected -->

      <div class="stats-container disconnected-areas">
        <p>AN MULDE ANGESCHLOSSEN</p>
        <div class="stats-display">
          <span>% VERSIEGELTER FLÄCHE</span>
          <strong
            >{{
              Math.round(
                accumulatedAbimoStats.maxSwaleConnectedToPvd * 100,
              ).toFixed(0)
            }}
            %</strong
          >
        </div>
        <div class="stats-display">
          <span>% VON GESAMTFLÄCHE</span>
          <strong
            >{{
              Math.round(
                accumulatedAbimoStats.meanSwaleConnected * 100,
              ).toFixed(0)
            }}
            %</strong
          >
        </div>
      </div>
    </div>
    <button
      class="btn btn-primary mt-5"
      @click="handleBlockAreaConfirm"
    >
      Bestätigen
    </button>
  </div>
</template>

<style lang="scss" scoped>
.area {
  margin-top: 12px;
}
.area-types-visualization {
  margin-top: 20px;
}

.area-types-legend {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.color-indicator {
  width: 20px;
  height: 20px;
  margin-right: 15px;
  border: 2px solid;
}
.unpvd {
  background-color: #53c486;
  border-color: #2e9f61;
}
.roof {
  background-color: #d17b7b;
  border-color: #971f1f;
}
.pvd {
  background-color: #dfdf6b;
  border-color: #b4b446;
}

.stats-container {
  margin-top: 20px;
  margin-left: 20px;
}
.stats-display {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
</style>

