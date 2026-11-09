import React, { useState, useEffect } from 'react';
import { Investigation, TargetType } from '../types';
import { api } from '../api/client';
import { StatusPill } from '../components/layout/StatusPill';
import { PixelWindow } from '../components/pixel/PixelWindow';
import { PixelButton } from '../components/pixel/PixelButton';
import { PixelSmiley, PixelHeart, PixelSparkle } from '../components/pixel/PixelStickers';

interface InvestigationsPageProps {
  onOpenInvestigation: (id: string) => void;
  onStartNewScan: (initialTarget?: string, initialType?: TargetType) => void;
}

export const InvestigationsPage: React.FC<InvestigationsPageProps> = ({
  onOpenInvestigation,
  onStartNewScan,
}) => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.listInvestigations({ limit: 100 });
      setInvestigations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to permanently delete investigation ${id}?`)) return;
    try {
      await api.deleteInvestigation(id);
      setInvestigations((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = investigations.filter((inv) => {
    if (targetTypeFilter !== 'all' && inv.target_type !== targetTypeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        inv.id.toLowerCase().includes(q) ||
        inv.target.toLowerCase().includes(q) ||
        inv.title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header Bar in Pixel Window */}
      <PixelWindow
        title="REPOSITORY // INVESTIGATION ARCHIVES"
        headerColor="purple"
        icon={<PixelSmiley type="cool" size={16} />}
        headerAction={
          <div className="flex items-center gap-2">
            <PixelButton
              onClick={loadData}
              variant="white"
              size="sm"
            >
              {loading ? 'SYNCING...' : 'REFRESH'}
            </PixelButton>
            <PixelButton
              onClick={() => onStartNewScan()}
              variant="yellow"
              size="sm"
            >
              + NEW SCAN
            </PixelButton>
          </div>
        }
      >
        {/* Filter Toolbar */}
        <div className="p-3 border-b-2 border-pixel-dark bg-[#f8fafc] flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH BY ID, TARGET OR TITLE..."
              className="w-full bg-white border-2 border-pixel-dark shadow-pixel-sm px-3 py-1.5 text-xs font-mono text-pixel-dark placeholder-slate-400 focus:outline-none focus:bg-[#fefce8]"
            />
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-pixel-dark">
            <span className="font-pixel text-[9px] uppercase">FILTER TYPE:</span>
            <select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              className="bg-white border-2 border-pixel-dark shadow-pixel-sm px-2.5 py-1 text-xs font-mono text-pixel-dark focus:outline-none"
            >
              <option value="all">ALL ENTITIES</option>
              <option value="username">USERNAMES</option>
              <option value="email">EMAILS</option>
              <option value="domain">DOMAINS</option>
              <option value="ip">IP ADDRESSES</option>
            </select>
          </div>
        </div>

        {/* Investigations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b-2 border-pixel-dark bg-[#f1f5f9] text-pixel-dark font-pixel text-[9px]">
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 italic font-mono text-xs">
                    No investigations match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onOpenInvestigation(inv.id)}
                    className="hover:bg-[#fefce8] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-pixel-dark flex items-center gap-1.5">
                      <span>{inv.id}</span>
                      {inv.is_demo && (
                        <span className="px-1.5 py-0.2 font-pixel text-[7px] bg-[#d8b4fe] text-pixel-dark border border-pixel-dark uppercase">
                          DEMO
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-pixel-dark">
                      <div>{inv.target}</div>
                      {inv.title && inv.title !== inv.target && (
                        <div className="text-[11px] text-slate-500 font-mono font-normal">{inv.title}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 font-pixel text-[8px] bg-[#bae6fd] border border-pixel-dark text-pixel-dark uppercase shadow-pixel-sm">
                        {inv.target_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusPill status={inv.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-700">{inv.findings_count} points</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {inv.created_at ? new Date(inv.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenInvestigation(inv.id)}
                          className="px-2.5 py-1 bg-white border border-pixel-dark shadow-pixel-sm hover:bg-[#fef08a] font-pixel text-[8px] uppercase text-pixel-dark transition-colors"
                        >
                          OPEN [→]
                        </button>
                        <button
                          onClick={(e) => handleDelete(inv.id, e)}
                          className="px-2 py-1 bg-[#fee2e2] border border-pixel-dark shadow-pixel-sm hover:bg-[#fecaca] font-pixel text-[8px] uppercase text-red-700 transition-colors"
                          title="Delete dossier"
                        >
                          DEL
                        </button>
                      </div>
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
