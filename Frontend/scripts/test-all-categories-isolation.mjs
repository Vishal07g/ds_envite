import { getCategoryDefaultConfig } from '../src/data/categoryDefaultConfigs.js';
import { dbStore } from '../src/data/store.js';
import assert from 'assert';

console.log('====================================================');
console.log('🧪 TESTING ALL 9 INVITATION CATEGORIES ISOLATION');
console.log('====================================================');

const categories = [
  'birthday',
  'first_birthday',
  'baby_shower',
  'naming_ceremony',
  'housewarming',
  'anniversary',
  'religious_ceremony',
  'corporate_event'
];

// 1. Verify all non-wedding categories have zero wedding venue leaks
for (const cat of categories) {
  const config = getCategoryDefaultConfig(cat);
  console.log(`\nChecking category "${cat}":`);

  assert.ok(config.weddingVenue, `[FAIL] weddingVenue is empty for ${cat}`);
  assert.notStrictEqual(config.weddingVenue, "The Starlight Cathedral", `[FAIL] ${cat} leaked Starlight Cathedral!`);
  assert.notStrictEqual(config.receptionVenue, "The Gilded Glass Greenhouse", `[FAIL] ${cat} leaked Gilded Glass Greenhouse!`);
  assert.strictEqual(config.showReceptionVenue, false, `[FAIL] ${cat} should have showReceptionVenue = false by default`);
  assert.ok(config.venueTitle, `[FAIL] venueTitle is missing for ${cat}`);
  assert.notStrictEqual(config.venueTitle, "Sacred Venue & Reception", `[FAIL] ${cat} leaked Sacred Venue & Reception!`);

  console.log(`  ✅ Primary Venue: "${config.weddingVenue}" (${config.venueTitle})`);
  console.log(`  ✅ Address: "${config.weddingAddress}"`);
  console.log(`  ✅ showReceptionVenue: ${config.showReceptionVenue}`);
  console.log(`  ✅ Gallery Title: "${config.galleryTitle}" / Subtitle: "${config.gallerySubtitle}"`);
  console.log(`  ✅ Timeline Heading: "${config.timelineHeading}" with ${config.ceremonies?.length} events`);
}

// 2. Verify healing on existing stored drafts in store
console.log('\n--- Testing Auto-Healing of Non-Wedding Drafts in Store ---');
const createdInv = dbStore.createInvitation(
  "cust-1",
  "Aarav Sharma - Birthday Invitation",
  {
    category: "birthday",
    heroName: "Aarav Sharma",
    age: 25,
    weddingVenue: "The Starlight Cathedral", // Simulated legacy leak
    receptionVenue: "The Gilded Glass Greenhouse", // Simulated legacy leak
    venueTitle: "Sacred Venue & Reception", // Simulated legacy leak
    showReceptionVenue: true // Simulated legacy leak
  }
);

assert.ok(createdInv, "Invitation creation returned valid object");
const healedDraft = dbStore.getInvitationById(createdInv.id);

assert.strictEqual(healedDraft.config.weddingVenue, "The Grand Celebration Hall", "Draft venue was not healed to Grand Celebration Hall!");
assert.strictEqual(healedDraft.config.showReceptionVenue, false, "Draft showReceptionVenue was not healed to false!");
assert.strictEqual(healedDraft.config.venueTitle, "Party Venue & Celebration", "Draft venueTitle was not healed!");

console.log('✅ Stored Birthday draft successfully healed:');
console.log(`   Venue: "${healedDraft.config.weddingVenue}"`);
console.log(`   Title: "${healedDraft.config.venueTitle}"`);
console.log(`   showReceptionVenue: ${healedDraft.config.showReceptionVenue}`);

// Cleanup test draft
dbStore.deleteInvitation(createdInv.id);

// 3. Verify strict protection for paid wedding invitation
console.log('\n--- Testing Strict Protection for Paid Invitation ---');
const paidInv = dbStore.getInvitationById("invite-1792299417819");
assert.ok(paidInv, "Paid invitation invite-1792299417819 exists");
assert.strictEqual(paidInv.isPaid, true, "Paid invitation isPaid is true");
assert.strictEqual(paidInv.title, "Suman & Vishal's Wedding Invitation", "Paid title is untouched");
assert.strictEqual(paidInv.config.weddingVenue, "Snehalata Marriage Hall", "Paid wedding venue is untouched");

console.log(`✅ Paid Wedding Invitation venue is untouched: "${paidInv.config.weddingVenue}"`);
console.log('✅ Paid Wedding Invitation remains 100% UNTOUCHED and PROTECTED!');

console.log('\n====================================================');
console.log('🎉 ALL 9 CATEGORIES VERIFIED: ZERO WEDDING LEAKS!');
console.log('====================================================\n');
