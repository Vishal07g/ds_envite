import React from 'react';

/**
 * Multi-layer Cinematic Wedding Environment
 * Recreates the luxury visual atmosphere of the master reference image:
 * - Sunset sky & distant palace silhouette
 * - Grand classical decorative archway with ornate filigree
 * - Cascading white and blush rose floral arrangements along edges
 * - Hanging brass candle lanterns with warm ambient glow
 * - Reflective marble floor with warm ambient depth
 * - Drifting romantic rose petals
 */
export default function CinematicLandingBackground({ theme, className = "" }) {
  const bg = theme?.background || {};
  const colors = theme?.colors || {};
  const dec = theme?.decorations || {};
  const eff = theme?.effects || {};

  const primaryBg = colors.primaryBg || "#F6E9E5";
  const secondaryBg = colors.secondaryBg || "#EAD8D5";
  const champagneGold = colors.champagneGold || "#C7A36B";
  const blushPink = colors.blushPink || "#E7BDBD";

  return (
    <div 
      className={`fixed inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
      style={{
        backgroundColor: primaryBg,
        filter: `blur(${bg.blur || 0}px) brightness(${bg.brightness !== undefined ? bg.brightness : 1.0}) contrast(${bg.contrast !== undefined ? bg.contrast : 1.0}) saturate(${bg.saturation !== undefined ? bg.saturation : 1.0})`
      }}
    >
      {/* 1. Base Atmospheric Sunset Sky Gradient */}
      <div 
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: `radial-gradient(ellipse 90% 70% at 50% 30%, #FFF5ED 0%, ${primaryBg} 45%, ${secondaryBg} 85%, #E5CCC7 100%)`,
          opacity: 0.95
        }}
      />

      {/* Optional Custom Background Image with User Settings */}
      {bg.bgImage && (
        <div 
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundImage: `url("${bg.bgImage}")`,
            backgroundPosition: bg.bgPosition || 'center center',
            backgroundSize: bg.bgSize || 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: bg.overlayOpacity !== undefined ? 1 - bg.overlayOpacity : 0.85
          }}
        />
      )}

      {/* 2. Distant Heritage Palace Silhouettes & Soft Atmospheric Mist */}
      <div className="absolute inset-x-0 bottom-32 sm:bottom-44 h-72 sm:h-96 opacity-30 flex items-end justify-center pointer-events-none">
        <svg 
          viewBox="0 0 1600 400" 
          className="w-full h-full object-cover text-[#9E6F68]" 
          preserveAspectRatio="none"
          fill="currentColor"
        >
          {/* Distant Domes & Jharokhas */}
          <path d="M0,400 L0,320 Q80,310 140,290 Q180,240 220,290 Q280,310 360,320 L400,280 Q430,220 460,280 L500,320 Q560,310 640,290 Q700,210 760,290 Q820,310 900,320 L960,270 Q1000,200 1040,270 L1100,320 Q1180,310 1260,280 Q1300,220 1340,280 L1400,320 Q1500,310 1600,320 L1600,400 Z" opacity="0.3" />
          {/* Closer Grand Palace Dome Silhouette */}
          <path d="M480,400 L480,290 Q600,270 700,260 Q760,170 800,140 Q840,170 900,260 Q1000,270 1120,290 L1120,400 Z" opacity="0.25" />
          <path d="M720,260 Q760,190 800,165 Q840,190 880,260 Z" opacity="0.4" />
          {/* Palace Spire Needle */}
          <line x1="800" y1="120" x2="800" y2="165" stroke="currentColor" strokeWidth="3" opacity="0.4" />
        </svg>
      </div>

      {/* 3. Grand Classical Decorative Archway */}
      {dec.showArch !== false && (
        <div 
          className="absolute inset-0 flex items-start justify-center transition-opacity duration-700 pointer-events-none"
          style={{ opacity: dec.archOpacity !== undefined ? dec.archOpacity : 0.95 }}
        >
          <svg 
            viewBox="0 0 1600 1000" 
            className="w-full h-full object-cover" 
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="archMoldingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="35%" stopColor={champagneGold} stopOpacity="0.35" />
                <stop offset="70%" stopColor="#EAD8D5" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="goldFiligreeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E8C988" />
                <stop offset="50%" stopColor={champagneGold} />
                <stop offset="100%" stopColor="#9C753A" />
              </linearGradient>
              <filter id="archDropShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#5A3A35" floodOpacity="0.12" />
              </filter>
            </defs>

            {/* Left Column / Pillar */}
            <g filter="url(#archDropShadow)">
              <rect x="20" y="0" width="130" height="1000" fill="url(#archMoldingGrad)" />
              <rect x="35" y="0" width="15" height="1000" fill="#FFFFFF" opacity="0.6" />
              <rect x="120" y="0" width="15" height="1000" fill={champagneGold} opacity="0.25" />
              {/* Column Fluting */}
              <line x1="65" y1="120" x2="65" y2="880" stroke="#FFF7EF" strokeWidth="4" opacity="0.8" />
              <line x1="85" y1="120" x2="85" y2="880" stroke="#FFF7EF" strokeWidth="4" opacity="0.8" />
              <line x1="105" y1="120" x2="105" y2="880" stroke="#FFF7EF" strokeWidth="4" opacity="0.8" />
            </g>

            {/* Right Column / Pillar */}
            <g filter="url(#archDropShadow)">
              <rect x="1450" y="0" width="130" height="1000" fill="url(#archMoldingGrad)" />
              <rect x="1465" y="0" width="15" height="1000" fill="#FFFFFF" opacity="0.6" />
              <rect x="1550" y="0" width="15" height="1000" fill={champagneGold} opacity="0.25" />
              {/* Column Fluting */}
              <line x1="1495" y1="120" x2="1495" y2="880" stroke="#FFF7EF" strokeWidth="4" opacity="0.8" />
              <line x1="1515" y1="120" x2="1515" y2="880" stroke="#FFF7EF" strokeWidth="4" opacity="0.8" />
              <line x1="1535" y1="120" x2="1535" y2="880" stroke="#FFF7EF" strokeWidth="4" opacity="0.8" />
            </g>

            {/* Grand Arch Curve - Outer Band */}
            <path 
              d="M150,900 L150,340 Q800,20 1450,340 L1450,900 L1400,900 L1400,360 Q800,70 200,360 L200,900 Z" 
              fill="url(#archMoldingGrad)"
              filter="url(#archDropShadow)"
            />

            {/* Inner Gilded Arch Trim with Scalloped Details */}
            <path 
              d="M200,360 Q800,70 1400,360" 
              fill="none" 
              stroke="url(#goldFiligreeGrad)" 
              strokeWidth="5" 
              opacity="0.85" 
            />
            <path 
              d="M220,380 Q800,105 1380,380" 
              fill="none" 
              stroke="url(#goldFiligreeGrad)" 
              strokeWidth="1.5" 
              strokeDasharray="8 6" 
              opacity="0.75" 
            />

            {/* Keystone Ornament at the Crown of the Arch */}
            <g transform="translate(800, 48)">
              <polygon points="0,-18 24,-6 18,22 -18,22 -24,-6" fill="url(#goldFiligreeGrad)" />
              <circle cx="0" cy="4" r="5" fill="#FFFFFF" />
              <text x="0" y="7" textAnchor="middle" fill={champagneGold} fontSize="9" fontWeight="bold">✦</text>
            </g>
          </svg>
        </div>
      )}

      {/* 4. Cascading White & Blush Rose Floral Arrangements Along Columns */}
      {dec.showFlorals !== false && (
        <div 
          className="absolute inset-0 pointer-events-none transition-transform duration-700"
          style={{ transform: `scale(${dec.floralsScale || 1.0})` }}
        >
          {/* Left Floral Cluster */}
          <div className="absolute top-12 left-0 sm:left-4 w-48 sm:w-72 lg:w-96 h-[88vh] pointer-events-none opacity-90">
            <svg viewBox="0 0 350 800" className="w-full h-full object-contain">
              <defs>
                <radialGradient id="roseWhiteGrad" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="45%" stopColor="#FFF9F5" />
                  <stop offset="75%" stopColor="#F6DFD9" />
                  <stop offset="100%" stopColor="#D9B2AC" />
                </radialGradient>
                <radialGradient id="roseBlushGrad" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#FFF2EE" />
                  <stop offset="40%" stopColor={blushPink} />
                  <stop offset="85%" stopColor="#C88F91" />
                  <stop offset="100%" stopColor="#965B5E" />
                </radialGradient>
                <linearGradient id="leafGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7E9F85" />
                  <stop offset="60%" stopColor="#55755E" />
                  <stop offset="100%" stopColor="#374F3E" />
                </linearGradient>
              </defs>

              {/* Vine Branches & Leaves */}
              <path d="M50,40 Q90,140 70,260 T90,480 T60,700" fill="none" stroke="url(#leafGreenGrad)" strokeWidth="6" opacity="0.65" />
              {/* Leaves */}
              <ellipse cx="65" cy="90" rx="20" ry="9" transform="rotate(-30 65 90)" fill="url(#leafGreenGrad)" opacity="0.8" />
              <ellipse cx="95" cy="160" rx="24" ry="10" transform="rotate(25 95 160)" fill="url(#leafGreenGrad)" opacity="0.8" />
              <ellipse cx="50" cy="220" rx="22" ry="10" transform="rotate(-40 50 220)" fill="url(#leafGreenGrad)" opacity="0.8" />
              <ellipse cx="110" cy="310" rx="26" ry="11" transform="rotate(35 110 310)" fill="url(#leafGreenGrad)" opacity="0.8" />
              <ellipse cx="55" cy="420" rx="24" ry="10" transform="rotate(-25 55 420)" fill="url(#leafGreenGrad)" opacity="0.8" />
              <ellipse cx="105" cy="540" rx="26" ry="11" transform="rotate(20 105 540)" fill="url(#leafGreenGrad)" opacity="0.8" />
              <ellipse cx="60" cy="660" rx="22" ry="10" transform="rotate(-35 60 660)" fill="url(#leafGreenGrad)" opacity="0.8" />

              {/* Blooming Roses Cluster along left arch */}
              <g transform="translate(70, 70)">
                <circle cx="0" cy="0" r="32" fill="url(#roseWhiteGrad)" />
                <path d="M-15,-6 Q0,-24 15,-6 Q0,12 -15,-6" fill="#F4D3CC" opacity="0.75" />
                <circle cx="0" cy="0" r="14" fill="url(#roseBlushGrad)" />
              </g>
              <g transform="translate(110, 190)">
                <circle cx="0" cy="0" r="38" fill="url(#roseBlushGrad)" />
                <circle cx="0" cy="0" r="16" fill="#FFF2EE" opacity="0.9" />
              </g>
              <g transform="translate(60, 340)">
                <circle cx="0" cy="0" r="44" fill="url(#roseWhiteGrad)" />
                <circle cx="0" cy="0" r="18" fill="url(#roseBlushGrad)" opacity="0.85" />
              </g>
              <g transform="translate(100, 470)">
                <circle cx="0" cy="0" r="36" fill="url(#roseBlushGrad)" />
                <circle cx="0" cy="0" r="14" fill="#FFFFFF" opacity="0.8" />
              </g>
              <g transform="translate(55, 620)">
                <circle cx="0" cy="0" r="40" fill="url(#roseWhiteGrad)" />
                <circle cx="0" cy="0" r="16" fill="url(#roseBlushGrad)" opacity="0.8" />
              </g>
            </svg>
          </div>

          {/* Right Floral Cluster (Mirrored) */}
          <div className="absolute top-12 right-0 sm:right-4 w-48 sm:w-72 lg:w-96 h-[88vh] pointer-events-none opacity-90 scale-x-[-1]">
            <svg viewBox="0 0 350 800" className="w-full h-full object-contain">
              <path d="M50,40 Q90,140 70,260 T90,480 T60,700" fill="none" stroke="url(#leafGreenGrad)" strokeWidth="6" opacity="0.65" />
              <ellipse cx="65" cy="90" rx="20" ry="9" transform="rotate(-30 65 90)" fill="url(#leafGreenGrad)" opacity="0.8" />
              <ellipse cx="95" cy="160" rx="24" ry="10" transform="rotate(25 95 160)" fill="url(#leafGreenGrad)" opacity="0.8" />
              <ellipse cx="50" cy="220" rx="22" ry="10" transform="rotate(-40 50 220)" fill="url(#leafGreenGrad)" opacity="0.8" />
              <ellipse cx="110" cy="310" rx="26" ry="11" transform="rotate(35 110 310)" fill="url(#leafGreenGrad)" opacity="0.8" />
              <ellipse cx="55" cy="420" rx="24" ry="10" transform="rotate(-25 55 420)" fill="url(#leafGreenGrad)" opacity="0.8" />
              <ellipse cx="105" cy="540" rx="26" ry="11" transform="rotate(20 105 540)" fill="url(#leafGreenGrad)" opacity="0.8" />

              <g transform="translate(70, 70)">
                <circle cx="0" cy="0" r="34" fill="url(#roseBlushGrad)" />
                <circle cx="0" cy="0" r="15" fill="#FFFFFF" opacity="0.9" />
              </g>
              <g transform="translate(115, 200)">
                <circle cx="0" cy="0" r="42" fill="url(#roseWhiteGrad)" />
                <circle cx="0" cy="0" r="18" fill="url(#roseBlushGrad)" opacity="0.85" />
              </g>
              <g transform="translate(65, 350)">
                <circle cx="0" cy="0" r="36" fill="url(#roseBlushGrad)" />
                <circle cx="0" cy="0" r="15" fill="#FFF2EE" opacity="0.9" />
              </g>
              <g transform="translate(95, 490)">
                <circle cx="0" cy="0" r="40" fill="url(#roseWhiteGrad)" />
                <circle cx="0" cy="0" r="16" fill="url(#roseBlushGrad)" opacity="0.8" />
              </g>
              <g transform="translate(60, 630)">
                <circle cx="0" cy="0" r="38" fill="url(#roseBlushGrad)" />
                <circle cx="0" cy="0" r="14" fill="#FFFFFF" opacity="0.8" />
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* 5. Hanging Ornate Brass Candle Lanterns */}
      {dec.showLanterns !== false && (
        <>
          {/* Left Lantern */}
          <div className="absolute top-16 sm:top-24 left-16 sm:left-28 lg:left-40 z-10 pointer-events-none animate-sway-subtle">
            <svg width="64" height="150" viewBox="0 0 64 150" className="drop-shadow-xl">
              <line x1="32" y1="0" x2="32" y2="40" stroke={champagneGold} strokeWidth="2.5" />
              <polygon points="32,40 18,52 46,52" fill={champagneGold} />
              <rect x="16" y="52" width="32" height="48" rx="4" fill="none" stroke={champagneGold} strokeWidth="3" />
              {/* Glass Panels */}
              <rect x="20" y="56" width="24" height="40" fill="#FFF9E6" opacity="0.85" />
              {/* Glowing Flame */}
              <circle cx="32" cy="76" r="6" fill="#FFA500" className="animate-pulse" />
              <circle cx="32" cy="76" r="3" fill="#FFFFFF" />
              {/* Bottom Finial */}
              <polygon points="16,100 48,100 32,118" fill={champagneGold} />
              <circle cx="32" cy="124" r="4" fill={champagneGold} />
            </svg>
            {dec.lanternsGlow !== false && (
              <div className="absolute top-16 left-2 w-12 h-12 bg-amber-400/35 rounded-full blur-xl pointer-events-none animate-pulse" />
            )}
          </div>

          {/* Right Lantern */}
          <div className="absolute top-16 sm:top-24 right-16 sm:right-28 lg:right-40 z-10 pointer-events-none animate-sway-subtle-reverse">
            <svg width="64" height="150" viewBox="0 0 64 150" className="drop-shadow-xl">
              <line x1="32" y1="0" x2="32" y2="40" stroke={champagneGold} strokeWidth="2.5" />
              <polygon points="32,40 18,52 46,52" fill={champagneGold} />
              <rect x="16" y="52" width="32" height="48" rx="4" fill="none" stroke={champagneGold} strokeWidth="3" />
              <rect x="20" y="56" width="24" height="40" fill="#FFF9E6" opacity="0.85" />
              <circle cx="32" cy="76" r="6" fill="#FFA500" className="animate-pulse" />
              <circle cx="32" cy="76" r="3" fill="#FFFFFF" />
              <polygon points="16,100 48,100 32,118" fill={champagneGold} />
              <circle cx="32" cy="124" r="4" fill={champagneGold} />
            </svg>
            {dec.lanternsGlow !== false && (
              <div className="absolute top-16 left-2 w-12 h-12 bg-amber-400/35 rounded-full blur-xl pointer-events-none animate-pulse" />
            )}
          </div>
        </>
      )}

      {/* 6. Polished Reflective Marble Floor */}
      <div 
        className="absolute inset-x-0 bottom-0 h-44 sm:h-64 pointer-events-none"
        style={{
          background: `linear-gradient(to top, #FFFFFF 0%, ${secondaryBg} 40%, transparent 100%)`,
          opacity: 0.8
        }}
      >
        {/* Subtle Perspective Marble Tiles */}
        <div 
          className="w-full h-full opacity-20"
          style={{
            backgroundImage: `radial-gradient(ellipse at bottom, ${champagneGold} 1px, transparent 1px)`,
            backgroundSize: '48px 24px'
          }}
        />
      </div>

      {/* 7. Drifting Romantic Rose Petals */}
      {dec.showPetals !== false && eff.floatingAnimation !== false && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="petal-float-1 absolute top-[15%] left-[20%] text-rose-300/60 text-lg">🌸</div>
          <div className="petal-float-2 absolute top-[28%] right-[25%] text-rose-300/50 text-sm">🌸</div>
          <div className="petal-float-3 absolute top-[55%] left-[32%] text-amber-200/50 text-xs">✨</div>
          <div className="petal-float-4 absolute top-[70%] right-[30%] text-rose-200/60 text-base">🌸</div>
          <div className="petal-float-5 absolute top-[40%] right-[15%] text-amber-300/40 text-xs">✦</div>
        </div>
      )}

      {/* 8. Atmospheric Ambient Glow & Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 38%, transparent 50%, rgba(66, 44, 43, ${bg.vignetteIntensity !== undefined ? bg.vignetteIntensity : 0.22}) 100%)`
        }}
      />
    </div>
  );
}

