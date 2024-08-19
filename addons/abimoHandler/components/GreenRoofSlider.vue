<script>
import { mapGetters } from "vuex";

/**
 * GreenRoofSlider
 * @module modules/GreenRoofSlider
 */
export default {
  name: "GreenRoofSlider",
  computed: {
    ...mapGetters("Modules/AbimoHandler", [
      "roofSliderData",
      "accumulatedAbimoStats",
    ]),
  },
};
</script>

<template lang="html">
  <div class="status-quo-bar">
    <div class="status-quo"></div>
  </div>
  <div
    id="GreenRoofSlider-root"
    class="abimo-slider-bar"
  >
    <div
      v-for="(areaType, index) in roofSliderData"
      :key="index"
      :class="['abimo-slider-segment', `${areaType.id}`]"
      :style="{
        width: `${areaType.percentage}%`,
      }"
      :title="`${areaType.percentage}%`"
    ></div>

    <div class="target"></div>
  </div>

  <div class="area-types-legend d-flex flex-column w-100">
    <div class="legend-item">
      <div class="color-indicator mr-3"></div>
      <div class="stats-display">
        <div class="d-flex flex-column w-100">
          <strong>ZIELWERT</strong>
          <span>DACHBEGRÜNUNG</span>
        </div>
        <strong>{{ 10 }} %</strong>
      </div>
    </div>

    <div class="legend-item">
      <div class="color-indicator mr-3"></div>
      <div class="stats-display">
        <div class="d-flex flex-column w-100">
          <strong>ANTEIL DÄCHER</strong>
          <span>%ROOF</span>
        </div>
        <strong
          >{{
            roofSliderData
              .find((area) => area.id === "roof")
              .percentage.toFixed(2)
          }}
          %</strong
        >
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
.status-quo-bar {
  width: 100%;
}
.status-quo {
  width: 12px;
  height: 12px;
  border: 1px solid #878786;
  background-color: #d9d9d9;
  margin-bottom: 4px;
}

.abimo-slider-bar {
  display: flex;
  height: 26px;
  width: 100%;
  position: relative;
  background-color: #d9d9d9;
  // border: 2px solid #878786;
  overflow: hidden;
  z-index: 1;
}

.abimo-slider-segment {
  height: 100%;
  // border: 2px solid;
}
.roof {
  background-color: #d17b7b;
  // border-color: #971f1f;
  z-index: 2;
}
.target {
  position: absolute;
  height: 26px;
  z-index: 3;
  left: 0;
  top: 0;
  // border: 2px solid;
  background-color: #5d8bef;
  border-color: #2663e9;
}
</style>

