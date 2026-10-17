import React from 'react';

export default function Watermark({ isPaid = false }) {
  // If payment has been completed for this invitation, automatically remove watermark!
  if (isPaid) return null;

  const svgPattern = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <text 
        x="80" 
        y="80" 
        fill="rgba(245, 158, 11, 0.09)" 
        font-family="Georgia, serif" 
        font-size="28" 
        font-weight="bold"
        text-anchor="middle" 
        transform="rotate(-45 80 80)"
        style="user-select: none;"
      >
        DS INVITES
      </text>
    </svg>
  `;

  // Encode SVG for safe CSS usage (encodeURIComponent handles Unicode safely unlike btoa)
  const backgroundStyle = {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svgPattern)}")`,
    backgroundRepeat: 'repeat',
  };

  return (
    <div 
      className="fixed inset-0 z-40 pointer-events-none select-none w-full h-full"
      style={backgroundStyle}
      aria-hidden="true"
    />
  );
}
