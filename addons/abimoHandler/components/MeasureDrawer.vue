<script>
import { mapMutations } from "vuex";

export default {
  name: "MeasureDrawer",
  props: {
    measures: {
      type: Array,
      default: () => [],
    },
    position: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      isVisible: true,
    };
  },
  computed: {
    drawerStyle() {
      if (this.position) {
        // Hier könntest du die Position des Drawers relativ zum geklickten Punkt setzen
        // Beispiel für eine einfache Positionierung (kann an deine Bedürfnisse angepasst werden)
        return {
          position: "absolute",
          left: `${this.position[0]}px`,
          top: `${this.position[1]}px`,
        };
      }
      return {};
    },
  },
  methods: {
    ...mapMutations("Modules/AbimoHandler", ["setIsMeasureDrawing"]),

    selectMeasure(index) {
      // Index + 1, da der erste Schritt "initalDisplay" ist (nicht in den measures enthalten)
      this.$emit("select-measure", index + 1);
    },

    close() {
      this.isVisible = false;
      this.$emit("close");
    },

    removeMeasure(measureId) {
      const measureIndex = this.selectedMeasures.findIndex(
        (m) => m.id === measureId,
      );

      if (measureIndex !== -1) {
        const measure = this.selectedMeasures[measureIndex];

        // Feature vom Layer entfernen
        this.layer_abimo_measures.getSource().removeFeature(measure.feature);

        // Aus dem Array entfernen
        this.selectedMeasures.splice(measureIndex, 1);

        // Werte aktualisieren (hier müsstest du die Logik anpassen)
        // this.updateValues();
      }
    },
  },
};
</script>

<template>
  <div
    v-if="isVisible"
    class="measure-drawer"
    :style="drawerStyle"
  >
    <div class="drawer-header">
      <h3>Maßnahme auswählen</h3>
      <button
        @click="close"
        class="close-btn"
      >
        &times;
      </button>
    </div>

    <div class="measures-list">
      <div
        v-for="(measure, index) in measures"
        :key="measure.id"
        class="measure-item"
        @click="selectMeasure(index)"
      >
        <!-- <img v-if="measure.icon" :src="measure.icon" alt="Maßnahme Icon" class="measure-icon"> -->
        <span class="measure-title">{{ measure.title }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.measure-drawer {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  width: 250px;
  z-index: 1000;
  overflow: hidden;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;

  h3 {
    margin: 0;
    font-size: 1rem;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0;
    color: #666;

    &:hover {
      color: #333;
    }
  }
}

.measures-list {
  padding: 0.5rem 0;

  .measure-item {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f5f5;
    }

    .measure-icon {
      width: 24px;
      height: 24px;
      margin-right: 0.5rem;
      object-fit: contain;
    }

    .measure-title {
      font-size: 0.9rem;
    }
  }
}
</style>

