import { generateSimpleGetters } from "../../../src/shared/js/utils/generators";
import fileImporterState from "./stateFileImporter";

const getters = {
  ...generateSimpleGetters(fileImporterState),

  // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
