// Fix Suman & Vishal's invitation music and ensure each invitation has its own unique music
const DB_URL = 'https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data.json';

async function fixMusic() {
  console.log('Fetching live database from Firebase...');
  const res = await fetch(DB_URL);
  const db = await res.json();
  const invs = Array.isArray(db.invitations) ? db.invitations : Object.values(db.invitations || {});

  console.log(`Found ${invs.length} invitations in database.`);

  invs.forEach((inv, i) => {
    if (!inv.config) inv.config = {};
    const isSuman = inv.id === 'invite-1792299417819' || inv.slug === 'suman-vishal' || 
                    (inv.config.brideName === 'Suman' && inv.config.groomName === 'Vishal' && !inv.title?.includes('(Copy)'));

    if (isSuman) {
      console.log(`\n🎵 Setting Suman & Vishal's specific music tracks:`);
      // 1. Suman & Vishal specific tracks
      inv.config.startingMusicUrl = 'https://drive.google.com/uc?export=download&id=1qKhE7CtMAbOVHZm507SxcCqCnBwA8E2-';
      inv.config.startingMusicTitle = 'Vakratunda Ganesh Mantra';
      inv.config.startingMusicArtist = 'Traditional Sanskrit Chants';
      inv.config.startingMusicEnabled = true;
      inv.config.startingMusicLoop = true;

      inv.config.musicUrl = 'https://drive.google.com/uc?export=download&id=1qYZTfellhe_5X_dpAfIVapemWZA8eUhJ';
      inv.config.musicTitle = 'Manglashake';
      inv.config.musicArtist = 'Traditional Wedding Melody';
      inv.config.mainMusicEnabled = true;
      inv.config.loopMusic = true;

      inv.config.autoPlayMusic = true;
      inv.config.showMusic = true;
      inv.config.showMusicWidget = true;
      inv.config.musicVolume = 0.8;
      inv.config.startingMusicVolume = 0.8;
      inv.config.isMuted = false;

      // Ensure driveStorage folder is specifically for Suman & Vishal
      if (!inv.driveStorage) inv.driveStorage = {};
      inv.driveStorage.folderName = 'Suman & Vishal (Snehalata Marriage Hall, Neamatpur, WB)';
      console.log('  -> Set Vakratunda Ganesh Mantra + Manglashake for Suman & Vishal');
    } else {
      console.log(`\n📀 Separating music for "${inv.title}" (ID: ${inv.id}):`);
      // Keep other invitations separate! They get their own clean default presets
      if (!inv.config.musicUrl || inv.config.musicUrl.includes('1qYZTfellhe_5X_dpAfIVapemWZA8eUhJ')) {
        inv.config.musicUrl = '/music_wedding.mp3';
        inv.config.musicTitle = 'Royal Shehnai & Sitar Melody';
        inv.config.musicArtist = 'Indian Classical Ensemble';
      }
      if (!inv.config.startingMusicUrl || inv.config.startingMusicUrl.includes('1qKhE7CtMAbOVHZm507SxcCqCnBwA8E2-')) {
        inv.config.startingMusicUrl = '/music_intro.mp3';
        inv.config.startingMusicTitle = 'Soft Flute & Divine Harp';
        inv.config.startingMusicArtist = 'Opening Prelude';
      }
      inv.config.startingMusicEnabled = true;
      inv.config.mainMusicEnabled = true;
      inv.config.autoPlayMusic = true;
      inv.config.showMusic = true;
      inv.config.showMusicWidget = true;
      console.log(`  -> Configured independent separate audio tracks for ${inv.title}`);
    }
  });

  db.invitations = invs;
  console.log('\n💾 Writing updated independent invitations back to Firebase...');
  const putRes = await fetch(DB_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(db)
  });

  console.log('Firebase Database Response:', putRes.status, putRes.statusText);
}

fixMusic().catch(console.error);
