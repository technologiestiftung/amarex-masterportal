import Feature from "ol/Feature.js";
import {GeoJSON} from "ol/format.js";
import {Group, Image, Tile, Vector} from "ol/layer.js";
import {MVTEncoder} from "@geoblocks/print";
import Geometry from "ol/geom/Geometry";
import {Point} from "ol/geom.js";
import Icon from "ol/style/Icon";
import {fromCircle} from "ol/geom/Polygon.js";
import CircleStyle from "ol/style/Circle";
import VectorTileLayer from "ol/layer/VectorTile";
import StaticImageSource from "ol/source/ImageStatic.js";
import {convertColor} from "../../../shared/js/utils/convertColor";
import isObject from "../../../shared/js/utils/isObject";
import differenceJS from "../../../shared/js/utils/differenceJS";
import findWhereJs from "../../../shared/js/utils/findWhereJs";
import {getLastPrintedExtent} from "../store/actionsPrintInitialization";
import sortBy from "../../../shared/js/utils/sortBy";
import store from "../../../app-store";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import {getRulesForFeature} from "@masterportal/masterportalapi/src/vectorStyle/lib/getRuleForIndex";
import layerCollection from "../../../core/layers/js/layerCollection";
import {uniqueId} from "../../../shared/js/utils/uniqueId.js";

const BuildSpecModel = {
    defaults: {
        uniqueIdList: [],
        visibleLayerIds: null,
        layout: null,
        attributes: {
            map: null,
            title: "",
            showLegend: false,
            legend: "",
            showGfi: false,
            gfi: null,
            scale: null
        }
    },
    /**
     * Fetches the metadata object and checks if object is from own request.
     * If so it removes the unique id from the unique id list.
     * @param {Object} cswObj Object from csw parser.
     * @returns {void}
     */
    fetchedMetaData: function (cswObj) {
        if (this.isOwnMetaRequest(this.defaults.uniqueIdList, cswObj.uniqueId)) {
            this.removeUniqueIdFromList(this.defaults.uniqueIdList, cswObj.uniqueId);
            this.updateMetaData(cswObj.layerName, cswObj.parsedData);
            if (this.defaults.uniqueIdList.length === 0) {
                const printJob = {
                    index: cswObj.index,
                    payload: encodeURIComponent(JSON.stringify(this.defaults)),
                    getResponse: cswObj.getResponse
                };

                store.dispatch("Modules/Print/createPrintJob", printJob);
            }
        }
    },
    setAttributes: function (attr) {
        this.defaults.attributes = attr.attributes;
        this.defaults.layout = attr.layout;
        this.defaults.outputFilename = attr.outputFilename;
        this.defaults.outputFormat = attr.outputFormat;
    },
    /**
     * Checks if csw request belongs to this model.
     * @param {String[]} uniqueIdList List of all metaRequest-ids belonging to this model.
     * @param {String} uniqId Response unique-id from Cswparser.
     * @returns {Boolean} - Flag if csw response is from own metaRequest.
     */
    isOwnMetaRequest: function (uniqueIdList, uniqId) {
        return Array.isArray(uniqueIdList) && uniqueIdList.indexOf(uniqId) !== -1;
    },
    /**
     * Removes the uniqueId from the uniqueIdList, because the request returned something.
     * @param {String[]} uniqueIdList List of all metaRequest-ids belonging to this model.
     * @param {String} uniqId Response unique-id from Cswparser.
     * @returns {void}
     */
    removeUniqueIdFromList: function (uniqueIdList, uniqId) {
        this.setUniqueIdList(differenceJS(uniqueIdList, [uniqId]));
    },
    /**
     * Updates the metadata from the metadata response.
     * @param {String} layerName name of layer.
     * @param {Object} parsedData parsedCswData.
     * @returns {void}
     */
    updateMetaData: function (layerName, parsedData) {
        const layers = this.defaults.attributes.legend && this.defaults.attributes.legend.layers ? this.defaults.attributes.legend.layers : undefined,
            layer = findWhereJs(layers, {layerName: layerName});

        if (layer !== undefined) {
            layer.metaDate = parsedData?.date ? parsedData.date : "n.N.";
            layer.metaOwner = parsedData?.orgaOwner ? parsedData.orgaOwner : "n.N.";
            layer.metaAddress = parsedData?.address ? this.parseAddressToString(parsedData.address) : "n.N.";
            layer.metaEmail = parsedData?.email ? parsedData.email : "n.N.";
            layer.metaTel = parsedData?.tel ? parsedData.tel : "n.N.";
            layer.metaUrl = parsedData?.url ? parsedData.url : "n.N.";
        }
    },
    /**
     * Parses the address object to a string.
     * @param {Object} addressObj Address Object
     * @param {String} addressObj.street Street name.
     * @param {String} addressObj.housenr House number.
     * @param {String} addressObj.postalCode Postal Code.
     * @param {String} addressObj.city City.
     * @returns {String} - The parsed String.
     */
    parseAddressToString: function (addressObj) {
        let street,
            streetFilled = false,
            housenr,
            postalCode,
            postalCodeFilled = false,
            city,
            addressString = "";

        if (typeof addressObj === "object") {
            street = addressObj.street;
            streetFilled = this.isFilled(street);
            housenr = addressObj.housenr;
            postalCode = addressObj.postalCode;
            postalCodeFilled = this.isFilled(postalCode);
            city = addressObj.city;
        }
        if (streetFilled) {
            addressString += street;
        }
        if (this.isFilled(housenr)) {
            if (streetFilled) {
                addressString += " ";
            }
            addressString += housenr;
        }
        if (addressString !== "") {
            // newline between housenr and postalCode
            addressString += "\n ";
        }
        if (postalCodeFilled) {
            addressString += postalCode;
        }
        if (this.isFilled(city)) {
            if (postalCodeFilled) {
                addressString += " ";
            }
            addressString += city;
        }
        if (addressString.trim() === "") {
            // n.N. if addressString is empty
            addressString += "n.N.";
        }
        return addressString;
    },
    /**
     * Returns true, if the given string is not empty or undefined
     * @param {String} string to check
     * @returns {Boolean} true, if string has content
     */
    isFilled: function (string) {
        return string !== undefined && string.trim() !== "";
    },
    /**
     * Defines the layers attribute of the map spec
     * @param {ol.layer.Layer[]} layerList All visible layers on the map.
     * @param {Number} [dpi] The dpi to use instead of the dpi from store.
     * @returns {void}
     */
    buildLayers: async function (layerList, dpi) {
        const layers = [],
            attributes = this.defaults.attributes,
            currentResolution = store.getters["Maps/resolution"],
            visibleLayerIds = [];

        if (Array.isArray(layerList)) {
            for (const layer of layerList) {
                const printLayers = [];

                if (layer instanceof Group) {
                    for (const childLayer of layer.getLayers().getArray()) {
                        printLayers.push(await this.buildLayerType(childLayer, currentResolution, dpi));
                        visibleLayerIds.push(childLayer.get("id"));
                    }
                }
                else {
                    printLayers.push(await this.buildLayerType(layer, currentResolution, dpi));
                }
                printLayers.forEach(printLayer => {
                    if (typeof printLayer !== "undefined") {
                        if (layer?.get("id") !== undefined) {
                            visibleLayerIds.push(layer?.get("id"));
                        }
                        layers.push(printLayer);
                    }

                });
            }
        }
        this.setVisibleLayerIds(visibleLayerIds);
        if (store.state.Modules.Print.printService === "plotservice") {
            attributes.map.layers = layers;
        }
        else {
            attributes.map.layers = layers.reverse();
        }
    },
    /**
     * Sorts the features of the draw layer by z-index and returns the vector object for mapfish-print-3
     * @param {ol.layer}  layer   ol.Layer with features.
     * @param {ol.extent} extent  Extent uses to filter the feature by extent.
     * @returns {Object|undefined} - VectorObject for mapfish print.
     */
    getDrawLayerInfo: function (layer, extent) {
        const featuresInExtent = layer.getSource().getFeaturesInExtent(extent),
            features = sortBy(featuresInExtent, function (feature) {
                if (feature.getStyle() && typeof feature.getStyle === "function" && typeof feature.getStyle().getZIndex === "function") {
                    return feature.getStyle().getZIndex();
                }
                return 0;
            }),
            visibleFeatures = features.filter(feature => feature.get("isVisible"));

        if (visibleFeatures.length > 0) {
            return this.buildVector(layer, visibleFeatures, extent);
        }

        return undefined;
    },
    /**
     * Returns information about the layer depending on the layer type.
     *
     * @param  {ol.layer} layer ol.Layer with features
     * @param {Number} currentResolution Current map resolution
     * @param {Number} [dpi] The dpi to use instead of the dpi from store.
     * @param {Boolean} [scaleDoesNotMatter=false] - The layer should be build even if it is not visible in the current resolution.
     * @returns {Object} - LayerObject for MapFish print.
     */
    buildLayerType: async function (layer, currentResolution, dpi, scaleDoesNotMatter = false) {
        const extent = store.getters["Maps/extent"],
            layerMinRes = typeof layer?.get === "function" ? layer.get("minResolution") : false,
            layerMaxRes = typeof layer?.get === "function" ? layer.get("maxResolution") : false,
            isInScaleRange = this.isInScaleRange(layerMinRes, layerMaxRes, currentResolution);
        let features = [],
            returnLayer;

        if (isInScaleRange || scaleDoesNotMatter) {
            const source = layer.getSource();

            if (layer instanceof VectorTileLayer) {
                const maskExtent = getLastPrintedExtent();

                returnLayer = await this.buildVectorTile(layer, currentResolution, maskExtent);
            }
            else if (layer instanceof Image) {
                returnLayer = this.buildImageWms(layer, dpi);
            }
            else if (layer instanceof Tile) {
                // The source of a TileWMS has a params object while the source of a WMTS has a layer object
                if (source?.getParams) {
                    returnLayer = this.buildTileWms(layer, dpi);
                }
                else if (source?.getLayer) {
                    returnLayer = this.buildWmts(layer, source);
                }
            }
            else if (typeof layer?.get === "function" && layer.get("name") === "importDrawLayer") {
                returnLayer = this.getDrawLayerInfo(layer, extent);
            }
            else if (layer instanceof Vector) {
                features = source.getFeaturesInExtent(extent);

                if (features.length > 0) {
                    returnLayer = this.buildVector(layer, features, extent);
                }
            }
        }

        return returnLayer;
    },
    /**
     * Checks if layer is in the visible resolution range.
     * @param {Number} layerMinRes Maximum resolution of layer.
     * @param {Number} layerMaxRes Minimum resolution of layer.
     * @param {Number} currentResolution Current map resolution.
     * @returns {Boolean} - Flag if layer is in visible resolution.
     */
    isInScaleRange: function (layerMinRes, layerMaxRes, currentResolution) {
        let isInScale = false;

        if (layerMinRes <= currentResolution && layerMaxRes >= currentResolution) {
            isInScale = true;
        }

        return isInScale;
    },
    /**
     * Builds the information needed for MapFish to print the given WMTS Layer.
     *
     * @param {ol.layer.Tile} layer The WMTS Layer.
     * @param {ol.source.WMTS} source The source of the WMTS Layer.
     * @returns {Object} Information about the WMTS Layer.
     */
    buildWmts: (layer, source) => {
        const matrices = [],
            tileGrid = source.getTileGrid(),
            matrixIds = tileGrid.getMatrixIds(),
            {origin_, origins_, tileSize_, tileSizes_} = tileGrid;
        let baseURL = source.getUrls()[0];

        for (let i = 0; i < matrixIds.length; i++) {
            // The parameters "matrixSizes" and "scales" are not standard for a WMTS source and are added in the process of parsing the information of the layer
            matrices.push({
                identifier: matrixIds[i],
                matrixSize: source.matrixSizes[i],
                topLeftCorner: origin_ ? origin_ : origins_[i],
                scaleDenominator: source.scales[i],
                tileSize: tileSize_ ? [tileSize_, tileSize_] : [tileSizes_[i], tileSizes_[i]]
            });
        }

        if (baseURL.includes("{Style}")) {
            // As described in the MapFish Documentation (https://mapfish.github.io/mapfish-print-doc/javadoc/org/mapfish/print/map/tiled/wmts/WMTSLayerParam.html#baseURL) the parameter "style" seemingly needs to be written small.
            baseURL = baseURL.replace(/{Style}/g, "{style}");
        }

        return {
            baseURL,
            opacity: layer.getOpacity(),
            type: "WMTS",
            layer: source.getLayer(),
            style: source.getStyle(),
            imageFormat: source.getFormat(),
            matrixSet: source.getMatrixSet(),
            matrices,
            requestEncoding: source.getRequestEncoding()
        };
    },
    /**
     * returns vector tile layer information
     * @param {ol.layer.VectorTile} layer vector tile layer with vector tile source
     * @param {Number} resolution print resolution
     * @param {ol.Extent} extent printed extent
     * @returns {Object} - static image layer spec
     */
    buildVectorTile: async function (layer, resolution, extent) {
        MVTEncoder.useImmediateAPI = false;
        const mapInfo = store.state.Modules.Print.layoutMapInfo,
            targetDPI = store.state.Modules.Print.dpiForPdf,
            factor = targetDPI / 72,
            targetWidth = mapInfo[0] * factor,
            targetHeight = mapInfo[1] * factor,
            encoder = new MVTEncoder(),
            r = await encoder.encodeMVTLayer({
                layer,
                tileResolution: resolution,
                printResolution: resolution,
                printExtent: extent,
                canvasSize: [targetWidth, targetHeight]
            }),
            {extent: tileExtent, baseURL: tileBaseURL} = r[0];

        if (r.length !== 1) {
            throw new Error("handle several results");
        }

        if (r[0].baseURL.length <= 6) {
            return null;
        }

        return {
            extent: tileExtent,
            baseURL: tileBaseURL,
            type: "image",
            name: layer.get("name"),
            opacity: 1,
            imageFormat: "image/png"
        };
    },
    /**
     * returns tile wms layer information
     * @param {ol.layer.Tile} layer tile layer with tile wms source
     * @param {Number} [dpi] The dpi to use instead of the dpi from store.
     * @returns {Object} - wms layer spec
     */
    buildTileWms: function (layer, dpi) {
        const source = layer.getSource(),
            isPlotservice = store.state.Modules.Print.printService === "plotservice";
        let mapObject = null,
            styles;

        if (source.getParams().STYLES) {
            if (typeof source.getParams().STYLES === "string") {
                styles = source.getParams().STYLES.split(",");
            }
            else if (Array.isArray(source.getParams().STYLES)) {
                styles = source.getParams().STYLES;
            }
        }
        mapObject = {
            baseURL: source.getUrls()[0],
            opacity: layer.getOpacity(),
            type: source.getParams().SINGLETILE || isPlotservice ? "WMS" : "tiledwms",
            layers: source.getParams().LAYERS.split(","),
            styles: styles,
            imageFormat: source.getParams().FORMAT,
            customParams: {
                "TRANSPARENT": source.getParams().TRANSPARENT,
                "DPI": typeof dpi === "number" ? dpi : store.state.Modules.Print.dpiForPdf
            }
        };

        if (store.state.Modules.Print.printService === "plotservice") {
            mapObject.title = layer.get("name");
        }
        if (!source.getParams().SINGLETILE) {
            mapObject.tileSize = [source.getParams().WIDTH, source.getParams().HEIGHT];
        }
        if (Object.prototype.hasOwnProperty.call(source.getParams(), "SLD_BODY") && source.getParams().SLD_BODY !== undefined) {
            mapObject.customParams.SLD_BODY = source.getParams().SLD_BODY;
            mapObject.styles = ["style"];
        }
        return mapObject;
    },
    /**
     * Returns image wms layer information
     * @param {ol.layer.Image} layer - image layer with image wms source
     * @param {Number} [dpi] The dpi to use instead of the dpi from store.
     * @returns {Object} - wms layer spec
     */
    buildImageWms: function (layer, dpi) {
        const source = layer.getSource(),
            mapObject = {
                baseURL: source.getUrl(),
                opacity: layer.getOpacity(),
                type: "WMS"
            };

        if (source instanceof StaticImageSource) {
            mapObject.type = "image";
            mapObject.extent = source.getImageExtent();
        }
        else {
            mapObject.layers = source.getParams().LAYERS.split(",");
            mapObject.styles = source.getParams().STYLES ? source.getParams().STYLES.split(",") : undefined;
            mapObject.imageFormat = source.getParams().FORMAT;
            mapObject.customParams = {
                "TRANSPARENT": source.getParams().TRANSPARENT,
                "DPI": typeof dpi === "number" ? dpi : store.state.Modules.Print.dpiForPdf
            };
            if (source.getParams().VERSION) {
                mapObject.version = source.getParams().VERSION;
            }
        }

        if (store.state.Modules.Print.printService === "plotservice") {
            mapObject.title = layer.get("name");
        }

        return mapObject;
    },
    /**
     * returns vector layer information
     * @param {ol.layer.Vector} layer vector layer with vector source
     * @param {ol.feature[]} features vectorfeatures
     * @param {ol.extent} extent  Extent uses to filter the feature by extent.
     * @returns {Object} - geojson layer spec
     */
    buildVector: function (layer, features, extent) {
        const geojsonList = [];

        return {
            type: "geojson",
            style: this.buildStyle(layer, features, geojsonList, extent),
            geojson: geojsonList
        };
    },
    /**
     * Generates the style for mapfish print.
     * @param {ol.layer} layer ol-Layer with features.
     * @param {ol.feature[]} features Array of features.
     * @param {Object[]} geojsonList Array of geojsons.
     * @param {ol.extent} extent  Extent uses to filter the feature by extent.
     * @returns {Object} - style for mapfish print.
     */
    buildStyle: function (layer, features, geojsonList, extent) {
        const mapfishStyleObject = {
                "version": "2"
            },
            layersToNotReverse = ["measureLayer", "importDrawLayer"],
            featuresInExtent = layer.getSource() ? layer.getSource().getFeaturesInExtent(extent) : features;

        if (!layersToNotReverse.includes(layer.values_.id)) {
            features.reverse();
        }
        features.forEach(feature => {
            const foundFeature = featuresInExtent.find(featureInExtent => featureInExtent.ol_uid === feature.ol_uid),
                styles = this.getFeatureStyle(feature, layer),
                styleAttributes = this.getStyleAttributes(layer, feature);

            if (!foundFeature) {
                return;
            }

            let clonedFeature,
                stylingRules,
                stylingRulesSplit,
                styleObject,
                geometryType,
                styleGeometryFunction;

            styles.forEach((style, index) => {
                if (style !== null) {
                    const styleObjectFromStyleList = styleList.returnStyleObject(layer.get("styleId"));
                    let limiter = ",",
                        styleFromStyleList = styleObjectFromStyleList ? createStyle.getGeometryStyle(feature, styleObjectFromStyleList.rules, false, Config.wfsImgPath) : undefined;

                    if (Array.isArray(styleFromStyleList)) {
                        styleFromStyleList = styleFromStyleList[0];
                    }
                    clonedFeature = feature.clone();
                    styleAttributes.forEach(attribute => {
                        const singleFeature = clonedFeature.get("features") ? clonedFeature.get("features")[0] : clonedFeature;

                        if (attribute.includes("Datastreams")) {
                            clonedFeature.set(attribute, attribute === "default" && !singleFeature.get(attribute) ? "style" : `${singleFeature.getProperties().Datastreams[0].Observations[0].result}_${index}`);
                        }
                        else if (style.type && style.type === "CIRCLESEGMENTS") {
                            clonedFeature.setId(`${feature.ol_uid}__${index}`);
                            clonedFeature.set(attribute, `${style.type}_${style.scalingAttribute.replace(" | ", "_")}_${index}`);
                        }
                        else if (style.type && style.type === "imageStyle") {
                            clonedFeature.setId(`${feature.ol_uid}__${index}`);
                            clonedFeature.set(attribute, `${style.type}_${index}`);
                        }
                        else {
                            clonedFeature.set(attribute, attribute === "default" && !singleFeature.get(attribute) ? "style" : `${singleFeature.get(attribute)}_${index}`);
                        }
                        clonedFeature.ol_uid = feature.ol_uid;
                    });
                    geometryType = feature.getGeometry().getType();

                    // if an icon is shown, apply style offsets to geometry
                    if (geometryType === "Point" && style.getImage() instanceof Icon && style.getImage().getScale() > 0) {
                        const coords = clonedFeature.getGeometry().getCoordinates(),
                            offsetStyle = styleObjectFromStyleList?.rules?.find(({style: {imageOffsetX, imageOffsetY}}) => imageOffsetX || imageOffsetY)?.style,
                            [posX, posY] = mapCollection.getMap("2D").getPixelFromCoordinate(coords),
                            [offsetX, offsetY] = [offsetStyle?.imageOffsetX ?? 0, offsetStyle?.imageOffsetY ?? 0],
                            mapScaleFactor = store.state.Modules.Print.currentScale / store.state.Modules.Print.currentMapScale,
                            transformedCoords = mapCollection.getMap("2D").getCoordinateFromPixel([posX - offsetX * mapScaleFactor, posY - offsetY * mapScaleFactor, 0]);

                        clonedFeature.getGeometry().setCoordinates(transformedCoords);
                    }

                    // if style has geometryFunction, take geometry from style Function
                    styleGeometryFunction = style.getGeometryFunction();
                    if (styleGeometryFunction !== null && styleGeometryFunction !== undefined) {
                        clonedFeature.setGeometry(styleGeometryFunction(clonedFeature));
                        geometryType = styleGeometryFunction(clonedFeature).getType();
                        if (geometryType === "Polygon") {
                            this.checkPolygon(clonedFeature);
                        }
                    }
                    stylingRules = this.getStylingRules(layer, clonedFeature, styleAttributes, style);
                    if (styleFromStyleList !== undefined && styleFromStyleList.attributes?.labelField && styleFromStyleList.attributes?.labelField.length > 0) {
                        stylingRules = stylingRules.replaceAll(limiter, " AND ");
                        limiter = " AND ";
                    }
                    stylingRulesSplit = stylingRules
                        .replaceAll("[", "")
                        .replaceAll("]", "")
                        .replaceAll("*", "")
                        .split(limiter)
                        .map(rule => rule.split("="));

                    if (Array.isArray(stylingRulesSplit) && stylingRulesSplit.length) {
                        this.unsetStringPropertiesOfFeature(clonedFeature,
                            stylingRulesSplit.reduce((accumulator, current) => Array.isArray(current) && current.length
                                ? [...accumulator, current[0]]
                                : accumulator,
                            [])
                        );
                    }
                    this.addFeatureToGeoJsonList(clonedFeature, geojsonList, style);

                    // do nothing if we already have a style object for this CQL rule
                    if (Object.prototype.hasOwnProperty.call(mapfishStyleObject, stylingRules)) {
                        return;
                    }

                    styleObject = {
                        symbolizers: []
                    };
                    if (geometryType === "Point" || geometryType === "MultiPoint") {
                        if (style.getImage() !== null || style.getText() !== null) {
                            styleObject.symbolizers.push(this.buildPointStyle(style, layer));
                        }
                    }
                    else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
                        styleObject.symbolizers.push(this.buildPolygonStyle(style, layer));
                    }
                    else if (geometryType === "Circle") {
                        styleObject.symbolizers.push(this.buildPolygonStyle(style, layer));
                    }
                    else if (geometryType === "LineString" || geometryType === "MultiLineString") {
                        if (layer.values_.id === "measureLayer" && style.stroke_ === null) {
                            return;
                        }
                        styleObject.symbolizers.push(this.buildLineStringStyle(style, layer));
                    }
                    // label styling
                    if (style.getText() !== null && style.getText() !== undefined) {
                        styleObject.symbolizers.push(this.buildTextStyle(style.getText()));
                    }
                    if (stylingRules.includes("@Datastreams")) {
                        const newKey = stylingRules.replaceAll("@", "").replaceAll(".", "");

                        stylingRules = newKey;
                    }

                    mapfishStyleObject[stylingRules] = styleObject;
                }
            });
        });
        return mapfishStyleObject;
    },
    /**
     * @param {ol.Feature} feature -
     * @param {ol.layer.Vector} layer -
     * @returns {ol.style.Style[]} returns or an array of styles
     */
    getFeatureStyle: function (feature, layer) {
        let styles;

        if (feature.getStyleFunction() !== undefined) {
            try {
                styles = feature.getStyleFunction().call(feature);
            }
            catch (e) {
                styles = feature.getStyleFunction().call(this, feature);
            }
        }
        else {
            styles = layer.getStyleFunction().call(layer, feature);
        }

        return !Array.isArray(styles) ? [styles] : styles;
    },
    /**
     * @param {ol.Layer} layer -
     * @param {ol.feature} feature - the feature of current layer
     * @returns {String[]} the attributes by whose value the feature is styled
     */
    getStyleAttributes: function (layer, feature) {
        const layerId = layer.get("id"),
            styleObject = this.getStyleObject(layer, layerId);
        let styleFields = ["styleId"];

        if (styleObject !== undefined) {
            if (layer.get("styleId")) {
                const featureRules = getRulesForFeature(styleObject, feature);

                styleFields = featureRules?.[0]?.conditions ? Object.keys(featureRules[0].conditions.properties) : ["default"];
            }
            else {
                styleFields = [styleObject.get("styleField")];
            }
        }

        return styleFields;
    },
    /**
     * Gets the style object for the given layer.
     * @param {ol/layer} layer The layer.
     * @param {String} layerId The layer id.
     * @returns {Object} The style object.
     */
    getStyleObject (layer, layerId) {
        const layerModel = layerCollection.getLayerById(layer.get("id"));
        let foundChild;

        if (typeof layerModel?.get === "function") {
            if (layerModel.get("typ") === "GROUP") {
                foundChild = layerModel.get("children").find(child => child.id === layerId);
                if (foundChild) {
                    return styleList.returnStyleObject(foundChild.styleId);
                }
            }
            else {
                return styleList.returnStyleObject(layerModel.get("styleId"));
            }
        }
        return undefined;
    },
    /**
     * The geometry of the feature is checked for not closed linearRing. Used for type Polygon.
     * If it is not closed, the coordinates are adapted.
     * @param {ol.Feature} feature to inspect
     * @returns {ol.Feature} corrected feature, if necessary
     */
    checkPolygon (feature) {
        if (Array.isArray(feature.getGeometry().getCoordinates()[0])) {
            const coordinates = feature.getGeometry().getCoordinates()[0];

            if (coordinates[0][0] !== coordinates[coordinates.length - 1][0] && coordinates[0][1] !== coordinates[coordinates.length - 1][1]) {
                const coords = [];

                coordinates.forEach(coord => {
                    coords.push(coord);
                });
                feature.getGeometry().setCoordinates(coords);
            }

        }
        return feature;
    },
    /**
     * Returns the rules for styling of a feature
     *
     * @param {ol.Feature} layer -
     * @param {ol.Feature} feature -
     * @param {String[]} styleAttributes The attribute by whose value the feature is styled.
     * @param {ol.style.Style} style style
     * @param {Number} styleIndex The style index.
     * @returns {String} an ECQL Expression
     */
    getStylingRules: function (layer, feature, styleAttributes, style, styleIndex) {
        const styleAttr = feature.get("styleId") ? "styleId" : styleAttributes,
            styleObjectFromStyleList = styleList.returnStyleObject(layer.get("styleId")),
            styleFromStyleList = styleObjectFromStyleList ? createStyle.getGeometryStyle(feature, styleObjectFromStyleList.rules, false, Config.wfsImgPath) : undefined;

        if (styleAttr.length === 1 && styleAttr[0] === "") {
            if (feature.get("features") && feature.get("features").length === 1) {
                const singleFeature = new Feature({
                    properties: feature.get("features")[0].getProperties(),
                    geometry: feature.get("features")[0].getGeometry()
                });

                feature.get("features")[0] = singleFeature;
                if (style.getImage().getSrc().indexOf("data:image/svg+xml;charset=utf-8") === 0) {
                    singleFeature.setId("first_svg_" + singleFeature.ol_uid);
                }
                else {
                    singleFeature.setId("second_png_" + singleFeature.ol_uid);
                }
                singleFeature.set(singleFeature.getId(), String(feature.get("features").length));
                return "[" + singleFeature.getId() + "='" + String(feature.get("features").length) + "']";

            }
            if (feature.get("features") !== undefined) {
                if (style !== undefined && style.getText().getText() !== undefined) {
                    feature.set("sensorClusterStyle", feature.get("features")[0].ol_uid + "_" + String(style.getText().getText()));
                    return "[sensorClusterStyle='" + feature.get("features")[0].ol_uid + "_" + String(style.getText().getText()) + "']";
                }
            }
            if (this.getFeatureStyle(feature, layer).length > 1) {
                if (style.getImage().getSrc().indexOf("data:image/svg+xml;charset=utf-8") === 0) {
                    feature.setId("first_svg_" + feature.ol_uid);
                }
                else {
                    feature.setId("second_png_" + feature.ol_uid);
                }
                Object.keys(feature.getProperties()).forEach(property => {
                    if (property === "") {
                        feature.unset(property);
                    }
                });
                feature.set(feature.getId(), String(styleIndex));
                return "[" + feature.getId() + "='" + String(styleIndex) + "']";
            }
            return "*";
        }
        // cluster feature with geometry style
        if (feature.get("features") !== undefined) {
            if ((style !== undefined && style?.getText()?.getText() !== undefined) || feature.get("features").length > 1) {
                const value = feature.get("features")[0].get(styleAttr[0])
                    + "_"
                    + style !== undefined && style.getText()?.getText() !== undefined ? style.getText()?.getText() : "cluster";

                feature.set(styleAttr[0], value);
                return `[${styleAttr[0]}='${value}']`;
            }
            else if (style?.type) {
                const value = feature.get("default");

                return `[${styleAttr[0]}='${value}']`;
            }

            // Current feature is not clustered but a single feature in a clustered layer
            return styleAttr.reduce((acc, curr) => {
                const value = feature.get("features")[0].get(curr) === undefined ? "*" : feature.get("features")[0].get(curr);

                feature.set(curr, value);
                return acc + `${curr}='${value}',`;
            }, "[").slice(0, -1) + "]";
        }
        // feature with geometry style and label style
        if (styleFromStyleList !== undefined && styleFromStyleList.attributes.labelField && styleFromStyleList.attributes.labelField.length > 0) {
            const labelField = styleFromStyleList.attributes.labelField;

            return styleAttr.reduce((acc, curr) => acc + `${curr}='${feature.get(curr)}' AND ${labelField}='${feature.get(labelField)}',`, "[").slice(0, -1)
                + "]";
        }
        // feature with geometry style
        if (styleAttr instanceof Array) {
            return styleAttr.reduce((acc, curr) => acc + `${curr}='${feature.get(curr)}',`, "[").slice(0, -1)
            + "]";
        }

        return "[" + styleAttr + "='" + feature.get(styleAttr) + "']";
    },
    /**
     * Unsets all properties of type string of the given feature.
     * @param {ol.Feature} feature to unset properties of type string at
     * @param {String} notToUnset key not to unset
     * @returns {void}
     */
    unsetStringPropertiesOfFeature: function (feature, notToUnset) {
        Object.keys(feature.getProperties()).forEach(key => {
            const prop = feature.getProperties()[key];

            if (!notToUnset.includes(key) && typeof prop === "string") {
                feature.unset(key, {silent: true});
            }
        });
    },
    /**
     * adds the feature to the geojson list
     * @param {ol.FeaturebuildPointStyle} feature - the feature can be clustered
     * @param {GeoJSON[]} geojsonList -
     * @param {ol.style.Style[]} style - the feature-style
     * @returns {void}
     */
    addFeatureToGeoJsonList: function (feature, geojsonList, style) {
        let convertedFeature;

        if (feature.get("features") && feature.get("features").length === 1) {
            feature.get("features").forEach((clusteredFeature) => {
                if (feature.getKeys().find(element => element === "default")) {
                    clusteredFeature.setProperties({"default": feature.get("default")});
                    clusteredFeature.setId(feature.getId());
                }
                convertedFeature = this.convertFeatureToGeoJson(clusteredFeature, style);

                if (convertedFeature) {
                    geojsonList.push(convertedFeature);
                }
            });
        }
        else {
            convertedFeature = this.convertFeatureToGeoJson(feature, style);

            if (convertedFeature) {
                geojsonList.push(convertedFeature);
            }
        }
    },
    /**
     * converts an openlayers feature to a GeoJSON feature object
     * @param {ol.Feature} feature - the feature to convert
     * @param {ol.style.Style[]} style - the feature-style
     * @returns {Object} GeoJSON object
     */
    convertFeatureToGeoJson: function (feature, style) {
        const clonedFeature = feature.clone(),
            geojsonFormat = new GeoJSON(),
            labelText = style.getText()?.getText() || "";
        let convertedFeature;

        // remove all object and array properties except geometry. Otherwise mapfish runs into an error
        Object.keys(clonedFeature.getProperties()).forEach(property => {
            if (isObject(clonedFeature.get(property)) && !(clonedFeature.get(property) instanceof Geometry) || Array.isArray(clonedFeature.get(property))) {
                clonedFeature.unset(property);
            }
        });

        // take over id from feature because the feature id is not set in the clone.
        clonedFeature.setId(clonedFeature.ol_uid);
        // set "_label"-Propterty.
        // This is necessary because the *label* of the *text-Style* (buildTextStyle()) now referrs to it.
        clonedFeature.set("_label", labelText);
        // circle is not suppported by geojson
        if (clonedFeature.getGeometry().getType() === "Circle") {
            clonedFeature.setGeometry(fromCircle(clonedFeature.getGeometry(), 100));
        }
        Object.keys(clonedFeature.getProperties()).filter(key => {
            if (key.includes("@Datastreams")) {
                const newKey = key.replaceAll("@", "").replaceAll(".", "");

                clonedFeature.set(newKey, clonedFeature.getProperties()[key]);
                clonedFeature.unset(key, {silent: true});
            }
            return false;
        });
        // Removing "Datastreams" attribute because it might overload the server as happened for some sensors.
        clonedFeature.unset("Datastreams", {silent: true});

        convertedFeature = geojsonFormat.writeFeatureObject(clonedFeature);
        if (clonedFeature.getGeometry().getCoordinates().length === 0) {
            convertedFeature = undefined;
        }
        // if its a cluster remove property features
        if (convertedFeature?.properties && Object.prototype.hasOwnProperty.call(convertedFeature.properties, "features")) {
            delete convertedFeature.properties.features;
        }
        return convertedFeature;
    },
    /**
     * Generates the point Style
     * @param {ol.style} style Style of layer.
     * @param {ol.layer} layer Ol-layer.
     * @returns {Object} - Point Style for mapfish print.
     */
    buildPointStyle: function (style, layer) {
        if (style.getImage() instanceof CircleStyle) {
            return this.buildPointStyleCircle(style.getImage());
        }
        else if (style.getImage() instanceof Icon && style.getImage().getScale() > 0) {
            return this.buildPointStyleIcon(style.getImage(), layer);
        }
        return this.buildTextStyle(style.getText());
    },
    /**
     * Generates the point Style for circle style
     * @param {ol.style} style Style of layer.
     * @returns {Object} - Circle Style for mapfish print.
     */
    buildPointStyleCircle: function (style) {
        const fillStyle = style.getFill(),
            strokeStyle = style.getStroke(),
            obj = {
                type: "point",
                pointRadius: style.getRadius()
            };

        if (fillStyle !== null) {
            this.buildFillStyle(fillStyle, obj);
            this.buildStrokeStyle(fillStyle, obj);
        }
        if (strokeStyle !== null) {
            this.buildStrokeStyle(strokeStyle, obj);
        }
        return obj;
    },
    /**
     * Generates the Fill Style
     * @param {ol.style} style Style of layer.
     * @param {Object} obj current style object .
     * @returns {Object} - Fill Style for mapfish print.
     */
    buildFillStyle: function (style, obj) {
        let fillColor = style.getColor();

        if (fillColor instanceof CanvasPattern) {
            fillColor = [0, 0, 0, 0];
        }

        obj.fillColor = convertColor(fillColor, "hex");
        obj.fillOpacity = fillColor[3];

        return obj;
    },
    /**
     * Generates the Stroke Style
     * @param {ol.style} style Style of layer.
     * @param {Object} obj Style object for mapfish print.
     * @returns {Object} - LineString Style for mapfish print.
     */
    buildStrokeStyle: function (style, obj) {
        const strokeColor = style.getColor();

        obj.strokeColor = convertColor(strokeColor, "hex");
        if (Array.isArray(strokeColor) && strokeColor[3] !== undefined) {
            obj.strokeOpacity = strokeColor[3];
        }
        if (typeof style.getWidth === "function" && style.getWidth() !== undefined) {
            obj.strokeWidth = style.getWidth();
        }
        if (typeof style.getLineDash === "function" && style.getLineDash()) {
            obj.strokeLinecap = style.getLineCap();
            if (style.getLineDash().length > 1) {
                obj.strokeDashstyle = style.getLineDash().join(" ");
            }
            else {
                obj.strokeDashstyle = style.getLineDash()[0] + " " + style.getLineDash()[0];
            }

            obj.strokeDashOffset = style.getLineDashOffset();
        }

        return obj;
    },
    /**
     * Generates the point Style for icons
     * @param {ol.style} style Style of layer.
     * @param {ol.layer} layer Ol-layer.
     * @returns {Object} - Icon Style for mapfish print.
     */
    buildPointStyleIcon: function (style, layer) {
        return {
            type: "point",
            graphicWidth: style.getSize()[0] ? style.getSize()[0] * style.getScale() : 60,
            graphicHeight: style.getSize()[1] ? style.getSize()[1] * style.getScale() : 60,
            externalGraphic: this.buildGraphicPath(style.getSrc()),
            graphicOpacity: layer.getOpacity()
        };
    },
    /**
     * derives the url of the image from the server the app is running on
     * if the app is running on localhost the images from test.geoportal-hamburg.de are used
     * @param {Object} src the image source
     * @return {String} path or url to image directory
     */
    buildGraphicPath: function (src) {
        const origin = window.location.origin;
        let url = Config.wfsImgPath + this.getImageName(src);

        if (src.indexOf("http") === 0 && src.indexOf("localhost") === -1) {
            url = src;
        }
        else if (src.charAt(0) === "/") {
            url = origin + src;
        }
        else if (src.indexOf("../") === 0 || src.indexOf("./") === 0) {
            url = new URL(src, window.location.href).href;
        }
        else if (src.indexOf("data:image/svg+xml;charset=utf-8") === 0) {
            url = src;
        }
        else if (origin.indexOf("localhost") === -1) {
            // backwards-compatibility:
            url = origin + "/lgv-config/img/" + this.getImageName(src);
        }

        return url;
    },
    /**
     * Returns the image name of the src url.
     * @param {String} imageSrc Url of image source
     * @returns {String} - Image name.
     */
    getImageName: function (imageSrc) {
        const start = imageSrc.lastIndexOf("/");

        return imageSrc.indexOf("/") !== -1 ? imageSrc.substring(start + 1) : "/" + imageSrc;
    },
    /**
     * Generates the text Style
     * @param {ol.style} style Style of layer.
     * @see https://openlayers.org/en/latest/apidoc/module-ol_style_Text.html
     * @returns {Object} - Text Style for mapfish print.
     */
    buildTextStyle: function (style) {
        // use openlayers kml default font, if not set
        const font = style.getFont() ? style.getFont() : "bold 16px Helvetica",
            size = this.getFontSize(font),
            isFontSizeInFont = size !== null,
            textScale = style.getScale() ? style.getScale() : 1,
            fontSize = isFontSizeInFont ? size : 10 * textScale,
            fontFamily = isFontSizeInFont ? this.getFontFamily(font, fontSize) : font,
            fontColor = style.getFill().getColor(),
            stroke = style.getStroke() ? style.getStroke() : undefined;

        return {
            type: "text",
            // tell MapFish that each feature has a property "_label" which contains the label-string
            // it is necessary to "add/fill" the "_label"-property when we call convertFeatureToGeoJson()
            // before we add it to the geoJSONList
            label: "[_label]",
            fontColor: convertColor(fontColor, "hex"),
            fontOpacity: fontColor[0] !== "#" ? fontColor[3] : 1,
            labelOutlineColor: stroke ? convertColor(stroke.getColor(), "hex") : undefined,
            labelOutlineWidth: stroke ? stroke.getWidth() : undefined,
            labelXOffset: style.getOffsetX(),
            labelYOffset: -style.getOffsetY(),
            fontSize: fontSize,
            fontFamily: fontFamily,
            labelAlign: this.getLabelAlign(style)
        };
    },
    /**
     * Inspects the given fontDef for numbers (=size).
     * @param {String} fontDef the defined font
     * @returns {String} the font-size or null if not contained
     */
    getFontSize: function (fontDef) {
        const size = fontDef ? fontDef.match(/\d/g) : null;

        if (Array.isArray(size) && size.length > 0) {
            return size.join("");
        }
        return null;
    },
    /**
     * Inspects the given fontDef for family.
     * @param {String} fontDef the defined font
     * @param {String} fontSize the size incuding in the font
     * @returns {String} the font-family or an empty String if not contained
     */
    getFontFamily: function (fontDef, fontSize) {
        const index = fontDef ? fontDef.indexOf(" ", fontDef.indexOf(fontSize)) : -1;

        if (index > -1) {
            return fontDef.substring(index + 1);
        }
        return "";
    },
    /**
     * gets the indicator of how to align the text with respect to the geometry.
     * this property must have 2 characters, the x-align and the y-align.
     * @param {ol.style} style Style of layer.
     * @returns {String} - placement indicator
     */
    getLabelAlign: function (style) {
        const textAlign = style.getTextAlign();

        if (textAlign === "left") {
            // left bottom
            return "lb";
        }
        else if (textAlign === "right") {
            // right bottom
            return "rb";
        }
        else if (textAlign === "center") {
            // center middle
            return "cm";
        }
        // center bottom
        return "cb";
    },
    /**
     * Generates the polygon Style
     * @param {ol.style} style Style of layer.
     * @param {ol.layer} layer Ol-layer.
     * @returns {Object} - Polygon Style for mapfish print.
     */
    buildPolygonStyle: function (style, layer) {
        const fillStyle = style.getFill(),
            strokeStyle = style.getStroke(),
            obj = {
                type: "polygon",
                fillOpacity: layer.getOpacity(),
                strokeOpacity: layer.getOpacity()
            };

        if (fillStyle !== null) {
            this.buildFillStyle(fillStyle, obj);
        }
        if (strokeStyle !== null) {
            this.buildStrokeStyle(strokeStyle, obj);
        }
        return obj;
    },
    /**
     * Generates the LineString Style
     * @param {ol.style} style Style of layer.
     * @param {ol.layer} layer Ol-layer.
     * @returns {Object} - LineString Style for mapfish print.
     */
    buildLineStringStyle: function (style, layer) {
        const strokeStyle = style.getStroke(),
            obj = {
                type: "line",
                strokeOpacity: layer.getOpacity()
            };

        if (strokeStyle !== null) {
            this.buildStrokeStyle(strokeStyle, obj);
        }
        return obj;
    },
    /**
     * gets array with [GfiContent, layername, coordinates] of actual gfi
     * empty array if gfi is not active.
     * coordinates not needed, yet.
     * @param {Boolean} isGfiSelected flag if gfi has to be printed
     * @param  {Array} gfiArray array
     * @return {void}
     */
    buildGfi: function (isGfiSelected, gfiArray) {
        const gfiObject = {};
        let gfiAttributes,
            layerName;

        if (isGfiSelected) {
            if (gfiArray.length > 0) {
                gfiObject.layers = [];
                gfiAttributes = gfiArray[0];
                layerName = gfiArray[1];

                gfiObject.layers.push({
                    layerName: layerName.startsWith("common:") ? i18next.t(layerName) : layerName,
                    values: this.prepareGfiAttributes(gfiAttributes)
                });

            }
            this.addGfiFeature(this.defaults.attributes.map.layers, gfiArray[2]);
        }
        this.setShowGfi(isGfiSelected);
        this.setGfi(gfiObject);
    },
    /**
     * @param {Object[]} layers - layers attribute of the map spec
     * @param {Number[]} coordinates - the coordinates of the gfi
     * @returns {void}
     */
    addGfiFeature: function (layers, coordinates) {
        const geojsonFormat = new GeoJSON(),
            gfiFeature = new Feature({
                geometry: new Point(coordinates),
                name: "GFI Point"
            });

        layers.splice(0, 0, {
            type: "geojson",
            geojson: [geojsonFormat.writeFeatureObject(gfiFeature)],
            style: {
                version: "2",
                "[name='GFI Point']": {
                    symbolizers: [{
                        fillOpacity: 0,
                        pointRadius: 18,
                        strokeColor: "#e10019",
                        strokeWidth: 3,
                        type: "point"
                    },
                    {
                        fillColor: "#e10019",
                        pointRadius: 4,
                        strokeOpacity: 0,
                        type: "point"
                    }]
                }
            }
        });
    },
    /**
     * parses gfiAttributes object with key value pairs into array[objects] with attributes key and value
     * @param  {Object} gfiAttributes gfi Mapping attributes
     * @return {Object[]} parsed array[objects] with key- and value attributes
     */
    prepareGfiAttributes: function (gfiAttributes) {
        const valuesArray = [];
        let key;

        for (key in gfiAttributes) {
            valuesArray.push({
                key: key,
                value: gfiAttributes[key]
            });
        }

        return valuesArray;
    },
    /**
     * Gets legend from legend vue store and builds legend object for mapfish print
     * The legend is only print if the related layer is visible.
     * @param {Boolean} isLegendSelected flag if legend has to be printed
     * @param {Boolean} isMetaDataAvailable flag to print metadata
     * @param {Function} getResponse the function that calls the axios request
     * @param {Number} index The print index.
     * @param {Object} legends the available legends
     * @return {void}
     */
    buildLegend: function (isLegendSelected, isMetaDataAvailable, getResponse, index) {
        const legendObject = {},
            metaDataLayerList = [],
            legends = store.getters["Modules/Legend/legends"];

        if (isLegendSelected && legends.length > 0) {
            legendObject.layers = [];
            legends.forEach(legendObj => {
                if (layerCollection.getLayerById(legendObj.id).get("children")?.length > 0) {
                    legendObj.id = layerCollection.getLayerById(legendObj.id).get("children")[0].id;
                }

                if (this.defaults.visibleLayerIds.includes(legendObj.id)) {
                    const legendContainsPdf = this.legendContainsPdf(legendObj.legend);

                    if (isMetaDataAvailable) {
                        metaDataLayerList.push(legendObj.name);
                    }
                    if (legendContainsPdf) {
                        store.dispatch("Alerting/addSingleAlert", {
                            category: "info",
                            content: "<b>The layer \"" + legendObj.name + "\" contains a pre-defined Legend. " +
                            "This legens cannot be added to the print.</b><br>" +
                            "You can download the pre-defined legend from the download menu seperately.",
                            displayClass: "info",
                            kategorie: "alert-info"
                        });
                    }
                    else {
                        legendObject.layers.push({
                            layerName: legendObj.name,
                            values: this.prepareLegendAttributes(legendObj.legend, store.getters["Modules/Legend/sldVersion"])
                        });
                    }
                }
            });
        }
        this.setShowLegend(isLegendSelected);
        this.setLegend(legendObject);
        if (isMetaDataAvailable && metaDataLayerList.length > 0) {
            metaDataLayerList.forEach((layerName) => {
                this.getMetaData(layerName, getResponse, index);
            });
        }
        else {
            const printJob = {
                index,
                payload: this.defaults,
                getResponse: getResponse
            };

            store.dispatch("Modules/Print/createPrintJob", printJob);
        }
    },
    /**
     * Checks if the legend url is a pdf.
     * @param {String} legend contains the legend url
     * @return {Boolean} true if legend url ends with pdf
     */
    legendContainsPdf: function (legend) {
        return legend.some(legendPart => {
            let isPdf = false;

            if (typeof legendPart === "object" && !Array.isArray(legendPart.graphic)) {
                isPdf = legendPart.graphic.endsWith(".pdf");
            }
            else if (typeof legendPart === "object" && Array.isArray(legendPart.graphic)) {
                return isPdf;
            }
            else {
                isPdf = legendPart.endsWith(".pdf");
            }
            return isPdf;
        });
    },
    /**
     * Prepares Attributes for legend in mapfish-print template
     * @param {Object} legend Legend of layer.
     * @param {String} sldVersion sld version for GetLegendGraphic Requests
     * @returns {Object[]} - prepared legend attributes.
     */
    prepareLegendAttributes: function (legend, sldVersion = "") {
        const valuesArray = [];

        legend.forEach(legendPart => {
            const legendObj = {
                    legendType: "",
                    geometryType: "",
                    imageUrl: "",
                    color: "",
                    label: legendPart.name
                },
                graphic = typeof legendPart === "object" ? legendPart.graphic : legendPart;

            if (Array.isArray(graphic)) {
                graphic.forEach(graphicPart => {
                    if (graphicPart.indexOf("svg") !== -1) {
                        legendObj.svg = decodeURIComponent(graphicPart).split("data:image/svg+xml;charset=utf-8,")[1];
                    }
                    else {
                        legendObj.imageUrl = graphicPart;
                    }
                });
                legendObj.legendType = "svgAndPng";
            }
            else if (graphic.indexOf("<svg") !== -1) {
                legendObj.color = this.getFillColorFromSVG(graphic);
                this.getFillStrokeFromSVG(graphic, legendObj);
                legendObj.legendType = "geometry";
                legendObj.geometryType = this.getGeometryTypeFromSVG(graphic);
            }
            else if (graphic.toUpperCase().includes("GETLEGENDGRAPHIC")) {
                legendObj.legendType = "wmsGetLegendGraphic";
                legendObj.imageUrl = graphic + (sldVersion ? "&sld_version=" + sldVersion : "");
            }
            else {
                legendObj.legendType = "wfsImage";
                legendObj.imageUrl = this.buildGraphicPath(graphic);
            }
            if (typeof legendObj.color !== "undefined") {
                valuesArray.push(legendObj);
            }
        });

        return [].concat(...valuesArray);
    },
    /**
     * Requests the metadata for given layer name
     * @param {String} layerName name of current layer
     * @param {Function} getResponse the function to start axios request
     * @param {Number} index The print index
     * @returns {void}
     */
    getMetaData: function (layerName, getResponse, index) {
        const metadataLayer = layerCollection.find(layer => layer.attributes.name === layerName),
            metaId = metadataLayer.datasets && metadataLayer.datasets[0] ? metadataLayer.datasets[0].md_id : null,
            uniqueIdRes = uniqueId(),
            cswObj = {};

        if (metaId !== null) {
            this.defaults.uniqueIdList.push(uniqueIdRes);
            cswObj.layerName = layerName;
            cswObj.metaId = metaId;
            cswObj.keyList = ["date", "orgaOwner", "address", "email", "tel", "url"];
            cswObj.uniqueId = uniqueIdRes;
            cswObj.layer = metadataLayer;
            cswObj.getResponse = getResponse;
            cswObj.index = index;

            store.dispatch("Modules/Print/getMetaDataForPrint", cswObj);
        }
    },
    /**
     * Creates the scale string.
     * @param {String} scale Scale of map.
     * @returns {void}
     */
    buildScale: function (scale) {
        const scaleText = "1:" + scale;

        this.setScale(scaleText);
    },
    /**
     * Setter for Metadata
     * @param {String} value Value
     * @returns {void}
     */
    setMetadata: function (value) {
        this.defaults.attributes.metadata = value;
    },
    /**
     * Setter for showLegend
     * @param {Boolean} value Value
     * @returns {void}
     */
    setShowLegend: function (value) {
        this.defaults.attributes.showLegend = value;
    },
    /**
     * Setter for Legend
     * @param {String} value Value
     * @returns {void}
     */
    setLegend: function (value) {
        this.defaults.attributes.legend = value;
    },

    /**
     * Setter for showGfi
     * @param {Boolean} value Value
     * @returns {void}
     */
    setShowGfi: function (value) {
        this.defaults.attributes.showGfi = value;
    },
    /**
     * Setter for gfi
     * @param {String} value Value
     * @returns {void}
     */
    setGfi: function (value) {
        this.defaults.attributes.gfi = value;
    },
    /**
     * Setter for scale
     * @param {String} value Value
     * @returns {void}
     */
    setScale: function (value) {
        this.defaults.attributes.scale = value;
    },
    /**
     * Setter for uniqueIdList
     * @param {String} value Value
     * @returns {void}
     */
    setUniqueIdList: function (value) {
        this.defaults.uniqueIdList = value;
    },
    /**
     * Setter for visibleLayerIds
     * @param {String} value visibleLayerIds
     * @returns {void}
     */
    setVisibleLayerIds: function (value) {
        this.defaults.visibleLayerIds = value;
    },
    /**
     * Returns geometry type from SVG.
     * @param {String} svgString String of SVG.
     * @returns {String} - The geometry type.
     */
    getGeometryTypeFromSVG: function (svgString) {
        let geometryType = "";

        if (svgString.includes("<circle")) {
            geometryType = "point";
        }
        if (svgString.includes("<polygon")) {
            geometryType = "polygon";
        }
        return geometryType;
    },
    /**
     * Returns Fill color from SVG as hex.
     * @param {String} svgString String of SVG.
     * @returns {String} - Fill color from SVG.
     * @returns {String} - Fill color from SVG.
     */
    getFillColorFromSVG: function (svgString) {
        let color = "";

        if (svgString.split(/fill:(.+)/)[1] || svgString.split("fill='")[1]) {
            color = svgString.split(/fill:(.+)/)[1]?.split(/;(.+)/)[0] || svgString.split("fill='")[1]?.split("'")[0];
        }
        if (color.startsWith("rgb(") && (svgString.split(/fill-opacity:(.+)/)[1]?.split(/;(.+)/)[0] || svgString.split("fill-opacity='")[1])) {
            color = `rgba(${color.split(")")[0].split("(")[1]}, ${svgString.split(/fill-opacity:(.+)/)[1]?.split(/;(.+)/)[0] || svgString.split(/fill-opacity=(.+)/)[1]?.split("'")[1]})`;
        }
        return color;
    },
    /**
     * Sest stroke styles to the legenedObj
     * @param {String} svgString String of SVG.
     * @param {Object} legendObj The legend object.
     * @returns {void}
     */
    getFillStrokeFromSVG: function (svgString, legendObj) {
        if (svgString.split(/stroke:(.+)/)[1] || svgString.split("stroke='")[1]) {
            legendObj.strokeColor = svgString.split(/stroke:(.+)/)[1]?.split(/;(.+)/)[0] || svgString.split("stroke='")[1]?.split("'")[0];
        }
        if (legendObj.strokeColor?.startsWith("rgb(") && (svgString.split(/stroke-opacity:(.+)/)[1]?.split(/;(.+)/)[0] || svgString.split("stroke-opacity='")[1]?.split("'")[0])) {
            legendObj.strokeColor = `rgba(${legendObj.strokeColor.split(")")[0].split("(")[1]}, ${svgString.split(/stroke-opacity:(.+)/)[1]?.split(/;(.+)/)[0] || svgString.split(/stroke-opacity=(.+)/)[1]?.split("'")[1]})`;
        }
        if (svgString.split(/stroke-width:(.+)/)[1] || svgString.split("stroke-width='")[1]) {
            legendObj.strokeWidth = svgString.split(/stroke-width:(.+)/)[1]?.split(/;(.+)/)[0] || svgString.split("stroke-width='")[1]?.split("'")[0];
        }
        if (svgString.split(/stroke-dasharray:(.+)/)[1] && !svgString.split(/stroke-dasharray:(.+)/)[1]?.startsWith(";")) {
            legendObj.strokeStyle = "Dashed";
        }
    }
};

export default BuildSpecModel;
