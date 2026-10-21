const FIREBASE_DB_URL = 'https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data.json';

function extractDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const apiMatch = trimmed.match(/\/drive\/v3\/files\/([a-zA-Z0-9_-]{15,})/);
  if (apiMatch) return apiMatch[1];
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{15,})/);
  if (fileDMatch) return fileDMatch[1];
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{15,})/);
  if (dMatch) return dMatch[1];
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (idMatch) return idMatch[1];
  return null;
}

function formatDriveDirectUrl(url, type = 'image') {
  if (!url || typeof url !== 'string') return url;
  const fileId = extractDriveFileId(url);
  if (!fileId) return url;
  if (type === 'audio' || type === 'music' || type === 'sound') {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

async function fixFirebaseData() {
  console.log('Fetching live database from Firebase...');
  const res = await fetch(FIREBASE_DB_URL);
  const db = await res.json();
  const invitations = Array.isArray(db.invitations) ? db.invitations : Object.values(db.invitations || {});
  
  let fixedCount = 0;
  const IMAGE_KEYS = [
    'heroImage', 'storyImage', 'scratchImage', 'scratchSectionBgImage',
    'customSacredSymbolImg', 'envelopeWaxSealImg', 'envelopeSymbolImg', 'envelopeBgImage',
    'galleryImage1', 'galleryImage2', 'galleryImage3', 'galleryImage4', 'galleryImage5',
    'galleryImage6', 'galleryImage7', 'galleryImage8', 'galleryImage9', 'galleryImage10'
  ];
  const AUDIO_KEYS = ['musicUrl', 'startingMusicUrl'];

  invitations.forEach((inv, i) => {
    const cfg = inv.config || {};
    IMAGE_KEYS.forEach(key => {
      if (cfg[key] && typeof cfg[key] === 'string' && cfg[key].includes('drive')) {
        const direct = formatDriveDirectUrl(cfg[key], 'image');
        if (direct !== cfg[key]) {
          console.log(`[Inv ${i}] Fixed image "${key}":\n  Old: ${cfg[key]}\n  New: ${direct}`);
          cfg[key] = direct;
          fixedCount++;
        }
      }
    });
    AUDIO_KEYS.forEach(key => {
      if (cfg[key] && typeof cfg[key] === 'string' && cfg[key].includes('drive')) {
        const direct = formatDriveDirectUrl(cfg[key], 'audio');
        if (direct !== cfg[key]) {
          console.log(`[Inv ${i}] Fixed audio "${key}":\n  Old: ${cfg[key]}\n  New: ${direct}`);
          cfg[key] = direct;
          fixedCount++;
        }
      }
    });
  });

  console.log(`Total URLs updated: ${fixedCount}`);
  if (fixedCount > 0) {
    db.invitations = invitations;
    const updateRes = await fetch(FIREBASE_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db)
    });
    console.log('Firebase update status:', updateRes.status, updateRes.statusText);
  }
}

fixFirebaseData().catch(console.error);
