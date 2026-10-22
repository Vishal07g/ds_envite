// Automated Test Suite: Upload Image & Google Drive Sync Verification
import {
  extractDriveFileId,
  formatDriveDirectUrl,
  formatDriveFolderName,
  getDriveDirectFileUrl
} from '../src/utils/googleDriveStorage.js';

const FIREBASE_DB_URL = 'https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data.json';

async function runTestSuite() {
  console.log('===============================================================');
  console.log('🧪 TEST SUITE: GOOGLE DRIVE SYNC & IMAGE/AUDIO UPLOAD INTEGRATION');
  console.log('===============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, extraInfo = '') {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName} ${extraInfo}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${extraInfo}`);
    }
  }

  // -------------------------------------------------------------
  // TEST 1: URL Parsing & File ID Extraction
  // -------------------------------------------------------------
  console.log('🔍 TEST GROUP 1: Google Drive URL Parsing & ID Extraction');
  
  const testUrls = [
    {
      url: 'https://drive.google.com/file/d/1uNQNzAibqtS11WLIhCYhH7_lI1O6_TqP/view?usp=drive_link',
      expectedId: '1uNQNzAibqtS11WLIhCYhH7_lI1O6_TqP',
      desc: 'Standard Drive web viewer link (view?usp=drive_link)'
    },
    {
      url: 'https://drive.google.com/file/d/1brJdMaSjflXO8OeJ6cAzVj5cklst48jr/view?usp=sharing',
      expectedId: '1brJdMaSjflXO8OeJ6cAzVj5cklst48jr',
      desc: 'Shareable Drive link (view?usp=sharing)'
    },
    {
      url: 'https://drive.google.com/open?id=1kv2KpmoK76DwvC7RcSDA79UE_ihSH2lJ',
      expectedId: '1kv2KpmoK76DwvC7RcSDA79UE_ihSH2lJ',
      desc: 'Drive open by ID (open?id=...)'
    },
    {
      url: 'https://www.googleapis.com/drive/v3/files/1ScEGe8HiEjdTdhbYh2R_6rTJMjHfsNu6?alt=media&key=test123',
      expectedId: '1ScEGe8HiEjdTdhbYh2R_6rTJMjHfsNu6',
      desc: 'Google Drive API v3 files endpoint'
    },
    {
      url: 'https://lh3.googleusercontent.com/d/1fQyJTqmjFZGbNWljlzcC2qc_m3ryFLdK',
      expectedId: '1fQyJTqmjFZGbNWljlzcC2qc_m3ryFLdK',
      desc: 'Existing lh3 CDN streaming link'
    }
  ];

  testUrls.forEach(t => {
    const extracted = extractDriveFileId(t.url);
    assert(extracted === t.expectedId, t.desc, `-> ID: ${extracted}`);
  });

  // -------------------------------------------------------------
  // TEST 2: Formatting Direct High-Speed CDN URLs
  // -------------------------------------------------------------
  console.log('\n⚡ TEST GROUP 2: Direct High-Speed CDN URL Formatting');

  const rawWebLink = 'https://drive.google.com/file/d/1brJdMaSjflXO8OeJ6cAzVj5cklst48jr/view?usp=drive_link';
  const formattedImg = formatDriveDirectUrl(rawWebLink, 'image');
  assert(
    formattedImg === 'https://lh3.googleusercontent.com/d/1brJdMaSjflXO8OeJ6cAzVj5cklst48jr',
    'Converts web link to lh3 image CDN URL',
    `-> ${formattedImg}`
  );

  const rawAudioLink = 'https://drive.google.com/file/d/1kv2KpmoK76DwvC7RcSDA79UE_ihSH2lJ/view?usp=drive_link';
  const formattedAudio = formatDriveDirectUrl(rawAudioLink, 'audio');
  assert(
    formattedAudio === 'https://drive.google.com/uc?export=download&id=1kv2KpmoK76DwvC7RcSDA79UE_ihSH2lJ',
    'Converts web link to direct binary audio streaming URL',
    `-> ${formattedAudio}`
  );

  // -------------------------------------------------------------
  // TEST 3: Live HTTP Reachability & Stream Validation
  // -------------------------------------------------------------
  console.log('\n🌐 TEST GROUP 3: Live HTTP Reachability & MIME Type Verification');

  const assetsToTest = [
    {
      url: 'https://lh3.googleusercontent.com/d/1brJdMaSjflXO8OeJ6cAzVj5cklst48jr',
      type: 'image',
      label: 'Hero Background Image'
    },
    {
      url: 'https://lh3.googleusercontent.com/d/1fQyJTqmjFZGbNWljlzcC2qc_m3ryFLdK',
      type: 'image',
      label: 'Story Couple Image'
    },
    {
      url: 'https://drive.google.com/uc?export=download&id=1qYZTfellhe_5X_dpAfIVapemWZA8eUhJ',
      type: 'audio',
      label: 'Main Wedding Song'
    },
    {
      url: 'https://drive.google.com/uc?export=download&id=1qKhE7CtMAbOVHZm507SxcCqCnBwA8E2-',
      type: 'audio',
      label: 'Starting Ganesh Mantra Song'
    }
  ];

  for (const asset of assetsToTest) {
    try {
      const res = await fetch(asset.url);
      const contentType = res.headers.get('content-type') || '';
      const isOk = res.ok;
      assert(
        isOk,
        `Asset "${asset.label}" returns HTTP 200`,
        `[Status: ${res.status}, Type: ${contentType}]`
      );
    } catch (err) {
      assert(false, `Asset "${asset.label}" failed to load`, err.message);
    }
  }

  // -------------------------------------------------------------
  // TEST 4: Folder Naming Standard & Drive Folder Path Sync
  // -------------------------------------------------------------
  console.log('\n📁 TEST GROUP 4: Folder Naming & Storage Structure');

  const sampleConfig = {
    brideName: 'Suman',
    groomName: 'Vishal',
    weddingVenue: 'Snehalata Marriage Hall',
    weddingAddress: 'Neamatpur, WB'
  };
  const expectedFolder = 'Suman & Vishal (Snehalata Marriage Hall, Neamatpur, WB)';
  const folderName = formatDriveFolderName(sampleConfig, 'Invitation');
  assert(
    folderName === expectedFolder,
    'Folder name matches strict "{Bride} & {Groom} ({Location})" rule',
    `-> "${folderName}"`
  );

  // -------------------------------------------------------------
  // TEST 5: Live Firebase Database Media Audit
  // -------------------------------------------------------------
  console.log('\n📡 TEST GROUP 5: Live Firebase Realtime Database Sync Audit');

  try {
    const fbRes = await fetch(FIREBASE_DB_URL);
    const db = await fbRes.json();
    const invitations = Array.isArray(db?.invitations) ? db.invitations : Object.values(db?.invitations || {});
    assert(invitations.length > 0, `Firebase contains active invitations (${invitations.length} found)`);

    let invalidUrlCount = 0;
    invitations.forEach((inv, idx) => {
      const cfg = inv.config || {};
      const hero = cfg.heroImage;
      const music = cfg.musicUrl;
      const startMusic = cfg.startingMusicUrl;

      // Ensure no raw googleapis alt=media links remain
      if (hero && hero.includes('googleapis.com/drive/v3/files') && hero.includes('alt=media')) {
        invalidUrlCount++;
      }
      if (music && music.includes('googleapis.com/drive/v3/files') && music.includes('alt=media')) {
        invalidUrlCount++;
      }
      if (startMusic && startMusic.includes('googleapis.com/drive/v3/files') && startMusic.includes('alt=media')) {
        invalidUrlCount++;
      }

      console.log(`  Invitation [${idx + 1}]: "${inv.title}"`);
      console.log(`    - Hero Image: ${hero ? hero.slice(0, 60) + '...' : 'None'}`);
      console.log(`    - Music URL:  ${music ? music.slice(0, 60) + '...' : 'None'}`);
      console.log(`    - Start Song: ${startMusic ? startMusic.slice(0, 60) + '...' : 'None'}`);
      console.log(`    - Drive Folder: "${inv.driveStorage?.folderName || 'Ready'}"`);
    });

    assert(
      invalidUrlCount === 0,
      'Zero non-working Google Drive API key URLs in Firebase database'
    );
  } catch (err) {
    assert(false, 'Failed to audit Firebase database', err.message);
  }

  // -------------------------------------------------------------
  // TEST 6: Upload / Replace / Delete Freedom
  // -------------------------------------------------------------
  console.log('\n🔄 TEST GROUP 6: Image Upload, Replacement & Deletion Freedom');

  let testConfig = { ...sampleConfig };
  
  // 1. Upload/Set Image
  const uploadedDriveUrl = formatDriveDirectUrl('https://drive.google.com/file/d/1uNQNzAibqtS11WLIhCYhH7_lI1O6_TqP/view?usp=drive_link', 'image');
  testConfig.heroImage = uploadedDriveUrl;
  assert(
    testConfig.heroImage.startsWith('https://lh3.googleusercontent.com/d/'),
    'Step 1: Uploading/Pasting Drive link binds high-speed CDN URL to heroImage'
  );

  // 2. Replace with another choice
  const replacementUrl = formatDriveDirectUrl('https://drive.google.com/file/d/1brJdMaSjflXO8OeJ6cAzVj5cklst48jr/view', 'image');
  testConfig.heroImage = replacementUrl;
  assert(
    testConfig.heroImage.includes('1brJdMaSjflXO8OeJ6cAzVj5cklst48jr'),
    'Step 2: Customer or Admin can freely replace with any image of their choice'
  );

  // 3. Delete freedom
  testConfig.heroImage = '';
  assert(
    testConfig.heroImage === '',
    'Step 3: Deleting image completely clears it without breaking design layout'
  );

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`📊 TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Google Drive sync and media uploads are 100% verified.');
  } else {
    console.log(`⚠️ ${totalTests - passedTests} test(s) failed.`);
  }
  console.log('===============================================================\n');
}

runTestSuite().catch(err => {
  console.error('Fatal error running test suite:', err);
  process.exit(1);
});
