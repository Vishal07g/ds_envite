import fs from 'fs';
import path from 'path';

const file = path.resolve('Frontend/src/pages/AdminDashboard.jsx');
let content = fs.readFileSync(file, 'utf8');

// Replace status badge classes with regex
content = content.replace(
  /inv\.status === 'paid'\s*\?\s*'bg-emerald-500\/10[^']*'\s*:\s*inv\.status === 'preview'\s*\?\s*'bg-amber-500\/10[^']*'\s*:\s*'bg-slate-800 text-slate-400'/s,
  `inv.status === 'paid' ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30' :
                                inv.status === 'preview' ? 'bg-amber-500/15 text-amber-800 border border-amber-500/30' :
                                'bg-amber-500/10 text-amber-800 border border-amber-500/25'`
);

// Replace payment toggle button classes with regex
content = content.replace(
  /inv\.isPaid\s*\?\s*'bg-emerald-500\/20 text-emerald-300 border border-emerald-500\/30 hover:bg-emerald-500\/30'\s*:\s*'bg-amber-500\/20 text-amber-300 border border-amber-500\/30 hover:bg-amber-500\/30'/s,
  `inv.isPaid
                                  ? 'bg-emerald-500/20 text-emerald-900 border border-emerald-500/40 hover:bg-emerald-500/30'
                                  : 'bg-[#D6AD61] text-[#382416] border border-[#C49A4A] hover:bg-[#C49A4A] hover:text-white'`
);

// Replace hover:bg-slate-850/10
content = content.replace(/hover:bg-slate-850\/10 transition-colors/g, 'hover:bg-[#FDF6ED]/70 transition-colors');

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully regex-replaced status badge and payment button classes in AdminDashboard.jsx');
