import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  description:
    "Yet another lyrics extension for Spotify. Documentation for installation, customization, and configuration.",
  head: [
    ["link", { href: "/favicon.ico", rel: "icon" }],
    ["meta", { content: "Sanooj E Sanish", name: "author" }],
    ["meta", { content: "https://lucid-lyrics.sanooj.uk", property: "og:url" }],
    [
      "script",
      {
        "data-cf-beacon": '{"token": "c65c4b2591bf43199d0e1dc7200f1987"}',
        defer: "true",
        src: "https://static.cloudflareinsights.com/beacon.min.js",
      },
    ],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ link: "/getting-started", text: "Guide" }],

    sidebar: [
      {
        items: [
          { link: "/", text: "Overview" },
          { link: "/getting-started", text: "Installation" },
          { link: "/screenshots", text: "Screenshots" },
          { link: "/uninstallation", text: "Uninstallation" },
          { link: "/credits", text: "Credits" },
        ],
        text: "Lucid Lyrics",
      },
    ],

    socialLinks: [
      { icon: "gitlab", link: "https://gitlab.com/sanoojes/lucid-lyrics" },
      {
        icon: "discord",
        link: "https://sanooj.uk/spicetify-discord",
      },
    ],
  },
  title: "Lucid Lyrics",
});
