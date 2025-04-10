<script>
import { mapGetters, mapMutations, mapActions } from "vuex";

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
    this.layer_abimo_btf = mapCollection
      .getMap("2D")
      .getLayers()
      .getArray()
      .find((layer) => layer.get("id") === "planung_abimo");

    this.layer_abimo_measures = mapCollection
      .getMap("2D")
      .getLayers()
      .getArray()
      .find((layer) => layer.get("id") === "abimo_measures");

    let measureLayer = this.allLayerConfigs.find(
      (layer) => layer.id === "abimo_measures",
    );
    let selectedBTF = this.allLayerConfigs.find(
      (layer) => layer.id === "planung_abimo",
    );

    this.createInteractions();
    console.log("[MeasureSelectorMenu] measureLayer::", measureLayer);
    console.log("[MeasureSelectorMenu] selectedBTF::", selectedBTF);
  },
  watch: {},
  methods: {
    ...mapMutations("Modules/AbimoHandler", ["setIsMeasureDrawing"]),
    ...mapActions("Maps", {
      addInteractionToMap: "addInteraction",
      removeInteractionFromMap: "removeInteraction",
    }),

    createInteractions: function () {
      console.log(
        "[MeasureSelectorMenu] this.layer_abimo_btf::",
        this.layer_abimo_btf,
      );
      console.log(
        "[MeasureSelectorMenu] this.layer_abimo_measures::",
        this.layer_abimo_measures,
      );
      // const selectedInteraction = new
    },
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

