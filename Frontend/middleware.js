/**
 * Vercel Edge Middleware: Social Crawler OG Meta Injector
 * 
 * When WhatsApp, Facebook, Twitter, LinkedIn, iMessage, or any social media
 * crawler visits /invite/suman-vishal-12345, this middleware intercepts the
 * request and returns a minimal HTML page with the correct:
 *   - og:title  → "Suman & Vishal — Wedding Invitation"
 *   - og:image  → /api/og-image?bride=Suman&groom=Vishal (dynamic monogram)
 *   - og:description, twitter:card, etc.
 * 
 * For regular browsers (real users), the request passes through to the SPA.
 * 
 * This ensures that pasting any invitation link on WhatsApp/iMessage/Facebook
 * automatically shows the couple's monogram thumbnail + title — zero effort.
 */

export const config = {
  matcher: '/invite/:path*',
};

// Social crawler User-Agent patterns
const CRAWLER_PATTERNS = [
  'whatsapp',
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'telegrambot',
  'discordbot',
  'pinterestbot',
  'applebot',
  'googlebot',
  'bingbot',
  'yahoo',
  'ia_archiver',
  'embedly',
  'quora link preview',
  'outbrain',
  'rogerbot',
  'showyoubot',
  'vkshare',
  'w3c_validator',
  'redditbot',
  'iframely',
  'developers.google.com/+/web/snippet',
  'preview',    // Generic preview user agents
];

export default function middleware(request) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  
  // Check if this is a social media crawler
  const isCrawler = CRAWLER_PATTERNS.some(pattern => ua.includes(pattern));
  
  if (!isCrawler) {
    // Regular user — pass through to SPA
    return;
  }

  // Extract slug from URL path: /invite/suman-vishal-1792299417819
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  // pathParts = ["invite", "suman-vishal-1792299417819"]
  const slug = pathParts[1] || 'wedding-invitation';

  // Parse bride & groom names from slug
  // Slug format: "bride-groom-timestamp" e.g. "suman-vishal-1792299417819"
  const { bride, groom } = parseNamesFromSlug(slug);

  const origin = url.origin;
  const pageUrl = `${origin}/invite/${slug}`;
  const ogImageUrl = `${origin}/api/og-image?bride=${encodeURIComponent(bride)}&groom=${encodeURIComponent(groom)}`;

  const title = `${bride} & ${groom} — Wedding Invitation`;
  const description = `You are warmly invited to celebrate the wedding of ${bride} & ${groom}. Tap to view the interactive invitation, RSVP, and share blessings.`;

  // Return a minimal HTML page with proper OG meta tags for crawlers
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">

  <!-- Open Graph / Facebook / WhatsApp / LinkedIn -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="DS Envite">
  <meta property="og:url" content="${escapeHtml(pageUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(ogImageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(ogImageUrl)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(bride)} & ${escapeHtml(groom)} Wedding Monogram">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}">

  <!-- Redirect real users who accidentally land here -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(pageUrl)}">
  <link rel="canonical" href="${escapeHtml(pageUrl)}">
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(pageUrl)}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}

/**
 * Parse bride & groom names from a slug like "suman-vishal-1792299417819"
 * or "priya-arjun-wedding-invite-123456"
 */
function parseNamesFromSlug(slug) {
  if (!slug) return { bride: 'Bride', groom: 'Groom' };

  // Remove common prefix if any
  let cleaned = slug.replace(/^invite[-_]/i, '');

  // Split into segments
  const parts = cleaned.split(/[-_]+/).filter(Boolean);

  // Filter out pure numbers or common suffixes like sample*, demo*, invite*
  const filtered = parts.filter(p => !/^\d+$/.test(p) && !/^(sample\d*|demo\d*|invite\d*|wedding)$/i.test(p));

  // If we have 'and' in between (e.g., suman-and-vishal)
  const nameParts = filtered.filter(p => p.toLowerCase() !== 'and');

  if (nameParts.length >= 2) {
    return {
      bride: capitalize(nameParts[0]),
      groom: capitalize(nameParts[1]),
    };
  } else if (nameParts.length === 1) {
    return {
      bride: capitalize(nameParts[0]),
      groom: 'Wedding',
    };
  }

  // Fallback to first parts before filtering
  if (parts.length >= 2) {
    return {
      bride: capitalize(parts[0]),
      groom: capitalize(parts[1]),
    };
  }

  return { bride: 'Bride', groom: 'Groom' };
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
