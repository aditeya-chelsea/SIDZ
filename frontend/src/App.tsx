import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NewInvestigationModal } from './components/investigation/NewInvestigationModal';
import { ToolStatusDrawer } from './components/tools/ToolStatusDrawer';

import { OverviewPage } from './pages/OverviewPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { InvestigationDetailPage } from './pages/InvestigationDetailPage';
import { UsernameReconPage } from './pages/UsernameReconPage';
import { EmailReconPage } from './pages/EmailReconPage';
import { DomainReconPage } from './pages/DomainReconPage';
import { IpReconPage } from './pages/IpReconPage';
import { RelationshipGraphPage } from './pages/RelationshipGraphPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

import { TargetType } from './types';
import { api } from './api/client';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [activeInvestigationId, setActiveInvestigationId] = useState<string | null>(null);

  // Modals state
  const [isNewScanOpen, setIsNewScanOpen] = useState(false);
  const [newScanTarget, setNewScanTarget] = useState('');
  const [newScanType, setNewScanType] = useState<TargetType | undefined>(undefined);
  const [isToolDrawerOpen, setIsToolDrawerOpen] = useState(false);

  // Active scan tracking
  const [activeScanCount, setActiveScanCount] = useState(0);

  const checkActiveScans = async () => {
    try {
      const invs = await api.listInvestigations({ limit: 50 });
      const running = invs.filter((i) => i.status === 'running').length;
      setActiveScanCount(running);
    } catch (e) {
      // offline or loading
    }
  };

  useEffect(() => {
    checkActiveScans();
    const interval = setInterval(checkActiveScans, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStartNewScan = (initialTarget?: string, initialType?: TargetType) => {
    setNewScanTarget(initialTarget || '');
    setNewScanType(initialType);
    setIsNewScanOpen(true);
  };

  const handleOpenInvestigation = (id: string) => {
    setActiveInvestigationId(id);
    setCurrentTab('investigation-detail');
  };

  const handleInvestigationCreated = (id: string) => {
    setActiveInvestigationId(id);
    setCurrentTab('investigation-detail');
    checkActiveScans();
  };

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden text-slate-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'investigation-detail') {
            setActiveInvestigationId(null);
          }
        }}
        onOpenToolDrawer={() => setIsToolDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onStartNewScan={handleStartNewScan}
          onOpenToolDrawer={() => setIsToolDrawerOpen(true)}
          activeScanCount={activeScanCount}
        />

        <main className="flex-1 overflow-y-auto bg-background">
          {currentTab === 'overview' && (
            <OverviewPage
              onOpenInvestigation={handleOpenInvestigation}
              onStartNewScan={handleStartNewScan}
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'investigations' && (
            <InvestigationsPage
              onOpenInvestigation={handleOpenInvestigation}
              onStartNewScan={handleStartNewScan}
            />
          )}

          {currentTab === 'investigation-detail' && activeInvestigationId && (
            <InvestigationDetailPage
              investigationId={activeInvestigationId}
              onBack={() => setCurrentTab('investigations')}
            />
          )}

          {currentTab === 'username' && (
            <UsernameReconPage
              onStartNewScan={handleStartNewScan}
              onOpenInvestigation={handleOpenInvestigation}
            />
          )}

          {currentTab === 'email' && (
            <EmailReconPage
              onStartNewScan={handleStartNewScan}
              onOpenInvestigation={handleOpenInvestigation}
            />
          )}

          {currentTab === 'domain' && (
            <DomainReconPage
              onStartNewScan={handleStartNewScan}
              onOpenInvestigation={handleOpenInvestigation}
            />
          )}

          {currentTab === 'ip' && (
            <IpReconPage
              onStartNewScan={handleStartNewScan}
              onOpenInvestigation={handleOpenInvestigation}
            />
          )}

          {currentTab === 'graph' && (
            <RelationshipGraphPage onOpenInvestigation={handleOpenInvestigation} />
          )}

          {currentTab === 'reports' && <ReportsPage />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Modals & Drawers */}
      <NewInvestigationModal
        isOpen={isNewScanOpen}
        onClose={() => setIsNewScanOpen(false)}
        onInvestigationCreated={handleInvestigationCreated}
        initialTarget={newScanTarget}
        initialType={newScanType}
      />

      <ToolStatusDrawer
        isOpen={isToolDrawerOpen}
        onClose={() => setIsToolDrawerOpen(false)}
      />
    </div>
  );
};

