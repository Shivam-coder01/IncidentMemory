import { Incident, InvestigationResponse, IncidentResolution } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchIncidents(statusFilter?: string, serviceFilter?: string): Promise<Incident[]> {
  const params = new URLSearchParams();
  if (statusFilter) params.append('status_filter', statusFilter);
  if (serviceFilter) params.append('service_filter', serviceFilter);

  const url = `${API_BASE_URL}/api/incidents${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed fetching incidents');
  return res.json();
}

export async function createIncident(payload: {
  service: string;
  environment: string;
  error_code?: string;
  error_message: string;
  description: string;
  deployment_version?: string;
}): Promise<Incident> {
  const res = await fetch(`${API_BASE_URL}/api/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed creating incident');
  return res.json();
}

export async function investigateIncident(payload: {
  incident_id?: string;
  service: string;
  environment: string;
  error_code?: string;
  error_message: string;
  description: string;
  deployment_version?: string;
}): Promise<InvestigationResponse> {
  const res = await fetch(`${API_BASE_URL}/api/investigate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Investigation request failed');
  return res.json();
}

export async function resolveIncident(
  incidentId: string,
  payload: {
    root_cause: string;
    resolution: string;
    outcome: string;
    time_to_resolution?: number;
  }
): Promise<IncidentResolution> {
  const res = await fetch(`${API_BASE_URL}/api/incidents/${incidentId}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed resolving incident');
  return res.json();
}

export async function searchMemories(query: string, service?: string, limit: number = 10) {
  const params = new URLSearchParams({ query, limit: String(limit) });
  if (service) params.append('service', service);

  const res = await fetch(`${API_BASE_URL}/api/memories/search?${params.toString()}`);
  if (!res.ok) throw new Error('Failed searching memories');
  return res.json();
}
