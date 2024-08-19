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
  components: {},
  data() {
    return {
      sliderTypes: []
    };
  },
  computed: {
    updateSliderTypes() {
      return this.sliderTypes;
    },
  },
  mounted() {},
  methods: {},
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
      class="abimo-slider-segment"
      :style="{
        width: `${areaType.percentage}%`,
        backgroundColor: areaType.color,
      }"
      :title="`${areaType.name}: ${areaType.percentage}%`"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
.abimo-slider-bar {
  display: flex;
  height: 26px;
  width: 100%;
  background-color: #d9d9d9;
  border: 2px solid #878786;
  overflow: hidden;
}

.abimo-slider-segment {
  height: 100%;
}
</style>

