<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import SearchBar from "../../../src/modules/searchBar/components/SearchBar.vue";
import LayerCheckBox from "../../../src/modules/layerTree/components/LayerCheckBox.vue";
import LayerSelectionTreeNode from "../../../src/modules/layerSelection/components/LayerSelectionTreeNode.vue";
import LayerTree from "../../../src/modules/layerTree/components/LayerTree.vue";
import { treeSubjectsKey } from "../../../src/shared/js/utils/constants";
import sortBy from "../../../src/shared/js/utils/sortBy";
import layerFactory from "../../../src/core/layers/js/layerFactory";

export default {
  name: "ThemeMaps",
  components: {
    SearchBar,
    LayerCheckBox,
    LayerSelectionTreeNode,
    LayerTree,
  },
  data() {
    return {
      selectAllConfId: -1,
      selectAllConfigs: [],
      activeCategory: null,
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
      "baselayerConfs",
      "lastThemeMapsFolderNames",
      "layerInfoVisible",
    ]),
    categorySwitcher() {
      return this.portalConfig?.tree?.categories;
    },
    filteredBaseLayers() {
      return this.mode === "3D"
        ? this.baselayerConfs.filter(
            (conf) =>
              !layerFactory
                .getLayerTypesNotVisibleIn3d()
                .includes(conf.typ?.toUpperCase()),
          )
        : this.baselayerConfs;
    },
  },
  created() {
    this.initializeComponent();
  },
  unmounted() {
    this.cleanupComponent();
  },
  methods: {
    ...mapActions(["changeCategory"]),
    ...mapActions("Modules/ThemeMaps", [
      "navigateBack",
      "navigateForward",
      "reset",
    ]),
    ...mapMutations("Modules/ThemeMaps", [
      "setLayerInfoVisible",
      "setHighlightLayerId",
    ]),
    initializeComponent() {
      this.activeCategory = this.activeOrFirstCategory?.key;
      this.provideSelectAllProps();
      this.initializeThemeMapsConfs();
    },
    cleanupComponent() {
      if (!this.layerInfoVisible) {
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
  },
};
</script>

<template>
  <div class="theme-layer-selection">
    <LayerTree />
    <SearchBar v-if="addLayerButtonSearchActive === true" />
    <hr />
    <div class="layer-selection-navigation d-flex">
      <div
        v-if="showAllResults === false"
        class="layer-selection-navigation"
      >
        <div
          v-if="
            activeOrFirstCategory &&
            categorySwitcher &&
            lastThemeMapsFolderNames.length === 1
          "
          class="form-floating mb-3 mt-3"
        >
          <select
            id="select_category"
            v-model="activeCategory"
            class="form-select"
            @change="categorySelected($event.target.value)"
          >
            <option
              v-for="category in allCategories"
              :key="category.key"
              :value="category.key"
            >
              {{ $t(category.name) }}
            </option>
          </select>
          <label for="select_category">
            {{ $t("common:modules.layerTree.categories") }}
          </label>
        </div>
        <div
          class="align-items-left justify-content-center layer-selection-navigation-dataLayer"
        >
          <!-- INFO: Navigation -->
          <h5
            v-if="lastThemeMapsFolderNames.length === 1"
            class="layer-selection-subheadline"
          >
            {{ $t("common:modules.layerSelection.datalayer") }}
          </h5>
          <nav
            v-if="lastThemeMapsFolderNames.length > 1"
            aria-label="breadcrumb"
            class="position-sticky top-0 bg-white py-3"
          >
            <ol class="breadcrumb mb-0">
              <li
                v-for="(lastFolderName, index) in lastThemeMapsFolderNames"
                :key="index"
                :class="[
                  'breadcrumb-item',
                  index === lastThemeMapsFolderNames.length - 1 ? 'active' : '',
                ]"
              >
                <a
                  v-if="index < lastThemeMapsFolderNames.length - 1"
                  class="mp-menu-navigation"
                  href="#"
                  @click="navigateStepsBack(index)"
                  @keypress="navigateStepsBack(index)"
                >
                  <h6 class="mp-menu-navigation-link bold">
                    {{
                      lastFolderName === "root"
                        ? $t("common:modules.layerSelection.datalayer")
                        : lastFolderName
                    }}
                  </h6>
                </a>
                <h6
                  v-else
                  class="mp-menu-navigation-link bold no-link"
                >
                  {{ lastFolderName }}
                </h6>
              </li>
            </ol>
          </nav>
          <!-- END Navigation -->

          <template
            v-for="(conf, idx) in themeMapsConfs"
            :key="idx"
          >
            <LayerSelectionTreeNode
              :conf="conf"
              :show-select-all-check-box="selectAllConfId === conf.id"
              :select-all-configs="selectAllConfigs"
              @show-node="folderClicked"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.breadcrumb-item + .breadcrumb-item::before {
  font-weight: bold;
  line-height: 1.2rem;
}

.layer-selection {
  background-color: $menu-background-color;
  left: 0px;
  height: calc(100% - 50px);
  padding-top: 0;
  @media (max-height: 670px) {
    height: calc(100% - 85px);
  }
}
.layer-selection-navigation {
  height: 90%;
  flex-direction: column;
}

.layer-selection-navigation-baselayer {
  overflow-x: scroll;
}
@include media-breakpoint-down(md) {
  .layer-selection-navigation-baselayer {
    max-height: 120px;
  }
}
.layer-selection-navigation-dataLayer {
  @include media-breakpoint-down(md) {
    max-height: calc(100% - 120px);
  }
}

.layer-selection-subheadline {
  margin: 0px 0 15px 0;
}

.mp-menu-navigation {
  color: $black;
  display: flex;
}
.mp-menu-navigation-link {
  display: flex;
}

@include media-breakpoint-up(sm) {
  .layer-selection-navigation-baselayer {
    overflow-x: auto;
  }
}
.baselayer {
  min-width: 35%;
}
</style>

