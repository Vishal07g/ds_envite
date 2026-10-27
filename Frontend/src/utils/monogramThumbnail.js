/**
 * Dynamic Monogram & Social Preview Thumbnail Generator
 * Generates an ultra-luxurious 1200x630 (or square 600x600) wedding monogram thumbnail
 * featuring the Bride & Groom initials, royal gold filigree crest, names, and wedding date.
 */

/**
 * Determine ordered couple names, initials, and slugs based on wedding slug, title, or config.
 * E.g.:
 * - suman-vishal -> initials: "SV", displayName: "Suman & Vishal", slug: "suman-vishal"
 * - vishal-suman -> initials: "VS", displayName: "Vishal & Suman", slug: "vishal-suman"
 */
export function getCoupleDetails({
  bride = "",
  groom = "",
  title = "",
  slug = "",
  customSlug = "",
  config = {}
} = {}) {
  const cleanBride = (bride || config?.coverBrideText || config?.brideName || "").trim();
  const cleanGroom = (groom || config?.coverGroomText || config?.groomName || "").trim();
  const cleanTitle = (title || config?.weddingTitle || "").trim();
  const rawSlug = String(slug || customSlug || "")
    .toLowerCase()
    .replace(/^https?:\/\/[^\/]+\/invite\//, "")
    .replace(/^invite-/, "")
    .replace(/-\d{6,}$/, "")
    .trim();

  let isGroomFirst = false;

  if (cleanBride && cleanGroom) {
    const brideSlug = cleanBride.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const groomSlug = cleanGroom.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // 1. Slug priority: Does the slug start with groom name or bride name?
    if (rawSlug) {
      if (rawSlug.startsWith(groomSlug)) {
        isGroomFirst = true;
      } else if (rawSlug.startsWith(brideSlug)) {
        isGroomFirst = false;
      }
    }

    // 2. Title priority if slug did not determine order
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
    // Neither bride nor groom provided, parse from slug
    const parts = rawSlug.split(/[-_]+/).filter(Boolean);
    const EVENT_WORDS = new Set(['wedding', 'invitation', 'invite', 'weds', 'and', 'reception', 'engagement', 'anniversary', 'birthday', 'party', 'sample', 'demo']);
    const names = parts.filter(p => !/^\d+$/.test(p) && !EVENT_WORDS.has(p.toLowerCase()));
    if (names.length >= 2) {
      const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      const p1 = cap(names[0]);
      const p2 = cap(names[1]);
      return {
        firstPerson: p1,
        secondPerson: p2,
        isGroomFirst: false,
        initials: `${p1.charAt(0)}${p2.charAt(0)}`.toUpperCase(),
        displayName: `${p1} & ${p2}`,
        slug: `${names[0].toLowerCase()}-${names[1].toLowerCase()}`
      };
    } else if (names.length === 1) {
      const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      const p1 = cap(names[0]);
      return {
        firstPerson: p1,
        secondPerson: "",
        isGroomFirst: false,
        initials: p1.slice(0, 2).toUpperCase(),
        displayName: p1,
        slug: names[0].toLowerCase()
      };
    }
  }

  const firstPerson = isGroomFirst ? cleanGroom : cleanBride;
  const secondPerson = isGroomFirst ? cleanBride : cleanGroom;

  let initials = "";
  let displayName = "";

  if (firstPerson && secondPerson) {
    const fInit = (firstPerson.charAt(0) || "B").toUpperCase();
    const sInit = (secondPerson.charAt(0) || "G").toUpperCase();
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
    initials = "DS";
    displayName = "Royal Wedding";
  }

  const toSlug = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const slugPart = (firstPerson && secondPerson)
    ? `${toSlug(firstPerson)}-${toSlug(secondPerson)}`
    : (firstPerson ? toSlug(firstPerson) : "wedding");

  return {
    firstPerson,
    secondPerson,
    isGroomFirst,
    initials,
    displayName,
    slug: slugPart
  };
}

export function getCoupleInitials(first = "Bride", second = "Groom") {
  if (typeof first === "object" && first !== null) {
    return getCoupleDetails(first).initials;
  }
  const f = (String(first || "").trim().charAt(0) || "").toUpperCase();
  const s = (String(second || "").trim().charAt(0) || "").toUpperCase();
  if (f && s) return `${f}${s}`;
  return f || s || "DS";
}

export function generateMonogramCanvas({
  brideName = "",
  groomName = "",
  title = "",
  weddingDate = "",
  primaryColor = "#400d18",
  accentGold = "#d4af37",
  slug = "",
  width = 1200,
  height = 630
}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const couple = getCoupleDetails({ bride: brideName, groom: groomName, title, slug });
  const initials = couple.initials;
  const mainHeading = (couple.displayName || title || "ROYAL INVITATION").toUpperCase();

  // 1. Rich Royal Background Gradient
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width / 1.3);
  bgGrad.addColorStop(0, primaryColor || "#4a121d");
  bgGrad.addColorStop(0.5, "#2f0810");
  bgGrad.addColorStop(1, "#120205");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Luxury Texture / Vignette
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(0, 0, width, height);

  // 3. Dual Ornate Golden Outer Frames
  ctx.strokeStyle = accentGold;
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, width - 64, height - 64);

  ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(44, 44, width - 88, height - 88);

  // Corner Bracket Accents
  const cornerSize = 40;
  const corners = [
    [44, 44, 1, 1],
    [width - 44, 44, -1, 1],
    [44, height - 44, 1, -1],
    [width - 44, height - 44, -1, -1]
  ];
  corners.forEach(([x, y, dx, dy]) => {
    ctx.strokeStyle = accentGold;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + dx * cornerSize, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * cornerSize);
    ctx.stroke();

    // Corner dot
    ctx.fillStyle = accentGold;
    ctx.beginPath();
    ctx.arc(x + dx * 8, y + dy * 8, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // 4. Central Royal Crest Ring
  const centerX = width / 2;
  const centerY = height / 2 - 25;
  const crestRadius = 145;

  ctx.save();
  ctx.shadowColor = "rgba(212, 175, 55, 0.4)";
  ctx.shadowBlur = 24;

  // Outer Crest Ring
  ctx.strokeStyle = accentGold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, crestRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner Dotted Ring
  ctx.strokeStyle = "rgba(255, 230, 160, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.arc(centerX, centerY, crestRadius - 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // 5. Crown / Sacred Ornament above crest
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = accentGold;
  ctx.font = "bold 32px serif";
  ctx.fillText("👑", centerX, centerY - crestRadius + 4);

  // 6. Initials (Big Luxurious Gold Monogram)
  ctx.save();
  ctx.font = "bold 88px 'Cinzel', 'Playfair Display', 'Georgia', serif";
  
  // Gold gradient text fill
  const textGrad = ctx.createLinearGradient(centerX - 150, centerY, centerX + 150, centerY);
  textGrad.addColorStop(0, "#F7D788");
  textGrad.addColorStop(0.35, "#FFF1BE");
  textGrad.addColorStop(0.7, "#D4AF37");
  textGrad.addColorStop(1, "#AA821C");
  ctx.fillStyle = textGrad;
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;
  ctx.fillText(initials, centerX, centerY);
  ctx.restore();

  // Delicate filigree flourish below initials inside ring
  ctx.fillStyle = "rgba(212, 175, 55, 0.75)";
  ctx.font = "18px serif";
  ctx.fillText("❦  ❖  ❦", centerX, centerY + 62);

  // 7. Full Names / Title
  ctx.save();
  ctx.font = "bold 34px 'Cinzel', 'Playfair Display', 'Georgia', serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
  ctx.shadowBlur = 10;
  ctx.letterSpacing = "4px";
  ctx.fillText(mainHeading, centerX, height - 165);
  ctx.restore();

  // 8. Subtitle
  ctx.save();
  ctx.font = "600 16px 'Montserrat', sans-serif";
  ctx.fillStyle = accentGold;
  ctx.letterSpacing = "6px";
  ctx.fillText("✦  W E D D I N G   I N V I T A T I O N  ✦", centerX, height - 120);
  ctx.restore();

  // 9. Formatted Wedding Date
  let dateText = "CORDIALLY INVITED";
  if (weddingDate) {
    try {
      const d = new Date(weddingDate);
      if (!isNaN(d.getTime())) {
        dateText = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
      }
    } catch {}
  }

  ctx.save();
  ctx.font = "500 14px 'Montserrat', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.letterSpacing = "3px";
  ctx.fillText(dateText, centerX, height - 85);
  ctx.restore();

  return canvas;
}

/**
 * Returns a data URL of the monogram image
 */
export function getMonogramThumbnailDataUrl(options = {}) {
  try {
    const canvas = generateMonogramCanvas(options);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch (e) {
    console.warn("Could not generate monogram canvas:", e);
    return null;
  }
}

/**
 * Dynamically updates document OpenGraph and Meta tags for social previews
 */
export function updateSocialMetaTags({
  brideName = "",
  groomName = "",
  title = "",
  weddingDate = "",
  weddingVenue = "",
  introQuote = "",
  thumbnailUrl = null,
  shareUrl = null,
  socialTitle = "",
  socialDescription = "",
  socialThumbnailUrl = ""
}) {
  if (typeof document === 'undefined') return;

  let pageTitle = "DS Envite — Luxury Digital Invitations";
  let pageDesc = "Design, customize, and share interactive invitations with RSVP tracking, live music, countdown timers, and blessings.";
  let ogTitle = "Luxury Digital Invitation — DS Envite";

  // Priority 1: Use stored social metadata
  if (socialTitle) {
    ogTitle = socialTitle;
    pageTitle = `${socialTitle} | DS Envite`;
  }
  if (socialDescription) {
    pageDesc = socialDescription;
  }
  if (socialThumbnailUrl && socialThumbnailUrl.startsWith('http')) {
    thumbnailUrl = socialThumbnailUrl;
  }

  const couple = getCoupleDetails({
    bride: brideName,
    groom: groomName,
    title,
    slug: shareUrl
  });

  // Priority 2: Auto-generate if no custom social metadata
  if (!socialTitle) {
    if (couple.firstPerson && couple.secondPerson) {
      pageTitle = `${couple.displayName} — Wedding Invitation | DS Envite`;
      ogTitle = `${couple.displayName} — Wedding Invitation`;
    } else if (title) {
      pageTitle = `${title} | DS Envite`;
      ogTitle = title;
    }
  }

  if (!socialDescription) {
    if (couple.firstPerson && couple.secondPerson) {
      const venueText = weddingVenue ? ` at ${weddingVenue}` : '';
      pageDesc = `We cordially invite you to celebrate the wedding union of ${couple.displayName}${venueText}. Tap to view interactive invitation, music, and RSVP.`;
    } else if (title) {
      pageDesc = `You are cordially invited to ${title}. Tap to view the interactive invitation, music, and RSVP on DS Envite.`;
    }
  }
  
  document.title = pageTitle;

  const setMeta = (attr, key, content) => {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  const setCanonical = (url) => {
    if (!url) return;
    let el = document.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", "canonical");
      document.head.appendChild(el);
    }
    el.setAttribute("href", url);
  };

  setMeta("property", "og:title", ogTitle);
  setMeta("property", "og:description", pageDesc);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:site_name", "DS Envite");
  if (shareUrl) {
    setMeta("property", "og:url", shareUrl);
    setCanonical(shareUrl);
  }
  
  if (thumbnailUrl) {
    setMeta("property", "og:image", thumbnailUrl);
    setMeta("property", "og:image:secure_url", thumbnailUrl);
    setMeta("property", "og:image:type", "image/jpeg");
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    const altText = (brideName && groomName) 
      ? `${brideName} & ${groomName} Wedding Invitation Preview`
      : (title || 'Digital Invitation Preview');
    setMeta("property", "og:image:alt", altText);
    setMeta("name", "twitter:image", thumbnailUrl);
  }

  setMeta("name", "description", pageDesc);
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", ogTitle);
  setMeta("name", "twitter:description", pageDesc);
}

/**
 * Resets document title and social meta tags to DS Envite website defaults
 */
export function resetWebsiteSocialMetaTags() {
  if (typeof document === 'undefined') return;

  const origin = (typeof window !== 'undefined' && window.location?.origin) || 'https://ds-envite.vercel.app';
  const siteTitle = "DS Envite — Luxury Digital Invitations & Wedding Websites";
  const siteDesc = "Create beautiful, personalized digital wedding invitations with elegant designs, stunning themes, and memorable ways to share your special moments.";
  const siteBanner = `${origin}/website_thumbnail.jpg`;

  document.title = siteTitle;

  const setMeta = (attr, key, content) => {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  setMeta("property", "og:title", siteTitle);
  setMeta("property", "og:description", siteDesc);
  setMeta("property", "og:image", siteBanner);
  setMeta("property", "og:image:secure_url", siteBanner);
  setMeta("property", "og:url", origin);
  setMeta("property", "og:image:alt", "DS Envite Luxury Digital Invitations Platform");
  setMeta("name", "description", siteDesc);
  setMeta("name", "twitter:title", siteTitle);
  setMeta("name", "twitter:description", siteDesc);
  setMeta("name", "twitter:image", siteBanner);

  // Reset canonical URL to homepage
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", origin);
}
