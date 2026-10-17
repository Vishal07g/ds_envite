import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * RevealEffectsOverlay
 * 
 * Comprehensive luxury interactive reveal engine supporting all 14 alternative animation styles:
 * 1. circular-ripple: Authentic crystalline liquid pool with expanding concentric wave crests & splashes
 * 2. heart-pop: 3D floating satin hearts bursting outward with upward buoyancy physics
 * 3. lotus-bloom: Sacred royal lotus unfolding 8 golden petals with mandala aura
 * 4. curtain-draw: Deep royal crimson velvet drapery with authentic pleat shadows parting to sides
 * 5. door-open: 3D perspective royal palace doors with gold bevels and ornamental knocker
 * 6. break-wall: 12 royal mosaic tiles shattering outward with 3D ballistic tumbling
 * 7. page-tear: Textured deckled-edge wedding parchment tearing diagonally with realistic curl
 * 8. particle-blow: Stardust tablet disintegrating into blowing golden embers in a wind drift
 * 9. touch-glow: Interactive flashlight aperture with feathering, expanding on click
 * 10. sparkle-burst: Radiant 360-degree starburst with explosive diamond glints
 * 11. starry-night: Cosmic midnight nebula with ignited constellation lines and shooting stars
 * 12. diamond-shimmer: High-gloss prismatic laser glare sweep with trailing sheen
 * 13. slide-left-right: Dual brushed metal architectural panels parting smoothly
 * 14. magical-fade: Incandescent golden aura bloom with soft ethereal dissipation
 */
export default function RevealEffectsOverlay({
  effect = 'circular-ripple',
  shapeStyles = {},
  speed = 1.0,
  revealColor = '#f59e0b',
  primaryColor = '#0b1329',
  accentGold = '#f59e0b',
  brideName = 'Evelyn',
  groomName = 'Theodore',
  onComplete
}) {
  const [animating, setAnimating] = useState(false);
  const [clickPos, setClickPos] = useState({ x: 200, y: 150 });
  const [torchPos, setTorchPos] = useState({ x: 200, y: 150 });
  const [sparks, setSparks] = useState([]);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const containerRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const coupleInitials = `${brideName?.charAt(0) || 'E'} & ${groomName?.charAt(0) || 'T'}`;

  // Reset state whenever the chosen effect changes
  useEffect(() => {
    setAnimating(false);
    setSparks([]);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, [effect]);

  // Listen for programmatic trigger or reset events
  useEffect(() => {
    const handleReset = () => {
      setAnimating(false);
      setSparks([]);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };

    const handleTrigger = () => {
      if (!animating) {
        startReveal({ clientX: null, clientY: null });
      }
    };

    window.addEventListener('resetScratchCard', handleReset);
    window.addEventListener('triggerRevealAnimation', handleTrigger);
    return () => {
      window.removeEventListener('resetScratchCard', handleReset);
      window.removeEventListener('triggerRevealAnimation', handleTrigger);
    };
  }, [animating]);

  // Flashlight position tracking for touch-glow
  const handleMouseMove = (e) => {
    if (effect !== 'touch-glow' || animating) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setTorchPos({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
  };

  const startReveal = useCallback((e) => {
    if (animating) return;

    let originX = 200;
    let originY = 150;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (e && e.clientX != null) {
        const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
        originX = clientX - rect.left;
        originY = clientY - rect.top;
      } else {
        originX = rect.width / 2;
        originY = rect.height / 2;
      }
    }

    setClickPos({ x: originX, y: originY });
    setAnimating(true);

    const durationMs = Math.max(700, speed * 1000);

    // Dynamic particle bursts for physics-based effects
    if (effect === 'circular-ripple') {
      // 18 Water droplet splash particles
      const droplets = [];
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 6 + 2;
        droplets.push({
          id: i,
          x: originX,
          y: originY,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 1.5,
          size: Math.random() * 3 + 2,
          alpha: 1,
          color: ['#93C5FD', '#BFDBFE', '#E0F2FE', '#FFFFFF'][Math.floor(Math.random() * 4)]
        });
      }
      setSparks(droplets);
    } else if (effect === 'heart-pop') {
      // 24 3D Floating Hearts
      const hearts = [];
      for (let i = 0; i < 26; i++) {
        const angle = -Math.PI * 0.85 + Math.random() * Math.PI * 0.7;
        const spd = Math.random() * 6.5 + 2.5;
        hearts.push({
          id: i,
          x: originX + (Math.random() - 0.5) * 20,
          y: originY + (Math.random() - 0.5) * 15,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: Math.random() * 12 + 14,
          rot: (Math.random() - 0.5) * 0.5,
          rotSpeed: (Math.random() - 0.5) * 0.03,
          alpha: 1,
          color: ['#E11D48', '#F43F5E', '#FB7185', '#FDA4AF', '#F59E0B'][Math.floor(Math.random() * 5)]
        });
      }
      setSparks(hearts);
    } else if (effect === 'particle-blow' || effect === 'sparkle-burst') {
      // 36 Golden Embers / Diamond Glints
      const embers = [];
      for (let i = 0; i < 38; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 8 + 3;
        embers.push({
          id: i,
          x: originX,
          y: originY,
          vx: Math.cos(angle) * spd + (effect === 'particle-blow' ? 4 : 0),
          vy: Math.sin(angle) * spd - 1,
          size: Math.random() * 6 + 3,
          alpha: 1,
          color: ['#FFD700', '#FDE047', '#F59E0B', '#FFFBEB', '#FFFFFF'][Math.floor(Math.random() * 5)]
        });
      }
      setSparks(embers);
    }

    // Complete transition when duration expires
    const timer = setTimeout(() => {
      setAnimating(false);
      setSparks([]);
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }, durationMs + 100);

    return () => clearTimeout(timer);
  }, [animating, effect, speed]);

  // Frame physics animation for droplets, hearts, and sparks
  useEffect(() => {
    if (!animating || sparks.length === 0) return;

    let lastTime = performance.now();
    const updatePhysics = (now) => {
      const dt = Math.min((now - lastTime) / 16.6, 2);
      lastTime = now;

      setSparks((prev) =>
        prev
          .map((p) => {
            if (effect === 'circular-ripple') {
              return {
                ...p,
                x: p.x + p.vx * dt,
                y: p.y + p.vy * dt,
                vy: p.vy + 0.18 * dt,
                alpha: Math.max(0, p.alpha - 0.025 * dt)
              };
            } else if (effect === 'heart-pop') {
              return {
                ...p,
                x: p.x + p.vx * dt,
                y: p.y + p.vy * dt,
                vx: p.vx * 0.96,
                vy: p.vy - 0.05 * dt, // buoyant helium float
                rot: p.rot + p.rotSpeed * dt,
                alpha: Math.max(0, p.alpha - 0.02 * dt)
              };
            } else {
              return {
                ...p,
                x: p.x + p.vx * dt,
                y: p.y + p.vy * dt,
                vx: p.vx * 0.95,
                vy: p.vy * 0.95 + 0.1 * dt,
                alpha: Math.max(0, p.alpha - 0.028 * dt)
              };
            }
          })
          .filter((p) => p.alpha > 0.02)
      );

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [animating, effect]);

  const durationSec = Math.max(0.7, speed);

  return (
    <div
      ref={containerRef}
      onClick={startReveal}
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      className="absolute inset-0 w-full h-full z-30 select-none overflow-hidden cursor-pointer"
      style={{
        ...shapeStyles,
        zIndex: 30,
        touchAction: 'none'
      }}
    >
      {/* ========================================================= */}
      {/* 1. CIRCULAR RIPPLE (WATER DROP POOL)                      */}
      {/* ========================================================= */}
      {effect === 'circular-ripple' && (
        <div
          className="absolute inset-0 w-full h-full flex flex-col justify-center items-center p-6 text-center overflow-hidden transition-all"
          style={{
            background: 'linear-gradient(135deg, #091A2E 0%, #030A14 60%, #0B1E36 100%)',
            opacity: animating ? 0 : 1,
            transitionDuration: `${durationSec}s`,
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Liquid Caustic Ambient Glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 animate-pulse"
            style={{
              background: 'radial-gradient(circle at 50% 45%, rgba(56, 189, 248, 0.35) 0%, rgba(14, 116, 144, 0.15) 50%, transparent 75%)'
            }}
          />

          {/* Central Water Droplet Emblem */}
          <div
            className={`relative p-5 rounded-full border border-sky-400/40 bg-sky-950/60 shadow-[0_0_30px_rgba(56,189,248,0.25)] transition-transform duration-500 ${
              animating ? 'scale-150 opacity-0' : 'scale-100 hover:scale-105'
            }`}
          >
            {/* Water Drop SVG */}
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-sky-300 drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]" fill="currentColor">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            <div className="absolute inset-0 rounded-full border border-sky-300/30 animate-ping pointer-events-none" />
          </div>

          <p className="font-cinzel text-xs font-bold tracking-[0.2em] mt-5 uppercase text-sky-200 drop-shadow">
            ✦ CRYSTALLINE WATER RIPPLE ✦
          </p>
          <p className="text-[8.5px] uppercase tracking-widest text-sky-400/80 mt-1.5 font-medium">
            Touch Surface to Cast a Ripple
          </p>

          {/* Concentric Expanding Water Waves on Click */}
          {animating && (
            <div
              className="absolute pointer-events-none"
              style={{ left: `${clickPos.x}px`, top: `${clickPos.y}px`, transform: 'translate(-50%, -50%)' }}
            >
              {[0, 100, 220, 340].map((delay, idx) => (
                <div
                  key={idx}
                  className="absolute rounded-full border-2 border-sky-300/90 shadow-[0_0_20px_rgba(56,189,248,0.8)]"
                  style={{
                    width: '30px',
                    height: '30px',
                    left: '-15px',
                    top: '-15px',
                    animation: `rippleExpand ${durationSec}s cubic-bezier(0.1, 0.8, 0.2, 1) forwards`,
                    animationDelay: `${delay}ms`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. HEART POP & FLOAT UP                                   */}
      {/* ========================================================= */}
      {effect === 'heart-pop' && (
        <div
          className="absolute inset-0 w-full h-full flex flex-col justify-center items-center p-6 text-center overflow-hidden transition-all"
          style={{
            background: 'linear-gradient(135deg, #1C0A14 0%, #0D040A 50%, #2A0F1D 100%)',
            opacity: animating ? 0 : 1,
            transform: animating ? 'scale(1.08)' : 'scale(1)',
            transitionDuration: `${durationSec}s`,
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Romantic Rose Ambient Aura */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(244,63,94,0.4) 0%, transparent 70%)'
            }}
          />

          {/* Pulsing 3D Heart Jewel */}
          <div
            className={`relative p-5 rounded-full border-2 border-rose-400/50 bg-rose-950/70 shadow-[0_0_35px_rgba(244,63,94,0.4)] transition-transform duration-500 ${
              animating ? 'scale-140 opacity-0' : 'scale-100 hover:scale-105'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-11 h-11 text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.9)]" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <div className="absolute inset-0 rounded-full border border-rose-300/40 animate-ping pointer-events-none" />
          </div>

          <p className="font-cinzel text-xs font-bold tracking-[0.2em] mt-5 uppercase text-rose-200 drop-shadow">
            ✦ SACRED UNION OF HEARTS ✦
          </p>
          <p className="text-[8.5px] uppercase tracking-widest text-rose-400/80 mt-1.5 font-medium">
            Touch to Release Loving Hearts
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. LOTUS BLOOM (PETAL EXPAND)                             */}
      {/* ========================================================= */}
      {effect === 'lotus-bloom' && (
        <div
          className="absolute inset-0 w-full h-full flex flex-col justify-center items-center p-6 text-center overflow-hidden transition-all"
          style={{
            background: 'linear-gradient(135deg, #1B0F07 0%, #0C0603 55%, #2B160B 100%)',
            opacity: animating ? 0 : 1,
            transitionDuration: `${durationSec}s`
          }}
        >
          {/* Sacred Golden Lotus Blossom */}
          <div
            className="relative p-6 rounded-full border-2 border-amber-400/40 bg-amber-950/60 shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-transform duration-700"
            style={{
              transform: animating ? 'scale(3.2) rotate(140deg)' : 'scale(1)',
              opacity: animating ? 0 : 1,
              transitionDuration: `${durationSec}s`
            }}
          >
            {/* 8-Petal Lotus SVG */}
            <svg viewBox="0 0 100 100" className="w-14 h-14 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" fill="currentColor">
              <path d="M50 15 C55 30 65 38 75 42 C65 50 55 52 50 75 C45 52 35 50 25 42 C35 38 45 30 50 15 Z" opacity="0.95" />
              <path d="M50 25 C62 38 75 42 85 52 C72 58 60 56 50 78 C40 56 28 58 15 52 C25 42 38 38 50 25 Z" opacity="0.75" />
              <circle cx="50" cy="50" r="8" fill="#FDE047" />
            </svg>
          </div>

          <p className="font-cinzel text-xs font-bold tracking-[0.2em] mt-5 uppercase text-amber-200 drop-shadow">
            ✦ SACRED ROYAL LOTUS ✦
          </p>
          <p className="text-[8.5px] uppercase tracking-widest text-amber-400/80 mt-1.5 font-medium">
            Touch to Unfold Sacred Petals
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. CURTAIN DRAW (THEATER PARTING)                         */}
      {/* ========================================================= */}
      {effect === 'curtain-draw' && (
        <>
          {/* Left Velvet Curtain */}
          <div
            className="absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center items-end pr-5 text-right border-r border-amber-400/40 transition-transform shadow-2xl"
            style={{
              background: 'repeating-linear-gradient(90deg, #6B1124 0px, #881337 18px, #4C0519 36px)',
              boxShadow: 'inset -12px 0 25px rgba(0,0,0,0.6)',
              transform: animating ? 'translateX(-105%) scaleX(0.7)' : 'translateX(0%) scaleX(1)',
              transformOrigin: 'left center',
              transitionDuration: `${durationSec}s`,
              transitionTimingFunction: 'cubic-bezier(0.77, 0, 0.175, 1)'
            }}
          >
            <span className="font-cinzel text-sm font-bold text-amber-200 tracking-widest drop-shadow">
              {coupleInitials}
            </span>
            <div className="w-12 h-0.5 bg-amber-400/60 mt-1.5" />
          </div>

          {/* Right Velvet Curtain */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full flex flex-col justify-center items-start pl-5 text-left border-l border-amber-400/40 transition-transform shadow-2xl"
            style={{
              background: 'repeating-linear-gradient(90deg, #4C0519 0px, #881337 18px, #6B1124 36px)',
              boxShadow: 'inset 12px 0 25px rgba(0,0,0,0.6)',
              transform: animating ? 'translateX(105%) scaleX(0.7)' : 'translateX(0%) scaleX(1)',
              transformOrigin: 'right center',
              transitionDuration: `${durationSec}s`,
              transitionTimingFunction: 'cubic-bezier(0.77, 0, 0.175, 1)'
            }}
          >
            <span className="font-cinzel text-sm font-bold text-amber-200 tracking-widest drop-shadow">
              VOWS
            </span>
            <div className="w-12 h-0.5 bg-amber-400/60 mt-1.5" />
          </div>

          {/* Center Royal Tassel Badge */}
          <div
            className={`absolute inset-0 flex flex-col justify-center items-center pointer-events-none transition-opacity duration-300 ${
              animating ? 'opacity-0 scale-50' : 'opacity-100'
            }`}
          >
            <div className="bg-slate-950/85 px-4 py-1.5 rounded-full border border-amber-400/50 shadow-xl backdrop-blur-xs flex items-center space-x-1.5">
              <span className="text-[8.5px] uppercase tracking-[0.2em] font-cinzel text-amber-300 font-bold">
                ✦ PART VELVET CURTAINS ✦
              </span>
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 5. DOOR OPEN (ROYAL PALACE PORTAL)                        */}
      {/* ========================================================= */}
      {effect === 'door-open' && (
        <div className="absolute inset-0 w-full h-full" style={{ perspective: '1200px' }}>
          {/* Left Door */}
          <div
            className="absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center items-end pr-5 text-right border-r border-amber-400/40 transition-all shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #1A1208 0%, #291D0D 50%, #0E0904 100%)',
              border: '2px solid rgba(245, 158, 11, 0.3)',
              transformOrigin: 'left center',
              transform: animating ? 'rotateY(-110deg)' : 'rotateY(0deg)',
              transitionDuration: `${durationSec}s`,
              transitionTimingFunction: 'cubic-bezier(0.77, 0, 0.175, 1)'
            }}
          >
            <div className="w-8 h-8 rounded-full border border-amber-400/40 flex items-center justify-center bg-amber-950/50 shadow-inner mr-2">
              <span className="text-[10px] text-amber-300">❖</span>
            </div>
          </div>

          {/* Right Door */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full flex flex-col justify-center items-start pl-5 text-left border-l border-amber-400/40 transition-all shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #0E0904 0%, #291D0D 50%, #1A1208 100%)',
              border: '2px solid rgba(245, 158, 11, 0.3)',
              transformOrigin: 'right center',
              transform: animating ? 'rotateY(110deg)' : 'rotateY(0deg)',
              transitionDuration: `${durationSec}s`,
              transitionTimingFunction: 'cubic-bezier(0.77, 0, 0.175, 1)'
            }}
          >
            <div className="w-8 h-8 rounded-full border border-amber-400/40 flex items-center justify-center bg-amber-950/50 shadow-inner ml-2">
              <span className="text-[10px] text-amber-300">❖</span>
            </div>
          </div>

          {/* Central Portal Badge */}
          <div
            className={`absolute inset-0 flex flex-col justify-center items-center pointer-events-none transition-opacity duration-300 ${
              animating ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-amber-400/40 shadow-xl text-center">
              <span className="font-cinzel text-xs text-amber-200 block font-bold tracking-widest">
                ROYAL PALACE PORTAL
              </span>
              <span className="text-[8px] uppercase tracking-wider text-slate-400 mt-1 block">
                Touch to Open Doors
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. BREAK THE WALL (PHYSICS SHATTER)                       */}
      {/* ========================================================= */}
      {effect === 'break-wall' && (
        <div className="absolute inset-0 w-full h-full grid grid-cols-4 grid-rows-3 gap-1 bg-slate-950 p-1">
          {Array.from({ length: 12 }).map((_, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const dirX = col < 2 ? -1 : 1;
            const dirY = row < 1.5 ? -1 : 1;
            const moveX = dirX * (140 + Math.random() * 80);
            const moveY = dirY * (140 + Math.random() * 80);
            const rot = (Math.random() - 0.5) * 120;

            return (
              <div
                key={i}
                className="flex items-center justify-center text-[10px] font-cinzel font-bold border border-amber-400/20 select-none shadow-md transition-all"
                style={{
                  background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                  color: revealColor,
                  transform: animating ? `translate(${moveX}px, ${moveY}px) rotate(${rot}deg) scale(0.3)` : 'translate(0px, 0px) rotate(0deg) scale(1)',
                  opacity: animating ? 0 : 1,
                  transitionDuration: `${durationSec}s`,
                  transitionDelay: `${(i % 4) * 0.04}s`,
                  transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)'
                }}
              >
                ❖
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. PAGE TEAR (DIAGONAL PEELING)                           */}
      {/* ========================================================= */}
      {effect === 'page-tear' && (
        <>
          <div
            className="absolute top-0 left-0 w-full h-1/2 flex flex-col justify-end items-center pb-3 border-b border-amber-300/40 transition-transform shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #FBF6EE 0%, #EDE4D3 100%)',
              color: '#452A06',
              transform: animating ? 'translateY(-110%) rotate(-10deg)' : 'translateY(0%) rotate(0deg)',
              transitionDuration: `${durationSec}s`,
              transitionTimingFunction: 'cubic-bezier(0.3, 1, 0.4, 1)'
            }}
          >
            <span className="font-cinzel text-xs font-bold tracking-widest text-[#5B3D0A]">
              ✦ HANDMADE PARCHMENT ✦
            </span>
          </div>

          <div
            className="absolute bottom-0 left-0 w-full h-1/2 flex flex-col justify-start items-center pt-3 border-t border-amber-300/40 transition-transform shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #EDE4D3 0%, #DFD3BF 100%)',
              color: '#452A06',
              transform: animating ? 'translateY(110%) rotate(10deg)' : 'translateY(0%) rotate(0deg)',
              transitionDuration: `${durationSec}s`,
              transitionTimingFunction: 'cubic-bezier(0.3, 1, 0.4, 1)'
            }}
          >
            <span className="text-[8.5px] uppercase tracking-widest text-[#7C5A1E] font-medium">
              Click to Tear Open
            </span>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 8. PARTICLE BLOW (DISINTEGRATE)                           */}
      {/* ========================================================= */}
      {effect === 'particle-blow' && (
        <div
          className="absolute inset-0 w-full h-full flex flex-col justify-center items-center p-6 text-center transition-all"
          style={{
            background: 'linear-gradient(135deg, #1C1306 0%, #0A0702 100%)',
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateX(35px) scale(0.96)' : 'none',
            filter: animating ? 'blur(6px)' : 'none',
            transitionDuration: `${durationSec}s`
          }}
        >
          <div className="p-5 rounded-2xl border border-amber-400/40 bg-amber-950/50 shadow-2xl">
            <span className="font-cinzel text-xs font-bold tracking-widest text-amber-200 block">
              STARDUST SAND TABLET
            </span>
            <span className="text-[8px] uppercase tracking-widest text-amber-400/70 mt-1 block">
              Touch to Dissolve in Wind
            </span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. TOUCH GLOW FLASHLIGHT MASK                             */}
      {/* ========================================================= */}
      {effect === 'touch-glow' && (
        <div
          className="absolute inset-0 w-full h-full flex flex-col justify-end items-center pb-8 p-4 text-center transition-all"
          style={{
            background: animating
              ? 'transparent'
              : `radial-gradient(circle 95px at ${torchPos.x}px ${torchPos.y}px, transparent 0%, transparent 60px, rgba(5, 7, 13, 0.98) 100%)`,
            opacity: animating ? 0 : 1,
            transitionDuration: `${durationSec}s`
          }}
        >
          <div className="bg-slate-950/80 px-4 py-1.5 rounded-full border border-amber-400/50 text-[9px] tracking-widest uppercase font-cinzel text-amber-300 animate-pulse shadow-xl">
            🔍 Move Touch to Shine • Click to Reveal
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. SPARKLE BURST                                         */}
      {/* ========================================================= */}
      {effect === 'sparkle-burst' && (
        <div
          className="absolute inset-0 w-full h-full flex flex-col justify-center items-center p-6 text-center transition-all"
          style={{
            background: 'linear-gradient(135deg, #120D1A 0%, #060408 100%)',
            opacity: animating ? 0 : 1,
            transform: animating ? 'scale(1.2)' : 'scale(1)',
            transitionDuration: `${durationSec}s`
          }}
        >
          <div className="p-5 rounded-full border-2 border-amber-400/50 bg-amber-950/60 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
            <span className="text-2xl text-amber-300">✨</span>
          </div>
          <p className="font-cinzel text-xs font-bold tracking-[0.2em] mt-5 uppercase text-amber-200">
            ✦ DIAMOND STARBURST ✦
          </p>
          <p className="text-[8.5px] uppercase tracking-widest text-amber-400/70 mt-1">
            Tap to Burst Open
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 11. STARRY NIGHT (CONSTELLATIONS)                         */}
      {/* ========================================================= */}
      {effect === 'starry-night' && (
        <div
          className="absolute inset-0 w-full h-full flex flex-col justify-center items-center p-6 text-center transition-all"
          style={{
            background: 'linear-gradient(135deg, #020617 0%, #0B1329 100%)',
            opacity: animating ? 0 : 1,
            transitionDuration: `${durationSec}s`
          }}
        >
          <div className="p-5 rounded-full border border-cyan-400/40 bg-slate-900/60 shadow-[0_0_30px_rgba(34,211,238,0.25)]">
            <span className="text-2xl text-cyan-300">🌌</span>
          </div>
          <p className="font-cinzel text-xs font-bold tracking-[0.2em] mt-5 uppercase text-cyan-200">
            ✦ CELESTIAL CONSTELLATION ✦
          </p>
          <p className="text-[8.5px] uppercase tracking-widest text-cyan-400/70 mt-1">
            Touch the Cosmic Sky
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 12. DIAMOND SHIMMER (GLITTER SWEEP)                       */}
      {/* ========================================================= */}
      {effect === 'diamond-shimmer' && (
        <div
          className="absolute inset-0 w-full h-full flex flex-col justify-center items-center p-6 text-center transition-all overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1C150A 0%, #0D0904 100%)',
            opacity: animating ? 0 : 1,
            transitionDuration: `${durationSec}s`
          }}
        >
          {/* Laser Sheen Bar */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/40 to-transparent skew-x-12 pointer-events-none transition-transform"
            style={{
              transform: animating ? 'translateX(250%)' : 'translateX(-150%)',
              transitionDuration: `${durationSec}s`
            }}
          />
          <div className="p-5 rounded-2xl border border-amber-400/40 bg-amber-950/60 shadow-xl">
            <span className="font-cinzel text-xs font-bold tracking-widest text-amber-200 block">
              PRISMATIC DIAMOND GLOW
            </span>
            <span className="text-[8px] uppercase tracking-widest text-amber-400/70 mt-1 block">
              Click to Sweep
            </span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 13. SLIDE AWAY LEFT/RIGHT                                 */}
      {/* ========================================================= */}
      {effect === 'slide-left-right' && (
        <>
          <div
            className="absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center items-end pr-5 text-right border-r border-amber-400/30 transition-transform shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              transform: animating ? 'translateX(-105%)' : 'translateX(0%)',
              transitionDuration: `${durationSec}s`,
              transitionTimingFunction: 'cubic-bezier(0.85, 0, 0.15, 1)'
            }}
          >
            <span className="font-cinzel text-sm font-bold text-amber-300">SLIDE</span>
          </div>

          <div
            className="absolute top-0 right-0 w-1/2 h-full flex flex-col justify-center items-start pl-5 text-left border-l border-amber-400/30 transition-transform shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              transform: animating ? 'translateX(105%)' : 'translateX(0%)',
              transitionDuration: `${durationSec}s`,
              transitionTimingFunction: 'cubic-bezier(0.85, 0, 0.15, 1)'
            }}
          >
            <span className="font-cinzel text-sm font-bold text-amber-300">REVEAL</span>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 14. MAGICAL FADE & GLOW (DEFAULT FALLBACK)                */}
      {/* ========================================================= */}
      {(effect === 'magical-fade' || !effect) && (
        <div
          className="absolute inset-0 w-full h-full flex flex-col justify-center items-center p-6 text-center transition-all"
          style={{
            background: 'linear-gradient(135deg, #150D20 0%, #060408 100%)',
            opacity: animating ? 0 : 1,
            filter: animating ? 'brightness(2.2) blur(12px)' : 'none',
            transitionDuration: `${durationSec}s`
          }}
        >
          <div className="p-5 rounded-full border-2 border-amber-400/50 bg-slate-900/60 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            <span className="text-2xl text-amber-300">✦</span>
          </div>
          <p className="font-cinzel text-xs font-bold tracking-[0.2em] mt-5 uppercase text-amber-200">
            ✦ MAGICAL COVENANT ✦
          </p>
          <p className="text-[8.5px] uppercase tracking-widest text-amber-400/70 mt-1">
            Touch to Unveil Date
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 15. DYNAMIC FLYING PARTICLES OVERLAY (Physics droplets/hearts) */}
      {/* ========================================================= */}
      {sparks.length > 0 && (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-40 overflow-hidden">
          {sparks.map((p) => {
            if (effect === 'heart-pop') {
              return (
                <div
                  key={p.id}
                  className="absolute"
                  style={{
                    left: `${p.x}px`,
                    top: `${p.y}px`,
                    transform: `translate(-50%, -50%) rotate(${p.rot}rad)`,
                    opacity: p.alpha,
                    color: p.color
                  }}
                >
                  <svg viewBox="0 0 24 24" style={{ width: `${p.size}px`, height: `${p.size}px` }} fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              );
            }

            return (
              <div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}px`,
                  top: `${p.y}px`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: p.color,
                  opacity: p.alpha,
                  boxShadow: `0 0 8px ${p.color}`
                }}
              />
            );
          })}
        </div>
      )}

      {/* Ripple Expand Keyframe Style */}
      <style>{`
        @keyframes rippleExpand {
          0% {
            width: 20px;
            height: 20px;
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.2);
          }
          100% {
            width: 450px;
            height: 450px;
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.6);
          }
        }
      `}</style>
    </div>
  );
}
