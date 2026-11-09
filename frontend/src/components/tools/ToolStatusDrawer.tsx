import React, { useState, useEffect } from 'react';
import { ToolInfo } from '../../types';
import { api } from '../../api/client';
import { PixelWindow } from '../pixel/PixelWindow';
import { PixelButton } from '../pixel/PixelButton';
import { PixelSmiley, PixelHeart, PixelSparkle } from '../pixel/PixelStickers';

interface ToolStatusDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ToolStatusDrawer: React.FC<ToolStatusDrawerProps> = ({ isOpen, onClose }) => {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const data = await api.getTools();
      setTools(data);
    } catch (e) {
      console.error('Failed to load tool status', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTools();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  const installedCount = tools.filter((t) => t.installed).length;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-pixel-dark/50 backdrop-blur-xs z-50 flex justify-end">
      <div className="w-full h-full p-4 flex flex-col">
        <PixelWindow
          title="CLI TOOL ARSENAL // STATUS"
          headerColor="green"
          onClose={onClose}
          icon={<PixelSmiley type="cool" size={16} />}
          className="h-full shadow-[6px_6px_0_#181824]"
          headerAction={
            <button
              onClick={fetchTools}
              className="font-pixel text-[8px] px-2 py-0.5 bg-white border border-pixel-dark uppercase hover:bg-[#fef08a] text-pixel-dark"
            >
              {loading ? 'CHECKING...' : 'REFRESH'}
            </button>
          }
        >
          {/* Header count notice */}
          <div className="p-3 bg-[#f8fafc] border-b-2 border-pixel-dark font-mono text-xs flex items-center justify-between">
            <span className="font-pixel text-[9px] text-pixel-dark uppercase">
              INSTALLED: {installedCount} / {tools.length} TOOLS
            </span>
            <span className="font-pixel text-[8px] px-2 py-0.5 bg-[#bbf7d0] border border-pixel-dark text-pixel-dark">
              ALL ENGINES LIVE
            </span>
          </div>

          {/* Tools List */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-white">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className={`p-3 border-2 border-pixel-dark shadow-pixel-sm ${
                  tool.installed ? 'bg-[#f0fdf4]' : 'bg-[#fffbeb]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-xs text-pixel-dark uppercase">{tool.name}</span>
                      <span className="font-pixel text-[8px] px-1.5 py-0.5 bg-white border border-pixel-dark text-slate-600 uppercase">
                        {tool.category}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-slate-600 mt-1 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  {tool.installed ? (
                    <span className="flex-shrink-0 font-pixel text-[8px] px-2 py-1 bg-[#86efac] border border-pixel-dark text-pixel-dark uppercase shadow-pixel-sm">
                      INSTALLED ✓
                    </span>
                  ) : (
                    <span className="flex-shrink-0 font-pixel text-[8px] px-2 py-1 bg-[#fef08a] border border-pixel-dark text-pixel-dark uppercase shadow-pixel-sm">
                      OPTIONAL
                    </span>
                  )}
                </div>

                {/* Path & Version */}
                {tool.installed && (
                  <div className="mt-2.5 p-2 bg-white border border-pixel-dark font-mono text-[11px] text-slate-700">
                    <div>Path: <span className="text-pixel-dark font-bold">{tool.executable_path}</span></div>
                    {tool.version && (
                      <div className="text-emerald-700 font-bold mt-0.5">Version: {tool.version}</div>
                    )}
                  </div>
                )}

                {/* Install Command */}
                {!tool.installed && (
                  <div className="mt-2.5">
                    <div className="font-pixel text-[8px] uppercase text-slate-500 mb-1">
                      INSTALL COMMAND
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white border border-pixel-dark font-mono text-[11px] text-pixel-dark">
                      <span className="truncate">{tool.install_command}</span>
                      <button
                        onClick={() => handleCopy(tool.install_command)}
                        className="ml-2 px-2 py-0.5 bg-[#fef08a] border border-pixel-dark font-pixel text-[8px] uppercase text-pixel-dark flex-shrink-0"
                      >
                        {copiedCmd === tool.install_command ? 'COPIED!' : 'COPY'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </PixelWindow>
      </div>
    </div>
  );
};
