<script>
import src2 from "../../../portal/amarex/resources/img/Placeholder-Tutorial-Tools.jpg";
import MeasureSelectionDisplay from "./MeasureSelectionDisplay.vue";
import MeasureSelector from "./MeasureSelector.vue";

// TODOS:
// add draw layer to map
// draw measure features on Map https://openlayers.org/en/latest/examples/draw-features-style.html
// only draw on the selected BTF
// update new values in the map: this.setNewGreenRoof(0); this.setNewUnpvd(0); this.setNewToSwale(0);
// display calc button (der Abimo Calc button kann dann genauso angezeigt werden wie er ist.)
// display selected Measures values (Status Quo)
// display MeasureSelector component
// display MeasureSelectionDisplay component

/**
 * Abimo Measure Planning
 * @module modules/MeasurePlanning
 */
export default {
  name: "MeasurePlanning",
  components: {
    MeasureSelector,
    MeasureSelectionDisplay,
  },
  data() {
    return {
      isMeasurePlanningOpen: false,
      src2,
      steps: [
        {
          id: "initalDisplay",
          title: "Maßnahmen setzen",
          description:
            "Nun können Sie mittels Ihres Mouse-Cursers  Maßnahmen frei in der gewählten Blockteilfläche platzieren.",
        },
        {
          id: "setMeasures",
          title: "Maßnahmen setzen",
          description: "",
        },
      ],
      activeStep: 0,
    };
  },
  computed: {},
  watch: {
    // check if user clicks on the BTF
    // if so open the measure planning step and options
    // if clicked on the layer
  },
  methods: {},
};
</script>

<template lang="html">
  <div class="measure-planning-container">
    <div>
      <p
        v-if="steps[activeStep]"
        class="title"
      >
        {{ steps[activeStep]?.title }}
      </p>
      <p
        v-if="steps[activeStep]"
        class="description"
      >
        {{ steps[activeStep]?.description }}
      </p>
    </div>

    <!-- STEP CONTAINER -->
    <div class="step-container">
      <img :src="src2" />
      <p
        v-if="steps[activeStep]"
        class="description"
      >
        {{ steps[activeStep]?.description }}
      </p>

      <MeasureSelectionDisplay />
    </div>
  </div>
  <MeasureSelector />
</template>

<style lang="scss" scoped>
@import "~variables";
.title {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 700;
  line-height: 32px;
}
.description {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
}
.step-container {
  margin-top: 32px;
  img {
    max-width: 250px;
    margin: 5px 0;
  }
}
</style>

