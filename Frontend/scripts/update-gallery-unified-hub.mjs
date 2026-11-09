import fs from 'fs';
import path from 'path';

const filePath = path.resolve('Frontend/src/pages/PresetGallery.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Ensure INVITATION_CATEGORIES is imported
if (!content.includes('INVITATION_CATEGORIES')) {
  content = content.replace(
    'import HomeHeroBanner from \'../components/HomeHeroBanner\';',
    `import HomeHeroBanner from '../components/HomeHeroBanner';\nimport { INVITATION_CATEGORIES } from '../data/invitationCategoriesData';`
  );
  console.log('Added INVITATION_CATEGORIES import');
}

// 2. Add selectedCatObj helper before return
if (!content.includes('const selectedCatObj =')) {
  content = content.replace(
    'return (\n    <div className="min-h-screen',
    `const selectedCatObj = INVITATION_CATEGORIES.find(c => c.id === selectedCategory);\n\n  return (\n    <div className="min-h-screen`
  );
  console.log('Added selectedCatObj helper');
}

// 3. Wrap page content in centered max-w-6xl container and replace old filter toolbar with unified hub
const startPattern = '{/* Presets Section Anchor */}';
const endPattern = '{/* Presets Grid */}';

const newControlHub = `{/* Presets Section Anchor */}
      <div ref={presetsSectionRef} className="scroll-mt-6" />

      {/* Unified Luxury Category & Filter Command Hub */}
      <div className="rounded-3xl border border-[#E9DCCB] bg-[#FFFEFB]/95 shadow-md p-5 sm:p-6 backdrop-blur-md space-y-4">
        
        {/* Hub Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9DCCB]/60 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-base">🎉</span>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#513321]">
                Browse by Invitation Category
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-900 border border-amber-500/25">
                {filteredPresets.length} {filteredPresets.length === 1 ? 'Design' : 'Designs'}
              </span>
            </div>
            <p className="text-[11px] text-[#8C6D58] font-medium pl-6">
              {selectedCatObj ? selectedCatObj.subtitle : 'Choose a celebration category to view matching luxury presets'}
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {(selectedCategory !== 'all' || filterReligion !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setFilterReligion('all');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#8D414D] hover:bg-[#F9E8E5] border border-[#E9C9BD] transition cursor-pointer"
              >
                ✕ Reset Filters
              </button>
            )}
            {currentUser?.role === 'admin' && (
              <button
                onClick={handleOpenCreateTheme}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D6AD61] to-[#C49A4A] hover:from-[#C49A4A] hover:to-[#AC853B] text-[#382416] hover:text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition flex items-center space-x-1.5 shrink-0 cursor-pointer"
              >
                <SvgPlus className="w-3.5 h-3.5" />
                <span>Add Theme</span>
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Smooth Category Strip (Strict Unbreakable Single Row with Smooth Scrolling) */}
        <div className="relative">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x flex-nowrap">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setFilterReligion("all");
              }}
              className={\`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-xs \${
                selectedCategory === "all"
                  ? "bg-[#D6AD61] text-[#382416] border border-[#C49A4A] font-extrabold shadow-sm"
                  : "bg-[#FFF9F2] text-[#6C6B70] hover:text-[#513321] border border-[#E9DCCB] hover:border-[#C49A4A]"
              }\`}
            >
              <span>🌟</span>
              <span>All Celebrations</span>
            </button>

            {INVITATION_CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={\`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-xs \${
                    isSelected
                      ? "bg-[#D6AD61] text-[#382416] border border-[#C49A4A] font-extrabold shadow-sm"
                      : "bg-[#FFF9F2] text-[#6C6B70] hover:text-[#513321] border border-[#E9DCCB] hover:border-[#C49A4A]"
                  }\`}
                >
                  <span>{cat.icon || '💍'}</span>
                  <span>{cat.name.replace(" Invitation", "")}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-Filter Refinement: Cultural Tradition Dropdown */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#E9DCCB]/40">
          <div className="flex items-center space-x-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#513321] shrink-0">
              Tradition / Faith:
            </span>
            <InvitationTypeDropdown
              value={filterReligion}
              onChange={setFilterReligion}
              labelText=""
              className="w-full sm:w-72"
            />
          </div>

          {selectedCatObj && (
            <p className="text-[11px] text-[#8C6D58] italic truncate max-w-md hidden md:block">
              {selectedCatObj.description}
            </p>
          )}
        </div>
      </div>\n\n      `;

const sIdx = content.indexOf(startPattern);
const eIdx = content.indexOf(endPattern);

if (sIdx !== -1 && eIdx !== -1) {
  content = content.substring(0, sIdx) + newControlHub + content.substring(eIdx);
  console.log('Replaced filter toolbar with Unified Category & Filter Hub');
} else {
  console.log('Warning: start or end pattern not found in PresetGallery.jsx');
}

// 4. Wrap the return JSX in a centered max-w-6xl container:
content = content.replace(
  '<div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-body)] p-6 space-y-8 font-sans preset-gallery-container">',
  '<div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-body)] py-8 px-4 sm:px-6 font-sans preset-gallery-container">\n      <div className="max-w-6xl mx-auto space-y-8 w-full">'
);

// Close the inner container right before CustomDialog
content = content.replace(
  '<CustomDialog {...dialog} themeConfig={selectedPreset?.config || {}} />\n    </div>',
  '<CustomDialog {...dialog} themeConfig={selectedPreset?.config || {}} />\n      </div>\n    </div>'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated PresetGallery.jsx with centered container & unified hub');

