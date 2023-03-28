import menuState from "./stateMenu";
import {badPathSymbol, idx} from "../../../shared/js/utils/idx";
import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import changeCase from "../../../shared/js/utils/changeCase";

const menuGetters = {
    ...generateSimpleGetters(menuState),

    /**
     * Returns the current component for a menu side.
     * @param {MenuNavigationState} state Local vuex state.
     * @param {string} side Menu Side.
     * @returns {Object} The current component.
     */
    currentComponent: state => side => {
        return state[side].navigation.currentComponent;
    },

    /**
     * @param {MenuNavigationState} state Local vuex state.
     * @param {string} side Menu Side.
     * @returns {object} Returns the Name of the currently visible Component.
     */
    currentComponentName: state => side => {
        const currentComponent = state[side].navigation.currentComponent;
        let name = {};

        switch (currentComponent.type) {
            case "root":
                name = i18next.t("common:menu.name");
                break;
            default:
                name = currentComponent.props !== undefined && currentComponent.props.name ? i18next.t(currentComponent.props.name) : currentComponent.type;
                break;
        }

        return name;
    },

    /**
     * @param {MenuNavigationState} state Local vuex state.
     * @param {string} side Menu Side
     * @returns {object} Returns the currently visible Component.
     */
    currentFolderPath: state => side => {
        return state[side].navigation.currentComponent.props.path;
    },


    /**
     * @param {MenuNavigationState} state Local vuex state.
     * @param {string} side Menu Side
     * @returns {object} Returns the current Menu-width
     */
    currentMenuWidth: state => side => {
        return state[side].width;
    },

    /**
     * Returns true, if a module with attribute hasMouseMapInteractions will be deactivated.
     * @param {MenuState} state Local vuex state.
     * @param {Object} _ Local vuex getters (discarded).
     * @param {Object} __ vuex rootState (discarded).
     * @param {Object} rootGetters vuex rootGetters.
     * @returns {(function(type: String): Boolean)} Function returning component identified via deactivateModule.
     */
    deactivateModule: (state, _, __, rootGetters) => type => {
        if (rootGetters[`Modules/${changeCase.upperFirst(type)}/hasMouseMapInteractions`]
            && changeCase.upperFirst(type) !== state.activeModuleMouseMapInteractions
        ) {
            return true;
        }

        return false;
    },

    /**
     * @param {Object} state Local vuex state.
     * @returns {Boolean} Whether the menu by side is opened.
     */
    expanded: state => side => {
        return state[side].expanded;
    },

    /**
     * @param {Object} state Local vuex state.
     * @returns {Boolean} Whether the mainMenu is opened.
     */
    mainExpanded: state => {
        return state.mainMenu.expanded;
    },

    /**
     * @param {Object} state Local vuex state.
     * @returns {(Object|null)} Title of the mainMenu or null.
     */
    mainTitle: state => {
        return state.mainMenu.title;
    },

    /**
     * @param {Object} state Local vuex state.
     * @returns {String} Icon used for button toggling the mainMenu.
     */
    mainToggleButtonIcon: state => {
        return state.mainMenu.toggleButtonIcon;
    },

    /**
     * Returns the Text to be chosen for backward menu navigation.
     * @param {MenuState} state Local vuex state.
     * @returns {(function(type: String): Boolean)} Function returning false or the Text.
     */
    previousNavigationEntryText: (state) => side => {
        const previousEntry = state[side].navigation.history.length !== 0 ? state[side].navigation.history.slice(-1)[0] : "";
        let previousEntryText = false;

        if (previousEntry !== "") {
            switch (previousEntry.type) {
                case "root": {
                    previousEntryText = i18next.t("common:menu.name");
                    break;
                }
                default: {
                    previousEntryText = previousEntry.props !== undefined && previousEntry.props.name ? i18next.t(previousEntry.props.name) : previousEntry.type;
                    break;
                }
            }
        }

        return previousEntryText;
    },

    /**
     * @param {Object} state Local vuex state.
     * @returns {Boolean} Whether the secondaryMenu should be initially open.
     */
    secondaryExpanded: state => {
        return state.secondaryMenu.expanded;
    },

    /**
     * @param {Object} state Local vuex state.
     * @returns {(Object|null)} Title of the secondaryMenu or null.
     */
    secondaryTitle: state => {
        return state.secondaryMenu.title;
    },

    /**
     * @param {Object} state Local vuex state.
     * @returns {string} Icon used for button toggling the secondaryMenu.
     */
    secondaryToggleButtonIcon: state => {
        return state.secondaryMenu.toggleButtonIcon;
    },

    /**
     * @param {MenuState} _ Local vuex state (discarded).
     * @param {Object} getters Local vuex getters.
     * @returns {(function(path: Array): Object|null)} Function returning a section of the menu.
     */
    section: (_, getters) => path => {
        if (path && getters[path[0]]) {
            const section = idx(getters, path);

            if (section === badPathSymbol) {
                console.error(`Menu.getters.section: ${badPathSymbol.description} ${path}.`);
                return null;
            }

            return section;
        }

        console.error(`Menu: The given menu ${path[0]} is not configured in the config.json.`);
        return null;
    },

    /**
     * @param {MenuState} _ Local vuex state (discarded).
     * @param {Object} getters Local vuex getters.
     * @returns {function(side: String): {title: string, idAppendix: string}|null} Function returning an object including the title and an appendix for the titles id to make it unique; may return null if no title is configured.
     */
    titleBySide: (_, getters) => side => {
        if (side === "mainMenu" && getters.mainTitle) {
            return {...getters.mainTitle, idAppendix: side};
        }
        if (side === "secondaryMenu" && getters.secondaryTitle) {
            return {...getters.secondaryTitle, idAppendix: side};
        }
        return null;
    },

    urlParams: (state, _, rootState, rootGetters) => side => {
        const currentComponent = state[side].currentComponent,
            menuString = side === "mainMenu" ? "MENU_MAIN" : "MENU_SECONDARY";
        let params = `${menuString}=${JSON.stringify({"currentComponent": currentComponent})}`;

        if (currentComponent !== "root") {
            const moduleParam = rootGetters[`Modules/${changeCase.upperFirst(currentComponent)}/urlParams`];

            // if (typeof moduleParam === "undefined") {
            //     moduleParam = JSON.stringify(rootState.Modules[upperFirst(currentComponent)]);
            // }

            if (side === "mainMenu") {
                params = `${params}&MODULE_MAIN=${moduleParam}`;
            }
            else if (side === "secondaryMenu") {
                params = `${params}&MODULE_SECONDARY=${moduleParam}`;
            }
        }

        return params;
    }
};

export default menuGetters;
