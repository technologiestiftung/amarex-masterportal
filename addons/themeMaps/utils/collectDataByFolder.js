import { treeSubjectsKey } from "../../../src/shared/js/utils/constants";
import sortBy from "../../../src/shared/js/utils/sortBy";

/**
 * Returns an object contains baselayerConfs, subjectDataLayerConfs and folderNames from given folder up to root.
 * @param {Object} folder folder of layerConfig
 * @param {Object} rootGetters the vuex rootGetters
 * @returns {Object} baselayerConfs, subjectDataLayerConfs and folderNames
 */
function collectDataByFolder(folder, rootGetters) {
  const lastThemeMapsFolderNames = [],
    lastThemeMapsConfs = [];

  inspectParentFolder(
    folder,
    rootGetters,
    lastThemeMapsFolderNames,
    lastThemeMapsConfs,
  );
  return {
    lastThemeMapsConfs: lastThemeMapsConfs.reverse(),
    lastThemeMapsFolderNames: lastThemeMapsFolderNames.reverse(),
  };
}

/**
 * Collects baselayerConfs, subjectDataLayerConfs and folderNames from given folder up to root.
 * @param {Object} folder folder of layerConfig
 * @param {Object} rootGetters the vuex rootGetters
 * @param {Array} lastThemeMapsFolderNames to fill with folderNames from given folder up to root
 * @param {Array} lastThemeMapsConfs to fill with subjectDataLayerConfs from given folder up to root
 * @returns {void}
 */
function inspectParentFolder(
  folder,
  rootGetters,
  lastThemeMapsFolderNames,
  lastThemeMapsConfs,
) {
  if (folder.parentId !== undefined) {
    const parentFolder = rootGetters.folderById(folder.parentId);

    lastThemeMapsFolderNames.push(parentFolder.name);
    lastThemeMapsConfs.push(
      sortBy(parentFolder.elements, (conf) => conf.type !== "folder"),
    );
    inspectParentFolder(
      parentFolder,
      rootGetters,
      lastThemeMapsFolderNames,
      lastThemeMapsConfs,
    );
  } else {
    lastThemeMapsFolderNames.push("themeMaps");
    lastThemeMapsConfs.push(
      sortBy(
        rootGetters.allLayerConfigsStructured(treeSubjectsKey),
        (conf) => conf.type !== "folder",
      ),
    );
  }
}

export default {
  collectDataByFolder,
};
