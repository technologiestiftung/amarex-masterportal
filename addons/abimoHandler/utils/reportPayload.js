import areaCalc from "./areaCalculations.js";
import measureCalc from "./measureCalculations.js";

function getReportPayload() {
  console.log("[reportPayload] areaCalc::", areaCalc);
  console.log("[reportPayload] measureCalc::", measureCalc);

  // old payload structure
  const payload = {
    flächenanteile_dachfläche: 0,
    flächenanteile_davon_begrünt_status_quo: 0,
    flächenanteile_davon_begrünt_simulation: 0,
    flächenanteile_unbebaut_versiegelte_flächen_status_quo: 0,
    flächenanteile_unbebaut_versiegelte_flächen_simulation: 0,
    flächenanteile_unversiegelte_flächen_status_quo: 0,
    flächenanteile_unversiegelte_flächen_simulation: 0,

    // gesetzte Maßnahmen
    betrachteteblockteilflaechen: 0,
    an_mulde_angeschlossene_fläche: 0,
    dachbegrünung_prozente: 0,
    entsiegelung_prozente: 0,
    oberflächenabfluss_status_quo: 0,
    infiltration_status_quo: 0,
    verdunstung_status_quo: 0,
    delta_w_status_quo: 0,
    wasserhaushalt_oberflächenabfluss_status_quo: 0,
    wasserhaushalt_infiltration_status_quo: 0,
    wasserhaushalt_verdunstung_status_quo: 0,

    // Abimo Result
    abimo_result: {
      runoff: 0,
      runoff_prozente: 0,
      infiltration: 0,
      infiltration_prozente: 0,
      evaporation: 0,
      evaporation_prozente: 0,
      deltaW: 0,
    },
    zisternenrechner_link: null,
  };

  //  pct = percentage, area = area, ratio, amount, count
  const _payload = {
    // Surface area proportions
    roofAreaProportion: 0,
    greenRoofToRoofStatusQuo: 0,
    greenRoofToRoofSimulation: 0,
    pvdToTotalAreaStatusQuo: 0,
    pvdToTotalAreaSimulation: 0,
    unpvdToTotalAreaStatusQuo: 0,
    unpvdToTotalAreaSimulation: 0,

    // Applied measures
    selectedFeaturesCount: 0,
    areaConnectedToSwalePct: 0,
    greenRoofPct: 0,
    unpvdPct: 0,
    surfaceRunoffStatusQuo: 0,
    infiltrationStatusQuo: 0,
    evaporationStatusQuo: 0,
    deltaWStatusQuo: 0,
    abimoSurfaceRunoffStatusQuo: 0,
    abimoInfiltrationStatusQuo: 0,
    abimoEvaporationStatusQuo: 0,

    // ABIMO Result
    abimoResult: {
      runoff: 0,
      runoffPct: 0,
      infiltration: 0,
      infiltrationPct: 0,
      evaporation: 0,
      evaporationPct: 0,
      deltaW: 0,
    },
    cisternCalculatorLink: null,
  };

  console.log("[reportPayload] _payload::", _payload);

  return payload;
}

export default {
  getReportPayload,
};

