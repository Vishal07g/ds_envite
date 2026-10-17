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
import InvitationTypeDropdown from '../components/InvitationTypeDropdown';

export default function PresetGallery() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [filterReligion, setFilterReligion] = useState("all");
  
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
      brideName: currentUser?.displayName?.split("&")[0]?.trim() || cfg.brideName || "Suman",
      groomName: currentUser?.displayName?.split("&")[1]?.trim() || cfg.groomName || "Vishal",
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

  useEffect(() => {
    const handleSync = () => {
      setPresets(dbStore.getPresets());
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
    if (filterReligion === "all") return true;
    return p.religion === filterReligion;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-body)] p-6 space-y-8 font-sans preset-gallery-container">
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: "" })} />
      )}

      {/* Hero Banner with a beautiful dark themed glass card wrapper */}
      <div className="w-[calc(100%+3rem)] -mx-6 rounded-none bg-[#0b0f19]/75 border-y border-white/5 shadow-2xl backdrop-blur-md hero-dark-card py-10 px-6 -mt-6">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-cinzel font-bold tracking-wider text-amber-100 leading-tight">
            Digital Invitation
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
            Choose from our selection of premium curated presets. Instantly preview templates, submit wedding details, and share a watermark-free experience upon payment.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4 border-y border-slate-850 py-5 max-w-6xl mx-auto px-2">
        <div className="flex-1 max-w-sm">
          <InvitationTypeDropdown
            value={filterReligion}
            onChange={setFilterReligion}
            labelText="Invitation Type & Theme Category"
          />
        </div>
        
        <div className="flex items-center space-x-3 self-end md:self-auto">
          {currentUser?.role === 'admin' && (
            <button
              onClick={handleOpenCreateTheme}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg hover:shadow-amber-500/20 active:scale-98 transition flex items-center space-x-1.5 shrink-0"
            >
              <SvgPlus className="w-4 h-4 text-slate-950" />
              <span>Add New Theme</span>
            </button>
          )}
        </div>
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto pt-4">
        {filteredPresets.map(preset => {
          const cfg = preset.config || {};
          const hex = (cfg.primaryColor || "#0b1329").replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16) || 0;
          const g = parseInt(hex.substring(2, 4), 16) || 0;
          const b = parseInt(hex.substring(4, 6), 16) || 0;
          const isLightBg = ((r * 299 + g * 587 + b * 114) / 1000) > 155;

          return (
            <div key={preset.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition duration-300">
              
              {/* Card visual thumbnail — mirrors invitation design */}
              <div 
                className="h-48 p-4 flex flex-col justify-between relative overflow-hidden bg-cover bg-center border-b border-slate-800 group"
                style={{ 
                  backgroundColor: cfg.primaryColor || '#0b1329',
                  backgroundImage: `linear-gradient(${isLightBg ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.45)'}, ${isLightBg ? 'rgba(255,255,255,0.70)' : 'rgba(0,0,0,0.75)'}), url("${preset.thumbnail || cfg.heroImage || '/bg_floral_pink.jpg'}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Ornamental border overlay matching invitation */}
                <div 
                  className="absolute inset-2.5 border rounded-xl pointer-events-none transition-all duration-300 group-hover:scale-95"
                  style={{ borderColor: cfg.accentGold || '#f59e0b', opacity: 0.6 }}
                />

                <div className="flex justify-between items-center z-10">
                  <span className="text-base font-bold drop-shadow-md" style={{ color: isLightBg ? '#8a2b3f' : (cfg.accentGold || '#f59e0b') }}>
                    {cfg.customSacredSymbol || '✦'}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span 
                      className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-md shadow"
                      style={{
                        backgroundColor: isLightBg ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
                        color: isLightBg ? '#8a2b3f' : '#f59e0b',
                        border: `1px solid ${cfg.accentGold || '#f59e0b'}40`
                      }}
                    >
                      {preset.religion || 'secular'}
                    </span>
                    {currentUser?.role === 'admin' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleOpenEditTheme(preset);
                          }}
                          className="p-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-md flex items-center justify-center border border-slate-900 cursor-pointer"
                          title="Edit Theme Preset Details"
                        >
                          <SvgEdit className="w-3 h-3 text-slate-950 font-bold" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeletePreset(preset);
                          }}
                          className="p-1 rounded bg-rose-600 hover:bg-rose-500 text-white transition shadow-md flex items-center justify-center border border-slate-900 cursor-pointer"
                          title="Delete Invitation Design Preset"
                        >
                          <SvgTrash className="w-3 h-3 text-white" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* High-Contrast Headline & Couple Title Box */}
                <div 
                  className="text-center z-10 px-3 py-2 rounded-xl backdrop-blur-md shadow-md"
                  style={{
                    backgroundColor: isLightBg ? 'rgba(255, 255, 255, 0.88)' : 'rgba(11, 19, 41, 0.88)',
                    border: `1px solid ${isLightBg ? 'rgba(138, 43, 63, 0.35)' : 'rgba(229, 184, 88, 0.35)'}`
                  }}
                >
                  <h4 
                    className="text-xs font-extrabold tracking-wider uppercase font-cinzel line-clamp-1"
                    style={{ 
                      color: isLightBg ? '#8a2b3f' : (cfg.accentGold || '#f59e0b')
                    }}
                  >
                    {preset.title}
                  </h4>
                  <p 
                    className={`text-sm font-semibold ${cfg.cursiveFontClass || 'font-cursive'} truncate mt-0.5`}
                    style={{ color: isLightBg ? '#1e293b' : '#ffffff' }}
                  >
                    {cfg.brideName || 'Bride'} &amp; {cfg.groomName || 'Groom'}
                  </p>
                </div>

                <div className="flex justify-between items-center z-10 text-[9px] font-mono font-bold" style={{ color: isLightBg ? '#1e293b' : '#e2e8f0' }}>
                  <span className="bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm text-slate-200">ID: {preset.id}</span>
                  <div className="flex space-x-1 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: cfg.primaryColor }} title="Primary Color" />
                    <span className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: cfg.accentGold }} title="Accent Gold" />
                    <span className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: cfg.lightBgColor }} title="Light Bg" />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-cinzel text-sm font-extrabold text-slate-100 tracking-wide">{preset.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-extrabold border border-amber-500/25 uppercase tracking-wider">
                    {preset.religion || 'Secular'}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleOpenEditTheme(preset)}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                  >
                    <SvgSliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Customize &amp; Edit Design</span>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenPreviewModal(preset)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold text-center transition flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <SvgExternalLink className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => handleOpenOrderModal(preset)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-bold transition text-center uppercase tracking-wider shadow cursor-pointer"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>

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
                    placeholder="Suman"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Groom Name</label>
                  <input
                    type="text"
                    value={previewForm.groomName}
                    onChange={(e) => setPreviewForm(prev => ({ ...prev, groomName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                    placeholder="Vishal"
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

      <CustomDialog {...dialog} themeConfig={selectedPreset?.config || {}} />
    </div>
  );
}
