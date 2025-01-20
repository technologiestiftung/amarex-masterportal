<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import SearchBarSuggestionList from "./SearchBarSuggestionList.vue";
import SearchBarResultList from "./SearchBarResultList.vue";
import {
    Search
} from "lucide-vue-next";
import colors from "../../../shared/js/utils/amarex-colors.json";

/**
 * Searchbar to access search results.
 * @module modules/searchBar/components/SearchBar
 * @vue-computed {String} searchInputValue - The v-bind of search input value.
 * @vue-computed {Object} limitedSortedSearchResults - Results the limited and sorted search results.
 */
export default {
    name: "SearchBar",
    components: {
        SearchBarResultList,
        SearchBarSuggestionList,
        Search
    },
    props: {
        clickAction: {
            type: Function,
            default: undefined,
            required: false
        },
        menuWidth: {
            type: Number,
            required: false
        }
    },
    data() {
        return {
            currentComponentSide: undefined,
            layerSelectionPlaceHolder: this.placeholder,
            colors
        };
    },
    computed: {
        ...mapGetters("Modules/SearchBar", [
            "configPaths",
            "minCharacters",
            "placeholder",
            "searchInput",
            "searchInterfaceInstances",
            "searchResults",
            "showAllResults",
            "suggestionListLength",
            "showAllResultsSearchCategory",
            "addLayerButtonSearchActive",
            "type",
            "currentSide"
        ]),
        ...mapGetters("Menu",
            {menuCurrentComponent: "currentComponent", previousNavigationEntryText: "previousNavigationEntryText"}
        ),
        ...mapGetters([
            "portalConfig"
        ]),
        /**
         * v-bind of search input value.
         */
        searchInputValue: {
            get () {
                return this.searchInput;
            },
            set (searchInput) {
                this.setSearchInput(searchInput);
            }
        },
        /**
         * Check if search should be activated.
         * @returns {Boolean} True if search should be executed.
         */
        searchActivated () {
            return this.searchInputValue?.length >= parseInt(this.minCharacters, 10);
        },
        /**
         * Updates the categories to unique categories.
         * @returns {Object} The searchresults with unique categories.
         */
        searchResultsWithUniqueCategories () {
            if (this.searchInterfaceInstances.every(searchInterfaceInstance => searchInterfaceInstance.searchState !== "running")) {
                const categories = [...new Set(this.searchResults.map(searchResult => searchResult.category))];

                categories.forEach(category => {
                    const searchResultsByCategory = this.searchResults.filter(searchResult => searchResult.category === category),
                        searchInterfaceIds = [...new Set(searchResultsByCategory.map(searchResult => searchResult.searchInterfaceId))];

                    if (searchInterfaceIds.length > 1) {
                        let count = 0;

                        searchInterfaceIds.forEach(searchInterfaceId => {
                            searchResultsByCategory.forEach(searchResult => {
                                if (searchResult.searchInterfaceId === searchInterfaceId) {
                                    searchResult.category = searchResult.category + "_" + count;
                                }
                            });

                            ++count;
                        });
                    }
                });
            }

            return this.searchResults;
        },

        /**
         * Sorts the results according the configured search providers and prepare the suggestionlist with the limit of suggestionListLength, updates searchSuggestions
         * Prepares currentShowAllList (used to show all results of a category).
         * @returns {Object} results the limited and sorted search results.
         */
        limitedSortedSearchResults () {
            const results = {},
                currentShowAllList = [];

            results.categoryProvider = {};
            this.setSearchSuggestions([]);
            results.availableCategories = [];
            this.searchInterfaceInstances.forEach(searchInterfaceInstance => {
                for (const [index, value] of Object.entries(this.searchResultsWithUniqueCategories)) {
                    if (value.searchInterfaceId === searchInterfaceInstance.searchInterfaceId) {
                        results[value.category + "Count"] = results[value.category + "Count"] === undefined ? 1 : ++results[value.category + "Count"];


                        if (results.availableCategories.includes(value.category) === false) {
                            results.availableCategories.push(value.category);
                            results.categoryProvider[value.category] = value.searchInterfaceId;
                        }

                        currentShowAllList.push(value);

                        if (results[value.category + "Count"] <= this.suggestionListLength) {
                            results[index] = value;
                            this.addSuggestionItem(value);
                        }
                        if (value.imgPath) {
                            results[value.category + "ImgPath"] = value.imgPath;
                        }
                        if (value.icon) {
                            results[value.category + "Icon"] = value.icon;
                        }
                    }
                }
            });

            return {results: results, currentShowAllList: currentShowAllList};
        }
    },
    watch: {
        /**
        * Watcher to check the current component
        */
        currentComponentSide: {
            handler (newVal) {
                if (newVal === "root" || (newVal === "layerSelection" && this.addLayerButtonSearchActive === true)) {
                    this.$refs?.searchInput.blur();
                    if (newVal === "root") {
                        this.setSearchResultsActive(false);
                        this.navigateBack(this.currentSide);
                        if (this.side) {
                            this.switchToRoot(this.side);
                        }
                    }
                }
                if (newVal === "layerSelection" && this.addLayerButtonSearchActive === true) {
                    this.layerSelectionPlaceHolder = "common:modules.searchBar.search";
                }
                else {
                    this.layerSelectionPlaceHolder = this.placeholder;
                }
            },
            deep: true
        },
        /**
        * Watcher to check the searchInputValue for layerSelection module
        */
        searchInputValue: {
            handler (value) {
                if (value === "") {
                    this.removePointMarker();
                    this.removePolygonMarker();
                }
                else {
                    this.checkCurrentComponent(this.currentComponentSide);
                }
            },
            deep: true
        }
    },
    mounted () {
        this.checkLayerSelectionSearchConfig();
        this.setCurrentSide(this.portalConfig?.mainMenu?.searchBar !== undefined ? "mainMenu" : "secondaryMenu");
        this.currentComponentSide = this.menuCurrentComponent(this.currentSide).type;
        this.initializeModule({configPaths: this.configPaths, type: this.type});
        this.overwriteDefaultValues();
        this.instantiateSearchInterfaces(this.$searchInterfaceAddons);
        this.focusInput();
    },
    methods: {
        ...mapActions(["initializeModule"]),
        ...mapActions("Maps", ["removePointMarker", "removePolygonMarker"]),
        ...mapActions("Modules/SearchBar", [
            "instantiateSearchInterfaces",
            "overwriteDefaultValues",
            "activateActions",
            "startLayerSelectionSearch",
            "checkLayerSelectionSearchConfig",
            "search"
        ]),
        ...mapActions("Menu", [
            "navigateBack"
        ]),
        ...mapMutations("Modules/SearchBar", [
            "addSuggestionItem",
            "setSearchInput",
            "setSearchResultsActive",
            "setCurrentAvailableCategories",
            "setSearchSuggestions",
            "setCurrentSide"
        ]),
        ...mapMutations("Menu", [
            "switchToRoot"
        ]),
        /**
         * Starts the search in searchInterfaces, if min characters are introduced, updates the result list.
         * @param {String} currentComponentSide Current component type
         * @returns {void}
         */
        startSearch (currentComponentSide) {
            if (this.searchActivated) {
                if (currentComponentSide === "root") {
                    this.clickAction();
                }
                this.setSearchResultsActive(true);
                this.search({searchInput: this.searchInputValue});
            }
        },
        /**
         * Sets the focus to the searchbar input.
         * @returns {void}
         */
        focusInput () {
            this.$refs.searchInput.focus();
        },
        /**
         * Handles the input action behavior of the search
         * @param {String} currentComponentType Current component type
         * @returns {void}
         */
        checkCurrentComponent (currentComponentType) {
            if (currentComponentType === "root") {
                this.clickAction();
            }
            else if (currentComponentType === "layerSelection") {
                if (this.searchInputValue?.length === 0) {
                    this.navigateBack(this.currentSide);
                    this.startLayerSelectionSearch(this.currentSide);
                    this.setCurrentAvailableCategories(this.showAllResultsSearchCategory);

                    this.startSearch();
                }
                if (this.searchInputValue.length >= this.minCharacters) {
                    this.startLayerSelectionSearch(this.currentSide);
                    this.setCurrentAvailableCategories(this.showAllResultsSearchCategory);

                    this.startSearch();
                }
            }
            else {
                this.startSearch();
            }
        },
        /**
         * Zooms to and sets a marker at the given search result
         * @param {String} searchInputValue the input value
         * @returns {void}
         */
        zoomToAndMarkSearchResult (searchInputValue) {
            if (searchInputValue !== undefined) {
                this.removePointMarker();
                this.searchResults.forEach(searchResult => {
                    if (searchResult.category.startsWith("Adresse") || searchResult.category.startsWith("Straße")) {
                        if (searchInputValue.toLowerCase() === searchResult.name.toLowerCase()) {
                            this.activateActions({searchResult, actionType: "onClick"});
                        }
                    }
                });
            }
        }
    }
};
</script>

<template lang="html">
    <div id="search-bar" :style="{ maxWidth: this.menuWidth + 'px' }">
        <div class="input-group">
        <!-- Masterportal origin: change SearchBar Icon  -->
            <Search
                :color="colors.amarex_grey_dark"
                :size="16"
            />
            <input
                id="searchInput"
                ref="searchInput"
                v-model="searchInputValue"
                type="search"
                class="form-control"
                :placeholder="$t(layerSelectionPlaceHolder)"
                :aria-label="$t(layerSelectionPlaceHolder)"
                @keydown.enter="zoomToAndMarkSearchResult(searchInputValue), startSearch(currentComponentSide)"
            >
        </div>
        <SearchBarSuggestionList
            v-if="!showAllResults"
            :limited-sorted-search-results="limitedSortedSearchResults"
        />
        <SearchBarResultList
            v-else-if="showAllResults"
            :limited-sorted-search-results="limitedSortedSearchResults"
        />
        <!-- Masterportal origin: added empty states for user to input text to be able to search -->
        <p v-if="!searchInputValue.length && currentComponentSide === 'searchbar'" class="p-3">Bitte gib eine Adresse ein, die du suchen willst...</p>
        <p v-else-if="!!searchInputValue.length && searchInputValue.length < minCharacters && currentComponentSide === 'searchbar'" class="p-3">Bitte gib min. {{ minCharacters }} Zeichen ein...</p>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
    // Masterportal origin: change SearchBar Stylings
    .input-group {
        border: 1px solid $amarex_grey_mid;
        align-items: center !important;
    }
    #search-bar {
        margin-top: 24px;
        & > div:not(.suggestions-container) {
            margin-left: 0 !important;
            margin-right: 0 !important;
            margin-top: 0 !important;
            overflow: hidden;
            padding: 10px 16px;
            margin-bottom: 24px;
        }
        #search-button {
            border-top-right-radius: 5px;
            border-bottom-right-radius: 5px;
            cursor: pointer;
        }
        .input-label {
            color: $placeholder-color;
        }
        button {
            border: none !important;
            background: $amarex_primary;
        }
        input {
            border: none !important;
            padding: 0 !important;
            transform: translateY(1px);
            margin-left: 10px !important;
            &::placeholder {
                color: $amarex_grey_dark !important;
                font-family: Arial;
                font-size: 16px;
                font-style: normal;
                font-weight: 400;
                line-height: 16px;
            }
        }
    }
</style>

