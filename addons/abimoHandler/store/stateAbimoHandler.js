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
    featuresSelected: 0,
    averageEvaporation: 0,
    averageSwale: 0,
    averageRinse: 0,

    // NOTE: Abimo specific stats
    totalArea: 0,
    // Summe bebaut versiegelt
    totalSealedArea: 0,
    // Summe unversiegelt -> unpvd
    totalUnsealedArea: 0,
    // Summe an mulde angegeschlossen
    totalSwaleConnectedArea: 0,
    // Summe unbebaut
    totalUnpavedArea: 0,
    // Summe Gründach
    totalGreenRoofArea: 0,
    // Summe Dachfläche (bebaut versiegelt -> roof)
    totalRoofArea: 0,
    // Summe bebaut versiegelt -> pvd
  },
  percentages: {},
};

