import actions from "../app-store/actions"; // https://stackoverflow.com/questions/40487627/can-i-call-commit-from-one-of-mutations-in-vuex-store

// The objects deprecatedParamsConfigJson and deprecatedParamsConfigJs store the current respectively new parameters and the related deprecated parameters.
// The key describes the current parameter or more precisely the path to the new/current path.
// The corresponding value describes the old path with the deprecated parameter.
// Later on the algorithm takes the old path, estimates the content and rewrites the content to the new path / new parameter.
// The old deprecated path will be removed.
// Please notice that the replacement only effects the state. This means that the changes only have impact on the vue-components.
// Nevertheless you can or even should specify deprecated backbone parameters here.

const deprecatedParamsConfigJson = {
        "Portalconfig.portalTitle.title": ["Portalconfig.PortalTitle"],
        "Portalconfig.portalTitle.logo": ["Portalconfig.PortalLogo"],
        "Portalconfig.portalTitle.link": ["Portalconfig.LogoLink"],
        "Portalconfig.portalTitle.toolTip": ["Portalconfig.portalTitle.tooltip", "Portalconfig.LogoToolTip"],
        "Portalconfig.searchBar.bkg.zoomToResultOnHover": ["Portalconfig.searchBar.bkg.zoomToResult"],
        "Portalconfig.treeType": ["Portalconfig.Baumtyp"],
        "Portalconfig.controls.overviewMap.layerId": ["Portalconfig.controls.overviewMap.baselayer"],
        "Portalconfig.mapView.startResolution": ["Portalconfig.mapView.resolution"],
        "Portalconfig.searchBar.startZoomLevel": ["Portalconfig.searchBar.zoomLevel"],
        "Portalconfig.menu.tools.children.fileImport": ["Portalconfig.menu.tools.children.kmlimport", "Portalconfig.Portalconfig.menu.kmlimport"]
    },
    deprecatedParamsConfigJs = {
        "startUpModul": ["isInitOpen"]
    };

export default {

    /**
     * Sets config.json.
     * @param {object} state store state
     * @param {object} config config.json
     * @returns {void}
     */
    setConfigJson (state, config) {
        state.configJson = actions.checkWhereDeprecated(deprecatedParamsConfigJson, config);
    },
    /**
     * Sets config.js.
     * @param {object} state store state
     * @param {object} config config.js
     * @returns {void}
     */
    setConfigJs (state, config) {
        state.configJs = actions.checkWhereDeprecated(deprecatedParamsConfigJs, config);
    },
    /**
     * Sets mobile flag.
     * @param {object} state store state
     * @param {boolean} mobile whether browser resolution indicates mobile device
     * @returns {void}
     */
    setMobile (state, mobile) {
        state.mobile = mobile;
    },
    /**
     * Sets i18NextInitialized flag. Is done after languages for addons are loaded.
     * @param {object} state store state
     * @param {boolean} isInitialized whether i18Next is initialized
     * @returns {void}
     */
    setI18Nextinitialized (state, isInitialized) {
        state.i18NextInitialized = isInitialized;
    }
};
