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
    const totalSealedArea = areaCalc.getTotalSealedArea(state.selectedFeatures);

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
    const percentagePavedAreaToTotalArea = totalArea
      ? (totalPavedArea / totalArea) * 100
      : 0;

    // Update areaTypesData
    const percentageUnpaved = totalArea
      ? (totalUnpavedArea / totalArea) * 100
      : 0;
    const percentageRoofToTotalArea = totalArea
      ? (totalRoofArea / totalArea) * 100
      : 0;
    const percentagePaved = totalArea ? (totalPavedArea / totalArea) * 100 : 0;
    const percentageSealedToTotalArea = totalArea
      ? (totalSealedArea / totalArea) * 100
      : 0;

    const stats = {
      featuresSelected: totalFeatures,
      totalArea: totalArea,

      totalRoofArea: totalRoofArea,
      totalPavedArea: totalPavedArea,
      totalUnpavedArea: totalUnpavedArea,

      // percentages
      percentageRoofToTotalArea: percentageRoofToTotalArea,
      percentageGreenRoofToRoof: percentageGreenRoofToRoof,
      percentageGreenRoofToTotalArea: percentageGreenRoofToTotalArea,
      percentageSwaleConnectedToPvd: percentageSwaleConnectedToPvd,
      percentageSwaleConnectedToTotalArea: percentageSwaleConnectedToTotalArea,
      percentageSealedToTotalArea: percentageSealedToTotalArea,
      percentagePavedAreaToTotalArea: percentagePavedAreaToTotalArea,
    };

    commit("setAccumulatedAbimoStats", stats);

    state.areaTypesData.find((area) => area.id === "unpvd").percentage =
      percentageUnpaved;
    state.areaTypesData.find((area) => area.id === "roof").percentage =
      percentageRoofToTotalArea;
    state.areaTypesData.find((area) => area.id === "pvd").percentage =
      percentagePaved;
  },
};

export default actions;

