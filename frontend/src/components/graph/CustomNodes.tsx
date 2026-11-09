import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Target, Globe, Radio, UserCheck, Layers } from 'lucide-react';

export const TargetNode = memo(({ data }: any) => {
  return (
    <div className="bg-white border-2 border-pixel-dark shadow-pixel min-w-[170px] select-none">
      <Handle type="target" position={Position.Top} className="!bg-[#f472b6] !w-2.5 !h-2.5 !border-2 !border-pixel-dark" />
      
      {/* Titlebar */}
      <div className="px-2 py-1 bg-[#f472b6] border-b-2 border-pixel-dark flex items-center justify-between">
        <span className="font-pixel text-[8px] uppercase tracking-wider text-pixel-dark">ROOT TARGET</span>
        <div className="flex gap-0.5">
          <span className="w-2 h-2 bg-white border border-pixel-dark text-[6px] flex items-center justify-center leading-none">_</span>
          <span className="w-2 h-2 bg-white border border-pixel-dark text-[6px] flex items-center justify-center leading-none">✕</span>
        </div>
      </div>

      <div className="p-2 text-center">
        <div className="font-mono font-bold text-xs text-pixel-dark truncate max-w-[190px]">
          {data?.label}
        </div>
        <div className="mt-1">
          <span className="font-pixel text-[8px] px-1.5 py-0.5 bg-[#fef08a] border border-pixel-dark uppercase text-pixel-dark">
            {data?.target_type || 'TARGET'}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[#f472b6] !w-2.5 !h-2.5 !border-2 !border-pixel-dark" />
    </div>
  );
});

export const ProfileNode = memo(({ data }: any) => {
  return (
    <div className="bg-white border-2 border-pixel-dark shadow-pixel-sm min-w-[150px] select-none">
      <Handle type="target" position={Position.Top} className="!bg-[#7dd3fc] !w-2 !h-2 !border border-pixel-dark" />
      
      <div className="px-2 py-0.5 bg-[#7dd3fc] border-b border-pixel-dark flex items-center justify-between">
        <span className="font-pixel text-[7px] uppercase tracking-wider text-pixel-dark">PROFILE MATCH</span>
        <span className="text-[7px] font-pixel text-pixel-dark">★</span>
      </div>

      <div className="p-2">
        <div className="font-mono font-bold text-xs text-pixel-dark truncate max-w-[180px]">
          {data?.label}
        </div>
        {data?.evidence_tool && (
          <div className="font-mono text-[9px] text-slate-500 mt-1">
            Engine: {data.evidence_tool}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[#7dd3fc] !w-2 !h-2 !border border-pixel-dark" />
    </div>
  );
});

export const DomainNode = memo(({ data }: any) => {
  return (
    <div className="bg-white border-2 border-pixel-dark shadow-pixel-sm min-w-[150px] select-none">
      <Handle type="target" position={Position.Top} className="!bg-[#fef08a] !w-2 !h-2 !border border-pixel-dark" />
      
      <div className="px-2 py-0.5 bg-[#fef08a] border-b border-pixel-dark flex items-center justify-between">
        <span className="font-pixel text-[7px] uppercase tracking-wider text-pixel-dark">DOMAIN / DNS</span>
        <span className="text-[7px] font-pixel text-pixel-dark">◈</span>
      </div>

      <div className="p-2">
        <div className="font-mono font-bold text-xs text-pixel-dark truncate max-w-[180px]">
          {data?.label}
        </div>
        {data?.evidence_tool && (
          <div className="font-mono text-[9px] text-slate-500 mt-1">
            Engine: {data.evidence_tool}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[#fef08a] !w-2 !h-2 !border border-pixel-dark" />
    </div>
  );
});

export const IpNode = memo(({ data }: any) => {
  return (
    <div className="bg-white border-2 border-pixel-dark shadow-pixel-sm min-w-[150px] select-none">
      <Handle type="target" position={Position.Top} className="!bg-[#d8b4fe] !w-2 !h-2 !border border-pixel-dark" />
      
      <div className="px-2 py-0.5 bg-[#d8b4fe] border-b border-pixel-dark flex items-center justify-between">
        <span className="font-pixel text-[7px] uppercase tracking-wider text-pixel-dark">NETWORK / IP</span>
        <span className="text-[7px] font-pixel text-pixel-dark">●</span>
      </div>

      <div className="p-2">
        <div className="font-mono font-bold text-xs text-pixel-dark truncate max-w-[180px]">
          {data?.label}
        </div>
        {data?.evidence_tool && (
          <div className="font-mono text-[9px] text-slate-500 mt-1">
            Engine: {data.evidence_tool}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[#d8b4fe] !w-2 !h-2 !border border-pixel-dark" />
    </div>
  );
});

export const GenericEntityNode = memo(({ data }: any) => {
  return (
    <div className="bg-white border-2 border-pixel-dark shadow-pixel-sm min-w-[140px] select-none">
      <Handle type="target" position={Position.Top} className="!bg-[#86efac] !w-2 !h-2 !border border-pixel-dark" />
      
      <div className="px-2 py-0.5 bg-[#86efac] border-b border-pixel-dark flex items-center justify-between">
        <span className="font-pixel text-[7px] uppercase tracking-wider text-pixel-dark">
          {data?.type || 'ENTITY'}
        </span>
        <span className="text-[7px] font-pixel text-pixel-dark">▲</span>
      </div>

      <div className="p-2">
        <div className="font-mono font-bold text-xs text-pixel-dark truncate max-w-[180px]">
          {data?.label}
        </div>
        {data?.evidence_tool && (
          <div className="font-mono text-[9px] text-slate-500 mt-1">
            Engine: {data.evidence_tool}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[#86efac] !w-2 !h-2 !border border-pixel-dark" />
    </div>
  );
});
