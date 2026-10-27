import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const publicDir = path.resolve('public');

// 1. Create DS Envite Vector Favicon SVG
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="sealBg" cx="45%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#4a0f1d" />
      <stop offset="45%" stop-color="#2a0812" />
      <stop offset="85%" stop-color="#140206" />
      <stop offset="100%" stop-color="#0a0103" />
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF2C6" />
      <stop offset="25%" stop-color="#E5C158" />
      <stop offset="50%" stop-color="#C59B27" />
      <stop offset="75%" stop-color="#F3DA85" />
      <stop offset="100%" stop-color="#AA7F18" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Wax Seal / Luxury Crest Outer Disc -->
  <circle cx="256" cy="256" r="248" fill="url(#sealBg)" />
  <circle cx="256" cy="256" r="236" fill="none" stroke="url(#gold)" stroke-width="6" opacity="0.9" />
  <circle cx="256" cy="256" r="222" fill="none" stroke="url(#gold)" stroke-width="2.5" stroke-dasharray="8 8" opacity="0.6" />

  <!-- Crown Ornament -->
  <g transform="translate(256, 125)" filter="url(#glow)">
    <path d="M -26 12 L -34 -14 L -15 -4 L 0 -22 L 15 -4 L 34 -14 L 26 12 Z" fill="url(#gold)" />
    <circle cx="-34" cy="-17" r="3.5" fill="#FFF9E6" />
    <circle cx="0" cy="-25" r="4.5" fill="#FFF9E6" />
    <circle cx="34" cy="-17" r="3.5" fill="#FFF9E6" />
  </g>

  <!-- "DS" Luxury Intertwined Monogram -->
  <g id="letters" filter="url(#glow)">
    <!-- Letter D -->
    <text x="188" y="325" 
          font-family="Georgia, 'Cinzel', serif" 
          font-size="160" 
          font-weight="bold" 
          fill="url(#gold)" 
          text-anchor="middle"
          letter-spacing="-2">D</text>

    <!-- Letter S -->
    <text x="320" y="325" 
          font-family="Georgia, 'Cinzel', serif" 
          font-size="160" 
          font-weight="bold" 
          fill="url(#gold)" 
          text-anchor="middle"
          letter-spacing="-2">S</text>
  </g>

  <!-- Sparkle Accent in center -->
  <path d="M 256 220 Q 256 240 240 240 Q 256 240 256 260 Q 256 240 272 240 Q 256 240 256 220 Z" 
        fill="#FFF9E6" opacity="0.95" />

  <!-- Subtitle Tagline around curve / bottom banner -->
  <text x="256" y="415" 
        font-family="'Montserrat', sans-serif" 
        font-size="24" 
        font-weight="700" 
        fill="url(#gold)" 
        text-anchor="middle" 
        letter-spacing="9">ENVITE</text>

  <!-- Little filigree flourish below ENVITE -->
  <circle cx="200" cy="442" r="2.5" fill="url(#gold)" />
  <line x1="210" y1="442" x2="242" y2="442" stroke="url(#gold)" stroke-width="1.5" />
  <polygon points="256,438 260,442 256,446 252,442" fill="url(#gold)" />
  <line x1="270" y1="442" x2="302" y2="442" stroke="url(#gold)" stroke-width="1.5" />
  <circle cx="312" cy="442" r="2.5" fill="url(#gold)" />
</svg>`;

// 2. Create DS Envite Official Website Showcase Banner (1200x630)
const bannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <!-- Background Radial Gradient -->
    <radialGradient id="mainBg" cx="50%" cy="40%" r="80%">
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

    <radialGradient id="ambientGlow" cx="50%" cy="35%" r="45%">
      <stop offset="0%" stop-color="#d4af37" stop-opacity="0.18" />
      <stop offset="60%" stop-color="#800f23" stop-opacity="0.08" />
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

  <!-- Crown Icon & Top Label -->
  <g transform="translate(600, 110)" filter="url(#softGlow)">
    <path d="M -22 10 L -28 -12 L -12 -3 L 0 -18 L 12 -3 L 28 -12 L 22 10 Z" fill="url(#goldText)" />
    <circle cx="-28" cy="-14" r="2.5" fill="#FFF9E6" />
    <circle cx="0" cy="-21" r="3.5" fill="#FFF9E6" />
    <circle cx="28" cy="-14" r="2.5" fill="#FFF9E6" />
  </g>

  <text x="600" y="160" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="13" font-weight="700" fill="#E5C158" letter-spacing="8" opacity="0.9">
    LUXURY DIGITAL INVITATION PLATFORM
  </text>

  <!-- Big Brand Heading: DS ENVITE -->
  <text x="600" y="240" text-anchor="middle" font-family="Georgia, 'Cinzel', serif" font-size="76" font-weight="bold" fill="url(#goldText)" letter-spacing="6" filter="url(#softGlow)">
    DS  ENVITE
  </text>

  <!-- Tagline / Subtitle -->
  <text x="600" y="295" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="23" fill="#F5E4C3" opacity="0.92">
    Create, Personalize &amp; Share Bespoke Interactive Wedding &amp; Event Invitations
  </text>

  <!-- Divider Ribbon -->
  <g transform="translate(600, 335)">
    <line x1="-160" y1="0" x2="-25" y2="0" stroke="url(#goldText)" stroke-width="1.5" opacity="0.6" />
    <polygon points="0,-6 6,0 0,6 -6,0" fill="url(#goldText)" />
    <circle cx="-14" cy="0" r="2" fill="url(#goldText)" />
    <circle cx="14" cy="0" r="2" fill="url(#goldText)" />
    <line x1="25" y1="0" x2="160" y2="0" stroke="url(#goldText)" stroke-width="1.5" opacity="0.6" />
  </g>

  <!-- 4 Premium Feature Pillars -->
  <!-- Pillar 1: Wax-Seal Envelope -->
  <g transform="translate(130, 375)">
    <rect width="210" height="92" rx="12" fill="#1b080d" stroke="url(#cardBorder)" stroke-width="1.2" />
    <text x="105" y="32" text-anchor="middle" font-size="22">💌</text>
    <text x="105" y="56" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12" font-weight="700" fill="#FDF3CE">Interactive Reveal</text>
    <text x="105" y="74" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="10" fill="#A89474">Wax Seal &amp; 3D Envelope</text>
  </g>

  <!-- Pillar 2: Dual Music & Audio -->
  <g transform="translate(370, 375)">
    <rect width="210" height="92" rx="12" fill="#1b080d" stroke="url(#cardBorder)" stroke-width="1.2" />
    <text x="105" y="32" text-anchor="middle" font-size="22">🎵</text>
    <text x="105" y="56" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12" font-weight="700" fill="#FDF3CE">Dual Song Audio</text>
    <text x="105" y="74" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="10" fill="#A89474">Intro Blessing &amp; Theme Song</text>
  </g>

  <!-- Pillar 3: Realtime RSVP -->
  <g transform="translate(610, 375)">
    <rect width="210" height="92" rx="12" fill="#1b080d" stroke="url(#cardBorder)" stroke-width="1.2" />
    <text x="105" y="32" text-anchor="middle" font-size="22">⚡</text>
    <text x="105" y="56" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12" font-weight="700" fill="#FDF3CE">Instant RSVP &amp; Wishes</text>
    <text x="105" y="74" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="10" fill="#A89474">Guest Tracking &amp; Headcount</text>
  </g>

  <!-- Pillar 4: Unique Social Monograms -->
  <g transform="translate(850, 375)">
    <rect width="210" height="92" rx="12" fill="#1b080d" stroke="url(#cardBorder)" stroke-width="1.2" />
    <text x="105" y="32" text-anchor="middle" font-size="22">👑</text>
    <text x="105" y="56" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12" font-weight="700" fill="#FDF3CE">Custom Thumbnails</text>
    <text x="105" y="74" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="10" fill="#A89474">Unique Monogram per Invite</text>
  </g>

  <!-- Bottom Brand Footnote / URL -->
  <g transform="translate(600, 528)">
    <rect x="-170" y="-18" width="340" height="34" rx="17" fill="#2d0b13" stroke="url(#goldText)" stroke-width="1.2" />
    <text x="0" y="4" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="12" font-weight="700" fill="#FFF2C6" letter-spacing="3">
      ds-envite.vercel.app
    </text>
  </g>

  <text x="600" y="575" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="11" fill="#8E7860" letter-spacing="1.5">
    The Premier Platform for Digital Wedding Invitations • Zero App Download • Instant Sharing
  </text>
</svg>`;

async function run() {
  console.log('Generating brand favicon & website banner assets...');

  // 1. Write favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg, 'utf8');
  console.log('✓ favicon.svg saved');

  // 2. Render Favicon PNGs from SVG using Resvg & Sharp
  const faviconResvg = new Resvg(faviconSvg, { fitTo: { mode: 'width', value: 512 } });
  const rawFaviconPng = faviconResvg.render().asPng();

  // 32x32 PNG
  await sharp(rawFaviconPng)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('✓ favicon-32x32.png generated');

  // 192x192 PNG
  await sharp(rawFaviconPng)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✓ favicon.png (192x192) generated');

  // 180x180 Apple Touch Icon
  await sharp(rawFaviconPng)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png (180x180) generated');

  // Replace old 1MB favicon.jpg with crisp 128x128 JPEG logo
  await sharp(rawFaviconPng)
    .resize(128, 128)
    .jpeg({ quality: 90 })
    .toFile(path.join(publicDir, 'favicon.jpg'));
  console.log('✓ favicon.jpg replaced with crisp DS Envite brand logo');

  // 3. Render Website Banner (1200x630)
  const bannerResvg = new Resvg(bannerSvg, { fitTo: { mode: 'width', value: 1200 } });
  const rawBannerPng = bannerResvg.render().asPng();

  await sharp(rawBannerPng)
    .png()
    .toFile(path.join(publicDir, 'website_thumbnail.png'));
  console.log('✓ website_thumbnail.png generated');

  // Compress progressive JPEG for optimal WhatsApp/Facebook crawler loading (<45KB)
  await sharp(rawBannerPng)
    .jpeg({ quality: 84, progressive: true, mozjpeg: true })
    .toFile(path.join(publicDir, 'website_thumbnail.jpg'));
  console.log('✓ website_thumbnail.jpg generated');

  console.log('All brand assets successfully generated!');
}

run().catch(console.error);
