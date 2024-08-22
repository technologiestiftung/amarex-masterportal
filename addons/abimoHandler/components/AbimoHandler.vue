<script>
import AbimoAccordion from "./AbimoAccordion.vue";
import AbimoBlockAreaSelector from "./AbimoBlockAreaSelector.vue";
import AbimoSelector from "./AbimoSelector.vue";
import AbimoCalcButton from "./AbimoCalcButton.vue";

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
  },
  data() {
    return {
      steps: [
        {
          id: 1,
          label: "Vorberechnete Modelle",
          description:
            "Zur Status Quo Analyse können Sie mit den vorberechneten Karten aus dem Kartenkatalog starten",
          isActive: false,
          buttons: [
            {
              id: 1,
              label: "Zum Katalog",
              isDisabled: false,
            },
            {
              id: 2,
              label: "Überspringen",
              isDisabled: false,
            },
          ],
        },
        {
          id: 2,
          label: "Untersuchungsgebiet Definieren",
          description:
            "Wählen Sie in der Karte die Blockteilflächen via Mausklick aus, die Sie untersuchen möchten.",
          isActive: false,
          buttons: [
            {
              id: 1,
              label: "Bestätigen",
              isDisabled: false,
            },
          ],
        },
        {
          id: 3,
          label: "Dachbegrünung",
          description:
            "Bei den von Ihnen gewählten Flächen stehen xxxx m2 Dachflächen zur Verfügung. Welchen Anteil möchten Sie begrünen?",
          isActive: true,
          buttons: [
            {
              id: 1,
              label: "Bestätigen",
              isDisabled: true,
            },
          ],
        },
        {
          id: 4,
          label: "Unversiegelte Flächen + nichtbebaut Versiegelte Flächen",
          description:
            "Wählen Sie anteilsmäßig die Maßnahmen, die Sie in die Berechnung einfließen lassen wollen.",
          isActive: false,
        },
        {
          id: 5,
          label: "Anschluss an Mulde",
          description:
            "Wählen Sie anteilsmäßig die Maßnahmen, die Sie in die Berechnung einfließen lassen wollen.",
          isActive: false,
        },
        {
          id: 6,
          label: "Berechnung",
          description:
            "Fügen Sie nun den berechneten DeltaW-Layer hinzu. Des Weiteren stehen ihnen weitere Ergebnislayer zur Verfügung.",
          isActive: false,
        },
        {
          id: 7,
          label: "Weitere Berechnung",
          description:
            "Wenn Sie weitere Berchnungen mit veränderten Parametern vornehmen möchten, klicken Sie hier auf Neu Berechnen.",
          isActive: false,
          buttons: [
            {
              id: 1,
              label: "Neu Berechnen",
              isDisabled: true,
            },
          ],
        },
      ],
    };
  },
};
</script>

<template lang="html">
  <div
    id="abimo"
    class="d-flex flex-column gap-3"
  >
    <div class="d-flex flex-column h-100 overflow-scroll">
      <h1>Berechnete Layer</h1>
    </div>
    <hr />
    <div class="flex-grow-1">
      <AbimoAccordion :steps="steps">
        <template v-slot:default="slotProps">
          <!-- Step 1 -->
          <div v-if="slotProps.step.id === 1">
            <button
              class="btn btn-primary"
              @click="handleStepOneClick"
            >
              Zum Katalog
            </button>
            <button class="btn btn-secondary">Überspringen</button>
          </div>

          <!-- Step 2 -->
          <div v-if="slotProps.step.id === 2">
            <AbimoBlockAreaSelector />
          </div>

          <!-- Step 3 -->
          <div v-if="slotProps.step.id === 3">
            <AbimoSelector type="greenRoof" />
          </div>

          <!-- Step 4 -->
          <div v-else-if="slotProps.step.id === 4">
            <AbimoSelector type="unsealed" />
          </div>

          <!-- Step 5 -->
          <div v-else-if="slotProps.step.id === 5">
            <AbimoSelector type="swaleConnected" />
          </div>

          <!-- Step 6 -->
          <div v-if="slotProps.step.id === 6">
            <AbimoCalcButton />
          </div>

          <!-- Step 7 -->
          <div v-if="slotProps.step.id === 7">
            <!-- todo add reset function -->
            <button class="btn btn-primary">Neue Berechnung Starten</button>
          </div>
        </template>
      </AbimoAccordion>
    </div>
  </div>
</template>

<style lang="scss" scoped>
input[type="range"],
ul {
  list-style: none;
  padding: 0;
}
</style>

