import fs from 'fs';

const filePath = 'Frontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetBlockCRLF = `      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-cinzel tracking-wider text-amber-100 font-extrabold drop-shadow-md">Admin Dashboard</h1>
        </div>
        <button
          type="button"
          onClick={() => setIsDraftModalOpen(true)}
          className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 shadow-lg hover:shadow-amber-500/10 active:scale-98 transition flex items-center justify-center space-x-1.5 self-start md:self-center cursor-pointer"
        >
          <SvgPlus className="w-4 h-4 text-slate-950" />
          <span className="text-slate-950 font-extrabold">Draft New Invitation</span>
        </button>
      </div>\r\n\r\n`;

const targetBlockLF = targetBlockCRLF.replace(/\r\n/g, '\n');

if (content.includes(targetBlockCRLF)) {
  content = content.replace(targetBlockCRLF, '');
  console.log('Removed CRLF header block');
} else if (content.includes(targetBlockLF)) {
  content = content.replace(targetBlockLF, '');
  console.log('Removed LF header block');
} else {
  // Regex fallback
  content = content.replace(/\{\/\*\s*Header\s*\*\/\}[\s\S]*?Draft New Invitation<\/span>\s*<\/button>\s*<\/div>/, '');
  console.log('Removed via regex fallback');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ AdminDashboard.jsx updated: header bar removed.');

