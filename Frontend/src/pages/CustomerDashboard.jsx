import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dbStore from '../data/store';
import { 
  SvgEye, SvgSparkles, SvgUsers, SvgMessageSquare, 
  SvgClipboard, SvgExternalLink, SvgShare, SvgCopy, SvgCalendar, SvgEdit,
  SvgCheck, SvgVolume2, SvgVolumeX, SvgDownload, SvgImage
} from '../components/icons';
import Toast from '../components/Toast';
import CustomDialog from '../components/CustomDialog';
import PaymentModal from '../components/PaymentModal';
import InvoiceModal from '../components/InvoiceModal';
import InvitationTypeDropdown from '../components/InvitationTypeDropdown';
import AiAssistantModal from '../components/AiAssistantModal';
import GuestManagerModal from '../components/GuestManagerModal';
import { downloadPrintablePdfCard, downloadInvitationImage, downloadStandaloneHtmlWebsite } from '../utils/exportInvitation';
import { getCoupleInitials } from '../utils/monogramThumbnail';
import { formatDriveFolderName, GOOGLE_DRIVE_ROOT_FOLDER_URL, uploadInvitationFileToDrive } from '../utils/googleDriveStorage';
import { formatDriveDirectUrl } from '../utils/helpers';

export default function CustomerDashboard() {
  const { currentUser } = useAuth();
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [activeShareInvite, setActiveShareInvite] = useState(null); // invite id to show sharing details
  const [customShareText, setCustomShareText] = useState("");
  const [, setTick] = useState(0);

  // Customer Music Manager Modal state
  const [musicModalTarget, setMusicModalTarget] = useState(null);
  const [customerMusicForm, setCustomerMusicForm] = useState(null);
  const custStartingAudioRef = React.useRef(null);
  const custMainAudioRef = React.useRef(null);
  const [custStartingPlaying, setCustStartingPlaying] = useState(false);
  const [custMainPlaying, setCustMainPlaying] = useState(false);

  // New Modals for AI Wording, Guest Manager & Export
  const [showAiModal, setShowAiModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  // Edit and Cancel order states
  const [editingOrder, setEditingOrder] = useState(null);
  const [previewOrderModal, setPreviewOrderModal] = useState(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState(null);
  const [invoiceModalTarget, setInvoiceModalTarget] = useState(null);
  const [editOrderForm, setEditOrderForm] = useState({
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
    startingMusicEnabled: true,
    startingMusicUrl: "",
    startingMusicTitle: "",
    mainMusicEnabled: true,
    musicUrl: "",
    musicTitle: "",
    contact: ""
  });
  const [dialog, setDialog] = useState({ show: false, type: 'alert', message: '', onConfirm: null, onCancel: null });

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

  const handleOpenOrderPreview = (order) => {
    setPreviewOrderModal(order);
  };

  const handleLaunchLivePreview = (order) => {
    const preset = dbStore.getPresetById(order.presetId) || dbStore.getPresets()[0];
    const tempConfig = {
      ...(preset?.config || {}),
      brideName: order.details?.brideName || preset?.config?.brideName || "Bride",
      groomName: order.details?.groomName || preset?.config?.groomName || "Groom",
      brideFatherName: order.details?.brideFatherName || "",
      brideMotherName: order.details?.brideMotherName || "",
      groomFatherName: order.details?.groomFatherName || "",
      groomMotherName: order.details?.groomMotherName || "",
      weddingDate: order.details?.weddingDate ? `${order.details.weddingDate}T16:00:00` : preset?.config?.weddingDate,
      weddingVenue: order.details?.venueName ? `${order.details.venueName}, ${order.details.venueAddress || ''}` : preset?.config?.weddingVenue,
      venueMapLink: order.details?.venueMapLink || "",
      photos: order.details?.photos || (order.details?.photoUrl ? [order.details.photoUrl] : []),
      photoUrl: (order.details?.photos && order.details.photos[0]) || order.details?.photoUrl || "",
      receptionVenue: order.details?.receptionVenue || "",
      receptionAddress: order.details?.receptionAddress || "",
      receptionDate: order.details?.receptionDate || "",
      receptionMapLink: order.details?.receptionMapLink || "",
      contact: order.details?.contact || ""
    };
    sessionStorage.setItem("preview_temp_config", JSON.stringify(tempConfig));
    sessionStorage.setItem("preview_preset_id", order.presetId || preset.id);
    
    const inv = invitations.find(i => i.presetId === order.presetId || i.id === order.invitationId);
    if (inv) {
      window.open(`/invite/${inv.id}?preview=true`, '_blank');
    } else {
      window.open(`/invite/demo?preset=${order.presetId || preset.id}&preview=true`, '_blank');
    }
  };

  const triggerDialog = (options) => {
    setDialog({
      show: true,
      type: options.type || 'alert',
      title: options.title || 'System Message',
      message: options.message || '',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      onConfirm: () => {
        setDialog(prev => ({ ...prev, show: false }));
        options.onConfirm && options.onConfirm();
      },
      onCancel: () => {
        setDialog(prev => ({ ...prev, show: false }));
        options.onCancel && options.onCancel();
      }
    });
  };

  const handleEditOrderClick = (order) => {
    setEditingOrder(order);
    const existingPhotos = order.details?.photos || (order.details?.photoUrl ? [order.details.photoUrl] : []);
    setEditOrderForm({
      brideName: order.details?.brideName || "",
      groomName: order.details?.groomName || "",
      brideFatherName: order.details?.brideFatherName || "",
      brideMotherName: order.details?.brideMotherName || "",
      groomFatherName: order.details?.groomFatherName || "",
      groomMotherName: order.details?.groomMotherName || "",
      weddingDate: order.details?.weddingDate || "",
      venueName: order.details?.venueName || "",
      venueAddress: order.details?.venueAddress || "",
      venueMapLink: order.details?.venueMapLink || "",
      photos: existingPhotos,
      tempUrlInput: "",
      receptionVenue: order.details?.receptionVenue || "",
      receptionAddress: order.details?.receptionAddress || "",
      receptionDate: order.details?.receptionDate || "",
      receptionMapLink: order.details?.receptionMapLink || "",
      startingMusicEnabled: order.details?.startingMusicEnabled !== false,
      startingMusicUrl: order.details?.startingMusicUrl || "",
      startingMusicTitle: order.details?.startingMusicTitle || "",
      mainMusicEnabled: order.details?.mainMusicEnabled !== false,
      musicUrl: order.details?.musicUrl || "",
      musicTitle: order.details?.musicTitle || "",
      contact: order.details?.contact || ""
    });
  };

  const handleEditOrderSubmit = (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    const finalData = {
      ...editOrderForm,
      photoUrl: (editOrderForm.photos && editOrderForm.photos[0]) || ""
    };
    dbStore.updateOrder(editingOrder.id, finalData);

    // Synchronize wedding details and music with linked invitation to trigger automatic Google Drive folder rename
    const linkedInv = dbStore.getInvitations().find(i => i.id === editingOrder.invitationId || i.orderId === editingOrder.id || i.presetId === editingOrder.presetId);
    if (linkedInv) {
      dbStore.updateInvitation(linkedInv.id, {
        config: {
          ...linkedInv.config,
          brideName: finalData.brideName || linkedInv.config?.brideName,
          groomName: finalData.groomName || linkedInv.config?.groomName,
          weddingVenue: finalData.venueName || linkedInv.config?.weddingVenue,
          weddingAddress: finalData.venueAddress || linkedInv.config?.weddingAddress,
          weddingDate: finalData.weddingDate || linkedInv.config?.weddingDate,
          startingMusicEnabled: finalData.startingMusicEnabled,
          startingMusicUrl: finalData.startingMusicUrl,
          startingMusicTitle: finalData.startingMusicTitle,
          mainMusicEnabled: finalData.mainMusicEnabled,
          musicUrl: finalData.musicUrl,
          musicTitle: finalData.musicTitle
        }
      });
    }

    setEditingOrder(null);
    showToast("Order details updated and Drive folder synced successfully!", "success");
    setTick(t => t + 1);
  };

  const handleOpenMusicModal = (inv) => {
    setMusicModalTarget(inv);
    const cfg = inv.config || {};
    setCustomerMusicForm({
      startingMusicEnabled: cfg.startingMusicEnabled !== false,
      startingMusicUrl: cfg.startingMusicUrl || "",
      startingMusicTitle: cfg.startingMusicTitle || "",
      startingMusicArtist: cfg.startingMusicArtist || "",
      mainMusicEnabled: cfg.mainMusicEnabled !== false,
      musicUrl: cfg.musicUrl || "",
      musicTitle: cfg.musicTitle || "",
      musicArtist: cfg.musicArtist || "",
      autoPlayMusic: cfg.autoPlayMusic !== false,
      loopMusic: cfg.loopMusic !== false,
      showMusicWidget: cfg.showMusicWidget !== false,
      musicVolume: cfg.musicVolume !== undefined ? Number(cfg.musicVolume) : 0.8
    });
  };

  const handleSaveCustomerMusic = () => {
    if (!musicModalTarget || !customerMusicForm) return;
    const currentCfg = musicModalTarget.config || {};
    const updatedCfg = {
      ...currentCfg,
      ...customerMusicForm
    };
    dbStore.updateInvitation(musicModalTarget.id, { config: updatedCfg });
    showToast("🎵 Songs and music preferences saved successfully!", "success");
    setMusicModalTarget(null);
    setTick(t => t + 1);
  };

  const handleCancelOrder = (order) => {
    triggerDialog({
      type: 'confirm',
      title: 'Cancel Order',
      message: `Are you sure you want to cancel order ${order.id}?`,
      confirmText: 'Yes, Cancel Order',
      onConfirm: () => {
        dbStore.cancelOrder(order.id);
        showToast("Order cancelled successfully", "info");
        setTick(t => t + 1);
      }
    });
  };

  const handleDuplicateInvitation = (id) => {
    const duplicated = dbStore.duplicateInvitation(id, null, currentUser?.id);
    if (duplicated) {
      showToast(`Invitation duplicated as "${duplicated.title}"!`, "success");
      setTick(t => t + 1);
    } else {
      showToast("Failed to duplicate invitation", "error");
    }
  };

  useEffect(() => {
    const handleSync = () => setTick(t => t + 1);
    window.addEventListener("db_synced", handleSync);
    return () => window.removeEventListener("db_synced", handleSync);
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  const [filterReligion, setFilterReligion] = useState("all");

  const rawInvitations = dbStore.getInvitationsByCustomer(currentUser?.id) || [];
  const invitations = rawInvitations.filter(inv => {
    if (filterReligion === "all") return true;
    const relKey = inv.config?.religionKey || inv.religion;
    return relKey === filterReligion;
  });
  const orders = dbStore.getOrdersByCustomer(currentUser?.id) || [];

  const handleOpenShare = (inv) => {
    setActiveShareInvite(inv);
    const origin = window.location.origin;
    const shareSlug = dbStore.getInvitationShareSlug(inv);
    const shareUrl = `${origin}/invite/${shareSlug}`;
    const bride = inv.config?.brideName || "Bride";
    const groom = inv.config?.groomName || "Groom";
    
    // Set clean, uncluttered wedding invitation template
    const template = inv.shareText || "💌 *Wedding Invitation* 💌\n*{bride} & {groom}*\n\nWe warmly invite you to celebrate our wedding union! 💍\n\n✨ *View our interactive invitation & RSVP:*\n{url}";
    const replaced = template
      .replace("{url}", shareUrl)
      .replace("{bride}", bride)
      .replace("{groom}", groom);
    
    setCustomShareText(replaced);
  };

  const handleCopyLink = (invId) => {
    const origin = window.location.origin;
    const inv = dbStore.getInvitationById(invId);
    const shareSlug = dbStore.getInvitationShareSlug(inv || { id: invId });
    const shareUrl = `${origin}/invite/${shareSlug}`;
    navigator.clipboard.writeText(shareUrl);
    showToast("Final invitation link copied to clipboard!", "success");
  };

  const handleSaveShareText = () => {
    if (!activeShareInvite) return;
    dbStore.updateInvitation(activeShareInvite.id, { shareText: customShareText });
    showToast("Custom share message template saved!", "success");
  };

  const triggerWhatsappShare = () => {
    const encoded = encodeURIComponent(customShareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const triggerEmailShare = () => {
    const subject = encodeURIComponent(`${activeShareInvite?.config?.brideName || 'Wedding'} & ${activeShareInvite?.config?.groomName || 'Wedding'} Invitation`);
    const body = encodeURIComponent(customShareText);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="min-h-screen p-6 bg-[var(--bg-app)] text-[var(--text-body)] space-y-8 font-sans customer-dashboard-container">
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: "" })} />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 block mb-0.5">Welcome back</span>
          <h1 className="text-3xl font-cinzel tracking-wider text-amber-100 font-extrabold drop-shadow-md mt-1">
            My Wedding Invitations
          </h1>
          <p className="text-xs text-slate-300 font-medium mt-1">Logged in as {currentUser?.displayName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <button
            onClick={() => setShowAiModal(true)}
            className="editor-toolbar-btn px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition shadow-xs"
          >
            <SvgSparkles className="w-4 h-4 shrink-0 text-[#7C3AED] animate-pulse" />
            <span>AI Content Generator</span>
          </button>
          <button
            onClick={() => setShowGuestModal(true)}
            className="editor-toolbar-btn px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition shadow-xs"
          >
            <SvgUsers className="w-4 h-4 shrink-0 text-[#2563EB]" />
            <span>Manage Guests &amp; RSVPs</span>
          </button>
          <button
            onClick={() => {
              const inv = invitations[0];
              downloadPrintablePdfCard(inv?.config || dbStore.getPresets()[0]?.config, inv?.id);
            }}
            className="editor-toolbar-btn px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition shadow-xs"
            title="Download Printable PDF Invitation Card"
          >
            <SvgDownload className="w-4 h-4 shrink-0 text-[#059669]" />
            <span>PDF Card</span>
          </button>
          <button
            onClick={() => {
              const mainInv = invitations[0]?.config || dbStore.getPresets()[0]?.config;
              downloadInvitationImage(mainInv);
            }}
            className="editor-toolbar-btn px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition shadow-xs"
            title="Export High-Res PNG Image"
          >
            <SvgImage className="w-4 h-4 shrink-0 text-[#E11D48]" />
            <span>PNG Card</span>
          </button>
          <Link
            to="/admin/editor"
            className="editor-toolbar-btn px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition shadow-xs"
          >
            <SvgEdit className="w-4 h-4 shrink-0 text-[#68472D]" />
            <span className="font-extrabold">Custom Editor</span>
          </Link>
          <Link
            to="/"
            className="editor-toolbar-btn-primary px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition shadow-sm"
          >
            <SvgSparkles className="w-4 h-4 shrink-0 text-[#382416]" />
            <span className="font-extrabold">Browse Gallery</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Invitations Grid (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
            <h2 className="text-xl font-cinzel font-extrabold text-amber-300 drop-shadow-md flex items-center space-x-2">
              <span>Active Invitations ({invitations.length})</span>
            </h2>

            <div className="w-full sm:w-72">
              <InvitationTypeDropdown
                value={filterReligion}
                onChange={setFilterReligion}
                labelText="Filter By Invitation Type"
              />
            </div>
          </div>

          {invitations.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center bg-slate-900/10 text-slate-500">
              <p className="text-sm">You do not have any active wedding invitations drafted.</p>
              <p className="text-xs mt-1">Click "Browse Designs &amp; Order" above to place your first order.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {invitations.map(inv => {
                const hasPaid = inv.isPaid || inv.status === 'paid';
                return (
                  <div key={inv.id} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4 flex flex-col justify-between hover:border-slate-700 transition">
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          hasPaid 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {hasPaid ? 'Paid & Active' : 'Draft / Preview'}
                        </span>
                        {!hasPaid && (
                          <span className="text-[10px] text-amber-500 font-semibold flex items-center animate-pulse">
                            ⚠️ Watermarked
                          </span>
                        )}
                      </div>

                      <h3 className="font-cinzel text-base font-bold text-slate-100 mt-1">{inv.title}</h3>
                      <p className="text-xs text-amber-200/90 font-medium italic">
                        Bride: <span className="text-amber-100 font-semibold">{inv.config.brideName}</span> &amp; Groom: <span className="text-amber-100 font-semibold">{inv.config.groomName}</span>
                      </p>
                      
                      {/* Metrics breakdown */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs text-slate-200 font-mono font-semibold">
                        <div className="flex items-center space-x-1.5 bg-slate-950/70 px-2.5 py-1.5 rounded-lg border border-cyan-500/25">
                          <SvgUsers className="w-4 h-4 text-cyan-300" />
                          <span className="text-slate-200">RSVPs: <strong className="text-cyan-300 font-bold">{inv.rsvps?.length || 0}</strong></span>
                        </div>
                        <div className="flex items-center space-x-1.5 bg-slate-950/70 px-2.5 py-1.5 rounded-lg border border-amber-500/25">
                          <SvgMessageSquare className="w-4 h-4 text-amber-300" />
                          <span className="text-slate-200">Blessings: <strong className="text-amber-300 font-bold">{inv.wishes?.length || 0}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-850/60 space-y-2">
                      {/* Sharing actions */}
                      {hasPaid ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <Link
                              to={`/invite/${dbStore.getInvitationShareSlug(inv)}`}
                              className="px-2.5 py-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-semibold text-center hover:bg-slate-900 transition flex items-center justify-center space-x-1"
                            >
                              <SvgEye className="w-3.5 h-3.5 text-amber-400" />
                              <span>View Live</span>
                            </Link>
                            <button
                              onClick={() => handleOpenShare(inv)}
                              className="px-2.5 py-2 rounded bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-[11px] font-bold transition flex items-center justify-center space-x-1"
                            >
                              <SvgShare className="w-3.5 h-3.5 text-slate-950" />
                              <span>Share</span>
                            </button>
                            <button
                              onClick={() => setInvoiceModalTarget(inv)}
                              className="px-2.5 py-2 rounded bg-slate-900 border border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-300 text-[11px] font-bold transition flex items-center justify-center space-x-1"
                            >
                              <span>📄 Invoice</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenMusicModal(inv)}
                            className="w-full py-2 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-bold text-center text-amber-300 hover:text-amber-200 transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                          >
                            <span className="text-sm">🎵</span>
                            <span>Manage Music (Starting &amp; Main Songs)</span>
                            {(inv.config?.startingMusicUrl || inv.config?.musicUrl) && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-extrabold uppercase">
                                {inv.config?.startingMusicUrl && inv.config?.musicUrl ? "2 Songs Active" : "1 Song Active"}
                              </span>
                            )}
                          </button>

                          {/* Google Drive Cloud Storage Badge */}
                          <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1.5 min-w-0">
                              <span className="text-sm shrink-0">☁️</span>
                              <div className="min-w-0">
                                <span className="text-[8.5px] uppercase font-extrabold text-emerald-400 block tracking-wider">Drive Cloud Storage</span>
                                <p className="text-[10.5px] font-bold text-slate-200 truncate" title={inv.driveStorage?.folderName || formatDriveFolderName(inv.config, inv.title)}>
                                  📁 {inv.driveStorage?.folderName || formatDriveFolderName(inv.config, inv.title)}
                                </p>
                              </div>
                            </div>
                            <a
                              href={inv.driveStorage?.folderUrl || GOOGLE_DRIVE_ROOT_FOLDER_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 rounded text-[9.5px] font-bold transition flex items-center space-x-1"
                              title="Open folder on Google Drive"
                            >
                              <span>Drive</span>
                              <span>↗</span>
                            </a>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              to={`/admin/editor/${inv.id}`}
                              className="py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-center text-amber-400 hover:text-amber-300 transition flex items-center justify-center space-x-1.5"
                            >
                              <SvgEdit className="w-4 h-4" />
                              <span>Customize</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDuplicateInvitation(inv.id)}
                              className="py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-center text-sky-400 hover:text-sky-300 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                              title="Duplicate / Clone this invitation"
                            >
                              <SvgCopy className="w-4 h-4" />
                              <span>Duplicate</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="p-2.5 bg-slate-950 rounded-xl border border-amber-500/20 text-xs flex justify-between items-center">
                            <div>
                              <span className="text-[11px] text-amber-300/90 block font-bold">Total Price:</span>
                              <span className="text-slate-300 line-through text-xs font-mono mr-1">₹{inv.price || 999}</span>
                              <span className="text-amber-300 font-bold text-sm font-mono">
                                ₹{Math.round((inv.price || 999) - ((inv.price || 999) * (inv.discountPercent || 0) / 100))}
                              </span>
                            </div>
                            {inv.discountPercent > 0 && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                                {inv.discountPercent}% OFF
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              to={`/invite/${dbStore.getInvitationShareSlug(inv)}?preview=true`}
                              className="px-3 py-2 rounded bg-slate-950 border border-slate-800 text-xs font-semibold text-center hover:bg-slate-900 transition flex items-center justify-center space-x-1"
                            >
                              <SvgEye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </Link>
                            <button
                              onClick={() => {
                                const linkedOrder = orders.find(o => o.id === inv.orderId || o.presetId === inv.presetId) || {
                                  id: inv.orderId || `ORD-${inv.id}`,
                                  price: inv.price || 999,
                                  discountPercent: inv.discountPercent || 0,
                                  invitationId: inv.id,
                                  isPaid: inv.isPaid
                                };
                                setPaymentModalOrder(linkedOrder);
                              }}
                              className="px-3 py-2 rounded bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-extrabold text-center transition flex items-center justify-center space-x-1 shadow-md"
                            >
                              <span>📱 Pay QR</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenMusicModal(inv)}
                            className="w-full py-2 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-bold text-center text-amber-300 hover:text-amber-200 transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                          >
                            <span className="text-sm">🎵</span>
                            <span>Manage Music (Starting &amp; Main Songs)</span>
                            {(inv.config?.startingMusicUrl || inv.config?.musicUrl) && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-extrabold uppercase">
                                {inv.config?.startingMusicUrl && inv.config?.musicUrl ? "2 Songs Active" : "1 Song Active"}
                              </span>
                            )}
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              to={`/admin/editor/${inv.id}`}
                              className="py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-center text-amber-400 hover:text-amber-300 transition flex items-center justify-center space-x-1.5"
                            >
                              <SvgEdit className="w-4 h-4" />
                              <span>Customize</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDuplicateInvitation(inv.id)}
                              className="py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-center text-sky-400 hover:text-sky-300 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                              title="Duplicate / Clone this invitation"
                            >
                              <SvgCopy className="w-4 h-4" />
                              <span>Duplicate</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
          
          {/* Orders Tracking */}
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-cinzel font-extrabold text-amber-300 drop-shadow-md">Order Status History</h2>
            {orders.length === 0 ? (
              <p className="text-xs text-amber-200/80 italic font-medium">No order forms submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.map(order => {
                  const preset = dbStore.getPresetById(order.presetId);
                  const isCancelable = order.status === 'pending';
                  const isCancelled = order.status === 'cancelled';

                  return (
                    <div key={order.id} className="p-5 rounded-2xl border border-slate-700 bg-slate-900/90 space-y-4 shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-100 text-sm">Order #{order.id}</span>
                            <span className={`px-2.5 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                              order.isPaid || order.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                              order.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                              'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}>
                              {order.isPaid ? 'Accepted & Paid' : order.status}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-amber-300 mt-1">Design: {preset ? preset.title : 'Custom Design'}</p>
                        </div>
                        <span className="text-xs text-slate-300 font-mono font-medium">
                          Submitted: {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Order & Customer Details Summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/95 p-4 rounded-xl border border-amber-500/30 text-xs shadow-inner">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">Couple Name</span>
                          <span className="font-bold text-slate-100 text-sm block">
                            {order.details?.brideName || 'N/A'} &amp; {order.details?.groomName || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">Ceremony Date</span>
                          <span className="font-bold text-slate-100 block">
                            {order.details?.weddingDate ? new Date(order.details.weddingDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">Contact Detail</span>
                          <span className="font-bold text-slate-100 block">
                            {order.details?.contact || order.userEmail || currentUser?.email || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">Uploaded Couple Photos</span>
                          <span className="font-bold text-slate-100 block">
                            {(order.details?.photos?.length || (order.details?.photoUrl ? 1 : 0))} / 5 Photos
                          </span>
                        </div>
                      </div>

                      {/* Pricing Breakdown & Payment Action Bar */}
                      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center space-x-3">
                          <div>
                            <span className="text-[11px] text-amber-300/90 block font-bold">Total Price:</span>
                            <span className="text-slate-300 line-through font-mono text-xs mr-1">₹{order.price || 999}</span>
                            <span className="text-amber-300 font-bold font-mono text-sm">
                              ₹{Math.round((order.price || 999) - ((order.price || 999) * (order.discountPercent || 0) / 100))}
                            </span>
                          </div>
                          {order.discountPercent > 0 && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                              {order.discountPercent}% OFF
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {order.isPaid ? (
                            <div className="flex items-center space-x-2">
                              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                                ✓ Paid &amp; Verified (Watermark Removed)
                              </span>
                              <button
                                onClick={() => setInvoiceModalTarget(order)}
                                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-extrabold text-xs transition shadow flex items-center space-x-1 cursor-pointer"
                              >
                                <span>📄 Official Invoice</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setPaymentModalOrder(order)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-extrabold transition flex items-center justify-center space-x-1.5 shadow-md"
                            >
                              <span>📱 Pay via GPay / PhonePe</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons: Preview, Edit / Modify and Cancel */}
                      <div className="flex flex-wrap justify-end gap-3 pt-2">
                        <button
                          onClick={() => handleOpenOrderPreview(order)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-extrabold transition flex items-center justify-center space-x-1.5 shadow-md"
                        >
                          <SvgEye className="w-4 h-4 shrink-0 text-slate-950" />
                          <span className="font-extrabold">Preview Order</span>
                        </button>

                        {!isCancelled && (
                          <>
                            <button
                              onClick={() => handleEditOrderClick(order)}
                              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition flex items-center justify-center space-x-2 border border-amber-500/40 shadow-md"
                            >
                              <SvgEdit className="w-4 h-4 shrink-0 text-amber-400" />
                              <span className="font-bold">Edit / Modify Order</span>
                            </button>

                            {isCancelable && (
                              <button
                                onClick={() => handleCancelOrder(order)}
                                className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-white text-xs font-bold transition border border-rose-600/60 shadow-md flex items-center justify-center space-x-1.5"
                              >
                                <span className="font-bold">Cancel Order</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sharing options and live customizer (Right Column) */}
        <div className="space-y-6">
          {activeShareInvite ? (
            <div className="p-5 rounded-2xl border border-amber-500/20 bg-slate-900/40 backdrop-blur space-y-4 shadow-xl">
              <h3 className="font-cinzel text-sm font-bold text-amber-200 flex items-center space-x-1.5">
                <SvgShare className="w-4 h-4 text-amber-400" />
                <span>Customize Share Message</span>
              </h3>
              
              <p className="text-xs text-slate-200 font-medium">
                Craft a beautiful message to go along with your digital invitation card. You can share it directly onto social media.
              </p>

              {/* Monogram Thumbnail Showcase */}
              <div className="rounded-xl overflow-hidden border border-amber-500/30 bg-slate-950/70 p-3 space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <span>👑</span>
                    <span>Initials Thumbnail Preview</span>
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-extrabold border border-amber-500/40">
                    Initials: {getCoupleInitials(activeShareInvite.config?.brideName || "Bride", activeShareInvite.config?.groomName || "Groom")}
                  </span>
                </div>
                <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-amber-500/20">
                  <img
                    src="/wedding_monogram_thumbnail.jpg"
                    alt="Wedding Initial Monogram Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-[8px] font-mono text-amber-300">
                    WhatsApp Link Preview
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-amber-300 block mb-1">WhatsApp &amp; Email Message</label>
                <textarea
                  value={customShareText}
                  onChange={(e) => setCustomShareText(e.target.value)}
                  rows={6}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none font-sans"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleSaveShareText}
                  className="flex-1 py-2 rounded bg-slate-850 hover:bg-slate-800 text-[10px] uppercase font-bold tracking-wider transition border border-slate-700"
                >
                  Save Template
                </button>
                <button
                  onClick={() => handleCopyLink(activeShareInvite.id)}
                  className="px-3 py-2 rounded bg-slate-950 border border-slate-800 hover:bg-slate-900 transition"
                  title="Copy Invitation Link"
                >
                  <SvgCopy className="w-4 h-4 text-slate-300" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-850">
                <button
                  onClick={triggerWhatsappShare}
                  className="py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center space-x-1.5"
                >
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={triggerEmailShare}
                  className="py-2.5 rounded-lg bg-slate-200 hover:bg-slate-100 text-slate-950 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center space-x-1.5"
                >
                  <span>Email Invitation</span>
                </button>
              </div>

              <button
                onClick={() => {
                  downloadStandaloneHtmlWebsite(activeShareInvite.config, activeShareInvite);
                  showToast("Standalone HTML website downloaded! Opens in any browser with zero login.", "success");
                }}
                className="w-full py-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
                title="Download single-file interactive website (.html) that opens in any browser with zero login"
              >
                <span>🌐</span>
                <span>Download Standalone HTML Website</span>
              </button>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300/90 space-y-1">
                <p className="font-bold flex items-center space-x-1">
                  <span>💡</span>
                  <span>No Login Required for Guests</span>
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Anyone who receives this link can view the card, scratch the cover, RSVP, and post blessings without signing in. If a Vercel login screen appears on your link, turn off <strong>Deployment Protection</strong> in your Vercel Dashboard project settings.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 text-center text-slate-200 text-xs py-12 font-medium">
              Select an invitation's "Share Invite" button to customize messages and trigger social sharing.
            </div>
          )}
        </div>

      </div>

      {/* EDIT ORDER MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-amber-500/40 bg-slate-950 text-slate-100 space-y-5 shadow-2xl relative">
            <button 
              type="button"
              onClick={() => setEditingOrder(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition text-base font-bold"
            >
              ✕
            </button>

            <div className="space-y-1 border-b border-slate-800 pb-3 pr-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Order Customizations</span>
              <h3 className="font-cinzel text-xl font-bold text-amber-100">
                Edit Order #{editingOrder.id}
              </h3>
              <p className="text-xs text-slate-200 font-medium">Update all couple, parents, marriage venue, reception, and photo details for your invitation.</p>
            </div>

            <form onSubmit={handleEditOrderSubmit} className="space-y-5">
              {/* Section 1: Couple & Parents Information */}
              <div className="space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                  👩‍❤️‍👨 Couple &amp; Parents Names
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Bride Name *</label>
                    <input
                      type="text"
                      value={editOrderForm.brideName}
                      onChange={(e) => setEditOrderForm(prev => ({ ...prev, brideName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Groom Name *</label>
                    <input
                      type="text"
                      value={editOrderForm.groomName}
                      onChange={(e) => setEditOrderForm(prev => ({ ...prev, groomName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Bride Father Name</label>
                    <input
                      type="text"
                      value={editOrderForm.brideFatherName}
                      onChange={(e) => setEditOrderForm(prev => ({ ...prev, brideFatherName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                      placeholder="e.g. Mr. Robert Smith"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Bride Mother Name</label>
                    <input
                      type="text"
                      value={editOrderForm.brideMotherName}
                      onChange={(e) => setEditOrderForm(prev => ({ ...prev, brideMotherName: e.target.value }))}
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
                      value={editOrderForm.groomFatherName}
                      onChange={(e) => setEditOrderForm(prev => ({ ...prev, groomFatherName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                      placeholder="e.g. Mr. David Vance"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Groom Mother Name</label>
                    <input
                      type="text"
                      value={editOrderForm.groomMotherName}
                      onChange={(e) => setEditOrderForm(prev => ({ ...prev, groomMotherName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                      placeholder="e.g. Mrs. Sarah Vance"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Marriage Venue & Map Link */}
              <div className="space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                  💒 Marriage Ceremony &amp; Venue Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Marriage Date *</label>
                    <input
                      type="date"
                      value={editOrderForm.weddingDate}
                      onChange={(e) => setEditOrderForm(prev => ({ ...prev, weddingDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Marriage Venue Name</label>
                    <input
                      type="text"
                      value={editOrderForm.venueName}
                      onChange={(e) => setEditOrderForm(prev => ({ ...prev, venueName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                      placeholder="e.g. Grand Palace Convention Center"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Marriage Venue Address</label>
                  <textarea
                    rows={2}
                    value={editOrderForm.venueAddress}
                    onChange={(e) => setEditOrderForm(prev => ({ ...prev, venueAddress: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100 resize-none"
                    placeholder="Full venue address with city, state, pincode"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Venue Google Map Link</label>
                  <input
                    type="url"
                    value={editOrderForm.venueMapLink}
                    onChange={(e) => setEditOrderForm(prev => ({ ...prev, venueMapLink: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              {/* Section 3: Reception Venue Details */}
              <div className="space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                  🥂 Reception Ceremony Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Reception Date</label>
                    <input
                      type="date"
                      value={editOrderForm.receptionDate}
                      onChange={(e) => setEditOrderForm(prev => ({ ...prev, receptionDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Reception Venue Name</label>
                    <input
                      type="text"
                      value={editOrderForm.receptionVenue}
                      onChange={(e) => setEditOrderForm(prev => ({ ...prev, receptionVenue: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                      placeholder="e.g. Royal Banquet Hall"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Reception Address</label>
                  <textarea
                    rows={2}
                    value={editOrderForm.receptionAddress}
                    onChange={(e) => setEditOrderForm(prev => ({ ...prev, receptionAddress: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100 resize-none"
                    placeholder="Reception venue full address and landmark"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">Reception Google Map Link</label>
                  <input
                    type="url"
                    value={editOrderForm.receptionMapLink}
                    onChange={(e) => setEditOrderForm(prev => ({ ...prev, receptionMapLink: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              {/* Section 4: Couple Photo Upload (Max 5 Photos) */}
              <div className="space-y-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <span>🖼️</span>
                    <span>Couple Photo Upload</span>
                  </h4>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    (editOrderForm.photos?.length || 0) >= 5 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {(editOrderForm.photos?.length || 0)} / 5 Uploaded
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
                      disabled={(editOrderForm.photos?.length || 0) >= 5}
                      onChange={(e) => handleFileUpload(e, setEditOrderForm)}
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
                        value={editOrderForm.tempUrlInput || ""}
                        onChange={(e) => setEditOrderForm(prev => ({ ...prev, tempUrlInput: e.target.value }))}
                        disabled={(editOrderForm.photos?.length || 0) >= 5}
                        placeholder={(editOrderForm.photos?.length || 0) >= 5 ? "Maximum 5 photos reached" : "Paste image link (https://...) and click Add"}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        disabled={!editOrderForm.tempUrlInput?.trim() || (editOrderForm.photos?.length || 0) >= 5}
                        onClick={() => handleAddPhotoUrl(editOrderForm.tempUrlInput, setEditOrderForm)}
                        className="px-3.5 py-2 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-amber-400 disabled:opacity-40 transition shrink-0"
                      >
                        Add Photo
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Gallery (Up to 5) */}
                  {(editOrderForm.photos?.length || 0) > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
                      {editOrderForm.photos.map((url, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-amber-500/40 bg-slate-950 aspect-square flex items-center justify-center shadow-md">
                          <img src={url} alt={`Couple Photo ${idx + 1}`} className="w-full h-full object-cover" />
                          <span className="absolute top-1 left-1 bg-slate-950/85 text-amber-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-amber-500/30">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx, setEditOrderForm)}
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

                {/* Section 5: Dual Songs Preferences */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <span>🎵</span>
                    <span>Invitation Music &amp; Songs</span>
                  </h4>

                  {/* Song 1: Starting Song */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-300">Song 1: Starting / Intro Song</span>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <span className="text-[9px] font-bold uppercase text-slate-400">
                          {editOrderForm.startingMusicEnabled ? "ON" : "OFF"}
                        </span>
                        <input 
                          type="checkbox"
                          checked={editOrderForm.startingMusicEnabled !== false}
                          onChange={(e) => setEditOrderForm(prev => ({ ...prev, startingMusicEnabled: e.target.checked }))}
                          className="accent-amber-500 rounded"
                        />
                      </label>
                    </div>
                    {editOrderForm.startingMusicEnabled !== false && (
                      <div className="space-y-2 pt-1 text-xs">
                        <input 
                          type="text"
                          value={editOrderForm.startingMusicTitle || ""}
                          onChange={(e) => setEditOrderForm(prev => ({ ...prev, startingMusicTitle: e.target.value }))}
                          placeholder="Song 1 Title (e.g. Shehnai Welcome / Ganesha Stuti)"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
                        />
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={editOrderForm.startingMusicUrl || ""}
                            onChange={(e) => setEditOrderForm(prev => ({ ...prev, startingMusicUrl: formatDriveDirectUrl(e.target.value, "audio") }))}
                            placeholder="Direct MP3 URL or Upload Audio File"
                            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
                          />
                          <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded text-xs font-bold border border-slate-700 cursor-pointer shrink-0">
                            <span>Upload</span>
                            <input 
                              type="file" 
                              accept="audio/*" 
                              onChange={async (e) => {
                                const file = e.target.files && e.target.files[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (reader.result) {
                                    setEditOrderForm(prev => ({
                                      ...prev,
                                      startingMusicUrl: reader.result,
                                      startingMusicTitle: prev.startingMusicTitle || file.name.replace(/\.[^/.]+$/, "")
                                    }));
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Song 2: Main Song */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-300">Song 2: Main Invitation Song</span>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <span className="text-[9px] font-bold uppercase text-slate-400">
                          {editOrderForm.mainMusicEnabled ? "ON" : "OFF"}
                        </span>
                        <input 
                          type="checkbox"
                          checked={editOrderForm.mainMusicEnabled !== false}
                          onChange={(e) => setEditOrderForm(prev => ({ ...prev, mainMusicEnabled: e.target.checked }))}
                          className="accent-amber-500 rounded"
                        />
                      </label>
                    </div>
                    {editOrderForm.mainMusicEnabled !== false && (
                      <div className="space-y-2 pt-1 text-xs">
                        <input 
                          type="text"
                          value={editOrderForm.musicTitle || ""}
                          onChange={(e) => setEditOrderForm(prev => ({ ...prev, musicTitle: e.target.value }))}
                          placeholder="Song 2 Title (e.g. Vakratunda Mahakaya / Wedding Melody)"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
                        />
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={editOrderForm.musicUrl || ""}
                            onChange={(e) => setEditOrderForm(prev => ({ ...prev, musicUrl: formatDriveDirectUrl(e.target.value, "audio") }))}
                            placeholder="Direct MP3 URL or Upload Audio File"
                            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
                          />
                          <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded text-xs font-bold border border-slate-700 cursor-pointer shrink-0">
                            <span>Upload</span>
                            <input 
                              type="file" 
                              accept="audio/*" 
                              onChange={async (e) => {
                                const file = e.target.files && e.target.files[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (reader.result) {
                                    setEditOrderForm(prev => ({
                                      ...prev,
                                      musicUrl: reader.result,
                                      musicTitle: prev.musicTitle || file.name.replace(/\.[^/.]+$/, "")
                                    }));
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Contact Phone/WhatsApp *
                  </label>
                  <input
                    type="text"
                    value={editOrderForm.contact}
                    onChange={(e) => setEditOrderForm(prev => ({ ...prev, contact: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-slate-100"
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-extrabold uppercase tracking-wider transition shadow-lg"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Preview Modal */}
      {previewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl border border-amber-500/40 bg-slate-900 text-slate-100 space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">Order Design Preview</span>
                <h3 className="text-lg font-cinzel font-bold text-amber-100 mt-0.5">Order #{previewOrderModal.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOrderModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-base font-bold transition"
              >
                ✕
              </button>
            </div>

            {(() => {
              const preset = dbStore.getPresetById(previewOrderModal.presetId) || dbStore.getPresets()[0];
              return (
                <div className="space-y-4">
                  {/* Preset Visual Header */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-4">
                    {preset?.coverImage ? (
                      <img src={preset.coverImage} alt={preset.title} className="w-20 h-20 object-cover rounded-lg border border-amber-500/30 shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-2xl shrink-0">
                        💌
                      </div>
                    )}
                    <div>
                      <h4 className="font-cinzel font-bold text-amber-200 text-base">{preset?.title || "Custom Preset"}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{preset?.description || "Curated wedding invitation design template."}</p>
                      <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Status: {previewOrderModal.status}
                      </span>
                    </div>
                  </div>

                  {/* Submitted Order Details */}
                  <div className="space-y-2 bg-slate-950/90 p-4 rounded-xl border border-amber-500/25 text-xs">
                    <h5 className="font-bold uppercase tracking-wider text-amber-400 text-[10px] border-b border-slate-800 pb-1.5 mb-2">
                      Your Submitted Customizations
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Bride Name</span>
                        <span className="font-bold text-slate-100 text-sm">{previewOrderModal.details?.brideName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Groom Name</span>
                        <span className="font-bold text-slate-100 text-sm">{previewOrderModal.details?.groomName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Ceremony Date</span>
                        <span className="font-bold text-slate-100">
                          {previewOrderModal.details?.weddingDate ? new Date(previewOrderModal.details.weddingDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Uploaded Photos</span>
                        <span className="font-bold text-amber-300 capitalize">
                          {(previewOrderModal.details?.photos?.length || (previewOrderModal.details?.photoUrl ? 1 : 0))} / 5 Photos
                        </span>
                      </div>
                      <div className="col-span-2 border-t border-slate-800 pt-2 mt-1">
                        <span className="text-slate-400 block text-[10px] uppercase">Contact Phone / WhatsApp</span>
                        <span className="font-bold text-slate-100">{previewOrderModal.details?.contact || currentUser?.email || 'N/A'}</span>
                      </div>

                      {/* Photo Gallery inside Preview Modal */}
                      {((previewOrderModal.details?.photos && previewOrderModal.details.photos.length > 0) || previewOrderModal.details?.photoUrl) && (
                        <div className="col-span-2 border-t border-slate-800 pt-2.5 mt-1">
                          <span className="text-slate-400 block text-[10px] uppercase mb-1.5 font-bold text-amber-400">
                            Uploaded Couple Photos Gallery
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {(previewOrderModal.details?.photos || [previewOrderModal.details.photoUrl]).map((imgUrl, i) => (
                              <img key={i} src={imgUrl} alt={`Couple Photo ${i + 1}`} className="w-14 h-14 object-cover rounded-lg border border-amber-500/40 shadow-sm" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons inside Modal */}
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    {previewOrderModal.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => {
                          const orderToEdit = previewOrderModal;
                          setPreviewOrderModal(null);
                          handleEditOrderClick(orderToEdit);
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition border border-amber-500/30 flex items-center justify-center space-x-1.5"
                      >
                        <SvgEdit className="w-3.5 h-3.5" />
                        <span>Modify Details</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleLaunchLivePreview(previewOrderModal)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-extrabold transition flex items-center justify-center space-x-1.5 shadow-lg"
                    >
                      <SvgExternalLink className="w-4 h-4" />
                      <span>Live Invitation Preview</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Customer Music Manager Modal (Starting & Main Songs) */}
      {musicModalTarget && customerMusicForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="text-xl">🎵</span>
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-amber-200">
                    Manage Music &amp; Songs
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Personalize your starting &amp; main songs for <span className="text-amber-300 font-semibold">{musicModalTarget.title}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (custStartingAudioRef.current) custStartingAudioRef.current.pause();
                  if (custMainAudioRef.current) custMainAudioRef.current.pause();
                  setCustStartingPlaying(false);
                  setCustMainPlaying(false);
                  setMusicModalTarget(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Song 1: Starting / Intro Song */}
            <div className={`p-4 rounded-xl border transition-all ${
              customerMusicForm.startingMusicEnabled ? 'bg-slate-950/80 border-amber-500/40 shadow-md' : 'bg-slate-950/40 border-slate-800 opacity-80'
            } space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base">🎵</span>
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-300 block">
                      Song 1: Starting / Intro Song
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Plays immediately when guest arrives / during envelope interaction
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-extrabold uppercase ${customerMusicForm.startingMusicEnabled ? 'text-amber-400' : 'text-slate-500'}`}>
                    {customerMusicForm.startingMusicEnabled ? "TRACK ON" : "TRACK OFF"}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={customerMusicForm.startingMusicEnabled}
                      onChange={(e) => setCustomerMusicForm(prev => ({ ...prev, startingMusicEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              {customerMusicForm.startingMusicEnabled ? (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-300 block mb-1">
                      Upload Starting Audio File from your device (MP3 / WAV / M4A)
                    </label>
                    <input 
                      type="file" 
                      accept="audio/*"
                      onChange={async (e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        try {
                          const uploadRes = await uploadInvitationFileToDrive({
                            file,
                            invitation: musicModalTarget || {},
                            category: "startingMusicUrl"
                          });
                          const directUrl = formatDriveDirectUrl(uploadRes.url, "audio");
                          const titleName = file.name.replace(/\.[^/.]+$/, "");
                          setCustomerMusicForm(prev => ({
                            ...prev,
                            startingMusicUrl: directUrl,
                            startingMusicTitle: titleName,
                            startingMusicArtist: "Custom Intro"
                          }));
                          showToast("Starting song uploaded to Google Drive!", "success");
                        } catch (err) {
                          console.error("Audio upload error, falling back to local:", err);
                          try {
                            const dataUrl = await new Promise((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () => resolve(reader.result);
                              reader.onerror = reject;
                              reader.readAsDataURL(file);
                            });
                            const titleName = file.name.replace(/\.[^/.]+$/, "");
                            setCustomerMusicForm(prev => ({
                              ...prev,
                              startingMusicUrl: dataUrl,
                              startingMusicTitle: titleName,
                              startingMusicArtist: "Custom Intro"
                            }));
                          } catch (readErr) {
                            console.error("Audio read error:", readErr);
                          }
                        }
                      }}
                      className="w-full text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-slate-400 block mb-1">Starting Song Title</label>
                      <input 
                        type="text" 
                        value={customerMusicForm.startingMusicTitle || ""}
                        onChange={(e) => setCustomerMusicForm(prev => ({ ...prev, startingMusicTitle: e.target.value }))}
                        placeholder="e.g. Traditional Shehnai Welcome / Ganesha Stuti"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-slate-400 block mb-1">Artist / Subtitle</label>
                      <input 
                        type="text" 
                        value={customerMusicForm.startingMusicArtist || ""}
                        onChange={(e) => setCustomerMusicForm(prev => ({ ...prev, startingMusicArtist: e.target.value }))}
                        placeholder="e.g. Intro Welcome Track"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-slate-400 block mb-1">Or Direct MP3 Audio URL</label>
                    <input 
                      type="text" 
                      value={customerMusicForm.startingMusicUrl || ""}
                      onChange={(e) => {
                        const directUrl = formatDriveDirectUrl(e.target.value, "audio");
                        setCustomerMusicForm(prev => ({ ...prev, startingMusicUrl: directUrl }));
                        if (custStartingPlaying && custStartingAudioRef.current) {
                          custStartingAudioRef.current.pause();
                          setCustStartingPlaying(false);
                        }
                      }}
                      placeholder="https://example.com/intro-song.mp3"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {customerMusicForm.startingMusicUrl && (
                    <div className="pt-1 flex flex-col space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!custStartingAudioRef.current) return;
                          if (custStartingPlaying) {
                            custStartingAudioRef.current.pause();
                            setCustStartingPlaying(false);
                          } else {
                            custStartingAudioRef.current.volume = customerMusicForm.musicVolume || 0.8;
                            custStartingAudioRef.current.play().then(() => {
                              setCustStartingPlaying(true);
                            }).catch(err => {
                              console.warn("Play error:", err);
                              showToast("Could not play starting audio directly. Make sure the file format is valid.", "error");
                            });
                          }
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                      >
                        <span>{custStartingPlaying ? "⏸ Pause Starting Song Preview" : "▶ Listen Live / Test Starting Song"}</span>
                      </button>
                      <audio 
                        ref={custStartingAudioRef} 
                        src={formatDriveDirectUrl(customerMusicForm.startingMusicUrl, "audio")} 
                        onEnded={() => setCustStartingPlaying(false)}
                        onError={() => setCustStartingPlaying(false)}
                      />
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-bold">✓ Starting Song Linked</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomerMusicForm(prev => ({
                              ...prev,
                              startingMusicUrl: "",
                              startingMusicTitle: "",
                              startingMusicArtist: ""
                            }));
                            if (custStartingAudioRef.current) custStartingAudioRef.current.pause();
                            setCustStartingPlaying(false);
                          }}
                          className="text-rose-400 hover:text-rose-300 underline font-bold"
                        >
                          Remove Song 1
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">Starting song is turned OFF. Guests will not hear any audio before the envelope opens.</p>
              )}
            </div>

            {/* Song 2: Main Invitation Song */}
            <div className={`p-4 rounded-xl border transition-all ${
              customerMusicForm.mainMusicEnabled ? 'bg-slate-950/80 border-amber-500/40 shadow-md' : 'bg-slate-950/40 border-slate-800 opacity-80'
            } space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base">🎶</span>
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-300 block">
                      Song 2: Main Invitation Song
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Plays across all invitation sections once the recipient opens the envelope
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-extrabold uppercase ${customerMusicForm.mainMusicEnabled ? 'text-amber-400' : 'text-slate-500'}`}>
                    {customerMusicForm.mainMusicEnabled ? "TRACK ON" : "TRACK OFF"}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={customerMusicForm.mainMusicEnabled}
                      onChange={(e) => setCustomerMusicForm(prev => ({ ...prev, mainMusicEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              {customerMusicForm.mainMusicEnabled ? (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  {/* Quick Pick from Curated Library */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase font-bold text-amber-300">
                        Pick from Curated Wedding Music Library
                      </label>
                      <span className="text-[9px] text-slate-400">1-Click Quick Select</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                      {dbStore.getMusicPresets().map(track => {
                        const isSelected = customerMusicForm.musicUrl === track.url;
                        return (
                          <button
                            key={track.id}
                            type="button"
                            onClick={() => {
                              setCustomerMusicForm(prev => ({
                                ...prev,
                                musicUrl: track.url,
                                musicTitle: track.title,
                                musicArtist: track.artist || "Royalty Free"
                              }));
                              if (custMainAudioRef.current) custMainAudioRef.current.pause();
                              setCustMainPlaying(false);
                            }}
                            className={`p-2 rounded-lg border text-left text-xs transition truncate cursor-pointer ${
                              isSelected 
                                ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold' 
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/40'
                            }`}
                          >
                            <span className="block truncate font-semibold">🎵 {track.title}</span>
                            <span className="block text-[9px] text-slate-400 truncate">{track.artist || track.category || 'Curated'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-300 block mb-1">
                      Or Upload Main Audio File from device (MP3 / WAV / M4A)
                    </label>
                    <input 
                      type="file" 
                      accept="audio/*"
                      onChange={async (e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        try {
                          const uploadRes = await uploadInvitationFileToDrive({
                            file,
                            invitation: musicModalTarget || {},
                            category: "musicUrl"
                          });
                          const directUrl = formatDriveDirectUrl(uploadRes.url, "audio");
                          const titleName = file.name.replace(/\.[^/.]+$/, "");
                          setCustomerMusicForm(prev => ({
                            ...prev,
                            musicUrl: directUrl,
                            musicTitle: titleName,
                            musicArtist: "Custom Upload"
                          }));
                          showToast("Main song uploaded to Google Drive!", "success");
                        } catch (err) {
                          console.error("Audio upload error, falling back to local:", err);
                          try {
                            const dataUrl = await new Promise((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () => resolve(reader.result);
                              reader.onerror = reject;
                              reader.readAsDataURL(file);
                            });
                            const titleName = file.name.replace(/\.[^/.]+$/, "");
                            setCustomerMusicForm(prev => ({
                              ...prev,
                              musicUrl: dataUrl,
                              musicTitle: titleName,
                              musicArtist: "Custom Upload"
                            }));
                          } catch (readErr) {
                            console.error("Audio read error:", readErr);
                          }
                        }
                      }}
                      className="w-full text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-slate-400 block mb-1">Main Song Title</label>
                      <input 
                        type="text" 
                        value={customerMusicForm.musicTitle || ""}
                        onChange={(e) => setCustomerMusicForm(prev => ({ ...prev, musicTitle: e.target.value }))}
                        placeholder="e.g. Vakratunda Mahakaya / Wedding Melody"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-slate-400 block mb-1">Artist / Subtitle</label>
                      <input 
                        type="text" 
                        value={customerMusicForm.musicArtist || ""}
                        onChange={(e) => setCustomerMusicForm(prev => ({ ...prev, musicArtist: e.target.value }))}
                        placeholder="e.g. Traditional Flute / Orchestral"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-slate-400 block mb-1">Or Direct MP3 Audio URL</label>
                    <input 
                      type="text" 
                      value={customerMusicForm.musicUrl || ""}
                      onChange={(e) => {
                        const directUrl = formatDriveDirectUrl(e.target.value, "audio");
                        setCustomerMusicForm(prev => ({ ...prev, musicUrl: directUrl }));
                        if (custMainPlaying && custMainAudioRef.current) {
                          custMainAudioRef.current.pause();
                          setCustMainPlaying(false);
                        }
                      }}
                      placeholder="https://example.com/main-song.mp3"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {customerMusicForm.musicUrl && (
                    <div className="pt-1 flex flex-col space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!custMainAudioRef.current) return;
                          if (custMainPlaying) {
                            custMainAudioRef.current.pause();
                            setCustMainPlaying(false);
                          } else {
                            custMainAudioRef.current.volume = customerMusicForm.musicVolume || 0.8;
                            custMainAudioRef.current.play().then(() => {
                              setCustMainPlaying(true);
                            }).catch(err => {
                              console.warn("Play error:", err);
                              showToast("Could not play main audio directly. Make sure the file format is valid.", "error");
                            });
                          }
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                      >
                        <span>{custMainPlaying ? "⏸ Pause Main Song Preview" : "▶ Listen Live / Test Main Song"}</span>
                      </button>
                      <audio 
                        ref={custMainAudioRef} 
                        src={formatDriveDirectUrl(customerMusicForm.musicUrl, "audio")} 
                        onEnded={() => setCustMainPlaying(false)}
                        onError={() => setCustMainPlaying(false)}
                      />
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-bold">✓ Main Song Linked</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomerMusicForm(prev => ({
                              ...prev,
                              musicUrl: "",
                              musicTitle: "",
                              musicArtist: ""
                            }));
                            if (custMainAudioRef.current) custMainAudioRef.current.pause();
                            setCustMainPlaying(false);
                          }}
                          className="text-rose-400 hover:text-rose-300 underline font-bold"
                        >
                          Remove Song 2
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">Main song is turned OFF. Guests will not hear any audio after the envelope opens.</p>
              )}
            </div>

            {/* Playback Controls & Volume */}
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Playback &amp; Player Controls
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <input 
                    type="checkbox" 
                    checked={customerMusicForm.autoPlayMusic !== false}
                    onChange={(e) => setCustomerMusicForm(prev => ({ ...prev, autoPlayMusic: e.target.checked }))}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-slate-200 text-[11px]">Autoplay on Open</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <input 
                    type="checkbox" 
                    checked={customerMusicForm.loopMusic !== false}
                    onChange={(e) => setCustomerMusicForm(prev => ({ ...prev, loopMusic: e.target.checked }))}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-slate-200 text-[11px]">Loop Continuously</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <input 
                    type="checkbox" 
                    checked={customerMusicForm.showMusicWidget !== false}
                    onChange={(e) => setCustomerMusicForm(prev => ({ ...prev, showMusicWidget: e.target.checked }))}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-slate-200 text-[11px]">Floating Player Icon</span>
                </label>
              </div>

              <div className="pt-2 border-t border-slate-850">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Default Playback Volume</label>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {Math.round((customerMusicForm.musicVolume || 0.8) * 100)}%
                  </span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={customerMusicForm.musicVolume || 0.8}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setCustomerMusicForm(prev => ({ ...prev, musicVolume: val }));
                    if (custStartingAudioRef.current) custStartingAudioRef.current.volume = val;
                    if (custMainAudioRef.current) custMainAudioRef.current.volume = val;
                  }}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (custStartingAudioRef.current) custStartingAudioRef.current.pause();
                  if (custMainAudioRef.current) custMainAudioRef.current.pause();
                  setCustStartingPlaying(false);
                  setCustMainPlaying(false);
                  setMusicModalTarget(null);
                }}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (custStartingAudioRef.current) custStartingAudioRef.current.pause();
                  if (custMainAudioRef.current) custMainAudioRef.current.pause();
                  setCustStartingPlaying(false);
                  setCustMainPlaying(false);
                  handleSaveCustomerMusic();
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <SvgCheck className="w-4 h-4 text-slate-950 font-bold" />
                <span>Save Songs to Invitation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={!!paymentModalOrder}
        onClose={() => setPaymentModalOrder(null)}
        order={paymentModalOrder}
        showToast={showToast}
      />

      <InvoiceModal
        isOpen={!!invoiceModalTarget}
        onClose={() => setInvoiceModalTarget(null)}
        order={invoiceModalTarget}
      />

      <AiAssistantModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        brideName={invitations[0]?.config?.brideName || "Ananya"}
        groomName={invitations[0]?.config?.groomName || "Aarav"}
        religion={invitations[0]?.config?.religionKey || "secular"}
        onApplyContent={(field, text) => {
          if (invitations[0]) {
            const updatedConfig = { ...invitations[0].config, [field]: text };
            dbStore.updateInvitation(invitations[0].id, { config: updatedConfig });
            showToast(`Applied AI text to invitation field: ${field}!`, "success");
            setTick(t => t + 1);
          }
        }}
      />

      <GuestManagerModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        guests={invitations[0]?.guestList || []}
        inviteUrl={invitations[0] ? `${window.location.origin}/invite/${dbStore.getInvitationShareSlug(invitations[0])}` : ""}
        brideName={invitations[0]?.config?.brideName || "Ananya"}
        groomName={invitations[0]?.config?.groomName || "Aarav"}
        onUpdateGuests={(newList) => {
          if (invitations[0]) {
            dbStore.updateInvitation(invitations[0].id, { guestList: newList });
          }
        }}
      />

      <CustomDialog {...dialog} />
    </div>
  );
}
