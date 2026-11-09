import fs from 'fs';

const filePath = 'Frontend/src/components/AdminSidebar.jsx';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// 1. Fix localHdData reference in handleFileChange
const target1 = `      } else {
        const finalImgUrl = uploadRes.driveDirectUrl || uploadRes.url || localHdData;
        onChangeField(field, finalImgUrl);
      }`;

const repl1 = `      } else {
        const finalImgUrl = uploadRes.driveDirectUrl || uploadRes.url || localPreview;
        onChangeField(field, finalImgUrl);
      }`;

if (content.includes(target1)) {
  content = content.replace(target1, repl1);
  console.log('REPLACED_TARGET_1_OK');
} else {
  console.log('TARGET_1_NOT_FOUND');
}

// 2. Fix fallback in preview img onError
const target2 = `                          onError={(e) => {
                            if (!e.currentTarget.src.includes('cover_suman_vishal_1k.jpg')) {
                              e.currentTarget.src = '/cover_suman_vishal_1k.jpg';
                            }
                          }}`;

const repl2 = `                          onError={(e) => {
                            const currentSrc = e.currentTarget.src || '';
                            const fileId = extractDriveFileId(config.heroImage);
                            if (fileId && !currentSrc.includes('thumbnail')) {
                              e.currentTarget.src = \`https://drive.google.com/thumbnail?id=\${fileId}&sz=w2560\`;
                            }
                          }}`;

if (content.includes(target2)) {
  content = content.replace(target2, repl2);
  console.log('REPLACED_TARGET_2_OK');
} else {
  console.log('TARGET_2_NOT_FOUND');
}

fs.writeFileSync(filePath, content, 'utf8');

