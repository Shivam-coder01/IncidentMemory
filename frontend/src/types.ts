export interface Incident {
  id: str;
  service: string;
  environment: string;
  error_code?: string;
  error_message: string;
  description: string;
  deployment_version?: string;
  status: 'open' | 'investigating' | 'resolved';
  created_at: string;
  resolved_at?: string;
}

export interface HistoricalMatch {
  incident_id?: string;
  service?: string;
  similarity_reason?: string;
  historical_root_cause?: string;
  historical_resolution?: string;
  content?: string;
}

export interface RootCauseHypothesis {
  cause: string;
  likelihood: string;
  explanation: string;
}

export interface InvestigationResult {
  incident_summary: string;
  recurring_pattern_detected: boolean;
  relevant_historical_incidents: HistoricalMatch[];
  similarities: string[];
  possible_root_causes: RootCauseHypothesis[];
  historical_evidence: string;
  recommended_investigation_steps: string[];
  previously_successful_resolutions: string[];
  confidence_level: string;
  provider_info?: string;
}

export interface ExecutionStep {
  step: string;
  status: 'pending' | 'in_progress' | 'completed';
  detail: string;
}

export interface InvestigationResponse {
  incident_id: string;
  hindsight_available: boolean;
  memories_count: number;
  recalled_memories: any[];
  investigation: InvestigationResult;
  execution_steps: ExecutionStep[];
}

export interface IncidentResolution {
  id: string;
  incident_id: string;
  root_cause: string;
  resolution: string;
  outcome: string;
  time_to_resolution?: number;
  hindsight_retained: boolean;
  created_at: string;
}
