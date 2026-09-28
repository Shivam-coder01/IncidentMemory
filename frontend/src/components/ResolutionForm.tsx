import React, { useState } from 'react';
import { CheckCircle2, Save, Database, ShieldCheck, Sparkles } from 'lucide-react';

interface ResolutionFormProps {
  incidentId: string;
  onSaveResolution: (resolutionData: {
    root_cause: string;
    resolution: string;
    outcome: string;
    time_to_resolution: number;
  }) => void;
  isLoading: boolean;
  isSaved: boolean;
}

export const ResolutionForm: React.FC<ResolutionFormProps> = ({
  incidentId,
  onSaveResolution,
  isLoading,
  isSaved,
}) => {
  const [rootCause, setRootCause] = useState('Connection pool exhaustion under high concurrency');
  const [resolution, setResolution] = useState('Increased database connection pool size from 20 to 50 in pool_config.yaml');
  const [outcome, setOutcome] = useState('resolved');
  const [timeToResolution, setTimeToResolution] = useState(18);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveResolution({
      root_cause: rootCause,
      resolution,
      outcome,
      time_to_resolution: Number(timeToResolution),
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
          <Database className="h-4 w-4" /> Organizational Learning Loop
        </div>
        <h2 className="text-2xl font-bold text-white">Incident Resolution & Hindsight Retention</h2>
        <p className="text-slate-300 text-sm">
          Save verified incident resolution facts back into **Hindsight**. Future investigations of similar errors will recall this exact knowledge.
        </p>
      </div>

      {/* Success Notification Banner */}
      {isSaved && (
        <div className="glass-panel glass-glow-emerald p-6 bg-emerald-950/30 border-emerald-500/50 space-y-2 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-lg">
            <CheckCircle2 className="h-6 w-6" /> Incident Knowledge Retained in Hindsight!
          </div>
          <p className="text-emerald-200 text-sm max-w-xl mx-auto">
            This resolution has been successfully persisted into Hindsight memory bank <code className="bg-slate-950 px-2 py-0.5 rounded text-emerald-300">incident-memory-bank</code>. Future investigations of similar errors will immediately benefit from this learning!
          </p>
        </div>
      )}

      {/* Resolution Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-5">
        <div className="text-xs font-bold font-mono text-purple-300 border-b border-slate-800 pb-3">
          Target Incident ID: {incidentId}
        </div>

        <div>
          <label className="form-label">Confirmed Root Cause *</label>
          <input
            type="text"
            className="form-input"
            value={rootCause}
            onChange={(e) => setRootCause(e.target.value)}
            required
            placeholder="e.g. Connection pool exhaustion under high concurrency"
          />
        </div>

        <div>
          <label className="form-label">Final Verified Fix / Resolution Steps *</label>
          <textarea
            className="form-input min-h-[100px]"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            required
            placeholder="Describe exact resolution steps taken..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Outcome *</label>
            <select
              className="form-input"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            >
              <option value="resolved">Resolved (Fix verified)</option>
              <option value="mitigated">Mitigated (Workaround applied)</option>
            </select>
          </div>

          <div>
            <label className="form-label">Time to Resolution (Minutes)</label>
            <input
              type="number"
              className="form-input"
              value={timeToResolution}
              onChange={(e) => setTimeToResolution(Number(e.target.value))}
              min={1}
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || isSaved}
            className="btn-success w-full md:w-auto text-base py-3 px-8"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Retaining Knowledge into Hindsight...
              </>
            ) : isSaved ? (
              <>
                <CheckCircle2 className="h-5 w-5" /> KNOWLEDGE RETAINED
              </>
            ) : (
              <>
                <Save className="h-5 w-5" /> SAVE TO HINDSIGHT
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
