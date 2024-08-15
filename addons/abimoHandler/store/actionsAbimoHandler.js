import areaCalc from "../utils/areaCalculations";

const actions = {
  updateAccumulatedStats({ commit, state }) {
    const totalFeatures = state.selectedFeatures.length;
    const totalArea = areaCalc.getTotalArea(state.selectedFeatures);
    const averageEvaporation = areaCalc.calculateAttributeAverage(
      state.selectedFeatures,
      "evaporatio",
    );
    const averageSwale = areaCalc.calculateAttributeAverage(
      state.selectedFeatures,
      "infiltrati",
    );
    const averageRinse = areaCalc.calculateAttributeAverage(
      state.selectedFeatures,
      "surface_ru",
    );

    const stats = {
      featuresSelected: totalFeatures,
      totalArea: totalArea,
      averageEvaporation: averageEvaporation,
      averageSwale: averageSwale,
      averageRinse: averageRinse,
    };

    commit("setAccumulatedAbimoStats", stats);
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

