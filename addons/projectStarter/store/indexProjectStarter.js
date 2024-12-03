import getters from "./gettersProjectStarter";
import mutations from "./mutationsProjectStarter";
import state from "./stateProjectStarter";

export default {
  namespaced: true, // mandatory
  state,
  getters,
  mutations,
};
