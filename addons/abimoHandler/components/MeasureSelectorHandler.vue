<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import { singleClick } from "ol/events/condition.js";
import { Select } from "ol/interaction";
import MeasureSelectorMenu from "./MeasureSelectorMenu.vue";

// MeasureSelectorHandler -> setzt die interaktion
// MeasureSelectorMenu -> zeigt das Menü an und setzt die Maßnahme
// MeasureDrawer -> zeigt die Maßnahme an und setzt sie in die Karte ein
// es muss alles im Store gespeichert werden

/**
 * Abimo Measure Selector Menu
 * @module modules/MeasureSelectorHandler
 */
export default {
  name: "MeasureSelectorHandler",
  components: {
    MeasureSelectorMenu,
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
      showMeasureMenu: false,
      selectedBTF: null,
      clickedCoordinates: null,
      selectInteraction: null,
    };
  },
  computed: {
    ...mapGetters(["allLayerConfigs"]),
    ...mapGetters("Modules/AbimoHandler", [
      "isMeasurePlanning",
      "selectedMeasures",
      "isMeasureDrawing",
    ]),
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

    this.createInteractions();
  },
  watch: {
    activeStep(newStep) {
      // Wenn ein Schritt ausgewählt wurde und wir ein Feature ausgewählt haben
      if (newStep > 0 && this.selectedBTF) {
        this.addMeasureToMap(this.steps[newStep]);
      }
    },
  },
  methods: {
    ...mapMutations("Modules/AbimoHandler", [
      "setIsMeasureDrawing",
      "setIsMeasurePlanning",
      "setSelectedMeasures",
    ]),
    ...mapActions("Maps", {
      addInteractionToMap: "addInteraction",
      removeInteractionFromMap: "removeInteraction",
    }),
    createInteractions() {
      this.selectInteraction = new Select({
        multi: true,
        condition: singleClick,
        layers: [this.layer_abimo_btf],
        style: null,
      });

      // Event-Listener für die Auswahl
      this.selectInteraction.on("select", (event) => {
        console.log("[MeasureSelectorHandler] event::", event);
        console.log(
          "[MeasureSelectorHandler] event.selected ::",
          event.selected,
        );

        if (event.selected.length > 0) {
          this.selectedBTF = event.selected[0];
          this.clickedCoordinates = event.mapBrowserEvent.coordinate;

          console.log(
            "[MeasureSelectorHandler] this.clickedCoordinates::",
            this.clickedCoordinates,
          );

          this.showMeasureMenu = true;
          // Position für MeasureDrawer setzen oder direkt hier das Menü anzeigen
          this.setIsMeasureDrawing(true);
        } else {
          this.selectedBTF = null;
          this.showMeasureMenu = false;
          this.setIsMeasureDrawing(false);
        }
      });

      // Interaktion zur Karte hinzufügen
      this.addInteractionToMap(this.selectInteraction);
    },

    resetSelection() {
      this.showMeasureMenu = false;
      this.selectedBTF = null;
      this.clickedCoordinates = null;
      this.activeStep = 0;
      this.setIsMeasureDrawing(false);

      // Interaktion zurücksetzen
      if (this.selectInteraction) {
        this.selectInteraction.getFeatures().clear();
      }
    },
  },
  beforeUnmount() {
    // Interaktion entfernen, wenn die Komponente zerstört wird
    if (this.selectInteraction) {
      this.removeInteractionFromMap(this.selectInteraction);
    }
  },
};
</script>

<template lang="html">
  <MeasureSelectorMenu
    v-if="showMeasureMenu"
    :position="clickedCoordinates"
  />
</template>

<style lang="scss" scoped>
@import "~variables";
</style>

