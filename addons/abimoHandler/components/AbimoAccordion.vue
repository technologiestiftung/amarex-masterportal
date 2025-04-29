<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "AbimoAccordion",
  computed: {
    ...mapGetters("Modules/AbimoHandler", ["steps"]),
  },
  methods: {
    ...mapActions("Modules/AbimoHandler", ["toggleStep"]),
  },
};
</script>

<template>
  <div
    class="accordion h-100 overflow-scroll"
    id="abimoAccordion"
  >
    <div
      v-for="step in steps"
      :key="step.id"
      class="accordion-item accordion-flush"
    >
      <h5
        class="accordion-header"
        :id="`heading${step.id}`"
      >
        <button
          class="accordion-button"
          :class="{ collapsed: !step.isActive }"
          type="button"
          data-bs-toggle="collapse"
          :data-bs-target="`#collapse${step.id}`"
          :aria-controls="`collapse${step.id}`"
          @click="toggleStep(step)"
        >
          <!-- TODO: fix ids once the first step is integrated (remove -1) -->
          {{ step.id - 1 }}. {{ step.label }}
        </button>
      </h5>

      <div
        :id="`collapse${step.id}`"
        :class="['accordion-collapse collapse', { show: step.isActive }]"
        :aria-labelledby="`heading${step.id}`"
        data-bs-parent="#abimoAccordion"
      >
        <div class="accordion-body">
          <p>{{ step.description }}</p>
          <slot :step="step" />
        </div>
      </div>
    </div>
  </div>
</template>

