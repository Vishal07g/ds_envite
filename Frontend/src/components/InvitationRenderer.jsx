import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import dbStore from '../data/store';
import { formatWeddingDate, formatWeddingTime, formatWeddingDateDmy, getFrameClasses, hexToRgb, parseColor, rgbaToCss, formatDriveDirectUrl } from '../utils/helpers';
import { 
  SvgHeart, SvgSparkles, SvgCalendar, SvgMapPin, 
  SvgVolume2, SvgVolumeX, SvgUsers, SvgMessageSquare, 
  SvgSend, SvgCheck, SvgExternalLink, SvgShare, SvgCopy,
  SvgAward
} from './icons';
import Scroll3DContainer from './Scroll3DContainer';
import EnvelopeOpener from './EnvelopeOpener';
import { EditableText } from './EditableText';
import CelebrationOverlay from './CelebrationOverlay';
import RevealEffectsOverlay from './RevealEffectsOverlay';
import GlobalBorderFrame from './GlobalBorderFrame';
import WeddingTimeline from './WeddingTimeline';

export const getScratchCardShapeStyles = (shape) => {
  switch (shape) {
    case 'oval':
      return { borderRadius: '3.5rem', clipPath: undefined };
    case 'arch':
      return { borderRadius: '120px 120px 18px 18px', clipPath: undefined };
    case 'diamond':
      return { 
        borderRadius: '0px', 
        clipPath: 'polygon(24px 0, calc(100% - 24px) 0, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0 calc(100% - 24px), 0 24px)' 
      };
    case 'vintage':
      return { borderRadius: '2.5rem 0.6rem 2.5rem 0.6rem', clipPath: undefined };
    case 'rounded':
    default:
      return { borderRadius: '1.25rem', clipPath: undefined };
  }
};

export const getScratchInnerBorderShapeStyles = (shape) => {
  switch (shape) {
    case 'oval':
      return { borderRadius: '2.8rem', clipPath: undefined };
    case 'arch':
      return { borderRadius: '105px 105px 12px 12px', clipPath: undefined };
    case 'diamond':
      return { 
        borderRadius: '0px', 
        clipPath: 'polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)' 
      };
    case 'vintage':
      return { borderRadius: '2.1rem 0.4rem 2.1rem 0.4rem', clipPath: undefined };
    case 'rounded':
    default:
      return { borderRadius: '0.95rem', clipPath: undefined };
  }
};

const ScratchCardShield = React.memo(
  function ScratchCardShield({
    shape = 'rounded',
    revealColor,
    accentGold,
    scratchImage,
    scratchImageScale = 100,
    scratchImageXOffset = 50,
    scratchImageYOffset = 50,
    isScratchFinished = false,
    setIsScratchFinished,
    setScratchedPercentage,
    triggerCelebration
  }) {
    const canvasRef = useRef(null);
    const [debugText, setDebugText] = useState("paint not called");
    const isScratchingRef = useRef(false);
    const lastScratchPosRef = useRef({ x: 0, y: 0 });
    const hasTriggeredScratchRef = useRef(false);

    const shapeStyles = useMemo(() => getScratchCardShapeStyles(shape), [shape]);

    const drawShieldShapeBorder = (ctx, w, h, inset, sh) => {
      ctx.beginPath();
      if (sh === 'oval') {
        const r = Math.min(w / 2, 44);
        ctx.moveTo(inset + r, inset);
        ctx.lineTo(inset + w - r, inset);
        ctx.arcTo(inset + w, inset, inset + w, inset + r, r);
        ctx.lineTo(inset + w, inset + h - r);
        ctx.arcTo(inset + w, inset + h, inset + w - r, inset + h, r);
        ctx.lineTo(inset + r, inset + h);
        ctx.arcTo(inset, inset + h, inset, inset + h - r, r);
        ctx.lineTo(inset, inset + r);
        ctx.arcTo(inset, inset, inset + r, inset, r);
        ctx.closePath();
      } else if (sh === 'arch') {
        const rTop = Math.min(w / 2, 105);
        const rBot = 12;
        ctx.moveTo(inset + rTop, inset);
        ctx.lineTo(inset + w - rTop, inset);
        ctx.arcTo(inset + w, inset, inset + w, inset + rTop, rTop);
        ctx.lineTo(inset + w, inset + h - rBot);
        ctx.arcTo(inset + w, inset + h, inset + w - rBot, inset + h, rBot);
        ctx.lineTo(inset + rBot, inset + h);
        ctx.arcTo(inset, inset + h, inset, inset + h - rBot, rBot);
        ctx.lineTo(inset, inset + rTop);
        ctx.arcTo(inset, inset, inset + rTop, inset, rTop);
        ctx.closePath();
      } else if (sh === 'diamond') {
        const cut = 18;
        ctx.moveTo(inset + cut, inset);
        ctx.lineTo(inset + w - cut, inset);
        ctx.lineTo(inset + w, inset + cut);
        ctx.lineTo(inset + w, inset + h - cut);
        ctx.lineTo(inset + w - cut, inset + h);
        ctx.lineTo(inset + cut, inset + h);
        ctx.lineTo(inset, inset + h - cut);
        ctx.lineTo(inset, inset + cut);
        ctx.closePath();
      } else if (sh === 'vintage') {
        const rTL = 32, rTR = 6, rBR = 32, rBL = 6;
        ctx.moveTo(inset + rTL, inset);
        ctx.lineTo(inset + w - rTR, inset);
        ctx.arcTo(inset + w, inset, inset + w, inset + rTR, rTR);
        ctx.lineTo(inset + w, inset + h - rBR);
        ctx.arcTo(inset + w, inset + h, inset + w - rBR, inset + h, rBR);
        ctx.lineTo(inset + rBL, inset + h);
        ctx.arcTo(inset, inset + h, inset, inset + h - rBL, rBL);
        ctx.lineTo(inset, inset + rTL);
        ctx.arcTo(inset, inset, inset + rTL, inset, rTL);
        ctx.closePath();
      } else { // rounded
        const r = 14;
        ctx.moveTo(inset + r, inset);
        ctx.lineTo(inset + w - r, inset);
        ctx.arcTo(inset + w, inset, inset + w, inset + r, r);
        ctx.lineTo(inset + w, inset + h - r);
        ctx.arcTo(inset + w, inset + h, inset + w - r, inset + h, r);
        ctx.lineTo(inset + r, inset + h);
        ctx.arcTo(inset, inset + h, inset, inset + h - r, r);
        ctx.lineTo(inset, inset + r);
        ctx.arcTo(inset, inset, inset + r, inset, r);
        ctx.closePath();
      }
    };

    const drawShieldOverlays = (ctx, width, height) => {
      const cardShape = shape || 'rounded';
      const accent = revealColor || accentGold || '#f59e0b';

      // 1. Double ornamental inner gold border
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = accent;
      ctx.shadowBlur = 8;
      drawShieldShapeBorder(ctx, width - 28, height - 28, 14, cardShape);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      drawShieldShapeBorder(ctx, width - 40, height - 40, 20, cardShape);
      ctx.stroke();

      // 2. Luxury center badge
      const badgeW = Math.min(340, width - 60);
      const badgeH = 82;
      const badgeX = (width - badgeW) / 2;
      const badgeY = (height - badgeH) / 2;

      ctx.fillStyle = 'rgba(9, 14, 26, 0.82)';
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 16;
      
      const br = 16;
      ctx.beginPath();
      ctx.moveTo(badgeX + br, badgeY);
      ctx.lineTo(badgeX + badgeW - br, badgeY);
      ctx.arcTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + br, br);
      ctx.lineTo(badgeX + badgeW, badgeY + badgeH - br);
      ctx.arcTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - br, badgeY + badgeH, br);
      ctx.lineTo(badgeX + br, badgeY + badgeH);
      ctx.arcTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - br, br);
      ctx.lineTo(badgeX, badgeY + br);
      ctx.arcTo(badgeX, badgeY, badgeX + br, badgeY, br);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 3. Shimmering High-Contrast Typography
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 8;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "Playfair Display", "Cinzel", Georgia, serif';
      ctx.fillText('✦ SCRATCH TO REVEAL DATE ✦', width / 2, height / 2 - 12);

      ctx.fillStyle = accent;
      ctx.font = 'italic 12px "Cormorant Garamond", Georgia, serif';
      ctx.fillText('Wipe gold shield to reveal wedding date & countdown', width / 2, height / 2 + 14);

      ctx.shadowBlur = 0;
    };

    const drawDefaultMetallicShield = (ctx, width, height) => {
      // 1. Luxury metallic gradient base
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#5b3d0a');
      grad.addColorStop(0.2, '#c6922b');
      grad.addColorStop(0.4, '#fef08a');
      grad.addColorStop(0.6, '#925f12');
      grad.addColorStop(0.8, '#fef3c7');
      grad.addColorStop(1, '#452a06');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Diagonal brushed metallic sheen texture
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = -height; x < width + height; x += 6) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height, height);
        ctx.stroke();
      }

      // 3. Golden sparkling metallic flecks
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (let i = 0; i < 75; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2 + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Draw luxury badges, borders and typography
      drawShieldOverlays(ctx, width, height);
    };

    const paintShield = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      setIsScratchFinished(false);
      setScratchedPercentage(0);
      hasTriggeredScratchRef.current = false;

      ctx.globalCompositeOperation = 'source-over';

      // 1. Draw default luxury metallic foil shield immediately
      drawDefaultMetallicShield(ctx, width, height);

      const rect = canvas.getBoundingClientRect();
      const cardDiv = canvas.parentElement?.querySelector('div.absolute.inset-0');
      const cardZ = cardDiv ? window.getComputedStyle(cardDiv).zIndex : 'none';
      const canvasZ = window.getComputedStyle(canvas).zIndex;
      const elAtCenter = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      setDebugText(`cZ:${cardZ} cvZ:${canvasZ} top:<${elAtCenter?.tagName} c='${elAtCenter?.className?.slice(0,10)}'>`);

      // 2. Check if user provided a custom uploaded image for the scratch card surface
      const hasCustomImage = Boolean(
        scratchImage &&
        typeof scratchImage === 'string' &&
        scratchImage.trim() !== '' &&
        !scratchImage.includes('photo-1519225495810-7512c696505a')
      );
      console.log("🎨 HAS CUSTOM IMAGE?", hasCustomImage, scratchImage);

      if (hasCustomImage) {
        const img = new Image();
        if (!scratchImage.startsWith('data:') && !scratchImage.startsWith('blob:')) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
          try {
            ctx.globalCompositeOperation = 'source-over';
            const scale = (scratchImageScale || 100) / 100;
            const xOff = (scratchImageXOffset ?? 50) / 100;
            const yOff = (scratchImageYOffset ?? 50) / 100;

            const imgAspect = img.width / img.height;
            const canvasAspect = width / height;
            let drawW, drawH;
            if (imgAspect > canvasAspect) {
              drawH = height * scale;
              drawW = drawH * imgAspect;
            } else {
              drawW = width * scale;
              drawH = drawW / imgAspect;
            }
            const drawX = (width - drawW) * xOff;
            const drawY = (height - drawH) * yOff;

            // Fill deep opaque background first
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, drawX, drawY, drawW, drawH);

            // Overlay foil border and badge
            drawShieldOverlays(ctx, width, height);
          } catch (err) {
            console.warn("Could not draw custom scratch image, retained luxury shield:", err);
            drawDefaultMetallicShield(ctx, width, height);
          }
        };
        img.onerror = () => {
          drawDefaultMetallicShield(ctx, width, height);
        };
        img.src = formatDriveDirectUrl(scratchImage, "image");
      }
    }, [
      scratchImage,
      scratchImageScale,
      scratchImageXOffset,
      scratchImageYOffset,
      shape,
      revealColor,
      accentGold,
      setIsScratchFinished,
      setScratchedPercentage
    ]);

    useEffect(() => {
      paintShield();
    }, [paintShield]);

    useEffect(() => {
      const handleReset = () => {
        paintShield();
      };
      const handleInstantReveal = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        hasTriggeredScratchRef.current = true;
        setIsScratchFinished(true);
        setScratchedPercentage(100);
      };
      window.addEventListener('resetScratchCard', handleReset);
      window.addEventListener('instantRevealScratchCard', handleInstantReveal);
      return () => {
        window.removeEventListener('resetScratchCard', handleReset);
        window.removeEventListener('instantRevealScratchCard', handleInstantReveal);
      };
    }, [paintShield, setIsScratchFinished, setScratchedPercentage]);

    const getCoordinates = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    };

    const checkScratchProgress = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;
        let transparent = 0;

        for (let i = 0; i < pixels.length; i += 16) {
          if (pixels[i + 3] === 0) {
            transparent++;
          }
        }

        const ratio = transparent / (pixels.length / 16);
        setScratchedPercentage(Math.round(ratio * 100));

        if (ratio > 0.40 && !isScratchFinished && !hasTriggeredScratchRef.current) {
          hasTriggeredScratchRef.current = true;
          setIsScratchFinished(true);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (triggerCelebration) triggerCelebration();
        }
      } catch (e) {
        console.warn("Scratch check progress error:", e);
      }
    };

    const handleScratchStart = (e) => {
      if (isScratchFinished) return;
      isScratchingRef.current = true;
      lastScratchPosRef.current = getCoordinates(e);
    };

    const handleScratchMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas || isScratchFinished || !isScratchingRef.current) return;
      const ctx = canvas.getContext('2d');
      if (e.touches) e.preventDefault();

      const pos = getCoordinates(e);

      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = 48;

      ctx.beginPath();
      ctx.moveTo(lastScratchPosRef.current.x, lastScratchPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      lastScratchPosRef.current = pos;
      checkScratchProgress();
    };

    const handleScratchEnd = () => {
      isScratchingRef.current = false;
    };

    return (
      <canvas
        ref={canvasRef}
        width={480}
        height={400}
        className={`absolute inset-0 w-full h-full cursor-crosshair transition-opacity duration-300 ${isScratchFinished ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{
          ...shapeStyles,
          zIndex: 25,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          touchAction: 'none'
        }}
        onMouseDown={handleScratchStart}
        onTouchStart={handleScratchStart}
        onMouseMove={handleScratchMove}
        onTouchMove={handleScratchMove}
        onMouseUp={handleScratchEnd}
        onMouseLeave={handleScratchEnd}
        onTouchEnd={handleScratchEnd}
      />
    );
  },
  (prev, next) => {
    return (
      prev.shape === next.shape &&
      prev.revealColor === next.revealColor &&
      prev.accentGold === next.accentGold &&
      prev.scratchImage === next.scratchImage &&
      prev.scratchImageScale === next.scratchImageScale &&
      prev.scratchImageXOffset === next.scratchImageXOffset &&
      prev.scratchImageYOffset === next.scratchImageYOffset &&
      prev.isScratchFinished === next.isScratchFinished
    );
  }
);

export default function InvitationRenderer({ 
  invitationId = 'default',
  config: propConfig = {}, 
  rsvps = [], 
  wishes = [], 
  onSubmitRsvp, 
  onSubmitWish,
  onDeleteRsvp,
  onDeleteWish,
  isModerator = false,
  showEnvelopeFirst = true,
  isPlayingMusic = false,
  onMusicToggle,
  onChangeField,
  onSelectElement,
  isPrintMode = false,
  isPaid = false
}) {
  const config = useMemo(() => {
    const base = propConfig || {};
    if (!base.syncColorThemeWithEnvelope) return base;
    return {
      ...base,
      primaryColor: base.envelopeBgColor || base.primaryColor || "#0b1329",
      accentGold: base.envelopeSealColor || base.accentGold || "#f59e0b"
    };
  }, [propConfig]);

  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(isPrintMode ? true : !showEnvelopeFirst);
  const [envelopeOpeningAnim, setEnvelopeOpeningAnim] = useState(false);
  const isEnvelopeOpenedRef = useRef(
    isPrintMode || config.showEnvelope === false ? true : !showEnvelopeFirst
  );
  useEffect(() => {
    isEnvelopeOpenedRef.current = isPrintMode || config.showEnvelope === false ? true : isEnvelopeOpened;
  }, [isEnvelopeOpened, isPrintMode, config.showEnvelope]);
  const [isScratchFinished, setIsScratchFinished] = useState(isPrintMode ? true : false);
  const [scratchedPercentage, setScratchedPercentage] = useState(isPrintMode ? 100 : 0);
  const [showGraffiti, setShowGraffiti] = useState(false);
  const [previewCelebrationType, setPreviewCelebrationType] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });
  const [fireworks, setFireworks] = useState([]);
  const [brandSettings, setBrandSettings] = useState(() => dbStore.getBrandSettings());

  useEffect(() => {
    const handleSync = () => setBrandSettings(dbStore.getBrandSettings());
    window.addEventListener("db_synced", handleSync);
    return () => window.removeEventListener("db_synced", handleSync);
  }, []);
  
  // Reset card cover state when reveal effect style or shape is changed in settings
  useEffect(() => {
    if (isPrintMode) {
      setIsScratchFinished(true);
      setScratchedPercentage(100);
      return;
    }
    setIsScratchFinished(false);
    setScratchedPercentage(0);
    setShowGraffiti(false);
    setPreviewCelebrationType(null);
  }, [config.revealEffect, config.scratchCardShape, isPrintMode]);
  
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const startingAudioRef = useRef(null);
  const mainAudioRef = useRef(null);
  const widgetRef = useRef(null);
  const isScratchingRef = useRef(false);
  const lastScratchPosRef = useRef({ x: 0, y: 0 });

  const startingSongUrl = config.startingMusicUrl || (config.startingMusicEnabled !== false ? "/music_intro.mp3" : "");
  const hasStartingSong = Boolean(config.startingMusicEnabled !== false && startingSongUrl);
  const hasMainSong = Boolean(config.mainMusicEnabled !== false && config.musicUrl);
  const [currentTrack, setCurrentTrack] = useState(() => {
    const envelopeOpen = isPrintMode || config.showEnvelope === false ? true : !showEnvelopeFirst;
    if (!envelopeOpen && hasStartingSong) return "starting";
    return hasMainSong ? "main" : (hasStartingSong ? "starting" : "main");
  });

  // Automatically start playing Song 1 (Starting Song) as soon as invitation link is opened
  useEffect(() => {
    if (config.showMusic === false) return;

    const playStartingSong = () => {
      // If envelope is already opened and main song exists, do NOT play starting song!
      if (isEnvelopeOpenedRef.current && hasMainSong) {
        const mainEl = mainAudioRef.current || audioRef.current;
        if (mainEl && mainEl.paused) {
          mainEl.play().catch(() => {});
        }
        return;
      }

      // At the beginning, envelope is closed: strictly play Song 1
      const startEl = startingAudioRef.current;
      const mainEl = mainAudioRef.current || audioRef.current;

      // Ensure main song is explicitly stopped & reset
      if (mainEl && !mainEl.paused) {
        mainEl.pause();
        mainEl.currentTime = 0;
      }

      if (hasStartingSong && startEl && startEl.paused) {
        startEl.play().then(() => {
          if (onMusicToggle) onMusicToggle(true);
        }).catch(err => {
          console.log("Audio autoplay waiting for user activity:", err.name);
        });
      }
    };

    // 1. Try immediate autoplay right on page load
    playStartingSong();

    // 2. Fallback on any initial activity/gesture (pointer, mouse, touch, scroll, focus, envelopeUserTapped)
    const gestureEvents = ['pointerdown', 'touchstart', 'click', 'mousemove', 'scroll', 'keydown', 'envelopeUserTapped'];
    const onFirstGesture = () => {
      playStartingSong();
      gestureEvents.forEach(evt => window.removeEventListener(evt, onFirstGesture, { capture: true }));
    };

    gestureEvents.forEach(evt => {
      window.addEventListener(evt, onFirstGesture, { capture: true, once: true });
    });

    // Also retry once audio element finishes buffering
    const startEl = startingAudioRef.current;
    if (startEl) {
      startEl.addEventListener('canplay', playStartingSong, { once: true });
      startEl.addEventListener('loadeddata', playStartingSong, { once: true });
    }

    return () => {
      gestureEvents.forEach(evt => window.removeEventListener(evt, onFirstGesture, { capture: true }));
      if (startEl) {
        startEl.removeEventListener('canplay', playStartingSong);
        startEl.removeEventListener('loadeddata', playStartingSong);
      }
    };
  }, [hasStartingSong, startingSongUrl, hasMainSong, config.showMusic, onMusicToggle]);

  // Music Volume, Drag & Widget Toggle state
  const [audioVolume, setAudioVolume] = useState(config.musicVolume !== undefined ? Number(config.musicVolume) : 0.8);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [widgetPos, setWidgetPos] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isWidgetMinimized, setIsWidgetMinimized] = useState(true);
  const [isWidgetHidden, setIsWidgetHidden] = useState(false);

  // Sync Audio Volume across both starting and main tracks
  useEffect(() => {
    const vol = config.musicVolume !== undefined ? Number(config.musicVolume) : audioVolume;
    const clamped = Math.max(0, Math.min(1, vol));
    if (audioRef.current) audioRef.current.volume = clamped;
    if (startingAudioRef.current) startingAudioRef.current.volume = clamped;
    if (mainAudioRef.current) mainAudioRef.current.volume = clamped;
  }, [audioVolume, config.musicVolume, config.musicUrl, config.startingMusicUrl]);

  // Widget Drag Handlers
  const handleDragStart = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    if (!widgetRef.current) return;
    const rect = widgetRef.current.getBoundingClientRect();
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
    setIsDragging(true);
  };

  useEffect(() => {
    const handleDragMove = (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const newX = Math.max(10, Math.min(window.innerWidth - 60, clientX - dragOffset.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 60, clientY - dragOffset.y));
      
      setWidgetPos({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, dragOffset]);

  // RSVP Form state with automatic recall for guest
  const [rsvpForm, setRsvpForm] = useState(() => {
    try {
      const saved = localStorage.getItem(`ds_guest_rsvp_${invitationId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { name: "", email: "", attending: "yes", count: 1, note: "" };
  });

  // Wish Form state
  const [wishForm, setWishForm] = useState({ sender: "", message: "" });

  const [activeColorId, setActiveColorId] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const galleryIndexes = useMemo(() => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(idx => config[`galleryImage${idx}`]);
  }, [config]);

  useEffect(() => {
    if (config.galleryAutoplay !== false && galleryIndexes.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlideIndex(prev => {
          if (galleryIndexes.length === 0) return 0;
          return (prev + 1) % galleryIndexes.length;
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [galleryIndexes.length, config.galleryAutoplay]);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (galleryIndexes.length <= 1) return;
    if (touchStart - touchEnd > 50) {
      setCurrentSlideIndex(prev => (prev + 1) % galleryIndexes.length);
    }
    if (touchStart - touchEnd < -50) {
      setCurrentSlideIndex(prev => (prev - 1 + galleryIndexes.length) % galleryIndexes.length);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (e.target.closest('.color-picker-popover') || e.target.closest('.color-picker-trigger')) {
        return;
      }
      setActiveColorId(null);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  useEffect(() => {
    const handleSelectTab = (e) => {
      const tabId = e.detail;
      
      // Close envelope if selecting envelope customisation tab, otherwise open it
      if (tabId === 'envelope') {
        setIsEnvelopeOpened(false);
        setEnvelopeOpeningAnim(false);
        isEnvelopeOpenedRef.current = false;
        if (hasStartingSong) {
          setCurrentTrack("starting");
          const mainEl = mainAudioRef.current || audioRef.current;
          if (mainEl) {
            mainEl.pause();
            mainEl.currentTime = 0;
          }
          if (startingAudioRef.current && isPlayingMusic) {
            startingAudioRef.current.play().catch(() => {});
          }
        }
      } else {
        setIsEnvelopeOpened(true);
        isEnvelopeOpenedRef.current = true;
        if (hasMainSong) {
          if (startingAudioRef.current) {
            startingAudioRef.current.pause();
            startingAudioRef.current.currentTime = 0;
          }
          setCurrentTrack("main");
          const mainEl = mainAudioRef.current || audioRef.current;
          if (mainEl && isPlayingMusic) {
            mainEl.play().catch(() => {});
          }
        }
      }

      let targetId = '';
      switch (tabId) {
        case 'cover':
          targetId = 'cover-section';
          break;
        case 'couple':
          targetId = 'couple-section';
          break;
        case 'religion':
          targetId = 'sacred-section';
          break;
        case 'venue':
          targetId = 'venue-section';
          break;
        case 'gallery':
          targetId = 'gallery-section';
          break;
        case 'scratch':
          targetId = 'scratch-section';
          break;
        case 'rsvp':
          targetId = 'rsvp-section';
          break;
        default:
          break;
      }

      if (targetId) {
        const el = document.getElementById(targetId);
        window.isProgrammaticScrolling = true;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setTimeout(() => {
          window.isProgrammaticScrolling = false;
        }, 1000);
      } else if (tabId === 'cover' || tabId === 'envelope') {
        const container = document.getElementById('invitation-preview-container');
        window.isProgrammaticScrolling = true;
        if (container) {
          container.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setTimeout(() => {
          window.isProgrammaticScrolling = false;
        }, 1000);
      }
    };
    window.addEventListener('adminSelectTab', handleSelectTab);
    return () => window.removeEventListener('adminSelectTab', handleSelectTab);
  }, []);

  useEffect(() => {
    const sections = [
      { id: 'cover-section', tab: 'cover' },
      { id: 'sacred-section', tab: 'religion' },
      { id: 'couple-section', tab: 'couple' },
      { id: 'venue-section', tab: 'venue' },
      { id: 'gallery-section', tab: 'gallery' },
      { id: 'scratch-section', tab: 'scratch' },
      { id: 'rsvp-section', tab: 'rsvp' }
    ];

    let ticking = false;
    let lastDispatchedTab = null;
    let dispatchTimer = null;

    const checkActiveSection = () => {
      if (window.isProgrammaticScrolling) return;

      const container = document.getElementById('invitation-preview-container');
      const targetContainer = container || window;

      const containerRect = targetContainer === window
        ? { top: 0, height: window.innerHeight }
        : targetContainer.getBoundingClientRect();

      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestSection = null;
      let minDistance = Infinity;

      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const elementCenter = rect.top + rect.height / 2;
          const distance = Math.abs(elementCenter - containerCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closestSection = sections[i].tab;
          }
        }
      }

      if (closestSection && closestSection !== lastDispatchedTab) {
        lastDispatchedTab = closestSection;
        clearTimeout(dispatchTimer);
        // Debounce tab notification to ensure fluid, jitter-free scrolling
        dispatchTimer = setTimeout(() => {
          if (!window.isProgrammaticScrolling) {
            window.dispatchEvent(new CustomEvent('invitationScrollToSection', { 
              detail: closestSection 
            }));
          }
        }, 150);
      }
    };

    const handleScroll = () => {
      if (window.isProgrammaticScrolling) return;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          checkActiveSection();
          ticking = false;
        });
      }
    };

    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    // Initial check
    const initialTimer = setTimeout(checkActiveSection, 200);

    return () => {
      clearTimeout(dispatchTimer);
      clearTimeout(initialTimer);
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, []);

  // Reveal Effects States
  const [revealClass, setRevealClass] = useState("");
  const [revealSparks, setRevealSparks] = useState([]);
  const [torchPos, setTorchPos] = useState({ x: 200, y: 150 });

  const currentFirstLetters = `${(config.brideName || "E").charAt(0)} & ${(config.groomName || "T").charAt(0)}`;



  // Stable background shapes generation
  const backgroundShapes = useMemo(() => {
    const count = parseInt(config.bgShapesCount ?? "12");
    const type = config.bgShapesType || "none";
    if (type === 'none' || count <= 0) return [];
    
    const shapes = [];
    const colors = [
      config.accentGold || "#f59e0b", 
      "#f43f5e", 
      "#ef4444", 
      "#3b82f6", 
      "#10b981", 
      "#a855f7",
      "#ffffff"
    ];
    for (let i = 0; i < count; i++) {
      const x = (i * 79 + 13) % 100;
      const y = (i * 53 + 29) % 100;
      const size = ((i * 17 + 15) % 40) + 15;
      const delay = (i * 0.7) % 5;
      const duration = ((i * 3 + 15) % 15) + 10;
      const color = colors[i % colors.length];
      shapes.push({ id: i, x, y, size, delay, duration, color });
    }
    return shapes;
  }, [config.bgShapesCount, config.bgShapesType, config.accentGold]);

  // Live Timer Calculator
  useEffect(() => {
    const calculateTime = () => {
      if (!config.weddingDate) return;
      const difference = +new Date(config.weddingDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isPast: false
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [config.weddingDate]);

  // Dual-Song Audio Handling Engine: Strict Single-Track Mutual Exclusion
  useEffect(() => {
    const isStarting = currentTrack === "starting";
    const activeEl = isStarting ? startingAudioRef.current : (mainAudioRef.current || audioRef.current);
    const inactiveEl = isStarting ? (mainAudioRef.current || audioRef.current) : startingAudioRef.current;

    // 1. Strictly pause and reset the other track so both songs NEVER play simultaneously
    if (inactiveEl && !inactiveEl.paused) {
      inactiveEl.pause();
      inactiveEl.currentTime = 0;
    }

    // 2. Play or pause the currently active track
    if (activeEl) {
      if (isPlayingMusic) {
        activeEl.play().catch(() => {});
      } else {
        activeEl.pause();
      }
    }
  }, [isPlayingMusic, currentTrack]);

  // Synchronous Direct User Gesture Audio Toggle (Mute / Unmute / Play / Pause)
  const toggleMusicPlayback = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const isStarting = currentTrack === "starting";
    const activeEl = isStarting ? startingAudioRef.current : (mainAudioRef.current || audioRef.current);
    const inactiveEl = isStarting ? (mainAudioRef.current || audioRef.current) : startingAudioRef.current;

    // Guarantee the other track is paused and reset immediately
    if (inactiveEl && !inactiveEl.paused) {
      inactiveEl.pause();
      inactiveEl.currentTime = 0;
    }

    if (!activeEl) return;

    if (isPlayingMusic && !activeEl.paused) {
      activeEl.pause();
      if (onMusicToggle) onMusicToggle(false);
    } else {
      activeEl.muted = false;
      activeEl.volume = config.musicVolume !== undefined ? Number(config.musicVolume) : 0.8;
      const playPromise = activeEl.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          if (onMusicToggle) onMusicToggle(true);
        }).catch(err => {
          console.warn("Direct toggle play error:", err);
          const fallbackSrc = isStarting ? "/music_intro.mp3" : "/music_wedding.mp3";
          if (activeEl.src && !activeEl.src.includes(fallbackSrc)) {
            activeEl.src = fallbackSrc;
            activeEl.load();
            activeEl.play().then(() => {
              if (onMusicToggle) onMusicToggle(true);
            }).catch(() => {});
          }
        });
      }
    }
  }, [currentTrack, isPlayingMusic, onMusicToggle, config.musicVolume]);

  // Autoplay on first user interaction if enabled
  useEffect(() => {
    if (config.autoPlayMusic === false) return;
    if (!hasStartingSong && !hasMainSong) return;
    
    const handleFirstInteraction = () => {
      const envelopeOpen = isEnvelopeOpenedRef.current;
      // At the beginning when envelope is closed, strictly choose Song 1 (Starting Song)
      const targetTrack = (!envelopeOpen && hasStartingSong) ? "starting" : (hasMainSong ? "main" : "starting");
      setCurrentTrack(targetTrack);
      
      const targetEl = targetTrack === "starting" ? startingAudioRef.current : (mainAudioRef.current || audioRef.current);
      const otherEl = targetTrack === "starting" ? (mainAudioRef.current || audioRef.current) : startingAudioRef.current;
      
      // Ensure other element is stopped & reset
      if (otherEl && !otherEl.paused) {
        otherEl.pause();
        otherEl.currentTime = 0;
      }

      if (targetEl && targetEl.paused) {
        targetEl.play().then(() => {
          if (onMusicToggle) onMusicToggle(true);
        }).catch(err => console.log("Audio autoplay interaction:", err));
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [hasStartingSong, hasMainSong, config.autoPlayMusic]);

  // Ensure the page is completely non-scrollable while the envelope is unopened
  useEffect(() => {
    if (!isEnvelopeOpened && config.showEnvelope !== false) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      const previewContainer = document.getElementById('invitation-preview-container');
      const prevContainerOverflow = previewContainer ? previewContainer.style.overflow : '';
      if (previewContainer) {
        previewContainer.style.overflow = 'hidden';
      }

      const preventScroll = (e) => {
        if (e.type === 'wheel' || e.type === 'touchmove') {
          e.preventDefault();
        }
      };

      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
        if (previewContainer) {
          previewContainer.style.overflow = prevContainerOverflow || 'auto';
        }
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
      };
    }
  }, [isEnvelopeOpened, config.showEnvelope]);

  const handleEnvelopeOpen = () => {
    isEnvelopeOpenedRef.current = true;
    setEnvelopeOpeningAnim(true);

    // WHEN ENVELOPE IS OPENED: Stop Song 1 immediately, and only play Song 2 (Main Song)!
    if (hasMainSong) {
      // 1. Immediately pause and reset Song 1
      if (startingAudioRef.current) {
        startingAudioRef.current.pause();
        startingAudioRef.current.currentTime = 0;
      }
      // 2. Switch to Song 2 and play
      setCurrentTrack("main");
      const mainEl = mainAudioRef.current || audioRef.current;
      if (mainEl) {
        mainEl.currentTime = 0;
        mainEl.play().then(() => {
          if (onMusicToggle) onMusicToggle(true);
        }).catch(e => console.log("Main audio play on envelope open:", e));
      }
    } else if (hasStartingSong) {
      // If only starting song exists, continue playing it
      setCurrentTrack("starting");
      const startEl = startingAudioRef.current;
      if (startEl && startEl.paused) {
        startEl.play().then(() => {
          if (onMusicToggle) onMusicToggle(true);
        }).catch(e => console.log("Starting audio play on envelope open:", e));
      }
    }
  };

  const handleEnvelopeComplete = () => {
    isEnvelopeOpenedRef.current = true;
    setIsEnvelopeOpened(true);
    setEnvelopeOpeningAnim(false);

    // Ensure preview container and window are smoothly at top of the invitation
    const previewContainer = document.getElementById('invitation-preview-container');
    if (previewContainer) {
      previewContainer.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Strict guarantee: Song 1 is completely stopped, only Song 2 plays after envelope is opened
    if (hasMainSong) {
      if (startingAudioRef.current && !startingAudioRef.current.paused) {
        startingAudioRef.current.pause();
        startingAudioRef.current.currentTime = 0;
      }
      setCurrentTrack("main");
      const mainEl = mainAudioRef.current || audioRef.current;
      if (mainEl && mainEl.paused && isPlayingMusic) {
        mainEl.play().then(() => {
          if (onMusicToggle) onMusicToggle(true);
        }).catch(() => {});
      }
    } else if (hasStartingSong && isPlayingMusic) {
      if (startingAudioRef.current && startingAudioRef.current.paused) {
        startingAudioRef.current.play().catch(() => {});
      }
    }
  };

  const renderAudioPlayerWidget = () => {
    if ((!hasStartingSong && !hasMainSong) || config.showMusic === false) return null;

    if (config.showMusicWidget === false || isWidgetHidden) {
      return null;
    }

    const isCustomPos = widgetPos.x !== null && widgetPos.y !== null;
    const posStyle = isCustomPos 
      ? { left: `${widgetPos.x}px`, top: `${widgetPos.y}px` } 
      : { top: '75px', right: '16px' };

    // Active track display values
    const isStartingTrackActive = currentTrack === "starting";
    const activeTitle = isStartingTrackActive
      ? (config.startingMusicTitle || "Opening Prelude")
      : (config.musicTitle || "Wedding Melody");
    const activeArtist = isStartingTrackActive
      ? (config.startingMusicArtist || "Intro Song")
      : (config.musicArtist || "Celebration Melody");

    // Minimized Floating Music Badge Mode
    if (isWidgetMinimized) {
      return (
        <div
          ref={widgetRef}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          style={posStyle}
          className={`fixed z-50 flex items-center animate-fade-in ${isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'}`}
          title="Click & Drag to move anywhere • Tap to expand music controls"
        >
          <div 
            className="bg-slate-950/90 backdrop-blur-xl border border-amber-500/60 text-slate-100 rounded-full p-1.5 shadow-2xl flex items-center space-x-1.5 group hover:border-amber-400 hover:scale-105 transition-all select-none"
            title="Music Player Controls"
          >
            <span 
              className="text-slate-400 text-[10px] select-none pl-1 opacity-60 group-hover:opacity-100 cursor-grab"
              title="Click & Drag player"
            >
              ⠿
            </span>

            {/* Direct Play / Unmute / Pause Button */}
            <button
              type="button"
              onClick={toggleMusicPlayback}
              className="w-7 h-7 rounded-full bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/50 flex items-center justify-center text-amber-400 transition cursor-pointer"
              title={isPlayingMusic ? "Mute / Pause Music" : "Play / Unmute Music"}
            >
              {isPlayingMusic ? (
                <div className="flex items-end space-x-[2px] h-3.5 w-3.5 justify-center py-0.5">
                  <span className="w-[2px] bg-amber-400 animate-bounce h-full rounded-full" style={{ animationDuration: '0.6s' }} />
                  <span className="w-[2px] bg-amber-400 animate-bounce h-2/3 rounded-full" style={{ animationDuration: '0.9s' }} />
                  <span className="w-[2px] bg-amber-400 animate-bounce h-full rounded-full" style={{ animationDuration: '0.4s' }} />
                </div>
              ) : (
                <SvgVolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Expand Controls Icon */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsWidgetMinimized(false);
              }}
              className="text-[10px] text-slate-400 hover:text-amber-300 pr-1 transition cursor-pointer"
              title="Expand Full Controls"
            >
              ⚙
            </button>
          </div>
        </div>
      );
    }

    // Expanded Draggable Control Bar
    return (
      <div 
        ref={widgetRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={posStyle}
        className={`fixed z-50 flex items-center animate-fade-in ${isDragging ? 'cursor-grabbing scale-105' : ''}`}
      >
        <div className="bg-slate-950/90 backdrop-blur-xl border border-amber-500/50 text-slate-100 rounded-full px-3 py-1.5 shadow-2xl flex items-center space-x-2 relative transition-all">
          {/* Drag Handle */}
          <span 
            className="text-slate-400 hover:text-amber-400 text-[10px] cursor-grab select-none tracking-tighter shrink-0 pr-0.5"
            title="Click & Drag to move anywhere on screen"
          >
            ⠿
          </span>

          {/* Play / Pause Toggle Button */}
          <button 
            type="button"
            onClick={toggleMusicPlayback}
            className="w-7 h-7 rounded-full bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/50 flex items-center justify-center text-amber-400 transition cursor-pointer shrink-0"
            title={isPlayingMusic ? "Pause Music" : "Play / Unmute Music"}
          >
            {isPlayingMusic ? (
              <div className="flex items-end space-x-[2px] h-3.5 w-3.5 justify-center py-0.5">
                <span className="w-[2.5px] bg-amber-400 animate-bounce h-full rounded-full" style={{ animationDuration: '0.6s' }} />
                <span className="w-[2.5px] bg-amber-400 animate-bounce h-2/3 rounded-full" style={{ animationDuration: '0.9s' }} />
                <span className="w-[2.5px] bg-amber-400 animate-bounce h-full rounded-full" style={{ animationDuration: '0.4s' }} />
              </div>
            ) : (
              <SvgVolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Track Info */}
          <div className="flex flex-col text-left max-w-[105px] sm:max-w-[150px] overflow-hidden select-none">
            <span className="text-[9px] uppercase font-bold text-amber-400 tracking-wider flex items-center space-x-1">
              <span>🎵 {isStartingTrackActive ? "Intro Track" : "Main Song"}</span>
              {isPlayingMusic && <span className="text-[7.5px] text-emerald-400 font-extrabold animate-pulse">• LIVE</span>}
            </span>
            <span className="text-[10px] font-semibold text-slate-200 truncate font-sans" title={activeTitle}>
              {activeTitle}
            </span>
            {activeArtist && (
              <span className="text-[8px] text-slate-400 truncate font-sans">
                {activeArtist}
              </span>
            )}
          </div>

          {/* Track Switcher Button (if both Starting and Main songs are available) */}
          {hasStartingSong && hasMainSong && (
            <button
              type="button"
              onClick={() => {
                const nextTrack = isStartingTrackActive ? "main" : "starting";
                if (startingAudioRef.current) startingAudioRef.current.pause();
                if (mainAudioRef.current) mainAudioRef.current.pause();
                if (audioRef.current) audioRef.current.pause();
                setCurrentTrack(nextTrack);
                const nextEl = nextTrack === "starting" ? startingAudioRef.current : (mainAudioRef.current || audioRef.current);
                if (nextEl) {
                  nextEl.play().then(() => {
                    if (onMusicToggle) onMusicToggle(true);
                  }).catch(() => {});
                }
              }}
              className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-300 text-[8px] font-extrabold uppercase transition cursor-pointer shrink-0 shadow-sm"
              title={isStartingTrackActive ? "Switch to Main Song" : "Switch to Starting Song"}
            >
              <span>⇄ {isStartingTrackActive ? "Main" : "Intro"}</span>
            </button>
          )}

          {/* Volume Control Toggle Button */}
          <button
            type="button"
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="p-1 rounded-full text-slate-400 hover:text-amber-400 transition cursor-pointer"
            title="Adjust Volume"
          >
            <SvgVolume2 className="w-3.5 h-3.5" />
          </button>

          {/* Minimize Button */}
          <button
            type="button"
            onClick={() => setIsWidgetMinimized(true)}
            className="p-1 rounded-full text-slate-400 hover:text-amber-300 transition cursor-pointer flex items-center justify-center w-5 h-5"
            title="Minimize Player to Floating Badge"
          >
            <span className="text-[10px] font-bold">_</span>
          </button>

          {/* Close / Turn Off Button */}
          <button
            type="button"
            onClick={() => setIsWidgetHidden(true)}
            className="p-1 rounded-full text-slate-400 hover:text-rose-400 transition cursor-pointer flex items-center justify-center w-5 h-5"
            title="Turn Off Floating Music Icon"
          >
            <span className="text-[10px] font-bold">✕</span>
          </button>

          {/* Expanded Volume Slider Dropdown */}
          {showVolumeSlider && (
            <div className="absolute top-full right-0 mt-2 p-2.5 bg-slate-950/95 backdrop-blur-xl border border-amber-500/40 rounded-xl shadow-2xl flex items-center space-x-2 w-36 z-50 animate-fade-in">
              <span className="text-[10px] text-amber-400 font-bold">🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setAudioVolume(val);
                  if (audioRef.current) audioRef.current.volume = val;
                  if (startingAudioRef.current) startingAudioRef.current.volume = val;
                  if (mainAudioRef.current) mainAudioRef.current.volume = val;
                }}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[9px] text-slate-300 font-mono w-7 text-right">{Math.round(audioVolume * 100)}%</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleTouchGlowMove = (e) => {
    if (config.revealEffect !== 'touch-glow') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
    setTorchPos({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
  };

  const handleTriggerEffect = (e) => {
    if (isScratchFinished) return;
    const effect = config.revealEffect || 'scratch';
    const speedSecs = parseFloat(config.revealSpeed || "1.0");
    const delayMs = speedSecs * 1000;
    
    if (effect === 'touch-glow') {
      // For touch glow, click permanently reveals it
      setRevealClass("magic-fading");
      setTimeout(() => {
        setIsScratchFinished(true);
        triggerCelebration();
      }, delayMs);
      return;
    }

    if (effect === 'door-open') {
      setRevealClass("doors-open");
      setTimeout(() => {
        setIsScratchFinished(true);
        triggerCelebration();
      }, delayMs * 1.1);
    } else if (effect === 'magical-fade') {
      setRevealClass("magic-fading");
      setTimeout(() => {
        setIsScratchFinished(true);
        triggerCelebration();
      }, delayMs);
    } else if (effect === 'slide-left-right') {
      setRevealClass("slide-awaying");
      setTimeout(() => {
        setIsScratchFinished(true);
        triggerCelebration();
      }, delayMs * 0.9);
    } else if (effect === 'page-tear') {
      setRevealClass("tearing");
      setTimeout(() => {
        setIsScratchFinished(true);
        triggerCelebration();
      }, delayMs * 1.1);
    } else if (effect === 'particle-blow') {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      const newSparks = [];
      for (let i = 0; i < 40; i++) {
        newSparks.push({
          id: i,
          x: clickX,
          y: clickY,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12 - 4,
          color: i % 2 === 0 ? (config.revealColor || config.accentGold || '#f59e0b') : '#ffffff'
        });
      }
      setRevealSparks(newSparks);
      setRevealClass("magic-fading");
      
      let start = null;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        setRevealSparks(prev => prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.15
        })));
        if (progress < delayMs) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);

      setTimeout(() => {
        setIsScratchFinished(true);
        setRevealSparks([]);
        triggerCelebration();
      }, delayMs);
    } else if (effect === 'break-wall') {
      setRevealClass("broken-wall");
      setTimeout(() => {
        setIsScratchFinished(true);
        triggerCelebration();
      }, delayMs * 1.1);
    } else if (effect === 'sparkle-burst') {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const sparks = [];
      for (let i = 0; i < 35; i++) {
        sparks.push({
          id: i,
          x: clickX,
          y: clickY,
          vx: (Math.random() - 0.5) * 16,
          vy: (Math.random() - 0.5) * 16,
          color: i % 2 === 0 ? (config.revealColor || config.accentGold || '#f59e0b') : '#ffffff'
        });
      }
      setRevealSparks(sparks);
      setRevealClass("magic-fading");
      
      let start = null;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        setRevealSparks(prev => prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy
        })));
        if (progress < delayMs) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);

      setTimeout(() => {
        setIsScratchFinished(true);
        setRevealSparks([]);
        triggerCelebration();
      }, delayMs);
    } else if (effect === 'heart-pop') {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const sparks = [];
      for (let i = 0; i < 25; i++) {
        sparks.push({
          id: i,
          x: clickX,
          y: clickY,
          vx: (Math.random() - 0.5) * 8,
          vy: -Math.random() * 8 - 2,
          color: config.revealColor || '#f43f5e'
        });
      }
      setRevealSparks(sparks);
      setRevealClass("magic-fading");
      
      let start = null;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        setRevealSparks(prev => prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy
        })));
        if (progress < delayMs) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);

      setTimeout(() => {
        setIsScratchFinished(true);
        setRevealSparks([]);
        triggerCelebration();
      }, delayMs);
    } else if (['starry-night', 'curtain-draw', 'diamond-shimmer', 'circular-ripple', 'lotus-bloom'].includes(effect)) {
      const effectClasses = {
        'starry-night': 'magic-fading',
        'curtain-draw': 'curtains-drawing',
        'diamond-shimmer': 'shimmering',
        'circular-ripple': 'rippling',
        'lotus-bloom': 'blooming'
      };
      setRevealClass(effectClasses[effect]);
      const delays = {
        'starry-night': delayMs,
        'curtain-draw': delayMs * 1.1,
        'diamond-shimmer': delayMs,
        'circular-ripple': delayMs,
        'lotus-bloom': delayMs * 1.1
      };
      setTimeout(() => {
        setIsScratchFinished(true);
        triggerCelebration();
      }, delays[effect]);
    }
  };

  const triggerCelebration = useCallback((forcedType = null) => {
    if (config.scratchCelebrationEnabled === false && !forcedType) return;
    if (forcedType) setPreviewCelebrationType(forcedType);
    setShowGraffiti(true);
  }, [config.scratchCelebrationEnabled]);

  const handleCelebrationComplete = useCallback(() => {
    setShowGraffiti(false);
    setPreviewCelebrationType(null);
  }, []);

  useEffect(() => {
    const handlePreview = (e) => {
      const type = e.detail || config.celebrationParticleType || 'graffiti';
      setPreviewCelebrationType(type);
      setShowGraffiti(true);
    };
    window.addEventListener('triggerCelebrationPreview', handlePreview);
    return () => window.removeEventListener('triggerCelebrationPreview', handlePreview);
  }, [config.celebrationParticleType]);

  // Identify if this guest has already registered an RSVP
  const existingRsvpForGuest = useMemo(() => {
    if (!rsvpForm.name.trim()) return null;
    return (rsvps || []).find(r => (r.name || "").trim().toLowerCase() === rsvpForm.name.trim().toLowerCase());
  }, [rsvps, rsvpForm.name]);

  // Ensure all displayed blessings from guests are preserved and shown without being filtered
  const uniqueWishes = useMemo(() => {
    return Array.isArray(wishes) ? wishes : [];
  }, [wishes]);

  const handleRsvpFormSubmit = (e) => {
    e.preventDefault();
    if (!rsvpForm.name.trim()) return;
    
    // Remember this guest's response on this device for seamless editing later
    try {
      localStorage.setItem(`ds_guest_rsvp_${invitationId}`, JSON.stringify(rsvpForm));
    } catch (err) {}

    if (onSubmitRsvp) {
      onSubmitRsvp(rsvpForm);
    }
  };

  const handleWishFormSubmit = (e) => {
    e.preventDefault();
    const sender = (wishForm.sender || "").trim();
    const message = (wishForm.message || "").trim();
    if (!sender || !message) return;

    if (onSubmitWish) {
      onSubmitWish({ sender, message });
    }

    // Reset inputs so multiple people/names can post their own blessings!
    setWishForm({ sender: "", message: "" });
  };

  const isLightBackground = useMemo(() => {
    const hex = (config.primaryColor || "#0b1329").replace('#', '');
    if (hex.length !== 6) return false;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  }, [config.primaryColor]);

  const defaultBodyTextColor = isLightBackground ? "#1e293b" : "#faf6f0";
  const defaultSubtitleColor = isLightBackground ? "#8a2b3f" : (config.accentGold || "#f59e0b");
  const defaultLabelColor = isLightBackground ? "#0f172a" : "#faf6f0";

  const customStyles = {
    colorAccent: { color: isLightBackground ? "#8a2b3f" : (config.accentGold || "#f59e0b") },
    borderColorAccent: { borderColor: config.accentGold || '#f59e0b' },
    bgPrimary: { backgroundColor: config.primaryColor },
    bgSecondary: { backgroundColor: config.lightBgColor },
    borderAccentSoft: { borderColor: `${config.accentGold || '#f59e0b'}40` },
    
    glassButton: {
      backgroundColor: config.glassBtnBg || "rgba(255, 255, 255, 0.12)",
      borderColor: config.glassBtnBorder || "rgba(245, 158, 11, 0.35)",
      color: config.glassBtnText || "#ffffff",
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      boxShadow: `0 8px ${config.glassBtnShadowSize || "16"}px ${config.glassBtnShadow || "rgba(245, 158, 11, 0.5)"}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    
    coverBorder: {
      borderColor: config.coverBorderColor || config.accentGold || '#f59e0b',
      borderWidth: `${config.coverBorderSize !== undefined ? config.coverBorderSize : 2}px`,
      borderStyle: 'solid',
      opacity: config.coverBorderOpacity !== undefined ? config.coverBorderOpacity : 1.0,
      width: `${config.coverCornerSize !== undefined ? config.coverCornerSize : 32}px`,
      height: `${config.coverCornerSize !== undefined ? config.coverCornerSize : 32}px`
    },
    coverInnerBorder: {
      border: (config.coverInnerBorderEnabled !== false)
        ? `1px solid ${config.coverInnerBorderColor || 'rgba(255, 255, 255, 0.15)'}`
        : 'none'
    }
  };

  return (
    <div 
      className={`invitation-render-root relative transition-colors duration-500 w-full ${!isEnvelopeOpened && config.showEnvelope !== false && !isPrintMode ? 'h-screen h-dvh max-h-screen overflow-hidden' : `min-h-screen overflow-x-hidden ${config.showGlobalBorder !== false && config.globalBorderImage ? 'pb-40 sm:pb-52' : 'pb-12'}`}`} 
      style={{ 
        backgroundColor: config.primaryColor, 
        color: defaultBodyTextColor,
        '--reveal-speed': `${config.revealSpeed || '1.0'}s`,
        '--reveal-color': config.revealColor || config.accentGold || '#f59e0b'
      }}
    >
      {/* Envelope Opener Screen Overlay — Fixed to full page, non-scrollable, responsive on all devices */}
      {!isEnvelopeOpened && config.showEnvelope !== false && !isPrintMode && (
        <div 
          className="fixed inset-0 z-[60] w-full h-full h-dvh max-h-screen overflow-hidden select-none"
          style={{ touchAction: 'none', overscrollBehavior: 'none' }}
        >
          <EnvelopeOpener 
            config={config} 
            onOpen={handleEnvelopeOpen} 
            onOpenComplete={handleEnvelopeComplete}
            isOpeningAnim={envelopeOpeningAnim}
            onChangeField={onChangeField}
            onSelectElement={onSelectElement}
            activeColorId={activeColorId}
            setActiveColorId={setActiveColorId}
          />
        </div>
      )}

      {/* Permanent, Uninterrupted Dual-Track Audio Players */}
      {!isPrintMode && (
        <>
          {hasStartingSong && (
            <audio
              ref={startingAudioRef}
              src={formatDriveDirectUrl(startingSongUrl, "audio")}
              autoPlay={config.autoPlayMusic !== false && !isEnvelopeOpened}
              playsInline
              loop={!isEnvelopeOpened}
              preload="auto"
              onPlay={() => {
                // HARD BROWSER-LEVEL EXCLUSION: If Song 1 starts, Song 2 MUST be stopped immediately!
                const mainEl = mainAudioRef.current || audioRef.current;
                if (mainEl && !mainEl.paused) {
                  mainEl.pause();
                  mainEl.currentTime = 0;
                }
              }}
              onError={(e) => {
                if (e.target.src && !e.target.src.endsWith('/music_intro.mp3')) {
                  e.target.src = '/music_intro.mp3';
                  e.target.load();
                  if (isPlayingMusic && !isEnvelopeOpenedRef.current) {
                    e.target.play().catch(() => {});
                  }
                }
              }}
              onEnded={() => {
                // If envelope is still closed, replay Song 1! DO NOT transition to Song 2!
                if (!isEnvelopeOpenedRef.current) {
                  const startEl = startingAudioRef.current;
                  if (startEl) {
                    startEl.currentTime = 0;
                    startEl.play().catch(() => {});
                  }
                  return;
                }
                // Only if envelope is open and hasMainSong:
                if (hasMainSong) {
                  setCurrentTrack("main");
                  const mainEl = mainAudioRef.current || audioRef.current;
                  if (mainEl) {
                    mainEl.currentTime = 0;
                    mainEl.play().catch(e => console.log("Transition to main song:", e));
                  }
                }
              }}
            />
          )}
          {hasMainSong && (
            <audio
              ref={(el) => {
                mainAudioRef.current = el;
                audioRef.current = el;
              }}
              src={formatDriveDirectUrl(config.musicUrl, "audio")}
              playsInline
              loop={config.loopMusic !== false}
              preload="auto"
              onPlay={() => {
                // HARD BROWSER-LEVEL EXCLUSION: If Song 2 starts, Song 1 MUST be stopped immediately!
                if (startingAudioRef.current && !startingAudioRef.current.paused) {
                  startingAudioRef.current.pause();
                  startingAudioRef.current.currentTime = 0;
                }
              }}
              onError={(e) => {
                if (e.target.src && !e.target.src.endsWith('/music_wedding.mp3')) {
                  e.target.src = '/music_wedding.mp3';
                  e.target.load();
                  if (isPlayingMusic && isEnvelopeOpenedRef.current) {
                    e.target.play().catch(() => {});
                  }
                }
              }}
            />
          )}
        </>
      )}

      {!isPrintMode && renderAudioPlayerWidget()}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@400;700&family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=Great+Vibes&family=Inter:wght@300;400;600&family=Italiana&family=Marcellus&family=Montserrat:wght@300;600&family=Pinyon+Script&family=Playball&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Rozha+One&family=Yatra+One&family=Teko:wght@400;600&family=El+Messiri:wght@400;700&family=Reem+Kufi:wght@400;700&family=Aref+Ruqaa:wght@400;700&display=swap');

        .font-cinzel { font-family: 'Cinzel', Georgia, serif; }
        .font-cinzel-dec { font-family: 'Cinzel Decorative', Georgia, serif; }
        .font-cursive { font-family: 'Great Vibes', cursive, serif; }
        .font-serif { font-family: 'Playfair Display', Georgia, serif; }
        .font-cormorant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-italiana { font-family: 'Italiana', Georgia, serif; }
        .font-alex { font-family: 'Alex Brush', cursive, serif; }
        .font-pinyon { font-family: 'Pinyon Script', cursive, serif; }
        .font-playball { font-family: 'Playball', cursive, serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-yatra { font-family: 'Yatra One', cursive, sans-serif; }
        .font-rozha { font-family: 'Rozha One', serif; }
        .font-teko { font-family: 'Teko', sans-serif; }
        .font-messiri { font-family: 'El Messiri', sans-serif; }
        .font-reem { font-family: 'Reem Kufi', sans-serif; }
        .font-aref { font-family: 'Aref Ruqaa', serif; }
        .font-marcellus { font-family: 'Marcellus', serif; }

        .glass-btn-hover:hover {
          transform: translateY(-4px) scale(1.04);
          filter: brightness(1.15);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.15); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--reveal-color, ${config.accentGold}); border-radius: 4px; }

        /* --- FLOATING BACKGROUND ANIMATION --- */
        @keyframes floatBg {
          0% {
            transform: translate3d(0, 0px, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -20px, 0) rotate(180deg);
          }
          100% {
            transform: translate3d(0, 0px, 0) rotate(360deg);
          }
        }
        .animate-float {
          animation: floatBg 16s ease-in-out infinite;
          will-change: transform;
          backface-visibility: hidden;
        }

        /* --- 10 REVEAL EFFECTS STYLES --- */
        
        /* 1. Door Open Swinging panels */
        .doors-open {
          perspective: 1200px;
        }
        .door-panel {
          transition: transform var(--reveal-speed, 1.2s) cubic-bezier(0.77, 0, 0.175, 1);
          backface-visibility: hidden;
          z-index: 25;
        }
        .door-left {
          transform-origin: left center;
        }
        .door-right {
          transform-origin: right center;
        }
        .doors-open .door-left {
          transform: perspective(1200px) rotateY(-95deg);
        }
        .doors-open .door-right {
          transform: perspective(1200px) rotateY(95deg);
        }

        /* 2. Magical Glow Fade */
        .magic-fading {
          animation: magicFadeOut var(--reveal-speed, 1s) cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes magicFadeOut {
          0% {
            opacity: 1;
            filter: brightness(1) blur(0px);
          }
          40% {
            opacity: 0.9;
            filter: brightness(1.8) blur(3px);
            box-shadow: inset 0 0 50px var(--reveal-color, ${config.accentGold || '#f59e0b'});
          }
          100% {
            opacity: 0;
            filter: brightness(2.5) blur(15px);
            pointer-events: none;
          }
        }

        /* 3. Page Tear diagonal peel */
        .tear-panel {
          transition: transform var(--reveal-speed, 1.2s) cubic-bezier(0.3, 1, 0.4, 1);
          z-index: 25;
        }
        .tearing .tear-top {
          transform: translateY(-100%) rotate(-8deg);
        }
        .tearing .tear-bottom {
          transform: translateY(100%) rotate(8deg);
        }

        /* 4. Slide Left/Right */
        .slide-panel {
          transition: transform var(--reveal-speed, 1s) cubic-bezier(0.85, 0, 0.15, 1);
          z-index: 25;
        }
        .slide-awaying .slide-left {
          transform: translateX(-100%);
        }
        .slide-awaying .slide-right {
          transform: translateX(100%);
        }

        /* 5. Break the Wall (Grid Shatter translation/rotation/gravity) */
        .broken-wall .brick-tile:nth-child(3n) {
          transform: translate(180px, 80px) rotate(60deg) scale(0.4);
          opacity: 0;
        }
        .broken-wall .brick-tile:nth-child(3n+1) {
          transform: translate(-180px, 120px) rotate(-60deg) scale(0.4);
          opacity: 0;
        }
        .broken-wall .brick-tile:nth-child(3n+2) {
          transform: translate(0px, 220px) rotate(35deg) scale(0.4);
          opacity: 0;
        }

        /* Holy Symbol PNG Soft Glow contour shadow */
        .holy-symbol-glow {
          filter: drop-shadow(0 0 10px var(--reveal-color, ${config.accentGold || '#f59e0b'}));
          animation: holyPulse 2.5s infinite ease-in-out;
        }
        @keyframes holyPulse {
          0%, 100% {
            filter: drop-shadow(0 0 6px var(--reveal-color, ${config.accentGold || '#f59e0b'}));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 16px var(--reveal-color, ${config.accentGold || '#f59e0b'}));
            transform: scale(1.03);
          }
        }

        /* --- 5 NEW REVEAL EFFECTS CLASSES --- */

        /* 11. Curtain Draw Velvet parting */
        .curtain-panel {
          transition: transform var(--reveal-speed, 1.2s) cubic-bezier(0.77, 0, 0.175, 1);
          z-index: 25;
        }
        .curtains-drawing .curtain-left {
          transform: translateX(-100%);
        }
        .curtains-drawing .curtain-right {
          transform: translateX(100%);
        }

        /* 12. Diamond Shimmer Glare sweep */
        .shimmer-sweep {
          transition: transform var(--reveal-speed, 1s) cubic-bezier(0.25, 1, 0.5, 1);
        }
        .shimmering .shimmer-sweep {
          transform: translateX(250%) skewX(12deg);
        }
        .shimmering {
          animation: magicFadeOut var(--reveal-speed, 1s) ease-out forwards;
        }

        /* 13. Circular Ripple expanding rings */
        .ripple-wave {
          transition: transform var(--reveal-speed, 1s) ease-out, opacity var(--reveal-speed, 1s) ease-out;
        }
        .rippling .ripple-wave {
          transform: scale(8);
          opacity: 0;
        }
        .rippling {
          animation: magicFadeOut var(--reveal-speed, 1s) ease-out forwards;
        }

        /* 14. Lotus Bloom expanding/rotating petals */
        .lotus-svg-box {
          transition: transform var(--reveal-speed, 1.1s) cubic-bezier(0.34, 1.56, 0.64, 1), opacity var(--reveal-speed, 1s) ease-out;
        }
        .blooming .lotus-svg-box {
          transform: scale(3.5) rotate(185deg);
          opacity: 0;
        }
        .blooming {
          animation: magicFadeOut var(--reveal-speed, 1.1s) ease-out forwards;
        }
      `}</style>

      {/* Decorative background shapes */}
      {config.bgShapesType && config.bgShapesType !== 'none' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 w-full h-full">
          {backgroundShapes.map(s => {
            const sizeStyle = {
              width: `${s.size * (parseFloat(config.bgShapesSize || "1.0"))}px`,
              height: `${s.size * (parseFloat(config.bgShapesSize || "1.0"))}px`,
              left: `${s.x}%`,
              top: `${s.y}%`,
              opacity: config.bgShapesOpacity || 0.15,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
              color: s.color
            };
            
            return (
              <div
                key={s.id}
                className="absolute animate-float"
                style={sizeStyle}
              >
                {config.bgShapesType === 'floating-circles' && (
                  <div className="w-full h-full rounded-full border border-current bg-current/5 shadow-[0_0_12px_rgba(255,255,255,0.05)]" />
                )}
                {config.bgShapesType === 'floating-hearts' && (
                  <SvgHeart className="w-full h-full text-current" fill="currentColor" />
                )}
                {config.bgShapesType === 'floating-petals' && (
                  <svg viewBox="0 0 24 24" className="w-full h-full text-current" fill="currentColor">
                    <path d="M12 2C7 2 4 6 4 11s3 9 8 11c5-2 8-6 8-11S17 2 12 2z" />
                  </svg>
                )}
                {config.bgShapesType === 'sparkling-stars' && (
                  <SvgSparkles className="w-full h-full text-current animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sleek, Realistic 3D Luxury Metallic Border Frame (Unstretched 4-Corner Architecture) */}
      <GlobalBorderFrame config={config} isPrintMode={isPrintMode} />

      {/* Realistic 60fps Celebration Particle Effects with Transparent Background (NO black box cutout) */}
      {!isPrintMode && (
        <CelebrationOverlay
          active={showGraffiti}
          type={previewCelebrationType || config.celebrationParticleType || 'graffiti'}
          duration={3600}
          onComplete={handleCelebrationComplete}
        />
      )}

      {/* Navigation and Controller */}
      {!isPrintMode && (
        <header className="sticky top-0 z-30 backdrop-blur-md bg-opacity-70 py-3 px-4 flex items-center justify-between border-b" style={{ borderColor: `${config.accentGold}35`, backgroundColor: `${config.primaryColor}df` }}>
          <div className="flex items-center space-x-2.5">
            {!isPaid ? (
              <Link 
                to="/"
                className="flex items-center group transition transform hover:scale-105 shrink-0 mr-1.5"
                title={brandSettings?.brandName || "DS Envite"}
              >
                {brandSettings?.logoUrl ? (
                  <div className={`w-5.5 h-5.5 sm:w-6 sm:h-6 flex items-center justify-center overflow-hidden border border-amber-500/40 shadow-sm ${
                    brandSettings.logoShape === 'circle' ? 'rounded-full' : brandSettings.logoShape === 'square' ? 'rounded-none' : 'rounded-md'
                  } bg-slate-950/85 backdrop-blur-md shrink-0 group-hover:border-amber-400 transition`}>
                    <img
                      src={brandSettings.logoUrl}
                      alt={brandSettings.brandName || "Platform Logo"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/40 flex items-center justify-center shadow-sm group-hover:border-amber-400 transition">
                    <span className="font-cinzel text-amber-300 font-bold text-[8.5px] tracking-tight">
                      {(brandSettings?.brandName || "DS").split(" ").map(w => w[0]).join("").slice(0, 2) || "DS"}
                    </span>
                  </div>
                )}
              </Link>
            ) : (
              <SvgHeart className="w-4 h-4 text-rose-500 animate-pulse shrink-0 mr-1" fill="rgba(244,63,94,0.3)" />
            )}
            <span className="font-cinzel tracking-wider text-xs sm:text-sm pl-1" style={customStyles.colorAccent}>
              {config.brideName} &amp; {config.groomName}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {onMusicToggle && (
              <button
                type="button"
                onClick={toggleMusicPlayback}
                className="p-1.5 rounded-full hover:bg-white/10 transition flex items-center justify-center text-xs cursor-pointer"
                title={isPlayingMusic ? "Pause Music" : "Play / Unmute Music"}
              >
                {isPlayingMusic ? <SvgVolume2 className="w-4 h-4 animate-bounce text-emerald-400" /> : <SvgVolumeX className="w-4 h-4 opacity-50" />}
              </button>
            )}
          </div>
        </header>
      )}

      {/* Sacred Scripture Header */}
      {config.showSacredSection !== false && (
        <div 
          id="sacred-section"
          className={`px-4 pb-6 text-center border-b ${config.showGlobalBorder !== false && config.globalBorderImage ? 'pt-16 sm:pt-20' : 'py-6'}`}
          style={{ 
            borderColor: `${config.accentGold}20`, 
            backgroundColor: `${config.primaryColor}40`,
            boxShadow: config.sacredShadowEnabled !== false
              ? `0 ${config.sacredShadowY ?? 6}px ${config.sacredShadowBlur ?? 16}px ${config.sacredShadowSpread ?? -3}px ${config.sacredShadowColor || 'rgba(0, 0, 0, 0.15)'}`
              : 'none'
          }}
        >
          <div className="max-w-2xl mx-auto space-y-2 flex flex-col items-center">
            {config.showSacredSymbol !== false && config.customSacredSymbolImg && (
              <div
                className="mx-auto mb-2 text-center"
                style={{
                  transform: `translate(${config.customSacredSymbolImgX || 0}px, ${config.customSacredSymbolImgY || 0}px) rotate(${config.customSacredSymbolImgRotate || 0}deg)`,
                  transition: 'transform 0.15s ease'
                }}
              >
                <div 
                  className="relative inline-block cursor-pointer group"
                  style={{
                    filter: `drop-shadow(${config.customSacredSymbolImgShadowX || 0}px ${config.customSacredSymbolImgShadowY || 3}px ${config.customSacredSymbolImgShadowBlur || 8}px ${config.customSacredSymbolImgShadowColor || 'rgba(0,0,0,0.45)'})`,
                    opacity: config.customSacredSymbolImgOpacity !== undefined ? config.customSacredSymbolImgOpacity : 1,
                  }}
                  onClick={(e) => { e.stopPropagation(); onSelectElement && onSelectElement({ tabId: 'cover', field: 'customSacredSymbolImg' }); }}
                >
                  <img 
                    src={formatDriveDirectUrl(config.customSacredSymbolImg, "image")} 
                    alt="Holy Symbol" 
                    style={{
                      width: `${config.customSacredSymbolImgSizePx || 56}px`,
                      height: `${config.customSacredSymbolImgSizePx || 56}px`,
                      objectFit: 'contain',
                      transform: `scale(${config.customSacredSymbolImgScale !== undefined ? config.customSacredSymbolImgScale : 1})`,
                      mixBlendMode: config.customSacredSymbolImgBlendMode || 'normal'
                    }}
                    className="object-contain holy-symbol-glow hover:outline hover:outline-1 hover:outline-amber-500/50 rounded transition-all select-none group-hover:scale-105" 
                  />
                  {config.customSacredSymbolImgTintColor && (
                    <div
                      className="absolute inset-0 pointer-events-none rounded"
                      style={{
                        backgroundColor: config.customSacredSymbolImgTintColor,
                        mixBlendMode: config.customSacredSymbolImgBlendMode || 'color',
                        WebkitMaskImage: `url("${formatDriveDirectUrl(config.customSacredSymbolImg, "image")}")`,
                        WebkitMaskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        maskImage: `url("${formatDriveDirectUrl(config.customSacredSymbolImg, "image")}")`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center'
                      }}
                    />
                  )}
                </div>
              </div>
            )}
            {config.showSacredSymbol !== false && config.customSacredSymbol && (
              <EditableText config={config}
                as="span"
                isEditing={!!onChangeField}
                onChangeField={onChangeField}
                onSelect={onSelectElement}
                tabId="cover"
                field="customSacredSymbol"
                activeColorId={activeColorId}
                setActiveColorId={setActiveColorId}
                popoverId="customSacredSymbol"
                onChangeColor={(color) => onChangeField && onChangeField('customSacredSymbolColor', color)}
                colorValue={config.customSacredSymbolColor || config.sacredSymbolColor || config.accentGold || '#b89254'}
                className={`block animate-pulse ${config.customSacredSymbolFont || 'font-sans'} ${config.customSacredSymbolSize || 'text-xl sm:text-2xl font-semibold'}`}
                style={{ 
                  color: config.customSacredSymbolColor || config.sacredSymbolColor || config.accentGold || '#b89254',
                  textAlign: (config.customSacredSymbolAlign || 'center') === 'left' ? 'left' : (config.customSacredSymbolAlign === 'right' ? 'right' : 'center'),
                  opacity: config.customSacredSymbolOpacity !== undefined ? config.customSacredSymbolOpacity : 1,
                  filter: config.customSacredSymbolGlow !== undefined ? `brightness(${config.customSacredSymbolGlow}%)` : undefined,
                  transform: config.customSacredSymbolYOffset ? `translateY(${config.customSacredSymbolYOffset}px)` : undefined
                }}
                value={config.customSacredSymbol}
              />
            )}
            {config.showSacredVerse !== false && config.customSacredVerse && (
              <EditableText config={config}
                as="p"
                isEditing={!!onChangeField}
                onChangeField={onChangeField}
                onSelect={onSelectElement}
                tabId="cover"
                field="customSacredVerse"
                activeColorId={activeColorId}
                setActiveColorId={setActiveColorId}
                popoverId="customSacredVerse"
                onChangeColor={(color) => onChangeField && onChangeField('customSacredVerseColor', color)}
                colorValue={config.customSacredVerseColor || config.sacredVerseColor || config.lightBgColor || '#faf6f0'}
                className={`italic tracking-wide max-w-xl mx-auto leading-relaxed pt-1 ${config.customSacredVerseFont || 'font-serif'} ${config.customSacredVerseSize || 'text-xs sm:text-sm'}`}
                style={{ 
                  color: config.customSacredVerseColor || config.sacredVerseColor || config.lightBgColor || '#faf6f0',
                  textAlign: (config.customSacredVerseAlign || 'center') === 'left' ? 'left' : (config.customSacredVerseAlign === 'right' ? 'right' : 'center'),
                  opacity: config.customSacredVerseOpacity !== undefined ? config.customSacredVerseOpacity : 0.8,
                  filter: config.customSacredVerseGlow !== undefined ? `brightness(${config.customSacredVerseGlow}%)` : undefined,
                  transform: config.customSacredVerseYOffset ? `translateY(${config.customSacredVerseYOffset}px)` : undefined
                }}
                value={config.customSacredVerse}
              />
            )}
          </div>
        </div>
      )}

      {/* 3D SCROLL PERSPECTIVE SECTIONS BODY */}
      <div className={`space-y-12 max-w-5xl mx-auto relative z-10 ${config.showGlobalBorder !== false && config.globalBorderImage ? 'px-8 sm:px-16 md:px-24' : 'px-4'} ${config.showSacredSection === false && config.showGlobalBorder !== false && config.globalBorderImage ? 'pt-20 sm:pt-28' : 'pt-4'}`}>

        {/* 1. MAIN HERO BANNER */}
        {config.showCoverSection !== false && (
          <Scroll3DContainer
            enabled={!isPrintMode && config.scroll3DEnabled !== false}
            intensity={config.scroll3DIntensity || 4}
            perspective={config.scroll3DPerspective || 900}
            effectType={config.scroll3DEffectType || '3d-roll'}
          >
            <section 
              id="cover-section"
              className="relative min-h-[75vh] flex flex-col justify-center items-center text-center p-6 bg-cover bg-center overflow-hidden w-full mx-auto rounded-3xl" 
              style={{ 
                backgroundImage: `linear-gradient(${config.coverBgOverlayStart || 'rgba(0, 0, 0, 0.45)'}, ${config.coverBgOverlayEnd || 'rgba(0, 0, 0, 0.70)'}), url("${formatDriveDirectUrl(config.heroImage, "image")}")`,
                backgroundSize: config.coverHeroScale ? `${config.coverHeroScale}%` : 'cover',
                backgroundPosition: `${config.coverHeroXOffset ?? 50}% ${config.coverHeroYOffset ?? 50}%`,
                boxShadow: config.coverShadowEnabled !== false
                  ? `0 ${config.coverShadowY ?? 10}px ${config.coverShadowBlur ?? 25}px ${config.coverShadowSpread ?? -5}px ${config.coverShadowColor || 'rgba(0, 0, 0, 0.35)'}`
                  : 'none'
              }}
            >
              {config.coverInnerBorderEnabled !== false && (
                <div 
                  className="absolute inset-4 sm:inset-8 rounded-2xl pointer-events-none flex flex-col justify-between p-3"
                  style={customStyles.coverInnerBorder}
                >
                  {config.coverBorderEnabled !== false && (
                    <>
                      <div className="flex justify-between">
                        <div style={{ ...customStyles.coverBorder, borderRightWidth: 0, borderBottomWidth: 0 }} />
                        <div style={{ ...customStyles.coverBorder, borderLeftWidth: 0, borderBottomWidth: 0 }} />
                      </div>
                      <div className="flex justify-between">
                        <div style={{ ...customStyles.coverBorder, borderRightWidth: 0, borderTopWidth: 0 }} />
                        <div style={{ ...customStyles.coverBorder, borderLeftWidth: 0, borderTopWidth: 0 }} />
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="max-w-3xl relative z-10 px-4">
                {config.showCoverTopTagline !== false && (
                  <EditableText config={config}
                    as="span"
                    isEditing={!!onChangeField}
                    onChangeField={onChangeField}
                    onSelect={onSelectElement}
                    tabId="cover"
                    field="coverTopTaglineText"
                    activeColorId={activeColorId}
                    setActiveColorId={setActiveColorId}
                    popoverId="coverTopTagline"
                    onChangeColor={(color) => onChangeField && onChangeField('coverTopTaglineTextColor', color)}
                    colorValue={config.coverTopTaglineTextColor || config.coverTopTaglineColor || config.accentGold || '#f59e0b'}
                    className={`${config.coverTopTaglineTextFont || config.coverTopTaglineFont || 'font-sans'} ${config.coverTopTaglineTextSize || config.coverTopTaglineSize || 'text-[10px] sm:text-xs'} ${config.coverTopTaglineSpacing || 'tracking-[0.3em]'} uppercase block mb-4`}
                    style={{ 
                      color: config.coverTopTaglineTextColor || config.coverTopTaglineColor || config.accentGold || '#f59e0b',
                      textAlign: (config.coverTopTaglineTextAlign || config.coverTopTaglineAlign) === 'left' ? 'left' : (config.coverTopTaglineTextAlign || config.coverTopTaglineAlign) === 'right' ? 'right' : 'center',
                      opacity: (config.coverTopTaglineTextOpacity !== undefined ? config.coverTopTaglineTextOpacity : config.coverTopTaglineOpacity) !== undefined ? (config.coverTopTaglineTextOpacity !== undefined ? config.coverTopTaglineTextOpacity : config.coverTopTaglineOpacity) : 1,
                      filter: (config.coverTopTaglineTextGlow !== undefined ? config.coverTopTaglineTextGlow : config.coverTopTaglineGlow) !== undefined ? `brightness(${config.coverTopTaglineTextGlow !== undefined ? config.coverTopTaglineTextGlow : config.coverTopTaglineGlow}%)` : undefined,
                      transform: (config.coverTopTaglineTextYOffset || config.coverTopTaglineYOffset) ? `translateY(${config.coverTopTaglineTextYOffset || config.coverTopTaglineYOffset}px)` : undefined
                    }}
                    value={config.coverTopTaglineText !== undefined ? config.coverTopTaglineText : "Under the Auspices of Love and Destiny"}
                  />
                )}

              <div className={`${config.heroTitleAlign || 'text-center'} mt-2`}>
                {config.showCoverSubheading !== false && (
                  <EditableText config={config}
                    as="span"
                    isEditing={!!onChangeField}
                    onChangeField={onChangeField}
                    onSelect={onSelectElement}
                    tabId="cover"
                    field="coverSubheadingText"
                    activeColorId={activeColorId}
                    setActiveColorId={setActiveColorId}
                    popoverId="coverSubheading"
                    onChangeColor={(color) => onChangeField && onChangeField('coverSubheadingTextColor', color)}
                    colorValue={config.coverSubheadingTextColor || config.coverSubheadingColor || '#ffffff'}
                    className={`block mb-2 ${config.coverSubheadingTextFont || config.coverSubheadingFont || 'font-serif'} ${config.coverSubheadingTextSize || config.coverSubheadingSize || 'text-xl sm:text-2xl'} ${config.coverSubheadingItalic !== false ? 'italic' : ''}`}
                    style={{ 
                      color: config.coverSubheadingTextColor || config.coverSubheadingColor || '#ffffff',
                      textAlign: (config.coverSubheadingTextAlign || config.coverSubheadingAlign) === 'left' ? 'left' : (config.coverSubheadingTextAlign || config.coverSubheadingAlign) === 'right' ? 'right' : 'center',
                      opacity: (config.coverSubheadingTextOpacity !== undefined ? config.coverSubheadingTextOpacity : config.coverSubheadingOpacity) !== undefined ? (config.coverSubheadingTextOpacity !== undefined ? config.coverSubheadingTextOpacity : config.coverSubheadingOpacity) : 0.8,
                      filter: (config.coverSubheadingTextGlow !== undefined ? config.coverSubheadingTextGlow : config.coverSubheadingGlow) !== undefined ? `brightness(${config.coverSubheadingTextGlow !== undefined ? config.coverSubheadingTextGlow : config.coverSubheadingGlow}%)` : undefined,
                      transform: (config.coverSubheadingTextYOffset || config.coverSubheadingYOffset) ? `translateY(${config.coverSubheadingTextYOffset || config.coverSubheadingYOffset}px)` : undefined
                    }}
                    value={config.coverSubheadingText !== undefined ? config.coverSubheadingText : "The Union Ceremony of"}
                  />
                )}

                {config.showCoverCoupleNames !== false && (
                  <h1 className="tracking-wider">
                    <EditableText config={config}
                      as="span"
                      isEditing={!!onChangeField}
                      onChangeField={onChangeField}
                      onSelect={onSelectElement}
                      tabId="cover"
                      field="coverBrideText"
                      activeColorId={activeColorId}
                      setActiveColorId={setActiveColorId}
                      popoverId="coverBride"
                      onChangeColor={(color) => onChangeField && onChangeField('coverBrideTextColor', color)}
                      colorValue={config.coverBrideTextColor || config.coverBrideColor || '#ffffff'}
                      className={`font-semibold block sm:inline ${config.coverBrideTextFont || config.coverBrideFont || 'font-serif'} ${config.coverBrideTextSize || config.coverBrideSize || 'text-4xl sm:text-6xl md:text-7xl'}`}
                      style={{ 
                        color: config.coverBrideTextColor || config.coverBrideColor || '#ffffff',
                        textAlign: (config.coverBrideTextAlign || config.coverBrideAlign) === 'left' ? 'left' : (config.coverBrideTextAlign || config.coverBrideAlign) === 'right' ? 'right' : 'center',
                        opacity: (config.coverBrideTextOpacity !== undefined ? config.coverBrideTextOpacity : config.coverBrideOpacity) !== undefined ? (config.coverBrideTextOpacity !== undefined ? config.coverBrideTextOpacity : config.coverBrideOpacity) : 1,
                        filter: (config.coverBrideTextGlow !== undefined ? config.coverBrideTextGlow : config.coverBrideGlow) !== undefined ? `brightness(${config.coverBrideTextGlow !== undefined ? config.coverBrideTextGlow : config.coverBrideGlow}%)` : undefined,
                        transform: (config.coverBrideTextYOffset || config.coverBrideYOffset || config.brideNameYOffset) ? `translateY(${config.coverBrideTextYOffset || config.coverBrideYOffset || config.brideNameYOffset}px)` : undefined
                      }}
                      value={config.coverBrideText !== undefined ? config.coverBrideText : config.brideName}
                    />
                    
                    <EditableText config={config}
                      as="span"
                      isEditing={!!onChangeField}
                      onChangeField={onChangeField}
                      onSelect={onSelectElement}
                      tabId="cover"
                      field="coverAmpersandText"
                      activeColorId={activeColorId}
                      setActiveColorId={setActiveColorId}
                      popoverId="coverAmpersand"
                      onChangeColor={(color) => onChangeField && onChangeField('coverAmpersandTextColor', color)}
                      colorValue={config.coverAmpersandTextColor || config.coverAmpersandColor || config.accentGold || '#f59e0b'}
                      className={`block my-2 ${config.coverAmpersandTextFont || config.coverAmpersandFont || 'font-cursive'} ${config.coverAmpersandTextSize || config.coverAmpersandSize || 'text-3xl sm:text-5xl'}`} 
                      style={{ 
                        color: config.coverAmpersandTextColor || config.coverAmpersandColor || config.accentGold || '#f59e0b',
                        textAlign: (config.coverAmpersandTextAlign || config.coverAmpersandAlign) === 'left' ? 'left' : (config.coverAmpersandTextAlign || config.coverAmpersandAlign) === 'right' ? 'right' : 'center',
                        opacity: (config.coverAmpersandTextOpacity !== undefined ? config.coverAmpersandTextOpacity : config.coverAmpersandOpacity) !== undefined ? (config.coverAmpersandTextOpacity !== undefined ? config.coverAmpersandTextOpacity : config.coverAmpersandOpacity) : 1,
                        filter: (config.coverAmpersandTextGlow !== undefined ? config.coverAmpersandTextGlow : config.coverAmpersandGlow) !== undefined ? `brightness(${config.coverAmpersandTextGlow !== undefined ? config.coverAmpersandTextGlow : config.coverAmpersandGlow}%)` : undefined,
                        transform: (config.coverAmpersandTextYOffset || config.coverAmpersandYOffset) ? `translateY(${config.coverAmpersandTextYOffset || config.coverAmpersandYOffset}px)` : undefined
                      }}
                      value={config.coverAmpersandText !== undefined ? config.coverAmpersandText : "&"}
                    />
                    
                    <EditableText config={config}
                      as="span"
                      isEditing={!!onChangeField}
                      onChangeField={onChangeField}
                      onSelect={onSelectElement}
                      tabId="cover"
                      field="coverGroomText"
                      activeColorId={activeColorId}
                      setActiveColorId={setActiveColorId}
                      popoverId="coverGroom"
                      onChangeColor={(color) => onChangeField && onChangeField('coverGroomTextColor', color)}
                      colorValue={config.coverGroomTextColor || config.coverGroomColor || '#ffffff'}
                      className={`font-semibold block sm:inline ${config.coverGroomTextFont || config.coverGroomFont || 'font-serif'} ${config.coverGroomTextSize || config.coverGroomSize || 'text-4xl sm:text-6xl md:text-7xl'}`}
                      style={{ 
                        color: config.coverGroomTextColor || config.coverGroomColor || '#ffffff',
                        textAlign: (config.coverGroomTextAlign || config.coverGroomAlign) === 'left' ? 'left' : (config.coverGroomTextAlign || config.coverGroomAlign) === 'right' ? 'right' : 'center',
                        opacity: (config.coverGroomTextOpacity !== undefined ? config.coverGroomTextOpacity : config.coverGroomOpacity) !== undefined ? (config.coverGroomTextOpacity !== undefined ? config.coverGroomTextOpacity : config.coverGroomOpacity) : 1,
                        filter: (config.coverGroomTextGlow !== undefined ? config.coverGroomTextGlow : config.coverGroomGlow) !== undefined ? `brightness(${config.coverGroomTextGlow !== undefined ? config.coverGroomTextGlow : config.coverGroomGlow}%)` : undefined,
                        transform: (config.coverGroomTextYOffset || config.coverGroomYOffset || config.groomNameYOffset) ? `translateY(${config.coverGroomTextYOffset || config.coverGroomYOffset || config.groomNameYOffset}px)` : undefined
                      }}
                      value={config.coverGroomText !== undefined ? config.coverGroomText : config.groomName}
                    />
                  </h1>
                )}
              </div>

              {config.showCoverQuote !== false && (
                <>
                  <div className={`w-24 h-0.5 my-4 sm:my-5 relative ${
                    (config.heroTitleAlign === 'text-left') ? 'mr-auto ml-0' :
                    (config.heroTitleAlign === 'text-right') ? 'ml-auto mr-0' : 'mx-auto'
                  }`} style={{ backgroundColor: `${config.accentGold || '#f59e0b'}60` }}>
                    <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 bg-slate-900 p-0.5 rounded-full">
                      <SvgHeart className="w-3.5 h-3.5 text-rose-500" fill="currentColor" />
                    </div>
                  </div>

                  <EditableText config={config}
                    as="p"
                    isEditing={!!onChangeField}
                    onChangeField={onChangeField}
                    onSelect={onSelectElement}
                    tabId="cover"
                    field="coverQuoteText"
                    activeColorId={activeColorId}
                    setActiveColorId={setActiveColorId}
                    popoverId="coverQuote"
                    onChangeColor={(color) => onChangeField && onChangeField('coverQuoteTextColor', color)}
                    colorValue={config.coverQuoteTextColor || config.coverQuoteColor || '#ffffff'}
                    className={`italic max-w-xl mb-4 leading-relaxed ${config.coverQuoteTextFont || config.coverQuoteFont || 'font-cursive'} ${config.coverQuoteTextSize || config.coverQuoteSize || 'text-base sm:text-xl'}`}
                    style={{ 
                      color: config.coverQuoteTextColor || config.coverQuoteColor || '#ffffff',
                      textAlign: (config.coverQuoteTextAlign || config.coverQuoteAlign) === 'left' ? 'left' : (config.coverQuoteTextAlign || config.coverQuoteAlign) === 'right' ? 'right' : 'center',
                      opacity: (config.coverQuoteTextOpacity !== undefined ? config.coverQuoteTextOpacity : config.coverQuoteOpacity) !== undefined ? (config.coverQuoteTextOpacity !== undefined ? config.coverQuoteTextOpacity : config.coverQuoteOpacity) : 1,
                      filter: (config.coverQuoteTextGlow !== undefined ? config.coverQuoteTextGlow : config.coverQuoteGlow) !== undefined ? `brightness(${config.coverQuoteTextGlow !== undefined ? config.coverQuoteTextGlow : config.coverQuoteGlow}%)` : undefined,
                      transform: (config.coverQuoteTextYOffset || config.coverQuoteYOffset || config.introQuoteYOffset) ? `translateY(${config.coverQuoteTextYOffset || config.coverQuoteYOffset || config.introQuoteYOffset}px)` : undefined
                    }}
                    value={config.coverQuoteText ? `"${config.coverQuoteText}"` : (config.introQuote ? `"${config.introQuote}"` : "")}
                  />
                </>
              )}

              {/* Action Button under Heading */}
              {!isPrintMode && config.showCoverRevealBtn !== false && (
                <div className="mb-3">
                  <button
                    onClick={() => {
                      const el = document.getElementById('scratch-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{
                      ...customStyles.glassButton,
                      color: config.coverRevealBtnTextColor || config.coverRevealBtnColor || config.glassBtnText || "#ffffff",
                      opacity: config.coverRevealBtnTextOpacity !== undefined ? config.coverRevealBtnTextOpacity : 1,
                      filter: config.coverRevealBtnTextGlow !== undefined ? `brightness(${config.coverRevealBtnTextGlow}%)` : undefined,
                      transform: config.coverRevealBtnTextYOffset ? `translateY(${config.coverRevealBtnTextYOffset}px)` : undefined
                    }}
                    className={`glass-btn-hover px-6 py-3 rounded-xl uppercase tracking-widest font-semibold flex items-center space-x-2 mx-auto ${config.coverRevealBtnTextFont || config.coverRevealBtnFont || 'font-sans'} ${config.coverRevealBtnTextSize || config.coverRevealBtnSize || 'text-[10px]'}`}
                  >
                    <SvgSparkles className="w-3.5 h-3.5" />
                    <span>{config.coverRevealBtnText || "Reveal Secret Save the Date"}</span>
                  </button>
                </div>
              )}

              {config.showCoverBottomTagline !== false && (
                <EditableText config={config}
                  as="p"
                  isEditing={!!onChangeField}
                  onChangeField={onChangeField}
                  onSelect={onSelectElement}
                  tabId="cover"
                  field="coverBottomTaglineText"
                  activeColorId={activeColorId}
                  setActiveColorId={setActiveColorId}
                  popoverId="coverBottomTagline"
                  onChangeColor={(color) => onChangeField && onChangeField('coverBottomTaglineTextColor', color)}
                  colorValue={config.coverBottomTaglineTextColor || config.coverBottomTaglineColor || config.accentGold || '#f59e0b'}
                  className={`tracking-widest uppercase backdrop-blur-md px-6 py-2.5 rounded-full inline-block border border-white/10 italic ${config.coverBottomTaglineTextFont || config.coverBottomTaglineFont || 'font-sans'} ${config.coverBottomTaglineTextSize || config.coverBottomTaglineSize || 'text-[9px] sm:text-xs'}`}
                  style={{ 
                    color: config.coverBottomTaglineTextColor || config.coverBottomTaglineColor || config.accentGold || '#f59e0b',
                    backgroundColor: config.coverBottomTaglineBg || 'rgba(0, 0, 0, 0.4)',
                    textAlign: (config.coverBottomTaglineTextAlign || config.coverBottomTaglineAlign) === 'left' ? 'left' : (config.coverBottomTaglineTextAlign || config.coverBottomTaglineAlign) === 'right' ? 'right' : 'center',
                    opacity: (config.coverBottomTaglineTextOpacity !== undefined ? config.coverBottomTaglineTextOpacity : config.coverBottomTaglineOpacity) !== undefined ? (config.coverBottomTaglineTextOpacity !== undefined ? config.coverBottomTaglineTextOpacity : config.coverBottomTaglineOpacity) : 1,
                    filter: (config.coverBottomTaglineTextGlow !== undefined ? config.coverBottomTaglineTextGlow : config.coverBottomTaglineGlow) !== undefined ? `brightness(${config.coverBottomTaglineTextGlow !== undefined ? config.coverBottomTaglineTextGlow : config.coverBottomTaglineGlow}%)` : undefined,
                    transform: (config.coverBottomTaglineTextYOffset || config.coverBottomTaglineYOffset) ? `translateY(${config.coverBottomTaglineTextYOffset || config.coverBottomTaglineYOffset}px)` : undefined
                  }}
                  value={config.coverBottomTaglineText !== undefined ? config.coverBottomTaglineText : "✦ A Sacred Promise of Eternal Love • Uncover Our Secret Date Below ✦"}
                />
              )}
            </div>
          </section>
        </Scroll3DContainer>
      )}

        {/* 2. THE INTERACTIVE SCRATCH CARD REVEAL */}
        {config.showScratchSection !== false && (
          <section 
            id="scratch-section" 
            className="py-12 px-4 sm:px-5 text-center w-full mx-auto rounded-3xl relative overflow-hidden"
            style={{
              backgroundImage: config.scratchSectionBgImage 
                ? `linear-gradient(${config.scratchSectionBgImageOverlayStart || 'rgba(5,7,13,0.7)'}, ${config.scratchSectionBgImageOverlayEnd || 'rgba(4,6,10,0.9)'}), url("${formatDriveDirectUrl(config.scratchSectionBgImage, "image")}")` 
                : (config.scratchSectionBg || 'linear-gradient(180deg, #05070D 0%, #09111D 45%, #04060A 100%)'),
              backgroundSize: config.scratchSectionBgImageScale ? `${config.scratchSectionBgImageScale}%` : 'cover',
              backgroundPosition: `${config.scratchSectionBgImageXOffset ?? 50}% ${config.scratchSectionBgImageYOffset ?? 50}%`,
              opacity: config.scratchSectionBgImageOpacity !== undefined ? config.scratchSectionBgImageOpacity : 1,
              border: `2px solid ${config.scratchSectionBorderColor || 'rgba(220,185,90,0.35)'}`,
              boxShadow: config.scratchShadowEnabled !== false
                ? `0 ${config.scratchShadowY ?? 12}px ${config.scratchShadowBlur ?? 40}px ${config.scratchShadowSpread ?? -4}px ${config.scratchShadowColor || 'rgba(0, 0, 0, 0.45)'}, 0 0 60px ${config.scratchCardGlow || 'rgba(233,190,86,0.12)'}`
                : 'none',
              isolation: 'isolate',
              transformStyle: 'flat'
            }}
          >
            {/* Ambient Gold Spotlight */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `radial-gradient(ellipse at center top, ${config.scratchCardGlow || 'rgba(255,215,120,0.08)'}, transparent 70%)`
            }} />
            <div className="max-w-2xl mx-auto relative z-10">
              {/* Gold Ornamental Subtitle */}
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(220,185,90,0.5))' }} />
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold" style={{ color: config.scratchSubtitleColor || (isLightBackground ? '#8a2b3f' : '#C89B3C'), fontFamily: 'Cinzel, serif' }}>
                  {config.scratchSubtitle || "An Exclusive Interactive Reveal"}
                </span>
                <span className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(90deg, rgba(220,185,90,0.5), transparent)' }} />
              </div>

              {/* Main Heading */}
              <h2 
                className={`text-2xl sm:text-3xl md:text-4xl mb-4 ${config.headerFontClass || 'font-serif'}`}
                style={{ 
                  color: config.scratchHeadingColor || (isLightBackground ? '#1e293b' : '#F7E8C5'),
                  textShadow: '0 2px 12px rgba(200,155,60,0.25)'
                }}
              >
                {config.scratchHeading || "Our Secret Wedding Calendar"}
              </h2>

              {/* Description */}
              {!isPrintMode && (
                <p className="text-xs sm:text-sm max-w-md mx-auto mb-5 leading-relaxed font-serif" style={{ color: config.scratchDescColor || (isLightBackground ? '#475569' : '#C8B78D') }}>
                  We've kept the date a romantic surprise. Use your mouse or touchscreen to wipe off the gold metallic shield to discover the ceremony timings and live countdown!
                </p>
              )}

              {/* Premium Reveal & Reset Buttons */}
              {!isPrintMode && (
                <div className="mb-6 flex items-center justify-center gap-3 flex-wrap">
                  {!isScratchFinished ? (
                    <>
                      <button
                        onClick={() => {
                          if (config.revealEffect && config.revealEffect !== 'scratch') {
                            window.dispatchEvent(new CustomEvent('triggerRevealAnimation'));
                          } else {
                            window.dispatchEvent(new CustomEvent('instantRevealScratchCard'));
                            setScratchedPercentage(100);
                            setIsScratchFinished(true);
                            triggerCelebration();
                          }
                        }}
                        className="glass-btn-hover px-6 py-3 rounded-xl text-[10px] sm:text-xs tracking-wider font-bold flex items-center space-x-2 uppercase cursor-pointer transition-all duration-300 shadow-lg"
                        style={{
                          background: config.scratchBtnBg || 'linear-gradient(180deg, #C89B3C, #9B7428)',
                          color: config.scratchBtnText || '#05070D',
                          border: `1px solid ${config.scratchBtnBorder || 'rgba(243,211,138,0.5)'}`,
                          boxShadow: `0 4px 16px ${config.scratchBtnGlow || 'rgba(200,155,60,0.3)'}`,
                          fontFamily: 'Cinzel, serif'
                        }}
                      >
                        <SvgSparkles className="w-3.5 h-3.5" />
                        <span>{config.revealEffect && config.revealEffect !== 'scratch' ? 'Play Reveal Animation' : 'Instant Reveal Calendar'}</span>
                      </button>
                      {scratchedPercentage > 0 && (
                        <button
                          onClick={() => {
                            setIsScratchFinished(false);
                            setScratchedPercentage(0);
                            setShowGraffiti(false);
                            setPreviewCelebrationType(null);
                            window.dispatchEvent(new CustomEvent('resetScratchCard'));
                          }}
                          className="glass-btn-hover px-4 py-2.5 rounded-xl text-[10px] tracking-wider font-bold flex items-center space-x-1.5 uppercase cursor-pointer transition-all duration-300 bg-slate-900/80 border border-amber-500/40 text-amber-300 hover:bg-slate-800 shadow"
                          style={{ fontFamily: 'Cinzel, serif' }}
                        >
                          <span>↺ Reset Shield</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsScratchFinished(false);
                        setScratchedPercentage(0);
                        setShowGraffiti(false);
                        setPreviewCelebrationType(null);
                        window.dispatchEvent(new CustomEvent('resetScratchCard'));
                      }}
                      className="glass-btn-hover px-5 py-2.5 rounded-xl text-[10px] sm:text-xs tracking-wider font-bold flex items-center space-x-2 uppercase cursor-pointer transition-all duration-300 bg-slate-900 border border-amber-500/50 text-amber-300 hover:bg-slate-800 shadow-lg"
                      style={{ fontFamily: 'Cinzel, serif' }}
                    >
                      <SvgSparkles className="w-3.5 h-3.5" />
                      <span>↺ Re-Cover Scratch Card (Test Surprise)</span>
                    </button>
                  )}
                </div>
              )}

              {/* Scratch canvas block — Synchronized Shape & Proportions */}
              {(() => {
                const getScratchCardShapeStyles = (shape) => {
                  switch (shape) {
                    case 'oval':
                      return { borderRadius: '3.5rem', clipPath: undefined };
                    case 'arch':
                      return { borderRadius: '120px 120px 18px 18px', clipPath: undefined };
                    case 'diamond':
                      return { 
                        borderRadius: '0px', 
                        clipPath: 'polygon(24px 0, calc(100% - 24px) 0, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0 calc(100% - 24px), 0 24px)' 
                      };
                    case 'vintage':
                      return { borderRadius: '2.5rem 0.6rem 2.5rem 0.6rem', clipPath: undefined };
                    case 'rounded':
                    default:
                      return { borderRadius: '1.25rem', clipPath: undefined };
                  }
                };

                const getScratchInnerBorderShapeStyles = (shape) => {
                  switch (shape) {
                    case 'oval':
                      return { borderRadius: '2.8rem', clipPath: undefined };
                    case 'arch':
                      return { borderRadius: '105px 105px 12px 12px', clipPath: undefined };
                    case 'diamond':
                      return { 
                        borderRadius: '0px', 
                        clipPath: 'polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)' 
                      };
                    case 'vintage':
                      return { borderRadius: '2.1rem 0.4rem 2.1rem 0.4rem', clipPath: undefined };
                    case 'rounded':
                    default:
                      return { borderRadius: '0.95rem', clipPath: undefined };
                  }
                };

                const shapeStyles = getScratchCardShapeStyles(config.scratchCardShape);

                return (
                  <div 
                    data-scratch-card="true"
                    className="relative w-full max-w-md mx-auto aspect-[4/3.35] overflow-hidden flex flex-col justify-between shadow-2xl transition-all duration-300"
                    style={{
                      border: `2px solid ${config.scratchCardBorder || 'rgba(220,185,90,0.45)'}`,
                      boxShadow: `0 12px 40px rgba(0,0,0,0.45), 0 0 35px ${config.scratchCardGlow || 'rgba(233,190,86,0.18)'}`,
                      background: config.scratchCardBg || '#0D1322',
                      ...shapeStyles,
                      isolation: 'isolate',
                      transformStyle: 'flat'
                    }}
                  >
                    
                    {/* Save the Date Revealed Card — Premium Interior */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center flex flex-col justify-between p-4 sm:p-5 z-10" 
                      style={{ 
                        backgroundImage: config.scratchCardBgImage 
                          ? `linear-gradient(${config.scratchCardBgImageOverlayStart || 'rgba(5,7,13,0.5)'}, ${config.scratchCardBgImageOverlayEnd || 'rgba(5,7,13,0.85)'}), url("${config.scratchCardBgImage}")` 
                          : `linear-gradient(180deg, ${config.scratchCardBg || '#0D1322'}, #05070D)`,
                        backgroundSize: config.scratchCardBgImageScale ? `${config.scratchCardBgImageScale}%` : 'cover',
                        backgroundPosition: `${config.scratchCardBgImageXOffset ?? 50}% ${config.scratchCardBgImageYOffset ?? 50}%`,
                        opacity: config.scratchCardBgImageOpacity !== undefined ? config.scratchCardBgImageOpacity : (config.scratchCardOpacity !== undefined ? config.scratchCardOpacity : 1),
                        backdropFilter: config.scratchCardBlur ? `blur(${config.scratchCardBlur}px)` : undefined,
                        ...shapeStyles,
                        zIndex: 10
                      }}
                    >
                        {/* Decorative Shape-Matched Inner Border Line */}
                        <div 
                          className="absolute inset-2 sm:inset-3 pointer-events-none transition-all duration-300 z-10"
                          style={{
                            border: `1.5px solid ${config.scratchInnerBorderColor || config.scratchCardBorder || 'rgba(220,185,90,0.45)'}`,
                            boxShadow: `inset 0 0 12px ${config.scratchCardGlow || 'rgba(233,190,86,0.12)'}`,
                            ...getScratchInnerBorderShapeStyles(config.scratchCardShape)
                          }}
                        />
                        {/* Title Bar with Gold Ornament */}
                        <div 
                          onClick={(e) => { e.stopPropagation(); onSelectElement && onSelectElement({ tabId: 'scratch', field: 'scratchTitle' }); }}
                          className="px-3 py-1.5 rounded-lg flex justify-center items-center gap-2 cursor-pointer hover:outline hover:outline-1 hover:outline-amber-500/50 transition-all select-none"
                          style={{ 
                            background: 'rgba(200,155,60,0.08)',
                            border: '1px solid rgba(220,185,90,0.25)',
                            justify: (config.scratchTitleAlign || config.scratchTitleTextAlign) === 'left' ? 'flex-start' : (config.scratchTitleAlign || config.scratchTitleTextAlign) === 'right' ? 'flex-end' : 'center',
                            transform: (config.scratchTitleYOffset || config.scratchTitleTextYOffset) ? `translateY(${config.scratchTitleYOffset || config.scratchTitleTextYOffset}px)` : undefined,
                            opacity: (config.scratchTitleOpacity !== undefined ? config.scratchTitleOpacity : config.scratchTitleTextOpacity) !== undefined ? (config.scratchTitleOpacity !== undefined ? config.scratchTitleOpacity : config.scratchTitleTextOpacity) : 1,
                            filter: (config.scratchTitleGlow !== undefined ? config.scratchTitleGlow : config.scratchTitleTextGlow) !== undefined ? `brightness(${config.scratchTitleGlow !== undefined ? config.scratchTitleGlow : config.scratchTitleTextGlow}%)` : undefined
                          }}
                        >
                          <span className="h-px w-6 hidden sm:block" style={{ background: 'linear-gradient(90deg, transparent, rgba(220,185,90,0.5))' }} />
                          <span
                            className={`uppercase tracking-[0.2em] font-bold ${config.scratchTitleFont || config.scratchTitleTextFont || 'font-cinzel'} ${config.scratchTitleSize || config.scratchTitleTextSize || 'text-[9px] sm:text-[10px]'}`}
                            style={{ 
                              color: config.scratchTitleColor || config.scratchTitleTextColor || '#C89B3C',
                              textShadow: '0 0 8px rgba(200,155,60,0.3)',
                              textAlign: config.scratchTitleAlign || config.scratchTitleTextAlign || 'center'
                            }}
                          >
                            {config.scratchTitle || "Secret Save The Date"}
                          </span>
                          <span className="h-px w-6 hidden sm:block" style={{ background: 'linear-gradient(90deg, rgba(220,185,90,0.5), transparent)' }} />
                        </div>

                        {/* Central Content Block */}
                        <div 
                          className="my-auto text-center space-y-2 py-3 px-3 rounded-xl my-2"
                          style={{
                            background: `rgba(13,19,34,0.65)`,
                            border: `1px solid ${config.scratchCardBorder || 'rgba(220,185,90,0.25)'}`,
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          {/* Couple Names */}
                          <span 
                            onClick={(e) => { e.stopPropagation(); onSelectElement && onSelectElement({ tabId: 'scratch', field: 'scratchCoupleText' }); }}
                            className={`text-2xl sm:text-3xl block cursor-pointer hover:outline hover:outline-1 hover:outline-amber-500/50 rounded transition-all select-none ${config.scratchCoupleTextFont || config.scratchCoupleFont || config.cursiveFontClass || 'font-cursive'} ${config.scratchCoupleTextSize || config.scratchCoupleSize || ''}`} 
                            style={{ 
                              color: config.scratchCoupleTextColor || config.scratchCoupleColor || '#F7E8C5', 
                              textAlign: config.scratchCoupleTextAlign || config.scratchCoupleAlign || 'center',
                              textShadow: '0 2px 16px rgba(200,155,60,0.3)',
                              lineHeight: 1.3,
                              opacity: (config.scratchCoupleTextOpacity !== undefined ? config.scratchCoupleTextOpacity : config.scratchCoupleOpacity) !== undefined ? (config.scratchCoupleTextOpacity !== undefined ? config.scratchCoupleTextOpacity : config.scratchCoupleOpacity) : 1,
                              filter: (config.scratchCoupleTextGlow !== undefined ? config.scratchCoupleTextGlow : config.scratchCoupleGlow) !== undefined ? `brightness(${config.scratchCoupleTextGlow !== undefined ? config.scratchCoupleTextGlow : config.scratchCoupleGlow}%)` : undefined,
                              transform: (config.scratchCoupleTextYOffset || config.scratchCoupleYOffset) ? `translateY(${config.scratchCoupleTextYOffset || config.scratchCoupleYOffset}px)` : undefined
                            }}
                          >
                            {config.scratchCoupleText || `${config.brideName} & ${config.groomName}`}
                          </span>
                          
                          {/* Wedding Date */}
                          <div className="py-1">
                            <p 
                              onClick={(e) => { e.stopPropagation(); onSelectElement && onSelectElement({ tabId: 'scratch', field: 'scratchMarriedLabel' }); }}
                              className={`tracking-wider uppercase cursor-pointer hover:text-amber-300 transition-all select-none ${config.scratchMarriedLabelFont || config.scratchMarriedLabelTextFont || 'font-sans'} ${config.scratchMarriedLabelSize || config.scratchMarriedLabelTextSize || 'text-[9px] sm:text-[10px]'}`}
                              style={{ 
                                color: config.scratchMarriedLabelColor || config.scratchMarriedLabelTextColor || '#C8B78D', 
                                textAlign: config.scratchMarriedLabelAlign || config.scratchMarriedLabelTextAlign || 'center',
                                opacity: (config.scratchMarriedLabelOpacity !== undefined ? config.scratchMarriedLabelOpacity : config.scratchMarriedLabelTextOpacity) !== undefined ? (config.scratchMarriedLabelOpacity !== undefined ? config.scratchMarriedLabelOpacity : config.scratchMarriedLabelTextOpacity) : 1,
                                filter: (config.scratchMarriedLabelGlow !== undefined ? config.scratchMarriedLabelGlow : config.scratchMarriedLabelTextGlow) !== undefined ? `brightness(${config.scratchMarriedLabelGlow !== undefined ? config.scratchMarriedLabelGlow : config.scratchMarriedLabelTextGlow}%)` : undefined,
                                transform: (config.scratchMarriedLabelYOffset || config.scratchMarriedLabelTextYOffset) ? `translateY(${config.scratchMarriedLabelYOffset || config.scratchMarriedLabelTextYOffset}px)` : undefined
                              }}
                            >
                              {config.scratchMarriedLabel || "Are getting married on"}
                            </p>
                            <p 
                              onClick={(e) => { e.stopPropagation(); onSelectElement && onSelectElement({ tabId: 'scratch', field: 'scratchDateText' }); }}
                              className={`font-bold tracking-wide uppercase px-2 mt-1 cursor-pointer hover:outline hover:outline-1 hover:outline-amber-500/50 rounded transition-all select-none ${config.scratchDateTextFont || config.scratchDateFont || 'font-cinzel'} ${config.scratchDateTextSize || config.scratchDateSize || 'text-lg sm:text-xl'}`}
                              style={{ 
                                color: config.scratchDateTextColor || config.scratchDateColor || '#F3D38A', 
                                textAlign: config.scratchDateTextAlign || config.scratchDateAlign || 'center',
                                textShadow: '0 0 10px rgba(243,211,138,0.2)',
                                opacity: (config.scratchDateTextOpacity !== undefined ? config.scratchDateTextOpacity : config.scratchDateOpacity) !== undefined ? (config.scratchDateTextOpacity !== undefined ? config.scratchDateTextOpacity : config.scratchDateOpacity) : 1,
                                filter: (config.scratchDateTextGlow !== undefined ? config.scratchDateTextGlow : config.scratchDateGlow) !== undefined ? `brightness(${config.scratchDateTextGlow !== undefined ? config.scratchDateTextGlow : config.scratchDateGlow}%)` : undefined,
                                transform: (config.scratchDateTextYOffset || config.scratchDateYOffset) ? `translateY(${config.scratchDateTextYOffset || config.scratchDateYOffset}px)` : undefined
                              }}
                            >
                              {config.scratchDateText ? formatWeddingDateDmy(config.scratchDateText) : formatWeddingDateDmy(config.weddingDate)}
                            </p>
                          </div>

                          {/* Countdown Label */}
                          <div 
                            onClick={(e) => { e.stopPropagation(); onSelectElement && onSelectElement({ tabId: 'scratch', field: 'scratchCountdownLabel' }); }}
                            className="flex items-center justify-center gap-2 pt-1 cursor-pointer select-none"
                          >
                            <span className="h-px flex-1 max-w-[40px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,155,60,0.3))' }} />
                            <p 
                              className={`tracking-[0.2em] uppercase ${config.scratchCountdownLabelFont || config.scratchCountdownFont || 'font-sans'} ${config.scratchCountdownLabelSize || config.scratchCountdownSize || 'text-[9px]'}`}
                              style={{ 
                                color: config.scratchCountdownLabelColor || config.scratchCountdownColor || '#8E7D5B', 
                                textAlign: config.scratchCountdownLabelAlign || config.scratchCountdownAlign || 'center',
                                opacity: (config.scratchCountdownLabelOpacity !== undefined ? config.scratchCountdownLabelOpacity : config.scratchCountdownOpacity) !== undefined ? (config.scratchCountdownLabelOpacity !== undefined ? config.scratchCountdownLabelOpacity : config.scratchCountdownOpacity) : 1,
                                filter: (config.scratchCountdownLabelGlow !== undefined ? config.scratchCountdownLabelGlow : config.scratchCountdownGlow) !== undefined ? `brightness(${config.scratchCountdownLabelGlow !== undefined ? config.scratchCountdownLabelGlow : config.scratchCountdownGlow}%)` : undefined,
                                transform: (config.scratchCountdownLabelYOffset || config.scratchCountdownYOffset) ? `translateY(${config.scratchCountdownLabelYOffset || config.scratchCountdownYOffset}px)` : undefined
                              }}
                            >
                              {config.scratchCountdownLabel || "Countdown"}
                            </p>
                            <span className="h-px flex-1 max-w-[40px]" style={{ background: 'linear-gradient(90deg, rgba(200,155,60,0.3), transparent)' }} />
                          </div>

                          {/* Countdown Timer — Luxury Glass Boxes */}
                          {timeLeft.isPast ? (
                            <div className="text-base font-semibold uppercase tracking-widest pt-2 font-cinzel" style={{ color: '#D6AF53' }}>
                              Married &amp; Blessed Forever!
                            </div>
                          ) : (
                            <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto pt-1.5 text-center">
                              {[
                                { label: "Days", val: timeLeft.days },
                                { label: "Hours", val: timeLeft.hours },
                                { label: "Mins", val: timeLeft.minutes },
                                { label: "Secs", val: timeLeft.seconds }
                              ].map((t, idx) => (
                                <div 
                                  key={idx} 
                                  className="rounded-lg p-1.5 sm:p-2"
                                  style={{
                                    background: config.scratchCountdownBoxBg || '#121827',
                                    border: `1.5px solid ${config.scratchCountdownBoxBorder || 'rgba(220,185,90,0.4)'}`,
                                    boxShadow: `inset 0 1px 3px rgba(0,0,0,0.3), 0 0 12px ${config.scratchCardGlow || 'rgba(233,190,86,0.08)'}`
                                  }}
                                >
                                  <span 
                                    className="text-base sm:text-xl font-bold block font-cinzel"
                                    style={{ 
                                      color: config.scratchCountdownNumColor || '#F3D38A',
                                      textShadow: '0 0 8px rgba(243,211,138,0.2)'
                                    }}
                                  >{t.val}</span>
                                  <span 
                                    className="text-[7px] sm:text-[8px] uppercase tracking-wider block mt-0.5"
                                    style={{ color: config.scratchCountdownLabelColor || '#8E7D5B' }}
                                  >{t.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Secret Message */}
                        <div 
                          onClick={(e) => { e.stopPropagation(); onSelectElement && onSelectElement({ tabId: 'scratch', field: 'scratchSecretMessage' }); }}
                          className="rounded-lg px-3.5 py-2 mt-1 shrink-0 cursor-pointer hover:border-amber-500/60 transition-all select-none"
                          style={{
                            background: 'rgba(200,155,60,0.08)',
                            borderLeft: `3px solid ${config.scratchMsgBorderColor || 'rgba(200,155,60,0.45)'}`,
                            border: `1px solid rgba(220,185,90,0.2)`,
                            transform: (config.scratchSecretMessageYOffset || config.scratchSecretMessageTextYOffset) ? `translateY(${config.scratchSecretMessageYOffset || config.scratchSecretMessageTextYOffset}px)` : undefined,
                            opacity: (config.scratchSecretMessageOpacity !== undefined ? config.scratchSecretMessageOpacity : config.scratchSecretMessageTextOpacity) !== undefined ? (config.scratchSecretMessageOpacity !== undefined ? config.scratchSecretMessageOpacity : config.scratchSecretMessageTextOpacity) : 1,
                            filter: (config.scratchSecretMessageGlow !== undefined ? config.scratchSecretMessageGlow : config.scratchSecretMessageTextGlow) !== undefined ? `brightness(${config.scratchSecretMessageGlow !== undefined ? config.scratchSecretMessageGlow : config.scratchSecretMessageTextGlow}%)` : undefined
                          }}
                        >
                          <p 
                            className={`italic leading-relaxed ${config.scratchSecretMessageFont || config.scratchSecretMessageTextFont || 'font-serif'} ${config.scratchSecretMessageSize || config.scratchSecretMessageTextSize || 'text-[10px] sm:text-xs'}`}
                            style={{ 
                              color: config.scratchSecretMessageColor || config.scratchSecretMessageTextColor || '#F7E8C5', 
                              textAlign: config.scratchSecretMessageAlign || config.scratchSecretMessageTextAlign || 'center'
                            }}
                          >
                            "{config.scratchSecretMessage || "We have booked a private stargazing toast after the reception! Make sure to grab a custom lantern at the main exit."}"
                          </p>
                        </div>
                    </div>

                    {/* Cover Canvas with Synchronized Shape — ALWAYS ON TOP OF ALL MATERIALS */}
                    {!isPrintMode && (!config.revealEffect || config.revealEffect === 'scratch') && (
                      <ScratchCardShield
                        shape={config.scratchCardShape || 'rounded'}
                        revealColor={config.revealColor}
                        accentGold={config.accentGold}
                        scratchImage={config.scratchImage}
                        scratchImageScale={config.scratchImageScale}
                        scratchImageXOffset={config.scratchImageXOffset}
                        scratchImageYOffset={config.scratchImageYOffset}
                        isScratchFinished={isScratchFinished}
                        setIsScratchFinished={setIsScratchFinished}
                        setScratchedPercentage={setScratchedPercentage}
                        triggerCelebration={triggerCelebration}
                      />
                    )}

                    {/* Alternative 14 Reveal Effects Overlays — Clipped to Save The Date Card Dimensions */}
                    {!isPrintMode && config.revealEffect && config.revealEffect !== 'scratch' && !isScratchFinished && (
                      <RevealEffectsOverlay
                        effect={config.revealEffect}
                        shapeStyles={shapeStyles}
                        speed={parseFloat(config.revealSpeed || "1.0")}
                        revealColor={config.revealColor || config.accentGold || '#f59e0b'}
                        primaryColor={config.primaryColor || '#0b1329'}
                        accentGold={config.accentGold || '#f59e0b'}
                        brideName={config.brideName}
                        groomName={config.groomName}
                        onComplete={() => {
                          setIsScratchFinished(true);
                          setScratchedPercentage(100);
                          triggerCelebration();
                        }}
                      />
                    )}
                  </div>
              );
            })()}

              {!isPrintMode && (
                <div className="mt-4 flex items-center justify-center space-x-2 text-xs">
                  <span className="opacity-70">Wipe Progress:</span>
                  <span className="font-mono font-semibold" style={customStyles.colorAccent}>{scratchedPercentage}%</span>
                  {isScratchFinished && (
                    <span className="text-emerald-400 font-semibold flex items-center">
                      <SvgCheck className="w-3.5 h-3.5 mr-1 animate-bounce" /> Surprise Revealed!
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>
      )}

        {/* 3. STORY & CUSTOM PORTRAITS */}
        {config.showCoupleSection !== false && (
          <Scroll3DContainer
            enabled={!isPrintMode && config.scroll3DEnabled !== false}
            intensity={config.scroll3DIntensity || 4}
            perspective={config.scroll3DPerspective || 900}
            effectType={config.scroll3DEffectType || '3d-roll'}
          >
            <section 
              id="couple-section"
            className="py-10 px-6 max-w-6xl mx-auto bg-black/10 rounded-3xl border border-white/5"
            style={{
              boxShadow: config.coupleShadowEnabled !== false
                ? `0 ${config.coupleShadowY ?? 8}px ${config.coupleShadowBlur ?? 20}px ${config.coupleShadowSpread ?? -4}px ${config.coupleShadowColor || 'rgba(0, 0, 0, 0.2)'}`
                : 'none'
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Couple Frame wrapper */}
              {config.showStoryImage !== false && (
                <div className="relative flex justify-center items-center">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent blur-3xl rounded-full" />

                  <div 
                    className={`w-[320px] relative overflow-hidden transition-all duration-700 ${getFrameClasses(config.storyFrameShape || 'oval', config.storyFrameBorderTheme || 'double-gilded')}`}
                  >
                    <img
                      src={formatDriveDirectUrl(config.storyImage, "image")}
                      alt="Lovely Couple Frame"
                      className="w-full h-full object-cover"
                    />
                    {config.storyFrameBorderTheme === 'custom-png' && config.customPngFrame && (
                      <img 
                        src={config.customPngFrame} 
                        alt="Custom Frame Overlay" 
                        className="absolute inset-0 w-full h-full object-fill pointer-events-none z-10"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Text area */}
              <div className="space-y-6">
                {config.showCoupleTitles !== false && (
                  <>
                    <EditableText config={config}
                      as="span"
                      isEditing={!!onChangeField}
                      onChangeField={onChangeField}
                      onSelect={onSelectElement}
                      tabId="couple"
                      field="storySubtitle"
                      activeColorId={activeColorId}
                      setActiveColorId={setActiveColorId}
                      popoverId="storySubtitle"
                      onChangeColor={(color) => onChangeField && onChangeField('storySubtitleColor', color)}
                      colorValue={config.storySubtitleColor || defaultSubtitleColor}
                      className={`text-xs uppercase tracking-[0.2em] font-bold block ${config.storySubtitleFont || 'font-sans'} ${config.storySubtitleSize || ''} ${(config.storySubtitleAlign || 'left') === 'left' ? 'text-left' : (config.storySubtitleAlign === 'right' ? 'text-right' : 'text-center')}`}
                      style={{ 
                        color: config.storySubtitleColor || defaultSubtitleColor,
                        opacity: config.storySubtitleOpacity !== undefined ? config.storySubtitleOpacity : 1.0,
                        filter: config.storySubtitleGlow !== undefined ? `brightness(${config.storySubtitleGlow}%)` : undefined,
                        transform: config.storySubtitleYOffset ? `translateY(${config.storySubtitleYOffset}px)` : undefined
                      }}
                      value={config.storySubtitle || "Meet the families"}
                    />

                    <EditableText config={config}
                      as="h2"
                      isEditing={!!onChangeField}
                      onChangeField={onChangeField}
                      onSelect={onSelectElement}
                      tabId="couple"
                      field="storyTitle"
                      activeColorId={activeColorId}
                      setActiveColorId={setActiveColorId}
                      popoverId="storyTitle"
                      onChangeColor={(color) => onChangeField && onChangeField('storyTitleColor', color)}
                      colorValue={config.storyTitleColor || defaultBodyTextColor}
                      className={`font-light tracking-wide ${config.storyTitleFont || 'font-serif'} ${config.storyTitleSize || 'text-3xl sm:text-4xl'} ${(config.storyTitleAlign || 'left') === 'left' ? 'text-left' : (config.storyTitleAlign === 'right' ? 'text-right' : 'text-center')}`}
                      style={{ 
                        color: config.storyTitleColor || defaultBodyTextColor,
                        opacity: config.storyTitleOpacity !== undefined ? config.storyTitleOpacity : 1.0,
                        filter: config.storyTitleGlow !== undefined ? `brightness(${config.storyTitleGlow}%)` : undefined,
                        transform: config.storyTitleYOffset ? `translateY(${config.storyTitleYOffset}px)` : undefined
                      }}
                      value={config.storyTitle || "Vows of Two Dynasties"}
                    />

                    <div className={`w-16 h-1 bg-amber-500/30 ${
                      (config.storyTitleAlign === 'text-center' || config.storyTitleAlign === 'center') ? 'mx-auto' :
                      (config.storyTitleAlign === 'text-right' || config.storyTitleAlign === 'right') ? 'ml-auto mr-0' : 'mr-auto ml-0'
                    }`} />
                  </>
                )}

                <div 
                  className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}
                >
                  {config.showBrideDetails !== false && (
                    <div className="p-2.5 sm:p-4 rounded-xl bg-black/20 border flex flex-col justify-center min-w-0 text-center overflow-hidden" style={customStyles.borderAccentSoft}>
                      <EditableText config={config}
                        as="h4"
                        isEditing={!!onChangeField}
                        onChangeField={onChangeField}
                        onSelect={onSelectElement}
                        tabId="couple"
                        field="storyBrideTitle"
                        activeColorId={activeColorId}
                        setActiveColorId={setActiveColorId}
                        popoverId="storyBrideTitle"
                        onChangeColor={(color) => onChangeField && onChangeField('storyBrideTitleColor', color)}
                        colorValue={config.storyBrideTitleColor || config.accentGold || '#b89254'}
                        className={`text-xs sm:text-base font-semibold mb-0.5 truncate ${config.storyBrideTitleFont || config.cursiveFontClass || 'font-cursive'} ${config.storyBrideTitleSize || ''} ${(config.storyBrideTitleAlign || 'center') === 'left' ? 'text-left' : (config.storyBrideTitleAlign === 'right' ? 'text-right' : 'text-center')}`}
                        style={{ 
                          color: config.storyBrideTitleColor || config.accentGold || '#b89254',
                          opacity: config.storyBrideTitleOpacity !== undefined ? config.storyBrideTitleOpacity : 1.0,
                          filter: config.storyBrideTitleGlow !== undefined ? `brightness(${config.storyBrideTitleGlow}%)` : undefined,
                          transform: config.storyBrideTitleYOffset ? `translateY(${config.storyBrideTitleYOffset}px)` : undefined
                        }}
                        value={config.storyBrideTitle || "The Beautiful Bride"}
                      />
                      <EditableText config={config}
                        as="p"
                        isEditing={!!onChangeField}
                        onChangeField={onChangeField}
                        onSelect={onSelectElement}
                        tabId="couple"
                        field="brideName"
                        activeColorId={activeColorId}
                        setActiveColorId={setActiveColorId}
                        popoverId="storyBrideName"
                        onChangeColor={(color) => onChangeField && onChangeField('storyBrideNameColor', color)}
                        colorValue={config.storyBrideNameColor || defaultBodyTextColor}
                        className={`text-sm sm:text-base font-bold truncate ${config.storyBrideNameFont || 'font-serif'} ${config.storyBrideNameSize || ''} ${(config.storyBrideNameAlign || 'center') === 'left' ? 'text-left' : (config.storyBrideNameAlign === 'right' ? 'text-right' : 'text-center')}`}
                        style={{ 
                          color: config.storyBrideNameColor || defaultBodyTextColor,
                          opacity: config.storyBrideNameOpacity !== undefined ? config.storyBrideNameOpacity : 1.0,
                          filter: config.storyBrideNameGlow !== undefined ? `brightness(${config.storyBrideNameGlow}%)` : undefined,
                          transform: config.storyBrideNameYOffset ? `translateY(${config.storyBrideNameYOffset}px)` : undefined
                        }}
                        value={config.brideName}
                      />
                      <EditableText config={config}
                        as="span"
                        isEditing={!!onChangeField}
                        onChangeField={onChangeField}
                        onSelect={onSelectElement}
                        tabId="couple"
                        field="storyBrideParentLabel"
                        activeColorId={activeColorId}
                        setActiveColorId={setActiveColorId}
                        popoverId="storyBrideParentLabel"
                        onChangeColor={(color) => onChangeField && onChangeField('storyBrideParentLabelColor', color)}
                        colorValue={config.storyBrideParentLabelColor || defaultLabelColor}
                        className={`text-[8px] sm:text-[9px] uppercase tracking-wider font-bold block opacity-90 mt-1 ${config.storyBrideParentLabelFont || 'font-sans'} ${config.storyBrideParentLabelSize || ''} ${(config.storyBrideParentLabelAlign || 'center') === 'left' ? 'text-left' : (config.storyBrideParentLabelAlign === 'right' ? 'text-right' : 'text-center')}`}
                        style={{ 
                          color: config.storyBrideParentLabelColor || defaultLabelColor,
                          opacity: config.storyBrideParentLabelOpacity !== undefined ? config.storyBrideParentLabelOpacity : 0.9,
                          filter: config.storyBrideParentLabelGlow !== undefined ? `brightness(${config.storyBrideParentLabelGlow}%)` : undefined,
                          transform: config.storyBrideParentLabelYOffset ? `translateY(${config.storyBrideParentLabelYOffset}px)` : undefined
                        }}
                        value={config.storyBrideParentLabel || "Daughter of"}
                      />
                      <EditableText config={config}
                        as="p"
                        isEditing={!!onChangeField}
                        onChangeField={onChangeField}
                        onSelect={onSelectElement}
                        tabId="couple"
                        field="brideFamily"
                        activeColorId={activeColorId}
                        setActiveColorId={setActiveColorId}
                        popoverId="storyBrideFamily"
                        onChangeColor={(color) => onChangeField && onChangeField('storyBrideFamilyColor', color)}
                        colorValue={config.storyBrideFamilyColor || defaultBodyTextColor}
                        className={`text-[10px] sm:text-xs italic mt-0.5 line-clamp-2 ${config.storyBrideFamilyFont || 'font-serif'} ${config.storyBrideFamilySize || ''} ${(config.storyBrideFamilyAlign || 'center') === 'left' ? 'text-left' : (config.storyBrideFamilyAlign === 'right' ? 'text-right' : 'text-center')}`}
                        style={{ 
                          color: config.storyBrideFamilyColor || defaultBodyTextColor,
                          opacity: config.storyBrideFamilyOpacity !== undefined ? config.storyBrideFamilyOpacity : 0.85,
                          filter: config.storyBrideFamilyGlow !== undefined ? `brightness(${config.storyBrideFamilyGlow}%)` : undefined,
                          transform: config.storyBrideFamilyYOffset ? `translateY(${config.storyBrideFamilyYOffset}px)` : undefined
                        }}
                        value={config.brideFamily}
                      />
                    </div>
                  )}

                  {config.showGroomDetails !== false && (
                    <div className="p-2.5 sm:p-4 rounded-xl bg-black/20 border flex flex-col justify-center min-w-0 text-center overflow-hidden" style={customStyles.borderAccentSoft}>
                      <EditableText config={config}
                        as="h4"
                        isEditing={!!onChangeField}
                        onChangeField={onChangeField}
                        onSelect={onSelectElement}
                        tabId="couple"
                        field="storyGroomTitle"
                        activeColorId={activeColorId}
                        setActiveColorId={setActiveColorId}
                        popoverId="storyGroomTitle"
                        onChangeColor={(color) => onChangeField && onChangeField('storyGroomTitleColor', color)}
                        colorValue={config.storyGroomTitleColor || config.accentGold || '#b89254'}
                        className={`text-xs sm:text-base font-semibold mb-0.5 truncate ${config.storyGroomTitleFont || config.cursiveFontClass || 'font-cursive'} ${config.storyGroomTitleSize || ''} ${(config.storyGroomTitleAlign || 'center') === 'left' ? 'text-left' : (config.storyGroomTitleAlign === 'right' ? 'text-right' : 'text-center')}`}
                        style={{ 
                          color: config.storyGroomTitleColor || config.accentGold || '#b89254',
                          opacity: config.storyGroomTitleOpacity !== undefined ? config.storyGroomTitleOpacity : 1.0,
                          filter: config.storyGroomTitleGlow !== undefined ? `brightness(${config.storyGroomTitleGlow}%)` : undefined,
                          transform: config.storyGroomTitleYOffset ? `translateY(${config.storyGroomTitleYOffset}px)` : undefined
                        }}
                        value={config.storyGroomTitle || "The Noble Groom"}
                      />
                      <EditableText config={config}
                        as="p"
                        isEditing={!!onChangeField}
                        onChangeField={onChangeField}
                        onSelect={onSelectElement}
                        tabId="couple"
                        field="groomName"
                        activeColorId={activeColorId}
                        setActiveColorId={setActiveColorId}
                        popoverId="storyGroomName"
                        onChangeColor={(color) => onChangeField && onChangeField('storyGroomNameColor', color)}
                        colorValue={config.storyGroomNameColor || defaultBodyTextColor}
                        className={`text-sm sm:text-base font-bold truncate ${config.storyGroomNameFont || 'font-serif'} ${config.storyGroomNameSize || ''} ${(config.storyGroomNameAlign || 'center') === 'left' ? 'text-left' : (config.storyGroomNameAlign === 'right' ? 'text-right' : 'text-center')}`}
                        style={{ 
                          color: config.storyGroomNameColor || defaultBodyTextColor,
                          opacity: config.storyGroomNameOpacity !== undefined ? config.storyGroomNameOpacity : 1.0,
                          filter: config.storyGroomNameGlow !== undefined ? `brightness(${config.storyGroomNameGlow}%)` : undefined,
                          transform: config.storyGroomNameYOffset ? `translateY(${config.storyGroomNameYOffset}px)` : undefined
                        }}
                        value={config.groomName}
                      />
                      <EditableText config={config}
                        as="span"
                        isEditing={!!onChangeField}
                        onChangeField={onChangeField}
                        onSelect={onSelectElement}
                        tabId="couple"
                        field="storyGroomParentLabel"
                        activeColorId={activeColorId}
                        setActiveColorId={setActiveColorId}
                        popoverId="storyGroomParentLabel"
                        onChangeColor={(color) => onChangeField && onChangeField('storyGroomParentLabelColor', color)}
                        colorValue={config.storyGroomParentLabelColor || defaultLabelColor}
                        className={`text-[8px] sm:text-[9px] uppercase tracking-wider font-bold block opacity-90 mt-1 ${config.storyGroomParentLabelFont || 'font-sans'} ${config.storyGroomParentLabelSize || ''} ${(config.storyGroomParentLabelAlign || 'center') === 'left' ? 'text-left' : (config.storyGroomParentLabelAlign === 'right' ? 'text-right' : 'text-center')}`}
                        style={{ 
                          color: config.storyGroomParentLabelColor || defaultLabelColor,
                          opacity: config.storyGroomParentLabelOpacity !== undefined ? config.storyGroomParentLabelOpacity : 0.9,
                          filter: config.storyGroomParentLabelGlow !== undefined ? `brightness(${config.storyGroomParentLabelGlow}%)` : undefined,
                          transform: config.storyGroomParentLabelYOffset ? `translateY(${config.storyGroomParentLabelYOffset}px)` : undefined
                        }}
                        value={config.storyGroomParentLabel || "Son of"}
                      />
                      <EditableText config={config}
                        as="p"
                        isEditing={!!onChangeField}
                        onChangeField={onChangeField}
                        onSelect={onSelectElement}
                        tabId="couple"
                        field="groomFamily"
                        activeColorId={activeColorId}
                        setActiveColorId={setActiveColorId}
                        popoverId="storyGroomFamily"
                        onChangeColor={(color) => onChangeField && onChangeField('storyGroomFamilyColor', color)}
                        colorValue={config.storyGroomFamilyColor || defaultBodyTextColor}
                        className={`text-[10px] sm:text-xs italic mt-0.5 line-clamp-2 ${config.storyGroomFamilyFont || 'font-serif'} ${config.storyGroomFamilySize || ''} ${(config.storyGroomFamilyAlign || 'center') === 'left' ? 'text-left' : (config.storyGroomFamilyAlign === 'right' ? 'text-right' : 'text-center')}`}
                        style={{ 
                          color: config.storyGroomFamilyColor || defaultBodyTextColor,
                          opacity: config.storyGroomFamilyOpacity !== undefined ? config.storyGroomFamilyOpacity : 0.85,
                          filter: config.storyGroomFamilyGlow !== undefined ? `brightness(${config.storyGroomFamilyGlow}%)` : undefined,
                          transform: config.storyGroomFamilyYOffset ? `translateY(${config.storyGroomFamilyYOffset}px)` : undefined
                        }}
                        value={config.groomFamily}
                      />
                    </div>
                  )}
                </div>

                {config.showStoryParagraph !== false && (
                  <div className="space-y-3 pt-2">
                    <EditableText config={config}
                      as="h3"
                      isEditing={!!onChangeField}
                      onChangeField={onChangeField}
                      onSelect={onSelectElement}
                      tabId="couple"
                      field="storyPathTitle"
                      activeColorId={activeColorId}
                      setActiveColorId={setActiveColorId}
                      popoverId="storyPathTitle"
                      onChangeColor={(color) => onChangeField && onChangeField('storyPathTitleColor', color)}
                      colorValue={config.storyPathTitleColor || config.accentGold || '#b89254'}
                      className={`text-xl font-semibold italic ${config.storyPathTitleFont || config.cursiveFontClass || 'font-cursive'} ${config.storyPathTitleSize || ''} ${(config.storyPathTitleAlign || config.storyTextAlign || 'left') === 'left' ? 'text-left' : ((config.storyPathTitleAlign || config.storyTextAlign) === 'right' ? 'text-right' : 'text-center')}`}
                      style={{ 
                        color: config.storyPathTitleColor || config.accentGold || '#b89254',
                        opacity: config.storyPathTitleOpacity !== undefined ? config.storyPathTitleOpacity : 1.0,
                        filter: config.storyPathTitleGlow !== undefined ? `brightness(${config.storyPathTitleGlow}%)` : undefined,
                        transform: config.storyPathTitleYOffset ? `translateY(${config.storyPathTitleYOffset}px)` : undefined
                      }}
                      value={config.storyPathTitle || "Our Path of Serendipity"}
                    />
                    <EditableText config={config}
                      as="p"
                      isEditing={!!onChangeField}
                      onChangeField={onChangeField}
                      onSelect={onSelectElement}
                      tabId="couple"
                      field="storyParagraph"
                    activeColorId={activeColorId}
                    setActiveColorId={setActiveColorId}
                    popoverId="storyParagraph"
                    onChangeColor={(color) => onChangeField && onChangeField('storyParagraphColor', color)}
                    colorValue={config.storyParagraphColor || defaultBodyTextColor}
                    className={`leading-relaxed ${config.storyParagraphFont || config.storyTitleFont || 'font-serif'} ${config.storyParagraphSize || config.storyTextSize || 'text-xs sm:text-sm'} ${(config.storyParagraphAlign || config.storyTextAlign || 'left') === 'left' ? 'text-left' : ((config.storyParagraphAlign || config.storyTextAlign) === 'right' ? 'text-right' : 'text-center')}`}
                    style={{ 
                      color: config.storyParagraphColor || defaultBodyTextColor,
                      opacity: config.storyParagraphOpacity !== undefined ? config.storyParagraphOpacity : 0.9,
                      filter: config.storyParagraphGlow !== undefined ? `brightness(${config.storyParagraphGlow}%)` : undefined,
                      transform: config.storyParagraphYOffset ? `translateY(${config.storyParagraphYOffset}px)` : undefined
                    }}
                    value={config.storyParagraph}
                  />
                </div>
                )}
              </div>
            </div>
          </section>
        </Scroll3DContainer>
      )}

        {/* 3.5. WEDDING CEREMONY TIMELINE SECTION (Immediately Below Meet the Family) */}
        {config.showTimelineSection !== false && (
          <div className="relative w-full my-4 z-20">
            <WeddingTimeline config={config} isPrintMode={isPrintMode} />
          </div>
        )}

        {/* 4. VENUE & DESTINATIONS */}
        {config.showVenueSection !== false && (
          <Scroll3DContainer
            enabled={!isPrintMode && config.scroll3DEnabled !== false}
            intensity={config.scroll3DIntensity || 4}
            perspective={config.scroll3DPerspective || 900}
            effectType={config.scroll3DEffectType || '3d-roll'}
          >
            <section 
              id="venue-section"
            className="py-10 px-4 bg-black/10 w-full mx-auto rounded-3xl border border-white/5"
            style={{
              boxShadow: config.venueShadowEnabled !== false
                ? `0 ${config.venueShadowY ?? 8}px ${config.venueShadowBlur ?? 20}px ${config.venueShadowSpread ?? -4}px ${config.venueShadowColor || 'rgba(0, 0, 0, 0.2)'}`
                : 'none'
            }}
          >
            <div className="max-w-5xl mx-auto">
              {config.showVenueHeader !== false && (
                <div className="text-center mb-6">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-bold block mb-2" style={customStyles.colorAccent}>
                    Ceremony Venue Directions
                  </span>
                  <h2 className={`font-light ${config.venueTitleFont || 'font-serif'} ${config.venueTitleSize || 'text-2xl sm:text-3xl'} ${config.venueTitleAlign || 'text-center'}`}>
                    Sacred Venue &amp; Reception
                  </h2>
                  <div className={`w-16 h-1 bg-amber-500/30 mt-4 ${
                    (config.venueTitleAlign === 'text-center') ? 'mx-auto' :
                    (config.venueTitleAlign === 'text-right') ? 'ml-auto mr-0' : 'mr-auto ml-0'
                  }`} />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Ceremony Venue */}
                {config.showCeremonyVenue !== false && (
                  <div className="p-5 rounded-2xl bg-slate-900/40 border relative overflow-hidden" style={customStyles.borderAccentSoft}>
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${config.accentGold}20` }}>
                          <SvgCalendar className="w-5 h-5" style={customStyles.colorAccent} />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider font-bold opacity-90">Holy Ceremony</p>
                          <EditableText config={config}
                            as="p"
                            isEditing={!!onChangeField}
                            onChangeField={onChangeField}
                            onSelect={onSelectElement}
                            tabId="couple"
                            field="weddingVenue"
                            activeColorId={activeColorId}
                            setActiveColorId={setActiveColorId}
                            popoverId="ceremonyVenue"
                            onChangeColor={(color) => onChangeField && onChangeField('weddingVenueColor', color)}
                            colorValue={config.weddingVenueColor || defaultBodyTextColor}
                            className="font-semibold text-xs sm:text-sm"
                            style={{ color: config.weddingVenueColor || defaultBodyTextColor }}
                            value={config.weddingVenue}
                          />
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${config.accentGold}20` }}>
                          <SvgMapPin className="w-5 h-5" style={customStyles.colorAccent} />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider font-bold opacity-90">Address</p>
                          <EditableText config={config}
                            as="p"
                            isEditing={!!onChangeField}
                            onChangeField={onChangeField}
                            onSelect={onSelectElement}
                            tabId="couple"
                            field="weddingAddress"
                            activeColorId={activeColorId}
                            setActiveColorId={setActiveColorId}
                            popoverId="ceremonyAddress"
                            onChangeColor={(color) => onChangeField && onChangeField('weddingAddressColor', color)}
                            colorValue={config.weddingAddressColor || defaultBodyTextColor}
                            className="text-xs opacity-90"
                            style={{ color: config.weddingAddressColor || defaultBodyTextColor }}
                            value={config.weddingAddress}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${config.accentGold}20` }}>
                          <SvgCalendar className="w-5 h-5" style={customStyles.colorAccent} />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider font-bold opacity-90">Date &amp; Time</p>
                          <EditableText config={config}
                            as="p"
                            isEditing={!!onChangeField}
                            onChangeField={onChangeField}
                            onSelect={onSelectElement}
                            tabId="couple"
                            field="weddingDate"
                            activeColorId={activeColorId}
                            setActiveColorId={setActiveColorId}
                            popoverId="ceremonyDate"
                            onChangeColor={(color) => onChangeField && onChangeField('weddingDateColor', color)}
                            colorValue={config.weddingDateColor || defaultBodyTextColor}
                            className="text-xs opacity-90"
                            style={{ color: config.weddingDateColor || defaultBodyTextColor }}
                            value={config.weddingDate ? `${formatWeddingDate(config.weddingDate)}${formatWeddingTime(config.weddingDate) ? ' at ' + formatWeddingTime(config.weddingDate) : ''}` : 'TBD'}
                            isDate={true}
                            rawValue={config.weddingDate}
                            dateType="datetime-local"
                          />
                        </div>
                      </div>

                      {config.showVenueMaps !== false && config.weddingMapUrl && (
                        <a
                          href={config.weddingMapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={customStyles.glassButton}
                          className="glass-btn-hover px-4 py-2 rounded-lg text-[10px] font-semibold tracking-wider inline-flex items-center space-x-2"
                        >
                          <SvgMapPin className="w-3.5 h-3.5" />
                          <span>Open in Maps</span>
                        </a>
                      )}

                      {config.venueCeremonyImage && (
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-center">
                          <img 
                            src={config.venueCeremonyImage} 
                            alt="Ceremony Venue" 
                            className={`w-full max-h-[180px] object-cover transition-all duration-700 ${getFrameClasses(config.venueCeremonyFrameShape || 'landscape', config.venueCeremonyFrameBorderTheme || 'minimalist')}`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reception Venue */}
                {config.showReceptionVenue !== false && (
                  <div className="p-5 rounded-2xl bg-slate-900/40 border relative overflow-hidden" style={customStyles.borderAccentSoft}>
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${config.accentGold}20` }}>
                          <SvgAward className="w-5 h-5" style={customStyles.colorAccent} />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider font-bold opacity-90">Grand Reception</p>
                          <EditableText config={config}
                            as="p"
                            isEditing={!!onChangeField}
                            onChangeField={onChangeField}
                            onSelect={onSelectElement}
                            tabId="couple"
                            field="receptionVenue"
                            activeColorId={activeColorId}
                            setActiveColorId={setActiveColorId}
                            popoverId="receptionVenue"
                            onChangeColor={(color) => onChangeField && onChangeField('receptionVenueColor', color)}
                            colorValue={config.receptionVenueColor || defaultBodyTextColor}
                            className="font-semibold text-xs sm:text-sm"
                            style={{ color: config.receptionVenueColor || defaultBodyTextColor }}
                            value={config.receptionVenue}
                          />
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${config.accentGold}20` }}>
                          <SvgMapPin className="w-5 h-5" style={customStyles.colorAccent} />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider font-bold opacity-90">Address</p>
                          <EditableText config={config}
                            as="p"
                            isEditing={!!onChangeField}
                            onChangeField={onChangeField}
                            onSelect={onSelectElement}
                            tabId="couple"
                            field="receptionAddress"
                            activeColorId={activeColorId}
                            setActiveColorId={setActiveColorId}
                            popoverId="receptionAddress"
                            onChangeColor={(color) => onChangeField && onChangeField('receptionAddressColor', color)}
                            colorValue={config.receptionAddressColor || defaultBodyTextColor}
                            className="text-xs opacity-90"
                            style={{ color: config.receptionAddressColor || defaultBodyTextColor }}
                            value={config.receptionAddress}
                          />
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${config.accentGold}20` }}>
                          <SvgCalendar className="w-5 h-5" style={customStyles.colorAccent} />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider font-bold opacity-90">Date</p>
                          <EditableText config={config}
                            as="p"
                            isEditing={!!onChangeField}
                            onChangeField={onChangeField}
                            onSelect={onSelectElement}
                            tabId="venue"
                            field="receptionDate"
                            activeColorId={activeColorId}
                            setActiveColorId={setActiveColorId}
                            popoverId="receptionDate"
                            onChangeColor={(color) => onChangeField && onChangeField('receptionDateColor', color)}
                            colorValue={config.receptionDateColor || defaultBodyTextColor}
                            className="text-xs opacity-90"
                            style={{ color: config.receptionDateColor || defaultBodyTextColor }}
                            value={config.receptionDate ? formatWeddingDate(config.receptionDate) : "TBD"}
                            isDate={true}
                            rawValue={config.receptionDate}
                            dateType="date"
                          />
                        </div>
                      </div>

                      {config.showVenueMaps !== false && config.receptionMapUrl && (
                        <a
                          href={config.receptionMapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={customStyles.glassButton}
                          className="glass-btn-hover px-4 py-2 rounded-lg text-[10px] font-semibold tracking-wider inline-flex items-center space-x-2"
                        >
                          <SvgMapPin className="w-3.5 h-3.5" />
                          <span>Open in Maps</span>
                        </a>
                      )}

                      {config.venueReceptionImage && (
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-center">
                          <img 
                            src={config.venueReceptionImage} 
                            alt="Reception Venue" 
                            className={`w-full max-h-[180px] object-cover transition-all duration-700 ${getFrameClasses(config.venueReceptionFrameShape || 'landscape', config.venueReceptionFrameBorderTheme || 'minimalist')}`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </Scroll3DContainer>
      )}

        {/* 4.5 OUR GALLERY SECTION */}
        {config.showGallery !== false && !isPrintMode && (() => {
          if (galleryIndexes.length === 0) return null;
          
          const safeIndex = currentSlideIndex >= galleryIndexes.length ? 0 : currentSlideIndex;
          const activeShape = config[`galleryFrameShape${galleryIndexes[safeIndex]}`] || 'portrait';
          
          const handlePrev = () => {
            setCurrentSlideIndex(prev => (prev - 1 + galleryIndexes.length) % galleryIndexes.length);
          };
          const handleNext = () => {
            setCurrentSlideIndex(prev => (prev + 1) % galleryIndexes.length);
          };

          const getNormalizedDiff = (i) => {
            let d = i - safeIndex;
            const len = galleryIndexes.length;
            if (d > len / 2) d -= len;
            if (d < -len / 2) d += len;
            return d;
          };

          const getAspectClass = (shape) => {
            switch (shape) {
              case 'landscape': return 'aspect-[16/10] max-w-[460px]';
              case 'square':
              case 'round': 
                return 'aspect-square max-w-[360px]';
              case 'oval': return 'aspect-[2/3] max-w-[320px]';
              case 'portrait':
              default:
                return 'aspect-[3/4] max-w-[360px]';
            }
          };

          const getSlideStyle = (diff, effect) => {
            const isCurrent = diff === 0;
            const absDiff = Math.abs(diff);
            
            const baseStyle = {
              position: 'absolute',
              width: '100%',
              height: '100%',
              transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease, z-index 0.8s step-end',
              pointerEvents: isCurrent ? 'auto' : 'none',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transformStyle: 'preserve-3d'
            };

            switch (effect) {
              case 'fade':
                return {
                  ...baseStyle,
                  opacity: isCurrent ? 1 : 0,
                  transform: `scale(${isCurrent ? 1 : 0.96})`,
                  zIndex: isCurrent ? 30 : 10
                };

              case 'stack':
                if (diff < 0) {
                  return {
                    ...baseStyle,
                    transform: 'translateX(-130%) rotate(-12deg) scale(0.9)',
                    opacity: 0,
                    zIndex: 40
                  };
                } else if (diff === 0) {
                  return {
                    ...baseStyle,
                    transform: 'translateX(0) rotate(0deg) scale(1)',
                    opacity: 1,
                    zIndex: 30
                  };
                } else if (diff === 1) {
                  return {
                    ...baseStyle,
                    transform: 'translateX(12px) translateY(6px) rotate(4deg) scale(0.94)',
                    opacity: 0.9,
                    zIndex: 20
                  };
                } else if (diff === 2) {
                  return {
                    ...baseStyle,
                    transform: 'translateX(-12px) translateY(12px) rotate(-6deg) scale(0.88)',
                    opacity: 0.8,
                    zIndex: 10
                  };
                } else {
                  return {
                    ...baseStyle,
                    transform: 'translateY(40px) scale(0.8)',
                    opacity: 0,
                    zIndex: 0
                  };
                }

              case 'fold':
                return {
                  ...baseStyle,
                  transform: diff < 0 
                    ? 'rotateY(-90deg) scale(0.95)' 
                    : diff > 0 
                      ? 'rotateY(90deg) scale(0.95)' 
                      : 'rotateY(0deg) scale(1)',
                  transformOrigin: diff < 0 ? 'left center' : 'right center',
                  opacity: isCurrent ? 1 : 0,
                  zIndex: isCurrent ? 30 : 10
                };

              case 'cube':
                return {
                  ...baseStyle,
                  transform: diff < 0 
                    ? 'rotateY(-90deg) translateZ(180px) translateX(-50%)' 
                    : diff > 0 
                      ? 'rotateY(90deg) translateZ(180px) translateX(50%)' 
                      : 'rotateY(0deg) translateZ(0px)',
                  opacity: isCurrent ? 1 : 0,
                  zIndex: isCurrent ? 30 : 10
                };

              case 'zoom':
                return {
                  ...baseStyle,
                  transform: `scale(${isCurrent ? 1 : diff < 0 ? 1.15 : 0.82})`,
                  opacity: isCurrent ? 1 : 0,
                  zIndex: isCurrent ? 30 : 10
                };

              case 'deck':
                return {
                  ...baseStyle,
                  transform: diff === 0 
                    ? 'scale(1) translateX(0%)' 
                    : diff === -1 
                      ? 'scale(0.84) translateX(-75%)' 
                      : diff === 1 
                        ? 'scale(0.84) translateX(75%)' 
                        : 'scale(0.7) translateX(0%)',
                  opacity: absDiff <= 1 ? (diff === 0 ? 1 : 0.6) : 0,
                  zIndex: 30 - absDiff
                };

              case 'parallax':
                return {
                  ...baseStyle,
                  transform: `translateX(${diff * 100}%)`,
                  opacity: absDiff <= 1 ? 1 : 0,
                  zIndex: isCurrent ? 30 : 10
                };

              case 'flip':
                return {
                  ...baseStyle,
                  transform: diff < 0 
                    ? 'rotateY(-180deg)' 
                    : 'rotateY(0deg)',
                  transformOrigin: 'left center',
                  opacity: diff < 0 ? 0 : isCurrent ? 1 : 0,
                  zIndex: isCurrent ? 30 : 10
                };

              case 'coverflow':
                return {
                  ...baseStyle,
                  transform: diff === 0 
                    ? 'translateX(0) rotateY(0deg) scale(1) translateZ(50px)' 
                    : diff === -1 
                      ? 'translateX(-45%) rotateY(40deg) scale(0.84)' 
                      : diff === 1 
                        ? 'translateX(45%) rotateY(-40deg) scale(0.84)' 
                        : 'scale(0.6)',
                  opacity: absDiff <= 1 ? (diff === 0 ? 1 : 0.6) : 0,
                  zIndex: 30 - absDiff
                };

              case 'slide':
              default:
                return {
                  ...baseStyle,
                  transform: `translateX(${diff * 100}%) scale(${isCurrent ? 1 : 0.95})`,
                  opacity: absDiff <= 1 ? 1 : 0,
                  zIndex: isCurrent ? 30 : 10
                };
            }
          };

          return (
            <Scroll3DContainer
              enabled={config.scroll3DEnabled !== false}
              intensity={config.scroll3DIntensity || 4}
              perspective={config.scroll3DPerspective || 900}
              effectType={config.scroll3DEffectType || '3d-roll'}
            >
              <section 
                id="gallery-section"
                className="py-10 px-4 mx-4 rounded-3xl bg-black/10 border border-white/5 my-4 overflow-hidden relative"
                style={{
                  boxShadow: config.galleryShadowEnabled !== false
                    ? `0 ${config.galleryShadowY ?? 8}px ${config.galleryShadowBlur ?? 20}px ${config.galleryShadowSpread ?? -4}px ${config.galleryShadowColor || 'rgba(0, 0, 0, 0.2)'}`
                    : 'none'
                }}
              >
                <div className="max-w-4xl mx-auto">
                  {config.showGalleryHeader !== false && (
                    <div className="text-center mb-6">
                      <EditableText config={config}
                        as="span"
                        isEditing={!!onChangeField}
                        onChangeField={onChangeField}
                        onSelect={onSelectElement}
                        tabId="gallery"
                        field="gallerySubtitle"
                        value={config.gallerySubtitle || "Our Love in Frames"}
                        className="text-[10px] uppercase tracking-[0.25em] font-bold block mb-2"
                        style={customStyles.colorAccent}
                      />
                      <EditableText config={config}
                        as="h2"
                        isEditing={!!onChangeField}
                        onChangeField={onChangeField}
                        onSelect={onSelectElement}
                        tabId="gallery"
                        field="galleryTitle"
                        value={config.galleryTitle || "Our Gallery"}
                        className={`font-light ${config.galleryTitleFont || 'font-serif'} ${config.galleryTitleSize || 'text-2xl sm:text-3xl'} text-center`}
                      />
                      <div className="w-16 h-0.5 bg-amber-500/30 mx-auto mt-4" />
                    </div>
                  )}

                  {/* Slider Wrap */}
                  {config.showGalleryGrid !== false && (
                    <div className="relative px-8 sm:px-12 max-w-lg mx-auto">
                    <div 
                      className={`relative w-full ${getAspectClass(activeShape)} mx-auto flex items-center justify-center my-6 select-none`}
                      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      {galleryIndexes.map((idx, i) => {
                        const imgUrl = formatDriveDirectUrl(config[`galleryImage${idx}`], "image");
                        const caption = config[`galleryCaption${idx}`];
                        const shape = config[`galleryFrameShape${idx}`] || 'portrait';
                        const border = config[`galleryFrameBorder${idx}`] || 'minimalist';
                        
                        const normalizedDiff = getNormalizedDiff(i);
                        const isCurrent = normalizedDiff === 0;
                        
                        const slideStyle = getSlideStyle(normalizedDiff, config.gallerySlideEffect || "slide");
                        const frameClasses = getFrameClasses(shape, border);
                        
                        return (
                          <div 
                            key={idx} 
                            className="absolute w-full h-full flex flex-col items-center justify-center select-none"
                            style={slideStyle}
                          >
                            <div className={`overflow-hidden relative w-full h-full transition-all duration-700 ${frameClasses}`}>
                              {config.gallerySlideEffect === 'parallax' ? (
                                <img 
                                  src={imgUrl} 
                                  alt={caption || `Gallery ${idx}`}
                                  className="w-full h-full object-cover transition-transform duration-700"
                                  style={{ 
                                    transform: `scale(1.15) translateX(${normalizedDiff * -35}px)`,
                                    width: '100%',
                                    height: '100%'
                                  }}
                                />
                              ) : (
                                <img 
                                  src={imgUrl} 
                                  alt={caption || `Gallery ${idx}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            
                            {caption && isCurrent && (
                              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-center animate-fade-in shadow-xl z-30">
                                <span className="text-[10px] sm:text-xs font-sans text-amber-200 italic block font-semibold truncate">
                                  {caption}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Left/Right Controls */}
                      {galleryIndexes.length > 1 && (
                        <>
                          <button
                            onClick={handlePrev}
                            className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-amber-500/25 border border-white/10 hover:border-amber-500/40 text-amber-400 font-bold transition flex items-center justify-center active:scale-95 cursor-pointer shadow-lg z-45"
                            title="Previous Image"
                          >
                            ◀
                          </button>
                          <button
                            onClick={handleNext}
                            className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-amber-500/25 border border-white/10 hover:border-amber-500/40 text-amber-400 font-bold transition flex items-center justify-center active:scale-95 cursor-pointer shadow-lg z-45"
                            title="Next Image"
                          >
                            ▶
                          </button>
                        </>
                      )}
                    </div>

                    {/* Dot Indicators */}
                    {galleryIndexes.length > 1 && (
                      <div className="flex justify-center items-center space-x-2 mt-4 z-45 relative">
                        {galleryIndexes.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentSlideIndex(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              i === safeIndex 
                                ? 'w-5 bg-amber-500 shadow-glow shadow-amber-500/30' 
                                : 'w-1.5 bg-white/20 hover:bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  )}
                </div>
              </section>
            </Scroll3DContainer>
          );
        })()}

        {/* 5. RSVP SECTION */}
        {config.showRsvpSection !== false && !isPrintMode && (
          <Scroll3DContainer
            enabled={!isPrintMode && config.scroll3DEnabled !== false}
            intensity={config.scroll3DIntensity || 4}
            perspective={config.scroll3DPerspective || 900}
            effectType={config.scroll3DEffectType || '3d-roll'}
          >
            <section 
              id="rsvp-section"
            className="py-10 px-4 w-full mx-auto rounded-3xl bg-black/10 border border-white/5"
            style={{
              boxShadow: config.rsvpShadowEnabled !== false
                ? `0 ${config.rsvpShadowY ?? 8}px ${config.rsvpShadowBlur ?? 20}px ${config.rsvpShadowSpread ?? -4}px ${config.rsvpShadowColor || 'rgba(0, 0, 0, 0.2)'}`
                : 'none'
            }}
          >
            <div className="max-w-4xl mx-auto">
              {config.showRsvpHeader !== false && (
                <div className="text-center mb-6">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-bold block mb-2" style={customStyles.colorAccent}>
                    Will You Be There?
                  </span>
                  <h2 className={`font-light ${config.rsvpTitleFont || 'font-serif'} ${config.rsvpTitleSize || 'text-2xl sm:text-3xl'} ${config.rsvpTitleAlign || 'text-center'}`}>
                    RSVP Reservation
                  </h2>
                  <div className={`w-16 h-1 bg-amber-500/30 mt-4 ${
                    (config.rsvpTitleAlign === 'text-center') ? 'mx-auto' :
                    (config.rsvpTitleAlign === 'text-right') ? 'ml-auto mr-0' : 'mr-auto ml-0'
                  }`} />
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* RSVP Form */}
                {config.showRsvpForm !== false && (
                  <form onSubmit={handleRsvpFormSubmit} className="space-y-4">
                    {existingRsvpForGuest && (
                      <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] flex items-center space-x-1.5 font-medium animate-fade-in">
                        <SvgCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Registered RSVP found. You can adjust your guest count or attendance below and update your response.</span>
                      </div>
                    )}
                    <div>
                      <label className="text-[9px] uppercase tracking-wider font-bold opacity-90 block mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={rsvpForm.name}
                        onChange={(e) => {
                          const newName = e.target.value;
                          const match = (rsvps || []).find(r => (r.name || "").trim().toLowerCase() === newName.trim().toLowerCase());
                          if (match) {
                            setRsvpForm(prev => ({ 
                              ...prev, 
                              name: newName, 
                              attending: match.attending || prev.attending, 
                              count: match.count !== undefined ? match.count : prev.count, 
                              note: match.note || prev.note 
                            }));
                          } else {
                            setRsvpForm(prev => ({ ...prev, name: newName }));
                          }
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-amber-500/50"
                        placeholder="Your name(s)"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] uppercase tracking-wider font-bold opacity-90 block mb-1">Attending</label>
                        <select
                          value={rsvpForm.attending}
                          onChange={(e) => setRsvpForm(prev => ({ ...prev, attending: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-amber-500/50"
                        >
                          <option value="yes" className="bg-slate-900">Joyfully Attending</option>
                          <option value="maybe" className="bg-slate-900">Maybe</option>
                          <option value="no" className="bg-slate-900">Regretfully Decline</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-wider font-bold opacity-90 block mb-1">
                          Guests {existingRsvpForGuest && <span className="text-amber-400 font-bold">(Edit Count)</span>}
                        </label>
                        <input
                          type="number" min="1" max="25"
                          value={rsvpForm.count}
                          onChange={(e) => setRsvpForm(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider font-bold opacity-90 block mb-1">Personal Note</label>
                      <textarea
                        value={rsvpForm.note}
                        onChange={(e) => setRsvpForm(prev => ({ ...prev, note: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-amber-500/50 resize-none"
                        placeholder="A message for the couple..."
                      />
                    </div>
                    <button
                      type="submit"
                      style={customStyles.glassButton}
                      className="glass-btn-hover w-full px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      {existingRsvpForGuest ? <SvgCheck className="w-3.5 h-3.5 text-emerald-400" /> : <SvgSend className="w-3.5 h-3.5" />}
                      <span>{existingRsvpForGuest ? `Update RSVP (Guest Count: ${rsvpForm.count})` : "Confirm RSVP"}</span>
                    </button>
                  </form>
                )}

                {/* RSVP List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  <h3 className="text-xs font-semibold flex items-center space-x-2 mb-4">
                    <SvgUsers className="w-4 h-4" style={customStyles.colorAccent} />
                    <span>Guest Responses ({rsvps.length})</span>
                  </h3>
                  {rsvps.length === 0 ? (
                    <p className="text-[10px] opacity-50 italic text-center py-6">No responses yet. Be the first to RSVP above!</p>
                  ) : (
                    rsvps.map((r, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold">{r.name}</p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              r.attending === 'yes' ? 'bg-emerald-500/20 text-emerald-400' :
                              r.attending === 'maybe' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-rose-500/20 text-rose-400'
                            }`}>
                              {r.attending}
                            </span>
                            {isModerator && onDeleteRsvp && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete the RSVP response for "${r.name}"? Only the customer who ordered this invite or the platform admin can perform this.`)) {
                                    onDeleteRsvp(idx);
                                  }
                                }}
                                className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                                title="Delete RSVP response (Invite Owner / Admin only)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        {r.note && <p className="text-[11px] italic opacity-85">"{r.note}"</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </Scroll3DContainer>
      )}

        {/* 6. BLESSINGS & WISHES */}
        {config.showWishesWall !== false && !isPrintMode && (
          <Scroll3DContainer
            enabled={!isPrintMode && config.scroll3DEnabled !== false}
            intensity={config.scroll3DIntensity || 4}
            perspective={config.scroll3DPerspective || 900}
            effectType={config.scroll3DEffectType || '3d-roll'}
          >
            <section 
              id="wishes-section"
            className="py-10 px-4 w-full mx-auto rounded-3xl bg-black/10 border border-white/5 mb-16 sm:mb-24"
            style={{
              boxShadow: config.rsvpShadowEnabled !== false
                ? `0 ${config.rsvpShadowY ?? 8}px ${config.rsvpShadowBlur ?? 20}px ${config.rsvpShadowSpread ?? -4}px ${config.rsvpShadowColor || 'rgba(0, 0, 0, 0.2)'}`
                : 'none'
            }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold block mb-2" style={customStyles.colorAccent}>
                  Share Your Love
                </span>
                <h2 className={`font-light ${config.wishTitleFont || 'font-serif'} ${config.wishTitleSize || 'text-2xl sm:text-3xl'} ${config.wishTitleAlign || 'text-center'}`}>
                  Blessings &amp; Wishes
                </h2>
                <div className={`w-16 h-1 bg-amber-500/30 mt-4 ${
                  (config.wishTitleAlign === 'text-center') ? 'mx-auto' :
                  (config.wishTitleAlign === 'text-right') ? 'ml-auto mr-0' : 'mr-auto ml-0'
                }`} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Wish Form */}
                <form onSubmit={handleWishFormSubmit} className="space-y-4">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-bold opacity-90 block mb-1">Your Name *</label>
                    <input
                      type="text"
                      value={wishForm.sender}
                      onChange={(e) => setWishForm(prev => ({ ...prev, sender: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-amber-500/50"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-bold opacity-90 block mb-1">Your Blessing *</label>
                    <textarea
                      value={wishForm.message}
                      onChange={(e) => setWishForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-amber-500/50 resize-none"
                      placeholder="Write a heartfelt message for the couple..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    style={customStyles.glassButton}
                    className="w-full px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 transition glass-btn-hover cursor-pointer"
                  >
                    <SvgHeart className="w-3.5 h-3.5" fill="currentColor" />
                    <span>Send Blessings</span>
                  </button>
                </form>

                {/* Wishes List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  <h3 className="text-xs font-semibold flex items-center space-x-2 mb-4">
                    <SvgMessageSquare className="w-4 h-4" style={customStyles.colorAccent} />
                    <span>Blessings Posted ({uniqueWishes.length})</span>
                  </h3>
                  {uniqueWishes.length === 0 ? (
                    <p className="text-[10px] opacity-50 italic text-center py-6">No blessings posted yet. Send your love and wishes above!</p>
                  ) : (
                    uniqueWishes.map((w, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <p className="font-semibold">{w.sender}</p>
                          <div className="flex items-center space-x-2">
                            <span className="opacity-50 text-[9px]">{w.date || 'Just now'}</span>
                            {isModerator && onDeleteWish && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete the blessing by "${w.sender}"? Only the customer who ordered this invite or the platform admin can perform this.`)) {
                                    onDeleteWish(idx);
                                  }
                                }}
                                className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                                title="Delete Blessing (Invite Owner / Admin only)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] italic opacity-85">"{w.message}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </Scroll3DContainer>
      )}

      </div>
    </div>
  );
}
