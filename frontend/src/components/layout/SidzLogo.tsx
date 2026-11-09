import React from 'react';

interface SidzLogoProps {
  size?: number;
  className?: string;
}

export const SidzLogo: React.FC<SidzLogoProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Tactical Frame */}
      <rect
        x="2.5"
        y="2.5"
        width="27"
        height="27"
        rx="2"
        stroke="#1e293b"
        strokeWidth="1.5"
      />
      
      {/* Precision Corner Reticles */}
      <path d="M2.5 9V2.5H9" stroke="#00e599" strokeWidth="1.75" strokeLinecap="square" />
      <path d="M23 2.5H29.5V9" stroke="#00e599" strokeWidth="1.75" strokeLinecap="square" />
      <path d="M29.5 23V29.5H23" stroke="#00e599" strokeWidth="1.75" strokeLinecap="square" />
      <path d="M9 29.5H2.5V23" stroke="#00e599" strokeWidth="1.75" strokeLinecap="square" />

      {/* Target Crosshairs Axes */}
      <line x1="16" y1="5" x2="16" y2="11" stroke="#00f0ff" strokeWidth="1.25" strokeDasharray="1.5 1.5" />
      <line x1="16" y1="21" x2="16" y2="27" stroke="#00f0ff" strokeWidth="1.25" strokeDasharray="1.5 1.5" />
      <line x1="5" y1="16" x2="11" y2="16" stroke="#00f0ff" strokeWidth="1.25" strokeDasharray="1.5 1.5" />
      <line x1="21" y1="16" x2="27" y2="16" stroke="#00f0ff" strokeWidth="1.25" strokeDasharray="1.5 1.5" />

      {/* Concentric Node Circle */}
      <circle cx="16" cy="16" r="6" stroke="#00f0ff" strokeWidth="1.25" opacity="0.8" />

      {/* Core Diamond Pivot */}
      <polygon
        points="16,13 19,16 16,19 13,16"
        fill="#00e599"
      />
      <circle cx="16" cy="16" r="1.5" fill="#07090e" />
    </svg>
  );
};

