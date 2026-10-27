async function checkMicrolink() {
  const urls = [
    'https://ds-envite.vercel.app/invite/vishal-suman'
  ];

  for (const u of urls) {
    console.log('\n--- Checking:', u);
    try {
      const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(u)}`);
      const json = await res.json();
      console.log('Status:', json.status);
      console.log('Title:', json.data?.title);
      console.log('Description:', json.data?.description);
      console.log('Image:', json.data?.image?.url);
    } catch (e) {
      console.error(e.message);
    }
  }
}
checkMicrolink();
