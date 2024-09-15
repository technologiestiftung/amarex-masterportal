<script>
import AbimoAccordion from "./AbimoAccordion.vue";
import AbimoBlockAreaSelector from "./AbimoBlockAreaSelector.vue";
import AbimoSelector from "./AbimoSelector.vue";
import AbimoCalcButton from "./AbimoCalcButton.vue";
import mapCollection from "../../../src/core/maps/js/mapCollection";
import { mapActions } from "vuex";

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
    return {
      steps: [
        // {
        //   id: "1",
        //   isActive: false,
        // },
        {
          id: "2",
          isActive: false,
        },
        {
          id: "3",
          isActive: false,
        },
        {
          id: "4",
          isActive: false,
        },
        {
          id: "5",
          isActive: false,
        },
        {
          id: "6",
          isActive: false,
        },
        {
          id: "7",
          isActive: false,
        },
      ],
    };
  },
  methods: {
    ...mapActions("Modules/AbimoHandler", ["updateAccordionSteps"]),

    handleStepOneClick() {
      this.updateAccordionSteps(2);
    },
    handleAbimoReset() {
      mapCollection
        .getMap("2D")
        .getLayers()
        .getArray()
        .find((layer) => layer.get("id") === "planung_abimo")
        .values_.source.clear();
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
              Neue Berechnung Starten
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

