<script>
import SearchBar from "../../../src/modules/searchBar/components/SearchBar.vue";
import ProjectUploader from "../../projectUploader/components/ProjectUploader.vue";

/**
 * Project Starter
 * @module modules/ProjectStarter
 */
export default {
  name: "ProjectStarter",
  components: {
    SearchBar,
    ProjectUploader,
  },
  data() {
    return {
      fileUploaded: false,
      filesToUpload: [],
      selectedFiles: {},
    };
  },
  computed: {},
  mounted() {},
  methods: {},
};
</script>

<template lang="html">
  <div id="project-starter">
    <h2 class="mb-5 mt-3">Willkommen beim Amarex Webtool</h2>

    <div
      class="accordion h-100 overflow-scroll"
      id="accordionExample"
    >
      <div class="accordion-item accordion-flush">
        <h5
          class="accordion-header"
          :id="`heading1`"
        >
          <button
            class="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="`#collapse1`"
            :aria-controls="`collapse1`"
          >
            Bestehendes Projekt Öffnen
          </button>
        </h5>

        <div
          :id="`collapse1`"
          :class="['accordion-collapse collapse', { show: false }]"
          :aria-labelledby="`heading1`"
          data-bs-parent="#accordionExample"
        >
          <div class="accordion-body">
            <ProjectUploader />
          </div>
        </div>
      </div>

      <div class="accordion-item accordion-flush">
        <h5
          class="accordion-header"
          :id="`heading2`"
        >
          <button
            class="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="`#collapse2`"
            :aria-controls="`collapse2`"
          >
            Neues Projekt Anlegen
          </button>
        </h5>

        <div
          :id="`collapse2`"
          :class="['accordion-collapse collapse', { show: false }]"
          :aria-labelledby="`heading2`"
          data-bs-parent="#accordionExample"
        >
          <div class="accordion-body">
            <p>Project Starter Intro</p>
            <SearchBar />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
</style>

