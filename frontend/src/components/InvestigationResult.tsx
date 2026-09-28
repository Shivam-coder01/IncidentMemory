import React, { useState } from 'react';
import { InvestigationResponse } from '../types';
import { MemoryStepper } from './MemoryStepper';
import { BeforeAfterToggle } from './BeforeAfterToggle';
import { Database, AlertTriangle, CheckCircle2, ShieldCheck, Cpu, Lightbulb, FileText } from 'lucide-react';

interface InvestigationResultProps {
  data: InvestigationResponse;
  onResolve: () => void;
}

export const InvestigationResult: React.FC<InvestigationResultProps> = ({
  data,
  onResolve,
}) => {
  const [showComparison, setShowComparison] = useState(false);
  const { investigation, recalled_memories, hindsight_available, execution_steps } = data;

  return (
    <div className="space-y-6">
      {/* Visual Execution Stepper */}
      <MemoryStepper
        steps={execution_steps}
        hindsightAvailable={hindsight_available}
        memoriesCount={recalled_memories.length}
      />

      {/* Before vs After Contrast Banner */}
      <BeforeAfterToggle
        isVisible={showComparison}
        onToggle={() => setShowComparison(!showComparison)}
        service={recalled_memories[0]?.service || 'Payment API'}
        errorCode={recalled_memories[0]?.error_code || 'DB-504'}
      />

      {/* Incident Summary Card */}
      <div className="glass-panel p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-purple-400" /> Incident Diagnostic Summary
          </span>
          <span className="badge badge-hindsight">
            Confidence: {investigation.confidence_level}
          </span>
        </div>
        <h3 className="text-xl font-bold text-white">{investigation.incident_summary}</h3>

        {investigation.recurring_pattern_detected && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>RECURRING INCIDENT DETECTED — 2+ previous incidents matched identical symptoms.</span>
          </div>
        )}
      </div>

      {/* Recalled Hindsight Memories Section */}
      <div className="glass-panel p-6 border-purple-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-400" /> Recalled Hindsight Memories ({recalled_memories.length})
          </h3>
          <span className="text-xs text-slate-400">
            Retrieved from Hindsight Bank
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recalled_memories.length > 0 ? (
            recalled_memories.map((mem, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-purple-300 font-bold font-mono">
                  <span>{mem.incident_id || `MEMORY #${idx + 1}`}</span>
                  <span className="text-slate-400 font-sans">{mem.service}</span>
                </div>
                <div className="text-slate-300 font-mono text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                  {mem.content || JSON.stringify(mem, null, 2)}
                </div>
                <div className="text-[11px] text-emerald-400 font-medium">
                  ✓ Historical Fix: {mem.resolution || 'Increased pool size from 20 to 50'}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-4 text-center text-xs text-slate-400 italic">
              No historical matches returned for this exact query.
            </div>
          )}
        </div>
      </div>

      {/* AI Investigation Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Possible Root Causes */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" /> Likely Root Causes
          </h3>
          <div className="space-y-3">
            {investigation.possible_root_causes.map((rc, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">{rc.cause}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    rc.likelihood === 'High' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {rc.likelihood} Likelihood
                  </span>
                </div>
                <p className="text-xs text-slate-400">{rc.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Investigation Steps */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" /> Recommended Action Steps
          </h3>
          <ol className="space-y-2 text-xs text-slate-300">
            {investigation.recommended_investigation_steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <span className="h-5 w-5 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold shrink-0 text-[11px]">
                  {idx + 1}
                </span>
                <span className="leading-snug pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Historical Evidence & Resolution Action Bar */}
      <div className="glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-xs">
          <div className="font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" /> Historical Evidence Verified
          </div>
          <p className="text-slate-300 max-w-xl">
            {investigation.historical_evidence}
          </p>
        </div>

        <button
          onClick={onResolve}
          className="btn-success text-sm py-3 px-6 whitespace-nowrap shadow-lg shadow-emerald-500/20"
        >
          <CheckCircle2 className="h-4 w-4" /> RESOLVE & SAVE TO HINDSIGHT
        </button>
      </div>
    </div>
  );
};
