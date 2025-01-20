<script>
import {mapActions, mapGetters} from "vuex";
import {
  ChevronLeft,
} from "lucide-vue-next";
import colors from "../../../shared/js/utils/amarex-colors.json";   

/**
 * Menu Navigation
 * @module modules/MenuNavigation
 * @vue-prop {String} side - Defines in which menu the component is being rendered.
 * @vue-computed {String} previousNavigation - The previous navigation entry.
 * @vue-computed {String} currentTitle - The current components name.
 */
export default {
    name: "MenuNavigation",
    components: {
        ChevronLeft,
    },
    data() {
        return {
            colors,
        };
    },
    props: {
        /** Defines in which menu the component is being rendered */
        side: {
            type: String,
            required: true,
            validator: value => value === "mainMenu" || value === "secondaryMenu"
        }
    },
    computed: {
        ...mapGetters("Menu", ["previousNavigationEntryText", "currentComponentName"]),
        ...mapGetters(["isMobile"]),

        previousNavigation () {
            return this.previousNavigationEntryText(this.side);
        },

        currentTitle () {
            return this.currentComponentName(this.side);
        }
    },
    methods: {
        ...mapActions("Menu", ["navigateBack", "resetMenu"])
    }
};
</script>

<template>
    <div
        v-if="previousNavigation"
        :id="'mp-menu-navigation-' + side"
    >
        <!-- Masterportal origin: change Logo -->
        <div class="logo-container">
            <img
                id="logo-in-search"
                src="../../../../portal/amarex/resources/img/amarex_logo_webtool.png"
                alt="Anpassung des Managements von Regenwasser an Extremereignisse"
            >
        </div>
        <!-- Masterportal origin Menu Navigation -->
        <div
            class="mp-menu-navigation mt-4"
        >
            <!-- Masterportal origin: hide back functionality in mainMenu -->
            <!-- <a
                :id="'mp-navigation-' + side"
                class="pt-2 mp-menu-navigation-link"
                href="#"
                @click="navigateBack(side)"
                @keypress="navigateBack(side)"
            >
                <h6 class="mp-menu-navigation-link-text mb-1"><p class="bi-chevron-left me-2" />{{ previousNavigation }}</h6>
                <h6 class="mp-menu-navigation-link-text mb-1"><p class="bi-chevron-left me-2" />Zurück</h6>
            </a> -->
        
            <!-- Masterportal origin: update reset button logic (add  && side === 'mainMenu' to v-if) -->
            <button
                v-if="!isMobile && side === 'mainMenu'"
                :id="'mp-menu-navigation-reset-button-' + side"
                type="button"
                class="mp-menu-navigation-reset-button"
                @click="resetMenu(side)"
            >
            <ChevronLeft
                :color="colors.amarex_grey_dark"
                :size="24"
            />
            </button>
        </div>

        <!-- Masterportal origin: remove Menu Title -->
        <!-- <h4
        v-if="currentTitle !== 'none'"
        class="mp-menu-navigation-moduletitle mb-4"
        >
        {{ currentTitle }}
    </h4> -->
</div>
</template>

<style lang="scss" scoped>
@import "~variables";

// Masterportal origin: adjust CSS for new logo
.logo-container {
    width: 100%;
    display: flex;
    #logo-in-search {
        width: auto;
        height: 32px;
        display: block;
    }
}
.mp-menu-navigation-reset-button {
    border: none;
    background: none;
    margin: 0;
    padding: 0;
    outline: 0;
}
.mp-menu-navigation{
    display: flex;
    justify-content: space-between;

    &-link {
        display: flex;
        color: $black;

        &-text{
        display: flex;
    }
    }
}

.mp-menu-navigation-moduletitle{
    display: flex;
}

</style>
