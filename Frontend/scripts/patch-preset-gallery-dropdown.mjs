import fs from 'fs';

let content = fs.readFileSync('Frontend/src/pages/PresetGallery.jsx', 'utf8');

const target = `<InvitationTypeDropdown
              value={filterReligion}
              onChange={setFilterReligion}
              labelText="Tradition & Sacred Symbol"
              className="w-full"
            />`;

const replacement = `<InvitationTypeDropdown
              value={filterReligion}
              onChange={setFilterReligion}
              presets={presets}
              labelText="Tradition & Sacred Symbol"
              className="w-full"
            />`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  console.log("Passed presets to InvitationTypeDropdown");
} else {
  // Regex replace with CRLF safety
  const re = /<InvitationTypeDropdown[\s\S]*?className="w-full"\s*\/>/;
  content = content.replace(re, replacement);
  console.log("Passed presets to InvitationTypeDropdown via regex");
}

fs.writeFileSync('Frontend/src/pages/PresetGallery.jsx', content, 'utf8');

