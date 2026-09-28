import React from 'react';
import { Split, CheckCircle2, XCircle, Clock, Zap, Database, ArrowRight } from 'lucide-react';

interface BeforeAfterToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  service?: string;
  errorCode?: string;
}

export const BeforeAfterToggle: React.FC<BeforeAfterToggleProps> = ({
  isVisible,
  onToggle,
  service = 'Payment API',
  errorCode = 'DB-504',
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between glass-panel p-4 bg-purple-950/30 border-purple-800/50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Split className="h-4 w-4" />
          </div>
          <div>
            <span className="font-heading font-bold text-white text-sm">
              Hackathon Judge Comparison: Persistent Memory Impact
            </span>
            <p className="text-xs text-slate-300">
              Compare generic AI investigation (Without Memory) vs Hindsight-enhanced investigation (With Persistent Memory).
            </p>
          </div>
        </div>

        <button
          onClick={onToggle}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            isVisible
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-slate-800 text-purple-300 border border-purple-500/30 hover:bg-slate-700'
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          {isVisible ? 'Hide Comparison' : 'Show Before vs After Contrast'}
        </button>
      </div>

      {isVisible && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {/* WITHOUT MEMORY PANEL */}
          <div className="glass-panel p-6 border-rose-500/30 bg-rose-950/10 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
              <span className="flex items-center gap-2 font-bold text-rose-300 text-sm">
                <XCircle className="h-4 w-4 text-rose-400" /> WITHOUT MEMORY (Generic AI)
              </span>
              <span className="text-[11px] font-mono text-slate-400">Stateless LLM</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 font-mono">
                No historical organizational context available.
              </div>

              <div>
                <span className="font-semibold text-slate-300 block mb-1.5">Generic Advice:</span>
                <ul className="space-y-1.5 text-slate-400 list-disc pl-4 font-mono">
                  <li>Check database network connectivity</li>
                  <li>Verify user database credentials</li>
                  <li>Inspect firewall port 5432</li>
                  <li>Restart service instance</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 space-y-1 text-rose-200">
                <div className="flex items-center gap-1.5 font-bold">
                  <Clock className="h-3.5 w-3.5 text-rose-400" /> MTTR: ~35-45 Minutes
                </div>
                <p className="text-[11px] text-rose-300">
                  Engineer is forced to debug connection pool limits from scratch despite identical past incident.
                </p>
              </div>
            </div>
          </div>

          {/* WITH HINDSIGHT PERSISTENT MEMORY PANEL */}
          <div className="glass-panel glass-glow-purple p-6 border-purple-500/40 bg-purple-950/20 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
              <span className="flex items-center gap-2 font-bold text-purple-200 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> WITH HINDSIGHT MEMORY
              </span>
              <span className="badge badge-hindsight">Hindsight SDK</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-purple-800/50 text-purple-200 font-mono">
                Recalled 2 matching past memories (INC-017 & INC-023)
              </div>

              <div>
                <span className="font-semibold text-purple-200 block mb-1.5">Evidence-Based Action:</span>
                <ul className="space-y-1.5 text-purple-200 list-disc pl-4 font-mono">
                  <li><strong className="text-amber-300">RECURRING INCIDENT DETECTED</strong> on {service}</li>
                  <li>Confirmed Root Cause: Connection pool exhaustion</li>
                  <li>Proven Fix: Increase pool size from 20 to 50 in pool_config.yaml</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 space-y-1 text-emerald-200">
                <div className="flex items-center gap-1.5 font-bold">
                  <Zap className="h-3.5 w-3.5 text-emerald-400" /> MTTR: &lt; 5 Minutes
                </div>
                <p className="text-[11px] text-emerald-300">
                  Incident resolved immediately using historical solution retained from previous on-call engineer!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
