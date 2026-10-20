import fs from 'fs';

const storePath = 'd:/Website/ds_envite/Frontend/src/data/store.js';
const fullPath = 'd:/Website/ds_envite/Frontend/scripts/suman_full.json';

const full = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

const primarySuman = {
  ...full,
  id: "invite-1792299417819",
  customerId: "user-customer",
  title: "Suman & Vishal's Wedding Invitation",
  slug: "suman-vishal",
  customSlug: "suman-vishal",
  isCustomSlugManuallySet: true,
  isPaid: true,
  status: "published",
  shareText: "We are thrilled to invite you to our wedding celebration! View our digital invitation here: {url} - Suman & Vishal",
  config: {
    ...full.config,
    brideName: "Suman",
    groomName: "Vishal",
    weddingVenue: "Snehalata Marriage Hall",
    weddingAddress: "Neamatpur, WB",
    weddingDate: "2026-11-24T19:00",
    weddingMapUrl: "https://maps.app.goo.gl/8r1eTfdEMwWu2uS58",
    receptionVenue: "Delight Marriage Hall",
    receptionAddress: "Chinakuri Bazaar, WB",
    receptionDate: "2026-11-29",
    receptionMapUrl: "https://maps.app.goo.gl/dfYzXxKh276PELCd6"
  }
};

let storeCode = fs.readFileSync(storePath, 'utf8');

// Normalize to LF for replacement
const isCRLF = storeCode.includes('\r\n');
if (isCRLF) {
  storeCode = storeCode.replace(/\r\n/g, '\n');
}

const startTag = 'const INITIAL_INVITATIONS = [';
const endTag = '  {\n    id: "invite-demo",';

const startIdx = storeCode.indexOf(startTag);
const endIdx = storeCode.indexOf(endTag);

if (startIdx !== -1 && endIdx !== -1) {
  const newHeader = `const INITIAL_INVITATIONS = [\n  ${JSON.stringify(primarySuman, null, 2)},\n`;
  storeCode = storeCode.slice(0, startIdx) + newHeader + storeCode.slice(endIdx);
  if (isCRLF) {
    storeCode = storeCode.replace(/\n/g, '\r\n');
  }
  fs.writeFileSync(storePath, storeCode, 'utf8');
  console.log('Successfully updated store.js with full Suman & Vishal configuration!');
} else {
  console.error('Could not find markers in store.js', { startIdx, endIdx });
}
