<script>
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
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
  },
  methods: {
    /**
     * Maps the selected features to new features with updated values based on the response.
     * @param {Array} response - The response object containing the updated values for each feature.
     * @return {Array} An array of new features with updated values.
     */
    async mapToolFeatures(features, response) {
      this.layer_abimo_calculated.values_.source.clear();

      return features.map((featureData) => {
        const values = response.find(
          (item) => item.code === featureData.getProperties().code,
        );
        return new Feature({
          ...featureData.values_,
          geometry: featureData.getGeometry(),
          new_evaporation: values?.evaporation || 200,
          new_infiltration: values?.infiltration || 500,
          new_surface_runoff: values?.surface_runoff || 10,
        });
      });
    },
    /**
     * Fetches multiblock data, processes it, and updates the map features accordingly.
     * @return {Promise<void>} A promise that resolves when the data has been fetched and processed.
     */
    async fetchCalculateMultiblock() {
      const mapFeatures =
        this.layer_abimo_calculated.values_.source.getFeatures();
      console.log("[AbimoCalcButton]  mapFeatures::", mapFeatures);

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
        // const data = await getRabimo.getMultiblock(payload);
        // console.log("[AbimoMeasure] data::", data);

        const testResponse = [
          {
            code: "1100541271000000",
            area: 4951.854,
            surface_runoff: 291.224,
            infiltration: 153.208,
            evaporation: 187.569,
          },
          {
            code: "1100551171000000",
            area: 3406.417,
            surface_runoff: 299.907,
            infiltration: 146.991,
            evaporation: 184.102,
          },
          {
            code: "1100541281000000",
            area: 4985.961,
            surface_runoff: 403.332,
            infiltration: 78.991,
            evaporation: 145.677,
          },
        ];

        // map response to features
        const olFeatures = await this.mapToolFeatures(
          mapFeatures,
          testResponse,
        );

        // Aufgabe: 3 Layer mit den jeweiligen Werten anlegen oder einen Layer filtern?
        for (const feature of olFeatures) {
          const properties = feature.getProperties();
          this.createStyle(properties)[0];

          // feature.setStyle("abimo");
          feature.setStyle(this.createStyle(properties)[1]);
        }

        this.addToLayer(olFeatures);
        this.isCalculated = true;
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
        this.isLoading = false;
        this.helperText = "Fehler beim Abrufen der Daten";
      }
    },

    getColorWithOpacity(value, min = 0, max = 672) {
      const normalized = (value - min) / (max - min);
      const opacity = Math.max(0, Math.min(1, normalized));

      return {
        runoff: `rgba(255, 0, 0, ${opacity})`,
        infiltration: `rgba(0, 255, 0, ${opacity})`,
        evaporation: `rgba(0, 0, 255, ${opacity})`,
      };
    },

    /**
     * Transforms imported geodata into a style object based on predefined color rules.
     * @param {Object} properties - An object containing geodata properties.
     * @return {Style} A style object with stroke and fill properties.
     */
    createStyle(properties) {
      // This function transform importet geodata
      const styleObject = styleList.returnStyleObject("abimo");
      console.log("[AbimoCalcButton] styleObject::", styleObject);

      const surfaceRunoff = properties.new_surface_runoff;
      const infiltration = properties.new_infiltration;
      const evaporation = properties.new_evaporation;

      // Berechnete Farben für jeden Wert
      const runoffColor = this.getColorWithOpacity(surfaceRunoff).runoff;
      const infiltrationColor =
        this.getColorWithOpacity(infiltration).infiltration;
      const evaporationColor =
        this.getColorWithOpacity(evaporation).evaporation;

      return [
        new Style({
          stroke: new Stroke({
            color: `rgba(255, 0, 0, 1)`,
            width: 2,
          }),
          fill: new Fill({
            color: runoffColor,
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: `rgba(255, 0, 0, 1)`,
            width: 2,
          }),
          fill: new Fill({
            color: infiltrationColor,
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: `rgba(255, 0, 0, 1)`,
            width: 2,
          }),
          fill: new Fill({
            color: evaporationColor,
          }),
        }),
      ];
    },

    /**
     * Adds calculated features to the abimo calculated layer.
     * @param {Array<Feature>} calculatedFeatures - The features to be added to the layer.
     * @return {void}
     */
    addToLayer(calculatedFeatures) {
      this.layer_abimo_calculated.values_.source.addFeatures(
        calculatedFeatures,
      );
    },
    selectedStyle(styleId) {
      console.log("[AbimoCalcButton] styleId::", styleId);
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
    >
      <label
        for="styleSelect"
        class="style-label"
      >
        {{ "choose layer" }}
      </label>
      <select
        id="styleSelect"
        class="form-select form-select-sm"
        @change="updateStyle($event.target.value)"
      >
        <option
          v-for="style in [
            { id: 'surface_run_off' },
            { id: 'infiltration' },
            { id: 'evaporation' },
          ]"
          :key="style.id"
          class="float-start"
          :value="style.id"
          :selected="selectedStyle(style.id)"
        >
          {{ style.id }}
        </option>
      </select>
    </div>

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

