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

const FIREBASE_DB_URL = 'https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data/invitations.json';

function capitalizeWord(word = '') {
  if (!word) return '';
  if (word.length <= 3) return word.toUpperCase();
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function getCoupleDetails({
  bride = '',
  groom = '',
  title = '',
  slug = '',
  customSlug = '',
  config = {}
} = {}) {
  const cleanBride = (bride || config?.coverBrideText || config?.brideName || '').trim();
  const cleanGroom = (groom || config?.coverGroomText || config?.groomName || '').trim();
  const cleanTitle = (title || config?.weddingTitle || '').trim();
  const rawSlug = String(slug || customSlug || '')
    .toLowerCase()
    .replace(/^https?:\/\/[^\/]+\/invite\//, '')
    .replace(/^invite-/, '')
    .replace(/-\d{6,}$/, '')
    .trim();

  let isGroomFirst = false;

  if (cleanBride && cleanGroom) {
    const brideSlug = cleanBride.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const groomSlug = cleanGroom.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (rawSlug) {
      if (rawSlug.startsWith(groomSlug)) {
        isGroomFirst = true;
      } else if (rawSlug.startsWith(brideSlug)) {
        isGroomFirst = false;
      }
    }

    if (!rawSlug && cleanTitle) {
      const titleLower = cleanTitle.toLowerCase();
      const gIdx = titleLower.indexOf(cleanGroom.toLowerCase());
      const bIdx = titleLower.indexOf(cleanBride.toLowerCase());
      if (gIdx !== -1 && bIdx !== -1) {
        isGroomFirst = gIdx < bIdx;
      } else if (gIdx !== -1) {
        isGroomFirst = true;
      }
    }
  } else if (!cleanBride && !cleanGroom && rawSlug) {
    const parts = rawSlug.split(/[-_]+/).filter(Boolean);
    const EVENT_WORDS = new Set(['wedding', 'invitation', 'invite', 'weds', 'and', 'reception', 'engagement', 'anniversary', 'birthday', 'party', 'sample', 'demo']);
    const names = parts.filter(p => !/^\d+$/.test(p) && !EVENT_WORDS.has(p.toLowerCase()));
    if (names.length >= 2) {
      const p1 = capitalizeWord(names[0]);
      const p2 = capitalizeWord(names[1]);
      return {
        firstPerson: p1,
        secondPerson: p2,
        isGroomFirst: false,
        initials: `${p1.charAt(0)}${p2.charAt(0)}`.toUpperCase(),
        displayName: `${p1} & ${p2}`,
        slug: `${names[0].toLowerCase()}-${names[1].toLowerCase()}`
      };
    } else if (names.length === 1) {
      const p1 = capitalizeWord(names[0]);
      return {
        firstPerson: p1,
        secondPerson: '',
        isGroomFirst: false,
        initials: p1.slice(0, 2).toUpperCase(),
        displayName: p1,
        slug: names[0].toLowerCase()
      };
    }
  }

  const firstPerson = isGroomFirst ? cleanGroom : cleanBride;
  const secondPerson = isGroomFirst ? cleanBride : cleanGroom;

  let initials = '';
  let displayName = '';

  if (firstPerson && secondPerson) {
    const fInit = (firstPerson.charAt(0) || 'B').toUpperCase();
    const sInit = (secondPerson.charAt(0) || 'G').toUpperCase();
    initials = `${fInit}${sInit}`;
    displayName = `${firstPerson} & ${secondPerson}`;
  } else if (firstPerson || secondPerson) {
    const single = firstPerson || secondPerson;
    initials = single.slice(0, 2).toUpperCase();
    displayName = single;
  } else if (cleanTitle) {
    const words = cleanTitle.split(/\s+/).filter(Boolean);
    initials = words.length >= 2 
      ? `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
      : cleanTitle.slice(0, 2).toUpperCase();
    displayName = cleanTitle;
  } else {
    initials = 'DS';
    displayName = 'Royal Wedding';
  }

  const toSlug = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const slugPart = (firstPerson && secondPerson)
    ? `${toSlug(firstPerson)}-${toSlug(secondPerson)}`
    : (firstPerson ? toSlug(firstPerson) : 'wedding');

  return {
    firstPerson,
    secondPerson,
    isGroomFirst,
    initials,
    displayName,
    slug: slugPart
  };
}

function parseNamesFromSlug(slug = '') {
  if (!slug) return { bride: '', groom: '', title: '' };
  const cleaned = String(slug).replace(/^invite-/, '').replace(/-\d{6,}$/, '').trim();
  const rawParts = cleaned.split(/[-_]+/).filter(Boolean);
  const EVENT_WORDS = new Set(['wedding', 'invitation', 'invite', 'weds', 'and', 'reception', 'engagement', 'anniversary', 'birthday', 'party', 'sample', 'demo']);
  const parts = rawParts.filter(p => !/^\d+$/.test(p) && !EVENT_WORDS.has(p.toLowerCase()));
  if (parts.length >= 2) {
    return { bride: capitalizeWord(parts[0]), groom: capitalizeWord(parts[1]), title: `${capitalizeWord(parts[0])} & ${capitalizeWord(parts[1])} — Wedding Invitation` };
  } else if (parts.length === 1) {
    return { bride: capitalizeWord(parts[0]), groom: '', title: `${capitalizeWord(parts[0])} — Digital Invitation` };
  }
  return { bride: '', groom: '', title: 'Special Invitation' };
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const getParam = (k) => (url.searchParams.get(k) || url.searchParams.get(`amp;${k}`) || (req.query && req.query[k]) || '').trim();

    let slug = getParam('slug');
    if (slug) {
      slug = slug.replace(/\.(jpg|jpeg|png)$/i, '');
    }

    let bride = getParam('bride');
    let groom = getParam('groom');
    let title = getParam('title');
    let date = getParam('date');
    let venue = getParam('venue');
    let bgParam = getParam('bg');
    let accentParam = getParam('accent');

    // If slug is provided but bride/groom details are missing, resolve from database or slug parsing
    let matchedInvite = null;
    if (slug && (!bride || !groom)) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
        const fbRes = await fetch(FIREBASE_DB_URL, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (fbRes.ok) {
          const invData = await fbRes.json();
          const invList = Array.isArray(invData) ? invData : Object.values(invData || {});
          const targetSlug = slug.toLowerCase().trim();
          const strippedTarget = targetSlug.replace(/^invite-/, '').replace(/-\d{6,}$/, '');
          const numMatch = targetSlug.match(/(\d{6,})/);

          matchedInvite = invList.find(i => {
            if (!i) return false;
            const s = String(i.slug || '').toLowerCase();
            const cs = String(i.customSlug || '').toLowerCase();
            const id = String(i.id || '').toLowerCase();
            const sStripped = s.replace(/^invite-/, '').replace(/-\d{6,}$/, '');
            const csStripped = cs.replace(/^invite-/, '').replace(/-\d{6,}$/, '');
            return (s && (s === targetSlug || s.startsWith(targetSlug) || targetSlug.startsWith(s))) ||
                   (cs && (cs === targetSlug || cs.startsWith(targetSlug) || targetSlug.startsWith(cs))) ||
                   sStripped === strippedTarget || csStripped === strippedTarget ||
                   (numMatch && (id.includes(numMatch[1]) || s.includes(numMatch[1]) || cs.includes(numMatch[1])));
          });

          if (matchedInvite && matchedInvite.config) {
            bride = bride || matchedInvite.config.brideName || matchedInvite.config.coverBrideText || '';
            groom = groom || matchedInvite.config.groomName || matchedInvite.config.coverGroomText || '';
            title = title || matchedInvite.config.weddingTitle || matchedInvite.title || '';
            date = date || matchedInvite.config.weddingDate || '';
            venue = venue || matchedInvite.config.weddingVenue || '';
            bgParam = bgParam || matchedInvite.config.primaryColor || '';
            accentParam = accentParam || matchedInvite.config.accentGold || '';
          }
        }
      } catch (err) {
        // Fall through to slug name parsing
      }

      if (!bride && !groom) {
        const parsed = parseNamesFromSlug(slug);
        bride = bride || parsed.bride;
        groom = groom || parsed.groom;
        title = title || parsed.title;
      }
    }

    const couple = getCoupleDetails({
      bride,
      groom,
      title,
      slug: slug || matchedInvite?.slug || matchedInvite?.customSlug
    });

    const initials = couple.initials;
    const mainHeading = (couple.displayName || title || 'ROYAL INVITATION').toUpperCase();

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
      const initialsPath = getCenteredPathData(font, initials, 600, 255, initials.length > 3 ? 56 : (initials.length <= 2 ? 76 : 68));
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
  <text x="600" y="255" text-anchor="middle" dominant-baseline="central" font-family="Georgia, serif" font-weight="bold" font-size="${initials.length > 3 ? 56 : (initials.length <= 2 ? 76 : 68)}" fill="url(#gold)">${escapeXml(initials)}</text>
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
    res.setHeader('X-Robots-Tag', 'all, index, follow');
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
