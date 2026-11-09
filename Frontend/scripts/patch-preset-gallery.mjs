import fs from 'fs';

let content = fs.readFileSync('Frontend/src/pages/PresetGallery.jsx', 'utf8');

// 1. Add imports if not present
if (!content.includes("CinematicHeroBanner")) {
  content = content.replace(
    "import HomeHeroBanner from '../components/HomeHeroBanner';",
    `import HomeHeroBanner from '../components/HomeHeroBanner';
import CinematicHeroBanner from '../components/CinematicHeroBanner';
import CinematicLandingBackground from '../components/CinematicLandingBackground';`
  );
  console.log("Added CinematicHeroBanner & CinematicLandingBackground imports");
}

// 2. Add brandSettings state to PresetGallery
if (!content.includes("const [brandSettings, setBrandSettings]")) {
  const stateInsertTarget = "const [presets, setPresets] = useState(() => dbStore.getPresets());";
  const stateReplacement = `const [presets, setPresets] = useState(() => dbStore.getPresets());
  const [brandSettings, setBrandSettings] = useState(() => dbStore.getBrandSettings());`;
  
  content = content.replace(stateInsertTarget, stateReplacement);

  const syncTarget = "setPresets(dbStore.getPresets());";
  const syncReplacement = `setPresets(dbStore.getPresets());
      setBrandSettings(dbStore.getBrandSettings());`;
  content = content.replace(syncTarget, syncReplacement);
  console.log("Added brandSettings state and sync listener in PresetGallery");
}

// 3. Replace HomeHeroBanner with CinematicHeroBanner + CinematicLandingBackground
const heroSearch = /\{\/\* Luxury Interactive Invitation Hero Banner \*\/\}\r?\n\s*<HomeHeroBanner[\s\S]*?\/>/;

const heroReplacement = `{/* 1. Cinematic Multi-Layer Architectural Background Environment */}
      {brandSettings?.landingTheme && (
        <CinematicLandingBackground theme={brandSettings.landingTheme} />
      )}

      {/* 2. Full-Width Cinematic Hero Banner & Integrated Occasion Category Selector */}
      <CinematicHeroBanner
        theme={brandSettings?.landingTheme}
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

if (heroSearch.test(content)) {
  content = content.replace(heroSearch, heroReplacement);
  console.log("Replaced HomeHeroBanner with CinematicHeroBanner and Background");
} else {
  console.warn("Could not find HomeHeroBanner pattern in PresetGallery");
}

fs.writeFileSync('Frontend/src/pages/PresetGallery.jsx', content, 'utf8');

