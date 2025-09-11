import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/Lucid-Lyrics/',
  title: 'Lucid Lyrics',
  description: 'A Small Documentation for Lucid Lyrics',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/getting-started' },
          // { text: 'Lyrics API', link: '/api-examples' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/sanoojes/Lucid-Lyrics' }],
  },
});
