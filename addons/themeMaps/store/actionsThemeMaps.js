import { treeSubjectsKey } from "../../../src/shared/js/utils/constants";
import sortBy from "../../../src/shared/js/utils/sortBy";
import collectDataByFolderModule from "../utils/collectDataByFolder";
import baselayerHandler from "../utils/handleSingleBaselayer";

const actions = {
  /**
   * Updates the config to the given layer id, sets 'visibility' and 'showInLayerTree' to true at each layer.
   * Determines the zIndex and sets it too.
   * Note: Baselayer will be set on top of the baselayer with the highest zIndex.
   * @param {Object} param.commit the commit
   * @param {Object} param.dispatch the dispatch
   * @param {Object} param.getters the getters
   * @param {Object} param.rootGetters the rootGetters
   * @returns {void}
   */
  changeVisibility({ dispatch, rootGetters }, { layerId, value }) {
    const layerConfigs = [],
      layerConfig = {
        id: layerId,
        layer: {
          id: layerId,
          visibility: value,
          showInLayerTree: value,
        },
      };
    let zIndex = -1;

    layerConfigs.push(layerConfig);
    if (value === true) {
      if (rootGetters.isBaselayer(layerId)) {
        const maxBaselayerZIndex = Math.max(
          ...rootGetters
            .layerConfigsByAttributes({
              baselayer: true,
              showInLayerTree: value,
            })
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
        zIndex = maxBaselayerZIndex + 1;
        baselayerHandler.checkAndAdd(
          rootGetters.singleBaselayer,
          rootGetters.visibleBaselayerConfigs,
          layerConfigs,
        );
      } else {
        zIndex = rootGetters.determineZIndex(layerId);
      }
      layerConfig.layer.zIndex = zIndex;
    }

    dispatch("replaceByIdInLayerConfig", { layerConfigs }, { root: true });
  },

  /**
   * Sets the navigation state by given folder.
   * @param {Object} param.commit the commit
   * @param {Object} param.rootGetters the rootGetters
   * @returns {void}
   */
  setNavigationByFolder({ commit, rootGetters }, { folder }) {
    const data = collectDataByFolderModule.collectDataByFolder(
      folder,
      rootGetters,
    );

    commit("setlastThemeMapsFolderNames", data.lastThemeMapsFolderNames);
    commit("setLastThemeMapsConfs", data.lastThemeMapsConfs);
  },

  /**
   * Navigates forward in layerSelection.
   * @param {Object} param.commit the commit
   * @param {Object} param.state the state
   * @param {Object} payload the payload
   * @param {String} payload.lastFolderName name of the previous folder configuration name
   * @param {Array} payload.themeMapsConfs themeMap configurations to show in layerSelection
   * @returns {void}
   */
  navigateForward({ commit }, { lastFolderName, themeMapsConfs }) {
    commit("addToThemeMaps", {
      lastFolderName,
      themeMapsConfs,
    });
    commit("setThemeMapsConfs", themeMapsConfs);
  },

  /**
   * Navigates back in layerSelection.
   * @param {Object} param.commit the commit
   * @param {Object} param.getters the getters
   * @param {Object} param.state the state
   * @returns {void}
   */
  navigateBack({ commit, getters }) {
    commit("reduceToPreviousLayerSelection");
    commit(
      "setThemeMapsConfs",
      getters.lastThemeMapsConfs[getters.lastThemeMapsConfs.length - 1],
    );
  },

  /**
   * Resets the layerSelection.
   * @param {Object} param.commit the commit
   * @param {Object} param.state the state
   * @returns {void}
   */
  reset({ commit }) {
    commit("clearLayerSelection");
    commit("setThemeMapsConfs", []);
  },

  /**
   * Open folders in layerSelection and shows layer to select.
   * @param {Object} param.commit the commit
   * @param {Object} param.dispatch the dispatch
   * @param {Object} param.rootGetters the rootGetters
   * @param {Object} payload The payload.
   * @param {String} payload.layerId The layer id.
   * @param {String} payload.rawLayer The rawLayer config.
   * @returns {void}
   */
  showLayer: ({ commit, dispatch, rootGetters }, { layerId, rawLayer }) => {
    const layerConfig = !rawLayer
      ? rootGetters.layerConfigById(layerId)
      : rawLayer;

    if (layerConfig) {
      let lastFolderName = "",
        themeMapsConfs,
        folder = null;

      if (layerConfig.parentId) {
        folder = rootGetters.folderById(layerConfig.parentId);

        if (folder) {
          lastFolderName = folder.name;
          themeMapsConfs = sortBy(
            folder.elements,
            (conf) => conf.type !== "folder",
          );
          dispatch("setNavigationByFolder", { folder });
        } else {
          console.warn(
            "Folder with id ",
            layerConfig.parentId,
            " not found. Shall be parent of ",
            layerConfig,
          );
        }
      } else {
        themeMapsConfs = sortBy(
          rootGetters.allLayerConfigsStructured(treeSubjectsKey),
          (conf) => conf.type !== "folder",
        );
      }
      if (themeMapsConfs) {
        dispatch("navigateForward", {
          lastFolderName,
          themeMapsConfs,
        });
        commit("setHighlightLayerId", layerId);
        commit("setVisible", true);
      }
    }
  },
};

export default actions;

