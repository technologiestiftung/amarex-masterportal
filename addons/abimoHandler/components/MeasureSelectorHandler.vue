<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Icon, Fill, Circle } from "ol/style";
import MeasureSelectorMenu from "./MeasureSelectorMenu.vue";

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
      selectedMeasureFeature: null,
      markedForDeletion: null,
      isProcessingClick: false,
      trashIconPath:
        "../../../portal/amarex/resources/img/measure-trash-bin.svg",
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

    // click handler to manage interactions manually
    mapCollection.getMap("2D").on("click", this.handleMapClick);
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
    ...mapActions("Modules/AbimoHandler", ["updateMeasureStats"]),

    handleMapClick(event) {
      if (this.isProcessingClick) {
        return;
      }

      this.isProcessingClick = true;

      // Get features at click position
      const clickedFeatures = [];
      mapCollection
        .getMap("2D")
        .forEachFeatureAtPixel(event.pixel, (feature, layer) => {
          if (layer === this.layer_abimo_measures) {
            clickedFeatures.push({ feature, layer, type: "measure" });
          } else if (layer === this.layer_abimo_btf) {
            clickedFeatures.push({ feature, layer, type: "btf" });
          }
        });

      // store clicked coordinates
      this.clickedCoordinates = event.coordinate;

      // First check if we clicked on a measure
      const clickedMeasure = clickedFeatures.find(
        (item) => item.type === "measure",
      );
      if (clickedMeasure) {
        const feature = clickedMeasure.feature;

        // Check if this is the feature we already marked for deletion
        if (
          this.markedForDeletion &&
          this.markedForDeletion.getId() === feature.getId()
        ) {
          // Second click on the same feature - delete it
          this.deleteMeasure(feature);
        } else {
          // First click - reset any previous selection
          this.resetSelection();

          // Mark this feature for deletion and replace its icon
          this.markFeatureForDeletion(feature);
        }

        this.isProcessingClick = false;
        return;
      }

      // If no measure was clicked, reset the trash icon if any
      if (this.markedForDeletion) {
        this.restoreOriginalIcon();
      }

      // If no measure was clicked, check for BTF
      const clickedBtf = clickedFeatures.find((item) => item.type === "btf");
      if (clickedBtf) {
        this.selectedBTF = clickedBtf.feature;
        this.showMeasureMenu = true;
        this.setIsMeasureDrawing(true);
      } else {
        // Clicked on nothing, reset everything
        this.resetSelection();
      }

      this.isProcessingClick = false;
    },

    markFeatureForDeletion(feature) {
      // Store the feature marked for deletion
      this.markedForDeletion = feature;

      // Save original properties for restoration if needed
      const size = feature.get("size") || "medium";
      const originalProps = {
        originalSize: size,
        originalStyle: feature.getStyle(),
      };

      // Set properties on the feature to restore later
      feature.set("_deleteProps", originalProps);

      // Get the appropriate circle radius based on size
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

      // Set the trash icon style
      feature.setStyle([
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
            src: this.trashIconPath,
            scale: iconScale,
            anchor: [0.5, 0.5],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
          }),
        }),
      ]);

      // Trigger a map redraw to show the new icon
      mapCollection.getMap("2D").render();
    },

    restoreOriginalIcon() {
      if (this.markedForDeletion) {
        const deleteProps = this.markedForDeletion.get("_deleteProps");
        if (deleteProps && deleteProps.originalStyle) {
          this.markedForDeletion.setStyle(deleteProps.originalStyle);
          this.markedForDeletion.unset("_deleteProps");
        }
        this.markedForDeletion = null;

        // Trigger a map redraw to show the original icon
        mapCollection.getMap("2D").render();
      }
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

      const measureFeature = new Feature({
        geometry: new Point(position),
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
        ...measure,
        featureId: measureFeature.getId(),
        size: size,
        measureFeature: measureFeature,
      };

      let currentMeasures = [...this.selectedMeasures];
      currentMeasures.push(newMeasure);
      this.setSelectedMeasures(currentMeasures);

      this.updateMeasureStats();
      this.resetSelection();
    },

    resetSelection() {
      this.showMeasureMenu = false;
      this.selectedBTF = null;
      this.setIsMeasureDrawing(false);
    },

    deleteMeasure(feature) {
      if (!feature) {
        return;
      }

      // remove feature from map
      this.layer_abimo_measures.getSource().removeFeature(feature);

      // remove feature from selected measures
      const featureId = feature.getId();
      let currentMeasures = [...this.selectedMeasures];

      // FIXME: featureId is undefined! deshalb sind die SelectedMeasures leer!
      currentMeasures = currentMeasures.filter(
        (measure) => measure.featureId !== featureId,
      );

      console.log(
        "[MeasureSelectorHandler] currentMeasures::",
        currentMeasures,
      );

      this.setSelectedMeasures(currentMeasures);
      this.markedForDeletion = null;
      this.updateMeasureStats();
    },
  },
  beforeUnmount() {
    // Remove map click handler
    if (mapCollection && mapCollection.getMap("2D")) {
      mapCollection.getMap("2D").un("click", this.handleMapClick);
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

.delete-option {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.delete-button {
  width: 60px;
  height: 60px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  pointer-events: auto;

  &:hover {
    background-color: #f8f8f8;
  }
}

.delete-icon-wrapper {
  width: 40px;
  height: 40px;
  background-color: #444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  i {
    color: white;
    font-size: 20px;
  }
}
</style>

