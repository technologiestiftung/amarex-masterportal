<script>
import { mapGetters, mapMutations } from "vuex";
import measureCalculations from "../utils/measureCalculations.js";
import { CircleArrowRight, CircleArrowLeft } from "lucide-vue-next";
import colors from "../../../src/shared/js/utils/amarex-colors.json";
import Overlay from "ol/Overlay.js";

/**
 * Abimo Measure Selector Menu
 * @module modules/MeasureSelectorMenu
 */
export default {
  name: "MeasureSelectorMenu",
  components: {
    CircleArrowRight,
    CircleArrowLeft,
  },
  emits: ["addMeasure", "close"],
  props: {
    position: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      colors,
      measures: [
        {
          // FIXME: add final static icons
          icon: "https://sprint-release--amarex-staging.netlify.app/amarex/resources/img/measure-swale.svg",
          title: "Muldenversickerung",
          type: "swale",
        },
        {
          // FIXME: add final static icons
          icon: "https://sprint-release--amarex-staging.netlify.app/amarex/resources/img/measure-unpvd.svg",
          title: "Entsiegelung",
          type: "unpaved",
        },
        {
          // FIXME: add final static icons
          icon: "https://sprint-release--amarex-staging.netlify.app/amarex/resources/img/measure-greenroof.svg",
          title: "Dachbegrünung",
          type: "greenRoof",
        },
      ],
      // "measure" oder "dimensioning"
      currentView: "measure",
      selectedMeasure: null,
      activeMeasureSize: "small",
      // FIXME: add icon size
      defaultSizesConfig: {
        small: { label: "Klein", value: "small" },
        medium: { label: "Mittel", value: "medium" },
        large: { label: "Groß", value: "large" },
      },
    };
  },
  computed: {
    ...mapGetters("Modules/AbimoHandler", [
      "isMeasurePlanning",
      "selectedMeasures",
      "isMeasureDrawing",
    ]),
    menuTitle() {
      if (this.currentView === "measure") {
        return "Maßnahme auswählen";
      } else {
        return this.selectedMeasure ? `${this.selectedMeasure.title}` : "";
      }
    },
    menuSubTitle() {
      if (this.currentView === "dimensioning") {
        return "Wählen Sie eine Dimensionierung";
      }
      return "";
    },
    sizesConfig() {
      if (!this.selectedMeasure) return this.defaultSizesConfig;

      const type = this.selectedMeasure.type;
      const result = {};

      // Verwenden der importierten getMeasureDimension-Funktion
      const smallDimension = measureCalculations.getMeasureDimension(
        type,
        "small",
      );
      const mediumDimension = measureCalculations.getMeasureDimension(
        type,
        "medium",
      );
      const largeDimension = measureCalculations.getMeasureDimension(
        type,
        "large",
      );

      if (smallDimension) {
        result.small = {
          label: `Klein (${smallDimension.area}m²)`,
          value: "small",
          data: smallDimension,
        };
      } else {
        result.small = this.defaultSizesConfig.small;
      }

      if (mediumDimension) {
        result.medium = {
          label: `Mittel (${mediumDimension.area}m²)`,
          value: "medium",
          data: mediumDimension,
        };
      } else {
        result.medium = this.defaultSizesConfig.medium;
      }

      if (largeDimension) {
        result.large = {
          label: `Groß (${largeDimension.area}m²)`,
          value: "large",
          data: largeDimension,
        };
      } else {
        result.large = this.defaultSizesConfig.large;
      }

      return result;
    },
  },
  mounted() {
    this.initOverlay();
  },
  methods: {
    ...mapMutations("Modules/AbimoHandler", ["setSelectedMeasures"]),

    initOverlay() {
      const map = mapCollection.getMap("2D");
      let overlay = new Overlay({
        element: document.querySelector(".measure-menu-container"),
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
        id: "measure-menu-overlay",
        className: "measure-menu-overlay",
      });
      map.addOverlay(overlay);

      map.on("singleclick", function (evt) {
        const coordinate = evt.coordinate;
        overlay.setPosition(coordinate);
      });
    },
    selectMeasure(measure) {
      this.selectedMeasure = measure;
      this.activeMeasureSize = "small";
      this.currentView = "dimensioning";
    },
    selectSize(size) {
      this.activeMeasureSize = size;
    },
    confirmSelection() {
      if (this.selectedMeasure && this.activeMeasureSize) {
        this.$emit(
          "addMeasure",
          this.selectedMeasure,
          this.position,
          this.activeMeasureSize,
        );
        this.resetSelection();
      }
    },
    resetToInitialView() {
      this.currentView = "measure";
      this.selectedMeasure = null;
    },
    goBack() {
      if (this.currentView === "dimensioning") {
        this.resetToInitialView();
      } else {
        this.resetSelection();
      }
    },
    resetSelection() {
      this.resetToInitialView();
      this.$emit("close");
    },
    getSizeDetails(size) {
      if (!this.selectedMeasure) return "";

      const type = this.selectedMeasure.type;
      const sizeData = measureCalculations.getMeasureDimension(type, size);

      if (!sizeData) return "";

      switch (type) {
        case "swale":
          return `Angeschlossene Fläche: ${sizeData.connectedArea}m²`;
        case "greenRoof":
          return ``;
        case "unpaved":
          return ``;
        default:
          return "";
      }
    },
  },
};
</script>

<template lang="html">
  <Teleport
    to="#map-wrapper"
    v-if="position"
  >
    <div class="measure-menu-container">
      <button
        @click="resetSelection"
        class="icon-btn"
      >
        &times;
      </button>

      <div class="measure-menu-content">
        <!-- measure-selection -->
        <div
          v-if="currentView === 'measure'"
          class="measures-list"
        >
          <div
            v-for="measure in measures"
            :key="measure.id"
            class="measure-item"
            @click="selectMeasure(measure)"
          >
            <img
              v-if="measure.icon"
              :src="measure.icon"
              alt="Maßnahme Icon"
              class="measure-icon"
            />
            <span class="measure-title">{{ measure.title }}</span>
            <CircleArrowRight
              :color="colors.amarex_secondary"
              :size="24"
            />
          </div>
        </div>

        <!-- dimensioning-selection -->
        <div v-if="currentView === 'dimensioning'">
          <div class="menu-header">
            <CircleArrowLeft
              :color="colors.amarex_secondary"
              :size="24"
              @click="goBack"
            />

            <div class="title-container">
              <img
                v-if="selectedMeasure?.icon"
                :src="selectedMeasure.icon"
                alt="Maßnahme Icon"
                class="measure-icon-large"
              />
              <div>
                <h3>{{ menuTitle }}</h3>
                <p
                  v-if="menuSubTitle"
                  class="subtitle"
                >
                  {{ menuSubTitle }}
                </p>
              </div>
            </div>
          </div>

          <div class="size-selection">
            <div class="size-options">
              <div
                v-for="(config, size) in sizesConfig"
                :key="size"
                class="size-option"
                :class="{ selected: activeMeasureSize === size }"
                @click="selectSize(size)"
              >
                <div class="size-option-main">{{ config.label }}</div>
                <div
                  class="size-option-details"
                  v-if="
                    activeMeasureSize === size &&
                    selectedMeasure.type === 'swale'
                  "
                >
                  {{ getSizeDetails(size) }}
                </div>
              </div>
            </div>

            <button
              @click="confirmSelection"
              class="confirm-btn"
            >
              Bestätigen
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
@import "~variables";

:global(.ol-overlaycontainer-stopevent) {
  z-index: 1000 !important;
}

.measure-menu-container {
  position: absolute;
  left: -200px;
  top: -20px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 450px;
}

.measure-menu-overlay {
  z-index: 99;
}

.icon-btn {
  border-radius: 50%;
  box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.24);
  width: 40px;
  height: 40px;
  background-color: $amarex_secondary_mid;
  border: none;
  margin-bottom: 16px;
  cursor: pointer;
}

.measure-menu-content {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  width: 400px;
  overflow: hidden;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background-color: $amarex_secondary_mid;
  border-bottom: 1px solid #e0e0e0;

  .title-container {
    display: flex;
    flex-grow: 1;
    gap: 12px;

    h3 {
      margin: 0;
      font-size: 18px;
      line-height: 20px;
      font-weight: 700;
      color: $amarex_secondary;
    }
    .subtitle {
      font-size: 16px;
      line-height: 20px;
      color: $amarex_secondary;
    }
  }
}

.measures-list {
  background-color: $amarex_secondary_mid;
  .measure-item {
    display: flex;
    align-items: center;
    padding: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid #eee;

    &:hover {
      background-color: #f9f9f9;
    }

    .measure-icon {
      width: 32px;
      height: 32px;
      margin-right: 16px;
      object-fit: contain;
    }

    .measure-title {
      flex-grow: 1;
      font-size: 16px;
      color: #333;
    }
  }
}

.size-selection {
  padding: 16px;

  .measure-icon-large {
    width: 48px;
    height: 48px;
    margin-right: 12px;
  }

  .size-options {
    margin-bottom: 16px;

    .size-option {
      padding: 12px 16px;
      border-radius: 4px;
      background-color: #f5f7fa;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;

      &:hover {
        background-color: #e8eef7;
      }

      &.selected {
        background-color: #e8f0ff;
        border-color: $amarex_secondary_mid;

        .size-option-main {
          font-weight: 500;
        }
      }

      .size-option-main {
        font-size: 15px;
      }

      .size-option-details {
        font-size: 13px;
        color: #666;
        margin-top: 4px;
      }
    }
  }

  .confirm-btn {
    width: 100%;
    padding: 12px;
    background-color: $amarex_secondary;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: $amarex_secondary;
    }
  }
}
</style>

