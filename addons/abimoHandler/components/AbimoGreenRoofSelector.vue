<script>
import GreenRoofSlider from "./GreenRoofSlider.vue";
import { mapGetters } from "vuex";

/**
 * AbimoGreenRoofSelector
 * @module modules/AbimoGreenRoofSelector
 */
export default {
  name: "AbimoGreenRoofSelector",
  components: {
    GreenRoofSlider,
  },
  data() {
    return {
      ui: {
        button: {
          label: "Berechnen",
          isDisabled: true,
        },
      },
    };
  },
  computed: {
    ...mapGetters("Modules/AbimoHandler", ["accumulatedAbimoStats"]),
  },
};
</script>

<template lang="html">
  <div
    id="AbimoGreenRoofSelector-root"
    class="d-flex flex-column gap-3"
  >
    <div class="area-types-visualization w-100">
      <GreenRoofSlider />
      <hr />
      <div class="legend-item">
        <div class="color-indicator mr-3"></div>
        <div class="stats-display">
          <p class="area">
            GESAMTFLÄCHE: {{ accumulatedAbimoStats.totalArea.toFixed(0) }} m²
          </p>
        </div>
      </div>
    </div>

    <button
      class="btn btn-primary mt-5"
      :disabled="ui.button.isDisabled"
    >
      {{ ui.button.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped></style>

