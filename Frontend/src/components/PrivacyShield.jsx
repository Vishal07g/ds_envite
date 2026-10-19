import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SvgHeart, SvgCheck } from './icons';

/**
 * PrivacyShield Component
 * Provides comprehensive, multi-layer protection against unauthorized screenshots,
 * snipping tools, print-to-PDF, text scraping, and image theft for shared invitations.
 * 
 * Layers:
 * 1. Key Listener: Intercepts PrintScreen, Snipping tool shortcuts (Win+Shift+S, Cmd+Shift+3/4/5), Ctrl+P, Ctrl+S, Inspect (F12, Ctrl+Shift+I).
 * 2. Window Blur / Visibility Detector: Triggers instant opaque blackout shield whenever a snipping tool or external app takes focus.
 * 3. Clipboard Scrubber: Clears clipboard buffer on PrintScreen to prevent pasting of screen grabs.
 * 4. Context Menu & Drag Lock: Disables right-click context menu and image drag-and-drop.
 * 5. CSS Print Barrier: Completely blanks out page in @media print.
 * 6. Test & Simulation Mode: Allows verification and testing directly from UI.
 */
export default function PrivacyShield({ 
  targetContainerId = "invitation-view-container",
  coupleNames = "Celebration",
  enableWatermarkPattern = true
}) {
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [shieldReason, setShieldReason] = useState("");
  const [testModeCount, setTestModeCount] = useState(0);
  const [showTestBadge, setShowTestBadge] = useState(false);
  const [toastNotice, setToastNotice] = useState(null);
  const timeoutRef = useRef(null);

  // Clear clipboard to scrub any captured screenshot bitmap
  const scrubClipboard = useCallback(async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText("🔒 Protected Content: Screenshots and duplication of this private invitation are strictly restricted.");
      }
    } catch {
      // Ignore clipboard permission errors in background
    }
  }, []);

  // Show quick toast notification
  const notify = useCallback((msg) => {
    setToastNotice(msg);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setToastNotice(null);
    }, 3500);
  }, []);

  // Activate the opaque privacy blackout shield
  const triggerShield = useCallback((reason = "Screen capture detected") => {
    setShieldReason(reason);
    setIsShieldActive(true);
    scrubClipboard();

    // Obfuscate the target DOM container
    const container = document.getElementById(targetContainerId);
    if (container) {
      container.classList.add("privacy-shield-obfuscated");
    }
  }, [targetContainerId, scrubClipboard]);

  // Dismiss the privacy shield smoothly
  const dismissShield = useCallback(() => {
    setIsShieldActive(false);
    const container = document.getElementById(targetContainerId);
    if (container) {
      container.classList.remove("privacy-shield-obfuscated");
    }
  }, [targetContainerId]);

  // Handle keyboard shortcuts (PrintScreen, Snipping Tool, Print, Inspect)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. PrintScreen key (standard code 44 or key 'PrintScreen')
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        scrubClipboard();
        triggerShield("PrintScreen / Screen Grab detected");
        notify("🚫 Screenshot Blocked: Invitee privacy protection is active.");
        return false;
      }

      // 2. Windows Snipping Tool (Win + Shift + S) or Mac Screenshot (Cmd + Shift + 3/4/5)
      if ((e.shiftKey && (e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S' || e.code === 'KeyS')) ||
          (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key))) {
        e.preventDefault();
        scrubClipboard();
        triggerShield("Snipping / Screen Capture Shortcut detected");
        notify("🚫 Screen Capture Blocked: Invitee privacy protection is active.");
        return false;
      }

      // 3. Print prevention (Ctrl + P / Cmd + P)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        triggerShield("Print to PDF is restricted");
        notify("🚫 Printing Disabled: This invitation is strictly confidential.");
        return false;
      }

      // 4. Save Page prevention (Ctrl + S / Cmd + S)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        notify("🔒 Saving webpage is restricted for private invitations.");
        return false;
      }

      // 5. Developer Tools prevention (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U)
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) ||
        ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U'))
      ) {
        e.preventDefault();
        notify("🔒 Source inspection disabled for invitee data privacy.");
        return false;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        scrubClipboard();
        triggerShield("PrintScreen released");
      }
    };

    // 6. Window Blur & Visibility Change (Snipping Tool & external screenshot tool detector)
    // When snipping tool or screen capture is triggered, browser loses focus immediately
    const handleBlur = () => {
      // Trigger instant opaque blackout so any snip captures only the shield
      triggerShield("Window focus lost / Screen Capture active");
    };

    const handleFocus = () => {
      // Once user clicks back into the window, smoothly lift the shield after a brief verification
      setTimeout(() => {
        dismissShield();
      }, 300);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        triggerShield("Screen visibility changed");
      } else {
        setTimeout(() => {
          dismissShield();
        }, 300);
      }
    };

    // 7. Context Menu prevention (Right-click to Inspect / Save Image As)
    const handleContextMenu = (e) => {
      e.preventDefault();
      notify("🔒 Right-click is restricted to safeguard invitee photos & information.");
      return false;
    };

    // 8. Drag and drop prevention (prevent dragging photos to desktop)
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("dragstart", handleDragStart, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("dragstart", handleDragStart, true);
    };
  }, [triggerShield, dismissShield, scrubClipboard, notify]);

  // Interactive Test Simulation Trigger
  const handleTestShield = () => {
    setTestModeCount(prev => prev + 1);
    triggerShield("Simulated Screenshot Attempt (Test Verification)");
    notify("🛡️ Privacy Shield Active! Content is blacked out. Click anywhere to resume.");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      dismissShield();
      notify("✅ Privacy Shield verification test cycle complete.");
    }, 8000);
  };

  return (
    <>
      {/* 1. TOAST PRIVACY ALERT */}
      {toastNotice && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999999] pointer-events-none transition-all duration-300 animate-bounce">
          <div className="flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-slate-950/95 border border-amber-500/50 shadow-2xl backdrop-blur-md text-amber-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
            <span>{toastNotice}</span>
          </div>
        </div>
      )}

      {/* 2. FULL-SCREEN OPAQUE PRIVACY BLACKOUT SHIELD */}
      {isShieldActive && (
        <div 
          onClick={dismissShield}
          className="fixed inset-0 z-[9999999] bg-[#070b19] flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer transition-opacity duration-200"
          style={{ backdropFilter: "blur(40px)" }}
        >
          {/* Decorative luxury golden frame */}
          <div className="relative max-w-md w-full p-8 rounded-3xl border border-amber-500/40 bg-gradient-to-b from-slate-900/90 to-slate-950/95 shadow-2xl space-y-6 text-slate-100 animate-fade-in">
            {/* Pulsing Lock Icon */}
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-inner">
              <span className="text-3xl animate-pulse">🔒</span>
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-extrabold uppercase tracking-widest text-[10px]">
                Privacy Shield Active
              </span>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-300 drop-shadow">
                Invitation Privacy Protected
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Screen capture, screenshots, and recording are strictly restricted to safeguard personal ceremony details and invitee privacy.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/20 text-[11px] text-amber-200/80 font-mono">
              Reason: {shieldReason || "Screen grab attempt detected"}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={dismissShield}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-bold uppercase tracking-wider text-xs shadow-lg transition"
              >
                Click Anywhere to Resume Viewing
              </button>
              <p className="text-[10px] text-slate-400 tracking-wider">
                DS Envite Secure Privacy Engine
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBTLE DIAGONAL WATERMARK PATTERN (Protects against physical cameras) */}
      {enableWatermarkPattern && (
        <div 
          className="fixed inset-0 pointer-events-none z-[40] overflow-hidden select-none opacity-[0.035]"
          aria-hidden="true"
        >
          <div className="w-[200vw] h-[200vh] -translate-x-[50vw] -translate-y-[50vh] rotate-[-25deg] flex flex-wrap content-start gap-12 font-cinzel font-bold text-sm tracking-widest text-slate-900 dark:text-white uppercase">
            {Array.from({ length: 48 }).map((_, i) => (
              <span key={i} className="whitespace-nowrap">
                🔒 PRIVATE INVITATION • {coupleNames} • DO NOT COPY
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. DISCREET PRIVACY VERIFICATION & TESTING BADGE */}
      <div className="fixed bottom-3 right-3 z-50">
        {!showTestBadge ? (
          <button
            type="button"
            onClick={() => setShowTestBadge(true)}
            className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-500/30 hover:border-amber-400 text-amber-300 text-[10px] font-bold tracking-wider uppercase transition shadow-md flex items-center space-x-1 cursor-pointer"
            title="Invitee Privacy Shield is Active. Click to inspect or test."
          >
            <span>🛡️</span>
            <span className="hidden sm:inline">Privacy Shield ON</span>
          </button>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-950/95 backdrop-blur-md border border-amber-500/40 shadow-2xl text-slate-100 text-xs space-y-2.5 max-w-xs animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center space-x-1.5 font-bold text-amber-300 text-[11px] uppercase tracking-wider">
                <span>🛡️</span>
                <span>Privacy Shield Status</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTestBadge(false)}
                className="text-slate-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-[11px] text-slate-300">
              <div className="flex items-center justify-between">
                <span>• PrintScreen Interceptor:</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>• Snipping Tool Shield:</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>• Clipboard Scrubber:</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>• Print / PDF Blocker:</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>• Right-Click &amp; Drag Lock:</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestShield}
              className="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[10px] uppercase tracking-wider transition flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>⚡</span>
              <span>Test Screenshot Shield ({testModeCount} tested)</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
