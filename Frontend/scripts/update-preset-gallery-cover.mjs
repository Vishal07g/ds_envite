import fs from 'fs';
import path from 'path';

const galleryPath = path.resolve('Frontend/src/pages/PresetGallery.jsx');
let content = fs.readFileSync(galleryPath, 'utf8');

// 1. Add formatDriveDirectUrl import if not present
if (!content.includes('formatDriveDirectUrl')) {
  content = content.replace(
    "import ThemeEditorModal from '../components/ThemeEditorModal';",
    "import ThemeEditorModal from '../components/ThemeEditorModal';\nimport { formatDriveDirectUrl } from '../utils/helpers';"
  );
  console.log("Added formatDriveDirectUrl import");
}

// 2. Fetch invitations list inside PresetGallery
if (!content.includes('const allInvitations = dbStore.getInvitations();')) {
  content = content.replace(
    "  const [presets, setPresets] = useState(() => dbStore.getPresets());",
    "  const [presets, setPresets] = useState(() => dbStore.getPresets());\n  const allInvitations = dbStore.getInvitations();"
  );
  console.log("Added allInvitations fetch");
}

// 3. Update preset card cover rendering
const oldCardTarget = `              {/* Card visual thumbnail — mirrors invitation design */}
              <div 
                className="h-48 p-4 flex flex-col justify-between relative overflow-hidden bg-cover bg-center border-b border-slate-800 group"
                style={{ 
                  backgroundColor: cfg.primaryColor || '#0b1329',
                  backgroundImage: \`linear-gradient(\${isLightBg ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.45)'}, \${isLightBg ? 'rgba(255,255,255,0.70)' : 'rgba(0,0,0,0.75)'}), url("\${preset.thumbnail || cfg.heroImage || '/bg_floral_pink.jpg'}")\`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Ornamental border overlay matching invitation */}
                <div 
                  className="absolute inset-2.5 border rounded-xl pointer-events-none transition-all duration-300 group-hover:scale-95"
                  style={{ borderColor: cfg.accentGold || '#f59e0b', opacity: 0.6 }}
                />

                <div className="flex justify-between items-center z-10">
                  <span className="text-base font-bold drop-shadow-md" style={{ color: isLightBg ? '#8a2b3f' : (cfg.accentGold || '#f59e0b') }}>
                    {cfg.customSacredSymbol || '✦'}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {!preset.hidePrice && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-black tracking-wider bg-amber-500 text-slate-950 shadow-md">
                        ₹{Math.round((preset.price || cfg.price || 999) * (1 - (preset.discountPercent !== undefined ? preset.discountPercent : (cfg.discountPercent !== undefined ? cfg.discountPercent : 30)) / 100))}
                      </span>
                    )}
                    <span 
                      className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-md shadow"
                      style={{
                        backgroundColor: isLightBg ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
                        color: isLightBg ? '#8a2b3f' : '#f59e0b',
                        border: \`1px solid \${cfg.accentGold || '#f59e0b'}40\`
                      }}
                    >
                      {preset.religion || 'secular'}
                    </span>
                    {currentUser?.role === 'admin' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleOpenEditTheme(preset);
                          }}
                          className="p-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-md flex items-center justify-center border border-slate-900 cursor-pointer"
                          title="Edit Theme Preset Details"
                        >
                          <SvgEdit className="w-3 h-3 text-slate-950 font-bold" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeletePreset(preset);
                          }}
                          className="p-1 rounded bg-rose-600 hover:bg-rose-500 text-white transition shadow-md flex items-center justify-center border border-slate-900 cursor-pointer"
                          title="Delete Invitation Design Preset"
                        >
                          <SvgTrash className="w-3 h-3 text-white" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* High-Contrast Headline & Couple Title Box */}
                <div 
                  className="text-center z-10 px-3 py-2 rounded-xl backdrop-blur-md shadow-md"
                  style={{
                    backgroundColor: isLightBg ? 'rgba(255, 255, 255, 0.88)' : 'rgba(11, 19, 41, 0.88)',
                    border: \`1px solid \${isLightBg ? 'rgba(138, 43, 63, 0.35)' : 'rgba(229, 184, 88, 0.35)'}\`
                  }}
                >
                  <h4 
                    className="text-xs font-extrabold tracking-wider uppercase font-cinzel line-clamp-1"
                    style={{ 
                      color: isLightBg ? '#8a2b3f' : (cfg.accentGold || '#f59e0b')
                    }}
                  >
                    {preset.title}
                  </h4>
                  <p 
                    className={\`text-sm font-semibold \${cfg.cursiveFontClass || 'font-cursive'} truncate mt-0.5\`}
                    style={{ color: isLightBg ? '#1e293b' : '#ffffff' }}
                  >
                    {cfg.brideName || 'Bride'} &amp; {cfg.groomName || 'Groom'}
                  </p>
                </div>

                <div className="flex justify-between items-center z-10 text-[9px] font-mono font-bold" style={{ color: isLightBg ? '#1e293b' : '#e2e8f0' }}>
                  <span className="bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm text-slate-200">ID: {preset.id}</span>
                  <div className="flex space-x-1 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: cfg.primaryColor }} title="Primary Color" />
                    <span className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: cfg.accentGold }} title="Accent Gold" />
                    <span className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: cfg.lightBgColor }} title="Light Bg" />
                  </div>
                </div>
              </div>`;

const newCardReplacement = `              {/* Card visual thumbnail — mirrors authentic invitation cover design */}
              {(() => {
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
                    className="preset-card-cover h-52 sm:h-56 p-4 flex flex-col justify-between relative overflow-hidden bg-cover bg-center border-b border-[#E9DCCB]/60 group transition-all duration-300 rounded-t-2xl"
                    style={{ 
                      backgroundColor: cfg.primaryColor || '#0b1329',
                      backgroundImage: \`linear-gradient(to bottom, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.15) 45%, rgba(0, 0, 0, 0.70) 100%), url("\${resolvedCoverUrl}")\`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {/* Ornamental border overlay matching invitation cover */}
                    <div 
                      className="absolute inset-2.5 border rounded-xl pointer-events-none transition-all duration-300 group-hover:scale-[0.98]"
                      style={{ borderColor: cfg.accentGold || '#D6AD61', opacity: 0.65 }}
                    />

                    <div className="flex justify-between items-center z-10">
                      <span className="text-base font-bold drop-shadow-md text-[#F9D776]">
                        {cfg.customSacredSymbol || '✦'}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        {!preset.hidePrice && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-black tracking-wider bg-gradient-to-r from-[#D6AD61] to-[#C49A4A] text-[#382416] shadow-md border border-[#E5BE65]">
                            ₹{Math.round((preset.price || cfg.price || 999) * (1 - (preset.discountPercent !== undefined ? preset.discountPercent : (cfg.discountPercent !== undefined ? cfg.discountPercent : 30)) / 100))}
                          </span>
                        )}
                        <span 
                          className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-black/60 text-amber-200 backdrop-blur-md shadow border border-amber-400/30"
                        >
                          {preset.religion || 'secular'}
                        </span>
                        {currentUser?.role === 'admin' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleOpenEditTheme(preset);
                              }}
                              className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-md flex items-center justify-center cursor-pointer"
                              title="Edit Theme Preset Details"
                            >
                              <SvgEdit className="w-3 h-3 text-slate-950 font-bold" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleDeletePreset(preset);
                              }}
                              className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition shadow-md flex items-center justify-center cursor-pointer"
                              title="Delete Invitation Design Preset"
                            >
                              <SvgTrash className="w-3 h-3 text-white" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Elegant Center Cover Design Badge */}
                    <div 
                      className="text-center z-10 px-3.5 py-2 rounded-xl bg-black/50 backdrop-blur-md border border-amber-400/35 shadow-lg mx-auto max-w-[90%] group-hover:bg-black/65 transition-all"
                    >
                      <h4 className="text-xs font-black uppercase tracking-wider font-cinzel text-amber-200 line-clamp-1 drop-shadow-sm">
                        {preset.title}
                      </h4>
                      <p className={\`text-sm sm:text-base font-bold text-white truncate mt-0.5 drop-shadow-md \${cfg.cursiveFontClass || 'font-cursive'}\`}>
                        {cfg.brideName || 'Bride'} &amp; {cfg.groomName || 'Groom'}
                      </p>
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
                );
              })()}`;

const normOldCard = content.includes('\r\n') ? oldCardTarget.replace(/\r?\n/g, '\r\n') : oldCardTarget.replace(/\r?\n/g, '\n');
const normNewCard = content.includes('\r\n') ? newCardReplacement.replace(/\r?\n/g, '\r\n') : newCardReplacement.replace(/\r?\n/g, '\n');

if (content.includes(normOldCard)) {
  content = content.replace(normOldCard, normNewCard);
  console.log("Updated preset card thumbnail cover rendering");
} else {
  console.log("Could not find exact oldCardTarget, please check");
}

fs.writeFileSync(galleryPath, content, 'utf8');
console.log("PresetGallery.jsx updated successfully");

