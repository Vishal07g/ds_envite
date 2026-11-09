import fs from 'fs';
import path from 'path';

const adminPath = path.resolve('Frontend/src/pages/AdminDashboard.jsx');
let content = fs.readFileSync(adminPath, 'utf8');

const oldBlock = `                        <div className="flex justify-between items-center z-10">
                          <span className="text-base font-bold drop-shadow-md" style={{ color: isLightBg ? '#8a2b3f' : (cfg.accentGold || '#f59e0b') }}>
                            {cfg.customSacredSymbol || '✦'}
                          </span>
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
                        </div>

                        {/* High contrast Headline & Couple Name Container */}
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
                        </div>`;

const newBlock = `                        {/* Clean unobstructed cover artwork display */}`;

const normOld = content.includes('\r\n') ? oldBlock.replace(/\r?\n/g, '\r\n') : oldBlock.replace(/\r?\n/g, '\n');
const normNew = content.includes('\r\n') ? newBlock.replace(/\r?\n/g, '\r\n') : newBlock.replace(/\r?\n/g, '\n');

if (content.includes(normOld)) {
  content = content.replace(normOld, normNew);
  console.log("AdminDashboard.jsx presets cleaned successfully!");
} else {
  console.log("Could not find exact block in AdminDashboard.jsx");
}

fs.writeFileSync(adminPath, content, 'utf8');

