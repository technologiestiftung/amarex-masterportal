<script>
import LayerTree from "../../layerTree/components/LayerTree.vue";
import MenuContainerBodyRootItems from "./MenuContainerBodyRootItems.vue";
import {mapGetters} from "vuex";

/**
 * @module modules/MenuContainerBodyRoot
 * @vue-prop {String} side - The side in which the menu component is being rendered.
 * @vue-computed {Object} menu - The menu configuration for the given menu.
 */
export default {
    name: "MenuContainerBodyRoot",
    components: {
        LayerTree,
        MenuContainerBodyRootItems
    },
    data() {
    return {
        // Menu Steps
      steps: [
        { label: '1. Projekt Starten', component: 'projectStarter' },
        { label: '2. Hintergrundkarten', component: 'baseMaps' },
        { label: '3. Themenkarten', component: 'themeMaps' },
        { label: '4. Maßnahmenpotentiale', component: 'actionPotentials' },
        { label: '5. Wasserhaushalt berechnen', component: 'abimoHandler' },
        { label: '6. Eigene Notizen', component: 'draw' },
        { label: '7. Eigene Notizen', component: 'draw_old' },
        { label: 'X. ESB Tool', component: 'esbTool' },
        { label: 'X. Multikriterien Analyse', component: 'multiCriteria' },
        { label: 'X. Report zusammenstellen', component: 'reportPrinter' },
        { label: 'XX. Projekt speichern/exportieren', component: 'projectDownloader' }
      ],
      currentStepIndex: 0,
      
    }
  },
    props: {
        /** Defines in which menu the component is being rendered */
        side: {
            type: String,
            default: "mainMenu",
            validator: value => value === "mainMenu" || value === "secondaryMenu"
        }
    },
    computed: {
        ...mapGetters("Menu", [
            "mainMenu",
            "secondaryMenu",
            "titleBySide"
        ]),
        /**
         * @returns {Object} Menu configuration for the given menu.
         */
        menu () {
            return this.side === "mainMenu" ? this.mainMenu : this.secondaryMenu;
        },
        currentTitle () {
            return this.currentComponentName(this.side);
        }
    },
    mounted() {
        if (this.side === 'mainMenu' && this.steps.length > 0) {
            this.selectStep(this.steps[2], 2);
        }
    },
    methods: {
        /**
         * Returns the path for a section inside the menu this component is rendered in.
         * @param {Number} sectionIndex Index inside of a section of a menu.
         * @returns {Array} Contains the path for a section.
         */
        path (sectionIndex) {
            return [this.side, "sections", sectionIndex];
        },
        /**
         * Selects a step in the menu.
         * @param {Object} step The step to select.
         * @returns {void}
         */
        selectStep(step, index) {
            this.currentStepIndex = index;
            this.$store.dispatch('Menu/changeCurrentComponent', {
            type: step.component,
            side: 'secondaryMenu',
            props: { name: step.label }
            });
        }
    }
};
</script>

<template>
    <div
        :id="'mp-body-root-'+side"
    >       
        <div class="stepper-root mb-5 d-flex flex-column gap-2" v-if="side === 'mainMenu'">
            <button 
                v-for="(step, index) in steps" 
                :key="index"
                class="btn"
                :class="{ 'btn-primary': index === currentStepIndex, 'btn-secondary': index !== currentStepIndex }"
                @click="selectStep(step, index)"
            >
                {{ step.label }}
            </button>
        </div>

        <!-- Masterportal origin Layer Tree  -->
        <LayerTree v-if="side === 'mainMenu'" />
        
        <template
            v-for="(_, key) in menu.sections"
            :key="key"
        >
            <MenuContainerBodyRootItems
                :id-appendix="side"
                :side="side"
                :path="path(key)"
            />
            <hr>
        </template>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

</style>