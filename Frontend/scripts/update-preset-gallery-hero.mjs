import fs from 'fs';
import path from 'path';

const filePath = path.resolve('Frontend/src/pages/PresetGallery.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports if not present
if (!content.includes('import HomeHeroBanner')) {
  content = content.replace(
    'import InvitationTypeDropdown from \'../components/InvitationTypeDropdown\';',
    `import InvitationTypeDropdown from '../components/InvitationTypeDropdown';
import HomeHeroBanner from '../components/HomeHeroBanner';
import GuidedInvitationModal from '../components/GuidedInvitationModal';`
  );
  console.log('Added HomeHeroBanner and GuidedInvitationModal imports');
}

// 2. Add state inside PresetGallery
if (!content.includes('const [isGuidedModalOpen')) {
  content = content.replace(
    'const [filterReligion, setFilterReligion] = useState("all");',
    `const [filterReligion, setFilterReligion] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isGuidedModalOpen, setIsGuidedModalOpen] = useState(false);
  const presetsSectionRef = React.useRef(null);`
  );
  console.log('Added isGuidedModalOpen, selectedCategory and presetsSectionRef state');
}

// 3. Update filteredPresets logic
content = content.replace(
  `  const filteredPresets = presets.filter(p => {
    if (filterReligion === "all") return true;
    return p.religion === filterReligion;
  });`,
  `  const filteredPresets = presets.filter(p => {
    const religionMatch = filterReligion === "all" || p.religion === filterReligion;
    const categoryMatch = selectedCategory === "all" || 
      (p.category ? p.category === selectedCategory : (selectedCategory === "wedding" || p.religion === selectedCategory));
    return religionMatch && categoryMatch;
  });`
);

// 4. Replace the old bare hero banner with HomeHeroBanner
const oldBannerRegex = /\{\/\* Hero Banner with a beautiful dark themed glass card wrapper \*\/\}[\s\S]*?<\/div>\s*<\/div>/;
const newBanner = `{/* Luxury Interactive Invitation Hero Banner */}
      <HomeHeroBanner
        onDraftClick={() => setIsGuidedModalOpen(true)}
        onExploreClick={() => presetsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          if (catId === "all") {
            setFilterReligion("all");
          }
        }}
      />`;

if (oldBannerRegex.test(content)) {
  content = content.replace(oldBannerRegex, newBanner);
  console.log('Replaced old hero banner with HomeHeroBanner');
} else {
  console.log('Warning: oldBannerRegex did not match, checking alternative');
}

// 5. Add ref to filter toolbar / presets grid wrapper
content = content.replace(
  '{/* Filter Toolbar */}',
  '{/* Presets Section Anchor */}\n      <div ref={presetsSectionRef} className="scroll-mt-6" />\n      {/* Filter Toolbar */}'
);

// 6. Add GuidedInvitationModal before closing div
if (!content.includes('<GuidedInvitationModal')) {
  content = content.replace(
    '<CustomDialog {...dialog} themeConfig={selectedPreset?.config || {}} />',
    `<GuidedInvitationModal
        isOpen={isGuidedModalOpen}
        onClose={() => setIsGuidedModalOpen(false)}
        initialCategoryId={selectedCategory === "all" ? "wedding" : selectedCategory}
        onCreated={(newInv) => {
          showToast("New invitation draft created & Google Drive folder linked!", "success");
          navigate(currentUser?.role === 'admin' ? \`/admin/editor/\${newInv.id}\` : '/customer');
        }}
      />

      <CustomDialog {...dialog} themeConfig={selectedPreset?.config || {}} />`
  );
  console.log('Added GuidedInvitationModal to PresetGallery.jsx');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated PresetGallery.jsx');

