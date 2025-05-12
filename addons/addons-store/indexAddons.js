import getters from "./gettersAddons";

import AbimoHandler from "../abimoHandler/store/indexAbimoHandler";
import BaseMaps from "../baseMaps/store/indexBaseMaps";
import FileImporter from "../fileImporter/store/indexFileImporter";
import ProjectDownloader from "../projectDownloader/store/indexProjectDownloader";
import ProjectStarter from "../projectStarter/store/indexProjectStarter";
import ProjectUploader from "../projectUploader/store/indexProjectUploader";
import ThemeMaps from "../themeMaps/store/indexThemeMaps";
import ToolDownloader from "../toolDownloader/store/indexToolDownloader";

export default {
  namespaced: true,
  getters,
  modules: {
    // modules must be copied, else tests fail in watch mode
    ProjectUploader: { ...ProjectUploader },
    ProjectDownloader: { ...ProjectDownloader },
    FileImporter: { ...FileImporter },
    AbimoHandler: { ...AbimoHandler },
    ProjectStarter: { ...ProjectStarter },
    BaseMaps: { ...BaseMaps },
    ThemeMaps: { ...ThemeMaps },
    ToolDownloader: { ...ToolDownloader },
  },
};

