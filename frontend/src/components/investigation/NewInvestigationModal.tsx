import React, { useState, useEffect } from 'react';
import { TargetType } from '../../types';
import { api } from '../../api/client';
import { PixelWindow } from '../pixel/PixelWindow';
import { PixelButton } from '../pixel/PixelButton';
import { PixelHeart, PixelSparkle, PixelSmiley } from '../pixel/PixelStickers';

interface NewInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvestigationCreated: (id: string) => void;
  initialTarget?: string;
  initialType?: TargetType;
}

export const NewInvestigationModal: React.FC<NewInvestigationModalProps> = ({
  isOpen,
  onClose,
  onInvestigationCreated,
  initialTarget = '',
  initialType,
}) => {
  const [target, setTarget] = useState(initialTarget);
  const [targetType, setTargetType] = useState<string>(initialType || 'auto');
  const [title, setTitle] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTarget) {
      setTarget(initialTarget);
    }
    if (initialType) {
      setTargetType(initialType);
    }
  }, [initialTarget, initialType]);

  if (!isOpen) return null;

  // Auto-detect type helper
  const detectTypeHint = (val: string): TargetType => {
    const clean = val.trim();
    if (clean.includes('@')) return 'email';
    if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(clean)) return 'ip';
    if (clean.includes('.') && !clean.includes(' ')) return 'domain';
    return 'username';
  };

  const effectiveType = targetType === 'auto' ? detectTypeHint(target) : (targetType as TargetType);
  const isPersonalIdentifier = effectiveType === 'email';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim()) {
      setError('Please provide a valid target (username, email, domain, or IP).');
      return;
    }

    if (isPersonalIdentifier && !authorized) {
      setError('You must confirm authorized defensive assessment for email targets.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await api.createInvestigation({
        target: target.trim(),
        target_type: targetType === 'auto' ? undefined : targetType,
        title: title.trim() || undefined,
        authorized_by_user: authorized,
      });

      onInvestigationCreated(created.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate investigation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pixel-dark/60 backdrop-blur-xs animate-in fade-in">
      <div className="max-w-lg w-full">
        <PixelWindow
          title="START INVESTIGATION?"
          headerColor="yellow"
          onClose={onClose}
          icon={<PixelSmiley type="cool" size={18} />}
          className="shadow-[6px_6px_0_#181824]"
        >
          <div className="p-5 space-y-4">
            {/* Retro Subheading */}
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#cbd5e1] pb-3">
              <div>
                <div className="font-pixel text-xs text-pixel-dark flex items-center gap-1.5 uppercase">
                  <span>DEPLOY LOCAL AGENTS</span>
                  <PixelSparkle size={12} />
                </div>
                <div className="font-mono text-[11px] text-slate-600 mt-0.5">
                  100% passive RFC queries & CLI tool execution
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="font-pixel text-[9px] px-2 py-1 bg-[#d8b4fe] border border-pixel-dark shadow-pixel-sm">
                  PORT: 8000
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-[#fee2e2] border-2 border-pixel-dark shadow-pixel-sm flex items-start gap-2.5">
                <span className="font-pixel text-xs text-red-600">▲</span>
                <div>
                  <div className="font-pixel text-[9px] text-red-700 uppercase">ERROR ALERT</div>
                  <div className="font-mono text-xs text-red-900 mt-0.5">{error}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-pixel text-[10px] uppercase text-pixel-dark mb-1.5">
                  TARGET ENTITY *
                </label>
                <input
                  type="text"
                  required
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g. aditeya, user@domain.com, example.com, 8.8.8.8"
                  className="w-full bg-white border-2 border-pixel-dark shadow-pixel-sm px-3 py-2 text-xs font-mono text-pixel-dark placeholder-slate-400 focus:outline-none focus:bg-[#fefce8]"
                />
                {target && (
                  <div className="mt-1.5 font-mono text-[11px] text-slate-600 flex items-center gap-1.5">
                    <span>Target Classified:</span>
                    <span className="font-pixel text-[9px] px-1.5 py-0.5 bg-[#7dd3fc] border border-pixel-dark uppercase text-pixel-dark">
                      {effectiveType}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-pixel text-[10px] uppercase text-pixel-dark mb-1.5">
                    FORCE TYPE
                  </label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    className="w-full bg-white border-2 border-pixel-dark shadow-pixel-sm px-3 py-2 text-xs font-mono text-pixel-dark focus:outline-none"
                  >
                    <option value="auto">Auto Detect</option>
                    <option value="username">Username</option>
                    <option value="email">Email Address</option>
                    <option value="domain">Domain / Host</option>
                    <option value="ip">IP Address</option>
                  </select>
                </div>

                <div>
                  <label className="block font-pixel text-[10px] uppercase text-pixel-dark mb-1.5">
                    ALIAS / DOSSIER TITLE
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Optional label..."
                    className="w-full bg-white border-2 border-pixel-dark shadow-pixel-sm px-3 py-2 text-xs font-mono text-pixel-dark placeholder-slate-400 focus:outline-none focus:bg-[#fefce8]"
                  />
                </div>
              </div>

              {/* Authorization Checkpoint */}
              <div className="p-3 bg-[#f8fafc] border-2 border-pixel-dark shadow-pixel-sm">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={authorized}
                    onChange={(e) => setAuthorized(e.target.checked)}
                    className="mt-1 w-4 h-4 border-2 border-pixel-dark accent-[#f472b6] cursor-pointer"
                  />
                  <div className="font-mono text-xs text-slate-700 leading-relaxed select-none">
                    <span className="font-pixel text-[9px] text-pixel-dark block mb-0.5 uppercase">
                      AUTHORIZATION & DEFENSIVE RULES
                    </span>
                    I confirm this investigation is for authorized security research or defensive auditing. Zero credential harvesting or private endpoint probing is permitted.
                  </div>
                </label>
              </div>

              {/* Action Buttons styled like START GAME? [YES] [NO] */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-dashed border-[#cbd5e1]">
                <PixelButton
                  type="button"
                  onClick={onClose}
                  variant="white"
                  size="md"
                >
                  CANCEL
                </PixelButton>
                <PixelButton
                  type="submit"
                  disabled={loading}
                  variant="yellow"
                  size="md"
                >
                  {loading ? 'STARTING...' : 'YES, START!'}
                </PixelButton>
              </div>
            </form>
          </div>
        </PixelWindow>
      </div>
    </div>
  );
};
