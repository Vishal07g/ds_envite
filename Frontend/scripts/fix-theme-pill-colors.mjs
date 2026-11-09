import fs from 'fs';
import path from 'path';

// 1. Update Frontend/src/index.css
const cssPath = path.resolve('Frontend/src/index.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

// Replace dark slate dashboard-cell-pill
const oldCellPill = `/* Glassmorphic Cell Pill Backgrounds (Seamless Dark Theme with Crisp Text) */
.dashboard-cell-pill {
  display: inline-flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  justify-content: center !important;
  padding: 6px 14px !important;
  border-radius: var(--radius-sm, 14px) !important;
  background: rgba(15, 23, 42, 0.75) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25) !important;
  box-sizing: border-box !important;
  max-width: 100% !important;
  text-align: left !important;
}

.dashboard-cell-pill p:first-child,
.dashboard-cell-pill span:first-child {
  color: #f8fafc !important; /* Crisp bright white on dark */
  font-weight: 700 !important;
}

.dashboard-cell-pill p:last-child,
.dashboard-cell-pill span:last-child {
  color: #fde68a !important; /* Rich amber gold complementary */
}`;

const newCellPill = `/* Glassmorphic Cell Pill Backgrounds (Harmonized with Luxury Warm Cream Theme) */
.dashboard-cell-pill {
  display: inline-flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  justify-content: center !important;
  padding: 6px 14px !important;
  border-radius: var(--radius-sm, 14px) !important;
  background: var(--bg-card, #FFFEFB) !important;
  border: 1px solid var(--border-normal, #E9DCCB) !important;
  box-shadow: 0 2px 6px rgba(104, 71, 45, 0.05) !important;
  box-sizing: border-box !important;
  max-width: 100% !important;
  text-align: left !important;
  color: var(--text-heading, #513321) !important;
}

.dashboard-cell-pill p:first-child,
.dashboard-cell-pill span:first-child {
  color: var(--text-heading, #513321) !important;
  font-weight: 700 !important;
}

.dashboard-cell-pill p:last-child,
.dashboard-cell-pill span:last-child {
  color: var(--text-body, #6C6B70) !important;
}`;

// Normalize line endings for replacement
const normalize = str => str.replace(/\r\n/g, '\n');
let normCss = normalize(cssContent);
if (normCss.includes(normalize(oldCellPill))) {
  normCss = normCss.replace(normalize(oldCellPill), normalize(newCellPill));
  console.log('Successfully replaced .dashboard-cell-pill in index.css');
} else {
  console.log('Warning: oldCellPill exact match not found, applying regex replace');
  normCss = normCss.replace(
    /\.dashboard-cell-pill\s*\{[^}]*background:[^;]+;[^}]*box-shadow:[^;]+;[^}]*\}/s,
    `.dashboard-cell-pill {
  display: inline-flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  justify-content: center !important;
  padding: 6px 14px !important;
  border-radius: var(--radius-sm, 14px) !important;
  background: var(--bg-card, #FFFEFB) !important;
  border: 1px solid var(--border-normal, #E9DCCB) !important;
  box-shadow: 0 2px 6px rgba(104, 71, 45, 0.05) !important;
  box-sizing: border-box !important;
  max-width: 100% !important;
  text-align: left !important;
  color: var(--text-heading, #513321) !important;
}`
  );
}

// Replace bottom dashboard-title-pill
const oldTitlePill = `/* Smart & Minimal Dashboard Title Pill: Everything neatly contained inside with zero overflow */
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
}`;

const newTitlePill = `/* Smart & Minimal Dashboard Title Pill: Harmonized Warm Ivory/Cream Theme */
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
  background: var(--bg-card, #FFFEFB) !important;
  border: 1px solid var(--border-normal, #E9DCCB) !important;
  box-shadow: 0 2px 6px rgba(104, 71, 45, 0.05) !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  width: 100% !important;
  color: var(--text-heading, #513321) !important;
}

.dashboard-title-pill:active,
.admin-dashboard-container td:first-child .dashboard-cell-pill:active {
  transform: scale(0.98) !important;
  background: var(--bg-panel, #F7EFE5) !important;
}`;

if (normCss.includes(normalize(oldTitlePill))) {
  normCss = normCss.replace(normalize(oldTitlePill), normalize(newTitlePill));
  console.log('Successfully replaced .dashboard-title-pill in index.css');
} else {
  console.log('Warning: oldTitlePill exact match not found, applying regex replace');
  normCss = normCss.replace(
    /\.dashboard-title-pill,\s*\.admin-dashboard-container td:first-child \.dashboard-cell-pill\s*\{[^}]*background:[^;]+;[^}]*\}/s,
    `.dashboard-title-pill,
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
  background: var(--bg-card, #FFFEFB) !important;
  border: 1px solid var(--border-normal, #E9DCCB) !important;
  box-shadow: 0 2px 6px rgba(104, 71, 45, 0.05) !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  width: 100% !important;
  color: var(--text-heading, #513321) !important;
}`
  );
}

fs.writeFileSync(cssPath, normCss, 'utf8');
console.log('Updated index.css');

