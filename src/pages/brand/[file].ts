import type { APIRoute, GetStaticPaths } from 'astro';
import { brandLogoSvg, renderPng } from '../../lib/images';

/**
 * Downloadable logo files, generated from the same source as the site's logo:
 * /brand/logo-light.svg|png (for light backgrounds), /brand/logo-dark.svg|png
 * (for dark backgrounds) and /brand/logo-mark.svg|png (the square mark).
 */
const variants = ['logo-light', 'logo-dark', 'logo-mark'] as const;

export const getStaticPaths: GetStaticPaths = () =>
  variants.flatMap((variant) => ['svg', 'png'].map((ext) => ({ params: { file: `${variant}.${ext}` } })));

export const GET: APIRoute = async ({ params }) => {
  const [variant, ext] = (params.file ?? '').split('.') as [(typeof variants)[number], string];
  const logo = await brandLogoSvg(variant);
  if (ext === 'svg') return new Response(logo.svg, { headers: { 'Content-Type': 'image/svg+xml' } });
  // PNGs at print-friendly sizes: 2000px wide lockups, 1024px square mark.
  const width = variant === 'logo-mark' ? 1024 : 2000;
  const height = Math.round((width * logo.height) / logo.width);
  return new Response(await renderPng(logo.svg, width, height), { headers: { 'Content-Type': 'image/png' } });
};
