import fs from 'fs';

async function main() {
  const res = await fetch('https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data.json');
  const db = await res.json();
  const invs = Array.isArray(db.invitations) ? db.invitations : Object.values(db.invitations || {});
  const suman = invs.find(i => i.id === 'invite-1792299417819' || (i.config?.brideName === 'Suman' && i.config?.groomName === 'Vishal'));
  if (suman) {
    console.log('Found Suman & Vishal Invitation:');
    console.log('ID:', suman.id);
    console.log('Title:', suman.title);
    console.log('Slug:', suman.slug);
    console.log('CustomSlug:', suman.customSlug);
    console.log('Config bride/groom:', suman.config?.brideName, suman.config?.groomName);
    console.log('Config venue:', suman.config?.weddingVenue, suman.config?.weddingAddress);
    fs.writeFileSync('d:/Website/ds_envite/Frontend/scripts/suman_full.json', JSON.stringify(suman, null, 2));
    console.log('Saved full json to d:/Website/ds_envite/Frontend/scripts/suman_full.json');
  } else {
    console.log('Suman not found in Firebase');
  }
}

main().catch(console.error);
