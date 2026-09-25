import type { APIRoute } from 'astro';
import { company } from '../data/site';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: company.name,
        short_name: 'Direct Tax',
        start_url: '/',
        display: 'browser',
        background_color: '#040c17',
        theme_color: '#040c17',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
