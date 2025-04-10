<script>
import src2 from "../../../portal/amarex/resources/img/Placeholder-Tutorial-Tools.jpg";
import MeasureSelectionDisplay from "./MeasureSelectionDisplay.vue";
import MeasureSelectorMenu from "./MeasureSelectorMenu.vue";

// TODOS:

// klick in Karte
// hier checken dass sich das Menu nur öffnet wenn man auf die BTF klickt
// das Menu muss togglebar sein 
// im State festlegen, dass man sich im measure planing Modus befindet
// Menu öffnen (MeasureSelectorMenu) passend zu der geklickten Postion im Kartenbereich und auf der BTF
// dann den calc button anzeigen
// display calc button (der Abimo Calc button kann dann genauso angezeigt werden wie er ist.)
// anzeigen des step MeasureSelectionDisplay

/**
 * Abimo Measure Planning
 * @module modules/MeasurePlanning
 */
export default {
  name: "MeasurePlanning",
  components: {
    MeasureSelectorMenu,
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
  watch: {},
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
  <MeasureSelectorMenu />
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

