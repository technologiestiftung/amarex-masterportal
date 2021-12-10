import "../../2DMap";
import "../../2DMapView";
import Map from "ol/Map";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import LayerGroup from "ol/layer/Group";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import mapCollection from "../../../../core/dataStorage/mapCollection.js";
import {expect} from "chai";
import store from "../../../../app-store";

describe("src/core/maps/2DMapView.js", () => {
    /**
     * Is needed to run the tests.
     * @see https://github.com/vuejs/vue-test-utils/issues/974
     * @returns {void}
     */
    global.requestAnimationFrame = () => "";

    const layer1 = new VectorLayer({
            id: "Donald",
            name: "Duck1",
            source: new VectorSource()
        }),
        layer2 = new VectorLayer({
            id: "Dagobert",
            name: "Duck2",
            alwaysOnTop: true,
            source: new VectorSource()
        }),
        layer3 = new VectorLayer({
            id: "Darkwing",
            name: "Duck3",
            source: new VectorSource()
        }),
        layer4 = new VectorLayer({
            id: "Daisy",
            name: "Duck4",
            source: new VectorSource()
        }),
        layer5 = new LayerGroup({
            id: "Darkwing_Daisy",
            name: "Duck_group",
            layers: [layer3, layer4]
        });
    let map,
        mapView;

    beforeEach(() => {
        mapCollection.clear();
        map = new Map({
            id: "ol",
            mode: "2D",
            view: new View({
                extent: [510000.0, 5850000.0, 625000.4, 6000000.0],
                center: [565874, 5934140],
                zoom: 2
            })
        });

        map.setSize([1059, 887]);

        mapCollection.addMap(map, "ol", "2D");
        mapView = mapCollection.getMapView("ol", "2D");
    });

    it("getCurrentExtent - calculate the extent for the current view state and the passed size", function () {
        expect(mapView.getCurrentExtent()).to.deep.equal([
            509999.99999999994,
            5876639.8,
            625000.3999999999,
            5991640.2
        ]);
    });

    it("Returns the bounding box with the projection EPSG:4326", () => {
        expect(mapView.getProjectedBBox()).to.deep.equal([
            -0.37214433613366177,
            43.73233379125262,
            10.568026404151366,
            49.98782015759816
        ]);
    });

    it("getResoByScale - returns the resolution for the given scale", function () {
        expect(mapView.getResoByScale(5000, "max")).to.deep.equal([
            -0.37214433613366177,
            43.73233379125262,
            10.568026404151366,
            49.98782015759816
        ]);
    });

    it("resetView - resets the view", function () {
        mapView.resetView();

        expect(mapView.getCenter()).to.deep.equal([565874, 5934140]);
        expect(mapView.getResolution()).to.deep.equal(15.874991427504629);
    });

    it("Sets the bbox", function () {
        mapView.setBBox([565760.049, 5931747.185, 568940.626, 5935453.891]);

        expect(mapView.getCenter()).to.deep.equal([567350.3375, 5933600.538]);
        expect(Math.round(mapView.getZoom())).equals(12);
    });

    it("Sets the center with integers", function () {
        mapView.setCenterCoord([1, 2]);

        expect(mapView.getCenter()).to.deep.equal([567500.2, 5907500.2]);
    });

    it("Sets the center with strings", function () {
        mapView.setCenterCoord(["1", "2"]);

        expect(mapView.getCenter()).to.deep.equal([567500.2, 5907500.2]);
    });

    it("Sets the constrained resolution", function () {
        mapView.setConstrainedResolution(17, 0);

        expect(mapView.getResolution()).to.deep.equal(17);
    });

    it("Sets the resolution by scale", function () {
        mapView.setResolutionByScale(1000);

        expect(mapView.getResolution()).to.deep.equal(0.2645831904584105);
    });

    it("Sets the zoom level down", function () {
        mapView.setZoomLevelDown();

        expect(mapView.getZoom()).to.deep.equal(7.088776621377278);
    });

    it("Sets the zoom level up", function () {
        mapView.setZoomLevelUp();

        expect(mapView.getZoom()).to.deep.equal(8.088776621377278);
    });

    it("toggles the background to white", function () {
        mapView.toggleBackground();

        expect(mapView.background).to.deep.equal("white");
    });

    it("toggles the background to image", function () {
        mapView.toggleBackground();
        expect(mapView.background).to.equal("white");

        mapView.toggleBackground();
        expect(mapView.background).to.equal(undefined);
    });

    describe("zoomToExtent", () => {
        it("Zoom to the extent with duration 0 milliseconds", () => {
            mapView.zoomToExtent([565760.049, 5931747.185, 568940.626, 5935453.891], {duration: 0});

            expect(mapView.getCenter()).to.deep.equal([567350.3375, 5933600.538]);
            expect(Math.round(mapView.getZoom())).equals(15);
        });
    });


    describe("zoomToFilteredFeatures", () => {
        const ids = ["Tick", "Track"],
            zoomOptions = {duration: 0},
            feature1 = new Feature({
                name: "Tick",
                geometry: new Point([555994.92, 5929695.34])
            }),
            feature2 = new Feature({
                name: "Trick",
                geometry: new Point([574780.33, 5946033.36])
            }),
            feature3 = new Feature({
                name: "Track",
                geometry: new Point([575441.79, 5924668.26])
            });

        it("Zoom to extend of the given featureIds of a vectorLayer", () => {
            feature1.setId("Tick");
            feature2.setId("Trick");
            feature3.setId("Track");

            layer1.getSource().addFeatures([feature1, feature2, feature3]);
            map.addLayer(layer1);
            map.addLayer(layer2);

            mapView.zoomToFilteredFeatures(ids, "Donald", zoomOptions);

            expect(mapView.getCenter()).to.deep.equal([565718.355, 5927181.800]);
            expect(Math.round(mapView.getZoom())).equals(13);
        });

        it("Zoom to extend of the given featureIds of a groupLayer", () => {
            feature1.setId("Tick");
            feature2.setId("Trick");
            feature3.setId("Track");

            layer3.getSource().addFeatures([feature1, feature2, feature3]);
            map.addLayer(layer2);
            map.addLayer(layer5);

            mapView.zoomToFilteredFeatures(ids, "Darkwing", zoomOptions);

            expect(mapView.getCenter()).to.deep.equal([565718.355, 5927181.800]);
            expect(Math.round(mapView.getZoom())).equals(13);
        });
    });

    describe("zoomToProjExtent", () => {
        it("Zoom to the given extent in projection EPSG:4326", () => {
            const data = {
                extent: [9.9703, 53.5214, 10.1072, 53.5889],
                options: {duration: 0},
                projection: "EPSG:4326"
            };

            mapView.zoomToProjExtent(data);

            expect(mapView.getCenter()).to.deep.equal([624280.870335713, 5999280.470335713]);
            expect(Math.round(mapView.getZoom())).equals(13);
        });
    });

    it("sets the background", function () {
        mapView.setBackground("Daisy Ducks custom BG");
        expect(mapView.background).to.equal("Daisy Ducks custom BG");

        mapView.setBackground("Mickey Mouses custom map");
        expect(mapView.background).to.equal("Mickey Mouses custom map");
    });
});
