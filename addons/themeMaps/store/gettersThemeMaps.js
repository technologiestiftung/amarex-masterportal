import { generateSimpleGetters } from "../../../src/shared/js/utils/generators";
import stateThemeMaps from "./stateThemeMaps";

const getters = {
  ...generateSimpleGetters(stateThemeMaps),
  // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;

