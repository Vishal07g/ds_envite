const DB_URL = 'https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data.json';

async function updateDb() {
  console.log('Fetching database from Firebase...');
  const res = await fetch(DB_URL);
  const db = await res.json();
  const invs = Array.isArray(db.invitations) ? db.invitations : Object.values(db.invitations || {});
  
  console.log(`Found ${invs.length} invitations. Updating music URLs to verified Google Drive audio files...`);
  invs.forEach((inv, i) => {
    if (!inv.config) inv.config = {};
    inv.config.startingMusicUrl = 'https://drive.google.com/uc?export=download&id=1qKhE7CtMAbOVHZm507SxcCqCnBwA8E2-';
    inv.config.musicUrl = 'https://drive.google.com/uc?export=download&id=1qYZTfellhe_5X_dpAfIVapemWZA8eUhJ';
    console.log(`Updated invitation [${i}]: "${inv.title}"`);
  });

  db.invitations = invs;
  const putRes = await fetch(DB_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(db)
  });
  console.log('Firebase Realtime Database PUT result:', putRes.status, putRes.statusText);
}

updateDb().catch(console.error);
