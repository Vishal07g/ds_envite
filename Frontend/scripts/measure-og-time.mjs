async function measureOgImageTime() {
  const url = 'https://ds-envite-cbn70mmpf-vishal-g1.vercel.app/api/og-image?bride=Suman&groom=Vishal&title=Vishal+weds+Suman&date=2026-11-24T19%3A00&venue=Snehalata+Marriage+Hall&bg=rgba%2854%2C+9%2C+17%2C+1%29&accent=rgba%28184%2C+146%2C+84%2C+1%29&hero=https%3A%2F%2Flh3.googleusercontent.com%2Fd%2F1RJzU43I4krmpBb366UpU9M1f_qlASe8Q%3Ds0';
  console.log('Fetching OG image...');
  const t0 = Date.now();
  const res = await fetch(url, { headers: { 'User-Agent': 'WhatsApp/2.23.20.10 i' } });
  const t1 = Date.now();
  console.log('HTTP Status:', res.status);
  console.log('Time taken (ms):', t1 - t0);
  console.log('Size:', (await res.arrayBuffer()).byteLength);
}
measureOgImageTime();
