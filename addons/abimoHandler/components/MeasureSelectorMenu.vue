<script>
import { mapGetters, mapMutations } from "vuex";
import MeasureDrawer from "./MeasureDrawer.vue";
import { MEASURE_DIMENSIONS } from "../utils/constants.js";

/**
 * Abimo Measure Selector Menu
 * @module modules/MeasureSelectorMenu
 */
export default {
  name: "MeasureSelectorMenu",
  components: {
    MeasureDrawer,
  },
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
          icon: "img/icons/measures/toSwale.png",
          title: "Versickerung",
        },
        {
          id: "setNewUnpvd",
          icon: "img/icons/measures/unpvd.png",
          title: "Entsiegelung",
        },
        {
          id: "setGreenRoof",
          icon: "img/icons/measures/greenRoof.png",
          title: "Gründach",
        },
      ],
      activeStep: 0,
      addMeasure: false,
    };
  },
  computed: {
    ...mapGetters("Modules/AbimoHandler", [
      "isMeasurePlanning",
      "selectedMeasures",
      "isMeasureDrawing",
    ]),
  },
  mounted() {
    console.log(
      "[MeasureSelectorMenu] MEASURE_DIMENSIONS::",
      MEASURE_DIMENSIONS,
    );
  },
  watch: {
    activeStep(newStep) {
      console.log("[MeasureSelectorMenu] newStep::", newStep);
    },
  },
  methods: {
    ...mapMutations("Modules/AbimoHandler", ["setSelectedMeasures"]),

    selectMeasure(stepIndex) {
      this.activeStep = stepIndex;
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
  <!-- the menu should be placed below the click point -->
  <div class="menu"></div>

  <MeasureDrawer
    v-if="addMeasure"
    :measures="steps.slice(1)"
    :position="clickedCoordinates"
    @select-measure="selectMeasure"
    @close="resetSelection"
  />
</template>

<style lang="scss" scoped>
@import "~variables";
.menu {
  width: 100px;
  height: 100px;
  background-color: red;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99;
}
</style>

