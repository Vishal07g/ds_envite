import React, { useState, useRef } from 'react';
import { 
  DEFAULT_LANDING_THEME, 
  DEFAULT_CUSTOM_BG_IMAGES,
  DEFAULT_VISIBILITY,
  DEFAULT_TRANSPARENCY
} from '../data/landingThemeDefaults';
import CinematicHeroBanner from './CinematicHeroBanner';
import CinematicLandingBackground from './CinematicLandingBackground';
import { SvgCheck, SvgPlus, SvgTrash } from './icons';

/**
 * Full Landing Page Theme Customization Studio
 * Embedded inside the Logo & Branding Tab in AdminDashboard
 * - Replaced static presets with full Custom Background Images management
 * - Upload local files or paste image URLs
 * - Select, preview, and delete custom backdrops
 * - Full Hide / Unhide element controls
 * - Full Transparency & Border Opacity controls under text layout
 * - Real-time responsive simulation for Desktop, Tablet, and Mobile
 */
export default function LandingThemeCustomizer({ brandSettings, onSave, showToast }) {
  const [theme, setTheme] = useState(() => {
    const raw = brandSettings?.landingTheme || JSON.parse(JSON.stringify(DEFAULT_LANDING_THEME));
    const rawBg = raw.background || {};
    return {
      ...raw,
      background: {
        ...DEFAULT_LANDING_THEME.background,
        ...rawBg,
        customImages: Array.isArray(rawBg.customImages) && rawBg.customImages.length > 0
          ? rawBg.customImages
          : [...DEFAULT_CUSTOM_BG_IMAGES]
      },
      visibility: { ...DEFAULT_VISIBILITY, ...(raw.visibility || {}) },
      transparency: { ...DEFAULT_TRANSPARENCY, ...(raw.transparency || {}) }
    };
  });

  const [activeSection, setActiveSection] = useState("custom-images"); // 'custom-images', 'visibility', 'transparency', 'colors', 'decorations', 'layout', 'typography'
  const [previewDevice, setPreviewDevice] = useState("desktop"); // 'desktop', 'tablet', 'mobile'
  const [history, setHistory] = useState([theme]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Custom image input form states
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageTitle, setNewImageTitle] = useState("");
  const fileInputRef = useRef(null);

  // Update theme and record history for undo/redo
  const updateTheme = (updater) => {
    const nextTheme = typeof updater === 'function' ? updater(theme) : updater;
    setTheme(nextTheme);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(nextTheme);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setTheme(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setTheme(history[historyIndex + 1]);
    }
  };

  // Reset to Master Reference Defaults
  const handleResetDefaults = () => {
    updateTheme(JSON.parse(JSON.stringify(DEFAULT_LANDING_THEME)));
    showToast("Reset landing theme to Master Cinematic Reference defaults!", "info");
  };

  // Save Settings to Database
  const handleSave = () => {
    if (onSave) {
      onSave(theme);
    }
  };

  // Select an active background image
  const handleSelectActiveImage = (url) => {
    updateTheme(prev => ({
      ...prev,
      background: {
        ...prev.background,
        bgImage: url
      }
    }));
    showToast(url ? "Updated active background image for landing page!" : "Selected pure architectural canvas without image backdrop", "info");
  };

  // Add a new custom image from URL
  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) {
      showToast("Please enter a valid image URL", "error");
      return;
    }

    const title = newImageTitle.trim() || `Custom Backdrop ${((theme.background?.customImages || []).length + 1)}`;
    const newObj = {
      id: `bg-custom-${Date.now()}`,
      title,
      url: newImageUrl.trim(),
      badge: "Custom Upload"
    };

    updateTheme(prev => {
      const existing = prev.background?.customImages || [];
      return {
        ...prev,
        background: {
          ...prev.background,
          bgImage: newObj.url,
          customImages: [newObj, ...existing]
        }
      };
    });

    setNewImageUrl("");
    setNewImageTitle("");
    showToast(`Added "${title}" and set as active background!`, "success");
  };

  // Handle local image file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const title = file.name.replace(/\.[^/.]+$/, "") || "Uploaded Wedding Backdrop";
        const newObj = {
          id: `bg-file-${Date.now()}`,
          title,
          url: reader.result,
          badge: "Local File"
        };

        updateTheme(prev => {
          const existing = prev.background?.customImages || [];
          return {
            ...prev,
            background: {
              ...prev.background,
              bgImage: newObj.url,
              customImages: [newObj, ...existing]
            }
          };
        });
        showToast(`Uploaded "${title}" and set as active background!`, "success");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Delete a custom image from the gallery
  const handleDeleteCustomImage = (e, imgId, imgUrl) => {
    e.stopPropagation();
    updateTheme(prev => {
      const list = (prev.background?.customImages || []).filter(item => item.id !== imgId);
      const isCurrentlyActive = prev.background?.bgImage === imgUrl;
      return {
        ...prev,
        background: {
          ...prev.background,
          bgImage: isCurrentlyActive ? (list[0]?.url || "") : prev.background?.bgImage,
          customImages: list
        }
      };
    });
    showToast("Removed backdrop image from custom gallery", "info");
  };

  // Color change helper
  const handleColorChange = (key, value) => {
    updateTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value
      }
    }));
  };

  // Visibility toggle helper
  const handleToggleVisibility = (key) => {
    updateTheme(prev => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [key]: prev.visibility?.[key] === false ? true : false
      }
    }));
  };

  // Transparency change helper
  const handleTransparencyChange = (key, value) => {
    updateTheme(prev => ({
      ...prev,
      transparency: {
        ...prev.transparency,
        [key]: value
      }
    }));
  };

  // Responsive container preview styles
  const previewContainerWidths = {
    desktop: "w-full",
    tablet: "max-w-[820px] mx-auto",
    mobile: "max-w-[400px] mx-auto"
  };

  const customImagesList = theme.background?.customImages || DEFAULT_CUSTOM_BG_IMAGES;
  const activeBgImage = theme.background?.bgImage || "";

  return (
    <div className="space-y-6">
      {/* ====================================================
          STUDIO HEADER & TOP CONTROLS (High-Contrast Luxury Banner)
          ==================================================== */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#2A1810] via-[#3B2219] to-[#2A1810] border border-[#C49A4A]/50 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 text-white">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#F0D59D]">
              👑 Landing Page Theme Studio
            </span>
            <span className="text-[10px] font-extrabold bg-[#D6AD61]/20 text-[#FFF1BD] border border-[#D6AD61]/40 px-2.5 py-0.5 rounded-full">
              Custom Backdrop Edition
            </span>
          </div>
          <h2 className="text-xl font-cinzel font-black tracking-wide text-[#FFF9F2]">
            Custom Backgrounds &amp; Visual Controls
          </h2>
          <p className="text-xs text-[#EAD8D5] max-w-xl">
            Upload custom background images, toggle any element visibility, and fine-tune text border transparency.
          </p>
        </div>

        {/* Undo, Redo, Reset & Save Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="px-3.5 py-2 rounded-xl bg-[#4A2D22] border border-[#C49A4A]/30 text-[#FFF9F2] hover:bg-[#5C392C] text-xs font-bold disabled:opacity-40 transition cursor-pointer"
            title="Undo"
          >
            ↩ Undo
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="px-3.5 py-2 rounded-xl bg-[#4A2D22] border border-[#C49A4A]/30 text-[#FFF9F2] hover:bg-[#5C392C] text-xs font-bold disabled:opacity-40 transition cursor-pointer"
            title="Redo"
          >
            ↪ Redo
          </button>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2 rounded-xl bg-[#4A2D22] hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-bold transition cursor-pointer"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D6AD61] to-[#C49A4A] hover:from-[#C49A4A] hover:to-[#B58A43] text-[#2A1810] font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition flex items-center space-x-2 cursor-pointer transform hover:scale-102"
          >
            <SvgCheck className="w-4 h-4 text-[#2A1810]" />
            <span>Save Theme</span>
          </button>
        </div>
      </div>

      {/* ====================================================
          SUB-TAB NAVIGATION BAR (Harmonized, Clean & Solid)
          ==================================================== */}
      <div className="flex flex-wrap items-center gap-2 bg-[#FFFEFB] p-2 rounded-2xl border border-[#E9DCCB] shadow-sm">
        {[
          { id: "custom-images", label: "🖼️ Custom Background Images" },
          { id: "visibility", label: "👁️ Hide / Unhide Elements" },
          { id: "transparency", label: "🪟 Transparency & Borders" },
          { id: "colors", label: "🌸 Master Colors" },
          { id: "decorations", label: "🌹 Floral & Lanterns" },
          { id: "layout", label: "📐 Layout & Spacing" },
          { id: "typography", label: "✨ Typography & Effects" }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer select-none ${
              activeSection === tab.id
                ? "bg-gradient-to-r from-[#D6AD61] to-[#C49A4A] text-[#2A1810] shadow-md border border-[#C49A4A]"
                : "bg-[#FFF9F2] text-[#513321] hover:bg-[#F7EFE5] border border-[#E9DCCB]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ====================================================
          PANEL 1: CUSTOM BACKGROUND IMAGES & GALLERY
          ==================================================== */}
      {activeSection === "custom-images" && (
        <div className="p-6 rounded-3xl bg-[#FFFEFB] border border-[#E9DCCB] shadow-md space-y-6">
          <div className="border-b border-[#E9DCCB]/70 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[#513321]">
                Custom Background Images &amp; Backdrops
              </h3>
              <p className="text-xs text-[#8C6D58] mt-0.5">
                Upload your own wedding backdrop photos or paste URLs. Click any image to instantly set it as the landing page background.
              </p>
            </div>

            {/* Clear Image Button */}
            {activeBgImage && (
              <button
                type="button"
                onClick={() => handleSelectActiveImage("")}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-[#E9DCCB] text-[#513321] text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <span>🏛️</span>
                <span>Use Pure Architectural Canvas</span>
              </button>
            )}
          </div>

          {/* 1. Add Custom Image Input Card */}
          <div className="p-5 rounded-2xl bg-[#FFF9F2] border border-[#E9DCCB] space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#513321]">
              Add New Custom Backdrop
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Upload File */}
              <div className="p-4 rounded-xl bg-[#FFFEFB] border border-[#E9DCCB] space-y-2.5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#513321] block">Option A: Upload Local Image File</span>
                  <p className="text-[11px] text-[#7A6458]">Supports PNG, JPG, JPEG, WebP, SVG high-resolution backdrops</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D6AD61] to-[#C49A4A] hover:from-[#C49A4A] hover:to-[#B58A43] text-[#2A1810] font-black text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <SvgPlus className="w-4 h-4 text-[#2A1810]" />
                  <span>Choose Image from Computer</span>
                </button>
              </div>

              {/* Option B: Enter URL */}
              <form onSubmit={handleAddImageUrl} className="p-4 rounded-xl bg-[#FFFEFB] border border-[#E9DCCB] space-y-2.5">
                <span className="text-xs font-bold text-[#513321] block">Option B: Paste Image URL</span>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/wedding-arch.jpg"
                    className="w-full px-3 py-2 bg-[#FFF9F2] border border-[#E9DCCB] rounded-xl text-xs text-[#513321] placeholder-[#A8988D] focus:outline-none focus:border-[#C49A4A]"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newImageTitle}
                      onChange={(e) => setNewImageTitle(e.target.value)}
                      placeholder="Title / Description (optional)"
                      className="flex-1 px-3 py-2 bg-[#FFF9F2] border border-[#E9DCCB] rounded-xl text-xs text-[#513321] placeholder-[#A8988D] focus:outline-none focus:border-[#C49A4A]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#513321] hover:bg-[#382416] text-[#FFF9F2] font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                    >
                      Add Image
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* 2. Custom Images Gallery Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#513321]">
                Available Backdrops ({customImagesList.length})
              </span>
              <span className="text-[11px] text-[#7A6458] font-medium">
                Click any backdrop to set as active landing background
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {customImagesList.map((item) => {
                const isActive = activeBgImage === item.url;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectActiveImage(item.url)}
                    className={`relative rounded-2xl border-2 p-3.5 cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                      isActive
                        ? "bg-[#FFF9F2] border-[#C49A4A] shadow-xl ring-2 ring-[#C49A4A]/30 transform scale-102"
                        : "bg-[#FFFEFB] border-[#E9DCCB] hover:border-[#C49A4A]/60 hover:shadow-md"
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Image Thumbnail with Fixed 16:10 Ratio (Never stretched or squeezed) */}
                      <div className="w-full aspect-[16/10] rounded-xl overflow-hidden border border-[#E9DCCB] relative bg-[#2A1810] shadow-inner group">
                        <img 
                          src={item.url} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        {item.badge && (
                          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#2A1810]/85 border border-[#C49A4A]/40 text-[9px] font-black text-[#F0D59D] backdrop-blur-xs">
                            {item.badge}
                          </div>
                        )}
                        {isActive && (
                          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-[#D6AD61] text-[#2A1810] flex items-center space-x-1 font-black text-[10px] shadow-md border border-[#FEEA8C]">
                            <span>✓</span>
                            <span>Active</span>
                          </div>
                        )}
                      </div>

                      {/* Title & Delete Action */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <h4 className="text-xs font-bold text-[#513321] truncate font-cinzel">
                          {item.title}
                        </h4>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustomImage(e, item.id, item.url)}
                          className="p-1 rounded-lg text-[#A87B2E] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete backdrop"
                        >
                          <SvgTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Fine-Tune Selected Background Image */}
          <div className="p-5 rounded-2xl bg-[#FFF9F2] border border-[#E9DCCB] space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#513321]">
              Active Background Image Controls &amp; Atmospheric Filters
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <div className="flex justify-between text-xs font-bold text-[#513321] mb-1">
                  <span>Overlay Color Tint Opacity</span>
                  <span className="font-mono text-[#A87B2E] font-bold">
                    {Math.round((theme.background?.overlayOpacity ?? 0.15) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.9"
                  step="0.05"
                  value={theme.background?.overlayOpacity ?? 0.15}
                  onChange={(e) => updateTheme(prev => ({
                    ...prev,
                    background: { ...prev.background, overlayOpacity: parseFloat(e.target.value) }
                  }))}
                  className="w-full accent-[#C49A4A] bg-[#E9DCCB] rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-[#513321] mb-1">
                  <span>Vignette Shadow Intensity</span>
                  <span className="font-mono text-[#A87B2E] font-bold">
                    {Math.round((theme.background?.vignetteIntensity ?? 0.22) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.02"
                  value={theme.background?.vignetteIntensity ?? 0.22}
                  onChange={(e) => updateTheme(prev => ({
                    ...prev,
                    background: { ...prev.background, vignetteIntensity: parseFloat(e.target.value) }
                  }))}
                  className="w-full accent-[#C49A4A] bg-[#E9DCCB] rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-[#513321] mb-1">
                  <span>Backdrop Image Blur</span>
                  <span className="font-mono text-[#A87B2E] font-bold">
                    {theme.background?.blur ?? 0}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={theme.background?.blur ?? 0}
                  onChange={(e) => updateTheme(prev => ({
                    ...prev,
                    background: { ...prev.background, blur: parseInt(e.target.value) }
                  }))}
                  className="w-full accent-[#C49A4A] bg-[#E9DCCB] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          PANEL 2: HIDE / UNHIDE UNWANTED ELEMENTS
          ==================================================== */}
      {activeSection === "visibility" && (
        <div className="p-6 rounded-3xl bg-[#FFFEFB] border border-[#E9DCCB] shadow-md space-y-5">
          <div className="border-b border-[#E9DCCB]/70 pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#513321]">
              Hide / Unhide Landing Page Elements
            </h3>
            <p className="text-xs text-[#8C6D58] mt-0.5">
              Toggle any text, badges, cards, or interactive widgets on and off to curate a completely clean, focused layout
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: "showMicroPill", label: "Top Micro-Pill Badge", icon: "✨", desc: "'Next-Gen Interactive Digital Invitations' badge" },
              { key: "showHeadline", label: "Main Hero Headline", icon: "📰", desc: "'Craft Unforgettable Moments with Interactive Luxury'" },
              { key: "showSubtitle", label: "Hero Subtitle & Copy", icon: "📝", desc: "Detailed descriptive copy text paragraph" },
              { key: "showFeatureCards", label: "4 Interactive Feature Cards", icon: "🎴", desc: "Wax-seal, scratch, melodies & WhatsApp cards" },
              { key: "showCtaButtons", label: "Call-To-Action Buttons", icon: "🚀", desc: "'+ Draft Your Invitation' & 'Browse Presets'" },
              { key: "showRightArtwork", label: "Right Invitation Artwork Visual", icon: "💌", desc: "Complete 3D envelope & emerging card artwork" },
              { key: "showWaxSeal", label: "Center Wax Seal Monogram", icon: "🔴", desc: "Golden 'DS' wax seal stamp on envelope" },
              { key: "showScratchBadge", label: "Secret Date Scratch Simulation", icon: "🪙", desc: "Interactive scratch & reveal date card inside invitation" },
              { key: "showMusicBar", label: "Live Melody & RSVP Bar", icon: "🎵", desc: "Mini player indicator and Online RSVP tag" },
              { key: "showQualityCapsule", label: "Watermark-Free HD Capsule", icon: "🔒", desc: "Bottom security & HD quality trust capsule" },
              { key: "showFilterHub", label: "Celebration & Tradition Filter Hub", icon: "🏛️", desc: "Dropdown command center for categories & faith" },
              { key: "showSummaryCapsule", label: "Active Selection Summary Capsule", icon: "🌐", desc: "Filter pill showing active celebration & tradition" }
            ].map(({ key, label, icon, desc }) => {
              const isVisible = theme.visibility?.[key] !== false;
              return (
                <div
                  key={key}
                  onClick={() => handleToggleVisibility(key)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isVisible
                      ? "bg-[#FFF9F2] border-[#C49A4A] shadow-sm"
                      : "bg-[#F7EFE5]/50 border-[#E9DCCB] opacity-60 hover:opacity-90"
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{icon}</span>
                      <h4 className="text-xs font-black text-[#513321] truncate">{label}</h4>
                    </div>
                    <p className="text-[10px] text-[#7A6458] leading-snug">{desc}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shrink-0 transition ${
                    isVisible
                      ? "bg-[#D6AD61] text-[#2A1810] border border-[#C49A4A]"
                      : "bg-[#E9DCCB] text-[#7A6458]"
                  }`}>
                    {isVisible ? "Visible" : "Hidden"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================
          PANEL 3: TRANSPARENCY & LAYOUT BORDERS
          ==================================================== */}
      {activeSection === "transparency" && (
        <div className="p-6 rounded-3xl bg-[#FFFEFB] border border-[#E9DCCB] shadow-md space-y-6">
          <div className="border-b border-[#E9DCCB]/70 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[#513321]">
                Text Layout Borders &amp; Background Transparency
              </h3>
              <p className="text-xs text-[#8C6D58] mt-0.5">
                Make cards completely see-through, frosted glass, or solid so the background architecture shines through effortlessly
              </p>
            </div>

            {/* Quick Transparency Presets */}
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase text-[#8C6D58]">Presets:</span>
              <button
                type="button"
                onClick={() => updateTheme(prev => ({
                  ...prev,
                  transparency: {
                    ...prev.transparency,
                    heroBgOpacity: 0.05,
                    heroBorderOpacity: 0.2,
                    heroBlur: 20,
                    textCardBgOpacity: 0.1,
                    textCardBorderOpacity: 0.3,
                    textCardBlur: 16
                  }
                }))}
                className="px-2.5 py-1 rounded-lg bg-[#FAF4ED] border border-[#E9DCCB] hover:border-[#C49A4A] text-[10px] font-bold text-[#513321] transition cursor-pointer"
              >
                Ultra-Sheer Crystal
              </button>
              <button
                type="button"
                onClick={() => updateTheme(prev => ({
                  ...prev,
                  transparency: {
                    ...prev.transparency,
                    heroBgOpacity: 0.6,
                    heroBorderOpacity: 0.5,
                    heroBlur: 16,
                    textCardBgOpacity: 0.55,
                    textCardBorderOpacity: 0.45,
                    textCardBlur: 12
                  }
                }))}
                className="px-2.5 py-1 rounded-lg bg-[#FAF4ED] border border-[#E9DCCB] hover:border-[#C49A4A] text-[10px] font-bold text-[#513321] transition cursor-pointer"
              >
                Frosted Glass
              </button>
              <button
                type="button"
                onClick={() => updateTheme(prev => ({
                  ...prev,
                  transparency: {
                    ...prev.transparency,
                    heroBgOpacity: 0.95,
                    heroBorderOpacity: 0.8,
                    heroBlur: 8,
                    textCardBgOpacity: 0.9,
                    textCardBorderOpacity: 0.7,
                    textCardBlur: 6
                  }
                }))}
                className="px-2.5 py-1 rounded-lg bg-[#FAF4ED] border border-[#E9DCCB] hover:border-[#C49A4A] text-[10px] font-bold text-[#513321] transition cursor-pointer"
              >
                Solid Ivory
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hero Main Container Transparency */}
            <div className="p-5 rounded-2xl bg-[#FFF9F2] border border-[#E9DCCB] space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#513321]">
                Main Hero Container Transparency
              </h4>

              <div>
                <div className="flex justify-between text-xs font-bold text-[#513321] mb-1">
                  <span>Background Opacity (Transparency)</span>
                  <span className="font-mono text-[#A87B2E] font-black">
                    {Math.round((theme.transparency?.heroBgOpacity ?? 0.92) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={theme.transparency?.heroBgOpacity ?? 0.92}
                  onChange={(e) => handleTransparencyChange("heroBgOpacity", parseFloat(e.target.value))}
                  className="w-full accent-[#C49A4A] bg-[#E9DCCB] rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-[#513321] mb-1">
                  <span>Border Opacity / Visibility</span>
                  <span className="font-mono text-[#A87B2E] font-black">
                    {Math.round((theme.transparency?.heroBorderOpacity ?? 0.7) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={theme.transparency?.heroBorderOpacity ?? 0.7}
                  onChange={(e) => handleTransparencyChange("heroBorderOpacity", parseFloat(e.target.value))}
                  className="w-full accent-[#C49A4A] bg-[#E9DCCB] rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-[#513321] mb-1">
                  <span>Frosted Backdrop Blur</span>
                  <span className="font-mono text-[#A87B2E] font-black">
                    {theme.transparency?.heroBlur ?? 16}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="28"
                  step="2"
                  value={theme.transparency?.heroBlur ?? 16}
                  onChange={(e) => handleTransparencyChange("heroBlur", parseInt(e.target.value))}
                  className="w-full accent-[#C49A4A] bg-[#E9DCCB] rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Text & Feature Cards Underlay Transparency */}
            <div className="p-5 rounded-2xl bg-[#FFF9F2] border border-[#E9DCCB] space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#513321]">
                Text Layout &amp; Feature Cards Underlay
              </h4>

              <div>
                <div className="flex justify-between text-xs font-bold text-[#513321] mb-1">
                  <span>Under-Text Card Opacity (Transparency)</span>
                  <span className="font-mono text-[#A87B2E] font-black">
                    {Math.round((theme.transparency?.textCardBgOpacity ?? 0.85) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={theme.transparency?.textCardBgOpacity ?? 0.85}
                  onChange={(e) => handleTransparencyChange("textCardBgOpacity", parseFloat(e.target.value))}
                  className="w-full accent-[#C49A4A] bg-[#E9DCCB] rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-[#513321] mb-1">
                  <span>Under-Text Border Opacity</span>
                  <span className="font-mono text-[#A87B2E] font-black">
                    {Math.round((theme.transparency?.textCardBorderOpacity ?? 0.6) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={theme.transparency?.textCardBorderOpacity ?? 0.6}
                  onChange={(e) => handleTransparencyChange("textCardBorderOpacity", parseFloat(e.target.value))}
                  className="w-full accent-[#C49A4A] bg-[#E9DCCB] rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-[#513321] mb-1">
                  <span>Under-Text Glass Blur</span>
                  <span className="font-mono text-[#A87B2E] font-black">
                    {theme.transparency?.textCardBlur ?? 12}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="2"
                  value={theme.transparency?.textCardBlur ?? 12}
                  onChange={(e) => handleTransparencyChange("textCardBlur", parseInt(e.target.value))}
                  className="w-full accent-[#C49A4A] bg-[#E9DCCB] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          PANEL 4: MASTER COLOR SYSTEM
          ==================================================== */}
      {activeSection === "colors" && (
        <div className="p-6 rounded-3xl bg-[#FFFEFB] border border-[#E9DCCB] shadow-md space-y-5">
          <div className="border-b border-[#E9DCCB]/70 pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#513321]">
              Master Color System Tokens
            </h3>
            <p className="text-xs text-[#8C6D58] mt-0.5">
              Harmonized luxury palette with customizable hex inputs &amp; instant live updates
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: "primaryBg", label: "Primary Canvas Background", desc: "Main landing page canvas" },
              { key: "secondaryBg", label: "Secondary Background Depth", desc: "Depth & subtle shadows" },
              { key: "warmIvory", label: "Warm Ivory Surfaces", desc: "Cards, panels & dialogs" },
              { key: "blushPink", label: "Blush Pink Accents", desc: "Pills, badges & floral tones" },
              { key: "dustyRose", label: "Dusty Rose Highlights", desc: "Secondary floral & accents" },
              { key: "deepRosewood", label: "Deep Rosewood Contrast", desc: "Subheadings & contrast pills" },
              { key: "champagneGold", label: "Champagne Gold Foils", desc: "Borders, wax seals & stars" },
              { key: "softWhite", label: "Soft White Highlights", desc: "Pure card surfaces" },
              { key: "darkBrown", label: "Dark Espresso / Brown", desc: "Headlines & prominent text" }
            ].map(({ key, label, desc }) => (
              <div key={key} className="p-3.5 rounded-xl bg-[#FFF9F2] border border-[#E9DCCB] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#513321]">{label}</label>
                  <span className="text-[10px] font-mono font-bold text-[#A87B2E]">
                    {theme.colors?.[key] || "#FFFFFF"}
                  </span>
                </div>
                <p className="text-[10px] text-[#7A6458]">{desc}</p>
                <div className="flex items-center space-x-2.5">
                  <input
                    type="color"
                    value={theme.colors?.[key] || "#FFFFFF"}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={theme.colors?.[key] || "#FFFFFF"}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#FFFEFB] border border-[#E9DCCB] text-xs font-mono font-bold text-[#513321] focus:outline-none focus:border-[#C49A4A]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================
          PANEL 5: FLORAL & LANTERN DECORATIONS
          ==================================================== */}
      {activeSection === "decorations" && (
        <div className="p-6 rounded-3xl bg-[#FFFEFB] border border-[#E9DCCB] shadow-md space-y-5">
          <div className="border-b border-[#E9DCCB]/70 pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#513321]">
              Architectural &amp; Decorative Elements
            </h3>
            <p className="text-xs text-[#8C6D58] mt-0.5">Toggle individual layers to frame the composition</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: "showArch", label: "Grand Classical Arch", icon: "🏛️", desc: "Curved Roman/Mughal decorative archway" },
              { key: "showFlorals", label: "Cascading White Roses", icon: "🌹", desc: "Blush floral clusters along columns" },
              { key: "showLanterns", label: "Hanging Brass Lanterns", icon: "🏮", desc: "Warm glowing candlelight fixtures" },
              { key: "showPetals", label: "Drifting Rose Petals", icon: "🌸", desc: "Gentle animated ambient petals" }
            ].map(({ key, label, icon, desc }) => {
              const isEnabled = theme.decorations?.[key] !== false;
              return (
                <div
                  key={key}
                  onClick={() => updateTheme(prev => ({
                    ...prev,
                    decorations: {
                      ...prev.decorations,
                      [key]: !isEnabled
                    }
                  }))}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isEnabled
                      ? "bg-[#FFF9F2] border-[#C49A4A] shadow-md"
                      : "bg-[#F7EFE5]/50 border-[#E9DCCB] opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{icon}</span>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      isEnabled ? "bg-[#D6AD61] text-[#2A1810]" : "bg-[#E9DCCB] text-[#8C6D58]"
                    }`}>
                      {isEnabled ? "✓" : "×"}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-[#513321]">{label}</h4>
                  <p className="text-[10px] text-[#7A6458] mt-1">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================
          PANEL 6: LAYOUT & SPACING
          ==================================================== */}
      {activeSection === "layout" && (
        <div className="p-6 rounded-3xl bg-[#FFFEFB] border border-[#E9DCCB] shadow-md space-y-5">
          <div className="border-b border-[#E9DCCB]/70 pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#513321]">
              Hero Section Layout &amp; Proportions
            </h3>
            <p className="text-xs text-[#8C6D58] mt-0.5">Editorial split proportions (Content ~52% / Artwork ~46%)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-[#FFF9F2] border border-[#E9DCCB] space-y-3">
              <div className="flex justify-between text-xs font-bold text-[#513321]">
                <span>Left Content Width</span>
                <span className="font-mono text-[#A87B2E] font-bold">{theme.layout?.contentRatio || 52}%</span>
              </div>
              <input
                type="range"
                min="44"
                max="60"
                step="1"
                value={theme.layout?.contentRatio || 52}
                onChange={(e) => updateTheme(prev => ({
                  ...prev,
                  layout: {
                    ...prev.layout,
                    contentRatio: parseInt(e.target.value),
                    artworkRatio: 98 - parseInt(e.target.value)
                  }
                }))}
                className="w-full accent-[#C49A4A] bg-[#E9DCCB] rounded-lg cursor-pointer"
              />
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF9F2] border border-[#E9DCCB] space-y-3">
              <div className="flex justify-between text-xs font-bold text-[#513321]">
                <span>Right Artwork Width</span>
                <span className="font-mono text-[#A87B2E] font-bold">{theme.layout?.artworkRatio || 46}%</span>
              </div>
              <input
                type="range"
                min="38"
                max="54"
                step="1"
                value={theme.layout?.artworkRatio || 46}
                onChange={(e) => updateTheme(prev => ({
                  ...prev,
                  layout: {
                    ...prev.layout,
                    artworkRatio: parseInt(e.target.value),
                    contentRatio: 98 - parseInt(e.target.value)
                  }
                }))}
                className="w-full accent-[#C49A4A] bg-[#E9DCCB] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          PANEL 7: TYPOGRAPHY & VISUAL EFFECTS
          ==================================================== */}
      {activeSection === "typography" && (
        <div className="p-6 rounded-3xl bg-[#FFFEFB] border border-[#E9DCCB] shadow-md space-y-5">
          <div className="border-b border-[#E9DCCB]/70 pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#513321]">
              Typography &amp; Lighting Effects
            </h3>
            <p className="text-xs text-[#8C6D58] mt-0.5">Editorial serif fonts, key highlights &amp; ambient radiance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-[#FFF9F2] border border-[#E9DCCB] space-y-3">
              <label className="text-xs font-bold text-[#513321] block">Display Heading Font</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "Cinzel, serif", name: "Cinzel (Luxury Serif)" },
                  { id: "Playfair Display, serif", name: "Playfair Display" },
                  { id: "Cormorant Garamond, serif", name: "Cormorant Garamond" },
                  { id: "Plus Jakarta Sans, sans-serif", name: "Plus Jakarta Sans" }
                ].map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => updateTheme(prev => ({
                      ...prev,
                      typography: {
                        ...prev.typography,
                        headingFont: font.id
                      }
                    }))}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                      theme.typography?.headingFont === font.id
                        ? "bg-[#D6AD61] text-[#2A1810] border-[#C49A4A]"
                        : "bg-[#FFFEFB] border-[#E9DCCB] text-[#513321] hover:border-[#C49A4A]"
                    }`}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF9F2] border border-[#E9DCCB] space-y-3">
              <div className="flex justify-between text-xs font-bold text-[#513321]">
                <span>Ambient Glow Radiance</span>
                <span className="font-mono text-[#A87B2E] font-bold">
                  {Math.round((theme.effects?.ambientGlow || 0.28) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.6"
                step="0.02"
                value={theme.effects?.ambientGlow || 0.28}
                onChange={(e) => updateTheme(prev => ({
                  ...prev,
                  effects: {
                    ...prev.effects,
                    ambientGlow: parseFloat(e.target.value)
                  }
                }))}
                className="w-full accent-[#C49A4A] bg-[#E9DCCB] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          INTERACTIVE LIVE PREVIEW (Desktop, Tablet, Mobile)
          ==================================================== */}
      <div className="p-6 rounded-3xl bg-[#FFFEFB] border border-[#E9DCCB] shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9DCCB]/70 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-[#513321] uppercase tracking-wider">
              📱 Live Landing Page Preview
            </span>
            <span className="text-[10px] text-[#8C6D58] font-mono">
              (Interactive Full Resolution Simulation)
            </span>
          </div>

          {/* Viewport Switcher */}
          <div className="flex items-center bg-[#FAF4ED] rounded-xl p-1 border border-[#E9DCCB]">
            {[
              { id: "desktop", label: "🖥️ Desktop" },
              { id: "tablet", label: "💻 Tablet" },
              { id: "mobile", label: "📱 Mobile" }
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setPreviewDevice(d.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  previewDevice === d.id
                    ? "bg-[#D6AD61] text-[#2A1810] shadow-sm font-black"
                    : "text-[#7A6458] hover:text-[#513321]"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Viewport Frame with Proper Aspect & Scaling */}
        <div className={`transition-all duration-500 relative rounded-3xl overflow-hidden border-2 border-[#E9DCCB] shadow-2xl ${previewContainerWidths[previewDevice]}`}>
          {/* Simulated Floating Navbar inside Preview */}
          <div className="w-full py-3.5 px-6 border-b flex items-center justify-between relative z-20"
            style={{
              backgroundColor: `${theme.colors?.softWhite || '#FFFDFC'}EE`,
              borderColor: `${theme.colors?.champagneGold || '#C7A36B'}30`,
              backdropFilter: "blur(12px)"
            }}
          >
            <div className="flex items-center space-x-2.5">
              {brandSettings?.logoUrl ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#C49A4A]/40 shrink-0">
                  <img src={brandSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="p-1 rounded-full bg-amber-500/10 text-amber-500 text-xs">✦</div>
              )}
              <span className="font-cinzel text-xs font-bold" style={{ color: theme.colors?.darkBrown || '#422C2B' }}>
                {brandSettings?.brandName || "DS ENVITES"}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-bold" style={{ color: theme.colors?.deepRosewood || '#713D3B' }}>
              <span className="hidden sm:inline">Browse Presets</span>
              <span className="px-3 py-1 rounded-full text-white text-[10px] font-extrabold" style={{ backgroundColor: theme.colors?.deepRosewood || '#713D3B' }}>
                Login
              </span>
            </div>
          </div>

          {/* Interactive Live Hero Banner Render inside Preview */}
          <div className="relative p-4 sm:p-6 lg:p-8 min-h-[560px] overflow-hidden">
            {/* Background Layer inside preview */}
            <CinematicLandingBackground theme={theme} className="!absolute" />
            
            {/* Foreground Content inside preview */}
            <div className="relative z-10">
              <CinematicHeroBanner
                theme={theme}
                onDraftClick={() => {}}
                onExploreClick={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
