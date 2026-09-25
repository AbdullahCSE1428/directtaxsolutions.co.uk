import type { APIRoute } from 'astro';
import { logoMarkSvg } from '../data/brand';

export const GET: APIRoute = () =>
  new Response(logoMarkSvg(64), { headers: { 'Content-Type': 'image/svg+xml' } });
