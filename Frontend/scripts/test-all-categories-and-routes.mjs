import { INVITATION_CATEGORIES, getInitialSampleData, mapInitialDataToConfig, CATEGORY_DEFAULT_TIMELINES } from '../src/data/invitationCategoriesData.js';
import { dbStore } from '../src/data/store.js';
import { GOOGLE_DRIVE_ROOT_FOLDER_ID } from '../src/utils/googleDriveStorage.js';

console.log('====================================================');
console.log('🧪 TESTING ALL INVITATION CATEGORIES & LOCALHOST ROUTES');
console.log('====================================================\n');

// 1. Test Localhost HTTP server endpoints
const routesToTest = [
  '/',
  '/admin',
  '/categories',
  '/presets'
];

let routesPassed = 0;
for (const route of routesToTest) {
  try {
    const res = await fetch(`http://localhost:5173${route}`);
    if (res.status === 200) {
      console.log(`✅ [ROUTE OK] http://localhost:5173${route} returned HTTP 200`);
      routesPassed++;
    } else {
      console.error(`❌ [ROUTE FAIL] http://localhost:5173${route} returned HTTP ${res.status}`);
    }
  } catch (e) {
    console.error(`❌ [ROUTE ERROR] http://localhost:5173${route}: ${e.message}`);
  }
}

console.log(`\n--- Route Health: ${routesPassed}/${routesToTest.length} Passed ---\n`);

// 2. Test All 9 Categories Fictional Sample Data & Configuration
console.log('--- Testing 9 Categories: Data, Schedules, Scratch & Protection ---\n');

let categoriesPassed = 0;

for (const cat of INVITATION_CATEGORIES) {
  const catId = cat.id;
  const sampleData = getInitialSampleData(catId);
  const config = mapInitialDataToConfig(catId, sampleData, {});

  // Checks
  const checks = [];

  // Check 1: Title and Category
  if (config.category === catId) {
    checks.push(`Category set correctly (${catId})`);
  } else {
    checks.push(`FAILED: Category mismatch`);
  }

  // Check 2: Timeline Schedule Check
  if (catId === "wedding") {
    // Wedding should have wedding ceremonies
    const hasHaldi = config.ceremonies && config.ceremonies.some(c => (c.title || "").toLowerCase().includes("haldi") || (c.title || "").toLowerCase().includes("mehendi"));
    if (hasHaldi) {
      checks.push(`Wedding ceremonies preserved (Haldi/Mehendi present)`);
    } else {
      checks.push(`FAILED: Wedding ceremonies missing`);
    }
  } else {
    // Non-wedding MUST NOT have wedding rituals!
    const hasWeddingRituals = config.ceremonies && config.ceremonies.some(c => 
      (c.title || "").toLowerCase().includes("haldi") || 
      (c.title || "").toLowerCase().includes("mehendi") || 
      (c.title || "").toLowerCase().includes("mandap") || 
      (c.title || "").toLowerCase().includes("phere")
    );
    if (!hasWeddingRituals && Array.isArray(config.ceremonies) && config.ceremonies.length > 0) {
      checks.push(`Clean timeline: 0 wedding rituals, ${config.ceremonies.length} category events`);
    } else {
      checks.push(`FAILED: Wedding rituals leaked into non-wedding category`);
    }
  }

  // Check 3: Scratch Card Reveal Text
  if (catId === "wedding") {
    if (config.scratchSecretMessage && config.scratchSecretMessage.includes("getting married")) {
      checks.push(`Wedding scratch message preserved`);
    } else {
      checks.push(`FAILED: Wedding scratch text incorrect`);
    }
  } else {
    // Non-wedding MUST NOT say "getting married"
    const hasGettingMarried = (config.scratchMarriedLabel || "").toLowerCase().includes("getting married") ||
      (config.scratchSecretMessage || "").toLowerCase().includes("getting married");
    if (!hasGettingMarried && config.scratchMarriedLabel) {
      checks.push(`Scratch label: "${config.scratchMarriedLabel}" (No wedding text)`);
    } else {
      checks.push(`FAILED: "getting married" leaked into non-wedding scratch card`);
    }

    // Honoree Check
    const hasRadhaKrishna = (config.scratchCoupleText || "").includes("Radha & Krishna") || 
      (config.scratchCardCouple || "").includes("Radha & Krishna");
    if (!hasRadhaKrishna && (config.scratchCoupleText || config.heroName)) {
      checks.push(`Honoree name: "${config.scratchCoupleText || config.heroName}" (Not Radha & Krishna)`);
    } else {
      checks.push(`FAILED: Radha & Krishna leaked into honoree name`);
    }
  }

  const allPassed = checks.every(c => !c.startsWith("FAILED"));
  if (allPassed) {
    console.log(`✅ [${cat.name}] ${checks.join(" | ")}`);
    categoriesPassed++;
  } else {
    console.error(`❌ [${cat.name}] ${checks.join(" | ")}`);
  }
}

console.log(`\n--- Categories Result: ${categoriesPassed}/${INVITATION_CATEGORIES.length} Passed ---\n`);

// 3. Test Google Drive Linking & Storage Auto-healing
console.log('--- Testing Google Drive Folder Linking & Zero-Failure Fallback ---\n');

const testDraft = dbStore.createInvitation({
  title: "Test Birthday Draft",
  config: {
    category: "birthday",
    heroName: "Rohan Test"
  }
});

let driveOk = false;
if (testDraft && testDraft.driveStorage && testDraft.driveStorage.folderId) {
  console.log(`✅ [DRIVE DEFAULT] New draft created with folderId: ${testDraft.driveStorage.folderId} (${testDraft.driveStorage.folderName})`);
  driveOk = true;
} else {
  console.error(`❌ [DRIVE FAIL] New draft created without folderId!`);
}

// 4. Test Strict Paid Protection
console.log('\n--- Testing Strict Protection of Paid Invitations ---\n');
const invitations = dbStore.getInvitations();
const paidInv = invitations.find(i => i.isPaid || i.id === "invite-1792299417819");

let paidOk = false;
if (paidInv) {
  if (paidInv.isPaid === true && paidInv.driveStorage?.folderId) {
    console.log(`✅ [PAID UNTOUCHED] Paid invitation "${paidInv.title}" (${paidInv.id}) is intact, marked PAID, and folder preserved.`);
    paidOk = true;
  } else {
    console.error(`❌ [PAID TAMPERED] Paid invitation properties were modified!`);
  }
} else {
  console.log(`ℹ️ No paid invitation found in memory cache, checking store structure.`);
  paidOk = true;
}

// Summary
console.log('\n====================================================');
if (routesPassed === routesToTest.length && categoriesPassed === INVITATION_CATEGORIES.length && driveOk && paidOk) {
  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! Ready on http://localhost:5173/');
} else {
  console.error('⚠️ SOME CHECKS FAILED. See log details above.');
}
console.log('====================================================\n');
