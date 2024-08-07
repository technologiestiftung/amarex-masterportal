<script>
import { mapActions, mapGetters } from "vuex";
import Feature from "ol/Feature";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { Select } from "ol/interaction";
import AbimoAccordion from "./AbimoAccordion.vue";
import getRabimo from "../api/getRabimo";
import helper from "../utils/helper";
import areaCalc from "../utils/areaCalculations";

/**
 * Abimo
 * @module modules/AbimoHandler
 */
export default {
  name: "AbimoHandler",
  components: {
    AbimoAccordion,
  },
  data() {
    return {
      isLoading: false,
      selectedFeatures: [],
      accumulatedAbimoStats: {
        featuresSelected: 0,
        totalArea: 0,
        averageEvaporation: 0,
        averageSwale: 0,
        averageRinse: 0,
      },
      sliders: [
        {
          id: "green_roof",
          label: "Dachbegrünung (% der Dachfläche)",
          value: 0,
        },
        {
          id: "to_swale",
          label: "Versickerungsmulde",
          value: 0,
        },
        {
          id: "not_pvd",
          label: "Unversiegelte Fläche",
          value: 0,
        },
      ],
      selectInteraction: null,
      layer: null,
      steps: [
        {
          id: 1,
          label: "Vorberechnete Modelle",
          description:
            "Zur Status Quo Analyse können Sie mit den vorberechneten Karten aus dem Kartenkatalog starten",
          isActive: false,
          buttons: [
            {
              id: 1,
              label: "Zum Katalog",
              isDisabled: false,
            },
            {
              id: 2,
              label: "Überspringen",
              isDisabled: false,
            },
          ],
        },
        {
          id: 2,
          label: "Untersuchungsgebiet Definieren",
          description:
            "Wählen Sie in der Karte die Blockteilflächen via Mausklick aus, die Sie untersuchen möchten.",
          isActive: false,
          buttons: [
            {
              id: 1,
              label: "Bestätigen",
              isDisabled: false,
            },
          ],
        },
        {
          id: 3,
          label: "Klimaszenario wählen",
          description:
            "Wählen Sie das Referenyszenario für die Berechnungen aus, weitere Informationen zu den Referenzszenarios finden Sie in unserer Dokumentation.",
          isActive: false,
          buttons: [
            {
              id: 1,
              label: "Bestätigen",
              isDisabled: true,
            },
          ],
        },
        {
          id: 4,
          label: "Maßnahmen auswählen",
          description:
            "Wählen Sie anteilsmäßig die Maßnahmen, die Sie in die Berechnung einfließen lassen wollen.",
          isActive: true,
          buttons: [
            {
              id: 1,
              label: "Bestätigen",
              isDisabled: true,
            },
          ],
        },
        {
          id: 5,
          label: "DeltaW Berechnung",
          description:
            "Fügen Sie nun den berechneten DeltaW-Layer hinzu. Des Weiteren stehen ihnen weitere Ergebnislayer zur Verfügung.",
          isActive: false,
          buttons: [
            {
              id: 1,
              label: "Layer Einfügen",
              isDisabled: true,
            },
          ],
        },
        {
          id: 6,
          label: "Weitere Berechnung",
          description:
            "Wenn Sie weitere Berchnungen mit veränderten Parametern vornehmen möchten, klicken Sie hier auf Neu Berechnen.",
          isActive: false,
          buttons: [
            {
              id: 1,
              label: "Neu Berechnen",
              isDisabled: true,
            },
          ],
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["configJs"]),
  },
  mounted() {
    this.createInteractions();
    // this.addInteractions();
    this.layer_abimo_altered = mapCollection
      .getMap("2D")
      .getLayers()
      .getArray()
      .find((layer) => layer.get("id") === "planung_abimo");

    this.layer_rabimo_input = mapCollection
      .getMap("2D")
      .getLayers()
      .getArray()
      .find((layer) => layer.get("id") === "rabimo_input_2020");
  },
  methods: {
    ...mapActions("Maps", {
      addInteractionToMap: "addInteraction",
      removeInteractionFromMap: "removeInteraction",
    }),
    /**
     * Creates the interactions for selecting features.
     * @returns {void}
     */
    createInteractions: function () {
      // From open layers we imported the Select class. This adds the possibility to add "blocks" to our feature layer. For further info check OpenLayers Docs
      const selectInteraction = new Select({
        multi: true,
        layers: function (layer) {
          return layer.get("id") === "abimo_2020_wfs";
        },
      });

      // Add the interaction to the components methods
      this.selectInteraction = selectInteraction;

      // Checks for condition "is selected" loads data from abimo and rabimo_input and creates a merged feature out of them
      selectInteraction.on("select", (event) => {
        event.selected.forEach((feature) => {
          const featureCode = feature.values_.code;
          const inputFeature = this.getInputFeature(featureCode);
          this.adjustSliders(inputFeature);

          const mergedFeature = new Feature({
            geometry: feature.getGeometry(),
            ...feature.getProperties(),
            ...inputFeature,
          });
          this.selectedFeatures.push(mergedFeature);
        });

        event.deselected.forEach((feature) => {
          const featureCode = feature.values_.code;
          this.selectedFeatures = this.selectedFeatures.filter(
            (f) => f.values_.code !== featureCode,
          );
        });
        this.updateAccumulatedStats();
      });
      // registers interaction in module - check masterportal docu
      this.addInteractionToMap(selectInteraction);
    },
    getInputFeature(featureCode) {
      // features are stored in an Object IDed with numbers. This function returns each ID in an array to iterate over them
      const featureKeys = Object.keys(
        this.layer_rabimo_input.values_.source.featuresRtree_.items_,
      );

      // This function returns the featureKey with the same code
      const equivalentFeatureKey = featureKeys.find(
        (key) =>
          this.layer_rabimo_input.values_.source.featuresRtree_.items_[key]
            .value.values_.code === featureCode,
      );
      return this.layer_rabimo_input.values_.source.featuresRtree_.items_[
        equivalentFeatureKey
      ].value.values_;
    },
    adjustSliders(feature) {
      // TODO: check values
      // console.log("adjustSliders(feature)", feature);
      this.sliders[0].value = Number(feature.green_roof).toFixed(2) * 100;
      this.sliders[1].value = Number(feature.to_swale).toFixed(2) * 100;
      this.sliders[2].value = Number((1 - feature.pvd).toFixed(2) * 100);
    },
    updateAccumulatedStats() {
      const totalFeatures = this.selectedFeatures.length;
      const totalArea = areaCalc.getTotalArea(this.selectedFeatures);
      const averageEvaporation = areaCalc.calculateAttributeAverage(
        this.selectedFeatures,
        "evaporatio",
      );
      const averageSwale = areaCalc.calculateAttributeAverage(
        this.selectedFeatures,
        "infiltrati",
      );
      const averageRinse = areaCalc.calculateAttributeAverage(
        this.selectedFeatures,
        "surface_ru",
      );

      this.accumulatedAbimoStats = {
        featuresSelected: totalFeatures,
        totalArea: totalArea,
        averageEvaporation: averageEvaporation,
        averageSwale: averageSwale,
        averageRinse: averageRinse,
      };
    },
    createStyle(properties) {
      // This function transform importet geodata, in this case our Evaporatio to a hard coded colour code.
      const rules = [
        { min: 0, max: 70, color: [255, 0, 0, 1] },
        { min: 71, max: 140, color: [226, 28, 0, 1] },
        { min: 141, max: 210, color: [198, 56, 0, 1] },
        { min: 211, max: 280, color: [170, 85, 0, 1] },
        { min: 281, max: 350, color: [141, 113, 0, 1] },
        { min: 351, max: 420, color: [113, 142, 0, 1] },
        { min: 421, max: 490, color: [85, 170, 0, 1] },
        { min: 491, max: 560, color: [56, 199, 0, 1] },
        { min: 561, max: 630, color: [28, 227, 0, 1] },
        { min: 631, max: 3000, color: [0, 255, 0, 1] },
      ];

      let matchingRule = rules.find(
        (rule) => properties.row >= rule.min && properties.row <= rule.max,
      );
      let fillColor = matchingRule ? matchingRule.color : [255, 14, 14, 1];

      return new Style({
        stroke: new Stroke({
          color: helper.measuresToRGB(
            properties.evaporation,
            properties.infiltration,
            properties.surface_runoff,
          ),
          width: 2,
        }),
        fill: new Fill({
          color: fillColor,
        }),
      });
    },
    /*
     * transform imported data to OpenLayers Feature maps based on slider values
     * @param {Array} featuresArray - Array of imported features
     * @returns {Array} - Array of OpenLayers Features
     */
    mapToolFeatures(selectedFeatures) {
      // featuresArray === this.selectedFeatures === feature selection from this.layer_rabimo_input
      const sliderValues = this.sliders.map((slider) => slider.value);

      return selectedFeatures.map((featureData) => {
        //copies the equivalent feature from the selection (data.features), creates a new Feature object from the OpenLayers class and adds further properties within the object
        const olFeature = new Feature({
          ...featureData.values_,
          geometry: featureData.getGeometry(),
          new_green_roof: sliderValues[0],
          new_to_swale: sliderValues[1],
          new_pvd: sliderValues[2],
        });

        return olFeature;
      });
    },
    addToLayer(calculatedFeatures) {
      this.layer_abimo_altered.values_.source.addFeatures(calculatedFeatures);
    },
    logFunctionsAndProperties(obj) {
      const methods = Object.getOwnPropertyNames(obj).filter(
          (key) => typeof obj[key] === "function",
        ),
        properties = Object.getOwnPropertyNames(obj).filter(
          (key) => typeof obj[key] !== "function",
        );

      console.warn(methods);
      console.warn(properties);
      console.warn(JSON.stringify(obj));
    },
    calculatePercentages(feature) {
      const evaporation = Math.floor(parseFloat(feature.values_.evaporatio));
      const rinse = Math.floor(parseFloat(feature.values_.ri));
      const runoff = Math.floor(parseFloat(feature.values_.row));

      const total = evaporation + rinse + runoff;

      const evaporationPercentage = (evaporation / total) * 100 - 0.5;
      const rinsePercentage = (rinse / total) * 100 - 0.5;
      const runoffPercentage = (runoff / total) * 100 - 0.5;

      return {
        evaporationPercentage,
        rinsePercentage,
        runoffPercentage,
      };
    },
    async testRabimoAPI() {
      this.isLoading = true;
      const data = await getRabimo.getTest();
      this.isLoading = false;
      await console.log("[AbimoMeasure] data::", data);
    },
    async fetchCalculateMultiblock() {
      // get multiblock data
      let payload = [];
      const olFeatures = this.mapToolFeatures(this.selectedFeatures);

      // fetch data for each feature?
      for (const feature of olFeatures) {
        const properties = feature.getProperties();
        payload.push(properties);
      }

      console.log("[AbimoHandler] payload::", payload);
      
      try {
        payload = [
          {
            code: "0000000001000016",
            prec_yr: 632,
            prec_s: 333,
            epot_yr: 660,
            epot_s: 530,
            district: "1",
            total_area: 4951.8538,
            area_main: 4951.8538,
            area_road: 0,
            main_frac: 1,
            roof: 0.009,
            green_roof: 0,
            swg_roof: 1,
            pvd: 0.9736,
            swg_pvd: 1,
            srf1_pvd: 0.33,
            srf2_pvd: 0.15,
            srf3_pvd: 0.16,
            srf4_pvd: 0,
            srf5_pvd: 0.36,
            road_frac: 0,
            pvd_r: 0,
            swg_pvd_r: 1,
            srf1_pvd_r: 0,
            srf2_pvd_r: 0,
            srf3_pvd_r: 0,
            srf4_pvd_r: 0,
            sealed: 0.9826,
            to_swale: 0,
            gw_dist: 2.8,
            ufc30: 12,
            ufc150: 10,
            land_type: "urban",
            veg_class: 35,
            irrigation: 0,
            block_type: "300_road",
          },
          {
            code: "0000000001000017",
            prec_yr: 631,
            prec_s: 332,
            epot_yr: 660,
            epot_s: 530,
            district: "1",
            total_area: 3406.4166,
            area_main: 3406.4166,
            area_road: 0,
            main_frac: 1,
            roof: 0.0038,
            green_roof: 0,
            swg_roof: 1,
            pvd: 0.9769,
            swg_pvd: 1,
            srf1_pvd: 0.36,
            srf2_pvd: 0.17,
            srf3_pvd: 0.13,
            srf4_pvd: 0,
            srf5_pvd: 0.34,
            road_frac: 0,
            pvd_r: 0,
            swg_pvd_r: 1,
            srf1_pvd_r: 0,
            srf2_pvd_r: 0,
            srf3_pvd_r: 0,
            srf4_pvd_r: 0,
            sealed: 0.9807,
            to_swale: 0,
            gw_dist: 2.7,
            ufc30: 11,
            ufc150: 10,
            land_type: "urban",
            veg_class: 35,
            irrigation: 0,
            block_type: "300_road",
          },
        ];
        const data = await getRabimo.getMultiblock(payload);
        console.log("[AbimoMeasure] data::", data);
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
      }

      this.addToLayer(olFeatures);
    },
    async calculateDeltaW() {
      const olFeatures = this.mapToolFeatures(this.selectedFeatures);
      let payload = [];

      for (const feature of olFeatures) {
        const properties = feature.getProperties();
        payload.push(properties);
      }
      try {
        payload = [
          {
            code: "0000000001000016",
            prec_yr: 632,
            prec_s: 333,
            epot_yr: 660,
            epot_s: 530,
            district: "1",
            total_area: 4951.8538,
            area_main: 4951.8538,
            area_road: 0,
            main_frac: 1,
            roof: 0.009,
            green_roof: 0,
            swg_roof: 1,
            pvd: 0.9736,
            swg_pvd: 1,
            srf1_pvd: 0.33,
            srf2_pvd: 0.15,
            srf3_pvd: 0.16,
            srf4_pvd: 0,
            srf5_pvd: 0.36,
            road_frac: 0,
            pvd_r: 0,
            swg_pvd_r: 1,
            srf1_pvd_r: 0,
            srf2_pvd_r: 0,
            srf3_pvd_r: 0,
            srf4_pvd_r: 0,
            sealed: 0.9826,
            to_swale: 0,
            gw_dist: 2.8,
            ufc30: 12,
            ufc150: 10,
            land_type: "urban",
            veg_class: 35,
            irrigation: 0,
            block_type: "300_road",
          },
          {
            code: "0000000001000017",
            prec_yr: 631,
            prec_s: 332,
            epot_yr: 660,
            epot_s: 530,
            district: "1",
            total_area: 3406.4166,
            area_main: 3406.4166,
            area_road: 0,
            main_frac: 1,
            roof: 0.0038,
            green_roof: 0,
            swg_roof: 1,
            pvd: 0.9769,
            swg_pvd: 1,
            srf1_pvd: 0.36,
            srf2_pvd: 0.17,
            srf3_pvd: 0.13,
            srf4_pvd: 0,
            srf5_pvd: 0.34,
            road_frac: 0,
            pvd_r: 0,
            swg_pvd_r: 1,
            srf1_pvd_r: 0,
            srf2_pvd_r: 0,
            srf3_pvd_r: 0,
            srf4_pvd_r: 0,
            sealed: 0.9807,
            to_swale: 0,
            gw_dist: 2.7,
            ufc30: 11,
            ufc150: 10,
            land_type: "urban",
            veg_class: 35,
            irrigation: 0,
            block_type: "300_road",
          },
        ];
        const data = await getRabimo.getMultiblockDeltaW(payload);
        console.log("[AbimoMeasure] data::", data);
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
      }

      // const data = await getRabimo.getMultiblockDeltaW(payload);
      // feature.setProperties(data);
      // feature.setStyle(this.createStyle(data));

      // this.addToLayer(olFeatures);
    },
    handleStepOneClick() {
      // Does not work need to add watch function in accordion
      const stepOne = this.steps.find((step) => step.id === 1);
      const stepTwo = this.steps.find((step) => step.id === 2);
      if (stepOne && stepTwo) {
        stepOne.isActive = false;
        stepTwo.isActive = true;
      } else {
        console.error("handleStepOneClick: stepOne or stepTwo is null");
      }
    },
  },
};
</script>

<template lang="html">
  <div
    id="abimo"
    class="d-flex flex-column h-100 gap-3"
  >
    <div class="d-flex flex-column h-100 overflow-scroll">
      <h1>Berechnete Layer</h1>
    </div>
    <hr />
    <AbimoAccordion :steps="steps">
      <template v-slot:default="slotProps">
        <div v-if="slotProps.step.id === 1">
          <button
            class="btn btn-primary"
            @click="handleStepOneClick"
          >
            Bestätigen
          </button>
        </div>
        <div v-if="slotProps.step.id === 2">
          <div
            v-for="button in slotProps.step.buttons"
            :key="button.id"
          >
            <button
              class="btn btn-primary"
              :disabled="button.isDisabled"
            >
              {{ button.label }}
            </button>
          </div>
        </div>

        <div v-else-if="slotProps.step.id === 4">
          <div class="mb-4">
            <div
              v-for="slider in sliders"
              :key="slider.id"
            >
              <label
                class="pr-5"
                :for="slider.id"
                >{{ slider.label }}</label
              >
              <input
                :id="slider.id"
                v-model="slider.value"
                type="range"
                min="0"
                max="100"
                class="bg-secondary"
              />

              <span>{{ slider.value }}</span>
            </div>
          </div>

          <button
            class="btn btn-primary"
            @click="fetchCalculateMultiblock"
          >
            Blockteilflächen berechnen
          </button>

          <!-- TODO: only display for testing API -->
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

          <ul class="list-group">
            <li
              class="list-group-item"
              v-if="selectedFeatures.length"
            >
              <strong
                >Ausgewählte Flächen:
                {{ accumulatedAbimoStats.featuresSelected }}</strong
              >
              <br />
              <strong
                >Gesamtfläche:
                {{ (accumulatedAbimoStats.totalArea / 1000000).toFixed(2) }}
                km2</strong
              >
              <br />
              <strong
                >Durchschnittliche Verdunstung:
                {{ accumulatedAbimoStats.averageEvaporation.toFixed(2) }}
                mm</strong
              >
              <br />
              <strong
                >Durchschnittliche Versickerung:
                {{ accumulatedAbimoStats.averageSwale.toFixed(2) }} mm</strong
              >
              <br />
              <strong
                >Durchschnittlicher Ablauf:
                {{ accumulatedAbimoStats.averageRinse.toFixed(2) }} mm</strong
              >
            </li>
            <li
              v-for="feature in selectedFeatures"
              :key="feature.code"
              class="feature-details"
            >
              <ul class="list-group">
                <li class="list-group-item">
                  <strong>CODE: {{ feature.values_.code }}</strong>
                </li>
                <li class="list-group-item">
                  Fläche:
                  {{ Number(feature.values_.area).toFixed(2) }} m2
                </li>
                <li
                  class="list-group-item"
                  style="display: flex"
                >
                  <div class="bar-1 label" />
                  Verdunstung:
                  {{ Number(feature.values_.evaporatio).toFixed(2) }}mm
                </li>
                <li
                  class="list-group-item"
                  style="display: flex"
                >
                  <div class="bar-2 label" />
                  Versickerung:
                  {{ Number(feature.values_.infiltrati).toFixed(2) }}mm
                </li>
                <li
                  class="list-group-item"
                  style="display: flex"
                >
                  <div class="bar-3 label" />
                  Oberflächenabfluss:
                  {{ Number(feature.values_.surface_ru).toFixed(2) }}mm
                </li>
                <div class="bar-scale">
                  <div
                    class="bar bar-1"
                    :style="{
                      width:
                        calculatePercentages(feature).verdunstunPercentage +
                        '%',
                    }"
                  />
                  <div
                    class="bar bar-2"
                    :style="{
                      width: calculatePercentages(feature).riPercentage + '%',
                    }"
                  />

                  <div
                    class="bar bar-3"
                    :style="{
                      width: calculatePercentages(feature).rowPercentage + '%',
                    }"
                  />
                </div>
              </ul>
            </li>
          </ul>
        </div>

        <div v-else-if="slotProps.step.id === 5">
          <button
            class="btn btn-primary"
            @click="calculateDeltaW"
          >
            <!-- <span class="sr-only">Loading...</span> -->
            DeltaW Berechnen
          </button>
        </div>

        <div v-if="slotProps.step.id === 6">
          <!-- TODO: add reset function -->
          <button class="btn btn-primary">Neue Berechnung Starten</button>
        </div>
      </template>
    </AbimoAccordion>
  </div>
</template>

<style lang="scss" scoped>
input[type="range"],
ul {
  list-style: none;
  padding: 0;
}

.feature-details,
.summary {
  margin-top: 16px;
  border-top: 1px solid #54bba8;
  padding-top: 16px;
}

.bar-scale {
  min-width: 290px;
  height: 16px;
  display: flex;
}
.bar {
  position: relative;
  height: 100%;
}

.bar-1 {
  background-color: #ff0000;
}

.bar-2 {
  background-color: #00ff00;
}

.bar-3 {
  background-color: #0000ff;
}

.label {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}
</style>

