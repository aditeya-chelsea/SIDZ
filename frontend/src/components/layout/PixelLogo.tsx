import React from 'react';

interface PixelLogoProps {
  size?: number;
  className?: string;
}

export const PixelLogo: React.FC<PixelLogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Outer Pixel Border */}
      <rect x="2" y="2" width="28" height="28" fill="#ffffff" stroke="#181824" strokeWidth="2" />
      
      {/* Corner Pixel Highlights */}
      <rect x="4" y="4" width="4" height="4" fill="#f472b6" />
      <rect x="24" y="4" width="4" height="4" fill="#f472b6" />
      <rect x="4" y="24" width="4" height="4" fill="#f472b6" />
      <rect x="24" y="24" width="4" height="4" fill="#f472b6" />

      {/* Target Crosshair Grid in Pixel Art */}
      <rect x="15" y="4" width="2" height="6" fill="#181824" />
      <rect x="15" y="22" width="2" height="6" fill="#181824" />
      <rect x="4" y="15" width="6" height="2" fill="#181824" />
      <rect x="22" y="15" width="6" height="2" fill="#181824" />

      {/* Center Pixel Heart / Radar Core */}
      <path
        d="M13 13h2v2h-2z M17 13h2v2h-2z M12 14h6v2h-6z M13 16h4v2h-4z M15 18h2v2h-2z"
        fill="#f472b6"
      />
      <rect x="15" y="15" width="2" height="2" fill="#fef08a" />
    </svg>
  );
};

