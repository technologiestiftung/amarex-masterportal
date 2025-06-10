/**
 * User type definition
 * @typedef {Object} AbimoHandlerState
 * @property {String} description Description of the report printer addon.
 * @property {String} name Name of the report printer addon.
 * @property {String} icon Icon of the report printer addon.
 */
export default {
  description: "Abimo Berechnen.",
  name: "Abimo",
  icon: "bi-geo-fill",
  hasMouseMapInteractions: true,
  supportedMapModes: ["2D"],
  selectedFeatures: [],
  preselectedFeatures: [],
  selectInteraction: null,
  resetTargetValues: false,
  blockAreaConfirmed: false,
  selectedCount: 0,
  activeStep: 0,
  accumulatedAbimoStats: {
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

    targetValueGreenRoof: 0,
    targetValueUnsealed: 0,
    targetValueSwaleConnected: 0,

    initialTargetValueGreenRoof: 0,
    initialTargetValueUnsealed: 0,
    initialTargetValueSwaleConnected: 0,
  },

  areaTypesData: [
    {
      id: "unpvd",
      name: "Unversiegelt",
      max: 0,
    },
    {
      id: "roof",
      name: "Bebaut versiegelt",
      max: 0,
    },
    {
      id: "pvd",
      name: "Unbebaut versiegelt",
      max: 0,
    },
  ],
  preComputedModelsShown: false,
  preComputedModels: [],
  visiblePreComputedModelIDs: [],
  preComputedModelsAdded: false,
  preComputedStats: {
    deltaW: 0,
    evaporation: 0,
    runoff: 0,
    infiltration: 0,
  },

  newGreenRoof: null,
  newUnpvd: null,
  newToSwale: null,

  resultLayers: [],
  selectedThemeMap: null,
  resultAbimoStats: {
    deltaW: 0,
    evaporation: 0,
    runoff: 0,
    infiltration: 0,
  },

  // Measure Planning
  isMeasurePlanning: false,
  isMeasureDrawing: false,
  selectedMeasures: [],
  readyForCalculation: false,
  selectedBTF: null,
  hasMeasures: false,

  accumulatedMeasureStats: {
    greenRoofMeasuresAmount: 0,
    unpavedMeasuresAmount: 0,
    swaleMeasuresAmount: 0,
    totalGreenRoofArea: 0,
    totalUnpavedArea: 0,
    totalSwaleArea: 0,
    totalSwaleVolume: 0,
    totalSwaleConnectedArea: 0,
  },
  dataResultCalc: [],
  dataPreComputedCalc: [],
};

