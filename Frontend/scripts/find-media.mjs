import fs from 'fs';
const content = fs.readFileSync('src/components/InvitationRenderer.jsx', 'utf8');
const lines = content.split('\n');
const fields = ['heroImage', 'storyImage', 'scratchImage', 'scratchSectionBgImage', 'musicUrl', 'startingMusicUrl', 'galleryImage', 'customSacredSymbolImg', 'envelopeWaxSealImg', 'envelopeSymbolImg', 'envelopeBgImage', 'customClipartUrl', 'borderFrameImg', 'globalBorderImage'];
fields.forEach(f => {
  lines.forEach((line, idx) => {
    if (line.includes(f)) {
      console.log(`${idx + 1}: [${f}] ${line.trim().substring(0, 100)}`);
    }
  });
});
