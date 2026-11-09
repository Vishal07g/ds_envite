import React, { useState, useEffect, useRef } from 'react';

export const INVITATION_TYPES = [
  { id: 'all', label: 'All Traditions & Sacred Symbols', symbol: '✨', badge: 'All Themes', desc: 'Explore all wedding, cultural & sacred motifs' },
  { id: 'secular', label: 'Secular / Modern Classic', symbol: '❤', badge: 'Classic', desc: 'Elegant romantic designs suitable for all couples' },
  { id: 'hindu', label: 'Hindu Vivah (Vedic & Sacred)', symbol: '🕉️', badge: 'Ganesha & Om', desc: 'Traditional auspicious vivah with Vedic mantras' },
  { id: 'christian', label: 'Christian Holy Matrimony', symbol: '✝️', badge: 'Cross & Vows', desc: 'Sacred cathedral & scripture-inspired invitations' },
  { id: 'islamic', label: 'Islamic Nikah & Walima', symbol: '☪️', badge: 'Bismillah', desc: 'Ornate Islamic calligraphy & geometric patterns' },
  { id: 'sikh', label: 'Sikh Anand Karaj', symbol: '☬', badge: 'Ek Onkar', desc: 'Royal Punjabi Sikh matrimony invitation cards' },
  { id: 'jewish', label: 'Jewish Matrimony', symbol: '✡️', badge: 'Mazel Tov', desc: 'Traditional Hebrew matrimony & wedding celebration' },
  { id: 'buddhist', label: 'Buddhist Sacred Union', symbol: '☸️', badge: 'Lotus Union', desc: 'Serene lotus & mindfulness themed ceremony' }
];

/**
 * Animated Tradition & Sacred Symbol Dropdown Menu
 * - Smooth hardware-accelerated slide-down animation
 * - Top-layer z-index elevation (z-[999999])
 * - Responsive full-width layout without squeeze boxes
 * - Real-time preset counts per tradition
 */
export default function InvitationTypeDropdown({ 
  value = 'all', 
  onChange, 
  className = '', 
  labelText = 'Tradition & Sacred Symbol',
  presets = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedType = INVITATION_TYPES.find(t => t.id === value) || INVITATION_TYPES[0];

  // Calculate preset counts for each tradition
  const getPresetCount = (typeId) => {
    if (!presets || presets.length === 0) return null;
    if (typeId === 'all') return presets.length;
    return presets.filter(p => p.religion === typeId).length;
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (typeId) => {
    onChange && onChange(typeId);
    setIsOpen(false);
  };

  return (
    <div 
      ref={dropdownRef} 
      className={`relative inline-block text-left w-full transition-all ${
        isOpen ? 'z-[999999]' : 'z-20'
      } ${className}`}
    >
      {labelText && (
        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#513321] mb-1.5 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <span>✨</span>
            <span>{labelText}</span>
          </span>
          <span className="text-[9px] text-[#8C6D58] font-mono font-bold">
            {value === 'all' ? 'Showing All' : 'Filtered'}
          </span>
        </label>
      )}

      {/* Main Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 flex items-center justify-between shadow-md cursor-pointer backdrop-blur-md ${
          isOpen
            ? 'bg-[#FFFEFB] border-[#C49A4A] ring-2 ring-[#C49A4A]/25 shadow-xl text-[#513321]'
            : 'bg-[#FFF9F2] hover:bg-[#FFFEFB] border-[#E9DCCB] hover:border-[#C49A4A] text-[#513321]'
        }`}
      >
        <div className="flex items-center space-x-3 overflow-hidden text-left min-w-0">
          <span className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-900 text-sm font-bold shrink-0 shadow-inner">
            {selectedType.symbol}
          </span>
          <div className="truncate min-w-0">
            <div className="flex items-center space-x-1.5 truncate">
              <span className="text-xs font-bold font-cinzel tracking-wide text-[#513321] truncate">
                {selectedType.label}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-900 font-bold border border-amber-500/25 shrink-0 uppercase tracking-wider">
                {selectedType.badge}
              </span>
            </div>
            <span className="block text-[10px] text-[#8C6D58] font-medium truncate mt-0.5">
              {selectedType.desc}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 ml-2">
          {value !== 'all' && (
            <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-[#D6AD61] text-[#382416] border border-[#C49A4A] shadow-xs">
              Selected
            </span>
          )}
          <span
            className={`w-5 h-5 rounded-full bg-[#F7EFE5] border border-[#E9DCCB] flex items-center justify-center text-[#513321] text-xs transform transition-transform duration-300 ${
              isOpen ? 'rotate-180 border-[#C49A4A]' : ''
            }`}
          >
            ▼
          </span>
        </div>
      </button>

      {/* Dropdown Menu Panel with Top Stacking and Smooth Animation */}
      {isOpen && (
        <div className="absolute z-[999999] left-0 right-0 mt-2 rounded-2xl bg-[#FFFEFB] border border-[#E9DCCB] shadow-2xl overflow-hidden animate-dropdown-slide-down">
          {/* Header info inside dropdown */}
          <div className="px-4 py-2.5 bg-[#F7EFE5] border-b border-[#E9DCCB] flex justify-between items-center text-[10px] uppercase tracking-wider text-[#513321] font-bold">
            <span className="flex items-center space-x-1.5">
              <span>⚜️</span>
              <span>Select Tradition &amp; Sacred Symbol</span>
            </span>
            <span className="text-[#8C6D58] font-mono font-bold">{INVITATION_TYPES.length} Traditions</span>
          </div>

          {/* Options List */}
          <div className="max-h-72 sm:max-h-80 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
            {INVITATION_TYPES.map((type) => {
              const isSelected = type.id === value;
              const count = getPresetCount(type.id);

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleSelect(type.id)}
                  className={`w-full px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between text-left group cursor-pointer ${
                    isSelected
                      ? 'bg-[#FBF1E2] border border-[#C49A4A] text-[#513321] font-bold shadow-xs'
                      : 'hover:bg-[#F7EFE5] hover:translate-x-1 text-[#513321] border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden min-w-0">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-transform duration-200 group-hover:scale-110 shrink-0 ${
                      isSelected 
                        ? 'bg-[#D6AD61] text-[#382416] font-black shadow-sm' 
                        : 'bg-[#FFF9F2] border border-[#E9DCCB] text-[#513321] group-hover:border-[#C49A4A]'
                    }`}>
                      {type.symbol}
                    </span>
                    <div className="truncate min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-semibold ${isSelected ? 'text-[#382416] font-bold' : 'text-[#513321]'}`}>
                          {type.label}
                        </span>
                        <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-900 font-bold border border-amber-500/25 shrink-0 uppercase">
                          {type.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8C6D58] truncate mt-0.5 group-hover:text-[#513321]">
                        {type.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-2">
                    {count !== null && count > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-[#F2E5D5] text-[#513321] border border-[#E9DCCB]">
                        {count} {count === 1 ? 'Design' : 'Designs'}
                      </span>
                    )}
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#D6AD61] text-[#382416] font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
