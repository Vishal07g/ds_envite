import React from 'react';
import { SvgSparkles } from './icons';
import { DEFAULT_VISIBILITY, DEFAULT_TRANSPARENCY } from '../data/landingThemeDefaults';

/**
 * Cinematic Hero Banner Component
 * Recreates the luxury visual composition of the master reference image:
 * - Editorial split hero composition (Left content ~52%, Right artwork ~46%)
 * - Full visibility toggles (hide/unhide unwanted elements)
 * - Transparency & backdrop blur controls under text layout borders
 * - Perfectly responsive for desktop, tablet, and mobile with zero stretch or squeeze
 */
export default function CinematicHeroBanner({
  theme,
  onDraftClick,
  onExploreClick
}) {
  const colors = theme?.colors || {};
  const vis = { ...DEFAULT_VISIBILITY, ...(theme?.visibility || {}) };
  const trans = { ...DEFAULT_TRANSPARENCY, ...(theme?.transparency || {}) };

  const warmIvory = colors.warmIvory || "#FFF7EF";
  const softWhite = colors.softWhite || "#FFFDFC";
  const deepRosewood = colors.deepRosewood || "#713D3B";
  const darkBrown = colors.darkBrown || "#422C2B";
  const champagneGold = colors.champagneGold || "#C7A36B";
  const blushPink = colors.blushPink || "#E7BDBD";

  const heroBgOpacity = trans.heroBgOpacity !== undefined ? trans.heroBgOpacity : 0.92;
  const heroBorderOpacity = trans.heroBorderOpacity !== undefined ? trans.heroBorderOpacity : 0.7;
  const heroBlur = trans.heroBlur !== undefined ? trans.heroBlur : 16;

  const textCardBgOpacity = trans.textCardBgOpacity !== undefined ? trans.textCardBgOpacity : 0.85;
  const textCardBorderOpacity = trans.textCardBorderOpacity !== undefined ? trans.textCardBorderOpacity : 0.6;
  const textCardBlur = trans.textCardBlur !== undefined ? trans.textCardBlur : 12;

  // Convert hex color to rgba helper
  const hexToRgba = (hex, alpha) => {
    if (!hex) return `rgba(255, 255, 255, ${alpha})`;
    const clean = hex.replace('#', '');
    if (clean.length === 3) {
      const r = parseInt(clean[0] + clean[0], 16);
      const g = parseInt(clean[1] + clean[1], 16);
      const b = parseInt(clean[2] + clean[2], 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (clean.length === 6) {
      const r = parseInt(clean.substring(0, 2), 16);
      const g = parseInt(clean.substring(2, 4), 16);
      const b = parseInt(clean.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgba(255, 255, 255, ${alpha})`;
  };

  return (
    <div className="w-full">
      {/* ====================================================
          FULL-WIDTH CINEMATIC HERO COMPOSITION
          ==================================================== */}
      <section 
        className="relative w-full rounded-3xl lg:rounded-[36px] shadow-2xl p-6 sm:p-10 lg:p-14 transition-all overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${hexToRgba(softWhite, heroBgOpacity)} 0%, ${hexToRgba(warmIvory, heroBgOpacity)} 50%, ${hexToRgba("#FAF0E6", heroBgOpacity)} 100%)`,
          borderColor: hexToRgba("#E9DCCB", heroBorderOpacity),
          borderWidth: heroBorderOpacity > 0 ? "1px" : "0px",
          borderStyle: "solid",
          backdropFilter: heroBlur > 0 ? `blur(${heroBlur}px)` : "none",
          WebkitBackdropFilter: heroBlur > 0 ? `blur(${heroBlur}px)` : "none",
          boxShadow: heroBgOpacity > 0.3 ? "0 24px 60px -15px rgba(113, 61, 59, 0.12)" : "none"
        }}
      >
        {/* Soft Ambient Radial Accents */}
        <div 
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${blushPink}30` }}
        />
        <div 
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${champagneGold}20` }}
        />

        {/* Corner Gilded Filigree Accents */}
        <div className="absolute top-5 left-5 pointer-events-none text-2xl select-none" style={{ color: champagneGold, opacity: 0.35 }}>
          ✤
        </div>
        <div className="absolute top-5 right-5 pointer-events-none text-2xl select-none" style={{ color: champagneGold, opacity: 0.35 }}>
          ✤
        </div>

        {/* 2-Column Responsive Layout (Left 52% / Right 46%) */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
          
          {/* LEFT COLUMN: Inspiring Copy, Interactive Feature Cards & CTAs */}
          <div className="w-full lg:w-7/12 text-left space-y-6">
            
            {/* Top Micro-Pill */}
            {vis.showMicroPill !== false && (
              <div 
                className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border text-[11px] font-extrabold uppercase tracking-widest shadow-xs transition-transform hover:scale-102"
                style={{
                  backgroundColor: hexToRgba(warmIvory, textCardBgOpacity),
                  borderColor: hexToRgba(champagneGold, textCardBorderOpacity),
                  color: deepRosewood,
                  backdropFilter: textCardBlur > 0 ? `blur(${textCardBlur}px)` : "none"
                }}
              >
                <span className="text-amber-600 animate-pulse">✨</span>
                <span>Next-Gen Interactive Digital Invitations</span>
              </div>
            )}

            {/* Main Headline with Cinzel Typography & Warm Espresso/Gold Gradient */}
            {vis.showHeadline !== false && (
              <h1 
                className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-black tracking-tight leading-[1.18]"
                style={{ color: darkBrown }}
              >
                Craft Unforgettable Moments with{' '}
                <span 
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, #9C753A, ${champagneGold}, #D8B273)`
                  }}
                >
                  Interactive Luxury
                </span>
              </h1>
            )}

            {/* High-Contrast Crystal Clear Subtitle */}
            {vis.showSubtitle !== false && (
              <p 
                className="text-sm sm:text-base font-medium leading-relaxed max-w-xl"
                style={{ color: "#5C4A42" }}
              >
                Delight your guests with animated wax-sealed envelopes, interactive gold scratch reveals, curated background melodies, HD memories galleries, and instant WhatsApp RSVPs — all without downloading any apps.
              </p>
            )}

            {/* 4 Interactive Feature Cards (2x2 Grid, 1 column on mobile) */}
            {vis.showFeatureCards !== false && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 max-w-lg">
                {[
                  { icon: "💌", title: "Wax-Seal Unboxing", desc: "Realistic envelope ritual" },
                  { icon: "🪙", title: "Gold Scratch Reveal", desc: "Interactive surprise date" },
                  { icon: "🎵", title: "Background Melodies", desc: "Curated music vibes" },
                  { icon: "📱", title: "Instant WhatsApp RSVP", desc: "One-click guest tracker" }
                ].map((feat, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center space-x-3 p-3 rounded-2xl border shadow-xs hover:shadow-md transition-all duration-300"
                    style={{
                      backgroundColor: hexToRgba(softWhite, textCardBgOpacity),
                      borderColor: hexToRgba("#E9DCCB", textCardBorderOpacity),
                      backdropFilter: textCardBlur > 0 ? `blur(${textCardBlur}px)` : "none"
                    }}
                  >
                    <span 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-xs border"
                      style={{
                        backgroundColor: hexToRgba(warmIvory, 0.9),
                        borderColor: hexToRgba(champagneGold, 0.4)
                      }}
                    >
                      {feat.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: darkBrown }}>{feat.title}</p>
                      <p className="text-[10px] truncate" style={{ color: "#7A6458" }}>{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Action CTAs */}
            {vis.showCtaButtons !== false && (
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={onDraftClick}
                  className="px-7 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  style={{
                    background: `linear-gradient(to right, #D6AD61, ${champagneGold}, #B58A43)`,
                    color: "#382416"
                  }}
                >
                  <SvgSparkles className="w-4 h-4 text-white shrink-0" />
                  <span>+ Draft Your Invitation</span>
                </button>

                <button
                  type="button"
                  onClick={onExploreClick}
                  className="px-6 py-3.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-xs hover:shadow-md flex items-center space-x-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  style={{
                    backgroundColor: hexToRgba(softWhite, textCardBgOpacity),
                    borderColor: hexToRgba("#E9DCCB", textCardBorderOpacity),
                    color: darkBrown,
                    backdropFilter: textCardBlur > 0 ? `blur(${textCardBlur}px)` : "none"
                  }}
                >
                  <span>Browse Design Presets</span>
                  <span className="text-sm">↓</span>
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Realistic Luxury Invitation Card & Wax Seal Graphic */}
          {vis.showRightArtwork !== false && (
            <div className="w-full lg:w-5/12 flex items-center justify-center pt-4 lg:pt-0">
              <div className="relative w-full max-w-[340px] sm:max-w-[390px] perspective-1000">
                
                {/* Floating Live Badge Top */}
                <div 
                  className="absolute -top-3.5 -right-2 z-30 px-3.5 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5 border backdrop-blur-md animate-bounce"
                  style={{
                    backgroundColor: `${softWhite}F2`,
                    borderColor: `${champagneGold}60`
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: darkBrown }}>
                    📱 100% Mobile Ready
                  </span>
                </div>

                {/* Realistic Luxury Envelope Body */}
                <div 
                  className="relative rounded-2xl border-2 shadow-2xl p-5 overflow-hidden transition-transform duration-500 hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(to bottom, #FAF1E6 0%, #F3E5D4 50%, #EBD5BF 100%)",
                    borderColor: champagneGold,
                    boxShadow: "0 25px 50px -12px rgba(66, 44, 43, 0.25)"
                  }}
                >
                  {/* Envelope Flap Triangular Accent */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#E7D0B7] to-transparent opacity-40 pointer-events-none"
                    style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                  />

                  {/* Golden Monogram Wax Seal Stamp Centered */}
                  {vis.showWaxSeal !== false && (
                    <div 
                      className="absolute top-8 left-1/2 -translate-x-1/2 z-20 w-14 h-14 rounded-full border-2 shadow-xl flex flex-col items-center justify-center text-white ring-4 ring-[#9B2226]/30 cursor-pointer transition-transform hover:scale-105"
                      style={{
                        background: "radial-gradient(circle at 35% 35%, #BB3E03 0%, #9B2226 65%, #6E1518 100%)",
                        borderColor: "#FEEA8C"
                      }}
                    >
                      <span className="text-[10px] font-cinzel font-black tracking-widest text-[#FFF1BD]">DS</span>
                      <span className="text-[8px] text-[#FFE89E] opacity-90 leading-none">✦</span>
                    </div>
                  )}

                  {/* Emerging Invitation Card Inside Envelope */}
                  <div 
                    className="relative mt-8 rounded-xl border shadow-inner p-4 text-center space-y-3"
                    style={{
                      backgroundColor: softWhite,
                      borderColor: "#E9DCCB"
                    }}
                  >
                    {/* Card Filigree Top Header */}
                    <div className="flex items-center justify-center space-x-2" style={{ color: champagneGold }}>
                      <span className="text-xs">✦</span>
                      <span className="text-[8.5px] uppercase font-bold tracking-widest text-[#8C6D58]">
                        A Sacred Matrimonial Union
                      </span>
                      <span className="text-xs">✦</span>
                    </div>

                    {/* Couple Names in Elegant Serif Calligraphy */}
                    <div>
                      <h3 className="text-xl sm:text-2xl font-cinzel font-bold leading-tight" style={{ color: darkBrown }}>
                        Vivaan &amp; Aarohi
                      </h3>
                      <p className="text-[10px] text-[#8C6D58] font-medium mt-0.5">
                        Request the honor of your presence
                      </p>
                    </div>

                    {/* Golden Scratch & Reveal Interactive Simulation Badge */}
                    {vis.showScratchBadge !== false && (
                      <div 
                        className="relative overflow-hidden rounded-xl p-2.5 shadow-md border text-center cursor-pointer group transition-all hover:brightness-105"
                        style={{
                          background: `linear-gradient(to right, #D6AD61 0%, #F3D590 50%, ${champagneGold} 100%)`,
                          borderColor: champagneGold
                        }}
                      >
                        <div className="flex items-center justify-center space-x-1.5 text-[#382416] font-bold text-[11px] uppercase tracking-wider">
                          <span>✨</span>
                          <span>Scratch to Reveal Secret Date</span>
                          <span>✨</span>
                        </div>
                        <div className="text-[9px] text-[#5C3D1E] font-medium opacity-90 mt-0.5">
                          Saturday, December 19, 2026 • 11:30 AM
                        </div>
                      </div>
                    )}

                    {/* Live Music & RSVP Mini Bar */}
                    {vis.showMusicBar !== false && (
                      <div className="flex items-center justify-between text-[9px] font-bold pt-1 border-t border-[#E9DCCB]">
                        <span className="flex items-center space-x-1 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                          <span>🎵 Royal Melody</span>
                        </span>
                        <span className="text-amber-800 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/25">
                          ⚡ RSVP Online
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Floating Bottom Quality / Security Capsule */}
                  {vis.showQualityCapsule !== false && (
                    <div className="mt-3 flex items-center justify-center space-x-2 text-[9.5px] text-[#7A6458] font-semibold">
                      <span>🔒 Watermark-Free HD Quality</span>
                      <span>•</span>
                      <span>⚡ Instant Link Share</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
