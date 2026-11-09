import fs from 'fs';
import path from 'path';

// ==========================================
// 1. Update Frontend/src/data/store.js
// ==========================================
const storePath = path.resolve('Frontend/src/data/store.js');
let storeContent = fs.readFileSync(storePath, 'utf8');

// A. Insert isGenericInvitationTitle and getHeroCharacterTitle after getRandomHeroCharacterName()
const helperFns = `
export function isGenericInvitationTitle(title) {
  if (!title || typeof title !== "string") return true;
  const t = title.trim().toLowerCase();
  return (
    t === "new wedding invitation" ||
    t.startsWith("new wedding invitation") ||
    t === "wedding invitation" ||
    t.startsWith("wedding invitation (copy") ||
    t === "new invitation" ||
    t.startsWith("new invitation") ||
    t === "invitation" ||
    t.startsWith("invitation (copy") ||
    t.includes("untitled")
  );
}

export function getHeroCharacterTitle(config = {}, rawTitle = "") {
  const cat = config?.category || config?.eventType || "wedding";
  const raw = typeof rawTitle === "string" ? rawTitle : "";
  const isCopy = raw.toLowerCase().includes("(copy)");
  const copyCount = (raw.match(/\\(copy\\)/gi) || []).length;
  const copySuffix = copyCount > 1 ? \` (Copy \${copyCount})\` : (isCopy ? " (Copy)" : "");

  // 1. Birthday
  if (cat === "birthday") {
    const hero = (config?.heroName || config?.heroCharacter || config?.characterName || config?.birthdayPersonName || "").trim();
    if (hero) return \`\${hero} - Birthday Invitation\${copySuffix}\`;
  }

  // 2. First Birthday
  if (cat === "first_birthday") {
    const hero = (config?.babyName || config?.heroName || config?.characterName || "").trim();
    if (hero) return \`\${hero} - First Birthday Invitation\${copySuffix}\`;
  }

  // 3. Baby Shower
  if (cat === "baby_shower") {
    const hero = (config?.motherName || config?.parentsNames || config?.heroName || "").trim();
    if (hero) return \`\${hero} - Baby Shower Invitation\${copySuffix}\`;
  }

  // 4. Naming Ceremony
  if (cat === "naming_ceremony") {
    const hero = (config?.babyName || config?.heroName || "").trim();
    if (hero) return \`\${hero} - Naming Ceremony Invitation\${copySuffix}\`;
  }

  // 5. Housewarming
  if (cat === "housewarming") {
    const hero = (config?.familyName || config?.hostNames || config?.heroName || "").trim();
    if (hero) return \`\${hero} - Housewarming Invitation\${copySuffix}\`;
  }

  // 6. Anniversary
  if (cat === "anniversary") {
    const hero = (config?.coupleNames || (config?.brideName && config?.groomName ? \`\${config.brideName} & \${config.groomName}\` : null) || config?.heroName || "").trim();
    if (hero) return \`\${hero} - Anniversary Invitation\${copySuffix}\`;
  }

  // 7. Religious Ceremony
  if (cat === "religious_ceremony") {
    const hero = (config?.hostName || config?.familyName || config?.ceremonyName || config?.heroName || "").trim();
    if (hero) return \`\${hero} - Religious Ceremony Invitation\${copySuffix}\`;
  }

  // 8. Corporate Event
  if (cat === "corporate_event") {
    const hero = (config?.companyName || config?.eventName || config?.keynoteSpeaker || config?.heroName || "").trim();
    if (hero) return \`\${hero} - Corporate Event Invitation\${copySuffix}\`;
  }

  // 9. Wedding
  let bride = (config?.coverBrideText || config?.brideName || config?.storyBrideName || "").trim();
  let groom = (config?.coverGroomText || config?.groomName || config?.storyGroomName || "").trim();

  if (bride && groom) {
    if (config?.coupleCardsOrder === "groomFirst") {
      return \`\${groom} & \${bride}'s Wedding\${copySuffix}\`;
    }
    return \`\${bride} & \${groom}'s Wedding\${copySuffix}\`;
  } else if (bride) {
    return \`\${bride}'s Wedding\${copySuffix}\`;
  } else if (groom) {
    return \`\${groom}'s Wedding\${copySuffix}\`;
  }

  const generalHero = (config?.heroCharacter || config?.heroName || config?.characterName || "").trim();
  if (generalHero) {
    return \`\${generalHero} Invitation\${copySuffix}\`;
  }

  return rawTitle && !isGenericInvitationTitle(rawTitle) ? rawTitle : \`Wedding Invitation\${copySuffix}\`;
}
`;

if (!storeContent.includes('export function isGenericInvitationTitle')) {
  storeContent = storeContent.replace(
    'export function getRandomHeroCharacterName() {',
    `${helperFns}\nexport function getRandomHeroCharacterName() {`
  );
  console.log('Added isGenericInvitationTitle and getHeroCharacterTitle to store.js');
}

// B. In getInvitations(), add title auto-healing inside the loop
const titleHealingBlock = `
          // Auto-heal generic titles so every invitation draft displays the main character / hero character name
          if (!inv.isPaid && isGenericInvitationTitle(inv.title)) {
            const cfg = inv.config || {};
            let bride = (cfg.coverBrideText || cfg.brideName || "").trim();
            let groom = (cfg.coverGroomText || cfg.groomName || "").trim();
            let hero = (cfg.heroName || cfg.heroCharacter || cfg.characterName || cfg.birthdayPersonName || "").trim();

            if ((!bride && !groom && !hero) || (bride === "Suman" && groom === "Vishal" && inv.id !== "invite-1792299417819")) {
              const randCfg = generateRandomDraftConfig(cfg.category || cfg.eventType || 'wedding', cfg);
              inv.config = { ...cfg, ...randCfg };
            }
            inv.title = getHeroCharacterTitle(inv.config, inv.title);
            hasChanges = true;
          }
`;

if (!storeContent.includes('Auto-heal generic titles so every invitation draft displays')) {
  storeContent = storeContent.replace(
    '// Auto-heal Ceremonies if still showing wedding rituals',
    `${titleHealingBlock}\n          // Auto-heal Ceremonies if still showing wedding rituals`
  );
  console.log('Added title auto-healing into store.js getInvitations()');
}

// C. In duplicateInvitation, ensure title uses hero names
storeContent = storeContent.replace(
  'const newTitle = customTitle || `${source.title || (bride && groom ? `${bride} & ${groom}\'s Wedding` : "Invitation")} (Copy)`;',
  `const heroTitle = getHeroCharacterTitle(cleanConfig);
    const isSrcGeneric = isGenericInvitationTitle(source.title);
    const newTitle = customTitle || (isSrcGeneric ? \`\${heroTitle} (Copy)\` : \`\${source.title || heroTitle} (Copy)\`);`
);

fs.writeFileSync(storePath, storeContent, 'utf8');
console.log('Successfully updated store.js');

// ==========================================
// 2. Update Frontend/src/pages/InvitationEditor.jsx
// ==========================================
const editorPath = path.resolve('Frontend/src/pages/InvitationEditor.jsx');
let editorContent = fs.readFileSync(editorPath, 'utf8');

// A. Import helpers from store.js
if (!editorContent.includes('isGenericInvitationTitle')) {
  editorContent = editorContent.replace(
    'import dbStore, { DEFAULT_CONFIG } from "../data/store.js";',
    'import dbStore, { DEFAULT_CONFIG, getHeroCharacterTitle, isGenericInvitationTitle } from "../data/store.js";'
  );
  console.log('Added helper imports to InvitationEditor.jsx');
}

// B. In useState for title:
editorContent = editorContent.replace(
  `  const [title, setTitle] = useState(() => {
    if (cachedInv?.title) return cachedInv.title;
    const cfg = initialDraftConfig.current;
    if (cfg?.brideName && cfg?.groomName) {
      return \`\${cfg.brideName} & \${cfg.groomName}'s Wedding\`;
    }
    if (cfg?.heroCharacter) {
      return \`\${cfg.heroCharacter} Invitation\`;
    }
    return "New Wedding Invitation";
  });`,
  `  const [title, setTitle] = useState(() => {
    if (cachedInv?.title && !isGenericInvitationTitle(cachedInv.title)) return cachedInv.title;
    const cfg = initialDraftConfig.current;
    return getHeroCharacterTitle(cfg, cachedInv?.title) || "Invitation";
  });`
);

// C. In useEffect when loading invitation:
editorContent = editorContent.replace(
  'setTitle(inv.title);',
  `const effectiveTitle = isGenericInvitationTitle(inv.title)
          ? getHeroCharacterTitle(cleanedConfig, inv.title)
          : inv.title;
        setTitle(effectiveTitle);`
);

// D. In handleSave:
editorContent = editorContent.replace(
  `  const handleSave = async () => {
    const dataToSave = {
      title,`,
  `  const handleSave = async () => {
    const effectiveTitle = isGenericInvitationTitle(title)
      ? getHeroCharacterTitle(config, title)
      : title;
    const dataToSave = {
      title: effectiveTitle,`
);

fs.writeFileSync(editorPath, editorContent, 'utf8');
console.log('Successfully updated InvitationEditor.jsx');

