import fs from 'fs';

// 1. Update AdminDashboard.jsx
{
  const filePath = 'Frontend/src/pages/AdminDashboard.jsx';
  let content = fs.readFileSync(filePath, 'utf8');

  const oldCellBlock = `<td className="py-4">
                                <div className="dashboard-cell-pill">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className={\`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider inline-flex items-center space-x-1 \${catObj?.tagColor || 'bg-amber-500/10 text-amber-300 border border-amber-500/20'}\`}>
                                      <span>{catObj?.icon || '💍'}</span>
                                      <span>{catObj?.name?.replace(" Invitation", "") || 'Wedding'}</span>
                                    </span>
                                  </div>
                                  <p className="font-semibold text-slate-100 text-sm">{inv.title}</p>
                                  <p className="text-[10px] text-amber-200/90 font-medium mt-0.5">
                                    🎨 {inv.config?.primaryColor || '#0b1329'} • {(inv.config?.religionKey || 'secular').toUpperCase()}
                                  </p>
                                </div>
                              </td>`;

  const newCellBlock = `<td className="py-4">
                                <div className="dashboard-title-pill w-full">
                                  <div className="flex items-center space-x-2 w-full min-w-0">
                                    <span className={\`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider inline-flex items-center space-x-1 shrink-0 \${catObj?.tagColor || 'bg-amber-500/15 text-amber-300 border border-amber-500/25'}\`}>
                                      <span>{catObj?.icon || '💍'}</span>
                                      <span>{catObj?.name?.replace(" Invitation", "") || 'Wedding'}</span>
                                    </span>
                                    <span className="font-bold text-slate-100 text-xs sm:text-sm truncate flex-1 min-w-0" title={inv.title}>
                                      {inv.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1.5 text-[9.5px] text-amber-200/80 font-medium mt-1 pl-0.5">
                                    <span 
                                      className="w-2 h-2 rounded-full inline-block shrink-0 border border-amber-400/40" 
                                      style={{ backgroundColor: inv.config?.primaryColor || '#0b1329' }} 
                                    />
                                    <span className="font-mono text-[9px]">{inv.config?.primaryColor || '#0b1329'}</span>
                                    <span className="opacity-40">•</span>
                                    <span className="uppercase text-[8.5px] font-bold tracking-wider opacity-85">
                                      {inv.config?.religionKey || 'SECULAR'}
                                    </span>
                                  </div>
                                </div>
                              </td>`;

  content = content.replace(oldCellBlock.replace(/\r?\n/g, '\r\n'), newCellBlock.replace(/\r?\n/g, '\r\n'));
  if (!content.includes('dashboard-title-pill')) {
    content = content.replace(oldCellBlock.replace(/\r?\n/g, '\n'), newCellBlock.replace(/\r?\n/g, '\n'));
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ AdminDashboard.jsx cell updated with minimal, smart inline pill layout.');
}

// 2. Update index.css
{
  const cssPath = 'Frontend/src/index.css';
  let css = fs.readFileSync(cssPath, 'utf8');

  // Add styles for .dashboard-title-pill and ensure no overflow in td:first-child
  const cssRuleToAdd = `
/* Smart & Minimal Dashboard Title Pill: Everything neatly contained inside with zero overflow */
.dashboard-title-pill,
.admin-dashboard-container td:first-child .dashboard-cell-pill {
  height: auto !important;
  min-height: 50px !important;
  max-height: 58px !important;
  padding: 6px 12px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: flex-start !important;
  border-radius: var(--radius-sm, 14px) !important;
  background: rgba(15, 23, 42, 0.75) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25) !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  width: 100% !important;
}

.dashboard-title-pill:active,
.admin-dashboard-container td:first-child .dashboard-cell-pill:active {
  transform: scale(0.98) !important;
  background: var(--bg-panel, #F7EFE5) !important;
}
`;

  if (!css.includes('.dashboard-title-pill')) {
    css += cssRuleToAdd;
  }

  // Adjust column 1 width to 280px so it's comfortably spacious
  css = css.replace(
    /(\.admin-dashboard-container table:has\(th:nth-child\(5\)\) th:nth-child\(1\),[\s\S]*?width:\s*)240px/g,
    '$1280px'
  );
  css = css.replace(
    /(min-width:\s*)240px/g,
    '$1280px'
  );

  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('✅ index.css updated with .dashboard-title-pill rules.');
}

