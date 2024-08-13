import { generateSimpleMutations } from "../../../src/shared/js/utils/generators";
import stateThemeMaps from "./stateThemeMaps";

const mutations = {
  ...generateSimpleMutations(stateThemeMaps),
  /**
   * Clears layerSelection.
   * @param {Object} state vuex state
   * @returns {void}
   */
  clearLayerSelection(state) {
    state.lastThemeMapsFolderNames = [];
    state.lastThemeMapsConfs = [];
  },

  /**
   * Reduces state to previus navigation state.
   * @param {Object} state vuex state
   * @returns {void}
   */
  reduceToPreviousLayerSelection(state) {
    state.lastThemeMapsFolderNames.pop();
    state.lastThemeMapsConfs.pop();
  },
  /**
   * Adds payload to navigation state.
   * @param {Object} state vuex state
   * @param {Object} payload the payload
   * @param {String} payload.lastFolderName name of the previous folder configuration name
   * @param {Array} payload.themeMapsConfs themeMap configurations to show in layerSelection
   * @returns {void}
   */
  addToThemeMaps(state, { lastFolderName, themeMapsConfs }) {
    state.lastThemeMapsFolderNames.push(lastFolderName);
    state.lastThemeMapsConfs.push(themeMapsConfs);
  },
};

export default mutations;

