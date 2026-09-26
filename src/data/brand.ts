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
  /** Background tile used where the mark needs a solid square (app icons, favicons). */
  tile: '#07182b',
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

/** The “DT” glyph as SVG elements in the 64×64 box, stroked with gradient `id`. */
export function logoGlyph(id: string): string {
  return `<g fill="none" stroke="url(#${id})" stroke-width="${logoMark.strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
    ${logoMark.strokes.map((d) => `<path d="${d}"/>`).join('')}
  </g>`;
}

/**
 * Standalone SVG of the mark. With `tile` it sits on the navy square (favicons,
 * app icons); `rounded: false` makes that square full-bleed for platforms that
 * apply their own mask.
 */
export function logoMarkSvg(size = 64, { tile = true, rounded = true } = {}): string {
  const glyph = tile ? `<g transform="translate(9 9) scale(0.72)">${logoGlyph('g')}</g>` : logoGlyph('g');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <defs>${logoGradient('g')}</defs>
  ${tile ? `<rect width="64" height="64" rx="${rounded ? logoMark.tileRadius : 0}" fill="${logoMark.tile}"/>` : ''}
  ${glyph}
</svg>`;
}
