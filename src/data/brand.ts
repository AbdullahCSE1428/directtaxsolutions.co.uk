/**
 * Brand identity: the logo mark's geometry and colours, shared by the inline
 * <Logo /> component and the build-time images (favicons, app icons, social
 * image and the downloadable logo files under /brand/).
 *
 * The mark is a “D” monogram (for Direct) with a rising arrow in its counter,
 * set on a deep blue tile.
 */
export const logoMark = {
  radius: 16,
  gradient: ['#1d9fe3', '#053e70'],
  /** The D letterform, drawn as a stroke. */
  letter: 'M20 16.5v31h10a15.5 15.5 0 0 0 0-31z',
  letterWidth: 6.5,
  /** The growth arrow inside the D's counter (shaft, then head). */
  arrow: ['M26 38.5 35.5 29', 'M29.5 28.5h6.5v6.5'],
  arrowWidth: 4.2,
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

/** The white D + arrow glyph (no tile), as SVG elements in the 64×64 box. */
export function logoGlyph(color = '#fff'): string {
  return `<path d="${logoMark.letter}" fill="none" stroke="${color}" stroke-width="${logoMark.letterWidth}" stroke-linejoin="round"/>
  <g fill="none" stroke="${color}" stroke-width="${logoMark.arrowWidth}" stroke-linecap="round" stroke-linejoin="round">${logoMark.arrow
    .map((d) => `<path d="${d}"/>`)
    .join('')}</g>`;
}

/** Gradient definition for the tile, in the mark's 64×64 coordinate space. */
export function logoGradient(id: string): string {
  return `<linearGradient id="${id}" x1="6" y1="2" x2="58" y2="62" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${logoMark.gradient[0]}"/>
    <stop offset="1" stop-color="${logoMark.gradient[1]}"/>
  </linearGradient>`;
}

/** Standalone SVG of the mark (tile + glyph), e.g. for favicons and app icons. */
export function logoMarkSvg(size = 64, { rounded = true } = {}): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <defs>${logoGradient('g')}</defs>
  <rect width="64" height="64" rx="${rounded ? logoMark.radius : 0}" fill="url(#g)"/>
  ${logoGlyph()}
</svg>`;
}
