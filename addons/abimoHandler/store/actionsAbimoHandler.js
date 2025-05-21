import areaCalc from "../utils/areaCalculations";
import measureCalc from "../utils/measureCalculations";

const actions = {
  updateAccumulatedStats({ commit, state }) {
    const stats = areaCalc.calculateAllStats(
      state.selectedFeatures,
      state.newUnpvd || 0,
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
  updateResultStats({ commit }, data) {
    const stats = areaCalc.calculateResultStats(data);
    commit("setResultAbimoStats", stats);
  },
  updatePreComputedStats({ commit }, data) {
    const stats = areaCalc.calculateResultStats(data);
    commit("setPreComputedStats", stats);
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
  async updateMeasureStats({ state, commit }) {
    const stats = await measureCalc.calculateAllMeasureStats(
      state.selectedFeatures,
      state.selectedMeasures,
    );
    commit("setAccumulatedMeasureStats", stats);
    commit("setNewGreenRoof", stats.newGreenRoof);
    commit("setNewUnpvd", stats.newUnpvd);
    commit("setNewToSwale", stats.newToSwale);
  },
  async canAddMeasure({ state }, { tempMeasure, measureType }) {
    const tempMeasures = [...state.selectedMeasures, tempMeasure];

    const statsWithNewMeasure = await measureCalc.calculateAllMeasureStats(
      state.selectedFeatures,
      tempMeasures,
    );

    let canAdd = true;
    let message = "";

    switch (measureType) {
      case "greenRoof":
        if (statsWithNewMeasure.Agt > statsWithNewMeasure.Ag_max) {
          canAdd = false;
          message = "Gründach: die verfügbare Dachfläche wurde überschritten.";
        }
        break;
      case "unpaved":
        if (statsWithNewMeasure.Amt > statsWithNewMeasure.Am_max) {
          canAdd = false;
          message =
            "Diese Fläche entwässert bereits in eine Versickerungsmulde. Eine weitere Entsiegelung ist nicht möglich.";
        }
        if (statsWithNewMeasure.Aet > statsWithNewMeasure.Ae_max) {
          canAdd = false;
          message =
            "Entsiegelung: die verfügbare unbebaute abflusswirksame Fläche wurde überschritten.";
        }
        break;
      case "swale":
        if (statsWithNewMeasure.Amt > statsWithNewMeasure.Am_max) {
          canAdd = false;
          message =
            "Versickerungsmulden: Sie haben die maximale Anschlussfläche überschritten.";
        }
        break;
    }

    return { canAdd, message, stats: statsWithNewMeasure };
  },
};

export default actions;

