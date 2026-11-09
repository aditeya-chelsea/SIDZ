import React from 'react';
import { GraphNodeData } from '../../types';
import { PixelWindow } from '../pixel/PixelWindow';

interface GraphInspectorProps {
  selectedNode: { id: string; data: GraphNodeData } | null;
  onClose: () => void;
}

export const GraphInspector: React.FC<GraphInspectorProps> = ({ selectedNode, onClose }) => {
  if (!selectedNode) return null;

  const { data } = selectedNode;
  const evidenceList = data.evidence || [];

  return (
    <div className="absolute right-4 top-4 bottom-4 w-84 z-20 select-none">
      <PixelWindow
        title="NODE INSPECTOR"
        headerColor="yellow"
        onClose={onClose}
        className="h-full shadow-[4px_4px_0_#181824]"
      >
        <div className="p-4 flex-1 overflow-y-auto space-y-4 font-mono text-xs bg-white h-[calc(100%-36px)]">
          <div>
            <div className="font-pixel text-[8px] uppercase text-slate-500">IDENTIFIER</div>
            <div className="text-pixel-dark font-bold text-sm mt-0.5 break-all">{data.label}</div>
            <div className="font-pixel text-[8px] text-pixel-dark mt-1 px-1.5 py-0.5 bg-[#bae6fd] border border-pixel-dark inline-block uppercase">
              TYPE: {data.type}
            </div>
          </div>

          {data.evidence_tool && (
            <div className="p-2.5 bg-[#f8fafc] border-2 border-pixel-dark shadow-pixel-sm">
              <div className="font-pixel text-[8px] uppercase text-slate-500">PROVENANCE TOOL</div>
              <div className="text-pixel-dark font-bold mt-0.5">{data.evidence_tool}</div>
            </div>
          )}

          {/* Correlated Evidence List */}
          <div>
            <div className="font-pixel text-[8px] uppercase text-slate-500 mb-2">
              LINKED EVIDENCE ({evidenceList.length})
            </div>

            {evidenceList.length === 0 ? (
              <div className="text-slate-500 italic text-[11px] p-3 bg-[#f8fafc] border border-pixel-dark">
                No extra telemetry directly attached. Relationship confirmed via target root.
              </div>
            ) : (
              <div className="space-y-2">
                {evidenceList.map((ev, idx) => (
                  <div key={idx} className="p-2.5 bg-[#f8fafc] border border-pixel-dark space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-pixel-dark truncate">{ev.title}</span>
                      <span className="font-pixel text-[7px] px-1 py-0.5 bg-[#86efac] border border-pixel-dark text-pixel-dark">
                        {ev.confidence}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 break-all">{ev.value}</div>
                    {ev.url && (
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[#0284c7] font-semibold hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        <span>Open Source URL ↗</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PixelWindow>
    </div>
  );
};
