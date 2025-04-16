<script>
import { mapGetters } from "vuex";

/**
 * Abimo Measure Selection Display
 * @module modules/MeasureSelectionDisplay
 */
export default {
  name: "MeasureSelectionDisplay",
  computed: {
    ...mapGetters("Modules/AbimoHandler", ["accumulatedMeasureStats"]),
  },
};
</script>

<template lang="html">
  <div class="measure-selection-display w-100 d-flex flex-column">
    <span class="line"></span>

    <div class="py-2 w-100">
      <!-- Muldenversickerung -->
      <section class="mb-4">
        <h6 class="title">Muldenversickerung</h6>
        <div class="d-flex justify-content-between">
          <span>Anzahl</span>
          <span class="fw-bold">{{
            this.accumulatedMeasureStats.swaleMeasuresAmount
          }}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span>Oberfläche</span>
          <span class="fw-bold"
            ><span>{{ this.accumulatedMeasureStats.totalSwaleArea }}</span>
            m²</span
          >
        </div>
        <div class="d-flex justify-content-between">
          <span>Volumen</span>
          <span class="fw-bold"
            ><span>{{ this.accumulatedMeasureStats.totalSwaleVolume }}</span>
            m³</span
          >
        </div>
        <div class="d-flex justify-content-between">
          <span>Angeschlossene Fläche</span>
          <span class="fw-bold"
            ><span>{{
              this.accumulatedMeasureStats.totalSwaleConnectedArea
            }}</span>
            m²</span
          >
        </div>
      </section>

      <span class="line"></span>

      <!-- Entsiegelung -->
      <section class="mb-4 pt-2">
        <h6 class="title">Entsiegelung</h6>
        <div class="d-flex justify-content-between">
          <span>Anzahl</span>
          <span class="fw-bold">{{
            this.accumulatedMeasureStats.unpavedMeasuresAmount
          }}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span>Oberfläche</span>
          <span class="fw-bold"
            ><span>{{ this.accumulatedMeasureStats.totalUnpavedArea }}</span>
            m²</span
          >
        </div>
      </section>

      <span class="line"></span>

      <!-- Dachbegrünung -->
      <section class="pt-2">
        <h6 class="title">Dachbegrünung</h6>
        <div class="d-flex justify-content-between">
          <span>Anzahl</span>
          <span class="fw-bold">{{
            this.accumulatedMeasureStats.greenRoofMeasuresAmount
          }}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span>Oberfläche</span>
          <span class="fw-bold"
            ><span>{{ this.accumulatedMeasureStats.totalGreenRoofArea }}</span>
            m²</span
          >
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.line {
  display: block;
  height: 1px;
  width: 100%;
  background: $amarex_grey_mid;
}
.title {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 700;
  line-height: 32px;
}
</style>

