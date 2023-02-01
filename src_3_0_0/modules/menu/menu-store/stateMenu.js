/**
 * Menu state definition.
 * @typedef {Object} MenuState
 * @property {String} currentMouseMapInteractionsComponent Component that has mouse map actions and is currently activated.
 * @property {String} defaultComponent Default Component that has mouse map actions and is currently activated.
 * @property {Object} mainMenu the main menu settings.
 * @property {Boolean} mainMenu.expanded Specifies whether the main menu is opened.
 * @property {Object[]} mainMenu.sections The main menu sections.
 * @property {Object} mainMenu.title The main menu title.
 * @property {String} mainMenu.toggleButtonIcon The main menu toggle button icon.
 * @property {String} mainMenu.currentComponent The current Component shown in mainMenu Body Section.
 * @property {Object} secondaryMenu the secondary menu settings.
 * @property {Boolean} secondaryMenu.expanded Specifies whether the secondary menu is opened.
 * @property {Object[]} secondaryMenu.sections The secondary menu sections.
 * @property {Object} secondaryMenu.title The secondary menu title.
 * @property {String} secondaryMenu.toggleButtonIcon The secondary menu toggle button icon.
 * @property {String} secondaryMenu.currentComponent The current Component shown in secondaryMenu Body Section.
 */
export default {
    currentMouseMapInteractionsComponent: "getFeatureInfo",
    defaultComponent: "getFeatureInfo",
    mainMenu: {
        expanded: false,
        currentComponent: "root",
        title: null,
        toggleButtonIcon: "bi-list",
        sections: [[]],
        navigation: {
            currentComponent: {
                type: "root",
                props: []
            },
            history: []
        }
    },
    secondaryMenu: {
        expanded: false,
        currentComponent: "root",
        sections: [[]],
        title: null,
        toggleButtonIcon: "bi-tools",
        navigation: {
            currentComponent: {
                type: "root",
                props: []
            },
            history: []
        }
    }
};
