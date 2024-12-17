<script>
import { mapGetters, mapMutations, mapActions } from "vuex";

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
      validator: (value) =>
        ["greenRoof", "unsealed", "swaleConnected"].includes(value),
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
      "newUnpvd",
      "resetTargetValues",
    ]),
    currentBaseData() {
      switch (this.type) {
        case "greenRoof":
          return Math.round(this.accumulatedAbimoStats.maxGreenRoof * 100);
        case "unsealed":
          return Math.round(this.accumulatedAbimoStats.maxUnpaved * 100);
        case "swaleConnected":
          return Math.round(this.accumulatedAbimoStats.maxSwaleConnected * 100);
        default:
          return {};
      }
    },
    currentStatusQuo() {
      switch (this.type) {
        case "greenRoof":
          return Math.round(this.accumulatedAbimoStats.meanGreenRoof * 100);
        case "unsealed":
          return Math.round(this.accumulatedAbimoStats.meanUnpaved * 100);
        case "swaleConnected":
          return Math.round(
            this.accumulatedAbimoStats.meanSwaleConnected * 100,
          );
        default:
          return {};
      }
    },
    sliderContent() {
      switch (this.type) {
        case "greenRoof":
          return {
            title: "Dachbegrünung",
            baseDataTitle: "Dachflächen",
            baseDataSubTitle: "update green_roof",
          };
        case "unsealed":
          return {
            title: "Unversiegelte Flächen",
            baseDataTitle: "Unversiegelte Flächen",
            baseDataSubTitle: "update unpvd",
          };
        case "swaleConnected":
          return {
            title: "Anschluss an Mulden",
            baseDataTitle: "Versiegelte Flächen",
            baseDataSubTitle: "update to_swale",
          };
        default:
          return "";
      }
    },
  },
  watch: {
    resetTargetValues(newValue) {
      if (newValue) {
        this.resetTargetValue();
      }
    },
  },
  methods: {
    ...mapMutations("Modules/AbimoHandler", [
      "setNewGreenRoof",
      "setNewUnpvd",
      "setNewToSwale",
    ]),
    ...mapActions("Modules/AbimoHandler", [
      "updateMaxSwaleConnected",
      "updateAccordionSteps",
    ]),
    updateAbimoData() {
      switch (this.type) {
        case "greenRoof":
          this.setNewGreenRoof(this.targetValue / 100);
          this.updateAccordionSteps(4);
          break;
        case "unsealed":
          this.setNewUnpvd(this.targetValue / 100);
          this.updateMaxSwaleConnected();
          this.updateAccordionSteps(5);
          break;
        case "swaleConnected":
          this.setNewToSwale(this.targetValue / 100);
          this.updateAccordionSteps(6);
          break;
      }
    },
    resetTargetValue() {
      this.targetValue = 0;
    },
  },
};
</script>

<template lang="html">
  <div
    class="status-quo-bar"
    :style="{
      width: `${currentStatusQuo.toFixed(0)}%`,
    }"
  >
    <div
      class="status-quo"
      style=""
    ></div>
  </div>

  <div
    id="AbimoSliderSelector-root"
    class="abimo-slider-bar"
  >
    <div
      :class="['abimo-slider-segment', `${type}`]"
      :style="{
        width: `${currentBaseData.toFixed(0)}%`,
        borderWidth: this.currentBaseData > 0 ? '2px' : '0',
      }"
      :title="`${currentBaseData.toFixed(0)}%`"
    ></div>

    <div
      class="target"
      :style="{
        width: `${targetValue}%`,
        borderWidth: this.targetValue > 0 ? '2px' : '0',
      }"
    ></div>
  </div>

  <div class="area-types-legend">
    <div class="d-flex gap-3 align-items-center">
      <div class="stats-display">
        <div class="d-flex gap-3 align-items-center">
          <div class="status-quo-legend-item"></div>
          <strong>Status Quo</strong>
        </div>
        <p>{{ currentStatusQuo.toFixed(0) }} %</p>
      </div>
    </div>

    <div class="legend-item">
      <div :class="['color-indicator mr-3 target-color']"></div>
      <div class="stats-display">
        <div class="d-flex flex-column w-100">
          <strong>ZIELWERT</strong>

          <span>{{ sliderContent.title }}</span>
          <!-- <span>{{ sliderContent.baseDataSubTitle }}</span> -->
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
      <div :class="['color-indicator mr-3', `${type}`]"></div>

      <div class="stats-display d-flex justify-content-between">
        <div class="d-flex flex-column">
          <strong>{{ sliderContent.baseDataTitle }}</strong>
        </div>
        <p>{{ currentBaseData.toFixed(0) }} %</p>
      </div>
    </div>

    <hr />
    <div class="legend-item">
      <div class="stats-display">
        <p class="area">
          GESAMTFLÄCHE: {{ accumulatedAbimoStats.totalArea.toFixed(0) }} m²
        </p>
      </div>
    </div>

    <!-- <button
      class="btn btn-primary mt-3"
      @click="updateAbimoData"
    >
      Bestätigen
    </button> -->
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
  width: 100%;
  display: flex;
  gap: 8px;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 20px;
}

.legend-item {
  display: flex;
  gap: 8px;
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
  align-items: center;
  gap: 8px;
}
.status-quo-bar {
  height: 12px;
  margin-bottom: 4px;
  position: relative;
}
.status-quo {
  margin-right: -5px;
  position: absolute;
  right: 0;
  width: 0px;
  height: 0px;
  transform: rotate(360deg);
  -webkit-transform: rotate(360deg);
  border-style: solid;
  border-width: 12px 6px 0 6px;
  border-color: #878786 transparent transparent transparent;
}
.status-quo-legend-item {
  width: 0px;
  height: 0px;
  transform: rotate(360deg);
  -webkit-transform: rotate(360deg);
  border-style: solid;
  border-width: 12px 6px 0 6px;
  border-color: #878786 transparent transparent transparent;
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
.color-indicator {
  width: 20px;
  height: 20px;
  margin-right: 4px;
  border: 2px solid;
}
.abimo-slider-segment {
  height: 100%;
  border: 2px solid;
}
.greenRoof {
  background-color: #d17b7b;
  border-color: #971f1f;
  z-index: 2;
}
.unsealed {
  background-color: #53c486;
  border-color: #2e9f61;
  z-index: 2;
}
.sealed {
  background-color: #d59f5d;
  border-color: #b67a2f;
  z-index: 2;
}
.swaleConnected {
  background-color: #d59f5d;
  border-color: #b67a2f;
  z-index: 2;
}
.target-color {
  background-color: #5d8bef;
  border-color: #2663e9;
}

.target {
  position: absolute;
  margin-top: 2px;
  height: 22px;
  z-index: 3;
  left: 0;
  border: 2px solid;
  background-color: #5d8bef;
  border-color: #2663e9;
}
.target-input {
  width: 52px;
  padding-left: 8px;
}
</style>

