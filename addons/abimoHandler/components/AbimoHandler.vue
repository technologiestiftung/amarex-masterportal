<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import Feature from "ol/Feature";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { Select } from "ol/interaction";
import AbimoAccordion from "./AbimoAccordion.vue";
import AbimoBlockAreaSelector from "./AbimoBlockAreaSelector.vue";
import AbimoSelector from "./AbimoSelector.vue";
import getRabimo from "../api/getRabimo";
import helper from "../utils/helper";

/**
 * Abimo
 * @module modules/AbimoHandler
 */
export default {
  name: "AbimoHandler",
  components: {
    AbimoAccordion,
    AbimoBlockAreaSelector,
    AbimoSelector,
  },
  data() {
    return {
      isLoading: false,
      selectedFeatures: [],
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
          label: "Dachbegrünung",
          description:
            "Bei den von Ihnen gewählten Flächen stehen xxxx m2 Dachflächen zur Verfügung. Welchen Anteil möchten Sie begrünen?",
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
          id: 4,
          label: "Entsiegelung von Flächen",
          description:
            "Wählen Sie anteilsmäßig die Maßnahmen, die Sie in die Berechnung einfließen lassen wollen.",
          isActive: false,
        },
        {
          id: 5,
          label: "Anschluss an Mulde",
          description:
            "Wählen Sie anteilsmäßig die Maßnahmen, die Sie in die Berechnung einfließen lassen wollen.",
          isActive: false,
        },
        {
          id: 6,
          label: "Berechnung",
          description:
            "Fügen Sie nun den berechneten DeltaW-Layer hinzu. Des Weiteren stehen ihnen weitere Ergebnislayer zur Verfügung.",
          isActive: false,
        },
        {
          id: 7,
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
    ...mapGetters("Modules/AbimoHandler", ["selectedFeatures"]),
  },
  mounted() {
    this.createInteractions();
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
    this.featureKeys = Object.keys(
      this.layer_rabimo_input.values_.source.featuresRtree_.items_,
    );
  },
  methods: {
    ...mapActions("Maps", {
      addInteractionToMap: "addInteraction",
      removeInteractionFromMap: "removeInteraction",
    }),
    ...mapActions("Modules/AbimoHandler", ["updateAccumulatedStats"]),

    ...mapMutations("Modules/AbimoHandler", ["setSelectedFeatures"]),
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

          const mergedFeature = new Feature({
            geometry: feature.getGeometry(),
            ...feature.getProperties(),
            ...inputFeature,
          });
          this.selectedFeatures.push(mergedFeature);
          this.setSelectedFeatures(this.selectedFeatures);
        });

        event.deselected.forEach((feature) => {
          const featureCode = feature.values_.code;
          this.selectedFeatures = this.selectedFeatures.filter(
            (f) => f.values_.code !== featureCode,
          );
          console.log(
            "[AbimoHandler] this.selectedFeatures::",
            this.selectedFeatures,
          );
          this.setSelectedFeatures(this.selectedFeatures);
        });

        this.updateAccumulatedStats();
      });
      // registers interaction in module - check masterportal docu
      this.addInteractionToMap(selectInteraction);
    },
    getInputFeature(featureCode) {
      // TODO: fix timing issue
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
    addToLayer(calculatedFeatures) {
      this.layer_abimo_altered.values_.source.addFeatures(calculatedFeatures);
    },
    async testRabimoAPI() {
      this.isLoading = true;
      const data = await getRabimo.getTest();
      this.isLoading = false;
      await console.log("[AbimoMeasure] data::", data);
    },
    async fetchCalculateMultiblock() {
      // get multiblock data
      let payload = {
        features: [],
        targets: {
          new_green_roof: "",
          new_to_swale: "",
          new_unpvd: "",
        },
      };

      // add properties for each feature
      for (const feature of this.selectedFeatures) {
        const properties = feature.getProperties();
        payload.features.push(properties);
      }

      try {
        console.log("[AbimoHandler] payload::", payload);
        // const data = await getRabimo.getMultiblock(payload);
        // console.log("[AbimoMeasure] data::", data);
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
      }
      // this.addToLayer(olFeatures);
    },
    async calculateDeltaW() {
      const olFeatures = this.mapToolFeatures(this.selectedFeatures);
      let payload = [];

      for (const feature of olFeatures) {
        const properties = feature.getProperties();
        payload.push(properties);
      }
      try {
        console.log("[AbimoHandler] payload::", payload);
        // const data = await getRabimo.getMultiblockDeltaW(payload);
        // console.log("[AbimoMeasure] data::", data);
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
    class="d-flex flex-column gap-3"
  >
    <div class="d-flex flex-column h-100 overflow-scroll">
      <h1>Berechnete Layer</h1>
    </div>
    <hr />
    <div class="flex-grow-1">
      <AbimoAccordion :steps="steps">
        <template v-slot:default="slotProps">
          <!-- Step 1 -->
          <div v-if="slotProps.step.id === 1">
            <button
              class="btn btn-primary"
              @click="handleStepOneClick"
            >
              Zum Katalog
            </button>
            <button class="btn btn-secondary">Überspringen</button>
          </div>

          <!-- Step 2 -->
          <div v-if="slotProps.step.id === 2">
            <div
              v-for="button in slotProps.step.buttons"
              :key="button.id"
            >
              <AbimoBlockAreaSelector />

              <button
                class="btn btn-primary mt-5"
                :disabled="button.isDisabled"
              >
                {{ button.label }}
              </button>
            </div>
          </div>

          <!-- Step 3 -->
          <div v-if="slotProps.step.id === 3">
            <AbimoSelector type="greenRoof" />
          </div>

          <!-- Step 4 -->
          <div v-else-if="slotProps.step.id === 4">
            <AbimoSelector type="unsealed" />
          </div>

          <!-- Step 5 -->
          <div v-else-if="slotProps.step.id === 5">
            <AbimoSelector type="swaleConnected" />
          </div>

          <!-- Step 6 -->
          <div v-if="slotProps.step.id === 6">
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
          </div>

          <!-- Step 7 -->
          <div v-if="slotProps.step.id === 7">
            <!-- todo add reset function -->
            <button class="btn btn-primary">Neue Berechnung Starten</button>
          </div>
        </template>
      </AbimoAccordion>
    </div>
  </div>
</template>

<style lang="scss" scoped>
input[type="range"],
ul {
  list-style: none;
  padding: 0;
}
</style>

