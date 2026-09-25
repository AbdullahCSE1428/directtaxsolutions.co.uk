/**
 * Brand mark geometry, shared by the inline <Logo /> component and the
 * build-time image endpoints (favicons, app icons, social share image).
 */
export const logoMark = {
  radius: 17,
  gradient: ['#36baf6', '#0467a6'],
  /** Audit tick whose long stroke rises into an arrow. */
  tick: 'M16.5 34.5 26 44 47 21.5',
  head: 'M35.5 21H47V32.5',
} as const;

export const brandColors = {
  ink950: '#040c17',
  ink900: '#07182b',
  brand300: '#6fcdf8',
  brand400: '#36baf6',
  brand500: '#03a9f4',
  mint400: '#3fd9a0',
} as const;

/** Standalone SVG markup of the mark, e.g. for rasterising with sharp. */
export function logoMarkSvg(size = 64, { rounded = true } = {}): string {
  const radius = rounded ? logoMark.radius : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="6" y1="2" x2="58" y2="62" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${logoMark.gradient[0]}"/>
      <stop offset="1" stop-color="${logoMark.gradient[1]}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="${radius}" fill="url(#g)"/>
  <g fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="${logoMark.tick}"/>
    <path d="${logoMark.head}"/>
  </g>
</svg>`;
}
