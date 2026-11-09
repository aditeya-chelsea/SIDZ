import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Finding } from '../../types';
import { PixelHeart, PixelSparkle, PixelSmiley } from '../pixel/PixelStickers';

interface InvestigationAnalyticsProps {
  findings: Finding[];
}

export const InvestigationAnalytics: React.FC<InvestigationAnalyticsProps> = ({ findings }) => {
  // Aggregate by Category
  const categoryMap: Record<string, number> = {};
  const confidenceMap: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  const toolsSet = new Set<string>();

  findings.forEach((f) => {
    categoryMap[f.category] = (categoryMap[f.category] || 0) + 1;
    confidenceMap[f.confidence] = (confidenceMap[f.confidence] || 0) + 1;
    toolsSet.add(f.source_tool);
  });

  const categoryData = Object.entries(categoryMap).map(([name, count]) => ({
    name: name.toUpperCase(),
    count,
  }));

  const confidenceData = [
    { name: 'High Confidence', value: confidenceMap.HIGH || 0, color: '#86efac' },
    { name: 'Medium Confidence', value: confidenceMap.MEDIUM || 0, color: '#fde047' },
    { name: 'Low Confidence', value: confidenceMap.LOW || 0, color: '#7dd3fc' },
  ].filter((d) => d.value > 0);

  const CATEGORY_COLORS = [
    '#f472b6',
    '#7dd3fc',
    '#fde047',
    '#86efac',
    '#d8b4fe',
    '#fb923c',
    '#38bdf8',
  ];

  return (
    <div className="space-y-4">
      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#fbcfe8] border-2 border-pixel-dark shadow-pixel-sm">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[8px] uppercase tracking-wider text-pixel-dark">TOTAL FINDINGS</span>
            <PixelHeart size={12} color="#db2777" />
          </div>
          <div className="font-pixel text-xl text-pixel-dark font-bold mt-1.5">{findings.length}</div>
        </div>

        <div className="p-3.5 bg-[#bbf7d0] border-2 border-pixel-dark shadow-pixel-sm">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[8px] uppercase tracking-wider text-pixel-dark">HIGH CONFIDENCE</span>
            <span className="font-pixel text-xs text-emerald-800">★</span>
          </div>
          <div className="font-pixel text-xl text-emerald-900 font-bold mt-1.5">
            {confidenceMap.HIGH || 0}
          </div>
        </div>

        <div className="p-3.5 bg-[#bae6fd] border-2 border-pixel-dark shadow-pixel-sm">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[8px] uppercase tracking-wider text-pixel-dark">CATEGORIES</span>
            <PixelSparkle size={12} color="#0284c7" />
          </div>
          <div className="font-pixel text-xl text-sky-950 font-bold mt-1.5">
            {Object.keys(categoryMap).length}
          </div>
        </div>

        <div className="p-3.5 bg-[#e9d5ff] border-2 border-pixel-dark shadow-pixel-sm">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[8px] uppercase tracking-wider text-pixel-dark">SOURCES & TOOLS</span>
            <PixelSmiley type="cool" size={14} />
          </div>
          <div className="font-pixel text-xl text-purple-950 font-bold mt-1.5">
            {toolsSet.size}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="p-4 bg-white border-2 border-pixel-dark shadow-pixel-sm">
          <div className="font-pixel text-[9px] uppercase text-pixel-dark mb-3">
            FINDINGS DISTRIBUTION BY CATEGORY
          </div>
          <div className="h-60">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center font-mono text-xs text-slate-500">
                No telemetry recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#181824', fontSize: 9, fontFamily: 'monospace' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: '#181824', fontSize: 9, fontFamily: 'monospace' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #181824', boxShadow: '2px 2px 0 #181824', fontSize: '11px', fontFamily: 'monospace', color: '#181824' }}
                  />
                  <Bar dataKey="count">
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        stroke="#181824"
                        strokeWidth={1.5}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Confidence Breakdown */}
        <div className="p-4 bg-white border-2 border-pixel-dark shadow-pixel-sm">
          <div className="font-pixel text-[9px] uppercase text-pixel-dark mb-3">
            EVIDENCE CONFIDENCE RATING SPLIT
          </div>
          <div className="h-60 flex items-center justify-center">
            {confidenceData.length === 0 ? (
              <div className="font-mono text-xs text-slate-500">No confidence telemetry.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={confidenceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    stroke="#181824"
                    strokeWidth={2}
                  >
                    {confidenceData.map((entry, index) => (
                      <Cell key={`slice-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #181824', boxShadow: '2px 2px 0 #181824', fontSize: '11px', fontFamily: 'monospace', color: '#181824' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
