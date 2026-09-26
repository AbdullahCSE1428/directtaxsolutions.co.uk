/**
 * Brand identity: the logo mark's geometry and colours, shared by the inline
 * <Logo /> component and the build-time images (favicons, app icons, social
 * image and the downloadable logo files under /brand/).
 *
 * The mark is a capital “DT” ligature (Direct Tax): the top of the “D” runs on
 * to become the crossbar of the “T”, drawn as one monoline in a blue-to-mint
 * gradient that rises from bottom-left to top-right.
 */
export const logoMark = {
  gradient: [
    [0, '#1d4ed8'],
    [0.55, '#0ea5e9'],
    [1, '#34d399'],
  ],
  strokeWidth: 8,
  /** Strokes in drawing order: the D's stem and bowl, the shared top bar, the T's stem. */
  strokes: ['M8 14V50h9a15 18 0 0 0 0-36', 'M8 14h48', 'M45.5 14v36'],
  /** The rounded tile the mark sits on in white: a blue gradient from top-left to bottom-right. */
  tileGradient: ['#1d9fe3', '#053e70'],
  tileRadius: 15,
} as const;

export const brandColors = {
  ink950: '#040c17',
  ink900: '#07182b',
  brand300: '#6fcdf8',
  brand400: '#36baf6',
  brand500: '#03a9f4',
  brand600: '#0289cb',
  mint400: '#3fd9a0',
  slate300: '#b3c0cf',
  slate600: '#46566b',
} as const;

/** Gradient definition for the mark, in its 64×64 coordinate space. */
export function logoGradient(id: string): string {
  return `<linearGradient id="${id}" x1="8" y1="58" x2="56" y2="6" gradientUnits="userSpaceOnUse">${logoMark.gradient
    .map(([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`)
    .join('')}</linearGradient>`;
}

/** The “DT” glyph as SVG elements in the 64×64 box, stroked with `paint` (a colour or `url(#id)`). */
export function logoGlyph(paint: string): string {
  return `<g fill="none" stroke="${paint}" stroke-width="${logoMark.strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
    ${logoMark.strokes.map((d) => `<path d="${d}"/>`).join('')}
  </g>`;
}

/**
 * The mark in white on its rounded blue tile, as SVG elements in the 64×64 box;
 * `id` names the tile's gradient. `rounded: false` makes the tile full-bleed for
 * platforms that apply their own mask.
 */
export function logoTile(id: string, { rounded = true } = {}): string {
  const [from, to] = logoMark.tileGradient;
  return `<defs><linearGradient id="${id}" x1="6" y1="2" x2="58" y2="62" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
  <rect width="64" height="64" rx="${rounded ? logoMark.tileRadius : 0}" fill="url(#${id})"/>
  <g transform="translate(9 9) scale(0.72)">${logoGlyph('#ffffff')}</g>`;
}

/** Standalone SVG of the mark, on its tile (favicons, app icons) or without it in the blue-to-mint gradient. */
export function logoMarkSvg(size = 64, { tile = true, rounded = true } = {}): string {
  const body = tile ? logoTile('g', { rounded }) : `<defs>${logoGradient('g')}</defs>${logoGlyph('url(#g)')}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">${body}</svg>`;
}
