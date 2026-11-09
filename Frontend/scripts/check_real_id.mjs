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
  await checkUrl('https://lh3.googleusercontent.com/d/1brJdMaSjflXO8OeJ6cAzVj5cklst48jr');
  await checkUrl('https://drive.google.com/thumbnail?id=1brJdMaSjflXO8OeJ6cAzVj5cklst48jr&sz=w2560');
}
run();

