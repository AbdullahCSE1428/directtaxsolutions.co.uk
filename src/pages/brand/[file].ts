import type { APIRoute, GetStaticPaths } from 'astro';
import { brandLogoSvg, renderPng, type BrandLogo } from '../../lib/images';

/**
 * Downloadable logo files, generated from the same source as the site's logo:
 * /brand/logo-light.svg|png (for light backgrounds), /brand/logo-dark.svg|png
 * (for dark backgrounds), /brand/logo-mark.svg|png (the mark on its navy tile)
 * and /brand/logo-symbol.svg|png (the mark alone, transparent).
 */
const variants: BrandLogo[] = ['logo-light', 'logo-dark', 'logo-mark', 'logo-symbol'];

export const getStaticPaths: GetStaticPaths = () =>
  variants.flatMap((variant) => ['svg', 'png'].map((ext) => ({ params: { file: `${variant}.${ext}` } })));

export const GET: APIRoute = async ({ params }) => {
  const [variant, ext] = (params.file ?? '').split('.') as [BrandLogo, string];
  const logo = await brandLogoSvg(variant);
  if (ext === 'svg') return new Response(logo.svg, { headers: { 'Content-Type': 'image/svg+xml' } });
  // PNGs at print-friendly sizes: 2000px wide lockups, 1024px square mark.
  const square = variant === 'logo-mark' || variant === 'logo-symbol';
  const width = square ? 1024 : 2000;
  const height = Math.round((width * logo.height) / logo.width);
  return new Response(await renderPng(logo.svg, width, height), { headers: { 'Content-Type': 'image/png' } });
};
