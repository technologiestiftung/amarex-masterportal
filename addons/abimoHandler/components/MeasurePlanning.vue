<script>
import src2 from "../../../portal/amarex/resources/img/Placeholder-Tutorial-Tools.jpg";
import MeasureSelectionDisplay from "./MeasureSelectionDisplay.vue";
import MeasureSelectorHandler from "./MeasureSelectorHandler.vue";
import { mapGetters } from "vuex";

/**
 * Abimo Measure Planning
 * @module modules/MeasurePlanning
 */
export default {
  name: "MeasurePlanning",
  components: {
    MeasureSelectorHandler,
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
          subtitle:
            "Nun können Sie mittels Ihres Mouse-Cursers  Maßnahmen frei in der gewählten Blockteilfläche platzieren.",
          description:
            "Bitte beachten Sie, dass die Maßnahmeneffekte auf die gesamte Einzelblockteilfläche heruntergerechnet werden. Daher sind Überschneidungen mit nicht geeigneten Flächen irrelevant für die Effektberechnung.",
        },
        {
          id: "setMeasures",
          title: "Maßnahmen setzen",
          subtitle:
            "Wählen Sie eine der Maßnahmen aus. Sie können nun die Größe der Maßnahme wählen.",
        },
      ],
    };
  },
  computed: {
    ...mapGetters("Modules/AbimoHandler", [
      "selectedMeasures",
      "isMeasureDrawing",
      "hasMeasures",
    ]),
  },
  watch: {},
  methods: {},
};
</script>

<template lang="html">
  <div class="measure-planning-container">
    <div
      v-if="!isMeasureDrawing && !hasMeasures"
      class="step-container"
    >
      <p class="title">
        {{ steps[0].title }}
      </p>
      <p class="subtitle">
        {{ steps[0].subtitle }}
      </p>
      <img :src="src2" />
      <p class="description">
        {{ steps[0].description }}
      </p>
    </div>

    <div
      v-if="isMeasureDrawing || hasMeasures"
      class="step-container"
    >
      <p class="title">
        {{ steps[1].title }}
      </p>
      <p class="description">
        {{ steps[1].subtitle }}
      </p>
      <MeasureSelectionDisplay />
    </div>
  </div>
  <MeasureSelectorHandler />
</template>

<style lang="scss" scoped>
@import "~variables";

.step-container {
  img {
    max-width: 250px;
    margin: 5px 0;
  }
}
.title {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 700;
  line-height: 32px;
}
.subtitle {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  margin-bottom: 32px;
}
.description {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  margin-top: 12px;
  margin-bottom: 12px;
}
</style>

