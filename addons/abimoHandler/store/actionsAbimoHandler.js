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
};

export default actions;

