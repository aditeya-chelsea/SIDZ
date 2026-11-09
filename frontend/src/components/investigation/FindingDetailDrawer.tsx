import React from 'react';
import { Finding } from '../../types';
import { ConfidencePill } from '../layout/StatusPill';
import { PixelWindow } from '../pixel/PixelWindow';
import { PixelButton } from '../pixel/PixelButton';

interface FindingDetailDrawerProps {
  finding: Finding | null;
  onClose: () => void;
}

export const FindingDetailDrawer: React.FC<FindingDetailDrawerProps> = ({ finding, onClose }) => {
  if (!finding) return null;

  const rawJson = JSON.stringify(finding.raw_data || {}, null, 2);

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawJson);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-pixel-dark/50 backdrop-blur-xs z-50 flex justify-end">
      <div className="w-full h-full p-4 flex flex-col">
        <PixelWindow
          title="EVIDENCE TELEMETRY INSPECTOR"
          headerColor="yellow"
          onClose={onClose}
          className="h-full shadow-[6px_6px_0_#181824]"
        >
          <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-white">
            {/* Header info */}
            <div>
              <span className="font-pixel text-[8px] uppercase px-1.5 py-0.5 bg-[#fef08a] border border-pixel-dark text-pixel-dark font-bold">
                DATA ITEM
              </span>
              <h3 className="font-pixel text-xs text-pixel-dark mt-1.5 uppercase truncate">
                {finding.title}
              </h3>
            </div>

            {/* Key Attributes */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#f8fafc] border-2 border-pixel-dark shadow-pixel-sm font-mono text-xs">
              <div>
                <div className="font-pixel text-[8px] uppercase text-slate-500">CATEGORY</div>
                <div className="text-pixel-dark uppercase font-bold mt-1">{finding.category}</div>
              </div>
              <div>
                <div className="font-pixel text-[8px] uppercase text-slate-500">CONFIDENCE</div>
                <div className="mt-1">
                  <ConfidencePill confidence={finding.confidence} />
                </div>
              </div>
              <div>
                <div className="font-pixel text-[8px] uppercase text-slate-500">ENGINE</div>
                <div className="text-pixel-dark font-bold mt-1">{finding.source_tool}</div>
              </div>
              <div>
                <div className="font-pixel text-[8px] uppercase text-slate-500">DISCOVERED</div>
                <div className="text-slate-600 mt-1 text-[11px]">
                  {finding.discovered_at ? new Date(finding.discovered_at).toLocaleTimeString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Full Value */}
            <div>
              <label className="block font-pixel text-[9px] uppercase text-pixel-dark mb-1">
                DISCOVERED VALUE
              </label>
              <div className="p-3 bg-[#f1f5f9] border-2 border-pixel-dark shadow-pixel-sm text-xs font-mono text-pixel-dark break-all select-text font-bold">
                {finding.value}
              </div>
            </div>

            {/* Source URL */}
            {finding.source_url && (
              <div>
                <label className="block font-pixel text-[9px] uppercase text-pixel-dark mb-1">
                  PUBLIC ENDPOINT
                </label>
                <a
                  href={finding.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-white border-2 border-pixel-dark shadow-pixel-sm hover:bg-[#fef08a] flex items-center justify-between text-xs font-mono text-[#0284c7] font-semibold transition-colors"
                >
                  <span className="truncate">{finding.source_url}</span>
                  <span className="font-pixel text-[9px] text-pixel-dark ml-2">↗</span>
                </a>
              </div>
            )}

            {/* Raw JSON */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-pixel text-[9px] uppercase text-pixel-dark">RAW JSON OBJECT</span>
                <button
                  onClick={handleCopyRaw}
                  className="font-pixel text-[8px] px-2 py-0.5 bg-white border border-pixel-dark shadow-pixel-sm hover:bg-[#fef08a] uppercase text-pixel-dark"
                >
                  COPY JSON
                </button>
              </div>
              <pre className="p-3 bg-[#181824] border-2 border-pixel-dark shadow-pixel-sm font-mono text-[11px] text-[#86efac] overflow-x-auto max-h-56 select-text">
                {rawJson}
              </pre>
            </div>

            <div className="pt-2">
              <PixelButton onClick={onClose} variant="white" size="sm" className="w-full">
                CLOSE INSPECTOR
              </PixelButton>
            </div>
          </div>
        </PixelWindow>
      </div>
    </div>
  );
};
