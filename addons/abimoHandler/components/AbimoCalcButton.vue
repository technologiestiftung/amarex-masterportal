<script>
import { mapGetters } from "vuex";
import Feature from "ol/Feature";
import getRabimo from "../api/getRabimo";

/**
 * AbimoCalcButton
 * @module modules/AbimoCalcButton
 */
export default {
  name: "AbimoCalcButton",
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

    this.layer_abimo_result_delta_w = mapCollection
      .getMap("2D")
      .getLayers()
      .getArray()
      .find((layer) => layer.get("id") === "abimo_result_delta_w");
  },
  methods: {
    async processAndAddFeatures(features, response) {
      const layers = [
        this.layer_abimo_result_infiltration,
        this.layer_abimo_result_evaporation,
        this.layer_abimo_result_surface_run_off,
        this.layer_abimo_result_delta_w,
      ];

      // Clear all layers
      layers.forEach((layer) => layer.getSource().clear());
      this.layer_abimo_calculated.values_.source.clear();

      const createFeatureForLayer = (featureData, values, propertyName) => {
        const newFeature = new Feature({
          geometry: featureData.getGeometry(),
          [propertyName]: values[propertyName] || 0,
        });

        const styleId = layerData.find(
          (data) => data.property === propertyName,
        );
        newFeature.set("styleId", styleId);

        return newFeature;
      };

      const layerData = [
        { property: "infiltr", style: "abimo_result_infiltration" },
        { property: "evapor", style: "abimo_result_evaporation" },
        { property: "runoff", style: "abimo_result_surface_run_off" },
        { property: "delta_w", style: "abimo_result_delta_w" },
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

      this.changeCalcState("isCalculated");
    },

    /**
     * Fetches multiblock data, processes it, and updates the map features accordingly.
     * @return {Promise<void>} A promise that resolves when the data has been fetched and processed.
     */
    async fetchCalculateMultiblock() {
      this.changeCalcState("loading");
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
        // TODO add real data
        const dataWithDeltaW = data.map((item) => {
          return {
            ...item,
            delta_w: Math.floor(Math.random() * 100),
          };
        });
        // TODO add real data
        await this.processAndAddFeatures(mapFeatures, dataWithDeltaW);
        this.changeCalcState("isCalculated");
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
        this.changeCalcState("error");
      }
    },
  },
  props: {
    wording: {
      type: String,
      default: "Berechnen",
    },
    changeCalcState: {
      type: Function,
      required: true,
    },
  },
};
</script>

<template lang="html">
  <button
    class="amarex-btn-primary full accent"
    @click="fetchCalculateMultiblock"
  >
    <p>{{ wording }}</p>
  </button>
</template>

