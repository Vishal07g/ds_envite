import fs from 'fs';

let content = fs.readFileSync('Frontend/src/data/store.js', 'utf8');

// Replace DEFAULT_BRAND_SETTINGS
const targetStr = `const DEFAULT_BRAND_SETTINGS = {
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
};`;

const newStr = `const DEFAULT_BRAND_SETTINGS = {
  logoUrl: "",
  brandName: "DS ENVITES",
  logoShape: "circle",
  logoScale: 1.0,
  logoX: 0,
  logoY: 0,
  appBgColor: "#F6E9E5",
  appBgGradient: "",
  appBgOverlayUrl: "",
  appBgOverlayOpacity: 0.35,
  appBgOverlayRepeat: "repeat",
  appBgOverlayBlendMode: "normal",
  appButtonStyle: "gold-gradient",
  landingTheme: DEFAULT_LANDING_THEME
};`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  console.log("Replaced DEFAULT_BRAND_SETTINGS with landingTheme");
} else {
  // Try CRLF agnostic replace
  const re = /const DEFAULT_BRAND_SETTINGS = \{[\s\S]*?appButtonStyle: "gold-gradient"\r?\n\};/;
  if (re.test(content)) {
    content = content.replace(re, newStr);
    console.log("Replaced DEFAULT_BRAND_SETTINGS via regex");
  } else {
    console.warn("Could not find DEFAULT_BRAND_SETTINGS target");
  }
}

// Update getBrandSettings to ensure landingTheme is populated
const oldGet = /getBrandSettings\(\)\s*\{[\s\S]*?return db\.brandSettings;\r?\n\s*\}/;
const newGet = `getBrandSettings() {
    const db = getDb();
    if (!db.brandSettings) {
      db.brandSettings = { ...DEFAULT_BRAND_SETTINGS };
      saveDb(db);
    } else {
      let changed = false;
      if (!db.brandSettings.landingTheme) {
        db.brandSettings.landingTheme = JSON.parse(JSON.stringify(DEFAULT_LANDING_THEME));
        changed = true;
      }
      if (db.brandSettings.appBgColor === "#090d16") {
        db.brandSettings.appBgColor = "#F6E9E5";
        changed = true;
      }
      if (changed) saveDb(db);
    }
    return db.brandSettings;
  }`;

if (oldGet.test(content)) {
  content = content.replace(oldGet, newGet);
  console.log("Updated getBrandSettings to auto-hydrate landingTheme");
} else {
  console.warn("Could not match old getBrandSettings");
}

fs.writeFileSync('Frontend/src/data/store.js', content, 'utf8');

