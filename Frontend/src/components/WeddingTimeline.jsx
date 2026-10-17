import React, { useMemo } from 'react';
import { TIMELINE_CLIPARTS, formatCeremonyDate, DEFAULT_CEREMONIES, DEFAULT_TIMELINE_CONFIG } from '../data/timelineDefaults';
import { SvgCalendar, SvgMapPin, SvgExternalLink, SvgHeart } from './icons';

export default function WeddingTimeline({ config = {}, isPrintMode = false }) {
  // Merge timeline configuration with defaults
  const timelineConfig = useMemo(() => {
    return {
      ...DEFAULT_TIMELINE_CONFIG,
      ...config
    };
  }, [config]);

  if (timelineConfig.showTimelineSection === false) {
    return null;
  }

  // Detect whether background is light or dark for harmonious theme inheritance
  const isLightBackground = useMemo(() => {
    const hex = (config.primaryColor || "#0b1329").replace('#', '');
    if (hex.length !== 6) return false;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  }, [config.primaryColor]);

  const {
    timelineHeading = "Wedding Ceremony",
    timelineSubtitle = "Timeline",
    showTimelineHeading = true,
    showTimelineSubtitle = true,
    showTimelineLine = true,
    showTimelineCards = true,
    showTimelineDescriptions = true,
    showTimelineDateTime = true,
    showTimelineTime = true,
    showTimelineVenue = true,
    showTimelineAllCliparts = true,
    showTimelineOrnaments = true,
    timelineSortMode = "chronological",
    timelineLayout = "alternating", // "alternating" | "left" | "right"
    timelineMobileLayout = "alternating", // "alternating" | "stacked-card"
    timelineTitleSize = "large", // "medium" | "large" | "extra-large"
    showCeremonyCardBorder = false, // User requested: no border line around icon & ceremony names
    showIconBorder = false, // User requested: no border on icon
    showDetailsCardBorder = true, // Keep border line on detail side only
    timelineHeadingFont = "font-serif",
    timelineSubtitleFont = "font-cursive",
    timelineTitleFont = "font-serif",
    timelineHeadingColor = (isLightBackground ? "#781428" : "#F7E8C5"),
    timelineSubtitleColor = (isLightBackground ? "#c28b2a" : (config.accentGold || "#cda452")),
    timelineTitleColor = (isLightBackground ? "#781428" : "#FDF4DC"),
    timelineTextColor = (isLightBackground ? "#334155" : "#CBD5E1"),
    timelineDateColor = (isLightBackground ? "#64748B" : "#94A3B8"),
    timelineVenueColor = (isLightBackground ? "#8a2b3f" : (config.accentGold || "#F59E0B")),
    timelineLineColor = (config.accentGold || "#cda452"),
    timelineNodeColor = (isLightBackground ? "#781428" : (config.accentGold || "#f59e0b")),
    timelineCardBg,
    timelineCardBorder,
    timelineClipartBorder,
    timelineCardCornerRadius = 18,
    timelineClipartSize = 46,
    showTimelineOuterFrame = true,
    ceremonies = DEFAULT_CEREMONIES
  } = timelineConfig;

  // Process and sort ceremony list
  const sortedCeremonies = useMemo(() => {
    const list = Array.isArray(ceremonies) && ceremonies.length > 0 
      ? [...ceremonies] 
      : [...DEFAULT_CEREMONIES];

    const visibleList = list.filter(c => c.visible !== false);

    if (timelineSortMode === "chronological") {
      return visibleList.sort((a, b) => {
        const hasDateA = !!a.date;
        const hasDateB = !!b.date;
        if (hasDateA && hasDateB) {
          const timeA = new Date(`${a.date} ${a.time || '00:00'}`).getTime();
          const timeB = new Date(`${b.date} ${b.time || '00:00'}`).getTime();
          if (!isNaN(timeA) && !isNaN(timeB)) {
            if (timeA !== timeB) return timeA - timeB;
          }
        } else if (hasDateA && !hasDateB) {
          return -1;
        } else if (!hasDateA && hasDateB) {
          return 1;
        }
        return (a.order || 0) - (b.order || 0);
      });
    }

    return visibleList.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [ceremonies, timelineSortMode]);

  // Render SVG or Custom Image
  const renderClipart = (clipartId, customImageUrl, title) => {
    if (customImageUrl) {
      return (
        <img
          src={customImageUrl}
          alt={title || "Ceremony Illustration"}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
        />
      );
    }
    const clipartObj = TIMELINE_CLIPARTS[clipartId] || TIMELINE_CLIPARTS["haldi-bowl"];
    if (clipartObj && clipartObj.svg) {
      return (
        <div 
          className="w-full h-full flex items-center justify-center p-0.5 select-none"
          dangerouslySetInnerHTML={{ __html: clipartObj.svg }}
        />
      );
    }
    return <span className="text-lg">✨</span>;
  };

  // Typography class for ceremony title based on timelineTitleSize
  const getTitleSizeClass = () => {
    if (timelineTitleSize === 'extra-large') return 'text-xl sm:text-2xl md:text-3xl';
    if (timelineTitleSize === 'medium') return 'text-base sm:text-lg md:text-xl';
    // Default 'large' — prominent, almost equal in visual stature to the ~46px icon!
    return 'text-lg sm:text-xl md:text-2xl';
  };

  // Glassmorphic styling tokens for the Details side (WITH border line)
  const detailsCardStyle = {
    background: timelineCardBg || (isLightBackground 
      ? 'rgba(255, 255, 255, 0.75)' 
      : 'rgba(15, 23, 42, 0.65)'),
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: showDetailsCardBorder !== false 
      ? `1px solid ${timelineCardBorder || (isLightBackground ? 'rgba(205, 164, 82, 0.38)' : 'rgba(205, 164, 82, 0.30)')}`
      : 'none',
    borderRadius: `${timelineCardCornerRadius || 18}px`,
    boxShadow: isLightBackground
      ? '0 6px 20px -3px rgba(120, 20, 40, 0.05), 0 2px 6px rgba(205, 164, 82, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.85)'
      : '0 8px 24px -4px rgba(0, 0, 0, 0.40), 0 2px 6px rgba(205, 164, 82, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
  };

  // Styling for the Ceremony Name + Icon side (NO border line per user request)
  const ceremonySideStyle = {
    background: showCeremonyCardBorder 
      ? (timelineCardBg || (isLightBackground ? 'rgba(255, 255, 255, 0.72)' : 'rgba(15, 23, 42, 0.62)'))
      : 'transparent',
    border: showCeremonyCardBorder 
      ? `1px solid ${timelineCardBorder || (isLightBackground ? 'rgba(205, 164, 82, 0.35)' : 'rgba(205, 164, 82, 0.30)')}`
      : 'none',
    borderRadius: `${timelineCardCornerRadius || 18}px`,
    boxShadow: showCeremonyCardBorder 
      ? (isLightBackground ? '0 4px 14px rgba(120, 20, 40, 0.04)' : '0 4px 14px rgba(0, 0, 0, 0.3)')
      : 'none'
  };

  // Circular Icon styling (NO border on icon per user request)
  const iconMedallionStyle = {
    width: `${timelineClipartSize || 46}px`,
    height: `${timelineClipartSize || 46}px`,
    border: showIconBorder 
      ? `1.5px solid ${timelineClipartBorder || timelineLineColor || '#cda452'}`
      : 'none',
    background: isLightBackground
      ? 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 45%, rgba(253, 245, 234, 0.90) 100%)'
      : 'radial-gradient(circle, rgba(30, 41, 59, 0.95) 45%, rgba(15, 23, 42, 0.90) 100%)',
    boxShadow: showIconBorder 
      ? `0 2px 10px ${timelineLineColor || '#cda452'}35, inset 0 1px 2px rgba(255, 255, 255, 0.7)`
      : '0 2px 8px rgba(0, 0, 0, 0.08)'
  };

  return (
    <section
      id="wedding-timeline-section"
      className="py-10 px-3 sm:px-8 w-full mx-auto rounded-3xl bg-black/10 border border-white/5 my-4 relative transition-all duration-300 overflow-hidden"
      style={{
        boxShadow: config.venueShadowEnabled !== false
          ? `0 ${config.venueShadowY ?? 8}px ${config.venueShadowBlur ?? 20}px ${config.venueShadowSpread ?? -4}px ${config.venueShadowColor || 'rgba(0, 0, 0, 0.2)'}`
          : 'none'
      }}
    >
      {/* Decorative Ambient Glass Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.03] via-transparent to-amber-500/[0.03] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

      {/* Decorative Outer Gold Corner Accents */}
      {showTimelineOuterFrame && (
        <>
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 pointer-events-none opacity-60 rounded-tl-sm" style={{ borderColor: timelineLineColor }} />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 pointer-events-none opacity-60 rounded-tr-sm" style={{ borderColor: timelineLineColor }} />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 pointer-events-none opacity-60 rounded-bl-sm" style={{ borderColor: timelineLineColor }} />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 pointer-events-none opacity-60 rounded-br-sm" style={{ borderColor: timelineLineColor }} />
        </>
      )}

      {/* SECTION HEADER */}
      {(showTimelineHeading || showTimelineSubtitle) && (
        <div className="text-center mb-6 sm:mb-8 space-y-1 select-none relative z-10">
          {showTimelineHeading && (
            <h2
              className={`text-xl sm:text-2xl font-bold tracking-wide transition-colors ${timelineHeadingFont}`}
              style={{ color: timelineHeadingColor }}
            >
              {timelineHeading}
            </h2>
          )}

          {showTimelineSubtitle && (
            <p
              className={`text-2xl sm:text-3xl font-normal tracking-wide transform -translate-y-0.5 transition-colors ${timelineSubtitleFont}`}
              style={{ color: timelineSubtitleColor }}
            >
              {timelineSubtitle}
            </p>
          )}

          {/* Dainty Heart & Flourish Divider */}
          {showTimelineOrnaments && (
            <div className="flex items-center justify-center space-x-1.5 pt-0.5 opacity-85">
              <span className="w-8 sm:w-14 h-[1px] bg-gradient-to-r from-transparent to-amber-500/80 rounded-full" />
              <span className="text-[9px] text-amber-500/90 font-serif">✦</span>
              <SvgHeart className="w-3.5 h-3.5 text-rose-700 animate-pulse mx-0.5" fill="#801b2b" />
              <span className="text-[9px] text-amber-500/90 font-serif">✦</span>
              <span className="w-8 sm:w-14 h-[1px] bg-gradient-to-l from-transparent to-amber-500/80 rounded-full" />
            </div>
          )}
        </div>
      )}

      {/* TIMELINE CONTAINER */}
      <div className="relative w-full max-w-4xl mx-auto py-2 z-10">

        {/* Central Vertical Golden Line */}
        {showTimelineLine && (
          <div 
            className={`absolute top-1 bottom-1 pointer-events-none z-10 flex flex-col items-center
                       ${timelineMobileLayout === 'alternating' ? 'left-1/2 -translate-x-1/2' : 'left-4 sm:left-6 md:left-1/2 -translate-x-1/2'}`}
            style={{ width: '1.5px' }}
          >
            {/* Top Finial */}
            {showTimelineOrnaments && (
              <div 
                className="w-2.5 h-2.5 rotate-45 border-t border-l shrink-0 mb-0.5"
                style={{ borderColor: timelineLineColor }}
              />
            )}

            {/* Continuous Line */}
            <div 
              className="w-full flex-grow rounded-full transition-colors"
              style={{ 
                backgroundColor: timelineLineColor,
                boxShadow: `0 0 8px ${timelineLineColor}66`
              }}
            />

            {/* Bottom Finial */}
            {showTimelineOrnaments && (
              <div 
                className="w-2.5 h-2.5 rotate-45 border-b border-r shrink-0 mt-0.5"
                style={{ borderColor: timelineLineColor }}
              />
            )}
          </div>
        )}

        {/* CEREMONIES LIST */}
        <div className="space-y-4 sm:space-y-5">
          {sortedCeremonies.length === 0 ? (
            <div className="text-center py-6 text-slate-400 font-serif italic text-xs">
              No ceremonies configured.
            </div>
          ) : (
            sortedCeremonies.map((ceremony, idx) => {
              const { dayOfWeek, formattedDate } = formatCeremonyDate(ceremony.date);
              const hasClipart = showTimelineAllCliparts && ceremony.showClipart !== false;
              const isTimeVisible = showTimelineTime !== false && ceremony.showTime !== false && !!ceremony.time;

              // Alternating position check
              let isCeremonyOnLeft = (idx % 2 === 0);
              if (timelineLayout === 'left') isCeremonyOnLeft = true;
              if (timelineLayout === 'right') isCeremonyOnLeft = false;

              // SUB-COMPONENT: Ceremony Name + Icon (NO BORDER LINE per user request)
              const renderCeremonySide = (alignment, isMobile = false) => (
                <div 
                  className={`p-2 sm:p-2.5 flex items-center space-x-2.5 sm:space-x-3.5 transition-all duration-300 ${
                    alignment === 'right' ? 'justify-end text-right' : 'justify-start text-left'
                  }`}
                  style={ceremonySideStyle}
                >
                  {/* If aligned right: Ceremony Title comes first, then Clipart Icon closest to center line */}
                  {alignment === 'right' && (
                    <div className="min-w-0 flex-grow">
                      <h3 
                        className={`font-bold tracking-tight leading-tight ${timelineTitleFont} ${
                          isMobile ? 'text-sm sm:text-base' : getTitleSizeClass()
                        }`}
                        style={{ color: timelineTitleColor }}
                        title={ceremony.title}
                      >
                        {ceremony.title || "Wedding Ceremony"}
                      </h3>
                    </div>
                  )}

                  {/* Circular Clipart Medallion (NO BORDER LINE per user request) */}
                  {hasClipart && (
                    <div 
                      className="shrink-0 flex items-center justify-center rounded-full p-0.5 transition-transform duration-300 group-hover:scale-105"
                      style={iconMedallionStyle}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                        {renderClipart(ceremony.clipartId, ceremony.customImageUrl, ceremony.title)}
                      </div>
                    </div>
                  )}

                  {/* If aligned left: Clipart Icon comes first closest to center line, then Ceremony Title */}
                  {alignment === 'left' && (
                    <div className="min-w-0 flex-grow">
                      <h3 
                        className={`font-bold tracking-tight leading-tight ${timelineTitleFont} ${
                          isMobile ? 'text-sm sm:text-base' : getTitleSizeClass()
                        }`}
                        style={{ color: timelineTitleColor }}
                        title={ceremony.title}
                      >
                        {ceremony.title || "Wedding Ceremony"}
                      </h3>
                    </div>
                  )}
                </div>
              );

              // SUB-COMPONENT: Details Side (Date/Time + Venue + Description) (WITH OUTLINE/BORDER LINE)
              const renderDetailsSide = (alignment, isMobile = false) => (
                <div 
                  className={`p-3 sm:p-3.5 flex flex-col justify-center space-y-1.5 transition-all duration-300 hover:border-amber-400/60 hover:shadow-lg min-h-[58px] ${
                    alignment === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={detailsCardStyle}
                >
                  {/* 1. Day, Date & Time of Ceremony (Moved to Details side per user request) */}
                  {showTimelineDateTime && (ceremony.date || isTimeVisible) && (
                    <div 
                      className={`flex items-center text-[10px] sm:text-xs font-semibold space-x-1.5 opacity-90 ${
                        alignment === 'right' ? 'justify-end' : 'justify-start'
                      }`}
                      style={{ color: timelineDateColor }}
                    >
                      {alignment === 'left' && (
                        <SvgCalendar className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0 opacity-80" />
                      )}
                      <span className="truncate">
                        {ceremony.date ? (
                          <>
                            <span className="font-bold">{dayOfWeek}</span>
                            {formattedDate && ` • ${formattedDate}`}
                            {isTimeVisible && ` • ${ceremony.time}`}
                          </>
                        ) : (
                          isTimeVisible ? ceremony.time : "Day, Date"
                        )}
                      </span>
                      {alignment === 'right' && (
                        <SvgCalendar className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0 opacity-80" />
                      )}
                    </div>
                  )}

                  {/* 2. Venue details & Map Link */}
                  {showTimelineVenue && (ceremony.venueName || ceremony.venueAddress) && (
                    <div 
                      className={`flex items-center text-[10px] sm:text-[11px] space-x-1 font-medium ${
                        alignment === 'right' ? 'justify-end' : 'justify-start'
                      }`}
                      style={{ color: timelineVenueColor }}
                    >
                      {alignment === 'left' && (
                        <SvgMapPin className="w-3 h-3 shrink-0 opacity-80 text-rose-700" />
                      )}
                      <span className="truncate font-semibold">
                        {ceremony.venueName || ceremony.venueAddress}
                      </span>
                      {alignment === 'right' && (
                        <SvgMapPin className="w-3 h-3 shrink-0 opacity-80 text-rose-700 ml-1" />
                      )}
                      {ceremony.venueUrl && (
                        <a 
                          href={ceremony.venueUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="hover:opacity-100 transition inline-flex items-center text-[9px] underline decoration-amber-500/50 text-amber-700 ml-1"
                          title="Open in Google Maps"
                        >
                          <SvgExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* 3. Short Description */}
                  {showTimelineDescriptions && ceremony.description && (
                    <p 
                      className={`text-[10px] sm:text-[11px] leading-snug line-clamp-2 opacity-85 font-sans ${
                        alignment === 'right' ? 'text-right' : 'text-left'
                      }`}
                      style={{ color: timelineTextColor }}
                    >
                      {ceremony.description}
                    </p>
                  )}
                </div>
              );

              return (
                <div 
                  key={ceremony.id || idx}
                  className="relative flex flex-col md:flex-row items-center w-full group"
                >
                  {/* Central Timeline Milestone Node */}
                  {showTimelineLine && (
                    <div 
                      className={`absolute z-20 flex items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-125
                                 ${timelineMobileLayout === 'alternating' 
                                    ? 'left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2' 
                                    : 'left-4 sm:left-6 md:left-1/2 -translate-x-1/2 top-4 md:top-1/2 md:-translate-y-1/2'}`}
                      style={{
                        width: '14px',
                        height: '14px',
                        backgroundColor: isLightBackground ? '#ffffff' : '#0f172a',
                        border: `2.5px solid ${timelineLineColor}`,
                        boxShadow: `0 0 10px ${timelineLineColor}88`
                      }}
                      title={ceremony.title}
                    >
                      <span 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: timelineNodeColor }}
                      />
                    </div>
                  )}

                  {/* DESKTOP BALANCED ALTERNATING ROW */}
                  <div className="hidden md:grid md:grid-cols-2 md:gap-8 w-full items-center">
                    {isCeremonyOnLeft ? (
                      <>
                        {/* LEFT: Ceremony Name + Icon (No border) */}
                        {renderCeremonySide('right')}
                        {/* RIGHT: Details Side with Date/Time + Venue + Description (With border) */}
                        {renderDetailsSide('left')}
                      </>
                    ) : (
                      <>
                        {/* LEFT: Details Side with Date/Time + Venue + Description (With border) */}
                        {renderDetailsSide('right')}
                        {/* RIGHT: Icon + Ceremony Name (No border) */}
                        {renderCeremonySide('left')}
                      </>
                    )}
                  </div>

                  {/* MOBILE VIEW (< 768px): Fully Responsive with Layout Options */}
                  <div className="md:hidden w-full">
                    {timelineMobileLayout === 'alternating' ? (
                      // Responsive Mobile Alternating 2-Column Mode
                      <div className="grid grid-cols-2 gap-3 w-full items-center">
                        {isCeremonyOnLeft ? (
                          <>
                            {renderCeremonySide('right', true)}
                            {renderDetailsSide('left', true)}
                          </>
                        ) : (
                          <>
                            {renderDetailsSide('right', true)}
                            {renderCeremonySide('left', true)}
                          </>
                        )}
                      </div>
                    ) : (
                      // Responsive Mobile Stacked Card Mode (Line on Left)
                      <div className="pl-9 sm:pl-12 w-full space-y-1.5">
                        {/* Ceremony Name + Icon (No border) */}
                        <div className="flex items-center space-x-2 py-0.5">
                          {hasClipart && (
                            <div 
                              className="shrink-0 flex items-center justify-center rounded-full p-0.5"
                              style={iconMedallionStyle}
                            >
                              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                                {renderClipart(ceremony.clipartId, ceremony.customImageUrl, ceremony.title)}
                              </div>
                            </div>
                          )}
                          <h3 
                            className={`font-bold tracking-tight leading-tight ${timelineTitleFont} ${getTitleSizeClass()}`}
                            style={{ color: timelineTitleColor }}
                          >
                            {ceremony.title}
                          </h3>
                        </div>

                        {/* Details Card (With border line) */}
                        <div 
                          className="p-2.5 rounded-2xl space-y-1"
                          style={detailsCardStyle}
                        >
                          {showTimelineDateTime && (ceremony.date || isTimeVisible) && (
                            <p 
                              className="text-[10px] font-semibold flex items-center space-x-1"
                              style={{ color: timelineDateColor }}
                            >
                              <SvgCalendar className="w-3 h-3 shrink-0 opacity-80" />
                              <span>{ceremony.date ? `${dayOfWeek} • ${formattedDate}` : "Day, Date"}{isTimeVisible ? ` • ${ceremony.time}` : ''}</span>
                            </p>
                          )}
                          {showTimelineVenue && ceremony.venueName && (
                            <p className="text-[10px] truncate font-semibold flex items-center space-x-1" style={{ color: timelineVenueColor }}>
                              <SvgMapPin className="w-2.5 h-2.5 shrink-0 opacity-80 text-rose-700" />
                              <span>{ceremony.venueName}</span>
                            </p>
                          )}
                          {showTimelineDescriptions && ceremony.description && (
                            <p className="text-[10px] line-clamp-2 opacity-80" style={{ color: timelineTextColor }}>
                              {ceremony.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
}
