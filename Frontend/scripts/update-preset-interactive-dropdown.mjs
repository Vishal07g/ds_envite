import fs from 'fs';
import path from 'path';

const galleryPath = path.resolve('Frontend/src/pages/PresetGallery.jsx');
let content = fs.readFileSync(galleryPath, 'utf8');

// 1. Add state for dropdown hover / selection
if (!content.includes('const [openPresetDropdownId, setOpenPresetDropdownId] = useState(null);')) {
  content = content.replace(
    '  const [selectedCategory, setSelectedCategory] = useState("all");',
    `  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openPresetDropdownId, setOpenPresetDropdownId] = useState(null);
  const [hoveredPresetId, setHoveredPresetId] = useState(null);

  // Close preset dropdown on click outside
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!e.target.closest('.preset-dropdown-container')) {
        setOpenPresetDropdownId(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);`
  );
  console.log("Added preset dropdown state and click-outside listener");
}

// 2. Replace the presets grid card rendering
const startMarker = `      {/* Presets Grid - Responsive & Expansive (Fluid Full Width) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 w-full pt-4 relative z-10">`;

const endMarker = `      {/* PREVIEW DETAILS MODAL */}`;

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newGridSection = `      {/* Presets Grid - Responsive & Expansive (Fluid Full Width) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 w-full pt-4 relative z-10">
        {filteredPresets.map(preset => {
          const cfg = preset.config || {};
          const isDropdownOpen = openPresetDropdownId === preset.id || hoveredPresetId === preset.id;

          const matchingInv = allInvitations.find(i => 
            (i.config?.presetId === preset.id || i.presetId === preset.id) ||
            (i.config?.brideName && cfg.brideName && i.config.brideName.toLowerCase() === cfg.brideName.toLowerCase()) ||
            (preset.title && i.title && i.title.toLowerCase().includes(preset.title.toLowerCase().replace(/['’]s\\s*theme/i, '').trim()))
          );

          const coverDesign = preset.thumbnail || cfg.heroImage || matchingInv?.config?.heroImage || (
            (cfg.brideName?.toLowerCase() === 'suman' || preset.title?.toLowerCase().includes('suman'))
              ? '/cover_suman_vishal_1k.jpg'
              : (preset.religion === 'hindu' ? '/thumbnails/radha-krishna.jpg' : '/cover_suman_vishal_1k.jpg')
          );
          const resolvedCoverUrl = formatDriveDirectUrl(coverDesign, "image");

          return (
            <div 
              key={preset.id} 
              onMouseEnter={() => setHoveredPresetId(preset.id)}
              onMouseLeave={() => setHoveredPresetId(null)}
              className={\`preset-dropdown-container rounded-2xl border transition-all duration-300 relative flex flex-col justify-between \${
                isDropdownOpen
                  ? 'border-[#C49A4A] shadow-2xl z-[999999] bg-[#FFFEFB]'
                  : 'border-[#E9DCCB] hover:border-[#C49A4A]/70 bg-[#FFFEFB] shadow-md hover:shadow-xl z-10'
              }\`}
            >
              
              {/* Card visual thumbnail — mirrors authentic invitation cover design */}
              <div 
                onClick={() => setOpenPresetDropdownId(prev => prev === preset.id ? null : preset.id)}
                className="preset-card-cover h-52 sm:h-56 p-4 flex flex-col justify-between relative overflow-hidden bg-cover bg-center border-b border-[#E9DCCB]/60 group transition-all duration-300 rounded-t-2xl cursor-pointer"
                style={{ 
                  backgroundColor: cfg.primaryColor || '#0b1329',
                  backgroundImage: \`linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.10) 45%, rgba(0, 0, 0, 0.65) 100%), url("\${resolvedCoverUrl}")\`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Ornamental border overlay matching invitation cover */}
                <div 
                  className="absolute inset-2.5 border rounded-xl pointer-events-none transition-all duration-300 group-hover:scale-[0.98]"
                  style={{ borderColor: cfg.accentGold || '#D6AD61', opacity: 0.65 }}
                />

                {/* Top Quick Action Pill */}
                <div className="flex justify-end items-center z-10">
                  <span className={\`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs border transition-colors \${
                    isDropdownOpen
                      ? 'bg-[#D6AD61] text-[#382416] border-[#C49A4A]'
                      : 'bg-black/50 text-white/90 border-white/20'
                  }\`}>
                    {isDropdownOpen ? '▲ Close Details' : '▼ View Details'}
                  </span>
                </div>

                {/* Bottom ID and Swatches */}
                <div className="flex justify-between items-center z-10 text-[9px] font-mono font-bold text-white/90">
                  <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-white/15">ID: {preset.id}</span>
                  <div className="flex space-x-1 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full border border-white/60 shadow-sm" style={{ backgroundColor: cfg.primaryColor || '#0b1329' }} title="Primary Color" />
                    <span className="w-2.5 h-2.5 rounded-full border border-white/60 shadow-sm" style={{ backgroundColor: cfg.accentGold || '#D6AD61' }} title="Accent Gold" />
                    <span className="w-2.5 h-2.5 rounded-full border border-white/60 shadow-sm" style={{ backgroundColor: cfg.lightBgColor || '#FFF9F2' }} title="Light Bg" />
                  </div>
                </div>
              </div>

              {/* Minimalist Card Footer - Clean & Uncluttered Default View */}
              <div 
                onClick={() => setOpenPresetDropdownId(prev => prev === preset.id ? null : preset.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer bg-[#FFFEFB] hover:bg-[#FFF9F2] transition-colors rounded-b-2xl border-t border-[#E9DCCB]/40"
              >
                <div className="truncate pr-2">
                  <h3 className="font-cinzel text-xs sm:text-sm font-extrabold text-[#513321] tracking-wide truncate">
                    {preset.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-900 font-bold border border-amber-500/25 uppercase tracking-wider">
                      {preset.religion || 'Secular'}
                    </span>
                    {!preset.hidePrice && (
                      <span className="text-xs font-black text-[#8C5D2C] font-mono">
                        ₹{Math.round((preset.price || cfg.price || 999) * (1 - (preset.discountPercent !== undefined ? preset.discountPercent : (cfg.discountPercent !== undefined ? cfg.discountPercent : 30)) / 100))}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <span className={\`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all border \${
                    isDropdownOpen
                      ? 'bg-[#D6AD61] text-[#382416] border-[#C49A4A] rotate-180'
                      : 'bg-[#F7EFE5] text-[#513321] border-[#E9DCCB]'
                  }\`}>
                    ▼
                  </span>
                </div>
              </div>

              {/* Interactive Animated Dropdown Menu Panel (Floats on Top of Every Layer) */}
              {isDropdownOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full left-0 right-0 mt-1.5 z-[999999] bg-[#FFFEFB] border-2 border-[#C49A4A] rounded-2xl shadow-2xl p-4 space-y-3 animate-dropdown-slide-down backdrop-blur-md"
                >
                  {/* Dropdown Header: Full title + badges */}
                  <div className="flex items-center justify-between border-b border-[#E9DCCB]/70 pb-2.5">
                    <div className="truncate pr-2">
                      <h4 className="font-cinzel text-xs sm:text-sm font-extrabold text-[#513321] truncate">
                        {preset.title}
                      </h4>
                      <p className="text-[9.5px] text-[#8C6D58] font-medium truncate mt-0.5">
                        {cfg.brideName || 'Bride'} &amp; {cfg.groomName || 'Groom'}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-900 font-extrabold border border-amber-500/25 uppercase tracking-wider shrink-0">
                      {preset.religion || 'Secular'}
                    </span>
                  </div>

                  {/* Official Price Tag with Selling Price, Strikethrough MRP & Discount % */}
                  <div className="p-2.5 rounded-xl bg-[#FFF9F2] border border-[#E9DCCB] flex items-center justify-between shadow-xs">
                    {!preset.hidePrice ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs line-through text-[#8C6D58] font-mono">
                          ₹{preset.price || cfg.price || 999}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-800 font-bold border border-emerald-500/25 uppercase tracking-wider">
                          {preset.discountPercent !== undefined ? preset.discountPercent : (cfg.discountPercent !== undefined ? cfg.discountPercent : 30)}% OFF
                        </span>
                        <span className="text-sm font-black text-[#513321] font-mono">
                          ₹{Math.round((preset.price || cfg.price || 999) * (1 - (preset.discountPercent !== undefined ? preset.discountPercent : (cfg.discountPercent !== undefined ? cfg.discountPercent : 30)) / 100))}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#8C6D58] italic font-medium">Price: Contact for pricing</span>
                    )}

                    {currentUser?.role === 'admin' && (
                      <button 
                        type="button"
                        onClick={() => {
                          dbStore.updatePreset(preset.id, { hidePrice: !preset.hidePrice });
                          showToast(preset.hidePrice ? "Price tag is now visible on preset cards" : "Price tag hidden on preset cards", "info");
                        }}
                        className="px-2 py-0.5 rounded-lg text-[9px] font-bold border border-[#E9DCCB] bg-[#FFFEFB] hover:bg-[#F7EFE5] text-[#513321] transition cursor-pointer"
                        title={preset.hidePrice ? "Unhide price" : "Hide price"}
                      >
                        {preset.hidePrice ? "👁 Unhide" : "🚫 Hide"}
                      </button>
                    )}
                  </div>

                  {/* Action Buttons inside Dropdown */}
                  <div className="space-y-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditTheme(preset)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#D6AD61] to-[#C49A4A] hover:from-[#C49A4A] hover:to-[#AC853B] text-[#382416] hover:text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <SvgSliders className="w-3.5 h-3.5" />
                      <span>Customize &amp; Edit Design</span>
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPreviewModal(preset)}
                        className="px-3 py-2 rounded-xl bg-[#FFF9F2] hover:bg-[#F7EFE5] border border-[#E9DCCB] text-[#513321] text-xs font-bold text-center transition flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
                      >
                        <SvgExternalLink className="w-3.5 h-3.5 text-[#8C6D58]" />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenOrderModal(preset)}
                        className="px-3 py-2 rounded-xl bg-[#8D414D] hover:bg-[#78343F] text-white text-xs font-bold transition text-center uppercase tracking-wider shadow-sm cursor-pointer"
                      >
                        Order Now
                      </button>
                    </div>

                    {currentUser?.role === 'admin' && (
                      <div className="pt-2 border-t border-[#E9DCCB]/60 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D58]">
                          Admin Controls
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditTheme(preset)}
                            className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border border-amber-500/30 text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                          >
                            <SvgEdit className="w-3 h-3" />
                            <span>Edit Preset</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePreset(preset)}
                            className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-800 border border-rose-500/30 text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                          >
                            <SvgTrash className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>\n\n`;

  content = content.slice(0, startIndex) + newGridSection + content.slice(endIndex);
  console.log("Presets grid updated to interactive dropdown menu design!");
} else {
  console.error("Could not find start or end markers for presets grid");
}

fs.writeFileSync(galleryPath, content, 'utf8');
console.log("PresetGallery.jsx written successfully");

