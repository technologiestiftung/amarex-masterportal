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

    percentageGreenRoofToRoof: 0,
    percentageGreenRoofToTotalArea: 0,
    percentageSwaleConnectedToPvd: 0,
    percentageSwaleConnectedToTotalArea: 0,
    percentageRoofToTotalArea: 0,
    percentageSealedToTotalArea: 0,
    percentagePavedAreaToTotalArea: 0,

    // Other Values
    totalGreenRoofArea: 0,
    totalSealedArea: 0,

    // Not used yet
    totalSwaleConnectedArea: 0,
    totalUnsealedArea: 0,
    maxGreenRoof: 0,
    maxUnpaved: 0,
    maxSwaleConnected: 0,
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

  // abimo values for abimo calculation
  abimoGreenRoof: 0,
  abimoUnsealed: 0,
  abimoSwaleConnected: 0,

  new_green_roof: 0,
  new_to_swale: 0,
  new_unpvd: 0,
};

