<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import LayerSelectionTreeNode from "../../../src/modules/layerSelection/components/LayerSelectionTreeNode.vue";
import { treeSubjectsKey } from "../../../src/shared/js/utils/constants";
import sortBy from "../../../src/shared/js/utils/sortBy";
import layerFactory from "../../../src/core/layers/js/layerFactory";
import LayerTreeAmarex from "../../../src/modules/layerTree/components/LayerTreeAmarex.vue";
import Layer from "../../../src/modules/layerTree/components/LayerComponent.vue";
import LayerInformation from "../../../src/modules/layerInformation/components/LayerInformation.vue";
import {
  CirclePlus,
  CircleMinus,
  ChevronDown,
  ChevronUp,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-vue-next";
import colors from "../../../src/shared/js/utils/amarex-colors.json";
import SliderItem from "../../../src/shared/modules/slider/components/SliderItem.vue";

export default {
  name: "ThemeMaps",
  components: {
    LayerSelectionTreeNode,
    LayerTreeAmarex,
    Layer,
    LayerInformation,
    CirclePlus,
    CircleMinus,
    ChevronDown,
    ChevronUp,
    MapIcon,
    ChevronLeft,
    ChevronRight,
    Settings,
    SliderItem,
  },
  data() {
    return {
      colors,
      showInfo: null,
      openAccordions: [],
      allThemeMapsGroups: [],
      selectedThemeMap: null,
    };
  },
  computed: {
    ...mapGetters([
      "allLayerConfigsStructured",
      "activeOrFirstCategory",
      "allCategories",
      "portalConfig",
      "allLayerConfigs",
    ]),
    ...mapGetters("Maps", ["mode"]),
    ...mapGetters("Modules/SearchBar", [
      "searchInput",
      "addLayerButtonSearchActive",
      "currentSide",
      "showAllResults",
    ]),
    ...mapGetters("Modules/ThemeMaps", [
      "themeMapsConfs",
      "lastThemeMapsFolderNames",
      "layerInfoVisible",
    ]),
    categorySwitcher() {
      return this.portalConfig?.tree?.categories;
    },
  },
  created() {
    this.initializeComponent();
  },
  mounted() {
    this.themeMapsConfs[0].elements.forEach((themeMap) => {
      this.allThemeMapsGroups.push(themeMap);
    });
    const getCacheSelectedThemeMap = localStorage.getItem(
      "cacheSelectedThemeMap",
    );
    this.selectedThemeMap = getCacheSelectedThemeMap
      ? JSON.parse(getCacheSelectedThemeMap)
      : null;
    const getCacheOpenAccordions = localStorage.getItem("cacheOpenAccordions");
    this.openAccordions = getCacheOpenAccordions
      ? JSON.parse(getCacheOpenAccordions)
      : [];
  },
  unmounted() {
    localStorage.setItem(
      "cacheSelectedThemeMap",
      JSON.stringify(this.selectedThemeMap),
    );
    localStorage.setItem(
      "cacheOpenAccordions",
      JSON.stringify(this.openAccordions),
    );
    this.cleanupComponent();
  },
  methods: {
    ...mapActions(["changeCategory", "replaceByIdInLayerConfig"]),
    ...mapActions("Modules/ThemeMaps", [
      "navigateBack",
      "navigateForward",
      "reset",
      "setLayerInfoVisible",
    ]),
    ...mapMutations("Modules/ThemeMaps", ["setHighlightLayerId"]),
    ...mapActions("Modules/LayerSelection", ["changeVisibility"]),
    ...mapActions("Modules/LayerInformation", ["startLayerInformation"]),
    ...mapActions("Menu", ["navigateBack", "resetMenu"]),
    ...mapActions("Modules/LayerTree", ["updateTransparency"]),
    initializeComponent() {
      this.initializeThemeMapsConfs();
    },
    cleanupComponent() {
      if (!this.layerInfoVisible) {
        this.themeMapsConfs.forEach((conf) => {
          this.changeVisibility({ layerId: conf.id, value: false });
        });
        this.reset();
      }
      this.setHighlightLayerId(null);
    },
    initializeThemeMapsConfs() {
      const configs = this.allLayerConfigsStructured(treeSubjectsKey);
      const themeMapsConfs = configs.filter(
        (conf) => conf.name === "Themenkarten",
      );
      this.navigateForward({ lastFolderName: "root", themeMapsConfs });
    },
    themeMapClick(conf) {
      const isLayerVisible = conf.visibility;
      this.changeVisibility({ layerId: conf.id, value: !isLayerVisible });
    },
    checkIfAllAreChecked(themeMap) {
      let allAreChecked = true;
      themeMap.elements.forEach((subThemeMap) => {
        if (!subThemeMap.visibility) {
          allAreChecked = false;
        }
      });
      return allAreChecked;
    },
    clickedSelectAll(themeMapGroup) {
      let checkedSelectAll = null;
      if (!this.checkIfAllAreChecked(themeMapGroup)) {
        checkedSelectAll = true;
      } else {
        checkedSelectAll = false;
      }
      themeMapGroup.elements.forEach((subThemeMap) => {
        this.changeVisibility({
          layerId: subThemeMap.id,
          value: checkedSelectAll,
        });
      });
    },
    openInfo(conf) {
      if (conf?.id === this.showInfo?.id) return (this.showInfo = null);
      console.log("openInfo in ThemeMaps conf :>> ", conf);
      let findFolderName;
      this.themeMapsConfs.forEach((themeMap) => {
        themeMap.elements.forEach((subThemeMap) => {
          if (subThemeMap.elements.some((element) => element.id === conf.id)) {
            findFolderName = subThemeMap;
          }
        });
      });
      this.showInfo = {
        ...conf,
        folderName: findFolderName.name,
      };
      this.startLayerInformation(conf);
      // this.navigateBack("mainMenu");
      this.resetMenu("mainMenu");
    },
    hideInfo() {
      this.showInfo = null;
    },
    toggleAccordion(target) {
      const index = this.openAccordions.indexOf(target);
      if (index === -1) {
        this.openAccordions.push(target);
      } else {
        this.openAccordions.splice(index, 1);
      }
    },
    isAccordionOpen(target) {
      return this.openAccordions.includes(target);
    },
    openTransparencySubMenu(themeMap) {
      if (this.selectedThemeMap?.id === themeMap.id) {
        this.selectedThemeMap = null;
      } else {
        this.selectedThemeMap = themeMap;
      }
    },
    updateTransparencyOfSelectedThemeMap($event) {
      console.log("udpateTransparency");
      this.updateTransparency({
        layerConf: this.selectedThemeMap,
        transparency: 100 - parseInt($event.target.value, 10),
      });
    },
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
};
</script>

<template lang="html">
  <div id="theme-accordion">
    <div
      v-for="(themeMapGroup, indexThemeMapGroup) in this.allThemeMapsGroups"
      class="accordion-item"
    >
      <button
        class="accordion-button"
        :class="{
          collapsed: !isAccordionOpen(`#collapse${indexThemeMapGroup}`),
        }"
        type="button"
        :data-bs-target="`#collapse${indexThemeMapGroup}`"
        :aria-expanded="isAccordionOpen(`#collapse${indexThemeMapGroup}`)"
        @click="toggleAccordion(`#collapse${indexThemeMapGroup}`)"
      >
        <div class="accordion-button-wrapper">
          <button
            class="select-all-btn"
            @click.stop="clickedSelectAll(themeMapGroup)"
          >
            <CircleMinus
              v-if="checkIfAllAreChecked(themeMapGroup)"
              :color="colors.amarex_secondary"
              :size="20"
            />
            <CirclePlus
              v-else
              :color="colors.amarex_secondary"
              :size="20"
            />
          </button>
          <p class="thememapgroup-name">{{ themeMapGroup.name }}</p>
          <p class="thememapgroup-number">
            {{ themeMapGroup.elements?.length }} Karten
          </p>
          <div
            class="icon-container"
            :style="{
              transform: isAccordionOpen(`#collapse${indexThemeMapGroup}`)
                ? 'rotate(180deg)'
                : 'rotate(0deg)',
            }"
          >
            <ChevronDown
              :color="colors.amarex_secondary"
              :size="20"
            />
          </div>
        </div>
      </button>
      <div
        :id="`collapse${indexThemeMapGroup}`"
        :class="[
          'accordion-collapse collapse',
          { show: isAccordionOpen(`#collapse${indexThemeMapGroup}`) },
        ]"
      >
        <div class="accordion-body">
          <div
            v-for="(themeMap, indexThemeMap) in themeMapGroup.elements"
            :key="indexThemeMap"
            class="theme-map-wrapper"
          >
            <div
              class="theme-map"
              :class="{
                'theme-map-active': selectedThemeMap?.id === themeMap.id,
              }"
            >
              <button @click="themeMapClick(themeMap)">
                <CircleMinus
                  v-if="themeMap.visibility"
                  :color="colors.amarex_secondary"
                  :size="20"
                />
                <CirclePlus
                  v-else
                  :color="colors.amarex_secondary"
                  :size="20"
                />
              </button>
              <p class="thememap-name">
                {{ themeMap.name }}
              </p>
              <button
                :style="{
                  visibility: themeMap.visibility ? 'visible' : 'hidden',
                }"
                @click="openTransparencySubMenu(themeMap)"
                :active="themeMap.visibility"
              >
                <Settings
                  :color="colors.amarex_secondary"
                  :size="20"
                />
              </button>
              <button v-if="false">
                <MapIcon
                  :color="colors.amarex_secondary"
                  :size="20"
                />
              </button>
            </div>
            <div
              class="theme-map-sub"
              v-if="themeMap.id === selectedThemeMap?.id && themeMap.visibility"
            >
              <p>Deckkraft:</p>
              <SliderItem
                :id="
                  'layer-component-sub-menu-transparency-input-' + themeMap.id
                "
                :aria="
                  $t('common:modules.aria.sliderAria') +
                  `${100 - themeMap.transparency}%`
                "
                :label="`${100 - themeMap.transparency}%`"
                :value="100 - themeMap.transparency"
                :min="0"
                :max="100"
                :step="10"
                :interaction="updateTransparencyOfSelectedThemeMap"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
#theme-accordion {
  .accordion-button {
    font-size: 16px !important;
    padding: 12px 16px !important;
    border: 1px solid $amarex_grey_light !important;
    &[aria-expanded="true"] {
      background-color: $amarex_secondary_mid;
    }
    .accordion-button-wrapper {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      .select-all-btn {
        border: none !important;
        padding: 4px !important;
        background: none !important;
        margin: 0 !important;
      }
      .thememapgroup-name {
        margin-right: auto;
        font-weight: 700 !important;
      }
      .thememapgroup-number {
        font-weight: 400 !important;
      }
      .icon-container {
        transition: all 0.3s ease-in-out;
      }
    }
  }
  .accordion-body {
    padding: 0 0 0 24px !important;
    .theme-map {
      border: 1px solid $amarex_grey_light !important;
      padding: 12px 16px !important;
      display: flex;
      align-items: center;
      gap: 8px;
      svg {
        cursor: pointer;
      }
      &.theme-map-active {
        background-color: $amarex_secondary_mid;
        border-bottom: 1px solid $amarex_secondary_mid !important;
      }
      .thememap-name {
        font-size: 16px !important;
        font-weight: 400 !important;
        user-select: none;
        margin-right: auto;
      }
      button {
        border: none !important;
        padding: 4px !important;
        background: none !important;
        margin: 0 !important;
      }
    }
    .theme-map-sub {
      padding: 0 16px 12px 16px;
      background: $amarex_secondary_mid;
      display: flex;
      align-items: center;
      gap: 8px;
      border-left: 1px solid $amarex_grey_light !important;
      border-right: 1px solid $amarex_grey_light !important;
      border-bottom: 1px solid $amarex_grey_light !important;
      border-top: 1px solid $amarex_secondary_mid !important;
    }
  }
}
</style>

