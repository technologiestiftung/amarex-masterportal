define(function (require) {
    var HighlightFeature,
        ol = require("openlayers");

    HighlightFeature = Backbone.Model.extend({
        initialize: function () {
            var featureToAdd = Radio.request("ParametricURL", "getHighlightFeature"),
                channel = Radio.channel("Highlightfeature"),
                temp;

            channel.on({
                "highlightfeature": this.highlightFeature
            }, this);
            if (featureToAdd) {
                temp = featureToAdd.split(",");

                this.getAndAddFeature(temp[0], temp[1]);
            }
        },
        highlightFeature: function (featureToAdd) {
            var temp = featureToAdd.split(",");

            this.getAndAddFeature(temp[0], temp[1]);
        },
        getAndAddFeature: function (layerId, featureId) {
            var layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId}),
                features;

            if (layer && layer.get("layerSource")) {
                features = layer.get("layerSource").getFeatures();

                if (features.length > 1) {
                    this.addFeature(layer.get("layerSource").getFeatureById(featureId));
                }
                else {
                    this.listenTo(Radio.channel("Layer"), {
                        "featuresLoaded": function (loadedLayerId) {
                            if (layerId === loadedLayerId) {
                                this.addFeature(layer.get("layerSource").getFeatureById(featureId));
                            }
                        }
                    });
                }
            }
        },
        addFeature: function (feature) {
            var highlightLayer,
                source;

            if (feature) {
                highlightLayer = Radio.request("Map", "createLayerIfNotExists", "highlightLayer");
                source = highlightLayer.getSource();
                source.addFeatures([feature]);
                feature.setStyle(this.createStyle());
            }
        },
        createStyle: function () {
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: "#ed8804",
                    width: 4
                }),
                fill: new ol.style.Fill({
                    color: "rgba(237, 136, 4, 0.1)"
                })
            });
        }
    });
    return HighlightFeature;
});

