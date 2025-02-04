<script>
import AbimoBlockAreaSelector from "./AbimoBlockAreaSelector.vue";
import AbimoCalcButton from "./AbimoCalcButton.vue";
import AbimoCalcResult from "./AbimoCalcResult.vue";
import AbimoSliderSelector from "./AbimoSliderSelector.vue";
import { markRaw } from "vue";
import PreComputedModels from "./PreComputedModels.vue";
import AbimoLayerInfoAmarex from "./AbimoLayerInfo.vue";
import AbimoViewSelector from "./AbimoViewSelector.vue";
import { LoaderCircle } from "lucide-vue-next";
import colors from "../../../src/shared/js/utils/amarex-colors.json";
import mapCollection from "../../../src/core/maps/js/mapCollection";
import { mapActions, mapGetters, mapMutations } from "vuex";

/**
 * Abimo
 * @module modules/AbimoHandler
 */
export default {
  name: "AbimoHandler",
  components: {
    AbimoBlockAreaSelector,
    AbimoCalcButton,
    PreComputedModels,
    AbimoLayerInfoAmarex,
    AbimoViewSelector,
    LoaderCircle,
    AbimoCalcResult,
  },
  data() {
    return {
      colors,
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
              action: () => {
                this.setActiveStep(1);
                this.setPreComputedModelsShown(false);
              },
            },
          ],
          upperButtons: true,
        },
        {
          id: "ViewSelector",
          component: markRaw(AbimoViewSelector),
          props: {
            nextStep: () => this.setActiveStep(2),
          },
          title: "Betrachtungsraum wählen",
          description:
            "Mit unserem Wasserhaushaltsmodell können Sie auf verschiedene Arten Ihr Szenario zusammenstellen.",
          buttons: [
            {
              text: "Zurück",
              action: () => {
                this.setActiveStep(0);
                this.preComputedModelsAdded = false;
                this.resetPreComputedModels();
              },
            },
          ],
        },
        {
          id: "BlockAreaSelector",
          component: markRaw(AbimoBlockAreaSelector),
          title: "Untersuchungsgebiet wählen",
          description:
            "Wählen Sie in der Karte die zu untersuchende Blockteilfläche via Mausklick aus.",
          buttons: [
            {
              text: "Zurück",
              action: () => {
                this.resetAbimoCalculation();
                this.setActiveStep(1);
              },
            },
            {
              text: "Bestätigen",
              action: () => {
                this.$refs.componentRef?.handleBlockAreaConfirm();
                this.setActiveStep(3);
              },
              accent: true,
            },
          ],
        },
        {
          id: "GreenRoof",
          component: markRaw(AbimoSliderSelector),
          props: { type: "greenRoof" },
          buttons: [
            {
              text: "Zurück",
              action: () => {
                this.resetBlockArea();
                this.setActiveStep(2);
              },
            },
            {
              text: "Bestätigen",
              action: () => {
                this.$refs.componentRef?.updateAbimoData();
                this.setActiveStep(4);
              },
              accent: true,
            },
          ],
        },
        {
          id: "Unsealed",
          component: markRaw(AbimoSliderSelector),
          props: { type: "unsealed" },
          buttons: [
            {
              text: "Zurück",
              action: () => {
                this.$refs.componentRef?.updateAbimoData();
                this.setActiveStep(3);
              },
            },
            {
              text: "Bestätigen",
              action: () => {
                this.$refs.componentRef?.updateAbimoData();
                this.setActiveStep(5);
              },
              accent: true,
            },
          ],
        },
        {
          id: "SwaleConnected",
          component: markRaw(AbimoSliderSelector),
          props: { type: "swaleConnected" },
          buttons: [
            {
              text: "Zurück",
              action: () => {
                this.$refs.componentRef?.updateAbimoData();
                this.setActiveStep(4);
              },
            },
          ],
        },
        {
          id: "AbimoResult",
          component: markRaw(AbimoCalcResult),
          props: {
            openInfoFromResults: (info) => this.openInfo(info),
          },
          buttons: [
            {
              text: "Neue Berechnung starten",
              action: async () => {
                await this.resetAbimoCalculation();
                await this.resetPreComputedModels();
                this.setActiveStep(0);
              },
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
  computed: {
    ...mapGetters("Modules/AbimoHandler", [
      "selectInteraction",
      "accumulatedAbimoStats",
      "blockAreaConfirmed",
      "selectedFeatures",
      "preComputedModels",
      "activeStep",
    ]),
    ...mapGetters(["allLayerConfigs"]),
    activeComponent() {
      return this.steps[this.activeStep] || {};
    },
  },
  watch: {
    accumulatedAbimoStats(value) {
      this.totalArea = +value.totalArea.toFixed(0);
    },
    activeStep() {
      const contentContainerRef = this.$refs.contentContainerRef;
      if (contentContainerRef) {
        contentContainerRef.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    },
    calcState(state) {
      if (state === "isCalculated") {
        this.calcState = null;
        this.setActiveStep(6);
      }
    },
  },
  methods: {
    ...mapActions("Maps", {
      addInteractionToMap: "addInteraction",
      removeInteractionFromMap: "removeInteraction",
    }),
    ...mapActions("Modules/LayerSelection", ["changeVisibility"]),
    ...mapActions("Modules/AbimoHandler", ["updateAccumulatedStats"]),
    ...mapMutations("Modules/AbimoHandler", [
      "setSelectedFeatures",
      "setNewGreenRoof",
      "setNewUnpvd",
      "setNewToSwale",
      "setResetTargetValues",
      "setSelectInteraction",
      "setBlockAreaConfirmed",
      "setPreselectedFeatures",
      "setPreComputedModelsShown",
      "setPreComputedModels",
      "setActiveStep",
    ]),
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
      mapCollection
        .getMap("2D")
        .getLayers()
        .getArray()
        .find((layer) => layer.get("id") === "planung_abimo")
        .values_.source.clear();
      mapCollection
        .getMap("2D")
        .getLayers()
        .getArray()
        .find((layer) => layer.get("id") === "abimo_result_infiltration")
        .values_.source.clear();
      mapCollection
        .getMap("2D")
        .getLayers()
        .getArray()
        .find((layer) => layer.get("id") === "abimo_result_evaporation")
        .values_.source.clear();
      mapCollection
        .getMap("2D")
        .getLayers()
        .getArray()
        .find((layer) => layer.get("id") === "abimo_result_surface_run_off")
        .values_.source.clear();
      mapCollection
        .getMap("2D")
        .getLayers()
        .getArray()
        .find((layer) => layer.get("id") === "abimo_result_delta_w")
        .values_.source.clear();
      this.removeInteractionFromMap(this.selectInteraction);
      this.setSelectedFeatures([]);
      this.setNewGreenRoof(0);
      this.setNewUnpvd(0);
      this.setNewToSwale(0);
      this.setSelectInteraction(null);
      this.updateAccumulatedStats();
      this.setResetTargetValues(true);
      this.setBlockAreaConfirmed(false);
      this.setActiveStep(0);
    },
    async resetBlockArea() {
      if (this.blockAreaConfirmed) {
        await mapCollection
          .getMap("2D")
          .getLayers()
          .getArray()
          .find((layer) => layer.get("id") === "planung_abimo")
          .values_.source.clear();

        await this.setPreselectedFeatures(this.selectedFeatures);
        this.setNewGreenRoof(0);
        this.setNewUnpvd(0);
        this.setNewToSwale(0);
        await this.setSelectedFeatures([]);
        await this.updateAccumulatedStats();
        this.setBlockAreaConfirmed(false);
      }
    },
    async resetPreComputedModels() {
      this.setPreComputedModelsShown(false);
      this.preComputedModelsAdded = false;
      await this.preComputedModels.forEach((layer) => {
        this.changeVisibility({ layerId: layer.id, value: false });
      });
      await this.setPreComputedModels([]);
    },
    handleReset() {
      this.resetAbimoCalculation();
      this.calcState = null;
      this.setActiveStep(0);
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
    <PreComputedModels
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
          :key="stepIndex"
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
          ><AbimoCalcButton :changeCalcState="changeCalcState"
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
      v-if="calcState === 'error'"
      class="error-container d-flex flex-column align-items-center"
    >
      <p>!!!</p>
      <p class="title">Es ist leider ein Fehler aufgetreten.</p>
      <AbimoCalcButton
        :content="'Nochmal probieren'"
        :changeCalcState="changeCalcState"
      />
      <button
        class="amarex-btn-primary full"
        @click="handleReset"
      >
        <p>Neue Berechnung starten</p>
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

