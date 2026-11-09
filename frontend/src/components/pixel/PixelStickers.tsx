import React from 'react';

// 8-bit Retro Heart
export const PixelHeart: React.FC<{ size?: number; color?: string; className?: string }> = ({
  size = 16,
  color = '#f43f5e',
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      <path
        d="M2 4h4v2H2V4zm8 0h4v2h-4V4zM1 6h6v2H1V6zm8 0h6v2H9V6zM1 8h14v2H1V8zm1 2h12v2H2v-2zm2 2h8v2H4v-2zm3 2h2v2H7v-2z"
        fill={color}
      />
      <path
        d="M2 3h4v1H2V3zm8 0h4v1h-4V3zM1 5h1v1H1V5zm6 0h2v1H7V5zm7 0h1v1h-1V5zM0 6h1v4H0V6zm15 0h1v4h-1V6zM1 10h1v1H1v-1zm13 0h1v1h-1v-1zm-12 1h1v1H2v-1zm11 0h1v1h-1v-1zm-10 1h2v1H3v-1zm8 0h2v1h-2v-1zm-7 1h2v1H4v-1zm6 0h2v1h-2v-1zm-5 1h1v1H5v-1zm4 0h1v1H9v-1zm-3 1h2v1H6v-1z"
        fill="#181824"
      />
    </svg>
  );
};

// 8-bit Retro Twinkling Star / Sparkle
export const PixelSparkle: React.FC<{ size?: number; color?: string; className?: string }> = ({
  size = 14,
  color = '#facc15',
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="6" y="0" width="2" height="14" fill="#181824" />
      <rect x="0" y="6" width="14" height="2" fill="#181824" />
      <rect x="4" y="2" width="6" height="10" fill={color} />
      <rect x="2" y="4" width="10" height="6" fill={color} />
      <rect x="5" y="3" width="4" height="8" fill="#ffffff" opacity="0.6" />
      <rect x="3" y="5" width="8" height="4" fill="#ffffff" opacity="0.6" />
    </svg>
  );
};

// 8-bit Smiley Face (Happy / Cool sunglasses / Oops)
export const PixelSmiley: React.FC<{
  type?: 'cool' | 'happy' | 'oops' | 'skull';
  size?: number;
  className?: string;
}> = ({ type = 'cool', size = 24, className = '' }) => {
  if (type === 'skull') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block ${className}`}
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Skull base */}
        <rect x="5" y="3" width="14" height="13" fill="#ffffff" />
        <rect x="7" y="16" width="10" height="5" fill="#ffffff" />
        {/* Outline */}
        <path
          d="M7 2h10v1H7V2zm-3 2h3v1H4V4zm-1 3h1v8H3V7zm1 8h3v1H4v-1zm3 6h10v1H7v-1zm10-5h3v-1h-3v1zm3-3h1V7h-1v7zm-1-7h-2V3h2v1z"
          fill="#181824"
        />
        {/* Heart eyes */}
        <rect x="6" y="8" width="4" height="3" fill="#f43f5e" />
        <rect x="14" y="8" width="4" height="3" fill="#f43f5e" />
        {/* Teeth */}
        <rect x="9" y="17" width="2" height="3" fill="#181824" />
        <rect x="13" y="17" width="2" height="3" fill="#181824" />
      </svg>
    );
  }

  if (type === 'oops') {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full bg-[#fef08a] border-2 border-pixel-dark shadow-pixel-sm font-pixel font-bold text-pixel-dark select-none ${className}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.4 }}>😵</span>
      </div>
    );
  }

  if (type === 'happy') {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full bg-[#fef08a] border-2 border-pixel-dark shadow-pixel-sm font-pixel font-bold text-pixel-dark select-none ${className}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.45 }}>😁</span>
      </div>
    );
  }

  // Cool sunglasses
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-[#fef08a] border-2 border-pixel-dark shadow-pixel-sm font-pixel font-bold text-pixel-dark select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.45 }}>😎</span>
    </div>
  );
};

// Retro 8-bit Speech Bubble
export const PixelSpeechBubble: React.FC<{
  text: string;
  variant?: 'yellow' | 'pink' | 'purple' | 'cyan' | 'green' | 'white';
  className?: string;
  icon?: React.ReactNode;
}> = ({ text, variant = 'yellow', className = '', icon }) => {
  let bg = 'bg-[#fef08a]';
  if (variant === 'pink') bg = 'bg-[#fbcfe8]';
  if (variant === 'purple') bg = 'bg-[#e9d5ff]';
  if (variant === 'cyan') bg = 'bg-[#bae6fd]';
  if (variant === 'green') bg = 'bg-[#bbf7d0]';
  if (variant === 'white') bg = 'bg-white';

  return (
    <div
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 ${bg} border-2 border-pixel-dark shadow-pixel-sm font-pixel text-[9px] uppercase tracking-wider text-pixel-dark select-none ${className}`}
    >
      {icon && <span>{icon}</span>}
      <span>{text}</span>
      {/* Downward pixel pointer notch */}
      <div className="absolute -bottom-1.5 left-4 w-2 h-2 bg-inherit border-r-2 border-b-2 border-pixel-dark transform rotate-45" />
    </div>
  );
};

// Retro Pixel Arrows (Single or Chevrons)
export const PixelChevrons: React.FC<{ count?: number; color?: string; className?: string }> = ({
  count = 3,
  color = '#181824',
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-0.5 select-none ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="font-pixel text-[10px] font-bold" style={{ color }}>
          »
        </span>
      ))}
    </div>
  );
};

