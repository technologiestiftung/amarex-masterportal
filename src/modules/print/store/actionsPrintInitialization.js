
import {apply as applyTransform} from "ol/transform.js";
import {createEmpty, extendCoordinate} from "ol/extent.js";
import {DEVICE_PIXEL_RATIO} from "ol/has.js";

import BuildSpec from "../js/buildSpec";
import Canvas from "../js/buildCanvas";
import layerProvider from "../js/getVisibleLayer";
import thousandsSeparator from "../../../shared/js/utils/thousandsSeparator";
import {autoDrawMask} from "olcs/lib/olcs/print/drawCesiumMask.js";
import {computeRectangle} from "olcs/lib/olcs/print/computeRectangle.js";

let lastPrintedExtent;

/**
 * Return last printed extent
 * @returns {Extent} OL extent
 */
export function getLastPrintedExtent () {
    return lastPrintedExtent;
}

export default {
    /**
     * Gets the capabilities for a specific print configuration
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.commit the commit
     * @returns {void}
     */
    retrieveCapabilites: function ({state, dispatch, rootGetters, commit}) {
        let serviceUrl;

        if (state.serviceId !== "") {
            serviceUrl = rootGetters.restServiceById(state.serviceId).url;

            if (state.printService !== "plotservice" && !serviceUrl.includes("/print/")) {
                serviceUrl = serviceUrl + "print/";
            }

            commit("setServiceUrl", serviceUrl);
            serviceUrl = serviceUrl + state.printAppId + "/" + state.printAppCapabilities;
            const serviceRequest = {
                "serviceUrl": serviceUrl,
                "requestType": "GET",
                "onSuccess": "parseCapabilities"
            };

            dispatch("sendRequest", serviceRequest);

        }
    },

    /**
     * switch to decide which print service is configured and parses the response
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} response capabilities fomr the configured print service
     * @returns {void}
     */
    parseCapabilities: function ({state, dispatch}, response) {
        if (state.printService === "mapfish") {
            dispatch("parseMapfishCapabilities", response);
        }
        else {
            dispatch("parsePlotserviceCapabilities", response);
        }
    },

    /**
     * Sets the capabilities from mapfish response.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootgetters
     * @param {Object[]} response - config.yaml from mapfish.
     * @returns {void}
     */
    parseMapfishCapabilities: function ({state, commit, dispatch, rootGetters}, response) {
        commit("setLayoutList", response.layouts);
        dispatch("chooseCurrentLayout", response.layouts);
        dispatch("getAttributeInLayoutByName", "metadata");
        dispatch("getAttributeInLayoutByName", "gfi");
        dispatch("getAttributeInLayoutByName", "legend");
        dispatch("getAttributeInLayoutByName", "scale");
        dispatch("setDpiList");
        commit("setFormatList", state.formatList);
        commit("setCurrentScale", rootGetters["Maps/scale"]);
        dispatch("togglePostrenderListener");
        if (state.isGfiAvailable) {
            dispatch("getGfiForPrint");
            BuildSpec.buildGfi(state.isGfiSelected, state.gfiForPrint);
        }
    },

    /**
     * Sets the capabilities from mapfish response.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootgetters
     * @param {Object[]} response - config.yaml from mapfish.
     * @returns {void}
     */
    parsePlotserviceCapabilities: function ({state, commit, dispatch, rootGetters}, response) {
        commit("setLayoutList", response.layouts);
        dispatch("chooseCurrentLayout", response.layouts);
        commit("setScaleList", response.scales.map(scale => parseInt(scale.value, 10)).sort((a, b) => a - b));
        commit("setFormatList", response.outputFormats.map(format => format.name));
        commit("setCurrentScale", rootGetters["Maps/scale"]);
        dispatch("togglePostrenderListener");
        if (state.isGfiAvailable) {
            dispatch("getGfiForPrint");
            BuildSpec.buildGfi(state.isGfiSelected, state.gfiForPrint);
        }
    },

    /**
     * Choose the layout which is configured as currentlayout
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object[]} [layouts=[]] - All Layouts
     * @returns {void}
     */
    chooseCurrentLayout: function ({state, commit}, layouts) {
        const configuredLayout = layouts.find(layout => layout.name === state.currentLayoutName),
            layoutToUse = configuredLayout || layouts[0];

        commit("setCurrentLayout", layoutToUse);
        commit("setCurrentLayoutName", layoutToUse.name);
    },

    /**
     * Gets the Gfi Information
     * @param {Object} param.commit the commit
     * @param {Object} param.rootGetters the rootGetters
     * @returns {void}
     */
    getGfiForPrint: function ({commit, rootGetters}) {
        if (rootGetters["Modules/GetFeatureInfo/currentFeature"] !== null && typeof rootGetters["Modules/GetFeatureInfo/currentFeature"]?.getMappedProperties === "function" && typeof rootGetters["Modules/GetFeatureInfo/currentFeature"]?.getTitle === "function") {
            commit("setGfiForPrint", [rootGetters["Modules/GetFeatureInfo/currentFeature"].getMappedProperties(), rootGetters["Modules/GetFeatureInfo/currentFeature"].getTitle(), rootGetters["Maps/clickCoordinate"]]);
        }
        else {
            commit("setGfiForPrint", []);
        }
    },

    /**
     * sets a capabilities attribute object of the current layout, corresponding to the given name
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {String} name - name of the attribute to get
     * @returns {Object|undefined} corresponding attribute or null
     */
    getAttributeInLayoutByName: function ({state, commit}, name) {
        state.currentLayout.attributes.forEach(attribute => {
            if (attribute.name === name) {
                const capName = name.charAt(0).toUpperCase() + name.slice(1);

                commit("setIs" + capName + "Available", true);
                commit("set" + capName + "Attribute", attribute);
            }
        });
    },

    /**
     * sets the dpi values if given in mapfish print capabilities
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @returns {void}
     */
    setDpiList: function ({state, commit}) {
        state.currentLayout.attributes.forEach((attribute, idx) => {
            if (attribute.name === "map") {
                commit("setDpiList", state.currentLayout.attributes[idx]
                    .clientInfo?.dpiSuggestions || []);
            }
        });
    },

    /**
     * If the tool is activated and the user clicks for an improved quality,
     * we double the rendered scale of the globe.
     * @param {Object} param.state the state
     * @returns {void}
     */
    update3DResolutionScale: function ({state}) {
        const ol3d = mapCollection.getMap("3D");

        ol3d.setResolutionScale(state.isIncreased3DResolutionSelected ? 2 : 1);
    },

    /**
     * if the tool is activated and there is a layout,
     * a callback function is registered to the postrender event of the map
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Boolean} [active=true] The print module is activated or deactivated
     * @returns {void}
     */
    togglePostrenderListener: function ({state, dispatch, commit}, active = true) {
        const foundVectorTileLayers = [],
            ol3d = mapCollection.getMap("3D");

        layerProvider.getVisibleLayer(state.printMapMarker);

        /*
        * Since MapFish 3 does not yet support VTL (see https://github.com/mapfish/mapfish-print/issues/659),
        * they are filtered in the following code and an alert is shown to the user informing him about which
        * layers will not be printed.
        */
        if (foundVectorTileLayers.length && active) {
            dispatch("Alerting/addSingleAlert", {
                category: "warning",
                content: i18next.t("common:modules.print.vtlWarning")
            }, {root: true});
        }

        commit("setVisibleLayer", state.visibleLayerList);

        if (active && state.layoutList.length !== 0 && state.visibleLayerList.length >= 1) {
            if (state.eventListener !== undefined) {
                dispatch("Maps/unregisterListener", {type: state.eventListener}, {root: true});
                commit("setEventListener", undefined);
            }
            const canvasLayer = Canvas.getCanvasLayer(state.visibleLayerList);

            commit("setEventListener", canvasLayer.on("postrender", evt => dispatch("createPrintMask", evt)));
            draw3dMask(state, dispatch, ol3d);
        }

        if (!active) {
            dispatch("Maps/unregisterListener", {type: state.eventListener}, {root: true});
            commit("setEventListener", undefined);
            if (ol3d) {
                autoDrawMask(ol3d.getCesiumScene(), null);
            }
        }

        mapCollection.getMap("2D").render();
    },

    /**
     * Getting and showing the layer which is visible in print scale. Shows alert, if layers are not visible in the print scale.
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.getters the getters
     * @param {Object} param.rootGetters the rootGetters
     * @param {String} scale - the current print scale
     * @returns {void}
     */
    setPrintLayers: function ({dispatch, commit, getters}, scale) {
        let invisibleLayer = [],
            hintInfo = "";

        layerProvider.getVisibleLayer(getters.printMapMarker);
        invisibleLayer = getters.invisibleLayer;
        hintInfo = i18next.t("common:modules.print.invisibleLayer", {scale: "1: " + thousandsSeparator(scale, ".")});
        hintInfo = hintInfo + "<br>" + getters.invisibleLayerNames;

        if ((invisibleLayer.length && hintInfo !== getters.hintInfo) && getters.showInvisibleLayerInfo) {
            dispatch("Alerting/addSingleAlert", {
                category: "info",
                content: hintInfo
            }, {root: true});
            commit("setHintInfo", hintInfo);
        }
        if (!invisibleLayer.length) {
            commit("setHintInfo", "");
        }
        commit("setInvisibleLayer", invisibleLayer);
    },

    /**
     * update to draw the print page rectangle onto the canvas when the map changes
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    updateCanvasLayer: function ({state, commit, dispatch}) {
        const visibleLayerList = state.visibleLayerList;
        let canvasLayer = {};

        if (state.currentScaleUrlParams) {
            state.currentScaleUrlParams = undefined;
        }
        dispatch("Maps/unregisterListener", {type: state.eventListener}, {root: true});
        canvasLayer = Canvas.getCanvasLayer(visibleLayerList);
        dispatch("chooseCurrentLayout", state.layoutList);
        if (Object.keys(canvasLayer).length) {
            commit("setEventListener", canvasLayer.on("postrender", (evt) => {
                dispatch("createPrintMask", evt);
            }));
        }
    },

    /**
     * Dispatches getPrintMapSize and getPrintMapScales.
     * @param {Object} dispatch the dispatch
     * @returns {void}
     */
    compute3dPrintMask: function ({dispatch}) {
        dispatch("getPrintMapSize");
        dispatch("getPrintMapScales");
    },

    /**
     * draws the print page rectangle onto the canvas
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {ol.render.Event} evt - postrender
     * @returns {void}
     */
    createPrintMask: function ({dispatch, state}, evt) {
        dispatch("getPrintMapSize");
        dispatch("getPrintMapScales");

        const frameState = evt.frameState,
            context = evt.context,
            drawMaskOpt = {
                "frameState": frameState,
                "context": context
            },
            canvasPrintOptions = {
                "pixelToCoordinateTransform": frameState.pixelToCoordinateTransform,
                "mapSize": frameState.size,
                "resolution": frameState.viewState.resolution,
                "printMapSize": state.layoutMapInfo,
                "scale": "",
                "context": context
            },
            canvasOptions = {
                "mapSize": frameState.size,
                "resolution": frameState.viewState.resolution,
                "printMapSize": state.layoutMapInfo,
                "scaleList": state.scaleList
            };

        if (state.isScaleSelectedManually) {
            canvasPrintOptions.scale = state.currentScale;
        }
        else if (state.autoAdjustScale) {
            dispatch("getOptimalScale", canvasOptions);
            if (state.currentScaleUrlParams) {
                canvasPrintOptions.scale = state.currentScaleUrlParams;
            }
            else {
                canvasPrintOptions.scale = state.optimalScale;
            }
        }
        else {
            if (state.currentScaleUrlParams) {
                state.currentScale = state.currentScaleUrlParams;
            }
            canvasPrintOptions.scale = state.currentScale;
        }

        dispatch("drawMask", drawMaskOpt);
        dispatch("drawPrintPage", canvasPrintOptions);
        context.fillStyle = "rgba(0, 5, 25, 0.55)";
        context.fill();

        dispatch("setPrintLayers", canvasPrintOptions.scale);
    },
    /**
     * gets the optimal print scale for a map
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} canvasOptions the canvas measurements
     * @returns {void}
     */
    getOptimalScale: function ({commit, state}, canvasOptions) {
        const mapWidth = canvasOptions.mapSize[0] * canvasOptions.resolution,
            mapHeight = canvasOptions.mapSize[1] * canvasOptions.resolution,
            scaleWidth = mapWidth * state.INCHES_PER_METER * state.DOTS_PER_INCH / canvasOptions.printMapSize[0],
            scaleHeight = mapHeight * state.INCHES_PER_METER * state.DOTS_PER_INCH / canvasOptions.printMapSize[1],
            scale = Math.min(scaleWidth, scaleHeight);
        let optimalScale = canvasOptions.scaleList[0];

        canvasOptions.scaleList.forEach(printMapScale => {
            if (scale > printMapScale) {
                optimalScale = printMapScale;
            }
        });

        commit("setOptimalScale", optimalScale);
        commit("setCurrentScale", state.currentScaleUrlParams ? state.currentScaleUrlParams : optimalScale);
    },

    /**
     * draws a mask on the whole map
     * @param {Object} _ state
     * @param {Object} drawMaskOpt - context of the postrender event
     * @returns {void}
     */
    drawMask: function (_, drawMaskOpt) {
        const mapSize = drawMaskOpt.frameState.size,
            context = drawMaskOpt.context,
            ration = drawMaskOpt.context.canvas.width > mapSize[0] ? DEVICE_PIXEL_RATIO : 1,
            mapWidth = mapSize[0] * ration,
            mapHeight = mapSize[1] * ration;

        context.beginPath();
        // Outside polygon, must be clockwise
        context.moveTo(0, 0);
        context.lineTo(mapWidth, 0);
        context.lineTo(mapWidth, mapHeight);
        context.lineTo(0, mapHeight);
        context.lineTo(0, 0);
        context.closePath();
    },
    /**
     * draws the print page
     * @param {Object} param.state the state
     * @param {Object} canvasPrintOptions - mapsize, resolution, printmapsize and scale
     * @returns {void}
     */
    drawPrintPage: function ({state}, canvasPrintOptions) {
        const ration = canvasPrintOptions.context.canvas.width > canvasPrintOptions.mapSize[0] ? DEVICE_PIXEL_RATIO : 1,
            center = [canvasPrintOptions.mapSize[0] * ration / 2, canvasPrintOptions.mapSize[1] * ration / 2],
            boundWidth = canvasPrintOptions.printMapSize[0] / state.DOTS_PER_INCH / state.INCHES_PER_METER * canvasPrintOptions.scale / canvasPrintOptions.resolution * ration,
            boundHeight = canvasPrintOptions.printMapSize[1] / state.DOTS_PER_INCH / state.INCHES_PER_METER * canvasPrintOptions.scale / canvasPrintOptions.resolution * ration,
            minx = center[0] - (boundWidth / 2),
            miny = center[1] - (boundHeight / 2),
            maxx = center[0] + (boundWidth / 2),
            maxy = center[1] + (boundHeight / 2),
            extent = createEmpty(),
            transform = canvasPrintOptions.pixelToCoordinateTransform,
            c1 = applyTransform(transform, [minx, miny]),
            c2 = applyTransform(transform, [maxx, maxy]);

        // Inner polygon,must be counter-clockwise
        canvasPrintOptions.context.moveTo(minx, miny);
        canvasPrintOptions.context.lineTo(minx, maxy);
        canvasPrintOptions.context.lineTo(maxx, maxy);
        canvasPrintOptions.context.lineTo(maxx, miny);
        canvasPrintOptions.context.lineTo(minx, miny);
        canvasPrintOptions.context.closePath();

        // Keep the print extent available for later use
        extendCoordinate(extent, c1);
        extendCoordinate(extent, c2);
        lastPrintedExtent = extent;
    },

    /**
     * gets the optimal map resolution for a print scale and a map size
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} resolution - scale, mapSize and printMapSize
     * @returns {void}
     */
    getOptimalResolution: function ({commit, state}, resolution) {
        const dotsPerMeter = state.INCHES_PER_METER * state.DOTS_PER_INCH,
            resolutionX = resolution.printMapSize[0] * resolution.scale / (dotsPerMeter * resolution.mapSize[0]),
            resolutiony = resolution.printMapSize[1] * resolution.scale / (dotsPerMeter * resolution.mapSize[1]);

        commit("setOptimalResolution", Math.max(resolutionX, resolutiony));
    },

    /**
     * sets the size of the map on the report
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    getPrintMapSize: function ({state, commit, dispatch}) {
        if (state.printService === "plotservice") {
            const map = state.currentLayout.map;

            commit("setLayoutMapInfo", [map.width, map.height]);
        }
        else {
            dispatch("getAttributeInLayoutByName", "map");
            const layoutMapInfo = state.mapAttribute.clientInfo;

            commit("setLayoutMapInfo", [layoutMapInfo.width, layoutMapInfo.height]);
        }
    },

    /**
     * sets the supported scales of the map in the report
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    getPrintMapScales: function ({state, dispatch, commit}) {
        if (state.printService !== "plotservice") {
            dispatch("getAttributeInLayoutByName", "map");
            const layoutMapInfo = state.mapAttribute.clientInfo;

            commit("setScaleList", layoutMapInfo.scales.sort((a, b) => a - b));
        }
    }
};

/**
 * Calls the autoDrawMask if ol3d is given and dispatches compute3dPrintMask in the callback
 * for autoDrawMask function.
 * @param {Object} state the state
 * @param {Object} dispatch the dispatch
 * @param {ol/Map} ol3d the 3d map
 * @returns {void}
 */
function draw3dMask (state, dispatch, ol3d) {
    if (!ol3d) {
        return;
    }
    autoDrawMask(ol3d.getCesiumScene(), () => {
        const evt = {ol3d: ol3d};

        dispatch("compute3dPrintMask");
        evt.printRectangle = computeRectangle(
            evt.ol3d.getCesiumScene().canvas,
            state.layoutMapInfo[0],
            state.layoutMapInfo[1]);
        return evt.printRectangle.scaling;
    });
}
