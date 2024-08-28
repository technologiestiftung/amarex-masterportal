<script>
// import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import { mapGetters } from "vuex";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Feature from "ol/Feature";

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
        { property: "new_infiltration", style: "abimo_new_infiltration" },
        { property: "new_evaporation", style: "abimo_new_evaporation" },
        { property: "new_surface_runoff", style: "abimo_new_surface_runoff" },
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
          new_unpvd: this.newUnpvd,
        },
      };

      // add properties for each feature
      for (const feature of mapFeatures) {
        const properties = feature.getProperties();
        payload.features.push(properties);
      }

      try {
        // console.log("[AbimoHandler] payload::", payload);

        // const payload = {
        //   features: [{ feature: 1 }, { feature: 2 }, { feature: 3 }],
        //   targets: {
        //     new_green_roof: 0.35,
        //     new_to_swale: 0.2,
        //     new_unpvd: 0.17,
        //   },
        // };

        // const data = await getRabimo.getMultiblock(payload);
        // console.log("[AbimoMeasure] data::", data);

        const testResponse = [
          {
            code: "1100551151000000",
            area: 4951.854,
            new_surface_runoff: 291.224,
            new_infiltration: 153.208,
            new_evaporation: 187.569,
          },
          {
            code: "1100551171000000",
            area: 3406.417,
            new_surface_runoff: 299.907,
            new_infiltration: 146.991,
            new_evaporation: 184.102,
          },
          {
            code: "1100541281000000",
            area: 4985.961,
            new_surface_runoff: 403.332,
            new_infiltration: 78.991,
            new_evaporation: 145.677,
          },
        ];

        await this.processAndAddFeatures(mapFeatures, testResponse);
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

    createStyleForProperty(propertyName, value) {
      const colorMap = {
        new_infiltration: "rgba(0, 255, 0, ${opacity})",
        new_evaporation: "rgba(0, 0, 255, ${opacity})",
        new_surface_runoff: "rgba(255, 0, 0, ${opacity})",
      };

      const opacity = this.getOpacity(value || 0, 0, 672);
      const color = colorMap[propertyName].replace("${opacity}", opacity);

      return new Style({
        stroke: new Stroke({
          color: "rgba(0, 0, 0, 1)",
          width: 2,
        }),
        fill: new Fill({
          color: color,
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

    <button
      class="btn btn-primary"
      @click="testRabimoAPI"
    >
      <span
        v-if="isLoading"
        class="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      ></span>
      test API
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

