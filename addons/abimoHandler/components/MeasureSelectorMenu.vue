<script>
import { mapGetters, mapMutations } from "vuex";

import MeasureDrawer from "./MeasureDrawer.vue";
// TODOS:
// set Measures and add to MeasureDrawer

// Auswahl der Measures treffen
// add state selectedMeasures => Array mit den ausgewählten Maßnahmen
// bei jeder Auswahl ein Item auf die Karte an der Position zeichnen -> MeasureDrawer
// beim löschen der Auswahl das Item von der Karte entfernen
// update new values in the map: this.setNewGreenRoof(0); this.setNewUnpvd(0); this.setNewToSwale(0);

/**
 * Abimo Measure Selector
 * @module modules/MeasureSelectorMenu
 */
export default {
  name: "MeasureSelectorMenu",
  components: {
    MeasureDrawer,
  },
  data() {
    return {
      steps: [
        {
          id: "initalDisplay",
        },
        {
          id: "setNewToSwale",
          icon: "",
        },
        {
          id: "setNewUnpvd",
          icon: "",
        },
        {
          id: "setGreenRoof",
          icon: "",
        },
      ],
      activeStep: 0,
    };
  },
  computed: {
    ...mapGetters(["allLayerConfigs"]),
  },
  mounted() {
    console.log(
      "[MeasureSelectorMenu] this.allLayerConfigs::",
      this.allLayerConfigs,
    );
  },
  watch: {},
  methods: {
    ...mapMutations("Modules/AbimoHandler", ["setIsMeasureDrawing"]),
  },
};
</script>

<template lang="html">
  <div class="measure-selector-container">
    <MeasureDrawer />
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
</style>

