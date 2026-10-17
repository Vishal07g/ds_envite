import React, { useMemo } from 'react';

/**
 * Sleek, Semi-Realistic 3D Luxury Metallic Border Frame
 * 
 * Features:
 * 1. 4-Corner Architecture: Corners are fixed-aspect SVGs that NEVER stretch or distort under any screen size.
 * 2. Precision Connecting Rails: Sleek double/triple hairline metallic borders running along the perimeter.
 * 3. 100% Center Transparency: Never overlaps or cuts through any invitation cards or text.
 * 4. Realistic Metallic Depth: Multi-stop linear gradients, bevel highlights, and soft drop shadows.
 * 5. Responsive & Print-Proof: Works in fixed viewport mode, full scroll mode, and PDF print mode.
 */

export default function GlobalBorderFrame({ config = {}, isPrintMode = false }) {
  // If frame is toggled off, render nothing
  if (config.showGlobalBorder === false) return null;

  // Frame settings & defaults
  const scrollMode = config.globalBorderScrollMode || 'fixed';
  const opacity = config.globalBorderOpacity !== undefined ? config.globalBorderOpacity : 1.0;
  const inset = config.globalBorderInset !== undefined ? config.globalBorderInset : 12; // sleek inset in px
  const borderThickness = config.globalBorderWidth || 2; // sleek hairline thickness

  // Determine preset style
  const rawImage = config.globalBorderImage || '/frames/royal_gold_frame.svg';
  const isCustomUploaded = rawImage.startsWith('data:') || (rawImage.startsWith('http') && !rawImage.includes('/frames/'));

  // Preset ID detection
  const presetStyle = useMemo(() => {
    if (config.globalBorderStyle) return config.globalBorderStyle;
    if (rawImage.includes('floral_vintage')) return 'floral-vintage';
    if (rawImage.includes('art_deco')) return 'art-deco';
    if (rawImage.includes('sleek_modern')) return 'sleek-modern';
    return 'royal-gold';
  }, [config.globalBorderStyle, rawImage]);

  // Color theme definition
  const metalTone = config.globalBorderTone || 'yellow-gold';
  const colors = useMemo(() => {
    switch (metalTone) {
      case 'rose-gold':
        return {
          base: '#8F3E48',
          mid: '#D98A92',
          light: '#FFF0F2',
          accent: '#E89BA2',
          dark: '#542229',
          lineGradient: 'linear-gradient(135deg, #7A333E 0%, #D98A92 25%, #FFF2F4 45%, #E89BA2 65%, #A64B56 85%, #541D24 100%)',
          shadow: 'rgba(84, 34, 41, 0.45)'
        };
      case 'champagne-gold':
        return {
          base: '#6B5B3E',
          mid: '#C8B693',
          light: '#FFFDF8',
          accent: '#DFD1B3',
          dark: '#4E4129',
          lineGradient: 'linear-gradient(135deg, #6B5B3E 0%, #C8B693 25%, #FFFDF8 45%, #DFD1B3 65%, #9E8D6C 85%, #4E4129 100%)',
          shadow: 'rgba(78, 65, 41, 0.4)'
        };
      case 'antique-bronze':
        return {
          base: '#4A3525',
          mid: '#9E7B58',
          light: '#F7EAD9',
          accent: '#B8936E',
          dark: '#332115',
          lineGradient: 'linear-gradient(135deg, #4A3525 0%, #9E7B58 25%, #F7EAD9 45%, #B8936E 65%, #6B4E34 85%, #332115 100%)',
          shadow: 'rgba(51, 33, 21, 0.45)'
        };
      case 'yellow-gold':
      default:
        return {
          base: '#8C631B',
          mid: '#D4AF37',
          light: '#FFFDF0',
          accent: '#E5BE4A',
          dark: '#4A3008',
          lineGradient: 'linear-gradient(135deg, #5C3A0A 0%, #D4AF37 25%, #FFFDF0 45%, #E5BE4A 65%, #9E7320 85%, #4A3008 100%)',
          shadow: 'rgba(74, 48, 8, 0.45)'
        };
    }
  }, [metalTone]);

  // Position class: absolute for scroll / print, fixed for non-scrollable viewport frame
  const isScroll = isPrintMode || scrollMode === 'scroll';
  const positionClass = isScroll ? 'absolute inset-0 w-full h-full' : 'fixed inset-0 w-full h-full';

  // Corner dimension: fixed square in px (never stretches!)
  const cornerSize = presetStyle === 'floral-vintage' ? 88 : 72;
  const lineOffset = 18; // offset from outer edge for the primary rail

  return (
    <div 
      className={`global-border-overlay pointer-events-none select-none ${positionClass} z-0 transition-opacity duration-300`}
      style={{
        padding: `${inset}px`,
        opacity,
        overflow: 'hidden'
      }}
    >
      <div className="relative w-full h-full pointer-events-none" style={{ filter: `drop-shadow(0 3px 6px ${colors.shadow})` }}>
        
        {/* If custom uploaded image, render with CSS 9-slice so corners remain fixed */}
        {isCustomUploaded ? (
          <div
            className="w-full h-full pointer-events-none"
            style={{
              borderStyle: 'solid',
              borderWidth: `${config.globalBorderWidth || 28}px`,
              borderImageSource: `url("${rawImage}")`,
              borderImageSlice: `${config.globalBorderSlice || 56}`,
              borderImageRepeat: 'round'
            }}
          />
        ) : (
          <>
            {/* ─── 4 CORNERS: FIXED-DIMENSION CRISP UNSTRETCHED SVGS ─── */}
            
            {/* 1. TOP-LEFT CORNER */}
            <div 
              className="absolute top-0 left-0 pointer-events-none"
              style={{ width: `${cornerSize}px`, height: `${cornerSize}px` }}
            >
              <SleekCornerGraphic styleType={presetStyle} colors={colors} />
            </div>

            {/* 2. TOP-RIGHT CORNER (Mirrored Horizontally) */}
            <div 
              className="absolute top-0 right-0 pointer-events-none"
              style={{ 
                width: `${cornerSize}px`, 
                height: `${cornerSize}px`,
                transform: 'scaleX(-1)'
              }}
            >
              <SleekCornerGraphic styleType={presetStyle} colors={colors} />
            </div>

            {/* 3. BOTTOM-LEFT CORNER (Mirrored Vertically) */}
            <div 
              className="absolute bottom-0 left-0 pointer-events-none"
              style={{ 
                width: `${cornerSize}px`, 
                height: `${cornerSize}px`,
                transform: 'scaleY(-1)'
              }}
            >
              <SleekCornerGraphic styleType={presetStyle} colors={colors} />
            </div>

            {/* 4. BOTTOM-RIGHT CORNER (Mirrored Both Axes) */}
            <div 
              className="absolute bottom-0 right-0 pointer-events-none"
              style={{ 
                width: `${cornerSize}px`, 
                height: `${cornerSize}px`,
                transform: 'scale(-1, -1)'
              }}
            >
              <SleekCornerGraphic styleType={presetStyle} colors={colors} />
            </div>

            {/* ─── CONNECTING METALLIC BORDER RAILS (Thin, Sleek, Unobtrusive) ─── */}
            
            {/* Top Border Rails */}
            <div 
              className="absolute pointer-events-none"
              style={{
                top: `${lineOffset}px`,
                left: `${cornerSize - 12}px`,
                right: `${cornerSize - 12}px`,
                height: `${borderThickness}px`,
                background: colors.lineGradient,
                boxShadow: `0 1px 2px ${colors.shadow}`
              }}
            />
            {/* Top Fine Inset Rail */}
            <div 
              className="absolute pointer-events-none"
              style={{
                top: `${lineOffset + 5}px`,
                left: `${cornerSize - 6}px`,
                right: `${cornerSize - 6}px`,
                height: '1px',
                background: colors.lineGradient,
                opacity: 0.65
              }}
            />

            {/* Bottom Border Rails */}
            <div 
              className="absolute pointer-events-none"
              style={{
                bottom: `${lineOffset}px`,
                left: `${cornerSize - 12}px`,
                right: `${cornerSize - 12}px`,
                height: `${borderThickness}px`,
                background: colors.lineGradient,
                boxShadow: `0 1px 2px ${colors.shadow}`
              }}
            />
            {/* Bottom Fine Inset Rail */}
            <div 
              className="absolute pointer-events-none"
              style={{
                bottom: `${lineOffset + 5}px`,
                left: `${cornerSize - 6}px`,
                right: `${cornerSize - 6}px`,
                height: '1px',
                background: colors.lineGradient,
                opacity: 0.65
              }}
            />

            {/* Left Border Rails */}
            <div 
              className="absolute pointer-events-none"
              style={{
                left: `${lineOffset}px`,
                top: `${cornerSize - 12}px`,
                bottom: `${cornerSize - 12}px`,
                width: `${borderThickness}px`,
                background: colors.lineGradient,
                boxShadow: `1px 0 2px ${colors.shadow}`
              }}
            />
            {/* Left Fine Inset Rail */}
            <div 
              className="absolute pointer-events-none"
              style={{
                left: `${lineOffset + 5}px`,
                top: `${cornerSize - 6}px`,
                bottom: `${cornerSize - 6}px`,
                width: '1px',
                background: colors.lineGradient,
                opacity: 0.65
              }}
            />

            {/* Right Border Rails */}
            <div 
              className="absolute pointer-events-none"
              style={{
                right: `${lineOffset}px`,
                top: `${cornerSize - 12}px`,
                bottom: `${cornerSize - 12}px`,
                width: `${borderThickness}px`,
                background: colors.lineGradient,
                boxShadow: `1px 0 2px ${colors.shadow}`
              }}
            />
            {/* Right Fine Inset Rail */}
            <div 
              className="absolute pointer-events-none"
              style={{
                right: `${lineOffset + 5}px`,
                top: `${cornerSize - 6}px`,
                bottom: `${cornerSize - 6}px`,
                width: '1px',
                background: colors.lineGradient,
                opacity: 0.65
              }}
            />

            {/* ─── SLEEK REGAL CENTER CRESTS (Top & Bottom) ─── */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
              style={{ 
                top: `${lineOffset - 6}px`,
                width: '60px',
                height: '16px'
              }}
            >
              <SleekCenterCrest colors={colors} styleType={presetStyle} isBottom={false} />
            </div>

            <div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
              style={{ 
                bottom: `${lineOffset - 6}px`,
                width: '60px',
                height: '16px',
                transform: 'translateX(-50%) scaleY(-1)'
              }}
            >
              <SleekCenterCrest colors={colors} styleType={presetStyle} isBottom={true} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Precision Unstretched Corner SVG Graphics
 */
function SleekCornerGraphic({ styleType, colors }) {
  const gradientId = `cornerGoldGrad_${styleType}`;
  const highlightId = `cornerBevel_${styleType}`;

  // 1. Sleek Botanical Laurel (Refined leaves & bud, zero awkward loops)
  if (styleType === 'floral-vintage') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.dark} />
            <stop offset="25%" stopColor={colors.mid} />
            <stop offset="48%" stopColor={colors.light} />
            <stop offset="70%" stopColor={colors.accent} />
            <stop offset="100%" stopColor={colors.base} />
          </linearGradient>
          <linearGradient id={highlightId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF5" stopOpacity="0.9" />
            <stop offset="100%" stopColor={colors.mid} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Outer 90° Corner Framing Bracket */}
        <path d="M 18 85 L 18 18 L 85 18" stroke={`url(#${gradientId})`} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 17 83 L 17 17 L 83 17" stroke={`url(#${highlightId})`} strokeWidth="0.8" strokeLinecap="round" />

        {/* Inner Fine Bracket */}
        <path d="M 24 75 L 24 24 L 75 24" stroke={`url(#${gradientId})`} strokeWidth="1" strokeLinecap="round" opacity="0.8" />

        {/* Delicate Sleek Laurel Sprig */}
        <path d="M 22 22 Q 42 42 65 30" stroke={`url(#${gradientId})`} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M 22 22 Q 42 42 30 65" stroke={`url(#${gradientId})`} strokeWidth="1.4" strokeLinecap="round" />

        {/* Sleek Engraved Acanthus Leaflets (Sharp, elegant, realistic) */}
        <path d="M 32 32 C 40 24 52 28 54 34 C 46 36 38 36 32 32 Z" fill={`url(#${gradientId})`} stroke={colors.dark} strokeWidth="0.5" />
        <path d="M 32 32 C 24 40 28 52 34 54 C 36 46 36 38 32 32 Z" fill={`url(#${gradientId})`} stroke={colors.dark} strokeWidth="0.5" />
        <path d="M 44 44 C 54 38 64 42 66 48 C 58 50 50 48 44 44 Z" fill={`url(#${gradientId})`} stroke={colors.dark} strokeWidth="0.5" />
        <path d="M 44 44 C 38 54 42 64 48 66 C 50 58 48 50 44 44 Z" fill={`url(#${gradientId})`} stroke={colors.dark} strokeWidth="0.5" />

        {/* Corner Micro-Rosette Medallion */}
        <circle cx="21" cy="21" r="4.5" fill={`url(#${gradientId})`} stroke={colors.dark} strokeWidth="0.6" />
        <circle cx="19.5" cy="19.5" r="1.3" fill="#FFFFFF" opacity="0.9" />

        {/* Delicate Tip Seed Pearl */}
        <circle cx="68" cy="30" r="2.2" fill={`url(#${gradientId})`} />
        <circle cx="30" cy="68" r="2.2" fill={`url(#${gradientId})`} />
      </svg>
    );
  }

  // 2. Art Deco Gatsby (Geometric stepped architectural corners)
  if (styleType === 'art-deco') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.dark} />
            <stop offset="30%" stopColor={colors.mid} />
            <stop offset="50%" stopColor={colors.light} />
            <stop offset="70%" stopColor={colors.accent} />
            <stop offset="100%" stopColor={colors.base} />
          </linearGradient>
        </defs>

        {/* Stepped Architectural Corner 1 */}
        <path d="M 18 90 L 18 18 L 90 18" stroke={`url(#${gradientId})`} strokeWidth="2.5" />
        {/* Stepped Corner 2 */}
        <path d="M 24 80 L 24 24 L 80 24" stroke={`url(#${gradientId})`} strokeWidth="1.2" />
        {/* Stepped Corner 3 */}
        <path d="M 30 65 L 30 30 L 65 30" stroke={`url(#${gradientId})`} strokeWidth="1" opacity="0.8" />

        {/* 45° Faceted Miter Line */}
        <line x1="18" y1="18" x2="42" y2="42" stroke={`url(#${gradientId})`} strokeWidth="1.5" />

        {/* Chiseled Diamond Stud */}
        <polygon points="24,24 27,21 30,24 27,27" fill={`url(#${gradientId})`} stroke={colors.dark} strokeWidth="0.5" />
        <polygon points="36,36 39,33 42,36 39,39" fill={`url(#${gradientId})`} stroke={colors.dark} strokeWidth="0.5" />
      </svg>
    );
  }

  // 3. Sleek Modern Luxury (Ultra-fine double-line with precision notched corners)
  if (styleType === 'sleek-modern') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.base} />
            <stop offset="35%" stopColor={colors.mid} />
            <stop offset="50%" stopColor={colors.light} />
            <stop offset="75%" stopColor={colors.accent} />
            <stop offset="100%" stopColor={colors.dark} />
          </linearGradient>
        </defs>

        {/* Clean 45° Corner Bevel Notch */}
        <path d="M 18 85 L 18 32 L 32 18 L 85 18" stroke={`url(#${gradientId})`} strokeWidth="2.2" strokeLinecap="round" />
        {/* Inner Parallel Hairline */}
        <path d="M 24 75 L 24 35 L 35 24 L 75 24" stroke={`url(#${gradientId})`} strokeWidth="1" strokeLinecap="round" opacity="0.85" />

        {/* Micro-Diamond Accent at 45° Center */}
        <polygon points="26,26 29,23 32,26 29,29" fill={`url(#${gradientId})`} stroke={colors.dark} strokeWidth="0.4" />
      </svg>
    );
  }

  // 4. Sleek Royal Gold (Default: Architectural chiseled gold with delicate regal finials)
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.dark} />
          <stop offset="25%" stopColor={colors.mid} />
          <stop offset="48%" stopColor={colors.light} />
          <stop offset="68%" stopColor={colors.accent} />
          <stop offset="100%" stopColor={colors.base} />
        </linearGradient>
        <linearGradient id={highlightId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF5" stopOpacity="0.95" />
          <stop offset="100%" stopColor={colors.mid} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Primary Chiseled 90° Outer Bracket */}
      <path d="M 18 88 L 18 18 L 88 18" stroke={`url(#${gradientId})`} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 17 86 L 17 17 L 86 17" stroke={`url(#${highlightId})`} strokeWidth="0.8" strokeLinecap="round" />

      {/* Secondary Inset Beveled Rail */}
      <path d="M 24 78 L 24 24 L 78 24" stroke={`url(#${gradientId})`} strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />

      {/* Refined 45° Corner Scrollwork (Delicate, chiseled, zero clumsy loops) */}
      <path d="M 21 21 Q 42 42 62 32" stroke={`url(#${gradientId})`} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M 21 21 Q 42 42 32 62" stroke={`url(#${gradientId})`} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M 26 26 Q 44 44 48 48" stroke={`url(#${highlightId})`} strokeWidth="0.8" strokeLinecap="round" />

      {/* Sleek Chiseled Diamond Medallion */}
      <polygon points="21,21 26,16 31,21 26,26" fill={`url(#${gradientId})`} stroke={colors.dark} strokeWidth="0.6" />
      <circle cx="21" cy="21" r="1.5" fill="#FFFFFF" opacity="0.9" />

      {/* Delicate Terminal Accents */}
      <circle cx="64" cy="32" r="2.2" fill={`url(#${gradientId})`} />
      <circle cx="32" cy="64" r="2.2" fill={`url(#${gradientId})`} />
    </svg>
  );
}

/**
 * Subtle Sleek Center Micro-Crest
 */
function SleekCenterCrest({ colors, styleType }) {
  const gradientId = `crestGrad_${styleType}`;
  return (
    <svg viewBox="0 0 60 16" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.mid} stopOpacity="0" />
          <stop offset="40%" stopColor={colors.mid} />
          <stop offset="50%" stopColor={colors.light} />
          <stop offset="60%" stopColor={colors.mid} />
          <stop offset="100%" stopColor={colors.mid} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal Wing Flares */}
      <line x1="5" y1="8" x2="55" y2="8" stroke={`url(#${gradientId})`} strokeWidth="1.2" />

      {/* Central Diamond / Sphere */}
      <polygon points="30,3 34,8 30,13 26,8" fill={colors.mid} stroke={colors.dark} strokeWidth="0.5" />
      <circle cx="30" cy="8" r="1" fill="#FFFFFF" opacity="0.9" />

      <circle cx="18" cy="8" r="1.5" fill={colors.accent} />
      <circle cx="42" cy="8" r="1.5" fill={colors.accent} />
    </svg>
  );
}
