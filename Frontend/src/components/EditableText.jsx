import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { parseColor, rgbaToCss } from '../utils/helpers';
import { SvgHeart, SvgSparkles, SvgCalendar } from './icons';

export const CustomCalendarPicker = ({ value, onChange, dateType = 'datetime-local', accentGold = '#f59e0b', onClose }) => {
  // Parse initial date or default to current date
  const parseVal = () => {
    if (!value) return new Date();
    try {
      const d = new Date(value);
      return isNaN(d.getTime()) ? new Date() : d;
    } catch {
      return new Date();
    }
  };

  const [currentDate, setCurrentDate] = useState(parseVal());
  const [selectedHour, setSelectedHour] = useState(parseVal().getHours());
  const [selectedMin, setSelectedMin] = useState(parseVal().getMinutes());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper for grid calculation
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonthDays = getDaysInMonth(year, month - 1);

  const grid = [];
  // Previous month overflow days
  for (let i = firstDay - 1; i >= 0; i--) {
    grid.push({ day: prevMonthDays - i, isCurrent: false, monthOffset: -1 });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    grid.push({ day: i, isCurrent: true, monthOffset: 0 });
  }
  // Next month overflow days
  const remaining = 42 - grid.length;
  for (let i = 1; i <= remaining; i++) {
    grid.push({ day: i, isCurrent: false, monthOffset: 1 });
  }

  const handleDaySelect = (item) => {
    const targetDate = new Date(year, month + item.monthOffset, item.day);
    setCurrentDate(targetDate);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleApply = () => {
    const finalDate = new Date(currentDate);
    if (dateType === 'datetime-local') {
      finalDate.setHours(selectedHour);
      finalDate.setMinutes(selectedMin);
      // Format as YYYY-MM-DDTHH:MM
      const yr = finalDate.getFullYear();
      const mo = String(finalDate.getMonth() + 1).padStart(2, '0');
      const dy = String(finalDate.getDate()).padStart(2, '0');
      const hr = String(finalDate.getHours()).padStart(2, '0');
      const mi = String(finalDate.getMinutes()).padStart(2, '0');
      onChange(`${yr}-${mo}-${dy}T${hr}:${mi}`);
    } else {
      // Format as YYYY-MM-DD
      const yr = finalDate.getFullYear();
      const mo = String(finalDate.getMonth() + 1).padStart(2, '0');
      const dy = String(finalDate.getDate()).padStart(2, '0');
      onChange(`${yr}-${mo}-${dy}`);
    }
    onClose && onClose();
  };

  return (
    <div className="p-3 w-56 bg-slate-950/95 border border-slate-800 rounded-2xl text-left font-sans text-xs text-slate-200 select-none shadow-2xl">
      {/* Month Header */}
      <div className="flex justify-between items-center mb-2.5">
        <button 
          onClick={handlePrevMonth}
          className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-slate-100 transition-colors"
        >
          ◀
        </button>
        <span className="font-semibold text-slate-100">{months[month]} {year}</span>
        <button 
          onClick={handleNextMonth}
          className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-slate-100 transition-colors"
        >
          ▶
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center font-bold text-[9px] text-slate-500 mb-1">
        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] mb-2.5">
        {grid.map((item, idx) => {
          const isSelected = item.isCurrent && 
            currentDate.getDate() === item.day && 
            currentDate.getMonth() === month && 
            currentDate.getFullYear() === year;

          return (
            <button
              key={idx}
              onClick={() => handleDaySelect(item)}
              style={isSelected ? { backgroundColor: accentGold } : {}}
              className={`py-1 rounded transition-all cursor-pointer ${
                isSelected 
                  ? 'text-slate-950 font-bold' 
                  : item.isCurrent 
                    ? 'text-slate-200 hover:bg-slate-900' 
                    : 'text-slate-600 hover:bg-slate-900/50'
              }`}
            >
              {item.day}
            </button>
          );
        })}
      </div>

      {/* Time Picker */}
      {dateType === 'datetime-local' && (
        <div className="border-t border-slate-900 pt-2.5 mb-2.5">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Select Time</label>
          <div className="flex items-center space-x-1 justify-center bg-slate-900/50 p-1 rounded-lg border border-slate-900">
            <select 
              value={selectedHour} 
              onChange={(e) => setSelectedHour(parseInt(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-[10px] focus:outline-none focus:border-amber-500 font-mono text-slate-200"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
              ))}
            </select>
            <span className="text-slate-500 font-bold">:</span>
            <select 
              value={selectedMin} 
              onChange={(e) => setSelectedMin(parseInt(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-[10px] focus:outline-none focus:border-amber-500 font-mono text-slate-200"
            >
              {Array.from({ length: 60 }).map((_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center border-t border-slate-900 pt-2">
        <span className="text-[8px] text-slate-400 font-mono">
          {currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
          {dateType === 'datetime-local' && ` ${String(selectedHour).padStart(2, '0')}:${String(selectedMin).padStart(2, '0')}`}
        </span>
        <button
          onClick={handleApply}
          style={{ backgroundColor: `${accentGold}25`, borderColor: accentGold, color: accentGold }}
          className="px-2.5 py-1 rounded border text-[9px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition cursor-pointer"
        >
          Apply
        </button>
      </div>
    </div>
  );
};
// RGB to HSV conversion helper
const rgbToHsv = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
};

// HSV to RGB conversion helper
const hsvToRgb = (h, s, v) => {
  h /= 360; s /= 100; v /= 100;
  let r, g, b;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

export const EditableText = ({ 
  isEditing, 
  value, 
  onChangeText, 
  colorValue, 
  onChangeColor, 
  onSelect, 
  tabId,
  field,
  className, 
  style, 
  as: Component = "span",
  activeColorId,
  setActiveColorId,
  popoverId,
  onChangeField,
  isDate = false,
  rawValue = "",
  dateType = "datetime-local",
  yOffsetValue,
  onChangeYOffset,
  config
}) => {
  // === ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURN (Rules of Hooks) ===
  const containerRef = useRef(null);
  const [localShow, setLocalShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [localText, setLocalText] = useState(value || "");
  const [isFocused, setIsFocused] = useState(false);
  const [showYSlider, setShowYSlider] = useState(false);

  const finalYOffset = yOffsetValue !== undefined 
    ? yOffsetValue 
    : (config && field && config[`${field}YOffset`] !== undefined ? (parseInt(config[`${field}YOffset`]) || 0) : 0);

  const finalOnChangeYOffset = onChangeYOffset 
    ? onChangeYOffset 
    : (config && onChangeField && field ? (val) => onChangeField(`${field}YOffset`, val) : null);

  const showColorPopover = (popoverId && activeColorId) ? (activeColorId === popoverId) : localShow;

  const togglePopover = (val) => {
    if (popoverId && setActiveColorId) {
      setActiveColorId(val ? popoverId : null);
    } else {
      setLocalShow(val);
    }
  };

  useEffect(() => {
    if (!isFocused) {
      setLocalText(value || "");
    }
  }, [value, isFocused]);

  useEffect(() => {
    const updatePosition = () => {
      if (showColorPopover && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const popoverWidth = 240;
        const popoverHeight = isDate ? (dateType === 'date' ? 290 : 360) : 380;
        const margin = 8;
        
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        let top;
        if (spaceBelow < popoverHeight + margin && spaceAbove > popoverHeight + margin) {
          top = rect.top - popoverHeight - margin;
        } else {
          top = rect.bottom + margin;
        }
        
        if (top < margin) top = margin;
        if (top + popoverHeight > window.innerHeight - margin) {
          top = window.innerHeight - popoverHeight - margin;
        }
        
        let left = rect.left + rect.width / 2 - popoverWidth / 2;
        if (left < margin) left = margin;
        if (left + popoverWidth > window.innerWidth - margin) {
          left = window.innerWidth - popoverWidth - margin;
        }
        
        setCoords({ top, left });
      }
    };

    if (showColorPopover) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showColorPopover, isDate, dateType]);

  const parsed = parseColor(colorValue || "#ffffff");

  const handleSliderChange = (channel, val) => {
    const updated = { ...parsed };
    if (channel === 'alpha') {
      updated.a = parseFloat(val);
    } else {
      updated[channel] = parseInt(val) || 0;
    }
    onChangeColor && onChangeColor(rgbaToCss(updated.r, updated.g, updated.b, updated.a));
  };

  const handleRgbChangeDirect = (newR, newG, newB) => {
    onChangeColor && onChangeColor(rgbaToCss(newR, newG, newB, parsed.a));
  };

  const handleTextChange = (newVal) => {
    setLocalText(newVal);
    if (onChangeText) {
      onChangeText(newVal);
    } else if (onChangeField && field) {
      onChangeField(field, newVal);
    }
  };

  // === Derive flex justify and text alignment from style.textAlign or className ===
  const getJustify = () => {
    const alignVal = style?.textAlign || (config && field ? config[`${field}Align`] : "") || "";
    if (alignVal === 'left' || alignVal === 'text-left' || (className && className.includes('text-left'))) return 'justify-start';
    if (alignVal === 'right' || alignVal === 'text-right' || (className && className.includes('text-right'))) return 'justify-end';
    return 'justify-center';
  };

  const yOffsetStyle = {
    transform: `${style?.transform || ''} translateY(${finalYOffset}px)`.trim(),
    transition: 'transform 0.1s ease-out'
  };

  // === NON-EDITING MODE: simple static render ===
  if (!isEditing) {
    const nonEditAlignClass = getJustify() === 'justify-start' ? 'text-left' : getJustify() === 'justify-end' ? 'text-right' : 'text-center';
    return (
      <Component 
        className={`${className || ''} ${nonEditAlignClass}`} 
        style={{ ...style, ...yOffsetStyle }}
      >
        {value}
      </Component>
    );
  }

  // === EDITING MODE ===
  const showColorButton = isFocused || showColorPopover;

  return (
    <Component 
      ref={containerRef}
      className={`relative group color-picker-trigger flex items-center ${getJustify()} max-w-full ${className}`} 
      style={{ 
        ...style, 
        ...yOffsetStyle,
        zIndex: showColorPopover ? 9999 : undefined 
      }}
      onClick={(e) => { 
        e.stopPropagation(); 
        onSelect && onSelect({ tabId, field }); 
      }}
    >
      {isDate ? (
        <span
          onClick={(e) => {
            e.stopPropagation();
            togglePopover(!showColorPopover);
          }}
          className="outline-none hover:bg-slate-900/20 rounded px-1 cursor-pointer transition-all border-b border-dashed border-white/20 select-none"
        >
          {value}
        </span>
      ) : (
        <span
          contentEditable={true}
          suppressContentEditableWarning={true}
          className="outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-slate-900/10 rounded px-1 min-w-[30px] cursor-text inline-block break-all transition-all"
          onFocus={() => { setIsFocused(true); }}
          onBlur={(e) => {
            setIsFocused(false);
            const text = e.target.innerText.trim();
            if (text !== (value || "").trim()) {
              handleTextChange(text);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && Component !== 'p') {
              e.preventDefault();
              e.target.blur();
            }
          }}
        >
          {localText}
        </span>
      )}

      {showColorButton && onChangeColor && (
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            togglePopover(!showColorPopover); 
          }}
          className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-slate-700 shadow-md overflow-hidden shrink-0 hover:scale-110 transition-all flex items-center justify-center cursor-pointer animate-fade-in z-50"
          style={{ 
            backgroundColor: colorValue || "#ffffff",
            backgroundImage: 'linear-gradient(45deg, #334155 25%, transparent 25%), linear-gradient(-45deg, #334155 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #334155 75%), linear-gradient(-45deg, transparent 75%, #334155 75%)',
            backgroundSize: '4px 4px',
            backgroundPosition: '0 0, 0 1px, 1px -1px, -1px 0px'
          }}
          title="Adjust Color"
        >
          <div className="w-full h-full" style={{ backgroundColor: colorValue || "#ffffff" }} />
        </button>
      )}

      {showColorPopover && createPortal(
        <div 
          className="fixed p-3 bg-slate-950/95 border rounded-2xl text-left font-sans text-slate-100 backdrop-blur-md color-picker-popover z-[100000] animate-scale-in overflow-y-auto"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            borderColor: `${colorValue}35`,
            boxShadow: `0 20px 50px rgba(0,0,0,0.85), 0 0 30px ${colorValue}20`,
            margin: 0,
            maxHeight: 'calc(100vh - 16px)',
            width: '240px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {isDate ? (
            <CustomCalendarPicker
              value={rawValue}
              dateType={dateType}
              accentGold={colorValue || '#f59e0b'}
              onChange={(newVal) => handleTextChange(newVal)}
              onClose={() => togglePopover(false)}
            />
          ) : (
            <>
              <div className="flex justify-between items-center pb-1 border-b border-slate-900 mb-2">
                <span className="font-bold text-[9px] text-amber-500 uppercase tracking-widest">Adjust Color</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePopover(false);
                  }}
                  className="text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2.5">
                {/* RGBA Display */}
                <div className="flex items-center space-x-2 bg-slate-900/60 p-1.5 rounded border border-slate-850">
                  <div 
                    className="w-5 h-5 rounded border border-slate-700 overflow-hidden relative shrink-0"
                    style={{
                      backgroundImage: 'linear-gradient(45deg, #334155 25%, transparent 25%), linear-gradient(-45deg, #334155 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #334155 75%), linear-gradient(-45deg, transparent 75%, #334155 75%)',
                      backgroundSize: '4px 4px',
                      backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
                    }}
                  >
                    <div className="w-full h-full" style={{ backgroundColor: colorValue }} />
                  </div>
                  <span className="text-[9px] font-mono text-slate-350 truncate">
                    rgba({parsed.r}, {parsed.g}, {parsed.b}, {parsed.a})
                  </span>
                </div>
                
                {(() => {
                  const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
                  const pureColor = hsvToRgb(hsv.h, 100, 100);
                  const valueGradient = `linear-gradient(to right, #000000, rgb(${pureColor.r}, ${pureColor.g}, ${pureColor.b}))`;
                  
                  return (
                    <div className="space-y-2">
                      {/* Hue Slider */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase">
                            <span>Color</span>
                            <span className="font-mono text-amber-500 font-semibold">{hsv.h}°</span>
                          </div>
                          <input 
                            type="range" min="0" max="360"
                            value={hsv.h}
                            onChange={(e) => {
                              const h = parseInt(e.target.value);
                              const s = hsv.s < 8 ? 85 : hsv.s;
                              const v = hsv.v < 8 ? 85 : hsv.v;
                              const rgb = hsvToRgb(h, s, v);
                              handleRgbChangeDirect(rgb.r, rgb.g, rgb.b);
                            }}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer color-slider-horizontal"
                            style={{
                              background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                              padding: 0
                            }}
                          />
                        </div>

                        {/* Brightness Slider */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase">
                            <span>Brightness</span>
                            <span className="font-mono text-amber-500 font-semibold">{hsv.v}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="100"
                            value={hsv.v}
                            onChange={(e) => {
                              const v = parseInt(e.target.value);
                              const s = hsv.s < 8 ? 85 : hsv.s;
                              const rgb = hsvToRgb(hsv.h, s, v);
                              handleRgbChangeDirect(rgb.r, rgb.g, rgb.b);
                            }}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer color-slider-horizontal"
                            style={{
                              background: valueGradient,
                              padding: 0
                            }}
                          />
                        </div>

                      {/* Opacity Slider */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase">
                          <span>Opacity</span>
                          <span className="font-mono text-amber-500 font-semibold">{Math.round(parsed.a * 100)}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="1" step="0.01"
                          value={parsed.a}
                          onChange={(e) => handleSliderChange('alpha', parseFloat(e.target.value))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer color-slider-horizontal"
                          style={{
                            background: `linear-gradient(to right, rgba(${parsed.r},${parsed.g},${parsed.b},0), rgba(${parsed.r},${parsed.g},${parsed.b},1))`,
                            padding: 0
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Y-Offset Position Slider (also in popover) */}
                {finalOnChangeYOffset && (
                  <div className="space-y-0.5 border-t border-slate-900 pt-2.5 mt-2">
                    <div className="flex justify-between text-[8px] font-semibold text-slate-400 uppercase">
                      <span className="text-amber-500 font-bold">Vertical Offset (Y)</span>
                      <span className="font-mono text-slate-200">{finalYOffset}px</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="range" min="-120" max="120" step="1"
                        value={finalYOffset}
                        onChange={(e) => finalOnChangeYOffset(parseInt(e.target.value))}
                        className="flex-1 h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                      />
                      <button 
                        onClick={() => finalOnChangeYOffset(0)}
                        className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white rounded text-[8px] text-slate-400 font-mono transition active:scale-95 cursor-pointer"
                        title="Reset to 0"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>,
        document.body
      )}
    </Component>
  );
};
