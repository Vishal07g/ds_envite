async function checkLive(targetUrl) {
  const url = targetUrl || process.argv[2] || 'https://ds-envite-38ewhuvf1-vishal-g1.vercel.app/';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
    }
  });

  console.log('HTTP Status:', res.status);
  console.log('Headers:');
  for (const [k, v] of res.headers.entries()) {
    if (k.includes('robot') || k.includes('cache') || k.includes('type') || k.includes('location')) {
      console.log(`  ${k}: ${v}`);
    }
  }

  const html = await res.text();
  console.log('\nExtracted Meta Tags:');
  const getTag = (prop) => {
    const m = html.match(new RegExp(`(<meta[^>]+(?:property|name)=["']${prop}["'][^>]*>)`, 'i')) ||
              html.match(new RegExp(`(<meta[^>]+content=[^>]+(?:property|name)=["']${prop}["'][^>]*>)`, 'i'));
    return m ? m[1] : 'NOT FOUND';
  };

  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  console.log('  <title>:', titleMatch ? titleMatch[1] : 'NOT FOUND');
  console.log('  og:title:', getTag('og:title'));
  console.log('  og:description:', getTag('og:description'));
  console.log('  og:image:', getTag('og:image'));
  console.log('  og:url:', getTag('og:url'));
  console.log('  twitter:title:', getTag('twitter:title'));
  console.log('  canonical:', html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0] || 'NOT FOUND');

  // Also check if image URL resolves
  const ogImgUrl = html.match(/property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1];
  console.log('\nChecking OG Image URL:', ogImgUrl);
  if (ogImgUrl) {
    try {
      const imgRes = await fetch(ogImgUrl);
      console.log('  OG Image HTTP Status:', imgRes.status);
      console.log('  OG Image Content-Type:', imgRes.headers.get('content-type'));
      console.log('  OG Image Size:', imgRes.headers.get('content-length'));
    } catch (e) {
      console.log('  OG Image Fetch ERROR:', e.message);
    }
  }
}

checkLive().catch(console.error);
