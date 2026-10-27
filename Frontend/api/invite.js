import fs from 'fs';
import path from 'path';

const FIREBASE_DB_URL = 'https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data/invitations.json';

function capitalizeWord(word = '') {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function parseNamesFromSlug(slug = '') {
  if (!slug) return { bride: '', groom: '', title: '' };
  // Remove prefix "invite-" and trailing numeric IDs (e.g. -1792995422776)
  const cleaned = String(slug).replace(/^invite-/, '').replace(/-\d{6,}$/, '').trim();
  const parts = cleaned.split(/[-_]+/).filter(Boolean);
  if (parts.length >= 2) {
    const bride = capitalizeWord(parts[0]);
    const groom = capitalizeWord(parts[1]);
    return {
      bride,
      groom,
      title: `${bride} & ${groom} — Wedding Invitation`
    };
  } else if (parts.length === 1 && parts[0].toLowerCase() !== 'wedding') {
    const single = capitalizeWord(parts[0]);
    return {
      bride: single,
      groom: '',
      title: `${single} — Digital Invitation`
    };
  }
  return { bride: '', groom: '', title: 'Special Invitation' };
}

export default async function handler(req, res) {
  const { slug } = req.query;
  const rawSlug = String(slug || '').trim();

  let bride = '';
  let groom = '';
  let eventTitle = '';
  let weddingDate = '';
  let weddingVenue = '';
  let heroImage = '';
  let introQuote = '';
  let primaryColor = '#4a121d';
  let accentGold = '#D4AF37';

  try {
    const fbRes = await fetch(FIREBASE_DB_URL);
    if (fbRes.ok) {
      const data = await fbRes.json();
      const invs = Array.isArray(data) ? data : Object.values(data || {});
      const targetSlug = rawSlug.toLowerCase();
      const numMatch = targetSlug.match(/(\d{6,})/);

      const match = invs.find(i => {
        if (!i) return false;
        const iId = String(i.id || '').toLowerCase();
        const iSlug = String(i.slug || '').toLowerCase();
        const iCustom = String(i.customSlug || '').toLowerCase();
        const rawId = iId.replace(/^invite-/, '');

        if (iSlug === targetSlug || iCustom === targetSlug || iId === targetSlug) {
          return true;
        }
        if (rawId && targetSlug.includes(rawId)) {
          return true;
        }
        if (numMatch && (iId.includes(numMatch[1]) || iSlug.includes(numMatch[1]) || iCustom.includes(numMatch[1]))) {
          return true;
        }
        return false;
      });

      if (match && match.config) {
        bride = (match.config.coverBrideText || match.config.brideName || '').trim();
        groom = (match.config.coverGroomText || match.config.groomName || '').trim();
        eventTitle = (match.title || '').trim();
        weddingDate = (match.config.weddingDate || '').trim();
        weddingVenue = (match.config.weddingVenue || match.config.weddingAddress || '').trim();
        heroImage = (match.config.heroImage || match.config.coverImage || '').trim();
        introQuote = (match.config.coverIntroText || match.config.introQuote || match.config.storyParagraph || '').trim();
        primaryColor = match.config.envelopeBgColor || match.config.primaryColor || primaryColor;
        accentGold = match.config.accentGold || accentGold;
      }
    }
  } catch (e) {
    console.warn('Could not fetch invitation from Firebase in /api/invite:', e);
  }

  // If not matched in database, extract couple/event details from slug (NEVER default to Suman & Vishal!)
  if (!bride && !groom && !eventTitle && rawSlug) {
    const fallback = parseNamesFromSlug(rawSlug);
    bride = fallback.bride;
    groom = fallback.groom;
    eventTitle = fallback.title;
  }

  // Format date if valid
  let formattedDate = '';
  if (weddingDate) {
    try {
      const d = new Date(weddingDate);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    } catch {}
  }

  // Construct unique Titles & Descriptions strictly matching this invitation
  let pageTitle = '';
  let ogTitle = '';
  let ogDesc = '';

  if (bride && groom) {
    pageTitle = `${bride} & ${groom} — Wedding Invitation | DS Envite`;
    ogTitle = `${bride} & ${groom} — Wedding Invitation`;
    const venueSnippet = weddingVenue ? ` at ${weddingVenue}` : '';
    const dateSnippet = formattedDate ? ` on ${formattedDate}` : '';
    const quoteSnippet = introQuote ? ` "${introQuote.length > 70 ? introQuote.slice(0, 67) + '...' : introQuote}"` : '';
    ogDesc = `We cordially invite you to celebrate the wedding union of ${bride} & ${groom}${dateSnippet}${venueSnippet}.${quoteSnippet} Tap to open interactive invitation, music & RSVP.`;
  } else if (eventTitle) {
    pageTitle = `${eventTitle} | DS Envite`;
    ogTitle = eventTitle;
    const venueSnippet = weddingVenue ? ` at ${weddingVenue}` : '';
    const dateSnippet = formattedDate ? ` on ${formattedDate}` : '';
    ogDesc = `You are cordially invited to ${eventTitle}${dateSnippet}${venueSnippet}. Tap to view the interactive invitation, music, and RSVP on DS Envite.`;
  } else {
    pageTitle = `Digital Invitation | DS Envite`;
    ogTitle = `Luxury Digital Invitation — DS Envite`;
    ogDesc = `You have received a private interactive digital invitation card. Tap to open the invitation, music, countdown, and event details.`;
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host || 'ds-envite.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';

  const ogParams = new URLSearchParams();
  if (bride) ogParams.set('bride', bride);
  if (groom) ogParams.set('groom', groom);
  if (eventTitle) ogParams.set('title', eventTitle);
  if (weddingDate) ogParams.set('date', weddingDate);
  if (weddingVenue) ogParams.set('venue', weddingVenue);
  if (primaryColor) ogParams.set('bg', primaryColor);
  if (accentGold) ogParams.set('accent', accentGold);
  if (heroImage) ogParams.set('hero', heroImage);

  const ogImageUrl = `${proto}://${host}/api/og-image?${ogParams.toString()}`;
  const shareUrl = `${proto}://${host}/invite/${rawSlug || 'wedding'}`;

  // Read index.html template from dist or root, or fetch from host
  let html = '';
  const distPath = path.join(process.cwd(), 'dist', 'index.html');
  const rootPath = path.join(process.cwd(), 'index.html');
  
  if (fs.existsSync(distPath)) {
    html = fs.readFileSync(distPath, 'utf8');
  } else if (fs.existsSync(rootPath)) {
    html = fs.readFileSync(rootPath, 'utf8');
  } else {
    try {
      const resp = await fetch(`${proto}://${host}/index.html`);
      if (resp.ok) {
        html = await resp.text();
      }
    } catch {}
  }

  const metaTags = `
    <title>${pageTitle}</title>
    <meta name="description" content="${ogDesc}" />
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDesc}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:secure_url" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${shareUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDesc}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
  `;

  if (html && html.includes('<head>')) {
    html = html.replace(/<title>.*?<\/title>/gi, '');
    html = html.replace(/<meta\s+name=["']description["'][^>]*>/gi, '');
    html = html.replace(/<meta\s+property=["']og:.*?\/>/gi, '');
    html = html.replace(/<meta\s+name=["']twitter:.*?\/>/gi, '');
    html = html.replace('<head>', `<head>${metaTags}`);
  } else {
    html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${metaTags}
  <meta http-equiv="refresh" content="0;url=${shareUrl}" />
  <script>window.location.replace(${JSON.stringify(shareUrl)});</script>
</head>
<body style="background:#070b19;color:#fde047;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;">
  <p>Loading Wedding Invitation... <a href="${shareUrl}" style="color:#fde047;">Click here if not redirected</a></p>
</body>
</html>`;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return res.status(200).send(html);
}
