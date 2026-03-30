import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Lucid Lyrics",
  description:
    "Yet another lyrics extension for Spotify. Documentation for installation, customization, and configuration.",
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { name: "author", content: "Sanooj E Sanish" }],
    ["meta", { property: "og:url", content: "https://lucid-lyrics.sanooj.uk" }],
    [
      "script",
      {
        src: "https://static.cloudflareinsights.com/beacon.min.js",
        "data-cf-beacon": '{"token": "c65c4b2591bf43199d0e1dc7200f1987"}',
        defer: "true",
      },
    ],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "Guide", link: "/getting-started" }],

    sidebar: [
      {
        text: "Lucid Lyrics",
        items: [
          { text: "Overview", link: "/" },
          { text: "Installation", link: "/getting-started" },
          { text: "Screenshots", link: "/screenshots" },
          { text: "Uninstallation", link: "/uninstallation" },
          { text: "Credits", link: "/credits" },
        ],
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
});
