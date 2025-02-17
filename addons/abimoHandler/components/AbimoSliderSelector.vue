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
      content: {
        greenRoof: {
          title: "Dachbegrünung",
          description: (area = "XXXX", percentage = "XX") => {
            // @Luise: Please input the correct area and percentage for greenRoof
            if (!area || !percentage)
              return "Welchen Anteil möchten Sie begrünen?";
            return `Bei den von Ihnen gewählten Flächen stehen ${area} m² (${percentage}%) Dachflächen zur Verfügung.<br><br>Welchen Anteil möchten Sie begrünen?`;
          },
        },
        unsealed: {
          title: "Unversiegelte Flächen",
          subTitle: "unversiegelte Fläche",
          description: (area = "XXXX", percentage = "XX") => {
            // @Luise: Please input the correct area and percentage for unsealed
            if (!area || !percentage)
              return "Möchten Sie diesen Anteil variieren?";
            return `Bei den von Ihnen gewählten Flächen stehen ${area} m² (${percentage}%) unbebaute Fläche zur Verfügung.<br><br>Möchten Sie diesen Anteil variieren?`;
          },
        },
        swaleConnected: {
          title: "Mulde",
          description: (area = "XXXX", percentage = "XX") => {
            // @Luise: Please input the correct area and percentage for swaleConnected
            if (!area || !percentage)
              return "Welchen Anteil möchten Sie an Mulden anschliessen?";
            return `Bei den von Ihnen gewählten Flächen stehen ${area} m² (${percentage}%) unverbaute Fläche zur Verfügung.Dieser Wert ist abhängig von der im vorhergehenden Schritt gewählten unversiegelten Fläche.<br><br>Welchen Anteil möchten Sie an Mulden anschliessen?`;
          },
        },
      },
    };
  },
  computed: {
    ...mapGetters("Modules/AbimoHandler", [
      "accumulatedAbimoStats",
      "newUnpvd",
      "newGreenRoof",
      "newToSwale",
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
    currentBaseArea() {
      switch (this.type) {
        case "greenRoof":
          return Math.round(this.accumulatedAbimoStats.totalRoofArea);
        case "unsealed":
          return Math.round(this.accumulatedAbimoStats.maxUnpavedArea);
        case "swaleConnected":
          return Math.round(this.accumulatedAbimoStats.maxSwaleConnectedArea);
        default:
          return {};
      }
    },
    currentTargetValue() {
      switch (this.type) {
        case "greenRoof":
          return Math.round(this.accumulatedAbimoStats.totalRoofArea);
        case "unsealed":
          return Math.round(this.accumulatedAbimoStats.maxUnpavedArea);
        case "swaleConnected":
          return Math.round(this.accumulatedAbimoStats.maxSwaleConnectedArea);
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
          };
        case "unsealed":
          return {
            title: "Unversiegelte Flächen",
            baseDataTitle: "Unversiegelte Flächen",
          };
        case "swaleConnected":
          return {
            title: "Anschluss an Mulden",
            baseDataTitle: "Versiegelte Flächen",
          };
        default:
          return "";
      }
    },
  },
  created() {
    this.initializeTargetValue();
  },
  watch: {
    type: {
      immediate: true,
      handler() {
        this.initializeTargetValue();
      },
    },
    targetValue(newValue) {
      switch (this.type) {
        case "greenRoof":
          if (newValue > this.accumulatedAbimoStats.maxGreenRoof * 100) {
            this.targetValue = (
              this.accumulatedAbimoStats.maxGreenRoof * 100
            ).toFixed(0);
          }
          break;
        case "unsealed":
          if (newValue > this.accumulatedAbimoStats.maxUnpaved * 100) {
            this.targetValue = (
              this.accumulatedAbimoStats.maxUnpaved * 100
            ).toFixed(0);
          }
          break;
        case "swaleConnected":
          if (newValue > this.accumulatedAbimoStats.maxSwaleConnected * 100) {
            this.targetValue = (
              this.accumulatedAbimoStats.maxSwaleConnected * 100
            ).toFixed(0);
          }
          break;
        default:
          if (newValue > this.currentBaseData.toFixed(0)) {
            this.targetValue = this.currentBaseData.toFixed(0);
          }
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
          if (this.targetValue > this.currentBaseData.toFixed(0)) {
            this.targetValue = this.currentBaseData.toFixed(0);
          }
          this.setNewGreenRoof(this.targetValue / 100);
          break;
        case "unsealed":
          if (this.targetValue > this.currentBaseData.toFixed(0)) {
            this.targetValue = this.currentBaseData.toFixed(0);
          }
          this.setNewUnpvd(this.targetValue / 100);
          this.updateMaxSwaleConnected();
          break;
        case "swaleConnected":
          if (this.targetValue > this.currentBaseData.toFixed(0)) {
            this.targetValue = this.currentBaseData.toFixed(0);
          }
          this.setNewToSwale(this.targetValue / 100);
          break;
      }
    },
    initializeTargetValue() {
      switch (this.type) {
        case "greenRoof":
          this.targetValue =
            (this.newGreenRoof * 100).toFixed() > 0
              ? (this.newGreenRoof * 100).toFixed()
              : this.currentStatusQuo;
          break;
        case "unsealed":
          this.targetValue =
            (this.newUnpvd * 100).toFixed() > 0
              ? (this.newUnpvd * 100).toFixed()
              : this.currentStatusQuo;
          break;
        case "swaleConnected":
          this.targetValue =
            (this.newToSwale * 100).toFixed() > 0
              ? (this.newToSwale * 100).toFixed()
              : this.currentStatusQuo;
          break;
        default:
          this.targetValue = this.currentStatusQuo;
          break;
      }
    },
  },
};
</script>

<template lang="html">
  <div class="slider-selector-container w-100 d-flex flex-column">
    <span :style="{ marginBottom: '16px' }">
      <p class="title">{{ content[type].title }}</p>
      <p
        v-html="
          content[type].description(
            (area = currentBaseArea.toFixed(0)),
            (percentage = currentBaseData.toFixed(0)),
          )
        "
        class="description"
      ></p>
    </span>
    <span :style="{ marginLeft: '7px' }">
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
      <div class="abimo-slider-bar">
        <div
          :class="['abimo-slider-segment', `${type}`]"
          :style="{
            width: `${currentBaseData.toFixed(0)}%`,
            borderWidth: currentBaseData > 0 ? '2px' : '0',
          }"
          :title="`${currentBaseData.toFixed(0)}%`"
        ></div>
        <div
          class="target"
          :style="{
            width: `${targetValue}%`,
            borderWidth: targetValue > 0 ? '2px' : '0',
          }"
        ></div>
      </div>
    </span>
    <div class="d-flex justify-content-between area">
      <p class="description-with-smaller-lineheight">Gesamtfläche</p>
      <p class="description-with-smaller-lineheight">
        {{ accumulatedAbimoStats.totalArea.toFixed(0) }}m²
      </p>
    </div>
    <div
      class="slider-wrapper d-flex justify-content-between align-items-center"
    >
      <div :class="['color-indicator target-color']"></div>
      <div class="d-flex flex-column w-100">
        <p
          class="description-with-smaller-lineheight"
          :style="{ fontWeight: 700 }"
        >
          ZIELWERT
        </p>
        <p class="description-with-smaller-lineheight">
          {{ content[type].subTitle || content[type].title }}
        </p>
      </div>
      <div class="input-wrapper">
        <input
          id="targetValue"
          v-model="targetValue"
          class="target-input"
          type="number"
          min="0"
          :max="currentBaseData.toFixed(0)"
        />
        <p class="percentage">%</p>
      </div>
    </div>
    <span class="line"></span>
    <div class="d-flex stats-wrapper align-items-center">
      <div class="polygon"></div>
      <p class="description-with-smaller-lineheight flex-fill">Status Quo</p>
      <p class="description-with-smaller-lineheight">
        {{ currentStatusQuo.toFixed(0) }} %
      </p>
    </div>

    <!-- Green Roof -->
    <div
      class="d-flex stats-wrapper align-items-center"
      v-if="type === 'greenRoof'"
    >
      <div class="color-indicator maxGreenRoof"></div>
      <p class="description-with-smaller-lineheight flex-fill">
        maximale Dachfläche
      </p>
      <p class="description-with-smaller-lineheight">
        {{ currentBaseData.toFixed(0) }} %
      </p>
    </div>
    <div
      class="d-flex stats-wrapper align-items-center"
      v-if="type === 'greenRoof'"
    >
      <div class="color-indicator notUsable"></div>
      <p class="description-with-smaller-lineheight flex-fill">
        nicht nutzbare Fläche
      </p>
      <p class="description-with-smaller-lineheight">
        {{ (100 - currentBaseData).toFixed(0) }} %
      </p>
    </div>

    <!-- Unsealed -->
    <div
      class="d-flex stats-wrapper align-items-center"
      v-if="type === 'unsealed'"
    >
      <div class="color-indicator unsealed"></div>
      <p class="description-with-smaller-lineheight flex-fill">
        <strong>Nicht bebaut</strong><br />unversiegelt und unbebaut
      </p>
      <p class="description-with-smaller-lineheight">
        {{ currentBaseData.toFixed(0) }} %
      </p>
    </div>
    <div
      class="d-flex stats-wrapper align-items-center"
      v-if="type === 'unsealed'"
    >
      <div class="color-indicator notUsable"></div>
      <p class="description-with-smaller-lineheight flex-fill">
        <strong>Nicht nutzbarer Bereich</strong><br />bebaute Flächen
      </p>
      <p class="description-with-smaller-lineheight">
        {{ (100 - currentBaseData).toFixed(0) }} %
      </p>
    </div>

    <!-- Swale Connected -->
    <div
      class="d-flex stats-wrapper align-items-center"
      v-if="type === 'swaleConnected'"
    >
      <div class="color-indicator swaleConnected"></div>
      <p class="description-with-smaller-lineheight flex-fill">
        <strong>Versiegelt</strong><br />unbebaut und bebaut
      </p>
      <p class="description-with-smaller-lineheight">
        {{ currentBaseData.toFixed(0) }} %
      </p>
    </div>
    <div
      class="d-flex stats-wrapper align-items-center"
      v-if="type === 'swaleConnected'"
    >
      <div class="color-indicator notUsable"></div>
      <p class="description-with-smaller-lineheight flex-fill">
        nicht nutzbare Fläche
      </p>
      <p class="description-with-smaller-lineheight">
        {{ (100 - currentBaseData).toFixed(0) }} %
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.slider-selector-container {
  gap: 16px;
  .status-quo-bar {
    height: 12px;
    margin-bottom: 4px;
    position: relative;
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
      border-color: $amarex_grey_dark transparent transparent transparent;
    }
  }
  .abimo-slider-bar {
    display: flex;
    height: 26px;
    width: 100%;
    position: relative;
    background-color: $amarex_grey_light;
    overflow: hidden;
    z-index: 1;
    .abimo-slider-segment {
      height: 100%;
      border: 2px solid;
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
    .greenRoof {
      background-color: $amarex_extras_lightred;
      border-color: $amarex_extras_darkred;
      z-index: 2;
    }
    .unsealed {
      background-color: $amarex_extras_lightgreen;
      border-color: $amarex_extras_darkgreen;
      z-index: 2;
    }
    .swaleConnected {
      background-color: $amarex_extras_lightyellow;
      border-color: $amarex_extras_darkyellow;
      z-index: 2;
    }
  }
  .area {
    margin-bottom: 16px;
  }
  .slider-wrapper {
    gap: 10px;
    .color-indicator {
      width: 24px;
      height: 24px;
      border: 2px solid;
      flex-shrink: 0;
    }
    .target-color {
      background-color: $amarex_extras_lightblue;
      border-color: $amarex_extras_darkblue;
    }
    .input-wrapper {
      position: relative;
      .target-input {
        width: 73px;
        padding: 7px 7px 7px 10px;
        border-radius: 0 !important;
        border: 1px solid $amarex_grey_light;
        font-size: 16px;
        font-weight: 700;
        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button {
          opacity: 1 !important;
          -webkit-appearance: inner-spin-button !important;
        }
      }
      .percentage {
        font-size: 16px;
        font-weight: 700;
        color: $amarex_secondary;
        position: absolute;
        left: auto;
        right: 29px;
        top: 7.5px;
      }
    }
  }
  .stats-wrapper {
    gap: 10px;
    p {
      line-height: 16px !important;
    }
    .polygon {
      width: 24px;
      height: 19.5px;
      background-color: $amarex_grey_dark;
      clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
      flex-shrink: 0;
    }
    .color-indicator {
      width: 24px;
      height: 24px;
      border: 2px solid;
      flex-shrink: 0;
    }
    .maxGreenRoof {
      background-color: $amarex_extras_lightred;
      border-color: $amarex_extras_darkred;
    }
    .notUsable {
      background-color: $amarex_grey_light;
      border-color: $amarex_grey_mid;
    }
    .unsealed {
      background-color: $amarex_extras_lightgreen;
      border-color: $amarex_extras_darkgreen;
    }
    .swaleConnected {
      background-color: $amarex_extras_lightyellow;
      border-color: $amarex_extras_darkyellow;
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
.description-with-smaller-lineheight {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
}
</style>

