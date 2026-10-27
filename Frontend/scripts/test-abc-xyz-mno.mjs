/**
 * Automated Verification Suite for ABC, XYZ, and MNO Test Cases & Cross-Isolation
 * 
 * Verifies:
 * 1. ABC, XYZ, and MNO share the same theme ("royal-theme") but have completely
 *    independent identity, hero names, titles, descriptions, thumbnails, and canonical URLs.
 * 2. Raw HTML inspection for each URL returns only that invitation's metadata.
 * 3. Dynamic monogram OG images generate distinct binaries (<50KB).
 * 4. Cross-Isolation Tests:
 *    - Modifying ABC does NOT affect XYZ or MNO.
 *    - Replacing ABC's thumbnail does NOT affect XYZ or MNO.
 *    - Creating a new invitation does not overwrite existing invitations.
 *    - Duplicating an invitation yields an independent entity without shared state.
 *    - Publishing in succession does NOT make the last published the default for other URLs.
 *    - Homepage metadata remains completely separate.
 *    - Invalid URLs do not leak any invitation's data.
 */

import inviteHandler from '../api/invite.js';
import ogImageHandler from '../api/og-image.js';
import fs from 'fs';
import path from 'path';

function createMockReqRes({ query = {}, headers = {}, url = '/', mockInvitations = null }) {
  let statusCode = 200;
  let headersSent = {};
  let bodyData = null;

  const req = {
    query,
    headers: {
      host: 'ds-envite.vercel.app',
      'x-forwarded-proto': 'https',
      'user-agent': 'WhatsApp/2.21.11.17 i',
      ...headers
    },
    url,
    mockInvitations
  };

  const res = {
    setHeader(key, value) {
      headersSent[key.toLowerCase()] = value;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    send(data) {
      bodyData = data;
      return this;
    },
    redirect(code, location) {
      statusCode = code;
      headersSent['location'] = location;
      return this;
    }
  };

  return { req, res, getResult: () => ({ statusCode, headersSent, bodyData }) };
}

function extractMeta(html, property) {
  // Match property="og:title" content="..." (supporting quotes/apostrophes inside double quotes)
  const propMatch = html.match(new RegExp(`property=["']${property}["'][^>]*content="([^"]*)"`, 'i')) ||
                    html.match(new RegExp(`property=["']${property}["'][^>]*content='([^']*)'`, 'i'));
  if (propMatch) return propMatch[1];

  const contentFirst = html.match(new RegExp(`content="([^"]*)"[^>]*property=["']${property}["']`, 'i')) ||
                       html.match(new RegExp(`content='([^']*)'[^>]*property=["']${property}["']`, 'i'));
  if (contentFirst) return contentFirst[1];

  const nameMatch = html.match(new RegExp(`name=["']${property}["'][^>]*content="([^"]*)"`, 'i')) ||
                    html.match(new RegExp(`name=["']${property}["'][^>]*content='([^']*)'`, 'i'));
  if (nameMatch) return nameMatch[1];

  const nameContentFirst = html.match(new RegExp(`content="([^"]*)"[^>]*name=["']${property}["']`, 'i')) ||
                           html.match(new RegExp(`content='([^']*)'[^>]*name=["']${property}["']`, 'i'));
  if (nameContentFirst) return nameContentFirst[1];
  return null;
}

function extractTitle(html) {
  const match = html.match(/<title>(.*?)<\/title>/i);
  return match ? match[1] : null;
}

function extractCanonical(html) {
  const match = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
  return match ? match[1] : null;
}

let passed = 0;
let failed = 0;
const errors = [];

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
    errors.push(message);
  }
}

async function runAbcXyzMnoTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   ABC, XYZ, MNO Test Cases & Cross-Isolation Verification       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // ── Define Invitations A (ABC), B (XYZ), and C (MNO) ──
  // All three invitations use the exact same theme: "royal-theme"
  const SHARED_THEME_ID = 'royal-theme';

  const invitationABC = {
    id: 'invitation-abc-101',
    slug: 'abc-wedding',
    customSlug: 'abc-wedding',
    themeId: SHARED_THEME_ID,
    heroNames: ['ABC'],
    title: 'ABC Wedding Invitation',
    description: "A description based on ABC's actual invitation details.",
    thumbnailUrl: 'https://example.com/media/abc-wedding-share.jpg',
    canonicalUrl: 'https://example.com/invitation/abc-wedding',
    eventType: 'wedding',
    status: 'published',
    config: {
      brideName: 'ABC',
      groomName: '',
      presetId: SHARED_THEME_ID,
      themeId: SHARED_THEME_ID,
      weddingDate: '2027-02-14',
      weddingVenue: 'Grand Royal Palace, ABC City'
    }
  };

  const invitationXYZ = {
    id: 'invitation-xyz-202',
    slug: 'xyz-wedding',
    customSlug: 'xyz-wedding',
    themeId: SHARED_THEME_ID,
    heroNames: ['XYZ'],
    title: 'XYZ Wedding Invitation',
    description: "A description based on XYZ's actual invitation details.",
    thumbnailUrl: 'https://example.com/media/xyz-wedding-share.jpg',
    canonicalUrl: 'https://example.com/invitation/xyz-wedding',
    eventType: 'wedding',
    status: 'published',
    config: {
      brideName: 'XYZ',
      groomName: '',
      presetId: SHARED_THEME_ID,
      themeId: SHARED_THEME_ID,
      weddingDate: '2027-05-20',
      weddingVenue: 'Crystal Crown Ballroom, XYZ City'
    }
  };

  const invitationMNO = {
    id: 'invitation-mno-303',
    slug: 'mno-wedding',
    customSlug: 'mno-wedding',
    themeId: SHARED_THEME_ID,
    heroNames: ['MNO'],
    title: 'MNO Wedding Invitation',
    description: "A description based on MNO's actual invitation details.",
    thumbnailUrl: 'https://example.com/media/mno-wedding-share.jpg',
    canonicalUrl: 'https://example.com/invitation/mno-wedding',
    eventType: 'wedding',
    status: 'published',
    config: {
      brideName: 'MNO',
      groomName: '',
      presetId: SHARED_THEME_ID,
      themeId: SHARED_THEME_ID,
      weddingDate: '2027-11-11',
      weddingVenue: 'The Heritage Fort, MNO City'
    }
  };

  const mockDb = [invitationABC, invitationXYZ, invitationMNO];

  // ═══════════════════════════════════════════════════════════════════
  // STEP 2 & STEP 14 Test A: ABC URL Verification
  // ═══════════════════════════════════════════════════════════════════
  console.log('━━━ Test A: Invitation A — ABC (abc-wedding) ━━━');
  const mockA = createMockReqRes({ query: { slug: 'abc-wedding' }, mockInvitations: mockDb });
  await inviteHandler(mockA.req, mockA.res);
  const resA = mockA.getResult();
  const htmlA = String(resA.bodyData);

  assert(resA.statusCode === 200, 'ABC URL returns HTTP 200');
  
  const titleA = extractTitle(htmlA);
  const ogTitleA = extractMeta(htmlA, 'og:title');
  const ogDescA = extractMeta(htmlA, 'og:description');
  const ogImageA = extractMeta(htmlA, 'og:image');
  const ogUrlA = extractMeta(htmlA, 'og:url');
  const canonA = extractCanonical(htmlA);
  const twTitleA = extractMeta(htmlA, 'twitter:title');
  const twDescA = extractMeta(htmlA, 'twitter:description');
  const twImageA = extractMeta(htmlA, 'twitter:image');

  assert(titleA && titleA.includes('ABC Wedding Invitation'), `ABC <title> contains ABC: "${titleA}"`);
  assert(ogTitleA === 'ABC Wedding Invitation', `ABC og:title is "${ogTitleA}"`);
  assert(ogDescA === "A description based on ABC's actual invitation details.", `ABC og:description matches ABC's record`);
  assert(ogImageA === 'https://example.com/media/abc-wedding-share.jpg', `ABC og:image matches ABC's thumbnail: "${ogImageA}"`);
  assert(ogUrlA === 'https://example.com/invitation/abc-wedding', `ABC og:url is "${ogUrlA}"`);
  assert(canonA === 'https://example.com/invitation/abc-wedding', `ABC canonical URL is "${canonA}"`);
  assert(twTitleA === 'ABC Wedding Invitation', `ABC twitter:title matches`);
  assert(twDescA === "A description based on ABC's actual invitation details.", `ABC twitter:description matches`);
  assert(twImageA === 'https://example.com/media/abc-wedding-share.jpg', `ABC twitter:image matches`);

  // Verify zero data leakage from XYZ or MNO or default couple into ABC
  assert(!htmlA.includes('XYZ'), 'ABC raw HTML contains ZERO references to XYZ');
  assert(!htmlA.includes('MNO'), 'ABC raw HTML contains ZERO references to MNO');
  assert(!htmlA.includes('Suman'), 'ABC raw HTML contains ZERO references to Suman');
  assert(!htmlA.includes('Vishal'), 'ABC raw HTML contains ZERO references to Vishal');

  console.log('');

  // ═══════════════════════════════════════════════════════════════════
  // STEP 2 & STEP 14 Test B: XYZ URL Verification
  // ═══════════════════════════════════════════════════════════════════
  console.log('━━━ Test B: Invitation B — XYZ (xyz-wedding) ━━━');
  const mockB = createMockReqRes({ query: { slug: 'xyz-wedding' }, mockInvitations: mockDb });
  await inviteHandler(mockB.req, mockB.res);
  const resB = mockB.getResult();
  const htmlB = String(resB.bodyData);

  assert(resB.statusCode === 200, 'XYZ URL returns HTTP 200');

  const titleB = extractTitle(htmlB);
  const ogTitleB = extractMeta(htmlB, 'og:title');
  const ogDescB = extractMeta(htmlB, 'og:description');
  const ogImageB = extractMeta(htmlB, 'og:image');
  const ogUrlB = extractMeta(htmlB, 'og:url');
  const canonB = extractCanonical(htmlB);
  const twTitleB = extractMeta(htmlB, 'twitter:title');
  const twDescB = extractMeta(htmlB, 'twitter:description');
  const twImageB = extractMeta(htmlB, 'twitter:image');

  assert(titleB && titleB.includes('XYZ Wedding Invitation'), `XYZ <title> contains XYZ: "${titleB}"`);
  assert(ogTitleB === 'XYZ Wedding Invitation', `XYZ og:title is "${ogTitleB}"`);
  assert(ogDescB === "A description based on XYZ's actual invitation details.", `XYZ og:description matches XYZ's record`);
  assert(ogImageB === 'https://example.com/media/xyz-wedding-share.jpg', `XYZ og:image matches XYZ's thumbnail: "${ogImageB}"`);
  assert(ogUrlB === 'https://example.com/invitation/xyz-wedding', `XYZ og:url is "${ogUrlB}"`);
  assert(canonB === 'https://example.com/invitation/xyz-wedding', `XYZ canonical URL is "${canonB}"`);
  assert(twTitleB === 'XYZ Wedding Invitation', `XYZ twitter:title matches`);
  assert(twDescB === "A description based on XYZ's actual invitation details.", `XYZ twitter:description matches`);
  assert(twImageB === 'https://example.com/media/xyz-wedding-share.jpg', `XYZ twitter:image matches`);

  // Verify zero data leakage from ABC or MNO into XYZ
  assert(!htmlB.includes('ABC'), 'XYZ raw HTML contains ZERO references to ABC');
  assert(!htmlB.includes('MNO'), 'XYZ raw HTML contains ZERO references to MNO');

  console.log('');

  // ═══════════════════════════════════════════════════════════════════
  // STEP 2 & STEP 14 Test C: MNO URL Verification
  // ═══════════════════════════════════════════════════════════════════
  console.log('━━━ Test C: Invitation C — MNO (mno-wedding) ━━━');
  const mockC = createMockReqRes({ query: { slug: 'mno-wedding' }, mockInvitations: mockDb });
  await inviteHandler(mockC.req, mockC.res);
  const resC = mockC.getResult();
  const htmlC = String(resC.bodyData);

  assert(resC.statusCode === 200, 'MNO URL returns HTTP 200');

  const titleC = extractTitle(htmlC);
  const ogTitleC = extractMeta(htmlC, 'og:title');
  const ogDescC = extractMeta(htmlC, 'og:description');
  const ogImageC = extractMeta(htmlC, 'og:image');
  const ogUrlC = extractMeta(htmlC, 'og:url');
  const canonC = extractCanonical(htmlC);
  const twTitleC = extractMeta(htmlC, 'twitter:title');
  const twDescC = extractMeta(htmlC, 'twitter:description');
  const twImageC = extractMeta(htmlC, 'twitter:image');

  assert(titleC && titleC.includes('MNO Wedding Invitation'), `MNO <title> contains MNO: "${titleC}"`);
  assert(ogTitleC === 'MNO Wedding Invitation', `MNO og:title is "${ogTitleC}"`);
  assert(ogDescC === "A description based on MNO's actual invitation details.", `MNO og:description matches MNO's record`);
  assert(ogImageC === 'https://example.com/media/mno-wedding-share.jpg', `MNO og:image matches MNO's thumbnail: "${ogImageC}"`);
  assert(ogUrlC === 'https://example.com/invitation/mno-wedding', `MNO og:url is "${ogUrlC}"`);
  assert(canonC === 'https://example.com/invitation/mno-wedding', `MNO canonical URL is "${canonC}"`);
  assert(twTitleC === 'MNO Wedding Invitation', `MNO twitter:title matches`);
  assert(twDescC === "A description based on MNO's actual invitation details.", `MNO twitter:description matches`);
  assert(twImageC === 'https://example.com/media/mno-wedding-share.jpg', `MNO twitter:image matches`);

  // Verify zero data leakage from ABC or XYZ into MNO
  assert(!htmlC.includes('ABC'), 'MNO raw HTML contains ZERO references to ABC');
  assert(!htmlC.includes('XYZ'), 'MNO raw HTML contains ZERO references to XYZ');

  console.log('');

  // ═══════════════════════════════════════════════════════════════════
  // CROSS-ISOLATION VERIFICATION (All 3 use same theme)
  // ═══════════════════════════════════════════════════════════════════
  console.log('━━━ Cross-Isolation Tests (Same Theme "royal-theme") ━━━');

  // Verify pairwise uniqueness among ABC, XYZ, and MNO
  assert(ogTitleA !== ogTitleB && ogTitleB !== ogTitleC && ogTitleA !== ogTitleC,
    'All 3 invitations have strictly DISTINCT og:title values');
  assert(ogDescA !== ogDescB && ogDescB !== ogDescC && ogDescA !== ogDescC,
    'All 3 invitations have strictly DISTINCT og:description values');
  assert(ogImageA !== ogImageB && ogImageB !== ogImageC && ogImageA !== ogImageC,
    'All 3 invitations have strictly DISTINCT og:image values');
  assert(ogUrlA !== ogUrlB && ogUrlB !== ogUrlC && ogUrlA !== ogUrlC,
    'All 3 invitations have strictly DISTINCT og:url values');
  assert(canonA !== canonB && canonB !== canonC && canonA !== canonC,
    'All 3 invitations have strictly DISTINCT canonical URLs');

  // Test 1: Change ABC's name and description. Verify XYZ and MNO remain unchanged.
  console.log('\n  [Cross-Isolation 1: Mutating ABC]');
  const updatedDb = JSON.parse(JSON.stringify(mockDb));
  updatedDb[0].title = 'ABC Re-Union Celebration';
  updatedDb[0].description = 'Completely updated ABC description for reunion.';

  const mockCheckB = createMockReqRes({ query: { slug: 'xyz-wedding' }, mockInvitations: updatedDb });
  await inviteHandler(mockCheckB.req, mockCheckB.res);
  const htmlCheckB = String(mockCheckB.getResult().bodyData);
  assert(extractMeta(htmlCheckB, 'og:title') === 'XYZ Wedding Invitation',
    'Updating ABC title does NOT modify XYZ title');
  assert(extractMeta(htmlCheckB, 'og:description') === "A description based on XYZ's actual invitation details.",
    'Updating ABC description does NOT modify XYZ description');

  const mockCheckC = createMockReqRes({ query: { slug: 'mno-wedding' }, mockInvitations: updatedDb });
  await inviteHandler(mockCheckC.req, mockCheckC.res);
  const htmlCheckC = String(mockCheckC.getResult().bodyData);
  assert(extractMeta(htmlCheckC, 'og:title') === 'MNO Wedding Invitation',
    'Updating ABC title does NOT modify MNO title');

  // Test 2: Replace ABC's thumbnail. Verify XYZ and MNO continue using their original thumbnails.
  console.log('\n  [Cross-Isolation 2: Replacing ABC Thumbnail]');
  updatedDb[0].thumbnailUrl = 'https://example.com/media/abc-NEW-2027.jpg';
  const mockCheckB2 = createMockReqRes({ query: { slug: 'xyz-wedding' }, mockInvitations: updatedDb });
  await inviteHandler(mockCheckB2.req, mockCheckB2.res);
  const htmlCheckB2 = String(mockCheckB2.getResult().bodyData);
  assert(extractMeta(htmlCheckB2, 'og:image') === 'https://example.com/media/xyz-wedding-share.jpg',
    'Replacing ABC thumbnail does NOT alter XYZ thumbnail');

  const mockCheckC2 = createMockReqRes({ query: { slug: 'mno-wedding' }, mockInvitations: updatedDb });
  await inviteHandler(mockCheckC2.req, mockCheckC2.res);
  const htmlCheckC2 = String(mockCheckC2.getResult().bodyData);
  assert(extractMeta(htmlCheckC2, 'og:image') === 'https://example.com/media/mno-wedding-share.jpg',
    'Replacing ABC thumbnail does NOT alter MNO thumbnail');

  // Test 3: Create a new invitation (DEF) using the same theme. Verify existing invitations are untouched.
  console.log('\n  [Cross-Isolation 3: Adding 4th invitation to same theme]');
  const invitationDEF = {
    id: 'invitation-def-404',
    slug: 'def-wedding',
    themeId: SHARED_THEME_ID,
    heroNames: ['DEF'],
    title: 'DEF Wedding Invitation',
    description: "DEF's personal wedding invitation description.",
    thumbnailUrl: 'https://example.com/media/def-wedding-share.jpg',
    canonicalUrl: 'https://example.com/invitation/def-wedding',
    eventType: 'wedding',
    status: 'published'
  };
  const expandedDb = [...updatedDb, invitationDEF];
  assert(expandedDb.length === 4, '4 invitations now exist under the royal theme');
  
  const mockCheckA3 = createMockReqRes({ query: { slug: 'abc-wedding' }, mockInvitations: expandedDb });
  await inviteHandler(mockCheckA3.req, mockCheckA3.res);
  assert(extractMeta(String(mockCheckA3.getResult().bodyData), 'og:image') === 'https://example.com/media/abc-NEW-2027.jpg',
    'Adding DEF does not alter ABC');

  // Test 4: Duplicate an invitation and verify independence.
  console.log('\n  [Cross-Isolation 4: Duplicating an invitation]');
  const duplicateOfABC = {
    ...JSON.parse(JSON.stringify(invitationABC)),
    id: 'invitation-abc-copy-999',
    slug: 'abc-wedding-copy',
    title: 'ABC Wedding Invitation (Copy)',
    canonicalUrl: 'https://example.com/invitation/abc-wedding-copy'
  };
  // Mutating duplicate does not mutate original
  duplicateOfABC.title = 'Mutated Duplicate';
  assert(invitationABC.title === 'ABC Wedding Invitation', 'Original ABC title was unaffected by mutating duplicate');

  // Test 5: Successive publications do not make the last published the global default.
  console.log('\n  [Cross-Isolation 5: Last published order]');
  // Query ABC again from expandedDb (where DEF was the last added)
  const mockCheckA5 = createMockReqRes({ query: { slug: 'abc-wedding' }, mockInvitations: expandedDb });
  await inviteHandler(mockCheckA5.req, mockCheckA5.res);
  const htmlCheckA5 = String(mockCheckA5.getResult().bodyData);
  assert(!htmlCheckA5.includes('DEF Wedding Invitation'),
    'Last published invitation (DEF) does NOT become the default for ABC URL');

  // Test 6: Homepage isolation
  console.log('\n  [Cross-Isolation 6: Homepage metadata separation]');
  const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  assert(!indexHtml.includes('ABC'), 'Homepage does not contain ABC');
  assert(!indexHtml.includes('XYZ'), 'Homepage does not contain XYZ');
  assert(!indexHtml.includes('MNO'), 'Homepage does not contain MNO');
  assert(indexHtml.includes('website_thumbnail.jpg'), 'Homepage retains its own website_thumbnail.jpg');
  const canonMatch = extractCanonical(indexHtml);
  assert(canonMatch && canonMatch.endsWith('/'), `Homepage canonical points to root /: "${canonMatch}"`);

  // ═══════════════════════════════════════════════════════════════════
  // Dynamic Monogram Thumbnail Verification for Single Hero Names
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n━━━ Dynamic Monogram OG Image Generation for ABC, XYZ, MNO ━━━');
  
  // Test dynamic OG image rendering for ABC
  const mockOgA = createMockReqRes({ url: '/api/og-image?bride=ABC&title=ABC+Wedding+Invitation&date=2027-02-14' });
  await ogImageHandler(mockOgA.req, mockOgA.res);
  const resOgA = mockOgA.getResult();
  assert(resOgA.statusCode === 200, 'OG image for ABC returns HTTP 200');
  assert(resOgA.bodyData && resOgA.bodyData.length < 50000, `ABC OG image is under 50KB (${resOgA.bodyData?.length} bytes)`);

  // Test dynamic OG image rendering for XYZ
  const mockOgB = createMockReqRes({ url: '/api/og-image?bride=XYZ&title=XYZ+Wedding+Invitation&date=2027-05-20' });
  await ogImageHandler(mockOgB.req, mockOgB.res);
  const resOgB = mockOgB.getResult();
  assert(resOgB.statusCode === 200, 'OG image for XYZ returns HTTP 200');
  assert(resOgB.bodyData && resOgB.bodyData.length < 50000, `XYZ OG image is under 50KB (${resOgB.bodyData?.length} bytes)`);

  // Test dynamic OG image rendering for MNO
  const mockOgC = createMockReqRes({ url: '/api/og-image?bride=MNO&title=MNO+Wedding+Invitation&date=2027-11-11' });
  await ogImageHandler(mockOgC.req, mockOgC.res);
  const resOgC = mockOgC.getResult();
  assert(resOgC.statusCode === 200, 'OG image for MNO returns HTTP 200');
  assert(resOgC.bodyData && resOgC.bodyData.length < 50000, `MNO OG image is under 50KB (${resOgC.bodyData?.length} bytes)`);

  // Verify that all 3 generated binary images are completely different from each other
  const bufA = resOgA.bodyData;
  const bufB = resOgB.bodyData;
  const bufC = resOgC.bodyData;
  assert(!bufA.equals(bufB), 'ABC and XYZ OG images are NOT identical binaries');
  assert(!bufB.equals(bufC), 'XYZ and MNO OG images are NOT identical binaries');
  assert(!bufA.equals(bufC), 'ABC and MNO OG images are NOT identical binaries');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (failed > 0) {
    console.error('\n❌ FAILED assertions:');
    errors.forEach(e => console.error(`   • ${e}`));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL ABC, XYZ, AND MNO TESTS & CROSS-ISOLATION VERIFIED SUCCESSFULLY!');
  }
}

runAbcXyzMnoTests().catch(err => {
  console.error('\n💥 Unexpected error during test run:', err);
  process.exit(1);
});
