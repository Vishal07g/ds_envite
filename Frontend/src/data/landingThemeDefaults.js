/**
 * Master Landing Page Theme Presets & Color System Configuration
 * Based on the Cinematic Luxury Wedding Invitation Landing Page Reference
 */

export const MASTER_COLOR_SYSTEM = {
  primaryBg: "#F6E9E5",       // Main canvas background
  secondaryBg: "#EAD8D5",     // Background depth & secondary surfaces
  warmIvory: "#FFF7EF",       // Light card surfaces & panels
  blushPink: "#E7BDBD",       // Decorative accents & pills
  dustyRose: "#C88F91",       // Secondary accents & highlights
  deepRosewood: "#713D3B",    // Contrast elements & headings
  champagneGold: "#C7A36B",   // Fine decorative details, borders & foils
  softWhite: "#FFFDFC",       // Highlights & card backgrounds
  darkBrown: "#422C2B",       // High-contrast text & focal points
  textPrimary: "#422C2B",
  textMuted: "#713D3B",
  borderGilded: "#C7A36B",
  accentGlow: "#E7BDBD"
};

export const DEFAULT_VISIBILITY = {
  showMicroPill: true,
  showHeadline: true,
  showSubtitle: true,
  showFeatureCards: true,
  showCtaButtons: true,
  showRightArtwork: true,
  showWaxSeal: true,
  showScratchBadge: true,
  showMusicBar: true,
  showQualityCapsule: true,
  showFilterHub: true,
  showSummaryCapsule: true
};

export const DEFAULT_TRANSPARENCY = {
  heroBgOpacity: 0.92,
  heroBorderOpacity: 0.7,
  heroBlur: 16,
  textCardBgOpacity: 0.85,
  textCardBorderOpacity: 0.6,
  textCardBlur: 12,
  artworkCardBgOpacity: 0.95
};

export const DEFAULT_CUSTOM_BG_IMAGES = [
  { 
    id: "bg-cinematic-arch", 
    title: "Cinematic Luxury Archway", 
    url: "/media/user_reference_hero.png", 
    badge: "⭐ Reference Master" 
  },
  { 
    id: "bg-palace-doors", 
    title: "Royal Palace Heritage Doors", 
    url: "/real_palace_doors.jpg", 
    badge: "👑 Heritage Palace" 
  },
  { 
    id: "bg-floral-cream", 
    title: "Romantic Floral Cream Canvas", 
    url: "/cover_suman_vishal_1k.jpg", 
    badge: "🌸 Floral Romance" 
  },
  { 
    id: "bg-twilight-navy", 
    title: "Enchanted Twilight & Gold Floral", 
    url: "/bg_floral_dark.jpg", 
    badge: "✨ Twilight Navy" 
  }
];

export const DEFAULT_LANDING_THEME = {
  id: "cinematic-romance",
  themeId: "cinematic-romance",
  name: "Cinematic Romance (Luxury Arch)",
  badge: "⭐ Reference Master",
  colors: { ...MASTER_COLOR_SYSTEM },
  layout: {
    heroHeight: "860px",
    contentWidth: "92%",
    maxContentWidth: "1600px",
    contentAlignment: "left",
    artworkAlignment: "right",
    contentRatio: 52,
    artworkRatio: 46
  },
  background: {
    bgImage: "/media/user_reference_hero.png",
    bgPosition: "center center",
    bgSize: "cover",
    overlayColor: "#F6E9E5",
    overlayOpacity: 0.15,
    blur: 0,
    brightness: 1.0,
    contrast: 1.02,
    saturation: 1.0,
    vignetteIntensity: 0.22,
    customImages: [...DEFAULT_CUSTOM_BG_IMAGES]
  },
  decorations: {
    showArch: true,
    showFlorals: true,
    showLanterns: true,
    showPetals: true,
    archOpacity: 0.95,
    floralsScale: 1.0,
    lanternsGlow: true
  },
  visibility: { ...DEFAULT_VISIBILITY },
  transparency: { ...DEFAULT_TRANSPARENCY },
  typography: {
    headingFont: "Cinzel, serif",
    bodyFont: "Plus Jakarta Sans, sans-serif",
    headingScale: 1.0,
    lineHeight: 1.18,
    letterSpacing: "-0.01em"
  },
  effects: {
    ambientGlow: 0.28,
    shadowIntensity: 0.22,
    reflection: true,
    floatingAnimation: true
  }
};

export const LANDING_THEME_PRESETS = [DEFAULT_LANDING_THEME];
export function getLandingThemePreset(presetId) {
  return DEFAULT_LANDING_THEME;
}
