import React from 'react';
import { Incident } from '../types';
import { Clock, RefreshCw, AlertTriangle, ArrowDown, CheckCircle2, ChevronRight, Layers } from 'lucide-react';

interface IncidentHistoryProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

export const IncidentHistory: React.FC<IncidentHistoryProps> = ({
  incidents,
  onSelectIncident,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 space-y-2">
        <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
          <Clock className="h-4 w-4" /> Sequential Knowledge Progression
        </div>
        <h2 className="text-2xl font-bold text-white">Incident Timeline & Memory Progression</h2>
        <p className="text-slate-300 text-sm">
          Track how incident knowledge accumulates chronologically in Hindsight. Recurring failures automatically link back to historical root causes.
        </p>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 border-l-2 border-purple-500/30 space-y-6 my-4">
        {incidents.map((incident, idx) => {
          const isRecurring = incident.error_code === 'DB-504' || incident.error_code === 'AUTH-401';
          return (
            <div key={incident.id} className="relative group">
              {/* Timeline Marker Node */}
              <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-purple-600 border-2 border-slate-950 group-hover:scale-125 transition-transform" />

              <div className="glass-panel p-5 space-y-3 hover:border-purple-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-purple-300 text-sm">{incident.id}</span>
                    <span className="font-sans font-bold text-white text-sm">{incident.service}</span>
                    <span className="badge badge-open text-[10px]">{incident.error_code || 'N/A'}</span>
                  </div>
                  <span className={`badge badge-${incident.status}`}>
                    {incident.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-sans">
                  {incident.description}
                </p>

                {isRecurring && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>RECURRING INCIDENT DETECTED — Linked to historical Hindsight memory INC-017</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-400">
                    Created: {new Date(incident.created_at).toLocaleString()}
                  </span>
                  <button
                    onClick={() => onSelectIncident(incident)}
                    className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                  >
                    View Investigation Details <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
