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

  console.log("[measureCalculations] stats::", stats);

  // featuresSelected: 1;
  // maxGreenRoof: 0.8005333;
  // maxGreenRoofToRoof: 0;
  // maxSwaleConnected: 0.9636923;
  // maxSwaleConnectedArea: 22887.11101775769;
  // maxSwaleConnectedToPvd: 0;
  // maxUnpaved: 0.1994667;
  // maxUnpavedArea: 4737.213846417334;
  // meanGreenRoof: 0;
  // meanPaved: 0.163159;
  // meanRoof: 0.8005333;
  // meanSwaleConnected: 0;
  // meanUnpaved: 0.0363077;
  // totalArea: 23749.396999185;
  // totalGreenRoofArea: 0;
  // totalPavedArea: 3874.92786499;
  // totalRoofArea: 19012.183152768;
  // totalSealedArea: 22887.111017758;
  // totalSwaleConnectedArea: 0;
  // totalUnpavedArea: 862.285981427;

  const mainFrac = 1; // Annahme: main_frac = 1

  // Berechnungsschritt 2.1: Bereits vorhandene Maßnahmen gemäß den angegebenen Formeln

  // Ag_0 = green_roof * roof * main_frac * total_area
  const existingGreenRoofArea = areaCalc.calculatePrecisely(
    stats.meanGreenRoof * stats.meanRoof * mainFrac * stats.totalArea,
  );

  // Ae_0 = (1 - roof - pvd) * main_frac * total_area
  const existingUnpavedArea = areaCalc.calculatePrecisely(
    (1 - stats.meanRoof - stats.meanPaved) * mainFrac * stats.totalArea,
  );

  // Am_0 = to_swale * (pvd + roof) * main_frac * total_area
  const existingSwaleConnectedArea = areaCalc.calculatePrecisely(
    stats.meanSwaleConnected *
      (stats.meanPaved + stats.meanRoof) *
      mainFrac *
      stats.totalArea,
  );

  // 2.2 Gesamtsumme: neue Maßnahmen + bereits vorhandene Maßnahmen
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

  // Alternative Step 3.1 using stats directly
  const Ag_max_alt = stats.totalRoofArea;
  const Ae_max_alt = stats.maxUnpavedArea;
  const Am_max_alt = stats.maxSwaleConnectedArea; // or stats.totalSealedArea

  // Step 3.2 would then use these _alt values
  const Ag_neu = Math.min(totalGreenRoofAreaWithExisting, Ag_max_alt);
  const Ae_neu = Math.min(totalUnpavedAreaWithExisting, Ae_max_alt);
  const Am_neu = Math.min(totalSwaleConnectedAreaWithExisting, Am_max_alt);

  console.log(
    "[measureCalculations] Final Limited Areas (Ag_neu, Ae_neu, Am_neu)::",
    Ag_neu,
    Ae_neu,
    Am_neu,
  );

  // --- Berechnungsschritt 4: Berechnung der Flächenanteile ---
  let finalFractionGreenRoof = 0;
  let finalFractionUnpaved = 0;
  let finalFractionToSwale = 0;
  let finalFractionPaved = 0; // pvd_neu

  // Use the initial total area for calculating fractions
  const totalAreaForFraction = stats.totalArea || 1; // Avoid division by zero

  if (totalAreaForFraction > 0) {
    // green_roof = Ag_neu / total_area
    finalFractionGreenRoof = areaCalc.calculatePrecisely(
      Ag_neu / totalAreaForFraction,
    );

    // unpaved = Ae_neu / total_area
    finalFractionUnpaved = areaCalc.calculatePrecisely(
      Ae_neu / totalAreaForFraction,
    );

    // to_swale = Am_neu / total_area
    finalFractionToSwale = areaCalc.calculatePrecisely(
      Am_neu / totalAreaForFraction,
    );

    // pvd_neu = 1 - roof - unpaved (using final unpaved fraction and initial roof fraction)
    // Clamp at 0, as theoretically rounding could make it slightly negative if unpaved + roof > 1
    finalFractionPaved = Math.max(
      0,
      areaCalc.calculatePrecisely(1 - stats.meanRoof - finalFractionUnpaved),
    );

    console.log(
      "[measureCalculations] Final Fractions (GreenRoof, Unpaved, ToSwale, Paved)::",
      finalFractionGreenRoof,
      finalFractionUnpaved,
      finalFractionToSwale,
      finalFractionPaved,
    );
    // Optional Sanity Check: Fractions should ideally sum close to 1
    console.log(
      "[measureCalculations] Sanity Check: finalFractionPaved + finalFractionUnpaved + stats.meanRoof =",
      areaCalc.calculatePrecisely(
        finalFractionPaved + finalFractionUnpaved + stats.meanRoof,
      ),
    );
  } else {
    console.warn(
      "[measureCalculations] Total area is zero, cannot calculate final fractions.",
    );
  }

  return {
    // Anzahl der Maßnahmen
    greenRoofMeasuresAmount: greenRoofMeasures.length,
    unpavedMeasuresAmount: unpavedMeasures.length,
    swaleMeasuresAmount: swaleMeasures.length,

    // Schritt 1: Gesamtflächen der NEUEN Maßnahmen
    totalGreenRoofArea, // Ag
    totalUnpavedArea, // Ae
    totalSwaleArea, // Area of swales themselves
    totalSwaleVolume, // Volume of swales
    totalSwaleConnectedArea, // Am (Connected area for NEW swales)

    // Schritt 2.1: Bereits vorhandene Maßnahmen
    existingGreenRoofArea, // Ag_0
    existingUnpavedArea, // Ae_0
    existingSwaleConnectedArea, // Am_0

    // Schritt 2.2: Gesamtsumme inkl. bereits vorhandener (VOR Begrenzung)
    totalGreenRoofAreaWithExisting, // Ag + Ag_0
    totalUnpavedAreaWithExisting, // Ae + Ae_0
    totalSwaleConnectedAreaWithExisting, // Am + Am_0

    // Schritt 3.1: Maximalwerte
    maxGreenRoofAreaPossible: Ag_max_alt, // Ag_max
    maxUnpavedAreaPossible: Ae_max_alt, // Ae_max
    maxSwaleConnectedAreaPossible: Am_max_alt, // Am_max

    // Schritt 3.2: Begrenzte Gesamtflächen (Finale absolute Werte)
    finalLimitedGreenRoofArea: Ag_neu, // Ag_neu
    finalLimitedUnpavedArea: Ae_neu, // Ae_neu
    finalLimitedSwaleConnectedArea: Am_neu, // Am_neu

    newGreenRoof: finalFractionGreenRoof,
    newUnpvd: finalFractionUnpaved,
    newToSwale: finalFractionToSwale,
  };
}

export default {
  calculateAllMeasureStats,
  getMeasureDimension,
  calculateTotalMeasureArea,
};

