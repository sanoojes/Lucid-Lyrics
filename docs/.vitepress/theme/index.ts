import DefaultTheme from "vitepress/theme";
// https://vitepress.dev/guide/custom-theme
import { h } from "vue";

import type { Theme } from "vitepress";
import "./style.css";

export default {
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp() {
    // ...
  },
  extends: DefaultTheme,
} satisfies Theme;
