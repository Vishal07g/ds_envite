import dbStore from '../src/data/store.js';

console.log("==================================================");
console.log("🧪 TESTING THEME COVER DESIGN THUMBNAIL INTEGRATION");
console.log("==================================================");

// 1. Verify getPresets() has cover thumbnail for all presets
const presets = dbStore.getPresets();
console.log(`Found ${presets.length} presets in dbStore.`);

for (const p of presets) {
  if (!p.thumbnail) {
    console.error(`❌ Preset "${p.title}" (${p.id}) has no thumbnail!`);
    process.exit(1);
  }
  console.log(`  ✅ Preset "${p.title}" -> Thumbnail: ${p.thumbnail}`);
}

// 2. Test createPresetFromInvitation setting cover thumbnail by default
const sampleConfig = {
  brideName: "Meera",
  groomName: "Kabir",
  heroImage: "https://drive.google.com/file/d/1_test_meera_kabir/view",
  primaryColor: "#4a121d"
};

const newPreset = dbStore.createPresetFromInvitation(sampleConfig, "Meera & Kabir's Royal Theme");
console.log(`Created new preset from invitation: ${newPreset.title} (${newPreset.id})`);
console.log(`  Thumbnail: ${newPreset.thumbnail}`);

if (newPreset.thumbnail !== sampleConfig.heroImage) {
  console.error(`❌ Expected thumbnail "${sampleConfig.heroImage}", got "${newPreset.thumbnail}"`);
  process.exit(1);
}
console.log("  ✅ newPreset.thumbnail correctly equals the invitation cover design (heroImage)!");

// Clean up test preset
dbStore.deletePreset(newPreset.id);

// 3. Test paid wedding invitation protection
const paidInv = dbStore.getInvitationById("invite-1792299417819");
if (!paidInv || !paidInv.isPaid) {
  console.error("❌ Paid invitation invite-1792299417819 was affected!");
  process.exit(1);
}
console.log(`  ✅ Paid invitation "${paidInv.title}" is untouched and protected!`);

console.log("==================================================");
console.log("🎉 ALL THEME COVER DESIGN THUMBNAIL TESTS PASSED!");
console.log("==================================================");

