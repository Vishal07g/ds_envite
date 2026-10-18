import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

export default function InvitationEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  
  // Customization state
  const [invitation, setInvitation] = useState(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [title, setTitle] = useState("New Wedding Invitation");
  const [customerId, setCustomerId] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [status, setStatus] = useState("draft");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // AI & Guest Manager Modals
  const [showAiModal, setShowAiModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewEnvelope, setPreviewEnvelope] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState({ hero: false, story: false, scratch: false });
  const [musicPlaying, setMusicPlaying] = useState(false);

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
        const cleanedConfig = { ...DEFAULT_CONFIG, ...inv.config };
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
    setConfig(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    const dataToSave = {
      title,
      customerId: customerId || null,
      config,
      isPaid,
      status
    };

    try {
      let targetId = id;
      if (id) {
        dbStore.updateInvitation(id, dataToSave);
        
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
        
        {/* Editor floating toolbar with smooth responsive fit */}
        <div className="editor-top-toolbar w-full border-b border-[#E9DCCB] bg-[#F7EFE5] px-1 sm:px-2 shrink-0 z-20 shadow-xs">
          <div className="editor-toolbar-inner flex items-center gap-1 py-0.5 w-full min-w-0">
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
              onClick={() => setPreviewEnvelope(!previewEnvelope)}
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
              <button
                onClick={() => setShowShareModal(true)}
                className="editor-toolbar-btn editor-toolbar-btn-collapsible"
                title="Share Invitation Website (Copy Link, WhatsApp, Standalone HTML)"
              >
                <SvgCopy className="w-3 h-3 shrink-0 text-[#513321]" />
                <span className="editor-btn-text">Share</span>
              </button>
            )}

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
