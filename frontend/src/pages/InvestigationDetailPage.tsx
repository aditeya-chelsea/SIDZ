import React, { useState, useEffect } from 'react';
import { Investigation, Finding, ScanLog } from '../types';
import { api } from '../api/client';
import { StatusPill } from '../components/layout/StatusPill';
import { LiveScanMonitor } from '../components/investigation/LiveScanMonitor';
import { FindingsTable } from '../components/investigation/FindingsTable';
import { FindingDetailDrawer } from '../components/investigation/FindingDetailDrawer';
import { RelationshipGraph } from '../components/graph/RelationshipGraph';
import { InvestigationAnalytics } from '../components/analytics/InvestigationAnalytics';
import { PixelWindow } from '../components/pixel/PixelWindow';
import { PixelButton } from '../components/pixel/PixelButton';
import { PixelSmiley, PixelHeart, PixelSparkle } from '../components/pixel/PixelStickers';

interface InvestigationDetailPageProps {
  investigationId: string;
  onBack: () => void;
}

export const InvestigationDetailPage: React.FC<InvestigationDetailPageProps> = ({
  investigationId,
  onBack,
}) => {
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'monitor' | 'findings' | 'graph' | 'analytics' | 'logs'>('monitor');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  const loadData = async () => {
    try {
      const [inv, f, l] = await Promise.all([
        api.getInvestigation(investigationId),
        api.getFindings(investigationId),
        api.getLogs(investigationId),
      ]);
      setInvestigation(inv);
      setFindings(f);
      setLogs(l);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      if (investigation?.status === 'running') {
        loadData();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [investigationId, investigation?.status]);

  if (loading || !investigation) {
    return (
      <div className="p-12 text-center font-pixel text-xs text-pixel-dark">
        LOADING DOSSIER {investigationId}...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto flex flex-col h-full">
      {/* Top Breadcrumb & Metadata Navigation Window */}
      <PixelWindow
        title={`DOSSIER // ${investigation.target}`}
        headerColor="pink"
        icon={<PixelSmiley type="cool" size={16} />}
        headerAction={
          <div className="flex items-center gap-2">
            <PixelButton
              onClick={onBack}
              variant="white"
              size="sm"
            >
              [←] BACK
            </PixelButton>
          </div>
        }
      >
        <div className="p-4 space-y-3 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-xs font-bold text-pixel-dark bg-[#fef08a] px-2 py-0.5 border border-pixel-dark">
                  ID: {investigation.id}
                </span>
                <StatusPill status={investigation.status} />
                {investigation.is_demo && (
                  <span className="font-pixel text-[8px] px-1.5 py-0.5 bg-[#d8b4fe] text-pixel-dark border border-pixel-dark uppercase">
                    DEMO
                  </span>
                )}
              </div>
              <h1 className="font-pixel text-sm text-pixel-dark uppercase">
                TARGET: {investigation.target}
              </h1>
            </div>

            {/* Quick Export & Actions in Pixel Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={api.getHtmlReportUrl(investigation.id)}
                target="_blank"
                rel="noreferrer"
                className="pixel-btn bg-[#fef08a] text-pixel-dark font-pixel text-[9px] uppercase px-3 py-1.5 inline-flex items-center gap-1.5 font-bold"
              >
                HTML REPORT ↗
              </a>

              <a
                href={api.getJsonReportUrl(investigation.id)}
                download
                className="pixel-btn bg-[#86efac] text-pixel-dark font-pixel text-[9px] uppercase px-3 py-1.5 inline-flex items-center gap-1.5 font-bold"
              >
                JSON EXPORT ↓
              </a>
            </div>
          </div>

          {/* Details Bar */}
          <div className="pt-3 border-t-2 border-dashed border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs text-slate-700">
            <div>
              <span className="font-pixel text-[8px] text-slate-500 uppercase block">TYPE:</span>
              <strong className="text-pixel-dark uppercase">{investigation.target_type}</strong>
            </div>
            <div>
              <span className="font-pixel text-[8px] text-slate-500 uppercase block">TIMESTAMP:</span>
              <span className="text-pixel-dark text-[11px]">
                {investigation.created_at ? new Date(investigation.created_at).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-pixel text-[8px] text-slate-500 uppercase block">DISCOVERED:</span>
              <strong className="text-pixel-dark">{findings.length} findings</strong>
            </div>
            <div>
              <span className="font-pixel text-[8px] text-slate-500 uppercase block">AUTH STATUS:</span>
              <strong className="text-emerald-700 font-pixel text-[9px] uppercase">
                {investigation.authorized_by_user ? 'CONFIRMED' : 'STANDARD'}
              </strong>
            </div>
          </div>
        </div>
      </PixelWindow>

      {/* Retro Workspace Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`pixel-btn font-pixel text-[9px] uppercase px-3 py-1.5 ${
            activeTab === 'monitor' ? 'bg-[#f472b6] text-pixel-dark' : 'bg-white text-slate-600'
          }`}
        >
          LIVE MONITOR
        </button>

        <button
          onClick={() => setActiveTab('findings')}
          className={`pixel-btn font-pixel text-[9px] uppercase px-3 py-1.5 ${
            activeTab === 'findings' ? 'bg-[#fef08a] text-pixel-dark' : 'bg-white text-slate-600'
          }`}
        >
          FINDINGS ({findings.length})
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`pixel-btn font-pixel text-[9px] uppercase px-3 py-1.5 ${
            activeTab === 'graph' ? 'bg-[#7dd3fc] text-pixel-dark' : 'bg-white text-slate-600'
          }`}
        >
          RELATIONSHIP GRAPH
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pixel-btn font-pixel text-[9px] uppercase px-3 py-1.5 ${
            activeTab === 'analytics' ? 'bg-[#d8b4fe] text-pixel-dark' : 'bg-white text-slate-600'
          }`}
        >
          ANALYTICS
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pixel-btn font-pixel text-[9px] uppercase px-3 py-1.5 ${
            activeTab === 'logs' ? 'bg-[#86efac] text-pixel-dark' : 'bg-white text-slate-600'
          }`}
        >
          RAW LOGS ({logs.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1">
        {activeTab === 'monitor' && (
          <LiveScanMonitor
            investigation={investigation}
            onRefresh={loadData}
            onSelectFinding={setSelectedFinding}
          />
        )}

        {activeTab === 'findings' && (
          <FindingsTable findings={findings} onSelectFinding={setSelectedFinding} />
        )}

        {activeTab === 'graph' && (
          <PixelWindow title="RELATIONSHIP VISUALIZER // REACT FLOW" headerColor="cyan" className="h-[600px]">
            <RelationshipGraph investigationId={investigation.id} />
          </PixelWindow>
        )}

        {activeTab === 'analytics' && (
          <PixelWindow title="ANALYTICS & METRICS BREAKDOWN" headerColor="purple">
            <div className="p-4 bg-white">
              <InvestigationAnalytics findings={findings} />
            </div>
          </PixelWindow>
        )}

        {activeTab === 'logs' && (
          <PixelWindow title={`RAW ENGINE LOGS [${logs.length} EVENTS]`} headerColor="green">
            <div className="bg-[#181824] p-4 font-mono text-xs overflow-y-auto max-h-[600px] space-y-1.5 select-text text-slate-200">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-slate-500 flex-shrink-0 select-none text-[10px]">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '00:00:00'}
                  </span>
                  <span
                    className={`font-pixel text-[8px] flex-shrink-0 ${
                      log.level === 'SUCCESS'
                        ? 'text-[#86efac]'
                        : log.level === 'WARN'
                        ? 'text-[#fef08a]'
                        : log.level === 'ERROR'
                        ? 'text-[#f43f5e]'
                        : 'text-[#7dd3fc]'
                    }`}
                  >
                    [{log.level}]
                  </span>
                  <span className="text-slate-400 flex-shrink-0 font-mono">[{log.stage}]</span>
                  <span className="text-slate-200 break-all">{log.message}</span>
                </div>
              ))}
            </div>
          </PixelWindow>
        )}
      </div>

      {/* Inspector Drawer */}
      <FindingDetailDrawer finding={selectedFinding} onClose={() => setSelectedFinding(null)} />
    </div>
  );
};
