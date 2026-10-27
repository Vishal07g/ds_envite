async function testImageFetch() {
  const imgUrl = 'https://ds-envite-cbn70mmpf-vishal-g1.vercel.app/api/og-image?bride=Suman&groom=Vishal&title=Vishal+weds+Suman&date=2026-11-24T19%3A00&venue=Snehalata+Marriage+Hall&bg=rgba%2854%2C+9%2C+17%2C+1%29&accent=rgba%28184%2C+146%2C+84%2C+1%29&hero=https%3A%2F%2Flh3.googleusercontent.com%2Fd%2F1RJzU43I4krmpBb366UpU9M1f_qlASe8Q%3Ds0';
  const ua = 'WhatsApp/2.23.20.10 i';
  const res = await fetch(imgUrl, { headers: { 'User-Agent': ua } });
  console.log('Image Status:', res.status);
  console.log('Image Content-Type:', res.headers.get('content-type'));
  console.log('Image Content-Length:', res.headers.get('content-length'));
  console.log('Image Robots Header:', res.headers.get('x-robots-tag'));
  const buf = await res.arrayBuffer();
  console.log('Downloaded bytes:', buf.byteLength);
}
testImageFetch();
