import type { APIRoute } from 'astro';
import { iconPng } from '../lib/images';

// iOS applies its own rounded mask, so this icon is square and full-bleed.
export const GET: APIRoute = async () =>
  new Response(await iconPng(180, { rounded: false }), { headers: { 'Content-Type': 'image/png' } });
