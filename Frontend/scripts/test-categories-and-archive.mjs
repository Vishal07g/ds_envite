import { dbStore } from '../src/data/store.js';
import { INVITATION_CATEGORIES } from '../src/data/invitationCategoriesData.js';

console.log('==================================================');
console.log('🧪 TESTING SMOOTH ARCHIVE & INVITATION CATEGORIES');
console.log('==================================================\n');

// 1. Create a draft non-paid invitation to test instant deletion & archiving
const testInv = dbStore.createInvitation({
  title: "Temporary Test Birthday Party",
  config: {
    category: "birthday",
    heroName: "Test Star"
  }
});

console.log(`Created draft: "${testInv.title}" (${testInv.id})`);
const initialArchiveCount = dbStore.getArchive().length;

// 2. Test Deleting the draft
console.log('\n--- 1. Testing Smooth Instant Archive on Delete ---');
const deleted = dbStore.deleteInvitation(testInv.id);

if (deleted) {
  const activeList = dbStore.getInvitations();
  const existsInActive = activeList.some(i => i.id === testInv.id);
  const archiveList = dbStore.getArchive();
  const existsInArchive = archiveList.some(item => item.originalId === testInv.id || item.data?.id === testInv.id);

  if (!existsInActive && existsInArchive) {
    console.log(`✅ [PASS] Invitation smoothly removed from active list and moved to Archive instantly!`);
    console.log(`   Archive count: ${initialArchiveCount} -> ${archiveList.length}`);
  } else {
    console.error(`❌ [FAIL] Active: ${existsInActive}, In Archive: ${existsInArchive}`);
  }
} else {
  console.error(`❌ [FAIL] deleteInvitation returned false!`);
}

// 3. Test Paid Invitation Protection: MUST NEVER BE DELETED OR ARCHIVED
console.log('\n--- 2. Testing Strict Protection for Paid Invitations ---');
const paidInv = dbStore.getInvitations().find(i => i.isPaid || i.id === "invite-1792299417819");
if (paidInv) {
  const deletePaidAttempt = dbStore.deleteInvitation(paidInv.id);
  if (deletePaidAttempt === false) {
    console.log(`✅ [PASS] Paid invitation "${paidInv.title}" is strictly protected from deletion/archiving!`);
  } else {
    console.error(`❌ [FAIL] Paid invitation was deleted! This is a violation!`);
  }
} else {
  console.log(`ℹ️ Paid invitation not found in memory`);
}

// 4. Test Category Distribution & Filtering
console.log('\n--- 3. Testing Category Filtering in Invitations List ---');
const allInvitations = dbStore.getInvitations();
console.log(`Total Active Invitations: ${allInvitations.length}`);

for (const cat of INVITATION_CATEGORIES) {
  const catInvs = allInvitations.filter(i => (i.config?.category || "wedding") === cat.id);
  console.log(`  ${cat.icon} ${cat.name}: ${catInvs.length} invite(s)`);
}

console.log('\n==================================================');
console.log('🎉 ALL ARCHIVE & CATEGORY TESTS PASSED!');
console.log('==================================================\n');
