async function check() {
  const res = await fetch('https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data.json');
  const db = await res.json();
  const invs = Array.isArray(db.invitations) ? db.invitations : Object.values(db.invitations || {});
  console.log('Total invitations in Firebase:', invs.length);
  invs.forEach((inv, i) => {
    console.log(`[${i}] id=${inv.id}, slug=${inv.slug}, customSlug=${inv.customSlug}`);
    console.log(`     title=${inv.title}`);
    console.log(`     bride=${inv.config?.brideName}, groom=${inv.config?.groomName}`);
    console.log(`     venue=${inv.config?.weddingVenue}`);
    console.log(`     socialThumbnailUrl=${inv.socialThumbnailUrl}`);
    console.log(`     thumbnailUrl=${inv.thumbnailUrl}`);
  });
}

check().catch(console.error);
