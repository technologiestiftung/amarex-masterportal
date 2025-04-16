import areaCalc from "./areaCalculations.js";
import Constants from "./constants.js";

function getMeasureDimension(type, size) {
  if (
    !Constants.MEASURE_DIMENSIONS[type] ||
    !Constants.MEASURE_DIMENSIONS[type][size]
  ) {
    console.warn(`Invalid measure type or size: ${type}, ${size}`);
    return null;
  }
  return Constants.MEASURE_DIMENSIONS[type][size];
}

function calculateTotalMeasureArea(measures) {
  return areaCalc.calculatePrecisely(
    measures.reduce((sum, measure) => sum + (measure.area || 0), 0),
  );
}

function calculateAllMeasureStats(
  selectedFeatures,
  newUnpvd,
  selectedMeasures,
) {
  if (!selectedMeasures || selectedMeasures.length === 0) {
    return {
      greenRoofMeasuresAmount: 0,
      unpavedMeasuresAmount: 0,
      swaleMeasuresAmount: 0,

      totalGreenRoofArea: 0,
      totalUnpavedArea: 0,
      totalSwaleArea: 0,
      totalSwaleVolume: 0,
      totalSwaleConnectedArea: 0,

      newGreenRoof: 0,
      newUnpvd: 0,
      newToSwale: 0,
    };
  }

  // Enhance measures with their dimensions from constants
  selectedMeasures = selectedMeasures.map((measure) => {
    const measureDimension = getMeasureDimension(measure.type, measure.size);
    return { ...measure, ...measureDimension }; // Creates a new object with combined properties
  });

  // Filter measures by type
  const greenRoofMeasures = selectedMeasures.filter(
    (measure) => measure.type === "greenRoof",
  );
  const unpavedMeasures = selectedMeasures.filter(
    (measure) => measure.type === "unpaved",
  );
  const swaleMeasures = selectedMeasures.filter(
    (measure) => measure.type === "swale",
  );

  // Step 1: Calculate total area of each measure type in m²
  const totalGreenRoofArea = calculateTotalMeasureArea(greenRoofMeasures); // Ag = Ag_1 + Ag_2 + ...
  const totalUnpavedArea = calculateTotalMeasureArea(unpavedMeasures); // Ae = Ae_1 + Ae_2 + ...
  const totalSwaleArea = calculateTotalMeasureArea(swaleMeasures); // Am = Am_1 + Am_2 + ...

  // Calculate total swale volume and connected area
  const totalSwaleVolume = areaCalc.calculatePrecisely(
    swaleMeasures.reduce((sum, measure) => sum + (measure.volume || 0), 0),
  );
  const totalSwaleConnectedArea = areaCalc.calculatePrecisely(
    swaleMeasures.reduce(
      (sum, measure) => sum + (measure.connectedArea || 0),
      0,
    ),
  );

  // Step 2: Include existing measures
  const stats = areaCalc.calculateAllStats(selectedFeatures, newUnpvd);
  console.log("[measureCalculations] stats::", stats);

  const mainFrac = 1; // Assumption: main_frac = 1

  // total_area	main_frac	roof	green_roof	pvd	to_swale
  let total_area = stats.totalArea || 1; // Avoid division by zero
  let main_frac = 1;
  let roof = stats.meanRoof || 0; // Avoid division by zero
  let green_roof = stats.meanGreenRoof || 0; // Avoid division by zero
  let pvd = stats.meanPaved || 0; // Avoid division by zero
  let to_swale = stats.meanSwaleConnected || 0; // Avoid division by zero

  console.log(
    "[measureCalculations] total_area, main_frac, roof, green_roof, pvd, to_swale::",
    total_area,
    main_frac,
    roof,
    green_roof,
    pvd,
    to_swale,
  );

  // Step 2.1: Calculate existing measures according to formulas
  const existingGreenRoofArea = areaCalc.calculatePrecisely(
    stats.meanGreenRoof * stats.meanRoof * mainFrac * stats.totalArea,
  );

  const existingUnpavedArea = areaCalc.calculatePrecisely(
    (1 - stats.meanRoof - stats.meanPaved) * mainFrac * stats.totalArea,
  );

  const existingSwaleConnectedArea = areaCalc.calculatePrecisely(
    stats.meanSwaleConnected *
      (stats.meanPaved + stats.meanRoof) *
      mainFrac *
      stats.totalArea,
  );

  // Step 2.2: Total sum: new measures + existing measures
  const totalGreenRoofAreaWithExisting = areaCalc.calculatePrecisely(
    totalGreenRoofArea + existingGreenRoofArea,
  );

  const totalUnpavedAreaWithExisting = areaCalc.calculatePrecisely(
    totalUnpavedArea + existingUnpavedArea,
  );

  const totalSwaleConnectedAreaWithExisting = areaCalc.calculatePrecisely(
    totalSwaleConnectedArea + existingSwaleConnectedArea,
  );

  console.log(
    "[measureCalculations] totalGreenRoofAreaWithExisting::",
    totalGreenRoofAreaWithExisting,
  );

  // Step 3.1: Calculate maximum possible area values
  const maxGreenRoofAreaPossible = stats.totalRoofArea;
  const maxUnpavedAreaPossible = stats.maxUnpavedArea;
  const maxSwaleConnectedAreaPossible = stats.maxSwaleConnectedArea;

  // Step 3.2: Limit the calculated areas to their maximum possible values
  const finalLimitedGreenRoofArea = Math.min(
    totalGreenRoofAreaWithExisting,
    maxGreenRoofAreaPossible,
  );
  const finalLimitedUnpavedArea = Math.min(
    totalUnpavedAreaWithExisting,
    maxUnpavedAreaPossible,
  );
  const finalLimitedSwaleConnectedArea = Math.min(
    totalSwaleConnectedAreaWithExisting,
    maxSwaleConnectedAreaPossible,
  );

  console.log(
    "[measureCalculations] Final Limited Areas::",
    finalLimitedGreenRoofArea,
    finalLimitedUnpavedArea,
    finalLimitedSwaleConnectedArea,
  );

  // Step 4: Calculate area fractions
  let finalFractionGreenRoof = 0;
  let finalFractionUnpaved = 0;
  let finalFractionToSwale = 0;
  let finalFractionPaved = 0;

  // Use the initial total area for calculating fractions (avoid division by zero)
  const totalAreaForFraction = Math.max(stats.totalArea || 1, 1);

  // Calculate all fractions using the area values
  finalFractionGreenRoof = areaCalc.calculatePrecisely(
    finalLimitedGreenRoofArea / totalAreaForFraction,
  );

  finalFractionUnpaved = areaCalc.calculatePrecisely(
    finalLimitedUnpavedArea / totalAreaForFraction,
  );

  finalFractionToSwale = areaCalc.calculatePrecisely(
    finalLimitedSwaleConnectedArea / totalAreaForFraction,
  );

  // Calculate paved fraction (ensure it's not negative due to rounding errors)
  finalFractionPaved = Math.max(
    0,
    areaCalc.calculatePrecisely(1 - stats.meanRoof - finalFractionUnpaved),
  );

  console.log(
    "[measureCalculations] Final Fractions::",
    finalFractionGreenRoof,
    finalFractionUnpaved,
    finalFractionToSwale,
    finalFractionPaved,
  );

  // Sanity check: Fractions should sum to approximately 1
  console.log(
    "[measureCalculations] Sanity Check Sum:",
    areaCalc.calculatePrecisely(
      finalFractionPaved + finalFractionUnpaved + stats.meanRoof,
    ),
  );

  return {
    // Number of measures
    greenRoofMeasuresAmount: greenRoofMeasures.length,
    unpavedMeasuresAmount: unpavedMeasures.length,
    swaleMeasuresAmount: swaleMeasures.length,

    // Step 1: Total areas of NEW measures
    totalGreenRoofArea,
    totalUnpavedArea,
    totalSwaleArea,
    totalSwaleVolume,
    totalSwaleConnectedArea,

    // Final calculated fractions
    newGreenRoof: finalFractionGreenRoof,
    newUnpvd: finalFractionUnpaved,
    newToSwale: finalFractionToSwale,

    // TODO: remove when done checking calculations
    // Step 2.1: Existing measures
    existingGreenRoofArea,
    existingUnpavedArea,
    existingSwaleConnectedArea,

    // Step 2.2: Total sum including existing measures (BEFORE limitation)
    totalGreenRoofAreaWithExisting,
    totalUnpavedAreaWithExisting,
    totalSwaleConnectedAreaWithExisting,

    // Step 3.1: Maximum possible values
    maxGreenRoofAreaPossible,
    maxUnpavedAreaPossible,
    maxSwaleConnectedAreaPossible,

    // Step 3.2: Limited total areas (Final absolute values)
    finalLimitedGreenRoofArea,
    finalLimitedUnpavedArea,
    finalLimitedSwaleConnectedArea,
  };
}

export default {
  calculateAllMeasureStats,
  getMeasureDimension,
  calculateTotalMeasureArea,
};

