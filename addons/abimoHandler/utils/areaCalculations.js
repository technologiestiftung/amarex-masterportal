function calculatePrecisely(value, precision = 9) {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}
function createTotalCalculator(attribute) {
  return (areas) =>
    calculatePrecisely(
      areas.reduce((sum, area) => sum + Number(area.values_[attribute]), 0),
    );
}
function createWeightedTotalCalculator(attributes) {
  return (areas) =>
    calculatePrecisely(
      areas.reduce(
        (sum, area) =>
          sum +
          attributes.reduce(
            (prod, attr) => prod * Number(area.values_[attr]),
            Number(area.values_.total_area),
          ),
        0,
      ),
    );
}

// Total
const getTotalArea = createTotalCalculator("total_area");
const getTotalRoofArea = createWeightedTotalCalculator(["roof"]);
const getTotalGreenRoofArea = createWeightedTotalCalculator([
  "roof",
  "green_roof",
]);
const getTotalPavedArea = createWeightedTotalCalculator(["pvd"]);
const getTotalUnpavedArea = (areas) =>
  calculatePrecisely(
    getTotalArea(areas) - getTotalRoofArea(areas) - getTotalPavedArea(areas),
  );
const getTotalSwaleConnectedArea = createWeightedTotalCalculator([
  "roof",
  "pvd",
  "to_swale",
]);
function getTotalSealedArea(areas) {
  return calculatePrecisely(getTotalRoofArea(areas) + getTotalPavedArea(areas));
}

// Mean
function createMeanCalculator(totalCalculator) {
  return (areas) => {
    const totalArea = getTotalArea(areas);
    return totalArea
      ? calculatePrecisely(totalCalculator(areas) / totalArea)
      : 0;
  };
}
const getMeanRoof = createMeanCalculator(getTotalRoofArea);
const getMeanGreenRoof = createMeanCalculator(getTotalGreenRoofArea);
const getMeanPaved = createMeanCalculator(getTotalPavedArea);
const getMeanUnpaved = createMeanCalculator(getTotalUnpavedArea);
const getMeanSwaleConnected = createMeanCalculator(getTotalSwaleConnectedArea);

// Max
const getMaxGreenRoof = getMeanRoof;
const getMaxUnpaved = (areas) => calculatePrecisely(1 - getMeanRoof(areas));
const getMaxSwaleConnected = (areas, newUnpvd) => {
  if (newUnpvd > 0) {
    return calculatePrecisely(1 - newUnpvd);
  } else {
    return calculatePrecisely(1 - getMeanUnpaved(areas));
  }
};
// All Stats
function calculateAllStats(selectedFeatures, newUnpvd) {
  const totalArea = getTotalArea(selectedFeatures);
  const totalRoofArea = getTotalRoofArea(selectedFeatures);
  const totalPavedArea = getTotalPavedArea(selectedFeatures);

  return {
    featuresSelected: selectedFeatures.length,
    totalArea,
    totalRoofArea,
    totalPavedArea,
    totalUnpavedArea: getTotalUnpavedArea(selectedFeatures),
    totalSwaleConnectedArea: getTotalSwaleConnectedArea(selectedFeatures),
    totalGreenRoofArea: getTotalGreenRoofArea(selectedFeatures),

    meanRoof: getMeanRoof(selectedFeatures),
    meanGreenRoof: getMeanGreenRoof(selectedFeatures),
    meanUnpaved: getMeanUnpaved(selectedFeatures),
    meanSwaleConnected: getMeanSwaleConnected(selectedFeatures),
    meanPaved: getMeanPaved(selectedFeatures),

    maxGreenRoof: getMaxGreenRoof(selectedFeatures),
    maxUnpaved: getMaxUnpaved(selectedFeatures),
    maxSwaleConnected: getMaxSwaleConnected(selectedFeatures, newUnpvd),
    maxGreenRoofToRoof: totalRoofArea
      ? getTotalGreenRoofArea(selectedFeatures) / totalRoofArea
      : 0,
    maxSwaleConnectedToPvd: totalPavedArea
      ? getTotalSwaleConnectedArea(selectedFeatures) / totalPavedArea
      : 0,
  };
}

export default {
  getTotalArea,
  getTotalRoofArea,
  getTotalGreenRoofArea,
  getTotalPavedArea,
  getTotalUnpavedArea,
  getTotalSwaleConnectedArea,
  getTotalSealedArea,
  getMeanRoof,
  getMeanGreenRoof,
  getMeanPaved,
  getMeanUnpaved,
  getMeanSwaleConnected,
  getMaxGreenRoof,
  getMaxUnpaved,
  getMaxSwaleConnected,
  calculateAllStats,
};

