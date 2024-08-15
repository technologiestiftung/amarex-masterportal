import getters from "./gettersAbimoHandler";
import mutations from "./mutationsAbimoHandler";
import state from "./stateAbimoHandler";
import actions from "./actionsAbimoHandler";

export default {
  namespaced: true, // mandatory
  state,
  getters,
  mutations,
  actions
};

