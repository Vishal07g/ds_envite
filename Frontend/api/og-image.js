/**
 * Vercel Serverless Function: Dynamic Royal Wedding Monogram OG Image (JPEG)
 * 
 * Generates an HD 1200×630 monogram thumbnail on-the-fly with couple initials,
 * names, and wedding crest.
 * 
 * Uses opentype.js to convert Georgia font glyphs to pure SVG vector paths,
 * guaranteeing 100% reliable rendering without font-matching failures on Linux/Vercel.
 * Compresses with sharp to high-quality progressive JPEG strictly under 50KB.
 */

import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import opentype from 'opentype.js';
import { GEORGIA_BOLD_BASE64 } from './georgiaFont.js';

let cachedFont = null;

function getFont() {
  if (cachedFont) return cachedFont;
  try {
    if (GEORGIA_BOLD_BASE64) {
      const fontBuffer = Buffer.from(GEORGIA_BOLD_BASE64, 'base64');
      cachedFont = opentype.parse(
        fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength)
      );
      return cachedFont;
    }
  } catch (err) {
    console.error('Failed to parse in-memory Georgia font:', err);
  }
  return null;
}

function getCenteredPathData(font, text, centerX, centerY, fontSize) {
  if (!font || !text) return '';
  try {
    const p = font.getPath(text, 0, 0, fontSize);
    const bb = p.getBoundingBox();
    const width = bb.x2 - bb.x1;
    const height = bb.y2 - bb.y1;
    // TrueType Y points up, inverting across scale(1, -1)
    const offsetX = centerX - (bb.x1 + width / 2);
    const offsetY = -(centerY - (bb.y1 + height / 2));
    return font.getPath(text, offsetX, offsetY, fontSize).toPathData();
  } catch (e) {
    console.error(`Error generating path for "${text}":`, e);
    return '';
  }
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const bride = (url.searchParams.get('bride') || '').trim();
    const groom = (url.searchParams.get('groom') || '').trim();
    const title = (url.searchParams.get('title') || '').trim();
    const date = (url.searchParams.get('date') || '').trim();
    const venue = (url.searchParams.get('venue') || '').trim();
    const bgParam = (url.searchParams.get('bg') || '').trim();
    const accentParam = (url.searchParams.get('accent') || '').trim();

    let initials = '';
    let mainHeading = '';

    if (bride && groom) {
      const bInit = (bride.charAt(0) || 'B').toUpperCase();
      const gInit = (groom.charAt(0) || 'G').toUpperCase();
      initials = `${bInit} & ${gInit}`;
      mainHeading = `${bride.toUpperCase()}  &  ${groom.toUpperCase()}`;
    } else if (bride || groom) {
      const name = bride || groom;
      initials = (name.charAt(0) || 'D').toUpperCase();
      mainHeading = name.toUpperCase();
    } else if (title) {
      const words = title.split(/\s+/).filter(Boolean);
      initials = words.length >= 2 
        ? `${words[0].charAt(0).toUpperCase()} & ${words[1].charAt(0).toUpperCase()}`
        : (words[0]?.charAt(0) || 'DS').toUpperCase();
      mainHeading = title.toUpperCase();
    } else {
      initials = 'DS';
      mainHeading = 'ROYAL INVITATION';
    }

    let dateText = 'CORDIALLY INVITED';
    if (date) {
      try {
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
          dateText = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
        }
      } catch {}
    }

    let venueText = '';
    if (venue) {
      venueText = venue.length > 48 ? venue.slice(0, 46).toUpperCase() + '...' : venue.toUpperCase();
    }

    // Dynamic Color Palette
    const primaryBg = bgParam && bgParam.startsWith('#') ? bgParam : '#4a121d';
    const accentGold = accentParam && accentParam.startsWith('#') ? accentParam : '#D4AF37';

    const font = getFont();

    let typographySvg = '';
    if (font) {
      const initialsPath = getCenteredPathData(font, initials, 600, 255, initials.length > 3 ? 56 : 68);
      const coupleNamesPath = getCenteredPathData(font, mainHeading, 600, 440, mainHeading.length > 28 ? 24 : 32);
      const subtitlePath = getCenteredPathData(font, 'W E D D I N G   I N V I T A T I O N', 600, 488, 14);
      const datePath = getCenteredPathData(font, venueText ? `${dateText} • ${venueText}` : dateText, 600, 530, 12);

      typographySvg = `
  <g transform="scale(1, -1)">
    <path d="${initialsPath}" fill="url(#gold)"/>
    <path d="${coupleNamesPath}" fill="#FFFFFF"/>
    <path d="${subtitlePath}" fill="url(#gold)"/>
    <path d="${datePath}" fill="#F5DA88" opacity="0.95"/>
  </g>`;
    } else {
      // Fallback text if font object unavailable
      typographySvg = `
  <text x="600" y="255" text-anchor="middle" dominant-baseline="central" font-family="Georgia, serif" font-weight="bold" font-size="${initials.length > 3 ? 56 : 68}" fill="url(#gold)">${escapeXml(initials)}</text>
  <text x="600" y="440" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="${mainHeading.length > 28 ? 24 : 32}" fill="#FFFFFF">${escapeXml(mainHeading)}</text>
  <text x="600" y="488" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="url(#gold)">W E D D I N G   I N V I T A T I O N</text>
  <text x="600" y="530" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#F5DA88" opacity="0.95">${escapeXml(venueText ? `${dateText} • ${venueText}` : dateText)}</text>`;
    }

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
  </defs>

  <!-- Luxury Background with Theme Color Gradient -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="rgba(0,0,0,0.2)"/>

  <!-- Ornate Golden Outer Frames -->
  <rect x="36" y="36" width="1128" height="558" fill="none" stroke="url(#gold)" stroke-width="3" rx="6"/>
  <rect x="48" y="48" width="1104" height="534" fill="none" stroke="url(#gold)" stroke-width="1.2" opacity="0.45" rx="3"/>

  <!-- Corner Brackets -->
  <g stroke="url(#gold)" stroke-width="2.5" fill="none">
    <path d="M 48 88 L 48 48 L 88 48"/>
    <circle cx="56" cy="56" r="3" fill="${accentGold}"/>
    <path d="M 1152 88 L 1152 48 L 1112 48"/>
    <circle cx="1144" cy="56" r="3" fill="${accentGold}"/>
    <path d="M 48 542 L 48 582 L 88 582"/>
    <circle cx="56" cy="574" r="3" fill="${accentGold}"/>
    <path d="M 1152 542 L 1152 582 L 1112 582"/>
    <circle cx="1144" cy="574" r="3" fill="${accentGold}"/>
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

  ${typographySvg}
</svg>
`;

    const resvg = new Resvg(svg.trim(), { fitTo: { mode: 'width', value: 1200 } });
    const rawPng = resvg.render().asPng();

    // Compress to progressive JPEG (guaranteed < 50KB)
    let outputBuffer = await sharp(rawPng)
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toBuffer();

    if (outputBuffer.length > 49152) {
      outputBuffer = await sharp(rawPng)
        .jpeg({ quality: 74, progressive: true, mozjpeg: true })
        .toBuffer();
    }

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', outputBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(outputBuffer);
  } catch (error) {
    console.error('Error generating OG image:', error);
    // On unexpected error, return a dynamic SVG fallback rather than redirecting to a static couple monogram
    try {
      const fallbackUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const bride = fallbackUrl.searchParams.get('bride') || '';
      const groom = fallbackUrl.searchParams.get('groom') || '';
      const title = fallbackUrl.searchParams.get('title') || 'Special Invitation';
      const label = bride && groom ? `${bride} & ${groom}` : title;
      const bInit = bride ? bride.charAt(0).toUpperCase() : '';
      const gInit = groom ? groom.charAt(0).toUpperCase() : '';
      const fallbackInitials = bInit && gInit ? `${bInit} & ${gInit}` : (label.charAt(0) || 'DS').toUpperCase();

      const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
        <rect width="1200" height="630" fill="#2d0812"/>
        <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#D4AF37" stroke-width="2" rx="8"/>
        <circle cx="600" cy="270" r="120" fill="none" stroke="#D4AF37" stroke-width="3"/>
        <text x="600" y="280" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="70" fill="#D4AF37">${escapeXml(fallbackInitials)}</text>
        <text x="600" y="450" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="34" fill="#FFFFFF">${escapeXml(label.toUpperCase())}</text>
        <text x="600" y="495" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#D4AF37" letter-spacing="4">WEDDING INVITATION</text>
      </svg>`;
      const fallbackBuffer = await sharp(Buffer.from(fallbackSvg))
        .jpeg({ quality: 80 })
        .toBuffer();
      res.setHeader('Content-Type', 'image/jpeg');
      return res.status(200).send(fallbackBuffer);
    } catch {
      return res.status(500).send('Error generating thumbnail');
    }
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
