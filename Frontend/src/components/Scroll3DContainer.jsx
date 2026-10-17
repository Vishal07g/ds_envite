import React, { useRef, useEffect } from 'react';

/**
 * High-performance GPU-accelerated 3D scroll container.
 * Performs direct DOM style mutations inside requestAnimationFrame to completely
 * bypass React component diffing and re-renders during active scrolling (60/120 FPS).
 */
export default function Scroll3DContainer({ children, enabled = true, intensity = 4, perspective = 900, effectType = '3d-roll' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!enabled || intensity <= 0) {
      el.style.transform = '';
      el.style.filter = '';
      el.style.opacity = '';
      el.style.willChange = 'auto';
      return;
    }

    // Prepare GPU composition layer
    el.style.willChange = 'transform, opacity';
    el.style.transformStyle = 'preserve-3d';
    el.style.backfaceVisibility = 'hidden';

    let ticking = false;
    let cachedViewportHeight = window.innerHeight || 768;
    let cachedContainer = null;
    let cachedContainerRect = null;

    const updateMetrics = () => {
      cachedContainer = el.closest('#invitation-preview-container');
      if (cachedContainer) {
        cachedContainerRect = cachedContainer.getBoundingClientRect();
        cachedViewportHeight = cachedContainerRect.height;
      } else {
        cachedViewportHeight = window.innerHeight || 768;
        cachedContainerRect = null;
      }
    };

    updateMetrics();

    const updateTransform = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();

      let vTop = 0;
      let vHeight = cachedViewportHeight;

      if (cachedContainer) {
        // In editor preview scroll container
        if (!cachedContainerRect || cachedContainerRect.height === 0) {
          cachedContainerRect = cachedContainer.getBoundingClientRect();
        }
        vTop = cachedContainerRect.top;
        vHeight = cachedContainerRect.height || 768;
      }

      // Frustum culling: if element is outside the visible boundary, skip computing transforms
      if (rect.bottom < vTop - 120 || rect.top > vTop + vHeight + 120) {
        return;
      }

      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = vTop + vHeight / 2;
      const distanceFromCenter = elementCenter - viewportCenter;

      const ratio = distanceFromCenter / vHeight;
      const absRatio = Math.abs(ratio);

      // Focus dead-zone: keep elements perfectly sharp, flat, and opaque in the center 30% of screen
      const deadZone = 0.15;
      let effectRatio = 0;
      if (absRatio > deadZone) {
        effectRatio = (absRatio - deadZone) / (1 - deadZone);
      }
      const signedEffectRatio = ratio < 0 ? -effectRatio : effectRatio;

      // Common calculations based on focused effect ratio
      const rotationFactor = signedEffectRatio * (intensity * 3.5);
      const rotateX = Math.min(Math.max(rotationFactor, -15), 15);
      const rotateY = Math.min(Math.max(signedEffectRatio * (intensity * 4.5), -20), 20);

      const depthFactor = effectRatio * -(intensity * 12);
      const translateZ = Math.min(Math.max(depthFactor, -120), 0);

      const opacityFactor = 1 - Math.min(effectRatio * 0.4, 0.45);

      let customTransform = '';
      let customFilter = '';

      switch (effectType) {
        case '3d-tilt-slide':
          customTransform = `perspective(${perspective}px) rotateY(${rotateY.toFixed(2)}deg) translate3d(${(rotateX * 4).toFixed(1)}px, 0, 0)`;
          break;
        case 'gilded-zoom': {
          const zoomFactor = 1 - Math.min(effectRatio * (intensity * 0.03), 0.15);
          customTransform = `scale3d(${zoomFactor.toFixed(3)}, ${zoomFactor.toFixed(3)}, 1)`;
          break;
        }
        case 'cinematic-blur': {
          const blurVal = Math.min(Math.max(effectRatio * (intensity * 2.5), 0), 8);
          if (blurVal > 0.4) {
            customFilter = `blur(${blurVal.toFixed(1)}px)`;
          }
          break;
        }
        case 'parallax-fly': {
          const flyY = signedEffectRatio * (intensity * 15);
          customTransform = `translate3d(0, ${flyY.toFixed(1)}px, 0)`;
          break;
        }
        case '3d-roll':
        default:
          customTransform = `perspective(${perspective}px) rotateX(${(-rotateX).toFixed(2)}deg) translate3d(0, 0, ${translateZ.toFixed(1)}px)`;
          break;
      }

      // Direct GPU style assignments with zero React re-render overhead
      el.style.transform = customTransform;
      el.style.filter = customFilter;
      el.style.opacity = opacityFactor.toFixed(2);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          updateTransform();
          ticking = false;
        });
      }
    };

    const onResize = () => {
      updateMetrics();
      onScroll();
    };

    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    
    // Initial paint
    updateTransform();

    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onResize);
      if (el) {
        el.style.transform = '';
        el.style.filter = '';
        el.style.opacity = '';
        el.style.willChange = 'auto';
      }
    };
  }, [enabled, intensity, perspective, effectType]);

  return (
    <div ref={ref} className="scroll-3d-wrapper">
      {children}
    </div>
  );
}
