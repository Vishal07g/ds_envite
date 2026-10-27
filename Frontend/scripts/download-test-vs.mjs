import fs from 'fs';

async function downloadImage() {
  const res = await fetch('https://ds-envite.vercel.app/api/og-image/vishal-suman.jpg');
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync('Frontend/public/test-vs.jpg', buf);
  console.log('Saved Frontend/public/test-vs.jpg, size:', buf.length);
}
downloadImage();
