<script>
import { mapGetters, mapMutations } from "vuex";

/**
 * AbimoSliderSelector
 * @module modules/AbimoSliderSelector
 */
export default {
  name: "AbimoSliderSelector",
  props: {
    type: {
      type: String,
      // greenRoof | unsealed | swaleConnected
      default: "greenRoof",
      required: true,
    },
  },
  data() {
    return {
      targetValue: 0,
    };
  },
  computed: {
    ...mapGetters("Modules/AbimoHandler", [
      "accumulatedAbimoStats",
      "abimoUnsealed",
    ]),

    currentBaseData() {
      switch (this.type) {
        case "greenRoof":
          return this.accumulatedAbimoStats.percentageRoofToTotalArea;
        case "unsealed":
          return this.accumulatedAbimoStats.percentagePavedAreaToTotalArea;
        case "swaleConnected":
          if (this.abimoUnsealed > 0) {
            return (
              this.accumulatedAbimoStats.percentagePavedAreaToTotalArea -
              this.abimoUnsealed
            );
          } else
            return this.accumulatedAbimoStats.percentagePavedAreaToTotalArea;
        default:
          return {};
      }
    },
    sliderContent() {
      switch (this.type) {
        case "greenRoof":
          return {
            title: "Dachbegrünung",
            baseDataTitle: "Dachflächen (roof)",
            baseDataSubTitle: "update green_roof",
          };
        case "unsealed":
          return {
            title: "Unversiegelte Flächen",
            baseDataTitle: "Unversiegelte Flächen (unpvd / roof -1)",
            baseDataSubTitle: "update pvd",
          };
        case "swaleConnected":
          return {
            title: "Anschluss an Mulden",
            baseDataTitle: "Versiegelte Flächen (pvd)",
            baseDataSubTitle: "update to_swale",
          };
        default:
          return "";
      }
    },
  },
  methods: {
    ...mapMutations("Modules/AbimoHandler", [
      "setAbimoGreenRoof",
      "setAbimoUnsealed",
      "setAbimoSwaleConnected",
    ]),
    updateAbimoData() {
      switch (this.type) {
        case "greenRoof":
          this.setAbimoGreenRoof(this.targetValue);
          break;
        case "unsealed":
          this.setAbimoUnsealed(this.targetValue);
          break;
        case "swaleConnected":
          this.setAbimoSwaleConnected(this.targetValue);
          break;
      }
    },
  },
};
</script>

<template lang="html">
  <div class="status-quo-bar">
    <div class="status-quo"></div>
  </div>

  <div
    id="AbimoSliderSelector-root"
    class="abimo-slider-bar"
  >
    <div
      :class="['abimo-slider-segment', `${type}`]"
      :style="{
        width: `${currentBaseData.toFixed(0)}%`,
      }"
      :title="`${currentBaseData.toFixed(0)}%`"
    ></div>

    <div
      class="target"
      :style="{
        width: `${targetValue}%`,
      }"
    ></div>
  </div>

  <div class="area-types-legend d-flex flex-column w-100">
    <div class="legend-item">
      <div class="color-indicator mr-3"></div>
      <div class="stats-display">
        <div class="d-flex flex-column w-100">
          <strong>ZIELWERT</strong>
          <span>{{ sliderContent.title }}</span>
          <span>{{ sliderContent.baseDataSubTitle }}</span>
        </div>

        <input
          id="targetValue"
          v-model="targetValue"
          class="target-input"
          type="number"
          min="0"
          :max="currentBaseData.toFixed(0)"
        />
      </div>
    </div>

    <div class="legend-item">
      <div class="color-indicator mr-3"></div>
      <div class="stats-display d-flex justify-content-between">
        <div class="d-flex flex-column w-100">
          <strong>{{ sliderContent.baseDataTitle }}</strong>
          <!-- <span>{{ sliderContent.baseDataSubTitle }}</span> -->
        </div>
        <span>{{ currentBaseData.toFixed(0) }} %</span>
      </div>
    </div>

    <hr />
    <div class="legend-item">
      <div class="color-indicator mr-3"></div>
      <div class="stats-display">
        <p class="area">
          GESAMTFLÄCHE: {{ accumulatedAbimoStats.totalArea.toFixed(0) }} m²
        </p>
      </div>
    </div>

    <button
      class="btn btn-primary mt-3"
      @click="updateAbimoData"
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
.greenRoof {
  background-color: #d17b7b;
  // border-color: #971f1f;
  z-index: 2;
}
.unsealed {
  background-color: #d59f5d;
  // border-color: #B67A2F;
  z-index: 2;
}
.swaleConnected {
  background-color: #d59f5d;
  // border-color: #B67A2F;
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
.target-input {
  width: 52px;
  padding-left: 8px;
}
</style>

