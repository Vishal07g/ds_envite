import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SvgHeart, SvgSparkles } from './icons';
import { EditableText } from './EditableText';
import { formatDriveDirectUrl } from '../utils/helpers';

// Hook to load image and make dark background genuinely transparent via canvas
function useTransparentAsset(rawImageSrc, threshold = 24) {
  const imageSrc = formatDriveDirectUrl(rawImageSrc, 'image');
  const [cleanSrc, setCleanSrc] = useState(imageSrc);

  useEffect(() => {
    if (!imageSrc) return;
    if (imageSrc.endsWith('.svg') || imageSrc.startsWith('data:image/png')) {
      setCleanSrc(imageSrc);
      return;
    }
    let isMounted = true;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const maxVal = Math.max(r, g, b);
          if (maxVal < threshold) {
            data[i + 3] = 0;
          } else if (maxVal < threshold + 24) {
            data[i + 3] = Math.round(((maxVal - threshold) / 24) * 255);
          }
        }
        ctx.putImageData(imgData, 0, 0);
        if (isMounted) {
          setCleanSrc(canvas.toDataURL('image/png'));
        }
      } catch (e) {
        if (isMounted) setCleanSrc(imageSrc);
      }
    };
    img.onerror = () => {
      if (isMounted) setCleanSrc(imageSrc);
    };
    img.src = imageSrc;

    return () => { isMounted = false; };
  }, [imageSrc, threshold]);

  return cleanSrc;
}

export default function EnvelopeOpener({ 
  config, 
  onOpen, 
  onOpenComplete,
  isOpeningAnim,
  onChangeField,
  onSelectElement,
  activeColorId,
  setActiveColorId
}) {
  const accentGold = config.accentGold || "#d4af37";
  const lightBgColor = config.lightBgColor || "#faf6f0";
  const openingStyle = config.envelopeOpeningStyle || "classic-envelope"; // "classic-envelope", "royal-doors", "leaf-blown", "petal-blown", "royal-curtains"

  // Transparent assets for petals & leaves
  const transparentPetalSrc = useTransparentAsset(config.envelopePetalImg || '/real_rose_petal.jpg', 32);
  const transparentLeafSrc = useTransparentAsset(config.envelopeLeafImg || '/real_autumn_leaf.jpg', 28);

  // Real Wax Seal Asset & Paper Texture Asset
  const activeWaxSealImage = config.envelopeWaxSealImg 
    || (config.envelopeSealType === 'real-burgundy' ? '/real_wax_seal_burgundy.jpg' : '/real_wax_seal_gold.jpg');
  const transparentWaxSealSrc = useTransparentAsset(activeWaxSealImage, 22);

  const paperTextureSrc = config.envelopePaperTexture || '/real_paper_texture.jpg';
  const paperOpacity = config.envelopePaperOpacity !== undefined ? config.envelopePaperOpacity : 0.75;
  const showPaperTexture = config.showEnvelopePaperTexture !== false;
  const showFolds = config.showEnvelopeFolds !== false;
  const sealSizePx = config.envelopeSealSizePx || 104;

  // Cover Sizing & Responsive Shape Mode
  const sizingMode = config.envelopeSizingMode || "classic-rectangle"; // "classic-rectangle", "responsive-card", "full-bleed"
  const aspectRatioSetting = config.envelopeAspectRatio || "auto"; // "auto", "classic-horizontal", "portrait", "square"
  const maxWidthSetting = config.envelopeMaxWidth || 760;

  // Envelope colors & properties
  const envelopeBg = config.envelopeBgColor || "#5a0e1c"; // Deep rich burgundy/wine matching reference
  const envelopeBgImage = config.showEnvelopeTexture !== false ? config.envelopeBgImage : undefined;
  const sealColor = config.envelopeSealColor || "#c89f4b"; // Antique gold
  const resolvedBride = (config.coverBrideText || config.brideName || "").trim();
  const resolvedGroom = (config.coverGroomText || config.groomName || "").trim();
  const autoCoupleNames = (resolvedBride && resolvedGroom)
    ? `${resolvedBride} & ${resolvedGroom}`
    : (resolvedBride || resolvedGroom || "");

  const isDummyText = (txt) => {
    if (!txt) return true;
    const t = String(txt).trim().toLowerCase();
    return t.includes("ananya") || t.includes("aarav") || t === "bride & groom" || t === "bride" || t === "groom";
  };

  const isCustomEnvelopeName = config.envelopeNamesText &&
    config.envelopeNamesText.trim() &&
    !isDummyText(config.envelopeNamesText);

  const namesText = (isCustomEnvelopeName ? config.envelopeNamesText : (autoCoupleNames || config.envelopeNamesText || "")).trim();

  const autoInitials = (resolvedBride && resolvedGroom)
    ? `${resolvedBride.charAt(0)} & ${resolvedGroom.charAt(0)}`
    : "";

  const isCustomInitials = config.envelopeInitials &&
    !config.envelopeInitials.toUpperCase().includes("A & A") &&
    !config.envelopeInitials.toUpperCase().includes("A 👑 A");

  const initials = isCustomInitials ? config.envelopeInitials : (autoInitials || (resolvedBride && resolvedGroom ? `${resolvedBride.charAt(0)} & ${resolvedGroom.charAt(0)}` : "S & V"));
  const tagline = config.envelopeTagline || "Cordially Invited";
  const animDuration = Math.max(1.0, parseFloat(config.envelopeSpeed || "1.2"));
  const particleCount = parseInt(config.envelopeParticles || "24");
  const particleType = config.envelopeParticleType || "sparkles";

  // Dynamic text values
  const symbolText = config.envelopeSymbolText || config.customSacredSymbol || "❤";
  const inviteLabel = config.envelopeInviteLabelText || "Together with their families, request the pleasure of your company";
  const btnText = config.envelopeBtnText || "Open Invitation";

  // Seal Top Percent (balanced between 25% and 52%, default 42%)
  const sealTopPercent = config.envelopeSealTop !== undefined 
    ? Math.min(52, Math.max(25, parseInt(config.envelopeSealTop))) 
    : 42;

  // Dynamic Flap Cut Shape
  const getFlapClipPath = () => {
    const shape = config.envelopeFlapShape || "classic-v";
    if (shape === "curved-scoop") {
      return "polygon(0 0, 100% 0, 96% 22%, 50% 100%, 4% 22%)";
    }
    if (shape === "deep-royal") {
      return "polygon(0 0, 100% 0, 85% 18%, 50% 100%, 15% 18%)";
    }
    return "polygon(0 0, 100% 0, 50% 100%)";
  };

  // Dynamic Wax Seal Outer Contour Shape
  const getSealOuterShape = () => {
    const shape = config.envelopeSealShape || "organic";
    if (shape === "circle") {
      return {
        borderRadius: "50%",
        clipPath: "none",
      };
    }
    if (shape === "shield") {
      return {
        borderRadius: "8px 8px 45% 45%",
        clipPath: "polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)",
      };
    }
    if (shape === "hexagon") {
      return {
        borderRadius: "6px",
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
      };
    }
    // Default: Organic melted wax
    return {
      borderRadius: "48% 52% 46% 54% / 53% 47% 54% 46%",
      clipPath: "none",
    };
  };

  // Animation Phases:
  // 0: Idle / Ready
  // 1: Clicked - Breaking seal / handle trigger (0ms - 200ms)
  // 2: Main animation executing (flap flips, doors open, leaves blown, curtains part) (200ms - 600ms)
  // 3: Inner card or golden revelation appears (550ms - 1100ms)
  // 4: Dissolve into main invitation (1050ms - 1500ms)
  const [animPhase, setAnimPhase] = useState(0);
  const [sparkleBurst, setSparkleBurst] = useState([]);
  const hasTriggeredRef = useRef(false);

  // Reset trigger ref if style changes
  useEffect(() => {
    hasTriggeredRef.current = false;
    setAnimPhase(0);
  }, [openingStyle]);

  useEffect(() => {
    if (isOpeningAnim && animPhase === 0) {
      triggerOpenSequence();
    }
  }, [isOpeningAnim]);

  const triggerOpenSequence = () => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    // Generate burst sparkles
    const bursts = Array.from({ length: 20 }).map((_, i) => ({
      angle: (i * 360) / 20,
      distance: 60 + Math.random() * 80,
      size: 10 + Math.random() * 14,
      delay: Math.random() * 0.12,
    }));
    setSparkleBurst(bursts);

    setAnimPhase(1);

    // Phase 2: Core mechanical motion
    setTimeout(() => {
      setAnimPhase(2);
    }, 180);

    // Phase 3: Card / Light revelation
    setTimeout(() => {
      setAnimPhase(3);
    }, 550);

    // Phase 4: Final dissolve into invitation
    setTimeout(() => {
      setAnimPhase(4);
    }, 1150);

    // Complete callback
    setTimeout(() => {
      if (onOpenComplete) onOpenComplete();
    }, 1500);
  };

  const handleUserClickOpen = () => {
    if (animPhase > 0) return;
    if (onOpen) onOpen();
    triggerOpenSequence();
  };

  const getJustifyClass = (align) => {
    if (align === 'text-left') return 'justify-start';
    if (align === 'text-right') return 'justify-end';
    return 'justify-center';
  };

  const renderParticleIcon = (i) => {
    if (particleType === "hearts") return "❤";
    if (particleType === "petals") return "🌸";
    if (particleType === "confetti") return i % 2 === 0 ? "✨" : "🎉";
    if (particleType === "om") return "ॐ";
    return "✦";
  };

  // 3D Wax Seal Embossed Icon
  const renderSealIcon = () => {
    if (config.envelopeWaxSealImg) {
      return (
        <img
          src={config.envelopeWaxSealImg}
          alt="Wax Seal Stamp"
          className="w-[72%] h-[72%] object-contain select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
        />
      );
    }
    const sealType = config.envelopeSealType || "heart";
    if (sealType === "initials") {
      return (
        <span 
          className="font-cinzel text-amber-100 font-bold tracking-wider select-none text-xs sm:text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(255,230,150,0.5)' }}
        >
          {initials}
        </span>
      );
    }
    if (sealType === "rings") {
      return (
        <svg className="w-[62%] h-[62%]" viewBox="0 0 32 32" fill="none">
          <path d="M12 9l2-3h4l2 3-4 3-4-3z" fill="rgba(255,235,170,0.85)" stroke="rgba(110,80,20,0.8)" strokeWidth="0.8" />
          <circle cx="12" cy="18" r="6.5" stroke="rgba(110,80,20,0.85)" strokeWidth="2.2" />
          <circle cx="12" cy="18" r="6.5" stroke="rgba(255,230,150,0.5)" strokeWidth="0.8" />
          <circle cx="20" cy="18" r="6.5" stroke="rgba(110,80,20,0.85)" strokeWidth="2.2" />
          <circle cx="20" cy="18" r="6.5" stroke="rgba(255,230,150,0.5)" strokeWidth="0.8" />
        </svg>
      );
    }
    if (sealType === "rose") {
      return (
        <svg className="w-[62%] h-[62%]" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="stampRoseGrad" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stopColor="rgba(255,235,170,0.95)" />
              <stop offset="50%" stopColor="rgba(170,125,40,0.9)" />
              <stop offset="100%" stopColor="rgba(80,55,15,0.85)" />
            </linearGradient>
          </defs>
          <path
            d="M50 25 C42 25 36 31 38 39 C40 47 48 48 50 44 C52 40 46 38 46 34 C46 30 54 30 54 35 C54 42 42 45 40 54 C38 64 50 70 58 66 C66 62 66 52 60 48 C55 45 52 48 50 52 M34 40 C28 46 30 56 36 60 M64 36 C72 42 70 54 64 58 M50 66 C48 76 52 82 52 84 M46 76 C40 76 34 72 32 68 M54 78 C60 78 66 74 68 70"
            stroke="url(#stampRoseGrad)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.45))' }}
          />
        </svg>
      );
    }
    // Default Heart
    return (
      <svg className="w-[62%] h-[62%]" viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id="stampHeartGrad" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="rgba(255,235,170,0.9)" />
            <stop offset="45%" stopColor="rgba(170,125,40,0.85)" />
            <stop offset="100%" stopColor="rgba(80,55,15,0.8)" />
          </linearGradient>
        </defs>
        <path 
          d="M20 33.5s-2-1.3-4.5-3.6C9.5 24.5 4 19 4 13.5 4 9 7.5 5.5 12 5.5c2.8 0 5.2 1.4 8 4.6 2.8-3.2 5.2-4.6 8-4.6 4.5 0 8 3.5 8 8 0 5.5-5.5 11-11.5 16.4C22 32.2 20 33.5 20 33.5z" 
          stroke="url(#stampHeartGrad)" 
          strokeWidth="2.4" 
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.4))' }}
        />
        <path 
          d="M20 28.5s-1.4-1-3.2-2.5C11.5 21.5 7.5 17.5 7.5 13.5c0-3 2.2-5.5 5.2-5.5 2 0 3.8 1.2 5.8 3.6 2-2.4 3.8-3.6 5.8-3.6 3 0 5.2 2.5 5.2 5.5 0 4-4 8-9.3 12.5C21.4 27.5 20 28.5 20 28.5z" 
          stroke="rgba(255,235,170,0.6)" 
          strokeWidth="1.4" 
          strokeLinecap="round"
        />
      </svg>
    );
  };

  // High-performance lightweight paper texture pattern
  const paperNoiseTexture = `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='4' cy='4' r='0.6' fill='%23ffffff' opacity='0.06'/%3E%3Ccircle cx='20' cy='12' r='0.6' fill='%23ffffff' opacity='0.04'/%3E%3Ccircle cx='10' cy='24' r='0.6' fill='%23000000' opacity='0.05'/%3E%3Ccircle cx='26' cy='28' r='0.6' fill='%23000000' opacity='0.04'/%3E%3C/svg%3E")`;

  // Precomputed leaves for leaf-blown mode
  const autumnLeaves = useMemo(() => {
    const leafColors = ['#f59e0b', '#d97706', '#b45309', '#ef4444', '#dc2626', '#ca8a04', '#eab308'];
    return Array.from({ length: 32 }).map((_, i) => ({
      id: i,
      x: (i * 29) % 94 + 3,
      y: (i * 37) % 92 + 4,
      scale: 0.7 + (i % 5) * 0.22,
      rotation: (i * 47) % 360,
      color: leafColors[i % leafColors.length],
      // Velocity vectors for the big blast
      blowX: ((i % 2 === 0 ? 1 : -1) * (180 + (i % 6) * 120)),
      blowY: -200 - (i % 8) * 110,
      blowRot: 360 + (i * 65),
      delay: (i % 10) * 0.02,
    }));
  }, []);

  // Precomputed rose petals for petal-blown mode
  const rosePetals = useMemo(() => {
    const petalColors = ['#e11d48', '#be123c', '#9f1239', '#f43f5e', '#fb7185', '#fda4af', '#f59e0b'];
    return Array.from({ length: 36 }).map((_, i) => {
      const angle = (i * 360) / 36;
      const radius = 100 + (i % 5) * 60;
      return {
        id: i,
        x: (i * 31) % 94 + 3,
        y: (i * 41) % 92 + 4,
        scale: 0.65 + (i % 4) * 0.25,
        rotation: (i * 53) % 360,
        color: petalColors[i % petalColors.length],
        blowDist: 400 + (i % 6) * 180,
        blowAngle: angle,
        delay: (i % 12) * 0.015,
      };
    });
  }, []);

  return (
    <div 
      className={`w-full h-screen h-dvh max-h-screen fixed inset-0 flex flex-col items-center justify-center overflow-hidden select-none transition-opacity duration-500 z-50 p-2 sm:p-4 md:p-6 ${animPhase >= 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} 
      style={{ 
        background: sizingMode === "full-bleed" 
          ? envelopeBg 
          : `radial-gradient(ellipse at 50% 50%, rgba(22, 5, 11, 0.96) 0%, #060204 100%)`,
        touchAction: 'none',
        overscrollBehavior: 'none',
      }}
      onClick={(e) => {
        // Tapping background or envelope triggers starting song playback
        window.dispatchEvent(new Event('envelopeUserTapped'));
      }}
      onPointerDown={() => window.dispatchEvent(new Event('envelopeUserTapped'))}
      onTouchStart={() => window.dispatchEvent(new Event('envelopeUserTapped'))}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,600&family=Great+Vibes&family=Inter:wght@300;400;600&family=Italiana&family=Marcellus&family=Montserrat:wght@300;600&family=Pinyon+Script&family=Playball&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Rozha+One&family=Yatra+One&display=swap');

        .font-cinzel { font-family: 'Cinzel', Georgia, serif; }
        .font-cinzel-dec { font-family: 'Cinzel Decorative', Georgia, serif; }
        .font-cursive { font-family: 'Great Vibes', cursive, serif; }
        .font-serif { font-family: 'Playfair Display', Georgia, serif; }
        .font-cormorant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-italiana { font-family: 'Italiana', Georgia, serif; }
        .font-alex { font-family: 'Alex Brush', cursive, serif; }
        .font-pinyon { font-family: 'Pinyon Script', cursive, serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-marcellus { font-family: 'Marcellus', serif; }

        /* 3D Flap Opening Keyframes */
        @keyframes flapFlipOpen {
          0% {
            transform: rotateX(0deg);
            z-index: 28;
          }
          49% {
            z-index: 28;
          }
          50% {
            z-index: 4;
          }
          100% {
            transform: rotateX(-180deg);
            z-index: 4;
          }
        }

        /* Inner Invitation Card Sliding Up Out of Pocket */
        @keyframes cardSlideUp {
          0% {
            transform: translateY(14%) scale(0.94);
            opacity: 0.9;
          }
          55% {
            transform: translateY(-34%) scale(0.98);
            opacity: 1;
          }
          100% {
            transform: translateY(-54%) scale(1.02);
            opacity: 1;
          }
        }

        /* Wax Seal Breaking & Lift */
        @keyframes sealDetached {
          0% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 1;
          }
          30% {
            transform: translate(-50%, -60%) scale(1.15) rotate(-6deg);
            opacity: 0.95;
          }
          100% {
            transform: translate(-50%, -180%) scale(0.3) rotate(-24deg);
            opacity: 0;
          }
        }

        /* Sparkle burst keyframe */
        @keyframes sparkleRadiate {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(1.2);
            opacity: 0;
          }
        }

        /* Whole Envelope Dissolve & Zoom into invitation */
        @keyframes envelopeFadeAway {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          40% {
            opacity: 0.9;
            transform: scale(1.02);
          }
          100% {
            opacity: 0;
            transform: scale(1.1);
          }
        }

        /* Idle Seal Breathing Pulse */
        @keyframes sealBreathing {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            filter: drop-shadow(0 6px 16px rgba(0,0,0,0.55));
          }
          50% {
            transform: translate(-50%, -50%) scale(1.035);
            filter: drop-shadow(0 9px 24px rgba(0,0,0,0.7));
          }
        }

        /* Ambient floating particles */
        @keyframes ambientFloat {
          0% {
            transform: translateY(105vh) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 0.45; }
          90% { opacity: 0.45; }
          100% {
            transform: translateY(-10vh) rotate(360deg);
            opacity: 0;
          }
        }

        /* Royal 3D Palace Doors Swinging Open */
        @keyframes doorSwingLeft {
          0% {
            transform: perspective(1400px) rotateY(0deg);
          }
          100% {
            transform: perspective(1400px) rotateY(-112deg);
          }
        }
        @keyframes doorSwingRight {
          0% {
            transform: perspective(1400px) rotateY(0deg);
          }
          100% {
            transform: perspective(1400px) rotateY(112deg);
          }
        }

        /* Royal Curtains Parting to Left & Right */
        @keyframes curtainDrawLeft {
          0% {
            transform: translateX(0%) scaleX(1);
          }
          100% {
            transform: translateX(-102%) scaleX(0.5);
          }
        }
        @keyframes curtainDrawRight {
          0% {
            transform: translateX(0%) scaleX(1);
          }
          100% {
            transform: translateX(102%) scaleX(0.5);
          }
        }

        /* Gentle Swaying for Leaves & Petals */
        @keyframes leafSway {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(4px, 8px) rotate(6deg);
          }
        }

        /* Autumn Leaves Blown Blast */
        @keyframes leafBlast {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--bx), var(--by)) rotate(var(--brot)) scale(1.4);
            opacity: 0;
          }
        }

        /* Rose Petal Vortex Swirl */
        @keyframes petalVortex {
          0% {
            transform: rotate(var(--pangle)) translate(0px) scale(1);
            opacity: 1;
          }
          100% {
            transform: rotate(calc(var(--pangle) + 360deg)) translate(var(--pdist)) scale(1.6);
            opacity: 0;
          }
        }

        .flap-open-3d {
          animation: flapFlipOpen 0.55s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          will-change: transform;
        }

        .card-emerging {
          animation: cardSlideUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          will-change: transform, opacity;
        }

        .envelope-dissolve {
          animation: envelopeFadeAway 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          will-change: transform, opacity;
        }

        .seal-bursting {
          animation: sealDetached 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          will-change: transform, opacity;
        }

        .seal-idle-pulse {
          animation: sealBreathing 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: transform, filter;
        }
      `}</style>

      {/* ─── Ambient Floating Gold Dust Particles (Float around the ambient room) ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[3]">
        {Array.from({ length: particleCount }).map((_, i) => (
          <div
            key={i}
            className="absolute select-none"
            style={{
              left: `${(i * 137.5) % 98}%`,
              animation: `ambientFloat ${8 + (i % 6) * 2.2}s linear infinite`,
              animationDelay: `${(i % 8) * 0.9}s`,
              fontSize: `${8 + (i % 4) * 4}px`,
              color: `${accentGold}55`,
            }}
          >
            {renderParticleIcon(i)}
          </div>
        ))}
      </div>

      {/* ─── ENVELOPE / COVER STAGE CONTAINER (Maintains balanced rectangle shape without stretching) ─── */}
      <div 
        className={`relative flex items-center justify-center transition-all duration-500 overflow-hidden ${
          sizingMode === "full-bleed" 
            ? "w-full h-full inset-0 absolute" 
            : sizingMode === "responsive-card"
            ? "w-[94vw] max-w-[820px] h-[86vh] max-h-[680px] rounded-2xl shadow-2xl"
            : aspectRatioSetting === "portrait"
            ? "w-[92vw] max-w-[440px] aspect-[1/1.38] max-h-[85vh] rounded-2xl shadow-2xl"
            : aspectRatioSetting === "square"
            ? "w-[90vw] max-w-[620px] aspect-square max-h-[85vh] rounded-2xl shadow-2xl"
            : aspectRatioSetting === "classic-horizontal"
            ? "w-[94vw] max-w-[780px] aspect-[1.45/1] max-h-[85vh] rounded-2xl shadow-2xl"
            : "w-[92vw] max-w-[760px] aspect-[1/1.36] sm:aspect-[1.42/1] max-h-[85vh] rounded-2xl shadow-2xl"
        }`}
        style={{
          backgroundColor: envelopeBg,
          boxShadow: sizingMode === "full-bleed" 
            ? "none" 
            : "0 28px 75px -12px rgba(0,0,0,0.85), 0 0 0 1.5px rgba(212,175,55,0.28)",
          ...(sizingMode !== "full-bleed" && config.envelopeMaxWidth ? { maxWidth: `${config.envelopeMaxWidth}px` } : {})
        }}
      >
        {/* Base Background Image / Custom Texture (Unified, continuous across envelope) */}
        {config.envelopeBgImage && config.showEnvelopeTexture !== false && (
          <div 
            className="absolute inset-0 pointer-events-none z-[0]"
            style={{
              backgroundImage: `url(${config.envelopeBgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.88,
            }}
          />
        )}

        {/* Real Handmade Cotton Paper Texture Layers */}
        {showPaperTexture && (
          <>
            <div 
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                backgroundImage: `url(${paperTextureSrc})`,
                backgroundRepeat: 'repeat',
                backgroundSize: '400px 400px',
                mixBlendMode: 'multiply',
                opacity: paperOpacity,
              }}
            />
            <div 
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                backgroundImage: `url(${paperTextureSrc})`,
                backgroundRepeat: 'repeat',
                backgroundSize: '400px 400px',
                mixBlendMode: 'overlay',
                opacity: 0.24,
              }}
            />
          </>
        )}

        {/* Subtle Paper Ambient Lighting Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-overlay z-[2]" 
          style={{ backgroundImage: paperNoiseTexture }} 
        />

        {/* Soft Overhead Warm Spotlight */}
        <div 
          className="absolute inset-0 pointer-events-none z-[2]" 
          style={{ 
            background: 'radial-gradient(ellipse at 50% 36%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 45%, transparent 75%)' 
          }} 
        />

        {/* Rich Vignette at edges */}
        <div 
          className="absolute inset-0 pointer-events-none z-[2]" 
          style={{ 
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.35) 85%, rgba(0,0,0,0.6) 100%)' 
          }} 
        />

      {/* ══════════════════════════════════════════════════════════════════════════
          STYLE 1: CLASSIC ENVELOPE (Fully closed, realistic 3D folding flap)
         ══════════════════════════════════════════════════════════════════════════ */}
      {openingStyle === "classic-envelope" && (
        <div 
          className={`absolute inset-0 z-[5] cursor-pointer overflow-hidden select-none ${animPhase >= 4 ? 'envelope-dissolve' : ''}`}
          style={{ perspective: '1800px' }}
        >
          {/* Subtle Outer Frame */}
          <div 
            className="absolute inset-2 sm:inset-3 md:inset-4 rounded-xl pointer-events-none z-[16] border"
            style={{ borderColor: `${accentGold}30` }}
          />

          {/* Interior Lining (visible when top flap opens) */}
          <div 
            className="absolute inset-0 z-[3]"
            style={{
              backgroundColor: `${envelopeBg}`,
              filter: 'brightness(0.65) saturate(1.1)',
              backgroundImage: paperNoiseTexture,
            }}
          >
            <div 
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, ${accentGold} 1.5px, transparent 1.5px)`,
                backgroundSize: '24px 24px',
              }}
            />
          </div>

          {/* The Inner Luxury Invitation Card (Slides up when opened) */}
          <div 
            className={`absolute left-1/2 -translate-x-1/2 w-[90vw] max-w-[620px] h-[78vh] max-h-[680px] rounded-xl z-[6] pointer-events-none transition-transform duration-700 ${animPhase >= 3 ? 'card-emerging' : ''}`}
            style={{
              top: '8%',
              backgroundColor: lightBgColor,
              boxShadow: '0 20px 45px rgba(0,0,0,0.65), 0 4px 12px rgba(0,0,0,0.3)',
              border: `1px solid ${accentGold}60`,
              opacity: animPhase >= 2 ? 1 : 0,
              transform: animPhase >= 3 ? undefined : 'translateY(12%) scale(0.96)',
            }}
          >
            <div 
              className="absolute inset-3 sm:inset-5 rounded-lg border flex flex-col items-center justify-between p-4 sm:p-6 text-center"
              style={{ borderColor: `${accentGold}55` }}
            >
              <div 
                className="absolute inset-1.5 sm:inset-2 rounded border pointer-events-none" 
                style={{ borderColor: `${accentGold}35` }} 
              />
              <div className="space-y-1 sm:space-y-2 pt-2">
                <span className="text-xl sm:text-2xl text-amber-600 block">{symbolText}</span>
                <p 
                  className="text-[9px] sm:text-[11px] uppercase tracking-[0.22em] font-sans font-medium"
                  style={{ color: `${accentGold}` }}
                >
                  Wedding Celebration
                </p>
              </div>
              <div className="my-auto py-2">
                <h1 
                  className="text-2xl sm:text-3xl md:text-4xl font-cinzel font-semibold tracking-wider"
                  style={{ color: envelopeBg, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                >
                  {namesText}
                </h1>
                <div className="w-16 h-px mx-auto my-2" style={{ backgroundColor: `${accentGold}70` }} />
                <p className="text-[10px] sm:text-xs max-w-xs mx-auto font-serif italic text-slate-700">
                  {inviteLabel}
                </p>
              </div>
              <div className="pb-2">
                <p 
                  className="text-[9px] sm:text-[10px] font-sans tracking-widest uppercase"
                  style={{ color: `${accentGold}` }}
                >
                  Save The Date
                </p>
              </div>
            </div>
          </div>

          {/* ─── REALISTIC PAPER ENVELOPE FOLDS (Authentic Fold Geometry) ─── */}
          {showFolds && (
            <div className="absolute inset-0 pointer-events-none z-[12] overflow-hidden">
              {/* Left Flap Fold */}
              <div 
                className="absolute inset-0"
                style={{
                  clipPath: `polygon(0% 0%, 48% ${sealTopPercent + 4}%, 0% 100%)`,
                  background: 'linear-gradient(90deg, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.02) 80%, rgba(255,255,255,0.04) 100%)',
                }}
              />
              {/* Right Flap Fold */}
              <div 
                className="absolute inset-0"
                style={{
                  clipPath: `polygon(100% 0%, 52% ${sealTopPercent + 4}%, 100% 100%)`,
                  background: 'linear-gradient(-90deg, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.02) 80%, rgba(255,255,255,0.04) 100%)',
                }}
              />
              {/* Bottom Flap Fold (Overlaps side folds) */}
              <div 
                className="absolute inset-0"
                style={{
                  clipPath: `polygon(0% 100%, 50% ${sealTopPercent + 3}%, 100% 100%)`,
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.03) 75%, rgba(255,255,255,0.05) 100%)',
                }}
              />
              {/* Authentic Paper Crease Lines in SVG */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none" 
                preserveAspectRatio="none" 
                viewBox="0 0 100 100"
              >
                {/* Bottom flap crease shadow & fine paper edge */}
                <polyline 
                  points={`0,100 50,${sealTopPercent + 3} 100,100`} 
                  fill="none" 
                  stroke="rgba(0,0,0,0.24)" 
                  strokeWidth="0.8" 
                  vectorEffect="non-scaling-stroke" 
                />
                <polyline 
                  points={`0,100 50,${sealTopPercent + 3} 100,100`} 
                  fill="none" 
                  stroke="rgba(255,255,255,0.09)" 
                  strokeWidth="0.4" 
                  vectorEffect="non-scaling-stroke" 
                />
                {/* Side fold crease lines */}
                <line 
                  x1="0" y1="0" x2="48" y2={`${sealTopPercent + 4}`} 
                  stroke="rgba(0,0,0,0.18)" 
                  strokeWidth="0.6" 
                  vectorEffect="non-scaling-stroke" 
                />
                <line 
                  x1="100" y1="0" x2="52" y2={`${sealTopPercent + 4}`} 
                  stroke="rgba(0,0,0,0.18)" 
                  strokeWidth="0.6" 
                  vectorEffect="non-scaling-stroke" 
                />
              </svg>
            </div>
          )}

          {/* ─── FRONT POCKET CONTAINER (Houses card when open) ─── */}
          <div 
            className="absolute inset-x-0 bottom-0 pointer-events-none z-[14]"
            style={{
              height: `${100 - sealTopPercent}%`,
              backgroundColor: animPhase >= 2 ? envelopeBg : 'transparent',
            }}
          >
            {/* Pocket opening depth shadow only visible during opening animation */}
            {animPhase >= 2 && (
              <div 
                className="absolute top-0 inset-x-0 h-14 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)'
                }}
              />
            )}
          </div>

          {/* ─── TOP V-FLAP (Faces down over the pocket when closed; flips open in 3D) ─── */}
          <div
            className={`absolute top-0 left-0 right-0 origin-top cursor-pointer ${animPhase >= 2 ? 'flap-open-3d' : ''}`}
            style={{ 
              height: `${sealTopPercent + 4}%`,
              transformStyle: 'preserve-3d',
              perspective: '1800px',
              transformOrigin: 'top center',
              zIndex: animPhase >= 2 ? 4 : 25,
            }}
          >
            {/* Front of Top Flap */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundColor: envelopeBg,
                clipPath: getFlapClipPath(),
                filter: 'brightness(1.01)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              {/* Paper texture on flap */}
              {showPaperTexture && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{ 
                    backgroundImage: `url(${paperTextureSrc})`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '400px 400px',
                    mixBlendMode: 'multiply',
                    opacity: paperOpacity,
                    clipPath: getFlapClipPath(),
                  }} 
                />
              )}
              {/* Subtle top-to-bottom flap lighting gradient */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 35%, rgba(0,0,0,0.18) 100%)',
                  clipPath: getFlapClipPath(),
                }}
              />
              {/* Scored crease highlight at top fold */}
              <div className="absolute top-0 inset-x-0 h-px bg-white/15 pointer-events-none" />
            </div>

            {/* Back of Top Flap (Revealed when flap flips open) */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundColor: envelopeBg,
                filter: 'brightness(0.7) saturate(1.1)',
                clipPath: getFlapClipPath(),
                transform: 'rotateX(180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="absolute inset-0 pointer-events-none mix-blend-overlay" style={{ backgroundImage: paperNoiseTexture }} />
              <div 
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, ${accentGold} 1.5px, transparent 1.5px)`,
                  backgroundSize: '20px 20px',
                }}
              />
            </div>
          </div>

          {/* Shimmering Gold Foil Trim & Bevel on Flap Edge */}
          {animPhase < 2 && (
            <svg 
              className="absolute top-0 left-0 w-full pointer-events-none z-[26]" 
              style={{ height: `${sealTopPercent + 4}%` }}
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="flapGoldTrim" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={`${accentGold}aa`} />
                  <stop offset="50%" stopColor="#fff8dd" />
                  <stop offset="100%" stopColor={`${accentGold}aa`} />
                </linearGradient>
              </defs>
              <polyline 
                points={
                  config.envelopeFlapShape === "curved-scoop"
                    ? "0,0 4,22 50,100 96,22 100,0"
                    : config.envelopeFlapShape === "deep-royal"
                    ? "0,0 15,18 50,100 85,18 100,0"
                    : "0,0 50,100 100,0"
                } 
                fill="none" 
                stroke="url(#flapGoldTrim)" 
                strokeWidth="1.2" 
                vectorEffect="non-scaling-stroke"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.45))' }}
              />
            </svg>
          )}

          {/* Realistic Downward Drop Shadow onto pocket */}
          {animPhase < 2 && (
            <div 
              className="absolute top-0 left-0 right-0 pointer-events-none z-[18]"
              style={{
                height: `${sealTopPercent + 4}%`,
                filter: 'drop-shadow(0 14px 26px rgba(0,0,0,0.55)) drop-shadow(0 3px 6px rgba(0,0,0,0.35))',
              }}
            >
              <div 
                className="w-full h-full"
                style={{
                  clipPath: getFlapClipPath(),
                  backgroundColor: 'rgba(0,0,0,0.01)',
                }}
              />
            </div>
          )}

          {/* ─── 3D REAL WAX SEAL (Centered at V-flap point) ─── */}
          {config.showEnvelopeSeal !== false && (
            <div 
              className={`absolute left-1/2 cursor-pointer select-none transition-transform duration-300 ${animPhase >= 1 ? 'seal-bursting' : 'seal-idle-pulse'}`}
              style={{
                top: `${sealTopPercent}%`,
                width: `clamp(80px, ${(sealSizePx) / 9.5}vmin, 132px)`,
                height: `clamp(80px, ${(sealSizePx) / 9.5}vmin, 132px)`,
                transform: 'translate(-50%, -50%)',
                zIndex: 32,
              }}
              title="Click to Open Invitation"
              onClick={(e) => {
                e.stopPropagation();
                handleUserClickOpen();
              }}
            >
              {/* Real 3D Wax Seal Image */}
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={transparentWaxSealSrc}
                  alt="Real Wax Seal"
                  className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-300 hover:scale-105"
                  style={{
                    filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.75)) drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
                  }}
                />
                
                {/* Initials overlay if configured */}
                {config.envelopeSealType === "initials" && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{
                      transform: 'translateY(-2px)',
                    }}
                  >
                    <span 
                      className="font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase"
                      style={{
                        color: '#3d2503',
                        textShadow: '0 1px 1px rgba(255,235,170,0.85), 0 -1px 2px rgba(0,0,0,0.8)',
                      }}
                    >
                      {initials}
                    </span>
                  </div>
                )}
              </div>

              {/* Sparkle burst radiating on click */}
              {sparkleBurst.map((sb, idx) => (
                <div
                  key={idx}
                  className="absolute top-1/2 left-1/2 pointer-events-none select-none text-amber-300"
                  style={{
                    '--tx': `${Math.cos((sb.angle * Math.PI) / 180) * sb.distance}px`,
                    '--ty': `${Math.sin((sb.angle * Math.PI) / 180) * sb.distance}px`,
                    fontSize: `${sb.size}px`,
                    animation: `sparkleRadiate 0.65s cubic-bezier(0.1, 0.9, 0.2, 1) forwards`,
                    animationDelay: `${sb.delay}s`,
                  }}
                >
                  ✦
                </div>
              ))}
            </div>
          )}

          {/* Corner Baroque Gold Filigree Ornaments */}
          {config.showEnvelopeFiligree !== false && (
            <>
              <CornerGoldFiligree position="top-left" accentGold={accentGold} />
              <CornerGoldFiligree position="top-right" accentGold={accentGold} />
              <CornerGoldFiligree position="bottom-left" accentGold={accentGold} />
              <CornerGoldFiligree position="bottom-right" accentGold={accentGold} />
            </>
          )}

          {/* ─── DECORATED ROYAL BOX FOR NAMES & INVITES ─── */}
          <div 
            className={`absolute inset-x-0 bottom-4 sm:bottom-6 md:bottom-8 z-[35] flex flex-col items-center justify-center pointer-events-auto px-4 ${animPhase >= 4 ? 'envelope-dissolve' : ''}`}
            style={{
              top: `calc(${sealTopPercent}% + ${sealSizePx / 2 + 14}px)`,
            }}
          >
            <DecoratedInvitationBox
              config={config}
              symbolText={symbolText}
              tagline={tagline}
              namesText={namesText}
              inviteLabel={inviteLabel}
              btnText={btnText}
              accentGold={accentGold}
              lightBgColor={lightBgColor}
              handleUserClickOpen={handleUserClickOpen}
              animPhase={animPhase}
              onChangeField={onChangeField}
              onSelectElement={onSelectElement}
              activeColorId={activeColorId}
              setActiveColorId={setActiveColorId}
              getJustifyClass={getJustifyClass}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          STYLE 2: GRAND ROYAL DOORS (3D Palace Doors Swinging Open with Light)
         ══════════════════════════════════════════════════════════════════════════ */}
      {openingStyle === "royal-doors" && (
        <div 
          className={`absolute inset-0 z-[5] cursor-pointer overflow-hidden select-none ${animPhase >= 4 ? 'envelope-dissolve' : ''}`}
          style={{ perspective: '1600px' }}
        >
          {/* Palace Light Rays emerging from behind */}
          <div 
            className="absolute inset-0 pointer-events-none z-[4] flex items-center justify-center transition-opacity duration-700"
            style={{
              opacity: animPhase >= 2 ? 1 : 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(255, 230, 150, 0.45) 0%, rgba(212, 175, 55, 0.2) 35%, transparent 70%)',
            }}
          >
            <div 
              className="w-full h-full animate-spin-slow opacity-60"
              style={{
                backgroundImage: 'repeating-conic-gradient(from 0deg, rgba(255,225,140,0.15) 0deg 15deg, transparent 15deg 30deg)',
              }}
            />
          </div>

          {/* Top Palace Grand Arch with Gold Filigree */}
          <div className="absolute top-0 inset-x-0 h-16 sm:h-20 z-[28] pointer-events-none flex items-center justify-center bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            <div className="flex items-center space-x-3 text-amber-400">
              <span className="text-xs sm:text-sm">❖</span>
              <div className="w-24 sm:w-48 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              <span className="text-sm sm:text-base font-cinzel tracking-widest text-amber-300">ROYAL PALACE</span>
              <div className="w-24 sm:w-48 h-px bg-gradient-to-l from-transparent via-amber-400 to-transparent" />
              <span className="text-xs sm:text-sm">❖</span>
            </div>
          </div>

          {/* LEFT DOOR (Real Indian Heritage Palace Carved Wooden Door) */}
          <div 
            className="absolute top-0 bottom-0 left-0 w-1/2 z-[20] origin-left transition-transform overflow-hidden"
            style={{
              transformStyle: 'preserve-3d',
              animation: animPhase >= 2 ? 'doorSwingLeft 0.85s cubic-bezier(0.25, 1, 0.5, 1) forwards' : 'none',
              backgroundImage: `url(${config.envelopeDoorsImg || '/real_palace_doors.jpg'})`,
              backgroundSize: '200% 100%',
              backgroundPosition: 'left center',
              boxShadow: 'inset -8px 0 24px rgba(0,0,0,0.8), 6px 0 18px rgba(0,0,0,0.6)',
              borderRight: `2px solid ${accentGold}aa`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/35 pointer-events-none" />
          </div>

          {/* RIGHT DOOR (Real Indian Heritage Palace Carved Wooden Door) */}
          <div 
            className="absolute top-0 bottom-0 right-0 w-1/2 z-[20] origin-right transition-transform overflow-hidden"
            style={{
              transformStyle: 'preserve-3d',
              animation: animPhase >= 2 ? 'doorSwingRight 0.85s cubic-bezier(0.25, 1, 0.5, 1) forwards' : 'none',
              backgroundImage: `url(${config.envelopeDoorsImg || '/real_palace_doors.jpg'})`,
              backgroundSize: '200% 100%',
              backgroundPosition: 'right center',
              boxShadow: 'inset 8px 0 24px rgba(0,0,0,0.8), -6px 0 18px rgba(0,0,0,0.6)',
              borderLeft: `2px solid ${accentGold}aa`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-transparent to-black/35 pointer-events-none" />
          </div>

          {/* ─── DECORATED ROYAL PLAQUE (Mounted across the center door seam) ─── */}
          <div 
            className={`absolute inset-0 z-[30] flex flex-col items-center justify-center pointer-events-auto px-4 transition-all duration-500 ${
              animPhase >= 2 ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'
            }`}
          >
            <DecoratedInvitationBox
              config={config}
              symbolText={symbolText}
              tagline={tagline}
              namesText={namesText}
              inviteLabel={inviteLabel}
              btnText={btnText}
              accentGold={accentGold}
              lightBgColor={lightBgColor}
              handleUserClickOpen={handleUserClickOpen}
              animPhase={animPhase}
              onChangeField={onChangeField}
              onSelectElement={onSelectElement}
              activeColorId={activeColorId}
              setActiveColorId={setActiveColorId}
              getJustifyClass={getJustifyClass}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          STYLE 3: LEAF-BLOWN (Whispering Autumn Breeze & Swirling Leaves Blast)
         ══════════════════════════════════════════════════════════════════════════ */}
      {openingStyle === "leaf-blown" && (
        <div 
          className={`absolute inset-0 z-[5] cursor-pointer overflow-hidden select-none ${animPhase >= 4 ? 'envelope-dissolve' : ''}`}
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, #521808 0%, #300c05 60%, #160402 100%)',
          }}
        >
          {/* Wind Streamline Gust Trails (visible when clicked) */}
          {animPhase >= 1 && (
            <div className="absolute inset-0 pointer-events-none z-[18]">
              <div 
                className="absolute inset-0 opacity-40"
                style={{
                  background: 'linear-gradient(115deg, transparent 20%, rgba(255,230,170,0.3) 48%, rgba(255,255,255,0.5) 50%, rgba(255,230,170,0.3) 52%, transparent 80%)',
                  transform: 'translateX(100%)',
                  animation: 'curtainDrawRight 0.75s ease-out forwards',
                }}
              />
            </div>
          )}

          {/* Autumn Real Leaves Layer (Real Photographic Golden Leaves) */}
          <div className="absolute inset-0 pointer-events-none z-[15] overflow-hidden">
            {autumnLeaves.map((leaf) => (
              <div
                key={leaf.id}
                className="absolute select-none pointer-events-none"
                style={{
                  left: `${leaf.x}%`,
                  top: `${leaf.y}%`,
                  transform: `scale(${leaf.scale}) rotate(${leaf.rotation}deg)`,
                  animation: animPhase >= 1 
                    ? `leafBlast 0.85s cubic-bezier(0.12, 0.9, 0.3, 1) forwards`
                    : `leafSway ${4 + (leaf.id % 4)}s ease-in-out infinite`,
                  animationDelay: animPhase >= 1 ? `${leaf.delay}s` : `${(leaf.id % 5) * 0.4}s`,
                  '--bx': `${leaf.blowX}px`,
                  '--by': `${leaf.blowY}px`,
                  '--brot': `${leaf.blowRot}deg`,
                  filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.7))',
                }}
              >
                <img
                  src={transparentLeafSrc}
                  alt="Real Autumn Leaf"
                  className="w-14 h-14 sm:w-18 sm:h-18 object-contain pointer-events-none select-none"
                  style={{
                    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
                  }}
                />
              </div>
            ))}
          </div>

          {/* ─── DECORATED ROYAL PLAQUE ─── */}
          <div 
            className={`absolute inset-0 z-[30] flex flex-col items-center justify-center pointer-events-auto px-4 transition-all duration-600 ${
              animPhase >= 2 ? 'opacity-0 scale-105 -translate-y-8 pointer-events-none' : 'opacity-100'
            }`}
          >
            <DecoratedInvitationBox
              config={config}
              symbolText={symbolText}
              tagline={tagline}
              namesText={namesText}
              inviteLabel={inviteLabel}
              btnText={btnText}
              accentGold={accentGold}
              lightBgColor={lightBgColor}
              handleUserClickOpen={handleUserClickOpen}
              animPhase={animPhase}
              onChangeField={onChangeField}
              onSelectElement={onSelectElement}
              activeColorId={activeColorId}
              setActiveColorId={setActiveColorId}
              getJustifyClass={getJustifyClass}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          STYLE 4: PETAL-BLOWN (Romantic Rose Petal Swirl & Blossom Whirlwind)
         ══════════════════════════════════════════════════════════════════════════ */}
      {openingStyle === "petal-blown" && (
        <div 
          className={`absolute inset-0 z-[5] cursor-pointer overflow-hidden select-none ${animPhase >= 4 ? 'envelope-dissolve' : ''}`}
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, #5b0d23 0%, #360714 60%, #170208 100%)',
          }}
        >
          {/* Real Rose Petals Swirling Layer (Real Photographic Petals) */}
          <div className="absolute inset-0 pointer-events-none z-[15] overflow-hidden">
            {rosePetals.map((petal) => (
              <div
                key={petal.id}
                className="absolute select-none pointer-events-none"
                style={{
                  left: `${petal.x}%`,
                  top: `${petal.y}%`,
                  transform: `scale(${petal.scale}) rotate(${petal.rotation}deg)`,
                  animation: animPhase >= 1 
                    ? `petalVortex 0.9s cubic-bezier(0.12, 0.9, 0.3, 1) forwards`
                    : `leafSway ${3.5 + (petal.id % 4)}s ease-in-out infinite`,
                  animationDelay: animPhase >= 1 ? `${petal.delay}s` : `${(petal.id % 6) * 0.3}s`,
                  '--pangle': `${petal.blowAngle}deg`,
                  '--pdist': `${petal.blowDist}px`,
                  filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.6))',
                }}
              >
                <img
                  src={transparentPetalSrc}
                  alt="Real Rose Petal"
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain pointer-events-none select-none"
                  style={{
                    filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.45))',
                  }}
                />
              </div>
            ))}
          </div>

          {/* ─── DECORATED ROYAL PLAQUE ─── */}
          <div 
            className={`absolute inset-0 z-[30] flex flex-col items-center justify-center pointer-events-auto px-4 transition-all duration-600 ${
              animPhase >= 2 ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'
            }`}
          >
            <DecoratedInvitationBox
              config={config}
              symbolText={symbolText}
              tagline={tagline}
              namesText={namesText}
              inviteLabel={inviteLabel}
              btnText={btnText}
              accentGold={accentGold}
              lightBgColor={lightBgColor}
              handleUserClickOpen={handleUserClickOpen}
              animPhase={animPhase}
              onChangeField={onChangeField}
              onSelectElement={onSelectElement}
              activeColorId={activeColorId}
              setActiveColorId={setActiveColorId}
              getJustifyClass={getJustifyClass}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          STYLE 5: ROYAL CURTAINS (Imperial Velvet Curtains Parting to Sides)
         ══════════════════════════════════════════════════════════════════════════ */}
      {openingStyle === "royal-curtains" && (
        <div 
          className={`absolute inset-0 z-[5] cursor-pointer overflow-hidden select-none ${animPhase >= 4 ? 'envelope-dissolve' : ''}`}
          style={{ perspective: '1600px' }}
        >
          {/* Left Real Velvet Curtain */}
          <div 
            className="absolute top-0 bottom-0 left-0 w-[52%] z-[20] origin-left transition-transform overflow-hidden"
            style={{
              backgroundImage: `url(${config.envelopeCurtainsImg || '/real_velvet_curtains.jpg'})`,
              backgroundSize: '200% 100%',
              backgroundPosition: 'left center',
              boxShadow: '8px 0 24px rgba(0,0,0,0.7)',
              animation: animPhase >= 2 ? 'curtainDrawLeft 0.85s cubic-bezier(0.25, 1, 0.5, 1) forwards' : 'none',
              borderRight: `2px solid ${accentGold}aa`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/35 pointer-events-none" />
          </div>

          {/* Right Real Velvet Curtain */}
          <div 
            className="absolute top-0 bottom-0 right-0 w-[52%] z-[20] origin-right transition-transform overflow-hidden"
            style={{
              backgroundImage: `url(${config.envelopeCurtainsImg || '/real_velvet_curtains.jpg'})`,
              backgroundSize: '200% 100%',
              backgroundPosition: 'right center',
              boxShadow: '-8px 0 24px rgba(0,0,0,0.7)',
              animation: animPhase >= 2 ? 'curtainDrawRight 0.85s cubic-bezier(0.25, 1, 0.5, 1) forwards' : 'none',
              borderLeft: `2px solid ${accentGold}aa`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-l from-black/25 via-transparent to-black/35 pointer-events-none" />
          </div>

          {/* Center Golden Braided Cords & Tassels */}
          {animPhase < 2 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[25] pointer-events-none flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-amber-400 bg-amber-500/20 backdrop-blur-sm flex items-center justify-center text-amber-300 shadow-xl">
                ✦
              </div>
              <div className="w-0.5 h-12 bg-gradient-to-b from-amber-400 to-transparent" />
            </div>
          )}

          {/* ─── DECORATED ROYAL PLAQUE ─── */}
          <div 
            className={`absolute inset-0 z-[30] flex flex-col items-center justify-center pointer-events-auto px-4 transition-all duration-500 ${
              animPhase >= 2 ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'
            }`}
          >
            <DecoratedInvitationBox
              config={config}
              symbolText={symbolText}
              tagline={tagline}
              namesText={namesText}
              inviteLabel={inviteLabel}
              btnText={btnText}
              accentGold={accentGold}
              lightBgColor={lightBgColor}
              handleUserClickOpen={handleUserClickOpen}
              animPhase={animPhase}
              onChangeField={onChangeField}
              onSelectElement={onSelectElement}
              activeColorId={activeColorId}
              setActiveColorId={setActiveColorId}
              getJustifyClass={getJustifyClass}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   DECORATED INVITATION BOX (Royal Cartouche Frame for Names & Invites)
   ══════════════════════════════════════════════════════════════════════════ */
function DecoratedInvitationBox({
  config,
  symbolText,
  tagline,
  namesText,
  inviteLabel,
  btnText,
  accentGold,
  lightBgColor,
  handleUserClickOpen,
  animPhase,
  onChangeField,
  onSelectElement,
  activeColorId,
  setActiveColorId,
  getJustifyClass
}) {
  return (
    <div 
      className="relative w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto rounded-2xl px-5 py-4 sm:px-7 sm:py-5 text-center select-none shadow-2xl transition-all duration-300 pointer-events-auto"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, rgba(24, 5, 11, 0.78) 0%, rgba(10, 2, 5, 0.90) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1.5px solid ${accentGold}85`,
        boxShadow: `0 16px 40px rgba(0, 0, 0, 0.75), inset 0 0 24px rgba(212, 175, 55, 0.12), 0 0 0 1px rgba(212, 175, 55, 0.35)`,
      }}
      onClick={(e) => {
        // If user clicks on the box, allow opening unless clicking editable elements
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
          handleUserClickOpen();
        }
      }}
    >
      {/* Inner Fine Hairline Border */}
      <div 
        className="absolute inset-1.5 sm:inset-2 rounded-xl border pointer-events-none" 
        style={{ borderColor: `${accentGold}40` }} 
      />

      {/* 4 Ornate Baroque Corner SVG Flourishes */}
      <BoxCornerFlourish position="top-left" color={accentGold} />
      <BoxCornerFlourish position="top-right" color={accentGold} />
      <BoxCornerFlourish position="bottom-left" color={accentGold} />
      <BoxCornerFlourish position="bottom-right" color={accentGold} />

      {/* Top Miniature Royal Crown / Crest Accent */}
      <div className="flex justify-center items-center pb-1 pointer-events-none opacity-85">
        <svg className="w-5 h-3 text-amber-400" viewBox="0 0 24 14" fill="currentColor">
          <path d="M12 0L14.5 4.5L19 2L17.5 8H6.5L5 2L9.5 4.5L12 0Z" />
          <circle cx="12" cy="11.5" r="1.5" />
          <circle cx="7" cy="11.5" r="1.2" />
          <circle cx="17" cy="11.5" r="1.2" />
        </svg>
      </div>

      <div className="space-y-1 sm:space-y-1.5">
        {/* Sacred Symbol */}
        {config.showEnvelopeSymbol !== false && (
          (config.envelopeSymbolType === "image" || (!config.envelopeSymbolText && config.envelopeSymbolImg)) && config.envelopeSymbolImg ? (
            <div
              className={`w-full flex ${
                config.envelopeSymbolAlign === 'text-left' ? 'justify-start' : 
                config.envelopeSymbolAlign === 'text-right' ? 'justify-end' : 
                'justify-center'
              } mx-auto`}
              style={{
                transform: `translate(${config.envelopeSymbolX || 0}px, ${(config.envelopeSymbolY !== undefined ? config.envelopeSymbolY : (config.envelopeSymbolTextYOffset || 0))}px) rotate(${config.envelopeSymbolRotate || 0}deg)`,
                transition: 'transform 0.15s ease'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectElement && onSelectElement({ tabId: 'envelope', field: 'envelopeSymbolImg' });
              }}
            >
              <div 
                className="relative inline-block cursor-pointer group"
                style={{
                  filter: `drop-shadow(${config.envelopeSymbolShadowX || 0}px ${config.envelopeSymbolShadowY || 3}px ${config.envelopeSymbolShadowBlur || 6}px ${config.envelopeSymbolShadowColor || 'rgba(0,0,0,0.5)'})`,
                  opacity: config.envelopeSymbolOpacity !== undefined ? config.envelopeSymbolOpacity : 1,
                }}
              >
                <img
                  src={config.envelopeSymbolImg}
                  alt="Envelope Symbol Clipart"
                  style={{
                    width: `${config.envelopeSymbolSizePx || 32}px`,
                    height: `${config.envelopeSymbolSizePx || 32}px`,
                    objectFit: 'contain',
                    transform: `scale(${config.envelopeSymbolScale !== undefined ? config.envelopeSymbolScale : 1})`,
                    mixBlendMode: config.envelopeSymbolBlendMode || 'normal',
                  }}
                  className="select-none pointer-events-none group-hover:scale-105 transition-transform"
                />
              </div>
            </div>
          ) : (
            <EditableText
              isEditing={!!onChangeField}
              onChangeField={onChangeField}
              onSelect={onSelectElement}
              tabId="envelope"
              field="envelopeSymbolText"
              popoverId="envelopeSymbolText"
              activeColorId={activeColorId}
              setActiveColorId={setActiveColorId}
              colorValue={config.envelopeSymbolColor || accentGold}
              onChangeColor={(color) => onChangeField && onChangeField('envelopeSymbolColor', color)}
              className={`w-full ${getJustifyClass(config.envelopeSymbolAlign || 'text-center')} ${config.envelopeSymbolAlign || 'text-center'} mx-auto ${config.envelopeSymbolFont || 'font-sans'} ${config.envelopeSymbolSize || 'text-base sm:text-lg'}`}
              style={{ 
                color: config.envelopeSymbolColor || accentGold, 
                textShadow: `${config.envelopeSymbolShadowX || 0}px ${config.envelopeSymbolShadowY || 2}px ${config.envelopeSymbolShadowBlur || 6}px ${config.envelopeSymbolShadowColor || 'rgba(0,0,0,0.7)'}`,
                transform: `translate(${config.envelopeSymbolX || 0}px, ${(config.envelopeSymbolY !== undefined ? config.envelopeSymbolY : (config.envelopeSymbolTextYOffset || 0))}px) rotate(${config.envelopeSymbolRotate || 0}deg) scale(${config.envelopeSymbolScale !== undefined ? config.envelopeSymbolScale : 1})`
              }}
              value={symbolText}
              as="div"
              config={config}
            />
          )
        )}

        {/* Tagline ("You're Invited" / "Wedding Celebration") */}
        {config.showEnvelopeTagline !== false && (
          <EditableText
            isEditing={!!onChangeField}
            onChangeField={onChangeField}
            onSelect={onSelectElement}
            tabId="envelope"
            field="envelopeTagline"
            popoverId="envelopeTagline"
            activeColorId={activeColorId}
            setActiveColorId={setActiveColorId}
            colorValue={config.envelopeTaglineColor || `${accentGold}cc`}
            onChangeColor={(color) => onChangeField && onChangeField('envelopeTaglineColor', color)}
            className={`tracking-[0.25em] uppercase max-w-sm w-full ${getJustifyClass(config.envelopeTaglineAlign || 'text-center')} ${config.envelopeTaglineAlign || 'text-center'} mx-auto ${config.envelopeTaglineFont || 'font-sans'} ${config.envelopeTaglineSize || 'text-[9px] sm:text-[10px]'}`}
            style={{ color: config.envelopeTaglineColor || `${accentGold}cc`, textShadow: '0 1px 4px rgba(0,0,0,0.85)' }}
            value={tagline}
            as="div"
            config={config}
          />
        )}

        {/* Couple Names */}
        {config.showEnvelopeNames !== false && (
          <EditableText
            isEditing={!!onChangeField}
            onChangeField={onChangeField}
            onSelect={onSelectElement}
            tabId="envelope"
            field="envelopeNamesText"
            popoverId="envelopeNamesText"
            activeColorId={activeColorId}
            setActiveColorId={setActiveColorId}
            colorValue={config.envelopeNamesColor || accentGold}
            onChangeColor={(color) => onChangeField && onChangeField('envelopeNamesColor', color)}
            className={`tracking-[0.16em] w-full ${getJustifyClass(config.envelopeNamesAlign || 'text-center')} ${config.envelopeNamesAlign || 'text-center'} mx-auto ${config.envelopeNamesFont || 'font-cinzel'} ${config.envelopeNamesSize || 'text-lg sm:text-xl md:text-2xl'} font-semibold`}
            style={{ 
              color: config.envelopeNamesColor || accentGold, 
              textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 12px rgba(212,175,55,0.2)' 
            }}
            value={namesText}
            as="h2"
            config={config}
          />
        )}

        {/* Royal Gold Filigree Divider */}
        <div className="flex items-center justify-center space-x-2 my-0.5 opacity-80 pointer-events-none">
          <div className="w-8 sm:w-14 h-px bg-gradient-to-r from-transparent via-amber-400 to-amber-200" />
          <span className="text-amber-300 text-[8px] sm:text-[9px]">❖</span>
          <div className="w-8 sm:w-14 h-px bg-gradient-to-l from-transparent via-amber-400 to-amber-200" />
        </div>

        {/* Invitation Label ("Cordially Invited" / Presence Request) */}
        {config.showEnvelopeInviteLabel !== false && (
          <EditableText
            isEditing={!!onChangeField}
            onChangeField={onChangeField}
            onSelect={onSelectElement}
            tabId="envelope"
            field="envelopeInviteLabelText"
            popoverId="envelopeInviteLabelText"
            activeColorId={activeColorId}
            setActiveColorId={setActiveColorId}
            colorValue={config.envelopeInviteLabelColor || `${lightBgColor}dd`}
            onChangeColor={(color) => onChangeField && onChangeField('envelopeInviteLabelColor', color)}
            className={`tracking-widest uppercase max-w-sm w-full ${getJustifyClass(config.envelopeInviteLabelAlign || 'text-center')} ${config.envelopeInviteLabelAlign || 'text-center'} mx-auto ${config.envelopeInviteLabelFont || 'font-sans'} ${config.envelopeInviteLabelSize || 'text-[9px] sm:text-[10px] md:text-xs'}`}
            style={{ color: config.envelopeInviteLabelColor || `${lightBgColor}dd`, textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
            value={inviteLabel}
            as="div"
            config={config}
          />
        )}

        {/* Primary CTA Open Button */}
        {config.showEnvelopeBtn !== false && (
          <div className="pt-1">
            <button
              onClick={handleUserClickOpen}
              className={`px-6 sm:px-8 py-1.5 sm:py-2 rounded-full font-semibold tracking-[0.2em] uppercase transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer border mx-auto ${config.envelopeBtnFont || 'font-cinzel'} ${config.envelopeBtnSize || 'text-[9px] sm:text-[10px]'}`}
              style={{
                borderColor: `${accentGold}88`,
                color: config.envelopeBtnColor || accentGold,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: `0 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)`,
                textShadow: '0 1px 4px rgba(0,0,0,0.7)',
              }}
              disabled={animPhase > 0}
            >
              <SvgSparkles className="w-3 h-3 mr-1.5 animate-spin-slow" />
              <span>{btnText}</span>
              <SvgSparkles className="w-3 h-3 ml-1.5 animate-spin-slow" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Box Corner Filigree Flourish (Nested inside Decorated Box) ─── */
function BoxCornerFlourish({ position, color }) {
  const isTop = position.startsWith('top');
  const isLeft = position.endsWith('left');
  
  return (
    <div 
      className={`absolute ${isTop ? 'top-1.5 sm:top-2' : 'bottom-1.5 sm:bottom-2'} ${isLeft ? 'left-1.5 sm:left-2' : 'right-1.5 sm:right-2'} pointer-events-none select-none`}
      style={{
        transform: `${!isLeft ? 'scaleX(-1)' : ''} ${!isTop ? 'scaleY(-1)' : ''}`,
        color: color || '#d4af37',
        opacity: 0.7,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path 
          d="M2 2 C8 2 14 4 16 10 C18 16 22 22 22 22 M2 2 C2 8 4 14 10 16 C16 18 22 22 22 22 M2 2 L6 6" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
        <circle cx="4" cy="4" r="1.2" fill="currentColor" />
      </svg>
    </div>
  );
}

/* ─── Corner Gold Filigree Sub-component (Screen Corners) ─── */
function CornerGoldFiligree({ position, accentGold }) {
  const posStyle = {};
  let transformVal = '';
  
  if (position === 'top-left') { 
    posStyle.top = '10px'; 
    posStyle.left = '10px'; 
  }
  if (position === 'top-right') { 
    posStyle.top = '10px'; 
    posStyle.right = '10px'; 
    transformVal = 'scaleX(-1)'; 
  }
  if (position === 'bottom-left') { 
    posStyle.bottom = '10px'; 
    posStyle.left = '10px'; 
    transformVal = 'scaleY(-1)'; 
  }
  if (position === 'bottom-right') { 
    posStyle.bottom = '10px'; 
    posStyle.right = '10px'; 
    transformVal = 'scale(-1, -1)'; 
  }

  return (
    <div 
      className="absolute pointer-events-none select-none z-[22] w-14 h-14 sm:w-20 sm:h-20"
      style={{ ...posStyle, transform: transformVal }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id={`goldFiligreeGrad-${position}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`${accentGold}ff`} />
            <stop offset="50%" stopColor="#fff2be" />
            <stop offset="100%" stopColor={`${accentGold}88`} />
          </linearGradient>
        </defs>
        <path 
          d="M 6 6 L 6 42 Q 6 22 26 22 Q 46 22 46 6 L 6 6 Z" 
          stroke={`url(#goldFiligreeGrad-${position})`} 
          strokeWidth="1.2" 
          fill="none" 
        />
        <path 
          d="M 12 12 Q 12 32 32 32 Q 52 32 52 12" 
          stroke={`url(#goldFiligreeGrad-${position})`} 
          strokeWidth="1" 
          fill="none" 
        />
        <circle cx="8" cy="8" r="2.5" fill={accentGold} />
        <circle cx="16" cy="16" r="1.5" fill={accentGold} />
      </svg>
    </div>
  );
}
