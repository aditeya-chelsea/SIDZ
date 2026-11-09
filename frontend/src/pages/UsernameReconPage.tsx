import React, { useState, useEffect } from 'react';
import { Investigation } from '../types';
import { api } from '../api/client';
import { StatusPill } from '../components/layout/StatusPill';
import { PixelWindow } from '../components/pixel/PixelWindow';
import { PixelButton } from '../components/pixel/PixelButton';
import { PixelSmiley, PixelHeart, PixelSparkle } from '../components/pixel/PixelStickers';

interface UsernameReconPageProps {
  onStartNewScan: (initialTarget?: string, initialType?: any) => void;
  onOpenInvestigation: (id: string) => void;
}

export const UsernameReconPage: React.FC<UsernameReconPageProps> = ({
  onStartNewScan,
  onOpenInvestigation,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [scans, setScans] = useState<Investigation[]>([]);

  useEffect(() => {
    api.listInvestigations({ target_type: 'username', limit: 10 }).then(setScans).catch(() => {});
  }, []);

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    onStartNewScan(usernameInput.trim(), 'username');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Module Banner in Pixel Window */}
      <PixelWindow
        title="MODULE 01 // USERNAME INTELLIGENCE"
        headerColor="cyan"
        icon={<PixelSmiley type="cool" size={16} />}
      >
        <div className="p-5 space-y-4 bg-white">
          <div className="space-y-1">
            <h1 className="font-pixel text-sm sm:text-base text-pixel-dark uppercase">
              USERNAME & SOCIAL PROFILE CORRELATION
            </h1>
            <p className="font-mono text-xs text-slate-600 max-w-2xl leading-relaxed">
              Searches public handles across 118+ online platforms (GitHub, Instagram, Twitter/X, Reddit, TikTok, Pinterest, YouTube, Spotify, Steam, etc.) using Sherlock, Maigret, and high-concurrency native async probes.
            </p>
          </div>

          {/* Input Launcher */}
          <form onSubmit={handleLaunch} className="flex flex-col sm:flex-row gap-2 max-w-xl">
            <input
              type="text"
              required
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="ENTER USERNAME (E.G. ADITEYA)..."
              className="flex-1 bg-white border-2 border-pixel-dark shadow-pixel-sm px-3 py-2 text-xs font-mono text-pixel-dark placeholder-slate-400 focus:outline-none focus:bg-[#fefce8]"
            />
            <PixelButton
              type="submit"
              variant="yellow"
              size="md"
            >
              SCAN [→]
            </PixelButton>
          </form>

          {/* Attribution Notice */}
          <div className="p-3 bg-[#f8fafc] border-2 border-pixel-dark shadow-pixel-sm font-mono text-xs text-slate-700">
            <span className="font-pixel text-[8px] uppercase text-pixel-dark block mb-0.5">
              ATTRIBUTION NOTICE
            </span>
            Matching handles across platforms indicate naming correlation. It does not constitute legal proof of identical ownership. No private endpoints or password recovery mechanisms are touched.
          </div>
        </div>
      </PixelWindow>

      {/* Recent Username Scans */}
      <PixelWindow
        title="RECENT USERNAME INVESTIGATIONS"
        headerColor="yellow"
      >
        <div className="divide-y-2 divide-dashed divide-slate-200 font-mono text-xs">
          {scans.length === 0 ? (
            <div className="p-10 text-center text-slate-500 italic font-mono text-xs">
              No recent username investigations recorded. Launch a scan above!
            </div>
          ) : (
            scans.map((inv) => (
              <div
                key={inv.id}
                onClick={() => onOpenInvestigation(inv.id)}
                className="p-3.5 hover:bg-[#fefce8] cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="font-bold text-pixel-dark text-sm">{inv.target}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {inv.id} • {inv.findings_count} profile matches • {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={inv.status} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenInvestigation(inv.id);
                    }}
                    className="px-2.5 py-1 bg-white border border-pixel-dark shadow-pixel-sm hover:bg-[#fef08a] font-pixel text-[8px] uppercase text-pixel-dark transition-colors"
                  >
                    INSPECT [→]
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </PixelWindow>
    </div>
  );
};
