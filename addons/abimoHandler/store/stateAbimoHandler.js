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
};

