async function testWhatsAppUA() {
  const url = 'https://ds-envite.vercel.app/invite/vishal-suman';
  const ua = 'WhatsApp/2.23.20.10 i';
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  console.log('Status:', res.status);
  console.log('Robots:', res.headers.get('x-robots-tag'));
  console.log('Vercel-Cache:', res.headers.get('x-vercel-cache'));
  const text = await res.text();
  console.log('Length:', text.length);
  console.log('Has Suman & Vishal?', text.includes('Suman &amp; Vishal') || text.includes('Suman & Vishal'));
  console.log('Title tag:', text.match(/<title>(.*?)<\/title>/i)?.[1]);
  console.log('og:title:', text.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']*)["']/i)?.[1]);
  console.log('og:image:', text.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']*)["']/i)?.[1]);
}
testWhatsAppUA();
