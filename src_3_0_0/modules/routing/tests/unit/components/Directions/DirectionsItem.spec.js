import {createStore} from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount} from "@vue/test-utils";
import DirectionsComponent from "../../../../components/Directions/DirectionsItem.vue";
import DirectionsItemBatchProcessingComponent from "../../../../components/Directions/DirectionsItemBatchProcessing.vue";
import RoutingBatchProcessingCheckboxComponent from "../../../../components/RoutingBatchProcessingCheckbox.vue";
import RoutingDownloadComponent from "../../../../components/RoutingDownload.vue";
import mutations from "../../../../store/mutationsRouting";
import state from "../../../../store/stateRouting";
import actions from "../../../../store/actionsRouting";
import getters from "../../../../store/gettersRouting";
import mutationsDirections from "../../../../store/directions/mutationsDirections";
import actionsDirections from "../../../../store/directions/actionsDirections";
import gettersDirections from "../../../../store/directions/gettersDirections";
import stateDirections from "../../../../store/directions/stateDirections";

config.global.mocks.$t = key => key;

describe("src_3_0_0/modules/routing/components/Directions/DirectionsItem.vue", () => {
    let store,
        wrapper;

    beforeEach(() => {
        mapCollection.clear();
        mapCollection.addMap({
            mode: "2D",
            mapMode: "2D"
        }, "2D");

        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        Routing:
                        {
                            namespaced: true,
                            modules: {
                                Directions: {
                                    namespaced: true,
                                    state: {...stateDirections},
                                    mutations: mutationsDirections,
                                    actions: actionsDirections,
                                    getters: gettersDirections
                                }
                            },
                            state: {...state},
                            mutations,
                            actions,
                            getters
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    mode: "2D",
                    actions: {
                        addLayer: sinon.stub(),
                        removeInteraction: sinon.stub(),
                        addInteraction: sinon.stub()
                    }
                }
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders Directions", () => {
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});
        expect(wrapper.find("#routing-directions").exists()).to.be.true;
    });

    it("renders DirectionsBatchProcessingCheckbox", async () => {
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.settings.batchProcessing.enabled = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(RoutingBatchProcessingCheckboxComponent).exists()).to.be.true;
    });

    it("doesn't render DirectionsBatchProcessingCheckbox", async () => {
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.settings.batchProcessing.enabled = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(RoutingBatchProcessingCheckboxComponent).exists()).to.be.false;
    });

    it("renders DirectionsBatchProcessing", async () => {
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.settings.batchProcessing.enabled = true;
        wrapper.vm.settings.batchProcessing.active = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(DirectionsItemBatchProcessingComponent).exists()).to.be.true;
    });

    it("doesn't render DirectionsBatchProcessing", async () => {
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.settings.batchProcessing.enabled = true;
        wrapper.vm.settings.batchProcessing.active = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(DirectionsItemBatchProcessingComponent).exists()).to.be.false;
    });

    it("renders RoutingCoordinateInput", async () => {
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.settings.batchProcessing.enabled = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-directions-coordinate-input-form").exists()).to.be.true;
    });

    it("doesn't render RoutingCoordinateInput", async () => {
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.settings.batchProcessing.enabled = true;
        wrapper.vm.settings.batchProcessing.active = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-directions-coordinate-input-form").exists()).to.be.false;
    });

    it("renders routing result", async () => {
        store.commit("Modules/Routing/Directions/setRoutingDirections", {
            duration: 10,
            distance: 10,
            segments: []
        });
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.settings.batchProcessing.enabled = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-directions-result-directions").exists()).to.be.true;
        expect(wrapper.findComponent(RoutingDownloadComponent).exists()).to.be.true;
    });

    it("doesn't render routing result", async () => {
        store.commit("Modules/Routing/Directions/setRoutingDirections", null);
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.settings.batchProcessing.enabled = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-directions-result-directions").exists()).to.be.false;
        expect(wrapper.findComponent(RoutingDownloadComponent).exists()).to.be.false;
    });

    describe("checks if findDirections are called", () => {
        it("should call on changeSpeedProfile", () => {
            wrapper = shallowMount(DirectionsComponent, {global: {
                plugins: [store]
            }});
            const findDirectionsSpy = sinon.spy();

            wrapper.vm.findDirections = findDirectionsSpy;
            wrapper.vm.changeSpeedProfile("CAR");
            expect(findDirectionsSpy.calledOnce).to.be.true;
        });

        it("should call on changePreference", () => {
            wrapper = shallowMount(DirectionsComponent, {global: {
                plugins: [store]
            }});
            const findDirectionsSpy = sinon.spy();

            wrapper.vm.findDirections = findDirectionsSpy;
            wrapper.vm.changePreference("SHORTEST");
            expect(findDirectionsSpy.calledOnce).to.be.true;
        });

        it("should call on onAddAvoidOption", () => {
            wrapper = shallowMount(DirectionsComponent, {global: {
                plugins: [store]
            }});
            const findDirectionsSpy = sinon.spy();

            wrapper.vm.findDirections = findDirectionsSpy;
            wrapper.vm.onAddAvoidOption("HIGHWAYS");
            expect(findDirectionsSpy.calledOnce).to.be.true;
        });

        it("should call on onRemoveAvoidOption", () => {
            wrapper = shallowMount(DirectionsComponent, {global: {
                plugins: [store]
            }});
            const findDirectionsSpy = sinon.spy();

            wrapper.vm.findDirections = findDirectionsSpy;
            wrapper.vm.onRemoveAvoidOption("HIGHWAYS");
            expect(findDirectionsSpy.calledOnce).to.be.true;
        });
    });

    it("should toggle mapInteractionMode AVOID_AREAS => WAYPOINTS", async () => {
        store.commit("Modules/Routing/Directions/setMapInteractionMode", "AVOID_AREAS");
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.changeMapInteractionModeAvoidAreasEdit();
        expect(wrapper.vm.mapInteractionMode).equal("WAYPOINTS");
    });

    it("should toggle mapInteractionMode WAYPOINTS => AVOID_AREAS", async () => {
        store.commit("Modules/Routing/Directions/setMapInteractionMode", "WAYPOINTS");
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.changeMapInteractionModeAvoidAreasEdit();
        expect(wrapper.vm.mapInteractionMode).equal("AVOID_AREAS");
    });


    it("should toggle mapInteractionMode DELETE_AVOID_AREAS => WAYPOINTS", async () => {
        store.commit("Modules/Routing/Directions/setMapInteractionMode", "DELETE_AVOID_AREAS");
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.changeMapInteractionModeAvoidAreasDelete();
        expect(wrapper.vm.mapInteractionMode).equal("WAYPOINTS");
    });

    it("should toggle mapInteractionMode WAYPOINTS => DELETE_AVOID_AREAS", () => {
        store.commit("Modules/Routing/Directions/setMapInteractionMode", "WAYPOINTS");
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.changeMapInteractionModeAvoidAreasDelete();
        expect(wrapper.vm.mapInteractionMode).equal("DELETE_AVOID_AREAS");
    });

    it("should reset all user settings", async () => {
        const removeWaypoint = sinon.spy(),
            setRoutingDirections = sinon.spy(),
            clearDirectionsAvoidSource = sinon.spy();

        store.commit("Modules/Routing/Directions/setDirectionsAvoidSource", {
            clear: clearDirectionsAvoidSource
        });
        wrapper = shallowMount(DirectionsComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.setRoutingDirections = setRoutingDirections;
        wrapper.vm.removeWaypoint = removeWaypoint;
        wrapper.vm.reset();
        expect(removeWaypoint.calledTwice).to.be.true;
        expect(setRoutingDirections.calledOnce).to.be.true;
        expect(clearDirectionsAvoidSource.calledOnce).to.be.true;
    });
});
