import fs from 'fs';
import path from 'path';

const storePath = path.resolve('Frontend/src/data/store.js');
let content = fs.readFileSync(storePath, 'utf8');

// 1. Update createPreset and createPresetFromInvitation
const oldCreatePreset = `  createPreset(title, religion = "secular", config = {}) {
    const db = getDb();
    const presetId = \`preset-\${Date.now()}\`;
    const newPreset = {
      id: presetId,
      title,
      religion,
      config: {
        ...DEFAULT_CONFIG,
        presetId,
        religionKey: religion,
        ...config
      }
    };
    db.presets.push(newPreset);
    saveDb(db);
    dispatchDbSynced();
    return newPreset;
  },
  createPresetFromInvitation(configOrId, title) {
    const db = getDb();
    let config = null;
    if (typeof configOrId === 'string') {
      const inv = db.invitations.find(i => i.id === configOrId);
      if (inv) config = inv.config;
    } else if (configOrId && typeof configOrId === 'object') {
      config = configOrId;
    }
    if (!config) throw new Error("Configuration not found");
    const newPreset = {
      id: \`preset-\${Date.now()}\`,
      title,
      religion: config.religionKey || "secular",
      config: JSON.parse(JSON.stringify(config))
    };
    db.presets.push(newPreset);
    saveDb(db);
    dispatchDbSynced();
    return newPreset;
  },`;

const newCreatePreset = `  createPreset(title, religion = "secular", config = {}) {
    const db = getDb();
    const presetId = \`preset-\${Date.now()}\`;
    const coverDesign = (config.heroImage && config.heroImage !== '/bg_floral_pink.jpg')
      ? config.heroImage
      : (config.coverImage || ((config.brideName?.toLowerCase() === 'suman' || title?.toLowerCase().includes('suman')) ? '/cover_suman_vishal_1k.jpg' : (config.heroImage || '/cover_suman_vishal_1k.jpg')));

    const newPreset = {
      id: presetId,
      title,
      religion,
      thumbnail: coverDesign,
      config: {
        ...DEFAULT_CONFIG,
        presetId,
        religionKey: religion,
        ...config,
        heroImage: config.heroImage || coverDesign
      }
    };
    db.presets.push(newPreset);
    saveDb(db);
    dispatchDbSynced();
    return newPreset;
  },
  createPresetFromInvitation(configOrId, title) {
    const db = getDb();
    let config = null;
    let invObj = null;
    if (typeof configOrId === 'string') {
      invObj = db.invitations.find(i => i.id === configOrId);
      if (invObj) config = invObj.config;
    } else if (configOrId && typeof configOrId === 'object') {
      config = configOrId;
      if (config.invitationId) {
        invObj = db.invitations.find(i => i.id === config.invitationId);
      }
      if (!invObj && config.brideName) {
        invObj = db.invitations.find(i => i.config?.brideName === config.brideName);
      }
    }
    if (!config) throw new Error("Configuration not found");

    // The cover design of the same invitation MUST be the thumbnail of the theme by default
    const coverDesign = (config.heroImage && config.heroImage !== '/bg_floral_pink.jpg')
      ? config.heroImage
      : (invObj?.config?.heroImage && invObj.config.heroImage !== '/bg_floral_pink.jpg'
        ? invObj.config.heroImage
        : (config.coverImage || ((config.brideName?.toLowerCase() === 'suman' || title?.toLowerCase().includes('suman')) ? '/cover_suman_vishal_1k.jpg' : (config.heroImage || '/cover_suman_vishal_1k.jpg'))));

    const newPreset = {
      id: \`preset-\${Date.now()}\`,
      title,
      religion: config.religionKey || "secular",
      thumbnail: coverDesign,
      config: {
        ...JSON.parse(JSON.stringify(config)),
        heroImage: coverDesign
      }
    };
    db.presets.push(newPreset);
    saveDb(db);
    dispatchDbSynced();
    return newPreset;
  },`;

if (content.includes(oldCreatePreset.replace(/\r?\n/g, '\r\n')) || content.includes(oldCreatePreset.replace(/\r?\n/g, '\n'))) {
  const normOld = content.includes('\r\n') ? oldCreatePreset.replace(/\r?\n/g, '\r\n') : oldCreatePreset.replace(/\r?\n/g, '\n');
  const normNew = content.includes('\r\n') ? newCreatePreset.replace(/\r?\n/g, '\r\n') : newCreatePreset.replace(/\r?\n/g, '\n');
  content = content.replace(normOld, normNew);
  console.log("Updated createPreset and createPresetFromInvitation");
} else {
  console.log("Could not find exact createPreset, checking partial...");
}

// 2. Add hydration in getDb() before return db;
const getDbReturnMarker = `    }
  }

  return db;`;

const getDbNewHydration = `    }
  }

  // Ensure cover design of same invitation is thumbnail of theme by default
  if (db.presets && Array.isArray(db.presets)) {
    db.presets.forEach(p => {
      const cfg = p.config || {};
      const matchingInv = db.invitations?.find(i => 
        (i.config?.presetId === p.id || i.presetId === p.id) ||
        (i.config?.brideName && cfg.brideName && i.config.brideName.toLowerCase() === cfg.brideName.toLowerCase()) ||
        (p.title && i.title && i.title.toLowerCase().includes(p.title.toLowerCase().replace(/['’]s\\s*theme/i, '').trim()))
      );

      const invCover = (matchingInv?.config?.heroImage && matchingInv.config.heroImage !== '/bg_floral_pink.jpg')
        ? matchingInv.config.heroImage
        : (matchingInv?.config?.coverImage || (
            (cfg.heroImage && cfg.heroImage !== '/bg_floral_pink.jpg')
              ? cfg.heroImage
              : ((cfg.brideName?.toLowerCase() === 'suman' || p.title?.toLowerCase().includes('suman'))
                ? '/cover_suman_vishal_1k.jpg'
                : (p.religion === 'hindu' ? '/thumbnails/radha-krishna.jpg' : '/cover_suman_vishal_1k.jpg'))
          ));

      if (!p.thumbnail || p.thumbnail === '/bg_floral_pink.jpg') {
        p.thumbnail = invCover;
      }
      if (!p.config.heroImage || p.config.heroImage === '/bg_floral_pink.jpg') {
        p.config.heroImage = invCover;
      }
    });
  }

  return db;`;

const normReturnMarker = content.includes('\r\n') ? getDbReturnMarker.replace(/\r?\n/g, '\r\n') : getDbReturnMarker.replace(/\r?\n/g, '\n');
const normNewHydration = content.includes('\r\n') ? getDbNewHydration.replace(/\r?\n/g, '\r\n') : getDbNewHydration.replace(/\r?\n/g, '\n');

if (content.includes(normReturnMarker)) {
  content = content.replace(normReturnMarker, normNewHydration);
  console.log("Updated getDb() theme thumbnail hydration");
}

fs.writeFileSync(storePath, content, 'utf8');
console.log("store.js written successfully");

