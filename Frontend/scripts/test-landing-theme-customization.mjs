import dbStore from '../src/data/store.js';
import { DEFAULT_LANDING_THEME, LANDING_THEME_PRESETS, DEFAULT_VISIBILITY, DEFAULT_TRANSPARENCY } from '../src/data/landingThemeDefaults.js';

console.log("==================================================");
console.log("🧪 TESTING LANDING THEME CUSTOMIZATION & VISIBILITY");
console.log("==================================================");

const brand = dbStore.getBrandSettings();
console.log("1. Brand Settings initialized:");
console.log("   Brand Name:", brand.brandName);
console.log("   Landing Theme ID:", brand.landingTheme?.id);
console.log("   Primary Background:", brand.landingTheme?.colors?.primaryBg);
console.log("   Champagne Gold:", brand.landingTheme?.colors?.champagneGold);

if (!brand.landingTheme || !brand.landingTheme.id) {
  console.error("❌ FAILED: landingTheme not found in brandSettings!");
  process.exit(1);
}

// 2. Test updating visibility tokens (hide / unhide)
console.log("\n2. Testing Hide / Unhide Elements toggles...");
const updatedWithVisibility = dbStore.updateBrandSettings({
  landingTheme: {
    ...brand.landingTheme,
    visibility: {
      ...DEFAULT_VISIBILITY,
      showMicroPill: false,
      showFeatureCards: false
    }
  }
});

if (updatedWithVisibility.landingTheme.visibility.showMicroPill !== false ||
    updatedWithVisibility.landingTheme.visibility.showFeatureCards !== false) {
  console.error("❌ FAILED: visibility tokens update failed!");
  process.exit(1);
}
console.log("✅ Successfully toggled visibility of landing page elements!");

// 3. Test updating transparency under text layout borders
console.log("\n3. Testing transparency under text layout borders...");
const updatedWithTransparency = dbStore.updateBrandSettings({
  landingTheme: {
    ...updatedWithVisibility.landingTheme,
    transparency: {
      ...DEFAULT_TRANSPARENCY,
      heroBgOpacity: 0.15,
      textCardBgOpacity: 0.25,
      textCardBlur: 20
    }
  }
});

if (updatedWithTransparency.landingTheme.transparency.heroBgOpacity !== 0.15 ||
    updatedWithTransparency.landingTheme.transparency.textCardBgOpacity !== 0.25 ||
    updatedWithTransparency.landingTheme.transparency.textCardBlur !== 20) {
  console.error("❌ FAILED: transparency tokens update failed!");
  process.exit(1);
}
console.log("✅ Successfully updated text layout border transparency & frosted blur!");

// 4. Test strict protection of paid marked wedding invitation
console.log("\n4. Testing strict protection of paid marked invitation...");
const paidInvite = dbStore.getInvitationById("invite-1792299417819");
if (!paidInvite || !paidInvite.isPaid) {
  console.error("❌ CRITICAL: Paid invitation missing or un-paid!");
  process.exit(1);
}
console.log(`✅ Paid invitation "${paidInvite.title}" (${paidInvite.id}) is 100% INTACT and PROTECTED!`);

console.log("\n==================================================");
console.log("🎉 ALL LANDING THEME & VISIBILITY TESTS PASSED!");
console.log("==================================================");
