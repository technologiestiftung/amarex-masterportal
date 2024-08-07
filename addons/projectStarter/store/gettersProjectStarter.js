import { generateSimpleGetters } from "../../../src/shared/js/utils/generators";
import stateProjectStarter from "./stateProjectStarter";

const getters = {
  ...generateSimpleGetters(stateProjectStarter),
  // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;

