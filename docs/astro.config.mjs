// @ts-check
import { defineConfig } from 'astro/config';
import { remarkMagicLinks } from '@sailkit-dev/atlas';

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [
      [remarkMagicLinks, {
        urlBuilder: (id) => `/docs/${id}/`,
        syntax: 'wiki',
      }],
    ],
  },
});
