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
    totalSwaleConnectedArea: 0,

    meanRoof: 0,
    meanUnpaved: 0,
    meanPaved: 0,
    meanGreenRoof: 0,
    meanSwaleConnected: 0,

    maxGreenRoof: 0,
    maxUnpaved: 0,
    maxSwaleConnected: 0,
    maxGreenRoofToRoof: 0,
    maxSwaleConnectedToPvd: 0,
  },
  areaTypesData: [
    {
      id: "unpvd",
      name: "UNVERSIEGELT (unpvd)",
      max: 0,
    },
    {
      id: "roof",
      name: "BEBAUT VERSIEGELT (roof)",
      max: 0,
    },
    {
      id: "pvd",
      name: "UNBEBAUT VERSIEGELT (pvd)",
      max: 0,
    },
  ],

  newGreenRoof: 0,
  newUnpvd: 0,
  newToSwale: 0,

  steps: [
    {
      id: 1,
      label: "Vorberechnete Modelle",
      description:
        "Zur Status Quo Analyse können Sie mit den vorberechneten Karten aus dem Kartenkatalog starten",
      isActive: true,
    },
    {
      id: 2,
      label: "Untersuchungsgebiet Definieren",
      description:
        "Wählen Sie in der Karte die Blockteilflächen via Mausklick aus, die Sie untersuchen möchten.",
      isActive: false,
    },
    {
      id: 3,
      label: "Dachbegrünung",
      description:
        "Bei den von Ihnen gewählten Flächen stehen xxxx m2 Dachflächen zur Verfügung. Welchen Anteil möchten Sie begrünen?",
      isActive: false,
    },
    {
      id: 4,
      label: "Unversiegelte Flächen + nichtbebaut Versiegelte Flächen",
      description:
        "Wählen Sie anteilsmäßig die Maßnahmen, die Sie in die Berechnung einfließen lassen wollen.",
      isActive: false,
    },
    {
      id: 5,
      label: "Anschluss an Mulde",
      description:
        "Wählen Sie anteilsmäßig die Maßnahmen, die Sie in die Berechnung einfließen lassen wollen.",
      isActive: false,
    },
    {
      id: 6,
      label: "Berechnung",
      description:
        "Fügen Sie nun den berechneten DeltaW-Layer hinzu. Des Weiteren stehen ihnen weitere Ergebnislayer zur Verfügung.",
      isActive: false,
    },
    {
      id: 7,
      label: "Weitere Berechnung",
      description:
        "Wenn Sie weitere Berchnungen mit veränderten Parametern vornehmen möchten, klicken Sie hier auf Neu Berechnen.",
      isActive: false,
    },
  ],
};

