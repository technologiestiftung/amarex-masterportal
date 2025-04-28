<script>
import { mapGetters } from "vuex";

/**
 * ToolDownloader
 * @module modules/ToolDownloader
 */
export default {
  name: "ToolDownloader",
  components: {},
  data() {
    return {};
  },
  computed: {
    ...mapGetters("Menu", ["currentComponent", "currentComponentName"]),
  },
  created() {
    console.log(
      "[ToolDownloader] toolDownloader currentComponent::",
      this.currentComponent("secondaryMenu"),
      this.currentComponentName("secondaryMenu"),
    );
  },
  methods: {},
};
</script>

<template lang="html">
  <div id="tool-downloader">
    <h2 class="mb-5 mt-3">Tool Downloader</h2>

    <a>
      <button>Bestehendes Projekt Öffnen</button>
    </a>
    <a>
      <button>Bestehendes Projekt Öffnen</button>
    </a>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
</style>

