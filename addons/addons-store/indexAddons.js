import getters from "./gettersAddons";

import AbimoHandler from "../abimoHandler/store/indexAbimoHandler";
import FileImporter from "../fileImporter/store/indexFileImporter";
import ProjectDownloader from "../projectDownloader/store/indexProjectDownloader";
import ProjectStarter from "../projectStarter/store/indexProjectStarter";
import ProjectUploader from "../projectUploader/store/indexProjectUploader";
import ReportPrinter from "../reportPrinter/store/indexReportPrinter";

export default {
  namespaced: true,
  getters,
  modules: {
    // modules must be copied, else tests fail in watch mode
    ProjectUploader: { ...ProjectUploader },
    ProjectDownloader: { ...ProjectDownloader },
    ReportPrinter: { ...ReportPrinter },
    FileImporter: { ...FileImporter },
    AbimoHandler: { ...AbimoHandler },
    ProjectStarter: { ...ProjectStarter },
  },
};

