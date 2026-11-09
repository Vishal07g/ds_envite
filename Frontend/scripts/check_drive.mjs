import https from 'https';

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      console.log(url);
      console.log('Status:', res.statusCode);
      console.log('Headers:', res.headers.location || res.headers['content-type']);
      resolve();
    }).on('error', (e) => {
      console.error(url, e.message);
      resolve();
    });
  });
}

async function run() {
  await checkUrl('https://drive.google.com/thumbnail?id=1RJzU43l4k77q_dO33QkUfxz0VqN39k7K&sz=w2560');
  await checkUrl('https://lh3.googleusercontent.com/d/1RJzU43l4k77q_dO33QkUfxz0VqN39k7K=s0');
  await checkUrl('https://lh3.googleusercontent.com/d/1RJzU43l4k77q_dO33QkUfxz0VqN39k7K');
}
run();

