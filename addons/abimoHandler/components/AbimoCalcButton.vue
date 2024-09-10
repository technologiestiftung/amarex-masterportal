<script>
// import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import { mapGetters } from "vuex";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Feature from "ol/Feature";
import getRabimo from "../api/getRabimo";

/**
 * AbimoCalcButton
 * @module modules/AbimoCalcButton
 */
export default {
  name: "AbimoCalcButton",
  components: {},
  data() {
    return {
      isLoading: false,
      helperText: "",
      isCalculated: false,
    };
  },
  computed: {
    ...mapGetters("Modules/AbimoHandler", [
      "selectedFeatures",
      "newGreenRoof",
      "newUnpvd",
      "newToSwale",
    ]),
  },
  mounted() {
    this.layer_abimo_calculated = mapCollection
      .getMap("2D")
      .getLayers()
      .getArray()
      .find((layer) => layer.get("id") === "planung_abimo");

    this.layer_abimo_result_infiltration = mapCollection
      .getMap("2D")
      .getLayers()
      .getArray()
      .find((layer) => layer.get("id") === "abimo_result_infiltration");

    this.layer_abimo_result_evaporation = mapCollection
      .getMap("2D")
      .getLayers()
      .getArray()
      .find((layer) => layer.get("id") === "abimo_result_evaporation");

    this.layer_abimo_result_surface_run_off = mapCollection
      .getMap("2D")
      .getLayers()
      .getArray()
      .find((layer) => layer.get("id") === "abimo_result_surface_run_off");
  },
  methods: {
    async processAndAddFeatures(features, response) {
      const layers = [
        this.layer_abimo_result_infiltration,
        this.layer_abimo_result_evaporation,
        this.layer_abimo_result_surface_run_off,
      ];

      // Clear all layers
      layers.forEach((layer) => layer.getSource().clear());
      this.layer_abimo_calculated.values_.source.clear();

      const createFeatureForLayer = (featureData, values, propertyName) => {
        // console.log("[AbimoCalcButton] values::", values);

        const newFeature = new Feature({
          geometry: featureData.getGeometry(),
          [propertyName]: values[propertyName] || 500,
        });

        const style = this.createStyleForProperty(
          propertyName,
          values[propertyName] || 0,
        );
        newFeature.setStyle(style);

        return newFeature;
      };

      const layerData = [
        { property: "infiltration", style: "abimo_new_infiltration" },
        { property: "evaporation", style: "abimo_new_evaporation" },
        { property: "surface_runoff", style: "abimo_new_surface_runoff" },
      ];

      layerData.forEach((data, index) => {
        const newFeatures = features.map((featureData) => {
          const values = response.find(
            (item) => item.code === featureData.getProperties().code,
          );
          return createFeatureForLayer(featureData, values, data.property);
        });

        // Add features directly to the layer
        layers[index].getSource().addFeatures(newFeatures);
      });

      this.isCalculated = true;
    },

    /**
     * Fetches multiblock data, processes it, and updates the map features accordingly.
     * @return {Promise<void>} A promise that resolves when the data has been fetched and processed.
     */
    async fetchCalculateMultiblock() {
      const mapFeatures =
        this.layer_abimo_calculated.values_.source.getFeatures();

      // get multiblock data
      let payload = {
        features: [],
        targets: {
          new_green_roof: this.newGreenRoof,
          new_to_swale: this.newToSwale,
          // new_unpvd: this.newUnpvd,
          new_pvd: this.newUnpvd,
        },
      };

      // add properties for each feature
      for (const feature of mapFeatures) {
        const properties = feature.getProperties();
        const filteredProperties = { ...properties };
        payload.features.push(filteredProperties);
      }

      try {
        const data = await getRabimo.getMultiblock(payload);
        // console.log("[AbimoMeasure] data::", data);

        await this.processAndAddFeatures(mapFeatures, data);
        this.isCalculated = true;
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
        this.isLoading = false;
        this.helperText = "Fehler beim Abrufen der Daten";
      }
    },

    getOpacity(value, min = 0, max = 672) {
      const normalized = (value - min) / (max - min);
      return Math.max(0, Math.min(1, normalized));
    },
    // Hilfsfunktion zur Berechnung der Intensität
    getIntensity(value, min, max) {
      return Math.max(0, Math.min(1, (value - min) / (max - min)));
    },
    createStyleForProperty(propertyName, value) {
      const colorMap = {
        infiltration: [0, 255, 0], // Green
        evaporation: [0, 0, 255], // Blue
        surface_runoff: [255, 0, 0], // Red
      };

      const intensity = this.getIntensity(value || 0, 0, 672);
      const baseColor = colorMap[propertyName];

      // Berechne die Farbe basierend auf der Intensität
      const color = baseColor.map((channel) =>
        Math.round(channel + (255 - channel) * (1 - intensity)),
      );

      return new Style({
        stroke: new Stroke({
          color: "rgba(0, 0, 0, 1)",
          width: 2,
        }),
        fill: new Fill({
          color: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
        }),
      });
    },
  },
};
</script>

<template lang="html">
  <div
    id="AbimoCalcButton-root"
    class="d-flex flex-column gap-3"
  >
    <div
      v-if="isCalculated"
      class="layer-abimo-calculated"
    ></div>

    <button
      class="btn btn-primary"
      @click="fetchCalculateMultiblock"
    >
      Blockteilflächen berechnen
    </button>
    <span
      v-if="helperText"
      class="helper-text"
      aria-hidden="true"
      >{{ helperText }}</span
    >
  </div>
</template>

<style lang="scss" scoped>
.helper-text {
  color: red;
  margin-left: 12px;
}
</style>

