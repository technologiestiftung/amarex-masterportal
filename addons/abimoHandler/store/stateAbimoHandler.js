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
  accumulatedAbimoStats: {
    totalArea: 0,
    featuresSelected: 0,
    // Summe Dachfläche (bebaut versiegelt -> roof)
    totalRoofArea: 0,
    // Summe  versiegelt -> pvd
    totalPavedArea: 0,
    // Summe unversiegelt -> unpvd
    totalUnpavedArea: 0,

    percentageGreenRoofToRoof: 0,
    percentageGreenRoofToTotalArea: 0,
    percentageSwaleConnectedToPvd: 0,
    percentageSwaleConnectedToTotalArea: 0,

    // Other Values
    totalSealedArea: 0,
    totalSwaleConnectedArea: 0,
    totalUnsealedArea: 0,
    totalGreenRoofArea: 0,
    maxGreenRoof: 0,
    maxUnpaved: 0,
    maxSwaleConnected: 0,
  },
  percentages: {},
  areaTypesData: [
    {
      id: "unpvd",
      name: "UNVERSIEGELT",
      percentage: 0,
    },
    {
      id: "roof",
      name: "BEBAUT VERSIEGELT",
      percentage: 0,
    },
    {
      id: "pvd",
      name: "UNBEBAUT VERSIEGELT",
      percentage: 0,
    },
  ],
};

