import AbimoHandler from "../abimoHandler/components/AbimoHandler.vue";
import FileImporter from "../fileImporter/components/FileImporter.vue";
import ProjectDownloader from "../projectDownloader/components/ProjectDownloader.vue";
import ProjectUploader from "../projectUploader/components/ProjectUploader.vue";
import ReportPrinter from "../reportPrinter/components/ReportPrinter.vue";

const getters = {
  componentMap: () => {
    const coreModules = {
      projectUploader: ProjectUploader,
      projectDownloader: ProjectDownloader,
      reportPrinter: ReportPrinter,
      fileImporter: FileImporter,
      abimoHandler: AbimoHandler,
    };

    moduleCollection = { ...coreModules, ...moduleCollection };
    return moduleCollection;
  },
};

export default getters;
