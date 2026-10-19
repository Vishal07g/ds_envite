/**
 * Vercel Serverless Function: Dynamic Royal Wedding Monogram OG Image (PNG)
 * 
 * Generates an HD 1200×630 PNG monogram thumbnail on-the-fly with couple initials,
 * names, and wedding crest.
 * 
 * Used automatically by WhatsApp, Facebook, iMessage, Twitter, and LinkedIn
 * link previews when an invitation link is shared.
 * 
 * WhatsApp requires a real PNG/JPEG under 300KB — this outputs a crisp ~150KB PNG.
 */

import { Resvg } from '@resvg/resvg-js';

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
      <stop offset="100%" stop-color="#110205"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FBF0B9"/>
      <stop offset="25%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#AA821C"/>
      <stop offset="75%" stop-color="#F5DA88"/>
      <stop offset="100%" stop-color="#D4AF37"/>
    </linearGradient>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
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
  <circle cx="600" cy="255" r="138" fill="none" stroke="url(#gold)" stroke-width="3" filter="url(#softGlow)"/>
  <circle cx="600" cy="255" r="126" fill="none" stroke="url(#gold)" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.6"/>

  <!-- Crown Icon -->
  <text x="600" y="130" text-anchor="middle" font-size="28" fill="#d4af37">👑</text>

  <!-- Couple Monogram Initials -->
  <text x="600" y="275" text-anchor="middle" dominant-baseline="central" 
        font-family="Georgia, serif" font-weight="bold" font-size="82"
        fill="url(#gold)">${escapeXml(initials)}</text>

  <!-- Flourish beneath initials -->
  <text x="600" y="325" text-anchor="middle" font-size="16" fill="url(#gold)" opacity="0.85"
        font-family="serif">❦  ❖  ❦</text>

  <!-- Couple Full Names -->
  <text x="600" y="445" text-anchor="middle" 
        font-family="Georgia, serif" font-weight="bold" font-size="34"
        fill="#FFFFFF" letter-spacing="3">${escapeXml(coupleNames)}</text>

  <!-- Wedding Invitation Subtitle -->
  <text x="600" y="492" text-anchor="middle" 
        font-family="sans-serif" font-weight="600" font-size="15"
        fill="#D4AF37" letter-spacing="5">✦  W E D D I N G   I N V I T A T I O N  ✦</text>

  <!-- Date / Cordially Invited -->
  <text x="600" y="535" text-anchor="middle" 
        font-family="sans-serif" font-weight="500" font-size="13"
        fill="rgba(255,255,255,0.75)" letter-spacing="3">${escapeXml(dateText)}</text>
</svg>
`;

    const resvg = new Resvg(svg.trim(), {
      fitTo: { mode: 'width', value: 1200 },
    });
    const pngBuffer = resvg.render().asPng();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(pngBuffer);
  } catch (error) {
    console.error('Error generating OG image:', error);
    // Fallback: Redirect to static default PNG thumbnail
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
