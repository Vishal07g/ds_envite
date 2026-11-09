// Category-Specific Standalone Configurations
// Completely isolated from Wedding defaults to ensure ZERO wedding text leaks!
import { getFutureDateString, CATEGORY_DEFAULT_TIMELINES } from './invitationCategoriesData.js';
import { GOOGLE_DRIVE_ROOT_FOLDER_ID, GOOGLE_DRIVE_ROOT_FOLDER_URL } from '../utils/googleDriveStorage.js';

export function getCategoryDefaultConfig(categoryId, customData = {}) {
  const futureDate = getFutureDateString(30);

  // Common visual / interactive defaults shared across all digital invites
  const baseInteractive = {
    category: categoryId,
    eventType: categoryId,
    isDemo: true,
    showDemoWatermark: true,
    demoWatermarkText: "Demo Invitation — Customize Details",
    
    // Envelope & Opening
    showEnvelope: true,
    coverOpeningEffect: "envelope",
    envelopeTheme: "royal-seal",
    envelopeColor: "#1e293b",
    envelopeLiningColor: "#0f172a",
    sealColor: "#d97706",
    sealEmblem: "star",

    // Background & Music
    primaryColor: "#0f172a",
    secondaryColor: "#1e293b",
    accentGold: "#f59e0b",
    showMusic: true,
    audioUrl: "https://assets.mixkit.co/music/preview/mixkit-celebration-spirit-870.mp3",
    audioTitle: "Celebration Theme",
    audioAutoplay: true,

    // Common Section Toggles
    showCoverSection: true,
    showScratchSection: true,
    showCoupleSection: true, // Used as Honoree / Details section
    showTimelineSection: true,
    showVenueSection: true,
    showGallery: true,
    showRsvpSection: true,
    showCountdown: true,

    // Google Drive
    driveStorage: {
      rootFolderId: GOOGLE_DRIVE_ROOT_FOLDER_ID,
      rootFolderUrl: GOOGLE_DRIVE_ROOT_FOLDER_URL,
      folderId: GOOGLE_DRIVE_ROOT_FOLDER_ID,
      folderUrl: GOOGLE_DRIVE_ROOT_FOLDER_URL,
      status: "synced",
      lastSyncedAt: new Date().toISOString()
    }
  };

  switch (categoryId) {
    case "birthday": {
      const name = customData.birthdayPersonName || customData.heroName || "Aarav Sharma";
      const age = customData.age || 25;
      const venue = customData.venue || "The Grand Celebration Hall";
      const address = customData.address || "45 Jubilee Hills, Road No. 10, Hyderabad";
      return {
        ...baseInteractive,
        heroName: name,
        title: `${name}'s ${age}th Birthday Invitation`,
        weddingDate: customData.eventDate || futureDate,
        weddingTime: customData.eventTime || "19:30",
        
        // Venue - 100% BIRTHDAY SPECIFIC (Zero Wedding Leakage)
        weddingVenue: venue,
        weddingAddress: address,
        venueCeremonyName: venue,
        venueCeremonyAddress: address,
        showReceptionVenue: false, // Single celebration venue by default
        receptionVenue: "",
        receptionAddress: "",
        venueTitle: "Party Venue & Celebration",
        venueSubtitle: "Celebration Location & Directions",

        // Gallery & Wishes
        galleryTitle: "Birthday Memories",
        gallerySubtitle: "Milestone Moments & Smiles",
        wishesTitle: "Warm Birthday Wishes",
        wishesSubtitle: "Send Your Love & Blessings",

        hostName: customData.hostName || "The Sharma Family",
        age: age,

        // Cover - 100% BIRTHDAY SPECIFIC
        coverTopBadgeText: `✦ CELEBRATING ${age} GLORIOUS YEARS ✦`,
        coverSubheadingText: "You Are Cordially Invited to the Birthday Party of",
        coverBrideText: name,
        coverGroomText: "",
        coverAmpersandText: "",
        coverQuoteText: "A milestone year filled with laughter, good vibes, and unforgettable memories.",
        coverBottomTaglineText: "✦ WIPE BELOW TO REVEAL SECRET PARTY TIMINGS & VENUE ✦",

        // Honoree Section - 100% BIRTHDAY SPECIFIC
        storySubtitle: "THE BIRTHDAY STAR",
        storyTitle: `Celebrating ${name}`,
        storyHonoreeTitle: "The Birthday Honoree",
        storyContent: customData.invitationMessage || `Join us for a fantastic evening of dinner, music, and celebration as ${name} turns ${age}! Your presence will make this milestone celebration complete.`,
        storyPathTitle: "A Milestone Worth Celebrating",
        storyParagraph: `${name} is turning ${age}! Join us as we look back on wonderful memories and toast to the bright exciting years ahead.`,

        // Scratch Card - 100% BIRTHDAY SPECIFIC
        scratchCardTitle: `${name}'s Birthday Celebration`,
        scratchCardDescription: "Use your finger or mouse to wipe the sparkling gold card to reveal the secret party schedule and live countdown!",
        scratchCoupleText: name,
        scratchCardCouple: name,
        scratchMarriedLabel: `Celebrates ${age}th Birthday On`,
        scratchDateText: customData.eventDate || futureDate,
        scratchSecretMessage: `${name} is turning ${age}! Join the grand celebration at ${venue}!`,

        // Timeline
        timelineHeading: "Party Schedule",
        timelineSubtitle: "Order of Events",
        ceremonies: (CATEGORY_DEFAULT_TIMELINES.birthday || []).map((ev, i) => ({
          ...ev,
          date: customData.eventDate || futureDate,
          venueName: venue,
          venueAddress: address,
          order: i
        }))
      };
    }

    case "first_birthday": {
      const name = customData.babyName || customData.heroName || "Aanya Sharma";
      const venue = customData.venue || "Little Stars Celebration Hall";
      const address = customData.address || "12 Blossom Park, Indiranagar, Bangalore";
      return {
        ...baseInteractive,
        heroName: name,
        title: `${name}'s 1st Birthday Bash`,
        weddingDate: customData.eventDate || futureDate,
        weddingTime: customData.eventTime || "16:30",

        // Venue - 100% FIRST BIRTHDAY SPECIFIC
        weddingVenue: venue,
        weddingAddress: address,
        venueCeremonyName: venue,
        venueCeremonyAddress: address,
        showReceptionVenue: false,
        receptionVenue: "",
        receptionAddress: "",
        venueTitle: "Celebration Venue",
        venueSubtitle: "Party Location & Directions",

        // Gallery & Wishes
        galleryTitle: "Little Star Moments",
        gallerySubtitle: "One Year of Smiles & Baby Steps",
        wishesTitle: "Sweet Blessings & Wishes",
        wishesSubtitle: "Shower Our Little Miracle with Love",

        hostName: customData.parentsNames || customData.hostName || "Rohan & Priya Sharma",

        // Cover
        coverTopBadgeText: "✦ OUR LITTLE STAR TURNS ONE ✦",
        coverSubheadingText: "Join Us in Celebrating the First Birthday of",
        coverBrideText: name,
        coverGroomText: "",
        coverAmpersandText: "",
        coverQuoteText: "One year of smiles, tiny giggles, baby steps, and endless joy.",
        coverBottomTaglineText: "✦ WIPE BELOW TO REVEAL CAKE SMASH & PARTY DETAILS ✦",

        // Honoree Section
        storySubtitle: "OUR LITTLE BLESSING",
        storyTitle: `One Whole Year of ${name}`,
        storyHonoreeTitle: "The Birthday Baby",
        storyContent: customData.invitationMessage || `Our precious little star is turning one! We invite you to join us for an afternoon of smiles, cake, and sweet memories.`,
        storyPathTitle: "365 Days of Sweet Memories",
        storyParagraph: `From her first tiny smile to her first baby steps, this year has been pure magic. Thank you for showering our little one with your warmth and love.`,

        // Scratch Card
        scratchCardTitle: `${name}'s First Birthday Bash`,
        scratchCardDescription: "Wipe off the golden sparkles to uncover party timings and cake smash details!",
        scratchCoupleText: name,
        scratchCardCouple: name,
        scratchMarriedLabel: "Turns One Year Old On",
        scratchDateText: customData.eventDate || futureDate,
        scratchSecretMessage: `Aanya is turning one! Join Rohan & Priya for the birthday celebration at ${venue}!`,

        // Timeline
        timelineHeading: "Celebration Schedule",
        timelineSubtitle: "Milestone Moments",
        ceremonies: (CATEGORY_DEFAULT_TIMELINES.first_birthday || []).map((ev, i) => ({
          ...ev,
          date: customData.eventDate || futureDate,
          venueName: venue,
          venueAddress: address,
          order: i
        }))
      };
    }

    case "baby_shower": {
      const mother = customData.motherName || customData.heroName || "Priya Sharma";
      const partner = customData.partnerName || "Rohan Sharma";
      const venue = customData.venue || "Blossom Garden Pavilion";
      const address = customData.address || "78 Green Valley Boulevard, Koregaon Park, Pune";
      return {
        ...baseInteractive,
        heroName: mother,
        title: `${mother}'s Baby Shower Celebration`,
        weddingDate: customData.eventDate || futureDate,
        weddingTime: customData.eventTime || "15:00",

        // Venue - 100% BABY SHOWER SPECIFIC
        weddingVenue: venue,
        weddingAddress: address,
        venueCeremonyName: venue,
        venueCeremonyAddress: address,
        showReceptionVenue: false,
        receptionVenue: "",
        receptionAddress: "",
        venueTitle: "Celebration Venue",
        venueSubtitle: "Shower Location & Directions",

        // Gallery & Wishes
        galleryTitle: "Baby Shower Moments",
        gallerySubtitle: "Cherishing Every Step of Motherhood",
        wishesTitle: "Shower Blessings & Love",
        wishesSubtitle: "Leave a Loving Note for Mama & Baby",

        hostName: customData.hostName || "The Sharma & Verma Families",

        // Cover
        coverTopBadgeText: "✦ WELCOMING OUR LITTLE MIRACLE ✦",
        coverSubheadingText: "You're Invited to Shower Love Upon Mama-to-Be",
        coverBrideText: mother,
        coverGroomText: partner ? `& ${partner}` : "",
        coverAmpersandText: partner ? "&" : "",
        coverQuoteText: "A sweet baby is on the way, bringing blessings every single day.",
        coverBottomTaglineText: "✦ WIPE BELOW TO REVEAL SHOWER PROGRAM & TIMINGS ✦",

        // Honoree Section
        storySubtitle: "WELCOMING BABY",
        storyTitle: `Showering ${mother} with Love`,
        storyHonoreeTitle: "Mother to Be",
        storyContent: customData.invitationMessage || `Join us as we celebrate the upcoming arrival of our little angel. Let's bless mama-to-be Priya with love, games, and cheer!`,
        storyPathTitle: "The Journey of Motherhood",
        storyParagraph: `A tiny hand to hold, tiny feet to guide, and a world of endless love ahead. We are thrilled to celebrate this special blessing with our loved ones.`,

        // Scratch Card
        scratchCardTitle: `Baby Shower Celebration`,
        scratchCardDescription: "Wipe off the gold shield to discover the ceremony timings and high tea schedule!",
        scratchCoupleText: `${mother}${partner ? ` & ${partner}` : ''}`,
        scratchCardCouple: `${mother}${partner ? ` & ${partner}` : ''}`,
        scratchMarriedLabel: "Baby Shower Celebrations On",
        scratchDateText: customData.eventDate || futureDate,
        scratchSecretMessage: `Welcoming Baby Sharma! Join Priya & Rohan for the Baby Shower at ${venue}!`,

        // Timeline
        timelineHeading: "Shower Schedule",
        timelineSubtitle: "Welcoming The Miracle",
        ceremonies: (CATEGORY_DEFAULT_TIMELINES.baby_shower || []).map((ev, i) => ({
          ...ev,
          date: customData.eventDate || futureDate,
          venueName: venue,
          venueAddress: address,
          order: i
        }))
      };
    }

    case "naming_ceremony": {
      const name = customData.babyName || customData.heroName || "Aarav Sharma";
      const venue = customData.venue || "Shree Celebration Hall";
      const address = customData.address || "56 Temple View Road, Navrangpura, Ahmedabad";
      return {
        ...baseInteractive,
        heroName: name,
        title: `Namkaran Ceremony of ${name}`,
        weddingDate: customData.eventDate || futureDate,
        weddingTime: customData.eventTime || "10:30",

        // Venue - 100% NAMING CEREMONY SPECIFIC
        weddingVenue: venue,
        weddingAddress: address,
        venueCeremonyName: venue,
        venueCeremonyAddress: address,
        showReceptionVenue: false,
        receptionVenue: "",
        receptionAddress: "",
        venueTitle: "Namkaran Ceremony Venue",
        venueSubtitle: "Auspicious Ceremony Directions",

        // Gallery & Wishes
        galleryTitle: "Namkaran Moments",
        gallerySubtitle: "Sacred Blessings & Family Joy",
        wishesTitle: "Divine Blessings & Pranam",
        wishesSubtitle: "Bestow Your Blessings Upon Our Child",

        hostName: customData.parentsNames || customData.hostName || "Rohan & Priya Sharma",

        // Cover
        coverTopBadgeText: "✦ SACRED NAMKARAN SANSKAR ✦",
        coverSubheadingText: "With Divine Blessings, We Invite You to the Naming Ceremony of",
        coverBrideText: name,
        coverGroomText: "",
        coverAmpersandText: "",
        coverQuoteText: "May divine wisdom, good health, and auspicious fortunes guide our child's path.",
        coverBottomTaglineText: "✦ WIPE BELOW TO REVEAL SACRED PUJA TIMINGS & PRASAD ✦",

        // Honoree Section
        storySubtitle: "SACRED BLESSINGS",
        storyTitle: `Namkaran Sanskar of ${name}`,
        storyHonoreeTitle: "Baby Blessing",
        storyContent: customData.invitationMessage || `With immense joy and gratitude to the Almighty, we invite you to bestow your warm blessings upon our child at the holy Namkaran ceremony.`,
        storyPathTitle: "Vedic Traditions & Family Roots",
        storyParagraph: `Following Vedic Sanatan traditions, we whisper our baby's holy name and seek the blessings of elders and deities for a prosperous life.`,

        // Scratch Card
        scratchCardTitle: `Sacred Namkaran Ceremony`,
        scratchCardDescription: "Wipe off the golden shield to discover the ceremony muhurat and mahaprasad!",
        scratchCoupleText: name,
        scratchCardCouple: name,
        scratchMarriedLabel: "Namkaran Ceremony On",
        scratchDateText: customData.eventDate || futureDate,
        scratchSecretMessage: `With divine blessings, our baby is named: ${name}! Ceremony at ${venue}.`,

        // Timeline
        timelineHeading: "Ceremony Schedule",
        timelineSubtitle: "Sacred Vedic Rites",
        ceremonies: (CATEGORY_DEFAULT_TIMELINES.naming_ceremony || []).map((ev, i) => ({
          ...ev,
          date: customData.eventDate || futureDate,
          venueName: venue,
          venueAddress: address,
          order: i
        }))
      };
    }

    case "housewarming": {
      const family = customData.familyName || customData.heroName || "The Sharma Family";
      const house = customData.houseName || "Shanti Nilayam";
      const venue = customData.venue || house;
      const address = customData.address || customData.newHomeAddress || "123 Celebration Avenue, Phase 2, Palm Meadows, Gurugram";
      return {
        ...baseInteractive,
        heroName: family,
        title: `${family} — Griha Pravesh Invitation`,
        weddingDate: customData.eventDate || futureDate,
        weddingTime: customData.eventTime || "10:00",

        // Venue - 100% HOUSEWARMING SPECIFIC
        weddingVenue: venue,
        weddingAddress: address,
        venueCeremonyName: venue,
        venueCeremonyAddress: address,
        showReceptionVenue: false,
        receptionVenue: "",
        receptionAddress: "",
        venueTitle: "Our New Residence",
        venueSubtitle: "New Home Location & Directions",

        // Gallery & Wishes
        galleryTitle: "Our Home Journey",
        gallerySubtitle: "From Dreams to Reality",
        wishesTitle: "Griha Pravesh Blessings",
        wishesSubtitle: "Warm Wishes for Peace, Prosperity & Joy",

        hostName: customData.hostNames || customData.hostName || "Rajesh & Sunita Sharma",
        houseName: house,

        // Cover
        coverTopBadgeText: "✦ GRIHA PRAVESH & VASTU SHANTI ✦",
        coverSubheadingText: "You Are Warmly Welcomed to the New Home of",
        coverBrideText: family,
        coverGroomText: "",
        coverAmpersandText: "",
        coverQuoteText: "A house is built with bricks and beams, a home is blessed with love and dreams.",
        coverBottomTaglineText: "✦ WIPE BELOW TO UNVEIL OUR NEW HOME ADDRESS & PUJA SCHEDULE ✦",

        // Honoree Section
        storySubtitle: "OUR NEW BEGINNING",
        storyTitle: `Welcome to ${house}`,
        storyHonoreeTitle: "The Homeowners",
        storyContent: customData.invitationMessage || `We are overjoyed to step across the threshold of our dream home! Please join us for the auspicious Griha Pravesh puja, hawan, and celebratory lunch.`,
        storyPathTitle: "From Dream to Reality",
        storyParagraph: `Building our home has been a journey of patience, hopes, and love. We look forward to creating wonderful new memories with you under our new roof.`,

        // Scratch Card
        scratchCardTitle: `Griha Pravesh Celebration`,
        scratchCardDescription: "Wipe off the golden shield to discover our new address and puja muhurat!",
        scratchCoupleText: family,
        scratchCardCouple: family,
        scratchMarriedLabel: "Griha Pravesh On",
        scratchDateText: customData.eventDate || futureDate,
        scratchSecretMessage: `Welcome to ${house}! Griha Pravesh & Vastu Shanti Puja at ${address}!`,

        // Timeline
        timelineHeading: "Puja & Celebration Schedule",
        timelineSubtitle: "Auspicious Rites & Feast",
        ceremonies: (CATEGORY_DEFAULT_TIMELINES.housewarming || []).map((ev, i) => ({
          ...ev,
          date: customData.eventDate || futureDate,
          venueName: venue,
          venueAddress: address,
          order: i
        }))
      };
    }

    case "anniversary": {
      const couple = customData.coupleNames || customData.heroName || "Rohan & Priya Sharma";
      const number = customData.anniversaryNumber || "10th";
      const venue = customData.venue || "The Royal Ballroom";
      const address = customData.address || "Marine Drive Promenade, Nariman Point, Mumbai";
      return {
        ...baseInteractive,
        heroName: couple,
        title: `${couple} — ${number} Anniversary Celebration`,
        weddingDate: customData.eventDate || futureDate,
        weddingTime: customData.eventTime || "19:00",

        // Venue - 100% ANNIVERSARY SPECIFIC
        weddingVenue: venue,
        weddingAddress: address,
        venueCeremonyName: venue,
        venueCeremonyAddress: address,
        showReceptionVenue: false,
        receptionVenue: "",
        receptionAddress: "",
        venueTitle: "Anniversary Celebration Venue",
        venueSubtitle: "Celebration Venue Directions",

        // Gallery & Wishes
        galleryTitle: "Anniversary Memories",
        gallerySubtitle: "Years of Love, Laughter & Togetherness",
        wishesTitle: "Anniversary Wishes & Toasts",
        wishesSubtitle: "Celebrate Eternal Love & Friendship",

        hostName: customData.hostName || "The Sharma Family",
        anniversaryNumber: number,

        // Cover
        coverTopBadgeText: `✦ CELEBRATING ${number.toUpperCase()} WEDDING ANNIVERSARY ✦`,
        coverSubheadingText: "Join Us as We Celebrate the Eternal Love of",
        coverBrideText: couple,
        coverGroomText: "",
        coverAmpersandText: "",
        coverQuoteText: "Years of love, laughter, shared dreams, and memories that last a lifetime.",
        coverBottomTaglineText: "✦ WIPE BELOW TO REVEAL THE ANNIVERSARY GALA PROGRAM ✦",

        // Honoree Section
        storySubtitle: "A DECADE OF LOVE",
        storyTitle: "Our Beautiful Journey",
        storyHonoreeTitle: "The Loving Couple",
        storyContent: customData.invitationMessage || `Celebrate a milestone anniversary of love, shared joy, and beautiful partnership. Join us for a memorable evening of music, dining, and toasts!`,
        storyPathTitle: "Growing Together in Love",
        storyParagraph: `Through every high and every challenge, our bond has grown stronger and sweeter with each passing season. Thank you for being part of our wonderful journey.`,

        // Scratch Card
        scratchCardTitle: `${number} Anniversary Gala`,
        scratchCardDescription: "Wipe off the metallic shield to reveal gala dinner timings and special toasts!",
        scratchCoupleText: couple,
        scratchCardCouple: couple,
        scratchMarriedLabel: `Celebrating ${number} Anniversary On`,
        scratchDateText: customData.eventDate || futureDate,
        scratchSecretMessage: `${couple} are celebrating ${number} Years of Wedded Bliss at ${venue}!`,

        // Timeline
        timelineHeading: "Anniversary Program",
        timelineSubtitle: "Evening Program",
        ceremonies: (CATEGORY_DEFAULT_TIMELINES.anniversary || []).map((ev, i) => ({
          ...ev,
          date: customData.eventDate || futureDate,
          venueName: venue,
          venueAddress: address,
          order: i
        }))
      };
    }

    case "religious_ceremony": {
      const ceremony = customData.ceremonyName || "Shri Satyanarayan Puja";
      const family = customData.hostFamilyName || customData.hostName || "The Sharma Family";
      const venue = customData.venue || "Our Residence";
      const address = customData.address || "14 Shanti Kunj, Civil Lines, Jaipur";
      return {
        ...baseInteractive,
        heroName: family,
        title: `${ceremony} Invitation — ${family}`,
        weddingDate: customData.eventDate || futureDate,
        weddingTime: customData.eventTime || "09:30",

        // Venue - 100% RELIGIOUS SPECIFIC
        weddingVenue: venue,
        weddingAddress: address,
        venueCeremonyName: venue,
        venueCeremonyAddress: address,
        showReceptionVenue: false,
        receptionVenue: "",
        receptionAddress: "",
        venueTitle: "Pooja & Prasad Venue",
        venueSubtitle: "Sacred Venue Directions",

        // Gallery & Wishes
        galleryTitle: "Devotional Moments",
        gallerySubtitle: "Divine Blessings & Family",
        wishesTitle: "Pranam & Divine Blessings",
        wishesSubtitle: "May Divine Grace Be With You",

        hostName: family,
        ceremonyName: ceremony,

        // Cover
        coverTopBadgeText: "✦ AURA OF DIVINE BLESSINGS ✦",
        coverSubheadingText: "With Utmost Devotion, We Invite You to Partake in",
        coverBrideText: ceremony,
        coverGroomText: "",
        coverAmpersandText: "",
        coverQuoteText: customData.religiousVerse || "Om Namo Bhagavate Vasudevaya • May peace and prosperity prevail.",
        coverBottomTaglineText: "✦ WIPE BELOW TO REVEAL PUJA TIMINGS, AARTI & MAHA PRASAD ✦",

        // Honoree Section
        storySubtitle: "DIVINE DEVOTION",
        storyTitle: ceremony,
        storyHonoreeTitle: "Devotional Host",
        storyContent: customData.invitationMessage || `We cordially invite you and your family to attend the holy ${ceremony}, partake in sacred hawan, and receive holy prasad.`,
        storyPathTitle: "Sacred Prayers for Peace & Prosperity",
        storyParagraph: `Gathering in divine remembrance purifies the mind, uplifts the soul, and brings sacred tranquility to our household.`,

        // Scratch Card
        scratchCardTitle: `${ceremony} Invitation`,
        scratchCardDescription: "Wipe off the sacred gold shield to discover the katha and aarti schedule!",
        scratchCoupleText: ceremony,
        scratchCardCouple: ceremony,
        scratchMarriedLabel: `${ceremony} On`,
        scratchDateText: customData.eventDate || futureDate,
        scratchSecretMessage: `${ceremony} & Maha Aarti at ${venue}!`,

        // Timeline
        timelineHeading: "Ceremony & Puja Timings",
        timelineSubtitle: "Divine Schedule",
        ceremonies: (CATEGORY_DEFAULT_TIMELINES.religious_ceremony || []).map((ev, i) => ({
          ...ev,
          date: customData.eventDate || futureDate,
          venueName: venue,
          venueAddress: address,
          order: i
        }))
      };
    }

    case "corporate_event": {
      const company = customData.companyName || "NovaTech Solutions";
      const eventTitle = customData.eventTitle || "Annual Global Tech Summit";
      const venue = customData.venue || "Grand Convention Centre";
      const address = customData.address || "Financial District, HITEC City, Hyderabad";
      return {
        ...baseInteractive,
        heroName: company,
        title: `${eventTitle} — ${company}`,
        weddingDate: customData.eventDate || futureDate,
        weddingTime: customData.eventTime || "09:00",

        // Venue - 100% CORPORATE SPECIFIC
        weddingVenue: venue,
        weddingAddress: address,
        venueCeremonyName: venue,
        venueCeremonyAddress: address,
        showReceptionVenue: false,
        receptionVenue: "",
        receptionAddress: "",
        venueTitle: "Conference & Event Venue",
        venueSubtitle: "Summit Venue & Location",

        // Gallery & Wishes
        galleryTitle: "Event Highlights & Media",
        gallerySubtitle: "Summit Highlights & Past Editions",
        wishesTitle: "Guestbook & Remarks",
        wishesSubtitle: "Leave Your Feedback & Inquiries",

        hostName: customData.hostOrganizer || company,
        eventTitle: eventTitle,

        // Cover
        coverTopBadgeText: "✦ ANNUAL CORPORATE SUMMIT ✦",
        coverSubheadingText: `${company} Cordially Welcomes You to`,
        coverBrideText: eventTitle,
        coverGroomText: "",
        coverAmpersandText: "",
        coverQuoteText: "Empowering innovation, transforming leadership, and shaping the future.",
        coverBottomTaglineText: "✦ WIPE BELOW TO REVEAL KEYNOTE SPEAKERS & SUMMIT AGENDA ✦",

        // Honoree Section
        storySubtitle: "EVENT OVERVIEW",
        storyTitle: `About ${eventTitle}`,
        storyHonoreeTitle: "Host Organization",
        storyContent: customData.invitationMessage || customData.eventDescription || `Join global business leaders, tech pioneers, and distinguished executives for an impactful day of insights, keynote addresses, and high-impact networking.`,
        storyPathTitle: "Driving Tomorrow's Innovations",
        storyParagraph: `This annual gathering convenes leading voices to discuss next-generation transformation, sustainable growth, and pioneering industry strategies.`,

        // Scratch Card
        scratchCardTitle: eventTitle,
        scratchCardDescription: "Wipe off the metallic shield to unveil keynote speakers and the day's agenda!",
        scratchCoupleText: company,
        scratchCardCouple: company,
        scratchMarriedLabel: "Event Commences On",
        scratchDateText: customData.eventDate || futureDate,
        scratchSecretMessage: `${company} ${eventTitle} • ${venue}!`,

        // Timeline
        timelineHeading: "Event Agenda",
        timelineSubtitle: "Summit Timeline",
        ceremonies: (CATEGORY_DEFAULT_TIMELINES.corporate_event || []).map((ev, i) => ({
          ...ev,
          date: customData.eventDate || futureDate,
          venueName: venue,
          venueAddress: address,
          order: i
        }))
      };
    }

    default:
      return baseInteractive;
  }
}

