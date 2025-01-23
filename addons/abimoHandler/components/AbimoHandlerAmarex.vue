<script>
import AbimoBlockAreaSelectorAmarex from "./AbimoBlockAreaSelectorAmarex.vue";
import AbimoCalcButtonAmarex from "./AbimoCalcButtonAmarex.vue";
import AbimoCalcResultAmarex from "./AbimoCalcResultAmarex.vue";
import AbimoSliderSelectorAmarex from "./AbimoSliderSelectorAmarex.vue";
import { mapGetters } from "vuex";
import { markRaw } from "vue";
import PreComputedModelsAmarex from "./PreComputedModelsAmarex.vue";
import AbimoLayerInfoAmarex from "./AbimoLayerInfoAmarex.vue";
import AbimoViewSelectorAmarex from "./AbimoViewSelectorAmarex.vue";
import { LoaderCircle } from "lucide-vue-next";
import colors from "../../../src/shared/js/utils/amarex-colors.json";

/**
 * Abimo
 * @module modules/AbimoHandler
 */
export default {
  name: "AbimoHandler",
  components: {
    AbimoBlockAreaSelectorAmarex,
    AbimoCalcButtonAmarex,
    PreComputedModelsAmarex,
    AbimoLayerInfoAmarex,
    AbimoViewSelectorAmarex,
    LoaderCircle,
    AbimoCalcResultAmarex,
  },
  data() {
    return {
      colors,
      activeStep: 0,
      steps: [
        {
          id: "PreComputedModels",
          title: "Vorberechnete Modelle",
          description:
            "Zur Status Quo Analyse können Sie mit den vorberechneten Karten aus dem Kartenkatalog starten.<br><br>Möchten Sie diese ihrer Bearbeitung hinzufügen?",
          continueDescription:
            "Sie haben jetzt die vorberechneten Modelle Delta W und Abimo hinzugefügt.",
          buttons: [
            {
              text: "Vorberechnete Modelle hinzufügen",
              action: () => (this.preComputedModelsAdded = true),
            },
            {
              text: "Überspringen",
              action: () => (this.activeStep = 1),
            },
          ],
          upperButtons: true,
        },
        {
          id: "ViewSelector",
          component: markRaw(AbimoViewSelectorAmarex),
          props: {
            nextStep: () => (this.activeStep = 2),
          },
          title: "Betrachtungsraum wählen",
          description:
            "Mit unserem Wasserhaushaltsmodell können Sie auf verschiedene Arten Ihr Szenario zusammenstellen.",
          buttons: [
            {
              text: "Zurück",
              action: () => (this.activeStep = 0),
            },
          ],
        },
        {
          id: "BlockAreaSelector",
          component: markRaw(AbimoBlockAreaSelectorAmarex),
          title: "Untersuchungsgebiet wählen",
          description:
            "Wählen Sie in der Karte die zu untersuchende Blockteilfläche via Mausklick aus.",
          buttons: [
            {
              text: "Zurück",
              action: () => (this.activeStep = 1),
            },
            {
              text: "Bestätigen",
              action: () => {
                this.$refs.componentRef?.handleBlockAreaConfirm();
                this.activeStep = 3;
              },
              accent: true,
            },
          ],
        },
        {
          id: "GreenRoof",
          component: markRaw(AbimoSliderSelectorAmarex),
          props: { type: "greenRoof" },
          buttons: [
            {
              text: "Zurück",
              action: () => (this.activeStep = 2),
            },
            {
              text: "Bestätigen",
              action: () => {
                this.$refs.componentRef?.updateAbimoData();
                this.activeStep = 4;
              },
              accent: true,
            },
          ],
        },
        {
          id: "Unsealed",
          component: markRaw(AbimoSliderSelectorAmarex),
          props: { type: "unsealed" },
          buttons: [
            {
              text: "Zurück",
              action: () => (this.activeStep = 3),
            },
            {
              text: "Bestätigen",
              action: () => {
                this.$refs.componentRef?.updateAbimoData();
                this.activeStep = 5;
              },
              accent: true,
            },
          ],
        },
        {
          id: "SwaleConnected",
          component: markRaw(AbimoSliderSelectorAmarex),
          props: { type: "swaleConnected" },
          buttons: [
            {
              text: "Zurück",
              action: () => (this.activeStep = 4),
            },
          ],
        },
        {
          id: "AbimoResult",
          component: markRaw(AbimoCalcResultAmarex),
          props: {
            openInfoFromResults: (info) => this.openInfo(info),
          },
          buttons: [
            {
              text: "Neue Berechnung starten",
              action: () => this.resetAbimoCalculation(),
            },
          ],
        },
      ],
      totalArea: 0,
      preComputedModelsAdded: false,
      showInfo: null,
      calcState: null,
    };
  },
  methods: {
    setDisabled() {
      if (this.activeStep === 2) return this.totalArea === 0;
      return false;
    },
    openInfo(info) {
      this.showInfo = {
        title: info.name,
        legend: info.legend,
      };
    },
    hideInfo() {
      this.showInfo = null;
    },
    handleParentClick(event) {
      if (this.showInfo) {
        this.showInfo = null;
        event.stopPropagation();
      }
    },
    changeCalcState(state) {
      this.calcState = state;
    },
    resetAbimoCalculation() {
      // @Luise: Please add the functionality to start a new calculcation with this button
    },
    clickOnStepIndicator(stepIndex) {
      if (stepIndex < this.activeStep) {
        this.activeStep = stepIndex;
      }
    },
  },
  computed: {
    ...mapGetters("Modules/AbimoHandler", ["accumulatedAbimoStats"]),
    activeComponent() {
      return this.steps[this.activeStep] || {};
    },
  },
  watch: {
    accumulatedAbimoStats(value) {
      this.totalArea = +value.totalArea.toFixed(0);
    },
    activeStep(step) {
      const contentContainerRef = this.$refs.contentContainerRef;
      if (contentContainerRef) {
        contentContainerRef.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
      if (step === 2) {
        // @Luise: Please add the functionality here so that the Block Selection is activated again
        // when the User goes back to the Block Area Selector
      }
      if ((step === 0 || step === 1) && this.totalArea > 0) {
        // @Luise: Should the Block Selection be reset when the User goes back to one of the first two steps
        // if yes, please add the functionality here
      }
    },
    calcState(state) {
      if (state === "isCalculated") {
        this.calcState = null;
        this.activeStep = 6;
      }
    },
  },
};
</script>

<template lang="html">
  <div
    id="abimo-amarex"
    :class="{
      'three-columns': preComputedModelsAdded,
    }"
    v-if="!calcState"
  >
    <!-- PRE COMPUTED MODELS -->
    <PreComputedModelsAmarex
      v-if="preComputedModelsAdded"
      :openInfo="openInfo"
    />
    <!-- TITLE & DESCRIPTION IN EACH STEP -->
    <div
      class="content-container"
      ref="contentContainerRef"
      @click="handleParentClick"
    >
      <span v-if="preComputedModelsAdded && activeStep === 0"></span>
      <p
        v-else-if="steps[activeStep]?.title"
        class="title"
      >
        {{ steps[activeStep]?.title }}
      </p>
      <p
        v-if="steps[activeStep]?.description"
        v-html="steps[activeStep]?.description"
        class="description"
      ></p>
      <!-- MAIN COMPONENT -->
      <component
        v-if="activeComponent?.component"
        :is="activeComponent?.component"
        ref="componentRef"
        v-bind="activeComponent?.props"
      />
      <!-- UPPER BUTTONS -->
      <div
        v-if="steps[activeStep]?.upperButtons"
        class="upper-btn-container"
        :class="{
          continue: activeStep === 0 && preComputedModelsAdded,
        }"
      >
        <button
          class="amarex-btn-primary full accent"
          v-if="activeStep === 0 && preComputedModelsAdded"
          @click="steps[activeStep]?.buttons[1].action"
          :style="{
            marginBottom: '16px',
          }"
        >
          <p>Weiter</p>
        </button>
        <span v-else>
          <button
            class="amarex-btn-primary full accent"
            v-if="steps[activeStep]?.buttons[0]"
            @click="steps[activeStep]?.buttons[0].action"
            :disabled="setDisabled()"
            :class="{
              deactivated: setDisabled(),
            }"
            :style="{
              marginBottom: '16px',
            }"
          >
            <p>{{ steps[activeStep]?.buttons[0].text }}</p>
          </button>
          <button
            class="amarex-btn-primary full"
            v-if="steps[activeStep]?.buttons[1]"
            @click="steps[activeStep]?.buttons[1].action"
          >
            <p>{{ steps[activeStep]?.buttons[1].text }}</p>
          </button>
        </span>
      </div>
    </div>
    <!-- STEP CONTAINER -->
    <div class="step-container">
      <div
        class="steps d-flex justify-content-center"
        v-if="activeStep !== null"
      >
        <div
          v-for="(step, stepIndex) in steps"
          :class="{
            active: stepIndex === activeStep,
            click: stepIndex < activeStep,
          }"
          @click="clickOnStepIndicator(stepIndex)"
        ></div>
      </div>
      <div
        v-if="!steps[activeStep]?.upperButtons"
        class="btn-container d-flex"
      >
        <span
          v-for="(btn, btnIndex) in steps[activeStep]?.buttons"
          :key="btnIndex"
        >
          <button
            class="amarex-btn-primary full"
            :class="{
              accent: btn.accent,
              deactivated:
                steps[activeStep]?.buttons[btnIndex].accent && setDisabled(),
            }"
            @click="steps[activeStep]?.buttons[btnIndex].action"
            :disabled="
              steps[activeStep]?.buttons[btnIndex].accent && setDisabled()
            "
          >
            <p>{{ steps[activeStep]?.buttons[btnIndex].text }}</p>
          </button>
        </span>
        <span v-if="activeStep === 5"
          ><AbimoCalcButtonAmarex :changeCalcState="changeCalcState"
        /></span>
      </div>
    </div>
    <!-- INFO CONTAINER -->
    <AbimoLayerInfoAmarex
      v-if="showInfo"
      :showInfo="showInfo"
      :hideInfo="hideInfo"
    />
  </div>
  <div
    id="abimo-amarex"
    v-else
  >
    <span
      v-if="calcState === 'loading'"
      class="loading-container d-flex flex-column align-items-center"
    >
      <LoaderCircle
        :color="colors.amarex_secondary"
        :size="24"
      />
      <p class="title">Ihr Ergebnis wird geladen...</p>
    </span>
    <span
      v-else
      class="error-container d-flex flex-column align-items-center"
    >
      <p>!!!</p>
      <p class="title">Es ist leider ein Fehler aufgetreten.</p>
      <AbimoCalcButtonAmarex
        :wording="'Nochmal probieren'"
        :changeCalcState="changeCalcState"
      />
      <button
        class="amarex-btn-primary full"
        @click="resetAbimoCalculation"
      >
        <p>Neue Berechnung starten</p>
      </button>
      <button
        class="amarex-btn-primary full"
        @click="
          () => {
            calcState = null;
            activeStep = 6;
          }
        "
      >
        <!-- @Luise: Just for Testing -->
        <p>Leere Ergebnisse sehen</p>
      </button>
    </span>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
#abimo-amarex {
  padding: 32px;
  height: 100%;
  display: grid;
  gap: 16px;
  grid-template-rows: 1fr auto;
  &.three-columns {
    grid-template-rows: auto 1fr auto !important;
  }
  .content-container {
    overflow: scroll;
    .upper-btn-container {
      margin-top: 48px;
      &.continue {
        margin-top: 32px;
      }
    }
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .step-container {
    .steps {
      gap: 10px;
      margin-bottom: 16px;
      div {
        background: none;
        border: 1px solid $amarex_secondary;
        border-radius: 100%;
        width: 13px;
        height: 13px;
        &.active {
          background: $amarex_secondary;
        }
        &.click {
          cursor: pointer;
        }
      }
    }
    .btn-container {
      gap: 16px;
      span {
        flex-grow: 1;
      }
    }
  }
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
  .loading-container {
    gap: 16px;
    margin-top: 48px;
    svg {
      animation: spin 1s linear infinite;
    }
    p {
      text-align: center;
    }
  }
  .error-container {
    gap: 16px;
    margin-top: 48px;
    & > p:first-of-type {
      color: $amarex_secondary;
      text-align: center;
      font-size: 32px;
      font-weight: 700;
      line-height: 32px;
    }
  }
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

