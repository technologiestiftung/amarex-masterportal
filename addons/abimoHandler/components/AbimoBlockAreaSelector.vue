<script>
import AbimoSlider from "./AbimoSlider.vue";
import { mapGetters } from "vuex";

/**
 * AbimoBlockAreaSelector
 * @module modules/AbimoBlockAreaSelector
 */
export default {
  name: "AbimoBlockAreaSelector",
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
  methods: {},
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
      <p class="area">
        Anzahl Flächen: {{ accumulatedAbimoStats.featuresSelected }}
      </p>

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
              Math.round(accumulatedAbimoStats.maxSwaleConnected * 100).toFixed(
                0,
              )
            }}
            %</strong
          >
        </div>
      </div>
    </div>
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

