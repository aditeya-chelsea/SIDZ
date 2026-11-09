import { Investigation, Finding, EvidenceEdge, ScanLog, ToolInfo, SystemOverview } from '../types';

const API_BASE = '/api';

export const api = {
  // Status
  async getStatus() {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error('Failed to fetch system status');
    return res.json();
  },

  // Investigations
  async listInvestigations(params?: { query?: string; target_type?: string; limit?: number }): Promise<Investigation[]> {
    const query = new URLSearchParams();
    if (params?.query) query.set('query', params.query);
    if (params?.target_type) query.set('target_type', params.target_type);
    if (params?.limit) query.set('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/investigations?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch investigations');
    return res.json();
  },

  async getInvestigation(id: string): Promise<Investigation> {
    const res = await fetch(`${API_BASE}/investigations/${id}`);
    if (!res.ok) throw new Error('Investigation not found');
    return res.json();
  },

  async createInvestigation(data: {
    target: string;
    target_type?: string;
    title?: string;
    authorized_by_user: boolean;
  }): Promise<Investigation> {
    const res = await fetch(`${API_BASE}/investigations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create scan' }));
      throw new Error(err.detail || 'Failed to start investigation');
    }
    return res.json();
  },

  async deleteInvestigation(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/investigations/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete investigation');
  },

  async cancelInvestigation(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/investigations/${id}/cancel`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to cancel investigation');
  },

  // Findings & Logs
  async getFindings(investigationId: string, params?: { category?: string; confidence?: string }): Promise<Finding[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.confidence) query.set('confidence', params.confidence);

    const res = await fetch(`${API_BASE}/investigations/${investigationId}/findings?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch findings');
    return res.json();
  },

  async getLogs(investigationId: string): Promise<ScanLog[]> {
    const res = await fetch(`${API_BASE}/investigations/${investigationId}/logs`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    return res.json();
  },

  async getOverview(): Promise<SystemOverview> {
    const res = await fetch(`${API_BASE}/findings/overview`);
    if (!res.ok) throw new Error('Failed to fetch overview metrics');
    return res.json();
  },

  // Graph
  async getGraph(investigationId: string): Promise<{ nodes: any[]; edges: any[] }> {
    const res = await fetch(`${API_BASE}/investigations/${investigationId}/graph`);
    if (!res.ok) throw new Error('Failed to fetch relationship graph');
    return res.json();
  },

  // Tools
  async getTools(): Promise<ToolInfo[]> {
    const res = await fetch(`${API_BASE}/tools`);
    if (!res.ok) throw new Error('Failed to fetch tools status');
    return res.json();
  },

  // Export URLs
  getHtmlReportUrl(id: string) {
    return `${API_BASE}/investigations/${id}/report/html`;
  },

  getJsonReportUrl(id: string) {
    return `${API_BASE}/investigations/${id}/report/json`;
  },
};

