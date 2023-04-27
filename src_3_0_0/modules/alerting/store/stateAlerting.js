/**
 * User type definition
 * @typedef {Object} AlertingItemState
 * @property {Object} alertProto Blueprint of an alert
 * @property {String} alertProto.title Title of an alert
 * @property {String} alertProto.category Category of an alert
 * @property {String} alertProto.confirmText Text for don't showing the alert again
 * @property {String} alertProto.reConfirmText Text for showing the alert again
 * @property {String} alertProto.content content of an alert
 * @property {Boolean/String} alertProto.displayFrom start date of a time limited alert e.g. "2020-01-01 00:00:00" (see dayjs.js)
 * @property {Boolean/String} alertProto.displayUntil end date of a time limited alert e.g. "2030-01-01 00:00:00" (see dayjs.js)
 * @property {String} alertProto.creationDate creation date of an alert
 * @property {String} alertProto.hash hash id of an alert
 * @property {Boolean} alertProto.multipleAlert flag to show multiple alerts or a single alert
 * @property {Boolean} alertProto.mustBeConfirmed flag if an alert can be marked to show not again
 * @property {Boolean/Object} alertProto.once flag if alert is shown once or not. Can also be an object {seconds: 59, minutes: ...} (see dayjs.js) with information when the alert is shown again

 * @property {String} alertWindowTitle shown title of the main alert/modal window
 * @property {Object[]} alerts array of current loaded alerts
 * @property {Object} displayedAlerts object of available alerts
 * @property {Boolean/String} fetchBroadcastUrl URL of the alert json
 * @property {Boolean} initialClosed flag to check if the initial modal was closed once
 * @property {String[]} availableCategories available alert categories
 * @property {String} localStorageDisplayedAlertsKey key name for localStorage
 * @property {Boolean} showTheModal flag to control if modal is shown or not
*/
export default {
    alertProto: {
        title: "",
        category: "info",
        confirmText: "common:modules.alerting.hideMessage",
        reConfirmText: "common:modules.alerting.showMessage",
        content: "",
        displayFrom: false,
        displayUntil: false,
        creationDate: "",
        hash: "",
        multipleAlert: false,
        mustBeConfirmed: false,
        once: false
    },
    alerts: [],
    alertWindowTitle: "common:modules.alerting.alertWindowTitle",
    displayedAlerts: {},
    fetchBroadcastUrl: false,
    initialClosed: false,
    availableCategories: ["news", "success", "warning", "error", "info"],
    localStorageDisplayedAlertsKey: "displayedAlerts",
    showTheModal: false
};
