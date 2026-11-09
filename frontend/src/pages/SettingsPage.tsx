import React, { useState, useEffect } from 'react';
import { ToolInfo } from '../types';
import { api } from '../api/client';
import { PixelWindow } from '../components/pixel/PixelWindow';
import { PixelButton } from '../components/pixel/PixelButton';
import { PixelSmiley, PixelHeart, PixelSparkle } from '../components/pixel/PixelStickers';

export const SettingsPage: React.FC = () => {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [sysStatus, setSysStatus] = useState<any>(null);

  useEffect(() => {
    api.getTools().then(setTools).catch(() => {});
    api.getStatus().then(setSysStatus).catch(() => {});
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PixelWindow
        title="SYSTEM CONFIGURATION // SECURITY POSTURE"
        headerColor="purple"
        icon={<PixelSmiley type="cool" size={16} />}
      >
        <div className="p-4 bg-white">
          <h1 className="font-pixel text-sm text-pixel-dark uppercase">
            LOCAL-FIRST EXECUTION & DEFENSIVE BOUNDARIES
          </h1>
          <p className="font-mono text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Localhost runtime configuration, external API credentials, and defensive privacy policies.
          </p>
        </div>
      </PixelWindow>

      {/* Security Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Runtime & Binding */}
        <PixelWindow
          title="RUNTIME ENVIRONMENT"
          headerColor="yellow"
        >
          <div className="p-4 space-y-2.5 font-mono text-xs bg-white">
            <div className="flex justify-between p-2.5 bg-[#f8fafc] border-2 border-pixel-dark shadow-pixel-sm">
              <span className="text-slate-600 font-pixel text-[8px] uppercase">HOST BINDING:</span>
              <strong className="text-pixel-dark">{sysStatus?.binding || '127.0.0.1:8000'}</strong>
            </div>
            <div className="flex justify-between p-2.5 bg-[#f8fafc] border-2 border-pixel-dark shadow-pixel-sm">
              <span className="text-slate-600 font-pixel text-[8px] uppercase">DATABASE:</span>
              <strong className="text-pixel-dark">SQLite 3 (aiosqlite)</strong>
            </div>
            <div className="flex justify-between p-2.5 bg-[#f8fafc] border-2 border-pixel-dark shadow-pixel-sm">
              <span className="text-slate-600 font-pixel text-[8px] uppercase">SUBPROCESS:</span>
              <strong className="text-emerald-700">asyncio (No shell=True)</strong>
            </div>
            <div className="flex justify-between p-2.5 bg-[#f8fafc] border-2 border-pixel-dark shadow-pixel-sm">
              <span className="text-slate-600 font-pixel text-[8px] uppercase">SANITIZATION:</span>
              <strong className="text-emerald-700">Active (Secret Redaction)</strong>
            </div>
          </div>
        </PixelWindow>

        {/* Ethical OSINT Rules */}
        <PixelWindow
          title="ETHICAL GUARDRAILS"
          headerColor="green"
        >
          <div className="p-4 space-y-2 bg-white font-mono text-xs">
            <div className="flex items-start gap-2 p-2 bg-[#f8fafc] border border-pixel-dark">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Local-First:</strong> Zero telemetry sent to cloud vendors.</span>
            </div>
            <div className="flex items-start gap-2 p-2 bg-[#f8fafc] border border-pixel-dark">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Zero Credential Harvesting:</strong> No password dumps queried.</span>
            </div>
            <div className="flex items-start gap-2 p-2 bg-[#f8fafc] border border-pixel-dark">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>No Account Takeover Probes:</strong> Recovery forms are never accessed.</span>
            </div>
            <div className="flex items-start gap-2 p-2 bg-[#f8fafc] border border-pixel-dark">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Public Telemetry Only:</strong> DNS, WHOIS, CT logs, public feeds.</span>
            </div>
          </div>
        </PixelWindow>
      </div>

      {/* API Key Management */}
      <PixelWindow
        title="EXTERNAL API CREDENTIALS (.ENV)"
        headerColor="pink"
      >
        <div className="p-4 space-y-3 bg-white font-mono text-xs">
          <p className="text-slate-600">
            SIDZ OSINT functions completely out-of-the-box without paid API keys. To add enriched data from authorized services, set them in your project root <code className="bg-[#fef08a] px-1 py-0.5 border border-pixel-dark">.env</code>:
          </p>
          <div className="space-y-2">
            <div className="p-2.5 bg-[#f8fafc] border-2 border-pixel-dark shadow-pixel-sm">
              <strong className="text-pixel-dark font-pixel text-[9px] block mb-0.5">HIBP_API_KEY</strong>
              <span className="text-slate-600 text-[11px]">Optional. Enables Have I Been Pwned authorized breach exposure verifications.</span>
            </div>
            <div className="p-2.5 bg-[#f8fafc] border-2 border-pixel-dark shadow-pixel-sm">
              <strong className="text-pixel-dark font-pixel text-[9px] block mb-0.5">SHODAN_API_KEY</strong>
              <span className="text-slate-600 text-[11px]">Optional. Enables deep host exposure intelligence queries.</span>
            </div>
            <div className="p-2.5 bg-[#f8fafc] border-2 border-pixel-dark shadow-pixel-sm">
              <strong className="text-pixel-dark font-pixel text-[9px] block mb-0.5">VIRUSTOTAL_API_KEY</strong>
              <span className="text-slate-600 text-[11px]">Optional. Domain and IP reputation risk assessment.</span>
            </div>
          </div>
        </div>
      </PixelWindow>
    </div>
  );
};
