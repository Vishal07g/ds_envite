import fs from 'fs';
import path from 'path';

const FIREBASE_DB_URL = 'https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data/invitations.json';

function capitalizeWord(word = '') {
  if (!word) return '';
  if (word.length <= 3) return word.toUpperCase();
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function parseNamesFromSlug(slug = '') {
  if (!slug) return { bride: '', groom: '', title: '' };
  // Remove prefix "invite-" and trailing numeric IDs (e.g. -1792995422776)
  const cleaned = String(slug).replace(/^invite-/, '').replace(/-\d{6,}$/, '').trim();
  const rawParts = cleaned.split(/[-_]+/).filter(Boolean);

  // Filter out event keywords and numbers
  const EVENT_WORDS = new Set(['wedding', 'invitation', 'invite', 'weds', 'and', 'reception', 'engagement', 'anniversary', 'birthday', 'party', 'sample', 'demo']);
  const parts = rawParts.filter(p => !/^\d+$/.test(p) && !EVENT_WORDS.has(p.toLowerCase()));
  const isWedding = rawParts.some(p => p.toLowerCase() === 'wedding' || p.toLowerCase() === 'weds');

  if (parts.length >= 2) {
    const bride = capitalizeWord(parts[0]);
    const groom = capitalizeWord(parts[1]);
    return {
      bride,
      groom,
      title: `${bride} & ${groom} — Wedding Invitation`
    };
  } else if (parts.length === 1) {
    const single = capitalizeWord(parts[0]);
    return {
      bride: single,
      groom: '',
      title: isWedding ? `${single} Wedding Invitation` : `${single} — Digital Invitation`
    };
  }
  return { bride: '', groom: '', title: 'Special Invitation' };
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Match an invitation from the database by slug.
 * Uses multiple matching strategies to find the correct invitation.
 */
function findInvitationBySlug(invitations, rawSlug) {
  if (!invitations || !rawSlug) return null;

  const invs = Array.isArray(invitations) ? invitations : Object.values(invitations || {});
  const targetSlug = rawSlug.toLowerCase().trim();
  const numMatch = targetSlug.match(/(\d{6,})/);

  // Strategy 1: Exact match on id, slug, or customSlug
  let match = invs.find(i => {
    if (!i) return false;
    const iId = String(i.id || '').toLowerCase();
    const iSlug = String(i.slug || '').toLowerCase();
    const iCustom = String(i.customSlug || '').toLowerCase();
    return iSlug === targetSlug || iCustom === targetSlug || iId === targetSlug;
  });
  if (match) return match;

  // Strategy 2: Match on stripped invite- prefix
  const strippedTarget = targetSlug.replace(/^invite-/, '');
  match = invs.find(i => {
    if (!i) return false;
    const rawId = String(i.id || '').replace(/^invite-/, '').toLowerCase();
    return rawId && (rawId === strippedTarget || targetSlug.includes(rawId) || strippedTarget.includes(rawId));
  });
  if (match) return match;

  // Strategy 3: Match by embedded numeric ID
  if (numMatch) {
    match = invs.find(i => {
      if (!i) return false;
      const iId = String(i.id || '');
      const iSlug = String(i.slug || '');
      const iCustom = String(i.customSlug || '');
      return iId.includes(numMatch[1]) || iSlug.includes(numMatch[1]) || iCustom.includes(numMatch[1]);
    });
    if (match) return match;
  }

  // Strategy 4: Prefix/suffix match on slug or customSlug
  match = invs.find(i => {
    if (!i) return false;
    const s = String(i.slug || '').toLowerCase();
    const cs = String(i.customSlug || '').toLowerCase();
    return (s && (s.startsWith(targetSlug) || targetSlug.startsWith(s))) ||
           (cs && (cs.startsWith(targetSlug) || targetSlug.startsWith(cs)));
  });
  if (match) return match;

  // Strategy 5: Match by couple names in config
  match = invs.find(i => {
    if (!i || !i.config) return false;
    const bride = (i.config.brideName || i.config.coverBrideText || '').toLowerCase();
    const groom = (i.config.groomName || i.config.coverGroomText || '').toLowerCase();
    if (bride && groom) {
      if (targetSlug.includes(bride) && targetSlug.includes(groom)) return true;
    }
    return false;
  });
  if (match) return match;

  // Strategy 6: Match by heroNames or heroName array
  match = invs.find(i => {
    if (!i) return false;
    if (Array.isArray(i.heroNames) && i.heroNames.length > 0) {
      const allMatched = i.heroNames.every(name => name && targetSlug.includes(String(name).toLowerCase()));
      if (allMatched) return true;
    }
    if (typeof i.heroName === 'string' && i.heroName && targetSlug.includes(i.heroName.toLowerCase())) {
      return true;
    }
    return false;
  });
  if (match) return match;

  return null;
}

export default async function handler(req, res) {
  const { slug } = req.query;
  const rawSlug = String(slug || '').trim();


  // ── Fetch invitation data from Firebase ──────────────────────────────
  let invitation = null;
  let bride = '';
  let groom = '';
  let eventTitle = '';
  let weddingDate = '';
  let weddingVenue = '';
  let heroImage = '';
  let introQuote = '';
  let primaryColor = '#4a121d';
  let accentGold = '#D4AF37';
  // Per-invitation social metadata (from database)
  let socialTitle = '';
  let socialDescription = '';
  let socialThumbnailUrl = '';
  let imageAlt = '';
  let eventType = 'wedding';

  try {
    if (Array.isArray(req.mockInvitations)) {
      invitation = findInvitationBySlug(req.mockInvitations, rawSlug);
    }
    if (!invitation) {
      const fbRes = await fetch(FIREBASE_DB_URL);
      if (fbRes.ok) {
        const data = await fbRes.json();
        invitation = findInvitationBySlug(data, rawSlug);
      }
    }

      if (invitation) {
        const cfg = invitation.config || {};
        bride = (cfg.coverBrideText || cfg.brideName || '').trim();
        groom = (cfg.coverGroomText || cfg.groomName || '').trim();

        // Support heroNames array
        if (Array.isArray(invitation.heroNames) && invitation.heroNames.length > 0) {
          if (!bride) bride = String(invitation.heroNames[0] || '').trim();
          if (!groom && invitation.heroNames.length > 1) groom = String(invitation.heroNames[1] || '').trim();
        } else if (typeof invitation.heroName === 'string' && invitation.heroName.trim()) {
          if (!bride) bride = invitation.heroName.trim();
        }

        eventTitle = (invitation.title || '').trim();
        weddingDate = (cfg.weddingDate || invitation.eventDate || '').trim();
        weddingVenue = (cfg.weddingVenue || cfg.weddingAddress || invitation.venue || '').trim();
        heroImage = (cfg.heroImage || cfg.coverImage || '').trim();
        introQuote = (cfg.coverIntroText || cfg.introQuote || cfg.storyParagraph || '').trim();
        primaryColor = cfg.envelopeBgColor || cfg.primaryColor || primaryColor;
        accentGold = cfg.accentGold || accentGold;
        
        // Use stored per-invitation social metadata if available
        socialTitle = (invitation.socialTitle || invitation.title || '').trim();
        socialDescription = (invitation.socialDescription || invitation.description || '').trim();
        socialThumbnailUrl = (invitation.socialThumbnailUrl || invitation.thumbnailUrl || '').trim();
        imageAlt = (invitation.imageAlt || '').trim();
        eventType = invitation.eventType || eventType;
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

  // ── Format date if valid ─────────────────────────────────────────────
  let formattedDate = '';
  if (weddingDate) {
    try {
      const d = new Date(weddingDate);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    } catch {}
  }

  // ── Construct unique Titles & Descriptions strictly matching this invitation ──
  let pageTitle = '';
  let ogTitle = '';
  let ogDesc = '';

  // Priority 1: Use stored social metadata from the invitation record
  if (socialTitle) {
    ogTitle = socialTitle;
    pageTitle = `${socialTitle} | DS Envite`;
  }
  if (socialDescription) {
    ogDesc = socialDescription;
  }

  // Priority 2: Generate from invitation data if no stored social metadata
  if (!ogTitle) {
    if (bride && groom) {
      pageTitle = `${bride} & ${groom} — Wedding Invitation | DS Envite`;
      ogTitle = `${bride} & ${groom} — Wedding Invitation`;
    } else if (bride) {
      const heading = eventTitle || `${bride} Wedding Invitation`;
      pageTitle = `${heading} | DS Envite`;
      ogTitle = heading;
    } else if (eventTitle) {
      pageTitle = `${eventTitle} | DS Envite`;
      ogTitle = eventTitle;
    } else {
      pageTitle = `Digital Invitation | DS Envite`;
      ogTitle = `Luxury Digital Invitation — DS Envite`;
    }
  }

  if (!ogDesc) {
    if (bride && groom) {
      const venueSnippet = weddingVenue ? ` at ${weddingVenue}` : '';
      const dateSnippet = formattedDate ? ` on ${formattedDate}` : '';
      const quoteSnippet = introQuote ? ` "${introQuote.length > 70 ? introQuote.slice(0, 67) + '...' : introQuote}"` : '';
      ogDesc = `We cordially invite you to celebrate the wedding union of ${bride} & ${groom}${dateSnippet}${venueSnippet}.${quoteSnippet} Tap to open interactive invitation, music & RSVP.`;
    } else if (bride) {
      const venueSnippet = weddingVenue ? ` at ${weddingVenue}` : '';
      const dateSnippet = formattedDate ? ` on ${formattedDate}` : '';
      ogDesc = `You are cordially invited to celebrate ${eventTitle || 'the wedding celebration'} of ${bride}${dateSnippet}${venueSnippet}. Tap to view the interactive invitation, music, and RSVP on DS Envite.`;
    } else if (eventTitle) {
      const venueSnippet = weddingVenue ? ` at ${weddingVenue}` : '';
      const dateSnippet = formattedDate ? ` on ${formattedDate}` : '';
      ogDesc = `You are cordially invited to ${eventTitle}${dateSnippet}${venueSnippet}. Tap to view the interactive invitation, music, and RSVP on DS Envite.`;
    } else {
      ogDesc = `You have received a private interactive digital invitation card. Tap to open the invitation, music, countdown, and event details.`;
    }
  }

  if (!imageAlt) {
    imageAlt = (bride && groom) 
      ? `${bride} & ${groom} Wedding Invitation Preview`
      : (bride ? `${bride} Wedding Invitation Preview` : 'Digital Invitation Preview');
  }

  // ── Handle Unpublished / Private Invitations ────────────────────────
  const isUnpublished = Boolean(invitation && (invitation.status === 'unpublished' || invitation.status === 'archived'));
  if (isUnpublished) {
    pageTitle = 'Private Digital Invitation | DS Envite';
    ogTitle = 'Private Digital Invitation — DS Envite';
    ogDesc = 'This digital invitation is currently private or unpublished.';
    imageAlt = 'Private Invitation Notice';
  }

  // ── Build URLs ───────────────────────────────────────────────────────
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'ds-envite.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';

  // Build OG image URL: Use stored social thumbnail if available, otherwise generate dynamically
  let ogImageUrl = '';
  if (isUnpublished) {
    ogImageUrl = `${proto}://${host}/website_thumbnail.jpg`;
  } else if (socialThumbnailUrl && socialThumbnailUrl.startsWith('http')) {
    // Use the invitation's explicitly assigned social thumbnail
    ogImageUrl = socialThumbnailUrl;
  } else {
    // Generate clean .jpg URL referencing the invitation slug
    ogImageUrl = `${proto}://${host}/api/og-image/${encodeURIComponent(rawSlug || 'wedding')}.jpg`;
  }

  const shareUrl = (invitation && invitation.canonicalUrl) 
    ? invitation.canonicalUrl 
    : `${proto}://${host}/invite/${rawSlug || 'wedding'}`;

  // ── Read index.html template from dist or root ───────────────────────
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

  // ── Build per-invitation meta tags (replaces ALL website-default OG tags) ──
  const metaTags = `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="all, index, follow" />
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(ogDesc)}" />
    <link rel="canonical" href="${escapeHtml(shareUrl)}" />
    <meta property="og:title" content="${escapeHtml(ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(ogDesc)}" />
    <meta property="og:image" content="${escapeHtml(ogImageUrl)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(ogImageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(shareUrl)}" />
    <meta property="og:site_name" content="DS Envite" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(ogDesc)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />
  `;

  if (html && html.includes('<head>')) {
    // Strip ALL existing website-default meta tags to prevent duplication
    html = html.replace(/<title>.*?<\/title>/gi, '');
    html = html.replace(/<meta\s+charset=[^>]*>/gi, '');
    html = html.replace(/<meta\s+name=["']robots["'][^>]*>/gi, '');
    html = html.replace(/<meta\s+name=["']viewport["'][^>]*>/gi, '');
    html = html.replace(/<meta\s+name=["']description["'][^>]*>/gi, '');
    html = html.replace(/<meta\s+name=["']keywords["'][^>]*>/gi, '');
    html = html.replace(/<meta\s+property=["']og:.*?\/>/gi, '');
    html = html.replace(/<meta\s+property=["']og:.*?>/gi, '');
    html = html.replace(/<meta\s+name=["']twitter:.*?\/>/gi, '');
    html = html.replace(/<meta\s+name=["']twitter:.*?>/gi, '');
    html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '');
    html = html.replace('<head>', `<head>${metaTags}`);
  } else {
    // Standalone HTML page with meta tags for crawlers (NO circular refresh redirect)
    html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${metaTags}
  <script>
    if (!navigator.userAgent.match(/(bot|crawl|spider|facebook|whatsapp|twitter|slack|telegram)/i)) {
      window.location.replace(${JSON.stringify(shareUrl)});
    }
  </script>
</head>
<body style="background:#070b19;color:#fde047;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;text-align:center;padding:20px;">
  <h1 style="color:#fde047;margin-bottom:8px;font-size:1.5rem;">${escapeHtml(ogTitle)}</h1>
  <p style="color:#e2e8f0;max-width:500px;margin-bottom:24px;font-size:0.95rem;">${escapeHtml(ogDesc)}</p>
  <a href="${escapeHtml(shareUrl)}" style="background:#d4af37;color:#0f172a;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">Open Interactive Invitation</a>
</body>
</html>`;
  }

  // ── Use per-invitation cache key (slug-based) to prevent metadata leakage ──
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.setHeader('Vary', 'User-Agent');
  return res.status(200).send(html);
}
