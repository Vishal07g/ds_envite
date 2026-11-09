import fs from 'fs';

// =========================================================================
// 1. UPDATE InvitationEditor.jsx
// =========================================================================
{
  const filePath = 'Frontend/src/pages/InvitationEditor.jsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // Prevent merging DEFAULT_CONFIG onto non-wedding categories
  const oldLoadBlock = `        setInvitation(inv);
        const invConfig = inv.config || {};
        const cleanedConfig = { 
          ...DEFAULT_CONFIG, 
          ...invConfig,
          brideName: invConfig.brideName || invConfig.coverBrideText || "",
          groomName: invConfig.groomName || invConfig.coverGroomText || "",
          coverBrideText: invConfig.coverBrideText || invConfig.brideName || "",
          coverGroomText: invConfig.coverGroomText || invConfig.groomName || "",
        };`;

  const newLoadBlock = `        setInvitation(inv);
        const invConfig = inv.config || {};
        const cat = invConfig.category;
        const baseDefaults = (cat && cat !== "wedding") ? getCategoryDefaultConfig(cat, invConfig) : DEFAULT_CONFIG;
        const cleanedConfig = { 
          ...baseDefaults, 
          ...invConfig,
          brideName: invConfig.brideName || invConfig.coverBrideText || "",
          groomName: invConfig.groomName || invConfig.coverGroomText || "",
          coverBrideText: invConfig.coverBrideText || invConfig.brideName || "",
          coverGroomText: invConfig.coverGroomText || invConfig.groomName || "",
        };`;

  content = content.replace(oldLoadBlock.replace(/\r?\n/g, '\r\n'), newLoadBlock.replace(/\r?\n/g, '\r\n'));
  if (!content.includes('const baseDefaults = (cat && cat !== "wedding")')) {
    content = content.replace(oldLoadBlock.replace(/\r?\n/g, '\n'), newLoadBlock.replace(/\r?\n/g, '\n'));
  }

  // Handle title & envelope names on name changes
  content = content.replace(
    `next.envelopeNamesText = \`\${val}\${groom ? \` & \${groom}\` : ''}\`;`,
    `const isWed = !prev.category || prev.category === 'wedding';
        next.envelopeNamesText = isWed ? \`\${val}\${groom ? \` & \${groom}\` : ''}\` : val;`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ InvitationEditor.jsx updated successfully.');
}

// =========================================================================
// 2. UPDATE WeddingTimeline.jsx
// =========================================================================
{
  const filePath = 'Frontend/src/components/WeddingTimeline.jsx';
  let content = fs.readFileSync(filePath, 'utf8');

  const oldTimelineConfig = `  // Merge timeline configuration with defaults
  const timelineConfig = useMemo(() => {
    return {
      ...DEFAULT_TIMELINE_CONFIG,
      ...config
    };
  }, [config]);`;

  const newTimelineConfig = `  // Merge timeline configuration with category defaults
  const timelineConfig = useMemo(() => {
    const isNonWedding = config.category && config.category !== 'wedding';
    const catCeremonies = isNonWedding && CATEGORY_DEFAULT_TIMELINES[config.category] 
      ? CATEGORY_DEFAULT_TIMELINES[config.category] 
      : DEFAULT_CEREMONIES;
    const catHeading = isNonWedding
      ? (config.category === "birthday" ? "Party Schedule"
        : config.category === "first_birthday" ? "Celebration Schedule"
        : config.category === "baby_shower" ? "Shower Schedule"
        : config.category === "naming_ceremony" ? "Ceremony Schedule"
        : config.category === "housewarming" ? "Puja & Celebration Schedule"
        : config.category === "anniversary" ? "Anniversary Program"
        : config.category === "religious_ceremony" ? "Ceremony & Puja Timings"
        : config.category === "corporate_event" ? "Event Agenda"
        : "Celebration Schedule")
      : "Wedding Ceremony";
    const catSubtitle = isNonWedding
      ? (config.category === "birthday" ? "Order of Events"
        : config.category === "religious_ceremony" ? "Divine Schedule"
        : config.category === "corporate_event" ? "Summit Timeline"
        : "Schedule")
      : "Timeline";

    const hasLeakedWeddingCeremonies = isNonWedding && Array.isArray(config.ceremonies) && 
      config.ceremonies.some(c => c.id === 'ceremony-haldi' || c.id === 'ceremony-mehendi');

    return {
      ...DEFAULT_TIMELINE_CONFIG,
      ...(isNonWedding ? {
        timelineHeading: catHeading,
        timelineSubtitle: catSubtitle,
        ceremonies: catCeremonies
      } : {}),
      ...config,
      ...(hasLeakedWeddingCeremonies ? { ceremonies: catCeremonies } : {})
    };
  }, [config]);`;

  content = content.replace(oldTimelineConfig.replace(/\r?\n/g, '\r\n'), newTimelineConfig.replace(/\r?\n/g, '\r\n'));
  if (!content.includes('const isNonWedding = config.category')) {
    content = content.replace(oldTimelineConfig.replace(/\r?\n/g, '\n'), newTimelineConfig.replace(/\r?\n/g, '\n'));
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ WeddingTimeline.jsx updated successfully.');
}

// =========================================================================
// 3. UPDATE TimelineEditorDrawer.jsx
// =========================================================================
{
  const filePath = 'Frontend/src/components/TimelineEditorDrawer.jsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // Add CATEGORY_EVENT_TEMPLATES
  if (!content.includes('CATEGORY_EVENT_TEMPLATES')) {
    const importReplacement = `import { 
  DEFAULT_CEREMONIES, 
  CEREMONY_TEMPLATES, 
  TIMELINE_COLOR_PRESETS, 
  DEFAULT_TIMELINE_CONFIG,
  formatCeremonyDate,
  TIMELINE_CLIPARTS
} from '../data/timelineDefaults';

export const CATEGORY_EVENT_TEMPLATES = {
  birthday: [
    { title: "Guests Arrival & Welcome", category: "arrival", clipartId: "other-gift", time: "07:00 PM", showTime: true, description: "Welcome drinks & refreshments" },
    { title: "Cake Cutting Ceremony", category: "cake", clipartId: "other-gift", time: "08:00 PM", showTime: true, description: "Gather around for birthday wishes, cake cutting & toasts" },
    { title: "Grand Dinner Buffet", category: "dinner", clipartId: "other-gift", time: "08:45 PM", showTime: true, description: "Multi-cuisine dinner banquet" },
    { title: "Live DJ & Dance Floor", category: "party", clipartId: "sangeet-dhol", time: "09:30 PM", showTime: true, description: "Turn up the music and hit the dance floor!" },
    { title: "Party Games & Activities", category: "games", clipartId: "other-gift", time: "07:30 PM", showTime: true, description: "Fun party games & photo booth" },
    { title: "Farewell & Return Gifts", category: "gifts", clipartId: "other-gift", time: "10:30 PM", showTime: true, description: "Warm goodbyes and token of gratitude" }
  ],
  first_birthday: [
    { title: "Little Guests Welcome", category: "arrival", clipartId: "other-gift", time: "04:30 PM", showTime: true, description: "Soft play area and fun welcome" },
    { title: "Cake Smash & Wishes", category: "cake", clipartId: "other-gift", time: "05:30 PM", showTime: true, description: "First birthday cake smash and cheer" },
    { title: "Magic Show & Games", category: "entertainment", clipartId: "other-gift", time: "06:15 PM", showTime: true, description: "Interactive entertainment for toddlers" },
    { title: "Celebration Feast & High Tea", category: "dinner", clipartId: "other-gift", time: "07:00 PM", showTime: true, description: "Delicious food & treats for everyone" }
  ],
  baby_shower: [
    { title: "Warm Welcome & High Tea", category: "arrival", clipartId: "other-gift", time: "03:00 PM", showTime: true, description: "Tea, mocktails, and sweet treats" },
    { title: "Baby Shower Games", category: "games", clipartId: "other-gift", time: "04:00 PM", showTime: true, description: "Fun guessing games and laughs" },
    { title: "Blessings & Godh Bharai", category: "ritual", clipartId: "other-gift", time: "05:00 PM", showTime: true, description: "Traditional blessings for mom and baby" },
    { title: "Celebratory Dinner & Gifts", category: "dinner", clipartId: "other-gift", time: "06:30 PM", showTime: true, description: "Feast and heartfelt thank you notes" }
  ],
  naming_ceremony: [
    { title: "Sankalpam & Puja Inception", category: "puja", clipartId: "other-gift", time: "10:00 AM", showTime: true, description: "Auspicious invocation by Vedic pandits" },
    { title: "Holy Hawan & Chanting", category: "hawan", clipartId: "other-gift", time: "11:00 AM", showTime: true, description: "Sacred fire offering for good health & prosperity" },
    { title: "Whispering Name (Namkaran)", category: "ritual", clipartId: "other-gift", time: "11:45 AM", showTime: true, description: "Whispering auspicious name in baby's ear" },
    { title: "Maha Aarti & Mahaprasad", category: "prasad", clipartId: "other-gift", time: "12:30 PM", showTime: true, description: "Divine aarti followed by traditional feast" }
  ],
  housewarming: [
    { title: "Dwar Puja (Threshold)", category: "puja", clipartId: "other-gift", time: "09:30 AM", showTime: true, description: "Auspicious threshold entrance worship" },
    { title: "Vastu Shanti & Hawan", category: "hawan", clipartId: "other-gift", time: "10:30 AM", showTime: true, description: "Sacred fire rituals to bless every corner" },
    { title: "Boiling Milk Ritual", category: "ritual", clipartId: "other-gift", time: "11:30 AM", showTime: true, description: "Traditional symbol of overflow of prosperity" },
    { title: "Celebration Lunch & Home Tour", category: "feast", clipartId: "other-gift", time: "12:30 PM", showTime: true, description: "Warm house tour and delicious lunch" }
  ],
  anniversary: [
    { title: "Welcome Drinks & Toasts", category: "arrival", clipartId: "other-gift", time: "07:00 PM", showTime: true, description: "Sparkling toast to years of love" },
    { title: "Journey Down Memory Lane", category: "slideshow", clipartId: "other-gift", time: "07:45 PM", showTime: true, description: "Heartfelt retrospective and anniversary cake" },
    { title: "Vow Renewal & Dances", category: "dance", clipartId: "other-gift", time: "08:30 PM", showTime: true, description: "First dance and celebratory music" },
    { title: "Gala Banquet Dinner", category: "dinner", clipartId: "other-gift", time: "09:15 PM", showTime: true, description: "Special anniversary feast and celebration" }
  ],
  religious_ceremony: [
    { title: "Ganesh Puja & Sankalp", category: "puja", clipartId: "other-gift", time: "09:30 AM", showTime: true, description: "Invocation of Lord Ganesha for auspicious beginnings" },
    { title: "Sacred Katha Recitation", category: "katha", clipartId: "other-gift", time: "10:30 AM", showTime: true, description: "Holy scripture reading and divine singing" },
    { title: "Maha Hawan & Purnahuti", category: "hawan", clipartId: "other-gift", time: "11:45 AM", showTime: true, description: "Sacred fire offerings with Vedic mantras" },
    { title: "Grand Aarti & Mahaprasad", category: "prasad", clipartId: "other-gift", time: "12:30 PM", showTime: true, description: "Sacred aarti and distribution of holy prasad" }
  ],
  corporate_event: [
    { title: "Registration & Breakfast", category: "arrival", clipartId: "other-gift", time: "09:00 AM", showTime: true, description: "Delegate badge collection and welcome coffee" },
    { title: "Keynote Opening Address", category: "keynote", clipartId: "other-gift", time: "10:00 AM", showTime: true, description: "Welcome address and industry vision speech" },
    { title: "Panel Discussions & Q&A", category: "panel", clipartId: "other-gift", time: "11:30 AM", showTime: true, description: "Thought leadership presentations and debates" },
    { title: "Networking Luncheon", category: "lunch", clipartId: "other-gift", time: "01:00 PM", showTime: true, description: "Executive networking over gourmet buffet" },
    { title: "Innovation Showcase", category: "showcase", clipartId: "other-gift", time: "02:30 PM", showTime: true, description: "Product unveiling and technological demos" },
    { title: "Cocktails & Dinner Reception", category: "reception", clipartId: "other-gift", time: "06:30 PM", showTime: true, description: "Evening celebration and executive mingling" }
  ]
};`;

    content = content.replace(
      `import { \n  DEFAULT_CEREMONIES, \n  CEREMONY_TEMPLATES, \n  TIMELINE_COLOR_PRESETS, \n  DEFAULT_TIMELINE_CONFIG,\n  formatCeremonyDate,\n  TIMELINE_CLIPARTS\n} from '../data/timelineDefaults';`,
      importReplacement
    );
    if (!content.includes('CATEGORY_EVENT_TEMPLATES')) {
      content = content.replace(
        `import { \r\n  DEFAULT_CEREMONIES, \r\n  CEREMONY_TEMPLATES, \r\n  TIMELINE_COLOR_PRESETS, \r\n  DEFAULT_TIMELINE_CONFIG,\r\n  formatCeremonyDate,\r\n  TIMELINE_CLIPARTS\r\n} from '../data/timelineDefaults';`,
        importReplacement
      );
    }
  }

  // Update CEREMONY_TEMPLATES mapping to use category templates
  content = content.replace(
    `{CEREMONY_TEMPLATES.map(tpl => (`,
    `{((config.category && CATEGORY_EVENT_TEMPLATES[config.category]) ? CATEGORY_EVENT_TEMPLATES[config.category] : CEREMONY_TEMPLATES).map(tpl => (`
  );

  content = content.replace(
    `+ Add Ceremony From Template`,
    `+ Add Event From Template`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ TimelineEditorDrawer.jsx updated successfully.');
}

// =========================================================================
// 4. UPDATE AdminSidebar.jsx
// =========================================================================
{
  const filePath = 'Frontend/src/components/AdminSidebar.jsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // Tab Venue Titles
  content = content.replace(
    `<h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Event Timings &amp; Venues</h3>`,
    `<h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {isWedding ? "Event Timings & Venues"
                : category === "birthday" ? "Party Timings & Venue"
                : category === "first_birthday" ? "Celebration Timings & Venue"
                : category === "baby_shower" ? "Shower Timings & Venue"
                : category === "naming_ceremony" ? "Namkaran Timings & Venue"
                : category === "housewarming" ? "Griha Pravesh Timings & Venue"
                : category === "anniversary" ? "Anniversary Timings & Venue"
                : category === "religious_ceremony" ? "Puja Timings & Venue"
                : category === "corporate_event" ? "Summit Timings & Venue"
                : "Event Timings & Venue"}
            </h3>`
  );

  // Wedding Date & Time label
  content = content.replace(
    `<label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Wedding Date &amp; Time</label>`,
    `<label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                {isWedding ? "Wedding Date & Time"
                  : category === "birthday" ? "Party Date & Time"
                  : category === "first_birthday" ? "Celebration Date & Time"
                  : category === "baby_shower" ? "Shower Date & Time"
                  : category === "naming_ceremony" ? "Ceremony Date & Time"
                  : category === "housewarming" ? "Puja Date & Time"
                  : category === "anniversary" ? "Anniversary Date & Time"
                  : category === "religious_ceremony" ? "Puja Date & Time"
                  : category === "corporate_event" ? "Summit Date & Time"
                  : "Event Date & Time"}
              </label>`
  );

  // Ceremony Card title
  content = content.replace(
    `title: "Ceremony Card Details",`,
    `title: isWedding ? "Ceremony Card Details"
                : category === "birthday" ? "Party Venue Details"
                : category === "first_birthday" ? "Celebration Venue Details"
                : category === "baby_shower" ? "Shower Venue Details"
                : category === "naming_ceremony" ? "Ceremony Venue Details"
                : category === "housewarming" ? "Residence Details"
                : category === "anniversary" ? "Celebration Venue Details"
                : category === "religious_ceremony" ? "Sacred Venue Details"
                : category === "corporate_event" ? "Conference Venue Details"
                : "Primary Venue Details",`
  );

  // Reception Card title
  content = content.replace(
    `title: "Reception Card Details",`,
    `title: isWedding ? "Reception Card Details"
                : category === "birthday" ? "After-Party Venue (Optional)"
                : category === "first_birthday" ? "Secondary Venue (Optional)"
                : category === "baby_shower" ? "High Tea / Reception Venue (Optional)"
                : category === "naming_ceremony" ? "Mahaprasad & Feast Venue (Optional)"
                : category === "housewarming" ? "Celebration Dinner Venue (Optional)"
                : category === "anniversary" ? "Dinner & Banquet Venue (Optional)"
                : category === "religious_ceremony" ? "Mahaprasad Venue (Optional)"
                : category === "corporate_event" ? "Networking Dinner Venue (Optional)"
                : "Secondary Venue Details",`
  );

  // Gallery Tab Title
  content = content.replace(
    `<h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Our Photo Gallery</h3>`,
    `<h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {isWedding ? "Our Photo Gallery"
                : category === "birthday" ? "Birthday Photo Gallery"
                : category === "first_birthday" ? "Little Star Photo Gallery"
                : category === "baby_shower" ? "Baby Shower Photo Gallery"
                : category === "naming_ceremony" ? "Namkaran Photo Gallery"
                : category === "housewarming" ? "Home Tour Photo Gallery"
                : category === "anniversary" ? "Anniversary Photo Gallery"
                : category === "religious_ceremony" ? "Devotional Photo Gallery"
                : category === "corporate_event" ? "Event Media & Photos"
                : "Photo Gallery"}
            </h3>`
  );

  // RSVP Tab Title
  content = content.replace(
    `<h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">RSVP &amp; Blessings Style</h3>`,
    `<h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {isWedding ? "RSVP & Blessings Style"
                : category === "birthday" ? "RSVP & Birthday Wishes Style"
                : category === "corporate_event" ? "RSVP & Guest Remarks Style"
                : "RSVP & Wishes Style"}
            </h3>`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ AdminSidebar.jsx updated successfully.');
}

// =========================================================================
// 5. UPDATE store.js (Deep Heal on getInvitations)
// =========================================================================
{
  const filePath = 'Frontend/src/data/store.js';
  let content = fs.readFileSync(filePath, 'utf8');

  const oldVenueHealTarget = `          const honoree = inv.config.heroName || inv.title?.split(" - ")[0] || "Special Guest";`;

  const newVenueHealCode = `          // Auto-heal Venue for non-wedding invitations so wedding venues never leak
          if (
            inv.config.weddingVenue === "The Starlight Cathedral" ||
            inv.config.weddingAddress === "100 Seraphim Way, Glass Valley, CA" ||
            inv.config.receptionVenue === "The Gilded Glass Greenhouse" ||
            inv.config.receptionAddress === "450 Conservatory Road, Glass Valley, CA" ||
            inv.config.venueTitle === "Sacred Venue & Reception" ||
            !inv.config.weddingVenue
          ) {
            inv.config.weddingVenue = catDefaults.weddingVenue;
            inv.config.weddingAddress = catDefaults.weddingAddress;
            inv.config.venueCeremonyName = catDefaults.weddingVenue;
            inv.config.venueCeremonyAddress = catDefaults.weddingAddress;
            inv.config.showReceptionVenue = false;
            inv.config.receptionVenue = "";
            inv.config.receptionAddress = "";
            inv.config.venueTitle = catDefaults.venueTitle;
            inv.config.venueSubtitle = catDefaults.venueSubtitle;
            hasChanges = true;
          }

          // Auto-heal Gallery & Wishes titles
          if (!inv.config.gallerySubtitle || inv.config.gallerySubtitle === "Our Love in Frames") {
            inv.config.gallerySubtitle = catDefaults.gallerySubtitle;
            hasChanges = true;
          }
          if (!inv.config.galleryTitle || inv.config.galleryTitle === "Our Gallery") {
            inv.config.galleryTitle = catDefaults.galleryTitle;
            hasChanges = true;
          }
          if (!inv.config.wishesTitle) {
            inv.config.wishesTitle = catDefaults.wishesTitle;
            inv.config.wishesSubtitle = catDefaults.wishesSubtitle;
            hasChanges = true;
          }

          // Auto-heal Ceremonies if still showing wedding rituals
          if (Array.isArray(inv.config.ceremonies) && inv.config.ceremonies.some(c => c.id === 'ceremony-haldi' || c.id === 'ceremony-mehendi')) {
            inv.config.ceremonies = catDefaults.ceremonies;
            inv.config.timelineHeading = catDefaults.timelineHeading;
            inv.config.timelineSubtitle = catDefaults.timelineSubtitle;
            hasChanges = true;
          }

          const honoree = inv.config.heroName || inv.title?.split(" - ")[0] || "Special Guest";`;

  content = content.replace(oldVenueHealTarget.replace(/\r?\n/g, '\r\n'), newVenueHealCode.replace(/\r?\n/g, '\r\n'));
  if (!content.includes('// Auto-heal Venue for non-wedding invitations')) {
    content = content.replace(oldVenueHealTarget.replace(/\r?\n/g, '\n'), newVenueHealCode.replace(/\r?\n/g, '\n'));
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ store.js updated successfully.');
}

