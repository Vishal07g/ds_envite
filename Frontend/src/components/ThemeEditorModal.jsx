import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SvgX, SvgCheck, SvgPlus, SvgEye, SvgEdit, SvgSliders, SvgSparkles } from './icons';
import dbStore, { DEFAULT_CONFIG, CURATED_MUSIC_PRESETS } from '../data/store';
import { useAuth } from '../context/AuthContext';

export default function ThemeEditorModal({ isOpen, preset, onClose, onSave, showToast }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [activeTab, setActiveTab] = useState("couple"); // couple, venue, colors, text, media, metadata
  const testAudioRef = React.useRef(null);
  const [testAudioPlaying, setTestAudioPlaying] = useState(false);
  const testStartingAudioRef = React.useRef(null);
  const [testStartingAudioPlaying, setTestStartingAudioPlaying] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    religion: "secular",
    brideName: "Suman",
    groomName: "Vishal",
    brideFatherName: "Mr. Rajesh Sharma",
    brideMotherName: "Mrs. Anita Sharma",
    groomFatherName: "Mr. Vijay Patel",
    groomMotherName: "Mrs. Sunita Patel",
    weddingDate: "2026-11-20T16:00:00",
    weddingVenue: "The Starlight Cathedral",
    weddingAddress: "100 Seraphim Way, Glass Valley, CA",
    weddingMapUrl: "https://maps.google.com/?q=Starlight+Cathedral",
    receptionDate: "2026-11-21T18:00:00",
    receptionVenue: "The Gilded Glass Greenhouse",
    receptionAddress: "450 Conservatory Road, Glass Valley, CA",
    receptionMapUrl: "https://maps.google.com/?q=Gilded+Glass+Greenhouse",
    introQuote: "Joined in holy matrimony, we celebrate a bond written in heaven and lived in faith.",
    customSacredSymbol: "❤",
    customSacredVerse: "“And now these three remain: faith, hope and love. But the greatest of these is love.” - 1 Corinthians 13:13",
    scratchSecretMessage: "We have booked a private stargazing toast after the reception! Grab a custom lantern at the main exit.",
    storyTitle: "Vows of Two Dynasties",
    storySubtitle: "MEET THE FAMILIES",
    storyParagraph: "From a chance encounter under rain-slicked maple leaves to cozy late-night kitchen dances, our journey has been a collection of golden fragments.",
    storyBrideParentLabel: "Daughter of",
    storyGroomParentLabel: "Son of",
    primaryColor: "#fdfbf7",
    accentGold: "#b89254",
    lightBgColor: "#faf6f0",
    sacredSymbolColor: "#8a2b3f",
    sacredVerseColor: "#4a4a4a",
    coverBrideColor: "#8a2b3f",
    coverGroomColor: "#8a2b3f",
    coverAmpersandColor: "#b89254",
    coverSubheadingColor: "#4a4a4a",
    coverTopTaglineColor: "#8a2b3f",
    coverBottomTaglineColor: "#8a2b3f",
    envelopeBgColor: "#8a2b3f",
    envelopeSealColor: "#b89254",
    envelopeSealShape: "organic",
    envelopeFlapShape: "classic-v",
    envelopeParticleType: "sparkles",
    envelopeSealType: "heart",
    envelopeWaxSealImg: "",
    glassBtnBg: "rgba(138, 43, 63, 0.08)",
    glassBtnBorder: "rgba(184, 146, 84, 0.4)",
    glassBtnText: "#8a2b3f",
    heroImage: "/bg_floral_pink.jpg",
    storyImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200",
    scratchImage: "",
    venueCeremonyImage: "",
    venueReceptionImage: ""
  });

  useEffect(() => {
    if (preset) {
      const cfg = preset.config || {};
      setFormData({
        ...DEFAULT_CONFIG,
        title: preset.title || "Custom Theme",
        religion: preset.religion || cfg.religionKey || "secular",
        ...cfg,
        weddingDate: cfg.weddingDate ? cfg.weddingDate.slice(0, 16) : "2026-11-20T16:00",
        receptionDate: cfg.receptionDate ? cfg.receptionDate.slice(0, 16) : "2026-11-21T18:00"
      });
    } else {
      setFormData({
        ...DEFAULT_CONFIG,
        title: "New Custom Theme Preset",
        religion: "secular",
        heroImage: "/bg_floral_pink.jpg"
      });
    }
  }, [preset, isOpen]);

  if (!isOpen) return null;

  const buildFinalConfig = () => {
    return {
      ...DEFAULT_CONFIG,
      ...(preset?.config || {}),
      ...formData,
      religionKey: formData.religion,
      weddingDate: formData.weddingDate ? (formData.weddingDate.includes('T') ? formData.weddingDate : `${formData.weddingDate}T16:00:00`) : DEFAULT_CONFIG.weddingDate,
      receptionDate: formData.receptionDate ? (formData.receptionDate.includes('T') ? formData.receptionDate : `${formData.receptionDate}T18:00:00`) : DEFAULT_CONFIG.receptionDate
    };
  };

  // Submit for Admin (Save Global Theme Preset)
  const handleAdminSavePreset = (e) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      showToast && showToast("Theme title is required", "error");
      return;
    }

    const finalConfig = buildFinalConfig();

    let result = null;
    if (preset && preset.id) {
      result = dbStore.updatePreset(preset.id, {
        title: formData.title.trim(),
        religion: formData.religion,
        config: finalConfig
      });
      showToast && showToast(`Preset theme "${formData.title}" saved successfully!`, "success");
    } else {
      result = dbStore.createPreset(
        formData.title.trim(),
        formData.religion,
        finalConfig
      );
      showToast && showToast(`New theme preset "${formData.title}" created!`, "success");
    }

    onSave && onSave(result);
    onClose && onClose();
  };

  // Save for Customer (Save Draft Invitation to Dashboard)
  const handleCustomerSaveDraft = () => {
    if (!currentUser) {
      // Save temp preview config and redirect to login
      sessionStorage.setItem("preview_temp_config", JSON.stringify(buildFinalConfig()));
      showToast && showToast("Please log in or sign up to save this design draft to your portal.", "info");
      navigate("/login");
      return;
    }

    const finalConfig = buildFinalConfig();
    const invTitle = `${formData.brideName || 'Bride'} & ${formData.groomName || 'Groom'}'s Wedding`;
    
    const newInv = dbStore.createInvitation(
      currentUser.id,
      invTitle,
      finalConfig,
      false, // unpaid
      "draft"
    );

    showToast && showToast(`Design draft "${invTitle}" saved to your Customer Portal!`, "success");
    onClose && onClose();
    navigate("/customer");
  };

  // Open Live Interactive Preview
  const handleLivePreview = () => {
    const finalConfig = buildFinalConfig();
    sessionStorage.setItem("preview_temp_config", JSON.stringify(finalConfig));
    sessionStorage.setItem("preview_preset_id", preset?.id || "custom-draft");
    onClose && onClose();
    window.open(`/invite/demo?preset=${preset?.id || 'demo'}&preview=true`, '_blank');
  };

  // Open Full Visual Editor (for Admin or Customer)
  const handleOpenFullEditor = () => {
    const finalConfig = buildFinalConfig();
    sessionStorage.setItem("preview_temp_config", JSON.stringify(finalConfig));

    if (isAdmin) {
      if (preset && preset.id) {
        dbStore.updatePreset(preset.id, { config: finalConfig });
      }
      onClose && onClose();
      navigate('/admin/editor');
    } else if (currentUser) {
      const invTitle = `${formData.brideName || 'Bride'} & ${formData.groomName || 'Groom'}'s Wedding`;
      const newInv = dbStore.createInvitation(currentUser.id, invTitle, finalConfig, false, "draft");
      onClose && onClose();
      navigate(`/admin/editor/${newInv.id}`);
    } else {
      showToast && showToast("Please log in to open full visual customization editor.", "info");
      navigate("/login");
    }
  };

  const handleFileUpload = (field, e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setFormData(prev => ({ ...prev, [field]: evt.target.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in font-sans">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto p-5 sm:p-6 rounded-2xl border border-amber-500/40 bg-slate-950 text-slate-100 space-y-5 shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition"
        >
          <SvgX className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 border-b border-slate-800 pb-3 pr-8">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
              {isAdmin ? "Admin Preset Theme Editor" : "Customer Theme Customization"}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Tag: {formData.religion}
            </span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-100">
            {preset ? `Customize: "${formData.title}"` : "Create New Theme Design"}
          </h2>
          <p className="text-xs text-slate-400">
            {isAdmin 
              ? "Modify all bride, groom, parents, ceremony venues, map links, colors, and quotes to save globally."
              : "Customize names, ceremony venues, maps, quotes, and colors to preview or save to your dashboard portal."}
          </p>
        </div>

        {/* Live Visual Banner Preview */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-inner">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Live Design Card Preview</span>
            <button
              type="button"
              onClick={handleLivePreview}
              className="text-[10px] font-bold text-amber-300 hover:text-amber-200 underline flex items-center space-x-1 cursor-pointer"
            >
              <SvgEye className="w-3.5 h-3.5" />
              <span>Full Screen Live Preview</span>
            </button>
          </div>

          {(() => {
            const hex = (formData.primaryColor || "#0b1329").replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16) || 0;
            const g = parseInt(hex.substring(2, 4), 16) || 0;
            const b = parseInt(hex.substring(4, 6), 16) || 0;
            const isLightBg = ((r * 299 + g * 587 + b * 114) / 1000) > 155;

            return (
              <div 
                className="h-44 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden bg-cover bg-center border border-white/10 shadow-lg transition-all group"
                style={{ 
                  backgroundColor: formData.primaryColor || '#0b1329',
                  backgroundImage: `linear-gradient(${isLightBg ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.45)'}, ${isLightBg ? 'rgba(255,255,255,0.70)' : 'rgba(0,0,0,0.75)'}), url("${formData.heroImage || '/bg_floral_pink.jpg'}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div 
                  className="absolute inset-2.5 border rounded-xl pointer-events-none transition-all duration-300 group-hover:scale-95"
                  style={{ borderColor: formData.accentGold || '#f59e0b', opacity: 0.6 }}
                />

                <div className="flex justify-between items-center z-10">
                  <span className="text-base font-bold drop-shadow-md" style={{ color: isLightBg ? '#8a2b3f' : (formData.accentGold || '#f59e0b') }}>
                    {formData.customSacredSymbol || '✦'}
                  </span>
                  <span 
                    className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-md shadow"
                    style={{
                      backgroundColor: isLightBg ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
                      color: isLightBg ? '#8a2b3f' : '#f59e0b',
                      border: `1px solid ${formData.accentGold || '#f59e0b'}40`
                    }}
                  >
                    {formData.religion || 'secular'}
                  </span>
                </div>

                {/* High Contrast Title Box */}
                <div 
                  className="text-center z-10 px-3 py-2 rounded-xl backdrop-blur-md shadow-md"
                  style={{
                    backgroundColor: isLightBg ? 'rgba(255, 255, 255, 0.88)' : 'rgba(11, 19, 41, 0.88)',
                    border: `1px solid ${isLightBg ? 'rgba(138, 43, 63, 0.35)' : 'rgba(229, 184, 88, 0.35)'}`
                  }}
                >
                  <h4 
                    className="text-xs font-extrabold tracking-wider uppercase font-cinzel line-clamp-1"
                    style={{ color: isLightBg ? '#8a2b3f' : (formData.accentGold || '#f59e0b') }}
                  >
                    {formData.title || "Theme Preview"}
                  </h4>
                  <p 
                    className={`text-sm font-semibold ${formData.cursiveFontClass || 'font-cursive'} truncate mt-0.5`}
                    style={{ color: isLightBg ? '#1e293b' : '#ffffff' }}
                  >
                    {formData.brideName || 'Bride'} &amp; {formData.groomName || 'Groom'}
                  </p>
                </div>

                <div className="flex justify-between items-center z-10 text-[9px] font-mono font-bold" style={{ color: isLightBg ? '#1e293b' : '#e2e8f0' }}>
                  <span className="bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm text-slate-200">
                    💒 {formData.weddingVenue || "Starlight Cathedral"}
                  </span>
                  <div className="flex space-x-1 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: formData.primaryColor }} title="Primary Color" />
                    <span className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: formData.accentGold }} title="Accent Gold" />
                    <span className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: formData.lightBgColor }} title="Light Bg" />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-1 rounded-xl overflow-x-auto gap-1">
          {[
            { id: "couple", label: "👩‍❤️‍👨 Couple & Parents" },
            { id: "venue", label: "💒 Venues & Maps" },
            { id: "music", label: "🎵 Background Music" },
            { id: "colors", label: "🎨 Color Palette" },
            { id: "text", label: "📜 Quotes & Verses" },
            { id: "media", label: "🖼️ Imagery & Photos" },
            { id: "metadata", label: "⚙️ Theme Config" }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleAdminSavePreset} className="space-y-4 text-xs">
          
          {/* TAB: BACKGROUND MUSIC (DUAL SONGS) */}
          {activeTab === "music" && (
            <div className="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <span>🎵 Background Music &amp; Audio (Dual Songs)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Configure both the Starting Song (plays on opening/landing) and Main Song (plays during full invitation), each with independent ON/OFF toggles.
                </p>
              </div>

              {/* SONG 1: STARTING / INTRO SONG */}
              <div className={`p-3 rounded-xl border transition ${
                formData.startingMusicEnabled !== false ? 'bg-slate-950/80 border-amber-500/40 shadow-md' : 'bg-slate-950/40 border-slate-800 opacity-80'
              } space-y-3`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-300 block">
                      Song 1: Starting / Intro Song
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Plays when guest arrives / during envelope interaction
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-extrabold uppercase ${formData.startingMusicEnabled !== false ? 'text-amber-400' : 'text-slate-500'}`}>
                      {formData.startingMusicEnabled !== false ? "ON" : "OFF"}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.startingMusicEnabled !== false}
                        onChange={(e) => setFormData(prev => ({ ...prev, startingMusicEnabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>

                {formData.startingMusicEnabled !== false && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-300 block mb-1">
                        Select Starting Audio File (MP3 / WAV / M4A)
                      </label>
                      <input 
                        type="file"
                        accept="audio/*"
                        onChange={async (e) => {
                          const file = e.target.files && e.target.files[0];
                          if (!file) return;
                          try {
                            const dataUrl = await new Promise((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () => resolve(reader.result);
                              reader.onerror = reject;
                              reader.readAsDataURL(file);
                            });
                            setFormData(prev => ({
                              ...prev,
                              startingMusicUrl: dataUrl,
                              startingMusicTitle: file.name.replace(/\.[^/.]+$/, ""),
                              startingMusicArtist: "Custom Intro"
                            }));
                          } catch (err) {
                            console.error("Starting audio error:", err);
                          }
                        }}
                        className="w-full text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Starting Title</label>
                        <input 
                          type="text"
                          value={formData.startingMusicTitle || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, startingMusicTitle: e.target.value }))}
                          placeholder="e.g. Traditional Shehnai Welcome"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Starting Artist</label>
                        <input 
                          type="text"
                          value={formData.startingMusicArtist || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, startingMusicArtist: e.target.value }))}
                          placeholder="e.g. Intro Welcome"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Direct Audio URL</label>
                        <input 
                          type="text"
                          value={formData.startingMusicUrl || ""}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, startingMusicUrl: e.target.value }));
                            if (testStartingAudioPlaying && testStartingAudioRef.current) {
                              testStartingAudioRef.current.pause();
                              setTestStartingAudioPlaying(false);
                            }
                          }}
                          placeholder="https://domain.com/intro.mp3"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100"
                        />
                      </div>
                    </div>

                    {formData.startingMusicUrl && (
                      <div className="pt-1 flex flex-col space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!testStartingAudioRef.current) return;
                            if (testStartingAudioPlaying) {
                              testStartingAudioRef.current.pause();
                              setTestStartingAudioPlaying(false);
                            } else {
                              testStartingAudioRef.current.volume = formData.musicVolume !== undefined ? formData.musicVolume : 0.8;
                              testStartingAudioRef.current.play().then(() => {
                                setTestStartingAudioPlaying(true);
                              }).catch(err => {
                                console.warn("Starting audio test error:", err);
                                showToast && showToast("Could not play starting audio directly. Check the audio URL or format.", "error");
                              });
                            }
                          }}
                          className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                        >
                          <span>{testStartingAudioPlaying ? "⏸ Pause Starting Audio Preview" : "▶ Listen Live / Test Starting Song"}</span>
                        </button>
                        <audio 
                          ref={testStartingAudioRef}
                          src={formData.startingMusicUrl}
                          onEnded={() => setTestStartingAudioPlaying(false)}
                          onError={() => setTestStartingAudioPlaying(false)}
                        />
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-emerald-400 font-bold">✓ Starting Song Linked</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                startingMusicUrl: "",
                                startingMusicTitle: "",
                                startingMusicArtist: ""
                              }));
                              if (testStartingAudioRef.current) testStartingAudioRef.current.pause();
                              setTestStartingAudioPlaying(false);
                            }}
                            className="text-rose-400 hover:text-rose-300 underline font-bold"
                          >
                            Remove Song 1
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SONG 2: MAIN INVITATION SONG */}
              <div className={`p-3 rounded-xl border transition ${
                formData.mainMusicEnabled !== false ? 'bg-slate-950/80 border-amber-500/40 shadow-md' : 'bg-slate-950/40 border-slate-800 opacity-80'
              } space-y-3`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-300 block">
                      Song 2: Main Invitation Song
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Plays continuously across invitation after envelope is opened
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-extrabold uppercase ${formData.mainMusicEnabled !== false ? 'text-amber-400' : 'text-slate-500'}`}>
                      {formData.mainMusicEnabled !== false ? "ON" : "OFF"}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.mainMusicEnabled !== false}
                        onChange={(e) => setFormData(prev => ({ ...prev, mainMusicEnabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>

                {formData.mainMusicEnabled !== false && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    {/* Curated Music Selector */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                          Choose Track from Music Library
                        </label>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {dbStore.getMusicPresets().length} Available
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                        {dbStore.getMusicPresets().map((track) => {
                          const isSelected = formData.musicUrl === track.url;
                          return (
                            <button
                              key={track.id}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  musicUrl: track.url, 
                                  musicTitle: track.title,
                                  musicArtist: track.artist || "Royalty Free"
                                }));
                                if (testAudioRef.current) {
                                  testAudioRef.current.pause();
                                  setTestAudioPlaying(false);
                                }
                              }}
                              className={`p-2 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                                  : 'bg-slate-900 border-slate-800 hover:border-amber-500/40 text-slate-200'
                              }`}
                            >
                              <div className="flex flex-col min-w-0 pr-2">
                                <span className="text-xs truncate font-medium">🎵 {track.title}</span>
                                <span className="text-[9px] text-slate-400 truncate">{track.artist || track.category || "Royalty Free"}</span>
                              </div>
                              {isSelected && <span className="text-[8px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">Active</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-300 block mb-1">Or Upload Custom Audio File</label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={async (e) => {
                          const file = e.target.files && e.target.files[0];
                          if (!file) return;
                          try {
                            const dataUrl = await new Promise((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () => resolve(reader.result);
                              reader.onerror = reject;
                              reader.readAsDataURL(file);
                            });
                            setFormData(prev => ({
                              ...prev,
                              musicUrl: dataUrl,
                              musicTitle: file.name.replace(/\.[^/.]+$/, ""),
                              musicArtist: "Custom Upload"
                            }));
                          } catch (err) {
                            console.error("Error reading audio file:", err);
                          }
                        }}
                        className="w-full text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Song Title</label>
                        <input
                          type="text"
                          value={formData.musicTitle || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, musicTitle: e.target.value }))}
                          placeholder="e.g. Vakratunda Mahakaya"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Artist / Subtitle</label>
                        <input
                          type="text"
                          value={formData.musicArtist || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, musicArtist: e.target.value }))}
                          placeholder="e.g. Traditional Flute"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Audio Direct URL</label>
                        <input
                          type="text"
                          value={formData.musicUrl || ""}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, musicUrl: e.target.value }));
                            if (testAudioPlaying && testAudioRef.current) {
                              testAudioRef.current.pause();
                              setTestAudioPlaying(false);
                            }
                          }}
                          placeholder="https://domain.com/song.mp3"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100"
                        />
                      </div>
                    </div>

                    {formData.musicUrl && (
                      <div className="pt-1 flex flex-col space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!testAudioRef.current) return;
                            if (testAudioPlaying) {
                              testAudioRef.current.pause();
                              setTestAudioPlaying(false);
                            } else {
                              testAudioRef.current.volume = formData.musicVolume !== undefined ? formData.musicVolume : 0.8;
                              testAudioRef.current.play().then(() => {
                                setTestAudioPlaying(true);
                              }).catch(err => {
                                console.warn("Direct play failed:", err);
                                showToast && showToast("Could not play audio directly. Verify the audio URL.", "error");
                              });
                            }
                          }}
                          className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow"
                        >
                          <span>{testAudioPlaying ? "⏸ Pause Audio Preview" : "▶ Listen Live / Test Main Song"}</span>
                        </button>
                        <audio 
                          ref={testAudioRef} 
                          src={formData.musicUrl} 
                          onEnded={() => setTestAudioPlaying(false)}
                          onError={() => setTestAudioPlaying(false)}
                        />
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-emerald-400 font-bold">✓ Main Song Linked</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                musicUrl: "",
                                musicTitle: "",
                                musicArtist: ""
                              }));
                              if (testAudioRef.current) testAudioRef.current.pause();
                              setTestAudioPlaying(false);
                            }}
                            className="text-rose-400 hover:text-rose-300 underline font-bold"
                          >
                            Remove Song 2
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Playback Controls & Volume */}
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Playback Settings
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center space-x-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoPlayMusic !== false}
                      onChange={(e) => setFormData(prev => ({ ...prev, autoPlayMusic: e.target.checked }))}
                      className="accent-amber-500 rounded"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Autoplay on Open</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.loopMusic !== false}
                      onChange={(e) => setFormData(prev => ({ ...prev, loopMusic: e.target.checked }))}
                      className="accent-amber-500 rounded"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Loop Continuously</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showMusicWidget !== false}
                      onChange={(e) => setFormData(prev => ({ ...prev, showMusicWidget: e.target.checked }))}
                      className="accent-amber-500 rounded"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Show Music Icon</span>
                    </div>
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] uppercase font-bold text-slate-300">Default Playback Volume</label>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      {Math.round((formData.musicVolume !== undefined ? formData.musicVolume : 0.8) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={formData.musicVolume !== undefined ? formData.musicVolume : 0.8}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFormData(prev => ({ ...prev, musicVolume: val }));
                      if (testAudioRef.current) testAudioRef.current.volume = val;
                      if (testStartingAudioRef.current) testStartingAudioRef.current.volume = val;
                    }}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg"
                  />
                </div>
              </div>

              {/* Explicit Save Song Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    if (isAdmin) {
                      handleAdminSavePreset(e);
                    } else {
                      handleCustomerSaveDraft();
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <SvgCheck className="w-4 h-4 text-slate-950 font-bold" />
                  <span>💾 Save Songs with Theme Preset / Invitation</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: COUPLE & PARENTS */}
          {activeTab === "couple" && (
            <div className="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                👩‍❤️‍👨 Bride, Groom &amp; Parents Names
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Bride Name *</label>
                  <input
                    type="text"
                    value={formData.brideName}
                    onChange={(e) => setFormData(prev => ({ ...prev, brideName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Suman"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Groom Name *</label>
                  <input
                    type="text"
                    value={formData.groomName}
                    onChange={(e) => setFormData(prev => ({ ...prev, groomName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Vishal"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800/80 pt-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Bride's Father Name</label>
                  <input
                    type="text"
                    value={formData.brideFatherName}
                    onChange={(e) => setFormData(prev => ({ ...prev, brideFatherName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    placeholder="Mr. Rajesh Sharma"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Bride's Mother Name</label>
                  <input
                    type="text"
                    value={formData.brideMotherName}
                    onChange={(e) => setFormData(prev => ({ ...prev, brideMotherName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    placeholder="Mrs. Anita Sharma"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800/80 pt-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Groom's Father Name</label>
                  <input
                    type="text"
                    value={formData.groomFatherName}
                    onChange={(e) => setFormData(prev => ({ ...prev, groomFatherName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    placeholder="Mr. Vijay Patel"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Groom's Mother Name</label>
                  <input
                    type="text"
                    value={formData.groomMotherName}
                    onChange={(e) => setFormData(prev => ({ ...prev, groomMotherName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    placeholder="Mrs. Sunita Patel"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VENUES & MAPS */}
          {activeTab === "venue" && (
            <div className="space-y-4">
              {/* Marriage Ceremony */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                  💒 Marriage Ceremony &amp; Venue
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Marriage Date &amp; Time</label>
                    <input
                      type="datetime-local"
                      value={formData.weddingDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, weddingDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Marriage Venue Name</label>
                    <input
                      type="text"
                      value={formData.weddingVenue}
                      onChange={(e) => setFormData(prev => ({ ...prev, weddingVenue: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      placeholder="The Starlight Cathedral"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Marriage Address</label>
                  <input
                    type="text"
                    value={formData.weddingAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, weddingAddress: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    placeholder="100 Seraphim Way, Glass Valley, CA"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Marriage Google Map Link</label>
                  <input
                    type="url"
                    value={formData.weddingMapUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, weddingMapUrl: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    placeholder="https://maps.google.com/?q=..."
                  />
                </div>
              </div>

              {/* Reception Ceremony */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                  🥂 Reception Ceremony &amp; Venue
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Reception Date &amp; Time</label>
                    <input
                      type="datetime-local"
                      value={formData.receptionDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, receptionDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Reception Venue Name</label>
                    <input
                      type="text"
                      value={formData.receptionVenue}
                      onChange={(e) => setFormData(prev => ({ ...prev, receptionVenue: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      placeholder="The Gilded Glass Greenhouse"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Reception Address</label>
                  <input
                    type="text"
                    value={formData.receptionAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, receptionAddress: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    placeholder="450 Conservatory Road, Glass Valley, CA"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Reception Google Map Link</label>
                  <input
                    type="url"
                    value={formData.receptionMapUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, receptionMapUrl: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    placeholder="https://maps.google.com/?q=..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COLORS & PALETTE */}
          {activeTab === "colors" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                  Core Theme Colors
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Primary Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.primaryColor?.startsWith("#") ? formData.primaryColor : "#fdfbf7"}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        onInput={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Accent Gold</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.accentGold?.startsWith("#") ? formData.accentGold : "#b89254"}
                        onChange={(e) => setFormData(prev => ({ ...prev, accentGold: e.target.value }))}
                        onInput={(e) => setFormData(prev => ({ ...prev, accentGold: e.target.value }))}
                        className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.accentGold}
                        onChange={(e) => setFormData(prev => ({ ...prev, accentGold: e.target.value }))}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Paper Background</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.lightBgColor?.startsWith("#") ? formData.lightBgColor : "#faf6f0"}
                        onChange={(e) => setFormData(prev => ({ ...prev, lightBgColor: e.target.value }))}
                        onInput={(e) => setFormData(prev => ({ ...prev, lightBgColor: e.target.value }))}
                        className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.lightBgColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, lightBgColor: e.target.value }))}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography Colors */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                  Cover Card Typography Colors
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Bride Name Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.coverBrideColor?.startsWith("#") ? formData.coverBrideColor : "#8a2b3f"}
                        onChange={(e) => setFormData(prev => ({ ...prev, coverBrideColor: e.target.value }))}
                        onInput={(e) => setFormData(prev => ({ ...prev, coverBrideColor: e.target.value }))}
                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.coverBrideColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, coverBrideColor: e.target.value }))}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Ampersand (&) Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.coverAmpersandColor?.startsWith("#") ? formData.coverAmpersandColor : "#b89254"}
                        onChange={(e) => setFormData(prev => ({ ...prev, coverAmpersandColor: e.target.value }))}
                        onInput={(e) => setFormData(prev => ({ ...prev, coverAmpersandColor: e.target.value }))}
                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.coverAmpersandColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, coverAmpersandColor: e.target.value }))}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Groom Name Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.coverGroomColor?.startsWith("#") ? formData.coverGroomColor : "#8a2b3f"}
                        onChange={(e) => setFormData(prev => ({ ...prev, coverGroomColor: e.target.value }))}
                        onInput={(e) => setFormData(prev => ({ ...prev, coverGroomColor: e.target.value }))}
                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.coverGroomColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, coverGroomColor: e.target.value }))}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* ENVELOPE THEMES (PRESETS) */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                      ✉ Envelope Themes (Pinterest Presets)
                    </label>
                    <span className="text-[9px] text-slate-400">1-Click Full Screen Theme</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    {[
                      { name: "Royal Wine & Gold", bg: "#5a0e1c", seal: "#c89f4b", type: "heart", particles: "sparkles" },
                      { name: "Midnight Navy & Rings", bg: "#0f1d38", seal: "#d4af37", type: "rings", particles: "sparkles" },
                      { name: "Mocha Taupe & Gold", bg: "#483c38", seal: "#c5a059", type: "crest", particles: "sparkles" },
                      { name: "Imperial Emerald", bg: "#133326", seal: "#d4af37", type: "lotus", particles: "petals" },
                      { name: "Crimson & Red Wax", bg: "#681320", seal: "#781324", type: "rose", particles: "hearts" },
                      { name: "Obsidian & Rose Gold", bg: "#1a1a1f", seal: "#d48378", type: "initials", particles: "sparkles" },
                    ].map((th) => (
                      <button
                        key={th.name}
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          envelopeBgColor: th.bg,
                          envelopeSealColor: th.seal,
                          envelopeSealType: th.type,
                          envelopeParticleType: th.particles,
                        }))}
                        className={`flex items-center space-x-2 p-1.5 rounded-lg border text-left transition text-[10px] ${
                          formData.envelopeBgColor === th.bg 
                            ? 'border-amber-400 bg-amber-500/10 text-amber-200' 
                            : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full border border-white/20 shrink-0 relative flex items-center justify-center shadow-inner" style={{ backgroundColor: th.bg }}>
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: th.seal }} />
                        </div>
                        <span className="truncate font-medium">{th.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Envelope Background</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.envelopeBgColor?.startsWith("#") ? formData.envelopeBgColor : "#8a2b3f"}
                        onChange={(e) => setFormData(prev => ({ ...prev, envelopeBgColor: e.target.value }))}
                        onInput={(e) => setFormData(prev => ({ ...prev, envelopeBgColor: e.target.value }))}
                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.envelopeBgColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, envelopeBgColor: e.target.value }))}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Envelope Seal Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.envelopeSealColor?.startsWith("#") ? formData.envelopeSealColor : "#b89254"}
                        onChange={(e) => setFormData(prev => ({ ...prev, envelopeSealColor: e.target.value }))}
                        onInput={(e) => setFormData(prev => ({ ...prev, envelopeSealColor: e.target.value }))}
                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.envelopeSealColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, envelopeSealColor: e.target.value }))}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Envelope Flap Cut</label>
                    <select
                      value={formData.envelopeFlapShape || "classic-v"}
                      onChange={(e) => setFormData(prev => ({ ...prev, envelopeFlapShape: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
                    >
                      <option value="classic-v">Classic V-Cut Flap</option>
                      <option value="curved-scoop">Elegant Curved Scoop</option>
                      <option value="deep-royal">Deep Royal Flap</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Wax Seal Outer Contour</label>
                    <select
                      value={formData.envelopeSealShape || "organic"}
                      onChange={(e) => setFormData(prev => ({ ...prev, envelopeSealShape: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
                    >
                      <option value="organic">Natural Melted Wax</option>
                      <option value="circle">Crisp Circle Seal</option>
                      <option value="shield">Royal Shield Seal</option>
                      <option value="hexagon">Modern Hexagon Seal</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Wax Seal Stamp Emblem</label>
                    <select
                      value={formData.envelopeSealType || "heart"}
                      onChange={(e) => setFormData(prev => ({ ...prev, envelopeSealType: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
                    >
                      <option value="heart">Classic Heart ❤</option>
                      <option value="initials">Engraved Initials S&V</option>
                      <option value="ganesh">Sacred Ganesha / Om 🕉</option>
                      <option value="rings">Interlocking Rings 💍</option>
                      <option value="rose">Royal Rose 🌹</option>
                      <option value="lotus">Sacred Lotus 🪷</option>
                      <option value="crown">Imperial Crown 👑</option>
                      <option value="crest">Heritage Crest ⚜</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Ambient Particles</label>
                    <select
                      value={formData.envelopeParticleType || "sparkles"}
                      onChange={(e) => setFormData(prev => ({ ...prev, envelopeParticleType: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
                    >
                      <option value="sparkles">Golden Sparkles ✨</option>
                      <option value="hearts">Romantic Hearts 💕</option>
                      <option value="petals">Rose Petals 🌸</option>
                      <option value="confetti">Festive Confetti 🎉</option>
                      <option value="om">Sacred Om 🕉</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUOTES & VERSES */}
          {activeTab === "text" && (
            <div className="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                📜 Quotes, Verses &amp; Secret Message
              </h3>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Intro Quote / Theme Tagline
                </label>
                <textarea
                  rows={2}
                  value={formData.introQuote}
                  onChange={(e) => setFormData(prev => ({ ...prev, introQuote: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                  placeholder="Joined in holy matrimony..."
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Sacred Verse / Blessing
                </label>
                <textarea
                  rows={2}
                  value={formData.customSacredVerse}
                  onChange={(e) => setFormData(prev => ({ ...prev, customSacredVerse: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                  placeholder="“And now these three remain...”"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Secret Scratch Reveal Message
                </label>
                <textarea
                  rows={2}
                  value={formData.scratchSecretMessage}
                  onChange={(e) => setFormData(prev => ({ ...prev, scratchSecretMessage: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                  placeholder="We have booked a private stargazing toast after reception..."
                />
              </div>
            </div>
          )}

          {/* TAB 5: IMAGERY & PHOTOS */}
          {activeTab === "media" && (
            <div className="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                🖼️ Background Artwork &amp; Photos
              </h3>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Hero Card Background Image
                  </label>
                  <label className="text-[10px] text-amber-400 hover:underline cursor-pointer font-semibold">
                    <span>Upload File</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload("heroImage", e)} className="hidden" />
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.heroImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, heroImage: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono"
                  placeholder="/bg_floral_pink.jpg or https://..."
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[9px] text-slate-400 py-1 font-semibold">Presets:</span>
                  {[
                    { label: "Floral Cream", url: "/bg_floral_pink.jpg" },
                    { label: "Floral Dark", url: "/bg_floral_dark.jpg" },
                    { label: "Lace Green", url: "/bg_lace_green.jpg" }
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, heroImage: p.url }))}
                      className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:text-white transition"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800/80 pt-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Story Section Image</label>
                    <label className="text-[10px] text-amber-400 hover:underline cursor-pointer">
                      <span>Upload</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload("storyImage", e)} className="hidden" />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formData.storyImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, storyImage: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Scratch Card Cover</label>
                    <label className="text-[10px] text-amber-400 hover:underline cursor-pointer">
                      <span>Upload</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload("scratchImage", e)} className="hidden" />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formData.scratchImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, scratchImage: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: METADATA */}
          {activeTab === "metadata" && (
            <div className="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                ⚙️ Preset Theme Meta Settings
              </h3>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Preset Theme Name / Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Elegant Floral Cream"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Category Tag / Religion
                  </label>
                  <select
                    value={formData.religion}
                    onChange={(e) => setFormData(prev => ({ ...prev, religion: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="secular">Secular / Classic</option>
                    <option value="hindu">Hindu</option>
                    <option value="christian">Christian</option>
                    <option value="islamic">Islamic</option>
                    <option value="sikh">Sikh</option>
                    <option value="jewish">Jewish</option>
                    <option value="buddhist">Buddhist</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Sacred Symbol Icon / Text
                  </label>
                  <input
                    type="text"
                    value={formData.customSacredSymbol}
                    onChange={(e) => setFormData(prev => ({ ...prev, customSacredSymbol: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. ❤ or 🕉 or ✝ or ☪"
                  />
                </div>
              </div>

              {/* Pricing & Discount Settings */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                  💰 Admin Theme Pricing &amp; Discount
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Base Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price !== undefined ? formData.price : 999}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercent !== undefined ? formData.discountPercent : 30}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: Number(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Discounted Price to Display:</span>
                  <div className="flex items-center space-x-2">
                    <span className="line-through text-slate-400">₹{formData.price !== undefined ? formData.price : 999}</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {formData.discountPercent !== undefined ? formData.discountPercent : 30}% OFF
                    </span>
                    <span className="text-sm font-black text-amber-200">
                      ₹{Math.round((formData.price !== undefined ? formData.price : 999) * (1 - (formData.discountPercent !== undefined ? formData.discountPercent : 30) / 100))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleLivePreview}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-400 font-bold text-xs transition flex items-center justify-center space-x-1.5"
            >
              <SvgEye className="w-4 h-4 text-amber-400" />
              <span>Full Screen Live Preview</span>
            </button>

            <button
              type="button"
              onClick={handleOpenFullEditor}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs transition flex items-center justify-center space-x-1.5"
            >
              <SvgSliders className="w-4 h-4 text-amber-400" />
              <span>Open Full Visual Editor</span>
            </button>

            {isAdmin ? (
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-extrabold uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-1.5 text-xs"
              >
                <SvgCheck className="w-4 h-4 text-slate-950" />
                <span>Save Global Theme Preset</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCustomerSaveDraft}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-extrabold uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-1.5 text-xs"
              >
                <SvgCheck className="w-4 h-4 text-slate-950" />
                <span>Save Draft to My Portal</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
