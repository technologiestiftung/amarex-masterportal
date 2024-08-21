import areaCalc from "../utils/areaCalculations";

const actions = {
  updateAccumulatedStats({ commit, state }) {
    const totalFeatures = state.selectedFeatures.length;
    const totalArea = areaCalc.getTotalArea(state.selectedFeatures);

    // Berechnung der Flaechenwerte
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
    const meanRoof = areaCalc.getMeanRoof(state.selectedFeatures);
    const meanGreenRoof = areaCalc.getMeanGreenRoof(state.selectedFeatures);
    const meanUnpaved = areaCalc.getMeanUnpaved(state.selectedFeatures);
    const meanSwaleConnected = areaCalc.getMeanSwaleConnected(
      state.selectedFeatures,
    );
    const meanPaved = areaCalc.getMeanPaved(state.selectedFeatures);
    const maxGreenRoof = areaCalc.getMaxGreenRoof(state.selectedFeatures);
    const maxUnpaved = areaCalc.getMaxUnpaved(state.selectedFeatures);
    const maxSwaleConnected = areaCalc.getMaxSwaleConnected(
      state.selectedFeatures,
      state.newUnpvd,
    );

    // Berechnung der Prozentwerte
    const percentageGreenRoofToRoof = totalArea
      ? (totalGreenRoofArea / totalRoofArea) * 100
      : 0;
    const percentageGreenRoof = totalArea
      ? (totalGreenRoofArea / totalArea) * 100
      : 0;
    const percentageSwaleConnectedToPvd = totalArea
      ? (totalSwaleConnectedArea / totalPavedArea) * 100
      : 0;
    const percentageSwaleConnected = totalArea
      ? (totalSwaleConnectedArea / totalArea) * 100
      : 0;

    const stats = {
      featuresSelected: totalFeatures,
      totalArea,

      totalRoofArea,
      totalPavedArea,
      totalUnpavedArea,

      meanRoof,
      meanUnpaved,
      meanPaved,
      meanGreenRoof,
      meanSwaleConnected,

      maxGreenRoof,
      maxUnpaved,
      maxSwaleConnected,

      // percentages
      percentageGreenRoofToRoof,
      percentageGreenRoof,
      percentageSwaleConnectedToPvd,
      percentageSwaleConnected,
    };

    commit("setAccumulatedAbimoStats", stats);

    state.areaTypesData.find((area) => area.id === "unpvd").percentage =
      meanUnpaved;
    state.areaTypesData.find((area) => area.id === "roof").percentage =
      meanRoof;
    state.areaTypesData.find((area) => area.id === "pvd").percentage =
      meanPaved;
  },
};

export default actions;

