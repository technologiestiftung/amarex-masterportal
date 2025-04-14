<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import { singleClick } from "ol/events/condition.js";
import { Select } from "ol/interaction";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Icon, Fill, Circle } from "ol/style";
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

      this.selectInteraction.on("select", (event) => {
        if (event.selected.length > 0) {
          this.selectedBTF = event.selected[0];
          this.clickedCoordinates = event.mapBrowserEvent.coordinate;
          this.showMeasureMenu = true;
          this.setIsMeasureDrawing(true);
        } else {
          this.resetSelection();
        }
      });
      this.addInteractionToMap(this.selectInteraction);
    },

    addMeasureToMap(measure, position, size) {
      if (!position || !this.selectedBTF) {
        return;
      }

      let circleRadius;
      let iconScale = 1;

      switch (size) {
        case "small":
          circleRadius = 20;
          iconScale = 0.8;
          break;
        case "medium":
          circleRadius = 30;
          iconScale = 1;
          break;
        case "large":
          circleRadius = 40;
          iconScale = 1;
          break;
        default:
          circleRadius = 20;
          iconScale = 0.8;
      }

      // Neue Feature für die Maßnahme erstellen
      const measureFeature = new Feature({
        geometry: new Point(position),
        type: measure.id,
        featureId: this.selectedBTF.getId(),
      });

      measureFeature.setStyle([
        new Style({
          image: new Circle({
            radius: circleRadius,
            fill: new Fill({
              color: "rgba(255, 255, 255, 0.75)",
            }),
          }),
        }),
        new Style({
          image: new Icon({
            src: measure.icon,
            scale: iconScale,
            anchor: [0.5, 0.5],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
          }),
        }),
      ]);

      this.layer_abimo_measures.getSource().addFeature(measureFeature);

      const newMeasure = {
        id: Date.now(),
        type: measure.id,
        featureId: measureFeature.getId(),
        btfFeatureId: this.selectedBTF.getId(),
        position: position,
        size: size,
      };

      let currentMeasures = [...this.selectedMeasures];
      currentMeasures.push(newMeasure);
      this.setSelectedMeasures(currentMeasures);

      this.resetSelection();
    },

    resetSelection() {
      this.showMeasureMenu = false;
      this.selectedBTF = null;
      this.clickedCoordinates = null;
      this.setIsMeasureDrawing(false);

      if (this.selectInteraction) {
        this.selectInteraction.getFeatures().clear();
      }
    },
  },
  beforeUnmount() {
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

