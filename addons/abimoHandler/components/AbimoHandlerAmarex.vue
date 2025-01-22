<script>
import AbimoBlockAreaSelectorAmarex from "./AbimoBlockAreaSelectorAmarex.vue";
import AbimoSelector from "./AbimoSelector.vue";
import AbimoCalcButton from "./AbimoCalcButton.vue";
import AbimoSliderSelector from "./AbimoSliderSelector.vue";
import { mapGetters } from "vuex";
import { markRaw } from "vue";
import PreComputedModelsAmarex from "./PreComputedModelsAmarex.vue";
import AbimoLayerInfoAmarex from "./AbimoLayerInfoAmarex.vue";
import AbimoViewSelectorAmarex from "./AbimoViewSelectorAmarex.vue";

/**
 * Abimo
 * @module modules/AbimoHandler
 */
export default {
  name: "AbimoHandler",
  components: {
    AbimoBlockAreaSelectorAmarex,
    AbimoSelector,
    AbimoCalcButton,
    PreComputedModelsAmarex,
    AbimoLayerInfoAmarex,
    AbimoViewSelectorAmarex,
  },
  data() {
    return {
      activeStep: null,
      steps: [
        {
          id: "PreComputedModels",
          title: "Vorberechnete Modelle",
          description:
            "Zur Status Quo Analyse können Sie mit den vorberechneten Karten aus dem Kartenkatalog starten.\n\nMöchten Sie diese ihrer Bearbeitung hinzufügen?",
          continueDescription:
            "Sie haben jetzt die vorberechneten Modelle Delta W und Abimo hinzugefügt.",
          buttons: [
            {
              text: "Vorberechnete Modelle hinzufügen",
              action: () => {
                this.preComputedModelsAdded = true;
              },
            },
            {
              text: "Überspringen",
              action: () => {
                this.activeStep = 1;
              },
            },
          ],
          upperButtons: true,
        },
        {
          id: "ViewSelector",
          component: markRaw(AbimoViewSelectorAmarex),
          props: {
            nextStep: (step) => {
              this.activeStep = 2;
            },
          },
          title: "Betrachtungsraum wählen",
          description:
            "Mit unserem Wasserhaushaltsmodell können Sie auf verschiedene Arten Ihr Szenario zusammenstellen.",
          buttons: [
            {
              text: "Zurück",
              action: () => {
                this.activeStep = 0;
              },
            },
          ],
        },
        {
          id: "BlockAreaSelector",
          component: markRaw(AbimoBlockAreaSelectorAmarex),
          title: "Vorberechnete Modelle",
          description:
            "Zur Status Quo Analyse können Sie mit den vorberechneten Karten aus dem Kartenkatalog starten.\nMöchten Sie diese ihrer Bearbeitung hinzufügen?",
          buttons: [
            {
              text: "Zurück",
              action: () => {
                this.activeStep = 1;
              },
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
      ],
      totalArea: 0,
      preComputedModelsAdded: false,
      showInfo: null,
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
  },
  computed: {
    ...mapGetters("Modules/AbimoHandler", ["accumulatedAbimoStats"]),
    activeComponent() {
      return this.steps[this.activeStep] || {};
    },
    formattedDescription() {
      return this.preComputedModelsAdded &&
        !!this.steps[this.activeStep]?.continueDescription &&
        this.activeStep === 0
        ? this.steps[this.activeStep]?.continueDescription?.replace(
            /\n/g,
            "<br>",
          )
        : this.steps[this.activeStep]?.description?.replace(/\n/g, "<br>");
    },
  },
  mounted() {
    this.activeStep = 2;
  },
  watch: {
    accumulatedAbimoStats(value) {
      this.totalArea = +value.totalArea.toFixed(0);
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
  >
    <!-- PRE COMPUTED MODELS -->
    <PreComputedModelsAmarex
      v-if="preComputedModelsAdded"
      :openInfo="openInfo"
    />
    <!-- TITLE & DESCRIPTION IN EACH STEP -->
    <div
      class="content-container"
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
        v-html="formattedDescription"
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
      </div>
    </div>
    <!-- INFO CONTAINER -->
    <AbimoLayerInfoAmarex
      v-if="showInfo"
      :showInfo="showInfo"
      :hideInfo="hideInfo"
    />
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
}
</style>

<!-- STEPS

<AbimoBlockAreaSelectorAmarex />
component: markRaw(AbimoBlockAreaSelectorAmarex),

<AbimoSelector type="greenRoof" />

<AbimoSelector type="unsealed" />

<AbimoSelector type="swaleConnected" />

<AbimoCalcButton />

-->

