import fs from 'fs';
import path from 'path';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  const isCrawler = [
    'whatsapp', 'facebookexternalhit', 'facebot', 'twitterbot', 'linkedinbot',
    'slackbot', 'telegrambot', 'discordbot', 'pinterestbot', 'applebot',
    'googlebot', 'google-inspectiontool', 'bingbot', 'yahoo', 'ia_archiver',
    'embedly', 'quora link preview', 'outbrain', 'rogerbot', 'showyoubot',
    'vkshare', 'w3c_validator', 'redditbot', 'iframely', 'developers.google.com',
    'skypeuripreview', 'viber'
  ].some(c => ua.includes(c));

  // If a real human browser directly hits /api/home, redirect them to the home page
  if (!isCrawler && req.url && req.url.startsWith('/api/home')) {
    return res.redirect(302, '/');
  }

  // Resolve active host dynamically so previews work on custom domains, preview URLs, and production URLs
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'ds-envite-pbaaott76-vishal-g1.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const siteUrl = `${proto}://${host}`;

  const title = 'DS Envite — Luxury Digital Invitations & Wedding Websites';
  const description = 'Create beautiful, personalized digital wedding invitations with elegant designs, stunning themes, and memorable ways to share your special moments.';
  const imageUrl = `${siteUrl}/website_thumbnail.jpg`;
  const canonicalUrl = `${siteUrl}/`;
  const imageAlt = 'DS Envite — Luxury Digital Wedding Invitations Preview';

  // Read index.html template from dist or root
  let html = '';
  const distPath = path.join(process.cwd(), 'dist', 'index.html');
  const rootPath = path.join(process.cwd(), 'index.html');

  if (fs.existsSync(distPath)) {
    html = fs.readFileSync(distPath, 'utf8');
  } else if (fs.existsSync(rootPath)) {
    html = fs.readFileSync(rootPath, 'utf8');
  }

  const metaTags = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="DS Envite" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />
  `;

  if (html && html.includes('<head>')) {
    html = html.replace(/<title>.*?<\/title>/gi, '');
    html = html.replace(/<meta\s+name=["']description["'][^>]*>/gi, '');
    html = html.replace(/<meta\s+name=["']keywords["'][^>]*>/gi, '');
    html = html.replace(/<meta\s+property=["']og:.*?\/>/gi, '');
    html = html.replace(/<meta\s+property=["']og:.*?>/gi, '');
    html = html.replace(/<meta\s+name=["']twitter:.*?\/>/gi, '');
    html = html.replace(/<meta\s+name=["']twitter:.*?>/gi, '');
    html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '');
    html = html.replace('<head>', `<head>${metaTags}`);
  } else {
    html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${metaTags}
</head>
<body style="background:#0a0205;color:#fde047;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;text-align:center;padding:20px;">
  <h1 style="color:#d4af37;margin-bottom:8px;font-size:1.8rem;">${escapeHtml(title)}</h1>
  <p style="color:#e2e8f0;max-width:550px;margin-bottom:24px;font-size:1rem;line-height:1.6;">${escapeHtml(description)}</p>
  <a href="${escapeHtml(canonicalUrl)}" style="background:#d4af37;color:#0f172a;padding:12px 28px;border-radius:8px;font-weight:bold;text-decoration:none;">Explore Invitations</a>
</body>
</html>`;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.setHeader('X-Robots-Tag', 'all, index, follow');
  res.setHeader('Vary', 'User-Agent');
  return res.status(200).send(html);
}
