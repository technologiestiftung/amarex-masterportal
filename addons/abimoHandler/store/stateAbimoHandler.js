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

    // Summen bebaut versiegelt -> roof, versiegelt -> pvd, unversiegelt -> unpvd
    totalRoofArea: 0,
    totalPavedArea: 0,
    totalUnpavedArea: 0,

    // Other Values
    totalGreenRoofArea: 0,
    totalSealedArea: 0,

    meanRoof: 0,
    meanUnpaved: 0,
    meanPaved: 0,
    meanGreenRoof: 0,
    meanSwaleConnected: 0,

    maxGreenRoof: 0,
    maxUnpaved: 0,
    maxSwaleConnected: 0,

    percentageGreenRoof: 0,
    percentageSwaleConnected: 0,
    percentageGreenRoofToRoof: 0,
    percentageSwaleConnectedToPvd: 0,
  },
  areaTypesData: [
    {
      id: "unpvd",
      name: "UNVERSIEGELT (unpvd)",
      percentage: 0,
    },
    {
      id: "roof",
      name: "BEBAUT VERSIEGELT (roof)",
      percentage: 0,
    },
    {
      id: "pvd",
      name: "UNBEBAUT VERSIEGELT (pvd)",
      percentage: 0,
    },
  ],

  newGreenRoof: 0,
  newUnpvd: 0,
  newToSwale: 0,
};

