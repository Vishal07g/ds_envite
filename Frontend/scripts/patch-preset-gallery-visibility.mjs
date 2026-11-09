import fs from 'fs';

let content = fs.readFileSync('Frontend/src/pages/PresetGallery.jsx', 'utf8');

// 1. Wrap Filter Hub with visibility condition
const filterHubOld = `{/* Unified Luxury Category & Filter Command Hub */}
      <div className="w-full rounded-3xl border border-[#E9DCCB] bg-[#FFFEFB]/95 shadow-md p-5 sm:p-6 backdrop-blur-md space-y-5 relative z-40 overflow-visible">`;

const filterHubNew = `{/* Unified Luxury Category & Filter Command Hub */}
      {brandSettings?.landingTheme?.visibility?.showFilterHub !== false && (
        <div className="w-full rounded-3xl border border-[#E9DCCB] bg-[#FFFEFB]/95 shadow-md p-5 sm:p-6 backdrop-blur-md space-y-5 relative z-40 overflow-visible">`;

if (content.includes(filterHubOld)) {
  content = content.replace(filterHubOld, filterHubNew);
  // close with `)}`
  const closeTarget = `</div>
        </div>
      </div>

      {/* Presets Grid - Responsive & Expansive (Fluid Full Width) */}`;
  const closeReplacement = `</div>
        </div>
      </div>
      )}

      {/* Presets Grid - Responsive & Expansive (Fluid Full Width) */}`;
  content = content.replace(closeTarget, closeReplacement);
  console.log("Wrapped Filter Hub with visibility check in PresetGallery.jsx");
} else {
  // Regex match CRLF
  const re = /\{\/\* Unified Luxury Category & Filter Command Hub \*\/\}\r?\n\s*<div className="w-full rounded-3xl border border-\[#E9DCCB\]/;
  if (re.test(content)) {
    content = content.replace(re, `{/* Unified Luxury Category & Filter Command Hub */}
      {brandSettings?.landingTheme?.visibility?.showFilterHub !== false && (
        <div className="w-full rounded-3xl border border-[#E9DCCB]`);
    const reClose = /(<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\r?\n\s*\{\/\* Presets Grid)/;
    content = content.replace(reClose, `</div>\n        </div>\n      </div>\n      )}\n\n      {/* Presets Grid`);
    console.log("Wrapped Filter Hub via regex in PresetGallery.jsx");
  }
}

// 2. Wrap Summary Capsule with visibility check
const capsuleOld = `{/* Active Filter Summary Capsule */}
          <div className="hidden lg:flex flex-col justify-end pb-1 space-y-1">`;
const capsuleNew = `{/* Active Filter Summary Capsule */}
          {brandSettings?.landingTheme?.visibility?.showSummaryCapsule !== false && (
            <div className="hidden lg:flex flex-col justify-end pb-1 space-y-1">`;

if (content.includes(capsuleOld)) {
  content = content.replace(capsuleOld, capsuleNew);
  const reCapClose = /(<span className="truncate">\{filterReligion === 'all' \? 'All Traditions' : filterReligion\}<\/span>\r?\n\s*<\/div>\r?\n\s*<\/div>)/;
  content = content.replace(reCapClose, `$1\n          )}`);
  console.log("Wrapped Summary Capsule with visibility check in PresetGallery.jsx");
}

fs.writeFileSync('Frontend/src/pages/PresetGallery.jsx', content, 'utf8');

