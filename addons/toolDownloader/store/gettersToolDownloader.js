import { generateSimpleGetters } from "../../../src/shared/js/utils/generators";
import toolDownloaderState from "./stateToolDownloader";

const getters = {
  ...generateSimpleGetters(toolDownloaderState),

  // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;

