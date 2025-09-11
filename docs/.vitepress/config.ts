import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/Lucid-Lyrics/',
  title: 'Lucid Lyrics',
  description: 'A Small Documentation for Lucid Lyrics',
  head: [['link', { rel: 'icon', href: './favicon.ico' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Installation', link: '/installation' },
      { text: 'Uninstallation', link: '/uninstallation' },
      { text: 'Credits', link: '/credits' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/installation' },
          { text: 'Uninstallation', link: '/uninstallation' },
        ],
      },
      {
        text: 'Credits',
        items: [{ text: 'Credits', link: '/credits' }],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/sanoojes/Lucid-Lyrics' }],
  },
});
