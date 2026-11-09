import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dbStore from '../data/store';
import { 
  SvgSparkles, SvgCalendar, SvgAward, SvgCheck, 
  SvgX, SvgExternalLink, SvgSliders, SvgPlus, SvgEdit, SvgTrash 
} from '../components/icons';
import Toast from '../components/Toast';
import CustomDialog from '../components/CustomDialog';
import ThemeEditorModal from '../components/ThemeEditorModal';
import { formatDriveDirectUrl } from '../utils/helpers';
import InvitationTypeDropdown from '../components/InvitationTypeDropdown';
import CategoryDropdown from '../components/CategoryDropdown';
import HomeHeroBanner from '../components/HomeHeroBanner';
import CinematicHeroBanner from '../components/CinematicHeroBanner';
import CinematicLandingBackground from '../components/CinematicLandingBackground';
import { INVITATION_CATEGORIES } from '../data/invitationCategoriesData';
import GuidedInvitationModal from '../components/GuidedInvitationModal';

export default function PresetGallery() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [filterReligion, setFilterReligion] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openPresetDropdownId, setOpenPresetDropdownId] = useState(null);
  const [hoveredPresetId, setHoveredPresetId] = useState(null);

  // Close preset dropdown on click outside
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!e.target.closest('.preset-dropdown-container')) {
        setOpenPresetDropdownId(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);
  const [isGuidedModalOpen, setIsGuidedModalOpen] = useState(false);
  const presetsSectionRef = React.useRef(null);
  
  // Preview Form Modal state
  const [previewPreset, setPreviewPreset] = useState(null);
  const [previewForm, setPreviewForm] = useState({
    brideName: "",
    groomName: "",
    weddingDate: "",
    weddingVenue: "",
    introQuote: ""
  });

  const handleOpenPreviewModal = (preset) => {
    const cfg = preset.config || {};
    setPreviewPreset(preset);
    setPreviewForm({
      brideName: currentUser?.displayName?.split("&")[0]?.trim() || cfg.brideName || "Ananya",
      groomName: currentUser?.displayName?.split("&")[1]?.trim() || cfg.groomName || "Aarav",
      weddingDate: cfg.weddingDate ? cfg.weddingDate.slice(0, 10) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      weddingVenue: cfg.weddingVenue || "The Starlight Cathedral",
      introQuote: cfg.introQuote || "Joined in holy matrimony, we celebrate a bond written in heaven."
    });
  };

  const handleApplyPreview = (e) => {
    e.preventDefault();
    if (!previewPreset) return;

    // Merge preview custom details into temp config without saving to database
    const tempConfig = {
      ...previewPreset.config,
      brideName: previewForm.brideName,
      groomName: previewForm.groomName,
      weddingDate: previewForm.weddingDate ? `${previewForm.weddingDate}T16:00:00` : previewPreset.config.weddingDate,
      weddingVenue: previewForm.weddingVenue,
      introQuote: previewForm.introQuote
    };

    sessionStorage.setItem("preview_temp_config", JSON.stringify(tempConfig));
    sessionStorage.setItem("preview_preset_id", previewPreset.id);
    setPreviewPreset(null);
    navigate(`/invite/demo?preset=${previewPreset.id}&preview=true`);
  };

  const handleSkipPreview = () => {
    if (!previewPreset) return;
    sessionStorage.removeItem("preview_temp_config");
    sessionStorage.setItem("preview_preset_id", previewPreset.id);
    setPreviewPreset(null);
    navigate(`/invite/demo?preset=${previewPreset.id}&preview=true`);
  };

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  const [presets, setPresets] = useState(() => dbStore.getPresets());
  const [brandSettings, setBrandSettings] = useState(() => dbStore.getBrandSettings());
  const allInvitations = dbStore.getInvitations();

  useEffect(() => {
    const handleSync = () => {
      setPresets(dbStore.getPresets());
      setBrandSettings(dbStore.getBrandSettings());
    };
    window.addEventListener("db_synced", handleSync);
    return () => window.removeEventListener("db_synced", handleSync);
  }, []);

  const [dialog, setDialog] = useState({ show: false, type: 'alert', message: '', onConfirm: null, onCancel: null });

  const triggerDialog = (options) => {
    setDialog({
      show: true,
      type: options.type || 'alert',
      title: options.title || 'System Message',
      message: options.message || '',
      inputValue: options.defaultValue || '',
      inputPlaceholder: options.placeholder || 'Type here...',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      onConfirm: (val) => {
        setDialog(prev => ({ ...prev, show: false }));
        options.onConfirm && options.onConfirm(val);
      },
      onCancel: () => {
        setDialog(prev => ({ ...prev, show: false }));
        options.onCancel && options.onCancel();
      }
    });
  };

  const handleDeletePreset = (preset) => {
    const linkedInvitations = dbStore.getInvitations();
    const paidCount = linkedInvitations.filter(inv => 
      (inv.config?.presetId === preset.id || inv.presetId === preset.id) && inv.isPaid === true
    ).length;
    
    const warningMsg = paidCount > 0
      ? ` Note: ${paidCount} active invitation(s) reference this theme.`
      : '';

    triggerDialog({
      type: 'confirm',
      title: 'Permanently Delete Theme Preset',
      message: `Are you sure you want to permanently delete invitation design preset "${preset.title}" from the database? It will not be recovered.${warningMsg}`,
      confirmText: 'Delete Permanently',
      onConfirm: () => {
        dbStore.deletePreset(preset.id);
        showToast(`Template design "${preset.title}" permanently deleted from database`, "success");
        setPresets(dbStore.getPresets());
      }
    });
  };

  // Admin Theme Manager Modal state
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);

  const handleOpenCreateTheme = () => {
    setEditingPreset(null);
    setThemeModalOpen(true);
  };

  const handleOpenEditTheme = (preset) => {
    setEditingPreset(preset);
    setThemeModalOpen(true);
  };

  // Order modal state
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [orderForm, setOrderForm] = useState({
    brideName: "",
    groomName: "",
    brideFatherName: "",
    brideMotherName: "",
    groomFatherName: "",
    groomMotherName: "",
    weddingDate: "",
    venueName: "",
    venueAddress: "",
    venueMapLink: "",
    photos: [],
    tempUrlInput: "",
    receptionVenue: "",
    receptionAddress: "",
    receptionDate: "",
    receptionMapLink: "",
    contact: ""
  });

  const handleFileUpload = (e, setForm) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    setForm(prev => {
      const current = prev.photos || [];
      const remainingSlots = 5 - current.length;
      if (remainingSlots <= 0) return prev;
      
      const filesToProcess = files.slice(0, remainingSlots);
      const newPhotos = [...current];
      let processed = 0;
      
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            newPhotos.push(reader.result);
          }
          processed++;
          if (processed === filesToProcess.length) {
            setForm(p => ({ ...p, photos: newPhotos }));
          }
        };
        reader.readAsDataURL(file);
      });
      return prev;
    });
    e.target.value = "";
  };

  const handleAddPhotoUrl = (urlInput, setForm) => {
    if (!urlInput?.trim()) return;
    setForm(prev => {
      const current = prev.photos || [];
      if (current.length >= 5) return prev;
      return { ...prev, photos: [...current, urlInput.trim()], tempUrlInput: "" };
    });
  };

  const handleRemovePhoto = (index, setForm) => {
    setForm(prev => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index)
    }));
  };

  const handleOpenOrderModal = (preset) => {
    if (!currentUser) {
      showToast("Please login or sign up to place an order", "info");
      navigate("/login");
      return;
    }

    setSelectedPreset(preset);
    setOrderForm({
      brideName: currentUser.displayName?.split("&")[0]?.trim() || "",
      groomName: currentUser.displayName?.split("&")[1]?.trim() || "",
      brideFatherName: "",
      brideMotherName: "",
      groomFatherName: "",
      groomMotherName: "",
      weddingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      venueName: "",
      venueAddress: "",
      venueMapLink: "",
      photos: [],
      tempUrlInput: "",
      receptionVenue: "",
      receptionAddress: "",
      receptionDate: "",
      receptionMapLink: "",
      contact: ""
    });
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (!orderForm.brideName.trim() || !orderForm.groomName.trim() || !orderForm.weddingDate || !orderForm.contact.trim()) {
      showToast("Please fill out all order fields", "error");
      return;
    }

    const finalOrderForm = {
      ...orderForm,
      photoUrl: (orderForm.photos && orderForm.photos[0]) || ""
    };

    dbStore.createOrder(currentUser.id, selectedPreset.id, finalOrderForm);
    setSelectedPreset(null);
    showToast("Your design order has been submitted! Admin will draft it shortly.", "success");
    
    // Redirect to customer dashboard to track
    setTimeout(() => {
      navigate("/customer");
    }, 2000);
  };

  const filteredPresets = presets.filter(p => {
    const matchesReligion = filterReligion === "all" || p.religion === filterReligion;
    const pCategory = p.category || p.config?.category || 'wedding';
    const matchesCategory = selectedCategory === "all" || pCategory === selectedCategory;
    return matchesReligion && matchesCategory;
  });

  const selectedCatObj = (typeof INVITATION_CATEGORIES !== 'undefined' ? INVITATION_CATEGORIES : []).find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-body)] py-6 sm:py-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 font-sans preset-gallery-container w-full">
      <div className="w-full max-w-[1720px] mx-auto space-y-8">
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: "" })} />
      )}

      {/* 1. Cinematic Multi-Layer Architectural Background Environment */}
      {brandSettings?.landingTheme && (
        <CinematicLandingBackground theme={brandSettings.landingTheme} />
      )}

      {/* 2. Full-Width Cinematic Hero Banner & Integrated Occasion Category Selector */}
      <CinematicHeroBanner
        theme={brandSettings?.landingTheme}
        onDraftClick={() => setIsGuidedModalOpen(true)}
        onExploreClick={() => presetsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          if (catId === "all") {
            setFilterReligion("all");
          }
        }}
      />

      {/* Presets Section Anchor */}
      <div ref={presetsSectionRef} className="scroll-mt-6" />

      {/* Unified Luxury Category & Filter Command Hub */}
      {brandSettings?.landingTheme?.visibility?.showFilterHub !== false && (
        <div className="w-full rounded-3xl border border-[#E9DCCB] bg-[#FFFEFB]/95 shadow-md p-5 sm:p-6 backdrop-blur-md space-y-5 relative z-40 overflow-visible">
        
        {/* Hub Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9DCCB]/60 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-base">🎉</span>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#513321]">
                Curated Celebration & Design Hub
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-900 border border-amber-500/25">
                {filteredPresets.length} {filteredPresets.length === 1 ? 'Design' : 'Designs'} Available
              </span>
            </div>
            <p className="text-[11px] text-[#8C6D58] font-medium pl-6">
              {selectedCatObj ? selectedCatObj.subtitle : 'Select celebration category & faith to filter matching luxury presets'}
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {(selectedCategory !== 'all' || filterReligion !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setFilterReligion('all');
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#8D414D] hover:bg-[#F9E8E5] border border-[#E9C9BD] transition cursor-pointer flex items-center space-x-1"
              >
                <span>✕</span>
                <span>Reset Filters</span>
              </button>
            )}
            {currentUser?.role === 'admin' && (
              <button
                onClick={handleOpenCreateTheme}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D6AD61] to-[#C49A4A] hover:from-[#C49A4A] hover:to-[#AC853B] text-[#382416] hover:text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition flex items-center space-x-1.5 shrink-0 cursor-pointer"
              >
                <SvgPlus className="w-3.5 h-3.5" />
                <span>Add Theme</span>
              </button>
            )}
          </div>
        </div>

        {/* Dual Animated Dropdowns (Category + Faith/Tradition) in Responsive Full-Width Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end relative z-50">
          {/* Dropdown 1: Celebration Category */}
          <div className="relative z-50">
            <CategoryDropdown
              value={selectedCategory}
              onChange={setSelectedCategory}
              presets={presets}
              labelText="Celebration Category"
              className="w-full"
            />
          </div>

          {/* Dropdown 2: Cultural Faith & Tradition */}
          <div className="relative z-40">
            <InvitationTypeDropdown
              value={filterReligion}
              onChange={setFilterReligion}
              presets={presets}
              labelText="Tradition & Sacred Symbol"
              className="w-full"
            />
          </div>

          {/* Active Filter Summary Capsule */}
          {brandSettings?.landingTheme?.visibility?.showSummaryCapsule !== false && (
            <div className="hidden lg:flex flex-col justify-end pb-1 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8C6D58]">
              Active Selection
            </span>
            <div className="flex items-center space-x-2 text-xs font-medium text-[#513321] bg-[#FFF9F2] border border-[#E9DCCB] px-3.5 py-2.5 rounded-xl">
              <span>{selectedCatObj?.icon || '🌟'}</span>
              <span className="font-bold truncate">{selectedCatObj?.name || 'All Celebrations'}</span>
              <span className="text-[#8C6D58]">•</span>
              <span className="truncate">{filterReligion === 'all' ? 'All Traditions' : filterReligion}</span>
            </div>
          </div>
          )}
        </div>
      </div>
      )}

      {/* Presets Grid - Responsive & Expansive (Fluid Full Width) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 w-full pt-4 relative z-10">
        {filteredPresets.map(preset => {
          const cfg = preset.config || {};
          const isDropdownOpen = openPresetDropdownId === preset.id || hoveredPresetId === preset.id;

          const matchingInv = allInvitations.find(i => 
            (i.config?.presetId === preset.id || i.presetId === preset.id) ||
            (i.config?.brideName && cfg.brideName && i.config.brideName.toLowerCase() === cfg.brideName.toLowerCase()) ||
            (preset.title && i.title && i.title.toLowerCase().includes(preset.title.toLowerCase().replace(/['’]s\s*theme/i, '').trim()))
          );

          const coverDesign = preset.thumbnail || cfg.heroImage || matchingInv?.config?.heroImage || (
            (cfg.brideName?.toLowerCase() === 'suman' || preset.title?.toLowerCase().includes('suman'))
              ? '/cover_suman_vishal_1k.jpg'
              : (preset.religion === 'hindu' ? '/thumbnails/radha-krishna.jpg' : '/cover_suman_vishal_1k.jpg')
          );
          const resolvedCoverUrl = formatDriveDirectUrl(coverDesign, "image");

          return (
            <div 
              key={preset.id} 
              onMouseEnter={() => setHoveredPresetId(preset.id)}
              onMouseLeave={() => setHoveredPresetId(null)}
              className={`preset-dropdown-container rounded-2xl border transition-all duration-300 relative flex flex-col justify-between ${
                isDropdownOpen
                  ? 'border-[#C49A4A] shadow-2xl z-[999999] bg-[#FFFEFB]'
                  : 'border-[#E9DCCB] hover:border-[#C49A4A]/70 bg-[#FFFEFB] shadow-md hover:shadow-xl z-10'
              }`}
            >
              
              {/* Card visual thumbnail — mirrors authentic invitation cover design */}
              <div 
                onClick={() => setOpenPresetDropdownId(prev => prev === preset.id ? null : preset.id)}
                className="preset-card-cover h-52 sm:h-56 p-4 flex flex-col justify-between relative overflow-hidden bg-cover bg-center border-b border-[#E9DCCB]/60 group transition-all duration-300 rounded-t-2xl cursor-pointer"
                style={{ 
                  backgroundColor: cfg.primaryColor || '#0b1329',
                  backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.10) 45%, rgba(0, 0, 0, 0.65) 100%), url("${resolvedCoverUrl}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Ornamental border overlay matching invitation cover */}
                <div 
                  className="absolute inset-2.5 border rounded-xl pointer-events-none transition-all duration-300 group-hover:scale-[0.98]"
                  style={{ borderColor: cfg.accentGold || '#D6AD61', opacity: 0.65 }}
                />

                {/* Top Quick Action Pill */}
                <div className="flex justify-end items-center z-10">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs border transition-colors ${
                    isDropdownOpen
                      ? 'bg-[#D6AD61] text-[#382416] border-[#C49A4A]'
                      : 'bg-black/50 text-white/90 border-white/20'
                  }`}>
                    {isDropdownOpen ? '▲ Close Details' : '▼ View Details'}
                  </span>
                </div>

                {/* Bottom ID and Swatches */}
                <div className="flex justify-between items-center z-10 text-[9px] font-mono font-bold text-white/90">
                  <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-white/15">ID: {preset.id}</span>
                  <div className="flex space-x-1 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full border border-white/60 shadow-sm" style={{ backgroundColor: cfg.primaryColor || '#0b1329' }} title="Primary Color" />
                    <span className="w-2.5 h-2.5 rounded-full border border-white/60 shadow-sm" style={{ backgroundColor: cfg.accentGold || '#D6AD61' }} title="Accent Gold" />
                    <span className="w-2.5 h-2.5 rounded-full border border-white/60 shadow-sm" style={{ backgroundColor: cfg.lightBgColor || '#FFF9F2' }} title="Light Bg" />
                  </div>
                </div>
              </div>

              {/* Minimalist Card Footer - Clean & Uncluttered Default View */}
              <div 
                onClick={() => setOpenPresetDropdownId(prev => prev === preset.id ? null : preset.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer bg-[#FFFEFB] hover:bg-[#FFF9F2] transition-colors rounded-b-2xl border-t border-[#E9DCCB]/40"
              >
                <div className="truncate pr-2">
                  <h3 className="font-cinzel text-xs sm:text-sm font-extrabold text-[#513321] tracking-wide truncate">
                    {preset.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-900 font-bold border border-amber-500/25 uppercase tracking-wider">
                      {preset.religion || 'Secular'}
                    </span>
                    {!preset.hidePrice && (
                      <span className="text-xs font-black text-[#8C5D2C] font-mono">
                        ₹{Math.round((preset.price || cfg.price || 999) * (1 - (preset.discountPercent !== undefined ? preset.discountPercent : (cfg.discountPercent !== undefined ? cfg.discountPercent : 30)) / 100))}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all border ${
                    isDropdownOpen
                      ? 'bg-[#D6AD61] text-[#382416] border-[#C49A4A] rotate-180'
                      : 'bg-[#F7EFE5] text-[#513321] border-[#E9DCCB]'
                  }`}>
                    ▼
                  </span>
                </div>
              </div>

              {/* Interactive Animated Dropdown Menu Panel (Floats on Top of Every Layer) */}
              {isDropdownOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full left-0 right-0 mt-1.5 z-[999999] bg-[#FFFEFB] border-2 border-[#C49A4A] rounded-2xl shadow-2xl p-4 space-y-3 animate-dropdown-slide-down backdrop-blur-md"
                >
                  {/* Dropdown Header: Full title + badges */}
                  <div className="flex items-center justify-between border-b border-[#E9DCCB]/70 pb-2.5">
                    <div className="truncate pr-2">
                      <h4 className="font-cinzel text-xs sm:text-sm font-extrabold text-[#513321] truncate">
                        {preset.title}
                      </h4>
                      <p className="text-[9.5px] text-[#8C6D58] font-medium truncate mt-0.5">
                        {cfg.brideName || 'Bride'} &amp; {cfg.groomName || 'Groom'}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-900 font-extrabold border border-amber-500/25 uppercase tracking-wider shrink-0">
                      {preset.religion || 'Secular'}
                    </span>
                  </div>

                  {/* Official Price Tag with Selling Price, Strikethrough MRP & Discount % */}
                  <div className="p-2.5 rounded-xl bg-[#FFF9F2] border border-[#E9DCCB] flex items-center justify-between shadow-xs">
                    {!preset.hidePrice ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs line-through text-[#8C6D58] font-mono">
                          ₹{preset.price || cfg.price || 999}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-800 font-bold border border-emerald-500/25 uppercase tracking-wider">
                          {preset.discountPercent !== undefined ? preset.discountPercent : (cfg.discountPercent !== undefined ? cfg.discountPercent : 30)}% OFF
                        </span>
                        <span className="text-sm font-black text-[#513321] font-mono">
                          ₹{Math.round((preset.price || cfg.price || 999) * (1 - (preset.discountPercent !== undefined ? preset.discountPercent : (cfg.discountPercent !== undefined ? cfg.discountPercent : 30)) / 100))}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#8C6D58] italic font-medium">Price: Contact for pricing</span>
                    )}

                    {currentUser?.role === 'admin' && (
                      <button 
                        type="button"
                        onClick={() => {
                          dbStore.updatePreset(preset.id, { hidePrice: !preset.hidePrice });
                          showToast(preset.hidePrice ? "Price tag is now visible on preset cards" : "Price tag hidden on preset cards", "info");
                        }}
                        className="px-2 py-0.5 rounded-lg text-[9px] font-bold border border-[#E9DCCB] bg-[#FFFEFB] hover:bg-[#F7EFE5] text-[#513321] transition cursor-pointer"
                        title={preset.hidePrice ? "Unhide price" : "Hide price"}
                      >
                        {preset.hidePrice ? "👁 Unhide" : "🚫 Hide"}
                      </button>
                    )}
                  </div>

                  {/* Action Buttons inside Dropdown */}
                  <div className="space-y-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditTheme(preset)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#D6AD61] to-[#C49A4A] hover:from-[#C49A4A] hover:to-[#AC853B] text-[#382416] hover:text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <SvgSliders className="w-3.5 h-3.5" />
                      <span>Customize &amp; Edit Design</span>
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPreviewModal(preset)}
                        className="px-3 py-2 rounded-xl bg-[#FFF9F2] hover:bg-[#F7EFE5] border border-[#E9DCCB] text-[#513321] text-xs font-bold text-center transition flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
                      >
                        <SvgExternalLink className="w-3.5 h-3.5 text-[#8C6D58]" />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenOrderModal(preset)}
                        className="px-3 py-2 rounded-xl bg-[#8D414D] hover:bg-[#78343F] text-white text-xs font-bold transition text-center uppercase tracking-wider shadow-sm cursor-pointer"
                      >
                        Order Now
                      </button>
                    </div>

                    {currentUser?.role === 'admin' && (
                      <div className="pt-2 border-t border-[#E9DCCB]/60 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D58]">
                          Admin Controls
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditTheme(preset)}
                            className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border border-amber-500/30 text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                          >
                            <SvgEdit className="w-3 h-3" />
                            <span>Edit Preset</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePreset(preset)}
                            className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-800 border border-rose-500/30 text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                          >
                            <SvgTrash className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* PREVIEW DETAILS MODAL */}
      {previewPreset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl border border-amber-500/30 bg-slate-950 text-slate-100 space-y-5 shadow-2xl relative animate-fade-in">
            <button 
              onClick={() => setPreviewPreset(null)} 
              className="absolute top-4 right-4 p-1 hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-white"
            >
              <SvgX className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 pr-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Invitation Preview</span>
              <h2 className="font-cinzel text-lg font-bold text-slate-100">
                Customize Preview Details
              </h2>
              <p className="text-xs text-slate-400">
                Add your wedding details to see how design "{previewPreset.title}" looks, or skip for default view.
              </p>
            </div>

            <form onSubmit={handleApplyPreview} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Bride Name</label>
                  <input
                    type="text"
                    value={previewForm.brideName}
                    onChange={(e) => setPreviewForm(prev => ({ ...prev, brideName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                    placeholder="Ananya"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Groom Name</label>
                  <input
                    type="text"
                    value={previewForm.groomName}
                    onChange={(e) => setPreviewForm(prev => ({ ...prev, groomName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                    placeholder="Aarav"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Wedding Date</label>
                <input
                  type="date"
                  value={previewForm.weddingDate}
                  onChange={(e) => setPreviewForm(prev => ({ ...prev, weddingDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Wedding Venue</label>
                <input
                  type="text"
                  value={previewForm.weddingVenue}
                  onChange={(e) => setPreviewForm(prev => ({ ...prev, weddingVenue: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                  placeholder="The Starlight Cathedral"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Intro Blessing / Quote</label>
                <input
                  type="text"
                  value={previewForm.introQuote}
                  onChange={(e) => setPreviewForm(prev => ({ ...prev, introQuote: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                  placeholder="Joined in holy matrimony..."
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleSkipPreview}
                  className="flex-1 py-2.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition text-center"
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg text-xs uppercase tracking-widest font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 transition shadow-lg text-center"
                >
                  Apply &amp; Preview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER MODAL */}
      {selectedPreset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-amber-500/40 bg-slate-950 text-slate-100 space-y-5 shadow-2xl relative">
            <button 
              type="button"
              onClick={() => setSelectedPreset(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition text-base font-bold"
            >
              ✕
            </button>

            <div className="space-y-1 border-b border-slate-800 pb-3 pr-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Order Booking</span>
              <h2 className="font-cinzel text-xl font-bold text-amber-100">
                Design: "{selectedPreset.title}"
              </h2>
              <p className="text-xs text-slate-400">Fill out your wedding ceremony, parents, venue, and photo details below.</p>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-5">
              {/* Section 1: Couple & Parents Information */}
              <div className="space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                  👩‍❤️‍👨 Couple &amp; Parents Names
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Bride Name *</label>
                    <input
                      type="text"
                      value={orderForm.brideName}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, brideName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                      placeholder="e.g. Evelyn"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Groom Name *</label>
                    <input
                      type="text"
                      value={orderForm.groomName}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, groomName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                      placeholder="e.g. Theodore"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Bride Father Name</label>
                    <input
                      type="text"
                      value={orderForm.brideFatherName}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, brideFatherName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                      placeholder="e.g. Mr. Robert Smith"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Bride Mother Name</label>
                    <input
                      type="text"
                      value={orderForm.brideMotherName}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, brideMotherName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                      placeholder="e.g. Mrs. Mary Smith"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Groom Father Name</label>
                    <input
                      type="text"
                      value={orderForm.groomFatherName}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, groomFatherName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                      placeholder="e.g. Mr. David Vance"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Groom Mother Name</label>
                    <input
                      type="text"
                      value={orderForm.groomMotherName}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, groomMotherName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                      placeholder="e.g. Mrs. Sarah Vance"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Marriage Venue & Map Link */}
              <div className="space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                  💒 Marriage Ceremony &amp; Venue Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Marriage Date *</label>
                    <input
                      type="date"
                      value={orderForm.weddingDate}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, weddingDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Marriage Venue Name</label>
                    <input
                      type="text"
                      value={orderForm.venueName}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, venueName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                      placeholder="e.g. Grand Palace Convention Hall"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Marriage Venue Address</label>
                  <textarea
                    rows={2}
                    value={orderForm.venueAddress}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, venueAddress: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100 resize-none"
                    placeholder="Full venue address with city, state, pincode"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Venue Google Map Link</label>
                  <input
                    type="url"
                    value={orderForm.venueMapLink}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, venueMapLink: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              {/* Section 3: Reception Venue Details */}
              <div className="space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                  🥂 Reception Ceremony Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Reception Date</label>
                    <input
                      type="date"
                      value={orderForm.receptionDate}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, receptionDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Reception Venue Name</label>
                    <input
                      type="text"
                      value={orderForm.receptionVenue}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, receptionVenue: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                      placeholder="e.g. Royal Banquet Hall"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Reception Address</label>
                  <textarea
                    rows={2}
                    value={orderForm.receptionAddress}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, receptionAddress: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100 resize-none"
                    placeholder="Reception venue full address and landmark"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Reception Google Map Link</label>
                  <input
                    type="url"
                    value={orderForm.receptionMapLink}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, receptionMapLink: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              {/* Section 4: Couple Photo Upload (Max 5 Photos) */}
              <div className="space-y-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <span>🖼️</span>
                    <span>Couple Photo Upload</span>
                  </h3>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    (orderForm.photos?.length || 0) >= 5 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {(orderForm.photos?.length || 0)} / 5 Uploaded
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Upload Photo Files (Max 5 total)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={(orderForm.photos?.length || 0) >= 5}
                      onChange={(e) => handleFileUpload(e, setOrderForm)}
                      className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 disabled:opacity-50 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Or Add Photo via Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={orderForm.tempUrlInput || ""}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, tempUrlInput: e.target.value }))}
                        disabled={(orderForm.photos?.length || 0) >= 5}
                        placeholder={(orderForm.photos?.length || 0) >= 5 ? "Maximum 5 photos reached" : "Paste image link (https://...) and click Add"}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        disabled={!orderForm.tempUrlInput?.trim() || (orderForm.photos?.length || 0) >= 5}
                        onClick={() => handleAddPhotoUrl(orderForm.tempUrlInput, setOrderForm)}
                        className="px-3.5 py-2 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-amber-400 disabled:opacity-40 transition shrink-0"
                      >
                        Add Photo
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Gallery (Up to 5) */}
                  {(orderForm.photos?.length || 0) > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
                      {orderForm.photos.map((url, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-amber-500/40 bg-slate-950 aspect-square flex items-center justify-center shadow-md">
                          <img src={url} alt={`Couple Photo ${idx + 1}`} className="w-full h-full object-cover" />
                          <span className="absolute top-1 left-1 bg-slate-950/85 text-amber-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-amber-500/30">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx, setOrderForm)}
                            className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center transition shadow-lg"
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
                      No couple photos uploaded yet. Select files or paste URLs above (up to 5 photos).
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Contact Phone/WhatsApp *
                  </label>
                  <input
                    type="text"
                    value={orderForm.contact}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, contact: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPreset(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-extrabold uppercase tracking-wider transition shadow-lg"
                >
                  Confirm Order Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ThemeEditorModal
        isOpen={themeModalOpen}
        preset={editingPreset}
        onClose={() => setThemeModalOpen(false)}
        onSave={() => setPresets(dbStore.getPresets())}
        showToast={showToast}
      />

      <GuidedInvitationModal
        isOpen={isGuidedModalOpen}
        onClose={() => setIsGuidedModalOpen(false)}
        initialCategoryId={selectedCategory === "all" ? "wedding" : selectedCategory}
        onCreated={(newInv) => {
          showToast("New invitation draft created & Google Drive folder linked!", "success");
          navigate(currentUser?.role === 'admin' ? `/admin/editor/${newInv.id}` : '/customer');
        }}
      />

      <CustomDialog {...dialog} themeConfig={selectedPreset?.config || {}} />
      </div>
    </div>
  );
}
