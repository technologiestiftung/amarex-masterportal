<script>
import src1 from "../../../portal/amarex/resources/img/Placeholder-Tutorial-Quarter.jpg";
import src2 from "../../../portal/amarex/resources/img/Placeholder-Tutorial-Tools.jpg";

/**
 * Abimo
 * @module modules/AbimoViewSelectorAmarex
 */
export default {
  name: "AbimoViewSelectorAmarex",
  data() {
    return {
      src1,
      src2,
    };
  },
  props: {
    nextStep: {
      type: Function,
      required: true,
    },
  },
};
</script>

<template lang="html">
  <div class="view-selector-container">
    <div>
      <p class="title">Gebietsplanung</p>
      <img :src="src1" />
      <p class="description">
        Für die Gebietsplanungstellen wir Ihnen unsere Schieberelger zur
        Verfügung, mit welchen Sie auf relativer Ebene Maßnahmen vergeben
        können.
      </p>
      <button
        class="amarex-btn-primary full accent"
        @click="nextStep('quarter')"
      >
        <p>Zur Gebietsplanung</p>
      </button>
    </div>
    <div>
      <p class="title">Lokale Planung</p>
      <img :src="src2" />
      <p class="description">
        Mit unserem Maßnahmentool, können Sie mehrere Maßnahmen frei innerhalb
        einer Blockteilfläche verorten.
      </p>
      <button
        class="amarex-btn-primary full accent deactivated"
        @click=""
      >
        <p>Zum Massnahmentool</p>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.view-selector-container {
  & > div {
    margin-top: 18px;
    img {
      max-width: 250px;
      margin: 5px 0;
    }
    button {
      margin-top: 18px;
    }
  }
}
.title {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 700;
  line-height: 32px;
}
.description {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
}
</style>

