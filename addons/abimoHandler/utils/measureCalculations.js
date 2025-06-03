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

function calculateAllMeasureStats(selectedFeatures, selectedMeasures) {
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

      newGreenRoof: null,
      newUnpvd: null,
      newToSwale: null,
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

  const stats = selectedFeatures[0].getProperties();

  let total_area = parseFloat(stats.total_area);
  let main_frac = 1;
  let roof = parseFloat(stats.roof);
  let green_roof = parseFloat(stats.green_roof);
  let pvd = parseFloat(stats.pvd);
  let to_swale = parseFloat(stats.to_swale);

  const roof_area = areaCalc.getTotalRoofArea(selectedFeatures);
  // NOTE: GREEN ROOF
  // 1. Calculate Green Roof first
  // 1.1. Calculate total area of each measure type in m²
  const totalGreenRoofArea = calculateTotalMeasureArea(greenRoofMeasures); // Ag = Ag_1 + Ag_2 + ...

  // 1.2. Calculate total area of existing green roofs in m²
  const Ag_0 = areaCalc.calculatePrecisely(
    green_roof * roof * main_frac * total_area,
  );
  // max possible area of green roofs in m²
  const Ag_max = areaCalc.calculatePrecisely(roof * main_frac * total_area);

  // 1.3. Calculate new green roof area limited to the max possible of green roofs in m²
  // für Report
  const Ag_neu = Math.min(totalGreenRoofArea + Ag_0, Ag_max);

  // für Report
  const newGreenRoofToRoof = areaCalc.calculatePrecisely(
    (Ag_neu / roof_area) * 100,
  );

  // 1.4. Calculate new area of green roofs in m²
  const newGreenRoof = areaCalc.calculatePrecisely(Ag_neu / total_area);

  const Agt = areaCalc.calculatePrecisely(totalGreenRoofArea + Ag_0);

  // NOTE: ENTSIEGELUNG
  // 2. Calculate Entsiegelung/Unpaved second
  // unbebaut versiegelt -> pvd (kein dach aber versiegelt)
  // bebaut versiegelt -> roof (dach)
  // unpvd -> was weder dach noch versiegelt ist

  // 2.1. Calculate total area of each measure type in m²
  const totalUnpavedArea = calculateTotalMeasureArea(unpavedMeasures); // Ae = Ae_1 + Ae_2 + ...
  // const Ae = calculateTotalMeasureArea(unpavedMeasures);

  // 2.2. Calculate total area of existing unpaved areas in m²
  const Ae_0 = areaCalc.calculatePrecisely(
    (1 - roof - pvd) * main_frac * total_area,
  );

  // 2.3. Calculate maximum possible area of unpaved areas in m²
  const Ae_max = areaCalc.calculatePrecisely(
    (1 - roof) * main_frac * total_area,
  );

  // 2.4. Calculate new area of unpaved areas in m²
  // Unversiegelte Fläche für Report in m²
  const Ae_neu = Math.min(totalUnpavedArea + Ae_0, Ae_max);

  // 2.5. Calculate new area of unpaved areas in m²
  const unpaved = areaCalc.calculatePrecisely(Ae_neu / total_area);
  // Unversiegelte Fläche für Report in %
  const totalUnpavedToTotalArea = areaCalc.calculatePrecisely(unpaved * 100);

  // 2.6. Calculate new area of unpaved areas in m²
  // unbebaut versiegelt für Report in m²
  const pvd_neu = areaCalc.calculatePrecisely(1 - unpaved - roof);
  const pvd_neu_area = pvd_neu * total_area;

  // Report unbebaut versiegelt für Report %
  const newPvdToTotalArea = areaCalc.calculatePrecisely(pvd_neu * 100);

  const Aet = areaCalc.calculatePrecisely(totalUnpavedArea + Ae_0);

  // NOTE: SWALE/MULDE
  // 3. Calculate Swale/Mulde third

  // 3.1. Calculate total area of each measure type in m²
  const totalSwaleArea = calculateTotalMeasureArea(swaleMeasures); // Am = Am_1 + Am_2 + ...

  // 3.2. Calculate total volume of each measure type in m³
  const Am_0 = areaCalc.calculatePrecisely(
    to_swale * (pvd + roof) * main_frac * total_area,
  );

  // 3.3. Calculate maximum possible area of swales in m²
  const Am_max = areaCalc.calculatePrecisely(
    (roof + pvd_neu) * main_frac * total_area,
  );

  // 3.4. Calculate new area of swales in m²
  const Am_neu = Math.min(totalSwaleConnectedArea + Am_0, Am_max);

  // 3.5. Calculate new area of swales in m²
  const newToSwale = areaCalc.calculatePrecisely(Am_neu / total_area);

  const Amt = areaCalc.calculatePrecisely(totalSwaleConnectedArea + Am_0);

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
    newGreenRoof,
    newGreenRoofToRoof,
    newUnpvd: unpaved,
    newToSwale,

    pvd_neu,
    pvd_neu_area,
    newPvdToTotalArea,
    totalUnpavedToTotalArea,

    // TODO: remove when done checking calculations
    Ag_0,
    Ag_max,
    Ag_neu,
    Agt,

    Ae_0,
    Ae_max,
    Ae_neu,
    Aet,

    Am_0,
    Am_max,
    Amt,
  };
}

export default {
  calculateAllMeasureStats,
  getMeasureDimension,
  calculateTotalMeasureArea,
};

