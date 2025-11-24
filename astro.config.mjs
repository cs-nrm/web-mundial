import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import tailwind from "@astrojs/tailwind";

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://sabrositadigital.mx',
  integrations: [mdx(), sitemap({ sitemap: '/sitemap.xml' }), tailwind()],

  devToolbar: {
    enabled: true
  },

  adapter: node({
    mode: 'standalone'
  }),
  output: 'server'
});