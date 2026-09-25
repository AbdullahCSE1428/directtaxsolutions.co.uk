import type { APIRoute } from 'astro';
import { createIco, iconPng } from '../lib/images';

export const GET: APIRoute = async () => {
  const sizes = [16, 32, 48];
  const images = await Promise.all(sizes.map(async (size) => ({ size, data: await iconPng(size) })));
  return new Response(createIco(images), { headers: { 'Content-Type': 'image/x-icon' } });
};
