async function testFetch() {
  const id = '1brJdMaSjflXO8OeJ6cAzVj5cklst48jr';
  const url1 = `https://drive.google.com/thumbnail?id=${id}&sz=w2560`;
  const url2 = `https://lh3.googleusercontent.com/d/${id}`;
  
  const r1 = await fetch(url1);
  console.log('thumbnail status:', r1.status, 'type:', r1.headers.get('content-type'), 'finalUrl:', r1.url);

  const r2 = await fetch(url2);
  console.log('lh3 status:', r2.status, 'type:', r2.headers.get('content-type'), 'finalUrl:', r2.url);
}

testFetch().catch(console.error);

