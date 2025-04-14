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

export default {
  getMeasureDimension,
};

