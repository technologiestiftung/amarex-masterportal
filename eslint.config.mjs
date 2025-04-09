import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default [
  // Ignored files
  {
    ignores: [
      "**/node_modules/",
      "**/dist/",
      "**/portalconfigs/",
      "**/jsdoc/",
      "**/docHtml/",
      "**/.git/",
      "**/.vscode/",
      "**/build/",
      "portalconfigs/",
      "scripte/",
      "**/src/",
      "**/doc/",
      "**/devtools/",
      "jsdoc/",
      "lib/",
      "examples/",
      "/portal/*",
      "!/portal/amarex",
      "site/",
      ".venv/",
    ],
  },

  // Main rule config
  {
    files: ["**/*.{js,mjs,cjs,vue}"],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha,
        ...globals.amd,
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

    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },

  // ESLint + Vue + Prettier configs
  pluginJs.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  eslintConfigPrettier,
];
