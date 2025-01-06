<script>
import {mapActions, mapGetters} from "vuex";
import {
    ChevronLeft,
    ChevronRight,
} from "lucide-vue-next";
import colors from "../../../shared/js/utils/amarex-colors.json";

/**
 * Menu Toggle Button Amarex
 * @module modules/MenuToggleButtonAmarex
 * @vue-prop {String} side - Defines in which menu the component is being rendered.
 */
export default {
    name: "MenuToggleButtonAmarex",
    components: {
        ChevronLeft,
        ChevronRight,
    },
    props: {
        side: {
            type: String,
            default: "mainMenu",
            validator: value => value === "mainMenu" || value === "secondaryMenu"
        }
    },
    computed: {
        ...mapGetters("Menu", ["mainExpanded", "secondaryExpanded", "mainToggleButtonIcon", "secondaryToggleButtonIcon"]),
    },
    methods: {
        ...mapActions("Menu", ["toggleMenu"])
    },
    data () {
        return {
            colors: colors
        };
    }
};
</script>

<template>
    <button
        :id="side + '-toggle-button'"
        class="menu-toggle-button"
        :class="[
            'toggle-button-' + side,
            {'expanded': mainExpanded && side === 'mainMenu' || secondaryExpanded && side === 'secondaryMenu'}
        ]
        "
        type="button"
        :aria-label="$t('common:modules.menu.ariaLabelOpen')"
        @click="toggleMenu(side)"
    >
        <ChevronLeft
            v-if="(side === 'mainMenu' && mainExpanded) || (side === 'secondaryMenu' && !secondaryExpanded)"
            :color="colors.amarex_secondary"
            :size="24"
        />
        <ChevronRight
            v-else-if="(side === 'mainMenu' && !mainExpanded) || (side === 'secondaryMenu' && secondaryExpanded)"
            :color="colors.amarex_secondary"
            :size="24"
        />
    </button>
</template>

<style lang="scss" scoped>
    @import "~variables";


    .menu-toggle-button {
        background: $amarex_primary;
        right: 20px;
        @include boxShadow();
        @include radius();
        flex-grow: 0;
        flex-shrink: 0;
        z-index: 4;
        top: calc(50vh - 1.5rem);
        height: 3rem;
        width: 3rem;
        position: relative;
    }

    .toggle-button-mainMenu {
        left: 0;
        transform: none;
        &.expanded {
            transform: translateX(-10px);
            display: block;
        }
    }
    
    .toggle-button-secondaryMenu {
        right: 0;
        transform: none;
        &.expanded {
            transform: translateX(10px);
            display: block;
        }
    }

    .expanded {
        display: none;
    }

</style>
