<script>
import {mapGetters, mapMutations} from "vuex";
import SearchBarSuggestionListItem from "./SearchBarSuggestionListItem.vue";

/**
 * Searchbar result list to show the categorized overview or single search results.
 * @module modules/searchBar/components/SearchBarSuggestionList
 * @vue-props {Object} limitedSortedSearchResults - Results the limited and sorted search results.
 * @vue-data {Array} currentShowAllList - Array of the single search results to show from the 'show all' button.
 */
export default {
    name: "SearchBarSuggestionList",
    components: {
        SearchBarSuggestionListItem
    },
    props: {
        limitedSortedSearchResults: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            currentShowAllList: []
        };
    },
    computed: {
        ...mapGetters("Modules/SearchBar", [
            "minCharacters",
            "searchInput",
            "searchResults",
            "searchResultsActive",
            "showAllResults",
            "currentSide"
        ]),
        ...mapGetters("Menu", [
            "menuBySide"
        ])
    },
    methods: {
        ...mapMutations("Modules/SearchBar", [
            "setCurrentAvailableCategories",
            "setShowAllResults",
            "setShowAllResultsSearchInterfaceInstance"
        ]),
        ...mapMutations("Menu", [
            "setNavigationCurrentComponentBySide",
            "setNavigationHistoryBySide",
            "setCurrentComponent",
            "setCurrentComponentBySide"
        ])
    }
};
</script>

<template lang="html">
    <div
        v-if="searchInput?.length >= minCharacters && searchResultsActive && searchResults?.length > 0"
        class="suggestions-container"
    >
        <div
            v-for="categoryItem in limitedSortedSearchResults.results.availableCategories"
            id="search-bar-suggestion-list"
            :key="categoryItem"
        >
            <!-- Masterportal origin search resultss suggestion header -->
            <div
                v-for="(item, index) in showAllResults===false ? limitedSortedSearchResults.results : limitedSortedSearchResults.currentShowAllList"
                :key="item.id + '-' + index"
            >
                <p
                    v-if="item.category===categoryItem"
                    :id="'suggestion_searchInputLi' + index"
                    class="mb-0"
                >
                    <SearchBarSuggestionListItem
                        :search-suggestion="item"
                    />
                </p>
            </div>
            <!-- Masterportal origin show all button -->
        </div>
    </div>
</template>

<style lang="scss" scoped>
button {
    span {
        margin-top: .1rem;
        margin-left: .25rem;
    }
}
.suggestions-container {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 70vH;
}
.showAllSection {
    display: flex;
    justify-content: right;
    align-items: right;
}
</style>
