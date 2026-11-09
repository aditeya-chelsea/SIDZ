import React from 'react';
import { ScanStatus, ConfidenceLevel } from '../../types';

export const StatusPill: React.FC<{ status: ScanStatus | string }> = ({ status }) => {
  const s = status.toLowerCase();
  let color = 'bg-white text-pixel-dark';

  if (s === 'completed') {
    color = 'bg-[#86efac] text-pixel-dark';
  } else if (s === 'running') {
    color = 'bg-[#fef08a] text-pixel-dark animate-pulse';
  } else if (s === 'failed') {
    color = 'bg-[#fda4af] text-pixel-dark';
  } else if (s === 'queued') {
    color = 'bg-[#d8b4fe] text-pixel-dark';
  } else if (s === 'cancelled') {
    color = 'bg-[#e2e8f0] text-slate-700';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 border-2 border-pixel-dark shadow-pixel-sm text-[9px] font-pixel font-bold uppercase tracking-wider ${color}`}>
      {s === 'running' && (
        <span className="w-1.5 h-1.5 bg-black inline-block animate-ping" />
      )}
      {status.toUpperCase()}
    </span>
  );
};

export const ConfidencePill: React.FC<{ confidence: ConfidenceLevel | string }> = ({ confidence }) => {
  const c = confidence.toUpperCase();
  let style = 'bg-white text-pixel-dark';

  if (c === 'HIGH') {
    style = 'bg-[#86efac] text-pixel-dark';
  } else if (c === 'MEDIUM' || c === 'MED') {
    style = 'bg-[#fef08a] text-pixel-dark';
  } else if (c === 'LOW') {
    style = 'bg-[#7dd3fc] text-pixel-dark';
  }

  return (
    <span className={`px-1.5 py-0.5 border border-pixel-dark shadow-pixel-sm text-[8px] font-pixel font-bold tracking-wider ${style}`}>
      ★ {c}
    </span>
  );
};
