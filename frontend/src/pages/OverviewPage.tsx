import React, { useState, useEffect } from 'react';
import { Investigation, SystemOverview } from '../types';
import { api } from '../api/client';
import { StatusPill } from '../components/layout/StatusPill';
import { PixelWindow } from '../components/pixel/PixelWindow';
import { PixelButton } from '../components/pixel/PixelButton';
import { PixelHeart, PixelSparkle, PixelSmiley, PixelSpeechBubble } from '../components/pixel/PixelStickers';

interface OverviewPageProps {
  onOpenInvestigation: (id: string) => void;
  onStartNewScan: (initialTarget?: string, initialType?: any) => void;
  onSelectTab: (tab: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onOpenInvestigation,
  onStartNewScan,
  onSelectTab,
}) => {
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [recentInvs, setRecentInvs] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [ovData, invData] = await Promise.all([
        api.getOverview(),
        api.listInvestigations({ limit: 6 }),
      ]);
      setOverview(ovData);
      setRecentInvs(invData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner styled like retro system window */}
      <PixelWindow
        title="TRACE // OSINT TERMINAL v2.0"
        headerColor="pink"
        icon={<PixelSmiley type="cool" size={18} />}
        className="shadow-pixel"
      >
        <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-pixel text-[8px] px-2 py-0.5 bg-[#fef08a] border border-pixel-dark text-pixel-dark uppercase font-bold">
                LOCAL-FIRST PLATFORM
              </span>
              <span className="font-pixel text-[8px] px-2 py-0.5 bg-[#86efac] border border-pixel-dark text-pixel-dark uppercase font-bold">
                127.0.0.1:8000
              </span>
              <PixelSpeechBubble text="READY" variant="green" />
            </div>

            <h1 className="font-pixel text-base sm:text-lg text-pixel-dark tracking-wide uppercase">
              SIDZ OSINT // DIGITAL FOOTPRINT CORRELATION
            </h1>

            <p className="font-mono text-xs text-slate-600 max-w-2xl leading-relaxed">
              Passive digital footprint correlation using legitimate OSINT sources and locally installed utilities (Sherlock, Maigret, theHarvester, WHOIS, Dig, OWASP Amass). RFC-compliant, zero credential probing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            <PixelButton
              onClick={() => onStartNewScan()}
              variant="yellow"
              size="lg"
              className="w-full sm:w-auto shadow-pixel"
            >
              ★ START SCAN
            </PixelButton>
          </div>
        </div>
      </PixelWindow>

      {/* Metric Stat Cards as Chunky 8-Bit Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Scans */}
        <div className="bg-[#fbcfe8] border-2 border-pixel-dark shadow-pixel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[9px] uppercase tracking-wider text-pixel-dark">TOTAL SCANS</span>
            <PixelHeart size={14} color="#db2777" />
          </div>
          <div className="my-2">
            <div className="font-pixel text-2xl text-pixel-dark font-bold">
              {overview?.total_investigations ?? 0}
            </div>
          </div>
          <div className="font-mono text-[10px] text-slate-700">Dossiers archived</div>
        </div>

        {/* Active Recon Tasks */}
        <div className="bg-[#bae6fd] border-2 border-pixel-dark shadow-pixel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[9px] uppercase tracking-wider text-pixel-dark">ACTIVE SCANS</span>
            <PixelSparkle size={14} color="#0284c7" />
          </div>
          <div className="my-2">
            <div className="font-pixel text-2xl text-pixel-dark font-bold">
              {overview?.active_investigations ?? 0}
            </div>
          </div>
          <div className="font-mono text-[10px] text-slate-700">Live async engines</div>
        </div>

        {/* Telemetry Findings */}
        <div className="bg-[#bbf7d0] border-2 border-pixel-dark shadow-pixel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[9px] uppercase tracking-wider text-pixel-dark">FINDINGS</span>
            <span className="font-pixel text-xs text-emerald-800">⚡</span>
          </div>
          <div className="my-2">
            <div className="font-pixel text-2xl text-pixel-dark font-bold">
              {overview?.total_findings ?? 0}
            </div>
          </div>
          <div className="font-mono text-[10px] text-slate-700">Correlated points</div>
        </div>

        {/* Completed Audits */}
        <div className="bg-[#e9d5ff] border-2 border-pixel-dark shadow-pixel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[9px] uppercase tracking-wider text-pixel-dark">AUDITED</span>
            <PixelSmiley type="happy" size={14} />
          </div>
          <div className="my-2">
            <div className="font-pixel text-2xl text-pixel-dark font-bold">
              {overview?.completed_investigations ?? 0}
            </div>
          </div>
          <div className="font-mono text-[10px] text-slate-700">Ready for report export</div>
        </div>
      </div>

      {/* Reconnaissance Modules Quick Launch */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="font-pixel text-[10px] uppercase text-pixel-dark tracking-wider flex items-center gap-2">
            <span>INVESTIGATION MODULES</span>
            <PixelSparkle size={12} />
          </div>
          <span className="font-mono text-[11px] text-slate-600">Click to launch dedicated recon workspace</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Username Recon */}
          <div
            onClick={() => onSelectTab('username')}
            className="bg-white border-2 border-pixel-dark shadow-pixel hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#181824] transition-all cursor-pointer flex flex-col justify-between p-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-pixel text-[8px] px-2 py-0.5 bg-[#fef08a] border border-pixel-dark text-pixel-dark uppercase">
                  MOD 01
                </span>
                <span className="font-pixel text-xs text-pixel-dark">→</span>
              </div>
              <div className="font-pixel text-xs text-pixel-dark uppercase mb-1">USERNAME RECON</div>
              <p className="font-mono text-[11px] text-slate-600">
                118+ social platforms hunt with Sherlock & Maigret subprocesses.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-dashed border-slate-300 font-mono text-[10px] text-slate-500">
              Sherlock • Maigret • 118+ Sites
            </div>
          </div>

          {/* Email Intelligence */}
          <div
            onClick={() => onSelectTab('email')}
            className="bg-white border-2 border-pixel-dark shadow-pixel hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#181824] transition-all cursor-pointer flex flex-col justify-between p-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-pixel text-[8px] px-2 py-0.5 bg-[#86efac] border border-pixel-dark text-pixel-dark uppercase">
                  MOD 02
                </span>
                <span className="font-pixel text-xs text-pixel-dark">→</span>
              </div>
              <div className="font-pixel text-xs text-pixel-dark uppercase mb-1">EMAIL INTELLIGENCE</div>
              <p className="font-mono text-[11px] text-slate-600">
                MX verification, Gravatar profiles, GitHub public commits, HIBP.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-dashed border-slate-300 font-mono text-[10px] text-slate-500">
              theHarvester • MX • HIBP • PGP
            </div>
          </div>

          {/* Domain Recon */}
          <div
            onClick={() => onSelectTab('domain')}
            className="bg-white border-2 border-pixel-dark shadow-pixel hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#181824] transition-all cursor-pointer flex flex-col justify-between p-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-pixel text-[8px] px-2 py-0.5 bg-[#7dd3fc] border border-pixel-dark text-pixel-dark uppercase">
                  MOD 03
                </span>
                <span className="font-pixel text-xs text-pixel-dark">→</span>
              </div>
              <div className="font-pixel text-xs text-pixel-dark uppercase mb-1">DOMAIN RECON</div>
              <p className="font-mono text-[11px] text-slate-600">
                WHOIS, DNS records (A, MX, TXT), Certificate Transparency & Amass.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-dashed border-slate-300 font-mono text-[10px] text-slate-500">
              Amass • WHOIS • Dig • crt.sh
            </div>
          </div>

          {/* IP Intelligence */}
          <div
            onClick={() => onSelectTab('ip')}
            className="bg-white border-2 border-pixel-dark shadow-pixel hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#181824] transition-all cursor-pointer flex flex-col justify-between p-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-pixel text-[8px] px-2 py-0.5 bg-[#d8b4fe] border border-pixel-dark text-pixel-dark uppercase">
                  MOD 04
                </span>
                <span className="font-pixel text-xs text-pixel-dark">→</span>
              </div>
              <div className="font-pixel text-xs text-pixel-dark uppercase mb-1">IP INTELLIGENCE</div>
              <p className="font-mono text-[11px] text-slate-600">
                ASN routing, ISP allocation, reverse DNS PTR & regional RDAP registries.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-dashed border-slate-300 font-mono text-[10px] text-slate-500">
              RDAP • Reverse DNS • GeoIP
            </div>
          </div>
        </div>
      </div>

      {/* Recent Investigations Window */}
      <PixelWindow
        title="RECENT DOSSIERS"
        headerColor="purple"
        headerAction={
          <button
            onClick={() => onSelectTab('investigations')}
            className="font-pixel text-[8px] text-pixel-dark hover:underline uppercase"
          >
            VIEW ALL [→]
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b-2 border-pixel-dark bg-[#f8fafc] text-pixel-dark font-pixel text-[9px]">
                <th className="py-2.5 px-4 uppercase">ID</th>
                <th className="py-2.5 px-4 uppercase">TARGET ENTITY</th>
                <th className="py-2.5 px-4 uppercase">TYPE</th>
                <th className="py-2.5 px-4 uppercase">STATUS</th>
                <th className="py-2.5 px-4 uppercase">FINDINGS</th>
                <th className="py-2.5 px-4 uppercase">TIMESTAMP</th>
                <th className="py-2.5 px-4 uppercase text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-dashed divide-slate-200">
              {recentInvs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 italic font-mono text-xs">
                    No investigations yet. Launch a new scan or search above!
                  </td>
                </tr>
              ) : (
                recentInvs.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onOpenInvestigation(inv.id)}
                    className="hover:bg-[#fefce8] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono font-bold text-pixel-dark">{inv.id}</td>
                    <td className="py-2.5 px-4 font-bold text-pixel-dark">
                      {inv.target}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 font-pixel text-[8px] bg-[#bae6fd] border border-pixel-dark text-pixel-dark uppercase shadow-pixel-sm">
                        {inv.target_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusPill status={inv.status} />
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">{inv.findings_count} items</td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                      {inv.created_at ? new Date(inv.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenInvestigation(inv.id);
                        }}
                        className="px-2.5 py-1 bg-white border border-pixel-dark shadow-pixel-sm hover:bg-[#fef08a] font-pixel text-[8px] uppercase text-pixel-dark transition-colors"
                      >
                        INSPECT [→]
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PixelWindow>
    </div>
  );
};
