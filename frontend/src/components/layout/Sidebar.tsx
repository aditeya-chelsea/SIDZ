import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  UserCheck,
  Mail,
  Globe,
  Radio,
  Share2,
  FileText,
  Sliders,
  Terminal,
  Heart,
  Sparkles,
} from 'lucide-react';
import { PixelLogo } from './PixelLogo';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenToolDrawer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenToolDrawer,
}) => {
  const navItems = [
    { id: 'overview', label: 'DESKTOP', icon: LayoutDashboard },
    { id: 'investigations', label: 'DOSSIERS', icon: FolderGit2 },
    { type: 'divider', label: 'RECON' },
    { id: 'username', label: 'USERNAMES', icon: UserCheck },
    { id: 'email', label: 'EMAILS', icon: Mail },
    { id: 'domain', label: 'DOMAINS', icon: Globe },
    { id: 'ip', label: 'IP RECON', icon: Radio },
    { type: 'divider', label: 'DATA' },
    { id: 'graph', label: 'EVIDENCE GRAPH', icon: Share2 },
    { id: 'reports', label: 'REPORTS', icon: FileText },
    { id: 'settings', label: 'SETTINGS', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-white border-r-2 border-pixel-dark flex flex-col h-screen select-none z-20 shadow-pixel">
      {/* Retro Titlebar Header */}
      <div className="p-3 border-b-2 border-pixel-dark bg-[#f472b6] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <PixelLogo size={28} />
          <div>
            <div className="font-pixel text-[11px] text-pixel-dark font-bold leading-tight">
              SIDZ//OSINT
            </div>
            <div className="text-[9px] font-mono text-pixel-dark/80 mt-0.5 font-bold">
              ★ SYSTEM v1.0 ★
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-white border border-pixel-dark inline-block" />
          <span className="w-2.5 h-2.5 bg-[#fef08a] border border-pixel-dark inline-block" />
        </div>
      </div>

      {/* Navigation Dock */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#fffdf5]">
        {navItems.map((item, idx) => {
          if (item.type === 'divider') {
            return (
              <div
                key={`divider-${idx}`}
                className="pt-3 pb-1 px-2 text-[9px] font-pixel text-[#8b5cf6] flex items-center gap-1"
              >
                <span>▶</span>
                <span>{item.label}</span>
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id!)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono font-bold transition-all border-2 ${
                isActive
                  ? 'bg-[#fef08a] border-pixel-dark shadow-pixel-sm translate-x-1'
                  : 'bg-white border-transparent hover:border-pixel-dark hover:bg-[#fce7f3] text-pixel-dark'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-pixel-dark stroke-[2.5]' : 'text-slate-600'}`} />
              <span className="font-pixel text-[9px] tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Retro Toolbox Footer */}
      <div className="p-3 border-t-2 border-pixel-dark bg-[#fdf2f8] space-y-2">
        <button
          onClick={onOpenToolDrawer}
          className="pixel-btn w-full flex items-center justify-between p-2 bg-[#86efac] text-pixel-dark font-pixel text-[9px]"
        >
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>TOOL ENGINE</span>
          </div>
          <span className="bg-white border border-pixel-dark px-1 text-[8px]">
            6/6
          </span>
        </button>

        <div className="p-2 bg-white border border-pixel-dark text-[9px] font-mono font-bold flex items-center justify-between text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#22c55e] border border-pixel-dark inline-block animate-pulse" />
            <span>127.0.0.1:8000</span>
          </div>
          <span className="flex items-center gap-1 text-[#ec4899]">
            <Heart className="w-2.5 h-2.5 fill-current" />
            LOCAL
          </span>
        </div>
      </div>
    </aside>
  );
};
