import { generateSimpleGetters } from "../../../src/shared/js/utils/generators";
import stateBaseMaps from "./stateBaseMaps";

const getters = {
  ...generateSimpleGetters(stateBaseMaps),
  // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;

