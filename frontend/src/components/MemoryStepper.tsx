import React from 'react';
import { ExecutionStep } from '../types';
import { CheckCircle2, Loader2, Database, Brain, Search, Sparkles } from 'lucide-react';

interface MemoryStepperProps {
  steps: ExecutionStep[];
  hindsightAvailable: boolean;
  memoriesCount: number;
}

export const MemoryStepper: React.FC<MemoryStepperProps> = ({
  steps,
  hindsightAvailable,
  memoriesCount,
}) => {
  return (
    <div className="glass-panel p-6 border-purple-500/30 bg-purple-950/20 space-y-4">
      <div className="flex items-center justify-between border-b border-purple-800/40 pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          <span className="font-heading font-bold text-white text-sm uppercase tracking-wider">
            Agent Hindsight Execution Pipeline
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-hindsight">
            <Database className="h-3 w-3" /> Hindsight Active
          </span>
          <span className="text-xs font-semibold text-purple-300">
            {memoriesCount} Memory Documents Found
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
        {steps.map((stepItem, idx) => {
          const isDone = stepItem.status === 'completed';
          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border transition-all ${
                isDone
                  ? 'bg-purple-900/30 border-purple-500/40 text-purple-200'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <Loader2 className="h-4 w-4 text-purple-400 animate-spin shrink-0" />
                )}
                <span className="text-xs font-bold font-heading truncate">
                  {stepItem.step}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-tight">
                {stepItem.detail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
