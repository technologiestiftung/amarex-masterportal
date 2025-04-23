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
      trashIconPath: "./resources/img/measure-trash-bin.svg",
      showAlert: false,
    };
  },
  computed: {
    ...mapGetters(["allLayerConfigs"]),
    ...mapGetters("Modules/AbimoHandler", [
      "isMeasurePlanning",
      "selectedMeasures",
      "isMeasureDrawing",
      "hasMeasures",
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
  watch: {
    selectedMeasures: {
      handler(newMeasures) {
        this.setHasMeasures(newMeasures && newMeasures.length > 0);
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    ...mapMutations("Modules/AbimoHandler", [
      "setIsMeasureDrawing",
      "setIsMeasurePlanning",
      "setSelectedMeasures",
      "setHasMeasures",
    ]),
    ...mapActions("Maps", {
      addInteractionToMap: "addInteraction",
      removeInteractionFromMap: "removeInteraction",
    }),
    ...mapActions("Modules/AbimoHandler", [
      "updateMeasureStats",
      "canAddMeasure",
    ]),
    ...mapActions("Alerting", ["addSingleAlert"]),

    handleMapClick(event) {
      if (this.isProcessingClick) {
        return;
      }

      this.isProcessingClick = true;

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

      this.clickedCoordinates = event.coordinate;

      // First check if we clicked on a measure
      const clickedMeasure = clickedFeatures.find(
        (item) => item.type === "measure",
      );
      if (clickedMeasure) {
        const feature = clickedMeasure.feature;

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
      if (this.markedForDeletion) {
        this.restoreOriginalIcon();
      }

      const clickedBtf = clickedFeatures.find((item) => item.type === "btf");
      if (clickedBtf) {
        this.selectedBTF = clickedBtf.feature;
        this.showMeasureMenu = true;
        this.setIsMeasureDrawing(true);
      } else {
        this.resetSelection();
      }

      this.isProcessingClick = false;
    },

    markFeatureForDeletion(feature) {
      this.markedForDeletion = feature;

      const size = feature.get("size") || "medium";
      const originalProps = {
        originalSize: size,
        originalStyle: feature.getStyle(),
      };

      feature.set("_deleteProps", originalProps);

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

        mapCollection.getMap("2D").render();
      }
    },

    async addMeasureToMap(measure, position, size) {
      if (!position || !this.selectedBTF) {
        return;
      }

      const measureFeature = new Feature({
        geometry: new Point(position),
      });

      const uniqueId = "measure-" + Date.now();
      measureFeature.setId(uniqueId);
      const featureId = measureFeature.getId();

      const tempMeasure = {
        id: Date.now(),
        ...measure,
        size: size,
        measureFeature: measureFeature,
        featureId: featureId,
      };

      // Check if we can add this measure
      const { canAdd, message } = await this.canAddMeasure({
        tempMeasure,
        measureType: measure.type,
      });

      if (!canAdd) {
        console.log("[MeasureSelectorHandler] display error message::");
        this.showAlert = true;

        this.addSingleAlert({
          category: "error",
          content: message,
        });

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
        featureId: featureId,
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

      this.layer_abimo_measures.getSource().removeFeature(feature);

      const featureId = feature.getId();
      let currentMeasures = [...this.selectedMeasures];

      currentMeasures = currentMeasures.filter(
        (measure) => measure.featureId !== featureId,
      );
      this.setSelectedMeasures(currentMeasures);
      this.markedForDeletion = null;
      this.updateMeasureStats();
    },
  },
  beforeUnmount() {
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

