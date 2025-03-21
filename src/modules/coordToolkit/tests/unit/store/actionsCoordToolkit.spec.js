import testAction from "../../../../../../devtools/tests/VueTestUtils";
import actions from "../../../store/actionsCoordToolkit";
import crs from "@masterportal/masterportalapi/src/crs";
import sinon from "sinon";
import {expect} from "chai";

describe("src/modules/coord/store/actionsCoordToolkit.js", () => {
    let commit, dispatch, getters;
    const namedProjections = [
        ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
        ["EPSG:25833", "+title=ETRS89/UTM 33N +proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
        ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
        ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
    ];

    before(() => {
        crs.registerProjections(namedProjections);
    });

    beforeEach(() => {
        const map = {
            id: "ol",
            mode: "2D",
            getView: () => {
                return {
                    getProjection: () => {
                        return {
                            getCode: () => "EPSG:25832"
                        };
                    }
                };
            }
        };

        mapCollection.clear();
        mapCollection.addMap(map, "2D");
        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    after(() => {
        // remove additional projection 25833 from registered ones
        crs.getProjection("EPSG:25833").masterportal = false;
    });

    describe("supplyCoord actions", () => {
        it("positionClicked without height", done => {
            const coordinate = [1000, 2000],
                state = {
                    updatePosition: true,
                    positionMapProjection: [300, 300]
                },
                rootGetters = {
                    "Maps/clickCoordinate": coordinate,
                    "Maps/mode": "2D"
                };

            testAction(actions.positionClicked, {}, state, {}, [
                {type: "setPositionMapProjection", payload: coordinate},
                {type: "changedPosition", payload: undefined, dispatch: true},
                {type: "setUpdatePosition", payload: false},
                {type: "Maps/placingPointMarker", payload: coordinate, dispatch: true}
            ], {}, done, rootGetters);
        });
        it("positionClicked with height and update position is true", done => {
            const coordinate = [1000, 2000],
                state = {
                    updatePosition: true,
                    heightLayer: {
                        id: "19173",
                        name: "Digitales Höhenmodell Hamburg (DGM1)"
                    },
                    positionMapProjection: [300, 300]
                },
                rootGetters = {
                    "Maps/clickCoordinate": coordinate,
                    "Maps/mode": "2D"
                };

            testAction(actions.positionClicked, {}, state, {}, [
                {type: "setPositionMapProjection", payload: coordinate},
                {type: "changedPosition", payload: undefined, dispatch: true},
                {type: "setUpdatePosition", payload: false},
                {type: "Maps/placingPointMarker", payload: coordinate, dispatch: true},
                {type: "getHeight", payload: coordinate, dispatch: true}
            ], {}, done, rootGetters);
        });
        it("positionClicked with height and update position is false", done => {
            const coordinate = [1000, 2000],
                state = {
                    updatePosition: false,
                    heightLayer: {
                        id: "19173",
                        name: "Digitales Höhenmodell Hamburg (DGM1)"
                    },
                    positionMapProjection: [300, 300]
                },
                rootGetters = {
                    "Maps/clickCoordinate": coordinate,
                    "Maps/mode": "2D"
                };

            testAction(actions.positionClicked, {}, state, {}, [
                {type: "setPositionMapProjection", payload: coordinate},
                {type: "changedPosition", payload: undefined, dispatch: true},
                {type: "setUpdatePosition", payload: true},
                {type: "Maps/placingPointMarker", payload: coordinate, dispatch: true},
                {type: "setHeight", payload: ""}
            ], {}, done, rootGetters);
        });
        it("retrieveHeightFromGfiResponse - real height", done => {
            const heightElementName = "value_0",
                heightFromLayer = "1.100",
                payload = [
                    {
                        get: (attr) => {
                            if (attr === heightElementName) {
                                return heightFromLayer;
                            }
                            return null;
                        }
                    }
                ],
                expectedHeight = Number.parseFloat(heightFromLayer).toFixed(1),
                state = {
                    heightElementName: heightElementName
                };

            testAction(actions.retrieveHeightFromGfiResponse, payload, state, {}, [
                {type: "setHeight", payload: expectedHeight}
            ], {}, done);
        });
        it("retrieveHeightFromGfiResponse - height on water area", done => {
            const heightElementName = "value_0",
                heightValueWater = "-20",
                payload = [
                    {
                        get: (attr) => {
                            if (attr === heightElementName) {
                                return heightValueWater;
                            }
                            return null;
                        }
                    }
                ],
                expectedHeight = "common:modules.coordToolkit.noHeightWater",
                state = {
                    heightElementName: heightElementName,
                    heightValueWater: heightValueWater
                };

            testAction(actions.retrieveHeightFromGfiResponse, payload, state, {}, [
                {type: "setHeight", payload: expectedHeight}
            ], {}, done);
        });
        it("retrieveHeightFromGfiResponse - height on building area", done => {
            const heightElementName = "value_0",
                heightValueBuilding = "200",
                payload = [
                    {
                        get: (attr) => {
                            if (attr === heightElementName) {
                                return heightValueBuilding;
                            }
                            return null;
                        }
                    }
                ],
                expectedHeight = "common:modules.coordToolkit.noHeightBuilding",
                state = {
                    heightElementName: heightElementName,
                    heightValueBuilding: heightValueBuilding
                };

            testAction(actions.retrieveHeightFromGfiResponse, payload, state, {}, [
                {type: "setHeight", payload: expectedHeight}
            ], {}, done);
        });
        it("retrieveHeightFromGfiResponse - height on water area, heightValueWater not translated", done => {
            const heightElementName = "value_0",
                heightValueWater = "-20",
                payload = [
                    {
                        get: (attr) => {
                            if (attr === heightElementName) {
                                return heightValueWater;
                            }
                            return null;
                        }
                    }
                ],
                expectedHeight = Number.parseFloat(heightValueWater).toFixed(1),
                state = {
                    heightElementName: heightElementName
                };

            testAction(actions.retrieveHeightFromGfiResponse, payload, state, {}, [
                {type: "setHeight", payload: expectedHeight}
            ], {}, done);
        });
        it("retrieveHeightFromGfiResponse - height on building area, heightValueBuilding not translated", done => {
            const heightElementName = "value_0",
                heightValueBuilding = "200",
                payload = [
                    {
                        get: (attr) => {
                            if (attr === heightElementName) {
                                return heightValueBuilding;
                            }
                            return null;
                        }
                    }
                ],
                expectedHeight = Number.parseFloat(heightValueBuilding).toFixed(1),
                state = {
                    heightElementName: heightElementName
                };

            testAction(actions.retrieveHeightFromGfiResponse, payload, state, {}, [
                {type: "setHeight", payload: expectedHeight}
            ], {}, done);
        });
        it("retrieveHeightFromGfiResponse - height on water area, heightValueWater not translated and is no number", done => {
            const heightElementName = "value_0",
                heightValueWater = "water",
                payload = [
                    {
                        get: (attr) => {
                            if (attr === heightElementName) {
                                return heightValueWater;
                            }
                            return null;
                        }
                    }
                ],
                expectedHeight = heightValueWater,
                state = {
                    heightElementName: heightElementName
                };

            testAction(actions.retrieveHeightFromGfiResponse, payload, state, {}, [
                {type: "setHeight", payload: expectedHeight}
            ], {}, done);
        });
        it("retrieveHeightFromGfiResponse - height on building area, heightValueBuilding not translated and is no number", done => {
            const heightElementName = "value_0",
                heightValueBuilding = "building",
                payload = [
                    {
                        get: (attr) => {
                            if (attr === heightElementName) {
                                return heightValueBuilding;
                            }
                            return null;
                        }
                    }
                ],
                expectedHeight = heightValueBuilding,
                state = {
                    heightElementName: heightElementName
                };

            testAction(actions.retrieveHeightFromGfiResponse, payload, state, {}, [
                {type: "setHeight", payload: expectedHeight}
            ], {}, done);
        });
        it("newProjectionSelected", done => {
            const
                pos = [123, 456],
                proj1 = {id: "projection 1", name: "projection 1", projName: "longlat"},
                proj2 = {id: "projection 2", name: "projection 2", projName: "longlat"},
                state = {
                    projections: [
                        proj1,
                        proj2
                    ],
                    coordinatesEasting: pos[0],
                    coordinatesNorthing: pos[1]
                };

            testAction(actions.newProjectionSelected, proj2.id, state, {}, [
                {type: "formatInput", payload: pos, dispatch: true},
                {type: "transformCoordinatesFromTo", payload: proj2, dispatch: true},
                {type: "setCurrentProjection", payload: proj2},
                {type: "changedPosition", payload: undefined, dispatch: true},
                {type: "setExample"}
            ], {getProjectionById: () => {
                return proj2;
            }}, done);
        });
        describe("changedPosition", () => {
            const rootState = {
                    Map: {
                        map: {}
                    }
                },
                proj1 = {id: "projection 1", name: "projection 1", projName: "longlat"},
                proj2 = {id: "projection 2", name: "projection 2", projName: "longlat"},
                state = {
                    mode: "supply",
                    projections: [proj1, proj2],
                    currentProjection: proj2,
                    positionMapProjection: [300, 400]
                };

            it("changedPosition will call adjustPosition in mode 'supply'", done => {
                const payload = {
                    position: [100, 200],
                    targetProjection: proj2
                };

                testAction(actions.changedPosition, null, state, rootState, [
                    {type: "adjustPosition", payload: payload, dispatch: true}
                ], {getTransformedPosition: () => {
                    return [100, 200];
                }}, done);
            });
            it("changedPosition will not call adjustPosition in mode 'serach'", done => {
                state.mode = "search";

                testAction(actions.changedPosition, null, state, rootState, [
                ], {getTransformedPosition: () => {
                    return [100, 200];
                }}, done);
            });
            it("changedPosition will not call adjustPosition if position is null", done => {
                testAction(actions.changedPosition, null, state, rootState, [],
                    {getTransformedPosition: () => {
                        return null;
                    }}, done);
            });
        });
        describe("setFirstSearchPosition", () => {
            const center = [1000, 2000],
                rootState = {
                    Maps: {

                        center: center

                    }
                },
                proj1 = {id: "projection 1", name: "projection 1", projName: "longlat"},
                proj2 = {id: "projection 2", name: "projection 2", projName: "longlat"},
                state = {
                    mode: "search",
                    projections: [proj1, proj2],
                    currentProjection: proj2,
                    positionMapProjection: [300, 400]
                };

            it("setFirstSearchPosition will call setCoordinatesEasting and others if position is not set", done => {
                const payloadEasting = {id: "easting", value: String(center[0])},
                    payloadNorthing = {id: "northing", value: String(center[1])};

                testAction(actions.setFirstSearchPosition, null, state, rootState, [
                    {type: "setCoordinatesEasting", payload: payloadEasting},
                    {type: "setCoordinatesNorthing", payload: payloadNorthing},
                    {type: "moveToCoordinates", payload: center, dispatch: true}
                ], {getTransformedPosition: () => {
                    return [0, 0];
                }}, done);
            });
            it("setFirstSearchPosition will do nothing if position is set", done => {
                state.mode = "search";

                testAction(actions.setFirstSearchPosition, null, state, rootState, [
                ], {getTransformedPosition: () => {
                    return [100, 200];
                }}, done);
            });
            it("setFirstSearchPosition will do nothing if mode is not 'search'", done => {
                state.mode = "supply";

                testAction(actions.setFirstSearchPosition, null, state, rootState, [],
                    {getTransformedPosition: () => {
                        return [0, 0];
                    }}, done);
            });
        });
        describe("adjustPosition", () => {
            const rootState = {
                    Map: {
                        map: {}
                    }
                },
                proj1 = {id: "projection 1", name: "projection 1", projName: "utm"},
                proj2 = {id: "http://www.opengis.net/gml/srs/epsg.xml#25832", name: "EPSG:25832", projName: "longlat"},
                proj3 = {id: "http://www.opengis.net/gml/srs/epsg.xml#4326-DG", name: "EPSG:4326", projName: "longlat"};

            it("adjustPosition sets coordinate fields - longlat", done => {
                const payload = {
                    position: [100, 200],
                    targetProjection: proj2
                };

                testAction(actions.adjustPosition, payload, {}, rootState, [
                    {type: "setCoordinatesEasting", payload: {id: "easting", value: "160° 00′ 00″"}},
                    {type: "setCoordinatesNorthing", payload: {id: "northing", value: "100° 00′ 00″"}}
                ], {}, done);
            });
            it("adjustPosition sets coordinate fields - longlat - decimal degree", done => {
                const payload = {
                    position: [100, 200],
                    targetProjection: proj3
                };

                testAction(actions.adjustPosition, payload, {}, rootState, [
                    {type: "setCoordinatesEasting", payload: {id: "easting", value: "160.0000°"}},
                    {type: "setCoordinatesNorthing", payload: {id: "northing", value: "100.0000°"}}
                ], {}, done);
            });
            it("adjustPosition sets coordinate fields - utm", done => {
                const payload = {
                    position: [100, 200],
                    targetProjection: proj1
                };

                testAction(actions.adjustPosition, payload, {}, rootState, [
                    {type: "setCoordinatesEasting", payload: {id: "easting", value: "100.00"}},
                    {type: "setCoordinatesNorthing", payload: {id: "northing", value: "200.00"}}
                ], {}, done);
            });
            it("adjustPosition sets coordinate fields - no projection and position does nothing", done => {
                const payload = {
                    position: [],
                    targetProjection: null
                };

                testAction(actions.adjustPosition, payload, {}, rootState, [], {}, done);
            });
            it("adjustPosition sets coordinate fields - no position does not fail", done => {
                const payload = {
                    position: null,
                    targetProjection: proj1
                };

                testAction(actions.adjustPosition, payload, {}, rootState, [], {}, done);
            });
            it("adjustPosition sets coordinate fields - empty position does not fail", done => {
                const payload = {
                    position: [],
                    targetProjection: proj1
                };

                testAction(actions.adjustPosition, payload, {}, rootState, [], {}, done);
            });
        });
        describe("checkPosition", () => {
            it("checkPosition sets positionMapProjection", done => {
                const state = {
                        updatePosition: true
                    },
                    position = [100, 200],
                    rootGetters = {
                        "Maps/mouseCoordinate": position,
                        "Maps/mode": "2D"
                    };

                testAction(actions.checkPosition, {}, state, {}, [
                    {type: "setPositionMapProjection", payload: position}
                ], {}, done, rootGetters);
            });
            it("checkPosition not sets positionMapProjection", done => {
                const state = {
                    updatePosition: false
                };

                testAction(actions.checkPosition, {}, state, {}, [], {}, done);
            });
        });
    });
    describe("searchByCoord actions", () => {

        describe("validateInput", () => {
            it("Validates the coordinates according to the ETRS89 coordinate system", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#25832"},
                    coordinatesEasting: {id: "easting", name: "", value: "564459.13", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch, getters}, state.coordinatesEasting);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
            });
            it("Throws an Error for missing coordinates - ETRS89", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#25832"},
                    coordinatesEasting: {id: "easting", name: "", value: "", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch}, state.coordinatesEasting);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
                expect(commit.secondCall.args[0]).to.equal("setEastingNoCoord");
            });
            it("Throws an Error for wrong coordinates - ETRS89", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#25832"},
                    coordinatesNorthing: {id: "northing", name: "", value: "falsche Eingabe", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch}, state.coordinatesNorthing);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
                expect(commit.secondCall.args[0]).to.equal("setNorthingNoMatch");
            });
            it("Validates the coordinates according to the ETRS893GK3 coordinate system", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3"},
                    coordinatesEasting: {id: "easting", name: "", value: "3565900.36", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch, getters}, state.coordinatesEasting);
                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
            });
            it("Throws an Error for missing coordinates - ETRS893GK3", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3"},
                    coordinatesEasting: {id: "easting", name: "", value: "", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch}, state.coordinatesEasting);
                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
                expect(commit.secondCall.args[0]).to.equal("setEastingNoCoord");
            });
            it("Throws an Error for wrong coordinates - ETRS893GK3", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3"},
                    coordinatesNorthing: {id: "northing", name: "", value: "falsche Eingabe", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch}, state.coordinatesNorthing);
                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
                expect(commit.secondCall.args[0]).to.equal("setNorthingNoMatch");
            });
            it("Validates the coordinates according to the WGS84 coordinate system", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#4326"},
                    coordinatesEasting: {id: "easting", name: "", value: "53° 33′ 25", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch, getters}, state.coordinatesEasting);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
            });
            it("Throws an Error for missing coordinates - WGS84", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#4326"},
                    coordinatesEasting: {id: "easting", name: "", value: "", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch}, state.coordinatesEasting);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
                expect(commit.secondCall.args[0]).to.equal("setEastingNoCoord");
            });
            it("Throws an Error for wrong coordinates - WGS84", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#4326"},
                    coordinatesNorthing: {id: "northing", name: "", value: "falsche Eingabe", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch}, state.coordinatesNorthing);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
                expect(commit.secondCall.args[0]).to.equal("setNorthingNoMatch");
            });
            it("Validates the coordinates according to the WGS84(Dezimalgrad) coordinate system", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#4326-DG"},
                    coordinatesEasting: {id: "easting", name: "", value: "53.55555°", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch, getters}, state.coordinatesEasting);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
            });
            it("Validates the coordinates without degree symbol according to the WGS84(Dezimalgrad) coordinate system", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#4326-DG"},
                    coordinatesEasting: {id: "easting", name: "", value: "9.983193111035327", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch, getters}, state.coordinatesEasting);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
            });
            it("Throws an Error for missing coordinates - WGS84(Dezimalgrad)", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#4326-DG"},
                    coordinatesEasting: {id: "easting", name: "", value: "", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch}, state.coordinatesEasting);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
                expect(commit.secondCall.args[0]).to.equal("setEastingNoCoord");
            });
            it("Throws an Error for wrong coordinates - WGS84(Dezimalgrad)", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#4326-DG"},
                    coordinatesNorthing: {id: "northing", name: "", value: "falsche Eingabe", errorMessage: ""}
                };

                actions.validateInput({state, commit, dispatch}, state.coordinatesNorthing);

                expect(commit.firstCall.args[0]).to.equal("resetErrorMessages");
                expect(commit.secondCall.args[0]).to.equal("setNorthingNoMatch");
            });
        });
        describe("formatInput", () => {
            it("Does not format coordinates of the ETRS89 format and moves to coordinates", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#25832"},
                    coordinatesEasting: {id: "easting", name: "", value: "564459.13", errorMessage: ""},
                    coordinatesNorthing: {id: "northing", name: "", value: "5935103.67", errorMessage: ""}
                };

                actions.formatInput({state, commit, getters}, [state.coordinatesEasting, state.coordinatesNorthing]);

                expect(commit.firstCall.args[0]).to.equal("setSelectedCoordinates");
                expect(commit.secondCall.args[0]).to.equal("resetErrorMessages");
                expect(commit.thirdCall.args[0]).to.equal("pushCoordinates");
                expect(commit.thirdCall.args[1]).to.equal("564459.13");
            });
        });
        describe("transformCoordinates", () => {
            it("Does not transform coordinates of the ETRS89 format and moves to coordinates", () => {
                const map = {
                        id: "ol",
                        mode: "2D",
                        getView: () => {
                            return {
                                getProjection: () => {
                                    return {
                                        getCode: () => "EPSG:25832"
                                    };
                                }
                            };
                        }
                    },
                    state = {
                        currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#25832", epsg: "EPSG:25832"},
                        selectedCoordinates: ["564459.13", "5935103.67"]
                    };

                mapCollection.clear();
                mapCollection.addMap(map, "2D");

                actions.transformCoordinates({state, dispatch});

                expect(dispatch.firstCall.args[0]).to.equal("setZoom");
                expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
                expect(dispatch.secondCall.args[1]).to.eql(["564459.13", "5935103.67"]);
            });
            it("Transforms coordinates of the WGS84 format and moves to coordinates", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#4326", name: "EPSG:4326", epsg: "EPSG:4326"},
                    selectedCoordinates: [["53", "33", "25"], ["9", "59", "50"]]
                };

                actions.transformCoordinates({state, dispatch});

                expect(dispatch.firstCall.args[0]).to.equal("setZoom");
                expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
            });
            it("Transforms coordinates of the ETRS89_3GK3, EPSG: none  and moves to coordinates", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3", name: "ETRS89_3GK3, EPSG: none", epsg: "EPSG:8395"},
                    selectedCoordinates: [["3565900.36"], ["5936514.61"]]
                };

                actions.transformCoordinates({state, dispatch});
                expect(dispatch.firstCall.args[0]).to.equal("setZoom");
                expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
            });
            it("Transforms coordinates of the WGS84(Dezimalgrad) format and moves to coordinates", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#4326-DG", epsg: "EPSG:4326-DG", name: "EPSG:4326-DG"},
                    selectedCoordinates: [["53.55555", ""], ["10.01234", ""]]
                };

                actions.transformCoordinates({state, dispatch});

                expect(dispatch.firstCall.args[0]).to.equal("setZoom");
                expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
            });
            it("Transforms coordinates of the EPSG:31467 format and moves to coordinates", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#31467", epsg: "EPSG:31467"},
                    selectedCoordinates: ["53.55555", "10.01234"]
                };

                actions.transformCoordinates({state, dispatch});

                expect(dispatch.firstCall.args[0]).to.equal("setZoom");
                expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
            });
            it("Transforms coordinates of the EPSG:8395 format and moves to coordinates", () => {
                const state = {
                    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#8395", epsg: "EPSG:8395"},
                    selectedCoordinates: ["53.55555", "10.01234"]
                };

                actions.transformCoordinates({state, dispatch});

                expect(dispatch.firstCall.args[0]).to.equal("setZoom");
                expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
            });
            it("Transforms coordinates of the http://www.opengis.net/gml/srs/epsg.xml#25832 format and moves to coordinates", () => {
                const state = {
                        currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#25832", epsg: "EPSG:25832"},
                        selectedCoordinates: [["53.55555", ""], ["10.01234", ""]]
                    },
                    map = {
                        id: "ol",
                        mode: "2D",
                        getView: () => {
                            return {
                                getProjection: () => {
                                    return {
                                        getCode: () => "EPSG:25832"
                                    };
                                }
                            };
                        }
                    };

                mapCollection.clear();
                mapCollection.addMap(map, "2D");

                actions.transformCoordinates({state, dispatch});

                expect(dispatch.firstCall.args[0]).to.equal("setZoom");
                expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
            });
            it("Respect mapViews projection is not 'EPSG:25832' - Transforms coordinates of the EPSG:8395 format and moves to coordinates", () => {
                const state = {
                        currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#8395", projName: "tmerc", epsg: "EPSG:8395"},
                        selectedCoordinates: ["53.55555", "10.01234"]
                    },
                    map = {
                        id: "ol",
                        mode: "2D",
                        getView: () => {
                            return {
                                getProjection: () => {
                                    return {
                                        getCode: () => "EPSG:25833"
                                    };
                                }
                            };
                        }
                    };

                mapCollection.clear();
                mapCollection.addMap(map, "2D");

                actions.transformCoordinates({state, dispatch});

                expect(dispatch.firstCall.args[0]).to.equal("setZoom");
                expect(dispatch.secondCall.args[0]).to.equal("moveToCoordinates");
            });

            describe("setMarker", () => {
                it("setMarker shall parse the coordinates", () => {
                    const coordinates = ["1234.56", "4567.89"];

                    actions.setMarker({dispatch}, coordinates);
                    expect(dispatch.calledOnce).to.be.true;
                    expect(dispatch.firstCall.args[0]).to.equal("Maps/placingPointMarker");
                    expect(dispatch.firstCall.args[1]).to.be.deep.equal([1234.56, 4567.89]);
                });

                it("setMarker shall call placingPointMarker", () => {
                    const coordinates = [1234.56, 4567.89];

                    actions.setMarker({dispatch}, coordinates);
                    expect(dispatch.calledOnce).to.be.true;
                    expect(dispatch.firstCall.args[0]).to.equal("Maps/placingPointMarker");
                    expect(dispatch.firstCall.args[1]).to.be.deep.equal([1234.56, 4567.89]);
                });
            });

            describe("removeMarker", () => {
                it("removeMarker shall call removePointMarker", () => {
                    actions.removeMarker({dispatch});
                    expect(dispatch.calledOnce).to.be.true;
                    expect(dispatch.firstCall.args[0]).to.equal("Maps/removePointMarker");
                    expect(dispatch.firstCall.args[1]).to.be.null;
                });
            });
        });
        describe("setCenter", () => {
            it("sets the center after search", () => {
                actions.setCenter({dispatch}, ["12345.67", "98765.12"]);
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("Maps/setCenter");
                expect(dispatch.firstCall.args[1]).to.be.deep.equal([12345.67, 98765.12]);
            });
        });
    });
});

