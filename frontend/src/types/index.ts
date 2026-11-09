export type TargetType = 'username' | 'email' | 'domain' | 'ip';
export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Investigation {
  id: string;
  title: string;
  target: string;
  target_type: TargetType;
  status: ScanStatus;
  progress: number;
  current_stage: string;
  current_tool: string;
  authorized_by_user: boolean;
  created_at: string;
  completed_at?: string | null;
  is_demo: boolean;
  error_message?: string | null;
  meta_summary: Record<string, any>;
  findings_count: number;
}

export interface Finding {
  id: string;
  investigation_id: string;
  category: 'identity' | 'social' | 'dns' | 'network' | 'breach' | 'subdomain' | 'whois' | 'technology';
  title: string;
  value: string;
  source_tool: string;
  source_url?: string | null;
  confidence: ConfidenceLevel;
  raw_data: Record<string, any>;
  discovered_at: string;
}

export interface EvidenceEdge {
  id: string;
  investigation_id: string;
  source_id: string;
  target_id: string;
  source_label: string;
  target_label: string;
  relation: string;
  evidence_tool: string;
  created_at: string;
}

export interface ScanLog {
  id: number;
  investigation_id: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  stage: string;
  message: string;
  timestamp: string;
}

export interface ToolInfo {
  id: string;
  name: string;
  category: string;
  installed: boolean;
  executable_path?: string | null;
  version?: string | null;
  install_command: string;
  description: string;
  native_fallback: boolean;
}

export interface GraphNodeData {
  label: string;
  type: string;
  target_type?: TargetType;
  status?: string;
  investigation_id?: string;
  is_root?: boolean;
  evidence_tool?: string;
  evidence?: Array<{
    title: string;
    value: string;
    tool: string;
    confidence: string;
    url?: string;
  }>;
}

export interface SystemOverview {
  total_investigations: number;
  active_investigations: number;
  completed_investigations: number;
  total_findings: number;
  categories: Array<{ name: string; count: number }>;
  confidence_distribution: Array<{ confidence: string; count: number }>;
  target_type_distribution: Array<{ type: string; count: number }>;
}

