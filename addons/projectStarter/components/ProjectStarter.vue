<script>
import SearchBar from "../../../src/modules/searchBar/components/SearchBar.vue";
import ProjectUploader from "../../projectUploader/components/ProjectUploader.vue";
import { mapActions, mapGetters, mapMutations } from "vuex";
import { FolderPlus, FolderOpen } from "lucide-vue-next";
import colors from "../../../src/shared/js/utils/amarex-colors.json";

/**
 * Project Starter
 * @module modules/ProjectStarter
 */
export default {
  name: "ProjectStarterAmarex",
  components: {
    SearchBar,
    ProjectUploader,
    FolderPlus,
    FolderOpen,
  },
  data() {
    return {
      fileUploaded: false,
      filesToUpload: [],
      selectedFiles: {},
      title: "",
      description: "",
      showUpload: false,
      showAdressSearch: false,
      colors,
    };
  },
  computed: {
    /* ...mapGetters("Modules/ProjectStarter", [
      "projectTitle",
      "projectDescription",
    ]), */
    ...mapGetters("Modules/SearchBar", ["currentSide"]),
    ...mapGetters("Menu", ["secondaryMenu"]),
    hasUnsavedChanges() {
      return (
        this.title !== this.projectTitle ||
        this.description !== this.projectDescription
      );
    },
  },
  created() {
    // this.title = this.projectTitle;
    // this.description = this.projectDescription;
    // this.setCurrentSide("secondaryMenu");
  },
  mounted() {
    setTimeout(() => {
      this.toggleMenu("secondaryMenu");
    }, 1000);
  },
  props: {
    startAmarexProject: {
      type: Function,
      required: true,
    },
  },
  methods: {
    ...mapActions("Maps", ["resetView"]),
    ...mapActions("Menu", ["clickedMenuElement", "toggleMenu", "closeMenu"]),
    ...mapMutations("Modules/ProjectStarter", [
      "setProjectTitle",
      "setProjectDescription",
    ]),
    ...mapMutations("Modules/SearchBar", ["setCurrentSide"]),

    saveProject() {
      if (this.hasUnsavedChanges) {
        this.setProjectTitle(this.title);
        this.setProjectDescription(this.description);
      }
      this.startAmarexProject();
    },
    resetProject() {
      this.title = "";
      this.description = "";
      this.resetView();
    },
  },
};
</script>

<template lang="html">
  <div
    id="project-starter-amarex"
    class="d-flex justify-content-center flex-column"
  >
    <div>
      <h4>Herzlich Willkommen beim AMAREX Webtool,</h4>
      <h5>womit möchten Sie anfangen?</h5>
      <div
        class="accordion mt-5"
        id="accordionExample"
      >
        <div
          v-if="showUpload"
          class="accordion-item accordion-flush"
        >
          <button
            class="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="`#collapse1`"
            :aria-controls="`collapse1`"
          >
            <FolderOpen
              :color="colors.primary"
              :size="30"
            />
            <p class="ms-3">Bestehendes Projekt öffnen</p>
          </button>

          <div
            :id="`collapse1`"
            :class="['accordion-collapse collapse', { show: false }]"
            data-bs-parent="#accordionExample"
          >
            <div class="accordion-body">
              <!-- <ProjectUploader /> -->
            </div>
          </div>
        </div>
        <div class="accordion-item accordion-flush">
          <button
            class="accordion-button"
            :class="{ collapsed: showUpload }"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="`#collapse2`"
            :aria-controls="`collapse2`"
          >
            <FolderPlus
              :color="colors.primary"
              :size="30"
            />
            <p class="ms-3">Neues Projekt Anlegen</p>
          </button>

          <div
            :id="`collapse2`"
            :class="['accordion-collapse collapse', { show: !showUpload }]"
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
              <div v-if="showAdressSearch">
                <label class="form-label">Standort wählen:</label>
                <SearchBar />
              </div>
              <div class="d-flex gap-3 mt-4">
                <button
                  class="amarex-btn-primary grey mid full"
                  @click="resetProject"
                >
                  <p class="amarex-bold">Informationen zurücksetzen</p>
                </button>
                <button
                  class="amarex-btn-primary accent mid full"
                  :class="{ deactivated: !title }"
                  @click="saveProject"
                >
                  <p class="amarex-bold">
                    {{ showAdressSearch ? "Standort wählen & " : "" }}Projekt
                    starten
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
#project-starter-amarex {
  background: rgba(23, 53, 97, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100vw;
  height: 100vh;
  padding: 0 7vw 0 calc(370px + 7vw);
  & > div {
    background: $amarex_primary;
    padding: 4rem;
    @include radius();
    height: fit-content;
    width: 100%;
    @include clickable();
  }
  .accordion-button {
    font-size: 1rem !important;
    font-weight: 700 !important;
    color: $amarex_secondary !important;
    &:not(.collapsed) {
      background: $amarex_secondary_light !important;
    }
  }
  .accordion-item {
    padding: 1px !important;
    @include radius();
    border: 1px solid $amarex_secondary;
    &:first-of-type {
      margin-bottom: 2rem;
    }
  }
  label {
    font-size: 1rem !important;
    font-weight: 700;
    color: $amarex_secondary;
  }
  .accordion-body {
    padding: 2.5rem 2rem !important;
  }
  textarea {
    font-size: 1rem !important;
  }
}
</style>

