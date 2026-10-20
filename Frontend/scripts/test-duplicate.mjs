import dbStore from '../src/data/store.js';

async function testDuplicate() {
  const invs = dbStore.getInvitations();
  console.log(`Original invitations count: ${invs.length}`);
  if (invs.length === 0) {
    console.log('No invitations to duplicate');
    return;
  }

  const source = invs[0];
  console.log(`Source invitation: id=${source.id}, title=${source.title}, bride=${source.config?.brideName}, groom=${source.config?.groomName}`);

  const dup = dbStore.duplicateInvitation(source.id);
  console.log(`Duplicated invitation:`);
  console.log(`  id: ${dup.id}`);
  console.log(`  title: ${dup.title}`);
  console.log(`  slug: ${dup.slug}`);
  console.log(`  customSlug: ${dup.customSlug}`);
  console.log(`  config: bride=${dup.config?.brideName}, groom=${dup.config?.groomName}`);

  const shareSlug = dbStore.getInvitationShareSlug(dup);
  console.log(`  shareSlug: ${shareSlug}`);

  // Test retrieval with getInvitationById
  const retrievedById = dbStore.getInvitationById(dup.id);
  console.log(`  Retrieved by ID (${dup.id}):`, Boolean(retrievedById));

  const retrievedBySlug = dbStore.getInvitationById(dup.slug);
  console.log(`  Retrieved by Slug (${dup.slug}):`, Boolean(retrievedBySlug));

  const retrievedByShareSlug = dbStore.getInvitationById(shareSlug);
  console.log(`  Retrieved by ShareSlug (${shareSlug}):`, Boolean(retrievedByShareSlug));
}

testDuplicate().catch(console.error);
