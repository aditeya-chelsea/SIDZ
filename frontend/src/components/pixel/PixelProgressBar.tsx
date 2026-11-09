import React from 'react';

interface PixelProgressBarProps {
  progress: number; // 0 to 100
  totalCells?: number;
  label?: string;
  showPercent?: boolean;
}

export const PixelProgressBar: React.FC<PixelProgressBarProps> = ({
  progress,
  totalCells = 12,
  label,
  showPercent = true,
}) => {
  const clamped = Math.min(100, Math.max(0, progress));
  const activeCells = Math.round((clamped / 100) * totalCells);

  return (
    <div className="space-y-1 font-mono">
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-[10px] font-bold text-pixel-dark">
          {label && <span className="font-pixel text-[9px] uppercase tracking-wider">{label}</span>}
          {showPercent && <span className="font-pixel text-[9px]">{clamped}%</span>}
        </div>
      )}
      
      {/* Outer Segmented Pixel Capsule */}
      <div className="p-1 bg-white border-2 border-pixel-dark shadow-pixel-sm flex gap-1 h-7 items-center">
        {Array.from({ length: totalCells }).map((_, idx) => {
          const isActive = idx < activeCells;
          return (
            <div
              key={idx}
              className={`flex-1 h-full border border-pixel-dark transition-all duration-100 ${
                isActive
                  ? 'bg-gradient-to-b from-[#fef08a] via-[#facc15] to-[#ca8a04]'
                  : 'bg-[#f1f5f9]'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

