import React from 'react';

interface PixelWindowProps {
  title: string;
  children: React.ReactNode;
  headerColor?: 'pink' | 'yellow' | 'purple' | 'cyan' | 'green' | 'gray';
  className?: string;
  headerAction?: React.ReactNode;
  onClose?: () => void;
  icon?: React.ReactNode;
}

export const PixelWindow: React.FC<PixelWindowProps> = ({
  title,
  children,
  headerColor = 'pink',
  className = '',
  headerAction,
  onClose,
  icon,
}) => {
  let headerBg = 'bg-[#f472b6]';
  if (headerColor === 'yellow') headerBg = 'bg-[#fef08a]';
  if (headerColor === 'purple') headerBg = 'bg-[#d8b4fe]';
  if (headerColor === 'cyan') headerBg = 'bg-[#7dd3fc]';
  if (headerColor === 'green') headerBg = 'bg-[#86efac]';
  if (headerColor === 'gray') headerBg = 'bg-[#e2e8f0]';

  return (
    <div className={`bg-white border-2 border-pixel-dark shadow-pixel flex flex-col ${className}`}>
      {/* Titlebar */}
      <div className={`px-3 py-1.5 border-b-2 border-pixel-dark ${headerBg} flex items-center justify-between select-none`}>
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className="font-pixel text-[10px] text-pixel-dark uppercase tracking-wider truncate">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {headerAction}
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-white border border-pixel-dark text-[8px] flex items-center justify-center font-mono leading-none">_</span>
            <span className="w-3 h-3 bg-white border border-pixel-dark text-[8px] flex items-center justify-center font-mono leading-none">□</span>
            {onClose ? (
              <button
                onClick={onClose}
                className="w-3 h-3 bg-[#fda4af] hover:bg-[#f43f5e] border border-pixel-dark text-[8px] flex items-center justify-center font-mono leading-none cursor-pointer"
              >
                ✕
              </button>
            ) : (
              <span className="w-3 h-3 bg-white border border-pixel-dark text-[8px] flex items-center justify-center font-mono leading-none">✕</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white">
        {children}
      </div>
    </div>
  );
};

