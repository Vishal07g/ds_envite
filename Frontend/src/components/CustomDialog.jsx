import React, { useState, useEffect } from 'react';

export default function CustomDialog({
  show,
  type = 'alert', // 'alert', 'confirm', 'prompt'
  title = 'System Message',
  message,
  inputValue = '',
  inputPlaceholder = 'Type here...',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  themeConfig = {}
}) {
  const [text, setText] = useState(inputValue);

  // Sync state with prop value when dialog opens
  useEffect(() => {
    if (show) {
      setText(inputValue);
    }
  }, [show, inputValue]);

  if (!show) return null;

  // Extract theme colors or fallback to default luxurious dark theme
  const accentGold = themeConfig.accentGold || '#e5b858';
  const primaryColor = themeConfig.primaryColor || '#090d16';

  const handleConfirm = (e) => {
    e.preventDefault();
    if (onConfirm) {
      onConfirm(type === 'prompt' ? text : true);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fade-in font-sans">
      <div 
        className="w-full max-w-sm rounded-2xl border p-5 space-y-4 shadow-2xl relative bg-slate-950/80 backdrop-blur-md transition-all duration-300 animate-scale-in"
        style={{ 
          borderColor: `${accentGold}40`,
          boxShadow: `0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 25px ${accentGold}12`
        }}
      >
        {/* Title */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accentGold }}>
            {title}
          </span>
          <p className="text-sm font-medium text-slate-100 leading-relaxed font-sans pr-2">
            {message}
          </p>
        </div>

        {/* Input box (Only for prompts) */}
        {type === 'prompt' && (
          <form onSubmit={handleConfirm} className="pt-1">
            <input
              type="text"
              autoFocus
              value={text}
              placeholder={inputPlaceholder}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/60 border rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
              style={{ 
                borderColor: `${accentGold}35`,
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = accentGold;
                e.target.style.boxShadow = `0 0 8px ${accentGold}30`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = `${accentGold}35`;
                e.target.style.boxShadow = 'none';
              }}
            />
          </form>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end space-x-2.5 pt-2">
          {type !== 'alert' && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold tracking-wide transition-all active:scale-95"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all active:scale-95 text-slate-950"
            style={{ 
              backgroundColor: accentGold,
              boxShadow: `0 4px 12px ${accentGold}35`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'none';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
