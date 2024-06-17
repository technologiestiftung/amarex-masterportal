import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import {createStore} from "vuex";
import StatisticDashboardFilter from "../../../components/StatisticDashboardFilter.vue";
import indexStatisticDashboard from "../../../store/indexStatisticDashboard";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/statiscticDashboard/components/StatisticDashboardFilter.vue", () => {
    const timeStepsFilter = [
            "Die letzten 5 Jahre",
            "Die letzten 10 Jahre",
            "Alle Jahre"
        ],
        regions = [
            {value: "Harburg", label: "Harburg"},
            {value: "Lübeck", label: "Lübeck"},
            {value: "Schwerin", label: "Schwerin"},
            {value: ["Harburg", "Lübeck", "Schwerin"], label: "Alle Gebiete"}
        ];

    let store;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        StatisticDashboard: indexStatisticDashboard
                    }
                }
            }
        });
    });

    afterEach(sinon.restore);

    describe("Component DOM", () => {
        it("should exist", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.exists()).to.be.true;
        });
        it("should render an accordion for statistics selection", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#filter-accordion-statistic").exists()).to.be.true;
        });
        it("should render an accordion for regions selection", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#filter-accordion-region").exists()).to.be.true;
        });
        it("should render an accordion for dates selection", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#filter-accordion-date").exists()).to.be.true;
        });
        it("should render a flat button component", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.findComponent({name: "FlatButton"}).exists()).to.be.true;
        });
    });
    describe("Computed", () => {
        describe("statisticsNames", () => {
            it("should return an empty array", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.statisticsNames).to.be.an("array").that.is.empty;

            });
            it("should return the names of the given statistics", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                await wrapper.setProps({
                    statistics: {
                        "stat1": {
                            category: "Kategorie 1",
                            name: "Stat eins"
                        }
                    }
                });

                expect(wrapper.vm.statisticsNames).to.deep.equal([{key: "stat1", name: "Stat eins"}]);

            });
        });
        describe("selectedStatisticsNames", () => {
            it("should return an empty array", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false,
                        statistics: {
                            "stat1": {
                                category: "Kategorie 1",
                                name: "Stat eins"
                            },
                            "stat2": {
                                category: "Kategorie 2",
                                name: "Stat zwei"
                            }
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setSelectedStatistics({"stat1": {
                    category: "Kategorie 1",
                    name: "Stat eins"
                }});
                expect(wrapper.vm.selectedStatisticsNames).to.deep.equal([{key: "stat1", name: "Stat eins"}]);
            });
        });
    });

    describe("Watchers", () => {
        describe("selectedCategory", () => {
            it("should emit 'resetStatistics' and 'changeCategory' with the name of", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setSelectedCategories({name: "Kategorie 1"});
                await wrapper.vm.$nextTick();
                expect(wrapper.emitted()).to.have.keys(["resetStatistics", "changeCategory", "changeFilterSettings"]);
                expect(wrapper.emitted().changeCategory).to.deep.equal([["Kategorie 1"]]);
            });
        });
    });

    describe("User Interactions", () => {
        it("should emit 'toggleFilter' if ths user click the 'back' button", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                }),
                flatButton = wrapper.findComponent({name: "FlatButton"});

            flatButton.vm.interaction();
            expect(wrapper.emitted()).to.have.keys(["resetStatistics", "toggleFilter"]);
        });
    });

    describe("Methods", () => {
        describe("allFilterSettingsSelected", () => {
            it("should return 1 if all given values are not empty", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.allFilterSettingsSelected({name: "name"}, [2], [3])).to.be.equals(1);

            });
            it("should return false if the first given value is not an object", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.allFilterSettingsSelected(undefined, [2], [3])).to.be.false;

            });
        });

        describe("addStatisticToSelect", () => {
            it("should add a statistic if it is not already selected", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false,
                        statistics: {
                            "stat1": {
                                category: "Kategorie 1",
                                name: "Stat eins"
                            },
                            "stat2": {
                                category: "Kategorie 2",
                                name: "Stat zwei"
                            },
                            "stat3": {
                                category: "Kategorie 3",
                                name: "Stat drei"
                            }
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.addStatisticToSelect([{key: "stat1", name: "Stat eins"}, {key: "stat3", name: "Stat drei"}]);
                expect(wrapper.vm.selectedStatistics).to.deep.equals({"stat1": {name: "Stat eins", category: "Kategorie 1"}, "stat3": {name: "Stat drei", category: "Kategorie 3"}});

            });
        });
    });
});
