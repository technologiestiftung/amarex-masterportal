import { generateSimpleMutations } from "../../../src/shared/js/utils/generators";
import stateBaseMaps from "./stateBaseMaps";

const mutations = {
  ...generateSimpleMutations(stateBaseMaps),
};

export default mutations;

