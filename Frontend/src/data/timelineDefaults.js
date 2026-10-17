// Wedding Ceremony Timeline Defaults, SVGs, Templates & Helpers

export const TIMELINE_CLIPARTS = {
  // HALDI MOTIFS
  "haldi-bowl": {
    id: "haldi-bowl",
    name: "Golden Turmeric Bowl & Herbs",
    category: "haldi",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="url(#haldi-bg)"/>
      <ellipse cx="50" cy="74" rx="30" ry="6" fill="#eab308" opacity="0.3"/>
      <path d="M34 40C26 30 36 20 46 32C40 38 36 40 34 40Z" fill="#15803d"/>
      <path d="M46 32C52 24 64 26 58 38C52 38 48 34 46 32Z" fill="#16a34a"/>
      <path d="M28 66C24 62 30 58 36 62C40 65 38 72 32 70Z" fill="#d97706"/>
      <path d="M64 68C70 64 76 68 72 72C66 76 60 72 64 68Z" fill="#b45309"/>
      <path d="M32 50C34 38 66 38 68 50Z" fill="#f59e0b"/>
      <path d="M38 46C44 38 56 38 62 46Z" fill="#fbbf24"/>
      <path d="M28 50C28 66 72 66 72 50C72 48 28 48 28 50Z" fill="url(#gold-bowl)"/>
      <path d="M42 66L40 74H60L58 66Z" fill="#b45309"/>
      <ellipse cx="50" cy="74" rx="14" ry="2" fill="#78350f"/>
      <circle cx="26" cy="62" r="5" fill="#f97316"/>
      <circle cx="26" cy="62" r="3" fill="#fde047"/>
      <circle cx="74" cy="62" r="5" fill="#f97316"/>
      <circle cx="74" cy="62" r="3" fill="#fde047"/>
      <defs>
        <radialGradient id="haldi-bg" cx="50" cy="50" r="48" gradientUnits="userSpaceOnUse">
          <stop stop-color="#fffbeb"/>
          <stop offset="1" stop-color="#fef3c7"/>
        </radialGradient>
        <linearGradient id="gold-bowl" x1="28" y1="50" x2="72" y2="66" gradientUnits="userSpaceOnUse">
          <stop stop-color="#fde047"/>
          <stop offset="0.5" stop-color="#d97706"/>
          <stop offset="1" stop-color="#78350f"/>
        </linearGradient>
      </defs>
    </svg>`
  },
  "haldi-leaves": {
    id: "haldi-leaves",
    name: "Turmeric Leaves & Swatch",
    category: "haldi",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#fffdf5"/>
      <ellipse cx="50" cy="56" rx="26" ry="12" fill="#fbbf24" opacity="0.6"/>
      <path d="M35 65C30 45 45 30 50 20C55 30 70 45 65 65Z" fill="#16a34a"/>
      <path d="M50 22V65" stroke="#fef08a" stroke-width="1.5"/>
      <circle cx="50" cy="58" r="12" fill="#d97706"/>
      <circle cx="50" cy="58" r="8" fill="#fde047"/>
    </svg>`
  },
  "haldi-marigold": {
    id: "haldi-marigold",
    name: "Minimal Marigold Bloom",
    category: "haldi",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#fffbeb"/>
      <circle cx="50" cy="50" r="24" fill="#ea580c"/>
      <circle cx="50" cy="50" r="19" fill="#f97316"/>
      <circle cx="50" cy="50" r="14" fill="#facc15"/>
      <circle cx="50" cy="50" r="8" fill="#fef08a"/>
      <path d="M26 36C22 28 32 20 40 28" stroke="#15803d" stroke-width="3" stroke-linecap="round"/>
      <path d="M74 36C78 28 68 20 60 28" stroke="#15803d" stroke-width="3" stroke-linecap="round"/>
      <circle cx="25" cy="55" r="7" fill="#f97316"/>
      <circle cx="75" cy="55" r="7" fill="#f97316"/>
    </svg>`
  },

  // MEHENDI MOTIFS
  "mehendi-cone": {
    id: "mehendi-cone",
    name: "Henna Cone & Paisley",
    category: "mehendi",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="url(#mehendi-bg)"/>
      <path d="M30 65C22 55 24 38 36 34C44 32 46 40 40 46C36 50 34 58 40 64C36 65 32 65 30 65Z" fill="#881337" opacity="0.25"/>
      <circle cx="34" cy="42" r="3" fill="#881337" opacity="0.4"/>
      <g transform="rotate(24 50 50)">
        <path d="M46 16L38 74L48 76L62 20Z" fill="url(#cone-foil)"/>
        <path d="M38 74L35 84L41 78Z" fill="#9f1239"/>
        <path d="M46 16L62 20L58 14L48 13Z" fill="#b45309"/>
        <rect x="42" y="38" width="16" height="6" rx="1" fill="#fef08a" opacity="0.9"/>
      </g>
      <path d="M62 60C70 58 74 66 68 72C64 76 56 74 60 66" stroke="#9f1239" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="70" cy="62" r="2" fill="#9f1239"/>
      <circle cx="64" cy="74" r="1.5" fill="#9f1239"/>
      <defs>
        <radialGradient id="mehendi-bg" cx="50" cy="50" r="48" gradientUnits="userSpaceOnUse">
          <stop stop-color="#fff1f2"/>
          <stop offset="1" stop-color="#ffe4e6"/>
        </radialGradient>
        <linearGradient id="cone-foil" x1="40" y1="20" x2="60" y2="80" gradientUnits="userSpaceOnUse">
          <stop stop-color="#e11d48"/>
          <stop offset="0.5" stop-color="#9f1239"/>
          <stop offset="1" stop-color="#4c0519"/>
        </linearGradient>
      </defs>
    </svg>`
  },
  "mehendi-hand": {
    id: "mehendi-hand",
    name: "Henna Palm & Mandala",
    category: "mehendi",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#fff1f2"/>
      <circle cx="50" cy="50" r="20" stroke="#9f1239" stroke-width="1.5" stroke-dasharray="3 3"/>
      <circle cx="50" cy="50" r="12" fill="#be123c"/>
      <circle cx="50" cy="50" r="6" fill="#fecdd3"/>
      <circle cx="50" cy="22" r="3" fill="#9f1239"/>
      <circle cx="50" cy="78" r="3" fill="#9f1239"/>
      <circle cx="22" cy="50" r="3" fill="#9f1239"/>
      <circle cx="78" cy="50" r="3" fill="#9f1239"/>
      <path d="M35 35L42 42M65 65L58 58M65 35L58 42M35 65L42 58" stroke="#9f1239" stroke-width="1.5"/>
    </svg>`
  },
  "mehendi-botanical": {
    id: "mehendi-botanical",
    name: "Botanical Henna Vine",
    category: "mehendi",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#fff1f2"/>
      <path d="M25 75C35 60 45 40 75 25" stroke="#9f1239" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="75" cy="25" r="4" fill="#be123c"/>
      <path d="M40 55C45 48 48 56 42 62Z" fill="#9f1239"/>
      <path d="M55 42C62 38 64 45 58 50Z" fill="#be123c"/>
      <path d="M32 68C36 62 40 68 34 72Z" fill="#9f1239"/>
      <circle cx="68" cy="34" r="2.5" fill="#f43f5e"/>
    </svg>`
  },

  // SANGEET MOTIFS
  "sangeet-dhol": {
    id: "sangeet-dhol",
    name: "Festive Dhol Drum & Blossoms",
    category: "sangeet",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="url(#sangeet-bg)"/>
      <g transform="rotate(-15 50 50)">
        <ellipse cx="28" cy="50" rx="6" ry="18" fill="#451a03"/>
        <ellipse cx="28" cy="50" rx="4" ry="16" fill="#fed7aa"/>
        <path d="M28 32C42 28 58 28 72 32V68C58 72 42 72 28 68Z" fill="url(#dhol-wood)"/>
        <ellipse cx="72" cy="50" rx="6" ry="18" fill="#451a03"/>
        <ellipse cx="72" cy="50" rx="4" ry="16" fill="#fed7aa"/>
        <path d="M28 34L72 50L28 66L72 34M28 50L72 66" stroke="#fef08a" stroke-width="1.5" opacity="0.85"/>
        <ellipse cx="50" cy="50" rx="1.5" ry="19" fill="#f59e0b"/>
      </g>
      <circle cx="28" cy="30" r="6" fill="#ec4899"/>
      <circle cx="28" cy="30" r="3" fill="#fdf2f8"/>
      <circle cx="74" cy="70" r="6" fill="#ec4899"/>
      <circle cx="74" cy="70" r="3" fill="#fdf2f8"/>
      <defs>
        <radialGradient id="sangeet-bg" cx="50" cy="50" r="48" gradientUnits="userSpaceOnUse">
          <stop stop-color="#fdf4ff"/>
          <stop offset="1" stop-color="#fae8ff"/>
        </radialGradient>
        <linearGradient id="dhol-wood" x1="28" y1="32" x2="72" y2="68" gradientUnits="userSpaceOnUse">
          <stop stop-color="#9a3412"/>
          <stop offset="0.5" stop-color="#c2410c"/>
          <stop offset="1" stop-color="#7c2d12"/>
        </linearGradient>
      </defs>
    </svg>`
  },
  "sangeet-notes": {
    id: "sangeet-notes",
    name: "Golden Musical Harmonics",
    category: "sangeet",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#faf5ff"/>
      <path d="M36 62C36 56 42 54 48 58V32L68 26V52C68 46 74 44 80 48" stroke="#9333ea" stroke-width="3" stroke-linecap="round"/>
      <circle cx="36" cy="62" r="7" fill="#a855f7"/>
      <circle cx="68" cy="52" r="7" fill="#a855f7"/>
      <path d="M48 36L68 30" stroke="#eab308" stroke-width="4"/>
      <path d="M22 36C26 30 32 30 36 34" stroke="#d97706" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  "sangeet-dance": {
    id: "sangeet-dance",
    name: "Dancing Silhouette & Ghungroo",
    category: "sangeet",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#fdf4ff"/>
      <circle cx="50" cy="30" r="8" fill="#c026d3"/>
      <path d="M42 42C46 38 54 38 58 42L66 54L60 58L54 48V64L62 76H56L50 66L44 76H38L46 64V48L40 58L34 54Z" fill="#a21caf"/>
      <circle cx="32" cy="74" r="3" fill="#eab308"/>
      <circle cx="68" cy="74" r="3" fill="#eab308"/>
    </svg>`
  },

  // WEDDING MOTIFS
  "wedding-mandap": {
    id: "wedding-mandap",
    name: "Royal Floral Mandap & Chairs",
    category: "wedding",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="url(#mandap-bg)"/>
      <path d="M18 78H82V82H18Z" fill="#b45309"/>
      <path d="M24 74H76V78H24Z" fill="#d97706"/>
      <rect x="25" y="34" width="6" height="40" rx="1" fill="#fde047" stroke="#b45309" stroke-width="1"/>
      <rect x="69" y="34" width="6" height="40" rx="1" fill="#fde047" stroke="#b45309" stroke-width="1"/>
      <path d="M28 34C38 46 36 64 26 74" stroke="#e11d48" stroke-width="6" stroke-linecap="round"/>
      <path d="M72 34C62 46 64 64 74 74" stroke="#e11d48" stroke-width="6" stroke-linecap="round"/>
      <path d="M22 34C36 22 64 22 78 34" fill="#fb7185"/>
      <path d="M20 34H80V37H20Z" fill="#e11d48"/>
      <circle cx="26" cy="34" r="3.5" fill="#fff"/>
      <circle cx="34" cy="31" r="3.5" fill="#f43f5e"/>
      <circle cx="42" cy="29" r="3.5" fill="#fff"/>
      <circle cx="50" cy="28" r="4" fill="#f43f5e"/>
      <circle cx="58" cy="29" r="3.5" fill="#fff"/>
      <circle cx="66" cy="31" r="3.5" fill="#f43f5e"/>
      <circle cx="74" cy="34" r="3.5" fill="#fff"/>
      <path d="M40 58H48V74H40Z" fill="#f59e0b"/>
      <path d="M40 52H48V58H40Z" fill="#be123c"/>
      <path d="M52 58H60V74H52Z" fill="#f59e0b"/>
      <path d="M52 52H60V58H52Z" fill="#be123c"/>
      <defs>
        <radialGradient id="mandap-bg" cx="50" cy="50" r="48" gradientUnits="userSpaceOnUse">
          <stop stop-color="#fff1f2"/>
          <stop offset="1" stop-color="#fce7f3"/>
        </radialGradient>
      </defs>
    </svg>`
  },
  "wedding-rings": {
    id: "wedding-rings",
    name: "Interlocking Gold Rings",
    category: "wedding",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#fffbeb"/>
      <circle cx="42" cy="52" r="16" stroke="#d97706" stroke-width="5"/>
      <circle cx="42" cy="52" r="16" stroke="#fde047" stroke-width="2.5"/>
      <circle cx="58" cy="52" r="16" stroke="#d97706" stroke-width="5"/>
      <circle cx="58" cy="52" r="16" stroke="#fde047" stroke-width="2.5"/>
      <path d="M42 32L38 24H46L42 32Z" fill="#38bdf8"/>
      <path d="M42 18L44 24H40L42 18Z" fill="#bae6fd"/>
    </svg>`
  },
  "wedding-arch": {
    id: "wedding-arch",
    name: "Floral Wedding Arch",
    category: "wedding",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#fff7ed"/>
      <path d="M30 80V45C30 32 70 32 70 45V80" stroke="#b45309" stroke-width="3"/>
      <path d="M26 40C32 25 68 25 74 40" stroke="#f43f5e" stroke-width="6" stroke-linecap="round"/>
      <circle cx="36" cy="30" r="4" fill="#fb7185"/>
      <circle cx="50" cy="26" r="4" fill="#f43f5e"/>
      <circle cx="64" cy="30" r="4" fill="#fb7185"/>
      <circle cx="30" cy="45" r="3.5" fill="#f43f5e"/>
      <circle cx="70" cy="45" r="3.5" fill="#f43f5e"/>
    </svg>`
  },

  // RECEPTION MOTIFS
  "reception-plates": {
    id: "reception-plates",
    name: "Fine Dining Place Setting",
    category: "reception",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="url(#reception-bg)"/>
      <circle cx="50" cy="50" r="28" fill="#fef3c7" stroke="#d97706" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="23" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2 2"/>
      <circle cx="50" cy="50" r="18" fill="#ffffff" stroke="#e5e7eb" stroke-width="1.5"/>
      <rect x="44" y="32" width="12" height="36" rx="2" fill="#f43f5e"/>
      <rect x="42" y="46" width="16" height="8" rx="1" fill="#fef08a"/>
      <circle cx="50" cy="50" r="2.5" fill="#be123c"/>
      <path d="M16 34V46C16 50 19 53 20 54V72H22V54C23 53 26 50 26 46V34H24V44H23V34H21V44H20V34H18V44H17V34H16Z" fill="#b45309"/>
      <path d="M78 34C75 42 75 50 78 54V72H80V34H78Z" fill="#b45309"/>
      <path d="M84 44C87 44 89 40 89 36C89 32 87 32 84 32C81 32 79 32 79 36C79 40 81 44 84 44ZM83 45V72H85V45H83Z" fill="#d97706"/>
      <defs>
        <radialGradient id="reception-bg" cx="50" cy="50" r="48" gradientUnits="userSpaceOnUse">
          <stop stop-color="#fffbeb"/>
          <stop offset="1" stop-color="#fef3c7"/>
        </radialGradient>
      </defs>
    </svg>`
  },
  "reception-champagne": {
    id: "reception-champagne",
    name: "Clinking Champagne Flutes",
    category: "reception",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="url(#champ-bg)"/>
      <g transform="rotate(16 40 50)">
        <path d="M36 24L38 50C38 56 42 58 44 58V76H38V78H50V76H44V58C46 58 50 56 50 50L52 24H36Z" fill="#fde047" stroke="#b45309" stroke-width="1.5"/>
        <path d="M38 34H50V48C50 52 48 54 44 54C40 54 38 52 38 48V34Z" fill="#fbbf24"/>
      </g>
      <g transform="rotate(-16 60 50)">
        <path d="M48 24L50 50C50 56 54 58 56 58V76H50V78H62V76H56V58C58 58 62 56 62 50L64 24H48Z" fill="#fde047" stroke="#b45309" stroke-width="1.5"/>
        <path d="M50 34H62V48C62 52 60 54 56 54C52 54 50 52 50 48V34Z" fill="#fbbf24"/>
      </g>
      <circle cx="50" cy="22" r="2" fill="#f59e0b"/>
      <circle cx="48" cy="16" r="1.5" fill="#f59e0b"/>
      <circle cx="53" cy="18" r="1" fill="#f59e0b"/>
      <path d="M44 64C48 60 52 60 56 64" stroke="#f43f5e" stroke-width="3" stroke-linecap="round"/>
      <defs>
        <radialGradient id="champ-bg" cx="50" cy="50" r="48" gradientUnits="userSpaceOnUse">
          <stop stop-color="#fff7ed"/>
          <stop offset="1" stop-color="#ffedd5"/>
        </radialGradient>
      </defs>
    </svg>`
  },
  "reception-centerpiece": {
    id: "reception-centerpiece",
    name: "Floral Table Centerpiece",
    category: "reception",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#fefce8"/>
      <ellipse cx="50" cy="74" rx="20" ry="4" fill="#ca8a04" opacity="0.3"/>
      <path d="M42 54L38 74H62L58 54Z" fill="#d97706"/>
      <circle cx="50" cy="46" r="14" fill="#f43f5e"/>
      <circle cx="40" cy="48" r="9" fill="#fb7185"/>
      <circle cx="60" cy="48" r="9" fill="#fb7185"/>
      <circle cx="50" cy="36" r="8" fill="#fde047"/>
    </svg>`
  },

  // OTHER & CELEBRATION MOTIFS
  "other-gift": {
    id: "other-gift",
    name: "Luxury Gift Box & Ribbon",
    category: "other",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="url(#gift-bg)"/>
      <ellipse cx="50" cy="78" rx="24" ry="4" fill="#f43f5e" opacity="0.2"/>
      <rect x="28" y="48" width="44" height="28" rx="3" fill="#fecdd3" stroke="#fda4af" stroke-width="1.5"/>
      <rect x="24" y="42" width="52" height="10" rx="2" fill="#fda4af" stroke="#fb7185" stroke-width="1.5"/>
      <rect x="46" y="42" width="8" height="34" fill="#e11d48"/>
      <rect x="24" y="45" width="52" height="4" fill="#be123c"/>
      <path d="M44 42C36 34 34 26 42 26C50 26 48 38 50 42C52 38 50 26 58 26C66 26 64 34 56 42" fill="#e11d48"/>
      <circle cx="50" cy="42" r="3.5" fill="#9f1239"/>
      <defs>
        <radialGradient id="gift-bg" cx="50" cy="50" r="48" gradientUnits="userSpaceOnUse">
          <stop stop-color="#fff1f2"/>
          <stop offset="1" stop-color="#ffe4e6"/>
        </radialGradient>
      </defs>
    </svg>`
  },
  "other-calendar": {
    id: "other-calendar",
    name: "Golden Calendar Ornament",
    category: "other",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#f8fafc"/>
      <rect x="26" y="30" width="48" height="44" rx="6" fill="#ffffff" stroke="#d97706" stroke-width="2"/>
      <path d="M26 36C26 32 30 30 34 30H66C70 30 74 32 74 36V42H26V36Z" fill="#b45309"/>
      <circle cx="36" cy="26" r="3" fill="#d97706"/>
      <circle cx="64" cy="26" r="3" fill="#d97706"/>
      <circle cx="50" cy="56" r="6" fill="#e11d48"/>
    </svg>`
  }
};

export const DEFAULT_CEREMONIES = [
  {
    id: "ceremony-haldi",
    title: "Haldi Ceremony",
    category: "haldi",
    date: "2026-11-18",
    time: "10:00 AM",
    showTime: true,
    description: "A joyful morning of turmeric rituals, holy blessings, and laughter.",
    venueName: "Courtyard Lawn",
    venueAddress: "The Starlight Cathedral, Glass Valley, CA",
    venueUrl: "https://maps.google.com/?q=Starlight+Cathedral",
    clipartId: "haldi-bowl",
    visible: true,
    showClipart: true,
    order: 0
  },
  {
    id: "ceremony-mehendi",
    title: "Mehandi Ceremony",
    category: "mehendi",
    date: "2026-11-18",
    time: "04:00 PM",
    showTime: true,
    description: "Intricate henna adornments, traditional folk tunes, and celebrations.",
    venueName: "Rosewood Pavilion",
    venueAddress: "100 Seraphim Way, Glass Valley, CA",
    venueUrl: "",
    clipartId: "mehendi-cone",
    visible: true,
    showClipart: true,
    order: 1
  },
  {
    id: "ceremony-sangeet",
    title: "Sangeet Night",
    category: "sangeet",
    date: "2026-11-19",
    time: "07:00 PM",
    showTime: true,
    description: "An evening of dance performances, musical beats, and a grand feast.",
    venueName: "Grand Ballroom Lawn",
    venueAddress: "The Gilded Glass Greenhouse, CA",
    venueUrl: "",
    clipartId: "sangeet-dhol",
    visible: true,
    showClipart: true,
    order: 2
  },
  {
    id: "ceremony-wedding",
    title: "Wedding Ceremony",
    category: "wedding",
    date: "2026-11-20",
    time: "04:00 PM",
    showTime: true,
    description: "The sacred phere, wedding vows, and eternal union of two souls.",
    venueName: "Royal Mandap",
    venueAddress: "The Starlight Cathedral Grounds, CA",
    venueUrl: "https://maps.google.com/?q=Starlight+Cathedral",
    clipartId: "wedding-mandap",
    visible: true,
    showClipart: true,
    order: 3
  },
  {
    id: "ceremony-reception",
    title: "Reception",
    category: "reception",
    date: "2026-11-21",
    time: "07:30 PM",
    showTime: true,
    description: "A formal dinner reception to celebrate the newlyweds with family and friends.",
    venueName: "Gilded Glass Conservatory",
    venueAddress: "450 Conservatory Road, Glass Valley, CA",
    venueUrl: "https://maps.google.com/?q=Gilded+Glass+Greenhouse",
    clipartId: "reception-plates",
    visible: true,
    showClipart: true,
    order: 4
  },
  {
    id: "ceremony-extra-reception",
    title: "Additional Reception",
    category: "reception",
    date: "2026-11-22",
    time: "06:30 PM",
    showTime: true,
    description: "An intimate gathering and blessing evening for close family.",
    venueName: "Grand Heritage Hall",
    venueAddress: "Glass Valley Heritage Estate, CA",
    venueUrl: "",
    clipartId: "reception-champagne",
    visible: true,
    showClipart: true,
    order: 5
  },
  {
    id: "ceremony-other",
    title: "Other Event",
    category: "other",
    date: "",
    time: "11:00 AM",
    showTime: true,
    description: "Post-wedding farewell brunch and heartfelt gift blessings.",
    venueName: "Sunlit Terrace Lawn",
    venueAddress: "Glass Valley, CA",
    venueUrl: "",
    clipartId: "other-gift",
    visible: true,
    showClipart: true,
    order: 6
  }
];

export const CEREMONY_TEMPLATES = [
  { title: "Haldi Ceremony", category: "haldi", clipartId: "haldi-bowl", time: "10:00 AM", showTime: true, description: "Joyful turmeric ceremony" },
  { title: "Mehendi Ceremony", category: "mehendi", clipartId: "mehendi-cone", time: "04:00 PM", showTime: true, description: "Intricate henna rituals" },
  { title: "Sangeet Night", category: "sangeet", clipartId: "sangeet-dhol", time: "07:00 PM", showTime: true, description: "Music and dancing celebration" },
  { title: "Wedding Ceremony", category: "wedding", clipartId: "wedding-mandap", time: "04:00 PM", showTime: true, description: "Sacred vows & phere ceremony" },
  { title: "Reception", category: "reception", clipartId: "reception-plates", time: "07:30 PM", showTime: true, description: "Grand dinner celebration" },
  { title: "Additional Reception", category: "reception", clipartId: "reception-champagne", time: "06:30 PM", showTime: true, description: "Blessings & family celebration" },
  { title: "Other Event", category: "other", clipartId: "other-gift", time: "11:00 AM", showTime: true, description: "Post-wedding gathering & gifts" }
];

export const TIMELINE_COLOR_PRESETS = [
  {
    id: "burgundy-gold",
    name: "Burgundy & Gold (Default Reference)",
    heading: "#781428",
    subtitle: "#c28b2a",
    title: "#781428",
    text: "#44342d",
    date: "#755d52",
    venue: "#755d52",
    line: "#cda452",
    node: "#781428",
    cardBg: "#fffcf9",
    cardBorder: "rgba(205, 164, 82, 0.45)",
    clipartBorder: "#cda452"
  },
  {
    id: "ivory-champagne",
    name: "Ivory & Champagne",
    heading: "#543d2b",
    subtitle: "#a4793b",
    title: "#543d2b",
    text: "#4a3c31",
    date: "#7c685b",
    venue: "#7c685b",
    line: "#d4af37",
    node: "#a4793b",
    cardBg: "#fdfbf7",
    cardBorder: "rgba(212, 175, 55, 0.4)",
    clipartBorder: "#d4af37"
  },
  {
    id: "blush-elegance",
    name: "Blush Elegance",
    heading: "#9d174d",
    subtitle: "#db2777",
    title: "#9d174d",
    text: "#4c0519",
    date: "#831843",
    venue: "#831843",
    line: "#f472b6",
    node: "#be185d",
    cardBg: "#fff1f2",
    cardBorder: "rgba(244, 114, 182, 0.4)",
    clipartBorder: "#f472b6"
  },
  {
    id: "sage-gold",
    name: "Sage & Gold",
    heading: "#166534",
    subtitle: "#ca8a04",
    title: "#166534",
    text: "#14532d",
    date: "#15803d",
    venue: "#15803d",
    line: "#eab308",
    node: "#166534",
    cardBg: "#f0fdf4",
    cardBorder: "rgba(234, 179, 8, 0.4)",
    clipartBorder: "#ca8a04"
  },
  {
    id: "classic-neutral",
    name: "Classic Neutral",
    heading: "#1e293b",
    subtitle: "#64748b",
    title: "#1e293b",
    text: "#334155",
    date: "#64748b",
    venue: "#64748b",
    line: "#94a3b8",
    node: "#475569",
    cardBg: "#f8fafc",
    cardBorder: "rgba(148, 163, 184, 0.35)",
    clipartBorder: "#94a3b8"
  }
];

export const DEFAULT_TIMELINE_CONFIG = {
  showTimelineSection: true,
  timelineHeading: "Wedding Ceremony",
  timelineSubtitle: "Timeline",
  showTimelineHeading: true,
  showTimelineSubtitle: true,
  showTimelineLine: true,
  showTimelineCards: true,
  showTimelineDescriptions: true,
  showTimelineDateTime: true,
  showTimelineTime: true,
  showTimelineVenue: true,
  showTimelineAllCliparts: true,
  showTimelineOrnaments: true,
  timelineSortMode: "chronological", // "chronological" | "manual"
  timelineLayout: "alternating", // "alternating" | "left" | "right"
  timelineDensity: "spacious", // "spacious" | "compact"
  timelineCardShape: "pill", // "pill" | "rounded" | "bordered" | "minimal"
  timelineHeadingFont: "font-serif",
  timelineSubtitleFont: "font-cursive",
  timelineTitleFont: "font-serif",
  timelineHeadingColor: "#781428", // Classic burgundy as in reference image
  timelineSubtitleColor: "#c28b2a", // Gold script
  timelineTitleColor: "#781428", // Burgundy
  timelineTextColor: "#44342d", // Warm dark text
  timelineDateColor: "#755d52", // Muted warm
  timelineVenueColor: "#755d52",
  timelineLineColor: "#cda452", // Champagne gold
  timelineNodeColor: "#781428", // Burgundy dot with gold ring
  timelineCardBg: "#fffcf9", // Warm soft ivory
  timelineCardBorder: "rgba(205, 164, 82, 0.45)", // Gold border
  timelineClipartBorder: "#cda452",
  timelineCardCornerRadius: 28, // pill style
  timelineCardPadding: 16,
  timelineCardShadow: "0 8px 24px -6px rgba(120, 20, 40, 0.08), 0 2px 6px -1px rgba(205, 164, 82, 0.15)",
  timelineNodeSize: 14,
  timelineClipartSize: 46,
  timelineTitleSize: "large", // "medium" | "large" | "extra-large"
  showCeremonyCardBorder: false, // No border line around icon & ceremony names
  showIconBorder: false, // No border on icon medallion
  showDetailsCardBorder: true, // Border line on details side only
  timelineMobileLayout: "alternating", // "alternating" | "stacked-card" | "compact-split"
  ceremonies: DEFAULT_CEREMONIES
};

// Formats a date string like "2026-11-20" into weekday and formatted date
export function formatCeremonyDate(dateStr) {
  if (!dateStr) return { dayOfWeek: "", formattedDate: "" };
  try {
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' });
        const formattedDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        return { dayOfWeek, formattedDate };
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      return { dayOfWeek, formattedDate };
    }
    return { dayOfWeek: "", formattedDate: dateStr };
  } catch (e) {
    return { dayOfWeek: "", formattedDate: dateStr };
  }
}
