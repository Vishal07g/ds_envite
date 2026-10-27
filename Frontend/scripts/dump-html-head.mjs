async function dumpHtml() {
  const url = 'https://ds-envite.vercel.app/invite/vishal-suman';
  const ua = 'WhatsApp/2.23.20.10 i';
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  const html = await res.text();
  console.log('=== FULL HTML HEAD ===');
  const head = html.match(/<head[\s\S]*?<\/head>/i)?.[0];
  console.log(head);
}
dumpHtml();
