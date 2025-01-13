<script>
import AbimoAccordion from "./AbimoAccordion.vue";
import AbimoBlockAreaSelector from "./AbimoBlockAreaSelector.vue";
import AbimoSelector from "./AbimoSelector.vue";
import AbimoCalcButton from "./AbimoCalcButton.vue";
import mapCollection from "../../../src/core/maps/js/mapCollection";
import { mapActions, mapGetters, mapMutations } from "vuex";
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  LoaderCircle,
} from "lucide-vue-next";
import colors from "../../../src/shared/js/utils/amarex-colors.json";
import ToolIMG from "../../../portal/amarex/resources/img/Placeholder-Tutorial-Tools.jpg";
import QuartierIMG from "../../../portal/amarex/resources/img/Placeholder-Tutorial-Quarter.jpg";
import PlaceholderDeltaWRectangle from "../../../portal/amarex/resources/img/Placeholder-DeltaW-Rectangle.jpg";
import LayerTree from "../../../src/modules/layerTree/components/LayerTree.vue";

/**
 * Abimo
 * @module modules/AbimoHandler
 */
export default {
  name: "AbimoHandler",
  components: {
    AbimoAccordion,
    AbimoBlockAreaSelector,
    AbimoSelector,
    AbimoCalcButton,
    LayerTree,
    ChevronDown,
    ChevronUp,
    RotateCcw,
    LoaderCircle,
  },
  data() {
    return {
      ToolIMG,
      QuartierIMG,
      PlaceholderDeltaWRectangle,
      showLayerTree: false,
      colors,
      upperAbimoHandlerContainerHeight: 0,
      contentContainerRefWidth: 0,
      statusBarWidth: 10,
      abimoSteps: [
        {
          id: 1,
          title: "Vorberechnete Modelle",
          description:
            "Zur Status Quo Analyse können Sie mit den vorberechneten Karten aus dem Kartenkatalog starten.<br><br>Möchten Sie diese ihrer Bearbeitung hinzufügen?",
        },
        {
          id: 2,
          title: "Betrachtungsebene wählen",
          description:
            "Mit unserem Wasserhaushaltsmodell können Sie auf verschiedene Arten ihr Szenario zusammenstellen.",
        },
        {
          id: 3,
          title: "Untersuchungsgebiet wählen",
          description:
            "Wählen Sie in der Karte die zu untersuchende Blockteilfläche via Mausklick aus.",
        },
        {
          id: 4,
          title: "Dachbegrünung",
          description: `Bei den von Ihnen gewählten Flächen stehen <strong>${"XXX"} m2</strong><br>Dachflächen zur Verfügung.`,
        },
        {
          id: 5,
          title: "Unversiegelte Flächen",
          description: `Bei den von Ihnen gewählten Flächen stehen <strong>${"XXX"} m2</strong><br>nicht bebaut versiegelte Fläche zur Verfügung.<br><br>Möchten Sie diesen Anteil variieren?`,
        },
        {
          id: 6,
          title: "Anschluss an Mulde",
          description: `Bei den von Ihnen gewählten Zielwerten verbleiben <strong>${"XXX"} m2</strong><br>Fläche versiegelt.<br><br>Welchen Anteil möchten Sie an Mulden anschliessen?`,
        },
        {
          id: 7,
          title: "Ergebnisse Berechnung",
          description: `Durch die von Ihnen vorgenommenen Planungs-maßnahmen würde sich der Wert ∆W um <strong>-XX</strong> verändern.`,
        },
      ],
      activeAbimoStep: null,
      resizeParentObserver: null,
      totalSelectedArea: 0,
      btnLoading: false,
    };
  },
  computed: {
    ...mapGetters("Modules/AbimoHandler", [
      "selectedFeatures",
      "selectInteraction",
      "accumulatedAbimoStats",
    ]),
  },
  mounted() {
    /* const getCacheShowLayerTree = localStorage.getItem("cacheShowLayerTree");
    this.showLayerTree = getCacheShowLayerTree
      ? JSON.parse(getCacheShowLayerTree)
      : false; */
    this.activeAbimoStep = this.abimoSteps[0];
    this.updateRefValues();
    this.resizeObserver = new ResizeObserver(() => {
      this.updateRefValues();
    });
    if (this.$refs.upperAbimoHandlerContainer) {
      this.resizeObserver.observe(this.$refs.upperAbimoHandlerContainer);
    }
    const parentElement = document.getElementById("mp-menu-secondaryMenu");
    if (parentElement) {
      this.resizeParentObserver = new ResizeObserver(() => {
        console.log("resizeParentObserver");
        const elWidth = this.$refs.contentContainerRef;
        if (elWidth) {
          this.contentContainerRefWidth = elWidth.offsetWidth;
        }
      });
      this.resizeParentObserver.observe(parentElement);
    } else {
      console.warn("mp-menu-secondaryMenu not found");
    }
  },
  beforeUnmount() {
    if (this.resizeParentObserver) {
      this.resizeParentObserver.disconnect();
    }
  },
  watch: {
    accumulatedAbimoStats(newValue) {
      console.log(
        "accumulatedAbimoStats.totalArea.toFixed(0) :>> ",
        newValue.totalArea.toFixed(0),
      );
      this.totalSelectedArea = +newValue.totalArea.toFixed(0);
    },
    btnLoading(newValue) {
      if (newValue) {
        setTimeout(() => {
          this.btnLoading = false;
          this.activeAbimoStep = this.abimoSteps[6];
          this.statusBarWidth = 90;
        }, 3000);
      }
    },
  },
  methods: {
    ...mapActions("Modules/AbimoHandler", [
      "updateAccordionSteps",
      "resetAccumulatedStats",
      "updateAccumulatedStats",
    ]),
    ...mapActions("Maps", {
      addInteractionToMap: "addInteraction",
    }),
    ...mapMutations("Modules/AbimoHandler", [
      "setSelectedFeatures",
      "setNewGreenRoof",
      "setNewUnpvd",
      "setNewToSwale",
      "setResetTargetValues",
    ]),
    handleAbimoReset() {
      console.log("handleAbimoReset");
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

      this.addInteractionToMap(this.selectInteraction);

      this.setNewGreenRoof(0);
      this.setNewUnpvd(0);
      this.setNewToSwale(0);
      this.setResetTargetValues(true);
      // this.updateAccordionSteps(2);
    },
    toggleLayerTree() {
      this.showLayerTree = !this.showLayerTree;
    },
    updateRefValues() {
      const el = this.$refs.upperAbimoHandlerContainer;
      if (el) {
        this.upperAbimoHandlerContainerHeight = el.offsetHeight;
      }
      const elWidth = this.$refs.contentContainerRef;
      if (elWidth) {
        this.contentContainerRefWidth = elWidth.offsetWidth;
      }
    },
    handleAbimoStepClick(step) {
      const goForward = () => {
        this.activeAbimoStep = this.abimoSteps[this.activeAbimoStep?.id];
      };
      const goBackward = () => {
        if (this.activeAbimoStep?.id === 1) return goForward();
        this.activeAbimoStep = this.abimoSteps[this.activeAbimoStep?.id - 2];
      };
      if (this.activeAbimoStep?.id === 6 && step === "forward")
        return (this.btnLoading = true);
      if (typeof step === "object") return (this.activeAbimoStep = step);
      if (step === "forward") return goForward();
      if (step === "backward") return goBackward();
    },
    resetClick() {},
    backwardButtonWording() {
      if (this.activeAbimoStep?.id === 1) return "Überspringen";
      if (this.activeAbimoStep?.id === 2) return "Zurück";
      return "Zurück";
    },
    forwardButtonWording() {
      if (this.activeAbimoStep?.id === 3) return "Bestätigen";
      if (this.activeAbimoStep?.id === 6 && !this.btnLoading)
        return "Berechnen";
      if (this.activeAbimoStep?.id === 6 && this.btnLoading) return "Lädt...";
      return "Weiter";
    },
    disableForwardButton() {
      return (
        (this.activeAbimoStep?.id === 3 && this.totalSelectedArea === 0) ||
        (this.activeAbimoStep?.id !== 3 && this.btnLoading)
      );
    },
  },
};
</script>

<template lang="html">
  <div id="abimo">
    <div
      id="upper-abimo-handler-container"
      class="abimo-handler-container"
      ref="upperAbimoHandlerContainer"
      :style="{
        height: showLayerTree ? '35vh' : 'auto',
      }"
    >
      <div
        class="abimo-handler-layer-title-container mb-4"
        @click="toggleLayerTree"
      >
        <h5 class="abimo-handler-layer-title">Ebenen Wasserhaushalt</h5>
        <ChevronUp
          :color="colors.amarex_secondary"
          :size="20"
          v-if="showLayerTree"
        />
        <ChevronDown
          :color="colors.amarex_secondary"
          :size="20"
          v-else
        />
      </div>
      <p
        v-if="showLayerTree"
        class="amarex-bold mb-4"
      >
        &ndash; Führen Sie mit den untenstehende Berechnungswerkzeugen Ebenen
        zum Thema Wasserhaushalt hinzu. &ndash;
      </p>
      <div
        class="overflow-scroll"
        v-if="showLayerTree && false"
      >
        <LayerTree
          v-if="showLayerTree"
          :openInfo="openInfo"
          :showInfo="showInfo"
        />
      </div>
    </div>
    <div
      id="lower-abimo-handler-container"
      class="abimo-handler-container"
      :style="{
        height: `calc(100vh - 3rem - ${this.upperAbimoHandlerContainerHeight}px)`,
      }"
    >
      <div class="abimo-handler-layer-title-container second-title-container">
        <h5 class="abimo-handler-layer-title">Wasserhaushaltsmodell</h5>
      </div>
      <div
        class="abimo-handler-layer-calculation-container d-flex align-items-center mb-3"
      >
        <div id="status-bar">
          <div :style="{ width: `${statusBarWidth}%` }"></div>
        </div>
        <h5 class="abimo-handler-layer-title">{{ statusBarWidth }}%</h5>
      </div>
      <div
        class="abimo-handler-layer-content-container mt-3"
        ref="contentContainerRef"
      >
        <br />
        <div
          :style="{
            width: `${contentContainerRefWidth}px`,
          }"
        >
          <p
            class="amarex-bold"
            v-if="!btnLoading"
          >
            {{ activeAbimoStep?.title }}
          </p>
          <p
            v-if="activeAbimoStep?.id !== 1 && !btnLoading"
            class="amarex-caption mb-3"
            v-html="activeAbimoStep?.description"
          />
          <p
            v-else-if="!btnLoading"
            class="amarex-small mb-3"
            v-html="activeAbimoStep?.description"
          />
          <div
            v-if="activeAbimoStep?.id === 2"
            class="step-2-intro"
          >
            <p class="amarex-bold mb-1">Quartierplanung</p>
            <div class="w-100 d-flex">
              <img :src="QuartierIMG" />
            </div>
            <p class="amarex-caption mt-1 mb-2">
              Für die Planung ganzer Quartiere stellen wir Ihnen unsere
              Schieberegler zur Verfügung, mit welchen Sie auf relativer Ebene
              Maßnahmen vergeben können.
            </p>
            <button
              class="amarex-btn-primary mid full accent"
              @click="handleAbimoStepClick(abimoSteps[2])"
            >
              <p class="amarex-bold">Zur Quartierplanung</p>
            </button>
          </div>
          <div v-else-if="activeAbimoStep?.id === 3">
            <AbimoBlockAreaSelector />
          </div>
          <div
            class="content-parent"
            v-else-if="activeAbimoStep?.id === 4"
          >
            <AbimoSelector type="greenRoof" />
          </div>
          <div
            class="content-parent"
            v-else-if="activeAbimoStep?.id === 5"
          >
            <AbimoSelector type="unsealed" />
          </div>
          <div
            class="content-parent"
            :style="{ marginTop: btnLoading ? '70%' : '0' }"
            v-else-if="activeAbimoStep?.id === 6"
          >
            <AbimoSelector
              v-if="!btnLoading"
              type="swaleConnected"
            />
            <p
              class="amarex-bold"
              v-else
            >
              Ihre Ergebnisse werden geladen...
            </p>
            <div
              class="loader-container"
              v-if="btnLoading"
            >
              <LoaderCircle
                :color="colors.amarex_grey_mid"
                :size="20"
              />
            </div>
          </div>
          <div
            v-else-if="activeAbimoStep?.id === 7"
            class="calc-container"
          >
            <img :src="PlaceholderDeltaWRectangle" />
            <p class="amarex-small my-3">
              Sie können nun die verschiedenen Ergebnislayer Ihrer Ansicht
              hinzufügen.
            </p>
            <p class="amarex-bold mb-3">Berechnete Ergebnislayer</p>
            <ul>
              <li>∆W - Abweichung vom natürlichen Wasserhaushalt</li>
              <li>Oberflächenabfluss</li>
              <li>Infiltration</li>
              <li>Verdunstung</li>
            </ul>
            <!-- <AbimoCalcButton /> -->
          </div>
        </div>
      </div>
      <div class="abimo-handler-layer-indicator-cta">
        <div
          class="abimo-handler-step-indicator d-flex align-items-center justify-content-center my-3"
        >
          <div
            v-for="abimoStep in abimoSteps"
            :key="abimoStep.id"
            :class="{ active: abimoStep.id === activeAbimoStep?.id }"
          ></div>
          <!-- @click="handleAbimoStepClick(abimoStep.id)" -->
        </div>
        <div
          class="abimo-handler-layer-cta-container d-flex align-items-center"
        >
          <button
            class="amarex-btn-primary grey mid full"
            @click="handleAbimoStepClick('backward')"
            :disabled="btnLoading"
          >
            <p class="amarex-bold">
              {{ backwardButtonWording() }}
            </p>
          </button>
          <button
            v-if="
              activeAbimoStep?.id !== 1 &&
              activeAbimoStep?.id !== 2 &&
              activeAbimoStep?.id !== 7
            "
            class="amarex-btn-primary accent mid full"
            :class="{
              deactivated: disableForwardButton(),
            }"
            :disabled="disableForwardButton()"
            @click="handleAbimoStepClick('forward')"
          >
            <p class="amarex-bold">
              {{ forwardButtonWording() }}
            </p>
          </button>
        </div>
        <div
          class="d-flex w-100 justify-content-end mt-2 abimo-handler-reset"
          :style="{ visibility: activeAbimoStep === 3 ? 'visible' : 'hidden' }"
          @click="resetClick"
        >
          <p class="amarex-caption">Auswahl zurücksetzen</p>
          <RotateCcw
            :size="15"
            :color="colors.amarex_grey_dark"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.abimo-handler-container {
  &#upper-abimo-handler-container {
    display: grid;
    grid-template-rows: auto 1fr;
  }
  &#lower-abimo-handler-container {
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    .abimo-handler-layer-calculation-container {
      gap: 1.5rem;
      #status-bar {
        flex: 1;
        background: $amarex_grey_light;
        height: 10px;
        & > div {
          background: $amarex_secondary_mid;
          height: 100%;
          transition: all 1s ease-in-out;
        }
      }
    }
    .abimo-handler-layer-content-container {
      overflow-x: hidden;
      overflow-y: scroll;
      display: flex;
      & > div {
        height: fit-content;
        flex-shrink: 0;
        padding-right: 1.5rem;
        min-height: 100%;
        .step-2-intro {
          img {
            width: 100%;
            max-width: 350px;
          }
        }
        .content-parent {
          padding: 0 10px;
          .loader-container {
            width: 100%;
            display: flex;
            justify-content: center;
            svg {
              animation: rotate 1s linear infinite;
            }
          }
        }
        h5 {
          margin-bottom: 5rem;
        }
        .calc-container {
          img {
            width: 100%;
            max-width: 350px;
          }
        }
      }
    }
    .abimo-handler-layer-indicator-cta {
      .abimo-handler-step-indicator {
        gap: 7.5px;
        & > div {
          width: 10px;
          height: 10px;
          border-radius: 100%;
          border: 2px solid $amarex_secondary_mid;
          &.active {
            background: $amarex_secondary_mid;
          }
        }
      }
      .abimo-handler-layer-cta-container {
        gap: 1.5rem;
      }
      .abimo-handler-reset {
        button {
          border: none !important;
          background: none;
        }
      }
    }
  }
}
.abimo-handler-layer-title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:not(.second-title-container) {
    @include clickable();
  }
  &.second-title-container {
    border-top: 1px solid $amarex_grey_light;
    padding-top: 20px;
    h5 {
      user-select: none;
    }
    & > div {
      @include clickable();
      display: flex;
      align-items: center;
    }
  }
}
input[type="range"],
ul {
  list-style: none;
  padding: 0;
}
</style>

