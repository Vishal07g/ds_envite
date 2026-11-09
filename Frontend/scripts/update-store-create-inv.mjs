import fs from 'fs';

const storePath = 'Frontend/src/data/store.js';
let content = fs.readFileSync(storePath, 'utf8');

const oldCreateCode = `    // For new draft invitations, if no names provided or using static default or generic title, generate random bride/groom and hero character
    let fullConfig = { ...DEFAULT_CONFIG, ...(config || {}) };
    let bride = (fullConfig.coverBrideText || fullConfig.brideName || "").trim();
    let groom = (fullConfig.coverGroomText || fullConfig.groomName || "").trim();
    let hero = (fullConfig.heroCharacter || fullConfig.characterName || fullConfig.heroName || "").trim();

    const isGenericTitle = !title || title === "New Wedding Invitation" || title === "New Invitation";
    const isDefaultNames = (!bride && !groom && !hero) || (bride === "Suman" && groom === "Vishal");

    if (isDefaultNames || isGenericTitle) {
      const randomCfg = generateRandomDraftConfig(fullConfig.eventType || 'wedding', fullConfig);
      fullConfig = { ...fullConfig, ...randomCfg };
      bride = randomCfg.brideName;
      groom = randomCfg.groomName;
      hero = randomCfg.heroCharacter;
    }`;

const newCreateCode = `    // For new draft invitations, isolate category defaults so wedding never leaks into other categories
    const cat = config?.category;
    const isNonWedding = cat && cat !== 'wedding';
    const baseDefaults = isNonWedding ? getCategoryDefaultConfig(cat, config) : DEFAULT_CONFIG;
    let fullConfig = { ...baseDefaults, ...(config || {}) };
    let bride = (fullConfig.coverBrideText || fullConfig.brideName || "").trim();
    let groom = (fullConfig.coverGroomText || fullConfig.groomName || "").trim();
    let hero = (fullConfig.heroCharacter || fullConfig.characterName || fullConfig.heroName || "").trim();

    const isGenericTitle = !title || title === "New Wedding Invitation" || title === "New Invitation";
    const isDefaultNames = (!bride && !groom && !hero) || (bride === "Suman" && groom === "Vishal");

    if (!isNonWedding && (isDefaultNames || isGenericTitle)) {
      const randomCfg = generateRandomDraftConfig(fullConfig.eventType || 'wedding', fullConfig);
      fullConfig = { ...fullConfig, ...randomCfg };
      bride = randomCfg.brideName;
      groom = randomCfg.groomName;
      hero = randomCfg.heroCharacter;
    }`;

content = content.replace(oldCreateCode.replace(/\r?\n/g, '\r\n'), newCreateCode.replace(/\r?\n/g, '\r\n'));
if (!content.includes('const isNonWedding = cat && cat !== \'wedding\';')) {
  content = content.replace(oldCreateCode.replace(/\r?\n/g, '\n'), newCreateCode.replace(/\r?\n/g, '\n'));
}

fs.writeFileSync(storePath, content, 'utf8');
console.log('✅ store.js createInvitation updated successfully.');

