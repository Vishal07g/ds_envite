async function checkWishes() {
  const url = 'https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data.json?shallow=true';
  const res = await fetch(url);
  const data = await res.json();
  console.log('saas_data top-level nodes:', Object.keys(data || {}));

  const wishesRes = await fetch('https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data/wishes.json');
  const wishesData = await wishesRes.json();
  console.log('Wishes node present:', !!wishesData);
  if (wishesData) {
    for (const [invId, wishes] of Object.entries(wishesData)) {
      console.log(`- Invitation ${invId} has ${Object.keys(wishes).length} isolated blessings:`);
      for (const [wId, w] of Object.entries(wishes)) {
        console.log(`    [${w.date}] ${w.sender}: "${w.message}"`);
      }
    }
  }

  const codesRes = await fetch('https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data/invitation_codes.json');
  const codesData = await codesRes.json();
  console.log('Unique codes node:', codesData);
}

checkWishes().catch(console.error);

