import fs from 'fs';

let content = fs.readFileSync('Frontend/src/pages/AdminDashboard.jsx', 'utf8');

// 1. Add import LandingThemeCustomizer if not already present
if (!content.includes("LandingThemeCustomizer")) {
  content = content.replace(
    'import GuidedInvitationModal from \'../components/GuidedInvitationModal\';',
    'import GuidedInvitationModal from \'../components/GuidedInvitationModal\';\nimport LandingThemeCustomizer from \'../components/LandingThemeCustomizer\';'
  );
  console.log("Added import LandingThemeCustomizer to AdminDashboard.jsx");
}

// 2. Add brandingMode state to LogoBrandingManager
const targetFnStart = `function LogoBrandingManager({ showToast }) {
  const initialSettings = dbStore.getBrandSettings();`;

const replacementFnStart = `function LogoBrandingManager({ showToast }) {
  const initialSettings = dbStore.getBrandSettings();
  const [brandingMode, setBrandingMode] = useState("landing-theme");`;

if (content.includes(targetFnStart)) {
  content = content.replace(targetFnStart, replacementFnStart);
  console.log("Added brandingMode state to LogoBrandingManager");
} else {
  // Regex match
  const re = /function LogoBrandingManager\(\{\s*showToast\s*\}\)\s*\{\r?\n\s*const initialSettings = dbStore\.getBrandSettings\(\);/;
  if (re.test(content)) {
    content = content.replace(re, replacementFnStart);
    console.log("Added brandingMode state via regex");
  }
}

// 3. Wrap return in mode switch
const returnPattern = /return \(\r?\n\s*<div className="space-y-6">\r?\n\s*\{\/\* Live Preview Header Card \*\//;
const returnReplacement = `return (
    <div className="space-y-6">
      {/* Branding Studio Mode Tabs */}
      <div className="flex items-center space-x-3 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-md">
        <button
          type="button"
          onClick={() => setBrandingMode("landing-theme")}
          className={\`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center space-x-2 cursor-pointer \${
            brandingMode === "landing-theme"
              ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
          }\`}
        >
          <span>👑</span>
          <span>Landing Page Themes & Customization</span>
        </button>
        <button
          type="button"
          onClick={() => setBrandingMode("logo-styling")}
          className={\`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center space-x-2 cursor-pointer \${
            brandingMode === "logo-styling"
              ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
          }\`}
        >
          <span>🖼️</span>
          <span>Brand Logo, Background & Buttons</span>
        </button>
      </div>

      {brandingMode === "landing-theme" ? (
        <LandingThemeCustomizer
          brandSettings={initialSettings}
          onSave={(newTheme) => {
            dbStore.updateBrandSettings({ landingTheme: newTheme });
            showToast("Landing page theme saved successfully!", "success");
          }}
          showToast={showToast}
        />
      ) : (
        <div className="space-y-6">
          {/* Live Preview Header Card */`;

if (returnPattern.test(content)) {
  content = content.replace(returnPattern, returnReplacement);
  
  // Also close the wrapper before end of LogoBrandingManager
  // Find `</div>\n  );\n}\n\nexport default function AdminDashboard`
  const endPattern = /<\/div>\r?\n\s*<\/div>\r?\n\s*\);\r?\n\}\r?\n\r?\nexport default function AdminDashboard/;
  const endReplacement = `</div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard`;
  if (endPattern.test(content)) {
    content = content.replace(endPattern, endReplacement);
    console.log("Successfully wrapped LogoBrandingManager return block");
  } else {
    console.warn("Could not find end of LogoBrandingManager");
  }
} else {
  console.warn("Could not match returnPattern");
}

fs.writeFileSync('Frontend/src/pages/AdminDashboard.jsx', content, 'utf8');

