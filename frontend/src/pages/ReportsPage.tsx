import React, { useState, useEffect } from 'react';
import { Investigation } from '../types';
import { api } from '../api/client';
import { StatusPill } from '../components/layout/StatusPill';
import { PixelWindow } from '../components/pixel/PixelWindow';
import { PixelButton } from '../components/pixel/PixelButton';
import { PixelSmiley, PixelHeart, PixelSparkle } from '../components/pixel/PixelStickers';

export const ReportsPage: React.FC = () => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    api.listInvestigations({ limit: 50 }).then((data) => {
      setInvestigations(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    }).catch(() => {});
  }, []);

  const activeInv = investigations.find((i) => i.id === selectedId);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header in Pixel Window */}
      <PixelWindow
        title="REPORTS & DOSSIER EXPORTS"
        headerColor="purple"
        icon={<PixelSmiley type="cool" size={16} />}
        headerAction={
          selectedId ? (
            <div className="flex items-center gap-2">
              <a
                href={api.getHtmlReportUrl(selectedId)}
                target="_blank"
                rel="noreferrer"
                className="pixel-btn bg-[#fef08a] text-pixel-dark font-pixel text-[8px] uppercase px-2.5 py-1 inline-flex items-center gap-1 font-bold"
              >
                OPEN HTML ↗
              </a>
              <a
                href={api.getJsonReportUrl(selectedId)}
                download
                className="pixel-btn bg-[#86efac] text-pixel-dark font-pixel text-[8px] uppercase px-2.5 py-1 inline-flex items-center gap-1 font-bold"
              >
                DOWNLOAD JSON ↓
              </a>
            </div>
          ) : undefined
        }
      >
        <div className="p-4 bg-white">
          <h1 className="font-pixel text-sm text-pixel-dark uppercase">
            DEFENSIVE INTELLIGENCE DOSSIER EXPORTS
          </h1>
          <p className="font-mono text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Generate standardized, legally compliant OSINT intelligence dossiers in standalone HTML, print-ready PDF format, or raw JSON telemetry.
          </p>
        </div>
      </PixelWindow>

      {/* Selector & Preview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Investigation Dossier Picker */}
        <PixelWindow
          title="SELECT DOSSIER"
          headerColor="yellow"
        >
          <div className="p-3 space-y-2 max-h-[550px] overflow-y-auto bg-white">
            {investigations.map((inv) => (
              <div
                key={inv.id}
                onClick={() => setSelectedId(inv.id)}
                className={`p-3 border-2 border-pixel-dark cursor-pointer font-mono text-xs transition-all ${
                  selectedId === inv.id
                    ? 'bg-[#fef08a] shadow-pixel font-bold translate-x-1'
                    : 'bg-white shadow-pixel-sm hover:bg-[#f8fafc]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-pixel text-[8px] text-pixel-dark">{inv.id}</span>
                  <StatusPill status={inv.status} />
                </div>
                <div className="truncate font-bold text-pixel-dark text-sm">{inv.target}</div>
                <div className="text-[10px] text-slate-600 mt-1 flex justify-between font-mono">
                  <span className="uppercase">{inv.target_type}</span>
                  <span>{inv.findings_count} findings</span>
                </div>
              </div>
            ))}
          </div>
        </PixelWindow>

        {/* Right: Report Live Frame Preview */}
        <div className="lg:col-span-2">
          <PixelWindow
            title={`REPORT PREVIEW // ${selectedId || 'SELECT DOSSIER'}`}
            headerColor="pink"
            className="h-[600px]"
          >
            {selectedId ? (
              <iframe
                src={api.getHtmlReportUrl(selectedId)}
                title="Report Preview"
                className="w-full h-[550px] border-0 bg-white"
              />
            ) : (
              <div className="h-[550px] flex items-center justify-center p-8 text-center text-slate-500 font-pixel text-xs">
                SELECT A DOSSIER FROM THE LEFT MENU TO PREVIEW REPORT
              </div>
            )}
          </PixelWindow>
        </div>
      </div>
    </div>
  );
};
