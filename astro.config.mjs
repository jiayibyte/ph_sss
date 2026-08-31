import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  site: 'https://aytool.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  integrations: [
    preact(),
    tailwind({ applyBaseStyles: false }),
    sitemap({
      // 404 is excluded via robots meta; sitemap must contain exactly the 19 indexable URLs
      filter: (page) => !page.includes('/404'),
    }),
    partytown({
      config: { forward: ['dataLayer.push'] },
    }),
  ],
});
