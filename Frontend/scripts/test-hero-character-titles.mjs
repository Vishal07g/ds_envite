import dbStore, { getHeroCharacterTitle, isGenericInvitationTitle, generateRandomDraftConfig } from '../src/data/store.js';
import assert from 'assert';

console.log("==================================================");
console.log("🧪 TESTING HERO CHARACTER INVITATION TITLES");
console.log("==================================================");

// 1. Test isGenericInvitationTitle
assert.strictEqual(isGenericInvitationTitle("New Wedding Invitation"), true);
assert.strictEqual(isGenericInvitationTitle("New Wedding Invitation (Copy)"), true);
assert.strictEqual(isGenericInvitationTitle("New Wedding Invitation (Copy) (Copy)"), true);
assert.strictEqual(isGenericInvitationTitle("Wedding Invitation"), true);
assert.strictEqual(isGenericInvitationTitle("New Invitation"), true);
assert.strictEqual(isGenericInvitationTitle(""), true);
assert.strictEqual(isGenericInvitationTitle("Suman & Vishal's Wedding Invitation"), false);
assert.strictEqual(isGenericInvitationTitle("Aarav Sharma - Birthday Invitation"), false);
assert.strictEqual(isGenericInvitationTitle("Vishal weds Suman"), false);
console.log("✅ 1. isGenericInvitationTitle correctly identifies placeholder vs hero titles");

// 2. Test getHeroCharacterTitle across categories
const weddingCfg = {
  category: "wedding",
  brideName: "Diya",
  groomName: "Kabir"
};
assert.strictEqual(getHeroCharacterTitle(weddingCfg), "Diya & Kabir's Wedding");
assert.strictEqual(getHeroCharacterTitle(weddingCfg, "New Wedding Invitation (Copy)"), "Diya & Kabir's Wedding (Copy)");

const bdayCfg = {
  category: "birthday",
  heroName: "Aarav Sharma"
};
assert.strictEqual(getHeroCharacterTitle(bdayCfg), "Aarav Sharma - Birthday Invitation");

const babyCfg = {
  category: "first_birthday",
  babyName: "Reyansh"
};
assert.strictEqual(getHeroCharacterTitle(babyCfg), "Reyansh - First Birthday Invitation");

const momCfg = {
  category: "baby_shower",
  motherName: "Ananya"
};
assert.strictEqual(getHeroCharacterTitle(momCfg), "Ananya - Baby Shower Invitation");

const houseCfg = {
  category: "housewarming",
  familyName: "The Sharmas"
};
assert.strictEqual(getHeroCharacterTitle(houseCfg), "The Sharmas - Housewarming Invitation");
console.log("✅ 2. getHeroCharacterTitle correctly generates hero character names across all categories");

// 3. Test Store createInvitation generates hero title when none provided
const newInv = dbStore.createInvitation(null, null, { category: "wedding" });
console.log("Created wedding draft title:", newInv.title);
assert.ok(!isGenericInvitationTitle(newInv.title), `Title '${newInv.title}' must not be generic`);
assert.ok(newInv.title.includes("&"), `Wedding title '${newInv.title}' must contain couple names`);

// 4. Test Store duplication creates title with hero name + (Copy)
const dupInv = dbStore.duplicateInvitation(newInv.id);
console.log("Duplicated draft title:", dupInv.title);
assert.ok(!isGenericInvitationTitle(dupInv.title), `Duplicated title '${dupInv.title}' must not be generic`);
assert.ok(dupInv.title.includes("(Copy)"), `Duplicated title '${dupInv.title}' must contain (Copy)`);

// 5. Clean up created test invitations
dbStore.deleteInvitation(newInv.id);
dbStore.deleteInvitation(dupInv.id);

// 6. Test Strict Protection for Paid Invitation
const paidInv = dbStore.getInvitationById("invite-1792299417819");
assert.strictEqual(paidInv.title, "Suman & Vishal's Wedding Invitation");
assert.strictEqual(paidInv.isPaid, true);
console.log("✅ 3. Paid marked invitation title is 100% UNTOUCHED and PROTECTED!");

console.log("==================================================");
console.log("🎉 ALL HERO CHARACTER INVITATION TITLE TESTS PASSED!");
console.log("==================================================");

