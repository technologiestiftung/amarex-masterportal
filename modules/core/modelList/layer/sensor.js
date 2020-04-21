import Layer from "./model";
import {SensorThingsMqtt} from "./sensorThingsMqtt";
import {SensorThingsHttp} from "./sensorThingsHttp";
import moment from "moment";
import {Cluster, Vector as VectorSource} from "ol/source.js";
import VectorLayer from "ol/layer/Vector.js";
import {buffer, containsExtent} from "ol/extent";
import {GeoJSON} from "ol/format.js";

const SensorLayer = Layer.extend(/** @lends SensorLayer.prototype */{
    defaults: Object.assign({}, Layer.prototype.defaults, {
        supported: ["2D", "3D"],
        epsg: "EPSG:4326",
        utc: "+1",
        version: "1.0",
        useProxyURL: false,
        mqttPath: "/mqtt",
        subscriptionTopics: {},
        httpSubFolder: "",
        mergeThingsByCoordinates: false,
        showNoDataValue: true,
        noDataValue: "no data",
        altitudeMode: "clampToGround",
        isSubscribed: false,
        moveendListener: null,
        loadThingsOnlyInCurrentExtent: false,
        intvLoadingThingsInExtent: 0,
        delayLoadingThingsInExtent: 1000
    }),

    /**
     * @class SensorLayer
     * @extends Layer
     * @memberof Core.ModelList.Layer
     * @constructs
     * @property {String} url the url to initialiy call the SensorThings-API with
     * @property {String} epsg="EPSG:4326" EPSG-Code for incoming sensor geometries.
     * @property {String} utc="+1" UTC-Timezone to calulate correct time.
     * @property {String} version="1.0" Version the SensorThingsAPI is requested.
     * @property {Boolean} useProxyUrl="1.0" Flag if url should be proxied.
     * @fires Core#RadioRequestMapViewGetOptions
     * @fires Core#RadioRequestUtilGetProxyURL
     * @fires Core#RadioTriggerUtilShowLoader
     * @fires Core#RadioTriggerUtilHideLoader
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires VectorStyle#RadioRequestStyleListReturnModelById
     * @fires GFI#RadioTriggerGFIChangeFeature
     * @fires Core#RadioRequestMapViewGetCurrentExtent
     * @listens Layer#RadioRequestVectorLayerGetFeatures
     * @description This layer type requests its data from the SensorThinsgAPI (STA).
     * The layer reacts to changes of the own features triggered by the STA.
     * The technology used therefore is WebSocketSecure (wss) and the MessageQueuingTelemetryTransport(MQTT)-Protocol.
     * This makes it possible to update vector-data in the application without reloading the entire page.
     * The newest observation data of each attribute is set as follows:
     * name = If "datastream.properties.type" is not undefined, take this. Otherwise take the value in "datastream.unitOfMeasurment.name"
     * The attribute key is "dataStream_[dataStreamId]_[name]".
     * All available dataStreams, their ids, their latest observation and values are separately aggregated and stored (separated by " | ") in the following attributes:
     * dataStreamId, dataStreamName, dataStreamValue, dataStreamPhenomenonTime
     * The "name" and the "description" of each thing are also taken as "properties".
     */
    initialize: function () {
        // set subscriptionTopics as instance variable (!)
        this.setSubscriptionTopics({});
        this.setHttpSubFolder(this.get("url") && String(this.get("url")).split("/").length > 3 ? "/" + String(this.get("url")).split("/").slice(3).join("/") : "");

        this.createMqttConnectionToSensorThings();

        if (!this.get("isChildLayer")) {
            Layer.prototype.initialize.apply(this);
        }

        // change language from moment.js to german
        moment.locale("de");
    },

    /**
     * Start or stop subscription according to its conditions.
     * Because of usage of serveral listeners it's necessary to create a "isSubscribed" flag to prevent multiple executions.
     * @returns {void}
     */
    changedConditions: function () {
        const features = this.get("layer").getSource().getFeatures(),
            state = this.checkConditionsForSubscription();

        if (state === true) {
            this.setIsSubscribed(true);
            if (!this.get("loadThingsOnlyInCurrentExtent") && Array.isArray(features) && !features.length) {
                this.initializeConnection(function () {
                    // call subscriptions
                    this.updateSubscription();
                    // create listener of moveend event
                    this.setMoveendListener(Radio.request("Map", "registerListener", "moveend", this.updateSubscription.bind(this)));
                }.bind(this));
            }
            else {
                // call subscriptions
                this.updateSubscription();
                // create listener of moveend event
                this.setMoveendListener(Radio.request("Map", "registerListener", "moveend", this.updateSubscription.bind(this)));
            }
        }
        else if (state === false) {
            this.setIsSubscribed(false);
            // remove listener of moveend event
            Radio.trigger("Map", "unregisterListener", this.get("moveendListener"));
            this.setMoveendListener(null);
            // remove connection to live update
            this.unsubscribeFromSensorThings();
        }
    },

    /**
     * Check if layer is whithin range and selected to determine if all conditions are fullfilled.
     * @returns {void}
     */
    checkConditionsForSubscription: function () {
        if (this.get("isOutOfRange") === false && this.get("isSelected") === true && this.get("isSubscribed") === false) {
            return true;
        }
        else if ((this.get("isOutOfRange") === true || this.get("isSelected") === false) && this.get("isSubscribed") === true) {
            return false;
        }

        return undefined;
    },

    /**
     * Creates the vectorSource.
     * @returns {void}
     */
    createLayerSource: function () {
        this.setLayerSource(new VectorSource());
        if (this.has("clusterDistance")) {
            this.createClusterLayerSource();
        }
    },

    /**
     * Creates the layer.
     * @listens Core#RadioTriggerMapViewChangedCenter
     * @returns {void}
     */
    createLayer: function () {
        this.setLayer(new VectorLayer({
            source: this.has("clusterDistance") ? this.get("clusterLayerSource") : this.get("layerSource"),
            name: this.get("name"),
            typ: this.get("typ"),
            gfiAttributes: this.get("gfiAttributes"),
            gfiTheme: typeof this.get("gfiTheme") === "object" ? this.get("gfiTheme").name : this.get("gfiTheme"),
            routable: this.get("routable"),
            id: this.get("id"),
            altitudeMode: this.get("altitudeMode")
        }));

        // subscription / unsubscription to mmqt only happens by this change events
        this.listenTo(this, {
            "change:isVisibleInMap": this.changedConditions,
            "change:isOutOfRange": this.changedConditions
        });
    },

    /**
     * Creates ClusterLayerSource.
     * @returns {void}
     */
    createClusterLayerSource: function () {
        this.setClusterLayerSource(new Cluster({
            source: this.get("layerSource"),
            distance: this.get("clusterDistance")
        }));
    },

    /**
     * Initial loading of sensor data function
     * @param {Function} onsuccess a function to call on success
     * @fires Core#RadioRequestUtilGetProxyURL
     * @returns {void}
     */
    initializeConnection: function (onsuccess) {
        const url = this.get("useProxyUrl") ? Radio.request("Util", "getProxyURL", this.get("url")) : this.get("url"),
            version = this.get("version"),
            urlParams = this.get("urlParameter"),
            mergeThingsByCoordinates = this.get("mergeThingsByCoordinates");

        this.loadSensorThings(url, version, urlParams, mergeThingsByCoordinates, function (sensorData) {
            const epsg = this.get("epsg"),
                features = this.createFeatures(sensorData, epsg),
                isClustered = this.has("clusterDistance");

            // Add features to vectorlayer
            if (Array.isArray(features) && features.length) {
                this.get("layerSource").addFeatures(features);
                this.prepareFeaturesFor3D(features);
                Radio.trigger("VectorLayer", "resetFeatures", this.get("id"), features);
            }

            if (features !== undefined) {
                this.styling(isClustered);
                this.get("layer").setStyle(this.get("style"));
            }

            if (typeof onsuccess === "function") {
                onsuccess();
            }
        }.bind(this));
    },

    /**
     * draw points on the map
     * @param  {array} sensorData - sensor with location and properties
     * @param  {Sting} epsg - from Sensortype
     * @return {Ol.Features} feature to draw
     */
    createFeatures: function (sensorData, epsg) {
        let features = [],
            feature;

        if (Array.isArray(sensorData)) {
            sensorData.forEach(function (data, index) {
                if (data.hasOwnProperty("location") && data.location && epsg !== undefined) {
                    feature = this.parseJson(data.location);
                }
                else {
                    return;
                }

                feature.setId(index);
                feature.setProperties(data.properties, true);

                // for a special theme
                if (typeof this.get("gfiTheme") === "object") {
                    feature.set("gfiParams", this.get("gfiTheme").params, true);
                    feature.set("utc", this.get("utc"), true);
                }
                feature = this.aggregateDataStreamValue(feature);
                feature = this.aggregateDataStreamPhenomenonTime(feature);
                features.push(feature);
            }, this);

            // only features with geometry
            features = features.filter(subFeature => subFeature.getGeometry() !== undefined);
        }

        return features;
    },

    /**
     * Aggregates the values and adds them as property "dataStreamValues".
     * @param {ol/feature} feature OL-feature.
     * @returns {ol/feature} - Feature with new attribute "dataStreamValues".
     */
    aggregateDataStreamValue: function (feature) {
        const modifiedFeature = feature,
            dataStreamValues = [];

        if (feature && feature.get("dataStreamId")) {
            feature.get("dataStreamId").split(" | ").forEach((id, i) => {
                const dataStreamName = feature.get("dataStreamName").split(" | ")[i];

                if (this.get("showNoDataValue") && !feature.get("dataStream_" + id + "_" + dataStreamName)) {
                    dataStreamValues.push(this.get("noDataValue"));
                }
                else if (feature.get("dataStream_" + id + "_" + dataStreamName)) {
                    dataStreamValues.push(feature.get("dataStream_" + id + "_" + dataStreamName));
                }
            });
            modifiedFeature.set("dataStreamValue", dataStreamValues.join(" | "), true);
        }
        return modifiedFeature;
    },

    /**
     * Aggregates the phenomenonTimes and adds them as property "dataStreamPhenomenonTime".
     * @param {ol/feature} feature OL-feature.
     * @returns {ol/feature} - Feature with new attribute "dataStreamPhenomenonTime".
     */
    aggregateDataStreamPhenomenonTime: function (feature) {
        const modifiedFeature = feature,
            dataStreamPhenomenonTimes = [];

        if (feature && feature.get("dataStreamId")) {
            feature.get("dataStreamId").split(" | ").forEach((id, i) => {
                const dataStreamName = feature.get("dataStreamName").split(" | ")[i];

                if (this.get("showNoDataValue") && !feature.get("dataStream_" + id + "_" + dataStreamName + "_phenomenonTime")) {
                    dataStreamPhenomenonTimes.push(this.get("noDataValue"));
                }
                else if (feature.get("dataStream_" + id + "_" + dataStreamName + "_phenomenonTime")) {
                    dataStreamPhenomenonTimes.push(feature.get("dataStream_" + id + "_" + dataStreamName + "_phenomenonTime"));
                }
            });
            modifiedFeature.set("dataStreamPhenomenonTime", dataStreamPhenomenonTimes.join(" | "), true);
        }
        return modifiedFeature;
    },
    /**
     * change time zone by given UTC-time
     * @param  {String} phenomenonTime - time of measuring a phenomenon
     * @param  {String} utc - timezone (default +1)
     * @return {String} phenomenonTime converted with UTC
     */
    changeTimeZone: function (phenomenonTime, utc) {
        let utcAlgebraicSign,
            utcNumber,
            utcSub,
            time = "";

        if (phenomenonTime === undefined) {
            return "";
        }
        else if (utc !== undefined && (utc.indexOf("+") !== -1 || utc.indexOf("-") !== -1)) {
            utcAlgebraicSign = utc.substring(0, 1);

            if (utc.length === 2) {
                // check for winter- and summertime
                utcSub = parseInt(utc.substring(1, 2), 10);
                utcSub = moment(phenomenonTime).isDST() ? utcSub + 1 : utcSub;
                utcNumber = "0" + utcSub + "00";
            }
            else if (utc.length > 2) {
                utcSub = parseInt(utc.substring(1, 3), 10);
                utcSub = moment(phenomenonTime).isDST() ? utcSub + 1 : utcSub;
                utcNumber = utc.substring(1, 3) + "00";
            }

            time = moment(phenomenonTime).utcOffset(utcAlgebraicSign + utcNumber).format("DD MMMM YYYY, HH:mm:ss");
        }

        return time;
    },

    /**
     * load SensorThings by
     * @param  {String} url - url to service
     * @param  {String} version - version from service
     * @param  {String} urlParams - url parameters
     * @param  {Boolean} mergeThingsByCoordinates - Flag if things should be merged if they have the same Coordinates
     * @return {array} all things with attributes and location
     * @param  {Function} onsuccess a callback function (result) with the result to call on success and result: all things with attributes and location
     */
    loadSensorThings: function (url, version, urlParams, mergeThingsByCoordinates, onsuccess) {
        const requestUrl = this.buildSensorThingsUrl(url, version, urlParams),
            http = new SensorThingsHttp(),
            currentExtent = {
                extent: Radio.request("MapView", "getCurrentExtent"),
                sourceProjection: Radio.request("MapView", "getProjection").getCode(),
                targetProjection: this.get("epsg")
            },
            /**
             * a function to receive the response of a http call
             * @param {Object} result the response from the http request as array buffer
             * @returns {Void}  -
             */
            httpOnSucess = function (result) {
                // on success
                let allThings;

                allThings = this.flattenArray(result);
                allThings = this.getNewestSensorData(allThings);
                if (mergeThingsByCoordinates) {
                    allThings = this.mergeByCoordinates(allThings);
                }

                allThings = this.aggregatePropertiesOfThings(allThings);

                if (typeof onsuccess === "function") {
                    onsuccess(allThings);
                }
            }.bind(this),
            /**
             * a function to call before calling anything
             * @returns {Void}  -
             */
            httpOnStart = function () {
                // on start
                this.loadSensorThingsStart();
            }.bind(this),
            /**
             * A function that is executed when the http call is completed, regardless of whether there is a success or a failure.
             * @returns {Void}  -
             */
            httpOnComplete = function () {
                // on complete
                this.loadSensorThingsComplete();
            }.bind(this),
            /**
             * a function to call on error
             * @param {Error} error the occuring error
             * @returns {Void}  -
             */
            httpOnError = function (error) {
                // on error
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Unerwarteter Fehler beim Laden der Sensordaten des Layers " +
                        this.get("name") + " aufgetreten</strong>",
                    kategorie: "alert-danger"
                });
                console.warn(error);
            }.bind(this);

        if (!this.get("loadThingsOnlyInCurrentExtent")) {
            http.get(requestUrl, httpOnSucess, httpOnStart, httpOnComplete, httpOnError);
        }
        else {
            http.getInExtent(requestUrl, currentExtent, httpOnSucess, httpOnStart, httpOnComplete, httpOnError);
        }
    },

    /**
     * to call on starting of loadSensorThings
     * @fires Core#RadioTriggerUtilShowLoader
     * @returns {Void}  -
     */
    loadSensorThingsStart: function () {
        Radio.trigger("Util", "showLoader");
    },

    /**
     * to call on ending of loadSensorThings
     * @fires Core#RadioTriggerUtilHideLoader
     * @returns {Void}  -
     */
    loadSensorThingsComplete: function () {
        Radio.trigger("Util", "hideLoader");
    },

    /**
     * Iterates over the dataStreams and creates for each datastream the attributes:
     * "dataStream_[dataStreamId]_[dataStreamName]" and
     * "dataStream_[dataStreamId]_[dataStreamName]_phenomenonTime".
     * @param {Object[]} allThings All things.
     * @returns {Object[]} - All things with the newest observation for each dataStream.
     */
    getNewestSensorData: function (allThings) {
        const allThingsWithSensorData = allThings;

        allThingsWithSensorData.forEach(thing => {
            const dataStreams = thing.Datastreams;

            // A thing may not have properties. So we ensure we can access them.
            if (!thing.hasOwnProperty("properties")) {
                thing.properties = {};
            }

            thing.properties.dataStreamId = [];
            thing.properties.dataStreamName = [];
            dataStreams.forEach(dataStream => {
                const dataStreamId = String(dataStream["@iot.id"]),
                    propertiesType = dataStream.hasOwnProperty("ObservedProperty") && dataStream.ObservedProperty.hasOwnProperty("name") ? dataStream.ObservedProperty.name : undefined,
                    unitOfMeasurementName = dataStream.hasOwnProperty("unitOfMeasurement") && dataStream.unitOfMeasurement.hasOwnProperty("name") ? dataStream.unitOfMeasurement.name : "unknown",
                    dataStreamName = propertiesType ? propertiesType : unitOfMeasurementName,
                    key = "dataStream_" + dataStreamId + "_" + dataStreamName,
                    value = dataStream.hasOwnProperty("Observations") && dataStream.Observations.length > 0 ? dataStream.Observations[0].result : undefined;
                let phenomenonTime = dataStream.hasOwnProperty("Observations") && dataStream.Observations.length > 0 ? dataStream.Observations[0].phenomenonTime : undefined;

                phenomenonTime = this.changeTimeZone(phenomenonTime, this.get("utc"));

                if (this.get("showNoDataValue") && !value) {
                    thing.properties[key] = this.get("noDataValue");
                    thing.properties[key + "_phenomenonTime"] = this.get("noDataValue");
                    thing.properties.dataStreamId.push(dataStreamId);
                    thing.properties.dataStreamName.push(dataStreamName);
                }
                else if (value) {
                    thing.properties[key] = value;
                    thing.properties[key + "_phenomenonTime"] = phenomenonTime;
                    thing.properties.dataStreamId.push(dataStreamId);
                    thing.properties.dataStreamName.push(dataStreamName);
                }
            });
            thing.properties.dataStreamId = thing.properties.dataStreamId.join(" | ");
            thing.properties.dataStreamName = thing.properties.dataStreamName.join(" | ");
        });

        return allThingsWithSensorData;
    },

    /**
     * build SensorThings URL
     * @param  {String} url - url to service
     * @param  {String} version - version from service
     * @param  {String} urlParams - url parameters
     * @return {String} URL to request sensorThings
     */
    buildSensorThingsUrl: function (url, version, urlParams) {
        let query = "",
            versionAsString = version,
            key;

        if (typeof version === "number") {
            versionAsString = version.toFixed(1);
        }

        if (typeof urlParams === "object") {
            for (key in urlParams) {
                if (query !== "") {
                    query += "&";
                }

                if (Array.isArray(urlParams[key])) {
                    if (urlParams[key].length) {
                        query += "$" + key + "=" + urlParams[key].join(",");
                    }
                }
                else {
                    query += "$" + key + "=" + urlParams[key];
                }
            }
        }

        return String(url) + "/v" + String(versionAsString) + "/Things?" + query;
    },

    /**
     * merge things with equal coordinates
     * @param  {array} allThings - contains all loaded Things
     * @return {array} merged things
     */
    mergeByCoordinates: function (allThings) {
        const mergeAllThings = [],
            mergeAllThingsAssoc = {};
        let jsonGeomString;

        if (Array.isArray(allThings)) {
            allThings.forEach(function (thing) {
                // if no datastream exists
                if (!Array.isArray(thing.Datastreams) || !thing.Datastreams.length) {
                    return;
                }

                jsonGeomString = JSON.stringify(this.getJsonGeometry(thing, 0));
                if (!mergeAllThingsAssoc.hasOwnProperty(jsonGeomString)) {
                    mergeAllThingsAssoc[jsonGeomString] = [];
                    mergeAllThings.push(mergeAllThingsAssoc[jsonGeomString]);
                }

                mergeAllThingsAssoc[jsonGeomString].push(thing);
            }.bind(this));
        }

        return mergeAllThings;
    },

    /**
     * Searches the thing for its geometry location.
     * For some reason there are two different object pathes to check.
     * @param   {object} thing    aggregated thing
     * @param   {integer} index   index of location in array Locations
     * @returns {object|null} Json object or null
     */
    getJsonGeometry: function (thing, index) {
        const Locations = thing && thing.hasOwnProperty("Locations") ? thing.Locations : null,
            location = Locations && Locations.hasOwnProperty(index) && Locations[index].hasOwnProperty("location") ? Locations[index].location : null;

        if (location && location.hasOwnProperty("geometry") && location.geometry.hasOwnProperty("type")) {
            return location.geometry;
        }
        else if (location && location.hasOwnProperty("type")) {
            return location;
        }

        return null;
    },

    /**
     * Tries to parse object to ol.format.GeoJson
     * @param   {object} data object to parse
     * @throws an error if the argument cannot be parsed.
     * @returns {ol/Feature} ol feature
     */
    parseJson: function (data) {
        const mapCrs = Radio.request("MapView", "getProjection"),
            thingEPSG = this.get("epsg"),
            geojsonReader = new GeoJSON({
                featureProjection: mapCrs,
                dataProjection: thingEPSG
            });

        let jsonObjects;

        try {
            jsonObjects = geojsonReader.readFeature(data);
        }
        catch (err) {
            console.error("JSON structure in sensor thing location cannot be parsed.");
        }

        return jsonObjects;
    },

    /**
     * Aggregates the properties of the things.
     * @param {Object[]} allThings - all things
     * @returns {Object[]} - aggregatedThings
     */
    aggregatePropertiesOfThings: function (allThings) {
        const aggregatedArray = [];

        allThings.forEach(thing => {
            const aggregatedThing = {};

            if (Array.isArray(thing)) {
                let keys = [],
                    props = {},
                    datastreams = [];

                aggregatedThing.location = this.getJsonGeometry(thing[0], 0);
                thing.forEach(thing2 => {
                    keys.push(Object.keys(thing2.properties));
                    props = Object.assign(props, thing2.properties);
                    datastreams = datastreams.concat(thing2.Datastreams);
                });
                keys = [...new Set(this.flattenArray(keys))];
                keys = this.excludeDataStreamKeys(keys, "dataStream_");
                keys.push("name");
                keys.push("description");
                aggregatedThing.properties = Object.assign({}, props, this.aggregateProperties(thing, keys));
                aggregatedThing.properties.Datastreams = datastreams;
            }
            else {
                aggregatedThing.location = this.getJsonGeometry(thing, 0);
                aggregatedThing.properties = thing.properties;
                aggregatedThing.properties.name = thing.name;
                aggregatedThing.properties.description = thing.description;
                aggregatedThing.properties.Datastreams = thing.Datastreams;
            }
            aggregatedThing.properties.requestUrl = this.get("url");
            aggregatedThing.properties.versionUrl = this.get("version");

            aggregatedArray.push(aggregatedThing);
        });

        return aggregatedArray;
    },

    /**
     * flattenArray creates a new array with all sub-array elements concatenated
     * @info this is equivalent to Array.flat() - except no addition for testing is needed for this one
     * @param {*} array the array to flatten its sub-arrays or anything else
     * @returns {*}  the flattened array if an array was given, the untouched input otherwise
     */
    flattenArray: function (array) {
        return Array.isArray(array) ? array.reduce((acc, val) => acc.concat(val), []) : array;
    },

    /**
     * Excludes the keys starting with the given startsWithString
     * @param {String[]} keys  - keys
     * @param {String} startsWithString - startsWithString
     * @returns {String[]} - reducedKeys
     */
    excludeDataStreamKeys: function (keys, startsWithString) {
        let keysToIgnore,
            reducedKeys;

        if (keys && startsWithString) {
            keysToIgnore = keys.filter(key => key.startsWith(startsWithString));
            reducedKeys = keys.filter(key => !keysToIgnore.includes(key));
        }

        return reducedKeys;
    },

    /**
     * Aggregates the properties of the given keys and joins them by  " | "
     * @param {Object} thingArray - Array of things to aggregate
     * @param {String[]} keys - Keys to aggregate
     * @returns {Object} - aggregatedProperties
     */
    aggregateProperties: function (thingArray, keys) {
        const aggregatedProperties = {};

        keys.forEach(key => {
            const valuesArray = thingArray.map(thing => key === "name" || key === "description" ? thing[key] : thing.properties[key]);

            aggregatedProperties[key] = valuesArray.join(" | ");
        });
        return aggregatedProperties;
    },

    /**
     * create style, function triggers to style_v2.json
     * @param  {boolean} isClustered - should
     * @fires VectorStyle#RadioRequestStyleListReturnModelById
     * @returns {void}
     */
    styling: function (isClustered) {
        const stylelistmodel = Radio.request("StyleList", "returnModelById", this.get("styleId"));

        if (stylelistmodel !== undefined) {
            this.setStyle(function (feature) {
                return stylelistmodel.createStyle(feature, isClustered);
            });
        }
    },

    /**
     * create connection to a given MQTT-Broker
     * this must be passes this as a context to call the updateFromMqtt function
     * @param {array} features - features with DatastreamID
     * @returns {void}
     */
    createMqttConnectionToSensorThings: function () {
        if (!this.get("url")) {
            return;
        }

        const mqtt = new SensorThingsMqtt(),
            client = mqtt.connect({
                host: this.get("url").split("/")[2],
                protocol: "wss",
                path: this.get("mqttPath"),
                context: this
            });

        this.setMqttClient(client);

        // messages from the server
        client.on("message", function (topic, jsonData) {
            const regex = /\((.*)\)/; // search value in topic, that represents the datastreamid on position 1

            jsonData.dataStreamId = topic.match(regex)[1];
            this.updateFromMqtt(jsonData);
        });
    },

    /**
     * subscribes to the mqtt client with the features in the current extent
     * @returns {Void}  -
     */
    subscribeToSensorThings: function () {
        const features = this.getFeaturesInExtent(),
            dataStreamIds = this.getDataStreamIds(features),
            version = this.get("version"),
            client = this.get("mqttClient"),
            subscriptionTopics = this.get("subscriptionTopics"),
            protocol = this.get("url").split(":")[0];

        dataStreamIds.forEach(function (id) {
            if (client && id && !subscriptionTopics[id]) {
                client.subscribe("v" + version + "/Datastreams(" + id + ")/Observations", {
                    rmSimulate: true,
                    rmPath: this.get("httpSubFolder"),
                    rmProtocol: protocol
                });
                subscriptionTopics[id] = true;
            }
        }.bind(this));
    },

    /**
     * unsubscribes from the mqtt client with topics formerly subscribed
     * @returns {Void}  -
     */
    unsubscribeFromSensorThings: function () {
        const features = this.getFeaturesInExtent(),
            dataStreamIds = this.getDataStreamIds(features),
            dataStreamIdsInverted = {},
            subscriptionTopics = this.get("subscriptionTopics"),
            version = this.get("version"),
            isSelected = this.get("isSelected"),
            client = this.get("mqttClient");
        let id;

        dataStreamIds.forEach(function (datastreamId) {
            dataStreamIdsInverted[datastreamId] = true;
        });

        for (id in subscriptionTopics) {
            if (client && id && (isSelected === false || isSelected === true && subscriptionTopics[id] === true && !dataStreamIdsInverted.hasOwnProperty(id))) {
                client.unsubscribe("v" + version + "/Datastreams(" + id + ")/Observations");
                subscriptionTopics[id] = false;
            }
        }
    },

    /**
     * Refresh all connections by ending all established connections and creating new ones
     * @returns {void}
     */
    updateSubscription: function () {
        if (!this.get("loadThingsOnlyInCurrentExtent")) {
            this.unsubscribeFromSensorThings();
            this.subscribeToSensorThings();
        }
        else {
            this.loadFeaturesInExtentAndUpdateSubscription();
        }
    },

    /**
     * loading things only in the current extent and updating the subscriptions
     * delays before reloading stuff - maybe other moves will trigger in the midtime, so delay...
     * @returns {void}
     */
    loadFeaturesInExtentAndUpdateSubscription: function () {
        if (this.get("intvLoadingThingsInExtent") !== 0) {
            // stop any other action requested
            clearInterval(this.get("intvLoadingThingsInExtent"));
        }

        this.set("intvLoadingThingsInExtent", setInterval(function () {
            this.clearLayerSource();

            this.unsubscribeFromSensorThings();
            this.initializeConnection(function () {
                this.subscribeToSensorThings();
            }.bind(this));

            clearInterval(this.get("intvLoadingThingsInExtent"));
            this.set("intvLoadingThingsInExtent", 0);
        }.bind(this), this.get("delayLoadingThingsInExtent")));
    },

    /**
     * Returns features in enlarged extent (enlarged by 5% to make sure moving features close to the extent can move into the mapview)
     * @returns {ol/featre[]} features
     */
    getFeaturesInExtent: function () {
        const features = this.get("layer").getSource().getFeatures(),
            currentExtent = Radio.request("MapView", "getCurrentExtent"),
            enlargedExtent = this.enlargeExtent(currentExtent, 0.05),
            featuresInExtent = [];

        features.forEach(feature => {
            if (containsExtent(enlargedExtent, feature.getGeometry().getExtent())) {
                featuresInExtent.push(feature);
            }
        });

        return featuresInExtent;
    },

    /**
     * enlarge given extent by factor
     * @param   {ol/extent} extent extent to enlarge
     * @param   {float} factor factor to enlarge extent
     * @returns {ol/extent} enlargedExtent
     */
    enlargeExtent: function (extent, factor) {
        const bufferAmount = (extent[2] - extent[0]) * factor;

        return buffer(extent, bufferAmount);
    },

    /**
     * update the phenomenontime and states of the Feature
     * this function is triggerd from MQTT
     * @param  {json} thing - thing contains a new observation and accompanying topic
     * @returns {void}
     */
    updateFromMqtt: function (thing) {
        const thingToUpdate = thing !== undefined ? thing : {},
            dataStreamId = String(thingToUpdate.dataStreamId),
            features = this.get("layerSource").getFeatures(),
            feature = this.getFeatureByDataStreamId(features, dataStreamId),
            result = thingToUpdate.result,
            utc = this.get("utc"),
            phenomenonTime = this.changeTimeZone(thingToUpdate.phenomenonTime, utc);

        this.updateObservationForDatastreams(feature, dataStreamId, thing);
        this.liveUpdate(feature, dataStreamId, result, phenomenonTime);
    },

    /**
     * updates the Datastreams of the given feature with received time and result of the Observation
     * @param {ol/feature} feature - feature to be updated
     * @param {String} dataStreamId - dataStreamId
     * @param {Object} observation the observation to update the old observation with
     * @returns {Void}  -
     */
    updateObservationForDatastreams: function (feature, dataStreamId, observation) {
        if (!Array.isArray(feature.get("Datastreams"))) {
            return;
        }

        feature.get("Datastreams").forEach(function (datastream) {
            if (datastream["@iot.id"] !== undefined && String(datastream["@iot.id"]) === String(dataStreamId)) {
                datastream.Observations = [observation];
            }
        });
    },

    /**
     * performs the live update
     * @param  {ol/feature} feature - feature to be updated
     * @param  {String} dataStreamId - dataStreamId
     * @param  {String} result - the new state
     * @param  {String} phenomenonTime - the new phenomenonTime
     * @fires GFI#RadioTriggerGFIChangeFeature
     * @returns {void}
     */
    liveUpdate: function (feature, dataStreamId, result, phenomenonTime) {
        const dataStreamIdIdx = feature.get("dataStreamId").split(" | ").indexOf(String(dataStreamId)),
            dataStreamNameArray = feature.get("dataStreamName").split(" | "),
            dataStreamName = dataStreamNameArray.hasOwnProperty(dataStreamIdIdx) ? dataStreamNameArray[dataStreamIdIdx] : "";
        let updatedFeature = feature;

        updatedFeature.set("dataStream_" + dataStreamId + "_" + dataStreamName, result, true);
        updatedFeature.set("dataStream_" + dataStreamId + "_" + dataStreamName + "_phenomenonTime", phenomenonTime, true);
        updatedFeature = this.aggregateDataStreamValue(feature);
        updatedFeature = this.aggregateDataStreamPhenomenonTime(feature);

        // Redraw feature (update icon)
        this.get("layer").getSource().removeFeature(feature);
        this.get("layer").getSource().addFeature(updatedFeature);

        Radio.trigger("GFI", "changeFeature", updatedFeature);
    },

    /**
     * helper function for getDataStreamIds: pushes the datastream ids into the given array
     * @param {ol/Feature} feature the feature containing datastream ids
     * @param {String[]} dataStreamIdsArray the array to push the datastream ids into
     * @returns {Void}  -
     */
    getDataStreamIdsHelper: function (feature, dataStreamIdsArray) {
        let dataStreamIds = feature && feature.get("dataStreamId") !== undefined ? feature.get("dataStreamId") : "";

        if (dataStreamIds.indexOf("|") >= 0) {
            dataStreamIds = dataStreamIds.split("|");

            dataStreamIds.forEach(function (id) {
                dataStreamIdsArray.push(id.trim());
            });
        }
        else {
            dataStreamIdsArray.push(String(dataStreamIds));
        }
    },

    /**
     * get DataStreamIds for this layer - using dataStreamId property with expected pipe delimitors
     * @param  {ol/Feature[]} features - features with datastream ids or features with features (see clustering) with datastreamids
     * @return {String[]} dataStreamIdsArray - contains all datastream ids from this layer
     */
    getDataStreamIds: function (features) {
        const dataStreamIdsArray = [];

        if (!Array.isArray(features)) {
            return [];
        }

        features.forEach(function (feature) {
            if (Array.isArray(feature.get("features"))) {
                // obviously clustered featuers are activated
                feature.get("features").forEach(function (subfeature) {
                    this.getDataStreamIdsHelper(subfeature, dataStreamIdsArray);
                }.bind(this));
            }
            else {
                this.getDataStreamIdsHelper(feature, dataStreamIdsArray);
            }
        }.bind(this));

        return dataStreamIdsArray;
    },

    /**
     * get feature by a given id
     * @param  {array} features - features to seacrh for
     * @param  {number} id - the if from examined feature
     * @return {array} featureArray
     */
    getFeatureByDataStreamId: function (features, id) {
        let feature;

        if (features && features.length > 0 && id) {
            feature = features.filter(feat => {
                return feat.get("dataStreamId") ? feat.get("dataStreamId").includes(id) : false;
            })[0];
        }
        return feature;
    },

    /**
     * create legend
     * @fires VectorStyle#RadioRequestStyleListReturnModelById
     * @returns {void}
     */
    createLegendURL: function () {
        let style;

        if (this.get("LegendURL") !== undefined && !this.get("LegendURL").length) {
            style = Radio.request("StyleList", "returnModelById", this.get("styleId"));

            if (style !== undefined) {
                this.setLegendURL([style.get("imagePath") + style.get("imageName")]);
            }
        }
    },

    /**
     * clears all open layer features hold in the VectorSource
     * @post VectorSource is emptied
     * @return {Void}  -
     */
    clearLayerSource: function () {
        this.get("layer").getSource().clear();
    },

    /**
     * Setter for style
     * @param {function}  value Stylefunction.
     * @returns {void}
     */
    setStyle: function (value) {
        this.set("style", value);
    },

    /**
     * Setter for clusterLayerSource
     * @param {ol/source/cluster} value clusterLayerSource
     * @returns {void}
     */
    setClusterLayerSource: function (value) {
        this.set("clusterLayerSource", value);
    },

    /**
     * Setter for isSubscribed
     * @param {boolean} value isSubscribed
     * @returns {void}
     */
    setIsSubscribed: function (value) {
        this.set("isSubscribed", value);
    },

    /**
     * Setter for mqttClient
     * @param {boolean} value mqttClient
     * @returns {void}
     */
    setMqttClient: function (value) {
        this.set("mqttClient", value);
    },

    /**
     * Setter for moveendListener
     * @param {boolean} value moveendListener
     * @returns {void}
     */
    setMoveendListener: function (value) {
        this.set("moveendListener", value);
    },

    /**
     * Setter for SubscriptionTopics
     * @param {Object} value the SubscriptionTopic as object
     * @returns {Void}  -
     */
    setSubscriptionTopics: function (value) {
        this.set("subscriptionTopics", value);
    },

    /**
     * Setter for the HttpSubFolder
     * @param {String} value the httpSubFolder as String
     * @returns {Void}  -
     */
    setHttpSubFolder: function (value) {
        this.set("httpSubFolder", value);
    }

});

export default SensorLayer;
