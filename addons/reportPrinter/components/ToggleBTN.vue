<template>
  <div>
    <svg
      v-if="isActive"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 6H8C4.68629 6 2 8.68629 2 12C2 15.3137 4.68629 18 8 18H16C19.3137 18 22 15.3137 22 12C22 8.68629 19.3137 6 16 6Z"
        fill="#173561"
        stroke="#173561"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M16 17C18.7614 17 21 14.7614 21 12C21 9.23858 18.7614 7 16 7C13.2386 7 11 9.23858 11 12C11 14.7614 13.2386 17 16 17Z"
        fill="white"
      />
    </svg>
    <svg
      v-else
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 6H8C4.68629 6 2 8.68629 2 12C2 15.3137 4.68629 18 8 18H16C19.3137 18 22 15.3137 22 12C22 8.68629 19.3137 6 16 6Z"
        stroke="#5A5A5A"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M8 17C10.7614 17 13 14.7614 13 12C13 9.23858 10.7614 7 8 7C5.23858 7 3 9.23858 3 12C3 14.7614 5.23858 17 8 17Z"
        fill="#5A5A5A"
      />
    </svg>
  </div>
</template>

<script>
export default {
  name: "ToggleBTN",
  props: {
    isActive: {
      type: Boolean,
      required: true,
    },
    size: {
      type: Number,
      default: 32,
    },
  },
};
</script>

