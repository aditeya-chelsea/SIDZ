import React, { useState } from 'react';
import { Search, Plus, Terminal, Zap } from 'lucide-react';
import { TargetType } from '../../types';
import { PixelButton } from '../pixel/PixelButton';

interface HeaderProps {
  onStartNewScan: (initialTarget?: string, initialType?: TargetType) => void;
  onOpenToolDrawer: () => void;
  activeScanCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onStartNewScan,
  onOpenToolDrawer,
  activeScanCount,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    onStartNewScan(searchInput.trim());
    setSearchInput('');
  };

  return (
    <header className="h-14 bg-white border-b-2 border-pixel-dark flex items-center justify-between px-5 z-10 shadow-pixel-sm font-mono">
      {/* Retro Command Input */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <span className="absolute left-3 font-pixel text-xs text-pixel-pink font-bold">▶</span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ENTER USERNAME, EMAIL, DOMAIN OR IP..."
            className="w-full bg-[#fffdf5] border-2 border-pixel-dark shadow-pixel-sm px-8 py-1.5 text-xs text-pixel-dark placeholder-slate-400 focus:outline-none focus:bg-white font-mono font-bold"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 px-1.5 py-0.5 text-[9px] font-pixel bg-[#fef08a] text-pixel-dark border border-pixel-dark">
            RUN
          </kbd>
        </div>
      </form>

      {/* Control Actions */}
      <div className="flex items-center gap-3">
        {activeScanCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#d8b4fe] border-2 border-pixel-dark shadow-pixel-sm text-pixel-dark text-[10px] font-pixel font-bold animate-bounce">
            <Zap className="w-3 h-3 fill-current" />
            <span>{activeScanCount} RUNNING</span>
          </div>
        )}

        <PixelButton
          variant="purple"
          size="sm"
          onClick={onOpenToolDrawer}
          title="Inspect Local Tool Engines"
        >
          <Terminal className="w-3 h-3" />
          <span className="hidden sm:inline">TOOLS</span>
        </PixelButton>

        <PixelButton
          variant="green"
          size="sm"
          onClick={() => onStartNewScan()}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>START SCAN</span>
        </PixelButton>
      </div>
    </header>
  );
};
