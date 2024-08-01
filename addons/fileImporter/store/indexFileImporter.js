import actions from "./actionsFileImporter";
import getters from "./gettersFileImporter";
import mutations from "./mutationsFileImporter";
import state from "./stateFileImporter";

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};

