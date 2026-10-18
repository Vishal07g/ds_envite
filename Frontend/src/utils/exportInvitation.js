// Client-side Printable PDF and High-Res Image Exporter for Wedding Invitations

export function downloadPrintablePdfCard(config = {}, invitationId = null) {
  try {
    sessionStorage.setItem("invitation_print_config", JSON.stringify(config));
  } catch (err) {
    console.warn("Could not save config to sessionStorage:", err);
  }

  const printUrl = invitationId ? `/print/${invitationId}` : `/print`;
  const printWindow = window.open(printUrl, "_blank");
  if (!printWindow) {
    window.location.href = printUrl;
  }
}

export function downloadInvitationImage(config = {}) {
  // Generate HTML5 canvas snapshot download
  const brideName = config.brideName || "Ananya";
  const groomName = config.groomName || "Aarav";

  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext("2d");

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 0, 1600);
  gradient.addColorStop(0, "#0b1329");
  gradient.addColorStop(1, "#1e293b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 1600);

  // Decorative Golden Border
  ctx.strokeStyle = config.accentGold || "#e5b858";
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 40, 1120, 1520);
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, 1080, 1480);

  // Typography
  ctx.textAlign = "center";
  
  // Sacred Symbol
  ctx.fillStyle = config.accentGold || "#e5b858";
  ctx.font = "bold 60px serif";
  ctx.fillText(config.customSacredSymbol || "✦", 600, 250);

  // Subtitle
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("TOGETHER WITH THEIR FAMILIES", 600, 340);

  // Bride Name
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 80px serif";
  ctx.fillText(brideName, 600, 480);

  // Ampersand
  ctx.fillStyle = config.accentGold || "#e5b858";
  ctx.font = "italic 70px serif";
  ctx.fillText("&", 600, 580);

  // Groom Name
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 80px serif";
  ctx.fillText(groomName, 600, 680);

  // Date
  const imgParsedDate = config.weddingDate ? new Date(config.weddingDate) : null;
  const dateStr = (imgParsedDate && !isNaN(imgParsedDate.getTime())) ? imgParsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "November 20, 2026";
  ctx.fillStyle = config.accentGold || "#e5b858";
  ctx.font = "bold 36px sans-serif";
  ctx.fillText(dateStr.toUpperCase(), 600, 850);

  // Venue
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "bold 32px serif";
  ctx.fillText(config.weddingVenue || "The Starlight Cathedral", 600, 950);

  // Watermark footer
  ctx.fillStyle = "#64748b";
  ctx.font = "20px sans-serif";
  ctx.fillText("DS ENVITES PLATFORM", 600, 1500);

  // Trigger Download
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = `Wedding_Invitation_${brideName}_and_${groomName}.png`;
  link.href = dataUrl;
  link.click();
}

/**
 * Downloads a complete, standalone, self-contained interactive wedding invitation website
 * as a single .html file that runs locally or on any server without any login requirement.
 */
export function downloadStandaloneHtmlWebsite(config = {}, invitation = {}) {
  const brideName = config.brideName || "Ananya";
  const groomName = config.groomName || "Aarav";
  const primaryColor = config.primaryColor || "#0b1329";
  const accentGold = config.accentGold || "#e5b858";
  const lightBgColor = config.lightBgColor || "#fffaf0";
  const sacredVerse = config.customSacredVerse || "“Together with their families, invite you to share in the joy of their marriage.”";
  const sacredSymbol = config.customSacredSymbol || "✦";
  const weddingDateStr = config.weddingDate ? config.weddingDate.slice(0, 10) : "2026-11-20";
  const weddingTimeStr = config.weddingDate && config.weddingDate.includes("T") ? config.weddingDate.split("T")[1].slice(0, 5) : "16:00";
  const venueTitle = config.weddingVenue || "The Starlight Cathedral";
  const venueAddress = config.venueAddress || "100 Seraphim Way, Glass Valley, CA";
  const venueMapUrl = config.venueMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueTitle + " " + venueAddress)}`;
  
  const initials = config.envelopeInitials || `${brideName.charAt(0)} & ${groomName.charAt(0)}`;
  const envelopeBg = config.envelopeBgColor || primaryColor;
  const envelopeSeal = config.envelopeSealColor || accentGold;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brideName} & ${groomName} | Wedding Invitation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&family=Great+Vibes&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <style>
    :root {
      --primary: ${primaryColor};
      --gold: ${accentGold};
      --light-bg: ${lightBgColor};
    }
    body {
      background-color: ${primaryColor};
      color: #faf6f0;
      font-family: 'Montserrat', sans-serif;
      overflow-x: hidden;
    }
    .font-cinzel { font-family: 'Cinzel', serif; }
    .font-serif { font-family: 'Playfair Display', serif; }
    .font-cursive { font-family: 'Great Vibes', cursive; }
    .gold-glow {
      text-shadow: 0 0 16px ${accentGold}88;
    }
    .gold-border {
      border-color: ${accentGold};
    }
    .gold-box {
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
      backdrop-filter: blur(8px);
      border: 1px solid ${accentGold}33;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: ${accentGold}44;
      border-radius: 4px;
    }
    /* Envelope animations */
    .envelope-flap {
      transform-origin: top;
      transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .envelope-open .envelope-flap {
      transform: rotateX(180deg);
    }
    @keyframes pulse-slow {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    .pulse-glow {
      animation: pulse-slow 3s infinite ease-in-out;
    }
  </style>
</head>
<body class="min-h-screen selection:bg-amber-500/30">

  <!-- ================= ENVELOPE MODAL OVERLAY ================= -->
  <div id="envelope-overlay" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-opacity duration-700">
    <div class="relative w-full max-w-lg aspect-[4/3] rounded-2xl p-8 flex flex-col items-center justify-between shadow-2xl border border-amber-500/40 text-center" style="background: linear-gradient(135deg, ${envelopeBg}, #030712);">
      <div class="text-[10px] tracking-[0.3em] uppercase text-amber-300 font-bold opacity-80 pt-2">
        ${config.envelopeTagline || "The Pleasure of Your Company is Requested"}
      </div>
      
      <!-- Monogram Seal -->
      <div class="flex flex-col items-center space-y-3">
        <div class="w-20 h-20 rounded-full border-2 border-amber-400/60 bg-amber-500/15 flex items-center justify-center shadow-lg shadow-amber-500/20 pulse-glow">
          <span class="font-cinzel text-2xl font-black text-amber-300">${initials}</span>
        </div>
        <div class="space-y-1">
          <p class="font-serif text-xl sm:text-2xl text-slate-100 font-medium">${brideName} & ${groomName}</p>
          <p class="text-xs text-amber-300/80 font-mono tracking-wider">${weddingDateStr}</p>
        </div>
      </div>

      <!-- Open Button -->
      <button 
        onclick="openInvitation()"
        class="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        ✦ Open Invitation ✦
      </button>
    </div>
  </div>

  <!-- ================= MAIN INVITATION CONTAINER ================= -->
  <main class="max-w-4xl mx-auto px-4 py-8 space-y-16">
    
    <!-- HEADER HERO -->
    <header class="text-center space-y-4 pt-6">
      <div class="text-4xl sm:text-5xl text-amber-400 font-serif leading-none">${sacredSymbol}</div>
      <p class="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-amber-300/90 font-bold">
        Under the Auspices of Love and Destiny
      </p>
      
      <div class="py-4 space-y-2">
        <h1 class="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white gold-glow">
          ${brideName}
        </h1>
        <div class="font-cursive text-3xl sm:text-5xl text-amber-300">&amp;</div>
        <h1 class="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white gold-glow">
          ${groomName}
        </h1>
      </div>

      <p class="max-w-md mx-auto text-xs sm:text-sm text-slate-300/90 italic font-serif leading-relaxed px-4">
        ${sacredVerse}
      </p>
    </header>

    <!-- COUNTDOWN TIMER -->
    <section class="max-w-xl mx-auto p-6 rounded-2xl gold-box text-center space-y-3">
      <div class="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-bold">Celebration Countdown</div>
      <div id="countdown-grid" class="grid grid-cols-4 gap-2 sm:gap-4 text-center">
        <div class="p-3 rounded-xl bg-white/5 border border-white/10">
          <span id="days" class="font-cinzel text-xl sm:text-3xl font-bold text-amber-300">00</span>
          <span class="block text-[9px] uppercase tracking-wider text-slate-400 mt-1">Days</span>
        </div>
        <div class="p-3 rounded-xl bg-white/5 border border-white/10">
          <span id="hours" class="font-cinzel text-xl sm:text-3xl font-bold text-amber-300">00</span>
          <span class="block text-[9px] uppercase tracking-wider text-slate-400 mt-1">Hours</span>
        </div>
        <div class="p-3 rounded-xl bg-white/5 border border-white/10">
          <span id="minutes" class="font-cinzel text-xl sm:text-3xl font-bold text-amber-300">00</span>
          <span class="block text-[9px] uppercase tracking-wider text-slate-400 mt-1">Mins</span>
        </div>
        <div class="p-3 rounded-xl bg-white/5 border border-white/10">
          <span id="seconds" class="font-cinzel text-xl sm:text-3xl font-bold text-amber-300">00</span>
          <span class="block text-[9px] uppercase tracking-wider text-slate-400 mt-1">Secs</span>
        </div>
      </div>
    </section>

    <!-- SCRATCH CARD REVEAL SECTION -->
    <section class="max-w-xl mx-auto rounded-3xl overflow-hidden gold-box p-6 sm:p-8 text-center space-y-4">
      <div class="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-bold">Interactive Scratch Card</div>
      <p class="text-xs text-slate-300">Scratch the gold card below using your finger or mouse to unveil the secret message!</p>
      
      <div class="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden border border-amber-500/40 bg-gradient-to-br from-slate-900 to-black flex items-center justify-center p-6 text-center select-none shadow-inner">
        <!-- Secret Revealed Content -->
        <div class="space-y-3 z-0">
          <div class="text-4xl">💍</div>
          <h3 class="font-serif text-xl sm:text-2xl font-bold text-amber-300">Save Our Date</h3>
          <p class="text-sm font-semibold text-slate-100">${weddingDateStr}</p>
          <p class="text-xs text-slate-300">${venueTitle}</p>
          <p class="text-[11px] text-amber-400/90 italic">"We cannot wait to celebrate with you!"</p>
        </div>

        <!-- Scratch Canvas Overlay -->
        <canvas id="scratch-canvas" class="absolute inset-0 w-full h-full cursor-crosshair z-10 transition-opacity duration-500"></canvas>
      </div>

      <p id="scratch-instruction" class="text-[10px] text-amber-300/80 font-mono">✦ Scratch above (0% revealed) ✦</p>
    </section>

    <!-- WEDDING CEREMONY TIMELINE -->
    ${config.showTimelineSection !== false ? `
    <section class="max-w-4xl mx-auto rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden" style="background: rgba(255,255,255,0.06); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(205,164,82,0.3); box-shadow: 0 10px 30px -5px rgba(0,0,0,0.3);">
      <div class="text-center space-y-1">
        <h2 class="font-serif text-2xl sm:text-3xl font-bold text-amber-300">${config.timelineHeading || "Wedding Ceremony"}</h2>
        <p class="font-cursive text-3xl sm:text-4xl text-amber-400 -translate-y-1">${config.timelineSubtitle || "Timeline"}</p>
        <div class="flex items-center justify-center space-x-2 pt-1 opacity-80">
          <span class="w-12 h-[1px] bg-amber-400/50"></span>
          <span class="text-xs text-rose-500">❤</span>
          <span class="w-12 h-[1px] bg-amber-400/50"></span>
        </div>
      </div>

      <div class="relative py-2 space-y-3.5">
        <!-- Central Line -->
        <div class="absolute top-2 bottom-2 left-4 md:left-1/2 -translate-x-1/2 w-[1.5px] bg-amber-500/60 rounded-full"></div>

        ${((Array.isArray(config.ceremonies) && config.ceremonies.length > 0) ? config.ceremonies : [
          { title: "Haldi Ceremony", date: "2026-11-18", time: "10:00 AM", venueName: "Courtyard Lawn", description: "Joyful turmeric ceremony" },
          { title: "Mehandi Ceremony", date: "2026-11-18", time: "04:00 PM", venueName: "Rosewood Pavilion", description: "Intricate henna rituals" },
          { title: "Sangeet Night", date: "2026-11-19", time: "07:00 PM", venueName: "Grand Ballroom Lawn", description: "Music and dancing celebration" },
          { title: "Wedding Ceremony", date: "2026-11-20", time: "04:00 PM", venueName: "Royal Mandap", description: "Sacred vows & phere ceremony" },
          { title: "Reception", date: "2026-11-21", time: "07:30 PM", venueName: "Gilded Glass Conservatory", description: "Grand dinner celebration" }
        ]).filter(c => c.visible !== false).map((c, i) => {
          const isHeaderOnLeft = i % 2 === 0;
          const headerHtml = (align) => `
            <div class="p-2.5 flex items-center space-x-3" style="${align === 'right' ? 'justify-content: flex-end; text-align: right;' : 'justify-content: flex-start; text-align: left;'}">
              ${align === 'right' ? `
                <div class="min-w-0 flex-grow">
                  <h3 class="font-serif text-lg sm:text-xl font-bold text-amber-200 leading-tight">${c.title}</h3>
                </div>
                <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg shadow-sm" style="background: rgba(255,255,255,0.12)">✨</div>
              ` : `
                <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg shadow-sm" style="background: rgba(255,255,255,0.12)">✨</div>
                <div class="min-w-0 flex-grow">
                  <h3 class="font-serif text-lg sm:text-xl font-bold text-amber-200 leading-tight">${c.title}</h3>
                </div>
              `}
            </div>
          `;
          const detailsHtml = (align) => `
            <div class="p-3 sm:p-3.5 rounded-2xl flex flex-col justify-center space-y-1" style="background: rgba(255,255,255,0.08); backdrop-filter: blur(12px); border: 1px solid rgba(205,164,82,0.3); ${align === 'right' ? 'text-align: right;' : 'text-align: left;'}">
              <p class="text-[11px] text-amber-300 font-semibold">📅 ${c.date || "Day, Date"}${c.time && c.showTime !== false ? ' • ' + c.time : ''}</p>
              ${c.venueName ? `<p class="text-[11px] font-semibold text-amber-400/90">📍 ${c.venueName}</p>` : ''}
              ${c.description ? `<p class="text-[11px] text-slate-300 opacity-85 line-clamp-2">${c.description}</p>` : ''}
            </div>
          `;

          return `
          <div class="relative flex flex-col md:flex-row items-center w-full">
            <!-- Node -->
            <div class="absolute left-4 md:left-1/2 -translate-x-1/2 top-4 md:top-1/2 md:-translate-y-1/2 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-amber-400 z-10 flex items-center justify-center">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400 block"></span>
            </div>
            <!-- Desktop Two-Sided Alternating Grid -->
            <div class="hidden md:grid md:grid-cols-2 md:gap-8 w-full items-center">
              ${isHeaderOnLeft ? `
                ${headerHtml('right')}
                ${detailsHtml('left')}
              ` : `
                ${detailsHtml('right')}
                ${headerHtml('left')}
              `}
            </div>
            <!-- Mobile Row -->
            <div class="md:hidden w-full pl-9">
              <div class="space-y-1">
                <div class="flex items-center space-x-2 py-0.5">
                  <span class="text-lg">✨</span>
                  <h3 class="font-serif text-base font-bold text-amber-200">${c.title}</h3>
                </div>
                <div class="p-3 rounded-2xl space-y-1" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(205,164,82,0.3);">
                  <p class="text-[11px] text-amber-300 font-semibold">📅 ${c.date || "Day, Date"}${c.time && c.showTime !== false ? ' • ' + c.time : ''}</p>
                  ${c.venueName ? `<p class="text-[11px] font-semibold text-amber-400/90">📍 ${c.venueName}</p>` : ''}
                  ${c.description ? `<p class="text-slate-300 opacity-80 text-[11px]">${c.description}</p>` : ''}
                </div>
              </div>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </section>
    ` : ''}

    <!-- CEREMONY & RECEPTION VENUE -->
    <section class="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-6 rounded-2xl gold-box space-y-3 text-center">
        <span class="text-xs text-amber-400 font-bold uppercase tracking-wider block">Holy Matrimony</span>
        <h3 class="font-serif text-lg font-bold text-slate-100">${venueTitle}</h3>
        <p class="text-xs text-slate-300">${weddingDateStr} • ${weddingTimeStr}</p>
        <p class="text-[11px] text-slate-400 leading-relaxed">${venueAddress}</p>
        <a href="${venueMapUrl}" target="_blank" class="inline-block mt-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition">
          📍 Open in Google Maps
        </a>
      </div>

      <div class="p-6 rounded-2xl gold-box space-y-3 text-center">
        <span class="text-xs text-amber-400 font-bold uppercase tracking-wider block">Grand Reception</span>
        <h3 class="font-serif text-lg font-bold text-slate-100">Gilded Conservatory</h3>
        <p class="text-xs text-slate-300">${weddingDateStr} • 19:00 PM</p>
        <p class="text-[11px] text-slate-400 leading-relaxed">Grand Ballroom &amp; Terrace Lawn</p>
        <a href="${venueMapUrl}" target="_blank" class="inline-block mt-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition">
          📍 Open in Google Maps
        </a>
      </div>
    </section>

    <!-- ================= RSVP RESERVATION ================= -->
    <section class="max-w-2xl mx-auto rounded-3xl gold-box p-6 sm:p-8 space-y-6">
      <div class="text-center space-y-1">
        <span class="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-bold block">Will You Be There?</span>
        <h2 class="font-serif text-2xl sm:text-3xl font-light text-slate-100">RSVP Reservation</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- RSVP Form -->
        <form id="rsvp-form" onsubmit="handleRsvp(event)" class="space-y-4">
          <div id="rsvp-alert" class="hidden p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium">
            ✓ Existing RSVP response found. You can adjust your guest count below and update your response.
          </div>
          <div>
            <label class="text-[9px] uppercase tracking-wider font-bold block mb-1 opacity-80">Full Name *</label>
            <input type="text" id="rsvp-name" required placeholder="Your name" class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-amber-400" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[9px] uppercase tracking-wider font-bold block mb-1 opacity-80">Attending</label>
              <select id="rsvp-attending" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs focus:outline-none focus:border-amber-400 text-slate-200">
                <option value="yes">Joyfully Attending</option>
                <option value="maybe">Maybe</option>
                <option value="no">Regretfully Decline</option>
              </select>
            </div>
            <div>
              <label class="text-[9px] uppercase tracking-wider font-bold block mb-1 opacity-80">Guests (Count)</label>
              <input type="number" id="rsvp-count" min="1" max="25" value="1" class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-amber-400" />
            </div>
          </div>
          <div>
            <label class="text-[9px] uppercase tracking-wider font-bold block mb-1 opacity-80">Personal Note</label>
            <textarea id="rsvp-note" rows="2" placeholder="A note for the couple..." class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-amber-400 resize-none"></textarea>
          </div>
          <button type="submit" id="rsvp-submit-btn" class="w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider transition cursor-pointer">
            Confirm RSVP
          </button>
        </form>

        <!-- RSVP Responses List -->
        <div class="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
          <h4 class="text-xs font-semibold text-amber-300 flex items-center justify-between">
            <span>Guest Responses</span>
            <span id="rsvp-total-badge" class="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px]">0</span>
          </h4>
          <div id="rsvp-list" class="space-y-2"></div>
        </div>
      </div>
    </section>

    <!-- ================= BLESSINGS & WISHES ================= -->
    <section class="max-w-2xl mx-auto rounded-3xl gold-box p-6 sm:p-8 space-y-6">
      <div class="text-center space-y-1">
        <span class="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-bold block">Share Your Love</span>
        <h2 class="font-serif text-2xl sm:text-3xl font-light text-slate-100">Blessings &amp; Wishes</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Wish Form -->
        <form id="wish-form" onsubmit="handleWish(event)" class="space-y-4">
          <div>
            <label class="text-[9px] uppercase tracking-wider font-bold block mb-1 opacity-80">Your Name *</label>
            <input type="text" id="wish-sender" oninput="checkSenderBlessing()" required placeholder="Your name" class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-amber-400" />
          </div>

          <div id="wish-duplicate-alert" class="hidden p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-1">
            <p class="font-semibold text-amber-300">🧡 Blessing already posted for this name</p>
            <p id="wish-prev-msg" class="italic text-[11px] text-slate-200"></p>
            <p class="text-[10px] text-amber-400/90 pt-0.5">Only one blessing is permitted per guest name. Enter a different name to post for someone else.</p>
          </div>

          <div>
            <label class="text-[9px] uppercase tracking-wider font-bold block mb-1 opacity-80">Your Blessing *</label>
            <textarea id="wish-message" rows="3" required placeholder="Write a heartfelt blessing for the couple..." class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-amber-400 resize-none"></textarea>
          </div>

          <button type="submit" id="wish-submit-btn" class="w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider transition cursor-pointer">
            Send Blessings
          </button>
        </form>

        <!-- Blessings Wall -->
        <div class="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
          <h4 class="text-xs font-semibold text-amber-300 flex items-center justify-between">
            <span>Blessings Posted</span>
            <span id="wish-total-badge" class="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px]">0</span>
          </h4>
          <div id="wish-list" class="space-y-2"></div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="text-center py-10 border-t border-white/10 space-y-2 opacity-70">
      <p class="font-cinzel text-xs tracking-widest text-amber-300">${brideName} &amp; ${groomName}</p>
      <p class="text-[10px] text-slate-400">Created with DS Envite • Luxury Interactive Wedding Invitations</p>
    </footer>

  </main>

  <!-- ================= LOGIC SCRIPT ================= -->
  <script>
    const TARGET_DATE = new Date("${weddingDateStr}T${weddingTimeStr}:00");

    // 1. Envelope Open
    function openInvitation() {
      const overlay = document.getElementById("envelope-overlay");
      overlay.style.opacity = "0";
      setTimeout(() => overlay.remove(), 700);
      try {
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    }

    // 2. Countdown Timer
    function updateCountdown() {
      const now = new Date();
      const diff = TARGET_DATE - now;
      if (diff <= 0) {
        document.getElementById("days").innerText = "00";
        document.getElementById("hours").innerText = "00";
        document.getElementById("minutes").innerText = "00";
        document.getElementById("seconds").innerText = "00";
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      document.getElementById("days").innerText = String(days).padStart(2, '0');
      document.getElementById("hours").innerText = String(hours).padStart(2, '0');
      document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
      document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // 3. Scratch Card Canvas
    const canvas = document.getElementById("scratch-canvas");
    const ctx = canvas.getContext("2d");
    let isDrawing = false;
    let isFinished = false;

    function initScratch() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "${accentGold}");
      grad.addColorStop(0.5, "#d4af37");
      grad.addColorStop(1, "#8a6d1c");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px Cinzel, serif";
      ctx.textAlign = "center";
      ctx.fillText("✦ SCRATCH HERE ✦", canvas.width / 2, canvas.height / 2);
    }
    window.addEventListener("load", initScratch);
    window.addEventListener("resize", initScratch);

    function scratch(e) {
      if (!isDrawing || isFinished) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.fill();

      checkProgress();
    }

    function checkProgress() {
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;
        let trans = 0;
        for (let i = 0; i < pixels.length; i += 16) {
          if (pixels[i + 3] === 0) trans++;
        }
        const pct = Math.round((trans / (pixels.length / 16)) * 100);
        document.getElementById("scratch-instruction").innerText = "✦ Scratched " + pct + "% ✦";
        if (pct > 35 && !isFinished) {
          isFinished = true;
          canvas.style.opacity = "0";
          setTimeout(() => canvas.style.pointerEvents = "none", 500);
          document.getElementById("scratch-instruction").innerText = "✨ Secret Card Unveiled! ✨";
          confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
        }
      } catch (e) {}
    }

    canvas.addEventListener("mousedown", () => isDrawing = true);
    window.addEventListener("mouseup", () => isDrawing = false);
    canvas.addEventListener("mousemove", scratch);

    canvas.addEventListener("touchstart", (e) => { isDrawing = true; scratch(e); });
    window.addEventListener("touchend", () => isDrawing = false);
    canvas.addEventListener("touchmove", (e) => { e.preventDefault(); scratch(e); });

    // 4. RSVP Store & Handling
    let rsvps = JSON.parse(localStorage.getItem("offline_invite_rsvps") || "[]");
    function renderRsvps() {
      const list = document.getElementById("rsvp-list");
      document.getElementById("rsvp-total-badge").innerText = rsvps.length;
      if (rsvps.length === 0) {
        list.innerHTML = '<p class="text-[10px] opacity-40 italic text-center py-4">No RSVP responses yet.</p>';
        return;
      }
      list.innerHTML = rsvps.map(r => \`
        <div class="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs flex justify-between items-center">
          <div>
            <span class="font-bold">\${r.name}</span>
            <span class="text-[10px] text-slate-400 ml-1">(\${r.count} \${r.count > 1 ? 'guests' : 'guest'})</span>
            \${r.note ? \`<p class="text-[10px] text-slate-300 italic mt-0.5">"\${r.note}"</p>\` : ''}
          </div>
          <span class="text-[9px] px-2 py-0.5 rounded-full uppercase font-bold \${r.attending === 'yes' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">
            \${r.attending}
          </span>
        </div>
      \`).join("");
    }

    function handleRsvp(e) {
      e.preventDefault();
      const name = document.getElementById("rsvp-name").value.trim();
      const attending = document.getElementById("rsvp-attending").value;
      const count = parseInt(document.getElementById("rsvp-count").value) || 1;
      const note = document.getElementById("rsvp-note").value.trim();
      if (!name) return;

      const idx = rsvps.findIndex(r => r.name.toLowerCase() === name.toLowerCase());
      if (idx !== -1) {
        rsvps[idx] = { name, attending, count, note, date: new Date().toLocaleDateString() };
      } else {
        rsvps.unshift({ name, attending, count, note, date: new Date().toLocaleDateString() });
      }
      localStorage.setItem("offline_invite_rsvps", JSON.stringify(rsvps));
      renderRsvps();
      alert("Thank you! Your RSVP has been confirmed with guest count: " + count);
    }
    renderRsvps();

    // 5. Blessings Wall & Duplicate Prevention
    let wishes = JSON.parse(localStorage.getItem("offline_invite_wishes") || "[]");
    function renderWishes() {
      const list = document.getElementById("wish-list");
      document.getElementById("wish-total-badge").innerText = wishes.length;
      if (wishes.length === 0) {
        list.innerHTML = '<p class="text-[10px] opacity-40 italic text-center py-4">No blessings posted yet.</p>';
        return;
      }
      list.innerHTML = wishes.map(w => \`
        <div class="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1">
          <div class="flex justify-between items-center">
            <span class="font-bold text-slate-200">\${w.sender}</span>
            <span class="text-[9px] text-slate-400">\${w.date || 'Just now'}</span>
          </div>
          <p class="text-[11px] text-amber-200/90 italic">"\${w.message}"</p>
        </div>
      \`).join("");
    }

    function checkSenderBlessing() {
      const sender = document.getElementById("wish-sender").value.trim().toLowerCase();
      const match = wishes.find(w => w.sender.toLowerCase() === sender);
      const alertBox = document.getElementById("wish-duplicate-alert");
      const btn = document.getElementById("wish-submit-btn");
      const msgArea = document.getElementById("wish-message");

      if (match) {
        alertBox.classList.remove("hidden");
        document.getElementById("wish-prev-msg").innerText = '"' + match.message + '"';
        btn.disabled = true;
        btn.innerText = "Blessing Already Posted for this Name";
        btn.classList.add("opacity-50", "cursor-not-allowed");
        msgArea.disabled = true;
      } else {
        alertBox.classList.add("hidden");
        btn.disabled = false;
        btn.innerText = "Send Blessings";
        btn.classList.remove("opacity-50", "cursor-not-allowed");
        msgArea.disabled = false;
      }
    }

    function handleWish(e) {
      e.preventDefault();
      const sender = document.getElementById("wish-sender").value.trim();
      const message = document.getElementById("wish-message").value.trim();
      if (!sender || !message) return;

      if (wishes.some(w => w.sender.toLowerCase() === sender.toLowerCase())) {
        alert("A blessing has already been posted by " + sender);
        return;
      }

      wishes.unshift({
        sender,
        message,
        date: new Date().toLocaleDateString('en-GB') + " " + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      });
      localStorage.setItem("offline_invite_wishes", JSON.stringify(wishes));
      renderWishes();

      document.getElementById("wish-sender").value = "";
      document.getElementById("wish-message").value = "";
      checkSenderBlessing();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      alert("Thank you! Your blessing has been posted.");
    }
    renderWishes();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = `Wedding_Invitation_${brideName}_and_${groomName}.html`;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
