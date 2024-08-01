import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/",
      "build/",
      "dist/",
      "portalconfigs/",
      "scripte/",
      "src/",
      "/addons/*",
      "!addons/addons_3_0_0",
      "jsdoc/",
      "lib/",
      "examples/",
      "/portal/*",
      "!/portal/amarex",
    ],
  },
  { files: ["**/*.{js,mjs,cjs,vue}"] },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
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
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }], // This allows unused variables prefixed with underscore
    },
  },
  pluginJs.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  eslintConfigPrettier,
];
