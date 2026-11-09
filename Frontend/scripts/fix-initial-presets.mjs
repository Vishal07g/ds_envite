import fs from 'fs';
import path from 'path';

const storePath = path.resolve('Frontend/src/data/store.js');
let content = fs.readFileSync(storePath, 'utf8');

// Replace using regex that matches both \n and \r\n
content = content.replace(
  /(\{\s*id:\s*"preset-classic",\s*title:\s*"Elegant Floral Cream",\s*religion:\s*"secular",)(\s*config:\s*\{)/,
  '$1\n    thumbnail: "/cover_suman_vishal_1k.jpg",$2'
);

content = content.replace(
  /(\{\s*id:\s*"preset-dark",\s*title:\s*"Royal Floral Navy",\s*religion:\s*"secular",)(\s*config:\s*\{)/,
  '$1\n    thumbnail: "/bg_floral_dark.jpg",$2'
);

content = content.replace(
  /(\{\s*id:\s*"preset-green",\s*title:\s*"Romantic Lace Green",\s*religion:\s*"secular",)(\s*config:\s*\{)/,
  '$1\n    thumbnail: "/bg_lace_green.jpg",$2'
);

content = content.replace(
  /(\{\s*id:\s*"preset-royal-scroll",\s*title:\s*"3D Royal Imperial Scroll",\s*religion:\s*"royal",)(\s*config:\s*\{)/,
  '$1\n    thumbnail: "/real_palace_doors.jpg",$2'
);

content = content.replace(
  /(\{\s*id:\s*"preset-royal-palace",\s*title:\s*"Indian Vintage Royal Palace \(Rajwada\)",\s*religion:\s*"hindu",)(\s*config:\s*\{)/,
  '$1\n    thumbnail: "/thumbnails/radha-krishna.jpg",$2'
);

content = content.replace(
  /(\{\s*id:\s*"preset-neon-glass",\s*title:\s*"Cyberpunk Minimalist Neon Glass",\s*religion:\s*"secular",)(\s*config:\s*\{)/,
  '$1\n    thumbnail: "/cover_suman_vishal_1k.jpg",$2'
);

content = content.replace(
  /(\{\s*id:\s*"preset-gold-foil",\s*title:\s*"Luxury Metallic Floral Gold Foil",\s*religion:\s*"secular",)(\s*config:\s*\{)/,
  '$1\n    thumbnail: "/cover_suman_vishal_1k.jpg",$2'
);

// Also in serverDbCache in getDb():
content = content.replace(
  /(if \(!serverDbCache\) \{\s*serverDbCache = \{[\s\S]*?presets: JSON\.parse\(JSON\.stringify\(INITIAL_PRESETS\)\),[\s\S]*?\};)/,
  `$1
      // Hydrate thumbnails for serverDbCache presets
      serverDbCache.presets.forEach(p => {
        if (!p.thumbnail) {
          p.thumbnail = p.config?.heroImage || '/cover_suman_vishal_1k.jpg';
        }
      });`
);

fs.writeFileSync(storePath, content, 'utf8');
console.log("INITIAL_PRESETS thumbnails updated with regex!");

