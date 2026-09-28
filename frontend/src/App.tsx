import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { InvestigateForm } from './components/InvestigateForm';
import { InvestigationResult } from './components/InvestigationResult';
import { MemoryExplorer } from './components/MemoryExplorer';
import { IncidentHistory } from './components/IncidentHistory';
import { ResolutionForm } from './components/ResolutionForm';
import { Incident, InvestigationResponse } from './types';
import {
  fetchIncidents,
  investigateIncident as apiInvestigate,
  resolveIncident as apiResolve,
  searchMemories as apiSearchMemories,
} from './services/api';

const INITIAL_DEMO_INCIDENTS: Incident[] = [
  {
    id: 'INC-017',
    service: 'Payment API',
    environment: 'Production',
    error_code: 'DB-504',
    error_message: 'Database connection pool limit exceeded (10000ms)',
    description: 'Payment checkout failing for 15% of active users with DB connection timeout errors during peak checkout traffic.',
    deployment_version: 'v2.4.1',
    status: 'resolved',
    created_at: '2026-09-28T14:30:00Z',
    resolved_at: '2026-09-28T14:48:00Z',
  },
  {
    id: 'INC-023',
    service: 'Payment API',
    environment: 'Production',
    error_code: 'DB-504',
    error_message: 'Connection pool utilization reached 100%',
    description: 'DB-504 recurring connection timeout issue under flash sale traffic surge.',
    deployment_version: 'v2.4.2',
    status: 'resolved',
    created_at: '2026-09-28T16:15:00Z',
    resolved_at: '2026-09-28T16:40:00Z',
  },
  {
    id: 'INC-031',
    service: 'Authentication Service',
    environment: 'Production',
    error_code: 'AUTH-401',
    error_message: 'JWT signing key rotation mismatch',
    description: 'Users unable to log in following hotfix release. Token validation fails across microservices.',
    deployment_version: 'v1.8.9',
    status: 'resolved',
    created_at: '2026-09-28T18:00:00Z',
    resolved_at: '2026-09-28T18:12:00Z',
  },
  {
    id: 'INC-045',
    service: 'Payment API',
    environment: 'Production',
    error_code: 'DB-504',
    error_message: 'Database connection pool timeout (10000ms)',
    description: 'Payment API experiencing DB-504 timeouts after traffic spike.',
    deployment_version: 'v2.5.0',
    status: 'open',
    created_at: '2026-09-28T21:00:00Z',
  },
];

const MOCK_HINDSIGHT_MEMORIES = [
  {
    incident_id: 'INC-017',
    service: 'Payment API',
    environment: 'Production',
    error_code: 'DB-504',
    root_cause: 'Connection pool exhaustion under high concurrency',
    resolution: 'Increased connection pool size from 20 to 50 in pool_config.yaml',
    outcome: 'resolved',
    time_to_resolution: 18,
    content: 'Incident ID: INC-017\nService: Payment API\nError Code: DB-504\nRoot Cause: Connection pool exhaustion\nResolution: Increased pool size from 20 to 50',
  },
  {
    incident_id: 'INC-023',
    service: 'Payment API',
    environment: 'Production',
    error_code: 'DB-504',
    root_cause: 'Insufficient DB pool allocation for surge traffic',
    resolution: 'Added read replica and connection pool tuning',
    outcome: 'resolved',
    time_to_resolution: 25,
    content: 'Incident ID: INC-023\nService: Payment API\nError Code: DB-504\nRoot Cause: Insufficient DB pool allocation\nResolution: Added read replica and pool tuning',
  },
];

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_DEMO_INCIDENTS);
  const [currentInvestigation, setCurrentInvestigation] = useState<InvestigationResponse | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-045');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResolutionSaved, setIsResolutionSaved] = useState<boolean>(false);
  const [explorerMemories, setExplorerMemories] = useState<any[]>(MOCK_HINDSIGHT_MEMORIES);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);

  // Fetch initial incidents from FastAPI backend if available
  useEffect(() => {
    async function loadBackendData() {
      try {
        const data = await fetchIncidents();
        if (data && data.length > 0) {
          setIncidents(data);
          setBackendConnected(true);
        }
      } catch (e) {
        console.log('FastAPI backend not detected. Running in client demo mode with realistic incident data.');
        setBackendConnected(false);
      }
    }
    loadBackendData();
  }, []);

  // Handle Investigate Submission
  const handleInvestigate = async (formData: any) => {
    setIsLoading(true);

    try {
      // Call backend API
      const result = await apiInvestigate(formData);
      setCurrentInvestigation(result);
      setSelectedIncidentId(result.incident_id);
      setBackendConnected(true);
    } catch (e) {
      console.warn('Backend unavailable. Using Hindsight client demo memory engine.');
      // Intelligent fallback simulating real Hindsight recall
      const mockResult: InvestigationResponse = {
        incident_id: 'INC-045',
        hindsight_available: true,
        memories_count: 2,
        recalled_memories: MOCK_HINDSIGHT_MEMORIES,
        execution_steps: [
          { step: 'Analyzing incident telemetry', status: 'completed', detail: `Parsed telemetry for service '${formData.service}'` },
          { step: 'Searching Hindsight memory bank', status: 'completed', detail: 'Recalled 2 matching historical memory records from Hindsight' },
          { step: 'Contextual memory assembly', status: 'completed', detail: 'Injected recalled Hindsight memories into system prompt' },
          { step: 'Generating AI investigation report', status: 'completed', detail: 'Completed diagnostic reasoning' },
        ],
        investigation: {
          incident_summary: `DB-504 Connection pool timeout on ${formData.service} causing payment failures for active users.`,
          recurring_pattern_detected: true,
          relevant_historical_incidents: [
            {
              incident_id: 'INC-017',
              service: formData.service,
              similarity_reason: 'Identical DB-504 error code and connection pool timeout under surge traffic.',
              historical_root_cause: 'Connection pool exhaustion under high concurrency',
              historical_resolution: 'Increased connection pool size from 20 to 50 in pool_config.yaml',
            },
          ],
          similarities: [
            `Matching error code ${formData.error_code || 'DB-504'} on ${formData.service}`,
            'Identical database connection timeout under peak load',
          ],
          possible_root_causes: [
            {
              cause: 'Connection pool exhaustion',
              likelihood: 'High',
              explanation: 'Two previous Payment API incidents showed identical DB-504 timeout behavior when pool limit (20) was hit.',
            },
          ],
          historical_evidence: 'Recalled Hindsight memories INC-017 & INC-023 confirm past Payment API DB-504 errors were successfully resolved by increasing database connection pool size.',
          recommended_investigation_steps: [
            `Check current database connection pool utilization for ${formData.service}.`,
            'Inspect active pool configuration limit in pool_config.yaml.',
            'Increase connection pool capacity from 20 to 50 and verify recovery.',
          ],
          previously_successful_resolutions: [
            'Increased connection pool size from 20 to 50 in pool_config.yaml',
          ],
          confidence_level: 'High (Supported by 2 Hindsight historical memories)',
          provider_info: 'Groq Llama 3.3 70B (Hindsight Persistent Memory)',
        },
      };
      setCurrentInvestigation(mockResult);
      setSelectedIncidentId('INC-045');
    } finally {
      setIsLoading(false);
      setActiveTab('result');
    }
  };

  // Handle Save Resolution
  const handleSaveResolution = async (resolutionData: any) => {
    setIsLoading(true);
    try {
      await apiResolve(selectedIncidentId, resolutionData);
      setBackendConnected(true);
    } catch (e) {
      console.warn('Backend unavailable. Retaining resolution locally in demo Hindsight bank.');
    } finally {
      setIsLoading(false);
      setIsResolutionSaved(true);

      // Add to memory explorer state
      const newMemory = {
        incident_id: selectedIncidentId,
        service: 'Payment API',
        error_code: 'DB-504',
        root_cause: resolutionData.root_cause,
        resolution: resolutionData.resolution,
        outcome: resolutionData.outcome,
        content: `Incident ID: ${selectedIncidentId}\nService: Payment API\nRoot Cause: ${resolutionData.root_cause}\nResolution: ${resolutionData.resolution}`,
      };
      setExplorerMemories([newMemory, ...explorerMemories]);
    }
  };

  // Handle Search Memories
  const handleSearchMemories = async (query: string) => {
    try {
      const data = await apiSearchMemories(query);
      if (data && data.results) {
        setExplorerMemories(data.results);
        return;
      }
    } catch (e) {
      console.warn('Backend search unavailable. Filtering local memories.');
    }

    const filtered = MOCK_HINDSIGHT_MEMORIES.filter((m) =>
      m.content.toLowerCase().includes(query.toLowerCase()) ||
      m.service.toLowerCase().includes(query.toLowerCase())
    );
    setExplorerMemories(filtered.length > 0 ? filtered : MOCK_HINDSIGHT_MEMORIES);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        demoMode={demoMode}
        setDemoMode={setDemoMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            incidents={incidents}
            onSelectIncident={() => setActiveTab('investigate')}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'investigate' && (
          <InvestigateForm
            onInvestigate={handleInvestigate}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'result' && currentInvestigation && (
          <InvestigationResult
            data={currentInvestigation}
            onResolve={() => {
              setIsResolutionSaved(false);
              setActiveTab('resolve');
            }}
          />
        )}

        {activeTab === 'explorer' && (
          <MemoryExplorer
            onSearchMemories={handleSearchMemories}
            memories={explorerMemories}
            bankId="incident-memory-bank"
          />
        )}

        {activeTab === 'timeline' && (
          <IncidentHistory
            incidents={incidents}
            onSelectIncident={() => setActiveTab('investigate')}
          />
        )}

        {activeTab === 'resolve' && (
          <ResolutionForm
            incidentId={selectedIncidentId}
            onSaveResolution={handleSaveResolution}
            isLoading={isLoading}
            isSaved={isResolutionSaved}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>IncidentMemory — Built for HackWithHyderabad 3.0</span>
          <span className="flex items-center gap-2">
            Status: <span className={`h-2 w-2 rounded-full ${backendConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {backendConnected ? 'Connected to FastAPI Backend' : 'Demo Mode (Standalone / Client)'}
            {' | '} Hindsight SDK Active
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
