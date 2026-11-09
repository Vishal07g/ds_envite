import dbStore from '../src/data/store.js';

const invs = dbStore.getInvitations();
console.log("Current invitations count:", invs.length);
invs.forEach((inv, idx) => {
  console.log(`[${idx}] id: ${inv.id}`);
  console.log(`    title: "${inv.title}"`);
  console.log(`    isPaid: ${inv.isPaid}`);
  console.log(`    category: ${inv.config?.category || 'wedding'}`);
  console.log(`    bride: "${inv.config?.brideName || inv.config?.coverBrideText}"`);
  console.log(`    groom: "${inv.config?.groomName || inv.config?.coverGroomText}"`);
  console.log(`    heroName: "${inv.config?.heroName || inv.config?.heroCharacter}"`);
  console.log(`    coverCouple: "${inv.config?.coverBrideText} & ${inv.config?.coverGroomText}"`);
});

