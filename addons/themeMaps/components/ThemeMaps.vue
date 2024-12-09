<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import LayerSelectionTreeNode from "../../../src/modules/layerSelection/components/LayerSelectionTreeNode.vue";
import { treeSubjectsKey } from "../../../src/shared/js/utils/constants";
import sortBy from "../../../src/shared/js/utils/sortBy";
import layerFactory from "../../../src/core/layers/js/layerFactory";
import LayerTreeAmarex from "../../../src/modules/layerTree/components/LayerTreeAmarex.vue";
import LayerTree from "../../../src/modules/layerTree/components/LayerTree.vue";
import Layer from "../../../src/modules/layerTree/components/LayerComponent.vue";
import SearchBar from "../../../src/modules/searchBar/components/SearchBar.vue";
import LayerInformation from "../../../src/modules/layerInformation/components/LayerInformation.vue";
import {
  CirclePlus,
  CircleMinus,
  ChevronDown,
  ChevronUp,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next";
import colors from "../../../src/shared/js/utils/amarex-colors.json";

// CHANGED JS

export default {
  name: "ThemeMaps",
  components: {
    LayerSelectionTreeNode,
    LayerTreeAmarex,
    LayerTree,
    Layer,
    SearchBar,
    LayerInformation,
    CirclePlus,
    CircleMinus,
    ChevronDown,
    ChevronUp,
    MapIcon,
    ChevronLeft,
    ChevronRight,
  },
  data() {
    return {
      selectAllConfId: -1,
      selectAllConfigs: [],
      activeCategory: null,
      selectedMapGroup: null,
      colors,
      showLayerTree: true,
      checkedSelectAll: false,
      upperThemeMapsContainerHeight: 0,
      selectElement: "card",
    };
  },
  computed: {
    ...mapGetters([
      "allLayerConfigsStructured",
      "activeOrFirstCategory",
      "allCategories",
      "portalConfig",
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
    this.activeCategory = this.activeOrFirstCategory?.key;
    this.provideSelectAllProps();
    this.initializeComponent();
  },
  mounted() {
    const getCacheShowLayerTree = localStorage.getItem("cacheShowLayerTree");
    this.showLayerTree = getCacheShowLayerTree
      ? JSON.parse(getCacheShowLayerTree)
      : true;
    const getCacheSelectedMapGroup = localStorage.getItem(
      "cacheSelectedMapGroup",
    );
    this.selectedMapGroup = getCacheSelectedMapGroup
      ? JSON.parse(getCacheSelectedMapGroup)
      : null;
    this.updateHeight();
    this.resizeObserver = new ResizeObserver(() => {
      this.updateHeight();
    });
    if (this.$refs.upperThemeMapsContainer) {
      this.resizeObserver.observe(this.$refs.upperThemeMapsContainer);
    }
  },
  unmounted() {
    localStorage.setItem(
      "cacheShowLayerTree",
      JSON.stringify(this.showLayerTree),
    );
    localStorage.setItem(
      "cacheSelectedMapGroup",
      JSON.stringify(this.selectedMapGroup),
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
    initializeComponent() {
      this.activeCategory = this.activeOrFirstCategory?.key;
      this.provideSelectAllProps();
      this.initializeThemeMapsConfs();
    },
    cleanupComponent() {
      if (!this.layerInfoVisible) {
        // reset layer selection
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
    sortConfigs(configs) {
      return sortBy(configs, (conf) => conf.type !== "folder");
    },
    navigateStepsBack(level) {
      const stepsToGoBack = this.lastThemeMapsFolderNames.length - level - 1;
      for (let i = 0; i < stepsToGoBack; i++) {
        this.navigateBack();
      }
      this.$nextTick(this.resetSelectAllProps);
    },
    folderClicked(lastFolderName, themeMapsConfs) {
      this.navigateForward({
        lastFolderName,
        themeMapsConfs: this.sortConfigs(themeMapsConfs),
      });
      this.$nextTick(this.resetSelectAllProps);
    },
    resetSelectAllProps() {
      this.selectAllConfId = -1;
      this.selectAllConfigs = [];
      this.provideSelectAllProps();
    },
    isControlledBySelectAll(conf) {
      return (
        conf.type === "layer" &&
        (this.mode === "2D" ||
          !layerFactory.getLayerTypes3d().includes(conf.typ?.toUpperCase()))
      );
    },
    provideSelectAllProps() {
      const controlledConfigs = this.themeMapsConfs.filter(
        this.isControlledBySelectAll,
      );
      if (controlledConfigs.length > 0) {
        this.selectAllConfigs = controlledConfigs;
        this.selectAllConfId = controlledConfigs[0].id;
      }
    },
    categorySelected(value) {
      if (typeof value === "string") {
        const category = this.allCategories.find(
          (aCategory) => aCategory.key === value,
        );
        this.allCategories.forEach((aCategory) => (aCategory.active = false));
        category.active = true;
        this.changeCategory(category);
      }
    },
    selectMapGroup(ele) {
      if (this.selectedMapGroup?.id === ele.id) {
        this.selectedMapGroup = null;
        return;
      }
      this.selectedMapGroup = ele;
    },
    unselectMapGroup() {
      this.selectedMapGroup = null;
    },
    visibilityInLayerTreeChanged(value) {
      const layerConfigs = [];
      layerConfigs.push({
        id: this.conf.id,
        layer: {
          id: this.conf.id,
          visibility: value,
        },
      });
      if (this.conf.baselayer) {
        baselayerHandler.checkAndAdd(
          this.singleBaselayer,
          this.visibleBaselayerConfigs,
          layerConfigs,
        );
      }
      this.replaceByIdInLayerConfig({ layerConfigs });
    },
    clicked(conf) {
      const isLayerVisible = conf.visibility;
      this.changeVisibility({ layerId: conf.id, value: !isLayerVisible });
    },
    toggleLayerTree() {
      this.showLayerTree = !this.showLayerTree;
    },
    findNestedElementsById() {
      const traverse = (array) => {
        for (const item of array) {
          if (item.id === this.selectedMapGroup.id) {
            return item.elements;
          }
          if (item.elements && Array.isArray(item.elements)) {
            const found = traverse(item.elements);
            if (found) {
              return found;
            }
          }
        }
        return null;
      };
      return traverse(this.themeMapsConfs) || []; // Ensure the result is always an array
    },
    checkIfAllAreChecked() {
      let allAreChecked = true;
      this.themeMapsConfs.forEach((themeMap) => {
        themeMap.elements.forEach((subThemeMap) => {
          if (subThemeMap.id === this.selectedMapGroup.id) {
            subThemeMap.elements.forEach((element) => {
              if (!element.visibility) {
                allAreChecked = false;
              }
            });
          }
        });
      });
      return allAreChecked;
    },
    clickedSelectAll() {
      this.checkedSelectAll = !this.checkedSelectAll;
      this.themeMapsConfs.forEach((themeMap) => {
        themeMap.elements.forEach((subThemeMap) => {
          if (subThemeMap.id === this.selectedMapGroup.id) {
            subThemeMap.elements.forEach((element) => {
              this.changeVisibility({
                layerId: element.id,
                value: this.checkedSelectAll,
              });
            });
          }
        });
      });
    },
    updateHeight() {
      const el = this.$refs.upperThemeMapsContainer;
      if (el) {
        this.upperThemeMapsContainerHeight = el.offsetHeight;
      }
    },
  },
  beforeUnmount() {
    // Disconnect the observer to avoid memory leaks
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
};
</script>

<template>
  <div>
    <div
      id="upper-theme-maps-container"
      class="theme-maps-container"
      ref="upperThemeMapsContainer"
      :style="{
        height: showLayerTree ? '35vh' : 'auto',
      }"
    >
      <div
        class="theme-layer-title-container mb-4"
        @click="toggleLayerTree"
      >
        <h5 class="theme-layer-title">Ebenen Themenkarten</h5>
        <ChevronUp
          :color="colors.amarex_secondary"
          :size="20"
          v-if="showLayerTree"
        />
        <ChevronDown
          :color="colors.amarex_secondary"
          :size="20"
          v-else
        />
      </div>
      <LayerTreeAmarex v-if="showLayerTree" />
    </div>
    <div
      v-if="selectElement === 'card'"
      id="lower-theme-maps-container"
      class="theme-maps-container"
      :style="{
        height: `calc(100vh - 3rem - ${this.upperThemeMapsContainerHeight}px)`,
      }"
    >
      <div class="theme-layer-title-container second-title-container">
        <h5
          v-if="!this.selectedMapGroup"
          class="theme-layer-title"
        >
          Themenkarten
        </h5>
        <div
          v-else
          class="mb-3"
          @click="unselectMapGroup()"
        >
          <ChevronLeft
            :color="colors.amarex_secondary"
            :size="20"
          />
          <h5 class="theme-layer-title ms-2">Zurück</h5>
        </div>
      </div>
      <div
        v-if="
          !!this.themeMapsConfs &&
          !!this.themeMapsConfs?.length &&
          !this.selectedMapGroup
        "
        class="theme-layer-container mt-3"
      >
        <div
          v-for="(main, index) in this.themeMapsConfs"
          :key="index"
          class="theme-layer-nav"
        >
          <div
            v-for="(mainElement, indexElement) in main.elements"
            :key="indexElement"
            class="theme-layer-nav-item-card p-4"
            :class="{ selected: this.selectedMapGroup?.id === mainElement.id }"
          >
            <div class="d-flex align-items-center">
              <MapIcon
                :color="colors.amarex_secondary"
                :size="20"
              />
              <p class="amarex-bold ms-3">
                {{ mainElement.name }} /
                {{ mainElement.elements?.length }} Karten
              </p>
            </div>
            <!-- <p class="amarex-bold">{{ mainElement.elements?.length }} Karten</p> -->
            <p class="amarex-caption">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <button
              class="amarex-btn-primary accent full"
              @click="selectMapGroup(mainElement)"
            >
              <p class="amarex-small">Zur Layerauswahl</p>
              <ChevronRight
                :color="colors.primary"
                :size="20"
              />
            </button>
          </div>
        </div>
        <div class="mt-4"></div>
      </div>
      <h5
        v-if="!!this.selectedMapGroup"
        class="mt-2"
      >
        Enthaltene Kartenlayer bei "{{ this.selectedMapGroup.name }}"
      </h5>
      <div
        v-if="!!this.selectedMapGroup"
        class="theme-layer-overflow-container mt-2"
      >
        <div
          class="sub-group selectAll"
          @click="clickedSelectAll()"
        >
          <CircleMinus
            v-if="checkIfAllAreChecked()"
            :color="colors.amarex_secondary"
            :size="20"
          />
          <CirclePlus
            v-else
            :color="colors.amarex_accent"
            :size="20"
          />
          <p :class="checkIfAllAreChecked() ? 'amarex-bold' : 'amarex-small'">
            {{
              checkIfAllAreChecked()
                ? "Alle Layer entfernen"
                : "Alle Layer hinzufügen"
            }}
          </p>
        </div>
        <div
          v-for="(selectedElement, indexElement) in findNestedElementsById()"
          :key="indexElement"
          class="sub-group"
          @click="clicked(selectedElement)"
        >
          <CircleMinus
            v-if="selectedElement.visibility"
            :color="colors.amarex_secondary"
            :size="20"
          />
          <CirclePlus
            v-else
            :color="colors.amarex_accent"
            :size="20"
          />
          <p
            :class="selectedElement.visibility ? 'amarex-bold' : 'amarex-small'"
          >
            {{ selectedElement.name }}
          </p>
        </div>
      </div>
    </div>
    <div
      v-else
      id="lower-theme-maps-container"
      class="theme-maps-container"
      :style="{
        height: `calc(100vh - 3rem - ${this.upperThemeMapsContainerHeight}px)`,
      }"
    >
      <div class="theme-layer-title-container second-title-container">
        <h5 class="theme-layer-title">Themenkarten</h5>
      </div>
      <div
        v-if="!!this.themeMapsConfs && !!this.themeMapsConfs?.length"
        class="theme-layer-container mt-3"
      >
        <div
          v-for="(main, index) in this.themeMapsConfs"
          :key="index"
          class="theme-layer-nav"
        >
          <div
            v-for="(mainElement, indexElement) in main.elements"
            :key="indexElement"
            class="theme-layer-nav-item"
            :class="{ selected: this.selectedMapGroup?.id === mainElement.id }"
            @click="selectMapGroup(mainElement)"
          >
            <p class="amarex-small">
              {{ mainElement.name }}
            </p>
            <div class="bubble">
              <p class="amarex-bold">
                {{ mainElement.elements?.length }}
              </p>
            </div>
          </div>
        </div>
        <hr
          v-if="!!this.selectedMapGroup"
          class="my-3"
        />
      </div>
      <h5 v-if="!!this.selectedMapGroup">
        Enthaltene Kartenlayer bei "{{ this.selectedMapGroup.name }}"
      </h5>
      <div
        v-if="!!this.selectedMapGroup"
        class="theme-layer-overflow-container mt-3"
      >
        <div
          class="sub-group selectAll"
          @click="clickedSelectAll()"
        >
          <CircleMinus
            v-if="checkIfAllAreChecked()"
            :color="colors.amarex_secondary"
            :size="20"
          />
          <CirclePlus
            v-else
            :color="colors.amarex_accent"
            :size="20"
          />
          <p :class="checkIfAllAreChecked() ? 'amarex-bold' : 'amarex-small'">
            {{
              checkIfAllAreChecked()
                ? "Alle Layer entfernen"
                : "Alle Layer hinzufügen"
            }}
          </p>
        </div>
        <div
          v-for="(selectedElement, indexElement) in findNestedElementsById()"
          :key="indexElement"
          class="sub-group"
          @click="clicked(selectedElement)"
        >
          <CircleMinus
            v-if="selectedElement.visibility"
            :color="colors.amarex_secondary"
            :size="20"
          />
          <CirclePlus
            v-else
            :color="colors.amarex_accent"
            :size="20"
          />
          <p
            :class="selectedElement.visibility ? 'amarex-bold' : 'amarex-small'"
          >
            {{ selectedElement.name }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.theme-maps-container {
  &#upper-theme-maps-container {
    display: grid;
    grid-template-rows: auto auto 1fr;
  }
  &#lower-theme-maps-container {
    display: grid;
    grid-template-rows: auto auto 1fr;
  }
}
.theme-layer-title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:not(.second-title-container) {
    @include clickable();
  }
  &.second-title-container {
    border-top: 1px solid $amarex_grey_light;
    padding-top: 20px;
    h5 {
      user-select: none;
      @include transform-p();
    }
    & > div {
      @include clickable();
      display: flex;
      align-items: center;
    }
  }
}
.theme-layer-container {
  width: 100%;
  overflow-y: scroll;
  padding-right: 5px;
  .theme-layer-nav {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    .theme-layer-nav-item {
      @include radius();
      @include boxShadow();
      @include clickable();
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 5px 10px;
      border: 1px solid $amarex_grey_light;
      &:hover {
        background: $amarex_grey_light;
      }
      &.selected {
        background: $amarex_secondary;
        border: 1px solid $amarex_secondary;
        & > p {
          color: $amarex_primary;
        }
        &:hover {
          background: $amarex_secondary !important;
        }
      }
      .bubble {
        width: fit-content;
        background: $amarex_secondary_light;
        border-radius: 100%;
        min-width: 30px;
        min-height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .theme-layer-nav-item-card {
      // background: $amarex_grey_light;
      @include boxShadow();
      user-select: none;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      border: 1px solid $amarex_secondary;
      @include radius();
    }
  }
}
.theme-layer-overflow-container {
  overflow-y: scroll;
  .sub-group {
    margin: 10px 0;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    display: grid;
    grid-template-columns: 20px 1fr;
    align-items: center;
    gap: 20px;
    &.selectAll {
      background: $amarex_accent_light;
      // @include boxShadow();
    }
    &:not(.selectAll):hover {
      background: $amarex_grey_light;
    }
  }
}
</style>

