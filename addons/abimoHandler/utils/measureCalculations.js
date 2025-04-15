import areaCalc from "./areaCalculations.js"; // Importiere die Funktion
import Constants from "./constants.js"; // Importiere das gesamte Objekt

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

/**
 * Berechnet die Gesamtfläche für einen bestimmten Maßnahmentyp
 * @param {Array} measures - Liste der Maßnahmen eines bestimmten Typs
 * @returns {number} - Gesamtfläche in m²
 */
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
  selectedMeasures = selectedMeasures.map((measure) => {
    const measureDimension = getMeasureDimension(measure.type, measure.size);
    return { ...measure, ...measureDimension }; // Creates a new object with combined properties
  });

  let greenRoofMeasures = selectedMeasures.filter(
    (measure) => measure.type === "greenRoof",
  );
  let unpavedMeasures = selectedMeasures.filter(
    (measure) => measure.type === "unpaved",
  );
  let swaleMeasures = selectedMeasures.filter(
    (measure) => measure.type === "swale",
  );

  // Berechnungsschritt 1: Summe der Flächen der einzelnen Maßnahmen in m²
  const totalGreenRoofArea = calculateTotalMeasureArea(greenRoofMeasures); // Ag = Ag_1 + Ag_2 + ...
  const totalUnpavedArea = calculateTotalMeasureArea(unpavedMeasures); // Ae = Ae_1 + Ae_2 + ...
  const totalSwaleArea = calculateTotalMeasureArea(swaleMeasures); // Am = Am_1 + Am_2 + ...
  const totalSwaleVolume = areaCalc.calculatePrecisely(
    swaleMeasures.reduce((sum, measure) => sum + (measure.volume || 0), 0),
  );
  const totalSwaleConnectedArea = areaCalc.calculatePrecisely(
    swaleMeasures.reduce(
      (sum, measure) => sum + (measure.connectedArea || 0),
      0,
    ),
  );

  // Schritt 2: Einbeziehung bereits vorhandener Maßnahmen
  const stats = areaCalc.calculateAllStats(selectedFeatures, newUnpvd);
  const totalArea = stats.totalArea;
  console.log("[measureCalculations] totalArea::", totalArea);
  // const mainFrac = 1;

  return {
    // Anzahl der Maßnahmen
    greenRoofMeasuresAmount: greenRoofMeasures.length,
    unpavedMeasuresAmount: unpavedMeasures.length,
    swaleMeasuresAmount: swaleMeasures.length,

    // Berechnungsschritt 1: Gesamtflächen der Maßnahmen
    totalGreenRoofArea,
    totalUnpavedArea,
    totalSwaleArea,
    totalSwaleVolume,
    totalSwaleConnectedArea,
  };
}

export default {
  calculateAllMeasureStats,
  getMeasureDimension,
  calculateTotalMeasureArea,
};

