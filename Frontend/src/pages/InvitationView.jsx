import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { database } from '../utils/firebase';
import dbStore from '../data/store';
import InvitationRenderer from '../components/InvitationRenderer';
import Watermark from '../components/Watermark';
import PaymentModal from '../components/PaymentModal';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { SvgEdit, SvgSparkles, SvgCheck, SvgAward, SvgHeart } from '../components/icons';

export default function InvitationView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [tick, setTick] = useState(0);
  const [brandSettings, setBrandSettings] = useState(() => dbStore.getBrandSettings());

  useEffect(() => {
    const handleSync = () => setBrandSettings(dbStore.getBrandSettings());
    window.addEventListener("db_synced", handleSync);
    return () => window.removeEventListener("db_synced", handleSync);
  }, []);

  // Edit preview details modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    brideName: "",
    groomName: "",
    weddingDate: "",
    weddingVenue: "",
    introQuote: ""
  });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  // Check preview gating or database payment state
  const isPreviewParam = searchParams.get("preview") === "true";

  const loadData = async () => {
    setLoading(true);
    setNotFound(false);

    if (id === "demo") {
      const presetId = searchParams.get("preset") || dbStore.getPresets()[0]?.id;
      const preset = dbStore.getPresetById(presetId) || dbStore.getPresets()[0];
      
      let activeConfig = preset?.config || dbStore.getPresets()[0]?.config;
      const savedTemp = sessionStorage.getItem("preview_temp_config");
      if (savedTemp) {
        try {
          activeConfig = { ...activeConfig, ...JSON.parse(savedTemp) };
        } catch (e) {
          console.error("Failed to parse temp preview config", e);
        }
      }

      setInvitation({
        id: "demo",
        presetId: presetId,
        title: `${preset?.title || "Demo"} Wedding Invitation`,
        config: activeConfig,
        rsvps: [
          { name: "Jack & Jill", attending: "yes", count: 2, note: "Excited to join the demo wedding celebration!" }
        ],
        wishes: [
          { sender: "SaaS Dev", message: "Congratulations! This is the premium interactive preview.", date: "1 hour ago" }
        ],
        isPaid: false
      });
      setLoading(false);
      return;
    }

    // 1. Try local cache
    let inv = dbStore.getInvitationById(id);

    // 2. If not in local cache, check if ID matches a preset ID
    if (!inv) {
      const matchingPreset = dbStore.getPresetById(id);
      if (matchingPreset) {
        inv = {
          id: matchingPreset.id,
          title: matchingPreset.title,
          config: matchingPreset.config,
          rsvps: [],
          wishes: [],
          isPaid: false
        };
      }
    }

    // 3. If still not found, fetch live from Firebase database
    if (!inv && typeof window !== "undefined") {
      try {
        const dbRef = ref(database, "saas_data");
        const snap = await get(dbRef);
        if (snap.exists()) {
          const cloudDb = snap.val();
          const cloudInvs = cloudDb.invitations ? (Array.isArray(cloudDb.invitations) ? cloudDb.invitations : Object.values(cloudDb.invitations)) : [];
          const foundCloud = cloudInvs.find(i => i.id === id);
          if (foundCloud) {
            inv = foundCloud;
          }
        }
      } catch (err) {
        console.warn("Could not fetch invitation from cloud directly:", err);
      }
    }

    if (inv) {
      let activeConfig = inv.config;
      const savedTemp = sessionStorage.getItem("preview_temp_config");
      if (isPreviewParam && savedTemp) {
        try {
          activeConfig = { ...activeConfig, ...JSON.parse(savedTemp) };
        } catch (e) {
          console.error("Failed to parse temp preview config", e);
        }
      }

      setInvitation({
        ...inv,
        config: activeConfig
      });
      setNotFound(false);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    
    // Listen for database background updates (like when Firebase data is fetched)
    const handleSync = () => {
      loadData();
      setTick(t => t + 1);
    };
    window.addEventListener("db_synced", handleSync);
    return () => window.removeEventListener("db_synced", handleSync);
  }, [id, isPreviewParam]);

  useEffect(() => {
    if (invitation?.config) {
      const bride = invitation.config.brideName || "";
      const groom = invitation.config.groomName || "";
      if (bride && groom) {
        document.title = `${bride} & ${groom} | Wedding Invitation — DS Envite`;
      }
    }
  }, [invitation]);

  const handleRsvpSubmit = async (form) => {
    try {
      const guestName = (form.name || "").trim().toLowerCase();
      let updatedRsvps = [...(invitation?.rsvps || [])];
      const existingIdx = updatedRsvps.findIndex(r => (r.name || "").trim().toLowerCase() === guestName);

      if (id === "demo") {
        if (existingIdx !== -1) {
          updatedRsvps[existingIdx] = { 
            ...updatedRsvps[existingIdx], 
            attending: form.attending,
            count: Number(form.count) || 1,
            note: form.note || "",
            updatedAt: new Date().toISOString()
          };
          showToast(`RSVP updated! Guest count set to ${form.count}.`, "success");
        } else {
          updatedRsvps = [{ ...form, count: Number(form.count) || 1, createdAt: new Date().toISOString() }, ...updatedRsvps];
          showToast("Thank you! Your RSVP has been confirmed.", "success");
        }
        setInvitation(prev => ({
          ...prev,
          rsvps: updatedRsvps
        }));
        return;
      }

      // Ensure local store has this invitation
      if (invitation) {
        dbStore.ensureInvitationCached(invitation);
      }

      const res = dbStore.submitRsvp(id, form);
      if (res && res.updated) {
        showToast(`RSVP updated! Guest count set to ${form.count}.`, "success");
      } else {
        showToast("Thank you! Your RSVP has been confirmed.", "success");
      }

      if (res && res.rsvps) {
        setInvitation(prev => ({
          ...prev,
          rsvps: res.rsvps
        }));
      }
    } catch (err) {
      showToast(err.message || "Failed to submit RSVP", "error");
    }
  };

  const handleWishSubmit = async (form) => {
    try {
      const senderName = (form.sender || "").trim().toLowerCase();
      const existing = (invitation?.wishes || []).find(w => (w.sender || "").trim().toLowerCase() === senderName);
      if (existing) {
        showToast(`A blessing has already been posted by "${form.sender.trim()}". Only one blessing is permitted per guest name.`, "info");
        return;
      }

      const wishData = {
        ...form,
        sender: form.sender.trim(),
        date: new Date().toLocaleDateString('en-GB') + " " + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      };

      if (id === "demo") {
        setInvitation(prev => {
          const filtered = (prev.wishes || []).filter(w => (w.sender || "").trim().toLowerCase() !== senderName);
          return {
            ...prev,
            wishes: [wishData, ...filtered]
          };
        });
        showToast("Thank you! Your blessing has been posted.", "success");
        return;
      }

      if (invitation) {
        dbStore.ensureInvitationCached(invitation);
      }
      const res = dbStore.submitWish(id, wishData);
      showToast("Thank you! Your beautiful blessing has been posted.", "success");

      if (res && res.wishes) {
        setInvitation(prev => ({
          ...prev,
          wishes: res.wishes
        }));
      }
    } catch (err) {
      showToast(err.message || "Failed to post blessing", "error");
    }
  };

  const handleDeleteRsvp = async (indexToDelete) => {
    const authorized = !!(
      currentUser &&
      currentUser.id &&
      (
        currentUser.role === 'admin' ||
        (invitation?.customerId && currentUser.id === invitation.customerId) ||
        (invitation?.customerEmail && currentUser.email && currentUser.email.toLowerCase() === invitation.customerEmail.toLowerCase()) ||
        (dbStore.getOrders?.() || []).some(o => o.customerId === currentUser.id && (o.id === invitation?.orderId || o.details?.invitationId === invitation?.id))
      )
    );
    if (!authorized) {
      showToast("Access Denied: Only the customer who ordered this invitation or the platform admin can delete RSVP responses.", "error");
      return;
    }

    const itemToDelete = displayedRsvps[indexToDelete];
    if (!itemToDelete) return;

    // Filter and update local + cloud
    const filtered = (invitation?.rsvps || []).filter(
      r => !(
        (r.name || "").trim().toLowerCase() === (itemToDelete.name || "").trim().toLowerCase() && 
        r.note === itemToDelete.note
      )
    );

    if (id === "demo") {
      setInvitation(prev => ({
        ...prev,
        rsvps: filtered
      }));
      showToast("RSVP response removed.", "info");
      return;
    }

    dbStore.updateInvitation(id, { rsvps: filtered });
    showToast("RSVP response removed successfully.", "success");
    loadData();
  };

  const handleDeleteWish = async (indexToDelete) => {
    const authorized = !!(
      currentUser &&
      currentUser.id &&
      (
        currentUser.role === 'admin' ||
        (invitation?.customerId && currentUser.id === invitation.customerId) ||
        (invitation?.customerEmail && currentUser.email && currentUser.email.toLowerCase() === invitation.customerEmail.toLowerCase()) ||
        (dbStore.getOrders?.() || []).some(o => o.customerId === currentUser.id && (o.id === invitation?.orderId || o.details?.invitationId === invitation?.id))
      )
    );
    if (!authorized) {
      showToast("Access Denied: Only the customer who ordered this invitation or the platform admin can delete blessings.", "error");
      return;
    }

    const itemToDelete = displayedWishes[indexToDelete];
    if (!itemToDelete) return;

    // Filter and update local + cloud
    const filtered = (invitation?.wishes || []).filter(
      w => !(
        (w.sender || "").trim().toLowerCase() === (itemToDelete.sender || "").trim().toLowerCase() && 
        (w.message || "").trim() === (itemToDelete.message || "").trim()
      )
    );

    if (id === "demo") {
      setInvitation(prev => ({
        ...prev,
        wishes: filtered
      }));
      showToast("Blessing wish removed.", "info");
      return;
    }

    dbStore.updateInvitation(id, { wishes: filtered });
    showToast("Blessing wish removed successfully.", "success");
    loadData();
  };

  const handleOpenEditModal = () => {
    if (!invitation?.config) return;
    setEditForm({
      brideName: invitation.config.brideName || "",
      groomName: invitation.config.groomName || "",
      weddingDate: invitation.config.weddingDate ? invitation.config.weddingDate.slice(0, 10) : "",
      weddingVenue: invitation.config.weddingVenue || "",
      introQuote: invitation.config.introQuote || ""
    });
    setShowEditModal(true);
  };

  const handleEditDetailsSubmit = (e) => {
    e.preventDefault();
    const updatedConfig = {
      ...invitation.config,
      brideName: editForm.brideName,
      groomName: editForm.groomName,
      weddingDate: editForm.weddingDate ? `${editForm.weddingDate}T16:00:00` : invitation.config.weddingDate,
      weddingVenue: editForm.weddingVenue,
      introQuote: editForm.introQuote
    };

    setInvitation(prev => ({
      ...prev,
      config: updatedConfig
    }));

    if (id === "demo" || isPreviewParam) {
      sessionStorage.setItem("preview_temp_config", JSON.stringify(updatedConfig));
    }
    setShowEditModal(false);
    showToast("Preview details updated live!", "success");
  };

  const handleSaveInvitation = () => {
    if (!currentUser) {
      showToast("Please log in or sign up to save this invitation to your account.", "info");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    try {
      const title = `${invitation.config.brideName} & ${invitation.config.groomName}'s Wedding`;
      dbStore.createInvitation(currentUser.id, title, invitation.config, false, "draft");
      sessionStorage.removeItem("preview_temp_config");
      showToast("Invitation successfully saved to your account!", "success");
      setTimeout(() => {
        navigate("/customer");
      }, 1500);
    } catch (e) {
      showToast("Failed to save invitation: " + e.message, "error");
    }
  };

  // Strict check: if marked paid anywhere in db, it IS paid!
  const isPaid = !!(invitation?.isPaid || invitation?.config?.isPaid);
  const showWatermark = !isPaid;

  // Compute moderator access: ONLY the customer who ordered the invite or the platform admin
  const isModerator = !!(
    currentUser &&
    currentUser.id &&
    invitation &&
    (
      currentUser.role === 'admin' ||
      (invitation.customerId && currentUser.id === invitation.customerId) ||
      (invitation.customerEmail && currentUser.email && currentUser.email.toLowerCase() === invitation.customerEmail.toLowerCase()) ||
      (dbStore.getOrders?.() || []).some(o => o.customerId === currentUser.id && (o.id === invitation.orderId || o.details?.invitationId === invitation.id))
    )
  );

  const displayedRsvps = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const r of (invitation?.rsvps || [])) {
      const nameKey = (r.name || "").trim().toLowerCase();
      if (!nameKey || seen.has(nameKey)) continue;
      seen.add(nameKey);
      result.push(r);
    }
    return result;
  }, [invitation?.rsvps]);

  const displayedWishes = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const w of (invitation?.wishes || [])) {
      const senderKey = (w.sender || "").trim().toLowerCase();
      if (!senderKey || seen.has(senderKey)) continue;
      seen.add(senderKey);
      result.push(w);
    }
    return result;
  }, [invitation?.wishes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b19] text-amber-200 flex flex-col items-center justify-center space-y-4 p-4 font-sans select-none">
        <div className="w-16 h-16 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin flex items-center justify-center">
          <SvgHeart className="w-7 h-7 text-amber-400 animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-cinzel text-lg tracking-widest uppercase font-bold text-amber-300">
            Opening Invitation...
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Loading bespoke themes & ceremony details
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !invitation) {
    return (
      <div className="min-h-screen bg-[#070b19] text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/30">
          <SvgHeart className="w-12 h-12 text-amber-400" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="font-cinzel text-2xl font-bold text-amber-300">Invitation Not Found</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            The invitation link you opened could not be located. It may have expired, been updated, or the link might be incomplete.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/invite/demo?preview=true"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-bold uppercase tracking-wider text-xs transition shadow-lg"
          >
            Explore Sample Invitation
          </Link>
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-slate-900 border border-amber-500/30 hover:border-amber-400 text-amber-300 font-bold uppercase tracking-wider text-xs transition"
          >
            Go to DS Envite Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="invitation-view-container" 
      className={`w-full relative min-h-screen custom-preview-scroller scroll-smooth ${
        isPaid ? "invitation-hd-ultra" : "invitation-preview-quality"
      }`}
    >
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: "" })} />
      )}


      {/* Sticky Preview Header / Bar */}
      {(isPreviewParam || id === 'demo') && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-950/90 backdrop-blur-md border border-amber-500/40 px-4 py-2 rounded-full shadow-2xl flex items-center space-x-3 text-xs text-slate-100 animate-fade-in max-w-[92vw]">
          <span className="flex items-center space-x-1.5 text-amber-400 font-semibold uppercase tracking-wider text-[10px]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
            <span>Preview Mode</span>
          </span>
          <span className="text-slate-600">|</span>
          <button
            onClick={handleOpenEditModal}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white transition font-medium flex items-center space-x-1 text-[11px] border border-slate-700"
          >
            <SvgEdit className="w-3.5 h-3.5 text-amber-400" />
            <span>Edit Details</span>
          </button>
          <button
            onClick={handleSaveInvitation}
            className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-bold uppercase tracking-wider text-[10px] transition flex items-center space-x-1 shadow-lg"
          >
            <SvgSparkles className="w-3.5 h-3.5" />
            <span>Save for Later</span>
          </button>
        </div>
      )}

      {/* EDIT DETAILS MODAL IN PREVIEW */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl border border-amber-500/30 bg-slate-950 text-slate-100 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
            >
              ✕
            </button>

            <div className="space-y-1 pr-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Live Preview Customizer</span>
              <h3 className="font-cinzel text-lg font-bold text-slate-100">Edit Invitation Details</h3>
            </div>

            <form onSubmit={handleEditDetailsSubmit} className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Bride Name</label>
                  <input
                    type="text"
                    value={editForm.brideName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, brideName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Groom Name</label>
                  <input
                    type="text"
                    value={editForm.groomName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, groomName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Wedding Date</label>
                <input
                  type="date"
                  value={editForm.weddingDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, weddingDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Wedding Venue</label>
                <input
                  type="text"
                  value={editForm.weddingVenue}
                  onChange={(e) => setEditForm(prev => ({ ...prev, weddingVenue: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Intro Quote</label>
                <input
                  type="text"
                  value={editForm.introQuote}
                  onChange={(e) => setEditForm(prev => ({ ...prev, introQuote: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-bold uppercase tracking-wider transition shadow-lg"
                >
                  Apply Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Render diagonal watermark overlay if not paid */}
      <Watermark isPaid={isPaid} />

      {/* Sticky Bottom Payment & Watermark Removal Bar (If unpaid) */}
      {!isPaid && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 backdrop-blur-md border border-amber-500/50 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs text-slate-100 max-w-[95vw] animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-extrabold text-amber-400 hidden sm:inline">Unlock Full Invitation</span>
            <span className="line-through text-slate-300 text-xs font-semibold">₹{invitation.config?.price || 999}</span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
              {invitation.config?.discountPercent !== undefined ? invitation.config.discountPercent : 30}% OFF
            </span>
            <span className="text-sm font-black text-amber-200">
              ₹{Math.round((invitation.config?.price || 999) * (1 - (invitation.config?.discountPercent !== undefined ? invitation.config.discountPercent : 30) / 100))}
            </span>
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-slate-950 font-black uppercase tracking-wider text-[10px] transition shadow-lg flex items-center space-x-1.5 cursor-pointer"
          >
            <SvgCheck className="w-3.5 h-3.5 text-slate-950 font-bold" />
            <span>Pay via GPay / PhonePe</span>
          </button>
        </div>
      )}

      {/* PAYMENT QR MODAL */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invitation={invitation}
        onPaymentSubmitted={() => {
          loadData();
        }}
        showToast={showToast}
      />

      <InvitationRenderer
        invitationId={id}
        config={invitation.config}
        rsvps={displayedRsvps}
        wishes={displayedWishes}
        onSubmitRsvp={handleRsvpSubmit}
        onSubmitWish={handleWishSubmit}
        onDeleteRsvp={handleDeleteRsvp}
        onDeleteWish={handleDeleteWish}
        isModerator={isModerator}
        showEnvelopeFirst={true} // Enable initial envelope opener animation screen for visitors
        isPlayingMusic={musicPlaying}
        onMusicToggle={setMusicPlaying}
        isPaid={isPaid}
      />
    </div>
  );
}
