// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Fonts are self-hosted from the @fontsource packages in node_modules, so the
// site never calls Google Fonts at runtime (faster, and no visitor data leaves
// the page before they interact with it).
const fontsource = (/** @type {string} */ path) => `./node_modules/@fontsource${path}`;

export default defineConfig({
  site: 'https://directtaxsolutions.co.uk',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/thank-you'),
    }),
  ],
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Plus Jakarta Sans',
      cssVariable: '--font-sans',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [
          {
            src: [fontsource('-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2')],
            weight: '200 800',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Instrument Serif',
      cssVariable: '--font-serif',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          {
            src: [fontsource('/instrument-serif/files/instrument-serif-latin-400-italic.woff2')],
            weight: 400,
            style: 'italic',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      fallbacks: ['ui-monospace', 'monospace'],
      options: {
        variants: [
          {
            src: [fontsource('/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2')],
            weight: 500,
            style: 'normal',
          },
        ],
      },
    },
  ],
});
