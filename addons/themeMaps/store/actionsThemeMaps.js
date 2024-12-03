import { treeSubjectsKey } from "../../../src/shared/js/utils/constants";
import sortBy from "../../../src/shared/js/utils/sortBy";
import collectDataByFolderModule from "../utils/collectDataByFolder";
import baselayerHandler from "../utils/handleSingleBaselayer";

const actions = {
  changeVisibility({ dispatch, rootGetters }, { layerId, value }) {
    const layerConfig = createLayerConfig(layerId, value);
    const layerConfigs = [layerConfig];

    if (value) {
      const zIndex = determineZIndex(rootGetters, layerId);
      layerConfig.layer.zIndex = zIndex;

      if (rootGetters.isBaselayer(layerId)) {
        handleBaselayerVisibility(dispatch, rootGetters, layerConfigs);
      }
    }

    dispatch("replaceByIdInLayerConfig", { layerConfigs }, { root: true });
  },

  setNavigationByFolder({ commit, rootGetters }, { folder }) {
    const data = collectDataByFolderModule.collectDataByFolder(
      folder,
      rootGetters,
    );
    commit("setlastThemeMapsFolderNames", data.lastThemeMapsFolderNames);
    commit("setLastThemeMapsConfs", data.lastThemeMapsConfs);
  },

  navigateForward({ commit }, { lastFolderName, themeMapsConfs }) {
    commit("addToThemeMaps", { lastFolderName, themeMapsConfs });
    commit("setThemeMapsConfs", themeMapsConfs);
  },

  navigateBack({ commit, getters }) {
    commit("reduceToPreviousLayerSelection");
    commit(
      "setThemeMapsConfs",
      getters.lastThemeMapsConfs[getters.lastThemeMapsConfs.length - 1],
    );
  },

  reset({ commit }) {
    commit("clearLayerSelection");
    commit("setThemeMapsConfs", []);
  },

  showLayer: ({ commit, dispatch, rootGetters }, { layerId, rawLayer }) => {
    const layerConfig = rawLayer || rootGetters.layerConfigById(layerId);
    if (!layerConfig) return;

    const { lastFolderName, themeMapsConfs } = getLayerNavigationData(
      layerConfig,
      rootGetters,
    );
    if (themeMapsConfs) {
      dispatch("navigateForward", { lastFolderName, themeMapsConfs });
      commit("setHighlightLayerId", layerId);
      commit("setVisible", true);
    }
  },
};

// Helper functions
function createLayerConfig(layerId, value) {
  return {
    id: layerId,
    layer: {
      id: layerId,
      visibility: value,
      showInLayerTree: value,
    },
  };
}

function determineZIndex(rootGetters, layerId) {
  if (rootGetters.isBaselayer(layerId)) {
    const maxBaselayerZIndex = Math.max(
      ...rootGetters
        .layerConfigsByAttributes({ baselayer: true, showInLayerTree: true })
        .map((layer) => layer.zIndex),
    );
    return maxBaselayerZIndex + 1;
  }
  return rootGetters.determineZIndex(layerId);
}

function handleBaselayerVisibility(dispatch, rootGetters, layerConfigs) {
  const maxBaselayerZIndex = Math.max(
    ...rootGetters
      .layerConfigsByAttributes({ baselayer: true, showInLayerTree: true })
      .map((layer) => layer.zIndex),
  );

  dispatch(
    "updateLayerConfigZIndex",
    {
      layerContainer: rootGetters.layerConfigsByAttributes({
        showInLayerTree: true,
      }),
      maxZIndex: maxBaselayerZIndex,
    },
    { root: true },
  );

  baselayerHandler.checkAndAdd(
    rootGetters.singleBaselayer,
    rootGetters.visibleBaselayerConfigs,
    layerConfigs,
  );
}

function getLayerNavigationData(layerConfig, rootGetters) {
  let lastFolderName = "";
  let themeMapsConfs;

  if (layerConfig.parentId) {
    const folder = rootGetters.folderById(layerConfig.parentId);
    if (folder) {
      lastFolderName = folder.name;
      themeMapsConfs = sortBy(
        folder.elements,
        (conf) => conf.type !== "folder",
      );
    } else {
      console.warn(
        `Folder with id ${layerConfig.parentId} not found. Shall be parent of`,
        layerConfig,
      );
    }
  } else {
    themeMapsConfs = sortBy(
      rootGetters.allLayerConfigsStructured(treeSubjectsKey),
      (conf) => conf.type !== "folder",
    );
  }

  return { lastFolderName, themeMapsConfs };
}

export default actions;
