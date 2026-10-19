/**
 * Vercel Serverless Function: Dynamic Royal Wedding Monogram OG Image (PNG)
 * 
 * Generates an HD 1200×630 PNG monogram thumbnail on-the-fly with couple initials,
 * names, and wedding crest.
 * 
 * Used automatically by WhatsApp, Facebook, iMessage, Twitter, and LinkedIn
 * link previews when an invitation link is shared.
 * 
 * Includes bundled Georgia font buffer so text and initials ALWAYS render with
 * 100% reliability in serverless Linux environments without relying on system fonts.
 */

import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { GEORGIA_BOLD_BASE64 } from './georgiaFont.js';

let cachedFontBuffer = null;

function getFontBuffer() {
  if (cachedFontBuffer) return cachedFontBuffer;

  // 1. Try reading from filesystem
  const candidatePaths = [
    path.resolve(process.cwd(), 'api/fonts/georgiab.ttf'),
    path.resolve(process.cwd(), 'public/fonts/georgiab.ttf'),
    path.resolve('api/fonts/georgiab.ttf'),
    path.resolve('public/fonts/georgiab.ttf'),
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        cachedFontBuffer = fs.readFileSync(p);
        return cachedFontBuffer;
      }
    } catch {}
  }

  // 2. Guaranteed in-memory fallback
  if (GEORGIA_BOLD_BASE64) {
    cachedFontBuffer = Buffer.from(GEORGIA_BOLD_BASE64, 'base64');
    return cachedFontBuffer;
  }

  return null;
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const bride = url.searchParams.get('bride') || 'Bride';
    const groom = url.searchParams.get('groom') || 'Groom';
    const date = url.searchParams.get('date') || '';

    const brideInitial = bride.trim().charAt(0).toUpperCase() || 'B';
    const groomInitial = groom.trim().charAt(0).toUpperCase() || 'G';
    const initials = `${brideInitial} & ${groomInitial}`;
    const coupleNames = `${bride.trim().toUpperCase()}  &  ${groom.trim().toUpperCase()}`;

    let dateText = 'CORDIALLY INVITED';
    if (date) {
      try {
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
          dateText = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
        }
      } catch {}
    }

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#4a121d"/>
      <stop offset="50%" stop-color="#2a0810"/>
      <stop offset="100%" stop-color="#120205"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FBF0B9"/>
      <stop offset="25%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#AA821C"/>
      <stop offset="75%" stop-color="#F5DA88"/>
      <stop offset="100%" stop-color="#D4AF37"/>
    </linearGradient>
  </defs>

  <!-- Luxury Burgundy Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="rgba(0,0,0,0.15)"/>

  <!-- Ornate Golden Outer Frames -->
  <rect x="36" y="36" width="1128" height="558" fill="none" stroke="url(#gold)" stroke-width="3" rx="6"/>
  <rect x="48" y="48" width="1104" height="534" fill="none" stroke="url(#gold)" stroke-width="1.2" opacity="0.45" rx="3"/>

  <!-- Corner Brackets -->
  <g stroke="url(#gold)" stroke-width="2.5" fill="none">
    <path d="M 48 88 L 48 48 L 88 48"/>
    <circle cx="56" cy="56" r="3" fill="#D4AF37"/>
    <path d="M 1152 88 L 1152 48 L 1112 48"/>
    <circle cx="1144" cy="56" r="3" fill="#D4AF37"/>
    <path d="M 48 542 L 48 582 L 88 582"/>
    <circle cx="56" cy="574" r="3" fill="#D4AF37"/>
    <path d="M 1152 542 L 1152 582 L 1112 582"/>
    <circle cx="1144" cy="574" r="3" fill="#D4AF37"/>
  </g>

  <!-- Central Crest Rings -->
  <circle cx="600" cy="255" r="138" fill="none" stroke="url(#gold)" stroke-width="3"/>
  <circle cx="600" cy="255" r="126" fill="none" stroke="url(#gold)" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.6"/>

  <!-- Crown Icon (Vector Path) -->
  <g transform="translate(600, 130)">
    <path d="M -16 8 L -20 -8 L -9 -2 L 0 -14 L 9 -2 L 20 -8 L 16 8 Z" fill="url(#gold)"/>
    <circle cx="-20" cy="-10" r="2" fill="#FFF8E0"/>
    <circle cx="0" cy="-16" r="2.5" fill="#FFF8E0"/>
    <circle cx="20" cy="-10" r="2" fill="#FFF8E0"/>
  </g>

  <!-- Couple Monogram Initials -->
  <text x="600" y="275" text-anchor="middle" dominant-baseline="central" 
        font-family="Georgia" font-weight="bold" font-size="82"
        fill="url(#gold)">${escapeXml(initials)}</text>

  <!-- Couple Full Names -->
  <text x="600" y="445" text-anchor="middle" 
        font-family="Georgia" font-weight="bold" font-size="34"
        fill="#FFFFFF" letter-spacing="3">${escapeXml(coupleNames)}</text>

  <!-- Wedding Invitation Subtitle -->
  <text x="600" y="492" text-anchor="middle" 
        font-family="Georgia" font-weight="bold" font-size="15"
        fill="#D4AF37" letter-spacing="5">WEDDING INVITATION</text>

  <!-- Date / Cordially Invited -->
  <text x="600" y="535" text-anchor="middle" 
        font-family="Georgia" font-size="13"
        fill="#D4AF37" opacity="0.9" letter-spacing="3">${escapeXml(dateText)}</text>
</svg>
`;

    const fontBuffer = getFontBuffer();
    const resvgOpts = {
      fitTo: { mode: 'width', value: 1200 },
    };

    if (fontBuffer) {
      resvgOpts.font = {
        fontBuffers: [fontBuffer],
        loadSystemFonts: false,
        defaultFontFamily: 'Georgia',
      };
    }

    const resvg = new Resvg(svg.trim(), resvgOpts);
    const pngBuffer = resvg.render().asPng();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(pngBuffer);
  } catch (error) {
    console.error('Error generating OG image:', error);
    res.redirect(302, '/wedding_monogram_thumbnail.png');
  }
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
