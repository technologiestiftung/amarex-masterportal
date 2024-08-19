<script>
import AbimoSlider from "./AbimoSlider.vue";
import { mapActions, mapGetters } from "vuex";

/**
 * AbimoBlockAreaSelector
 * @module modules/AbimoBlockAreaSelector
 */
export default {
  name: "AbimoBlockAreaSelector",
  components: {
    AbimoSlider,
  },
  data() {
    return {
      areaTypesData: [
        { name: "UNVERSIEGELT", percentage: 0, color: "#4CAF50" },
        { name: "BEBAUT VERSIEGELT", percentage: 0, color: "#F44336" },
        { name: "UNBEBAUT VERSIEGELT", percentage: 0, color: "#FFC107" },
      ],
    };
  },
  computed: {
    ...mapGetters("Modules/AbimoHandler", [
      "selectedFeatures",
      "accumulatedAbimoStats",
    ]),
  },
  mounted() {},
  methods: {
    ...mapActions("Modules/AbimoHandler", ["calculatePercentages"]),
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

      <hr />

      <div class="area-types-legend d-flex flex-column w-100">
        <div
          v-for="(areaType, index) in areaTypesData"
          :key="index"
          class="legend-item"
        >
          <div
            class="color-indicator mr-3"
            :style="{ backgroundColor: areaType.color }"
          ></div>
          <div class="stats-display">
            <span>{{ areaType.name }}</span>
            <strong>{{ areaType.percentage }} %</strong>
          </div>
        </div>
      </div>

      <hr />

      <!-- NOTE: Green Roofs -->
      <div class="stats-container green-roofs">
        <h6>GRÜNDÄCHER</h6>
        <div class="stats-display">
          <span>% VON DACHFLÄCHE</span>
          <strong
            >{{
              Math.floor(parseFloat(accumulatedAbimoStats.totalGreenRoofArea))
            }}
            %</strong
          >
        </div>
        <div class="stats-display">
          <span>% VON GESAMTFLÄCHE</span>
          <strong
            >{{
              Math.floor(parseFloat(accumulatedAbimoStats.totalRoofArea))
            }}
            %</strong
          >
        </div>
      </div>

      <hr />

      <!-- NOTE: Disconnected -->

      <div class="stats-container disconnected-areas">
        <p>AN MULDE ANGESCHLOSSEN</p>
        <div class="stats-display">
          <span>% VERSIEGELTER FLÄCHE</span>
          <strong
            >{{
              Math.floor(parseFloat(accumulatedAbimoStats.totalSealedArea))
            }}
            %</strong
          >
        </div>
        <div class="stats-display">
          <span>% VON GESAMTFLÄCHE</span>
          <strong
            >{{
              Math.floor(parseFloat(accumulatedAbimoStats.totalSealedArea))
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

