import React, { useState, useEffect } from 'react';
import { Investigation } from '../types';
import { api } from '../api/client';
import { StatusPill } from '../components/layout/StatusPill';
import { PixelWindow } from '../components/pixel/PixelWindow';
import { PixelButton } from '../components/pixel/PixelButton';
import { PixelSmiley, PixelHeart, PixelSparkle } from '../components/pixel/PixelStickers';

interface DomainReconPageProps {
  onStartNewScan: (initialTarget?: string, initialType?: any) => void;
  onOpenInvestigation: (id: string) => void;
}

export const DomainReconPage: React.FC<DomainReconPageProps> = ({
  onStartNewScan,
  onOpenInvestigation,
}) => {
  const [domainInput, setDomainInput] = useState('');
  const [scans, setScans] = useState<Investigation[]>([]);

  useEffect(() => {
    api.listInvestigations({ target_type: 'domain', limit: 10 }).then(setScans).catch(() => {});
  }, []);

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;
    onStartNewScan(domainInput.trim(), 'domain');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Module Banner in Pixel Window */}
      <PixelWindow
        title="MODULE 03 // DOMAIN RECONNAISSANCE"
        headerColor="yellow"
        icon={<PixelSmiley type="cool" size={16} />}
      >
        <div className="p-5 space-y-4 bg-white">
          <div className="space-y-1">
            <h1 className="font-pixel text-sm sm:text-base text-pixel-dark uppercase">
              DOMAIN & SUBDOMAIN INFRASTRUCTURE RECON
            </h1>
            <p className="font-mono text-xs text-slate-600 max-w-2xl leading-relaxed">
              Harvests authoritative WHOIS registration data, DNS records (A, AAAA, MX, NS, TXT, SOA), Certificate Transparency logs via crt.sh, OWASP Amass active enumeration, and server security headers.
            </p>
          </div>

          {/* Input Launcher */}
          <form onSubmit={handleLaunch} className="flex flex-col sm:flex-row gap-2 max-w-xl">
            <input
              type="text"
              required
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="ENTER DOMAIN (E.G. CLOUDFLARE.COM OR GITHUB.COM)..."
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

          {/* Scope notice */}
          <div className="p-3 bg-[#f8fafc] border-2 border-pixel-dark shadow-pixel-sm font-mono text-xs text-slate-700">
            <span className="font-pixel text-[8px] uppercase text-pixel-dark block mb-0.5">
              PASSIVE SCOPE
            </span>
            Includes Certificate Transparency log records, root zone nameservers, RFC 1035 zone delegations, and HTTP response fingerprints.
          </div>
        </div>
      </PixelWindow>

      {/* Recent Domain Scans */}
      <PixelWindow
        title="RECENT DOMAIN INVESTIGATIONS"
        headerColor="cyan"
      >
        <div className="divide-y-2 divide-dashed divide-slate-200 font-mono text-xs">
          {scans.length === 0 ? (
            <div className="p-10 text-center text-slate-500 italic font-mono text-xs">
              No recent domain investigations recorded. Launch a scan above!
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
                    {inv.id} • {inv.findings_count} records mapped • {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'N/A'}
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
