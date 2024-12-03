import actions from "./actionsThemeMaps";
import getters from "./gettersThemeMaps";
import mutations from "./mutationsThemeMaps";
import state from "./stateThemeMaps";

export default {
  namespaced: true, // mandatory
  state,
  getters,
  actions,
  mutations,
};
