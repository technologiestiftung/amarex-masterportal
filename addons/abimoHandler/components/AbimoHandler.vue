<script>
import AbimoAccordion from "./AbimoAccordion.vue";
import AbimoBlockAreaSelector from "./AbimoBlockAreaSelector.vue";
import AbimoSelector from "./AbimoSelector.vue";
import AbimoCalcButton from "./AbimoCalcButton.vue";
import mapCollection from "../../../src/core/maps/js/mapCollection";
import { mapActions, mapGetters, mapMutations } from "vuex";

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
    AbimoCalcButton,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters("Modules/AbimoHandler", [
      "selectedFeatures",
      "selectInteraction",
    ]),
  },
  methods: {
    ...mapActions("Modules/AbimoHandler", [
      "updateAccordionSteps",
      "resetAccumulatedStats",
    ]),
    ...mapActions("Maps", {
      addInteractionToMap: "addInteraction",
    }),
    ...mapMutations("Modules/AbimoHandler", [
      "setSelectedFeatures",
      "setNewGreenRoof",
      "setNewUnpvd",
      "setNewToSwale",
      "setResetTargetValues",
    ]),

    handleStepClick(step) {
      this.updateAccordionSteps(step);
    },
    handleAbimoReset() {
      mapCollection
        .getMap("2D")
        .getLayers()
        .getArray()
        .find((layer) => layer.get("id") === "planung_abimo")
        .values_.source.clear();

      mapCollection
        .getMap("2D")
        .getLayers()
        .getArray()
        .find((layer) => layer.get("id") === "abimo_result_infiltration")
        .values_.source.clear();

      mapCollection
        .getMap("2D")
        .getLayers()
        .getArray()
        .find((layer) => layer.get("id") === "abimo_result_evaporation")
        .values_.source.clear();

      mapCollection
        .getMap("2D")
        .getLayers()
        .getArray()
        .find((layer) => layer.get("id") === "abimo_result_surface_run_off")
        .values_.source.clear();

      mapCollection
        .getMap("2D")
        .getLayers()
        .getArray()
        .find((layer) => layer.get("id") === "abimo_result_delta_w")
        .values_.source.clear();

      this.addInteractionToMap(this.selectInteraction);

      this.setNewGreenRoof(0);
      this.setNewUnpvd(0);
      this.setNewToSwale(0);
      this.setResetTargetValues(true);
      this.updateAccordionSteps(2);
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
      <!-- <h1>Berechnete Layer</h1> -->
    </div>
    <hr />
    <div class="flex-grow-1">
      <AbimoAccordion>
        <template v-slot:default="slotProps">
          <!-- Step 1 -->
          <div v-if="slotProps.step.id === 1">
            <button class="btn btn-primary">Zum Katalog</button>
            <button
              class="btn btn-secondary"
              @click="updateAccordionSteps(2)"
            >
              Überspringen
            </button>
          </div>

          <!-- Step 2 -->
          <div v-if="slotProps.step.id === 2">
            <AbimoBlockAreaSelector />
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
            <AbimoCalcButton />
          </div>

          <!-- Step 7 -->
          <div v-if="slotProps.step.id === 7">
            <!-- todo add reset function -->
            <button
              class="btn btn-primary"
              @click="handleAbimoReset"
            >
              Neue Berechnen
            </button>
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
