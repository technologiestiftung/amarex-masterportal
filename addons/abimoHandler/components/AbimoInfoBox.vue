<script>
import { mapActions, mapGetters } from "vuex";

/**
 * AbimoInfoBox
 * @module modules/AbimoInfoBox
 */
export default {
  name: "AbimoInfoBox",
  components: {},
  computed: {
    ...mapGetters("Modules/AbimoHandler", [
      "selectedFeatures",
      "accumulatedAbimoStats",
    ]),
  },
  mounted() {},
  methods: {
    ...mapActions("Modules/AbimoHandler", ["calculatePercentages"]),
  },
};
</script>

<template lang="html">
  <div
    id="AbimoInfoBox-root"
    class="d-flex flex-column gap-3"
  >
    <ul class="list-group">
      <li
        class="list-group-item"
        v-if="selectedFeatures.length && accumulatedAbimoStats"
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
                width: calculatePercentages(feature).verdunstunPercentage + '%',
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
</template>

<style lang="scss" scoped>
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

.feature-details,
.summary {
  margin-top: 16px;
  border-top: 1px solid #54bba8;
  padding-top: 16px;
}

.label {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}
</style>

