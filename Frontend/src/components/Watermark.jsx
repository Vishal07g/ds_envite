import React from 'react';

export default function Watermark({ isPaid = false }) {
  // If payment has been completed for this invitation, automatically remove watermark completely!
  if (isPaid) return null;

  const svgPattern = `
    <svg xmlns="http://www.w3.org/2000/svg" width="260" height="200" viewBox="0 0 260 200">
      <text 
        x="130" 
        y="80" 
        fill="rgba(217, 119, 6, 0.18)" 
        font-family="Georgia, serif" 
        font-size="20" 
        font-weight="bold"
        letter-spacing="3"
        text-anchor="middle" 
        transform="rotate(-30 130 80)"
        style="user-select: none;"
      >
        DS ENVITE PREVIEW
      </text>
      <text 
        x="130" 
        y="115" 
        fill="rgba(217, 119, 6, 0.12)" 
        font-family="system-ui, sans-serif" 
        font-size="10" 
        font-weight="600"
        letter-spacing="2"
        text-anchor="middle" 
        transform="rotate(-30 130 115)"
        style="user-select: none;"
      >
        UNOFFICIAL DRAFT • UNPAID
      </text>
    </svg>
  `;

  const backgroundStyle = {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svgPattern)}")`,
    backgroundRepeat: 'repeat',
  };

  return (
    <>
      {/* Tiled diagonal watermark layer */}
      <div 
        className="fixed inset-0 z-40 pointer-events-none select-none w-full h-full"
        style={backgroundStyle}
        aria-hidden="true"
      />
      
      {/* Subtle top watermark ribbon badge */}
      <div className="fixed top-2 left-2 z-40 pointer-events-none select-none bg-amber-500/15 border border-amber-500/30 text-amber-300 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase flex items-center space-x-1.5 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>Preview Mode • Watermarked</span>
      </div>
    </>
  );
}
