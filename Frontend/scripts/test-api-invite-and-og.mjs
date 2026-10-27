import assert from 'assert';
import ogHandler from '../api/og-image.js';
import inviteHandler from '../api/invite.js';

console.log('=== TEST SUITE: Serverless /api/invite and /api/og-image ===\n');

// Mock response object
function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, val) {
      this.headers[key.toLowerCase()] = val;
      return this;
    },
    send(data) {
      this.body = data;
      return this;
    }
  };
  return res;
}

// ── Test 1: OG Image for vishal-suman ──
console.log('Test 1: /api/og-image for vishal-suman');
const req1 = {
  url: '/api/og-image?slug=vishal-suman',
  headers: { host: 'ds-envite.vercel.app' },
  query: { slug: 'vishal-suman' }
};
const res1 = createMockRes();
await ogHandler(req1, res1);
assert.strictEqual(res1.statusCode, 200, 'OG image should return HTTP 200');
assert.strictEqual(res1.headers['content-type'], 'image/jpeg', 'Content-Type should be image/jpeg');
assert(Buffer.isBuffer(res1.body), 'Body should be a JPEG buffer');
console.log(`  ✓ Generated JPEG thumbnail (${(res1.body.length / 1024).toFixed(1)} KB)\n`);

// ── Test 2: OG Image for suman-vishal ──
console.log('Test 2: /api/og-image for suman-vishal');
const req2 = {
  url: '/api/og-image?slug=suman-vishal',
  headers: { host: 'ds-envite.vercel.app' },
  query: { slug: 'suman-vishal' }
};
const res2 = createMockRes();
await ogHandler(req2, res2);
assert.strictEqual(res2.statusCode, 200, 'OG image should return HTTP 200');
assert.strictEqual(res2.headers['content-type'], 'image/jpeg');
assert(Buffer.isBuffer(res2.body));
console.log(`  ✓ Generated JPEG thumbnail (${(res2.body.length / 1024).toFixed(1)} KB)\n`);

// ── Test 3: /api/invite for vishal-suman ──
console.log('Test 3: /api/invite for vishal-suman');
const req3 = {
  url: '/api/invite?slug=vishal-suman',
  headers: {
    host: 'ds-envite-cbn70mmpf-vishal-g1.vercel.app',
    'x-forwarded-host': 'ds-envite-cbn70mmpf-vishal-g1.vercel.app',
    'x-forwarded-proto': 'https',
    'user-agent': 'WhatsApp/2.21.11.17 i'
  },
  query: { slug: 'vishal-suman' }
};
const res3 = createMockRes();
await inviteHandler(req3, res3);
assert.strictEqual(res3.statusCode, 200);
const html3 = res3.body;
assert(html3.includes('Vishal &amp; Suman') || html3.includes('Vishal & Suman'), 'OG title must be Vishal & Suman');
assert(html3.includes('https://ds-envite.vercel.app/api/og-image/vishal-suman.jpg'), 'OG image URL must be clean without hash host');
assert(html3.includes('https://ds-envite.vercel.app/invite/vishal-suman'), 'Canonical & og:url must be clean without hash host or timestamp');
console.log('  ✓ OG title correctly features Vishal & Suman');
console.log('  ✓ OG image link is https://ds-envite.vercel.app/api/og-image/vishal-suman.jpg');
console.log('  ✓ Canonical & og:url is https://ds-envite.vercel.app/invite/vishal-suman\n');

// ── Test 4: /api/invite for suman-vishal ──
console.log('Test 4: /api/invite for suman-vishal');
const req4 = {
  url: '/api/invite?slug=suman-vishal',
  headers: {
    host: 'ds-envite-cbn70mmpf-vishal-g1.vercel.app',
    'x-forwarded-host': 'ds-envite-cbn70mmpf-vishal-g1.vercel.app',
    'x-forwarded-proto': 'https',
    'user-agent': 'WhatsApp/2.21.11.17 i'
  },
  query: { slug: 'suman-vishal' }
};
const res4 = createMockRes();
await inviteHandler(req4, res4);
assert.strictEqual(res4.statusCode, 200);
const html4 = res4.body;
assert(html4.includes('Suman &amp; Vishal') || html4.includes('Suman & Vishal'), 'OG title must be Suman & Vishal');
assert(html4.includes('https://ds-envite.vercel.app/api/og-image/suman-vishal.jpg'), 'OG image URL must be clean suman-vishal');
assert(html4.includes('https://ds-envite.vercel.app/invite/suman-vishal'), 'Canonical & og:url must be clean suman-vishal');
console.log('  ✓ OG title correctly features Suman & Vishal');
console.log('  ✓ OG image link is https://ds-envite.vercel.app/api/og-image/suman-vishal.jpg');
console.log('  ✓ Canonical & og:url is https://ds-envite.vercel.app/invite/suman-vishal\n');

console.log('All API tests passed with flying colors!');
