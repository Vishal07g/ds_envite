import React, { useState, useEffect, useRef } from 'react';
import { TIMELINE_CLIPARTS } from '../data/timelineDefaults';
import { SvgCheck, SvgX, SvgSparkles } from './icons';

export default function TimelineClipartSelector({
  isOpen = false,
  onClose,
  selectedClipartId = "haldi-bowl",
  customImageUrl = "",
  onSelectClipart,
  anchorRect = null
}) {
  const popoverRef = useRef(null);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("all");
  const [uploadError, setUploadError] = useState("");

  // Categories
  const categories = [
    { id: "all", label: "All Motifs" },
    { id: "haldi", label: "Haldi" },
    { id: "mehendi", label: "Mehendi" },
    { id: "sangeet", label: "Sangeet" },
    { id: "wedding", label: "Wedding" },
    { id: "reception", label: "Reception" },
    { id: "other", label: "Other" },
    { id: "custom", label: "Custom Upload" }
  ];

  // Close on Escape & outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose && onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter cliparts
  const clipartList = Object.values(TIMELINE_CLIPARTS);
  const filteredCliparts = activeTab === "all" 
    ? clipartList 
    : clipartList.filter(c => c.category === activeTab);

  // Handle custom upload
  const handleCustomUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError("Please upload a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size exceeds 5MB. Please choose a smaller image.");
      return;
    }

    setUploadError("");
    const reader = new FileReader();
    reader.onload = (evt) => {
      onSelectClipart && onSelectClipart({
        clipartId: "custom",
        customImageUrl: evt.target.result
      });
      onClose && onClose();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        ref={popoverRef}
        className="w-full max-w-lg bg-slate-950 border border-amber-500/40 rounded-2xl shadow-2xl p-5 space-y-4 text-slate-100 max-h-[85vh] flex flex-col relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-amber-400">✨</span>
            <h3 className="font-bold text-sm text-amber-200 uppercase tracking-wider font-sans">
              Choose Ceremony Illustration
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close Clipart Menu"
          >
            <SvgX className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 custom-scrollbar text-xs">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
                activeTab === cat.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-grow space-y-4 pr-1 custom-scrollbar">

          {/* Option: No Illustration */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-dashed border-slate-600 flex items-center justify-center text-xs text-slate-400">
                Ø
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">No Illustration</p>
                <p className="text-[10px] text-slate-400">Display only ceremony title &amp; dates without circular clipart</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectClipart && onSelectClipart({ clipartId: "none", customImageUrl: "" });
                onClose && onClose();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedClipartId === "none"
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {selectedClipartId === "none" ? "Selected ✓" : "Select"}
            </button>
          </div>

          {/* Custom Upload Tab view */}
          {activeTab === "custom" && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-3 text-center">
              <p className="text-xs text-amber-300 font-semibold">Upload Your Own Ceremony Artwork</p>
              <p className="text-[11px] text-slate-400">Upload a square transparent PNG, SVG, or JPG under 5MB.</p>
              
              {customImageUrl && (
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-amber-400 p-1 shadow-lg bg-slate-800">
                  <img src={customImageUrl} alt="Current Custom Illustration" className="w-full h-full object-cover rounded-full" />
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-md"
              >
                Choose Image File
              </button>

              {uploadError && (
                <p className="text-xs text-rose-400 font-medium">{uploadError}</p>
              )}
            </div>
          )}

          {/* Grid of Preset SVG Cliparts */}
          {activeTab !== "custom" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredCliparts.map((item) => {
                const isSelected = selectedClipartId === item.id && !customImageUrl;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectClipart && onSelectClipart({ clipartId: item.id, customImageUrl: "" });
                      onClose && onClose();
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col items-center text-center space-y-2 transition transform hover:scale-[1.02] relative ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px] shadow">
                        ✓
                      </span>
                    )}

                    {/* SVG Artwork container */}
                    <div 
                      className="w-16 h-16 rounded-full overflow-hidden border border-amber-500/40 p-1 bg-amber-50/10 shadow-inner flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: item.svg }}
                    />

                    {/* Name & Category */}
                    <div>
                      <p className="text-xs font-semibold text-slate-100 truncate max-w-[120px]">{item.name}</p>
                      <p className="text-[9px] uppercase tracking-wider text-amber-400/80 font-mono mt-0.5">{item.category}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
