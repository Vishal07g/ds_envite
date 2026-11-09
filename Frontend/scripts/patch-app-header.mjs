import fs from 'fs';

let content = fs.readFileSync('Frontend/src/App.jsx', 'utf8');

// Update activeBgColor
const targetOldBg = "const appBgColor = brandSettings?.appBgColor || '#FFF9F2';";
const replacementBg = `const normalizedPath = (location.pathname || '').toLowerCase();
  const isLandingPage = normalizedPath === '/' || normalizedPath === '';
  const landingTheme = brandSettings?.landingTheme;
  const appBgColor = isLandingPage && landingTheme?.colors?.primaryBg ? landingTheme.colors.primaryBg : (brandSettings?.appBgColor || '#F6E9E5');`;

if (content.includes(targetOldBg)) {
  content = content.replace(targetOldBg, replacementBg);
  console.log("Updated appBgColor calculation in App.jsx");
}

// Update header styling for translucent floating navbar
const headerOld = '<header className="sticky top-0 z-30 backdrop-blur-md bg-[#FFFEFB]/90 py-3.5 px-6 border-b border-[#E9DCCB] shadow-sm flex items-center justify-between">';
const headerNew = `<header 
        className="sticky top-0 z-50 backdrop-blur-md py-3.5 px-6 border-b shadow-xs flex items-center justify-between transition-all duration-300"
        style={{
          backgroundColor: isLandingPage && landingTheme?.colors?.softWhite ? \`\${landingTheme.colors.softWhite}F0\` : 'rgba(255, 254, 251, 0.92)',
          borderColor: isLandingPage && landingTheme?.colors?.champagneGold ? \`\${landingTheme.colors.champagneGold}40\` : '#E9DCCB'
        }}
      >`;

if (content.includes(headerOld)) {
  content = content.replace(headerOld, headerNew);
  console.log("Updated header styling in App.jsx");
}

fs.writeFileSync('Frontend/src/App.jsx', content, 'utf8');

