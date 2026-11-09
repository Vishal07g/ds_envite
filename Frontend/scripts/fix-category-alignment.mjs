import fs from 'fs';
import path from 'path';

// ========================================================
// 1. Clean HomeHeroBanner.jsx: Remove raw floating category bar
// ========================================================
const heroBannerPath = path.resolve('Frontend/src/components/HomeHeroBanner.jsx');
let heroContent = fs.readFileSync(heroBannerPath, 'utf8');

// Remove everything from {/* CATEGORY NAVIGATION & QUICK FILTER BAR */} to the end of component
const navRegex = /\{\/\* =+[\r\n\s]*CATEGORY NAVIGATION & QUICK FILTER BAR[\s\S]*$/;
if (navRegex.test(heroContent)) {
  heroContent = heroContent.replace(navRegex, '    </div>\n  );\n}');
  fs.writeFileSync(heroBannerPath, heroContent, 'utf8');
  console.log('Cleaned floating category bar from HomeHeroBanner.jsx');
}

// ========================================================
// 2. Update InvitationTypeDropdown.jsx: Light luxury theme & clean typography
// ========================================================
const dropdownPath = path.resolve('Frontend/src/components/InvitationTypeDropdown.jsx');
let dropdownContent = fs.readFileSync(dropdownPath, 'utf8');

// Replace dark classes in dropdown trigger
dropdownContent = dropdownContent.replace(
  `isOpen
            ? 'bg-slate-900 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-amber-200'
            : 'bg-slate-950/80 hover:bg-slate-900/90 border-slate-700/80 hover:border-amber-500/60 text-slate-100'`,
  `isOpen
            ? 'bg-[#FFFEFB] border-[#C49A4A] shadow-md text-[#513321]'
            : 'bg-[#FFF9F2] hover:bg-[#FFFEFB] border-[#E9DCCB] hover:border-[#C49A4A] text-[#513321]'`
);

// Replace icon container
dropdownContent = dropdownContent.replace(
  'bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300',
  'bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-900'
);

// Replace typography inside trigger
dropdownContent = dropdownContent.replace(
  `          <div className="text-left truncate">
            <span className="block text-xs font-bold font-cinzel tracking-wide text-amber-100 truncate">
              {selectedType.label}
            </span>
            <span className="block text-[10px] text-slate-400 font-medium truncate">
              {selectedType.badge}
            </span>
          </div>`,
  `          <div className="text-left truncate">
            <div className="flex items-center space-x-1.5 truncate">
              <span className="text-xs font-bold font-cinzel tracking-wide text-[#513321] truncate">
                {selectedType.label}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-800 font-semibold border border-amber-500/25 shrink-0">
                {selectedType.badge}
              </span>
            </div>
            <span className="block text-[9.5px] text-[#8C6D58] font-medium truncate">
              {selectedType.desc}
            </span>
          </div>`
);

// Replace arrow button inside trigger
dropdownContent = dropdownContent.replace(
  `          <span
            className={\`w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400 text-xs transform transition-transform duration-300 \${
              isOpen ? 'rotate-180 bg-amber-500/20 text-amber-300' : ''
            }\`}
          >`,
  `          <span
            className={\`w-5 h-5 rounded-full bg-[#F7EFE5] border border-[#E9DCCB] flex items-center justify-center text-[#513321] text-xs transform transition-transform duration-300 \${
              isOpen ? 'rotate-180 border-[#C49A4A]' : ''
            }\`}
          >`
);

// Replace dropdown menu panel
dropdownContent = dropdownContent.replace(
  'bg-[#0d1322] border border-amber-500/50 shadow-[0_25px_60px_rgba(0,0,0,0.9)]',
  'bg-[#FFFEFB] border border-[#E9DCCB] shadow-2xl'
);

dropdownContent = dropdownContent.replace(
  'bg-slate-950/60 border-b border-slate-800/80 flex justify-between items-center text-[10px] uppercase tracking-wider text-amber-400/90 font-bold',
  'bg-[#F7EFE5] border-b border-[#E9DCCB] flex justify-between items-center text-[10px] uppercase tracking-wider text-[#513321] font-bold'
);

// Replace option items in dropdown list
dropdownContent = dropdownContent.replace(
  `isSelected
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                    : 'bg-slate-900/40 hover:bg-slate-800/80 border-transparent text-slate-300 hover:text-slate-100'`,
  `isSelected
                    ? 'bg-amber-500/15 border-amber-500/50 text-[#513321]'
                    : 'bg-[#FFF9F2]/60 hover:bg-[#F7EFE5] border-[#E9DCCB]/60 text-[#6C6B70] hover:text-[#513321]'`
);

dropdownContent = dropdownContent.replace(
  'text-slate-100 group-hover:text-amber-200',
  'text-[#513321]'
);

dropdownContent = dropdownContent.replace(
  'text-slate-400 group-hover:text-slate-300',
  'text-[#8C6D58]'
);

fs.writeFileSync(dropdownPath, dropdownContent, 'utf8');
console.log('Updated InvitationTypeDropdown.jsx');

