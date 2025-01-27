<script>
import { X as CloseIcon } from "lucide-vue-next";
import colors from "../../../src/shared/js/utils/amarex-colors.json";

/**
 * Abimo
 * @module modules/AbimoLayerInfo
 */
export default {
  name: "AbimoLayerInfo",
  components: {
    CloseIcon,
  },
  data() {
    return {
      colors,
    };
  },
  props: {
    showInfo: {
      type: Object,
      required: true,
    },
    hideInfo: {
      type: Function,
      required: true,
    },
  },
};
</script>

<template lang="html">
  <div
    class="layer-information-container legend"
    v-if="showInfo"
  >
    <div class="close-container">
      <CloseIcon
        :color="colors.amarex_secondary"
        :size="20"
        @click="hideInfo"
      />
    </div>
    <p
      v-if="showInfo?.title"
      class="title"
    >
      {{ showInfo?.title }}
    </p>
    <p
      v-if="showInfo?.legend"
      class="description"
    >
      Legende:
    </p>
    <div class="img-container">
      <img
        v-if="showInfo?.legend"
        :src="showInfo?.legend"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";
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
.layer-information-container {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: auto;
  border-top: 1px solid #c9d4e3;
  box-shadow: 0px -4px 8px 0px rgba(23, 53, 97, 0.06);
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: $amarex_primary;
  &.info {
    padding: 16px 24px 200px 24px;
  }
  &.legend {
    padding: 16px 24px;
  }
  .close-container {
    padding: 2px 0;
    display: flex;
    justify-content: flex-end;
    width: 100%;
    svg {
      cursor: pointer;
    }
  }
  .title {
    font-size: 18px !important;
    line-height: 24px !important;
    font-weight: 700;
    color: $amarex_secondary;
  }
  .img-container {
    overflow: scroll;
    max-height: 45vh;
    img {
      width: 100%;
      max-width: 450px;
    }
  }
}
</style>

