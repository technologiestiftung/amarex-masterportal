import menuState from "./stateMenu";
import {generateSimpleGetters} from "../../app-store/utils/generators";
import idx, {badPathSymbol} from "../../../src/utils/idx";

const menuGetters = {
    ...generateSimpleGetters(menuState),
    /**
     * @param {Object} _ module state (discarded)
     * @param {Object} getters module getters
     * @returns {Object} component identified via componentMap
     */
    componentFromPath: (_, getters) => side => {
        return getters.componentMap[getters.objectFromPath(side).itemType];
    },
    mainMenu (_, __, ___, rootGetters) {
        if (rootGetters.loadedConfigs.configJson) {
            return rootGetters.portalConfig.mainMenu;
        }
        return null;
    },
    mainInitiallyOpen (_, getters) {
        return getters.mainMenu ? getters.mainMenu.initiallyOpen : false;
    },
    mainTitle (_, getters) {
        return getters.mainMenu ? getters.mainMenu.title : null;
    },
    /**
     * @param {Object} _ module state (discarded)
     * @param {Object} getters module getters
     * @param {Object} __ root state (discarded)
     * @param {Object} rootGetters root getters
     * @returns {Object} previous added menu navigation entry or null
     */
    objectFromPath: (_, getters, __, rootGetters) => side => {
        // eslint-disable-next-line new-cap
        return getters.section(rootGetters["MenuNavigation/lastEntry"](side));
    },
    secondaryMenu (_, __, ___, rootGetters) {
        if (rootGetters.loadedConfigs.configJson) {
            return rootGetters.portalConfig.secondaryMenu;
        }
        return null;
    },
    secondaryInitiallyOpen (_, getters) {
        return getters.secondaryMenu ? getters.secondaryMenu.initiallyOpen : false;
    },
    secondaryTitle (_, getters) {
        return getters.secondaryMenu ? getters.secondaryMenu.title : null;

    },
    section: (_, getters) => path => {
        if (getters[path[0]]) {
            const section = idx(getters, path);

            if (section === badPathSymbol) {
                console.error(`Menu.getters.section: ${badPathSymbol.description} ${path}.`);
                return null;
            }
            return section;
        }
        console.error(`Menu: The given menu ${path[0]} is not configured in the config.json.`);
        return null;
    }
};

export default menuGetters;
