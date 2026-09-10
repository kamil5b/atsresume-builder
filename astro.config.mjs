// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://username.github.io',
  base: '/atsresume-builder',
  output: 'static',
  integrations: [
    react(),
    tailwind(),
  ],
});
