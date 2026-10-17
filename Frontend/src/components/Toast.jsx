import React, { useEffect, useRef } from 'react';
import { SvgBell, SvgCheck, SvgX } from './icons';

export default function Toast({ message, type = "info", onClose, duration = 4000 }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const timer = setTimeout(() => {
      onCloseRef.current();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const bgClass = {
    success: "bg-emerald-950/90 text-emerald-200 border-emerald-500/50 shadow-emerald-950/40",
    error: "bg-rose-950/90 text-rose-200 border-rose-500/50 shadow-rose-950/40",
    info: "bg-slate-900/90 text-slate-200 border-amber-500/35 shadow-slate-950/40"
  }[type] || "bg-slate-900/90 text-slate-200 border-amber-500/35 shadow-slate-950/40";

  const icon = {
    success: <SvgCheck className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <SvgX className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <SvgBell className="w-5 h-5 text-amber-400 shrink-0" />
  }[type] || <SvgBell className="w-5 h-5 text-amber-400 shrink-0" />;

  return (
    <div className={`fixed bottom-6 left-6 z-50 max-w-sm p-4 rounded-xl border flex items-center space-x-3 animate-fade-in backdrop-blur-md shadow-2xl ${bgClass} transition-all duration-300 transform translate-y-0`}>
      {icon}
      <span className="text-xs font-semibold tracking-wide flex-grow">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
        <SvgX className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
      </button>
    </div>
  );
}
