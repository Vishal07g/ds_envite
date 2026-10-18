// AI Content & Poem Generator for Wedding Invitations
// Supports Gemini API / Firebase AI Logic with intelligent rich fallbacks

export async function generateWeddingContent({
  contentType = "poem", // "poem" | "story" | "venue" | "whatsapp"
  brideName = "Ananya",
  groomName = "Aarav",
  style = "romantic", // "romantic" | "traditional" | "poetic" | "playful" | "royal"
  religion = "secular",
  details = "",
  guestName = "Guest"
}) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY;

  if (apiKey && apiKey !== "undefined") {
    try {
      const promptText = buildPrompt({ contentType, brideName, groomName, style, religion, details, guestName });
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to smart template generator:", err);
    }
  }

  // Fallback high-quality template generator
  return generateFallbackContent({ contentType, brideName, groomName, style, religion, details, guestName });
}

function buildPrompt({ contentType, brideName, groomName, style, religion, details, guestName }) {
  if (contentType === "poem") {
    return `Write a beautiful, elegant ${style} wedding poem or quote for ${brideName} and ${groomName}. 
    Tone: ${style}. Religious/Cultural tone: ${religion}. 
    Keep it within 4-8 lines. Do not add conversational intro/outro text, output only the poem/quote.`;
  }
  if (contentType === "story") {
    return `Write an elegant and romantic love story summary for ${brideName} and ${groomName}.
    Additional details provided: ${details || "They met, fell in love, and decided to spend forever together."}.
    Keep it engaging, warm, and around 2-3 short paragraphs suitable for a wedding website.`;
  }
  if (contentType === "venue") {
    return `Write a polite and helpful venue & logistics note for wedding guests of ${brideName} and ${groomName}.
    Details: ${details || "Main Ceremony & Evening Reception"}. Include dress code suggestions, parking, and arrival tips.`;
  }
  if (contentType === "whatsapp") {
    return `Write a warm, formal yet personal WhatsApp invitation text for ${brideName} and ${groomName}'s wedding.
    Recipient: ${guestName || "{guestName}"}. Include placeholders like {inviteLink}. Keep it concise with celebratory emojis.`;
  }
  return `Write a short celebratory wedding text for ${brideName} and ${groomName}.`;
}

function generateFallbackContent({ contentType, brideName, groomName, style, religion, details, guestName }) {
  if (contentType === "poem") {
    if (style === "traditional" || religion === "hindu") {
      return `Two souls bound by sacred vows, beneath the starlit sky,\n` +
             `Hand in hand, ${brideName} and ${groomName} begin their sacred tie.\n` +
             `With blessings of elders and love in their heart,\n` +
             `A journey of seven lifetimes begins, never to part.`;
    }
    if (style === "royal") {
      return `Under the golden arches of fate and grace,\n` +
             `${brideName} and ${groomName} find their eternal place.\n` +
             `A union of dynasties, written in royal gold,\n` +
             `The grandest love story waiting to unfold.`;
    }
    if (style === "playful") {
      return `From late-night coffees to stealing each other's food,\n` +
             `${brideName} and ${groomName} found their forever mood!\n` +
             `We're making it official, so dress up and bring your cheer,\n` +
             `To the happiest wedding celebration of the year!`;
    }
    // Romantic / Poetic default
    return `Like rivers flowing to the quiet sea,\n` +
           `${brideName} and ${groomName} were meant to be.\n` +
           `Joined in love, grace, and everlasting light,\n` +
           `We request your presence as we unite.`;
  }

  if (contentType === "story") {
    const extra = details ? ` (${details})` : "";
    return `From a chance encounter that sparked a quiet conversation to endless laughter under moonlit skies, ${brideName} and ${groomName}'s story is a testament to serendipity${extra}.\n\n` +
           `Over years of shared dreams, quiet morning coffees, and unforgettable adventures, their bond grew deeper with each passing day. ` +
           `Now, standing at the doorway of forever, they invite you to celebrate the vows that will bind their hearts eternally.`;
  }

  if (contentType === "venue") {
    return `📍 **Venue & Guest Information**\n\n` +
           `• **Dress Code**: Royal Traditional / Elegant Formal Attire.\n` +
           `• **Arrival**: Guests are kindly requested to arrive 30 minutes prior to the ceremony.\n` +
           `• **Valet & Parking**: Complimentary valet parking available at the main venue gate.\n` +
           `• **Special Note**: ${details || "Please inform us of any dietary preferences during RSVP."}`;
  }

  if (contentType === "whatsapp") {
    const gName = guestName || "{guestName}";
    return `✨ *Warmest Wedding Invitation* ✨\n\n` +
           `Dear ${gName},\n\n` +
           `With great joy and blessings in our hearts, we invite you to join the wedding celebration of *${brideName} & ${groomName}*! 💍\n\n` +
           `📍 *View your personalized invitation & RSVP online here:*\n` +
           `{inviteLink}\n\n` +
           `Your presence will make our special day truly complete. We look forward to celebrating together!\n\n` +
           `With love,\n*${brideName} & ${groomName}* ❤️`;
  }

  return `Celebrating the union of ${brideName} & ${groomName}.`;
}
