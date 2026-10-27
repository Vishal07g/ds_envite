async function dumpBody() {
  const url = 'https://ds-envite-cbn70mmpf-vishal-g1.vercel.app/invite/vishal-suman-1792995422776';
  const ua = 'WhatsApp/2.23.20.10 i';
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  const html = await res.text();
  console.log('=== FULL HTML BODY ===');
  const body = html.match(/<body[\s\S]*?<\/body>/i)?.[0];
  console.log(body);
}
dumpBody();
