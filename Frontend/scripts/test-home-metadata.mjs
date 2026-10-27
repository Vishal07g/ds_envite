import homeHandler from '../api/home.js';
import fs from 'fs';
import path from 'path';

function createMockReqRes({ headers = {}, url = '/' }) {
  let statusCode = 200;
  const headersSent = {};
  let bodyData = null;

  const req = {
    headers: {
      host: 'ds-envite-pbaaott76-vishal-g1.vercel.app',
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

function extractMeta(html, property) {
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

async function runHomepageTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   Homepage Brand Metadata & WhatsApp Crawler Verification       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const EXPECTED_TITLE = 'DS Envite — Luxury Digital Invitations & Wedding Websites';
  const EXPECTED_TITLE_HTML = 'DS Envite — Luxury Digital Invitations &amp; Wedding Websites';
  const EXPECTED_DESC = 'Create beautiful, personalized digital wedding invitations with elegant designs, stunning themes, and memorable ways to share your special moments.';
  const EXPECTED_URL = 'https://ds-envite-pbaaott76-vishal-g1.vercel.app/';
  const EXPECTED_IMG = 'https://ds-envite-pbaaott76-vishal-g1.vercel.app/website_thumbnail.jpg';
  const OFFICIAL_IMG = 'https://ds-envite.vercel.app/website_thumbnail.jpg';

  // ── Test 1: Crawler Handler (/api/home) ──
  console.log('━━━ Test 1: WhatsApp Crawler Response via /api/home ━━━');
  const mockCrawler = createMockReqRes({
    headers: {
      'user-agent': 'WhatsApp/2.21.11.17 i',
      host: 'ds-envite-pbaaott76-vishal-g1.vercel.app'
    }
  });
  await homeHandler(mockCrawler.req, mockCrawler.res);
  const resCrawler = mockCrawler.getResult();
  const html = String(resCrawler.bodyData);

  assert(resCrawler.statusCode === 200, 'Returns HTTP 200 to WhatsApp crawler');
  assert(resCrawler.headersSent['x-robots-tag'] === 'all, index, follow',
    'CRITICAL: X-Robots-Tag header is "all, index, follow" (prevents preview suppression)');
  assert(resCrawler.headersSent['content-type'].includes('text/html'), 'Content-Type is text/html');

  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  assert(titleMatch && titleMatch[1].includes('DS Envite'),
    `<title> displays website brand name: "${titleMatch ? titleMatch[1] : 'null'}"`);

  const descMeta = extractMeta(html, 'description');
  assert(descMeta === EXPECTED_DESC, `Meta description matches approved text: "${descMeta}"`);

  const ogTitle = extractMeta(html, 'og:title');
  assert(ogTitle === EXPECTED_TITLE || ogTitle === EXPECTED_TITLE_HTML, `og:title matches: "${ogTitle}"`);

  const ogDesc = extractMeta(html, 'og:description');
  assert(ogDesc === EXPECTED_DESC, `og:description matches: "${ogDesc}"`);

  const ogImg = extractMeta(html, 'og:image');
  assert(ogImg === EXPECTED_IMG, `og:image matches: "${ogImg}"`);

  const ogUrl = extractMeta(html, 'og:url');
  assert(ogUrl === EXPECTED_URL, `og:url matches: "${ogUrl}"`);

  const ogType = extractMeta(html, 'og:type');
  assert(ogType === 'website', `og:type is "website"`);

  const twCard = extractMeta(html, 'twitter:card');
  assert(twCard === 'summary_large_image', `twitter:card is "summary_large_image"`);

  const twTitle = extractMeta(html, 'twitter:title');
  assert(twTitle === EXPECTED_TITLE || twTitle === EXPECTED_TITLE_HTML, `twitter:title matches: "${twTitle}"`);

  const twDesc = extractMeta(html, 'twitter:description');
  assert(twDesc === EXPECTED_DESC, `twitter:description matches: "${twDesc}"`);

  const twImg = extractMeta(html, 'twitter:image');
  assert(twImg === EXPECTED_IMG, `twitter:image matches: "${twImg}"`);

  const canon = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
  assert(canon && canon[1] === EXPECTED_URL, `Canonical URL matches: "${canon ? canon[1] : 'null'}"`);

  // Verify no technical hostname is used as title
  assert(!ogTitle.startsWith('http') && !ogTitle.includes('.vercel.app'),
    'og:title does NOT use raw technical Vercel deployment URL');

  // Verify no couple names leak into homepage
  assert(!html.includes('Suman') && !html.includes('Vishal') && !html.includes('ABC'),
    'Homepage raw HTML contains ZERO couple names or individual event details');

  console.log('');

  // ── Test 2: Real Browser Visitor to /api/home (302 Redirect) ──
  console.log('━━━ Test 2: Direct Browser Navigation to /api/home ━━━');
  const mockBrowser = createMockReqRes({
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
    },
    url: '/api/home'
  });
  await homeHandler(mockBrowser.req, mockBrowser.res);
  const resBrowser = mockBrowser.getResult();
  assert(resBrowser.statusCode === 302, 'Real browser directly visiting /api/home gets HTTP 302 redirect');
  assert(resBrowser.headersSent['location'] === '/', 'Redirect location points to root /');

  console.log('');

  // ── Test 3: Static index.html & dist/index.html ──
  console.log('━━━ Test 3: Static HTML Template Integrity ━━━');
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  assert(indexHtml.includes(EXPECTED_TITLE) || indexHtml.includes(EXPECTED_TITLE_HTML), 'index.html contains expected brand title');
  assert(indexHtml.includes(EXPECTED_DESC), 'index.html contains approved description');
  assert(indexHtml.includes(EXPECTED_IMG) || indexHtml.includes(OFFICIAL_IMG), 'index.html contains expected image URL');
  assert(indexHtml.includes('name="robots" content="all, index, follow"'),
    'index.html contains explicit robots all, index, follow tag');

  const distHtml = fs.readFileSync('dist/index.html', 'utf8');
  assert(distHtml.includes('DS Envite'), 'dist/index.html contains brand name');
  assert(distHtml.includes('website_thumbnail.jpg'), 'dist/index.html contains website_thumbnail.jpg');

  console.log('');

  // ── Test 4: Physical Image File Validation ──
  console.log('━━━ Test 4: Dedicated Thumbnail Asset Validation ━━━');
  const imgPath = path.resolve('public/website_thumbnail.jpg');
  assert(fs.existsSync(imgPath), 'website_thumbnail.jpg exists on disk');
  const imgStats = fs.statSync(imgPath);
  assert(imgStats.size > 10000 && imgStats.size < 100000,
    `website_thumbnail.jpg size is optimal for WhatsApp crawler: ${(imgStats.size / 1024).toFixed(1)} KB`);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (failed > 0) {
    console.error('\n❌ FAILED assertions:');
    errors.forEach(e => console.error(`   • ${e}`));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL HOMEPAGE BRAND METADATA TESTS PASSED SUCCESSFULLY!');
  }
}

runHomepageTests().catch(err => {
  console.error('\n💥 Unexpected error during test run:', err);
  process.exit(1);
});
