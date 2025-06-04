import AbimoHandler from "../abimoHandler/components/AbimoHandler.vue";
import BaseMaps from "../baseMaps/components/BaseMaps.vue";
import FileImporter from "../fileImporter/components/FileImporter.vue";
import ProjectDownloader from "../projectDownloader/components/ProjectDownloader.vue";
import ProjectStarter from "../projectStarter/components/ProjectStarter.vue";
import ProjectUploader from "../projectUploader/components/ProjectUploader.vue";
import ThemeMaps from "../themeMaps/components/ThemeMaps.vue";
import ToolDownloader from "../toolDownloader/components/ToolDownloader.vue";

const getters = {
  componentMap: () => {
    const coreModules = {
      projectUploader: ProjectUploader,
      projectDownloader: ProjectDownloader,
      fileImporter: FileImporter,
      abimoHandler: AbimoHandler,
      projectStarter: ProjectStarter,
      baseMaps: BaseMaps,
      themeMaps: ThemeMaps,
      toolDownloader: ToolDownloader,
    };

    moduleCollection = { ...coreModules, ...moduleCollection };
    return moduleCollection;
  },
};

export default getters;

