import https from 'https';

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      console.log('GET', url);
      console.log('Status:', res.statusCode);
      console.log('Location:', res.headers.location);
      console.log('Content-Type:', res.headers['content-type']);
      resolve(res.headers.location);
    }).on('error', (e) => {
      console.error(url, e.message);
      resolve();
    });
  });
}

async function run() {
  const loc = await checkUrl('https://drive.google.com/thumbnail?id=1RJzU43l4k77q_dO33QkUfxz0VqN39k7K&sz=w2560');
  if (loc) {
    await checkUrl(loc);
  }
}
run();

