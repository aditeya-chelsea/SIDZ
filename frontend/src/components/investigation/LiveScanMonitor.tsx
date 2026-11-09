import React, { useState, useEffect, useRef } from 'react';
import { Investigation, ScanLog, Finding } from '../../types';
import { useWebSocket } from '../../hooks/useWebSocket';
import { StatusPill } from '../layout/StatusPill';
import { api } from '../../api/client';
import { PixelWindow } from '../pixel/PixelWindow';
import { PixelButton } from '../pixel/PixelButton';
import { PixelProgressBar } from '../pixel/PixelProgressBar';
import { PixelSmiley, PixelSparkle } from '../pixel/PixelStickers';

interface LiveScanMonitorProps {
  investigation: Investigation;
  onRefresh: () => void;
  onSelectFinding?: (finding: Finding) => void;
}

export const LiveScanMonitor: React.FC<LiveScanMonitorProps> = ({
  investigation,
  onRefresh,
  onSelectFinding,
}) => {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [liveFindings, setLiveFindings] = useState<Finding[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(investigation.progress);
  const [currentStage, setCurrentStage] = useState(investigation.current_stage);
  const [currentTool, setCurrentTool] = useState(investigation.current_tool);
  const [currentStatus, setCurrentStatus] = useState(investigation.status);

  const logsEndRef = useRef<HTMLDivElement | null>(null);
  const { isConnected, lastMessage } = useWebSocket(investigation.id);

  // Initial load
  useEffect(() => {
    api.getLogs(investigation.id).then(setLogs).catch(() => {});
    api.getFindings(investigation.id).then(setLiveFindings).catch(() => {});
    setCurrentProgress(investigation.progress);
    setCurrentStage(investigation.current_stage);
    setCurrentTool(investigation.current_tool);
    setCurrentStatus(investigation.status);
  }, [investigation.id]);

  // Elapsed time counter
  useEffect(() => {
    if (currentStatus !== 'running') return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStatus]);

  // WebSocket message handler
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'log') {
      setLogs((prev) => [...prev, lastMessage.data]);
    } else if (lastMessage.type === 'finding') {
      setLiveFindings((prev) => [lastMessage.data, ...prev]);
    } else if (lastMessage.type === 'progress') {
      setCurrentProgress(lastMessage.data.progress);
      setCurrentStage(lastMessage.data.stage);
      setCurrentTool(lastMessage.data.tool);
    } else if (lastMessage.type === 'status') {
      setCurrentStatus(lastMessage.data.status);
      onRefresh();
    }
  }, [lastMessage, onRefresh]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCancel = async () => {
    try {
      await api.cancelInvestigation(investigation.id);
      setCurrentStatus('cancelled');
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Top Monitor Status Bar */}
      <PixelWindow
        title={`MONITOR // ${investigation.target}`}
        headerColor="pink"
        icon={<PixelSmiley type="cool" size={16} />}
      >
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[10px] uppercase text-pixel-dark">STAGE:</span>
                <span className="font-mono text-xs font-bold text-pixel-dark bg-[#fef08a] px-2 py-0.5 border border-pixel-dark">
                  {currentStage || 'Initializing'}
                </span>
                <StatusPill status={currentStatus} />
              </div>
              <div className="font-mono text-[11px] text-slate-600 flex items-center gap-2">
                <span>Active Engine: <strong className="text-pixel-dark font-mono">{currentTool || 'Queue'}</strong></span>
                <span>•</span>
                <span>Target: <strong className="text-pixel-dark font-mono">{investigation.target}</strong></span>
                <span>•</span>
                <span>WS Socket: <strong className={isConnected ? 'text-emerald-700' : 'text-slate-500'}>{isConnected ? 'LIVE' : 'POLLING'}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-[#f8fafc] border-2 border-pixel-dark shadow-pixel-sm font-mono text-xs flex items-center gap-2">
                <span className="font-pixel text-[9px] uppercase text-slate-500">TIME:</span>
                <strong className="text-pixel-dark">{formatElapsed(elapsedSeconds)}</strong>
              </div>

              <div className="px-3 py-1.5 bg-[#d8b4fe] border-2 border-pixel-dark shadow-pixel-sm font-mono text-xs flex items-center gap-2">
                <span className="font-pixel text-[9px] uppercase text-pixel-dark">FOUND:</span>
                <strong className="text-pixel-dark">{liveFindings.length}</strong>
              </div>

              {currentStatus === 'running' && (
                <PixelButton
                  onClick={handleCancel}
                  variant="pink"
                  size="sm"
                >
                  ABORT
                </PixelButton>
              )}
            </div>
          </div>

          {/* Segmented Pixel Progress Bar */}
          <PixelProgressBar
            progress={currentProgress}
            label={`PROGRESSION: ${currentStage.toUpperCase()}`}
            totalCells={16}
          />
        </div>
      </PixelWindow>

      {/* Grid: Live Terminal Logs + Discovered Intelligence Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Terminal Log Console */}
        <PixelWindow
          title={`TERMINAL.LOG [${logs.length} EVENTS]`}
          headerColor="purple"
          className="h-[420px]"
        >
          <div className="h-[370px] p-3 overflow-y-auto font-mono text-[11px] space-y-1.5 bg-[#181824] text-slate-200 select-text">
            {logs.length === 0 ? (
              <div className="text-slate-400 italic py-10 text-center font-mono text-xs">
                Scanning engine initializing subprocesses...
              </div>
            ) : (
              logs.map((log, idx) => {
                let badgeClass = 'text-slate-400';
                if (log.level === 'SUCCESS') badgeClass = 'text-[#86efac] font-bold';
                if (log.level === 'WARN') badgeClass = 'text-[#fef08a] font-bold';
                if (log.level === 'ERROR') badgeClass = 'text-[#f43f5e] font-bold';
                if (log.level === 'INFO') badgeClass = 'text-[#7dd3fc]';

                return (
                  <div key={idx} className="leading-snug flex items-start gap-2">
                    <span className="text-slate-500 flex-shrink-0 select-none text-[10px]">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '00:00:00'}
                    </span>
                    <span className={`flex-shrink-0 font-pixel text-[9px] ${badgeClass}`}>
                      [{log.level}]
                    </span>
                    <span className="text-slate-200 break-all">{log.message}</span>
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        </PixelWindow>

        {/* Real-time Streaming Findings Stream */}
        <PixelWindow
          title={`FINDINGS.DAT [${liveFindings.length} DISCOVERED]`}
          headerColor="cyan"
          className="h-[420px]"
        >
          <div className="h-[370px] p-3 overflow-y-auto space-y-2 bg-[#f8fafc]">
            {liveFindings.length === 0 ? (
              <div className="text-slate-500 italic py-12 text-center font-mono text-xs">
                No findings discovered yet. Scanners are querying open nodes.
              </div>
            ) : (
              liveFindings.map((finding) => (
                <div
                  key={finding.id}
                  onClick={() => onSelectFinding?.(finding)}
                  className="p-2.5 bg-white border-2 border-pixel-dark shadow-pixel-sm hover:translate-x-0.5 cursor-pointer transition-transform"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-pixel text-[9px] uppercase px-1.5 py-0.5 bg-[#fef08a] border border-pixel-dark text-pixel-dark">
                      {finding.category}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      Tool: {finding.source_tool}
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold text-pixel-dark mb-0.5 truncate">
                    {finding.title}
                  </div>
                  <div className="font-mono text-[11px] text-slate-600 truncate">
                    {finding.value}
                  </div>
                </div>
              ))
            )}
          </div>
        </PixelWindow>
      </div>
    </div>
  );
};
