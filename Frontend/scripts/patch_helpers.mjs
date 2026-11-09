import fs from 'fs';

const filePath = 'Frontend/src/utils/helpers.js';
let content = fs.readFileSync(filePath, 'utf8');
const target = 'return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2560`;';
if (content.includes(target)) {
  content = content.replace(target, 'return `https://lh3.googleusercontent.com/d/${fileId}=w2560`;');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('REPLACED_HELPERS_OK');
} else {
  console.log('TARGET_NOT_FOUND');
}

