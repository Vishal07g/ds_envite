import fs from 'fs';
import path from 'path';
import inviteHandler from '../api/invite.js';
import ogImageHandler from '../api/og-image.js';

// Mock request / response helpers for Vercel Serverless Functions
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

async function runTests() {
  console.log('=== Running Social Previews & Thumbnails Verification ===\n');

  // Test 1: Website Root index.html tags
  console.log('Test 1: Verifying index.html (Website Default Branding)...');
  const indexHtml = fs.readFileSync('index.html', 'utf8');

  if (indexHtml.includes('Suman') || indexHtml.includes('Vishal')) {
    throw new Error('FAIL: index.html still contains Suman or Vishal in website defaults!');
  }
  if (!indexHtml.includes('/website_thumbnail.jpg')) {
    throw new Error('FAIL: index.html does not point to /website_thumbnail.jpg!');
  }
  if (!indexHtml.includes('/favicon.svg')) {
    throw new Error('FAIL: index.html does not reference /favicon.svg!');
  }
  console.log('✓ PASS: index.html has pure DS Envite platform metadata & website banner.\n');

  // Test 2: Individual Invitation for Suman & Vishal
  console.log('Test 2: Verifying /api/invite for Suman & Vishal (suman-vishal-1792995422776)...');
  const mockSV = createMockReqRes({ query: { slug: 'suman-vishal-1792995422776' } });
  await inviteHandler(mockSV.req, mockSV.res);
  const resSV = mockSV.getResult();
  const htmlSV = String(resSV.bodyData);

  if (!htmlSV.includes('Suman &amp; Vishal') && !htmlSV.includes('Suman & Vishal')) {
    throw new Error('FAIL: Suman & Vishal invite did not contain their names in title/meta!');
  }
  if (!htmlSV.includes('/api/og-image?bride=Suman&groom=Vishal') && !htmlSV.includes('bride=Suman')) {
    throw new Error('FAIL: Suman & Vishal invite OG image URL did not match their names!');
  }
  console.log('✓ PASS: Suman & Vishal invitation correctly has their own unique title and OG image URL.\n');

  // Test 3: Individual Invitation for Abc & Xyz (completely different couple)
  console.log('Test 3: Verifying /api/invite for Abc & Xyz (slug: abc-xyz)...');
  const mockABC = createMockReqRes({ query: { slug: 'abc-xyz' } });
  await inviteHandler(mockABC.req, mockABC.res);
  const resABC = mockABC.getResult();
  const htmlABC = String(resABC.bodyData);

  if (htmlABC.includes('Suman') || htmlABC.includes('Vishal')) {
    throw new Error('FAIL: Abc & Xyz invitation contains Suman or Vishal!');
  }
  if (!htmlABC.includes('Abc') || !htmlABC.includes('Xyz')) {
    throw new Error('FAIL: Abc & Xyz invitation missing Abc & Xyz in metadata!');
  }
  if (!htmlABC.includes('bride=Abc') || !htmlABC.includes('groom=Xyz')) {
    throw new Error('FAIL: Abc & Xyz OG image URL does not include bride=Abc and groom=Xyz!');
  }
  console.log('✓ PASS: Abc & Xyz invitation has 100% unique metadata for Abc & Xyz, zero Suman & Vishal bleed.\n');

  // Test 4: og-image generation for Abc & Xyz
  console.log('Test 4: Verifying /api/og-image for Abc & Xyz...');
  const mockOg = createMockReqRes({ url: '/api/og-image?bride=Abc&groom=Xyz&date=2026-12-15' });
  await ogImageHandler(mockOg.req, mockOg.res);
  const resOg = mockOg.getResult();

  if (resOg.statusCode !== 200 || !resOg.bodyData || resOg.bodyData.length === 0) {
    throw new Error('FAIL: /api/og-image did not return image buffer for Abc & Xyz!');
  }
  if (resOg.headersSent['location']) {
    throw new Error('FAIL: /api/og-image redirected instead of rendering dynamic thumbnail!');
  }
  console.log(`✓ PASS: /api/og-image rendered ${resOg.bodyData.length} bytes JPEG for Abc & Xyz without redirecting.\n`);

  console.log('🎉 ALL TESTS PASSED! Website and individual invitations are completely decoupled with unique thumbnails and branding.');
}

runTests().catch(err => {
  console.error('\n❌ Test Error:', err);
  process.exit(1);
});
