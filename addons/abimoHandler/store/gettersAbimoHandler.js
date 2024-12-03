import { generateSimpleGetters } from "../../../src/shared/js/utils/generators";
import stateAbimoHandler from "./stateAbimoHandler";

const getters = {
  ...generateSimpleGetters(stateAbimoHandler),
  // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
