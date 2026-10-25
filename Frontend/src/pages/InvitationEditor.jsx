import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import dbStore, { DEFAULT_CONFIG } from '../data/store';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import InvitationRenderer from '../components/InvitationRenderer';
import Watermark from '../components/Watermark';
import { SvgCheck, SvgEye, SvgSliders, SvgCopy, SvgLogOut, SvgSparkles, SvgUsers, SvgDownload, SvgImage, SvgMail } from '../components/icons';
import Toast from '../components/Toast';
import PaymentModal from '../components/PaymentModal';
import AiAssistantModal from '../components/AiAssistantModal';
import GuestManagerModal from '../components/GuestManagerModal';
import ShareInviteModal from '../components/ShareInviteModal';
import { downloadPrintablePdfCard, downloadInvitationImage, downloadStandaloneHtmlWebsite } from '../utils/exportInvitation';
import { formatDriveFolderName, GOOGLE_DRIVE_ROOT_FOLDER_URL } from '../utils/googleDriveStorage';

export default function InvitationEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  
  // Customization state - initialized synchronously to avoid flash of default names
  const cachedInv = id ? dbStore.getInvitationById(id) : null;
  const [invitation, setInvitation] = useState(() => cachedInv);
  const [config, setConfig] = useState(() => {
    if (cachedInv?.config) {
      const cleaned = { ...DEFAULT_CONFIG, ...cachedInv.config };
      if (cleaned.scratchImage && typeof cleaned.scratchImage === 'string' && cleaned.scratchImage.includes('photo-1519225495810-7512c696505a')) {
        cleaned.scratchImage = "";
      }
      return cleaned;
    }
    return DEFAULT_CONFIG;
  });
  const [title, setTitle] = useState(() => cachedInv?.title || "New Wedding Invitation");
  const [customerId, setCustomerId] = useState(() => cachedInv?.customerId || "");
  const [isPaid, setIsPaid] = useState(() => cachedInv?.isPaid || false);
  const [status, setStatus] = useState(() => cachedInv?.status || "draft");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // AI & Guest Manager Modals
  const [showAiModal, setShowAiModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewEnvelope, setPreviewEnvelope] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState({ hero: false, story: false, scratch: false });
  const [musicPlaying, setMusicPlaying] = useState(true);

  // Upper Toolbar Scroll State & Middle Mouse Wheel Controls
  const toolbarRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkToolbarScroll = useCallback(() => {
    const el = toolbarRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;

    // 1. Mouse wheel horizontal scroll (middle mouse wheel)
    const onWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.25;
        checkToolbarScroll();
      } else if (e.deltaX !== 0) {
        checkToolbarScroll();
      }
    };

    // 2. Click-and-drag / Middle-click panning support
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    const onMouseDown = (e) => {
      // Middle click (button 1) anywhere, or left click (button 0) directly on toolbar background
      if (e.button === 1 || (e.button === 0 && (e.target === el || e.target.classList?.contains('editor-toolbar-inner')))) {
        isDown = true;
        startX = e.pageX - el.offsetLeft;
        scrollStart = el.scrollLeft;
        el.classList.add('toolbar-dragging');
        if (e.button === 1) e.preventDefault();
      }
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollStart - walk;
      checkToolbarScroll();
    };

    const onMouseUp = () => {
      isDown = false;
      el.classList.remove('toolbar-dragging');
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('scroll', checkToolbarScroll);
    window.addEventListener('resize', checkToolbarScroll);

    // Initial check
    const timer = setTimeout(checkToolbarScroll, 200);

    return () => {
      clearTimeout(timer);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('scroll', checkToolbarScroll);
      window.removeEventListener('resize', checkToolbarScroll);
    };
  }, [checkToolbarScroll, sidebarOpen]);

  const showToast = useCallback((message, type = "info") => {
    setToast({ show: true, message, type });
  }, []);

  const customers = useMemo(() => dbStore.getUsers().filter(u => u.role === 'customer'), []);

  // Load invitation
  useEffect(() => {
    // If we have state from accept order redirect
    const stateCustomerId = location.state?.assignTo;
    if (stateCustomerId) {
      setCustomerId(stateCustomerId);
      const cust = dbStore.getUserById(stateCustomerId);
      if (cust) {
        setTitle(`${cust.displayName}'s Wedding Invitation`);
      }
    }

    if (id) {
      const inv = dbStore.getInvitationById(id);
      if (inv) {
        // Security gate: customer can only edit their own invitation
        if (currentUser?.role === 'customer' && inv.customerId !== currentUser.id) {
          showToast("Access Denied: You cannot edit another customer's invitation.", "error");
          navigate('/customer', { replace: true });
          return;
        }

        setInvitation(inv);
        const invConfig = inv.config || {};
        const cleanedConfig = { 
          ...DEFAULT_CONFIG, 
          ...invConfig,
          brideName: invConfig.brideName || invConfig.coverBrideText || "",
          groomName: invConfig.groomName || invConfig.coverGroomText || "",
          coverBrideText: invConfig.coverBrideText || invConfig.brideName || "",
          coverGroomText: invConfig.coverGroomText || invConfig.groomName || "",
        };
        if (cleanedConfig.scratchImage && typeof cleanedConfig.scratchImage === 'string' && cleanedConfig.scratchImage.includes('photo-1519225495810-7512c696505a')) {
          cleanedConfig.scratchImage = "";
        }
        setConfig(cleanedConfig);
        setTitle(inv.title);
        setCustomerId(inv.customerId || "");
        setIsPaid(inv.isPaid || false);
        setStatus(inv.status || "draft");
      } else {
        showToast("Invitation not found, creating new draft.", "error");
      }
    }
  }, [id, location.state, currentUser]);

  const handleFieldChange = (field, val) => {
    if (field === 'driveStorage') {
      setInvitation(prev => prev ? { ...prev, driveStorage: val } : prev);
      return;
    }
    setConfig(prev => {
      const next = { ...prev, [field]: val };
      if (field === 'coverBrideText') {
        next.brideName = val;
        const groom = next.coverGroomText || next.groomName || '';
        next.envelopeNamesText = `${val}${groom ? ` & ${groom}` : ''}`;
        next.envelopeInitials = `${val.charAt(0)}${groom ? ` & ${groom.charAt(0)}` : ''}`;
      } else if (field === 'coverGroomText') {
        next.groomName = val;
        const bride = next.coverBrideText || next.brideName || '';
        next.envelopeNamesText = `${bride ? `${bride} & ` : ''}${val}`;
        next.envelopeInitials = `${bride ? `${bride.charAt(0)} & ` : ''}${val.charAt(0)}`;
      } else if (field === 'brideName') {
        next.coverBrideText = val;
        const groom = next.coverGroomText || next.groomName || '';
        next.envelopeNamesText = `${val}${groom ? ` & ${groom}` : ''}`;
        next.envelopeInitials = `${val.charAt(0)}${groom ? ` & ${groom.charAt(0)}` : ''}`;
      } else if (field === 'groomName') {
        next.coverGroomText = val;
        const bride = next.coverBrideText || next.brideName || '';
        next.envelopeNamesText = `${bride ? `${bride} & ` : ''}${val}`;
        next.envelopeInitials = `${bride ? `${bride.charAt(0)} & ` : ''}${val.charAt(0)}`;
      }
      return next;
    });
  };

  const handleSave = async () => {
    const dataToSave = {
      title,
      customerId: customerId || null,
      config,
      isPaid,
      status,
      driveStorage: invitation?.driveStorage
    };

    try {
      let targetId = id;
      if (id) {
        const savedInv = dbStore.updateInvitation(id, dataToSave);
        if (savedInv) {
          setInvitation(savedInv);
        }
        
        // Also update preset config if linked to a preset to keep visual gallery cards and thumbnails in sync!
        if (config.presetId) {
          dbStore.updatePreset(config.presetId, {
            config: { ...config }
          });
        }
        
        showToast("Invitation customisation saved successfully!", "success");
      } else {
        const newInv = dbStore.createInvitation(customerId || null, title, config, isPaid, status);
        targetId = newInv.id;
        showToast("New invitation draft created!", "success");
        navigate(`/admin/editor/${newInv.id}`, { replace: true });
      }


    } catch (e) {
      console.error("Save failed with exception:", e);
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        showToast("Storage full! Please upload smaller images or compress them.", "error");
      } else {
        showToast(`Failed to save: ${e.message || "Unknown error"}`, "error");
      }
    }
  };

  const handleDuplicateInvitation = () => {
    if (!id) {
      showToast("Please save the invitation first before duplicating.", "info");
      return;
    }
    const dup = dbStore.duplicateInvitation(id, null, currentUser?.role === 'customer' ? currentUser?.id : null);
    if (dup) {
      showToast(`Duplicated as "${dup.title}"! Loading new copy...`, "success");
      navigate(`/admin/editor/${dup.id}`);
    } else {
      showToast("Failed to duplicate invitation", "error");
    }
  };

  // real Google Imagen 4.0 fetch with prompt settings
  const handleAIImageGen = async (imageType) => {
    setIsGeneratingImg(prev => ({ ...prev, [imageType]: true }));
    const apiKey = localStorage.getItem("google_ai_apikey") || "";
    
    // Prompts matching config fields or fallback defaults
    const promptField = imageType === "hero" ? "aiHeroPrompt" : imageType === "story" ? "aiStoryPrompt" : "aiScratchPrompt";
    const prompt = config[promptField] || {
      hero: "Luxurious watercolor elegant wedding card, golden roses, navy blue marble background",
      story: "Charming watercolor painting of a romantic couple walking hand-in-hand in a park",
      scratch: "Magical key and golden lock wrapped in starry vines, watercolor gold accents"
    }[imageType];

    if (!apiKey) {
      // Simulation/fallback to elegant Unsplash image keywords if no API key is set
      showToast("No Google AI API Key configured in sidebar. Using elegant Unsplash keyword fallback.", "info");
      
      const unsplashUrl = {
        hero: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
        story: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200",
        scratch: "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=1200"
      }[imageType] + `&sig=${Date.now()}`;
      
      handleFieldChange(imageType === "hero" ? "heroImage" : imageType === "story" ? "storyImage" : "scratchImage", unsplashUrl);
      setIsGeneratingImg(prev => ({ ...prev, [imageType]: false }));
      return;
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
    const payload = {
      instances: [{ prompt: prompt }],
      parameters: { sampleCount: 1 }
    };

    let success = false;
    let base64Result = "";

    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData.predictions?.[0]?.bytesBase64Encoded) {
            base64Result = `data:image/png;base64,${resData.predictions[0].bytesBase64Encoded}`;
            success = true;
            break;
          }
        }
      } catch (err) {
        // Backoff retry
        await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt)));
      }
    }

    if (success && base64Result) {
      handleFieldChange(imageType === "hero" ? "heroImage" : imageType === "story" ? "storyImage" : "scratchImage", base64Result);
      showToast("Beautiful new custom artwork painted by AI successfully!", "success");
    } else {
      showToast("AI Painting system busy. Kept previous image url.", "error");
    }
    setIsGeneratingImg(prev => ({ ...prev, [imageType]: false }));
  };

  const handleCopyLink = () => {
    if (!id) return;
    const origin = window.location.origin;
    const shareSlug = dbStore.getInvitationShareSlug(invitation || { id, config });
    const shareUrl = `${origin}/invite/${shareSlug}${isPaid ? '' : '?preview=true'}`;
    navigator.clipboard.writeText(shareUrl);
    showToast("Invitation preview link copied!", "success");
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[var(--bg-app)] text-[var(--text-body)] overflow-hidden font-sans relative">
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: "" })} />
      )}

      {/* Collapsible Customization Sidebar Panel */}
      <div 
        id="admin-sidebar"
        className={`admin-sidebar border-slate-800 transition-all duration-300 shrink-0 z-10 order-last md:order-first ${
          sidebarOpen 
            ? 'w-full h-[55vh] md:h-full md:w-[420px] border-t md:border-t-0 md:border-r' 
            : 'hidden'
        }`}
      >
        <AdminSidebar
          invitation={invitation || { id, title, config }}
          config={config}
          onChangeField={handleFieldChange}
          onAiImageGen={handleAIImageGen}
          isGeneratingImg={isGeneratingImg}
          customers={customers}
          assignedCustomerId={customerId}
          onAssignCustomer={setCustomerId}
          isPaid={isPaid}
          onChangePaymentStatus={setIsPaid}
          status={status}
          onChangeStatus={setStatus}
          onClose={() => setSidebarOpen(false)}
          isAdmin={isAdmin}
          onSave={handleSave}
        />
      </div>

      {/* Split screen content: Live preview with floating control bar */}
      <div className={`flex-1 flex flex-col relative overflow-hidden w-full order-first md:order-last ${
        sidebarOpen ? 'h-[45vh] md:h-full sidebar-open' : 'h-full sidebar-closed'
      }`}>
        
        {/* Editor floating toolbar with smooth responsive fit, middle mouse wheel scrolling & navigation chevrons */}
        <div className="relative w-full border-b border-[#E9DCCB] bg-[#F7EFE5] shrink-0 z-20 shadow-xs group/toolbar select-none">
          {/* Left scroll chevron button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => toolbarRef.current?.scrollBy({ left: -180, behavior: 'smooth' })}
              className="absolute left-0 top-0 bottom-0 z-30 flex items-center justify-center px-1.5 bg-gradient-to-r from-[#F7EFE5] via-[#F7EFE5]/95 to-transparent text-[#513321] transition cursor-pointer shadow-xs"
              title="Scroll toolbar left (or roll middle mouse wheel)"
            >
              <span className="w-5 h-5 rounded-full bg-white border border-[#E9DCCB] flex items-center justify-center text-[9px] font-black text-[#513321] hover:bg-[#FAF7F2] hover:border-[#C49A4A] shadow-xs transition">
                ◀
              </span>
            </button>
          )}

          <div 
            ref={toolbarRef}
            className="editor-top-toolbar w-full px-2 sm:px-3 overflow-x-auto overflow-y-hidden"
          >
            <div className="editor-toolbar-inner flex items-center gap-1.5 py-0.5 w-auto min-w-0">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="editor-toolbar-btn editor-toolbar-btn-collapsible"
                  title="Open Customization Controls"
                >
                  <SvgSliders className="w-3 h-3 shrink-0 text-[#513321]" />
                  <span className="editor-btn-text">Customize</span>
                </button>
              )}

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="editor-toolbar-input w-[70px] sm:w-[80px] 2xl:w-[95px] focus:outline-none focus:border-[#C49A4A]"
                placeholder="Title"
                title="Invitation Title"
              />

              <button
                onClick={() => setShowAiModal(true)}
                className="editor-toolbar-btn editor-toolbar-btn-collapsible"
                title="Generate AI Wedding Wording with Gemini AI"
              >
                <SvgSparkles className="w-3 h-3 shrink-0 text-[#513321]" />
                <span className="editor-btn-text">AI Wording</span>
              </button>

              <button
                onClick={() => setShowGuestModal(true)}
                className="editor-toolbar-btn editor-toolbar-btn-collapsible"
                title="Manage Guests & RSVP List"
              >
                <SvgUsers className="w-3 h-3 shrink-0 text-[#513321]" />
                <span className="editor-btn-text">Guests</span>
              </button>

              <button
                onClick={() => downloadPrintablePdfCard(config, id)}
                className="editor-toolbar-btn editor-toolbar-btn-collapsible"
                title="Download Printable PDF Invitation Card"
              >
                <SvgDownload className="w-3 h-3 shrink-0 text-[#513321]" />
                <span className="editor-btn-text">PDF</span>
              </button>

              <button
                onClick={() => downloadInvitationImage(config)}
                className="editor-toolbar-btn editor-toolbar-btn-collapsible"
                title="Export High-Res PNG Image"
              >
                <SvgImage className="w-3 h-3 shrink-0 text-[#513321]" />
                <span className="editor-btn-text">PNG</span>
              </button>

              <button
                onClick={() => {
                  downloadStandaloneHtmlWebsite(config, { id });
                  showToast("Standalone HTML website downloaded! Opens in any browser with zero login.", "success");
                }}
                className="editor-toolbar-btn editor-toolbar-btn-collapsible"
                title="Download 100% Independent Standalone Interactive HTML Website (Runs offline & online without any login)"
              >
                <span className="text-[10px] leading-none">🌐</span>
                <span className="editor-btn-text">HTML</span>
              </button>

              <button
                onClick={() => {
                  const nextVal = !previewEnvelope;
                  setPreviewEnvelope(nextVal);
                  if (nextVal) {
                    setMusicPlaying(true);
                  }
                }}
                className={`editor-toolbar-btn editor-toolbar-btn-collapsible ${
                  previewEnvelope ? 'editor-toolbar-btn-active' : ''
                }`}
                title="Toggle Full-Screen Envelope Live Preview"
              >
                <SvgMail className="w-3 h-3 shrink-0 text-[#513321]" />
                <span className="editor-btn-text">{previewEnvelope ? "Card" : "Envelope"}</span>
              </button>

              <button
                onClick={() => handleFieldChange("showGlobalBorder", config.showGlobalBorder === false ? true : false)}
                className={`editor-toolbar-btn editor-toolbar-btn-collapsible ${
                  config.showGlobalBorder !== false ? 'editor-toolbar-btn-active' : ''
                }`}
                title="Toggle Luxury Border Frame ON/OFF"
              >
                <span className="text-[10px] leading-none">🖼️</span>
                <span className="editor-btn-text">Frame: {config.showGlobalBorder !== false ? "ON" : "OFF"}</span>
              </button>

              {id && (
                <>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="editor-toolbar-btn editor-toolbar-btn-collapsible"
                    title="Share Invitation Website (Copy Link, WhatsApp, Standalone HTML)"
                  >
                    <SvgCopy className="w-3 h-3 shrink-0 text-[#513321]" />
                    <span className="editor-btn-text">Share</span>
                  </button>
                  <button
                    onClick={handleDuplicateInvitation}
                    className="editor-toolbar-btn editor-toolbar-btn-collapsible"
                    title="Duplicate Saved Invitation (Clone As Fresh Copy)"
                  >
                    <span className="text-[11px] leading-none">📋</span>
                    <span className="editor-btn-text">Duplicate</span>
                  </button>
                </>
              )}

              <a
                href={invitation?.driveStorage?.folderUrl || GOOGLE_DRIVE_ROOT_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="editor-toolbar-btn editor-toolbar-btn-collapsible text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-300/60"
                title={`Google Drive Cloud Folder: ${invitation?.driveStorage?.folderName || formatDriveFolderName(config, title)} (Click to open)`}
              >
                <span className="text-[10px]">☁️</span>
                <span className="editor-btn-text text-emerald-800 font-bold truncate max-w-[120px]">
                  {invitation?.driveStorage?.folderName || formatDriveFolderName(config, title)}
                </span>
                <span className="text-[8px] text-emerald-600">↗</span>
              </a>

              <button
                onClick={handleSave}
                className="editor-toolbar-btn editor-toolbar-btn-primary"
                title="Save All Customization Changes"
              >
                <SvgCheck className="w-3 h-3 shrink-0 text-[#513321]" />
                <span>Save</span>
              </button>

              <button
                onClick={() => navigate(currentUser?.role === 'customer' ? '/customer' : '/admin')}
                className="editor-toolbar-btn"
                title="Return to Dashboard"
              >
                <SvgLogOut className="w-3 h-3 shrink-0 text-[#513321]" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>

          {/* Right scroll chevron button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => toolbarRef.current?.scrollBy({ left: 180, behavior: 'smooth' })}
              className="absolute right-0 top-0 bottom-0 z-30 flex items-center justify-center px-1.5 bg-gradient-to-l from-[#F7EFE5] via-[#F7EFE5]/95 to-transparent text-[#513321] transition cursor-pointer shadow-xs"
              title="Scroll toolbar right (or roll middle mouse wheel)"
            >
              <span className="w-5 h-5 rounded-full bg-white border border-[#E9DCCB] flex items-center justify-center text-[9px] font-black text-[#513321] hover:bg-[#FAF7F2] hover:border-[#C49A4A] shadow-xs transition">
                ▶
              </span>
            </button>
          )}
        </div>

        {/* Sticky Watermark & Payment Notice Bar for Unpaid Invitations */}
        {!isPaid && (
          <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 z-30 shrink-0 shadow-md">
            <div className="flex items-center space-x-2 text-amber-300">
              <span className="animate-pulse">⚠️</span>
              <span className="font-semibold">Watermarked Preview Mode</span>
              <span className="hidden sm:inline text-amber-200/90 font-medium">• Pay set amount to remove watermark and unlock live HD invitation.</span>
            </div>
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider transition shadow-lg flex items-center space-x-1"
            >
              <span>📱 Pay via GPay / PhonePe (Remove Watermark)</span>
            </button>
          </div>
        )}

        {/* The Live Rendering Area */}
        <div id="invitation-preview-container" className="flex-1 w-full overflow-y-auto relative bg-[var(--bg-app)] custom-preview-scroller">
          
          {/* Simulated watermark inside editor if isPaid is false */}
          {!isPaid && <Watermark />}

          {/* Invitation View Layout */}
           <InvitationRenderer 
            key={previewEnvelope ? 'with-envelope' : 'without-envelope'}
            config={config} 
            showEnvelopeFirst={previewEnvelope} // Toggle live envelope preview inside editor
            isPlayingMusic={musicPlaying}
            onMusicToggle={setMusicPlaying}
            onChangeField={handleFieldChange}
            onSubmitRsvp={(form) => {
              showToast("RSVP Submitted! (Simulated inside Editor)", "success");
            }}
            onSubmitWish={(form) => {
              showToast("Blessing Posted! (Simulated inside Editor)", "success");
            }}
            onDeleteRsvp={(idx) => {
              showToast("RSVP Response Deleted! (Simulated inside Editor)", "info");
            }}
            onDeleteWish={(idx) => {
              showToast("Blessing Wish Deleted! (Simulated inside Editor)", "info");
            }}
            isModerator={true}
            onSelectElement={(el) => {
              // Open sidebar if closed
              if (!sidebarOpen) setSidebarOpen(true);
              // We'll pass this via a global event or prop to AdminSidebar later if needed,
              // or just use window dispatch for simplicity without prop drilling everything.
              window.dispatchEvent(new CustomEvent('adminSelectElement', { detail: el }));
            }}
          />
        </div>
      </div>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        order={{
          id: id || `ORD-${Date.now()}`,
          price: config.price || 999,
          discountPercent: config.discountPercent || 0,
          invitationId: id
        }}
        showToast={showToast}
      />

      <AiAssistantModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        brideName={config.brideName || "Ananya"}
        groomName={config.groomName || "Aarav"}
        religion={config.religionKey || "secular"}
        onApplyContent={(field, text) => {
          setConfig(prev => ({ ...prev, [field]: text }));
          showToast(`Applied AI text to: ${field}!`, "success");
        }}
      />

      <GuestManagerModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        guests={invitation?.guestList || []}
        inviteUrl={id ? `${window.location.origin}/invite/${dbStore.getInvitationShareSlug(invitation || { id, config })}` : ""}
        brideName={config.brideName || "Ananya"}
        groomName={config.groomName || "Aarav"}
        onUpdateGuests={(newList) => {
          if (id) {
            dbStore.updateInvitation(id, { guestList: newList });
          }
        }}
      />

      <ShareInviteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        invitationId={id}
        invitation={invitation}
        config={config}
        isPaid={isPaid}
        showToast={showToast}
      />
    </div>
  );
}
