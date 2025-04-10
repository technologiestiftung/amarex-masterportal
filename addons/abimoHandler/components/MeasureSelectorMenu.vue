<script>
import { mapGetters, mapMutations } from "vuex";
import { MEASURE_DIMENSIONS } from "../utils/constants.js";

/**
 * Abimo Measure Selector Menu
 * @module modules/MeasureSelectorMenu
 */
export default {
  name: "MeasureSelectorMenu",
  components: {},
  props: {
    position: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      steps: [
        {
          id: "initalDisplay",
        },
        {
          id: "setNewToSwale",
          icon: "../../../portal/amarex/resources/img/3d-controls-north.png",
          title: "Versickerung",
        },
        {
          id: "setNewUnpvd",
          icon: "../../../portal/amarex/resources/img/3d-controls-north.png",
          title: "Entsiegelung",
        },
        {
          id: "setGreenRoof",
          icon: "../../../portal/amarex/resources/img/3d-controls-north.png",
          title: "Gründach",
        },
      ],
      activeStep: 0,
      addMeasure: false,
      menuPosition: {
        left: 0,
        top: 0,
      },
    };
  },
  computed: {
    ...mapGetters("Modules/AbimoHandler", [
      "isMeasurePlanning",
      "selectedMeasures",
      "isMeasureDrawing",
    ]),
    menuStyle() {
      return {
        left: `${this.menuPosition.left - 323 / 2}px`,
        top: `${this.menuPosition.top}px`,
      };
    },
  },
  mounted() {
    console.log(
      "[MeasureSelectorMenu] MEASURE_DIMENSIONS::",
      MEASURE_DIMENSIONS,
    );
    console.log("[MeasureSelectorMenu] position::", this.position);

    // Setze addMeasure auf true, damit das Menü angezeigt wird
    this.addMeasure = true;

    // Berechne die Position, falls die position-Prop gesetzt ist
    if (this.position) {
      this.calculateMenuPosition();
    }
  },
  watch: {
    activeStep(newStep) {
      console.log("[MeasureSelectorMenu] newStep::", newStep);
      if (newStep > 0) {
        // Wenn ein Schritt ausgewählt wurde, dann die Maßnahme hinzufügen
        // this.$emit("add-measure", this.steps[newStep], this.position);
        this.resetSelection();
      }
    },
    position(newPosition) {
      if (newPosition) {
        this.calculateMenuPosition();
        this.addMeasure = true;
      }
    },
  },
  methods: {
    ...mapMutations("Modules/AbimoHandler", ["setSelectedMeasures"]),

    calculateMenuPosition() {
      // Hier können wir prüfen, ob das Menü innerhalb des sichtbaren Bereichs der Karte liegt
      // und die Position entsprechend anpassen
      const map = mapCollection.getMap("2D");
      const mapSize = map.getSize();
      const pixelPosition = map.getPixelFromCoordinate(this.position);
      console.log("[MeasureSelectorMenu] mapSize::", mapSize);
      console.log("[MeasureSelectorMenu] pixelPosition::", pixelPosition);

      if (pixelPosition) {
        // Sicherstellen, dass das Menü komplett im sichtbaren Bereich angezeigt wird
        // const menuWidth = MEASURE_DIMENSIONS.width || 200; // Standardwert, falls nicht definiert
        // const menuHeight = MEASURE_DIMENSIONS.height || 300; // Standardwert, falls nicht definiert

        let left = pixelPosition[0];
        let top = pixelPosition[1];
        // let left = 0;
        // let top = 0;

        // Überprüfen, ob das Menü rechts aus dem Bildschirm ragt
        // if (left + menuWidth > mapSize[0]) {
        //   left = left - menuWidth;
        // }

        // Überprüfen, ob das Menü unten aus dem Bildschirm ragt
        // if (top + menuHeight > mapSize[1]) {
        //   top = top - menuHeight;
        // }

        this.menuPosition = { left, top };
      }
    },

    selectMeasure(stepIndex) {
      this.activeStep = stepIndex;
    },

    resetSelection() {
      this.addMeasure = false;
      this.activeStep = 0;
      this.$emit("close");
    },

    updateMapValues(measureType) {
      // Je nach Maßnahmentyp den entsprechenden Wert setzen
      switch (measureType) {
        case "setNewToSwale":
          // Wert für Versickerung erhöhen
          // Hier müsstest du deinen Vuex-Store-Action oder Mutation aufrufen
          break;
        case "setNewUnpvd":
          // Wert für Entsiegelung erhöhen
          break;
        case "setGreenRoof":
          // Wert für Gründach erhöhen
          break;
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
    <div
      class="measure-menu-content"
      :style="menuStyle"
    >
      <div class="menu-header">
        <h3>Maßnahme auswählen</h3>
        <button
          @click="resetSelection"
          class="close-btn"
        >
          &times;
        </button>
      </div>

      <div class="measures-list">
        <div
          v-for="(measure, index) in steps.slice(1)"
          :key="measure.id"
          class="measure-item"
          @click="selectMeasure(index + 1)"
        >
          <img
            v-if="measure.icon"
            :src="measure.icon"
            alt="Maßnahme Icon"
            class="measure-icon"
          />
          <span class="measure-title">{{ measure.title }}</span>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Optional: Du kannst den MeasureDrawer verwenden, wenn du eine separate Komponente für das Menü bevorzugst -->
  <!-- <MeasureDrawer
    v-if="addMeasure"
    :measures="steps.slice(1)"
    :position="position"
    @select-measure="selectMeasure"
    @close="resetSelection"
  /> -->
</template>

<style lang="scss" scoped>
@import "~variables";

.measure-menu-content {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  width: 323px;
  overflow: hidden;
  position: absolute;
  left: 50px;
  top: 50px;
  z-index: 99;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;

  h3 {
    margin: 0;
    font-size: 16px;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    color: #666;

    &:hover {
      color: #333;
    }
  }
}

.measures-list {
  padding: 8px 0;

  .measure-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f5f5;
    }

    .measure-icon {
      width: 24px;
      height: 24px;
      margin-right: 8px;
      object-fit: contain;
    }

    .measure-title {
      font-size: 14px;
    }
  }
}
</style>

