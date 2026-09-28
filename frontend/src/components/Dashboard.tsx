import React from 'react';
import { Incident } from '../types';
import { Activity, CheckCircle2, RefreshCw, Clock, AlertTriangle, ArrowRight, ShieldCheck, Database } from 'lucide-react';

interface DashboardProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  incidents,
  onSelectIncident,
  onNavigate,
}) => {
  const totalCount = incidents.length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;
  const recurringCount = incidents.filter(i => i.error_code === 'DB-504' || i.error_code === 'AUTH-401').length;
  const avgTime = 18; // minutes average MTTR

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel glass-glow-purple p-6 lg:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Database className="h-64 w-64 text-purple-400" />
        </div>
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" /> HackWithHyderabad 3.0 Demo
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Production Intelligence Dashboard
          </h1>
          <p className="text-slate-300 text-sm lg:text-base leading-relaxed">
            IncidentMemory uses <strong className="text-purple-300">Hindsight</strong> persistent organizational memory to eliminate redundant investigations. Every resolved production incident directly teaches the AI agent how to handle future failures.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('investigate')}
              className="btn-primary"
            >
              <Activity className="h-4 w-4" /> Investigate New Incident
            </button>
            <button
              onClick={() => onNavigate('explorer')}
              className="btn-secondary"
            >
              <Database className="h-4 w-4 text-purple-400" /> Explore Hindsight Memory Bank
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Incidents</span>
            <Activity className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalCount}</div>
          <div className="text-xs text-slate-400">Tracked across all microservices</div>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved Incidents</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{resolvedCount}</div>
          <div className="text-xs text-slate-400">Knowledge retained into Hindsight</div>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Recurring Patterns</span>
            <RefreshCw className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{recurringCount}</div>
          <div className="text-xs text-amber-400/80 font-medium">Matching past Hindsight memories</div>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg MTTR</span>
            <Clock className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400">{avgTime} min</div>
          <div className="text-xs text-cyan-400/80">35% faster with memory recall</div>
        </div>
      </div>

      {/* Recent Incidents Section */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" /> Recent Production Incidents
          </h2>
          <button
            onClick={() => onNavigate('timeline')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            View Incident History <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Error Code</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-purple-300">{incident.id}</td>
                  <td className="py-3.5 px-4 text-white font-sans font-semibold">{incident.service}</td>
                  <td className="py-3.5 px-4 text-amber-300">{incident.error_code || 'N/A'}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-300 max-w-xs truncate">
                    {incident.description}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`badge badge-${incident.status}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectIncident(incident)}
                      className="px-3 py-1 rounded-md bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/40 font-sans text-xs font-semibold transition-colors"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
