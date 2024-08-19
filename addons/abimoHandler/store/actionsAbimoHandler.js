import areaCalc from "../utils/areaCalculations";

const actions = {
  updateAccumulatedStats({ commit, state }) {
    const totalFeatures = state.selectedFeatures.length;
    const totalArea = areaCalc.getTotalArea(state.selectedFeatures);

    const totalSwaleConnectedArea = areaCalc.getTotalSwaleConnectedArea(
      state.selectedFeatures,
    );
    const totalUnpavedArea = areaCalc.getTotalUnpavedArea(
      state.selectedFeatures,
    );
    const totalGreenRoofArea = areaCalc.getTotalGreenRoofArea(
      state.selectedFeatures,
    );
    const totalRoofArea = areaCalc.getTotalRoofArea(state.selectedFeatures);
    const totalPavedArea = areaCalc.getTotalPavedArea(state.selectedFeatures);

    // Berechnung der Prozentwerte
    const percentageGreenRoofToRoof = totalArea
      ? (totalGreenRoofArea / totalRoofArea) * 100
      : 0;
    const percentageGreenRoofToTotalArea = totalArea
      ? (totalGreenRoofArea / totalArea) * 100
      : 0;
    const percentageSwaleConnectedToPvd = totalArea
      ? (totalSwaleConnectedArea / totalPavedArea) * 100
      : 0;
    const percentageSwaleConnectedToTotalArea = totalArea
      ? (totalSwaleConnectedArea / totalArea) * 100
      : 0;

    const stats = {
      featuresSelected: totalFeatures,
      totalArea: totalArea,

      totalRoofArea: totalRoofArea,
      totalPavedArea: totalPavedArea,
      totalUnpavedArea: totalUnpavedArea,

      // percentages
      percentageGreenRoofToRoof: percentageGreenRoofToRoof,
      percentageGreenRoofToTotalArea: percentageGreenRoofToTotalArea,
      percentageSwaleConnectedToPvd: percentageSwaleConnectedToPvd,
      percentageSwaleConnectedToTotalArea: percentageSwaleConnectedToTotalArea,
    };
    commit("setAccumulatedAbimoStats", stats);

    // Update areaTypesData
    const percentageUnpaved = totalArea
      ? (totalUnpavedArea / totalArea) * 100
      : 0;
    const percentageRoof = totalArea ? (totalRoofArea / totalArea) * 100 : 0;
    const percentagePaved = totalArea ? (totalPavedArea / totalArea) * 100 : 0;

    state.areaTypesData.find((area) => area.id === "unpvd").percentage =
      percentageUnpaved;
    state.areaTypesData.find((area) => area.id === "roof").percentage =
      percentageRoof;
    state.areaTypesData.find((area) => area.id === "pvd").percentage =
      percentagePaved;

    state.roofSliderData.find((area) => area.id === "roof").percentage =
      percentageRoof;
  },

  calculatePercentages({ commit }, feature) {
    const evaporation = Math.floor(parseFloat(feature.values_.evaporatio));
    const rinse = Math.floor(parseFloat(feature.values_.ri));
    const runoff = Math.floor(parseFloat(feature.values_.row));

    const total = evaporation + rinse + runoff;

    const evaporationPercentage = (evaporation / total) * 100 - 0.5;
    const rinsePercentage = (rinse / total) * 100 - 0.5;
    const runoffPercentage = (runoff / total) * 100 - 0.5;

    const percentages = {
      evaporationPercentage,
      rinsePercentage,
      runoffPercentage,
    };

    commit("setPercentages", percentages);
    return percentages;
  },
};

export default actions;

