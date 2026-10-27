import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import opentype from 'opentype.js';
import { GEORGIA_BOLD_BASE64 } from '../api/georgiaFont.js';

const fontBuffer = Buffer.from(GEORGIA_BOLD_BASE64, 'base64');
const font = opentype.parse(
  fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength)
);

function getCenteredPathData(font, text, centerX, centerY, fontSize) {
  if (!font || !text) return '';
  const p = font.getPath(text, 0, 0, fontSize);
  const bb = p.getBoundingBox();
  const width = bb.x2 - bb.x1;
  const height = bb.y2 - bb.y1;
  const offsetX = centerX - (bb.x1 + width / 2);
  const offsetY = -(centerY - (bb.y1 + height / 2));
  return font.getPath(text, offsetX, offsetY, fontSize).toPathData();
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function renderThumbnail({
  initials,
  mainHeading,
  subtitle = 'W E D D I N G   I N V I T A T I O N',
  dateText = 'NOVEMBER 24, 2026',
  venueText = 'SNEHALATA MARRIAGE HALL',
  primaryBg = '#4a121d',
  accentGold = '#D4AF37',
  outputPath
}) {
  const initialsPath = getCenteredPathData(font, initials, 600, 255, initials.length <= 2 ? 76 : 64);
  const coupleNamesPath = getCenteredPathData(font, mainHeading, 600, 440, mainHeading.length > 28 ? 24 : 32);
  const subtitlePath = getCenteredPathData(font, subtitle, 600, 488, 14);
  const dateStr = venueText ? `${dateText} • ${venueText}` : dateText;
  const datePath = getCenteredPathData(font, dateStr, 600, 530, 12);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="${primaryBg}"/>
      <stop offset="60%" stop-color="#18040a"/>
      <stop offset="100%" stop-color="#0a0103"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FBF0B9"/>
      <stop offset="25%" stop-color="${accentGold}"/>
      <stop offset="50%" stop-color="#AA821C"/>
      <stop offset="75%" stop-color="#F5DA88"/>
      <stop offset="100%" stop-color="${accentGold}"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Luxury Background with Theme Color Gradient -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="rgba(0,0,0,0.2)"/>

  <!-- Ornate Luxury Border -->
  <rect x="36" y="36" width="1128" height="558" fill="none" stroke="url(#gold)" stroke-width="2.5" opacity="0.9"/>
  <rect x="46" y="46" width="1108" height="538" fill="none" stroke="${accentGold}" stroke-width="0.8" opacity="0.4"/>

  <!-- Corner Flourishes -->
  <g stroke="url(#gold)" stroke-width="2" fill="none">
    <path d="M 46 76 L 46 46 L 76 46"/>
    <path d="M 1154 76 L 1154 46 L 1124 46"/>
    <path d="M 46 554 L 46 584 L 76 584"/>
    <path d="M 1154 554 L 1154 584 L 1124 584"/>
  </g>
  <circle cx="56" cy="56" r="3.5" fill="url(#gold)"/>
  <circle cx="1144" cy="56" r="3.5" fill="url(#gold)"/>
  <circle cx="56" cy="574" r="3.5" fill="url(#gold)"/>
  <circle cx="1144" cy="574" r="3.5" fill="url(#gold)"/>

  <!-- Royal Circular Crest Ring -->
  <g filter="url(#glow)">
    <circle cx="600" cy="255" r="145" fill="none" stroke="url(#gold)" stroke-width="3" opacity="0.9"/>
  </g>
  <circle cx="600" cy="255" r="133" fill="none" stroke="${accentGold}" stroke-width="1.2" stroke-dasharray="4 6" opacity="0.6"/>

  <!-- Crown Ornament -->
  <g transform="translate(600, 126)">
    <path d="M -16 6 L -20 -10 L -6 -2 L 0 -14 L 6 -2 L 20 -10 L 16 6 Z" fill="url(#gold)"/>
    <circle cx="-20" cy="-12" r="2.2" fill="url(#gold)"/>
    <circle cx="0" cy="-16" r="2.8" fill="url(#gold)"/>
    <circle cx="20" cy="-12" r="2.2" fill="url(#gold)"/>
    <rect x="-14" y="8" width="28" height="2" fill="url(#gold)"/>
  </g>

  <!-- Vectorized Royal Typography -->
  <g transform="scale(1, -1)">
    <path d="${initialsPath}" fill="url(#gold)"/>
    <path d="${coupleNamesPath}" fill="#FFFFFF"/>
    <path d="${subtitlePath}" fill="url(#gold)"/>
    <path d="${datePath}" fill="#F5DA88" opacity="0.95"/>
  </g>

  <!-- Delicate Monogram Flourish below initials inside ring -->
  <g transform="translate(600, 320)" fill="url(#gold)" opacity="0.8">
    <circle cx="0" cy="0" r="3.5"/>
    <circle cx="-16" cy="0" r="2"/>
    <circle cx="16" cy="0" r="2"/>
    <path d="M -32 0 Q -24 -4 -16 0 Q -8 4 0 0 Q 8 -4 16 0 Q 24 4 32 0" fill="none" stroke="url(#gold)" stroke-width="1.5"/>
  </g>

  <!-- Decorative Separator Diamonds below couple names -->
  <g transform="translate(600, 464)" fill="url(#gold)" opacity="0.9">
    <polygon points="0,-4 4,0 0,4 -4,0"/>
    <line x1="-120" y1="0" x2="-20" y2="0" stroke="url(#gold)" stroke-width="1" opacity="0.6"/>
    <line x1="20" y1="0" x2="120" y2="0" stroke="url(#gold)" stroke-width="1" opacity="0.6"/>
  </g>
</svg>
`.trim();

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const rawPng = resvg.render().asPng();

  const outputBuffer = await sharp(rawPng)
    .jpeg({ quality: 85, progressive: true })
    .toBuffer();

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, outputBuffer);
  console.log(`Saved: ${outputPath} (${(outputBuffer.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  const projectRoot = fs.existsSync(path.join(process.cwd(), 'Frontend')) ? path.join(process.cwd(), 'Frontend') : process.cwd();
  const outDir = path.join(projectRoot, 'public', 'thumbnails');

  // 1. Vishal & Suman (vishal-suman) -> Initials VS
  await renderThumbnail({
    initials: 'VS',
    mainHeading: 'VISHAL & SUMAN',
    subtitle: 'W E D D I N G   I N V I T A T I O N',
    dateText: 'NOVEMBER 24, 2026',
    venueText: 'SNEHALATA MARRIAGE HALL',
    primaryBg: '#360911',
    accentGold: '#D4AF37',
    outputPath: path.join(outDir, 'vishal-suman.jpg')
  });

  // 2. Suman & Vishal (suman-vishal) -> Initials SV
  await renderThumbnail({
    initials: 'SV',
    mainHeading: 'SUMAN & VISHAL',
    subtitle: 'W E D D I N G   I N V I T A T I O N',
    dateText: 'NOVEMBER 24, 2026',
    venueText: 'SNEHALATA MARRIAGE HALL',
    primaryBg: '#4a121d',
    accentGold: '#D4AF37',
    outputPath: path.join(outDir, 'suman-vishal.jpg')
  });

  // 3. Radha & Krishna (radha-krishna) -> Initials RK
  await renderThumbnail({
    initials: 'RK',
    mainHeading: 'RADHA & KRISHNA',
    subtitle: 'W E D D I N G   I N V I T A T I O N',
    dateText: 'DECEMBER 12, 2026',
    venueText: 'THE STARLIGHT CATHEDRAL',
    primaryBg: '#400d18',
    accentGold: '#D4AF37',
    outputPath: path.join(outDir, 'radha-krishna.jpg')
  });

  // 4. Default / Wedding Fallback -> Initials DS
  await renderThumbnail({
    initials: 'DS',
    mainHeading: 'ROYAL WEDDING INVITATION',
    subtitle: 'W E D D I N G   I N V I T A T I O N',
    dateText: 'CORDIALLY INVITED',
    venueText: 'SPECIAL CELEBRATION',
    primaryBg: '#3d0a14',
    accentGold: '#D4AF37',
    outputPath: path.join(outDir, 'wedding.jpg')
  });

  console.log('\nAll thumbnails pre-rendered successfully!');
}

main().catch(console.error);
