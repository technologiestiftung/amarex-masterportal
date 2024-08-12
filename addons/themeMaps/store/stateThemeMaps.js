/**
 * User type definition
 * @typedef {Object} BaseMapsState
 * @property {String} description Description of the report printer addon.
 * @property {String} name Name of the report printer addon.
 * @property {String} icon Icon of the report printer addon.
 */
export default {
  description: "Theme Maps",
  name: "Theme Maps",
  icon: "bi-geo-fill",
  
  visible: true,
  subjectDataLayerConfs: [],
  baselayerConfs: [],
  lastFolderNames: [],
  lastSubjectDataLayerConfs: [],
  lastBaselayerConfs: [],
  layerInfoVisible: true,
  highlightLayerId: null,
  encompassingBoundingBox: [Infinity, Infinity, -Infinity, -Infinity],
};



