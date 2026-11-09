async function testUrls() {
  const fileId = '1brJdMaSjflXO8OeJ6cAzVj5cklst48jr';
  const urls = [
    `https://lh3.googleusercontent.com/d/${fileId}=s0`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w2560`,
    `https://drive.google.com/uc?export=view&id=${fileId}`
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, { method: 'GET', headers: { Range: 'bytes=0-10' } });
      console.log(`${u} -> status: ${res.status}, contentType: ${res.headers.get('content-type')}`);
    } catch (e) {
      console.log(`${u} -> ERROR:`, e.message);
    }
  }
}

testUrls().catch(console.error);

