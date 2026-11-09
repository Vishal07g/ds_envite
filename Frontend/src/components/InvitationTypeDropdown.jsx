import React, { useState, useEffect, useRef } from 'react';

export const INVITATION_TYPES = [
  { id: 'all', label: 'All Invitation Types', symbol: '✨', badge: 'All Themes', desc: 'Explore full collection of wedding & event designs' },
  { id: 'secular', label: 'Secular / Modern Classic', symbol: '❤', badge: 'Classic', desc: 'Elegant romantic designs suitable for all couples' },
  { id: 'hindu', label: 'Hindu Wedding (Vedic)', symbol: '🕉', badge: 'Ganesha & Om', desc: 'Traditional vivah templates with auspicious mantras' },
  { id: 'christian', label: 'Christian Holy Matrimony', symbol: '✝', badge: 'Cross & Vows', desc: 'Sacred cathedral & scripture-inspired invitations' },
  { id: 'islamic', label: 'Islamic Nikah & Walima', symbol: '☪', badge: 'Bismillah', desc: 'Ornate Islamic calligraphy & geometric patterns' },
  { id: 'sikh', label: 'Sikh Anand Karaj', symbol: '☬', badge: 'Ek Onkar', desc: 'Royal Punjabi Sikh matrimony invitation cards' },
  { id: 'jewish', label: 'Jewish Matrimony', symbol: '✡', badge: 'Mazel Tov', desc: 'Traditional Hebrew matrimony & wedding celebration' },
  { id: 'buddhist', label: 'Buddhist Sacred Union', symbol: '☸', badge: 'Lotus Union', desc: 'Serene lotus & mindfulness themed ceremony' }
];

export default function InvitationTypeDropdown({ value = 'all', onChange, className = '', labelText = 'Invitation Type' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedType = INVITATION_TYPES.find(t => t.id === value) || INVITATION_TYPES[0];

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
      className={`relative inline-block text-left w-full sm:w-80 transition-all ${
        isOpen ? 'z-[999999] isolate' : 'z-20'
      } ${className}`}
    >
      {labelText && (
        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-amber-300/90 mb-1.5 flex items-center justify-between">
          <span>{labelText}</span>
          <span className="text-[9px] text-slate-400 font-mono font-medium">
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
        className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 flex items-center justify-between shadow-lg cursor-pointer backdrop-blur-md ${
          isOpen
            ? 'bg-slate-900 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-amber-200'
            : 'bg-slate-950/80 hover:bg-slate-900/90 border-slate-700/80 hover:border-amber-500/60 text-slate-100'
        }`}
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 text-sm font-bold shrink-0 shadow-inner">
            {selectedType.symbol}
          </span>
          <div className="text-left truncate">
            <span className="block text-xs font-bold font-cinzel tracking-wide text-amber-100 truncate">
              {selectedType.label}
            </span>
            <span className="block text-[10px] text-slate-400 font-medium truncate">
              {selectedType.badge}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 ml-2">
          {value !== 'all' && (
            <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Active
            </span>
          )}
          <span
            className={`w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400 text-xs transform transition-transform duration-300 ${
              isOpen ? 'rotate-180 bg-amber-500/20 text-amber-300' : ''
            }`}
          >
            ▼
          </span>
        </div>
      </button>

      {/* Dropdown Menu Panel with Smooth CSS Animation */}
      {isOpen && (
        <div className="absolute z-[999999] left-0 right-0 mt-2 rounded-2xl bg-[#0d1322] border border-amber-500/50 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden animate-dropdown-slide-down">
          {/* Header info inside dropdown */}
          <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex justify-between items-center text-[10px] uppercase tracking-wider text-amber-400/90 font-bold">
            <span>Select Category</span>
            <span className="text-slate-500 font-mono">{INVITATION_TYPES.length} Types Available</span>
          </div>

          {/* Options List */}
          <div className="max-h-72 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
            {INVITATION_TYPES.map((type) => {
              const isSelected = type.id === value;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleSelect(type.id)}
                  className={`w-full px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between text-left group cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/25 via-amber-500/15 to-transparent border border-amber-500/40 text-amber-200 shadow-md font-bold'
                      : 'hover:bg-slate-800/70 hover:translate-x-1 text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-transform duration-200 group-hover:scale-110 ${
                      isSelected 
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md' 
                        : 'bg-slate-900 border border-slate-700 text-amber-300 group-hover:border-amber-400/60'
                    }`}>
                      {type.symbol}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-semibold ${isSelected ? 'text-amber-100 font-bold' : 'text-slate-100 group-hover:text-amber-200'}`}>
                          {type.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 group-hover:text-slate-300">
                        {type.desc}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 ml-2 shadow">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
