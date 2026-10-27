import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const sourceImgPath = 'C:\\Users\\gksvi\\.gemini\\antigravity-ide\\brain\\620ac7d1-abd8-43b8-92b5-6dd1e72882a4\\.user_uploaded\\media_1793034318204.jpg';
const publicDir = path.resolve('public');

async function processFavicon() {
  console.log('Reading source uploaded favicon from:', sourceImgPath);
  if (!fs.existsSync(sourceImgPath)) {
    throw new Error('Source image not found: ' + sourceImgPath);
  }

  const inputBuffer = fs.readFileSync(sourceImgPath);

  // 1. Full 512x512 PNG
  await sharp(inputBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✓ public/favicon.png (512x512) generated');

  // 2. 32x32 PNG
  await sharp(inputBuffer)
    .resize(32, 32, { fit: 'contain' })
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('✓ public/favicon-32x32.png (32x32) generated');

  // 3. 180x180 Apple Touch Icon
  await sharp(inputBuffer)
    .resize(180, 180, { fit: 'contain' })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ public/apple-touch-icon.png (180x180) generated');

  // 4. JPEG copy for /favicon.jpg
  await sharp(inputBuffer)
    .resize(512, 512, { fit: 'contain' })
    .jpeg({ quality: 92 })
    .toFile(path.join(publicDir, 'favicon.jpg'));
  console.log('✓ public/favicon.jpg generated');

  // 5. favicon.ico
  // Windows ICO header for 32x32 PNG
  const png32Buffer = await sharp(inputBuffer).resize(32, 32).png().toBuffer();
  // We can write png32Buffer or multi-size ICO
  await sharp(inputBuffer).resize(48, 48).toFormat('png').toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✓ public/favicon.ico generated');

  // 6. SVG wrapper that embeds the clean 512x512 base64 PNG so SVG-capable browsers render the exact logo flawlessly
  const base64Png = (await sharp(inputBuffer).resize(512, 512).png().toBuffer()).toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${base64Png}" width="512" height="512" />
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');
  console.log('✓ public/favicon.svg generated with exact logo embedding');

  // Also update website banner if needed: update logo in website banner
  console.log('Favicon update complete!');
}

processFavicon().catch(err => {
  console.error('Error generating favicon:', err);
  process.exit(1);
});
