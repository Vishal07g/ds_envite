// Invitation Categories, Realistic Fictional Sample Data & Config Mappers
// Strict Existing Project Protection: Backward-compatible extensions only
import { getCategoryDefaultConfig } from './categoryDefaultConfigs.js';

/**
 * Calculate realistic upcoming dates (3 to 6 months in future)
 */
export function getFutureDateString(daysFromNow = 90) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 9 Standard Categories as per Project Specification
 */
export const INVITATION_CATEGORIES = [
  {
    id: "wedding",
    name: "Wedding Invitation",
    subtitle: "Royal & Classic Matrimonial Celebrations",
    icon: "💍",
    tag: "✦ FLAGSHIP ✦",
    tagColor: "bg-amber-500/20 text-amber-900 border-amber-400/50",
    description: "Complete luxury celebration with bride & groom details, multi-day function timeline, family blessings, and interactive gold scratch reveal."
  },
  {
    id: "birthday",
    name: "Birthday Invitation",
    subtitle: "Milestone & Joyful Birthday Parties",
    icon: "🎂",
    tag: "Celebration",
    tagColor: "bg-rose-500/20 text-rose-900 border-rose-400/40",
    description: "Joyful birthday party with surprise scratch card, age milestone reveal, live countdown, and interactive photo gallery."
  },
  {
    id: "first_birthday",
    name: "First Birthday Invitation",
    subtitle: "Turning One Milestone Bash",
    icon: "🍼",
    tag: "Milestone",
    tagColor: "bg-sky-500/20 text-sky-900 border-sky-400/40",
    description: "Adorable first birthday celebration with baby photo gallery, proud parents details, and cute scratch reveal surprise."
  },
  {
    id: "baby_shower",
    name: "Baby Shower Invitation",
    subtitle: "Welcoming the Little Miracle",
    icon: "👶",
    tag: "Blessing",
    tagColor: "bg-pink-500/20 text-pink-900 border-pink-400/40",
    description: "Warm baby shower celebration honoring the parents-to-be, baby wishes, and surprise countdown."
  },
  {
    id: "naming_ceremony",
    name: "Naming Ceremony Invitation",
    subtitle: "Namkaran & Traditional Blessing",
    icon: "🪷",
    tag: "Sacred",
    tagColor: "bg-amber-500/15 text-amber-900 border-amber-400/40",
    description: "Sacred naming ceremony revealing baby name via interactive scratch card, traditional verse, and family blessing."
  },
  {
    id: "housewarming",
    name: "Housewarming Invitation",
    subtitle: "Griha Pravesh & New Home Blessing",
    icon: "🏡",
    tag: "Home",
    tagColor: "bg-emerald-500/20 text-emerald-900 border-emerald-400/40",
    description: "Celebrate new beginnings and dream home blessing with house photos, ceremony timings, and directions."
  },
  {
    id: "anniversary",
    name: "Anniversary Invitation",
    subtitle: "Celebrating Decades of Eternal Love",
    icon: "💖",
    tag: "Romantic",
    tagColor: "bg-purple-500/20 text-purple-900 border-purple-400/40",
    description: "Commemorate milestone wedding anniversaries with couple love story, timeline, and grand party reveal."
  },
  {
    id: "religious_ceremony",
    name: "Religious Ceremony Invitation",
    subtitle: "Puja, Hawan, Kirtan & Holy Blessings",
    icon: "🕉️",
    tag: "Devotional",
    tagColor: "bg-orange-500/20 text-orange-900 border-orange-400/40",
    description: "Sacred invitations for Satyanarayan Puja, Mata Ki Chowki, Sukhmani Sahib, Baptism, and holy gatherings."
  },
  {
    id: "corporate_event",
    name: "Corporate Event Invitation",
    subtitle: "Conferences, Summits & Galas",
    icon: "🏢",
    tag: "Business",
    tagColor: "bg-blue-500/20 text-blue-900 border-blue-400/40",
    description: "Professional invitations for annual summits, corporate galas, speaker sessions, and networking events."
  }
];

/**
 * Category-specific Default Timelines / Schedules
 * Ensures non-wedding invitations NEVER show Haldi / Mehendi / Mandap / Phere!
 */
export const CATEGORY_DEFAULT_TIMELINES = {
  birthday: [
    {
      id: "bday-event-1",
      title: "Guests Arrival & Welcome Drinks",
      category: "arrival",
      time: "19:00",
      showTime: true,
      description: "Warm welcome with sparkling mocktails and appetizers.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 0
    },
    {
      id: "bday-event-2",
      title: "Cake Cutting Ceremony",
      category: "cake",
      time: "20:00",
      showTime: true,
      description: "Gather around for birthday wishes, cake cutting, and cheerful toasts!",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 1
    },
    {
      id: "bday-event-3",
      title: "Grand Dinner Buffet",
      category: "dinner",
      time: "20:45",
      showTime: true,
      description: "Lavish multi-cuisine banquet curated for friends and family.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 2
    },
    {
      id: "bday-event-4",
      title: "Live DJ & Dance Floor",
      category: "party",
      time: "21:30",
      showTime: true,
      description: "Turn up the music, hit the dance floor, and celebrate the night away!",
      clipartId: "sangeet-dhol",
      visible: true,
      showClipart: true,
      order: 3
    }
  ],
  first_birthday: [
    {
      id: "firstbday-event-1",
      title: "Welcome Smiles & High Tea",
      category: "arrival",
      time: "16:30",
      showTime: true,
      description: "Fun photo booth, welcome drinks, and snacks for all guests.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 0
    },
    {
      id: "firstbday-event-2",
      title: "First Birthday Cake Smash",
      category: "cake",
      time: "17:30",
      showTime: true,
      description: "Watch our little star blow their first candle and celebrate 1 whole year!",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 1
    },
    {
      id: "firstbday-event-3",
      title: "Games & Magic Show",
      category: "games",
      time: "18:15",
      showTime: true,
      description: "Interactive games, balloon crafts, and magic show for kids and grown-ups.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 2
    },
    {
      id: "firstbday-event-4",
      title: "Celebration Dinner & Return Gifts",
      category: "dinner",
      time: "19:00",
      showTime: true,
      description: "Delicious dinner followed by special personalized return favors.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 3
    }
  ],
  baby_shower: [
    {
      id: "babyshower-event-1",
      title: "Welcome & High Tea Reception",
      category: "arrival",
      time: "15:00",
      showTime: true,
      description: "Welcome coolers, canapés, and heartfelt meet-and-greet.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 0
    },
    {
      id: "babyshower-event-2",
      title: "Baby Shower Games & Trivia",
      category: "games",
      time: "16:00",
      showTime: true,
      description: "Guess the baby dates, diaper toss, and fun family quizzes.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 1
    },
    {
      id: "babyshower-event-3",
      title: "Blessings & Godh Bharai",
      category: "blessing",
      time: "17:00",
      showTime: true,
      description: "Traditional blessings, sweet offerings, and gifts for mom-to-be.",
      clipartId: "wedding-mandap",
      visible: true,
      showClipart: true,
      order: 2
    },
    {
      id: "babyshower-event-4",
      title: "Celebration Feast",
      category: "dinner",
      time: "18:00",
      showTime: true,
      description: "Gourmet evening dinner and mom-to-be favorite desserts.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 3
    }
  ],
  naming_ceremony: [
    {
      id: "naming-event-1",
      title: "Guests Welcome & Shankh Dhwani",
      category: "arrival",
      time: "10:00",
      showTime: true,
      description: "Welcoming family with sacred tilak and traditional refreshments.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 0
    },
    {
      id: "naming-event-2",
      title: "Vedic Puja & Hawan",
      category: "puja",
      time: "10:30",
      showTime: true,
      description: "Sacred fire ceremony invoking health, wisdom, and long life.",
      clipartId: "wedding-mandap",
      visible: true,
      showClipart: true,
      order: 1
    },
    {
      id: "naming-event-3",
      title: "Whispering the Holy Name (Namkaran)",
      category: "naming",
      time: "11:30",
      showTime: true,
      description: "Father and mother whisper baby's official name into the ear, followed by blessings.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 2
    },
    {
      id: "naming-event-4",
      title: "Maha Prasad & Traditional Lunch",
      category: "lunch",
      time: "12:30",
      showTime: true,
      description: "Sumptuous traditional festive meal for all well-wishers.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 3
    }
  ],
  housewarming: [
    {
      id: "house-event-1",
      title: "Auspicious Entry & Kalash Puja",
      category: "puja",
      time: "10:00",
      showTime: true,
      description: "Stepping into the new home carrying holy Kalash with chanting of Vedic mantras.",
      clipartId: "wedding-mandap",
      visible: true,
      showClipart: true,
      order: 0
    },
    {
      id: "house-event-2",
      title: "Vastu Shanti & Hawan",
      category: "hawan",
      time: "10:45",
      showTime: true,
      description: "Sacred fire ritual to purify and bless every corner of the new residence.",
      clipartId: "wedding-mandap",
      visible: true,
      showClipart: true,
      order: 1
    },
    {
      id: "house-event-3",
      title: "Boiling Milk & Home Tour",
      category: "tradition",
      time: "12:00",
      showTime: true,
      description: "Traditional milk-overflow ceremony symbolizing eternal abundance, followed by home tour.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 2
    },
    {
      id: "house-event-4",
      title: "Grand Griha Pravesh Feast",
      category: "lunch",
      time: "13:00",
      showTime: true,
      description: "Lavish festive lunch celebrating new beginnings with family and friends.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 3
    }
  ],
  anniversary: [
    {
      id: "anniv-event-1",
      title: "Welcome Reception & Cocktails",
      category: "arrival",
      time: "19:00",
      showTime: true,
      description: "Sparkling welcome drinks, red carpet photo wall, and music.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 0
    },
    {
      id: "anniv-event-2",
      title: "Vow Renewal & Memory Walk",
      category: "ceremony",
      time: "20:00",
      showTime: true,
      description: "Sweet re-affirmation of wedding vows and audio-visual love journey showcase.",
      clipartId: "reception-rings",
      visible: true,
      showClipart: true,
      order: 1
    },
    {
      id: "anniv-event-3",
      title: "Cake Cutting & Champagne Toast",
      category: "cake",
      time: "20:45",
      showTime: true,
      description: "Raising a toast to decades of romance, partnership, and happiness.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 2
    },
    {
      id: "anniv-event-4",
      title: "Gala Dinner & First Dance",
      category: "dinner",
      time: "21:30",
      showTime: true,
      description: "Couple's anniversary dance leading into a grand banquet dinner.",
      clipartId: "sangeet-dhol",
      visible: true,
      showClipart: true,
      order: 3
    }
  ],
  religious_ceremony: [
    {
      id: "rel-event-1",
      title: "Sankalp & Ganpati Pujan",
      category: "puja",
      time: "09:30",
      showTime: true,
      description: "Commencing the sacred rites with prayers to Lord Ganesha for peace and harmony.",
      clipartId: "wedding-mandap",
      visible: true,
      showClipart: true,
      order: 0
    },
    {
      id: "rel-event-2",
      title: "Holy Katha & Sacred Chanting",
      category: "katha",
      time: "10:15",
      showTime: true,
      description: "Reading of holy scriptures, soul-stirring bhajans, and divine kirtan.",
      clipartId: "wedding-mandap",
      visible: true,
      showClipart: true,
      order: 1
    },
    {
      id: "rel-event-3",
      title: "Maha Aarti & Deep Prajjwalan",
      category: "aarti",
      time: "11:45",
      showTime: true,
      description: "Grand aarti with incense, lamps, conch shells, and collective devotional singing.",
      clipartId: "wedding-mandap",
      visible: true,
      showClipart: true,
      order: 2
    },
    {
      id: "rel-event-4",
      title: "Holy Mahaprasad & Bhandara",
      category: "prasad",
      time: "12:30",
      showTime: true,
      description: "Distribution of consecrated prasad followed by a pure satvik community meal.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 3
    }
  ],
  corporate_event: [
    {
      id: "corp-event-1",
      title: "Delegate Registration & Breakfast",
      category: "arrival",
      time: "09:00",
      showTime: true,
      description: "Badge pick-up, networking coffee, and breakfast buffet.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 0
    },
    {
      id: "corp-event-2",
      title: "Inaugural Keynote & Vision Address",
      category: "keynote",
      time: "10:00",
      showTime: true,
      description: "Opening keynote by industry luminaries outlining future strategies and roadmaps.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 1
    },
    {
      id: "corp-event-3",
      title: "Panel Discussions & Product Showcase",
      category: "panel",
      time: "11:30",
      showTime: true,
      description: "Interactive expert panels, customer success stories, and live product demos.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 2
    },
    {
      id: "corp-event-4",
      title: "Executive Networking Lunch & Awards",
      category: "awards",
      time: "13:00",
      showTime: true,
      description: "Annual excellence awards ceremony followed by an executive networking luncheon.",
      clipartId: "other-gift",
      visible: true,
      showClipart: true,
      order: 3
    }
  ]
};

/**
 * Generate rich, realistic fictional sample data for a category
 */
export function getInitialSampleData(categoryId = "wedding") {
  const weddingDate = getFutureDateString(105);
  const mehendiDate = getFutureDateString(103);
  const haldiDate = getFutureDateString(104);
  const receptionDate = getFutureDateString(106);
  const generalEventDate = getFutureDateString(45);

  switch (categoryId) {
    case "wedding":
      return {
        // Section A: Bride & Groom Details
        brideFullName: "Aarohi Sharma",
        brideDisplayName: "Aarohi",
        brideParents: "Rajesh & Sunita Sharma",
        brideFamilyName: "Sharma Family",
        brideLocation: "Jaipur, Rajasthan",
        bridePhoto: "",

        groomFullName: "Vivaan Mehta",
        groomDisplayName: "Vivaan",
        groomParents: "Amit & Neha Mehta",
        groomFamilyName: "Mehta Family",
        groomLocation: "Mumbai, Maharashtra",
        groomPhoto: "",

        // Section B: Wedding Details
        weddingDate: weddingDate,
        weddingStartTime: "19:00",
        weddingEndTime: "23:30",
        venueName: "Royal Wedding Palace",
        venueAddress: "Palace Road, Near Jal Mahal, Jaipur, Rajasthan 302002",
        city: "Jaipur",
        state: "Rajasthan",
        country: "India",
        googleMapsUrl: "https://maps.google.com/?q=Royal+Wedding+Palace+Jaipur",
        invitationMessage: "With immense joy and the blessings of our elders, we invite you to celebrate the holy matrimony and union of our hearts.",
        themePreference: "royal-theme",

        // Section C: Wedding Functions & Timeline
        functions: [
          {
            id: "func-mehendi",
            name: "Mehendi Ceremony",
            date: mehendiDate,
            startTime: "16:00",
            endTime: "19:30",
            venueName: "Garden Celebration Hall",
            venueAddress: "Heritage Lawns, Civil Lines, Jaipur",
            city: "Jaipur",
            googleMapsUrl: "https://maps.google.com/?q=Heritage+Lawns+Jaipur",
            description: "An afternoon of fragrant henna, folk tunes, and colorful celebration.",
            invitationMessage: "Adorn your hands with henna and dance to the festive rhythm!"
          },
          {
            id: "func-haldi",
            name: "Haldi Ceremony",
            date: haldiDate,
            startTime: "10:00",
            endTime: "13:00",
            venueName: "Family Residence",
            venueAddress: "14 Shanti Kunj, Malviya Nagar, Jaipur",
            city: "Jaipur",
            googleMapsUrl: "https://maps.google.com/?q=Shanti+Kunj+Jaipur",
            description: "Sacred turmeric paste rituals, holy blessings, and laughter.",
            invitationMessage: "A golden morning of traditional rituals and joyous celebrations."
          },
          {
            id: "func-sangeet",
            name: "Sangeet Night",
            date: haldiDate,
            startTime: "19:30",
            endTime: "23:30",
            venueName: "Grand Ballroom Lawn",
            venueAddress: "The Gilded Glass Greenhouse, Jaipur",
            city: "Jaipur",
            googleMapsUrl: "",
            description: "An evening of dance performances, musical beats, and a grand feast.",
            invitationMessage: "Put on your dancing shoes for an unforgettable night of musical celebrations!"
          },
          {
            id: "func-wedding",
            name: "Wedding Ceremony",
            date: weddingDate,
            startTime: "19:00",
            endTime: "23:30",
            venueName: "Royal Mandap",
            venueAddress: "Royal Wedding Palace, Palace Road, Jaipur",
            city: "Jaipur",
            googleMapsUrl: "https://maps.google.com/?q=Royal+Wedding+Palace+Jaipur",
            description: "The sacred phere, wedding vows, and eternal union of two souls.",
            invitationMessage: "Witness the sacred rituals as we embark on this eternal journey together."
          },
          {
            id: "func-reception",
            name: "Reception",
            date: receptionDate,
            startTime: "19:30",
            endTime: "23:30",
            venueName: "Grand Ballroom",
            venueAddress: "Royal Wedding Palace, Palace Road, Jaipur",
            city: "Jaipur",
            googleMapsUrl: "https://maps.google.com/?q=Royal+Wedding+Palace+Jaipur",
            description: "An evening of fine dining, congratulations, and celebration with the newlyweds.",
            invitationMessage: "Join us for a grand banquet to celebrate the newly married couple."
          }
        ],

        // Section D: Family & Invitation Details
        hostFamilyName: "The Sharma & Mehta Families",
        brideFamilyMessage: "Rajesh & Sunita Sharma cordially invite you to bless their daughter.",
        groomFamilyMessage: "Amit & Neha Mehta warmly request the honor of your presence.",
        religiousVerse: "Mangalam Bhagwan Vishnu, Mangalam Garudadhwaja...",
        blessingsMessage: "With the divine blessings of our ancestors and the loving support of family & friends.",
        dressCode: "Traditional Indian / Formal Festive",

        // Section E: Initial Customization Preferences
        openingAnimation: "envelope",
        enableCountdown: true,
        enableRsvp: true,
        enableMaps: true,
        enableGallery: true,
        enableScratchCard: true,
        scratchMessage: "✦ WIPE TO REVEAL SECRET WEDDING DATE & TIMINGS ✦",
        revealedMessage: "Radha & Krishna are getting married on 20-11-2026!"
      };

    case "birthday":
      return {
        birthdayPersonName: "Aarav Sharma",
        age: 25,
        eventDate: generalEventDate,
        eventTime: "19:30",
        venue: "The Grand Celebration Hall",
        address: "45 Jubilee Hills, Road No. 10, Hyderabad, Telangana",
        hostName: "The Sharma Family",
        invitationMessage: "Join us for an unforgettable evening of music, dinner, and celebration as Aarav turns 25!",
        themePreference: "midnight-gold",
        scratchMessage: "Guess who's turning 25! Wipe to discover the celebration!",
        revealedMessage: "Aarav Sharma is celebrating his 25th Birthday Milestone!",
        photo: "",
        enableCountdown: true,
        enableRsvp: true,
        enableGallery: true,
        enableScratchCard: true
      };

    case "first_birthday":
      return {
        babyName: "Aanya Sharma",
        babyDob: getFutureDateString(-365),
        eventDate: generalEventDate,
        parentsNames: "Rohan & Priya Sharma",
        eventTime: "16:30",
        venue: "Little Stars Celebration Hall",
        address: "12 Blossom Park, Indiranagar, Bangalore, Karnataka",
        hostName: "Rohan & Priya Sharma",
        invitationMessage: "Our little star is turning one! Join us for an afternoon of smiles, cake, and sweet memories.",
        themePreference: "pastel-gold",
        scratchMessage: "Our little star is turning one! Wipe to reveal the party!",
        revealedMessage: "Aanya is celebrating her 1st Birthday! Party at Little Stars Hall!",
        photo: "",
        enableCountdown: true,
        enableRsvp: true,
        enableGallery: true,
        enableScratchCard: true
      };

    case "baby_shower":
      return {
        motherName: "Priya Sharma",
        partnerName: "Rohan Sharma",
        babyName: "Baby Sharma",
        eventDate: generalEventDate,
        eventTime: "15:00",
        venue: "Blossom Garden Pavilion",
        address: "78 Green Valley Boulevard, Koregaon Park, Pune, Maharashtra",
        hostName: "The Sharma & Verma Families",
        invitationMessage: "Join us as we shower mama-to-be Priya with love and celebrate the upcoming arrival of our little miracle!",
        themePreference: "soft-rose",
        scratchMessage: "A little miracle is on the way! Wipe to reveal the shower celebration!",
        revealedMessage: "Welcoming Baby Sharma! Join Priya & Rohan for the Baby Shower!",
        photo: "",
        enableCountdown: true,
        enableRsvp: true,
        enableGallery: true,
        enableScratchCard: true
      };

    case "naming_ceremony":
      return {
        babyName: "Aarav Sharma",
        parentsNames: "Rohan & Priya Sharma",
        grandparentsNames: "Shri Ramakant & Savitri Sharma",
        eventDate: generalEventDate,
        eventTime: "10:30",
        venue: "Shree Celebration Hall",
        address: "56 Temple View Road, Navrangpura, Ahmedabad, Gujarat",
        religiousTradition: "Vedic Sanatan Tradition",
        invitationMessage: "With immense joy and divine blessings, we invite you to the sacred Namkaran ceremony of our beloved child.",
        blessingsMessage: "May the divine shower our child with wisdom, health, and prosperity.",
        themePreference: "sacred-gold",
        scratchMessage: "Discover our baby's beautiful name! Wipe to reveal the sacred blessing!",
        revealedMessage: "With divine blessings, our baby is named: Aarav Sharma!",
        photo: "",
        enableCountdown: true,
        enableRsvp: true,
        enableGallery: true,
        enableScratchCard: true
      };

    case "housewarming":
      return {
        familyName: "The Sharma Family",
        houseName: "Our Dream Home (Shanti Nilayam)",
        newHomeAddress: "123 Celebration Avenue, Phase 2, Palm Meadows, Gurugram, Haryana",
        eventDate: generalEventDate,
        eventTime: "10:00",
        hostNames: "Rajesh & Sunita Sharma",
        ceremonyType: "Griha Pravesh & Vastu Shanti Puja",
        invitationMessage: "Join us as we step into our new home with gratitude, divine blessings, and warm memories.",
        themePreference: "warm-earth",
        scratchMessage: "Discover our new home! Wipe to unveil the Griha Pravesh address & puja timings!",
        revealedMessage: "Welcome to Shanti Nilayam! Rajesh & Sunita Sharma's New Home!",
        photo: "",
        enableCountdown: true,
        enableRsvp: true,
        enableGallery: true,
        enableScratchCard: true
      };

    case "anniversary":
      return {
        coupleNames: "Rohan & Priya Sharma",
        anniversaryNumber: "10th",
        weddingDate: "2017-02-14",
        eventDate: generalEventDate,
        eventTime: "19:00",
        venue: "The Royal Ballroom",
        address: "Marine Drive Promenade, Nariman Point, Mumbai, Maharashtra",
        hostName: "Aanya & The Sharma Family",
        invitationMessage: "Celebrate a decade of endless love, shared laughter, and beautiful memories with us!",
        themePreference: "royal-gold",
        scratchMessage: "Ten years of love and memories! Wipe to reveal the anniversary celebration!",
        revealedMessage: "Rohan & Priya are celebrating 10 Years of Wedded Bliss!",
        photo: "",
        enableCountdown: true,
        enableRsvp: true,
        enableGallery: true,
        enableScratchCard: true
      };

    case "religious_ceremony":
      return {
        ceremonyName: "Shri Satyanarayan Puja & Bhajan",
        religiousTradition: "Vedic Sanatan",
        hostFamilyName: "The Sharma Family",
        eventDate: generalEventDate,
        eventTime: "09:30",
        venue: "Our Residence",
        address: "14 Shanti Kunj, Civil Lines, Jaipur, Rajasthan",
        religiousVerse: "Om Namo Bhagavate Vasudevaya",
        invitationMessage: "With divine devotion, we invite you to partake in sacred prayers, hawan, and receive holy prasad.",
        themePreference: "divine-saffron",
        scratchMessage: "You're invited to receive divine blessings! Wipe to reveal puja schedule & prasad timings!",
        revealedMessage: "Shri Satyanarayan Katha & Maha Aarti at Our Residence!",
        photo: "",
        enableCountdown: true,
        enableRsvp: true,
        enableGallery: true,
        enableScratchCard: true
      };

    case "corporate_event":
      return {
        companyName: "NovaTech Solutions",
        eventTitle: "Annual Global Tech Summit 2027",
        eventType: "Annual Business Conference & Gala",
        eventDate: generalEventDate,
        eventTime: "09:00",
        venue: "Grand Convention Centre",
        address: "Financial District, HITEC City, Hyderabad, Telangana",
        hostOrganizer: "Executive Leadership Team, NovaTech Solutions",
        eventDescription: "Join industry visionaries, tech pioneers, and executives for an inspiring day of technology breakthroughs and keynote sessions.",
        speakerDetails: "Featuring Keynotes from Leading AI & Cloud Pioneers",
        themePreference: "executive-slate",
        scratchMessage: "Discover our exciting event announcement! Wipe to unveil keynotes & agenda!",
        revealedMessage: "NovaTech Annual Tech Summit 2027 • Grand Convention Centre",
        photo: "",
        enableCountdown: true,
        enableRsvp: true,
        enableGallery: true,
        enableScratchCard: true
      };

    default:
      return getInitialSampleData("wedding");
  }
}

/**
 * Safely maps guided modal form data into standard invitation configuration.
 * Fully preserves all existing wedding parameters and schema compatibility.
 */
export function mapInitialDataToConfig(categoryId, formData, baseDefaultConfig = {}) {
  const isWedding = categoryId === "wedding";

  // Base clone
  const config = { ...baseDefaultConfig };

  config.category = categoryId;
  config.eventType = categoryId;
  config.invitationType = categoryId;
  config.isDemo = true;
  config.demoWatermarkText = "Demo Invitation — Replace Sample Details";
  config.showDemoWatermark = true;

  if (isWedding) {
    // 1. Bride & Groom mapping
    config.coverBrideText = formData.brideDisplayName || formData.brideFullName || "Aarohi";
    config.brideName = formData.brideFullName || "Aarohi Sharma";
    config.brideDisplayName = formData.brideDisplayName || "Aarohi";
    config.brideParents = formData.brideParents || "";
    config.brideFamilyName = formData.brideFamilyName || "";
    config.brideLocation = formData.brideLocation || "";

    config.coverGroomText = formData.groomDisplayName || formData.groomFullName || "Vivaan";
    config.groomName = formData.groomFullName || "Vivaan Mehta";
    config.groomDisplayName = formData.groomDisplayName || "Vivaan";
    config.groomParents = formData.groomParents || "";
    config.groomFamilyName = formData.groomFamilyName || "";
    config.groomLocation = formData.groomLocation || "";

    // 2. Wedding Date & Times
    if (formData.weddingDate) {
      config.weddingDate = formData.weddingDate;
    }
    if (formData.weddingStartTime) {
      config.weddingTime = formData.weddingStartTime;
    }
    if (formData.weddingEndTime) {
      config.weddingEndTime = formData.weddingEndTime;
    }

    // 3. Venue
    if (formData.venueName) {
      config.venueCeremonyName = formData.venueName;
    }
    if (formData.venueAddress) {
      config.venueCeremonyAddress = formData.venueAddress;
    }
    if (formData.city) {
      config.venueCeremonyCity = formData.city;
    }
    if (formData.googleMapsUrl) {
      config.venueCeremonyMapUrl = formData.googleMapsUrl;
    }

    // 4. Messages & Host
    if (formData.invitationMessage) {
      config.coverSubtitle = formData.invitationMessage;
      config.storyContent = formData.invitationMessage;
    }
    if (formData.hostFamilyName) {
      config.hostName = formData.hostFamilyName;
    }
    if (formData.religiousVerse) {
      config.sacredMantra = formData.religiousVerse;
    }

    // 5. Wedding Timeline / Functions mapping to ceremonies array
    if (Array.isArray(formData.functions) && formData.functions.length > 0) {
      config.ceremonies = formData.functions.map((fn, idx) => ({
        id: fn.id || `ceremony-${idx + 1}`,
        title: fn.name || `Ceremony ${idx + 1}`,
        category: (fn.name || "").toLowerCase().includes("haldi") ? "haldi"
          : (fn.name || "").toLowerCase().includes("mehendi") ? "mehendi"
          : (fn.name || "").toLowerCase().includes("sangeet") ? "sangeet"
          : (fn.name || "").toLowerCase().includes("reception") ? "reception"
          : "wedding",
        date: fn.date || formData.weddingDate || getFutureDateString(105),
        time: fn.startTime || "19:00",
        showTime: true,
        description: fn.description || "",
        venueName: fn.venueName || formData.venueName || "Celebration Hall",
        venueAddress: fn.venueAddress || formData.venueAddress || "",
        venueUrl: fn.googleMapsUrl || "",
        clipartId: (fn.name || "").toLowerCase().includes("haldi") ? "haldi-bowl"
          : (fn.name || "").toLowerCase().includes("mehendi") ? "mehendi-cone"
          : (fn.name || "").toLowerCase().includes("sangeet") ? "sangeet-dhol"
          : (fn.name || "").toLowerCase().includes("reception") ? "reception-rings"
          : "wedding-mandap",
        visible: true,
        showClipart: true,
        order: idx
      }));
    }

    // 6. Scratch Card & Preferences
    config.scratchCardTitle = "Our Secret Wedding Calendar";
    config.scratchCardCouple = `${config.coverBrideText} & ${config.coverGroomText}`;
    config.scratchCardDescription = "We've kept the date a romantic surprise. Use your mouse or touchscreen to wipe off the gold metallic shield to discover the ceremony timings and live countdown!";
    config.scratchSecretMessage = `${config.coverBrideText} & ${config.coverGroomText} are getting married on ${formData.weddingDate || '20-11-2026'}!`;

    if (formData.openingAnimation) {
      config.coverOpeningEffect = formData.openingAnimation;
    }

  } else {
    // Standalone Category Configuration — Completely Isolated from Wedding
    const catDefaults = getCategoryDefaultConfig(categoryId, formData);
    Object.assign(config, catDefaults);
  }

  // Common Visibility Toggles Initialization (All sections visible by default, clean & toggleable)
  config.showCountdown = formData.enableCountdown !== false;
  config.showRsvp = formData.enableRsvp !== false;
  config.showGallery = formData.enableGallery !== false;
  config.showScratchCard = formData.enableScratchCard !== false;
  config.showMaps = formData.enableMaps !== false;

  return config;
}

