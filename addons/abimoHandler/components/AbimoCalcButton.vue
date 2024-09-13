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
          [propertyName]: values[propertyName] || 0,
        });

        const style = this.createStyleForProperty(
          propertyName,
          values[propertyName] || 0,
        );
        newFeature.setStyle(style);

        return newFeature;
      };

      const layerData = [
        { property: "infiltr", style: "abimo_new_infiltration" },
        { property: "evapor", style: "abimo_new_evaporation" },
        { property: "runoff", style: "abimo_new_surface_runoff" },
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
        console.log("[AbimoMeasure] data::", data);

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
        infiltr: [
          { range: [-400, 0], color: [255, 255, 255] }, // Weiß
          { range: [0, 60], color: [11, 228, 87] }, // Hellgrün (Ausgangsfarbe)
          { range: [60, 80], color: [0, 200, 80] }, // Dunkleres Grün
          { range: [80, 100], color: [0, 180, 70] }, // Dunkleres Grün
          { range: [100, 120], color: [0, 160, 60] }, // Dunkleres Grün
          { range: [120, 140], color: [0, 140, 50] }, // Dunkleres Grün
          { range: [140, 160], color: [0, 120, 40] }, // Dunkleres Grün
          { range: [160, 180], color: [0, 100, 30] }, // Dunkleres Grün
          { range: [180, 200], color: [0, 80, 20] }, // Sehr dunkles Grün
          { range: [200, 300], color: [0, 60, 10] }, // Sehr dunkles Grün
          { range: [300, 400], color: [0, 40, 0] }, // Fast Schwarz
          { range: [400, 500], color: [0, 0, 0] }, // Schwarz
        ],
        evapor: [
          { range: [0, 50], color: [255, 255, 255] }, // Weiß
          { range: [50, 100], color: [220, 240, 255] }, // Sehr helles Blau
          { range: [100, 120], color: [180, 210, 255] }, // Helleres Blau
          { range: [120, 140], color: [140, 190, 255] }, // Mittelblau
          { range: [140, 160], color: [100, 170, 255] }, // Dunkleres Blau
          { range: [160, 180], color: [70, 150, 240] }, // Dunkleres Blau
          { range: [180, 200], color: [50, 130, 220] }, // Dunkleres Blau
          { range: [200, 220], color: [30, 110, 210] }, // Sehr dunkles Blau
          { range: [220, 240], color: [20, 90, 200] }, // Sehr dunkles Blau
          { range: [240, 260], color: [10, 70, 180] }, // Sehr dunkles Blau
          { range: [260, 280], color: [10, 60, 160] }, // Sehr dunkles Blau
          { range: [280, 300], color: [0, 50, 140] }, // Fast Schwarz
          { range: [300, 400], color: [0, 40, 100] }, // Sehr dunkles Blau
          { range: [400, 500], color: [0, 20, 80] }, // Noch dunkler
          { range: [500, 600], color: [0, 0, 50] }, // Fast Schwarz
        ],
        runoff: [
          { range: [0, 50], color: [255, 255, 255] }, // Weiß
          { range: [50, 100], color: [228, 25, 11] }, // Rot (Ausgangsfarbe)
          { range: [100, 120], color: [240, 90, 60] }, // Helleres Rot
          { range: [120, 140], color: [230, 70, 50] }, // Helleres Rot
          { range: [140, 160], color: [220, 50, 40] }, // Helleres Rot
          { range: [160, 180], color: [200, 30, 30] }, // Helleres Rot
          { range: [180, 200], color: [180, 20, 20] }, // Dunkleres Rot
          { range: [200, 220], color: [160, 10, 10] }, // Dunkleres Rot
          { range: [220, 240], color: [140, 0, 0] }, // Dunkleres Rot
          { range: [240, 260], color: [120, 0, 0] }, // Dunkleres Rot
          { range: [260, 280], color: [100, 0, 0] }, // Sehr dunkles Rot
          { range: [280, 300], color: [80, 0, 0] }, // Sehr dunkles Rot
          { range: [300, 400], color: [60, 0, 0] }, // Sehr dunkles Rot
          { range: [400, 500], color: [40, 0, 0] }, // Noch dunkler
          { range: [500, 600], color: [0, 0, 0] }, // Schwarz
        ],
      };

      function findColor(value, ranges) {
        for (const rangeObj of ranges) {
          const [min, max] = rangeObj.range;
          if (value >= min && value < max) {
            return rangeObj.color;
          }
        }
        return ranges[ranges.length - 1].color;
      }
      const ranges = colorMap[propertyName] || [];
      const color = findColor(value, ranges);

      return new Style({
        stroke: new Stroke({
          color: "rgba(84, 187, 168, 1)",
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

