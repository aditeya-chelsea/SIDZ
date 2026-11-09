import React, { useState, useEffect } from 'react';
import { Investigation } from '../types';
import { api } from '../api/client';
import { RelationshipGraph } from '../components/graph/RelationshipGraph';
import { PixelWindow } from '../components/pixel/PixelWindow';
import { PixelSmiley, PixelHeart, PixelSparkle } from '../components/pixel/PixelStickers';

interface RelationshipGraphPageProps {
  onOpenInvestigation: (id: string) => void;
}

export const RelationshipGraphPage: React.FC<RelationshipGraphPageProps> = ({
  onOpenInvestigation,
}) => {
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
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto flex flex-col h-full">
      {/* Header with Selector */}
      <PixelWindow
        title="TOPOLOGICAL GRAPH // ENTITY RELATIONSHIPS"
        headerColor="cyan"
        icon={<PixelSmiley type="cool" size={16} />}
        headerAction={
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="font-pixel text-[8px] uppercase text-pixel-dark">SELECT DOSSIER:</span>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-white border-2 border-pixel-dark shadow-pixel-sm px-2.5 py-1 text-xs font-mono text-pixel-dark focus:outline-none"
            >
              {investigations.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.id} - {inv.target} ({inv.target_type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        }
      >
        <div className="p-3 bg-[#f8fafc] border-b-2 border-pixel-dark font-mono text-xs text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[8px] uppercase px-1.5 py-0.5 bg-[#fef08a] border border-pixel-dark text-pixel-dark">
              REACT FLOW
            </span>
            <span>Interactive graph with draggable nodes, zoom & provenance tags</span>
          </div>
          {activeInv && (
            <button
              onClick={() => onOpenInvestigation(activeInv.id)}
              className="font-pixel text-[8px] px-2 py-0.5 bg-white border border-pixel-dark shadow-pixel-sm hover:bg-[#fef08a] uppercase text-pixel-dark"
            >
              VIEW DOSSIER [→]
            </button>
          )}
        </div>

        {/* Graph Area */}
        <div className="h-[650px] bg-[#fdf2f8]">
          {selectedId ? (
            <RelationshipGraph investigationId={selectedId} />
          ) : (
            <div className="p-16 text-center text-slate-500 font-pixel text-xs">
              NO INVESTIGATIONS AVAILABLE. LAUNCH A SCAN FIRST!
            </div>
          )}
        </div>
      </PixelWindow>
    </div>
  );
};
