/**
 * Build-time image generation (favicons, app icons and the social share
 * image). Everything is drawn as SVG — text is converted to vector paths with
 * opentype.js so no system fonts are needed — then rasterised with sharp.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as opentypeModule from 'opentype.js';
import sharp from 'sharp';
import { brandColors as c, logoMark, logoMarkSvg } from '../data/brand';

// opentype.js ships an ESM build (named exports) and a UMD build (default
// export); depending on how it is resolved we may get either shape.
const opentype: typeof opentypeModule =
  (opentypeModule as { default?: typeof opentypeModule }).default ?? opentypeModule;

type Font = opentypeModule.Font;

const fontFiles = {
  sans: '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
  sansSemi: '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff',
  serif: '@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff',
  mono: '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff',
} as const;

type FontName = keyof typeof fontFiles;
const fontCache = new Map<FontName, Promise<Font>>();

function loadFont(name: FontName): Promise<Font> {
  let font = fontCache.get(name);
  if (!font) {
    font = readFile(join(process.cwd(), 'node_modules', fontFiles[name])).then((buffer) =>
      opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)),
    );
    fontCache.set(name, font);
  }
  return font;
}

/**
 * Serialises path commands ourselves: opentype's own `toPathData` rounding can
 * emit `NaN` for some coordinates, which silently breaks the rest of the path.
 */
function toSvgPath(commands: opentypeModule.PathCommand[]): string {
  const n = (value: number) => String(Math.round(value * 10) / 10);
  return commands
    .map((cmd) => {
      switch (cmd.type) {
        case 'M':
        case 'L':
          return `${cmd.type}${n(cmd.x)} ${n(cmd.y)}`;
        case 'Q':
          return `Q${n(cmd.x1)} ${n(cmd.y1)} ${n(cmd.x)} ${n(cmd.y)}`;
        case 'C':
          return `C${n(cmd.x1)} ${n(cmd.y1)} ${n(cmd.x2)} ${n(cmd.y2)} ${n(cmd.x)} ${n(cmd.y)}`;
        default:
          return 'Z';
      }
    })
    .join('');
}

/**
 * Lays out a single line of text as an SVG path. Glyphs are placed directly
 * (with kerning) rather than through opentype's shaper, which does not support
 * every substitution table in these fonts — fine for plain Latin text.
 */
function textPath(font: Font, text: string, x: number, y: number, size: number, tracking = 0) {
  const scale = size / font.unitsPerEm;
  let cursor = x;
  let previous: opentypeModule.Glyph | undefined;
  let d = '';
  for (const char of text) {
    const glyph = font.charToGlyph(char);
    if (previous) cursor += font.getKerningValue(previous, glyph) * scale;
    d += toSvgPath(glyph.getPath(cursor, y, size).commands);
    cursor += (glyph.advanceWidth ?? 0) * scale + tracking * size;
    previous = glyph;
  }
  return { d, width: cursor - x - tracking * size };
}

type Run = { text: string; font: FontName; size: number; fill: string; tracking?: number };

/** Places consecutive runs (mixed fonts/colours) on one baseline. */
async function line(runs: Run[], x: number, y: number) {
  let cursor = x;
  const paths: string[] = [];
  const boxes: Array<{ run: Run; x: number; width: number }> = [];
  for (const run of runs) {
    const font = await loadFont(run.font);
    const { d, width } = textPath(font, run.text, cursor, y, run.size, run.tracking);
    paths.push(`<path d="${d}" fill="${run.fill}"/>`);
    boxes.push({ run, x: cursor, width });
    cursor += width;
  }
  return { svg: paths.join(''), width: cursor - x, boxes };
}

async function measure(runs: Run[]): Promise<number> {
  return (await line(runs, 0, 0)).width;
}

export async function renderPng(svg: string, width: number, height = width): Promise<Uint8Array> {
  const png = await sharp(Buffer.from(svg), { density: 144 })
    .resize(width, height)
    .png({ compressionLevel: 9 })
    .toBuffer();
  return new Uint8Array(png);
}

export function iconPng(size: number, options: { rounded?: boolean } = {}): Promise<Uint8Array> {
  return renderPng(logoMarkSvg(512, options), size);
}

/** Packs PNG images into a .ico container (PNG-in-ICO, supported everywhere today). */
export function createIco(images: Array<{ size: number; data: Uint8Array }>): Uint8Array {
  const headerSize = 6 + 16 * images.length;
  const totalSize = headerSize + images.reduce((sum, image) => sum + image.data.length, 0);
  const bytes = new Uint8Array(totalSize);
  const view = new DataView(bytes.buffer);
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: icon
  view.setUint16(4, images.length, true);
  let offset = headerSize;
  images.forEach((image, index) => {
    const entry = 6 + index * 16;
    view.setUint8(entry, image.size >= 256 ? 0 : image.size);
    view.setUint8(entry + 1, image.size >= 256 ? 0 : image.size);
    view.setUint16(entry + 4, 1, true); // colour planes
    view.setUint16(entry + 6, 32, true); // bits per pixel
    view.setUint32(entry + 8, image.data.length, true);
    view.setUint32(entry + 12, offset, true);
    bytes.set(image.data, offset);
    offset += image.data.length;
  });
  return bytes;
}

/** 1200×630 social share image. */
export async function ogImageSvg(): Promise<string> {
  const W = 1200;
  const H = 630;
  const left = 72;

  // Headline: shrink until the longest line fits beside the chart card.
  const maxWidth = 640;
  let sans = 62;
  let serif = 72;
  const headlineLines = (s: number, f: number): Run[][] => [
    [{ text: 'Committed to helping', font: 'sans', size: s, fill: '#fff', tracking: -0.035 }],
    [
      { text: 'you reach the ', font: 'sans', size: s, fill: '#fff', tracking: -0.035 },
      { text: 'right', font: 'serif', size: f, fill: c.brand300 },
    ],
    [{ text: 'accounting solution', font: 'serif', size: f, fill: c.brand300 }],
  ];
  for (;;) {
    const widths = await Promise.all(headlineLines(sans, serif).map(measure));
    if (Math.max(...widths) <= maxWidth || sans <= 40) break;
    sans -= 2;
    serif -= 2;
  }

  const lineGap = sans * 1.18;
  const firstBaseline = 262;
  const headline = await Promise.all(
    headlineLines(sans, serif).map((runs, index) => line(runs, left, firstBaseline + index * lineGap)),
  );

  // Hand-drawn circle around “right”, echoing the hero.
  const rightBox = headline[1]!.boxes[1]!;
  const cy = firstBaseline + lineGap - serif * 0.3;
  const circle = `<path d="M${rightBox.x + rightBox.width * 0.15} ${cy - serif * 0.5}
      C${rightBox.x + rightBox.width * 0.55} ${cy - serif * 0.72} ${rightBox.x + rightBox.width * 1.2} ${cy - serif * 0.62} ${rightBox.x + rightBox.width * 1.16} ${cy - serif * 0.05}
      C${rightBox.x + rightBox.width * 1.12} ${cy + serif * 0.52} ${rightBox.x - rightBox.width * 0.1} ${cy + serif * 0.6} ${rightBox.x - rightBox.width * 0.07} ${cy + serif * 0.02}
      C${rightBox.x - rightBox.width * 0.04} ${cy - serif * 0.42} ${rightBox.x + rightBox.width * 0.3} ${cy - serif * 0.66} ${rightBox.x + rightBox.width * 0.62} ${cy - serif * 0.66}"
      fill="none" stroke="${c.mint400}" stroke-width="3.5" stroke-linecap="round"/>`;

  const wordmark = await line(
    [
      { text: 'Direct ', font: 'sans', size: 30, fill: '#fff', tracking: -0.02 },
      { text: 'Tax', font: 'sans', size: 30, fill: c.brand400, tracking: -0.02 },
      { text: ' Solutions', font: 'sans', size: 30, fill: '#fff', tracking: -0.02 },
    ],
    left + 76,
    104,
  );
  const ltdX = left + 76 + wordmark.width + 14;
  const ltd = await line([{ text: 'LTD', font: 'mono', size: 13, fill: '#b3c0cf', tracking: 0.12 }], ltdX + 10, 99);

  const tagline = await line(
    [{ text: 'ACCOUNTANTS · TAX ADVISORS · BUSINESS MENTORS', font: 'mono', size: 17, fill: '#b3c0cf', tracking: 0.08 }],
    left,
    566,
  );
  const domainRuns: Run[] = [{ text: 'directtaxsolutions.co.uk', font: 'mono', size: 17, fill: c.brand300, tracking: 0.02 }];
  const domain = await line(domainRuns, W - left - (await measure(domainRuns)), 566);

  // Chart card on the right.
  const card = { x: 780, y: 168, w: 348, h: 282 };
  const cardTitle = await line([{ text: 'Management accounts', font: 'sansSemi', size: 17, fill: '#fff' }], card.x + 70, card.y + 44);
  const cardSub = await line([{ text: 'Budget vs actual', font: 'sansSemi', size: 13, fill: '#8a99ad' }], card.x + 70, card.y + 64);
  const bars = [52, 76, 66, 98, 88, 118];
  const baseY = card.y + card.h - 34;
  const barSvg = bars
    .map((value, index) => {
      const bx = card.x + 34 + index * 50;
      return `<rect x="${bx}" y="${baseY - value}" width="24" height="${value}" rx="7" fill="url(#bar)"/>`;
    })
    .join('');
  const points = [62, 72, 82, 92, 106, 128].map((value, index) => [card.x + 46 + index * 50, baseY - value] as const);
  let curve = `M${points[0]![0]} ${points[0]![1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    curve += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
  }
  const end = points[points.length - 1]!;

  const vat = { x: 700, y: 404, w: 250, h: 70 };
  const vatTitle = await line([{ text: 'VAT return', font: 'sans', size: 17, fill: c.ink900 }], vat.x + 68, vat.y + 32);
  const vatSub = await line([{ text: 'Submitted online', font: 'sansSemi', size: 13, fill: '#5d6d82' }], vat.x + 68, vat.y + 52);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glowBlue" cx="1020" cy="30" r="640" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${c.brand500}" stop-opacity="0.42"/>
      <stop offset="1" stop-color="${c.brand500}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowMint" cx="60" cy="660" r="440" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${c.mint400}" stop-opacity="0.2"/>
      <stop offset="1" stop-color="${c.mint400}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M60 0H0V60" fill="none" stroke="#fff" stroke-opacity="0.07"/>
    </pattern>
    <radialGradient id="gridFade" cx="760" cy="250" r="640" gradientUnits="userSpaceOnUse">
      <stop offset="0.25" stop-color="#fff"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <mask id="gridMask"><rect width="${W}" height="${H}" fill="url(#gridFade)"/></mask>
    <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.brand400}" stop-opacity="0.95"/>
      <stop offset="1" stop-color="#036ca1" stop-opacity="0.35"/>
    </linearGradient>
    <linearGradient id="mark" x1="6" y1="2" x2="58" y2="62" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${logoMark.gradient[0]}"/>
      <stop offset="1" stop-color="${logoMark.gradient[1]}"/>
    </linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="${c.ink950}"/>
  <rect width="${W}" height="${H}" fill="url(#grid)" mask="url(#gridMask)"/>
  <rect width="${W}" height="${H}" fill="url(#glowBlue)"/>
  <rect width="${W}" height="${H}" fill="url(#glowMint)"/>

  <g transform="translate(${left} 62)">
    <rect width="60" height="60" rx="${(logoMark.radius * 60) / 64}" fill="url(#mark)"/>
    <g transform="scale(${60 / 64})" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <path d="${logoMark.tick}"/><path d="${logoMark.head}"/>
    </g>
  </g>
  ${wordmark.svg}
  <rect x="${ltdX}" y="81" width="${ltd.width + 20}" height="26" rx="6" fill="none" stroke="#fff" stroke-opacity="0.25"/>
  ${ltd.svg}

  ${headline.map((item) => item.svg).join('')}
  ${circle}

  <g filter="url(#shadow)">
    <rect x="${card.x}" y="${card.y}" width="${card.w}" height="${card.h}" rx="26" fill="#0d2037"/>
  </g>
  <rect x="${card.x + 0.5}" y="${card.y + 0.5}" width="${card.w - 1}" height="${card.h - 1}" rx="26" fill="none" stroke="#fff" stroke-opacity="0.1"/>
  <rect x="${card.x + 22}" y="${card.y + 24}" width="36" height="36" rx="11" fill="${c.brand500}" fill-opacity="0.16"/>
  <path d="M${card.x + 29} ${card.y + 49}l7-7 5 5 9-9M${card.x + 44} ${card.y + 38}h6v6" fill="none" stroke="${c.brand300}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  ${cardTitle.svg}${cardSub.svg}
  ${[0, 1, 2].map((i) => `<line x1="${card.x + 26}" x2="${card.x + card.w - 26}" y1="${baseY - 40 - i * 45}" y2="${baseY - 40 - i * 45}" stroke="#fff" stroke-opacity="0.08" stroke-dasharray="3 6"/>`).join('')}
  ${barSvg}
  <path d="${curve}" fill="none" stroke="${c.mint400}" stroke-width="4" stroke-linecap="round"/>
  <circle cx="${end[0]}" cy="${end[1]}" r="9" fill="${c.mint400}" fill-opacity="0.3"/>
  <circle cx="${end[0]}" cy="${end[1]}" r="5.5" fill="#7ee8c1" stroke="${c.ink900}" stroke-width="2.5"/>

  <g filter="url(#shadow)">
    <rect x="${vat.x}" y="${vat.y}" width="${vat.w}" height="${vat.h}" rx="18" fill="#fff"/>
  </g>
  <rect x="${vat.x + 14}" y="${vat.y + 15}" width="40" height="40" rx="12" fill="#eaf7fe"/>
  <g transform="translate(${vat.x + 22} ${vat.y + 23})" fill="none" stroke="#036ca1" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 3h12v18l-2.2-1.4L13.6 21l-1.6-1.4L10.4 21l-2.2-1.4L6 21V3z"/><path d="M9.5 14.5l5-5"/>
  </g>
  ${vatTitle.svg}${vatSub.svg}
  <circle cx="${vat.x + vat.w - 34}" cy="${vat.y + 35}" r="15" fill="#14b881"/>
  <path d="M${vat.x + vat.w - 41} ${vat.y + 35.5}l4.5 4.5 9-9.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

  ${tagline.svg}
  ${domain.svg}
</svg>`;
}
