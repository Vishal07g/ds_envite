async function measureOgImageTime() {
  const url = 'https://ds-envite.vercel.app/api/og-image/vishal-suman.jpg';
  console.log('Fetching OG image...');
  const t0 = Date.now();
  const res = await fetch(url, { headers: { 'User-Agent': 'WhatsApp/2.23.20.10 i' } });
  const t1 = Date.now();
  console.log('HTTP Status:', res.status);
  console.log('Time taken (ms):', t1 - t0);
  console.log('Size:', (await res.arrayBuffer()).byteLength);

  console.log('\nFetching Invite page...');
  const t2 = Date.now();
  const res2 = await fetch('https://ds-envite.vercel.app/invite/vishal-suman', { headers: { 'User-Agent': 'WhatsApp/2.23.20.10 i' } });
  const t3 = Date.now();
  console.log('Page HTTP Status:', res2.status);
  console.log('Page Time taken (ms):', t3 - t2);
}
measureOgImageTime();
