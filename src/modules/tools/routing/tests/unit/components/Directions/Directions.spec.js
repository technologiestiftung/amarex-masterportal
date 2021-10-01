import Vuex from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import DirectionsComponent from "../../../../components/Directions/Directions.vue";
import DirectionsBatchProcessingComponent from "../../../../components/Directions/DirectionsBatchProcessing.vue";
import RoutingBatchProcessingCheckboxComponent from "../../../../components/RoutingBatchProcessingCheckbox.vue";
import RoutingDownloadComponent from "../../../../components/RoutingDownload.vue";
import Routing from "../../../../store/indexRouting";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/routing/components/Directions/Directions.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        routing:
                            {
                                "name": "translate#common:menu.tools.routing",
                                "glyphicon": "glyphicon-road",
                                "renderToWindow": true
                            }
                    }
                }
            }
        }
    };
    let store,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Routing
                    }
                },
                Map: {
                    namespaced: true,
                    getters: {
                        map: () => ({
                            addLayer: sinon.spy(),
                            removeLayer: sinon.spy(),
                            addInteraction: sinon.spy(),
                            removeInteraction: sinon.spy()
                        })
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/Routing/setActive", true);
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders Directions", () => {
        wrapper = shallowMount(DirectionsComponent, {store, localVue});
        expect(wrapper.find("#routing-directions").exists()).to.be.true;
    });

    it("renders DirectionsBatchProcessingCheckbox", async () => {
        wrapper = shallowMount(DirectionsComponent, {store, localVue});
        wrapper.vm.settings.batchProcessing.enabled = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(RoutingBatchProcessingCheckboxComponent).exists()).to.be.true;
    });

    it("doesn't render DirectionsBatchProcessingCheckbox", async () => {
        wrapper = shallowMount(DirectionsComponent, {store, localVue});
        wrapper.vm.settings.batchProcessing.enabled = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(RoutingBatchProcessingCheckboxComponent).exists()).to.be.false;
    });

    it("renders DirectionsBatchProcessing", async () => {
        wrapper = shallowMount(DirectionsComponent, {store, localVue});
        wrapper.vm.settings.batchProcessing.enabled = true;
        wrapper.vm.settings.batchProcessing.active = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(DirectionsBatchProcessingComponent).exists()).to.be.true;
    });

    it("doesn't render DirectionsBatchProcessing", async () => {
        wrapper = shallowMount(DirectionsComponent, {store, localVue});
        wrapper.vm.settings.batchProcessing.enabled = true;
        wrapper.vm.settings.batchProcessing.active = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(DirectionsBatchProcessingComponent).exists()).to.be.false;
    });

    it("renders RoutingCoordinateInput", async () => {
        wrapper = shallowMount(DirectionsComponent, {store, localVue});
        wrapper.vm.settings.batchProcessing.enabled = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-directions-coordinate-input-form").exists()).to.be.true;
    });

    it("doesn't render RoutingCoordinateInput", async () => {
        wrapper = shallowMount(DirectionsComponent, {store, localVue});
        wrapper.vm.settings.batchProcessing.enabled = true;
        wrapper.vm.settings.batchProcessing.active = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-directions-coordinate-input-form").exists()).to.be.false;
    });

    it("renders routing result", async () => {
        store.commit("Tools/Routing/Directions/setRoutingDirections", {
            duration: 10,
            distance: 10,
            segments: []
        });
        wrapper = shallowMount(DirectionsComponent, {store, localVue});
        wrapper.vm.settings.batchProcessing.enabled = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-directions-result-directions").exists()).to.be.true;
        expect(wrapper.findComponent(RoutingDownloadComponent).exists()).to.be.true;
    });

    it("doesn't render routing result", async () => {
        store.commit("Tools/Routing/Directions/setRoutingDirections", null);
        wrapper = shallowMount(DirectionsComponent, {store, localVue});
        wrapper.vm.settings.batchProcessing.enabled = false;
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#routing-directions-result-directions").exists()).to.be.false;
        expect(wrapper.findComponent(RoutingDownloadComponent).exists()).to.be.false;
    });

    describe("checks if findDirections are called", () => {
        it("should call on changeSpeedProfile", () => {
            wrapper = shallowMount(DirectionsComponent, {store, localVue});
            const findDirectionsSpy = sinon.spy();

            wrapper.vm.findDirections = findDirectionsSpy;
            wrapper.vm.changeSpeedProfile("CAR");
            expect(findDirectionsSpy.calledOnce).to.be.true;
        });

        it("should call on changePreference", () => {
            wrapper = shallowMount(DirectionsComponent, {store, localVue});
            const findDirectionsSpy = sinon.spy();

            wrapper.vm.findDirections = findDirectionsSpy;
            wrapper.vm.changePreference("SHORTEST");
            expect(findDirectionsSpy.calledOnce).to.be.true;
        });

        it("should call on onAddAvoidOption", () => {
            wrapper = shallowMount(DirectionsComponent, {store, localVue});
            const findDirectionsSpy = sinon.spy();

            wrapper.vm.findDirections = findDirectionsSpy;
            wrapper.vm.onAddAvoidOption("HIGHWAYS");
            expect(findDirectionsSpy.calledOnce).to.be.true;
        });

        it("should call on onRemoveAvoidOption", () => {
            wrapper = shallowMount(DirectionsComponent, {store, localVue});
            const findDirectionsSpy = sinon.spy();

            wrapper.vm.findDirections = findDirectionsSpy;
            wrapper.vm.onRemoveAvoidOption("HIGHWAYS");
            expect(findDirectionsSpy.calledOnce).to.be.true;
        });
    });

    it("should toggle kartenmodus AVOID_AREAS => WAYPOINTS", async () => {
        store.commit("Tools/Routing/Directions/setKartenmodus", "AVOID_AREAS");
        wrapper = shallowMount(DirectionsComponent, {store, localVue});
        wrapper.vm.changeSperrflaecheBearbeitenKartenmodus();
        expect(wrapper.vm.kartenmodus).equal("WAYPOINTS");
    });

    it("should toggle kartenmodus WAYPOINTS => AVOID_AREAS", async () => {
        store.commit("Tools/Routing/Directions/setKartenmodus", "WAYPOINTS");
        wrapper = shallowMount(DirectionsComponent, {store, localVue});
        wrapper.vm.changeSperrflaecheBearbeitenKartenmodus();
        expect(wrapper.vm.kartenmodus).equal("AVOID_AREAS");
    });


    it("should toggle kartenmodus DELETE_AVOID_AREAS => WAYPOINTS", async () => {
        store.commit("Tools/Routing/Directions/setKartenmodus", "DELETE_AVOID_AREAS");
        wrapper = shallowMount(DirectionsComponent, {store, localVue});
        wrapper.vm.changeSperrflaecheLoeschenKartenmodus();
        expect(wrapper.vm.kartenmodus).equal("WAYPOINTS");
    });

    it("should toggle kartenmodus WAYPOINTS => DELETE_AVOID_AREAS", () => {
        store.commit("Tools/Routing/Directions/setKartenmodus", "WAYPOINTS");
        wrapper = shallowMount(DirectionsComponent, {store, localVue});
        wrapper.vm.changeSperrflaecheLoeschenKartenmodus();
        expect(wrapper.vm.kartenmodus).equal("DELETE_AVOID_AREAS");
    });

    it("should reset all user settings", async () => {
        const removeWaypoint = sinon.spy(),
            setRoutingDirections = sinon.spy(),
            clearDirectionsAvoidSource = sinon.spy();

        store.commit("Tools/Routing/Directions/setDirectionsAvoidSource", {
            clear: clearDirectionsAvoidSource
        });
        wrapper = shallowMount(DirectionsComponent, {store, localVue});
        wrapper.vm.setRoutingDirections = setRoutingDirections;
        wrapper.vm.removeWaypoint = removeWaypoint;
        wrapper.vm.reset();
        expect(removeWaypoint.calledTwice).to.be.true;
        expect(setRoutingDirections.calledOnce).to.be.true;
        expect(clearDirectionsAvoidSource.calledOnce).to.be.true;
    });
});
