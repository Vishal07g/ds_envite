import fs from 'fs';

const filePath = 'Frontend/src/components/InvitationRenderer.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Canvas Scratch Subtitle
content = content.replace(
  `const defaultSubtitle = isVideo ? 'Wipe gold shield to reveal romantic video & date' : 'Wipe gold shield to reveal wedding date & countdown';`,
  `const defaultSubtitle = isVideo 
          ? 'Wipe gold shield to reveal romantic video & date' 
          : (!config.category || config.category === 'wedding'
            ? 'Wipe gold shield to reveal wedding date & countdown'
            : config.category === 'birthday'
            ? 'Wipe gold card to reveal birthday party details & countdown'
            : config.category === 'first_birthday'
            ? 'Wipe gold sparkles to reveal cake smash & party details'
            : config.category === 'baby_shower'
            ? 'Wipe gold shield to reveal baby shower details & countdown'
            : config.category === 'naming_ceremony'
            ? 'Wipe gold shield to reveal sacred muhurat & countdown'
            : config.category === 'housewarming'
            ? 'Wipe gold shield to reveal new home address & countdown'
            : config.category === 'anniversary'
            ? 'Wipe gold shield to reveal anniversary gala & countdown'
            : config.category === 'religious_ceremony'
            ? 'Wipe gold shield to reveal sacred puja timings & countdown'
            : 'Wipe metallic shield to reveal summit agenda & countdown');`
);

// 2. Scratch Description text
content = content.replace(
  `{config.scratchDescription || config.scratchDesc || "We've kept the date a romantic surprise. Use your mouse or touchscreen to wipe off the gold metallic shield to discover the ceremony timings and live countdown!"}`,
  `{config.scratchDescription || config.scratchDesc || (
                  !config.category || config.category === 'wedding'
                    ? "We've kept the date a romantic surprise. Use your mouse or touchscreen to wipe off the gold metallic shield to discover the ceremony timings and live countdown!"
                    : config.category === 'birthday'
                    ? "We've kept the party details a surprise! Use your finger or mouse to wipe off the gold card to reveal the secret birthday party timings and live countdown!"
                    : config.category === 'first_birthday'
                    ? "Use your finger or mouse to wipe off the gold sparkles to reveal the celebration timings, cake smash and live countdown!"
                    : config.category === 'baby_shower'
                    ? "Wipe off the golden card to reveal the baby shower schedule, surprises and live countdown!"
                    : config.category === 'naming_ceremony'
                    ? "Wipe off the auspicious golden shield to discover the sacred Namkaran timings and live countdown!"
                    : config.category === 'housewarming'
                    ? "Wipe off the golden shield to discover our new home address, Griha Pravesh timings and live countdown!"
                    : config.category === 'anniversary'
                    ? "Wipe off the metallic shield to reveal the anniversary celebration timings, dinner schedule and live countdown!"
                    : config.category === 'religious_ceremony'
                    ? "Wipe off the sacred shield to discover the holy puja timings, maha aarti and live countdown!"
                    : "Wipe off the metallic shield to unveil keynote speakers, summit agenda and conference countdown!"
                )}`
);

// 3. Story Subtitle & Title
content = content.replace(
  `value={config.storySubtitle || "Meet the families"}`,
  `value={config.storySubtitle || (
                        config.category && config.category !== 'wedding'
                          ? (config.category === 'birthday' ? 'THE BIRTHDAY STAR'
                            : config.category === 'first_birthday' ? 'OUR LITTLE BLESSING'
                            : config.category === 'baby_shower' ? 'WELCOMING BABY'
                            : config.category === 'naming_ceremony' ? 'SACRED BLESSINGS'
                            : config.category === 'housewarming' ? 'OUR NEW BEGINNING'
                            : config.category === 'anniversary' ? 'A DECADE OF LOVE'
                            : config.category === 'religious_ceremony' ? 'DIVINE DEVOTION'
                            : 'EVENT OVERVIEW')
                          : "Meet the families"
                      )}`
);

content = content.replace(
  `value={config.storyTitle || "Vows of Two Dynasties"}`,
  `value={config.storyTitle || (
                        config.category && config.category !== 'wedding'
                          ? (config.category === 'birthday' ? \`Celebrating \${config.heroName || config.coverBrideText || 'Our Birthday Star'}\`
                            : config.category === 'first_birthday' ? \`One Whole Year of \${config.heroName || config.coverBrideText || 'Joy'}\`
                            : config.category === 'baby_shower' ? 'Showering with Love'
                            : config.category === 'naming_ceremony' ? 'Namkaran Sanskar'
                            : config.category === 'housewarming' ? \`Welcome to \${config.houseName || 'Our New Home'}\`
                            : config.category === 'anniversary' ? 'Our Beautiful Journey'
                            : config.category === 'religious_ceremony' ? (config.ceremonyName || 'Sacred Puja')
                            : 'About This Event')
                          : "Vows of Two Dynasties"
                      )}`
);

// 4. Venue Header
const oldVenueHeader = `<span className="text-[10px] uppercase tracking-[0.25em] font-bold block mb-2" style={customStyles.colorAccent}>
                    Ceremony Venue Directions
                  </span>
                  <h2 className={\`font-light \${config.venueTitleFont || 'font-serif'} \${config.venueTitleSize || 'text-2xl sm:text-3xl'} \${config.venueTitleAlign || 'text-center'}\`}>
                    Sacred Venue &amp; Reception
                  </h2>`;

const newVenueHeader = `<span className="text-[10px] uppercase tracking-[0.25em] font-bold block mb-2" style={customStyles.colorAccent}>
                    {config.venueSubtitle || (
                      !config.category || config.category === 'wedding' ? "Ceremony Venue Directions"
                      : config.category === "birthday" ? "Celebration Location & Directions"
                      : config.category === "first_birthday" ? "Party Location & Directions"
                      : config.category === "baby_shower" ? "Shower Location & Directions"
                      : config.category === "naming_ceremony" ? "Auspicious Ceremony Directions"
                      : config.category === "housewarming" ? "New Home Location & Directions"
                      : config.category === "anniversary" ? "Celebration Venue Directions"
                      : config.category === "religious_ceremony" ? "Sacred Venue Directions"
                      : config.category === "corporate_event" ? "Summit Venue & Location"
                      : "Venue Directions"
                    )}
                  </span>
                  <h2 className={\`font-light \${config.venueTitleFont || 'font-serif'} \${config.venueTitleSize || 'text-2xl sm:text-3xl'} \${config.venueTitleAlign || 'text-center'}\`}>
                    {config.venueTitle || (
                      !config.category || config.category === 'wedding' ? "Sacred Venue & Reception"
                      : config.category === "birthday" ? "Party Venue & Celebration"
                      : config.category === "first_birthday" ? "Celebration Venue"
                      : config.category === "baby_shower" ? "Celebration Venue"
                      : config.category === "naming_ceremony" ? "Namkaran Ceremony Venue"
                      : config.category === "housewarming" ? "Our New Residence"
                      : config.category === "anniversary" ? "Anniversary Celebration Venue"
                      : config.category === "religious_ceremony" ? "Pooja & Prasad Venue"
                      : config.category === "corporate_event" ? "Conference & Event Venue"
                      : "Event Venue"
                    )}
                  </h2>`;

content = content.replace(oldVenueHeader.replace(/\r?\n/g, '\r\n'), newVenueHeader.replace(/\r?\n/g, '\r\n'));
if (!content.includes(newVenueHeader.replace(/\r?\n/g, '\r\n'))) {
  content = content.replace(oldVenueHeader.replace(/\r?\n/g, '\n'), newVenueHeader.replace(/\r?\n/g, '\n'));
}

// 5. Venue Grid Container
content = content.replace(
  `<div className="grid grid-cols-1 md:grid-cols-2 gap-8">`,
  `<div className={config.showReceptionVenue !== false ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "max-w-2xl mx-auto"}>`
);

// 6. Card 1 Tag
content = content.replace(
  `<p className="text-[9px] uppercase tracking-wider font-bold opacity-90">Holy Ceremony</p>`,
  `<p className="text-[9px] uppercase tracking-wider font-bold opacity-90">
                            {(!config.category || config.category === 'wedding') ? "Holy Ceremony"
                              : config.category === "birthday" ? "Party Venue"
                              : config.category === "first_birthday" ? "Celebration Venue"
                              : config.category === "baby_shower" ? "Shower Venue"
                              : config.category === "naming_ceremony" ? "Ceremony Venue"
                              : config.category === "housewarming" ? "New Residence"
                              : config.category === "anniversary" ? "Celebration Venue"
                              : config.category === "religious_ceremony" ? "Sacred Venue"
                              : config.category === "corporate_event" ? "Conference Venue"
                              : "Event Venue"}
                          </p>`
);

// 7. Card 2 Tag
content = content.replace(
  `<p className="text-[9px] uppercase tracking-wider font-bold opacity-90">Grand Reception</p>`,
  `<p className="text-[9px] uppercase tracking-wider font-bold opacity-90">
                            {(!config.category || config.category === 'wedding') ? "Grand Reception"
                              : config.category === "birthday" ? "After-Party Venue"
                              : config.category === "first_birthday" ? "Secondary Venue"
                              : config.category === "baby_shower" ? "High Tea / Reception Venue"
                              : config.category === "naming_ceremony" ? "Mahaprasad & Feast Venue"
                              : config.category === "housewarming" ? "Celebration Dinner Venue"
                              : config.category === "anniversary" ? "Anniversary Dinner & Banquet"
                              : config.category === "religious_ceremony" ? "Mahaprasad Venue"
                              : config.category === "corporate_event" ? "Networking Dinner Venue"
                              : "Reception Venue"}
                          </p>`
);

// 8. Card 1 Fallbacks for weddingVenue & weddingAddress
content = content.replace(
  `value={config.weddingVenue}`,
  `value={config.weddingVenue || config.venueCeremonyName || (
                              config.category === "birthday" ? "The Grand Celebration Hall"
                              : config.category === "first_birthday" ? "Little Stars Celebration Hall"
                              : config.category === "baby_shower" ? "Blossom Garden Pavilion"
                              : config.category === "naming_ceremony" ? "Shree Celebration Hall"
                              : config.category === "housewarming" ? (config.houseName || "Our New Residence")
                              : config.category === "anniversary" ? "The Royal Ballroom"
                              : config.category === "religious_ceremony" ? "Our Residence"
                              : config.category === "corporate_event" ? "Grand Convention Centre"
                              : (!config.category || config.category === 'wedding' ? "The Starlight Cathedral" : "Celebration Venue")
                            )}`
);

content = content.replace(
  `value={config.weddingAddress}`,
  `value={config.weddingAddress || config.venueCeremonyAddress || (
                              config.category === "birthday" ? "45 Jubilee Hills, Road No. 10, Hyderabad"
                              : config.category === "first_birthday" ? "12 Blossom Park, Indiranagar, Bangalore"
                              : config.category === "baby_shower" ? "78 Green Valley Boulevard, Koregaon Park, Pune"
                              : config.category === "naming_ceremony" ? "56 Temple View Road, Navrangpura, Ahmedabad"
                              : config.category === "housewarming" ? "123 Celebration Avenue, Phase 2, Palm Meadows, Gurugram"
                              : config.category === "anniversary" ? "Marine Drive Promenade, Nariman Point, Mumbai"
                              : config.category === "religious_ceremony" ? "14 Shanti Kunj, Civil Lines, Jaipur"
                              : config.category === "corporate_event" ? "Financial District, HITEC City, Hyderabad"
                              : (!config.category || config.category === 'wedding' ? "100 Seraphim Way, Glass Valley, CA" : "Event Address")
                            )}`
);

// 9. Gallery Subtitle & Title
content = content.replace(
  `value={config.gallerySubtitle || "Our Love in Frames"}`,
  `value={config.gallerySubtitle || (
                          config.category && config.category !== 'wedding'
                            ? (config.category === 'birthday' ? 'Milestone Moments & Smiles'
                              : config.category === 'first_birthday' ? 'One Year of Smiles & Baby Steps'
                              : config.category === 'baby_shower' ? 'Cherishing Every Step of Motherhood'
                              : config.category === 'naming_ceremony' ? 'Sacred Blessings & Family Joy'
                              : config.category === 'housewarming' ? 'From Dreams to Reality'
                              : config.category === 'anniversary' ? 'Years of Love, Laughter & Togetherness'
                              : config.category === 'religious_ceremony' ? 'Divine Blessings & Family'
                              : 'Summit Highlights & Media')
                            : "Our Love in Frames"
                        )}`
);

content = content.replace(
  `value={config.galleryTitle || "Our Gallery"}`,
  `value={config.galleryTitle || (
                          config.category && config.category !== 'wedding'
                            ? (config.category === 'birthday' ? 'Birthday Memories'
                              : config.category === 'first_birthday' ? 'Little Star Moments'
                              : config.category === 'baby_shower' ? 'Baby Shower Moments'
                              : config.category === 'naming_ceremony' ? 'Namkaran Moments'
                              : config.category === 'housewarming' ? 'Our Home Journey'
                              : config.category === 'anniversary' ? 'Anniversary Memories'
                              : config.category === 'religious_ceremony' ? 'Devotional Moments'
                              : 'Event Highlights & Media')
                            : "Our Gallery"
                        )}`
);

// 10. RSVP Placeholder
content = content.replace(
  `placeholder="A message for the couple..."`,
  `placeholder={
                          !config.category || config.category === 'wedding' || config.category === 'anniversary'
                            ? "A message for the couple..."
                            : config.category === 'birthday'
                            ? \`A warm birthday wish for \${config.heroName || config.coverBrideText || 'the birthday star'}...\`
                            : config.category === 'first_birthday'
                            ? "A sweet blessing or wish for the baby..."
                            : config.category === 'baby_shower'
                            ? "A loving message or blessing for mama & baby..."
                            : config.category === 'naming_ceremony'
                            ? "A divine blessing for the baby..."
                            : config.category === 'housewarming'
                            ? "Congratulations & blessings for the new home..."
                            : config.category === 'religious_ceremony'
                            ? "Pranam and devotional blessings..."
                            : "Notes, remarks or dietary requirements..."
                        }`
);

// 11. Wishes Subtitle & Title
const oldWishesHeader = `<span className="text-[10px] uppercase tracking-[0.25em] font-bold block mb-2" style={customStyles.colorAccent}>
                  Share Your Love
                </span>
                <h2 className={\`font-light \${config.wishTitleFont || 'font-serif'} \${config.wishTitleSize || 'text-2xl sm:text-3xl'} \${config.wishTitleAlign || 'text-center'}\`}>
                  Blessings &amp; Wishes
                </h2>`;

const newWishesHeader = `<span className="text-[10px] uppercase tracking-[0.25em] font-bold block mb-2" style={customStyles.colorAccent}>
                  {config.wishesSubtitle || (
                    config.category && config.category !== 'wedding'
                      ? (config.category === 'corporate_event' ? 'Guestbook & Feedback' : 'Send Your Love & Wishes')
                      : "Share Your Love"
                  )}
                </span>
                <h2 className={\`font-light \${config.wishTitleFont || 'font-serif'} \${config.wishTitleSize || 'text-2xl sm:text-3xl'} \${config.wishTitleAlign || 'text-center'}\`}>
                  {config.wishesTitle || (
                    config.category && config.category !== 'wedding'
                      ? (config.category === 'birthday' ? 'Warm Birthday Wishes'
                        : config.category === 'first_birthday' ? 'Sweet Blessings & Wishes'
                        : config.category === 'baby_shower' ? 'Shower Blessings & Love'
                        : config.category === 'naming_ceremony' ? 'Divine Blessings & Pranam'
                        : config.category === 'housewarming' ? 'Griha Pravesh Blessings'
                        : config.category === 'anniversary' ? 'Anniversary Wishes & Toasts'
                        : config.category === 'religious_ceremony' ? 'Pranam & Divine Blessings'
                        : 'Guestbook & Remarks')
                      : "Blessings & Wishes"
                  )}
                </h2>`;

content = content.replace(oldWishesHeader.replace(/\r?\n/g, '\r\n'), newWishesHeader.replace(/\r?\n/g, '\r\n'));
if (!content.includes(newWishesHeader.replace(/\r?\n/g, '\r\n'))) {
  content = content.replace(oldWishesHeader.replace(/\r?\n/g, '\n'), newWishesHeader.replace(/\r?\n/g, '\n'));
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated InvitationRenderer.jsx!');

