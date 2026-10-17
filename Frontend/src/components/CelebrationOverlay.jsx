import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * CelebrationOverlay
 * 
 * High-performance, realistic, luxury wedding celebration particle effects:
 * 1. graffiti: 24K Gold Sparkles, Radiant Diamond Flares & Fairy Stardust
 * 2. flowers: Royal Blossom Shower with Golden Centers
 * 3. petals: Falling Velvet Rose Petals with 3D Flutter Physics
 * 4. hearts: Romantic 3D Rose-Gold Floating Hearts & Sparkles
 * 5. firecrackers: Royal Wedding Sparkler Cascade & Golden Embers
 * 
 * Key guarantees:
 * - 100% distortion-free: Renders via React Portal directly into document.body
 *   with exact 1:1 pixel aspect ratio (NO vertical/horizontal stretching).
 * - Single-shot lifecycle: Runs strictly ONCE for ~3.5 seconds when triggered,
 *   never loops infinitely, and cleans up completely.
 * - 100% transparent background: No black boxes, cutouts, or unsightly edges.
 * - Buttery 60fps HTML5 Canvas physics.
 */
export default function CelebrationOverlay({ 
  active = false, 
  type = 'graffiti', 
  duration = 3600, 
  onComplete 
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const isRunningRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = null;
      isRunningRef.current = false;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Viewport dimensions & high-DPI scaling
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Synchronize internal bitmap buffer with exact CSS viewport pixels
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Locate scratch card position if visible in viewport
    let originX = width * 0.5;
    let originY = height * 0.42;
    try {
      const scratchEl = document.querySelector('[data-scratch-card]') || document.getElementById('scratch-section');
      if (scratchEl) {
        const rect = scratchEl.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < height) {
          originX = Math.max(60, Math.min(width - 60, rect.left + rect.width / 2));
          originY = Math.max(60, Math.min(height - 60, rect.top + rect.height * 0.45));
        }
      }
    } catch (_) {
      // Fallback to center
    }

    const effectType = type || 'graffiti';
    const particles = [];
    const shockwaves = [];

    // --- 1. GRAFFITI: 24K GOLD SPARKLES & SHIMMERING STARDUST ---
    if (effectType === 'graffiti') {
      // A. Luxury Diamond Star Glints
      const starCount = 65;
      for (let i = 0; i < starCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8.5 + 2.5;
        particles.push({
          x: originX + (Math.random() - 0.5) * 40,
          y: originY + (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          size: Math.random() * 8 + 6,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.05,
          twinkleSpeed: Math.random() * 0.08 + 0.04,
          alpha: 1,
          life: 1,
          decay: 0.007 + Math.random() * 0.004,
          color: ['#FFD700', '#FFE680', '#F59E0B', '#FFF9E6', '#FFFFFF', '#FDA4AF'][Math.floor(Math.random() * 6)],
          kind: 'star'
        });
      }

      // B. Floating Shimmering Stardust / Fairy Dust
      const dustCount = 55;
      for (let i = 0; i < dustCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 1.2;
        particles.push({
          x: originX + (Math.random() - 0.5) * 30,
          y: originY + (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.8,
          size: Math.random() * 2.8 + 1.2,
          alpha: 1,
          life: 1,
          decay: 0.006 + Math.random() * 0.003,
          color: ['#FFD700', '#FDE047', '#FFFBEB', '#F59E0B'][Math.floor(Math.random() * 4)],
          kind: 'dust'
        });
      }

      // C. Expanding Golden Aura Rings
      shockwaves.push(
        { x: originX, y: originY, r: 8, maxR: 160, speed: 4.5, alpha: 0.8, delay: 0 },
        { x: originX, y: originY, r: 8, maxR: 200, speed: 3.8, alpha: 0.6, delay: 120 }
      );

    // --- 2. PETALS: FALLING LUXURY VELVET ROSE PETALS ---
    } else if (effectType === 'petals') {
      const petalCount = 60;
      for (let i = 0; i < petalCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: -30 - Math.random() * (height * 0.55),
          vx: (Math.random() - 0.5) * 1.4,
          vy: Math.random() * 1.8 + 1.4,
          size: Math.random() * 10 + 15,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.035,
          flipAngle: Math.random() * Math.PI * 2,
          flipSpeed: Math.random() * 0.03 + 0.02,
          swayAmp: Math.random() * 2.2 + 1.2,
          swayFreq: Math.random() * 0.02 + 0.015,
          phase: Math.random() * Math.PI * 2,
          alpha: 1,
          life: 1,
          age: 0,
          decay: 0.004 + Math.random() * 0.002,
          kind: 'petal'
        });
      }

    // --- 3. FLOWERS: ROYAL BLOSSOM SHOWER ---
    } else if (effectType === 'flowers') {
      const flowerCount = 45;
      for (let i = 0; i < flowerCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6.5 + 2.2;
        particles.push({
          x: originX + (Math.random() - 0.5) * 35,
          y: originY + (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          size: Math.random() * 12 + 15,
          scale: 0.15,
          targetScale: Math.random() * 0.45 + 0.75,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.028,
          alpha: 1,
          life: 1,
          decay: 0.005 + Math.random() * 0.0025,
          kind: 'flower'
        });
      }

    // --- 4. HEARTS: ROMANTIC 3D ROSE-GOLD FLOATING HEARTS ---
    } else if (effectType === 'hearts') {
      const heartCount = 50;
      for (let i = 0; i < heartCount; i++) {
        const angle = -Math.PI * 0.88 + Math.random() * Math.PI * 0.76;
        const speed = Math.random() * 7.5 + 2.5;
        particles.push({
          x: originX + (Math.random() - 0.5) * 45,
          y: originY + (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 10 + 14,
          rot: (Math.random() - 0.5) * 0.4,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          swayFreq: Math.random() * 0.03 + 0.02,
          phase: Math.random() * Math.PI * 2,
          alpha: 1,
          life: 1,
          age: 0,
          decay: 0.005 + Math.random() * 0.0025,
          kind: 'heart'
        });
      }

    // --- 5. FIRECRACKERS: ROYAL SPARKLER CASCADE & EMBERS ---
    } else if (effectType === 'firecrackers') {
      const sparkCount = 85;
      const bursts = [
        { x: originX, y: originY, delay: 0 },
        { x: originX - 60, y: originY - 40, delay: 140 },
        { x: originX + 60, y: originY - 30, delay: 260 }
      ];

      for (let i = 0; i < sparkCount; i++) {
        const burst = bursts[i % bursts.length];
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7.5 + 2.2;
        particles.push({
          x: burst.x,
          y: burst.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2.6 + 1.6,
          tail: [],
          alpha: 1,
          life: 1,
          delay: burst.delay,
          decay: 0.007 + Math.random() * 0.0035,
          color: ['#FFFFFF', '#FEF08A', '#F59E0B', '#FB923C', '#E11D48'][Math.floor(Math.random() * 5)],
          kind: 'sparkler'
        });
      }
    }

    isRunningRef.current = true;
    const startTime = performance.now();

    const renderFrame = (now) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      let anyAlive = false;

      // Render expanding aura shockwaves
      if (shockwaves.length > 0) {
        shockwaves.forEach((s) => {
          if (elapsed < s.delay) return;
          if (s.r < s.maxR) {
            anyAlive = true;
            s.r += s.speed;
            const progress = s.r / s.maxR;
            const waveAlpha = s.alpha * (1 - progress);

            ctx.save();
            ctx.strokeStyle = `rgba(245, 197, 66, ${waveAlpha})`;
            ctx.lineWidth = 2 * (1 - progress);
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
        });
      }

      // Render particles
      particles.forEach((p) => {
        if (p.delay && elapsed < p.delay) return;
        if (p.life <= 0) return;

        anyAlive = true;
        p.age = (p.age || 0) + 1;
        p.life -= p.decay;
        p.alpha = Math.max(0, p.life);

        // --- STAR (DIAMOND FLARE) ---
        if (p.kind === 'star') {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.95;
          p.vy = p.vy * 0.95 + 0.12;
          p.rot += p.rotSpeed;

          const twinkle = 0.8 + 0.35 * Math.sin(p.age * p.twinkleSpeed);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(twinkle, twinkle);
          ctx.globalAlpha = p.alpha;

          const s = p.size;

          // 1. Soft radial luminous aura
          const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 2.2);
          aura.addColorStop(0, 'rgba(255, 246, 214, 0.5)');
          aura.addColorStop(0.5, 'rgba(245, 158, 11, 0.16)');
          aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(0, 0, s * 2.2, 0, Math.PI * 2);
          ctx.fill();

          // 2. Symmetrical 4-point tapered cross flare
          ctx.fillStyle = p.color;
          // Vertical diamond ray
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(s * 0.14, 0, 0, s);
          ctx.quadraticCurveTo(-s * 0.14, 0, 0, -s);
          ctx.fill();

          // Horizontal diamond ray
          ctx.beginPath();
          ctx.moveTo(-s, 0);
          ctx.quadraticCurveTo(0, s * 0.14, s, 0);
          ctx.quadraticCurveTo(0, -s * 0.14, -s, 0);
          ctx.fill();

          // 3. Pure diamond-white jewel core
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

        // --- DUST (GOLDEN STARDUST) ---
        } else if (p.kind === 'dust') {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96;
          p.vy = p.vy * 0.96 + 0.08;

          ctx.save();
          ctx.globalAlpha = p.alpha * 0.9;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Micro sparkle glint
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

        // --- PETALS (VELVET ROSE PETALS) ---
        } else if (p.kind === 'petal') {
          p.x += Math.sin(p.age * p.swayFreq + p.phase) * p.swayAmp + p.vx;
          p.y += p.vy;
          p.rot += p.rotSpeed;
          p.flipAngle += p.flipSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(1, Math.cos(p.flipAngle));
          ctx.globalAlpha = p.alpha * 0.96;

          const s = p.size;
          const grad = ctx.createRadialGradient(-s * 0.2, -s * 0.3, 0, 0, 0, s);
          grad.addColorStop(0, '#FB7185');
          grad.addColorStop(0.45, '#E11D48');
          grad.addColorStop(1, '#9F1239');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.bezierCurveTo(s * 0.85, -s * 0.55, s * 0.75, s * 0.5, 0, s);
          ctx.bezierCurveTo(-s * 0.75, s * 0.5, -s * 0.85, -s * 0.55, 0, -s);
          ctx.fill();

          // Satin vein sheen
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.65);
          ctx.quadraticCurveTo(s * 0.08, 0, 0, s * 0.65);
          ctx.stroke();

          ctx.restore();

        // --- FLOWER (ROYAL BLOSSOM) ---
        } else if (p.kind === 'flower') {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96;
          p.vy = p.vy * 0.96 + 0.25;
          p.rot += p.rotSpeed;
          p.scale += (p.targetScale - p.scale) * 0.08;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(p.scale, p.scale);
          ctx.globalAlpha = p.alpha;

          const s = p.size;
          const numPetals = 5;
          for (let i = 0; i < numPetals; i++) {
            ctx.save();
            ctx.rotate((i * 2 * Math.PI) / numPetals);

            const pGrad = ctx.createRadialGradient(0, -s * 0.45, 0, 0, -s * 0.45, s * 0.65);
            pGrad.addColorStop(0, '#FFFBEB');
            pGrad.addColorStop(0.5, '#FBCFE8');
            pGrad.addColorStop(1, '#F472B6');

            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(s * 0.45, -s * 0.35, s * 0.4, -s * 0.85, 0, -s);
            ctx.bezierCurveTo(-s * 0.4, -s * 0.85, -s * 0.45, -s * 0.35, 0, 0);
            ctx.fill();
            ctx.restore();
          }

          // Golden center stamen
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.18, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.08, 0, 2 * Math.PI);
          ctx.fill();

          ctx.restore();

        // --- HEART (ROSE-GOLD 3D HEARTS) ---
        } else if (p.kind === 'heart') {
          p.x += p.vx + Math.sin(p.age * p.swayFreq + p.phase) * 0.8;
          p.y += p.vy;
          p.vx *= 0.96;
          p.vy -= 0.035; // gentle buoyant float
          p.rot += p.rotSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = p.alpha;

          const s = p.size;
          const hGrad = ctx.createRadialGradient(-s * 0.25, -s * 0.25, 0, 0, 0, s * 1.1);
          hGrad.addColorStop(0, '#FDA4AF');
          hGrad.addColorStop(0.5, '#F43F5E');
          hGrad.addColorStop(1, '#BE123C');

          ctx.fillStyle = hGrad;
          ctx.beginPath();
          ctx.moveTo(0, s * 0.35);
          ctx.bezierCurveTo(0, -s * 0.2, -s * 0.7, -s * 0.7, -s * 0.7, 0);
          ctx.bezierCurveTo(-s * 0.7, s * 0.4, 0, s * 0.8, 0, s);
          ctx.bezierCurveTo(0, s * 0.8, s * 0.7, s * 0.4, s * 0.7, 0);
          ctx.bezierCurveTo(s * 0.7, -s * 0.7, 0, -s * 0.2, 0, s * 0.35);
          ctx.fill();

          // Glossy highlight reflection
          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.beginPath();
          ctx.ellipse(-s * 0.32, -s * 0.18, s * 0.14, s * 0.07, -Math.PI / 4, 0, 2 * Math.PI);
          ctx.fill();

          ctx.restore();

        // --- SPARKLER (ROYAL CELEBRATION SPARKS) ---
        } else if (p.kind === 'sparkler') {
          // Short spark trail (maximum 10px long, never stretched!)
          p.tail.push({ x: p.x, y: p.y });
          if (p.tail.length > 4) p.tail.shift();

          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.95;
          p.vy = p.vy * 0.95 + 0.12;

          ctx.save();
          ctx.globalAlpha = p.alpha;

          // Short glowing tail
          if (p.tail.length > 1) {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size * 0.8;
            ctx.beginPath();
            ctx.moveTo(p.tail[0].x, p.tail[0].y);
            for (let t = 1; t < p.tail.length; t++) {
              ctx.lineTo(p.tail[t].x, p.tail[t].y);
            }
            ctx.stroke();
          }

          // Incandescent spark core
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
          ctx.fill();

          // Radiant warm aura
          const fGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.2);
          fGrad.addColorStop(0, p.color);
          fGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = fGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.2, 0, 2 * Math.PI);
          ctx.fill();

          ctx.restore();
        }
      });

      // Single-shot termination check
      if (anyAlive && elapsed < duration) {
        animRef.current = requestAnimationFrame(renderFrame);
      } else {
        // Complete and clean up
        ctx.clearRect(0, 0, width, height);
        isRunningRef.current = false;
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    };

    animRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = null;
      isRunningRef.current = false;
    };
  }, [active, type, duration]);

  if (!active || typeof document === 'undefined') return null;

  // Render directly into document.body to eliminate all ancestor scroll/transform distortions
  return createPortal(
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 999999,
        background: 'transparent',
        touchAction: 'none'
      }}
    />,
    document.body
  );
}
