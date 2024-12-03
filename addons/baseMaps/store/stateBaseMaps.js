/**
 * User type definition
 * @typedef {Object} BaseMapsState
 * @property {String} description Description of the report printer addon.
 * @property {String} name Name of the report printer addon.
 * @property {String} icon Icon of the report printer addon.
 */
export default {
  description: "Base Maps",
  name: "Base Maps",
  icon: "bi-geo-fill",

  active: false,
  baselayerIds: [],
  topBaselayerId: null,
};
