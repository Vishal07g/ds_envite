import fs from 'fs';
import path from 'path';

const FIREBASE_DB_URL = 'https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data/invitations.json';

export default async function handler(req, res) {
  const { slug } = req.query;

  let bride = 'Suman';
  let groom = 'Vishal';
  let weddingDate = '2026-11-24T19:00';
  let weddingVenue = 'Snehalata Marriage Hall, Neamatpur, WB';

  try {
    const fbRes = await fetch(FIREBASE_DB_URL);
    if (fbRes.ok) {
      const data = await fbRes.json();
      const invs = Array.isArray(data) ? data : Object.values(data || {});
      const match = invs.find(i => 
        i.slug === slug || 
        i.customSlug === slug || 
        i.id === slug || 
        String(slug).includes(String(i.id || '').replace(/^invite-/, ''))
      );
      if (match && match.config) {
        bride = match.config.coverBrideText || match.config.brideName || bride;
        groom = match.config.coverGroomText || match.config.groomName || groom;
        weddingDate = match.config.weddingDate || weddingDate;
        weddingVenue = match.config.weddingVenue || weddingVenue;
      }
    }
  } catch (e) {
    console.warn('Could not fetch invitation from Firebase in /api/invite:', e);
  }

  let formattedDate = 'November 24, 2026';
  try {
    const d = new Date(weddingDate);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  } catch {}

  const initials = `${bride.charAt(0)} & ${groom.charAt(0)}`;
  const title = `${bride} & ${groom} | Wedding Invitation — DS Envite`;
  const ogTitle = `${bride} & ${groom} — Wedding Invitation`;
  const ogDesc = `We cordially invite you to celebrate the sacred wedding union of ${bride} & ${groom} on ${formattedDate} at ${weddingVenue}. Tap to open the interactive invitation, music, and RSVP.`;
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'ds-envite.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const ogImageUrl = `${proto}://${host}/api/og-image?bride=${encodeURIComponent(bride)}&groom=${encodeURIComponent(groom)}&date=${encodeURIComponent(weddingDate)}`;
  const shareUrl = `${proto}://${host}/invite/${slug || 'suman-vishal'}`;

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
    <title>${title}</title>
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
    html = html.replace(/<meta property="og:.*?\/>/gi, '');
    html = html.replace(/<meta name="twitter:.*?\/>/gi, '');
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
