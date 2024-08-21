<script>
/**
 * AbimoSlider
 * @module modules/AbimoSlider
 */
export default {
  name: "AbimoSlider",
  props: {
    areaTypes: {
      type: Array,
      required: true,
    },
  },
};
</script>

<template lang="html">
  <div
    id="AbimoSlider-root"
    class="abimo-slider-bar"
  >
    <div
      v-for="(areaType, index) in areaTypes"
      :key="index"
      :class="['abimo-slider-segment', `${areaType.id}`]"
      :style="{
        width: `${areaType.percentage * 100}%`,
      }"
      :title="`${areaType.name}: ${areaType.percentage * 100}%`"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
.abimo-slider-bar {
  display: flex;
  height: 26px;
  width: 100%;
  background-color: #d9d9d9;
  // border: 2px solid #878786;
  overflow: hidden;
}

.abimo-slider-segment {
  height: 100%;
  // border: 2px solid;
}
.unpvd {
  background-color: #53c486;
  // border-color: #2e9f61;
}
.roof {
  background-color: #d17b7b;
  // border-color: #971f1f;
}
.pvd {
  background-color: #dfdf6b;
  // border-color: #b4b446;
}
</style>

