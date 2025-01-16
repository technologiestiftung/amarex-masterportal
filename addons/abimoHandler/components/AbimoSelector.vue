<script>
import AbimoSliderSelector from "./AbimoSliderSelector.vue";
import { mapGetters } from "vuex";

/**
 * AbimoSelector
 * @module modules/AbimoSelector
 */
export default {
  name: "AbimoSelector",
  props: {
    type: {
      type: String,
      // greenRoof | unsealed | swaleConnected
      default: "greenRoof",
      required: true,
    },
  },
  components: {
    AbimoSliderSelector,
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
    id="AbimoSelector-root"
    class="d-flex flex-column gap-3"
  >
    <div class="area-types-visualization w-100">
      <AbimoSliderSelector :type="type" />
      <!-- <hr />
      <div class="legend-item">
        <div class="color-indicator mr-3"></div>
        <div class="stats-display">
          <p class="area">
            GESAMTFLÄCHE: {{ accumulatedAbimoStats.totalArea.toFixed(0) }} m²
          </p>
        </div>
      </div> -->
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
