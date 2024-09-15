import areaCalc from "../utils/areaCalculations";

const actions = {
  updateAccumulatedStats({ commit, state }) {
    const stats = areaCalc.calculateAllStats(
      state.selectedFeatures,
      state.newUnpvd,
    );
    commit("setAccumulatedAbimoStats", stats);

    state.areaTypesData.find((area) => area.id === "unpvd").max =
      stats.meanUnpaved;
    state.areaTypesData.find((area) => area.id === "roof").max = stats.meanRoof;
    state.areaTypesData.find((area) => area.id === "pvd").max = stats.meanPaved;
  },
  updateMaxSwaleConnected({ commit, state }) {
    const maxSwaleConnected = areaCalc.getMaxSwaleConnected(
      state.selectedFeatures,
      state.newUnpvd,
    );
    commit("setAccumulatedAbimoStats", {
      ...state.accumulatedAbimoStats,
      maxSwaleConnected,
    });
  },
  updateAccordionSteps({ commit, state }, stepToSetActive) {
    if (!stepToSetActive) {
      const resetSteps = state.steps.map((step) => ({
        ...step,
        isActive: false,
      }));

      commit("setSteps", resetSteps);
    } else {
      const stepToUpdate = state.steps.find(
        (step) => step.id === stepToSetActive,
      );

      const steps = state.steps.map((step) => {
        if (step.id === stepToUpdate.id) {
          return {
            ...step,
            isActive: true,
          };
        }
        return {
          ...step,
          isActive: false,
        };
      });
      commit("setSteps", steps);
    }
  },
  
  toggleStep({ commit, state }, stepToToggle) {
    const steps = state.steps.map((step) => ({
      ...step,
      isActive: step.id === stepToToggle.id ? !stepToToggle.isActive : false,
    }));
    commit("setSteps", steps);
  },
};

export default actions;

