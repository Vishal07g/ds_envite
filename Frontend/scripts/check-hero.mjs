async function checkHero() {
  const res = await fetch('https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data/invitations.json');
  const invs = await res.json();
  const list = Array.isArray(invs) ? invs : Object.values(invs);
  for (const i of list) {
    console.log(`ID: ${i.id}`);
    console.log(`  heroImage: ${i.config?.heroImage}`);
    console.log(`  coverHeroScale: ${i.config?.coverHeroScale}`);
    console.log(`  coverMatchUploadedSize: ${i.config?.coverMatchUploadedSize}`);
  }
}

checkHero().catch(console.error);

