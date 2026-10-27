async function inspectLive() {
  const url = 'https://ds-envite.vercel.app/invite/vishal-suman';
  const ua = 'WhatsApp/2.23.20.10 i';
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  console.log('Status:', res.status);
  console.log('Headers:');
  for (const [k, v] of res.headers.entries()) {
    console.log(`  ${k}: ${v}`);
  }
  const text = await res.text();
  console.log('\nMeta and link tags:');
  const matches = text.match(/<(meta|link)[^>]+>/gi) || [];
  matches.forEach(m => console.log(' ', m));
}
inspectLive();
