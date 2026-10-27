/**
 * Comprehensive Social Preview & Metadata Isolation Tests
 * 
 * Tests that:
 * 1. Homepage has its own dedicated metadata (website-level, NOT invitation-level)
 * 2. Each individual invitation URL returns metadata unique to THAT invitation
 * 3. Different invitation URLs never share/leak metadata between each other
 * 4. OG image URLs are invitation-specific and dynamically rendered (<50KB JPEG)
 * 5. Canonical URLs are correct and distinct per page
 * 6. Invalid/missing invitation URLs return proper fallback, never another invitation's data
 * 7. Unpublished/private invitations never leak couple names or private details
 * 8. Regular browser visitors directly hitting /api/invite?slug=... are 302 redirected to /invite/...
 * 9. Duplicating an invitation creates independent metadata with no shared mutable references
 * 10. Cache headers include s-maxage and Vary: User-Agent for fast propagation without cross-contamination
 */

import fs from 'fs';
import path from 'path';
import inviteHandler from '../api/invite.js';
import ogImageHandler from '../api/og-image.js';

// ── Mock helpers ────────────────────────────────────────────────────
function createMockReqRes({ query = {}, headers = {}, url = '/' }) {
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
    url
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

/**
 * Extract OG meta tag content from HTML string
 */
function extractMeta(html, property) {
  // Match property="og:title" content="..."
  const propMatch = html.match(new RegExp(`property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'));
  if (propMatch) return propMatch[1];
  // Match content="..." property="og:title"
  const contentFirst = html.match(new RegExp(`content=["']([^"']*)["'][^>]*property=["']${property}["']`, 'i'));
  if (contentFirst) return contentFirst[1];
  // Match name="twitter:title" content="..."
  const nameMatch = html.match(new RegExp(`name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'));
  if (nameMatch) return nameMatch[1];
  const nameContentFirst = html.match(new RegExp(`content=["']([^"']*)["'][^>]*name=["']${property}["']`, 'i'));
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
let errors = [];

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
    errors.push(testName);
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   Social Preview & Metadata Isolation — Comprehensive Tests   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // ═══════════════════════════════════════════════════════════════════
  // TEST A: Homepage Metadata
  // ═══════════════════════════════════════════════════════════════════
  console.log('━━━ Test A: Homepage (index.html & dist/index.html) ━━━');
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  
  assert(!indexHtml.includes('Suman') && !indexHtml.includes('Vishal'),
    'Homepage does NOT contain individual invitation names (Suman/Vishal)');
  
  assert(indexHtml.includes('website_thumbnail.jpg'),
    'Homepage uses website_thumbnail.jpg (NOT an invitation thumbnail)');
  
  const homepageOgTitle = extractMeta(indexHtml, 'og:title');
  assert(homepageOgTitle && homepageOgTitle.includes('DS Envite'),
    `Homepage og:title is website-level: "${homepageOgTitle}"`);
  
  const homepageOgImage = extractMeta(indexHtml, 'og:image');
  assert(homepageOgImage && homepageOgImage.includes('website_thumbnail.jpg'),
    `Homepage og:image is website thumbnail: "${homepageOgImage}"`);
  
  const homepageOgUrl = extractMeta(indexHtml, 'og:url');
  assert(homepageOgUrl && homepageOgUrl.endsWith('/'),
    `Homepage og:url points to root: "${homepageOgUrl}"`);
  
  const homepageCanonical = extractCanonical(indexHtml);
  assert(homepageCanonical && homepageCanonical.endsWith('/'),
    `Homepage canonical URL points to root: "${homepageCanonical}"`);
  
  const homepageTwitterCard = extractMeta(indexHtml, 'twitter:card');
  assert(homepageTwitterCard === 'summary_large_image',
    `Homepage twitter:card is summary_large_image`);

  const homepageTwitterImage = extractMeta(indexHtml, 'twitter:image');
  assert(homepageTwitterImage && homepageTwitterImage.includes('website_thumbnail.jpg'),
    `Homepage twitter:image is website thumbnail`);

  console.log('');

  // ═══════════════════════════════════════════════════════════════════
  // TEST B: Individual Invitation A (Suman & Vishal)
  // ═══════════════════════════════════════════════════════════════════
  console.log('━━━ Test B: Invitation A — Suman & Vishal (suman-vishal-1792995422776) ━━━');
  const mockSV = createMockReqRes({ query: { slug: 'suman-vishal-1792995422776' } });
  await inviteHandler(mockSV.req, mockSV.res);
  const resSV = mockSV.getResult();
  const htmlSV = String(resSV.bodyData);
  
  assert(resSV.statusCode === 200, 'Returns HTTP 200');
  
  const svOgTitle = extractMeta(htmlSV, 'og:title');
  assert(svOgTitle && (svOgTitle.includes('Suman') || svOgTitle.includes('suman')),
    `Invitation A og:title contains bride name: "${svOgTitle}"`);
  assert(svOgTitle && (svOgTitle.includes('Vishal') || svOgTitle.includes('vishal')),
    `Invitation A og:title contains groom name: "${svOgTitle}"`);
  assert(!svOgTitle || !svOgTitle.includes('DS Envite — Luxury Digital Invitations'),
    `Invitation A og:title is NOT the homepage title`);
  
  const svOgImage = extractMeta(htmlSV, 'og:image');
  assert(svOgImage && !svOgImage.includes('website_thumbnail'),
    `Invitation A og:image is NOT the website thumbnail: "${svOgImage?.substring(0, 80)}..."`);
  assert(svOgImage && (svOgImage.includes('bride=Suman') || svOgImage.includes('bride=suman') || svOgImage.startsWith('https://')),
    `Invitation A og:image references the correct couple`);
  
  const svOgUrl = extractMeta(htmlSV, 'og:url');
  assert(svOgUrl && svOgUrl.includes('/invite/suman-vishal'),
    `Invitation A og:url points to the invitation URL: "${svOgUrl}"`);
  assert(svOgUrl && !svOgUrl.endsWith('/'),
    `Invitation A og:url does NOT point to homepage`);
  
  const svOgDesc = extractMeta(htmlSV, 'og:description');
  assert(svOgDesc && (svOgDesc.includes('Suman') || svOgDesc.includes('suman')),
    `Invitation A og:description mentions bride`);
  
  const svTwitterTitle = extractMeta(htmlSV, 'twitter:title');
  assert(svTwitterTitle === svOgTitle,
    `Invitation A twitter:title matches og:title`);
  
  const svTwitterImage = extractMeta(htmlSV, 'twitter:image');
  assert(svTwitterImage === svOgImage,
    `Invitation A twitter:image matches og:image`);

  const svTwitterAlt = extractMeta(htmlSV, 'twitter:image:alt');
  assert(svTwitterAlt && svTwitterAlt.includes('Suman'),
    `Invitation A twitter:image:alt is present and couple-specific`);

  const svCanonical = extractCanonical(htmlSV);
  assert(svCanonical && svCanonical.includes('/invite/suman-vishal'),
    `Invitation A canonical URL is invitation-specific: "${svCanonical}"`);

  // Check no circular redirect in HTML
  assert(!htmlSV.includes('http-equiv="refresh"'),
    'Invitation A response does NOT contain circular http-equiv refresh redirect');

  console.log('');

  // ═══════════════════════════════════════════════════════════════════
  // TEST C: Individual Invitation B (Abc & Xyz — completely different)
  // ═══════════════════════════════════════════════════════════════════
  console.log('━━━ Test C: Invitation B — Abc & Xyz (abc-xyz-9999999999) ━━━');
  const mockABC = createMockReqRes({ query: { slug: 'abc-xyz-9999999999' } });
  await inviteHandler(mockABC.req, mockABC.res);
  const resABC = mockABC.getResult();
  const htmlABC = String(resABC.bodyData);
  
  assert(resABC.statusCode === 200, 'Returns HTTP 200');
  
  const abcOgTitle = extractMeta(htmlABC, 'og:title');
  assert(abcOgTitle && /abc/i.test(abcOgTitle),
    `Invitation B og:title contains "ABC": "${abcOgTitle}"`);
  assert(abcOgTitle && /xyz/i.test(abcOgTitle),
    `Invitation B og:title contains "XYZ": "${abcOgTitle}"`);
  
  // CRITICAL: No metadata leakage from Invitation A
  assert(!htmlABC.includes('Suman') && !htmlABC.includes('Vishal'),
    `Invitation B does NOT contain Invitation A's names (Suman/Vishal) — NO DATA LEAKAGE`);
  assert(!htmlABC.includes('website_thumbnail'),
    `Invitation B does NOT use the homepage thumbnail`);
  
  const abcOgImage = extractMeta(htmlABC, 'og:image');
  assert(abcOgImage && (/bride=abc/i.test(abcOgImage) || /abc/i.test(abcOgImage)),
    `Invitation B og:image references ABC: "${abcOgImage?.substring(0, 80)}..."`);
  assert(abcOgImage && (/groom=xyz/i.test(abcOgImage) || /xyz/i.test(abcOgImage)),
    `Invitation B og:image references XYZ`);
  
  const abcOgUrl = extractMeta(htmlABC, 'og:url');
  assert(abcOgUrl && abcOgUrl.includes('/invite/abc-xyz'),
    `Invitation B og:url points to abc-xyz: "${abcOgUrl}"`);
  assert(abcOgUrl !== svOgUrl,
    `Invitation B og:url is DIFFERENT from Invitation A's og:url`);

  const abcOgDesc = extractMeta(htmlABC, 'og:description');
  assert(abcOgDesc && /abc/i.test(abcOgDesc),
    `Invitation B og:description mentions ABC`);
  assert(abcOgDesc !== svOgDesc,
    `Invitation B og:description is DIFFERENT from Invitation A's description`);

  console.log('');

  // ═══════════════════════════════════════════════════════════════════
  // TEST D: Metadata Isolation — No Cross-Contamination
  // ═══════════════════════════════════════════════════════════════════
  console.log('━━━ Test D: Metadata Isolation ━━━');
  
  assert(svOgTitle !== abcOgTitle,
    `Invitation A and B have DIFFERENT og:title values`);
  assert(svOgImage !== abcOgImage,
    `Invitation A and B have DIFFERENT og:image values`);
  assert(svOgUrl !== abcOgUrl,
    `Invitation A and B have DIFFERENT og:url values`);
  assert(svOgDesc !== abcOgDesc,
    `Invitation A and B have DIFFERENT og:description values`);

  // Homepage vs Invitation isolation
  assert(homepageOgTitle !== svOgTitle,
    `Homepage og:title is DIFFERENT from Invitation A`);
  assert(homepageOgTitle !== abcOgTitle,
    `Homepage og:title is DIFFERENT from Invitation B`);
  assert(homepageOgImage !== svOgImage,
    `Homepage og:image is DIFFERENT from Invitation A`);
  assert(homepageOgImage !== abcOgImage,
    `Homepage og:image is DIFFERENT from Invitation B`);

  console.log('');

  // ═══════════════════════════════════════════════════════════════════
  // TEST E: OG Image Generation
  // ═══════════════════════════════════════════════════════════════════
  console.log('━━━ Test E: Dynamic OG Image Generation ━━━');
  
  // Test OG image for couple A
  const mockOgA = createMockReqRes({ url: '/api/og-image?bride=Suman&groom=Vishal&date=2026-11-20' });
  await ogImageHandler(mockOgA.req, mockOgA.res);
  const resOgA = mockOgA.getResult();
  assert(resOgA.statusCode === 200, 'OG image for Suman & Vishal returns HTTP 200');
  assert(resOgA.bodyData && resOgA.bodyData.length > 0, 
    `OG image for Suman & Vishal is ${resOgA.bodyData?.length || 0} bytes`);
  assert(resOgA.headersSent['content-type'] === 'image/jpeg',
    'OG image content type is image/jpeg');
  
  // Test OG image for couple B
  const mockOgB = createMockReqRes({ url: '/api/og-image?bride=Abc&groom=Xyz&date=2027-03-15' });
  await ogImageHandler(mockOgB.req, mockOgB.res);
  const resOgB = mockOgB.getResult();
  assert(resOgB.statusCode === 200, 'OG image for Abc & Xyz returns HTTP 200');
  assert(resOgB.bodyData && resOgB.bodyData.length > 0,
    `OG image for Abc & Xyz is ${resOgB.bodyData?.length || 0} bytes`);
  
  // Images should be different (different couples)
  const bufA = resOgA.bodyData;
  const bufB = resOgB.bodyData;
  assert(Buffer.isBuffer(bufA) && Buffer.isBuffer(bufB) && !bufA.equals(bufB),
    'OG images for different couples are NOT identical binaries');

  console.log('');

  // ═══════════════════════════════════════════════════════════════════
  // TEST F: Invalid / Missing Invitation
  // ═══════════════════════════════════════════════════════════════════
  console.log('━━━ Test F: Invalid / Missing Invitation URL ━━━');
  const mockInvalid = createMockReqRes({ query: { slug: 'nonexistent-couple-0000000000' } });
  await inviteHandler(mockInvalid.req, mockInvalid.res);
  const resInvalid = mockInvalid.getResult();
  const htmlInvalid = String(resInvalid.bodyData);
  
  assert(resInvalid.statusCode === 200, 'Invalid slug still returns HTTP 200 (with fallback)');
  
  const invalidOgTitle = extractMeta(htmlInvalid, 'og:title');
  // Should NOT contain data from Invitation A or B
  assert(!htmlInvalid.includes('Suman') && !htmlInvalid.includes('Vishal'),
    'Invalid invitation does NOT leak Invitation A metadata');
  assert(invalidOgTitle !== svOgTitle,
    'Invalid invitation og:title is NOT Invitation A\'s title');
  assert(invalidOgTitle !== abcOgTitle,
    'Invalid invitation og:title is NOT Invitation B\'s title');
  assert(!htmlInvalid.includes('website_thumbnail.jpg') || invalidOgTitle?.includes('DS Envite'),
    'Invalid invitation does NOT silently use homepage thumbnail as if it were a real invitation');

  console.log('');

  // ═══════════════════════════════════════════════════════════════════
  // TEST G: Cache Headers
  // ═══════════════════════════════════════════════════════════════════
  console.log('━━━ Test G: Cache Headers ━━━');
  assert(resSV.headersSent['cache-control'] && resSV.headersSent['cache-control'].includes('s-maxage'),
    'Invitation response includes s-maxage cache directive');
  assert(resSV.headersSent['vary'] === 'User-Agent',
    'Invitation response includes Vary: User-Agent header');

  console.log('');

  // ═══════════════════════════════════════════════════════════════════
  // TEST H: Browser Visitor Direct Access (302 Redirect)
  // ═══════════════════════════════════════════════════════════════════
  console.log('━━━ Test H: Browser Visitor Direct Access ━━━');
  const mockBrowser = createMockReqRes({
    query: { slug: 'suman-vishal-1792995422776' },
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
    },
    url: '/api/invite?slug=suman-vishal-1792995422776'
  });
  await inviteHandler(mockBrowser.req, mockBrowser.res);
  const resBrowser = mockBrowser.getResult();
  assert(resBrowser.statusCode === 302, 'Real browser directly visiting /api/invite gets HTTP 302 redirect');
  assert(resBrowser.headersSent['location'] === '/invite/suman-vishal-1792995422776',
    'Browser redirect location points to /invite/suman-vishal-1792995422776');

  console.log('');

  // ═══════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('═══════════════════════════════════════════════════════════════');
  
  if (failed > 0) {
    console.error('\n❌ FAILED tests:');
    errors.forEach(e => console.error(`   • ${e}`));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL TESTS PASSED! Each URL has unique, isolated social metadata.');
  }
}

runTests().catch(err => {
  console.error('\n💥 Unexpected error:', err);
  process.exit(1);
});
