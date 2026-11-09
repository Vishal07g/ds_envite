import fs from 'fs';

const filePath = 'Frontend/src/components/InvitationRenderer.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the fallback inside img.onerror
const target = `    img.onerror = () => {
      // If external/Google Drive URL fails to load, gracefully fallback to high-resolution 1K asset
      if (directSrc !== '/cover_suman_vishal_1k.jpg') {
        setCoverImgSrc('/cover_suman_vishal_1k.jpg');
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setCoverImageDimensions({
            width: fallbackImg.naturalWidth,
            height: fallbackImg.naturalHeight,
            ratio: fallbackImg.naturalWidth / fallbackImg.naturalHeight
          });
        };
        fallbackImg.src = '/cover_suman_vishal_1k.jpg';
      }
    };`;

const replacement = `    img.onerror = () => {
      // If thumbnail or preview URL fails, attempt alternative Google Drive direct link format
      const fileId = extractDriveFileId(directSrc);
      if (fileId && !directSrc.includes('thumbnail')) {
        const altUrl = \`https://drive.google.com/thumbnail?id=\${fileId}&sz=w2560\`;
        setCoverImgSrc(altUrl);
        return;
      }
      // If all fail, keep directSrc or use neutral placeholder if none exists
      if (!directSrc && config.primaryColor) {
        setCoverImgSrc('');
      }
    };`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('REPLACED_RENDERER_FALLBACK_OK');
} else {
  // Try CRLF / LF resilient search
  const normalizedContent = content.replace(/\r\n/g, '\n');
  const normalizedTarget = target.replace(/\r\n/g, '\n');
  if (normalizedContent.includes(normalizedTarget)) {
    const replaced = normalizedContent.replace(normalizedTarget, replacement.replace(/\r\n/g, '\n'));
    fs.writeFileSync(filePath, replaced, 'utf8');
    console.log('REPLACED_RENDERER_FALLBACK_OK_NORMALIZED');
  } else {
    console.log('RENDERER_TARGET_NOT_FOUND');
  }
}

