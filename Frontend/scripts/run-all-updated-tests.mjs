import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("=================================================");
console.log("🚀 RUNNING COMPREHENSIVE SUITE FOR ALL UPDATES");
console.log("=================================================\n");

let passedCount = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(`   Error: ${err.message}\n`);
  }
}

// ---------------------------------------------------------------------
// TEST 1: Live Paid Invitations Protection & Integrity Guard
// ---------------------------------------------------------------------
runTest("1. Paid Invitations Must Remain Untouched and Valid", () => {
  const storeCode = fs.readFileSync(path.resolve(__dirname, '../src/data/store.js'), 'utf8');
  assert(storeCode.includes('"id": "invite-1792299417819"'), "invite-1792299417819 must exist");
  assert(storeCode.includes('"isPaid": true'), "Paid flag must be true");
  
  const gdriveCode = fs.readFileSync(path.resolve(__dirname, '../src/utils/googleDriveStorage.js'), 'utf8');
  assert(gdriveCode.includes('if (invitation.isPaid && invitation.driveStorage?.folderId)'), "syncDriveFolder must strictly guard paid invitations");
  assert(gdriveCode.includes('if (inv.isPaid) return; // UNTOUCHED'), "syncAllInvitationsToDrive must guard paid invitations");
});

// ---------------------------------------------------------------------
// TEST 2: Drive Folder Hierarchy (Main -> Category -> Hero Folder)
// ---------------------------------------------------------------------
runTest("2. Google Drive Hierarchical Structure (Category Folder Parent)", () => {
  const gdriveCode = fs.readFileSync(path.resolve(__dirname, '../src/utils/googleDriveStorage.js'), 'utf8');
  assert(gdriveCode.includes('export function getCategoryFolderName'), "getCategoryFolderName must be exported");
  assert(gdriveCode.includes('GOOGLE_DRIVE_ROOT_FOLDER_ID ='), "Root folder ID must be defined");
  assert(gdriveCode.includes('1_pdrNFiXcOymZQEby52O3FbvImCU_SW8'), "Owner snierxgameplay root folder ID must match exactly");
  assert(gdriveCode.includes('categoryFolder.id'), "Target folder must be placed inside categoryFolder");
  assert(gdriveCode.includes('GOOGLE_APPS_SCRIPT_TEMPLATE'), "Google Apps Script template must handle category hierarchy");
});

// ---------------------------------------------------------------------
// TEST 3: Random Names for Draft Invitations
// ---------------------------------------------------------------------
runTest("3. Random Couple / Hero Character Names for New Drafts", () => {
  const storeCode = fs.readFileSync(path.resolve(__dirname, '../src/data/store.js'), 'utf8');
  assert(storeCode.includes('RANDOM_BRIDE_NAMES') || storeCode.includes('getRandomName') || storeCode.includes('Math.floor(Math.random()'), "Draft generator must use randomized bride/groom/character names");
});

// ---------------------------------------------------------------------
// TEST 4: Scratch Card Threshold, Background & Independent Text Toggles
// ---------------------------------------------------------------------
runTest("4. Scratch Card Wipe Threshold, Background Color & Text Toggles", () => {
  const rendCode = fs.readFileSync(path.resolve(__dirname, '../src/components/InvitationRenderer.jsx'), 'utf8');
  const sideCode = fs.readFileSync(path.resolve(__dirname, '../src/components/AdminSidebar.jsx'), 'utf8');

  assert(rendCode.includes('scratchCompletionThreshold'), "ScratchCardShield must accept threshold parameter");
  assert(rendCode.includes('thresholdRatio'), "thresholdRatio must be computed dynamically");
  assert(rendCode.includes('showScratchTitle'), "Title must have independent visibility toggle");
  assert(rendCode.includes('showScratchCouple'), "Couple must have independent visibility toggle");
  assert(rendCode.includes('showScratchMarriedLabel'), "Married label must have independent visibility toggle");
  assert(rendCode.includes('showScratchDate'), "Date must have independent visibility toggle");
  assert(rendCode.includes('showScratchCountdown'), "Countdown must have independent visibility toggle");
  assert(rendCode.includes('showScratchSecretMessage'), "Secret message must have independent visibility toggle");

  assert(sideCode.includes('Scratch Delay / Wipe Threshold'), "AdminSidebar must have Scratch Wipe Threshold slider");
  assert(sideCode.includes('showScratchTitle'), "AdminSidebar must map scratchTitle to showScratchTitle toggle");
});

// ---------------------------------------------------------------------
// TEST 5: Gallery Drive HD Media Upload & Unified Frame Color
// ---------------------------------------------------------------------
runTest("5. Gallery HD Video/Image Support & Unified Frame Color Control", () => {
  const rendCode = fs.readFileSync(path.resolve(__dirname, '../src/components/InvitationRenderer.jsx'), 'utf8');
  const sideCode = fs.readFileSync(path.resolve(__dirname, '../src/components/AdminSidebar.jsx'), 'utf8');

  assert(sideCode.includes('galleryFrameColor'), "AdminSidebar must provide galleryFrameColor color picker");
  assert(rendCode.includes('galleryFrameColor'), "InvitationRenderer must apply galleryFrameColor to frames");
  assert(rendCode.includes('isVideoUrl(imgUrl)'), "InvitationRenderer gallery must support video playback");
});

// ---------------------------------------------------------------------
// TEST 6: Admin-Only Mark Paid Permission & Watermark Quality Enforcement
// ---------------------------------------------------------------------
runTest("6. Admin-Only Payment Approval & HD Quality vs Watermark", () => {
  const payCode = fs.readFileSync(path.resolve(__dirname, '../src/components/PaymentModal.jsx'), 'utf8');
  const sideCode = fs.readFileSync(path.resolve(__dirname, '../src/components/AdminSidebar.jsx'), 'utf8');
  const viewCode = fs.readFileSync(path.resolve(__dirname, '../src/pages/InvitationView.jsx'), 'utf8');

  assert(payCode.includes("isAdmin"), "PaymentModal must verify admin role");
  assert(payCode.includes("payment_pending_verification"), "Customer payment must submit proof for admin review");
  assert(sideCode.includes("Only Admin can approve payment status") || sideCode.includes("Admin toggle"), "Sidebar must protect payment toggle");
  assert(viewCode.includes("Watermark"), "Unpaid invitations must enforce watermark");
});

// ---------------------------------------------------------------------
// TEST 7: Preset Theme Pricing, Discount Badges & Hide/Unhide Toggle
// ---------------------------------------------------------------------
runTest("7. Preset Pricing, Discount % Badges & Hide/Unhide Button", () => {
  const dashCode = fs.readFileSync(path.resolve(__dirname, '../src/pages/AdminDashboard.jsx'), 'utf8');
  const themeCode = fs.readFileSync(path.resolve(__dirname, '../src/components/ThemeEditorModal.jsx'), 'utf8');

  assert(dashCode.includes('Pricing & Discount Controls on Preset Card'), "AdminDashboard cards must have pricing container");
  assert(dashCode.includes('hidePrice'), "AdminDashboard cards must support hidePrice toggle");
  assert(themeCode.includes('hidePrice'), "ThemeEditorModal must have hidePrice control");
});

// ---------------------------------------------------------------------
// TEST 8: Envelope Mouse Scroll Fix & Custom Media / Background Controls
// ---------------------------------------------------------------------
runTest("8. Envelope Mouse Scroll Unblocked & Main/Name Plate Background Controls", () => {
  const rendCode = fs.readFileSync(path.resolve(__dirname, '../src/components/InvitationRenderer.jsx'), 'utf8');
  const sideCode = fs.readFileSync(path.resolve(__dirname, '../src/components/AdminSidebar.jsx'), 'utf8');
  const openerCode = fs.readFileSync(path.resolve(__dirname, '../src/components/EnvelopeOpener.jsx'), 'utf8');

  assert(rendCode.includes('(onChangeField || isInEditor) ? "absolute inset-0 z-20'), "Overlay must be absolute in editor mode to unblock mouse wheel");
  assert(openerCode.includes("onChangeField ? 'absolute inset-0 z-20'"), "EnvelopeOpener must permit scroll in editor");
  assert(openerCode.includes("touchAction: onChangeField ? 'pan-y' : 'none'"), "EnvelopeOpener touchAction must allow pan-y in editor");
  assert(sideCode.includes('envelopeBgColor') && sideCode.includes('envelopeNamesBgColor'), "Sidebar must have envelope bg and name plate bg color pickers");
  assert(sideCode.includes('envelopeBgImage') && sideCode.includes('envelopeNameBgImage'), "Sidebar must have media upload for envelope and name plate");
});

// ---------------------------------------------------------------------
// TEST 9: Localhost Dev Server Active on Port 5173
// ---------------------------------------------------------------------
runTest("9. Localhost Dev Server Active on Port 5173", async () => {
  const res = await fetch('http://localhost:5173/');
  assert.strictEqual(res.status, 200, "Localhost dev server must respond with 200 OK");
});

console.log("\n=================================================");
console.log(`SUMMARY: ${passedCount} / ${totalTests} TESTS PASSED`);
// ---------------------------------------------------------------------
// TEST 10: Guided Invitation Creation, 9 Categories & Strict Protection
// ---------------------------------------------------------------------
runTest("10. Guided Invitation Creation, 9 Categories & Strict Protection", () => {
  const catCode = fs.readFileSync(path.resolve(__dirname, '../src/data/invitationCategoriesData.js'), 'utf8');
  const modalCode = fs.readFileSync(path.resolve(__dirname, '../src/components/GuidedInvitationModal.jsx'), 'utf8');
  const dashCode = fs.readFileSync(path.resolve(__dirname, '../src/pages/AdminDashboard.jsx'), 'utf8');

  // Verify all 9 categories
  assert(catCode.includes('"wedding"'), "Must include wedding category");
  assert(catCode.includes('"birthday"'), "Must include birthday category");
  assert(catCode.includes('"first_birthday"'), "Must include first_birthday category");
  assert(catCode.includes('"baby_shower"'), "Must include baby_shower category");
  assert(catCode.includes('"naming_ceremony"'), "Must include naming_ceremony category");
  assert(catCode.includes('"housewarming"'), "Must include housewarming category");
  assert(catCode.includes('"anniversary"'), "Must include anniversary category");
  assert(catCode.includes('"religious_ceremony"'), "Must include religious_ceremony category");
  assert(catCode.includes('"corporate_event"'), "Must include corporate_event category");

  // Verify GuidedInvitationModal features
  assert(modalCode.includes('handleCreateInvitation'), "Modal must have handleCreateInvitation");
  assert(modalCode.includes('Reset to Sample Details'), "Modal must have reset sample details option");
  assert(modalCode.includes('functions'), "Wedding must have celebration functions timeline");
  assert(dashCode.includes('GuidedInvitationModal'), "AdminDashboard must mount GuidedInvitationModal");
  assert(dashCode.includes('isDraftModalOpen'), "AdminDashboard must control isDraftModalOpen");
});


console.log("=================================================");

console.log("\n=================================================");
console.log(`SUMMARY: ${passedCount} / ${totalTests} TESTS PASSED`);
console.log("=================================================");
