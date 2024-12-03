import actions from "./actionsBaseMaps";
import getters from "./gettersBaseMaps";
import mutations from "./mutationsBaseMaps";
import state from "./stateBaseMaps";

export default {
  namespaced: true, // mandatory
  state,
  getters,
  actions,
  mutations,
};
