import fs from 'fs';

let c = fs.readFileSync('Frontend/src/App.jsx', 'utf8');
const search = `  // Hide header on client invite, editor, and printable PDF pages
  const normalizedPath = (location.pathname || '').toLowerCase();`;
const repl = `  // Hide header on client invite, editor, and printable PDF pages`;

c = c.replace(search, repl).replace(search.replace(/\n/g, '\r\n'), repl);
fs.writeFileSync('Frontend/src/App.jsx', c, 'utf8');
console.log("Cleaned duplicate normalizedPath in App.jsx");

