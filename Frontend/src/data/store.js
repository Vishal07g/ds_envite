// LocalStorage CRUD Database Store for Wedding Invitation SaaS
import { ref, set, get, onValue } from "firebase/database";
import { database } from "../utils/firebase";
import { DEFAULT_TIMELINE_CONFIG } from "./timelineDefaults";
import {
  formatDriveFolderName,
  syncDriveFolder,
  GOOGLE_DRIVE_ROOT_FOLDER_ID,
  GOOGLE_DRIVE_ROOT_FOLDER_URL,
  transferAllDatabaseImagesToDrive,
  scanDatabaseForBase64Media,
  uploadBase64ToDriveStorage
} from "../utils/googleDriveStorage";

// Firebase Realtime Database sync status
let isFirebaseSynced = false;
let dbCache = null;

const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200";
const DEFAULT_STORY_IMAGE = "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200";
const DEFAULT_SAVE_DATE_IMAGE = "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=1200";

export const CURATED_MUSIC_PRESETS = [
  {
    id: "shehnai_sitar",
    title: "Royal Shehnai & Sitar Melody",
    artist: "Indian Classical Ensemble",
    category: "Traditional & Cultural",
    url: "/music_wedding.mp3"
  },
  {
    id: "soft_flute",
    title: "Soft Flute & Divine Harp (Ganesh Mantra)",
    artist: "Sacred Harmonies",
    category: "Devotional & Soft",
    url: "/music_intro.mp3"
  },
  {
    id: "romantic_piano",
    title: "Romantic Piano & Strings",
    artist: "Harmonic Serenade",
    category: "Romantic",
    url: "https://actions.google.com/sounds/v1/ambiences/outdoor_festival.ogg"
  },
  {
    id: "acoustic_love",
    title: "Acoustic Love & Harmony",
    artist: "Golden Sunset Duo",
    category: "Acoustic",
    url: "/music_wedding.mp3"
  },
  {
    id: "cinematic_violin",
    title: "Cinematic Wedding Violin",
    artist: "Royal Philharmonic Solo",
    category: "Cinematic",
    url: "/music_intro.mp3"
  }
];

export const CURATED_CLIPARTS = [
  {
    id: "om",
    name: "Sacred Om",
    category: "Hindu",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23d4af37'><path d='M48 20c-5-2-12-1-17 3-5 4-8 10-7 16 1 8 8 14 16 15-5 3-9 9-9 15 0 9 7 17 16 17 10 0 18-7 19-17 1-7-3-14-9-17 6-2 10-8 10-14 0-9-8-17-19-18zm-2 16c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9zm1 31c6 0 11 5 11 11s-5 11-11 11-11-5-11-11 5-11 11-11zm24-37c2-5 7-9 13-9 8 0 14 6 14 14 0 9-7 16-16 16-3 0-6-1-8-3 3-3 5-7 5-11 0-5-3-9-8-7zm-14-14c6 0 11 2 15 6 3 3 5 7 5 11-2-1-5-2-8-2-5 0-10 3-12 7-1-7 2-15 0-22z'/></svg>"
  },
  {
    id: "ganesha",
    name: "Lord Ganesha",
    category: "Hindu",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23d4af37'><path d='M50 10c-15 0-26 10-26 24 0 6 3 12 7 16-2 3-5 7-6 12-2 7 0 15 5 21 6 7 15 10 24 9 6-1 12-4 16-9 4-5 6-12 5-18-1-5-4-9-8-12 5-4 8-11 8-18 0-14-11-25-25-25zm-3 8c10 0 18 7 18 16 0 7-5 13-12 15-2 1-3 2-3 4v7c0 6-3 12-8 15-4 3-10 3-14 0-3-2-5-6-5-10 0-3 1-5 4-6 2-1 4-3 5-5 3-4 5-9 5-14 0-9 5-16 10-17zm-18 14c-2 0-3 1-3 3 0 5 4 10 9 12-2-4-4-9-6-15zm38 2c5 2 8 7 8 12 0 2-1 3-3 3-2-5-4-10-5-15z'/></svg>"
  },
  {
    id: "double-hearts",
    name: "Double Hearts",
    category: "Romantic",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23d4af37'><path d='M35 22c-8 0-15 6-15 14 0 11 12 21 21 29 2 2 4 4 6 5 2-1 4-3 6-5 5-4 10-9 14-14-3 0-5-1-8-3-8-4-13-12-13-21 0-2 0-3 1-5-4 0-8 0-12 0zm30 10c-7 0-13 5-13 12 0 9 9 18 18 25 2 1 3 2 5 3 2-1 3-2 5-3 9-7 18-16 18-25 0-7-6-12-13-12-4 0-8 2-10 6-2-4-6-6-10-6z'/></svg>"
  },
  {
    id: "wedding-rings",
    name: "Wedding Rings",
    category: "Romantic",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke='%23d4af37' stroke-width='6'><circle cx='38' cy='52' r='24'/><circle cx='62' cy='52' r='24'/><path d='M38 22l4-8h-8l4 8z' fill='%23d4af37'/></svg>"
  },
  {
    id: "royal-crest",
    name: "Royal Crest",
    category: "Luxury",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke='%23d4af37' stroke-width='4'><path d='M50 12 L78 28 L78 62 C78 78 50 90 50 90 C50 90 22 78 22 62 L22 28 Z'/><path d='M50 24 L68 36 L68 58 C68 70 50 78 50 78 C50 78 32 70 32 58 L32 36 Z' stroke-width='2'/><circle cx='50' cy='48' r='7' fill='%23d4af37'/></svg>"
  },
  {
    id: "lotus",
    name: "Sacred Lotus",
    category: "Floral",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23d4af37'><path d='M50 22 C43 38 44 56 50 68 C56 56 57 38 50 22 Z'/><path d='M47 34 C36 44 34 60 46 70 C44 58 44 46 47 34 Z'/><path d='M53 34 C64 44 66 60 54 70 C56 58 56 46 53 34 Z'/><path d='M43 46 C26 54 26 70 42 72 C36 64 38 54 43 46 Z'/><path d='M57 46 C74 54 74 70 58 72 C64 64 62 54 57 46 Z'/><path d='M25 73 C42 82 58 82 75 73' stroke='%23d4af37' stroke-width='4' fill='none'/></svg>"
  },
  {
    id: "cross",
    name: "Holy Cross",
    category: "Christian",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23d4af37'><path d='M44 14 h12 v22 h22 v12 h-22 v38 h-12 v-38 h-22 v-12 h22 z'/></svg>"
  },
  {
    id: "khanda",
    name: "Ek Onkar / Khanda",
    category: "Sikh",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23d4af37'><circle cx='50' cy='50' r='18' fill='none' stroke='%23d4af37' stroke-width='6'/><path d='M47 16 h6 v68 h-6 z'/><path d='M26 36 c-8 12-4 28 6 36 2 2 5 3 7 4-6-5-9-14-6-22 2-7 7-13 13-16-6-2-15-1-20-2z'/><path d='M74 36 c8 12 4 28-6 36-2 2-5 3-7 4 6-5 9-14 6-22-2-7-7-13-13-16 6-2 15-1 20-2z'/></svg>"
  },
  {
    id: "crescent",
    name: "Crescent & Star",
    category: "Islamic",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23d4af37'><path d='M50 16 C30 16 14 32 14 52 C14 72 30 88 50 88 C62 88 73 82 80 72 C60 76 42 62 42 44 C42 30 52 20 66 18 C61 17 56 16 50 16 Z'/><polygon points='72,34 76,46 88,46 78,54 82,66 72,58 62,66 66,54 56,46 68,46'/></svg>"
  },
  {
    id: "floral-wreath",
    name: "Floral Laurel",
    category: "Botanical",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23d4af37'><path d='M30 76 C20 62 20 38 34 24 C36 22 34 20 32 21 C18 36 18 64 28 78 Z'/><path d='M70 76 C80 62 80 38 66 24 C64 22 66 20 68 21 C82 36 82 64 72 78 Z'/><circle cx='50' cy='82' r='4'/><circle cx='26' cy='42' r='3'/><circle cx='74' cy='42' r='3'/><circle cx='34' cy='30' r='3'/><circle cx='66' cy='30' r='3'/></svg>"
  }
];

const DEFAULT_CONFIG = {
  ...DEFAULT_TIMELINE_CONFIG,
  brideName: "Ananya",
  brideFamily: "Mr. & Mrs. Rajesh Sharma",
  groomName: "Aarav",
  groomFamily: "Mr. & Mrs. Vijay Patel",
  weddingDate: "2026-11-20T16:00:00",
  introQuote: "Celebrating love, togetherness and everlasting happiness.",
  weddingVenue: "The Starlight Cathedral",
  weddingAddress: "100 Seraphim Way, Glass Valley, CA",
  weddingMapUrl: "https://maps.google.com/?q=Starlight+Cathedral",
  receptionVenue: "The Gilded Glass Greenhouse",
  receptionAddress: "450 Conservatory Road, Glass Valley, CA",
  receptionMapUrl: "https://maps.google.com/?q=Gilded+Glass+Greenhouse",
  heroImage: "/bg_floral_pink.jpg", // New premium floral background
  storyImage: DEFAULT_STORY_IMAGE,
  scratchImage: "",

  // Custom Dual Song Music System (Starting / Intro Song & Main Song)
  startingMusicEnabled: true,
  startingMusicUrl: "/music_intro.mp3",
  startingMusicTitle: "Vakratunda Ganesh Mantra",
  startingMusicArtist: "Opening Blessing",
  startingMusicVolume: 0.8,
  startingMusicLoop: true,

  mainMusicEnabled: true,
  musicUrl: "/music_wedding.mp3",
  musicTitle: "Royal Shehnai & Sitar Melody",
  musicArtist: "Indian Classical Ensemble",
  musicVolume: 0.8,
  autoPlayMusic: true,
  loopMusic: true,
  showMusicWidget: true,
  showGallery: true,
  galleryTitle: "Our Captured Moments",
  gallerySubtitle: "Our Love in Frames",
  galleryImage1: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600",
  galleryCaption1: "The Proposal Day",
  galleryFrameShape1: "portrait",
  galleryFrameBorder1: "double-gilded",
  galleryImage2: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600",
  galleryCaption2: "Stargazing under the maples",
  galleryFrameShape2: "portrait",
  galleryFrameBorder2: "double-gilded",
  galleryImage3: "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=600",
  galleryCaption3: "Hand in hand, forever",
  galleryFrameShape3: "portrait",
  galleryFrameBorder3: "double-gilded",
  galleryImage4: "",
  galleryCaption4: "",
  galleryFrameShape4: "portrait",
  galleryFrameBorder4: "double-gilded",
  galleryImage5: "",
  galleryCaption5: "",
  galleryFrameShape5: "portrait",
  galleryFrameBorder5: "double-gilded",
  galleryImage6: "",
  galleryCaption6: "",
  galleryFrameShape6: "portrait",
  galleryFrameBorder6: "double-gilded",
  storyParagraph: "From a chance encounter under rain-slicked maple leaves to cozy late-night kitchen dances, our journey has been a collection of golden fragments. We cannot wait to begin our greatest chapter with you by our side.",
  storySubtitle: "MEET THE FAMILIES",
  storyTitle: "Vows of Two Dynasties",
  storyBrideTitle: "The Beautiful Bride",
  storyGroomTitle: "The Noble Groom",
  storyBrideParentLabel: "Daughter of",
  storyGroomParentLabel: "Son of",
  storyPathTitle: "Our Path of Serendipity",
  scratchSecretMessage: "We have booked a private stargazing toast after the reception! Make sure to grab a custom lantern at the main exit.",
  religionKey: "secular",
  customSacredVerse: "“And now these three remain: faith, hope and love. But the greatest of these is love.” - 1 Corinthians 13:13",
  customSacredSymbol: "❤",
  frameShape: "oval",
  frameBorderTheme: "double-gilded",
  headerFontClass: "font-serif",
  cursiveFontClass: "font-cursive",
  bodyFontClass: "font-serif",
  primaryColor: "#fdfbf7", // Warm cream
  accentGold: "#b89254", // Muted gold
  lightBgColor: "#faf6f0", // Warm paper
  glassBtnBg: "rgba(138, 43, 63, 0.08)",
  glassBtnBorder: "rgba(184, 146, 84, 0.4)",
  glassBtnShadow: "rgba(184, 146, 84, 0.15)",
  glassBtnText: "#8a2b3f",
  glassBtnShadowSize: "16",
  scroll3DEnabled: true,
  scroll3DIntensity: 4,
  scroll3DPerspective: 900,
  
  // Editable Envelope Configurations
  envelopeBgColor: "#5a0e1c", // Deep rich burgundy/wine (Pinterest match)
  envelopeFlapBgStart: "rgba(184, 146, 84, 0.25)",
  envelopeFlapBgEnd: "rgba(90, 14, 28, 0.9)",
  envelopeSealColor: "#c89f4b", // Antique gold
  envelopeSealShape: "organic",
  envelopeFlapShape: "classic-v",
  envelopeParticleType: "sparkles",
  envelopeSealType: "real-gold",
  envelopeWaxSealImg: "/real_wax_seal_gold.jpg",
  envelopePaperTexture: "/real_paper_texture.jpg",
  envelopePaperOpacity: 0.75,
  showEnvelopePaperTexture: true,
  showEnvelopeFolds: true,
  envelopeSealSizePx: 104,
  envelopeInitials: "S & V",
  envelopeTagline: "You're Invited",
  envelopeSpeed: "1.2",
  envelopeParticles: 20,
  envelopeSealTop: 45,
  envelopeSizingMode: "classic-rectangle", // "classic-rectangle", "responsive-card", "full-bleed"
  envelopeAspectRatio: "auto", // "auto", "classic-horizontal", "portrait", "square"
  envelopeMaxWidth: 760,
  envelopeOpeningStyle: "classic-envelope", // "classic-envelope", "royal-doors", "leaf-blown", "petal-blown", "royal-curtains"
  envelopePetalImg: "/real_rose_petal.jpg",
  envelopeLeafImg: "/real_autumn_leaf.jpg",
  envelopeDoorsImg: "/real_palace_doors.jpg",
  envelopeCurtainsImg: "/real_velvet_curtains.jpg",
  
  // Custom envelope typography & elements control keys
  envelopeSymbolType: "text", // "text" or "image"
  envelopeSymbolText: "",
  envelopeSymbolFont: "font-sans",
  envelopeSymbolSize: "text-3xl",
  envelopeSymbolColor: "",
  envelopeSymbolImg: "",
  envelopeSymbolScale: 1.0,
  envelopeSymbolSizePx: 48,
  envelopeSymbolX: 0,
  envelopeSymbolY: 0,
  envelopeSymbolRotate: 0,
  envelopeSymbolOpacity: 1.0,
  envelopeSymbolBlendMode: "normal",
  envelopeSymbolTintColor: "",
  envelopeSymbolShadowColor: "rgba(0, 0, 0, 0.5)",
  envelopeSymbolShadowBlur: 8,
  envelopeSymbolShadowX: 0,
  envelopeSymbolShadowY: 4,
  
  envelopeInitialsFont: "font-cursive",
  envelopeInitialsSize: "text-3xl",
  envelopeInitialsColor: "",
  
  envelopeTaglineFont: "font-sans",
  envelopeTaglineSize: "text-[10px]",
  envelopeTaglineColor: "",
  
  envelopeNamesText: "",
  envelopeNamesFont: "font-cinzel",
  envelopeNamesSize: "text-xl",
  envelopeNamesColor: "",
  
  envelopeInviteLabelText: "Request the pleasure of your company",
  envelopeInviteLabelFont: "font-sans",
  envelopeInviteLabelSize: "text-xs",
  envelopeInviteLabelColor: "",
  
  envelopeBtnText: "Open Invitation",
  envelopeBtnDesign: "classic", // classic, gilded-glow, glassmorphism, royal-burgundy, pulsing-aura
  envelopeBtnFont: "font-sans",
  envelopeBtnSize: "text-xs",
  envelopeBtnColor: "",

  // Reveal Effect and Typography Defaults
  revealEffect: "scratch",
  sacredSymbolColor: "#8a2b3f", // deep burgundy for light theme
  sacredVerseColor: "#4a4a4a", // dark slate for light theme
  heroTitleFont: "font-serif",
  heroTitleSize: "text-4xl sm:text-6xl md:text-7xl",
  heroTitleAlign: "text-center",
  storyTitleFont: "font-serif",
  storyTitleSize: "text-3xl sm:text-4xl",
  storyTitleAlign: "text-left",
  storyTextSize: "text-xs sm:text-sm",
  storyTextAlign: "text-left",
  venueTitleFont: "font-serif",
  venueTitleSize: "text-2xl sm:text-3xl",
  venueTitleAlign: "text-center",
  rsvpTitleFont: "font-serif",
  rsvpTitleSize: "text-2xl sm:text-3xl",
  rsvpTitleAlign: "text-center",
  wishTitleFont: "font-serif",
  wishTitleSize: "text-2xl sm:text-3xl",
  wishTitleAlign: "text-center",

  // Holy Image & Venue Photos customisations
  customSacredSymbolImg: "",
  customSacredSymbolImgScale: 1.0,
  customSacredSymbolImgSizePx: 56,
  customSacredSymbolImgX: 0,
  customSacredSymbolImgY: 0,
  customSacredSymbolImgRotate: 0,
  customSacredSymbolImgOpacity: 1.0,
  customSacredSymbolImgBlendMode: "normal",
  customSacredSymbolImgTintColor: "",
  customSacredSymbolImgShadowColor: "rgba(0, 0, 0, 0.4)",
  customSacredSymbolImgShadowBlur: 8,
  customSacredSymbolImgShadowX: 0,
  customSacredSymbolImgShadowY: 3,
  venueCeremonyImage: "",
  venueCeremonyFrameShape: "landscape",
  venueCeremonyFrameBorderTheme: "minimalist",
  venueReceptionImage: "",
  venueReceptionFrameShape: "landscape",
  venueReceptionFrameBorderTheme: "minimalist",
  
  // Customisable reveal effect speed and color
  revealSpeed: "1.0",
  revealColor: "#b89254",
  
  // Cover Card Customisations
  coverBorderColor: "#b89254",
  coverBorderSize: 2,
  coverCornerSize: 32,
  coverBorderOpacity: 1.0,
  coverInnerBorderEnabled: true,
  coverInnerBorderColor: "rgba(184, 146, 84, 0.15)",
  coverBgOverlayStart: "rgba(253, 251, 247, 0.15)",
  coverBgOverlayEnd: "rgba(253, 251, 247, 0.35)",
  coverTopTaglineText: "Under the Auspices of Love and Destiny",
  coverTopTaglineFont: "font-sans",
  coverTopTaglineSize: "text-[10px] sm:text-xs",
  coverTopTaglineColor: "#8a2b3f",
  coverTopTaglineSpacing: "tracking-[0.3em]",
  coverSubheadingText: "The Union Ceremony of",
  coverSubheadingFont: "font-serif",
  coverSubheadingSize: "text-xl sm:text-2xl",
  coverSubheadingColor: "#4a4a4a",
  coverSubheadingItalic: true,
  coverBrideFont: "font-serif",
  coverBrideSize: "text-4xl sm:text-6xl md:text-7xl",
  coverBrideColor: "#8a2b3f",
  coverAmpersandText: "&",
  coverAmpersandFont: "font-cursive",
  coverAmpersandSize: "text-3xl sm:text-5xl",
  coverAmpersandColor: "#b89254",
  coverGroomFont: "font-serif",
  coverGroomSize: "text-4xl sm:text-6xl md:text-7xl",
  coverGroomColor: "#8a2b3f",
  coverQuoteFont: "font-cursive",
  coverQuoteSize: "text-base sm:text-xl",
  coverQuoteColor: "#4a4a4a",
  coverRevealBtnText: "Reveal Secret Save the Date",
  coverRevealBtnFont: "font-sans",
  coverRevealBtnSize: "text-[10px]",
  coverBottomTaglineText: "✦ A Sacred Promise of Eternal Love • Uncover Our Secret Date Below ✦",
  coverBottomTaglineFont: "font-sans",
  coverBottomTaglineSize: "text-[9px] sm:text-xs",
  coverBottomTaglineColor: "#8a2b3f",
  coverBottomTaglineBg: "rgba(253, 251, 247, 0.7)",

  // Global Border / Frame PNG Configuration
  showGlobalBorder: false,
  globalBorderImage: "",
  globalBorderScrollMode: "fixed", // "fixed" (non-scrollable) or "scroll" (scrolls with pages)
  globalBorderFit: "contain", // "contain" (no-stretch proportional), "slice" (9-slice corners), "cover" (full perimeter)
  globalBorderOpacity: 1.0,
  globalBorderWidth: 28,
  globalBorderSlice: 48,
  globalBorderInset: 0,
  globalBorderRepeat: "round"
};

const INITIAL_BG_PRESETS = [
  { id: "bg-floral-cream", name: "Floral Cream", url: "/bg_floral_pink.jpg", presetKey: "floral_pink" },
  { id: "bg-floral-dark", name: "Floral Dark", url: "/bg_floral_dark.jpg", presetKey: "floral_dark" },
  { id: "bg-lace-green", name: "Lace Green", url: "/bg_lace_green.jpg", presetKey: "lace_green" }
];

export const INITIAL_ENVELOPE_PRESETS = [
  {
    id: "ep-royal-wine",
    name: "Royal Wine & Gold",
    bg: "#5a0e1c",
    seal: "#c89f4b",
    type: "heart",
    flap: "classic-v",
    shape: "organic",
    particles: "sparkles",
    speed: "1.2",
    count: 20,
    sealTop: 50,
    bgImage: "",
    isDefault: true
  },
  {
    id: "ep-midnight-navy",
    name: "Midnight Navy & Rings",
    bg: "#0f1d38",
    seal: "#d4af37",
    type: "rings",
    flap: "classic-v",
    shape: "hexagon",
    particles: "sparkles",
    speed: "1.2",
    count: 25,
    sealTop: 50,
    bgImage: "",
    isDefault: true
  },
  {
    id: "ep-mocha-taupe",
    name: "Mocha Taupe & Gold",
    bg: "#483c38",
    seal: "#c5a059",
    type: "crest",
    flap: "curved-scoop",
    shape: "circle",
    particles: "sparkles",
    speed: "1.2",
    count: 20,
    sealTop: 48,
    bgImage: "",
    isDefault: true
  },
  {
    id: "ep-imperial-emerald",
    name: "Imperial Emerald",
    bg: "#133326",
    seal: "#d4af37",
    type: "lotus",
    flap: "deep-royal",
    shape: "shield",
    particles: "petals",
    speed: "1.4",
    count: 30,
    sealTop: 52,
    bgImage: "",
    isDefault: true
  },
  {
    id: "ep-crimson-red",
    name: "Crimson & Red Wax",
    bg: "#681320",
    seal: "#781324",
    type: "rose",
    flap: "classic-v",
    shape: "organic",
    particles: "hearts",
    speed: "1.2",
    count: 20,
    sealTop: 50,
    bgImage: "",
    isDefault: true
  },
  {
    id: "ep-obsidian-rose",
    name: "Obsidian & Rose Gold",
    bg: "#1a1a1f",
    seal: "#d48378",
    type: "initials",
    flap: "deep-royal",
    shape: "hexagon",
    particles: "sparkles",
    speed: "1.1",
    count: 24,
    sealTop: 50,
    bgImage: "",
    isDefault: true
  }
];

// Initial presets mock
const INITIAL_PRESETS = [
  {
    id: "preset-classic",
    title: "Elegant Floral Cream",
    religion: "secular",
    config: {
      ...DEFAULT_CONFIG,
      presetId: "preset-classic",
      envelopeBgColor: "#5a0e1c",
      envelopeSealColor: "#c89f4b",
      envelopeSealType: "heart",
      envelopeFlapShape: "classic-v",
      envelopeSealShape: "organic",
      envelopeParticleType: "sparkles",
      sacredSymbolColor: "#8a2b3f",
      sacredVerseColor: "#4a4a4a"
    }
  },
  {
    id: "preset-dark",
    title: "Royal Floral Navy",
    religion: "secular",
    config: {
      ...DEFAULT_CONFIG,
      presetId: "preset-dark",
      heroImage: "/bg_floral_dark.jpg",
      primaryColor: "#0b1329",
      accentGold: "#e5b858",
      lightBgColor: "#fcf8f2",
      envelopeBgColor: "#0f1d38",
      envelopeSealColor: "#d4af37",
      envelopeSealType: "rings",
      envelopeFlapShape: "classic-v",
      envelopeSealShape: "hexagon",
      envelopeParticleType: "sparkles",
      sacredSymbolColor: "#e5b858",
      sacredVerseColor: "#e2e8f0",
      coverTopTaglineColor: "#e5b858",
      coverSubheadingColor: "#ffffff",
      coverBrideColor: "#ffffff",
      coverAmpersandColor: "#e5b858",
      coverGroomColor: "#ffffff",
      coverQuoteColor: "#e2e8f0",
      coverBottomTaglineColor: "#e5b858",
      coverBottomTaglineBg: "rgba(11, 19, 41, 0.75)",
      coverBrideFont: "font-cinzel",
      coverGroomFont: "font-cinzel",
      coverAmpersandFont: "font-cursive",
      coverBorderColor: "#e5b858",
      coverInnerBorderColor: "rgba(229, 184, 88, 0.2)",
      glassBtnBg: "rgba(255, 255, 255, 0.1)",
      glassBtnBorder: "rgba(229, 184, 88, 0.45)",
      glassBtnText: "#ffffff",
      glassBtnShadow: "rgba(229, 184, 88, 0.4)"
    }
  },
  {
    id: "preset-green",
    title: "Romantic Lace Green",
    religion: "secular",
    config: {
      ...DEFAULT_CONFIG,
      presetId: "preset-green",
      heroImage: "/bg_lace_green.jpg",
      primaryColor: "#edf5f1",
      accentGold: "#d47685",
      lightBgColor: "#fafcfb",
      envelopeBgColor: "#133326",
      envelopeSealColor: "#d4af37",
      envelopeSealType: "lotus",
      envelopeFlapShape: "curved-scoop",
      envelopeSealShape: "circle",
      envelopeParticleType: "petals",
      sacredSymbolColor: "#3c6e5c",
      sacredVerseColor: "#2d4f43",
      coverTopTaglineColor: "#3c6e5c",
      coverSubheadingColor: "#555555",
      coverBrideColor: "#d47685",
      coverAmpersandColor: "#3c6e5c",
      coverGroomColor: "#d47685",
      coverQuoteColor: "#555555",
      coverBottomTaglineColor: "#3c6e5c",
      coverBottomTaglineBg: "rgba(237, 245, 241, 0.7)",
      coverBrideFont: "font-cursive",
      coverGroomFont: "font-cursive",
      coverAmpersandFont: "font-serif",
      coverBorderColor: "#d47685",
      coverInnerBorderColor: "rgba(212, 118, 133, 0.15)",
      glassBtnBg: "rgba(212, 118, 133, 0.08)",
      glassBtnBorder: "rgba(212, 118, 133, 0.35)",
      glassBtnText: "#d47685",
      glassBtnShadow: "rgba(212, 118, 133, 0.15)"
    }
  },
  {
    id: "preset-royal-scroll",
    title: "3D Royal Imperial Scroll",
    religion: "royal",
    config: {
      ...DEFAULT_CONFIG,
      presetId: "preset-royal-scroll",
      primaryColor: "#2b060c",
      accentGold: "#f5c518",
      lightBgColor: "#fffaf0",
      envelopeBgColor: "#4a0e17",
      envelopeSealColor: "#f5c518",
      envelopeInitials: "S 👑 V",
      envelopeTagline: "By Royal Decree",
      sacredSymbolColor: "#f5c518",
      sacredVerseColor: "#fdf6e2",
      customSacredSymbol: "👑",
      customSacredVerse: "“Two Hearts United in Royal Grace & Eternal Splendor.”",
      coverTopTaglineColor: "#f5c518",
      coverSubheadingColor: "#ffffff",
      coverBrideColor: "#f5c518",
      coverAmpersandColor: "#ffffff",
      coverGroomColor: "#f5c518",
      coverQuoteColor: "#fdf6e2",
      coverBottomTaglineColor: "#f5c518",
      coverBottomTaglineBg: "rgba(43, 6, 12, 0.85)",
      coverBrideFont: "font-cinzel",
      coverGroomFont: "font-cinzel",
      coverAmpersandFont: "font-serif",
      coverBorderColor: "#f5c518",
      coverBorderSize: 3,
      coverInnerBorderColor: "rgba(245, 197, 24, 0.3)",
      glassBtnBg: "rgba(245, 197, 24, 0.15)",
      glassBtnBorder: "rgba(245, 197, 24, 0.6)",
      glassBtnText: "#f5c518",
      glassBtnShadow: "rgba(245, 197, 24, 0.3)",
      scroll3DEnabled: true,
      scroll3DIntensity: 6,
      scroll3DPerspective: 1000
    }
  },
  {
    id: "preset-royal-palace",
    title: "Indian Vintage Royal Palace (Rajwada)",
    religion: "hindu",
    config: {
      ...DEFAULT_CONFIG,
      presetId: "preset-royal-palace",
      primaryColor: "#540d17",
      accentGold: "#d4af37",
      lightBgColor: "#fffdf9",
      envelopeBgColor: "#7a121d",
      envelopeSealColor: "#d4af37",
      envelopeInitials: "S 🕉 V",
      envelopeTagline: "Shubh Vivah Invitation",
      sacredSymbolColor: "#d4af37",
      sacredVerseColor: "#ffe8a3",
      customSacredSymbol: "🕉",
      customSacredVerse: "“ॐ श्री गणेशाय नमः ॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ॥”",
      coverTopTaglineText: "॥ शुभ विवाह - A Union Blessed by the Gods ॥",
      coverTopTaglineColor: "#d4af37",
      coverSubheadingColor: "#ffffff",
      coverBrideColor: "#ffd700",
      coverAmpersandColor: "#d4af37",
      coverGroomColor: "#ffd700",
      coverQuoteColor: "#ffe8a3",
      coverBottomTaglineColor: "#d4af37",
      coverBottomTaglineBg: "rgba(84, 13, 23, 0.85)",
      coverBrideFont: "font-serif",
      coverGroomFont: "font-serif",
      coverAmpersandFont: "font-cursive",
      coverBorderColor: "#d4af37",
      coverBorderSize: 3,
      coverInnerBorderColor: "rgba(212, 175, 55, 0.35)",
      glassBtnBg: "rgba(212, 175, 55, 0.15)",
      glassBtnBorder: "rgba(212, 175, 55, 0.5)",
      glassBtnText: "#ffd700",
      glassBtnShadow: "rgba(212, 175, 55, 0.25)",
      frameBorderTheme: "double-gilded"
    }
  },
  {
    id: "preset-neon-glass",
    title: "Cyberpunk Minimalist Neon Glass",
    religion: "secular",
    config: {
      ...DEFAULT_CONFIG,
      presetId: "preset-neon-glass",
      primaryColor: "#0a0e17",
      accentGold: "#00f0ff",
      lightBgColor: "#0e1422",
      envelopeBgColor: "#111827",
      envelopeSealColor: "#00f0ff",
      envelopeInitials: "S & V",
      envelopeTagline: "Modern Love Story",
      sacredSymbolColor: "#bd00ff",
      sacredVerseColor: "#00f0ff",
      customSacredSymbol: "⚡",
      customSacredVerse: "“In a universe of infinite possibilities, our orbits collided.”",
      coverTopTaglineColor: "#00f0ff",
      coverSubheadingColor: "#e2e8f0",
      coverBrideColor: "#00f0ff",
      coverAmpersandColor: "#bd00ff",
      coverGroomColor: "#00f0ff",
      coverQuoteColor: "#cbd5e1",
      coverBottomTaglineColor: "#00f0ff",
      coverBottomTaglineBg: "rgba(10, 14, 23, 0.9)",
      coverBrideFont: "font-sans",
      coverGroomFont: "font-sans",
      coverAmpersandFont: "font-sans",
      coverBorderColor: "#00f0ff",
      coverBorderSize: 1,
      coverInnerBorderColor: "rgba(189, 0, 255, 0.3)",
      glassBtnBg: "rgba(0, 240, 255, 0.1)",
      glassBtnBorder: "rgba(0, 240, 255, 0.4)",
      glassBtnText: "#00f0ff",
      glassBtnShadow: "rgba(0, 240, 255, 0.3)"
    }
  },
  {
    id: "preset-gold-foil",
    title: "Luxury Metallic Floral Gold Foil",
    religion: "secular",
    config: {
      ...DEFAULT_CONFIG,
      presetId: "preset-gold-foil",
      primaryColor: "#fbf9f5",
      accentGold: "#b8860b",
      lightBgColor: "#ffffff",
      envelopeBgColor: "#1b3b2b",
      envelopeSealColor: "#b8860b",
      envelopeInitials: "S • V",
      envelopeTagline: "Bespoke Invitation",
      sacredSymbolColor: "#1b3b2b",
      sacredVerseColor: "#334155",
      customSacredSymbol: "🌿",
      customSacredVerse: "“As vines entwine, two hearts grow as one under heaven's grace.”",
      coverTopTaglineColor: "#1b3b2b",
      coverSubheadingColor: "#334155",
      coverBrideColor: "#b8860b",
      coverAmpersandColor: "#1b3b2b",
      coverGroomColor: "#b8860b",
      coverQuoteColor: "#475569",
      coverBottomTaglineColor: "#1b3b2b",
      coverBottomTaglineBg: "rgba(251, 249, 245, 0.85)",
      coverBrideFont: "font-serif",
      coverGroomFont: "font-serif",
      coverAmpersandFont: "font-cursive",
      coverBorderColor: "#b8860b",
      coverBorderSize: 2,
      coverInnerBorderColor: "rgba(27, 59, 43, 0.2)",
      glassBtnBg: "rgba(184, 134, 11, 0.08)",
      glassBtnBorder: "rgba(184, 134, 11, 0.4)",
      glassBtnText: "#1b3b2b",
      glassBtnShadow: "rgba(184, 134, 11, 0.2)",
      frameBorderTheme: "double-gilded"
    }
  }
];

const INITIAL_USERS = [
  { id: "user-admin", username: "dsenviteadmin", password: "dsenvite1006", displayName: "Administrator", role: "admin" },
  { id: "user-customer", username: "customer", password: "customer123", displayName: "Suman & Vishal", role: "customer" }
];

const INITIAL_INVITATIONS = [
  {
  "config": {
    "accentGold": "rgba(184, 146, 84, 1)",
    "autoPlayMusic": true,
    "bgShapesCount": 27,
    "bgShapesOpacity": 0.12,
    "bgShapesSize": 0.7,
    "bgShapesType": "none",
    "bodyFontClass": "font-serif",
    "brideFamily": "Mr. Nagina Paswan & Mrs. Gyanti Devi",
    "brideName": "Suman",
    "ceremonies": [
      {
        "category": "haldi",
        "clipartId": "haldi-bowl",
        "customImageUrl": "",
        "date": "2026-11-21",
        "description": "A joyful morning of turmeric rituals, holy blessings, and laughter.",
        "id": "ceremony-haldi",
        "order": 0,
        "showClipart": true,
        "showTime": true,
        "time": "10:00 AM",
        "title": "Subh Haldi",
        "venueAddress": "The Starlight Cathedral, Glass Valley, CA",
        "venueName": "Chinakuri",
        "venueUrl": "https://maps.app.goo.gl/MuQ3oPGNM3GztD447",
        "visible": true
      },
      {
        "category": "mehendi",
        "clipartId": "mehendi-cone",
        "date": "2026-11-22",
        "description": "Intricate henna adornments, traditional folk tunes, and celebrations.",
        "id": "ceremony-mehendi",
        "order": 1,
        "showClipart": true,
        "showTime": true,
        "time": "04:00 PM",
        "title": "Mehandi Ceremony",
        "venueAddress": "100 Seraphim Way, Glass Valley, CA",
        "venueName": "Chinakuri ",
        "venueUrl": "https://maps.app.goo.gl/MuQ3oPGNM3GztD447",
        "visible": true
      },
      {
        "category": "sangeet",
        "clipartId": "wedding-arch",
        "customImageUrl": "",
        "date": "2026-11-23",
        "description": "A blissful evening hai Narayan katha or Devpujan.",
        "id": "ceremony-sangeet",
        "order": 2,
        "showClipart": true,
        "showTime": true,
        "time": "07:00 PM",
        "title": "Narayan Katha",
        "venueAddress": "The Gilded Glass Greenhouse, CA",
        "venueName": "Chinakuri ",
        "venueUrl": "https://maps.app.goo.gl/MuQ3oPGNM3GztD447",
        "visible": true
      },
      {
        "category": "wedding",
        "clipartId": "wedding-mandap",
        "date": "2026-11-24",
        "description": "The sacred phere, wedding vows, and eternal union of two souls.",
        "id": "ceremony-wedding",
        "order": 3,
        "showClipart": true,
        "showTime": true,
        "time": "07:00 PM",
        "title": "Subh Vivaah",
        "venueAddress": "The Starlight Cathedral Grounds, CA",
        "venueName": "Snehalata Marrieage Hall",
        "venueUrl": "https://maps.app.goo.gl/8r1eTfdEMwWu2uS58",
        "visible": true
      },
      {
        "category": "reception",
        "clipartId": "reception-plates",
        "date": "2026-11-29",
        "description": "A formal dinner reception to celebrate the newlyweds with family and friends.",
        "id": "ceremony-reception",
        "order": 4,
        "showClipart": true,
        "showTime": true,
        "time": "06:30 PM",
        "title": "Reception",
        "venueAddress": "450 Conservatory Road, Glass Valley, CA",
        "venueName": "Delight Marriage Hall",
        "venueUrl": "https://maps.app.goo.gl/xuAshA4dUf532ZNS8",
        "visible": true
      },
      {
        "category": "reception",
        "clipartId": "reception-champagne",
        "date": "2026-12-06",
        "description": "An intimate gathering and blessing evening for close family.",
        "id": "ceremony-extra-reception",
        "order": 5,
        "showClipart": true,
        "showTime": true,
        "time": "06:30 PM",
        "title": "Additional Reception",
        "venueAddress": "Glass Valley Heritage Estate, CA",
        "venueName": "Singari Devi Bhavan, Fakira Chhapra",
        "venueUrl": "https://maps.app.goo.gl/RcMVB5RnQ8AemrmRA",
        "visible": true
      }
    ],
    "coverAmpersandColor": "#b89254",
    "coverAmpersandFont": "font-cursive",
    "coverAmpersandSize": "text-3xl sm:text-5xl",
    "coverAmpersandText": "&",
    "coverAmpersandTextSize": "text-2xl",
    "coverBgOverlayEnd": "rgba(177, 174, 170, 0.35)",
    "coverBgOverlayStart": "rgba(209, 77, 21, 0.16)",
    "coverBorderColor": "#b89254",
    "coverBorderEnabled": false,
    "coverBorderOpacity": 1,
    "coverBorderSize": 2,
    "coverBottomTaglineBg": "rgba(253, 251, 247, 0.7)",
    "coverBottomTaglineColor": "#8a2b3f",
    "coverBottomTaglineFont": "font-sans",
    "coverBottomTaglineSize": "text-[9px] sm:text-xs",
    "coverBottomTaglineText": "✦ A Sacred Promise of Eternal Love • Uncover Our Secret Date Below ✦",
    "coverBrideColor": "#8a2b3f",
    "coverBrideFont": "font-serif",
    "coverBrideSize": "text-4xl sm:text-6xl md:text-7xl",
    "coverBrideText": "Suman",
    "coverBrideTextFont": "font-cinzel-dec",
    "coverCornerSize": 32,
    "coverGroomColor": "#8a2b3f",
    "coverGroomFont": "font-serif",
    "coverGroomSize": "text-4xl sm:text-6xl md:text-7xl",
    "coverGroomText": "Vishal",
    "coverGroomTextFont": "font-cinzel-dec",
    "coverInnerBorderColor": "rgba(184, 146, 84, 0.15)",
    "coverInnerBorderEnabled": true,
    "coverQuoteColor": "#4a4a4a",
    "coverQuoteFont": "font-cursive",
    "coverQuoteSize": "text-base sm:text-xl",
    "coverQuoteTextColor": "rgba(153, 121, 70, 1)",
    "coverRevealBtnFont": "font-sans",
    "coverRevealBtnSize": "text-[10px]",
    "coverRevealBtnText": "Reveal Secret Save the Date",
    "coverSubheadingColor": "#4a4a4a",
    "coverSubheadingFont": "font-serif",
    "coverSubheadingItalic": true,
    "coverSubheadingSize": "text-xl sm:text-2xl",
    "coverSubheadingText": "The Beginning of Forever for",
    "coverSubheadingTextColor": "rgba(143, 68, 21, 1)",
    "coverSubheadingTextFont": "",
    "coverSubheadingTextSize": "text-xs",
    "coverTopTaglineColor": "#8a2b3f",
    "coverTopTaglineFont": "font-sans",
    "coverTopTaglineSize": "text-[10px] sm:text-xs",
    "coverTopTaglineSpacing": "tracking-[0.3em]",
    "coverTopTaglineText": "By the decree of love and destiny",
    "cursiveFontClass": "font-cursive",
    "customSacredSymbol": "",
    "customSacredSymbolImg": "https://lh3.googleusercontent.com/d/1c6s4GwrdBbCSmx4tK6ci4km7A4pVKTi-",
    "customSacredSymbolImgBlendMode": "normal",
    "customSacredSymbolImgOpacity": 1,
    "customSacredSymbolImgRotate": 0,
    "customSacredSymbolImgScale": 1.25,
    "customSacredSymbolImgShadowBlur": 8,
    "customSacredSymbolImgShadowColor": "rgba(0, 0, 0, 0.4)",
    "customSacredSymbolImgShadowX": 0,
    "customSacredSymbolImgShadowY": 3,
    "customSacredSymbolImgSizePx": 70,
    "customSacredSymbolImgTintColor": "",
    "customSacredSymbolImgX": 0,
    "customSacredSymbolImgY": 12,
    "customSacredVerse": "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥",
    "customSacredVerseColor": "rgba(253, 251, 247, 1)",
    "customSacredVerseFont": "font-cinzel-dec",
    "customSacredVerseOpacity": 0.8,
    "envelopeAspectRatio": "auto",
    "envelopeBgColor": "#5a0e1c",
    "envelopeBgImage": "",
    "envelopeBtnColor": "rgba(184, 146, 84, 0.98)",
    "envelopeBtnDesign": "classic",
    "envelopeBtnFont": "font-sans",
    "envelopeBtnSize": "text-xs",
    "envelopeBtnText": "Open Invitation",
    "envelopeCurtainsImg": "/real_velvet_curtains.jpg",
    "envelopeDoorsImg": "/real_palace_doors.jpg",
    "envelopeFlapBgEnd": "rgba(90, 14, 28, 0.9)",
    "envelopeFlapBgStart": "rgba(184, 146, 84, 0.25)",
    "envelopeFlapShape": "curved-scoop",
    "envelopeInitials": "S & V",
    "envelopeInitialsColor": "",
    "envelopeInitialsFont": "font-cursive",
    "envelopeInitialsSize": "text-3xl",
    "envelopeInitialsYOffset": -20,
    "envelopeInviteLabelColor": "rgba(184, 146, 84, 0.37)",
    "envelopeInviteLabelFont": "font-sans",
    "envelopeInviteLabelSize": "text-[10px]",
    "envelopeInviteLabelText": "INVITED YOU FOR BLESSINGS AND GRATITUDE",
    "envelopeInviteLabelTextYOffset": 3,
    "envelopeLeafImg": "/real_autumn_leaf.jpg",
    "envelopeMaxWidth": 740,
    "envelopeNamesColor": "",
    "envelopeNamesFont": "font-cinzel",
    "envelopeNamesSize": "text-xl",
    "envelopeNamesText": "Suman & Vishal",
    "envelopeNamesTextYOffset": 5,
    "envelopeOpeningStyle": "classic-envelope",
    "envelopePaperOpacity": 0.85,
    "envelopePaperTexture": "/real_paper_texture.jpg",
    "envelopeParticleType": "sparkles",
    "envelopeParticles": 35,
    "envelopePetalImg": "/real_rose_petal.jpg",
    "envelopeSealColor": "#c89f4b",
    "envelopeSealShape": "organic",
    "envelopeSealSizePx": 104,
    "envelopeSealTop": 47,
    "envelopeSealType": "rings",
    "envelopeSizingMode": "classic-rectangle",
    "envelopeSpeed": "0.9",
    "envelopeSymbolBlendMode": "normal",
    "envelopeSymbolColor": "",
    "envelopeSymbolFont": "font-yatra",
    "envelopeSymbolImg": "",
    "envelopeSymbolOpacity": 1,
    "envelopeSymbolRotate": 0,
    "envelopeSymbolScale": 1,
    "envelopeSymbolShadowBlur": 8,
    "envelopeSymbolShadowColor": "rgba(0, 0, 0, 0.5)",
    "envelopeSymbolShadowX": 0,
    "envelopeSymbolShadowY": 4,
    "envelopeSymbolSize": "text-3xl",
    "envelopeSymbolSizePx": 48,
    "envelopeSymbolText": "ॐ",
    "envelopeSymbolTextYOffset": 8,
    "envelopeSymbolTintColor": "",
    "envelopeSymbolType": "text",
    "envelopeSymbolX": 0,
    "envelopeSymbolY": 0,
    "envelopeTagline": "WEDDING OF",
    "envelopeTaglineColor": "rgba(184, 146, 84, 0.77)",
    "envelopeTaglineFont": "font-sans",
    "envelopeTaglineSize": "text-[9px]",
    "envelopeTaglineYOffset": 7,
    "envelopeWaxSealImg": "/real_wax_seal_gold.jpg",
    "frameBorderTheme": "double-gilded",
    "frameShape": "oval",
    "galleryCaption1": "",
    "galleryCaption2": "",
    "galleryCaption3": "",
    "galleryCaption4": "",
    "galleryCaption5": "",
    "galleryCaption6": "",
    "galleryFrameBorder1": "double-gilded",
    "galleryFrameBorder2": "double-gilded",
    "galleryFrameBorder3": "double-gilded",
    "galleryFrameBorder4": "double-gilded",
    "galleryFrameBorder5": "double-gilded",
    "galleryFrameBorder6": "double-gilded",
    "galleryFrameShape1": "portrait",
    "galleryFrameShape2": "portrait",
    "galleryFrameShape3": "portrait",
    "galleryFrameShape4": "portrait",
    "galleryFrameShape5": "portrait",
    "galleryFrameShape6": "portrait",
    "galleryImage1": "",
    "galleryImage2": "",
    "galleryImage3": "",
    "galleryImage4": "https://lh3.googleusercontent.com/d/1ykpf7aFVNXStbIkk4xIyZGkUpokkqvPd",
    "galleryImage5": "",
    "galleryImage6": "",
    "gallerySubtitle": "Our Love in Frames",
    "galleryTitle": "Our Captured Moments",
    "glassBtnBg": "rgba(138, 43, 63, 0.08)",
    "glassBtnBorder": "rgba(184, 146, 84, 0.4)",
    "glassBtnShadow": "rgba(184, 146, 84, 0.15)",
    "glassBtnShadowSize": "16",
    "glassBtnText": "#8a2b3f",
    "globalBorderFit": "contain",
    "globalBorderImage": "",
    "globalBorderInset": 0,
    "globalBorderOpacity": 1,
    "globalBorderRepeat": "round",
    "globalBorderScrollMode": "fixed",
    "globalBorderSlice": 48,
    "globalBorderWidth": 28,
    "groomFamily": "Mr. Ram Naresh Pd. Gupta & Mrs. Sonmati Devi",
    "groomName": "Vishal",
    "headerFontClass": "font-serif",
    "heroImage": "https://lh3.googleusercontent.com/d/1brJdMaSjflXO8OeJ6cAzVj5cklst48jr",
    "heroTitleAlign": "text-center",
    "heroTitleFont": "font-serif",
    "heroTitleSize": "text-4xl sm:text-6xl md:text-7xl",
    "introQuote": "Celebrating love, togetherness and everlasting happiness.",
    "isPaid": true,
    "lightBgColor": "rgba(253, 251, 247, 0.93)",
    "loopMusic": true,
    "mainMusicEnabled": true,
    "musicArtist": "Custom Upload",
    "musicTitle": "Manglashake",
    "musicUrl": "https://drive.google.com/uc?export=download&id=1kv2KpmoK76DwvC7RcSDA79UE_ihSH2lJ",
    "musicVolume": 0.8,
    "primaryColor": "rgba(74, 28, 44, 1)",
    "receptionAddress": "Chinakuri Bazaar, WB",
    "receptionDate": "2026-11-29",
    "receptionMapUrl": "https://maps.app.goo.gl/dfYzXxKh276PELCd6",
    "receptionVenue": "Delight Marriage Hall",
    "religionKey": "secular",
    "revealColor": "rgba(80, 33, 67, 1)",
    "revealEffect": "scratch",
    "revealSpeed": "2.4",
    "rsvpTitleAlign": "text-center",
    "rsvpTitleFont": "font-serif",
    "rsvpTitleSize": "text-2xl sm:text-3xl",
    "sacredShadowColor": "rgba(0, 0, 0, 0.38)",
    "sacredSymbolColor": "#8a2b3f",
    "sacredVerseColor": "#4a4a4a",
    "scratchCardBorder": "rgba(245, 158, 11, 0.44)",
    "scratchCardGlow": "rgba(225, 29, 72, 0.18)",
    "scratchDateText": "2026-11-24",
    "scratchImage": "",
    "scratchImageOpacity": 1,
    "scratchImageOverlayEnd": "rgba(255, 255, 255, 0.57)",
    "scratchImageScale": 100,
    "scratchImageXOffset": 50,
    "scratchImageYOffset": 50,
    "scratchSecretMessage": "Consider this your official clearance to witness our favorite secret: we really are doing this forever",
    "scratchSectionBgImage": "https://lh3.googleusercontent.com/d/1AghNIqFPeKW3Imvb8D-_6KNJnF1jWVeR",
    "scratchSectionBgImageOverlayEnd": "rgba(5, 7, 13, 0.54)",
    "scratchSectionBgImageOverlayStart": "rgba(5, 7, 13, 0.6)",
    "scratchSectionBgImageScale": 70,
    "scroll3DEnabled": true,
    "scroll3DIntensity": 4,
    "scroll3DPerspective": 900,
    "showCeremonyCardBorder": false,
    "showCoverBottomTagline": false,
    "showDetailsCardBorder": true,
    "showEnvelopeFolds": true,
    "showEnvelopePaperTexture": true,
    "showGallery": true,
    "showGlobalBorder": false,
    "showGroomDetails": true,
    "showIconBorder": false,
    "showMusicWidget": true,
    "showSacredSymbol": true,
    "showScratchCard": true,
    "showTimelineAllCliparts": true,
    "showTimelineCards": true,
    "showTimelineDateTime": true,
    "showTimelineDescriptions": true,
    "showTimelineHeading": true,
    "showTimelineLine": true,
    "showTimelineOrnaments": true,
    "showTimelineOuterFrame": false,
    "showTimelineSection": true,
    "showTimelineSubtitle": true,
    "showTimelineTime": true,
    "showTimelineVenue": true,
    "startingMusicArtist": "Custom Intro",
    "startingMusicEnabled": true,
    "startingMusicLoop": true,
    "startingMusicTitle": "Vakratunda-Mahakaya-Ganesh-Mantr",
    "startingMusicUrl": "https://drive.google.com/uc?export=download&id=1ScEGe8HiEjdTdhbYh2R_6rTJMjHfsNu6",
    "startingMusicVolume": 0.8,
    "storyBrideFamily": "Mr. Nagina Paswan & Mrs. Gyanti Devi",
    "storyBrideNameFont": "font-cinzel-dec",
    "storyBrideParentLabel": "D/O",
    "storyBrideTitle": "The Beautiful Bride",
    "storyFrameBorderTheme": "pearls",
    "storyFrameShape": "portrait",
    "storyGroomFamily": "Mr. Ram Naresh Pd. Gupta & Mrs. Sonmati Devi",
    "storyGroomFamilySize": "text-xs",
    "storyGroomNameFont": "font-cinzel-dec",
    "storyGroomParentLabel": "S/o",
    "storyGroomTitle": "The Noble Groom",
    "storyImage": "https://lh3.googleusercontent.com/d/1fQyJTqmjFZGbNWljlzcC2qc_m3ryFLdK",
    "storyParagraph": "Through years of relentless hustle, shared sacrifices, and a deep, unwavering respect for each other’s dreams, we turned a high school romance into a lifelong partnership. Today, we stand ready to marry not just because we fell in love, but because we never stopped honoring the person by our side.",
    "storyParagraphSize": "text-xs",
    "storyPathTitle": "Our Path of Serendipity",
    "storySubtitle": "MEET THE FAMILIES",
    "storyTextAlign": "text-left",
    "storyTextSize": "text-xs sm:text-sm",
    "storyTitle": "Vows of Two Dynasties",
    "storyTitleAlign": "text-left",
    "storyTitleFont": "font-serif",
    "storyTitleSize": "text-3xl sm:text-4xl",
    "timelineCardBg": "#fffcf9",
    "timelineCardBorder": "rgba(205, 164, 82, 0.45)",
    "timelineCardCornerRadius": 28,
    "timelineCardPadding": 16,
    "timelineCardShadow": "0 8px 24px -6px rgba(120, 20, 40, 0.08), 0 2px 6px -1px rgba(205, 164, 82, 0.15)",
    "timelineCardShape": "pill",
    "timelineClipartBorder": "#cda452",
    "timelineClipartSize": 46,
    "timelineDateColor": "#755d52",
    "timelineDensity": "spacious",
    "timelineHeading": "Wedding Ceremony",
    "timelineHeadingColor": "#bfbfbf",
    "timelineHeadingFont": "font-serif",
    "timelineLayout": "alternating",
    "timelineLineColor": "#cda452",
    "timelineMobileLayout": "alternating",
    "timelineNodeColor": "#781428",
    "timelineNodeSize": 14,
    "timelineSortMode": "chronological",
    "timelineSubtitle": "Timeline",
    "timelineSubtitleColor": "#c28b2a",
    "timelineSubtitleFont": "font-cursive",
    "timelineTextColor": "#44342d",
    "timelineTitleColor": "#c27100",
    "timelineTitleFont": "font-serif",
    "timelineTitleSize": "large",
    "timelineVenueColor": "#755d52",
    "venueCardBgColor": "rgba(0, 0, 0, 0.18)",
    "venueCardTextColor": "rgba(253, 251, 247, 0.75)",
    "venueCeremonyFrameBorderTheme": "minimalist",
    "venueCeremonyFrameShape": "landscape",
    "venueCeremonyImage": "",
    "venueReceptionFrameBorderTheme": "minimalist",
    "venueReceptionFrameShape": "landscape",
    "venueReceptionImage": "",
    "venueShadowEnabled": true,
    "venueTitleAlign": "text-center",
    "venueTitleFont": "font-serif",
    "venueTitleSize": "text-2xl sm:text-3xl",
    "weddingAddress": "Neamatpur, WB",
    "weddingDate": "2026-11-24T19:00",
    "weddingMapUrl": "https://maps.app.goo.gl/8r1eTfdEMwWu2uS58",
    "weddingVenue": "Snehalata Marriage Hall",
    "wishTitleAlign": "text-center",
    "wishTitleFont": "font-serif",
    "wishTitleSize": "text-2xl sm:text-3xl"
  },
  "createdAt": "2026-10-20T01:53:10.490Z",
  "customSlug": "suman-vishal",
  "driveStorage": {
    "folderName": "Suman & Vishal (Snehalata Marriage Hall, Neamatpur, WB)",
    "folderUrl": "https://drive.google.com/drive/folders/1_pdrNFiXcOymZQEby52O3FbvImCU_SW8?usp=sharing",
    "lastSyncedAt": "2026-10-20T01:53:10.490Z",
    "rootFolderId": "1_pdrNFiXcOymZQEby52O3FbvImCU_SW8",
    "rootFolderUrl": "https://drive.google.com/drive/folders/1_pdrNFiXcOymZQEby52O3FbvImCU_SW8?usp=sharing",
    "status": "synced"
  },
  "id": "invite-1792299417819",
  "isCustomSlugManuallySet": true,
  "isPaid": true,
  "shareText": "We are thrilled to invite you to our wedding celebration! View our digital invitation here: {url} - Suman & Vishal",
  "slug": "suman-vishal",
  "status": "published",
  "title": "Suman & Vishal's Wedding Invitation",
  "updatedAt": "2026-10-20T01:53:10.490Z",
  "customerId": "user-customer"
},
  {
    id: "invite-demo",
    customerId: "user-customer",
    title: "Ananya & Aarav's Wedding",
    config: {
      ...DEFAULT_CONFIG,
      brideName: "Ananya",
      groomName: "Aarav",
      presetId: "preset-classic"
    },
    rsvps: [
      { name: "Sophia & Daniel", attending: "yes", count: 2, note: "We wouldn't miss it for the world! Truly excited for you both." },
      { name: "Julian Vance", attending: "yes", count: 1, note: "Can't wait to welcome Ananya to our beautiful family!" }
    ],
    wishes: [
      { sender: "Eleanor Sterling", message: "To my darling daughter and new son, may your love grow richer with each changing season.", date: "Just now" },
      { sender: "Marcus Sterling (Brother)", message: "Aarav, you are officially the best addition to our lives. Treat her right! Wishing you decades of joy.", date: "1 hour ago" }
    ],
    isPaid: false,
    shareText: "We are thrilled to invite you to our wedding celebration! View our digital invitation here: {url} - Ananya & Aarav",
    status: "preview",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_BRAND_SETTINGS = {
  logoUrl: "",
  brandName: "DS ENVITES",
  logoShape: "circle",
  logoScale: 1.0,
  logoX: 0,
  logoY: 0,
  appBgColor: "#FFF9F2",
  appBgGradient: "",
  appBgOverlayUrl: "",
  appBgOverlayOpacity: 0.35,
  appBgOverlayRepeat: "repeat",
  appBgOverlayBlendMode: "normal",
  appButtonStyle: "gold-gradient"
};

// Helper to normalize Firebase object/array structures safely
function parseArrayData(data, fallbackIfNull = []) {
  if (data === null || data === undefined) return fallbackIfNull;
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') return Object.values(data);
  return fallbackIfNull;
}

// Helper to save DB state to Firebase Realtime Database
function saveToFirebase(db) {
  if (typeof window === "undefined") return;
  try {
    const dbRef = ref(database, "saas_data");
    set(dbRef, db).catch(err => console.error("Firebase save failed:", err));
  } catch (e) {
    console.error("Firebase save connection error:", e);
  }
}

// Helper to auto-purge expired archive items - disabled so invitations are never deleted automatically
function autoPurgeExpiredArchive(db) {
  // Never delete saved invitations or archive items automatically; only admin can delete manually
  return false;
}

// Subscribe to real-time updates from Firebase
if (typeof window !== "undefined") {
  try {
    const dbRef = ref(database, "saas_data");
    // Initial fetch to load before listener or run on startup
    get(dbRef).then((snapshot) => {
      if (snapshot.exists()) {
        const cloudDb = snapshot.val();
        dbCache = cloudDb;
        const isInit = cloudDb.initialized || localStorage.getItem("db_initialized") === "true";
        const deletedBgPresetIds = parseArrayData(cloudDb.deletedBgPresetIds, parseArrayData(JSON.parse(localStorage.getItem("db_deleted_bg_presets") || "[]"), []));
        const deletedEnvelopePresetIds = parseArrayData(cloudDb.deletedEnvelopePresetIds, parseArrayData(JSON.parse(localStorage.getItem("db_deleted_envelope_presets") || "[]"), []));
        const deletedPresetIds = parseArrayData(cloudDb.deletedPresetIds, parseArrayData(JSON.parse(localStorage.getItem("db_deleted_presets") || "[]"), []));

        const users = cloudDb.users !== undefined ? parseArrayData(cloudDb.users, []) : (isInit ? [] : INITIAL_USERS);
        // Sync admin credentials from INITIAL_USERS
        INITIAL_USERS.filter(u => u.role === 'admin').forEach(initialAdmin => {
          const idx = users.findIndex(u => u.id === initialAdmin.id);
          if (idx !== -1) { users[idx].username = initialAdmin.username; users[idx].password = initialAdmin.password; }
          else { users.push({ ...initialAdmin }); }
        });
        const invitations = cloudDb.invitations !== undefined ? parseArrayData(cloudDb.invitations, []) : (isInit ? [] : INITIAL_INVITATIONS);
        const presets = (cloudDb.presets !== undefined ? parseArrayData(cloudDb.presets, []) : (isInit ? [] : INITIAL_PRESETS)).filter(p => !deletedPresetIds.includes(p.id));
        const bgPresets = (cloudDb.bgPresets !== undefined ? parseArrayData(cloudDb.bgPresets, []) : (isInit ? [] : INITIAL_BG_PRESETS)).filter(p => !deletedBgPresetIds.includes(p.id));
        const envelopePresets = (cloudDb.envelopePresets !== undefined ? parseArrayData(cloudDb.envelopePresets, []) : (isInit ? [] : INITIAL_ENVELOPE_PRESETS)).filter(p => !deletedEnvelopePresetIds.includes(p.id));
        const envelopeTextures = cloudDb.envelopeTextures !== undefined ? parseArrayData(cloudDb.envelopeTextures, []) : [];
        const musicPresets = cloudDb.musicPresets !== undefined ? parseArrayData(cloudDb.musicPresets, []) : (isInit ? [] : CURATED_MUSIC_PRESETS);
        const orders = parseArrayData(cloudDb.orders, []);
        const notifications = parseArrayData(cloudDb.notifications, []);
        const archive = parseArrayData(cloudDb.archive, []);
        const brandSettings = cloudDb.brandSettings || DEFAULT_BRAND_SETTINGS;

        localStorage.setItem("db_users", JSON.stringify(users));
        localStorage.setItem("db_invitations", JSON.stringify(invitations));
        localStorage.setItem("db_presets", JSON.stringify(presets));
        localStorage.setItem("db_bg_presets", JSON.stringify(bgPresets));
        localStorage.setItem("db_envelope_presets", JSON.stringify(envelopePresets));
        localStorage.setItem("db_envelope_textures", JSON.stringify(envelopeTextures));
        localStorage.setItem("db_music_presets", JSON.stringify(musicPresets));
        localStorage.setItem("db_orders", JSON.stringify(orders));
        localStorage.setItem("db_notifications", JSON.stringify(notifications));
        localStorage.setItem("db_archive", JSON.stringify(archive));
        localStorage.setItem("db_brand_settings", JSON.stringify(brandSettings));
        localStorage.setItem("db_deleted_bg_presets", JSON.stringify(deletedBgPresetIds));
        localStorage.setItem("db_deleted_envelope_presets", JSON.stringify(deletedEnvelopePresetIds));
        localStorage.setItem("db_deleted_presets", JSON.stringify(deletedPresetIds));
        localStorage.setItem("db_initialized", "true");
        isFirebaseSynced = true;
        
        // Dispatch custom event to notify React components that DB is loaded/synced
        window.dispatchEvent(new Event("db_synced"));
      } else {
        // If database is empty, seed it with initial local data
        const initialDb = {
          initialized: true,
          users: INITIAL_USERS,
          invitations: INITIAL_INVITATIONS,
          presets: INITIAL_PRESETS,
          bgPresets: INITIAL_BG_PRESETS,
          envelopePresets: INITIAL_ENVELOPE_PRESETS,
          envelopeTextures: [],
          musicPresets: CURATED_MUSIC_PRESETS,
          orders: [],
          notifications: [],
          archive: [],
          brandSettings: DEFAULT_BRAND_SETTINGS
        };
        set(dbRef, initialDb).then(() => {
          isFirebaseSynced = true;
        });
      }
    }).catch(err => {
      console.warn("Could not retrieve initial database from Firebase. Falling back to local storage:", err);
    });

    // Real-time updates subscription
    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const cloudDb = snapshot.val();
        dbCache = cloudDb;
        const isInit = cloudDb.initialized || localStorage.getItem("db_initialized") === "true";
        const deletedBgPresetIds = parseArrayData(cloudDb.deletedBgPresetIds, parseArrayData(JSON.parse(localStorage.getItem("db_deleted_bg_presets") || "[]"), []));
        const deletedEnvelopePresetIds = parseArrayData(cloudDb.deletedEnvelopePresetIds, parseArrayData(JSON.parse(localStorage.getItem("db_deleted_envelope_presets") || "[]"), []));
        const deletedPresetIds = parseArrayData(cloudDb.deletedPresetIds, parseArrayData(JSON.parse(localStorage.getItem("db_deleted_presets") || "[]"), []));

        const users = cloudDb.users !== undefined ? parseArrayData(cloudDb.users, []) : (isInit ? [] : INITIAL_USERS);
        // Sync admin credentials from INITIAL_USERS
        INITIAL_USERS.filter(u => u.role === 'admin').forEach(initialAdmin => {
          const idx = users.findIndex(u => u.id === initialAdmin.id);
          if (idx !== -1) { users[idx].username = initialAdmin.username; users[idx].password = initialAdmin.password; }
          else { users.push({ ...initialAdmin }); }
        });
        const invitations = cloudDb.invitations !== undefined ? parseArrayData(cloudDb.invitations, []) : (isInit ? [] : INITIAL_INVITATIONS);
        const presets = (cloudDb.presets !== undefined ? parseArrayData(cloudDb.presets, []) : (isInit ? [] : INITIAL_PRESETS)).filter(p => !deletedPresetIds.includes(p.id));
        const bgPresets = (cloudDb.bgPresets !== undefined ? parseArrayData(cloudDb.bgPresets, []) : (isInit ? [] : INITIAL_BG_PRESETS)).filter(p => !deletedBgPresetIds.includes(p.id));
        const envelopePresets = (cloudDb.envelopePresets !== undefined ? parseArrayData(cloudDb.envelopePresets, []) : (isInit ? [] : INITIAL_ENVELOPE_PRESETS)).filter(p => !deletedEnvelopePresetIds.includes(p.id));
        const envelopeTextures = cloudDb.envelopeTextures !== undefined ? parseArrayData(cloudDb.envelopeTextures, []) : [];
        const musicPresets = cloudDb.musicPresets !== undefined ? parseArrayData(cloudDb.musicPresets, []) : (isInit ? [] : CURATED_MUSIC_PRESETS);
        const orders = parseArrayData(cloudDb.orders, []);
        const notifications = parseArrayData(cloudDb.notifications, []);
        const archive = parseArrayData(cloudDb.archive, []);
        const brandSettings = cloudDb.brandSettings || DEFAULT_BRAND_SETTINGS;

        localStorage.setItem("db_users", JSON.stringify(users));
        localStorage.setItem("db_invitations", JSON.stringify(invitations));
        localStorage.setItem("db_presets", JSON.stringify(presets));
        localStorage.setItem("db_bg_presets", JSON.stringify(bgPresets));
        localStorage.setItem("db_envelope_presets", JSON.stringify(envelopePresets));
        localStorage.setItem("db_envelope_textures", JSON.stringify(envelopeTextures));
        localStorage.setItem("db_music_presets", JSON.stringify(musicPresets));
        localStorage.setItem("db_orders", JSON.stringify(orders));
        localStorage.setItem("db_notifications", JSON.stringify(notifications));
        localStorage.setItem("db_archive", JSON.stringify(archive));
        localStorage.setItem("db_brand_settings", JSON.stringify(brandSettings));
        localStorage.setItem("db_deleted_bg_presets", JSON.stringify(deletedBgPresetIds));
        localStorage.setItem("db_deleted_envelope_presets", JSON.stringify(deletedEnvelopePresetIds));
        localStorage.setItem("db_deleted_presets", JSON.stringify(deletedPresetIds));
        localStorage.setItem("db_initialized", "true");
        window.dispatchEvent(new Event("db_synced"));
      }
    });
  } catch (err) {
    console.error("Failed to initialize Firebase database listeners:", err);
  }
}

// Helper to load or initialize database
function getDb() {
  if (typeof window === "undefined" || !window.localStorage) {
    return {
      users: INITIAL_USERS,
      invitations: INITIAL_INVITATIONS,
      presets: INITIAL_PRESETS,
      bgPresets: INITIAL_BG_PRESETS,
      envelopePresets: INITIAL_ENVELOPE_PRESETS,
      envelopeTextures: [],
      musicPresets: CURATED_MUSIC_PRESETS,
      orders: [],
      notifications: [],
      archive: [],
      brandSettings: DEFAULT_BRAND_SETTINGS
    };
  }

  let db = dbCache;
  if (!db) {
    const isOldDb = localStorage.getItem("db_version") !== "v7";
    if (isOldDb) {
      localStorage.removeItem("db_presets");
      localStorage.removeItem("db_bg_presets");
      localStorage.removeItem("db_envelope_presets");
      localStorage.setItem("db_version", "v7");
    }

    const isInit = localStorage.getItem("db_initialized") === "true";
    const deletedBgPresetIds = parseArrayData(JSON.parse(localStorage.getItem("db_deleted_bg_presets") || "[]"), []);
    const deletedEnvelopePresetIds = parseArrayData(JSON.parse(localStorage.getItem("db_deleted_envelope_presets") || "[]"), []);
    const deletedPresetIds = parseArrayData(JSON.parse(localStorage.getItem("db_deleted_presets") || "[]"), []);

    const users = localStorage.getItem("db_users");
    const invitations = localStorage.getItem("db_invitations");
    const presets = localStorage.getItem("db_presets");
    const bgPresets = localStorage.getItem("db_bg_presets");
    const envelopePresets = localStorage.getItem("db_envelope_presets");
    const envelopeTextures = localStorage.getItem("db_envelope_textures");
    const musicPresets = localStorage.getItem("db_music_presets");
    const orders = localStorage.getItem("db_orders");
    const notifications = localStorage.getItem("db_notifications");
    const archive = localStorage.getItem("db_archive");
    const brandSettings = localStorage.getItem("db_brand_settings");

    db = {
      users: users !== null ? parseArrayData(JSON.parse(users), []) : (isInit ? [] : INITIAL_USERS),
      invitations: (invitations !== null ? parseArrayData(JSON.parse(invitations), []) : (isInit ? [] : INITIAL_INVITATIONS)).map(inv => {
        let cleanWishes = Array.isArray(inv.wishes) ? inv.wishes : [];
        const seenW = new Set();
        cleanWishes = cleanWishes.filter(w => {
          const k = (w.sender || "").trim().toLowerCase();
          if (!k || seenW.has(k)) return false;
          seenW.add(k);
          return true;
        });

        let cleanRsvps = Array.isArray(inv.rsvps) ? inv.rsvps : [];
        const seenR = new Set();
        cleanRsvps = cleanRsvps.filter(r => {
          const k = (r.name || "").trim().toLowerCase();
          if (!k || seenR.has(k)) return false;
          seenR.add(k);
          return true;
        });

        let updatedConfig = (inv.config?.scratchImage && typeof inv.config.scratchImage === 'string' && inv.config.scratchImage.includes('photo-1519225495810-7512c696505a'))
          ? { ...inv.config, scratchImage: "" }
          : { ...(inv.config || {}) };

        const brideName = updatedConfig.brideName || "Ananya";
        const groomName = updatedConfig.groomName || "Aarav";
        const defaultNameSlug = ((brideName && groomName) ? `${brideName}-${groomName}` : (inv.title || "wedding"))
          .toLowerCase()
          .replace(/&/g, "and")
          .replace(/['’]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const rawId = (inv.id || "").replace(/^invite-/, "");
        const isManuallySet = Boolean(inv.isCustomSlugManuallySet && inv.customSlug && !inv.customSlug.startsWith("ananya-aarav"));
        const dynamicSlug = `${defaultNameSlug}-${rawId || "invite"}`;
        const computedSlug = isManuallySet ? inv.customSlug : (inv.slug || dynamicSlug);

        return {
          ...inv,
          isCustomSlugManuallySet: isManuallySet,
          slug: computedSlug,
          customSlug: computedSlug,
          title: inv.title || `${brideName} & ${groomName}'s Wedding`,
          shareText: inv.shareText,
          wishes: cleanWishes,
          rsvps: cleanRsvps,
          config: updatedConfig
        };
      }),
      presets: (presets !== null ? parseArrayData(JSON.parse(presets), []) : (isInit ? [] : INITIAL_PRESETS)).filter(p => !deletedPresetIds.includes(p.id)),
      bgPresets: (bgPresets !== null ? parseArrayData(JSON.parse(bgPresets), []) : (isInit ? [] : INITIAL_BG_PRESETS)).filter(p => !deletedBgPresetIds.includes(p.id)),
      envelopePresets: (envelopePresets !== null ? parseArrayData(JSON.parse(envelopePresets), []) : (isInit ? [] : INITIAL_ENVELOPE_PRESETS)).filter(p => !deletedEnvelopePresetIds.includes(p.id)),
      envelopeTextures: envelopeTextures !== null ? parseArrayData(JSON.parse(envelopeTextures), []) : [],
      musicPresets: musicPresets !== null ? parseArrayData(JSON.parse(musicPresets), []) : (isInit ? [] : CURATED_MUSIC_PRESETS),
      orders: orders ? parseArrayData(JSON.parse(orders), []) : [],
      notifications: notifications ? parseArrayData(JSON.parse(notifications), []) : [],
      archive: archive ? parseArrayData(JSON.parse(archive), []) : [],
      brandSettings: brandSettings ? JSON.parse(brandSettings) : DEFAULT_BRAND_SETTINGS,
      deletedBgPresetIds,
      deletedEnvelopePresetIds,
      deletedPresetIds
    };
    dbCache = db;

    // Always sync admin user credentials from INITIAL_USERS so code changes take effect
    INITIAL_USERS.filter(u => u.role === 'admin').forEach(initialAdmin => {
      const idx = db.users.findIndex(u => u.id === initialAdmin.id);
      if (idx !== -1) {
        db.users[idx].username = initialAdmin.username;
        db.users[idx].password = initialAdmin.password;
      } else {
        db.users.push({ ...initialAdmin });
      }
    });
  }

  localStorage.setItem("db_initialized", "true");

  // Ensure default/fallback fields are always initialized
  if (!db.users || !Array.isArray(db.users)) db.users = parseArrayData(db.users, []);
  if (!db.invitations || !Array.isArray(db.invitations)) db.invitations = parseArrayData(db.invitations, []);
  if (!db.presets || !Array.isArray(db.presets)) db.presets = parseArrayData(db.presets, []);
  if (!db.bgPresets || !Array.isArray(db.bgPresets)) db.bgPresets = parseArrayData(db.bgPresets, []);
  if (!db.envelopePresets || !Array.isArray(db.envelopePresets)) db.envelopePresets = parseArrayData(db.envelopePresets, []);
  if (!db.envelopeTextures || !Array.isArray(db.envelopeTextures)) db.envelopeTextures = parseArrayData(db.envelopeTextures, []);
  if (!db.musicPresets || !Array.isArray(db.musicPresets)) db.musicPresets = parseArrayData(db.musicPresets, CURATED_MUSIC_PRESETS);
  if (!db.orders || !Array.isArray(db.orders)) db.orders = parseArrayData(db.orders, []);
  if (!db.notifications || !Array.isArray(db.notifications)) db.notifications = parseArrayData(db.notifications, []);
  if (!db.archive || !Array.isArray(db.archive)) db.archive = parseArrayData(db.archive, []);
  if (!db.brandSettings) db.brandSettings = DEFAULT_BRAND_SETTINGS;
  if (!db.deletedBgPresetIds || !Array.isArray(db.deletedBgPresetIds)) db.deletedBgPresetIds = [];
  if (!db.deletedEnvelopePresetIds || !Array.isArray(db.deletedEnvelopePresetIds)) db.deletedEnvelopePresetIds = [];
  if (!db.deletedPresetIds || !Array.isArray(db.deletedPresetIds)) db.deletedPresetIds = [];

  // Auto purge expired archive items (disabled to prevent automatic deletion)
  if (autoPurgeExpiredArchive(db)) {
    saveDb(db);
  }

  // Guarantee customer Suman & Vishal invitation is always present and completely hydrated with all ceremonies and details
  const primarySumanDef = INITIAL_INVITATIONS[0];
  const existingSumanIdx = db.invitations.findIndex(i => 
    i.id === "invite-1792299417819" || 
    i.id === "invite-1792423053258" || 
    (i.config && i.config.brideName === "Suman" && i.config.groomName === "Vishal")
  );
  if (existingSumanIdx === -1) {
    if (primarySumanDef) db.invitations.unshift(JSON.parse(JSON.stringify(primarySumanDef)));
  } else {
    // If ceremonies are missing or < 5, hydrate with the full details
    const curr = db.invitations[existingSumanIdx];
    if (!curr.config?.ceremonies || curr.config.ceremonies.length < 5 || !curr.config.weddingVenue || curr.config.weddingVenue.includes("Starlight")) {
      db.invitations[existingSumanIdx] = {
        ...JSON.parse(JSON.stringify(primarySumanDef)),
        id: curr.id,
        customerId: "user-customer",
        isPaid: true
      };
    }
  }

  return db;
}

function saveDb(db) {
  db.initialized = true;
  // Ensure we don't save undefined database keys
  if (!db.users || !Array.isArray(db.users)) db.users = parseArrayData(db.users, INITIAL_USERS);
  if (!db.invitations || !Array.isArray(db.invitations)) db.invitations = parseArrayData(db.invitations, INITIAL_INVITATIONS);
  if (!db.presets || !Array.isArray(db.presets)) db.presets = parseArrayData(db.presets, []);
  if (!db.bgPresets || !Array.isArray(db.bgPresets)) db.bgPresets = parseArrayData(db.bgPresets, []);
  if (!db.envelopePresets || !Array.isArray(db.envelopePresets)) db.envelopePresets = parseArrayData(db.envelopePresets, []);
  if (!db.envelopeTextures || !Array.isArray(db.envelopeTextures)) db.envelopeTextures = parseArrayData(db.envelopeTextures, []);
  if (!db.musicPresets || !Array.isArray(db.musicPresets)) db.musicPresets = parseArrayData(db.musicPresets, CURATED_MUSIC_PRESETS);
  if (!db.orders || !Array.isArray(db.orders)) db.orders = parseArrayData(db.orders, []);
  if (!db.notifications || !Array.isArray(db.notifications)) db.notifications = parseArrayData(db.notifications, []);
  if (!db.archive || !Array.isArray(db.archive)) db.archive = parseArrayData(db.archive, []);
  if (!db.brandSettings) db.brandSettings = DEFAULT_BRAND_SETTINGS;
  if (!db.deletedBgPresetIds || !Array.isArray(db.deletedBgPresetIds)) db.deletedBgPresetIds = [];
  if (!db.deletedEnvelopePresetIds || !Array.isArray(db.deletedEnvelopePresetIds)) db.deletedEnvelopePresetIds = [];
  if (!db.deletedPresetIds || !Array.isArray(db.deletedPresetIds)) db.deletedPresetIds = [];

  dbCache = db;
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem("db_users", JSON.stringify(db.users));
  localStorage.setItem("db_invitations", JSON.stringify(db.invitations));
  localStorage.setItem("db_presets", JSON.stringify(db.presets));
  localStorage.setItem("db_bg_presets", JSON.stringify(db.bgPresets));
  localStorage.setItem("db_envelope_presets", JSON.stringify(db.envelopePresets));
  localStorage.setItem("db_envelope_textures", JSON.stringify(db.envelopeTextures));
  localStorage.setItem("db_music_presets", JSON.stringify(db.musicPresets));
  localStorage.setItem("db_orders", JSON.stringify(db.orders));
  localStorage.setItem("db_notifications", JSON.stringify(db.notifications));
  localStorage.setItem("db_archive", JSON.stringify(db.archive));
  localStorage.setItem("db_brand_settings", JSON.stringify(db.brandSettings));
  localStorage.setItem("db_deleted_bg_presets", JSON.stringify(db.deletedBgPresetIds));
  localStorage.setItem("db_deleted_envelope_presets", JSON.stringify(db.deletedEnvelopePresetIds));
  localStorage.setItem("db_deleted_presets", JSON.stringify(db.deletedPresetIds));
  localStorage.setItem("db_initialized", "true");
  
  // Async save to Firebase Realtime Database
  saveToFirebase(db);
}

// ==========================================
// STORE API
// ==========================================

export const dbStore = {
  // --- ARCHIVE / RECYCLER SYSTEM (2-Day Expiry) ---
  getArchive() {
    const db = getDb();
    autoPurgeExpiredArchive(db);
    return db.archive || [];
  },
  archiveItem(itemType, item, title = "") {
    const db = getDb();
    if (!db.archive) db.archive = [];
    const archivedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + TWO_DAYS_MS).toISOString();
    
    const archiveRecord = {
      id: `archive-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      originalId: item.id,
      itemType, // 'preset', 'invitation', 'order', 'envelopePreset', 'musicPreset', 'bgPreset', 'user'
      title: title || item.title || item.name || item.displayName || item.id,
      data: JSON.parse(JSON.stringify(item)),
      archivedAt,
      expiresAt
    };

    db.archive.unshift(archiveRecord);
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return archiveRecord;
  },
  restoreArchivedItem(archiveId) {
    const db = getDb();
    if (!db.archive) return false;
    const recordIdx = db.archive.findIndex(a => a.id === archiveId);
    if (recordIdx === -1) return false;

    const record = db.archive[recordIdx];
    const item = record.data;
    if (!item) return false;

    switch (record.itemType) {
      case 'preset':
        if (!db.presets.some(p => p.id === item.id)) {
          db.presets.push(item);
        }
        break;
      case 'invitation':
        if (!db.invitations.some(i => i.id === item.id)) {
          db.invitations.push(item);
        }
        break;
      case 'order':
        if (!db.orders.some(o => o.id === item.id)) {
          db.orders.push(item);
        }
        break;
      case 'envelopePreset':
        if (!db.envelopePresets.some(ep => ep.id === item.id)) {
          db.envelopePresets.push(item);
        }
        break;
      case 'musicPreset':
        if (!db.musicPresets.some(mp => mp.id === item.id)) {
          db.musicPresets.push(item);
        }
        break;
      case 'bgPreset':
        if (!db.bgPresets.some(bg => bg.id === item.id)) {
          db.bgPresets.push(item);
        }
        break;
      case 'user':
        if (!db.users.some(u => u.id === item.id)) {
          db.users.push(item);
        }
        break;
      default:
        break;
    }

    db.archive.splice(recordIdx, 1);
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return true;
  },
  permanentlyDeleteArchivedItem(archiveId) {
    const db = getDb();
    if (!db.archive) return false;
    db.archive = db.archive.filter(a => a.id !== archiveId);
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return true;
  },
  clearArchive() {
    const db = getDb();
    db.archive = [];
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return true;
  },

  // --- USERS ---
  getUsers() {
    return getDb().users;
  },
  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  },
  getUserByUsername(username) {
    return this.getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
  },
  createUser(username, password, displayName, role = "customer") {
    const db = getDb();
    if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error("Username already exists");
    }
    const newUser = {
      id: `user-${Date.now()}`,
      username,
      password,
      displayName,
      role
    };
    db.users.push(newUser);
    saveDb(db);
    return newUser;
  },
  resetUserPassword(usernameOrEmail, newPassword) {
    const db = getDb();
    const user = db.users.find(u => 
      u.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
      (u.email && u.email.toLowerCase() === usernameOrEmail.toLowerCase())
    );
    if (!user) {
      throw new Error("No registered user found matching that username/email.");
    }
    user.password = newPassword;
    saveDb(db);
    return user;
  },
  deleteUser(id) {
    const db = getDb();
    const user = db.users.find(u => u.id === id);
    if (!user) return false;
    if (user.role === 'admin') {
      throw new Error("Admin account cannot be deleted.");
    }
    this.archiveItem('user', user, user.displayName || user.username || 'User Account');
    db.users = db.users.filter(u => u.id !== id);
    db.invitations = db.invitations.filter(inv => inv.customerId !== id);
    db.orders = db.orders.filter(o => o.customerId !== id);
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return true;
  },

  // --- INVITATIONS ---
  getInvitations() {
    return getDb().invitations;
  },
  getInvitationsByCustomer(customerId) {
    return this.getInvitations().filter(inv => inv.customerId === customerId);
  },
  slugify(text) {
    return (text || "")
      .toString()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },

  getInvitationShareSlug(invitation, configOverride = null) {
    if (!invitation) return "wedding-invitation";

    const cfg = configOverride || invitation.config || {};
    const bride = (cfg.brideName || "").trim();
    const groom = (cfg.groomName || "").trim();

    // Respect customSlug only if explicitly manually configured and not legacy default starter names
    const isManual = Boolean(
      invitation.isCustomSlugManuallySet &&
      invitation.customSlug &&
      typeof invitation.customSlug === "string" &&
      invitation.customSlug.trim() &&
      !invitation.customSlug.startsWith("ananya-aarav")
    );

    if (isManual) {
      return this.slugify(invitation.customSlug.trim());
    }
    const title = (invitation.title || "").trim();

    let namePart = "";
    if (bride && groom) {
      namePart = `${bride}-${groom}`;
    } else if (bride || groom) {
      namePart = bride || groom;
    } else if (title && !title.toLowerCase().includes("untitled")) {
      namePart = title.replace(/\bwedding\b/gi, "").replace(/\binvitation\b/gi, "").trim();
    } else if (invitation.customerId) {
      const user = this.getUserById(invitation.customerId);
      if (user?.displayName) {
        namePart = user.displayName;
      }
    }

    const cleanName = this.slugify(namePart) || "wedding";
    const rawId = (invitation.id || "").replace(/^invite-/, "");
    const uniqueSuffix = rawId || "invite";

    if (cleanName.endsWith(uniqueSuffix)) {
      return cleanName;
    }

    return `${cleanName}-${uniqueSuffix}`;
  },

  getInvitationById(idOrSlug) {
    if (!idOrSlug) return null;
    const invs = this.getInvitations();

    // 1. Direct match on id
    let found = invs.find(inv => inv.id === idOrSlug);
    if (found) return found;

    // 2. Direct match on customSlug or slug
    found = invs.find(inv => inv.slug === idOrSlug || inv.customSlug === idOrSlug);
    if (found) return found;

    // 3. Extract embedded numeric ID timestamp (e.g. 1791722047377)
    const numMatch = String(idOrSlug).match(/(\d{6,})/);
    if (numMatch) {
      const num = numMatch[1];
      found = invs.find(inv => 
        (inv.id && inv.id.includes(num)) || 
        (inv.slug && inv.slug.includes(num)) || 
        (inv.customSlug && inv.customSlug.includes(num))
      );
      if (found) return found;
    }

    // 4. Match stripped "invite-" prefix or suffix
    const stripped = String(idOrSlug).replace(/^invite-/, "");
    found = invs.find(inv => {
      const invStripped = (inv.id || "").replace(/^invite-/, "");
      return invStripped === stripped || String(idOrSlug).endsWith(invStripped) || (inv.slug && inv.slug.endsWith(stripped));
    });
    if (found) return found;

    // 5. Match by computed share slug
    found = invs.find(inv => this.getInvitationShareSlug(inv) === idOrSlug);
    if (found) return found;

    return null;
  },
  createInvitation(customerId, title, config = DEFAULT_CONFIG, isPaid = false, status = "draft") {
    const db = getDb();
    const timestamp = Date.now();
    const bride = config.brideName || "Ananya";
    const groom = config.groomName || "Aarav";
    const nameSlug = this.slugify(`${bride}-${groom}`) || "wedding";
    const uniqueId = `invite-${timestamp}`;
    const initialSlug = `${nameSlug}-${timestamp}`;
    const fullConfig = { ...DEFAULT_CONFIG, ...config };
    const folderName = formatDriveFolderName(fullConfig, title || `${bride} & ${groom}'s Wedding`);

    const newInv = {
      id: uniqueId,
      slug: initialSlug,
      customSlug: initialSlug,
      customerId,
      title: title || `${bride} & ${groom}'s Wedding`,
      config: fullConfig,
      rsvps: [],
      wishes: [],
      isPaid,
      shareText: `We are thrilled to invite you to our wedding celebration! View our digital invitation here: {url} - ${bride} & ${groom}`,
      status,
      driveStorage: {
        rootFolderId: GOOGLE_DRIVE_ROOT_FOLDER_ID,
        rootFolderUrl: GOOGLE_DRIVE_ROOT_FOLDER_URL,
        folderName: folderName,
        folderId: null,
        folderUrl: GOOGLE_DRIVE_ROOT_FOLDER_URL,
        lastSyncedAt: new Date().toISOString(),
        status: "synced"
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.invitations.push(newInv);
    saveDb(db);

    // Asynchronously create and sync folder on Google Drive
    syncDriveFolder({ invitation: newInv }).then(driveRes => {
      if (driveRes && driveRes.folderId) {
        const freshDb = getDb();
        const target = freshDb.invitations.find(i => i.id === uniqueId);
        if (target) {
          target.driveStorage = { ...(target.driveStorage || {}), ...driveRes };
          saveDb(freshDb);
        }
      }
    }).catch(err => console.warn("Google Drive initial sync warning:", err));

    return newInv;
  },
  updateInvitation(id, updates) {
    const db = getDb();
    const idx = db.invitations.findIndex(inv => inv.id === id);
    if (idx === -1) return null;
    
    const current = db.invitations[idx];
    const newConfig = updates.config ? { ...(current.config || {}), ...updates.config } : (current.config || {});
    
    const bride = (newConfig.brideName || "").trim();
    const groom = (newConfig.groomName || "").trim();
    const rawId = (current.id || "").replace(/^invite-/, "");
    const namePart = this.slugify(`${bride || "wedding"}-${groom || ""}`) || "wedding";
    const dynamicSlug = `${namePart}-${rawId || "invite"}`;

    const isManual = updates.isCustomSlugManuallySet !== undefined
      ? updates.isCustomSlugManuallySet
      : Boolean(current.isCustomSlugManuallySet && current.customSlug && !current.customSlug.startsWith("ananya-aarav"));

    let newSlug = dynamicSlug;
    let newCustomSlug = dynamicSlug;

    if (isManual && updates.customSlug) {
      newSlug = this.slugify(updates.customSlug);
      newCustomSlug = newSlug;
    } else if (isManual && current.customSlug) {
      const oldBride = (current.config?.brideName || "").trim();
      const oldGroom = (current.config?.groomName || "").trim();
      const namesChanged = updates.config && (updates.config.brideName !== undefined || updates.config.groomName !== undefined) && (oldBride !== bride || oldGroom !== groom);
      if (!namesChanged) {
        newSlug = current.customSlug;
        newCustomSlug = current.customSlug;
      }
    }

    // Google Drive Cloud Storage: Auto-rename folder whenever bride, groom, or location is edited
    const oldFolderName = current.driveStorage?.folderName || formatDriveFolderName(current.config || {}, current.title);
    const newFolderName = formatDriveFolderName(newConfig, updates.title || current.title);
    const folderRenamed = Boolean(oldFolderName && newFolderName && oldFolderName !== newFolderName);

    const updatedDriveStorage = {
      ...(current.driveStorage || {}),
      ...(updates.driveStorage || {}),
      rootFolderId: GOOGLE_DRIVE_ROOT_FOLDER_ID,
      rootFolderUrl: GOOGLE_DRIVE_ROOT_FOLDER_URL,
      folderName: newFolderName,
      folderUrl: current.driveStorage?.folderUrl || GOOGLE_DRIVE_ROOT_FOLDER_URL,
      lastSyncedAt: new Date().toISOString()
    };

    if (folderRenamed) {
      console.log(`[Google Drive Cloud] Auto-renaming folder to "${newFolderName}" (was "${oldFolderName}")`);
      syncDriveFolder({
        invitation: { ...current, ...updates, config: newConfig },
        oldFolderName
      }).then(res => {
        if (res) {
          const freshDb = getDb();
          const target = freshDb.invitations.find(i => i.id === id);
          if (target) {
            target.driveStorage = { ...(target.driveStorage || {}), ...res };
            saveDb(freshDb);
          }
        }
      }).catch(err => console.warn("Google Drive auto-rename warning:", err));
    }

    db.invitations[idx] = {
      ...current,
      ...updates,
      isCustomSlugManuallySet: isManual,
      slug: newSlug,
      customSlug: newCustomSlug,
      driveStorage: updatedDriveStorage,
      updatedAt: new Date().toISOString()
    };
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));

    // Permanent Google Drive Sync: If any base64 image data is saved, migrate it to Google Drive in the background to free Firebase space
    if (updates.config) {
      const base64Keys = Object.keys(updates.config).filter(k => typeof updates.config[k] === 'string' && updates.config[k].startsWith('data:image'));
      if (base64Keys.length > 0) {
        setTimeout(async () => {
          try {
            const freshDb = getDb();
            const target = (freshDb.invitations || []).find(i => i.id === id);
            if (!target || !target.config) return;
            let didMigrate = false;
            for (const k of base64Keys) {
              if (target.config[k] && target.config[k].startsWith('data:image')) {
                const res = await uploadBase64ToDriveStorage({
                  base64Data: target.config[k],
                  invitation: target,
                  category: k,
                  customFileName: `${k}_drive`
                });
                if (res.success && res.url.startsWith('http')) {
                  target.config[k] = res.url;
                  didMigrate = true;
                }
              }
            }
            if (didMigrate) {
              saveDb(freshDb);
              window.dispatchEvent(new Event("db_synced"));
            }
          } catch(e) {
            console.warn("Background Drive migration notice:", e);
          }
        }, 300);
      }
    }

    return db.invitations[idx];
  },
  deleteInvitation(id) {
    const db = getDb();
    const inv = db.invitations.find(i => i.id === id);
    if (inv) {
      this.archiveItem('invitation', inv, inv.title || 'Invitation');
    }
    db.invitations = db.invitations.filter(inv => inv.id !== id);
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return true;
  },
  duplicateInvitation(id, customTitle = null, assignCustomerId = null) {
    const db = getDb();
    const source = this.getInvitationById(id);
    if (!source) return null;

    const timestamp = Date.now();
    const newId = `invite-${timestamp}`;
    const cleanConfig = JSON.parse(JSON.stringify(source.config || DEFAULT_CONFIG));

    const bride = cleanConfig.brideName || "Ananya";
    const groom = cleanConfig.groomName || "Aarav";
    const nameSlug = this.slugify(`${bride}-${groom}`) || "wedding";
    const newSlug = `${nameSlug}-${timestamp}`;

    const newTitle = customTitle || `${source.title || `${bride} & ${groom}'s Wedding`} (Copy)`;
    const newFolderName = formatDriveFolderName(cleanConfig, newTitle);

    const duplicated = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      slug: newSlug,
      customSlug: newSlug,
      isCustomSlugManuallySet: false,
      title: newTitle,
      config: cleanConfig,
      customerId: assignCustomerId !== null ? assignCustomerId : (source.customerId || null),
      rsvps: [],
      wishes: [],
      guestList: Array.isArray(source.guestList) ? JSON.parse(JSON.stringify(source.guestList)) : [],
      isPaid: false,
      status: "draft",
      driveStorage: {
        rootFolderId: GOOGLE_DRIVE_ROOT_FOLDER_ID,
        rootFolderUrl: GOOGLE_DRIVE_ROOT_FOLDER_URL,
        folderName: newFolderName,
        folderId: null,
        folderUrl: GOOGLE_DRIVE_ROOT_FOLDER_URL,
        lastSyncedAt: new Date().toISOString(),
        status: "synced"
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.invitations.unshift(duplicated);
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));

    // Sync newly duplicated invitation's folder
    syncDriveFolder({ invitation: duplicated }).catch(err => console.warn("Duplicate Drive sync warning:", err));

    return duplicated;
  },
  ensureInvitationCached(inv) {
    if (!inv || !inv.id) return;
    const db = getDb();
    const idx = db.invitations.findIndex(i => i.id === inv.id);

    const sanitizeWishes = (list) => {
      if (!Array.isArray(list)) return [];
      const seen = new Set();
      return list.filter(w => {
        const k = (w.sender || "").trim().toLowerCase();
        if (!k || seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    };

    const sanitizeRsvps = (list) => {
      if (!Array.isArray(list)) return [];
      const seen = new Set();
      return list.filter(r => {
        const k = (r.name || "").trim().toLowerCase();
        if (!k || seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    };

    const targetWishes = sanitizeWishes(Array.isArray(inv.wishes) ? inv.wishes : (idx !== -1 ? db.invitations[idx].wishes : []));
    const targetRsvps = sanitizeRsvps(Array.isArray(inv.rsvps) ? inv.rsvps : (idx !== -1 ? db.invitations[idx].rsvps : []));

    if (idx === -1) {
      db.invitations.push({
        ...inv,
        rsvps: targetRsvps,
        wishes: targetWishes
      });
    } else {
      db.invitations[idx] = {
        ...db.invitations[idx],
        ...inv,
        rsvps: targetRsvps,
        wishes: targetWishes
      };
    }
    saveDb(db);
  },
  submitRsvp(invitationId, rsvp) {
    const db = getDb();
    let idx = db.invitations.findIndex(inv => inv.id === invitationId);
    if (idx === -1) {
      db.invitations.push({
        id: invitationId,
        title: "Wedding Invitation",
        config: DEFAULT_CONFIG,
        rsvps: [],
        wishes: []
      });
      idx = db.invitations.length - 1;
    }

    if (!Array.isArray(db.invitations[idx].rsvps)) {
      db.invitations[idx].rsvps = [];
    }

    // Clean any existing duplicates first
    const seenGuests = new Set();
    const sanitizedRsvps = [];
    for (const r of db.invitations[idx].rsvps) {
      const k = (r.name || "").trim().toLowerCase();
      if (!k || seenGuests.has(k)) continue;
      seenGuests.add(k);
      sanitizedRsvps.push(r);
    }
    db.invitations[idx].rsvps = sanitizedRsvps;

    const trimmedName = (rsvp.name || "").trim().toLowerCase();
    const existingIndex = db.invitations[idx].rsvps.findIndex(
      r => (r.name || "").trim().toLowerCase() === trimmedName
    );

    let updated = false;
    if (existingIndex !== -1) {
      // Update existing RSVP: guest can edit guest count and attendance
      db.invitations[idx].rsvps[existingIndex] = {
        ...db.invitations[idx].rsvps[existingIndex],
        ...rsvp,
        name: rsvp.name.trim(),
        count: Number(rsvp.count) || 1,
        updatedAt: new Date().toISOString()
      };
      updated = true;
    } else {
      // Add new RSVP
      db.invitations[idx].rsvps = [
        {
          ...rsvp,
          name: rsvp.name.trim(),
          count: Number(rsvp.count) || 1,
          createdAt: new Date().toISOString()
        },
        ...db.invitations[idx].rsvps
      ];
    }

    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return { success: true, updated, rsvps: db.invitations[idx].rsvps };
  },
  submitWish(invitationId, wish) {
    const db = getDb();
    let idx = db.invitations.findIndex(inv => inv.id === invitationId);
    if (idx === -1) {
      db.invitations.push({
        id: invitationId,
        title: "Wedding Invitation",
        config: DEFAULT_CONFIG,
        rsvps: [],
        wishes: []
      });
      idx = db.invitations.length - 1;
    }

    if (!Array.isArray(db.invitations[idx].wishes)) {
      db.invitations[idx].wishes = [];
    }

    // Deduplicate existing wishes first to purge any past duplicates
    const seenSenders = new Set();
    const sanitizedWishes = [];
    for (const w of db.invitations[idx].wishes) {
      const k = (w.sender || "").trim().toLowerCase();
      if (!k || seenSenders.has(k)) continue;
      seenSenders.add(k);
      sanitizedWishes.push(w);
    }
    db.invitations[idx].wishes = sanitizedWishes;

    const trimmedSender = (wish.sender || "").trim().toLowerCase();
    if (seenSenders.has(trimmedSender)) {
      throw new Error(`A blessing has already been posted by "${wish.sender.trim()}". Only one blessing is permitted per guest name.`);
    }

    const newWish = {
      ...wish,
      sender: wish.sender.trim(),
      createdAt: wish.createdAt || new Date().toISOString()
    };

    db.invitations[idx].wishes = [newWish, ...sanitizedWishes];

    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return { success: true, wishes: db.invitations[idx].wishes };
  },

  // --- PRESETS ---
  getPresets() {
    return getDb().presets;
  },
  getPresetById(id) {
    return this.getPresets().find(p => p.id === id);
  },
  createPreset(title, religion = "secular", config = {}) {
    const db = getDb();
    const presetId = `preset-${Date.now()}`;
    const newPreset = {
      id: presetId,
      title,
      religion,
      config: {
        ...DEFAULT_CONFIG,
        presetId,
        religionKey: religion,
        ...config
      }
    };
    db.presets.push(newPreset);
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return newPreset;
  },
  createPresetFromInvitation(configOrId, title) {
    const db = getDb();
    let config = null;
    if (typeof configOrId === 'string') {
      const inv = db.invitations.find(i => i.id === configOrId);
      if (inv) config = inv.config;
    } else if (configOrId && typeof configOrId === 'object') {
      config = configOrId;
    }
    if (!config) throw new Error("Configuration not found");
    const newPreset = {
      id: `preset-${Date.now()}`,
      title,
      religion: config.religionKey || "secular",
      config: JSON.parse(JSON.stringify(config))
    };
    db.presets.push(newPreset);
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return newPreset;
  },
  deletePreset(id) {
    const db = getDb();
    if (!db.deletedPresetIds) db.deletedPresetIds = [];
    if (!db.deletedPresetIds.includes(id)) {
      db.deletedPresetIds.push(id);
    }
    // Permanently remove from archive/trash as well so it cannot be recovered
    if (db.archive && Array.isArray(db.archive)) {
      db.archive = db.archive.filter(item => !(item.itemType === 'preset' && (item.originalId === id || item.data?.id === id)));
    }
    db.presets = (db.presets || []).filter(p => p.id !== id);
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return true;
  },
  updatePreset(id, updates) {
    const db = getDb();
    const idx = db.presets.findIndex(p => p.id === id);
    if (idx === -1) return null;
    
    const existing = db.presets[idx];
    const mergedConfig = updates.config 
      ? { ...existing.config, ...updates.config }
      : existing.config;

    db.presets[idx] = {
      ...existing,
      ...updates,
      config: mergedConfig
    };
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return db.presets[idx];
  },

  // --- BACKGROUND PRESETS ---
  getBgPresets() {
    const db = getDb();
    if (!db.deletedBgPresetIds) db.deletedBgPresetIds = [];
    const isInit = db.initialized || localStorage.getItem("db_initialized") === "true";
    if (!db.bgPresets) {
      db.bgPresets = isInit ? [] : [...INITIAL_BG_PRESETS];
      saveDb(db);
    }
    // Filter out any permanently deleted presets
    const filtered = (db.bgPresets || []).filter(p => !db.deletedBgPresetIds.includes(p.id));
    if (filtered.length !== db.bgPresets.length) {
      db.bgPresets = filtered;
      saveDb(db);
    }
    return db.bgPresets;
  },
  createBgPreset(name, url, config = {}) {
    const db = getDb();
    if (!db.bgPresets) db.bgPresets = [];
    const newBgPreset = {
      id: `bg-preset-${Date.now()}`,
      name,
      url,
      config
    };
    db.bgPresets.push(newBgPreset);
    saveDb(db);
    return newBgPreset;
  },
  deleteBgPreset(id) {
    const db = getDb();
    if (!db.deletedBgPresetIds) db.deletedBgPresetIds = [];
    if (!db.deletedBgPresetIds.includes(id)) {
      db.deletedBgPresetIds.push(id);
    }
    // Permanently remove from archive/trash as well so it cannot be recovered
    if (db.archive && Array.isArray(db.archive)) {
      db.archive = db.archive.filter(item => !(item.itemType === 'bgPreset' && (item.originalId === id || item.data?.id === id)));
    }
    db.bgPresets = (db.bgPresets || []).filter(p => p.id !== id);
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return true;
  },

  // --- ENVELOPE DESIGN PRESETS ---
  getEnvelopePresets() {
    const db = getDb();
    if (!db.deletedEnvelopePresetIds) db.deletedEnvelopePresetIds = [];
    const isInit = db.initialized || localStorage.getItem("db_initialized") === "true";
    if (!db.envelopePresets || !Array.isArray(db.envelopePresets)) {
      db.envelopePresets = isInit ? [] : [...INITIAL_ENVELOPE_PRESETS];
      saveDb(db);
    }
    const filtered = (db.envelopePresets || []).filter(p => !db.deletedEnvelopePresetIds.includes(p.id));
    if (filtered.length !== db.envelopePresets.length) {
      db.envelopePresets = filtered;
      saveDb(db);
    }
    return db.envelopePresets;
  },
  createEnvelopePreset(name, envelopeConfig = {}) {
    const db = getDb();
    if (!db.envelopePresets || !Array.isArray(db.envelopePresets)) {
      db.envelopePresets = [];
    }
    const newPreset = {
      id: `ep-${Date.now()}`,
      name,
      bg: envelopeConfig.envelopeBgColor || "#5a0e1c",
      seal: envelopeConfig.envelopeSealColor || "#c89f4b",
      type: envelopeConfig.envelopeSealType || "heart",
      flap: envelopeConfig.envelopeFlapShape || "classic-v",
      shape: envelopeConfig.envelopeSealShape || "organic",
      particles: envelopeConfig.envelopeParticleType || "sparkles",
      speed: envelopeConfig.envelopeSpeed || "1.2",
      count: envelopeConfig.envelopeParticles !== undefined ? envelopeConfig.envelopeParticles : 20,
      sealTop: envelopeConfig.envelopeSealTop !== undefined ? envelopeConfig.envelopeSealTop : 50,
      bgImage: envelopeConfig.envelopeBgImage || "",
      waxImg: envelopeConfig.envelopeWaxSealImg || "",
      flapBgStart: envelopeConfig.envelopeFlapBgStart || "",
      flapBgEnd: envelopeConfig.envelopeFlapBgEnd || "",
      isDefault: false
    };
    db.envelopePresets.push(newPreset);
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return newPreset;
  },
  deleteEnvelopePreset(id) {
    const db = getDb();
    if (!db.deletedEnvelopePresetIds) db.deletedEnvelopePresetIds = [];
    if (!db.deletedEnvelopePresetIds.includes(id)) {
      db.deletedEnvelopePresetIds.push(id);
    }
    // Permanently remove from archive/trash as well so it cannot be recovered
    if (db.archive && Array.isArray(db.archive)) {
      db.archive = db.archive.filter(item => !(item.itemType === 'envelopePreset' && (item.originalId === id || item.data?.id === id)));
    }
    db.envelopePresets = (db.envelopePresets || []).filter(p => p.id !== id);
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return true;
  },

  // --- ENVELOPE TEXTURE PRESETS ---
  getEnvelopeTextures() {
    const db = getDb();
    if (!db.envelopeTextures || !Array.isArray(db.envelopeTextures)) {
      db.envelopeTextures = [];
      saveDb(db);
    }
    return db.envelopeTextures;
  },
  createEnvelopeTexture(name, url) {
    const db = getDb();
    if (!db.envelopeTextures || !Array.isArray(db.envelopeTextures)) {
      db.envelopeTextures = [];
    }
    const newTex = {
      id: `tex-${Date.now()}`,
      name: name || "Custom Texture",
      url
    };
    db.envelopeTextures.push(newTex);
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return newTex;
  },
  deleteEnvelopeTexture(id) {
    const db = getDb();
    if (!db.envelopeTextures) db.envelopeTextures = [];
    const tex = db.envelopeTextures.find(t => t.id === id);
    if (tex) {
      this.archiveItem('envelopeTexture', tex, tex.name || 'Envelope Texture');
    }
    db.envelopeTextures = db.envelopeTextures.filter(t => t.id !== id);
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return true;
  },

  // --- MUSIC PRESETS ---
  getMusicPresets() {
    const db = getDb();
    if (!db.musicPresets || db.musicPresets.length === 0) {
      db.musicPresets = [...CURATED_MUSIC_PRESETS];
      saveDb(db);
    }
    return db.musicPresets;
  },
  createMusicPreset(title, url, artist = "Royalty Free", category = "Custom") {
    const db = getDb();
    if (!db.musicPresets) db.musicPresets = [...CURATED_MUSIC_PRESETS];
    const newTrack = {
      id: `music-preset-${Date.now()}`,
      title,
      artist,
      category,
      url,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    db.musicPresets.push(newTrack);
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return newTrack;
  },
  deleteMusicPreset(id) {
    const db = getDb();
    if (!db.musicPresets) db.musicPresets = [...CURATED_MUSIC_PRESETS];
    const mp = db.musicPresets.find(m => m.id === id);
    if (mp) {
      this.archiveItem('musicPreset', mp, mp.title || 'Music Track');
    }
    db.musicPresets = db.musicPresets.filter(m => m.id !== id);
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return true;
  },

  // --- ORDERS ---
  getOrders() {
    return getDb().orders;
  },
  getOrdersByCustomer(customerId) {
    return this.getOrders().filter(o => o.customerId === customerId);
  },
  getOrderById(id) {
    return this.getOrders().find(o => o.id === id);
  },
  createOrder(customerId, presetId, details) {
    const db = getDb();
    const newOrder = {
      id: `order-${Date.now()}`,
      customerId,
      presetId,
      details,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    db.orders.push(newOrder);
    
    // Add admin notification
    const customer = db.users.find(u => u.id === customerId);
    const preset = db.presets.find(p => p.id === presetId);
    db.notifications.push({
      id: `notify-${Date.now()}`,
      type: "order",
      message: `New Order from ${customer ? customer.displayName : 'Customer'} for design "${preset ? preset.title : 'Custom Preset'}"`,
      read: false,
      createdAt: new Date().toISOString()
    });
    
    saveDb(db);
    return newOrder;
  },
  updateOrderStatus(id, status) {
    const db = getDb();
    const idx = db.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    
    db.orders[idx].status = status;
    saveDb(db);
    return db.orders[idx];
  },
  updateOrder(id, updatedDetails) {
    const db = getDb();
    const idx = db.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    
    db.orders[idx] = {
      ...db.orders[idx],
      ...updatedDetails,
      details: {
        ...(db.orders[idx].details || {}),
        ...(updatedDetails.details || {})
      }
    };
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return db.orders[idx];
  },
  markOrderAsPaid(idOrOrderObj, paymentInfo = {}) {
    const db = getDb();
    const targetId = typeof idOrOrderObj === 'string' ? idOrOrderObj : idOrOrderObj?.id;
    if (!targetId) return false;

    // 1. Check orders array
    const orderIdx = db.orders.findIndex(o => o.id === targetId || o.presetId === targetId);
    if (orderIdx !== -1) {
      db.orders[orderIdx].isPaid = true;
      db.orders[orderIdx].paymentStatus = "paid";
      db.orders[orderIdx].paymentDetails = {
        ...(db.orders[orderIdx].paymentDetails || {}),
        ...paymentInfo,
        paidAt: new Date().toISOString()
      };
    }

    // 2. Check invitations array
    const invIdx = db.invitations.findIndex(i => i.id === targetId || i.config?.presetId === targetId);
    if (invIdx !== -1) {
      db.invitations[invIdx].isPaid = true;
      db.invitations[invIdx].status = "paid";
      if (!db.invitations[invIdx].config) db.invitations[invIdx].config = {};
      db.invitations[invIdx].config.isPaid = true;
    }

    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return true;
  },
  markOrderAsUnpaid(targetId) {
    const db = getDb();
    const orderIdx = db.orders.findIndex(o => o.id === targetId);
    if (orderIdx !== -1) {
      db.orders[orderIdx].isPaid = false;
      db.orders[orderIdx].paymentStatus = "unpaid";
    }
    const invIdx = db.invitations.findIndex(i => i.id === targetId);
    if (invIdx !== -1) {
      db.invitations[invIdx].isPaid = false;
      if (db.invitations[invIdx].config) db.invitations[invIdx].config.isPaid = false;
    }
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return true;
  },
  updateOrderPricing(id, price, discountPercent) {
    const db = getDb();
    const orderIdx = db.orders.findIndex(o => o.id === id);
    if (orderIdx !== -1) {
      db.orders[orderIdx].price = Number(price);
      db.orders[orderIdx].discountPercent = Number(discountPercent);
    }
    const invIdx = db.invitations.findIndex(i => i.id === id);
    if (invIdx !== -1) {
      if (!db.invitations[invIdx].config) db.invitations[invIdx].config = {};
      db.invitations[invIdx].config.price = Number(price);
      db.invitations[invIdx].config.discountPercent = Number(discountPercent);
    }
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return true;
  },
  cancelOrder(id) {
    const db = getDb();
    const idx = db.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;

    db.orders[idx].status = "cancelled";
    db.orders[idx].updatedAt = new Date().toISOString();
    
    db.notifications.push({
      id: `notify-${Date.now()}`,
      type: "order_cancelled",
      message: `Order ${id} was cancelled by the customer`,
      read: false,
      createdAt: new Date().toISOString()
    });

    saveDb(db);
    return db.orders[idx];
  },
  deleteOrder(id) {
    const db = getDb();
    const order = db.orders.find(o => o.id === id);
    if (order) {
      this.archiveItem('order', order, `Order ${order.id}`);
    }
    db.orders = db.orders.filter(o => o.id !== id);
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return true;
  },

  // --- NOTIFICATIONS ---
  getNotifications() {
    return getDb().notifications;
  },
  markNotificationRead(id) {
    const db = getDb();
    const idx = db.notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      db.notifications[idx].read = true;
      saveDb(db);
    }
  },
  clearNotifications() {
    const db = getDb();
    db.notifications = [];
    saveDb(db);
  },

  // --- BRAND & LOGO SETTINGS ---
  getBrandSettings() {
    const db = getDb();
    if (!db.brandSettings) {
      db.brandSettings = { ...DEFAULT_BRAND_SETTINGS };
      saveDb(db);
    } else if (db.brandSettings.appBgColor === "#090d16") {
      db.brandSettings.appBgColor = "#FFF9F2";
      saveDb(db);
    }
    return db.brandSettings;
  },
  updateBrandSettings(settings) {
    const db = getDb();
    db.brandSettings = {
      ...(db.brandSettings || DEFAULT_BRAND_SETTINGS),
      ...settings
    };
    saveDb(db);
    window.dispatchEvent(new Event("db_synced"));
    return db.brandSettings;
  },

  // --- GOOGLE DRIVE CLOUD IMAGE TRANSFER & SYNC ---
  scanBase64Media() {
    return scanDatabaseForBase64Media(getDb());
  },
  transferAllImagesToDrive(onProgress) {
    return transferAllDatabaseImagesToDrive({
      getDb,
      saveDb,
      onProgress
    });
  }
};
export { DEFAULT_CONFIG };
export default dbStore;
