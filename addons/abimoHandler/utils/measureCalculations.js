import { MEASURE_DIMENSIONS } from "./constants.js";

function getMeasureDimension(type, size) {
  if (!MEASURE_DIMENSIONS[type] || !MEASURE_DIMENSIONS[type][size]) {
    console.warn(`Invalid measure type or size: ${type}, ${size}`);
    return null;
  }
  return MEASURE_DIMENSIONS[type][size];
}

export default {
  getMeasureDimension,
};

