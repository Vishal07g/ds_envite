import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';

const publicDir = path.resolve('public');
const logoPath = path.join(publicDir, 'favicon.png');

async function updateBanner() {
  console.log('Regenerating website_thumbnail.jpg with luxury brand presentation...');

  const logoBuffer = await sharp(logoPath)
    .resize(170, 170)
    .png()
    .toBuffer();

  const logoBase64 = logoBuffer.toString('base64');

  const bannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <!-- Background Radial Gradient -->
    <radialGradient id="mainBg" cx="50%" cy="38%" r="85%">
      <stop offset="0%" stop-color="#240a12" />
      <stop offset="35%" stop-color="#140308" />
      <stop offset="70%" stop-color="#090104" />
      <stop offset="100%" stop-color="#030002" />
    </radialGradient>

    <!-- Metallic Royal Gold Gradient -->
    <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFF2CA" />
      <stop offset="20%" stop-color="#F2D16B" />
      <stop offset="50%" stop-color="#CFA430" />
      <stop offset="80%" stop-color="#F8E39D" />
      <stop offset="100%" stop-color="#AF851C" />
    </linearGradient>

    <!-- Card Border Gradient -->
    <linearGradient id="cardBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F2D16B" stop-opacity="0.85" />
      <stop offset="50%" stop-color="#805c10" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#F2D16B" stop-opacity="0.75" />
    </linearGradient>

    <!-- Ambient Gold Glow -->
    <radialGradient id="ambientGlow" cx="50%" cy="28%" r="48%">
      <stop offset="0%" stop-color="#d4af37" stop-opacity="0.25" />
      <stop offset="45%" stop-color="#800f23" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Deep Obsidian-Burgundy Backdrop -->
  <rect width="1200" height="630" fill="url(#mainBg)" />
  <rect width="1200" height="630" fill="url(#ambientGlow)" />

  <!-- Outer Filigree Gold Borders -->
  <rect x="26" y="26" width="1148" height="578" fill="none" stroke="url(#goldText)" stroke-width="2.5" rx="12" />
  <rect x="36" y="36" width="1128" height="558" fill="none" stroke="url(#goldText)" stroke-width="1" opacity="0.4" rx="8" />

  <!-- Classical Ornate Corner Accents -->
  <g stroke="url(#goldText)" stroke-width="2" fill="none">
    <path d="M 40 80 L 40 40 L 80 40" />
    <circle cx="48" cy="48" r="3.5" fill="#F2D16B" />
    <path d="M 1160 80 L 1160 40 L 1120 40" />
    <circle cx="1152" cy="48" r="3.5" fill="#F2D16B" />
    <path d="M 40 550 L 40 590 L 80 590" />
    <circle cx="48" cy="582" r="3.5" fill="#F2D16B" />
    <path d="M 1160 550 L 1160 590 L 1120 590" />
    <circle cx="1152" cy="582" r="3.5" fill="#F2D16B" />
  </g>

  <!-- Official Royal Crest / Monogram (Centered) -->
  <g transform="translate(515, 46)" filter="url(#softGlow)">
    <image href="data:image/png;base64,${logoBase64}" width="170" height="170" />
  </g>

  <!-- Main Brand Title: DS ENVITE -->
  <text x="600" y="262" text-anchor="middle" font-family="Georgia, 'Cinzel', serif" font-size="64" font-weight="bold" fill="url(#goldText)" letter-spacing="9" filter="url(#softGlow)">
    DS  ENVITE
  </text>

  <!-- Tagline / Subtitle -->
  <text x="600" y="306" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="22" fill="#F6E7CA" opacity="0.95">
    Luxury Digital Wedding Invitations &amp; Bespoke Event Websites
  </text>

  <!-- Elegant Gold Divider Ribbon -->
  <g transform="translate(600, 338)">
    <line x1="-180" y1="0" x2="-25" y2="0" stroke="url(#goldText)" stroke-width="1.5" opacity="0.65" />
    <polygon points="0,-7 7,0 0,7 -7,0" fill="url(#goldText)" />
    <circle cx="-14" cy="0" r="2.5" fill="url(#goldText)" />
    <circle cx="14" cy="0" r="2.5" fill="url(#goldText)" />
    <line x1="25" y1="0" x2="180" y2="0" stroke="url(#goldText)" stroke-width="1.5" opacity="0.65" />
  </g>

  <!-- 4 Feature Pillars -->
  <!-- Pillar 1: Interactive Reveal -->
  <g transform="translate(130, 372)">
    <rect width="210" height="96" rx="14" fill="#1c070e" stroke="url(#cardBorder)" stroke-width="1.4" />
    <text x="105" y="33" text-anchor="middle" font-size="24">💌</text>
    <text x="105" y="58" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12.5" font-weight="700" fill="#FFF2CB">Interactive Reveal</text>
    <text x="105" y="78" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="10.5" fill="#B29E7D">3D Envelope &amp; Wax Seal</text>
  </g>

  <!-- Pillar 2: Dual Music & Audio -->
  <g transform="translate(370, 372)">
    <rect width="210" height="96" rx="14" fill="#1c070e" stroke="url(#cardBorder)" stroke-width="1.4" />
    <text x="105" y="33" text-anchor="middle" font-size="24">🎵</text>
    <text x="105" y="58" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12.5" font-weight="700" fill="#FFF2CB">Dual Song Audio</text>
    <text x="105" y="78" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="10.5" fill="#B29E7D">Intro Blessing &amp; Theme Song</text>
  </g>

  <!-- Pillar 3: Realtime RSVP -->
  <g transform="translate(610, 372)">
    <rect width="210" height="96" rx="14" fill="#1c070e" stroke="url(#cardBorder)" stroke-width="1.4" />
    <text x="105" y="33" text-anchor="middle" font-size="24">⚡</text>
    <text x="105" y="58" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12.5" font-weight="700" fill="#FFF2CB">Instant RSVP &amp; Wishes</text>
    <text x="105" y="78" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="10.5" fill="#B29E7D">Live Guest Tracking</text>
  </g>

  <!-- Pillar 4: Tailored Monograms -->
  <g transform="translate(850, 372)">
    <rect width="210" height="96" rx="14" fill="#1c070e" stroke="url(#cardBorder)" stroke-width="1.4" />
    <text x="105" y="33" text-anchor="middle" font-size="24">👑</text>
    <text x="105" y="58" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12.5" font-weight="700" fill="#FFF2CB">Unique Monograms</text>
    <text x="105" y="78" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="10.5" fill="#B29E7D">Tailored Social Preview</text>
  </g>

  <!-- Bottom Brand Value Badge (No technical hosting URLs!) -->
  <g transform="translate(600, 526)">
    <rect x="-190" y="-18" width="380" height="36" rx="18" fill="#320b15" stroke="url(#goldText)" stroke-width="1.4" />
    <text x="0" y="5" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12.5" font-weight="800" fill="#FFF5CE" letter-spacing="3.5">
      PREMIER DIGITAL INVITATION PLATFORM
    </text>
  </g>

  <!-- Bottom Tagline -->
  <text x="600" y="575" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="11.5" fill="#9C856C" letter-spacing="2">
    Create • Personalize • Share Instantly on WhatsApp &amp; Social Media
  </text>
</svg>`;

  const resvg = new Resvg(bannerSvg, { fitTo: { mode: 'width', value: 1200 } });
  const rawBannerPng = resvg.render().asPng();

  await sharp(rawBannerPng)
    .png()
    .toFile(path.join(publicDir, 'website_thumbnail.png'));

  await sharp(rawBannerPng)
    .jpeg({ quality: 86, progressive: true, mozjpeg: true })
    .toFile(path.join(publicDir, 'website_thumbnail.jpg'));

  console.log('✓ website_thumbnail.jpg and website_thumbnail.png updated with luxury brand presentation!');
}

updateBanner().catch(console.error);
