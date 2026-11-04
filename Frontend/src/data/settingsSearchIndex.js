/**
 * Comprehensive Search Index for All Settings in AdminSidebar
 * Enables fast instant searching for any setting, color, font, countdown, blur, or media.
 */

export const SETTINGS_SEARCH_INDEX = [
  // Scratch & Reveal Tab
  {
    id: "scratchDateCountdown",
    title: "Date & Countdown Background & Blur",
    tabId: "scratch",
    tabName: "Scratch & Reveal",
    field: "scratchDateCountdown",
    description: "Adjust or eliminate blur (0px crystal clear to 40px) & glass background opacity behind wedding date & countdown timer",
    keywords: ["blur", "background blur", "countdown blur", "date blur", "clear", "0px", "crystal clear", "glass", "opacity", "transparent", "haze"]
  },
  {
    id: "scratchCountdownBoxes",
    title: "Countdown Timer Boxes (Days, Hours, Mins, Secs)",
    tabId: "scratch",
    tabName: "Scratch & Reveal",
    field: "scratchCountdownLabel",
    description: "Countdown box background color, border, text color, numbers, and individual box blur",
    keywords: ["countdown", "timer", "days", "hours", "minutes", "seconds", "boxes", "box bg", "numbers", "countdown label"]
  },
  {
    id: "scratchCountdownBoxBlur",
    title: "Countdown Timer Boxes Blur",
    tabId: "scratch",
    tabName: "Scratch & Reveal",
    field: "scratchDateCountdown",
    description: "Adjust glass blur specifically on the 4 countdown timer boxes",
    keywords: ["countdown blur", "box blur", "timer blur", "glass blur"]
  },
  {
    id: "scratchDateText",
    title: "Wedding Date & Time Display",
    tabId: "scratch",
    tabName: "Scratch & Reveal",
    field: "scratchDateText",
    description: "Wedding date format, font family, typography size, color, glow, and alignment on the revealed card",
    keywords: ["date", "wedding date", "ceremony date", "date picker", "calendar date", "dmy", "font", "typography"]
  },
  {
    id: "scratchThreshold",
    title: "Scratch Delay & Wipe Threshold",
    tabId: "scratch",
    tabName: "Scratch & Reveal",
    field: "scratchCompletionThreshold",
    description: "Wipe completion threshold (15% to 85%), reveal animation speed, and gold scratch coin sensitivity",
    keywords: ["scratch", "wipe", "threshold", "delay", "reveal speed", "percentage", "coin", "sensitive"]
  },
  {
    id: "scratchShieldBadge",
    title: "Center Shield Black Box & Badge",
    tabId: "scratch",
    tabName: "Scratch & Reveal",
    field: "scratchShieldBadgeTitle",
    description: "Main title text, countdown subtitle, badge background, border color, width, height, and corner rounding",
    keywords: ["shield", "black box", "badge", "scratch to reveal", "center title", "badge subtitle", "radius", "corners"]
  },
  {
    id: "scratchRevealBtn",
    title: "Instant Reveal Calendar Button",
    tabId: "scratch",
    tabName: "Scratch & Reveal",
    field: "scratchRevealBtnCard",
    description: "Instant reveal button styling, label text, background color, border, glow, font, and corner radius",
    keywords: ["instant reveal", "button", "reveal calendar", "scratch button", "gold button", "btn text"]
  },
  {
    id: "scratchCardBgMedia",
    title: "Revealed Card Background Image or HD Video",
    tabId: "scratch",
    tabName: "Scratch & Reveal",
    field: "scratchCardBgImage",
    description: "Custom photo or HD video revealed behind the scratch card with scale, position, and opacity",
    keywords: ["revealed image", "secret video", "card video", "card background", "photo", "scratch video", "media"]
  },
  {
    id: "scratchCardBlur",
    title: "Revealed Card Full Background Blur",
    tabId: "scratch",
    tabName: "Scratch & Reveal",
    field: "scratchCardBlur",
    description: "Adjust full interior revealed card blur from 0px up to 30px",
    keywords: ["card blur", "full blur", "revealed blur", "interior blur"]
  },
  {
    id: "scratchSecretMessage",
    title: "Secret Hidden Message / Surprise Treat",
    tabId: "scratch",
    tabName: "Scratch & Reveal",
    field: "scratchSecretMessage",
    description: "Romantic surprise note, after-party toast, or private message shown after scratching",
    keywords: ["secret", "hidden message", "surprise", "toast", "private note", "secret text"]
  },
  {
    id: "scratchCelebration",
    title: "Celebration Fireworks & Particle Effects",
    tabId: "scratch",
    tabName: "Scratch & Reveal",
    field: "scratchCelebrationEnabled",
    description: "24K gold sparkles, royal blossom shower, falling velvet rose petals, floating 3D hearts, or firecrackers",
    keywords: ["fireworks", "confetti", "particles", "sparkles", "rose petals", "hearts", "celebration sound", "burst"]
  },
  {
    id: "scratchBannerText",
    title: "Scratch Banner Typography Suite (Heading & Description)",
    tabId: "scratch",
    tabName: "Scratch & Reveal",
    field: "scratchHeading",
    description: "Heading text, eyebrow subtitle, description, font family, font size, weight, text glow, and random thought generator",
    keywords: ["heading", "subtitle", "description", "banner text", "eyebrow", "font family", "random thought", "text shadow"]
  },

  // Envelope Design Tab
  {
    id: "envelopeMainBgColor",
    title: "Main Background Color (Behind Envelope)",
    tabId: "envelope",
    tabName: "Envelope Design",
    field: "mainBgColor",
    description: "Color of the background canvas behind the envelope (independent of envelope body color)",
    keywords: ["background color", "main background", "canvas color", "dark blue", "wall color", "backdrop color"]
  },
  {
    id: "envelopeBgMedia",
    title: "Main Background Image or HD Video",
    tabId: "envelope",
    tabName: "Envelope Design",
    field: "mainBgImage",
    description: "Upload high-definition background image or cinematic HD video playing behind the envelope",
    keywords: ["background image", "background video", "hd video", "cinematic video", "media upload", "drive sync"]
  },
  {
    id: "envelopeNamePlate",
    title: "Couple / Hero Name Plate Color & Texture",
    tabId: "envelope",
    tabName: "Envelope Design",
    field: "namePlateColor",
    description: "Name plate card color, border, and custom image/video texture on front of the envelope",
    keywords: ["name plate", "hero name", "couple plate", "badge color", "gold plate", "plate texture"]
  },
  {
    id: "envelopeOpeningStyle",
    title: "Opening Experience Style",
    tabId: "envelope",
    tabName: "Envelope Design",
    field: "openingExperience",
    description: "Choose cinematic envelope animation: Royal Wax Seal Envelope, Classic Envelope, or Direct Flip",
    keywords: ["opening experience", "envelope animation", "royal wax seal", "classic envelope", "cinematic open"]
  },
  {
    id: "envelopeWaxSeal",
    title: "Royal Wax Seal Envelope & Monogram",
    tabId: "envelope",
    tabName: "Envelope Design",
    field: "envelopeWaxSealImg",
    description: "Custom gold wax seal monogram image, wax seal color, glow, and click animation",
    keywords: ["wax seal", "royal seal", "stamp", "monogram", "gold seal", "wax color"]
  },
  {
    id: "envelopeCoverSizing",
    title: "Cover Shape & Device Layout Sizing Mode",
    tabId: "envelope",
    tabName: "Envelope Design",
    field: "coverSizingMode",
    description: "Anti-stretch sizing mode, responsive device layout, and envelope proportions",
    keywords: ["cover size", "layout", "anti-stretch", "responsive", "dimensions", "aspect ratio"]
  },
  {
    id: "envelopeScrollParallax",
    title: "Envelope 3D Mouse Scroll & Parallax Movement",
    tabId: "envelope",
    tabName: "Envelope Design",
    field: "envelopeScroll",
    description: "Enable or unlock mouse wheel scrolling and 3D parallax zoom over the envelope",
    keywords: ["mouse scroll", "wheel scroll", "scroll lock", "3d parallax", "zoom", "scroll unblocked"]
  },

  // Cover Design Tab
  {
    id: "coverSacredSymbol",
    title: "Religious Emblem & Sacred Symbol",
    tabId: "cover",
    tabName: "Cover Design",
    field: "customSacredSymbolImg",
    description: "Ganesha, Om, Ik Onkar, Holy Cross, Bismillah, Crescent, or Secular Love Heart emblem",
    keywords: ["religious symbol", "ganesha", "om", "cross", "allah", "bismillah", "ik onkar", "sacred emblem"]
  },
  {
    id: "coverSacredVerse",
    title: "Sacred Verse / Opening Wedding Blessing",
    tabId: "cover",
    tabName: "Cover Design",
    field: "customSacredVerse",
    description: "Vakratunda Mahakaya, 1 Corinthians 13, Quran 30:21, Mangalam Bhagwan, or custom blessing quote",
    keywords: ["shloka", "sacred verse", "quran", "bible", "blessing", "mantra", "opening quote"]
  },
  {
    id: "coverCoupleNames",
    title: "Bride & Groom Couple Names Typography",
    tabId: "cover",
    tabName: "Cover Design",
    field: "coverBrideText",
    description: "Couple names, typography font family (Cinzel, Great Vibes, Playfair), text size, color, and glow",
    keywords: ["bride name", "groom name", "couple names", "hero characters", "cursive font", "royal font"]
  },
  {
    id: "coverQuotesTaglines",
    title: "Cover Taglines, Quotes & Subheadings",
    tabId: "cover",
    tabName: "Cover Design",
    field: "coverQuoteText",
    description: "Top tagline, bottom tagline, invitation subheading, and random romantic quote generator",
    keywords: ["tagline", "top tagline", "bottom tagline", "subheading", "intro quote", "we invite you"]
  },
  {
    id: "coverShapeStyle",
    title: "Cover Frame Shape & Border Framing",
    tabId: "cover",
    tabName: "Cover Design",
    field: "coverShape",
    description: "Royal arched top, scalloped baroque, rounded rectangle, ornate corners, and border colors",
    keywords: ["frame shape", "arch", "rounded", "royal crest", "scalloped", "card border"]
  },

  // Background Music Tab
  {
    id: "musicPresets",
    title: "Curated Background Music Presets",
    tabId: "music",
    tabName: "Background Music",
    field: "musicUrl",
    description: "Royal Shehnai, Romantic Flute, Sitar Melodies, Instrumental Wedding, and Classical Strings",
    keywords: ["music", "song", "shehnai", "flute", "instrumental", "audio presets", "bgm"]
  },
  {
    id: "musicUpload",
    title: "Upload Custom Audio / Song (MP3)",
    tabId: "music",
    tabName: "Background Music",
    field: "musicUpload",
    description: "Upload custom MP3 audio file or stream direct audio link for automatic celebration playback",
    keywords: ["upload audio", "upload mp3", "custom song", "audio track", "soundtrack"]
  },
  {
    id: "musicStartingSound",
    title: "Opening Starting Sound Effect",
    tabId: "music",
    tabName: "Background Music",
    field: "startingMusicUrl",
    description: "Cinematic chime, royal harp, or fanfare played when the envelope opens",
    keywords: ["starting sound", "fanfare", "chime", "harp", "opening sound", "sound effect"]
  },

  // Couple & Family Tab
  {
    id: "coupleStory",
    title: "Love Story & How We Met Journey",
    tabId: "couple",
    tabName: "Couple & Family",
    field: "storyParagraph",
    description: "How we met story paragraph, chapter titles, milestones, and romantic relationship story",
    keywords: ["love story", "how we met", "story paragraph", "journey", "milestones", "our story"]
  },
  {
    id: "coupleFamilyDetails",
    title: "Parents, Siblings & Welcoming Host Family",
    tabId: "couple",
    tabName: "Couple & Family",
    field: "brideFamily",
    description: "Parents names, bride family, groom family, daughter of, son of, and family greetings",
    keywords: ["parents", "father", "mother", "family", "bride parents", "groom parents", "hosts"]
  },

  // Timeline & Schedule Tab
  {
    id: "timelineSchedule",
    title: "Wedding Timeline Events & Schedule",
    tabId: "timeline",
    tabName: "Wedding Timeline",
    field: "timelineDrawer",
    description: "Haldi, Mehndi, Sangeet, Baraat, Varmala, Reception, Cocktail party schedules and timings",
    keywords: ["timeline", "schedule", "haldi", "mehndi", "sangeet", "baraat", "varmala", "reception", "cocktail"]
  },
  {
    id: "timelineClipart",
    title: "Timeline Clipart Icons & Symbols",
    tabId: "timeline",
    tabName: "Wedding Timeline",
    field: "timelineClipart",
    description: "Curated cultural clipart symbols for wedding events (Dhol, Rings, Kalash, Sacred Fire, Cocktails)",
    keywords: ["clipart", "icons", "symbols", "dhol", "rings", "kalash", "sacred fire", "timeline icon"]
  },

  // Event Venues Tab
  {
    id: "venueDetails",
    title: "Ceremony & Reception Venues with Google Maps",
    tabId: "venue",
    tabName: "Event Venues",
    field: "venueDetails",
    description: "Venue name, palace/resort address, Google Maps GPS coordinates, directions, and timings",
    keywords: ["venue", "location", "address", "google maps", "map embed", "directions", "reception venue"]
  },

  // Our Gallery Tab
  {
    id: "galleryMedia",
    title: "Photo & Video Gallery Media Slots (1 to 10)",
    tabId: "gallery",
    tabName: "Our Gallery",
    field: "galleryMedia",
    description: "10 high-definition photo and video gallery slots with Google Drive & Firebase sync",
    keywords: ["gallery", "photos", "videos", "media slots", "album", "pre-wedding photos", "hd gallery"]
  },
  {
    id: "galleryFrame",
    title: "Gallery Luxury Frame Color & Layout",
    tabId: "gallery",
    tabName: "Our Gallery",
    field: "galleryFrame",
    description: "Unified luxury frame border color, 1:1 square, 4:5 portrait, 16:9 cinema aspect ratios, and column grid",
    keywords: ["gallery frame", "frame color", "border color", "aspect ratio", "columns", "grid layout"]
  },

  // RSVP & Wishes Tab
  {
    id: "rsvpWhatsapp",
    title: "WhatsApp Direct RSVP & Guest Confirmation",
    tabId: "rsvp",
    tabName: "RSVP & Wishes",
    field: "rsvpWhatsapp",
    description: "WhatsApp phone number for instant 1-click RSVP guest confirmations and attendance counts",
    keywords: ["whatsapp", "rsvp", "attendance", "guest list", "phone number", "confirmation"]
  },
  {
    id: "wishesWall",
    title: "Guest Wishes & Blessings Wall",
    tabId: "rsvp",
    tabName: "RSVP & Wishes",
    field: "wishesWall",
    description: "Guest blessing wishes wall, message moderation, approval controls, and public wall display",
    keywords: ["wishes", "blessings", "guest book", "messages", "moderation", "public wishes"]
  },

  // Google Drive Cloud Storage
  {
    id: "driveCloudSync",
    title: "Google Drive Cloud Storage Sync & Folders",
    tabId: "envelope",
    tabName: "Drive Cloud Storage",
    field: "driveStorageHeader",
    description: "1-Click Google Drive folder sync for snierxgameplay@gmail.com, folder renaming, clean storage space, and webhook URL",
    keywords: ["drive", "google drive", "cloud storage", "folder", "sync", "rename folder", "clean space", "webhook", "snierxgameplay"]
  }
];

/**
 * Filter settings by search query (matches title, description, tabName, and keywords)
 */
export function searchSettings(query) {
  if (!query || typeof query !== "string") return [];
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  const tokens = q.split(/\s+/).filter(Boolean);

  return SETTINGS_SEARCH_INDEX.filter(item => {
    const haystack = [
      item.title,
      item.description,
      item.tabName,
      ...(item.keywords || [])
    ].join(" ").toLowerCase();

    // Must match all entered tokens (e.g. "countdown blur" matches items containing both)
    return tokens.every(token => haystack.includes(token));
  });
}

