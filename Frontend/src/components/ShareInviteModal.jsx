import React, { useState, useEffect } from 'react';
import { SvgX, SvgCopy, SvgCheck, SvgDownload, SvgSend, SvgSparkles, SvgHeart } from './icons';
import { downloadStandaloneHtmlWebsite } from '../utils/exportInvitation';
import { dbStore } from '../data/store';
import { getCoupleInitials, getMonogramThumbnailDataUrl } from '../utils/monogramThumbnail';

export default function ShareInviteModal({
  isOpen,
  onClose,
  invitationId,
  invitation,
  config = {},
  isPaid = false,
  showToast
}) {
  const [copied, setCopied] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [customSlugInput, setCustomSlugInput] = useState("");
  const [monogramDataUrl, setMonogramDataUrl] = useState(null);

  const invObj = invitation || (invitationId ? dbStore.getInvitationById(invitationId) : null);
  const targetId = invObj?.id || invitationId;
  const currentConfig = { ...(invObj?.config || {}), ...(config || {}) };
  const effectivePaid = invObj ? (invObj.isPaid || false) : isPaid;

  const brideName = currentConfig.coverBrideText || currentConfig.brideName || "Suman";
  const groomName = currentConfig.coverGroomText || currentConfig.groomName || "Vishal";
  const coupleInitials = `${brideName.charAt(0)} & ${groomName.charAt(0)}`;

  const autoSlug = dbStore.getInvitationShareSlug(invObj || { id: targetId }, currentConfig);
  const isManuallySet = Boolean(invObj?.isCustomSlugManuallySet && invObj?.customSlug && !invObj.customSlug.startsWith("ananya-aarav"));
  const activeSlug = isManuallySet ? invObj.customSlug : autoSlug;

  useEffect(() => {
    if (isOpen) {
      setCustomSlugInput(activeSlug);
      setIsEditingSlug(false);
      try {
        const url = getMonogramThumbnailDataUrl({
          brideName,
          groomName,
          weddingDate: currentConfig.weddingDate,
          primaryColor: currentConfig.primaryColor || "#400d18",
          accentGold: currentConfig.accentGold || "#d4af37"
        });
        setMonogramDataUrl(url);
      } catch (e) {
        console.warn("Could not generate monogram:", e);
      }
    }
  }, [isOpen, activeSlug, brideName, groomName, currentConfig.weddingDate]);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}/invite/${activeSlug}`;

  const defaultWhatsappMsg = `💍 *WEDDING INVITATION* 💍\n✨ *${coupleInitials}* ✨\n\n*${brideName} & ${groomName}*\n\nWe warmly invite you to celebrate our sacred wedding union! Tap to view our interactive invitation, music, and RSVP:\n${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    if (showToast) showToast("Invitation link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveSlug = () => {
    const cleaned = dbStore.slugify(customSlugInput);
    if (!cleaned) {
      if (showToast) showToast("Link name cannot be empty", "error");
      return;
    }
    if (targetId) {
      dbStore.updateInvitation(targetId, { customSlug: cleaned, slug: cleaned, isCustomSlugManuallySet: true });
      window.dispatchEvent(new Event("db_synced"));
      if (showToast) showToast("Custom sharing link updated successfully!", "success");
    }
    setIsEditingSlug(false);
  };

  const handleResetSlug = () => {
    const rawId = (targetId || "").replace(/^invite-/, "");
    const namePart = dbStore.slugify(`${brideName}-${groomName}`) || "wedding";
    const resetVal = `${namePart}-${rawId || "invite"}`;
    setCustomSlugInput(resetVal);
    if (targetId) {
      dbStore.updateInvitation(targetId, { customSlug: resetVal, slug: resetVal, isCustomSlugManuallySet: false });
      window.dispatchEvent(new Event("db_synced"));
      if (showToast) showToast("Sharing link reset to couple name!", "success");
    }
    setIsEditingSlug(false);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(defaultWhatsappMsg);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleDownloadMonogram = () => {
    const link = document.createElement("a");
    link.download = `${dbStore.slugify(brideName)}-${dbStore.slugify(groomName)}-monogram-thumbnail.png`;
    link.href = monogramDataUrl || "/wedding_monogram_thumbnail.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast("Monogram initial thumbnail downloaded!", "success");
  };

  const handleDownloadHtml = () => {
    downloadStandaloneHtmlWebsite(currentConfig, { id: targetId });
    if (showToast) showToast("Standalone interactive HTML website downloaded successfully!", "success");
  };

  const handleTestLink = () => {
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0e1626] border border-amber-500/30 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl shadow-amber-500/10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <SvgSend className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-amber-100">
                Share Invitation Website
              </h3>
              <p className="text-[11px] text-amber-300/80 font-mono">
                {brideName} &amp; {groomName} • 100% Public Access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <SvgX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar text-xs">
          
          {/* Public Link Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Direct Web Invitation Link
              </label>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                ✓ No Login Needed for Guests
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-amber-500/30 font-mono text-xs text-amber-200 select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
              >
                {copied ? <SvgCheck className="w-4 h-4" /> : <SvgCopy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Link Customizer for Couple / Owner Name */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-200 flex items-center gap-1.5">
                  <span>🔗</span>
                  <span>Sharing Link Couple / Owner Name</span>
                </span>
                {!isEditingSlug ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSlugInput(activeSlug);
                      setIsEditingSlug(true);
                    }}
                    className="text-[10px] uppercase font-bold text-amber-300 hover:text-amber-100 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-2.5 py-0.5 rounded-lg transition cursor-pointer"
                  >
                    ✎ Edit Link Name
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingSlug(false)}
                    className="text-[10px] text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {isEditingSlug ? (
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] text-slate-300">
                    Set a custom couple name or unique identifier in your invitation URL:
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-mono select-none">/invite/</span>
                    <input
                      type="text"
                      value={customSlugInput}
                      onChange={(e) => setCustomSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      placeholder={`${dbStore.slugify(brideName)}-${dbStore.slugify(groomName)}-${(targetId || '').replace(/^invite-/, '')}`}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-amber-500/50 font-mono text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleSaveSlug}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase cursor-pointer transition shadow"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleResetSlug}
                      title="Reset to default couple name"
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-xs cursor-pointer transition"
                    >
                      ↺
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
                  <span>Current Link ID: <strong className="text-amber-300">{activeSlug}</strong></span>
                  <span className="text-[10px] text-emerald-400 font-sans">✓ Unique ID attached</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-1">
              <button
                onClick={handleTestLink}
                className="text-[11px] text-amber-300 hover:text-amber-200 underline font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <span>Preview / Test Link in New Tab ↗</span>
              </button>
            </div>
          </div>

          {/* Social Preview / WhatsApp Monogram Thumbnail Showcase */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-amber-950/20 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-base">👑</span>
                <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider">
                  Automatic WhatsApp &amp; Social Media Preview
                </span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                ⚡ 100% Auto-Integrated
              </span>
            </div>

            {/* WhatsApp Link Card Simulation */}
            <div className="rounded-xl overflow-hidden border border-amber-500/40 bg-[#0d141e] shadow-lg max-w-md mx-auto">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                <img
                  src={monogramDataUrl || "/wedding_monogram_thumbnail.jpg"}
                  alt={`${brideName} & ${groomName} Monogram Thumbnail`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-emerald-950/80 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-mono text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                  <span>✓</span>
                  <span>Auto-Generated Thumbnail</span>
                </div>
              </div>
              <div className="p-3 bg-[#131c2a] border-t border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                  <span>🔒</span>
                  <span>{origin ? origin.replace(/^https?:\/\//, '') : 'ds-envite.vercel.app'}</span>
                </div>
                <h4 className="font-cinzel text-xs font-bold text-amber-100 truncate">
                  {brideName} &amp; {groomName} — Royal Wedding Invitation
                </h4>
                <p className="text-[10px] text-slate-300 line-clamp-1">
                  Tap to open our interactive digital invitation card, music, timeline &amp; RSVP.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start space-x-2">
              <span className="text-emerald-400 text-sm mt-0.5">✨</span>
              <div className="text-[10px] text-slate-300 leading-relaxed flex-1">
                <strong className="text-emerald-300">Automatic Thumbnail: </strong>
                Whenever you copy or share this link on WhatsApp, iMessage, Facebook, or Telegram, this royal monogram preview and title will appear <strong>automatically</strong>. You do <strong>not</strong> need to download or manually attach any picture!
              </div>
              <button
                type="button"
                onClick={handleDownloadMonogram}
                title="Optional: download a copy of this monogram"
                className="text-[9px] text-slate-400 hover:text-amber-300 underline shrink-0 cursor-pointer pt-0.5"
              >
                Save copy
              </button>
            </div>
          </div>

          {/* Quick Sharing Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleWhatsAppShare}
              className="p-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center space-x-2 font-bold uppercase tracking-wider text-xs transition cursor-pointer"
            >
              <span className="text-base">💬</span>
              <span>Share on WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="p-3.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 flex items-center justify-center space-x-2 font-bold uppercase tracking-wider text-xs transition cursor-pointer"
            >
              <SvgDownload className="w-4 h-4 text-amber-400" />
              <span>Download HTML Website</span>
            </button>
          </div>

          {/* Standalone HTML Info Card */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center space-x-2 text-amber-300 font-bold">
              <span>🌐</span>
              <span>What is "Download HTML Website"?</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Downloads a completely self-contained, single-file interactive website (<code className="text-amber-200 font-mono">.html</code>). 
              Anyone can open it in any browser (Chrome, Safari, iPhone, Android) by double-clicking it — with <strong>zero logins</strong>, <strong>no Vercel account</strong>, and <strong>no server required</strong>!
            </p>
          </div>

          {/* Vercel Deployment Protection Troubleshooting Guide */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center space-x-2 text-amber-300 font-bold">
              <span>💡</span>
              <span>Seeing a "Vercel Login" screen on your shared link?</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              If your guests see a Vercel login wall, your Vercel project has <strong>Deployment Protection</strong> turned ON. You can disable it in 10 seconds:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-200 pl-1 font-medium">
              <li>Open your <strong>Vercel Dashboard</strong> and click this project.</li>
              <li>Go to <strong>Settings</strong> → <strong>Deployment Protection</strong>.</li>
              <li>Under <strong>Vercel Authentication</strong>, select <strong>Disabled</strong> (Turn OFF).</li>
            </ol>
            <p className="text-[10px] text-amber-300/80 italic pt-1">
              ✓ Once disabled, everyone worldwide can view your invitation website immediately without any login!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-amber-500/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold uppercase tracking-wider text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
