import fs from 'fs';
import path from 'path';

const filePath = path.resolve('Frontend/src/pages/PresetGallery.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to \n
content = content.replace(/\r\n/g, '\n');

// Ensure correct closing tags at end of PresetGallery component
const oldClosing = `<CustomDialog {...dialog} themeConfig={selectedPreset?.config || {}} />
    </div>
  );
}`;

const newClosing = `<CustomDialog {...dialog} themeConfig={selectedPreset?.config || {}} />
      </div>
    </div>
  );
}`;

if (content.includes(oldClosing)) {
  content = content.replace(oldClosing, newClosing);
  console.log('Fixed closing tags in PresetGallery.jsx');
} else {
  console.log('Searching for CustomDialog...');
  content = content.replace(
    /<CustomDialog[\s\S]*?themeConfig=\{selectedPreset\?\.config \|\| \{\}\}\s*\/>\s*<\/div>\s*\);\s*\}/,
    `<CustomDialog {...dialog} themeConfig={selectedPreset?.config || {}} />
      </div>
    </div>
  );
}`
  );
  console.log('Regex-replaced closing tags in PresetGallery.jsx');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('PresetGallery.jsx closing tags verified');

