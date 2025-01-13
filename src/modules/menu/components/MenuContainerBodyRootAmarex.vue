<script>
import LayerTree from "../../layerTree/components/LayerTree.vue";
import MenuContainerBodyRootItems from "./MenuContainerBodyRootItems.vue";
import {mapGetters,mapActions,mapMutations} from "vuex";
import { CircleCheckBig, LoaderCircle } from 'lucide-vue-next';
import colors from '../../../shared/js/utils/amarex-colors.json';

/**
 * @module modules/MenuContainerBodyRoot
 * @vue-prop {String} side - The side in which the menu component is being rendered.
 * @vue-computed {Object} menu - The menu configuration for the given menu.
 */
export default {
    name: "MenuContainerBodyRoot",
    components: {
        LayerTree,
        MenuContainerBodyRootItems,
        CircleCheckBig,
        LoaderCircle
    },
    data() {
        return {
            // Masterportal origin Menu Steps
            steps: [
                // { label: 'Projekt Starten', component: 'projectStarter' },
                { label: 'Hintergrundkarten', component: 'baseMaps' },
                { label: 'Themenkarten', component: 'themeMaps' },
                // { label: 'Maßnahmenpotentiale', component: 'actionPotentials' },
                { label: 'Wasserhaushalt berechnen', component: 'abimoHandler' },
                // { label: 'Eigene Ebenen', component: '?' },
                // { label: '6. Geodaten importieren', component: 'fileImporter' },
                // { label: '7. Features listen', component: 'featureLister' },
                // { label: 'X. Features untersuchen', component: 'getFeatureInfo' },
                // { label: '9. Eigene Notizen', component: 'draw' },
                // { label: 'X. Eigene Notizen', component: 'draw_old' },
                // { label: 'X. ESB Tool', component: 'esbTool' },
                // { label: 'X. Print', component: 'print' },
                // { label: 'X. Multikriterien Analyse', component: 'multiCriteria' },
                // { label: 'X. Report zusammenstellen', component: 'reportPrinter' },
                // { label: 'X. Projekt speichern/exportieren', component: 'projectDownloader' }
            ],
            currentStepIndex: 0,
            colors
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
            "titleBySide", 
            "secondaryExpanded"
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
            this.selectStep(this.steps[0], 0);
        }
    },
    methods: {
        ...mapActions("Menu", ["toggleMenu"]),
        ...mapMutations("Modules/GetFeatureInfo", [
            "setVisible"
        ]),
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
        selectStep(step, index, clicked) {
            const clickEvent = () => {
                if (clicked && !this.secondaryExpanded) {
                    console.log('expand secondary menu');
                    this.toggleMenu('secondaryMenu');
                }
                this.currentStepIndex = index;
                this.$store.dispatch('Menu/changeCurrentComponent', {
                    type: step.component,
                    side: 'secondaryMenu',
                    props: { name: step.label }
                });
            }
            const targetElement = document.querySelector('.gfi');
            if (targetElement) {
                this.setVisible(false)
                setTimeout(() => {
                    clickEvent();
                }, 100);
            } else {
                clickEvent();
            }
            
        }
    }
};
</script>

<template>
    <div
        :id="'mp-body-root-'+side" v-if="side === 'mainMenu'"
    >       
        
        <div class="stepper-root d-flex flex-column" v-if="side === 'mainMenu'">
            <button 
                v-for="(step, index) in steps" 
                :key="index"
                class="step-indicator"
                :class="{ 'active': index === currentStepIndex }"
                @click="selectStep(step, index, true)"
            >
                <p>{{ step.label }}</p>
            </button>
        </div>

    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.stepper-root {
    gap: 8px;
    .step-indicator {
        border: none;
        background: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        border-left: 1px solid white;
        &.active {
            background: $amarex_secondary_mid;
            border-left: 1px solid $amarex_secondary;
        }
        p {
            color: $amarex_secondary;
            text-align: left;
            user-select: none;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 18px;
            font-style: normal;
            font-weight: 400;
            line-height: 24px;
        }
    }
}

</style>
