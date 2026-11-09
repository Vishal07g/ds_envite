import fs from 'fs';
import path from 'path';

const filePath = path.resolve('Frontend/src/pages/PresetGallery.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Ensure selectedCatObj is defined right above return (
if (!content.includes('const selectedCatObj =')) {
  content = content.replace(
    'return (\n    <div className="min-h-screen',
    `const selectedCatObj = (typeof INVITATION_CATEGORIES !== 'undefined' ? INVITATION_CATEGORIES : []).find(c => c.id === selectedCategory);\n\n  return (\n    <div className="min-h-screen`
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Defined selectedCatObj in PresetGallery.jsx');

