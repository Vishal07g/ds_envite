import assert from 'assert';
import { getCoupleDetails, getCoupleInitials } from '../src/utils/monogramThumbnail.js';

console.log('=== TEST SUITE: Clean Invitation Links & Ordered Monogram Thumbnails ===\n');

// ── Test 1: Suman & Vishal (suman-vishal) ──
console.log('Test 1: Suman & Vishal -> initials SV, displayName Suman & Vishal');
const sv = getCoupleDetails({
  bride: 'Suman',
  groom: 'Vishal',
  title: "Suman & Vishal's Wedding Invitation",
  slug: 'suman-vishal-1792299417819'
});
console.log('  Result:', sv);
assert.strictEqual(sv.initials, 'SV', 'Initials must be SV for suman-vishal');
assert.strictEqual(sv.displayName, 'Suman & Vishal', 'Display name must be Suman & Vishal');
assert.strictEqual(sv.slug, 'suman-vishal', 'Slug must be clean suman-vishal without timestamp');
console.log('  ✓ Passed\n');

// ── Test 2: Vishal & Suman (vishal-suman) ──
console.log('Test 2: Vishal & Suman -> initials VS, displayName Vishal & Suman');
const vs = getCoupleDetails({
  bride: 'Suman',
  groom: 'Vishal',
  title: 'Vishal weds Suman',
  slug: 'vishal-suman-1792995422776'
});
console.log('  Result:', vs);
assert.strictEqual(vs.initials, 'VS', 'Initials must be VS for vishal-suman');
assert.strictEqual(vs.displayName, 'Vishal & Suman', 'Display name must be Vishal & Suman');
assert.strictEqual(vs.slug, 'vishal-suman', 'Slug must be clean vishal-suman without timestamp');
console.log('  ✓ Passed\n');

// ── Test 3: getCoupleInitials shorthand ──
console.log('Test 3: getCoupleInitials helper');
assert.strictEqual(getCoupleInitials('Suman', 'Vishal'), 'SV');
assert.strictEqual(getCoupleInitials('Vishal', 'Suman'), 'VS');
assert.strictEqual(getCoupleInitials({ bride: 'Suman', groom: 'Vishal', slug: 'vishal-suman' }), 'VS');
assert.strictEqual(getCoupleInitials({ bride: 'Suman', groom: 'Vishal', slug: 'suman-vishal' }), 'SV');
console.log('  ✓ Passed\n');

// ── Test 4: Pure slug parsing without names in DB ──
console.log('Test 4: Pure slug parsing');
const fromSlugVS = getCoupleDetails({ slug: 'vishal-suman' });
assert.strictEqual(fromSlugVS.initials, 'VS');
assert.strictEqual(fromSlugVS.displayName, 'Vishal & Suman');
assert.strictEqual(fromSlugVS.slug, 'vishal-suman');

const fromSlugSV = getCoupleDetails({ slug: 'suman-vishal' });
assert.strictEqual(fromSlugSV.initials, 'SV');
assert.strictEqual(fromSlugSV.displayName, 'Suman & Vishal');
assert.strictEqual(fromSlugSV.slug, 'suman-vishal');
console.log('  ✓ Passed\n');

console.log('All link and thumbnail monogram tests passed successfully!');
