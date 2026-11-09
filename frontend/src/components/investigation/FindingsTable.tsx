import React, { useState } from 'react';
import { Finding } from '../../types';
import { ConfidencePill } from '../layout/StatusPill';
import { PixelWindow } from '../pixel/PixelWindow';
import { PixelButton } from '../pixel/PixelButton';

interface FindingsTableProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
}

export const FindingsTable: React.FC<FindingsTableProps> = ({ findings, onSelectFinding }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedConfidence, setSelectedConfidence] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(findings.map((f) => f.category)))];

  const filtered = findings.filter((f) => {
    if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
    if (selectedConfidence !== 'all' && f.confidence !== selectedConfidence) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        f.value.toLowerCase().includes(q) ||
        f.source_tool.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <PixelWindow
      title={`EVIDENCE DOSSIER // [${filtered.length} OF ${findings.length} FINDINGS]`}
      headerColor="yellow"
    >
      {/* Filtering Bar */}
      <div className="p-3 border-b-2 border-pixel-dark bg-[#fefce8] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="FILTER FINDINGS (TITLE, URL, TOOL)..."
            className="w-full bg-white border-2 border-pixel-dark shadow-pixel-sm px-3 py-1.5 text-xs font-mono text-pixel-dark placeholder-slate-400 focus:outline-none focus:bg-[#fefce8]"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-pixel-dark">
            <span className="font-pixel text-[9px] uppercase">TYPE:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border-2 border-pixel-dark shadow-pixel-sm px-2 py-1 text-xs font-mono text-pixel-dark focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Confidence Dropdown */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-pixel-dark">
            <span className="font-pixel text-[9px] uppercase">CONFIDENCE:</span>
            <select
              value={selectedConfidence}
              onChange={(e) => setSelectedConfidence(e.target.value)}
              className="bg-white border-2 border-pixel-dark shadow-pixel-sm px-2 py-1 text-xs font-mono text-pixel-dark focus:outline-none"
            >
              <option value="all">ALL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b-2 border-pixel-dark bg-[#f8fafc] text-pixel-dark font-pixel text-[9px]">
              <th className="py-2.5 px-3 uppercase">CATEGORY</th>
              <th className="py-2.5 px-3 uppercase">TITLE</th>
              <th className="py-2.5 px-3 uppercase">DISCOVERED VALUE</th>
              <th className="py-2.5 px-3 uppercase">CONFIDENCE</th>
              <th className="py-2.5 px-3 uppercase">ENGINE</th>
              <th className="py-2.5 px-3 uppercase text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-dashed divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 italic font-mono text-xs">
                  No findings match the current filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectFinding(item)}
                  className="hover:bg-[#fefce8] cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 font-pixel text-[8px] uppercase bg-[#bae6fd] border border-pixel-dark text-pixel-dark shadow-pixel-sm">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-pixel-dark max-w-xs truncate">
                    {item.title}
                  </td>
                  <td className="py-2.5 px-3 text-slate-800 max-w-md truncate">
                    {item.source_url ? (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#0284c7] hover:underline font-semibold"
                      >
                        {item.value} ↗
                      </a>
                    ) : (
                      <span>{item.value}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <ConfidencePill confidence={item.confidence} />
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                    {item.source_tool}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={(e) => handleCopy(item.id, item.value, e)}
                      className="px-2 py-1 bg-white border border-pixel-dark shadow-pixel-sm hover:bg-[#fef08a] font-pixel text-[8px] uppercase text-pixel-dark transition-colors"
                    >
                      {copiedId === item.id ? 'COPIED!' : 'COPY'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-2.5 border-t-2 border-pixel-dark bg-[#f8fafc] text-[10px] font-mono text-slate-600 flex justify-between items-center px-4">
        <span>Displaying {filtered.length} of {findings.length} findings</span>
        <span className="font-pixel text-[8px] uppercase text-slate-500">CLICK ANY ROW FOR JSON DETAILS</span>
      </div>
    </PixelWindow>
  );
};
