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
const getMaxUnpavedArea = (areas) => getMaxUnpaved(areas) * getTotalArea(areas);

const getMaxSwaleConnected = (areas, newUnpvd) => {
  if (newUnpvd > 0) {
    return calculatePrecisely(1 - newUnpvd);
  } else {
    return calculatePrecisely(1 - getMeanUnpaved(areas));
  }
};
const getMaxSwaleConnectedArea = (areas) =>
  getMaxSwaleConnected(areas) * getTotalArea(areas);

// All Stats
function calculateAllStats(selectedFeatures, newUnpvd) {
  if (!selectedFeatures || selectedFeatures.length === 0) {
    return {
      totalArea: 0,
      featuresSelected: 0,

      totalRoofArea: 0,
      totalPavedArea: 0,
      totalUnpavedArea: 0,

      // Other Values
      totalGreenRoofArea: 0,
      totalSwaleConnectedArea: 0,
      maxUnpavedArea: 0,
      maxSwaleConnectedArea: 0,
      totalSealedArea: 0,

      meanRoof: 0,
      meanUnpaved: 0,
      meanGreenRoof: 0,
      meanPaved: 0,
      meanSwaleConnected: 0,

      maxGreenRoof: 0,
      maxUnpaved: 0,
      maxSwaleConnected: 0,
      maxGreenRoofToRoof: 0,
      maxSwaleConnectedToPvd: 0,
    };
  }

  const totalArea = getTotalArea(selectedFeatures);
  const totalRoofArea = getTotalRoofArea(selectedFeatures);
  const totalPavedArea = getTotalPavedArea(selectedFeatures);

  return {
    totalArea,
    featuresSelected: selectedFeatures.length,

    totalRoofArea,
    totalPavedArea,
    totalUnpavedArea: getTotalUnpavedArea(selectedFeatures),

    totalGreenRoofArea: getTotalGreenRoofArea(selectedFeatures),
    totalSwaleConnectedArea: getTotalSwaleConnectedArea(selectedFeatures),
    maxUnpavedArea: getMaxUnpavedArea(selectedFeatures),
    maxSwaleConnectedArea: getMaxSwaleConnectedArea(selectedFeatures),
    totalSealedArea: getTotalSealedArea(selectedFeatures),

    meanRoof: getMeanRoof(selectedFeatures),
    meanUnpaved: getMeanUnpaved(selectedFeatures),
    meanGreenRoof: getMeanGreenRoof(selectedFeatures),
    meanPaved: getMeanPaved(selectedFeatures),
    meanSwaleConnected: getMeanSwaleConnected(selectedFeatures),

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
function calculateResultStats(data) {
  const totalArea = data.reduce((sum, item) => sum + item.area, 0);
  const getWeightedAverage = (fieldName) => {
    const weightedSum = data.reduce(
      (sum, item) => sum + item[fieldName] * item.area,
      0,
    );
    return totalArea ? weightedSum / totalArea : 0;
  };
  return {
    deltaW: getWeightedAverage("delta_w"),
    runoff: getWeightedAverage("runoff"),
    evaporation: getWeightedAverage("evapor"),
    infiltration: getWeightedAverage("infiltr"),
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
  calculateResultStats,
};

