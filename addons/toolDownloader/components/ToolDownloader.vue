<script>
import { mapGetters } from "vuex";
import { FileDown, BookOpen } from "lucide-vue-next";
import colors from "../../../src/shared/js/utils/amarex-colors.json";

/**
 * ToolDownloader
 * @module modules/ToolDownloader
 */
export default {
  name: "ToolDownloader",
  components: {
    FileDown,
    BookOpen,
  },
  data() {
    return {
      id: null,
      currentTool: null,
      colors,
    };
  },
  computed: {
    ...mapGetters("Menu", ["currentComponent"]),
    ...mapGetters(["portalConfig"]),
    secondaryMenuProps() {
      return this.currentComponent("secondaryMenu").props;
    },

    toolConfig() {
      if (!this.id || !this.portalConfig?.addons?.sections) {
        return null;
      }
      for (const section of this.portalConfig.addons.sections) {
        if (section.toolDownloader && section.toolDownloader.id === this.id) {
          return section.toolDownloader;
        }
      }
      return null;
    },
  },
  watch: {
    secondaryMenuProps: {
      handler(newVal) {
        this.id = newVal?.id;
        this.updateCurrentTool();
      },
      deep: true,
      immediate: true,
    },
    id: {
      handler() {
        this.updateCurrentTool();
      },
    },
  },
  created() {},
  methods: {
    updateCurrentTool() {
      this.currentTool = this.toolConfig;
    },
    switchTool(toolId) {
      this.id = toolId;
    },
  },
};
</script>

<template lang="html">
  <div
    id="tool-downloader"
    v-if="currentTool"
  >
    <h2 class="title">{{ currentTool.title || "Tool Downloader" }}</h2>

    <p
      v-if="currentTool.content"
      class="mb-4"
      v-html="currentTool.content"
    ></p>

    <div class="button-container">
      <button class="amarex-btn-primary">
        <a
          v-if="currentTool['top-btn']"
          :href="currentTool['top-btn'].src"
          download
          target="_blank"
          class="btn-link"
        >
          <FileDown
            :color="colors.secondary"
            size="16"
          />
          {{ currentTool["top-btn"].text }}
        </a>
      </button>

      <button class="amarex-btn-primary">
        <a
          v-if="currentTool['bottom-btn']"
          :href="currentTool['bottom-btn'].src"
          download
          target="_blank"
          class="btn-link"
        >
          <BookOpen
            :color="colors.secondary"
            size="16"
          />
          {{ currentTool["bottom-btn"].text }}
        </a>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.btn-link {
  width: 100%;
  height: 100%;
  text-decoration: none;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.title {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 700;
  line-height: 32px;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>

