<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import { singleClick } from "ol/events/condition.js";
import { Select } from "ol/interaction";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Icon } from "ol/style";
import MeasureSelectorMenu from "./MeasureSelectorMenu.vue";

// MeasureSelectorHandler -> setzt die interaktion
// MeasureSelectorMenu -> zeigt das Menü an und setzt die Maßnahme
// MeasureDrawer -> zeigt die Maßnahme an und setzt sie in die Karte ein
// es muss alles im Store gespeichert werden

/**
 * Abimo Measure Selector Handler
 * @module modules/MeasureSelectorHandler
 */
export default {
  name: "MeasureSelectorHandler",
  components: {
    MeasureSelectorMenu,
  },
  data() {
    return {
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
          this.resetSelection();
        }
      });

      // Interaktion zur Karte hinzufügen
      this.addInteractionToMap(this.selectInteraction);
    },

    addMeasureToMap(measure, position) {
      if (!position || !this.selectedBTF) {
        return;
      }

      console.log("[MeasureSelectorHandler] Adding measure to map:", measure);

      // Neue Feature für die Maßnahme erstellen
      const measureFeature = new Feature({
        geometry: new Point(position),
        type: measure.id,
        featureId: this.selectedBTF.getId(), // Verknüpfung mit dem BTF-Feature
      });

      // Icon-Style basierend auf der Maßnahme setzen
      measureFeature.setStyle(
        new Style({
          image: new Icon({
            src: measure.icon,
            scale: 0.5, // Anpassen nach Bedarf
          }),
        }),
      );

      // Feature zum Measures-Layer hinzufügen
      this.layer_abimo_measures.getSource().addFeature(measureFeature);

      // Maßnahme zum Array hinzufügen (über Vuex)
      const newMeasure = {
        id: Date.now(), // Eindeutige ID
        type: measure.id,
        featureId: measureFeature.getId(),
        btfFeatureId: this.selectedBTF.getId(),
        position: position,
      };

      // Hinzufügen zum Vuex Store
      let currentMeasures = [...this.selectedMeasures];
      currentMeasures.push(newMeasure);
      this.setSelectedMeasures(currentMeasures);

      // Zurücksetzen nach dem Hinzufügen
      this.resetSelection();
    },

    resetSelection() {
      this.showMeasureMenu = false;
      this.selectedBTF = null;
      this.clickedCoordinates = null;
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
    @add-measure="addMeasureToMap"
    @close="resetSelection"
  />
</template>

<style lang="scss" scoped>
@import "~variables";
</style>
