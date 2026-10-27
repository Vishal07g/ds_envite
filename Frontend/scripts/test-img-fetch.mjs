async function testImageFetch() {
  const imgUrl = 'https://ds-envite.vercel.app/api/og-image/vishal-suman.jpg';
  const ua = 'WhatsApp/2.23.20.10 i';

  console.log('--- Testing HEAD request ---');
  const headRes = await fetch(imgUrl, { method: 'HEAD', headers: { 'User-Agent': ua } });
  console.log('HEAD Status:', headRes.status);
  console.log('HEAD Content-Type:', headRes.headers.get('content-type'));
  console.log('HEAD Content-Length:', headRes.headers.get('content-length'));

  console.log('\n--- Testing GET request ---');
  const res = await fetch(imgUrl, { headers: { 'User-Agent': ua } });
  console.log('Image Status:', res.status);
  console.log('Image Content-Type:', res.headers.get('content-type'));
  console.log('Image Content-Length:', res.headers.get('content-length'));
  console.log('Image Robots Header:', res.headers.get('x-robots-tag'));
  const buf = await res.arrayBuffer();
  console.log('Downloaded bytes:', buf.byteLength);
}
testImageFetch();
