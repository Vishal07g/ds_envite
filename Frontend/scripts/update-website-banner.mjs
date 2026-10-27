import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';

const publicDir = path.resolve('public');
const logoPath = path.join(publicDir, 'favicon.png');

async function updateBanner() {
  console.log('Regenerating website_thumbnail.jpg with the new official logo...');

  const logoBuffer = await sharp(logoPath)
    .resize(160, 160)
    .png()
    .toBuffer();

  const logoBase64 = logoBuffer.toString('base64');

  const bannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <!-- Background Radial Gradient -->
    <radialGradient id="mainBg" cx="50%" cy="40%" r="85%">
      <stop offset="0%" stop-color="#1f0910" />
      <stop offset="35%" stop-color="#120408" />
      <stop offset="70%" stop-color="#080204" />
      <stop offset="100%" stop-color="#030002" />
    </radialGradient>

    <!-- Metallic Gold Gradient -->
    <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFF0BE" />
      <stop offset="25%" stop-color="#E5C158" />
      <stop offset="50%" stop-color="#C59B27" />
      <stop offset="75%" stop-color="#F5DB88" />
      <stop offset="100%" stop-color="#A57A16" />
    </linearGradient>

    <linearGradient id="cardBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E5C158" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#805c10" stop-opacity="0.2" />
    </linearGradient>

    <radialGradient id="ambientGlow" cx="50%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#d4af37" stop-opacity="0.22" />
      <stop offset="50%" stop-color="#800f23" stop-opacity="0.10" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Deep Obsidian-Burgundy Backdrop -->
  <rect width="1200" height="630" fill="url(#mainBg)" />
  <rect width="1200" height="630" fill="url(#ambientGlow)" />

  <!-- Elegant Outer Gold Filigree Borders -->
  <rect x="28" y="28" width="1144" height="574" fill="none" stroke="url(#goldText)" stroke-width="2.5" rx="10" />
  <rect x="38" y="38" width="1124" height="554" fill="none" stroke="url(#goldText)" stroke-width="1" opacity="0.35" rx="6" />

  <!-- Ornate Corner Accents -->
  <g stroke="url(#goldText)" stroke-width="2" fill="none">
    <path d="M 40 75 L 40 40 L 75 40" />
    <circle cx="48" cy="48" r="3" fill="#E5C158" />
    <path d="M 1160 75 L 1160 40 L 1125 40" />
    <circle cx="1152" cy="48" r="3" fill="#E5C158" />
    <path d="M 40 555 L 40 590 L 75 590" />
    <circle cx="48" cy="582" r="3" fill="#E5C158" />
    <path d="M 1160 555 L 1160 590 L 1125 590" />
    <circle cx="1152" cy="582" r="3" fill="#E5C158" />
  </g>

  <!-- Official Brand Favicon / Logo (Embedded Centered) -->
  <g transform="translate(520, 50)" filter="url(#softGlow)">
    <image href="data:image/png;base64,${logoBase64}" width="160" height="160" />
  </g>

  <!-- Big Brand Heading: DS ENVITE -->
  <text x="600" y="260" text-anchor="middle" font-family="Georgia, 'Cinzel', serif" font-size="64" font-weight="bold" fill="url(#goldText)" letter-spacing="8" filter="url(#softGlow)">
    DS  ENVITE
  </text>

  <!-- Tagline / Subtitle -->
  <text x="600" y="306" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="22" fill="#F5E4C3" opacity="0.94">
    The Premier Platform for Bespoke Digital Wedding &amp; Event Invitations
  </text>

  <!-- Divider Ribbon -->
  <g transform="translate(600, 340)">
    <line x1="-160" y1="0" x2="-25" y2="0" stroke="url(#goldText)" stroke-width="1.5" opacity="0.6" />
    <polygon points="0,-6 6,0 0,6 -6,0" fill="url(#goldText)" />
    <circle cx="-14" cy="0" r="2" fill="url(#goldText)" />
    <circle cx="14" cy="0" r="2" fill="url(#goldText)" />
    <line x1="25" y1="0" x2="160" y2="0" stroke="url(#goldText)" stroke-width="1.5" opacity="0.6" />
  </g>

  <!-- 4 Premium Feature Pillars -->
  <g transform="translate(130, 375)">
    <rect width="210" height="92" rx="12" fill="#1b080d" stroke="url(#cardBorder)" stroke-width="1.2" />
    <text x="105" y="32" text-anchor="middle" font-size="22">💌</text>
    <text x="105" y="56" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12" font-weight="700" fill="#FDF3CE">Interactive Reveal</text>
    <text x="105" y="74" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="10" fill="#A89474">Wax Seal &amp; 3D Envelope</text>
  </g>

  <g transform="translate(370, 375)">
    <rect width="210" height="92" rx="12" fill="#1b080d" stroke="url(#cardBorder)" stroke-width="1.2" />
    <text x="105" y="32" text-anchor="middle" font-size="22">🎵</text>
    <text x="105" y="56" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12" font-weight="700" fill="#FDF3CE">Dual Song Audio</text>
    <text x="105" y="74" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="10" fill="#A89474">Intro Blessing &amp; Theme Song</text>
  </g>

  <g transform="translate(610, 375)">
    <rect width="210" height="92" rx="12" fill="#1b080d" stroke="url(#cardBorder)" stroke-width="1.2" />
    <text x="105" y="32" text-anchor="middle" font-size="22">⚡</text>
    <text x="105" y="56" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12" font-weight="700" fill="#FDF3CE">Instant RSVP &amp; Wishes</text>
    <text x="105" y="74" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="10" fill="#A89474">Guest Tracking &amp; Headcount</text>
  </g>

  <g transform="translate(850, 375)">
    <rect width="210" height="92" rx="12" fill="#1b080d" stroke="url(#cardBorder)" stroke-width="1.2" />
    <text x="105" y="32" text-anchor="middle" font-size="22">👑</text>
    <text x="105" y="56" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12" font-weight="700" fill="#FDF3CE">Unique Monograms</text>
    <text x="105" y="74" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="10" fill="#A89474">Tailored to Each Invite</text>
  </g>

  <!-- Bottom Brand Footnote / URL -->
  <g transform="translate(600, 528)">
    <rect x="-170" y="-18" width="340" height="34" rx="17" fill="#2d0b13" stroke="url(#goldText)" stroke-width="1.2" />
    <text x="0" y="4" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12" font-weight="700" fill="#FFF2C6" letter-spacing="3">
      ds-envite.vercel.app
    </text>
  </g>

  <text x="600" y="575" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="11" fill="#8E7860" letter-spacing="1.5">
    Luxury Digital Invitations • Zero App Download • Instant Social Sharing
  </text>
</svg>`;

  const resvg = new Resvg(bannerSvg, { fitTo: { mode: 'width', value: 1200 } });
  const rawBannerPng = resvg.render().asPng();

  await sharp(rawBannerPng)
    .png()
    .toFile(path.join(publicDir, 'website_thumbnail.png'));

  await sharp(rawBannerPng)
    .jpeg({ quality: 84, progressive: true, mozjpeg: true })
    .toFile(path.join(publicDir, 'website_thumbnail.jpg'));

  console.log('✓ website_thumbnail.jpg and website_thumbnail.png updated with official brand icon!');
}

updateBanner().catch(console.error);
