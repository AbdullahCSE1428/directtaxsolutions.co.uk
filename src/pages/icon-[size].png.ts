import type { APIRoute, GetStaticPaths } from 'astro';
import { iconPng } from '../lib/images';

// App icons for the web manifest (full-bleed so they also work as maskable icons).
export const getStaticPaths: GetStaticPaths = () => [{ params: { size: '192' } }, { params: { size: '512' } }];

export const GET: APIRoute = async ({ params }) =>
  new Response(await iconPng(Number(params.size), { rounded: false }), {
    headers: { 'Content-Type': 'image/png' },
  });
