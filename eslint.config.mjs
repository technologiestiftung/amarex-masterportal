import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default [
  { files: ["**/*.{js,mjs,cjs,vue}"] },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        $: true,
        _: true,
        Config: true,
        Radio: true,
        Backbone: true,
        Cesium: true,
        i18next: true,
        mapCollection: true,
        moduleCollection: true,
      },
    },
  },
  {
    rules: {
      "no-console": "off",
      "no-unused-vars": "off",
      "no-undef": "off",
      "backbone/no-collection-models": "off",
      "vue/no-deprecated-destroyed-lifecycle": "off",
      "vue/no-v-for-template-key-on-child": "off",
      "vue/no-deprecated-events-api": "off",
      "vue/no-deprecated-slot-attribute": "off",
      "vue/no-deprecated-slot-scope-attribute": "off",
      "vue/no-deprecated-v-on-native-modifier": "off",
      "no-control-regex": "off",
    },
  },
  pluginJs.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    ignores: [
      "node_modules",
      "dist",
      "public",
      "devtools",
      "portal/master",
      "portal/basic",
      "portal/auto",
    ],
  },
  eslintConfigPrettier,
];
