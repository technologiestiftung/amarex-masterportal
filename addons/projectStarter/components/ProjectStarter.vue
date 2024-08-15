<script>
import SearchBar from "../../../src/modules/searchBar/components/SearchBar.vue";
import ProjectUploader from "../../projectUploader/components/ProjectUploader.vue";
import { mapActions, mapGetters, mapMutations } from "vuex";

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
      title: "",
      description: "",
    };
  },
  computed: {
    ...mapGetters("Modules/ProjectStarter", [
      "projectTitle",
      "projectDescription",
    ]),
    // Computed property to check if there are unsaved changes
    hasUnsavedChanges() {
      return (
        this.title !== this.projectTitle ||
        this.description !== this.projectDescription
      );
    },
  },
  created() {
    this.title = this.projectTitle;
    this.description = this.projectDescription;
  },
  methods: {
    ...mapActions("Menu", ["clickedMenuElement", "toggleMenu", "closeMenu"]),
    ...mapMutations("Modules/ProjectStarter", [
      "setProjectTitle",
      "setProjectDescription",
    ]),
    /**
     * Opens the searchbar module.
     * @returns {void}
     */
    openSearchBar() {
      // this.clickedMenuElement({
      //   name: "common:modules.searchBar.searchResultList",
      //   side: 'secondaryMenu',
      //   type: "searchbar",
      // });
    },

    saveProject() {
      if (this.hasUnsavedChanges) {
        this.setProjectTitle(this.title);
        this.setProjectDescription(this.description);
      }
    },
  },
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
            <div class="mb-3">
              <label
                for="reportTitle"
                class="form-label"
                >Projektname:</label
              >
              <textarea
                id="reportTitle"
                v-model="title"
                class="form-control"
                rows="2"
              />
            </div>
            <div class="mb-3">
              <label
                for="projectDescription"
                class="form-label"
                >Projektbeschreibung:</label
              >
              <textarea
                id="projectDescription"
                v-model="description"
                class="form-control"
                rows="3"
              />
            </div>

            <SearchBar :click-action="openSearchBar" />

            <button
              class="btn btn-secondary"
              :disabled="!hasUnsavedChanges"
              @click="saveProject"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
</style>

