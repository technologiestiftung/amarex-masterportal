<script>
/**
 * Abimo Measure Selection Display
 * @module modules/MeasureSelectionDisplay
 */
export default {
  name: "MeasureSelectionDisplay",
  components: {},
  data() {
    return {};
  },
  computed: {},
  watch: {},
  methods: {},
};
</script>

<template lang="html">
  <div class="measure-selection-display-container w-100 d-flex flex-column">
    <span class="line"></span>

    <div class="container py-4 w-100">
      <!-- Muldenversickerung -->
      <section class="mb-4">
        <h6 class="title">Muldenversickerung</h6>
        <div class="d-flex justify-content-between">
          <span>Anzahl</span>
          <span class="fw-bold">{{ 0 }}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span>Oberfläche</span>
          <span class="fw-bold"
            ><span>{{ 0 }}</span> m²</span
          >
        </div>
        <div class="d-flex justify-content-between">
          <span>Volumen</span>
          <span class="fw-bold"
            ><span>{{ 0 }}</span> m³</span
          >
        </div>
        <div class="d-flex justify-content-between">
          <span>Angeschlossene Fläche</span>
          <span class="fw-bold"
            ><span>{{ 0 }}</span> m²</span
          >
        </div>
      </section>

      <span class="line"></span>

      <!-- Entsiegelung -->
      <section class="mb-4">
        <h6 class="title">Entsiegelung</h6>
        <div class="d-flex justify-content-between">
          <span>Anzahl</span>
          <span class="fw-bold">{{ 0 }}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span>Oberfläche</span>
          <span class="fw-bold"
            ><span>{{ 0 }}</span> m²</span
          >
        </div>
      </section>

      <span class="line"></span>

      <!-- Dachbegrünung -->
      <section>
        <h6 class="title">Dachbegrünung</h6>
        <div class="d-flex justify-content-between">
          <span>Anzahl</span>
          <span class="fw-bold">{{ 0 }}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span>Oberfläche</span>
          <span class="fw-bold"
            ><span>{{ 0 }}</span> m²</span
          >
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.line {
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

