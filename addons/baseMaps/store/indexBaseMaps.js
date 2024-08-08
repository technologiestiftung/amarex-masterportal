import actions from "./actionsBaseMaps";
import getters from "./gettersBaseMaps";
import state from "./stateBaseMaps";

export default {
  namespaced: true, // mandatory
  state,
  getters,
  actions,
};

