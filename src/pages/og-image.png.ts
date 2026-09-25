import type { APIRoute } from 'astro';
import { ogImageSvg, renderPng } from '../lib/images';

export const GET: APIRoute = async () =>
  new Response(await renderPng(await ogImageSvg(), 1200, 630), {
    headers: { 'Content-Type': 'image/png' },
  });
