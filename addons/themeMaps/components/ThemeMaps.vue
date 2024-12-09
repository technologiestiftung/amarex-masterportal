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
  },
  data() {
    return {
      selectAllConfId: -1,
      selectAllConfigs: [],
      activeCategory: null,
      selectedMapGroup: null,
      colors,
      showLayerTree: true,
      showLayerTreeSelect: true,
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
    const getCacheShowLayerTreeSelect = localStorage.getItem(
      "cacheShowLayerTreeSelect",
    );
    this.showLayerTreeSelect = getCacheShowLayerTreeSelect
      ? JSON.parse(getCacheShowLayerTreeSelect)
      : true;
    const getCacheSelectedMapGroup = localStorage.getItem(
      "cacheSelectedMapGroup",
    );
    this.selectedMapGroup = getCacheSelectedMapGroup
      ? JSON.parse(getCacheSelectedMapGroup)
      : null;
  },
  unmounted() {
    localStorage.setItem(
      "cacheShowLayerTree",
      JSON.stringify(this.showLayerTree),
    );
    localStorage.setItem(
      "cacheShowLayerTreeSelect",
      JSON.stringify(this.showLayerTreeSelect),
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
      "changeVisibility",
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
    toggleLayerTreeSelect() {
      this.showLayerTreeSelect = !this.showLayerTreeSelect;
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
  },
};
</script>

<template>
  <div>
    <div
      class="theme-layer-title-container"
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
    <div
      class="theme-layer-title-container second-title-container"
      @click="toggleLayerTreeSelect"
    >
      <h5 class="theme-layer-title">Themenkarten</h5>
      <ChevronUp
        :color="colors.amarex_secondary"
        :size="20"
        v-if="showLayerTreeSelect"
      />
      <ChevronDown
        :color="colors.amarex_secondary"
        :size="20"
        v-else
      />
    </div>
    <div
      class="theme-layer-container mt-3"
      v-if="
        !!this.themeMapsConfs &&
        !!this.themeMapsConfs?.length &&
        showLayerTreeSelect
      "
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
      <hr v-if="!!this.selectedMapGroup" />
      <div v-if="!!this.selectedMapGroup">
        <h5>Enthaltene Kartenlayer bei "{{ this.selectedMapGroup.name }}"</h5>
        <!-- v-for="(selectedElement, indexElement) in this.selectedMapGroup
            .elements" -->
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
          <p class="amarex_small">{{ selectedElement.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.theme-layer-title-container {
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @include clickable();
  &.second-title-container {
    border-top: 1px solid $amarex_grey_light;
    padding-top: 20px;
  }
}
.theme-layer-container {
  width: 100%;
  min-height: 200px;
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
      p {
        transform: translateY(2px);
      }
    }
  }
  .sub-group {
    margin: 10px 0;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    display: grid;
    grid-template-columns: 20px 1fr;
    align-items: center;
    gap: 20px;
  }
}
hr {
  margin: 30px 0;
}
</style>

