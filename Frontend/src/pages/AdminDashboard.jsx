import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import dbStore from '../data/store';
import { 
  SvgPlus, SvgEdit, SvgTrash, SvgEye, SvgSparkles, SvgUsers, 
  SvgMessageSquare, SvgSliders, SvgLayers, SvgCheck, SvgX, 
  SvgClipboard, SvgExternalLink, SvgCopy, SvgHeart
} from '../components/icons';
import Toast from '../components/Toast';
import CustomDialog from '../components/CustomDialog';
import ThemeEditorModal from '../components/ThemeEditorModal';
import PaymentModal from '../components/PaymentModal';
import InvoiceModal from '../components/InvoiceModal';
import ShareInviteModal from '../components/ShareInviteModal';
import { downloadStandaloneHtmlWebsite } from '../utils/exportInvitation';
import {
  formatDriveFolderName,
  GOOGLE_DRIVE_ROOT_FOLDER_URL,
  GOOGLE_DRIVE_ROOT_FOLDER_ID,
  getDriveWebhookUrl,
  setDriveWebhookUrl,
  syncDriveFolder,
  syncInvitationMediaFromDrive,
  requestGoogleDriveAuth,
  getStoredOAuthToken,
  deleteDriveFolder,
  ensureInvitationDriveFolder,
  transferInvitationToGoogleDriveOAuth,
  GOOGLE_APPS_SCRIPT_TEMPLATE
} from '../utils/googleDriveStorage';

function LogoBrandingManager({ showToast }) {
  const initialSettings = dbStore.getBrandSettings();
  const [brandName, setBrandName] = useState(initialSettings.brandName || "DS ENVITES");
  const [logoShape, setLogoShape] = useState(initialSettings.logoShape || "circle");
  const [imageSrc, setImageSrc] = useState(initialSettings.logoUrl || "");
  const [scale, setScale] = useState(initialSettings.logoScale || 1.0);
  const [posX, setPosX] = useState(initialSettings.logoX || 0);
  const [posY, setPosY] = useState(initialSettings.logoY || 0);
  const [appBgColor, setAppBgColor] = useState(initialSettings.appBgColor || "#FFF9F2");
  const [appBgGradient, setAppBgGradient] = useState(initialSettings.appBgGradient || "");
  const [appBgOverlayUrl, setAppBgOverlayUrl] = useState(initialSettings.appBgOverlayUrl || "");
  const [appBgOverlayOpacity, setAppBgOverlayOpacity] = useState(initialSettings.appBgOverlayOpacity !== undefined ? initialSettings.appBgOverlayOpacity : 0.35);
  const [appBgOverlayRepeat, setAppBgOverlayRepeat] = useState(initialSettings.appBgOverlayRepeat || "repeat");
  const [appBgOverlayBlendMode, setAppBgOverlayBlendMode] = useState(initialSettings.appBgOverlayBlendMode || "normal");
  const [appButtonStyle, setAppButtonStyle] = useState(initialSettings.appButtonStyle || "gold-gradient");
  const [openDropdown, setOpenDropdown] = useState("color"); // 'color', 'overlay', 'buttons' or null
  const [overlayUrlInput, setOverlayUrlInput] = useState("");
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState(initialSettings.logoUrl || "");
  const [urlInput, setUrlInput] = useState("");

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const overlayFileInputRef = useRef(null);

  // Sample preset logos for rapid testing
  const sampleLogos = [
    { label: "Flamingo Studio", url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80" },
    { label: "Golden Floral", url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=400&q=80" },
    { label: "Monogram Crest", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80" }
  ];

  // Sample preset clipart & pattern overlays for rapid testing
  const sampleOverlays = [
    { label: "Golden Damask", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80", repeat: "repeat", mode: "soft-light" },
    { label: "Lace Floral", url: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80", repeat: "repeat", mode: "overlay" },
    { label: "Starlight Constellations", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80", repeat: "no-repeat-cover", mode: "screen" },
    { label: "Vintage Parchment", url: "https://images.unsplash.com/photo-1607893378714-007fd47c8719?auto=format&fit=crop&w=600&q=80", repeat: "repeat", mode: "multiply" },
    { label: "Sacred Mandala Clipart", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80", repeat: "center-contain", mode: "normal" }
  ];

  // Global button style presets
  const buttonStyles = [
    {
      id: "gold-gradient",
      name: "Classic Gold Gradient",
      badge: "⭐ Classic",
      desc: "Warm gold-to-yellow gradient with bold dark text & gold shadow",
      previewClass: "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-extrabold shadow-lg rounded-xl"
    },
    {
      id: "gilded-pill",
      name: "Gilded Glow Pill",
      badge: "👑 Luminous",
      desc: "Full rounded pill with golden border and glowing amber backlight",
      previewClass: "bg-amber-500/10 border-2 border-amber-400 text-amber-300 font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:bg-amber-500/20 rounded-full"
    },
    {
      id: "glassmorphism",
      name: "Glassmorphism Frost",
      badge: "❄️ Frosted",
      desc: "Subtle translucent glass, crisp white text, and backdrop blur",
      previewClass: "bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold hover:bg-white/20 shadow-md rounded-xl"
    },
    {
      id: "royal-burgundy",
      name: "Royal Burgundy Matched",
      badge: "🍷 Regal",
      desc: "Deep burgundy background accented with a warm gold border",
      previewClass: "bg-rose-950 border border-amber-500/40 text-amber-200 font-extrabold shadow-lg hover:bg-rose-900 rounded-xl"
    },
    {
      id: "neon-pulse",
      name: "Neon Amber Pulse",
      badge: "⚡ Dynamic",
      desc: "High-energy pulsing aura glow with bold amber typography",
      previewClass: "bg-slate-950 border-2 border-amber-400 text-amber-300 font-black animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.5)] rounded-xl"
    },
    {
      id: "minimal-slate",
      name: "Minimalist Dark Slate",
      badge: "🖤 Modern",
      desc: "Sleek dark slate button with subtle golden highlight on hover",
      previewClass: "bg-slate-900 border border-slate-700 text-slate-200 font-bold hover:border-amber-500/50 hover:text-white rounded-xl"
    }
  ];

  // Redraw canvas on any parameter change
  useEffect(() => {
    if (!imageSrc) {
      setCroppedPreviewUrl("");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      ctx.save();

      // Create clipping path
      ctx.beginPath();
      if (logoShape === "circle") {
        ctx.arc(cw / 2, ch / 2, cw / 2 - 12, 0, Math.PI * 2);
      } else if (logoShape === "rounded") {
        if (ctx.roundRect) {
          ctx.roundRect(12, 12, cw - 24, ch - 24, 36);
        } else {
          ctx.rect(12, 12, cw - 24, ch - 24);
        }
      } else {
        ctx.rect(12, 12, cw - 24, ch - 24);
      }
      ctx.clip();

      // Background fill inside logo clip
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, cw, ch);

      // Scale & translate image
      const aspect = img.width / img.height;
      let drawW = (cw - 24) * scale;
      let drawH = drawW / aspect;
      if (drawH < (ch - 24) * scale) {
        drawH = (ch - 24) * scale;
        drawW = drawH * aspect;
      }

      const drawX = (cw - drawW) / 2 + posX;
      const drawY = (ch - drawH) / 2 + posY;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Draw subtle crop boundary ring
      ctx.save();
      ctx.beginPath();
      if (logoShape === "circle") {
        ctx.arc(cw / 2, ch / 2, cw / 2 - 12, 0, Math.PI * 2);
      } else if (logoShape === "rounded") {
        if (ctx.roundRect) ctx.roundRect(12, 12, cw - 24, ch - 24, 36);
        else ctx.rect(12, 12, cw - 24, ch - 24);
      } else {
        ctx.rect(12, 12, cw - 24, ch - 24);
      }
      ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      try {
        const dataUrl = canvas.toDataURL("image/png");
        setCroppedPreviewUrl(dataUrl);
      } catch (err) {
        console.warn("Canvas export fallback", err);
        setCroppedPreviewUrl(imageSrc);
      }
    };

    img.onerror = () => {
      console.error("Failed to load image for canvas cropping:", imageSrc);
    };
  }, [imageSrc, scale, posX, posY, logoShape]);

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast("File size too large. Please select an image under 8MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      setImageSrc(evt.target.result);
      setScale(1.0);
      setPosX(0);
      setPosY(0);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlApply = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setImageSrc(urlInput.trim());
    setScale(1.0);
    setPosX(0);
    setUrlInput("");
    showToast("Image URL loaded!", "info");
  };

  const handleLiveBgColorChange = (color, name) => {
    setAppBgColor(color);
    setAppBgGradient("");
    document.documentElement.style.setProperty('--app-bg-color', color);
    document.body.style.backgroundColor = color;
    document.body.style.backgroundImage = 'none';

    // Instantly save to dbStore & sync across entire app in real time
    dbStore.updateBrandSettings({
      appBgColor: color,
      appBgGradient: ""
    });

    if (name) {
      showToast(`App background theme updated to ${name}!`, "success");
    }
  };

  const handleLiveOverlayUpdate = (updates) => {
    const newUrl = updates.appBgOverlayUrl !== undefined ? updates.appBgOverlayUrl : appBgOverlayUrl;
    const newOpacity = updates.appBgOverlayOpacity !== undefined ? updates.appBgOverlayOpacity : appBgOverlayOpacity;
    const newRepeat = updates.appBgOverlayRepeat !== undefined ? updates.appBgOverlayRepeat : appBgOverlayRepeat;
    const newBlend = updates.appBgOverlayBlendMode !== undefined ? updates.appBgOverlayBlendMode : appBgOverlayBlendMode;

    setAppBgOverlayUrl(newUrl);
    setAppBgOverlayOpacity(newOpacity);
    setAppBgOverlayRepeat(newRepeat);
    setAppBgOverlayBlendMode(newBlend);

    dbStore.updateBrandSettings({
      appBgOverlayUrl: newUrl,
      appBgOverlayOpacity: newOpacity,
      appBgOverlayRepeat: newRepeat,
      appBgOverlayBlendMode: newBlend
    });
  };

  const handleOverlayFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast("File size too large. Please select an overlay image under 8MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      handleLiveOverlayUpdate({ appBgOverlayUrl: evt.target.result });
      showToast("Custom background overlay image uploaded and applied across all pages!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleLiveButtonStyleChange = (styleId, styleName) => {
    setAppButtonStyle(styleId);
    document.documentElement.dataset.btnStyle = styleId;

    dbStore.updateBrandSettings({
      appButtonStyle: styleId
    });

    if (styleName) {
      showToast(`Global button style updated to ${styleName}!`, "success");
    }
  };

  const handleSaveBrandSettings = () => {
    const newSettings = {
      brandName: brandName.trim() || "DS ENVITES",
      logoUrl: croppedPreviewUrl || imageSrc,
      logoShape,
      logoScale: scale,
      logoX: posX,
      logoY: posY,
      appBgColor,
      appBgGradient,
      appBgOverlayUrl,
      appBgOverlayOpacity,
      appBgOverlayRepeat,
      appBgOverlayBlendMode,
      appButtonStyle
    };
    dbStore.updateBrandSettings(newSettings);
    showToast("Brand logo, background color, overlays & button theme updated successfully across all pages!", "success");
  };

  const handleResetBrandLogo = () => {
    dbStore.updateBrandSettings({
      brandName: "DS ENVITES",
      logoUrl: "",
      logoShape: "circle",
      logoScale: 1.0,
      logoX: 0,
      logoY: 0,
      appBgColor: "#FFF9F2",
      appBgGradient: "",
      appBgOverlayUrl: "",
      appBgOverlayOpacity: 0.35,
      appBgOverlayRepeat: "repeat",
      appBgOverlayBlendMode: "normal",
      appButtonStyle: "gold-gradient"
    });
    setBrandName("DS ENVITES");
    setLogoShape("circle");
    setImageSrc("");
    setScale(1.0);
    setPosX(0);
    setPosY(0);
    setAppBgColor("#FFF9F2");
    setAppBgGradient("");
    setAppBgOverlayUrl("");
    setAppBgOverlayOpacity(0.35);
    setAppBgOverlayRepeat("repeat");
    setAppBgOverlayBlendMode("normal");
    setAppButtonStyle("gold-gradient");
    setCroppedPreviewUrl("");
    document.documentElement.style.setProperty('--app-bg-color', '#FFF9F2');
    document.documentElement.dataset.btnStyle = 'gold-gradient';
    document.body.style.backgroundColor = '#FFF9F2';
    document.body.style.backgroundImage = 'none';
    showToast("Brand logo & platform styling reset to default!", "info");
  };

  return (
    <div className="space-y-6">
      {/* Live Preview Header Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 shadow-xl">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-300 block mb-2">Live Navbar Preview</span>
        <div className="py-3 px-5 rounded-xl bg-[#090d16] border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {croppedPreviewUrl ? (
              <div className={`w-10 h-10 flex items-center justify-center overflow-hidden border border-amber-500/50 shadow-md ${
                logoShape === 'circle' ? 'rounded-full' : logoShape === 'square' ? 'rounded-none' : 'rounded-xl'
              } bg-slate-900 shrink-0`}>
                <img src={croppedPreviewUrl} alt="Brand Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/30">
                <SvgHeart className="w-5 h-5 text-amber-500 animate-pulse" fill="rgba(245, 158, 11, 0.2)" />
              </div>
            )}
            <span className="font-cinzel tracking-wider text-base font-bold text-amber-100">
              {brandName || "DS ENVITES"}
            </span>
          </div>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Interactive Canvas Cropper (Top) + Logo File & Title Dropdown Menu (Below Crop Option) */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header: Interactive Canvas Cropper */}
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-cinzel text-base font-bold text-amber-200">Interactive Canvas Cropper</h3>
                <p className="text-xs text-slate-200 font-medium">Fine-tune logo crop boundary, zoom scale &amp; positioning</p>
              </div>
              <span className="text-[10px] font-bold text-amber-300/80 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Live 260x260 PNG
              </span>
            </div>

            {/* 1. Interactive Canvas Output */}
            {imageSrc ? (
              <div className="relative p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner flex flex-col items-center">
                <canvas
                  ref={canvasRef}
                  width={260}
                  height={260}
                  className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 cursor-move"
                />
                <p className="text-[10px] font-bold text-slate-300 mt-2 font-mono">PNG Canvas Output</p>
              </div>
            ) : (
              <div className="w-full h-40 rounded-2xl bg-slate-950/80 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center p-4 text-slate-300 space-y-2">
                <SvgHeart className="w-8 h-8 text-slate-600" />
                <p className="text-[11px] text-center font-semibold text-slate-300">
                  No logo image selected.<br />Upload a file or choose a sample template in the dropdown menu below to crop.
                </p>
              </div>
            )}

            {/* 2. Crop Controls: Scale & Offsets */}
            {imageSrc && (
              <div className="w-full space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-100 mb-1">
                    <span>Zoom / Scale</span>
                    <span className="text-amber-300 font-mono font-extrabold">{scale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-100 mb-1">
                      <span>Offset X</span>
                      <span className="text-amber-300 font-mono font-extrabold">{posX}px</span>
                    </div>
                    <input
                      type="range"
                      min="-120"
                      max="120"
                      step="1"
                      value={posX}
                      onChange={(e) => setPosX(parseInt(e.target.value))}
                      className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-100 mb-1">
                      <span>Offset Y</span>
                      <span className="text-amber-300 font-mono font-extrabold">{posY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-120"
                      max="120"
                      step="1"
                      value={posY}
                      onChange={(e) => setPosY(parseInt(e.target.value))}
                      className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setScale(1.0); setPosX(0); setPosY(0); }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                  >
                    Reset Crop Zoom &amp; Position
                  </button>
                </div>
              </div>
            )}

            {/* 3. Action Buttons for Brand Logo Crop */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleResetBrandLogo}
                className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-400 hover:text-rose-300 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Reset Default Heart
              </button>
              <button
                type="button"
                onClick={handleSaveBrandSettings}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <SvgCheck className="w-4 h-4 text-slate-950" />
                <span className="text-slate-950 font-extrabold">Crop &amp; Save Brand Logo</span>
              </button>
            </div>

            {/* 4. ACCORDION DROPDOWN MENU BELOW CROP OPTION */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-lg transition-all duration-300 mt-3">
              <button
                type="button"
                onClick={() => setOpenDropdown(prev => prev === 'logo' ? null : 'logo')}
                className="w-full px-5 py-4 flex items-center justify-between cursor-pointer bg-slate-900/90 hover:bg-slate-850 transition select-none"
              >
                <div className="flex items-center space-x-3">
                  <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">🖼️</span>
                  <div className="text-left">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                      Brand Title, Mask &amp; Logo Upload Settings
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">Configure website title, mask shape &amp; upload logo file/URL</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 capitalize">
                    {logoShape} Mask
                  </span>
                  <svg
                    className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${openDropdown === 'logo' ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {openDropdown === 'logo' && (
                <div className="p-5 border-t border-slate-800 space-y-4 animate-accordion-down bg-slate-950">
                  {/* Website Brand Title */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-amber-300/90 block mb-1 font-bold">
                      Website Brand Title
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                      placeholder="e.g. DS ENVITES"
                    />
                  </div>

                  {/* Logo Mask Shape */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-amber-300/90 block mb-2 font-bold">
                      Logo Mask Shape
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "circle", label: "Circle ⭕" },
                        { id: "rounded", label: "Rounded ▢" },
                        { id: "square", label: "Square █" }
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setLogoShape(s.id)}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition text-center ${
                            logoShape === s.id
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 border-amber-400 text-slate-950 font-extrabold shadow-md'
                              : 'bg-slate-900 border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload New Logo File */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-amber-300/90 block mb-1 font-bold">
                      Upload New Logo File
                    </label>
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
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-200 hover:text-white text-xs font-semibold transition flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <SvgPlus className="w-4 h-4 text-amber-400" />
                      <span>Choose Image File (PNG, JPG, SVG, WebP)</span>
                    </button>
                  </div>

                  {/* Or Paste Image URL */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-amber-300/90 block mb-1 font-bold">
                      Or Paste Image URL
                    </label>
                    <form onSubmit={handleUrlApply} className="flex space-x-2">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                      >
                        Load
                      </button>
                    </form>
                  </div>

                  {/* Quick Sample Templates */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-amber-300/90 block mb-2 font-bold">
                      Quick Sample Templates
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sampleLogos.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setImageSrc(s.url);
                            setScale(1.0);
                            setPosX(0);
                            setPosY(0);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-200 hover:text-white text-[11px] font-medium transition flex items-center space-x-1.5 cursor-pointer"
                        >
                          <img src={s.url} alt="" className="w-4 h-4 rounded-full object-cover" />
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Platform Styling & Animated Dropdown Menus */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-cinzel text-base font-bold text-amber-200">Platform Styling &amp; Global Themes</h3>
            <p className="text-xs text-slate-200 font-medium">Customize global application background colors, overlays, and button styles</p>
          </div>

          {/* ACCORDION DROPDOWN 1: 🎨 Main App Background Color & Presets */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-lg transition-all duration-300">
            <button
              type="button"
              onClick={() => setOpenDropdown(prev => prev === 'color' ? null : 'color')}
              className="w-full px-5 py-4 flex items-center justify-between cursor-pointer bg-slate-900/90 hover:bg-slate-850 transition select-none"
            >
              <div className="flex items-center space-x-3">
                <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">🎨</span>
                <div className="text-left">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                    Main App Background Color &amp; Presets
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">Select platform background theme color</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: appBgColor }} />
                <svg
                  className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${openDropdown === 'color' ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {openDropdown === 'color' && (
              <div className="p-5 border-t border-slate-800 space-y-4 animate-accordion-down bg-slate-950">
                {/* Custom Color Input & Hex */}
                <div className="flex items-center space-x-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <input
                    type="color"
                    value={appBgColor}
                    onChange={(e) => handleLiveBgColorChange(e.target.value)}
                    onInput={(e) => handleLiveBgColorChange(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                    title="Choose Custom Background Color"
                  />
                  <div className="flex-1">
                    <span className="text-[10px] text-amber-300 font-bold block uppercase">Custom Background Color Hex</span>
                    <input
                      type="text"
                      value={appBgColor}
                      onChange={(e) => handleLiveBgColorChange(e.target.value)}
                      className="w-full bg-transparent text-xs font-mono font-bold text-slate-100 focus:outline-none"
                      placeholder="#FFF9F2"
                    />
                  </div>
                </div>

                {/* Curated Theme Color Presets */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                    Popular Theme Color Presets:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: "Warm Ivory (Default)", color: "#FFF9F2" },
                      { name: "Obsidian Midnight", color: "#090d16" },
                      { name: "Royal Sapphire", color: "#0a1128" },
                      { name: "Emerald Forest", color: "#062016" },
                      { name: "Wine Burgundy", color: "#1c050b" },
                      { name: "Onyx Pitch Black", color: "#050508" },
                      { name: "Golden Amber Dark", color: "#1c1204" },
                      { name: "Rose Blush Light", color: "#faf0f2" },
                      { name: "Pearl Cream Light", color: "#f8f6f0" }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleLiveBgColorChange(preset.color, preset.name)}
                        className={`p-2 rounded-xl border text-[11px] font-bold transition flex items-center space-x-2 text-left cursor-pointer ${
                          appBgColor === preset.color
                            ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-md scale-102 ring-2 ring-amber-400/40'
                            : 'border-slate-800 bg-slate-900 text-slate-200 hover:border-amber-500/40 hover:bg-slate-800'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0" style={{ backgroundColor: preset.color }} />
                        <span className="truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION DROPDOWN 2: ✨ Main App Overlay, Clipart & Pattern Layer */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-lg transition-all duration-300">
            <button
              type="button"
              onClick={() => setOpenDropdown(prev => prev === 'overlay' ? null : 'overlay')}
              className="w-full px-5 py-4 flex items-center justify-between cursor-pointer bg-slate-900/90 hover:bg-slate-850 transition select-none"
            >
              <div className="flex items-center space-x-3">
                <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">✨</span>
                <div className="text-left">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                    Background Overlay, Clipart &amp; Patterns
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">Upload custom vector patterns, textures &amp; clipart</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {appBgOverlayUrl ? (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Active</span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500">None</span>
                )}
                <svg
                  className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${openDropdown === 'overlay' ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {openDropdown === 'overlay' && (
              <div className="p-5 border-t border-slate-800 space-y-4 animate-accordion-down bg-slate-950">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                    Upload &amp; Pattern Settings
                  </span>
                  {appBgOverlayUrl && (
                    <button
                      type="button"
                      onClick={() => handleLiveOverlayUpdate({ appBgOverlayUrl: "" })}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase underline cursor-pointer"
                    >
                      Remove Overlay
                    </button>
                  )}
                </div>

                {/* Upload File */}
                <div>
                  <input
                    ref={overlayFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleOverlayFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => overlayFileInputRef.current && overlayFileInputRef.current.click()}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-amber-300 hover:text-amber-200 text-xs font-semibold transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <SvgPlus className="w-4 h-4 text-amber-400" />
                    <span>Choose Overlay File (PNG, SVG, WebP)</span>
                  </button>
                </div>

                {/* Or Paste URL */}
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={overlayUrlInput}
                    onChange={(e) => setOverlayUrlInput(e.target.value)}
                    placeholder="https://example.com/pattern.png"
                    className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!overlayUrlInput.trim()) return;
                      handleLiveOverlayUpdate({ appBgOverlayUrl: overlayUrlInput.trim() });
                      setOverlayUrlInput("");
                      showToast("Overlay URL applied!", "info");
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>

                {/* Sample Presets */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block mb-2">
                    Sample Pattern &amp; Clipart Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sampleOverlays.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleLiveOverlayUpdate({
                          appBgOverlayUrl: s.url,
                          appBgOverlayRepeat: s.repeat,
                          appBgOverlayBlendMode: s.mode
                        })}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-200 hover:text-white text-[11px] font-medium transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <img src={s.url} alt="" className="w-4 h-4 rounded object-cover" />
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fine Controls */}
                {appBgOverlayUrl && (
                  <div className="space-y-3 pt-3 border-t border-slate-800/80 bg-slate-900/60 p-3 rounded-xl border border-amber-500/20">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-100 mb-1">
                        <span>Overlay Opacity</span>
                        <span className="text-amber-300 font-mono font-extrabold">{Math.round(appBgOverlayOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="1.0"
                        step="0.05"
                        value={appBgOverlayOpacity}
                        onChange={(e) => handleLiveOverlayUpdate({ appBgOverlayOpacity: parseFloat(e.target.value) })}
                        onInput={(e) => handleLiveOverlayUpdate({ appBgOverlayOpacity: parseFloat(e.target.value) })}
                        className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-amber-300 block mb-1">
                          Pattern Placement &amp; Tiling
                        </label>
                        <select
                          value={appBgOverlayRepeat}
                          onChange={(e) => handleLiveOverlayUpdate({ appBgOverlayRepeat: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                        >
                          <option value="repeat">Tile Pattern (Seamless Repeat)</option>
                          <option value="no-repeat-cover">Full Screen Cover (No Repeat)</option>
                          <option value="center-contain">Center Clipart (Contain)</option>
                          <option value="top-right-contain">Top Right Clipart</option>
                          <option value="bottom-right-contain">Bottom Right Clipart</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-amber-300 block mb-1">
                          Color Blend Mode
                        </label>
                        <select
                          value={appBgOverlayBlendMode}
                          onChange={(e) => handleLiveOverlayUpdate({ appBgOverlayBlendMode: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                        >
                          <option value="normal">Normal</option>
                          <option value="soft-light">Soft Light (Subtle Glow)</option>
                          <option value="overlay">Overlay (Vibrant Contrast)</option>
                          <option value="multiply">Multiply (Darken Texture)</option>
                          <option value="screen">Screen (Light Glow)</option>
                          <option value="color-dodge">Color Dodge (Gold Highlight)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACCORDION DROPDOWN 3: 🔘 Global Application Button Styles */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-lg transition-all duration-300">
            <button
              type="button"
              onClick={() => setOpenDropdown(prev => prev === 'buttons' ? null : 'buttons')}
              className="w-full px-5 py-4 flex items-center justify-between cursor-pointer bg-slate-900/90 hover:bg-slate-850 transition select-none"
            >
              <div className="flex items-center space-x-3">
                <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">🔘</span>
                <div className="text-left">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                    Global Application Button Styles
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">Select global button theme for CTAs across SaaS platform</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {buttonStyles.find(b => b.id === appButtonStyle)?.name || "Classic Gold"}
                </span>
                <svg
                  className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${openDropdown === 'buttons' ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {openDropdown === 'buttons' && (
              <div className="p-5 border-t border-slate-800 space-y-4 animate-accordion-down bg-slate-950">
                <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                  Select Global Application Button Theme:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {buttonStyles.map((bStyle) => {
                    const isSelected = appButtonStyle === bStyle.id;
                    return (
                      <div
                        key={bStyle.id}
                        onClick={() => handleLiveButtonStyleChange(bStyle.id, bStyle.name)}
                        className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer space-y-2.5 ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/15 shadow-md ring-2 ring-amber-400/40'
                            : 'border-slate-800 bg-slate-900/80 hover:border-amber-500/40 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-slate-100">{bStyle.name}</span>
                          <span className="text-[9px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            {bStyle.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2">{bStyle.desc}</p>
                        
                        {/* Live Button Specimen */}
                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-center">
                          <div className={`px-4 py-2 text-xs transition-transform active:scale-95 text-center w-full ${bStyle.previewClass}`}>
                            <span>Preview Button CTA</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [activeSubTab, setActiveSubTab] = useState("invitations"); // invitations, customers, orders, branding
  const [expandedOrderIds, setExpandedOrderIds] = useState({});
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [shareModalData, setShareModalData] = useState({ isOpen: false, invitation: null });
  const [, setTick] = useState(0);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderIds(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleExpandAllOrders = (ordersList) => {
    const allMap = {};
    ordersList.forEach(o => { allMap[o.id] = true; });
    setExpandedOrderIds(allMap);
  };

  const handleCollapseAllOrders = () => {
    setExpandedOrderIds({});
  };

  useEffect(() => {
    const handleSync = () => setTick(t => t + 1);
    window.addEventListener("db_synced", handleSync);
    return () => window.removeEventListener("db_synced", handleSync);
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

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

  // Get data from DB
  const invitations = dbStore.getInvitations();
  const users = dbStore.getUsers().filter(u => u.role === 'customer');
  const orders = dbStore.getOrders();
  const notifications = dbStore.getNotifications();

  // Stats
  const stats = [
    { label: "Total Invitations", val: invitations.length, icon: <SvgLayers className="w-5 h-5 text-blue-400" /> },
    { label: "Total Customers", val: users.length, icon: <SvgUsers className="w-5 h-5 text-indigo-400" /> },
    { label: "Pending Orders", val: orders.filter(o => o.status === 'pending').length, icon: <SvgSparkles className="w-5 h-5 text-amber-400" /> }
  ];

  const [paymentModalOrder, setPaymentModalOrder] = useState(null);
  const [invoiceModalTarget, setInvoiceModalTarget] = useState(null);
  const [driveWebhookInput, setDriveWebhookInput] = useState(() => getDriveWebhookUrl());
  const [isSyncingAllDrive, setIsSyncingAllDrive] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isMigratingImages, setIsMigratingImages] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(null);
  const [scanStats, setScanStats] = useState(() => dbStore.scanBase64Media());

  useEffect(() => {
    const handleUpdate = () => {
      setScanStats(dbStore.scanBase64Media());
    };
    window.addEventListener("db_synced", handleUpdate);
    window.addEventListener("drive_images_migrated", handleUpdate);
    return () => {
      window.removeEventListener("db_synced", handleUpdate);
      window.removeEventListener("drive_images_migrated", handleUpdate);
    };
  }, []);

  const handleTransferAllImages = async () => {
    setIsMigratingImages(true);
    setMigrationProgress({ percent: 5, message: "Scanning database and preparing Google Drive folders..." });
    try {
      const res = await dbStore.transferAllImagesToDrive((progress) => {
        setMigrationProgress(progress);
      });
      if (res.success) {
        showToast(
          res.migratedCount > 0 
            ? `Successfully transferred ${res.migratedCount} image(s) to Google Drive! Cleaned ${(res.bytesFreed / (1024 * 1024)).toFixed(2)} MB in Firebase!`
            : "All images are already cleanly synced to Google Drive!",
          "success"
        );
      }
      setScanStats(dbStore.scanBase64Media());
      setTick(t => t + 1);
    } catch (err) {
      console.error("Migration error:", err);
      showToast(`Error transferring images: ${err.message}`, "error");
    } finally {
      setIsMigratingImages(false);
      setTimeout(() => setMigrationProgress(null), 8000);
    }
  };

  const handleTransferViaOAuth = async () => {
    setIsMigratingImages(true);
    setMigrationProgress({ percent: 5, message: "Connecting to your Google Drive via OAuth Client ID..." });
    try {
      const token = await requestGoogleDriveAuth();
      let totalTransferred = 0;
      for (let i = 0; i < invitations.length; i++) {
        const inv = invitations[i];
        const res = await transferInvitationToGoogleDriveOAuth({
          invitation: inv,
          token,
          onProgress: (p) => setMigrationProgress(p)
        });

        if (res.success && res.uploadedCount > 0) {
          totalTransferred += res.uploadedCount;
          dbStore.updateInvitation(inv.id, {
            config: res.updatedConfig,
            driveStorage: {
              ...(inv.driveStorage || {}),
              folderId: res.folderId,
              folderUrl: res.folderUrl,
              status: "live_synced",
              filesCount: res.uploadedCount,
              lastSyncedAt: new Date().toISOString()
            }
          });
        }
      }

      showToast(
        totalTransferred > 0 
          ? `Transferred ${totalTransferred} files directly into Google Drive with OAuth!` 
          : "All invitation files are already synced with Google Drive!",
        "success"
      );
      setScanStats(dbStore.scanBase64Media());
      setTick(t => t + 1);
    } catch(err) {
      console.error("OAuth transfer error:", err);
      showToast(`Google Drive transfer error: ${err.message}`, "error");
    } finally {
      setIsMigratingImages(false);
      setTimeout(() => setMigrationProgress(null), 8000);
    }
  };

  // Actions
  const handleTogglePayment = (id, currentVal) => {
    const nextVal = !currentVal;
    const inv = dbStore.getInvitationById(id);
    dbStore.updateInvitation(id, { 
      isPaid: nextVal, 
      status: nextVal ? 'paid' : 'preview',
      config: {
        ...(inv?.config || {}),
        isPaid: nextVal
      }
    });
    showToast(`Invitation marked as ${nextVal ? 'Paid (Watermark removed & 4K HD Unlocked)' : 'Unpaid (Watermarked)'}`, "success");
    setTick(t => t + 1);
  };

  const handleToggleOrderPayment = (orderId, currentPaid) => {
    if (currentPaid) {
      dbStore.markOrderAsUnpaid(orderId);
      showToast("Order marked as Unpaid (Watermark restored)", "info");
    } else {
      dbStore.markOrderAsPaid(orderId);
      showToast("Order payment approved! Watermark automatically removed for invitation!", "success");
    }
    setTick(t => t + 1);
  };

  const handleDeleteInvitation = (id) => {
    const inv = dbStore.getInvitationById(id);
    if (!inv) return;

    // RULE: Paid marked invitations are untouched and protected from deletion
    if (inv.isPaid) {
      showToast("Paid marked invitations are protected and cannot be deleted or modified.", "error");
      return;
    }

    const folderName = inv.driveStorage?.folderName || formatDriveFolderName(inv.config, inv.title);
    const folderInfo = folderName ? ` and its linked Google Drive folder "${folderName}"` : '';

    triggerDialog({
      type: 'confirm',
      title: 'Delete Invitation & Google Drive Folder',
      message: `Are you sure you want to delete "${inv.title || 'this invitation'}"? The invitation${folderInfo} in snierxgameplay@gmail.com Drive will both be deleted.`,
      confirmText: 'Delete Invitation & Drive Folder',
      onConfirm: async () => {
        const token = getStoredOAuthToken();
        const deleted = dbStore.deleteInvitation(id, token);
        if (deleted) {
          showToast("Invitation and associated Google Drive folder deleted successfully", "success");
        } else {
          showToast("Paid marked invitation is protected and cannot be deleted.", "error");
        }
        setTick(t => t + 1);
      }
    });
  };

  const handleDuplicateInvitation = (id) => {
    const inv = dbStore.getInvitationById(id);
    const defaultFolder = inv 
      ? formatDriveFolderName(inv.config, `${inv.title || 'Invitation'} (Copy)`) 
      : "New Invitation (Copy)";

    triggerDialog({
      type: 'prompt',
      title: 'Duplicate Invitation & Create Drive Folder',
      message: 'Enter title & Google Drive folder name for the new copy:',
      defaultValue: defaultFolder,
      placeholder: 'Folder name...',
      confirmText: 'Duplicate & Sync Drive',
      onConfirm: async (customName) => {
        const folderName = (customName || "").trim() || defaultFolder;
        const duplicated = dbStore.duplicateInvitation(id, folderName, null, folderName);
        if (duplicated) {
          showToast(`Invitation duplicated! Creating unique Drive folder "${folderName}"...`, "info");
          setTick(t => t + 1);

          try {
            let token = getStoredOAuthToken();
            if (!token && !getDriveWebhookUrl()) {
              token = await requestGoogleDriveAuth();
            }
            const res = await syncDriveFolder({ invitation: duplicated, customFolderName: folderName, token });
            if (res && res.folderId) {
              dbStore.updateInvitation(duplicated.id, {
                driveStorage: { ...(duplicated.driveStorage || {}), ...res }
              });
              showToast(`Google Drive folder "${folderName}" created and linked!`, "success");
              setTick(t => t + 1);
            }
          } catch (e) {
            console.warn("Drive sync after duplicate skipped or failed:", e);
          }
        } else {
          showToast("Failed to duplicate invitation", "error");
        }
      }
    });
  };

  const handleSyncSingleDrive = (inv) => {
    const currentName = inv.driveStorage?.folderName || formatDriveFolderName(inv.config, inv.title);
    triggerDialog({
      type: 'prompt',
      title: 'Create / Sync Unique Google Drive Folder',
      message: `Enter Google Drive folder name for "${inv.title || 'this invitation'}" inside DS_Envite_DataCentre:`,
      defaultValue: currentName,
      placeholder: 'e.g. Suman & Vishal (Neamatpur)',
      confirmText: 'Create / Sync in Drive',
      onConfirm: async (customName) => {
        const folderName = (customName || "").trim() || currentName;
        showToast(`Syncing folder "${folderName}" with Google Drive...`, "info");
        try {
          let token = getStoredOAuthToken();
          if (!token && !getDriveWebhookUrl()) {
            token = await requestGoogleDriveAuth();
          }
          const res = await syncDriveFolder({ invitation: inv, customFolderName: folderName, token });
          if (res && res.folderId) {
            dbStore.updateInvitation(inv.id, {
              driveStorage: {
                ...(inv.driveStorage || {}),
                folderId: res.folderId,
                folderName: res.folderName || folderName,
                folderUrl: res.folderUrl,
                status: "live_synced",
                lastSyncedAt: new Date().toISOString()
              }
            });
            showToast(`Google Drive folder "${folderName}" successfully created & linked!`, "success");
            setTick(t => t + 1);
          } else {
            showToast("Failed to create folder on Google Drive. Please ensure Google Drive is authorized.", "error");
          }
        } catch (err) {
          showToast(`Drive sync error: ${err.message}`, "error");
        }
      }
    });
  };

  const handleAcceptOrder = (order) => {
    dbStore.updateOrderStatus(order.id, "accepted");
    // Create new invitation based on selected preset config
    const preset = dbStore.getPresetById(order.presetId);
    const config = preset ? preset.config : {};
    
    // Set custom couple name from order details
    const orderDetails = order.details || {};
    const finalConfig = {
      ...config,
      brideName: orderDetails.brideName || config.brideName || "Bride",
      groomName: orderDetails.groomName || config.groomName || "Groom",
      weddingDate: orderDetails.weddingDate ? `${orderDetails.weddingDate}T16:00:00` : config.weddingDate,
      religionKey: orderDetails.religion || config.religionKey || "secular"
    };

    dbStore.createInvitation(
      order.customerId, 
      `${finalConfig.brideName} & ${finalConfig.groomName}'s Wedding`,
      finalConfig,
      false, // unpaid initially
      "preview"
    );

    showToast("Order accepted & invitation drafted! Navigate to editor to customize.", "success");
    setTick(t => t + 1);
  };

  const handleRejectOrder = (id) => {
    triggerDialog({
      type: 'confirm',
      title: 'Reject Order Request',
      message: 'Are you sure you want to reject this order request?',
      confirmText: 'Reject',
      onConfirm: () => {
        dbStore.updateOrderStatus(id, "rejected");
        showToast("Order rejected", "info");
        setTick(t => t + 1);
      }
    });
  };

  const handleDeleteOrder = (id) => {
    triggerDialog({
      type: 'confirm',
      title: 'Move Order Request to Archive',
      message: 'Are you sure you want to delete this order request? It will be held in the Archive for 2 days. Admin can recover it within 2 days before permanent deletion from the database.',
      confirmText: 'Move to Archive',
      onConfirm: () => {
        dbStore.deleteOrder(id);
        showToast("Order request moved to Archive (Retained for 2 days)", "success");
        setTick(t => t + 1);
      }
    });
  };

  const handleDeleteCustomer = (id, displayName) => {
    triggerDialog({
      type: 'confirm',
      title: 'Move Customer Account to Archive',
      message: `Are you sure you want to delete account for "${displayName}"? All associated invitations and orders will also be held in the Archive for 2 days.`,
      confirmText: 'Move to Archive',
      onConfirm: () => {
        try {
          dbStore.deleteUser(id);
          showToast(`Customer account "${displayName}" moved to Archive (Retained for 2 days)`, "success");
          setTick(t => t + 1);
        } catch (err) {
          showToast(err.message || "Failed to delete customer", "error");
        }
      }
    });
  };

  // Theme Preset Management
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
      message: `Are you sure you want to permanently delete theme preset "${preset.title}" from the database? It will not be recovered.${warningMsg}`,
      confirmText: 'Delete Permanently',
      onConfirm: () => {
        dbStore.deletePreset(preset.id);
        showToast(`Theme preset "${preset.title}" permanently deleted from database`, "success");
        setTick(t => t + 1);
      }
    });
  };

  const handleCopyLink = (id, paid, invObj = null) => {
    const targetInv = invObj || invitations.find(i => i.id === id);
    setShareModalData({
      isOpen: true,
      invitation: targetInv || { id, isPaid: paid }
    });
  };

  return (
    <div className="min-h-screen p-6 bg-[var(--bg-app)] text-[var(--text-body)] space-y-8 font-sans admin-dashboard-container">
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: "" })} />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-cinzel tracking-wider text-amber-100 font-extrabold drop-shadow-md">Admin Dashboard</h1>
        </div>
        <Link
          to="/admin/editor"
          className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 shadow-lg hover:shadow-amber-500/10 active:scale-98 transition flex items-center justify-center space-x-1.5 self-start md:self-center"
        >
          <SvgPlus className="w-4 h-4 text-slate-950" />
          <span className="text-slate-950 font-extrabold">Draft New Invitation</span>
        </Link>
      </div>

      {/* Stats Cards - ALWAYS Single Row in Any Mode */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="p-3 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur shadow-md flex items-center space-x-2.5 sm:space-x-4">
            <div className="p-2 sm:p-3.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
              {s.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-amber-300 font-bold tracking-wider uppercase truncate">{s.label}</p>
              <h3 className="text-lg sm:text-2xl font-bold font-mono text-slate-100 mt-0.5">{s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Tabs Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-2xl backdrop-blur-md">
        
        {/* Navigation Tabs - ALWAYS Single Row in Any Mode (Laptop, Tablet, Phone) */}
        <div 
          className="single-row-tabs-bar flex flex-row flex-nowrap items-center w-full overflow-x-auto scrollbar-none p-1.5 sm:p-2 bg-slate-950/90 border-b border-slate-800 rounded-t-2xl"
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflowX: 'auto',
            overflowY: 'hidden',
            width: '100%',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {[
            { id: "invitations", label: "Invitations List", count: invitations.length },
            { id: "orders", label: "Incoming Orders", count: orders.filter(o => o.status === 'pending').length },
            { id: "customers", label: "Customer Accounts", count: users.length },
            { id: "themes", label: "Themes & Presets", count: dbStore.getPresets().length },
            { id: "drive", label: "Google Drive Cloud" },
            { id: "branding", label: "Logo & Branding" },
            { id: "archive", label: "Archive (Trash)", count: dbStore.getArchive().length }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`single-row-tab-btn shrink-0 text-[10px] sm:text-xs px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center space-x-1 sm:space-x-1.5 ${
                activeSubTab === tab.id 
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold shadow-md' 
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
              style={{
                flexShrink: 0,
                flexGrow: 0,
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono border ${
                  activeSubTab === tab.id
                    ? 'bg-slate-950 text-amber-400 border-amber-500/40'
                    : 'bg-slate-950 text-amber-400 border-amber-500/20'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          
          {/* 1. INVITATIONS TAB */}
          {activeSubTab === "invitations" && (
            <div className="overflow-x-auto">
              {invitations.length === 0 ? (
                <div className="text-center py-12 text-slate-200 font-medium text-sm">No invitations found. Draft one above!</div>
              ) : (
                <table className="w-full text-left text-xs border-collapse min-w-[970px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-amber-300 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 font-bold">Title / Couple</th>
                      <th className="pb-3 font-bold">Customer</th>
                      <th className="pb-3 font-bold">Status</th>
                      <th className="pb-3 font-bold text-center">Payment</th>
                      <th className="pb-3 font-bold text-center">RSVPs</th>
                      <th className="pb-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/50">
                    {invitations.map(inv => {
                      const cust = dbStore.getUserById(inv.customerId);
                      return (
                        <tr key={inv.id} className="hover:bg-slate-850/10 transition-colors">
                          <td className="py-4">
                            <div className="dashboard-cell-pill">
                              <p className="font-semibold text-slate-100 text-sm">{inv.title}</p>
                              <p className="text-[10px] text-amber-200/90 font-medium mt-0.5">
                                🎨 {inv.config.primaryColor} • {inv.config.religionKey.toUpperCase()}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 text-slate-200">
                            <div className="dashboard-cell-pill">
                              {cust ? (
                                <div>
                                  <p className="font-semibold text-slate-100">{cust.displayName}</p>
                                  <p className="text-[10px] text-amber-200/90 font-mono">{cust.username}</p>
                                </div>
                              ) : (
                                <span className="text-amber-200/70 italic">Unassigned</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="dashboard-cell-pill items-center justify-center">
                              <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] ${
                                inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                inv.status === 'preview' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-slate-800 text-slate-400'
                              }`}>
                                {inv.status}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => handleTogglePayment(inv.id, inv.isPaid)}
                              className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider text-[9px] transition cursor-pointer flex items-center justify-center space-x-1 mx-auto shadow-sm ${
                                inv.isPaid
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                              }`}
                              title={inv.isPaid ? "Click to revoke payment status & restore watermark" : "Click to mark as paid and remove watermark"}
                            >
                              <span>{inv.isPaid ? "✓ Paid (HD Unlocked)" : "Mark Paid (Unlock HD)"}</span>
                            </button>
                          </td>
                          <td className="py-4 text-center">
                            <div className="dashboard-cell-pill font-mono font-semibold mx-auto justify-center">
                              {inv.rsvps?.length || 0}
                            </div>
                          </td>
                          <td className="py-4 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => handleCopyLink(inv.id, inv.isPaid, inv)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition inline-flex items-center space-x-1"
                              title="Share Independent Invitation Link (No Login Required)"
                            >
                              <SvgCopy className="w-3.5 h-3.5" />
                              <span>Share</span>
                            </button>
                            <button
                              onClick={() => {
                                downloadStandaloneHtmlWebsite(inv.config, inv);
                                showToast("Standalone HTML Website downloaded! Opens directly without any login.", "success");
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold transition inline-flex items-center space-x-1"
                              title="Download Independent HTML Website (Zero Login, Zero Server Dependencies)"
                            >
                              <span>🌐 HTML</span>
                            </button>
                            {inv.driveStorage?.folderId ? (
                              <a
                                href={inv.driveStorage.folderUrl || `https://drive.google.com/drive/folders/${inv.driveStorage.folderId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded bg-slate-900 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 hover:border-emerald-400 transition inline-flex items-center"
                                title={`Open Google Drive Folder: ${inv.driveStorage?.folderName || formatDriveFolderName(inv.config, inv.title)}`}
                              >
                                <span className="text-xs">📁</span>
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSyncSingleDrive(inv)}
                                className="p-2 rounded bg-slate-900 border border-amber-500/40 text-amber-400 hover:text-amber-300 hover:border-amber-400 transition inline-flex items-center cursor-pointer"
                                title="No Google Drive folder linked yet! Click to name & create folder in Drive"
                              >
                                <span className="text-xs font-bold">📁+</span>
                              </button>
                            )}
                            <Link
                              to={`/invite/${dbStore.getInvitationShareSlug(inv)}`}
                              target="_blank"
                              className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition inline-flex items-center"
                              title="View Invitation"
                            >
                              <SvgEye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/admin/editor/${inv.id}`}
                              className="p-2 rounded bg-slate-900 border border-slate-800 text-amber-500/80 hover:text-amber-400 transition inline-flex items-center"
                              title="Edit Customisation"
                            >
                              <SvgEdit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDuplicateInvitation(inv.id)}
                              className="p-2 rounded bg-slate-900 border border-slate-800 text-sky-400 hover:text-sky-300 transition inline-flex items-center cursor-pointer"
                              title="Duplicate / Clone Invitation"
                            >
                              <SvgCopy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (inv.isPaid) {
                                  showToast("Paid marked invitations are protected and cannot be deleted.", "info");
                                  return;
                                }
                                handleDeleteInvitation(inv.id);
                              }}
                              className={`p-2 rounded border transition ${
                                inv.isPaid
                                  ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed opacity-40'
                                  : 'bg-slate-900 border-slate-800 text-rose-500/80 hover:text-rose-500 cursor-pointer'
                              }`}
                              title={inv.isPaid ? "Paid marked invitations are protected from deletion" : "Delete Invitation & Google Drive Folder"}
                              disabled={inv.isPaid}
                            >
                              <SvgTrash className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* 2. ORDERS TAB */}
          {activeSubTab === "orders" && (() => {
            const filteredOrders = orders.filter(order => {
              const cust = dbStore.getUserById(order.customerId);
              const preset = dbStore.getPresetById(order.presetId);
              const searchLower = orderSearchQuery.toLowerCase().trim();
              
              if (orderStatusFilter === 'pending' && order.status !== 'pending') return false;
              if (orderStatusFilter === 'accepted' && order.status !== 'accepted' && !order.isPaid) return false;
              if (orderStatusFilter === 'paid' && !order.isPaid) return false;
              if (orderStatusFilter === 'rejected' && order.status !== 'rejected') return false;

              if (searchLower) {
                const matchesId = String(order.id).toLowerCase().includes(searchLower);
                const matchesCust = (cust?.displayName || '').toLowerCase().includes(searchLower);
                const matchesEmail = (order.userEmail || cust?.email || '').toLowerCase().includes(searchLower);
                const matchesBride = (order.details?.brideName || '').toLowerCase().includes(searchLower);
                const matchesGroom = (order.details?.groomName || '').toLowerCase().includes(searchLower);
                const matchesPreset = (preset?.title || '').toLowerCase().includes(searchLower);
                return matchesId || matchesCust || matchesEmail || matchesBride || matchesGroom || matchesPreset;
              }
              return true;
            });

            return (
              <div className="space-y-4">
                {/* Orders Toolbar & Filters Header */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md">
                  {/* Search Input & Status Pills */}
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    <div className="relative flex-1 min-w-[220px] max-w-md">
                      <input
                        type="text"
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        placeholder="🔍 Search orders by Customer, Order ID, Couple or Email..."
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {[
                        { id: 'all', label: `All (${orders.length})` },
                        { id: 'pending', label: `Pending (${orders.filter(o => o.status === 'pending').length})` },
                        { id: 'accepted', label: 'Accepted ✓' },
                        { id: 'paid', label: `Paid (${orders.filter(o => o.isPaid).length})` },
                        { id: 'rejected', label: 'Rejected ✖' }
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setOrderStatusFilter(f.id)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            orderStatusFilter === f.id
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expand / Collapse All Controls */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleExpandAllOrders(filteredOrders)}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-amber-300 text-xs font-bold transition cursor-pointer"
                    >
                      📂 Expand All
                    </button>
                    <button
                      type="button"
                      onClick={handleCollapseAllOrders}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer"
                    >
                      📁 Collapse All
                    </button>
                  </div>
                </div>

                {/* Orders Accordion Dropdown List */}
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm bg-slate-900/40 rounded-2xl border border-slate-800">
                    No orders match your filter criteria.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map(order => {
                      const cust = dbStore.getUserById(order.customerId);
                      const preset = dbStore.getPresetById(order.presetId);
                      const isPending = order.status === 'pending';
                      const finalPrice = Math.round((order.price !== undefined ? order.price : 999) - ((order.price !== undefined ? order.price : 999) * (order.discountPercent || 0) / 100));
                      const isExpanded = !!expandedOrderIds[order.id];

                      return (
                        <div
                          key={order.id}
                          className={`rounded-2xl border transition-all duration-300 shadow-xl overflow-hidden ${
                            isPending
                              ? 'bg-slate-950/90 border-amber-500/40 hover:border-amber-500/70'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* 🟢 MAIN ORDER DETAIL ACCORDION HEADER BAR */}
                          <div
                            onClick={() => toggleOrderExpand(order.id)}
                            className="p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 cursor-pointer bg-slate-900/90 hover:bg-slate-850 select-none transition"
                          >
                            {/* Left: Status Icon, Order ID & Creation Date */}
                            <div className="flex items-center space-x-3.5 min-w-[210px]">
                              <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
                                order.isPaid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                isPending ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                order.status === 'rejected' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                                'bg-slate-800 border-slate-700 text-slate-300'
                              }`}>
                                <span className="text-base font-bold">{order.isPaid ? '⚡' : isPending ? '⏳' : order.status === 'rejected' ? '✖' : '✓'}</span>
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-extrabold text-slate-100 text-sm tracking-wide" title={`Order #${order.id}`}>
                                    Order #{order.id}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] ${
                                    order.isPaid || order.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                                    order.status === 'pending' ? 'bg-amber-400/20 text-amber-300 border border-amber-500/40' :
                                    order.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                                    'bg-slate-800 text-slate-400'
                                  }`}>
                                    {order.isPaid ? 'Accepted & Paid' : order.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                  📅 {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            </div>

                            {/* Center: Main Order Info Summary (Customer, Preset, Couple, Marriage Date) */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 text-xs px-2 border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-4">
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">👤 Customer</span>
                                <span className="text-amber-100 font-bold block truncate">{cust ? cust.displayName : 'Guest'}</span>
                                <span className="text-slate-400 text-[10px] block truncate font-mono">{order.userEmail || cust?.email || 'N/A'}</span>
                              </div>

                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">🎨 Preset</span>
                                <span className="text-slate-100 font-bold block truncate">{preset ? preset.title : 'Custom Design'}</span>
                              </div>

                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">💒 Couple</span>
                                <span className="text-slate-100 font-bold block truncate">{order.details?.brideName || 'Bride'} &amp; {order.details?.groomName || 'Groom'}</span>
                              </div>

                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">📅 Marriage Date</span>
                                <span className="text-slate-100 font-bold block">{order.details?.weddingDate || 'TBD'}</span>
                              </div>
                            </div>

                            {/* Right: Price Tag, Quick Actions & Animated Chevron */}
                            <div className="flex items-center space-x-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                              <div className="text-right">
                                <span className="text-[9px] uppercase font-bold text-slate-400 block">Payable</span>
                                <span className="text-amber-300 font-mono font-black text-base">
                                  ₹{finalPrice}
                                </span>
                              </div>

                              {/* Quick Action Buttons */}
                              <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const presetObj = dbStore.getPresetById(order.presetId) || dbStore.getPresets()[0];
                                    const tempConfig = {
                                      ...(presetObj?.config || {}),
                                      brideName: order.details?.brideName || presetObj?.config?.brideName || "Bride",
                                      groomName: order.details?.groomName || presetObj?.config?.groomName || "Groom",
                                      brideFatherName: order.details?.brideFatherName || "",
                                      brideMotherName: order.details?.brideMotherName || "",
                                      groomFatherName: order.details?.groomFatherName || "",
                                      groomMotherName: order.details?.groomMotherName || "",
                                      weddingDate: order.details?.weddingDate ? `${order.details.weddingDate}T16:00:00` : presetObj?.config?.weddingDate,
                                      venueName: order.details?.venueName || "",
                                      venueAddress: order.details?.venueAddress || "",
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
                                    sessionStorage.setItem("preview_preset_id", order.presetId || presetObj.id);
                                    window.open(`/invite/demo?preset=${order.presetId || presetObj.id}&preview=true`, '_blank');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition flex items-center space-x-1 border border-amber-500/30 cursor-pointer"
                                  title="Preview Invitation Demo"
                                >
                                  <SvgEye className="w-3.5 h-3.5 text-amber-400" />
                                  <span className="hidden sm:inline">Preview</span>
                                </button>

                                {isPending && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleRejectOrder(order.id)}
                                      className="px-2 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-[10px] font-bold uppercase transition cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAcceptOrder(order)}
                                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-bold uppercase transition flex items-center space-x-1 cursor-pointer"
                                    >
                                      <SvgCheck className="w-3.5 h-3.5" />
                                      <span>Accept</span>
                                    </button>
                                  </>
                                )}
                              </div>

                              {/* Rotating Chevron Icon */}
                              <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-400">
                                <svg
                                  className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                  fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* 🔴 EXPANDED ACCORDION DETAILS BODY */}
                          {isExpanded && (
                            <div className="p-5 border-t border-slate-800 bg-slate-950 animate-accordion-down space-y-5">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* Column 1: Complete Customer & Event Information */}
                                <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/20 space-y-3">
                                  <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                                    <h5 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300">
                                      📋 Full Order Specifications
                                    </h5>
                                    <span className="text-[10px] text-slate-400 font-mono">ID: {order.id}</span>
                                  </div>

                                  <div className="space-y-2 text-xs">
                                    <div>
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">👤 Customer Account</span>
                                      <p className="text-slate-100 font-bold">{cust ? cust.displayName : 'Guest Customer'}</p>
                                      <p className="text-slate-400 text-[11px] font-mono">{order.userEmail || cust?.email || 'No email provided'}</p>
                                    </div>

                                    <div className="border-t border-slate-800/80 pt-2">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">🎨 Theme Preset</span>
                                      <p className="text-slate-100 font-bold">{preset ? preset.title : 'Custom Design Preset'}</p>
                                      <p className="text-slate-400 text-[10px]">{preset?.description || 'Standard digital wedding invitation package'}</p>
                                    </div>

                                    <div className="border-t border-slate-800/80 pt-2">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">💒 Couple Details</span>
                                      <p className="text-slate-100 font-bold text-sm">👰 {order.details?.brideName || 'Bride'} &amp; 🤵 {order.details?.groomName || 'Groom'}</p>
                                      
                                      {(order.details?.brideFatherName || order.details?.brideMotherName) && (
                                        <p className="text-slate-300 text-[11px] mt-1">
                                          Bride's Parents: <span className="text-amber-200 font-semibold">{order.details?.brideFatherName} {order.details?.brideMotherName ? `& ${order.details.brideMotherName}` : ''}</span>
                                        </p>
                                      )}
                                      {(order.details?.groomFatherName || order.details?.groomMotherName) && (
                                        <p className="text-slate-300 text-[11px] mt-0.5">
                                          Groom's Parents: <span className="text-amber-200 font-semibold">{order.details?.groomFatherName} {order.details?.groomMotherName ? `& ${order.details.groomMotherName}` : ''}</span>
                                        </p>
                                      )}
                                    </div>

                                    <div className="border-t border-slate-800/80 pt-2">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">📅 Marriage Schedule</span>
                                      <p className="text-slate-100 font-bold">Date: {order.details?.weddingDate || 'TBD'}</p>
                                    </div>

                                    {(order.details?.venueName || order.details?.venueAddress) && (
                                      <div className="border-t border-slate-800/80 pt-2">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">📍 Event Venue</span>
                                        <p className="text-slate-100 font-semibold">{order.details?.venueName}</p>
                                        {order.details?.venueAddress && <p className="text-slate-400 text-[11px]">{order.details.venueAddress}</p>}
                                        {order.details?.venueMapLink && (
                                          <a href={order.details.venueMapLink} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline font-bold text-xs inline-flex items-center space-x-1 mt-1">
                                            <span>🗺️ Open Google Maps Location</span>
                                          </a>
                                        )}
                                      </div>
                                    )}

                                    {order.details?.contact && (
                                      <div className="border-t border-slate-800/80 pt-2">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">📞 Contact Phone</span>
                                        <p className="text-slate-100 font-bold font-mono">{order.details.contact}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Column 2: Pricing & Payment Control Panel */}
                                <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-4 flex flex-col justify-between">
                                  <div className="space-y-3">
                                    <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                                      <h5 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300">
                                        💳 Pricing &amp; Payment Status
                                      </h5>
                                      <span className="text-amber-300 font-mono font-black text-base">
                                        ₹{finalPrice}
                                        {order.discountPercent > 0 && (
                                          <span className="ml-1 text-[10px] text-emerald-400 font-bold">({order.discountPercent}% OFF)</span>
                                        )}
                                      </span>
                                    </div>

                                    {/* Base & Discount Inputs */}
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                      <div>
                                        <label className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold mb-1">Base Price (₹)</label>
                                        <input
                                          type="number"
                                          min="0"
                                          value={order.price !== undefined ? order.price : 999}
                                          onChange={(e) => {
                                            const p = parseFloat(e.target.value) || 0;
                                            dbStore.updateOrderPricing(order.id, p, order.discountPercent || 0);
                                          }}
                                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] uppercase tracking-wider text-amber-400 block font-bold mb-1">Discount (%)</label>
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          value={order.discountPercent !== undefined ? order.discountPercent : 0}
                                          onChange={(e) => {
                                            const d = parseFloat(e.target.value) || 0;
                                            dbStore.updateOrderPricing(order.id, order.price !== undefined ? order.price : 999, d);
                                          }}
                                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-amber-300 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                                        />
                                      </div>
                                    </div>

                                    {/* Payment Modal & Status Toggle Buttons */}
                                    <div className="space-y-2 pt-2">
                                      <button
                                        type="button"
                                        onClick={() => setPaymentModalOrder(order)}
                                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-extrabold transition flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                                      >
                                        <span>📱 View Payment QR Code</span>
                                      </button>

                                      <div className="flex items-center space-x-2">
                                        <button
                                          type="button"
                                          onClick={() => handleToggleOrderPayment(order.id, order.isPaid)}
                                          className={`flex-1 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer text-center ${
                                            order.isPaid
                                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                                          }`}
                                        >
                                          {order.isPaid ? '✓ Payment Approved (Paid)' : '⚡ Mark Order as Paid'}
                                        </button>

                                        {order.isPaid && (
                                          <button
                                            type="button"
                                            onClick={() => setInvoiceModalTarget(order)}
                                            className="px-3 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold transition flex items-center justify-center cursor-pointer"
                                            title="View / Print Official Payment Invoice"
                                          >
                                            <span>📄 Invoice</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Column 3: Order Actions & Status Controls */}
                                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between">
                                  <div className="space-y-3">
                                    <div className="border-b border-slate-800 pb-2">
                                      <h5 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300">
                                        ⚡ Admin Order Actions
                                      </h5>
                                    </div>

                                    <div className="space-y-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const presetObj = dbStore.getPresetById(order.presetId) || dbStore.getPresets()[0];
                                          const tempConfig = {
                                            ...(presetObj?.config || {}),
                                            brideName: order.details?.brideName || presetObj?.config?.brideName || "Bride",
                                            groomName: order.details?.groomName || presetObj?.config?.groomName || "Groom",
                                            brideFatherName: order.details?.brideFatherName || "",
                                            brideMotherName: order.details?.brideMotherName || "",
                                            groomFatherName: order.details?.groomFatherName || "",
                                            groomMotherName: order.details?.groomMotherName || "",
                                            weddingDate: order.details?.weddingDate ? `${order.details.weddingDate}T16:00:00` : presetObj?.config?.weddingDate,
                                            venueName: order.details?.venueName || "",
                                            venueAddress: order.details?.venueAddress || "",
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
                                          sessionStorage.setItem("preview_preset_id", order.presetId || presetObj.id);
                                          window.open(`/invite/demo?preset=${order.presetId || presetObj.id}&preview=true`, '_blank');
                                        }}
                                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition flex items-center justify-center space-x-2 border border-amber-500/40 cursor-pointer shadow-md"
                                      >
                                        <SvgEye className="w-4 h-4 text-amber-400" />
                                        <span>Open Live Invitation Preview</span>
                                      </button>

                                      {isPending && (
                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                          <button
                                            type="button"
                                            onClick={() => handleRejectOrder(order.id)}
                                            className="py-2 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                                          >
                                            Reject Request
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleAcceptOrder(order)}
                                            className="py-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-extrabold uppercase tracking-wider transition flex items-center justify-center space-x-1 cursor-pointer shadow-md"
                                          >
                                            <SvgCheck className="w-4 h-4" />
                                            <span>Accept Order</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="pt-3 border-t border-slate-800">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteOrder(order.id)}
                                      className="w-full py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-400 text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer"
                                    >
                                      <SvgTrash className="w-3.5 h-3.5 text-rose-400" />
                                      <span>Delete Order Record</span>
                                    </button>
                                  </div>
                                </div>

                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* 3. CUSTOMERS TAB */}
          {activeSubTab === "customers" && (
            <div className="overflow-x-auto">
              {users.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">No customers registered yet.</div>
              ) : (
                <table className="w-full text-left text-xs border-collapse min-w-[970px]">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 font-semibold">Display Name</th>
                      <th className="pb-3 font-semibold">Username / Email</th>
                      <th className="pb-3 font-semibold text-center">Invitations Assigned</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/50">
                    {users.map(u => {
                      const userInvs = invitations.filter(inv => inv.customerId === u.id);
                      return (
                        <tr key={u.id} className="hover:bg-slate-850/10 transition-colors">
                          <td className="py-4">
                            <div className="dashboard-cell-pill font-semibold text-slate-200 text-sm">{u.displayName}</div>
                          </td>
                          <td className="py-4">
                            <div className="dashboard-cell-pill font-mono text-slate-400">{u.username}</div>
                          </td>
                          <td className="py-4 text-center">
                            <div className="dashboard-cell-pill font-semibold font-mono text-amber-400 mx-auto justify-center">{userInvs.length}</div>
                          </td>
                          <td className="py-4 text-right space-x-1.5 whitespace-nowrap">
                            <Link
                              to="/admin/editor"
                              state={{ assignTo: u.id }}
                              className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition text-[10px] font-semibold uppercase tracking-wider inline-flex items-center space-x-1"
                            >
                              <SvgPlus className="w-3 h-3" />
                              <span>Draft Invite</span>
                            </Link>
                            <button
                              onClick={() => handleDeleteCustomer(u.id, u.displayName)}
                              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 transition inline-flex items-center justify-center align-middle"
                              title="Delete Customer Account"
                            >
                              <SvgTrash className="w-4 h-4 text-rose-500" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* 4. THEMES TAB */}
          {activeSubTab === "themes" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-cinzel text-base font-bold text-amber-200">Preset Theme Management</h3>
                  <p className="text-xs text-slate-400">Edit design info, color scheme, background images, or delete unused theme presets</p>
                </div>
                <button
                  onClick={handleOpenCreateTheme}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center space-x-1.5 self-start sm:self-auto"
                >
                  <SvgPlus className="w-4 h-4 text-slate-950" />
                  <span>Create New Theme</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dbStore.getPresets().map(preset => {
                  const cfg = preset.config || {};
                  const hex = (cfg.primaryColor || "#0b1329").replace('#', '');
                  const r = parseInt(hex.substring(0, 2), 16) || 0;
                  const g = parseInt(hex.substring(2, 4), 16) || 0;
                  const b = parseInt(hex.substring(4, 6), 16) || 0;
                  const isLightBg = ((r * 299 + g * 587 + b * 114) / 1000) > 155;

                  return (
                    <div key={preset.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition">
                      {/* Card Thumbnail matching Invitation Design */}
                      <div 
                        className="h-44 p-4 flex flex-col justify-between relative overflow-hidden bg-cover bg-center border-b border-slate-800 group"
                        style={{ 
                          backgroundColor: cfg.primaryColor || '#0b1329',
                          backgroundImage: `linear-gradient(${isLightBg ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.45)'}, ${isLightBg ? 'rgba(255,255,255,0.70)' : 'rgba(0,0,0,0.75)'}), url("${preset.thumbnail || cfg.heroImage || '/bg_floral_pink.jpg'}")`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <div 
                          className="absolute inset-2.5 border rounded-xl pointer-events-none transition-all duration-300 group-hover:scale-95"
                          style={{ borderColor: cfg.accentGold || '#f59e0b', opacity: 0.6 }}
                        />

                        <div className="flex justify-between items-center z-10">
                          <span className="text-base font-bold drop-shadow-md" style={{ color: isLightBg ? '#8a2b3f' : (cfg.accentGold || '#f59e0b') }}>
                            {cfg.customSacredSymbol || '✦'}
                          </span>
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
                        </div>

                        {/* High contrast Headline & Couple Name Container */}
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

                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-cinzel text-sm font-extrabold text-slate-100 tracking-wide">{preset.title}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-extrabold border border-amber-500/25 uppercase tracking-wider">
                            {preset.religion || 'secular'}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <Link
                            to={`/invite/demo?preset=${preset.id}&preview=true`}
                            target="_blank"
                            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-[10px] font-semibold transition flex items-center space-x-1"
                          >
                            <SvgEye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Preview</span>
                          </Link>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenEditTheme(preset)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-[10px] font-bold uppercase tracking-wider transition flex items-center space-x-1"
                            >
                              <SvgEdit className="w-3 h-3" />
                              <span>Edit Theme</span>
                            </button>
                            <button
                              onClick={() => handleDeletePreset(preset)}
                              className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 transition flex items-center justify-center"
                              title="Delete Theme"
                            >
                              <SvgTrash className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. BRANDING TAB */}
          {activeSubTab === "branding" && (
            <LogoBrandingManager showToast={showToast} />
          )}

          {/* 6. ARCHIVE TAB */}
          {activeSubTab === "archive" && (() => {
            const archiveItems = dbStore.getArchive();

            const formatTimeRemaining = (expiresAt) => {
              if (!expiresAt) return "2 days remaining";
              const diffMs = new Date(expiresAt).getTime() - Date.now();
              if (diffMs <= 0) return "Expired (Purging...)";
              const hours = Math.floor(diffMs / (1000 * 60 * 60));
              const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              if (hours >= 24) {
                const days = (hours / 24).toFixed(1);
                return `${days} days remaining`;
              }
              return `${hours}h ${mins}m remaining`;
            };

            const handleRestore = (archiveId, title) => {
              const success = dbStore.restoreArchivedItem(archiveId);
              if (success) {
                showToast(`"${title}" restored successfully from Archive!`, "success");
                setTick(t => t + 1);
              } else {
                showToast("Failed to restore item.", "error");
              }
            };

            const handlePermanentDelete = (archiveId, title) => {
              triggerDialog({
                type: 'confirm',
                title: 'Permanently Purge Item',
                message: `Are you sure you want to PERMANENTLY delete "${title}" right now? This CANNOT be undone!`,
                confirmText: 'Purge Permanently',
                onConfirm: () => {
                  dbStore.permanentlyDeleteArchivedItem(archiveId);
                  showToast(`"${title}" purged permanently from database.`, "info");
                  setTick(t => t + 1);
                }
              });
            };

            const handleClearAllArchive = () => {
              if (archiveItems.length === 0) return;
              triggerDialog({
                type: 'confirm',
                title: 'Empty Archive Bin',
                message: `Are you sure you want to PERMANENTLY delete ALL ${archiveItems.length} item(s) in the Archive? This action is irreversible!`,
                confirmText: 'Empty Entire Trash',
                onConfirm: () => {
                  dbStore.clearArchive();
                  showToast("Archive bin emptied permanently.", "info");
                  setTick(t => t + 1);
                }
              });
            };

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-amber-500/20">
                  <div>
                    <h3 className="font-cinzel text-base font-bold text-amber-200 flex items-center gap-2">
                      <SvgTrash className="w-5 h-5 text-amber-400" />
                      <span>Admin Archive & Recovery Center</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Items deleted by Admin are safely held here for <strong className="text-amber-300">2 days (48 hours)</strong>. Admin can recover them within 2 days. After 2 days, items are automatically purged permanently with no recovery possible.
                    </p>
                  </div>
                  {archiveItems.length > 0 && (
                    <button
                      onClick={handleClearAllArchive}
                      className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 flex items-center space-x-1.5"
                    >
                      <SvgTrash className="w-4 h-4 text-rose-400" />
                      <span>Empty Trash Now</span>
                    </button>
                  )}
                </div>

                {archiveItems.length === 0 ? (
                  <div className="text-center py-16 bg-slate-950/40 rounded-xl border border-slate-800 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-900 text-slate-500 flex items-center justify-center mx-auto border border-slate-800">
                      <SvgTrash className="w-6 h-6" />
                    </div>
                    <p className="text-slate-300 font-medium text-sm">Archive is clean! No deleted items pending recovery.</p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Any deleted theme presets, invitations, customer accounts, or orders will stay here for 2 days before permanent database erasure.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {archiveItems.map(item => {
                      const timeStr = formatTimeRemaining(item.expiresAt);
                      const typeLabel = 
                        item.itemType === 'preset' ? '🎨 Theme Preset' :
                        item.itemType === 'invitation' ? '📜 Invitation' :
                        item.itemType === 'order' ? '🛒 Order Request' :
                        item.itemType === 'user' ? '👤 Customer Account' :
                        item.itemType === 'envelopePreset' ? '✉ Envelope Theme' :
                        item.itemType === 'musicPreset' ? '🎵 Music Preset' :
                        '📦 Data Object';

                      return (
                        <div key={item.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition shadow-lg">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-amber-500/30">
                                {typeLabel}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {new Date(item.archivedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="font-semibold text-slate-100 text-sm line-clamp-1">{item.title}</h4>
                            <p className="text-[10px] text-slate-400 font-mono">Original ID: {item.originalId}</p>
                            
                            <div className="pt-2 flex items-center space-x-1.5 text-xs text-amber-400 font-medium">
                              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                              <span>{timeStr}</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-850 flex items-center justify-between gap-2">
                            <button
                              onClick={() => handleRestore(item.id, item.title)}
                              className="flex-1 py-2 px-3 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center justify-center space-x-1.5"
                            >
                              <SvgCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Restore</span>
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(item.id, item.title)}
                              className="py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center justify-center space-x-1.5"
                              title="Delete Permanently Right Now"
                            >
                              <SvgTrash className="w-3.5 h-3.5 text-rose-400" />
                              <span>Purge</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* 7. GOOGLE DRIVE CLOUD STORAGE TAB */}
          {activeSubTab === "drive" && (
            <div className="space-y-6">
              {/* Cloud Storage Header Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border border-emerald-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">☁️</span>
                    <h3 className="text-lg font-bold text-emerald-300">Google Drive Cloud Storage</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Real-time Sync Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl">
                    Every invitation automatically gets its own dedicated folder inside your root Google Drive folder (<strong>snierxgameplay@gmail.com</strong>), named after the <strong className="text-amber-300">Bride &amp; Groom or Hero Character Name</strong> for any type of invitation. Deleting an invitation automatically deletes its Drive folder as well. Paid marked invitations remain completely untouched.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start md:self-center">
                  <a
                    href={GOOGLE_DRIVE_ROOT_FOLDER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center space-x-2 transition"
                  >
                    <span>📁 Open Root Drive Folder</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>

              {/* Transfer All Images & Free Firebase Space Action Box */}
              <div className="p-6 rounded-2xl bg-slate-950/90 border border-amber-500/30 shadow-2xl space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🚀</span>
                      <h4 className="font-extrabold text-amber-200 text-base">
                        Transfer Images to Google Drive &amp; Clear Firebase Database
                      </h4>
                      {scanStats.totalItems > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                          {scanStats.totalItems} Base64 Image(s) Lingering in Database
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ✓ 100% Clean (Zero Base64 in Database)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 max-w-2xl">
                      Extracts all raw embedded image strings from Firebase Realtime Database and transfers each image into its respective invitation's folder on Google Drive. Replaces heavy database strings with fast streaming Google Drive CDN URLs.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
                    <button
                      onClick={handleTransferViaOAuth}
                      disabled={isMigratingImages}
                      className="px-5 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-lg bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-slate-950 flex items-center space-x-2 transition cursor-pointer active:scale-98 disabled:opacity-50"
                      title="Use your authenticated Google Client ID to authorize and upload files directly to Google Drive"
                    >
                      <span>{isMigratingImages ? "⏳ Processing..." : "🔑 Connect Google & Push to Drive"}</span>
                    </button>
                    <button
                      onClick={handleTransferAllImages}
                      disabled={isMigratingImages}
                      className="px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                      title="Optimize database and re-scan"
                    >
                      <span>🔄 Optimize Database</span>
                    </button>
                  </div>
                </div>

                {/* Live Progress Bar during Migration */}
                {migrationProgress && (
                  <div className="pt-3 border-t border-slate-850 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-amber-300 font-semibold">{migrationProgress.message}</span>
                      <span className="font-mono text-emerald-400 font-extrabold">{migrationProgress.percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300 rounded-full shadow-sm"
                        style={{ width: `${migrationProgress.percent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Storage Statistics Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Base64 Images in Database</span>
                    <span className="text-lg font-mono font-bold text-amber-300">{scanStats.totalItems}</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Space To Free in Firebase</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      {(scanStats.totalBytes / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Permanent Sync Mode</span>
                    <span className="text-xs font-semibold text-sky-400 flex items-center space-x-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
                      <span>Google Drive Cloud Active</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Folder Naming & Storage Rules Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <span>🏷️</span>
                    <span>Auto-Folder Naming</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Folders are named strictly using couple names and wedding location:
                  </p>
                  <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-emerald-400 border border-slate-800">
                    Bride &amp; Groom (Location)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <span>🔄</span>
                    <span>Automatic Renaming</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Whenever an admin or customer updates names, venues, or locations, the folder renames automatically to match.
                  </p>
                  <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-amber-300 border border-slate-800">
                    Real-time Auto Rename
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <span>⚡</span>
                    <span>Instant Guest Loading</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    All images, audio, and design files uploaded are stored in the folder and cached so invitations shared to guests load instantly.
                  </p>
                  <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-sky-400 border border-slate-800">
                    Zero Latency Streaming
                  </div>
                </div>
              </div>

              {/* Invitations Folder Registry Table */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">Invitation Folders on Drive</h4>
                    <p className="text-xs text-slate-400">Folders created and linked in the root Google Drive storage</p>
                  </div>
                  <button
                    onClick={async () => {
                      setIsSyncingAllDrive(true);
                      let totalSyncedMedia = 0;
                      let token = getStoredOAuthToken();
                      if (!token && !getDriveWebhookUrl()) {
                        try {
                          token = await requestGoogleDriveAuth();
                        } catch (authErr) {
                          console.warn("Drive auth skipped or failed:", authErr);
                        }
                      }
                      for (const inv of invitations) {
                        try {
                          // Paid invitations are untouched
                          if (inv.isPaid) continue;

                          const res = await syncDriveFolder({ invitation: inv, token });
                          if (res && res.folderId && (!inv.driveStorage?.folderId || inv.driveStorage?.folderId !== res.folderId)) {
                            dbStore.updateInvitation(inv.id, {
                              driveStorage: { ...(inv.driveStorage || {}), ...res }
                            });
                          }
                          const mediaRes = await syncInvitationMediaFromDrive(inv);
                          if (mediaRes.success && mediaRes.syncedFiles > 0) {
                            totalSyncedMedia += mediaRes.syncedFiles;
                            dbStore.updateInvitation(inv.id, {
                              config: mediaRes.updatedConfig,
                              driveStorage: {
                                ...(inv.driveStorage || {}),
                                folderId: mediaRes.folderId,
                                folderUrl: mediaRes.folderUrl,
                                status: "live_synced",
                                filesCount: mediaRes.syncedFiles,
                                lastSyncedAt: new Date().toISOString()
                              }
                            });
                          }
                        } catch(e) {}
                      }
                      setIsSyncingAllDrive(false);
                      showToast(
                        totalSyncedMedia > 0 
                          ? `Synced ${totalSyncedMedia} media file(s) from Google Drive into invitations!` 
                          : "All invitation folders checked and synced with Google Drive!", 
                        "success"
                      );
                      setTick(t => t + 1);
                    }}
                    disabled={isSyncingAllDrive}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center space-x-1.5 self-start sm:self-center"
                  >
                    <span>{isSyncingAllDrive ? "⏳ Checking Drive..." : "🔄 Re-sync All Folders & Media"}</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Drive Folder Name</th>
                        <th className="py-2.5 px-3">Associated Invitation</th>
                        <th className="py-2.5 px-3">Wedding Location</th>
                        <th className="py-2.5 px-3">Sync Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {invitations.map(inv => {
                        const folderName = inv.driveStorage?.folderName || formatDriveFolderName(inv.config, inv.title);
                        const folderUrl = inv.driveStorage?.folderUrl || GOOGLE_DRIVE_ROOT_FOLDER_URL;
                        const location = inv.config?.weddingVenue || inv.config?.weddingAddress || "Not specified";
                        
                        return (
                          <tr key={inv.id} className="hover:bg-slate-900/50 transition">
                            <td className="py-3 px-3 font-semibold text-slate-100 flex items-center space-x-2">
                              <span className="text-emerald-400">📁</span>
                              <span className="font-mono text-emerald-300">{folderName}</span>
                            </td>
                            <td className="py-3 px-3 text-slate-300">
                              {inv.title || "Wedding Invitation"}
                            </td>
                            <td className="py-3 px-3 text-slate-400">
                              {location}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                {inv.driveStorage?.status || "Synced"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right flex items-center justify-end space-x-2">
                              <button
                                onClick={async () => {
                                  showToast(`Checking Google Drive for "${folderName}"...`, "info");
                                  const res = await syncInvitationMediaFromDrive(inv);
                                  if (res.success && res.syncedFiles > 0) {
                                    dbStore.updateInvitation(inv.id, {
                                      config: res.updatedConfig,
                                      driveStorage: {
                                        ...(inv.driveStorage || {}),
                                        folderId: res.folderId,
                                        folderUrl: res.folderUrl,
                                        status: "live_synced",
                                        filesCount: res.syncedFiles,
                                        lastSyncedAt: new Date().toISOString()
                                      }
                                    });
                                    showToast(`Successfully linked ${res.syncedFiles} files from Google Drive!`, "success");
                                    setTick(t => t + 1);
                                  } else {
                                    showToast(res.message || "No new files found in Drive folder.", "info");
                                  }
                                }}
                                className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-xs font-bold transition inline-flex items-center space-x-1"
                                title="Sync files inside this Drive folder with the invitation"
                              >
                                <span>⚡ Sync Media</span>
                              </button>
                              <a
                                href={folderUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded bg-slate-900 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 text-xs font-bold transition inline-flex items-center space-x-1"
                              >
                                <span>Open in Drive</span>
                                <span>↗</span>
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Optional Google Apps Script Direct Webhook Integration */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">Automated Google Apps Script Webhook (Optional)</h4>
                    <p className="text-xs text-slate-400">
                      Connect your 1-minute Google Apps Script Web App for 100% direct native Drive folder creation &amp; uploads
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
                      setCopiedScript(true);
                      showToast("Google Apps Script code copied to clipboard!", "success");
                      setTimeout(() => setCopiedScript(false), 3000);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center space-x-1.5 self-start sm:self-center"
                  >
                    <span>{copiedScript ? "✓ Copied!" : "📋 Copy Google Apps Script Code"}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-amber-300 block mb-1">
                      Web App Exec URL (Ends with /exec)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={driveWebhookInput}
                        onChange={(e) => setDriveWebhookInput(e.target.value)}
                        placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                      />
                      <button
                        onClick={() => {
                          setDriveWebhookUrl(driveWebhookInput);
                          showToast("Google Drive Webhook URL saved successfully!", "success");
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer hover:from-amber-500 hover:to-yellow-600 transition"
                      >
                        Save URL
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1.5 text-slate-300">
                    <p className="font-bold text-amber-300">⚡ 1-Minute Setup Guide:</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
                      <li>Open <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">script.google.com</a> and click <strong>New project</strong>.</li>
                      <li>Click the <strong>Copy Google Apps Script Code</strong> button above and paste it into <code className="text-emerald-400">Code.gs</code>.</li>
                      <li>Click <strong>Deploy &gt; New deployment &gt; Web app</strong>. Set <em>Execute as: Me</em> and <em>Who has access: Anyone</em>.</li>
                      <li>Click Deploy, copy the Web App URL, paste it in the box above, and click <strong>Save URL</strong>.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <ThemeEditorModal
        isOpen={themeModalOpen}
        preset={editingPreset}
        onClose={() => setThemeModalOpen(false)}
        onSave={() => setTick(t => t + 1)}
        showToast={showToast}
      />

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

      <CustomDialog {...dialog} themeConfig={{ primaryColor: '#0b1329', accentGold: '#e5b858' }} />

      <ShareInviteModal
        isOpen={shareModalData.isOpen}
        onClose={() => setShareModalData({ isOpen: false, invitation: null })}
        invitation={shareModalData.invitation}
        showToast={showToast}
      />
    </div>
  );
}
