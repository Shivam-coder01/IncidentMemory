import React, { useState } from 'react';
import { Search, Database, ShieldCheck, Tag, Clock, ArrowUpRight, CheckCircle2, Sparkles } from 'lucide-react';

interface MemoryExplorerProps {
  onSearchMemories: (query: str) => void;
  memories: any[];
  bankId: string;
}

export const MemoryExplorer: React.FC<MemoryExplorerProps> = ({
  onSearchMemories,
  memories,
  bankId,
}) => {
  const [query, setQuery] = useState('Payment API DB-504 database timeout');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchMemories(query);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
            <Database className="h-4 w-4" /> Live Hindsight Memory Inspection
          </div>
          <span className="badge badge-hindsight">
            Bank: {bankId}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white">Hindsight Memory Explorer</h2>
        <p className="text-slate-300 text-sm">
          Inspect persistent organizational memory documents directly retrieved from Hindsight. Every resolved incident persists its root cause and verified resolution steps here.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="pt-2 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Search memories e.g. database timeout, AUTH-401, connection pool..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary py-2.5 px-6">
            Search Hindsight
          </button>
        </form>
      </div>

      {/* Memory Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Showing {memories.length} persistent memory records</span>
          <span className="text-purple-300 font-medium">✓ 100% Retained via Hindsight API</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((mem, idx) => (
            <div
              key={idx}
              className="glass-panel p-5 space-y-3 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="font-mono font-bold text-purple-300 text-xs">
                  {mem.incident_id || `MEM-${idx + 1}`}
                </span>
                <span className="badge badge-hindsight text-[10px]">
                  Memory retrieved from Hindsight
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Service:</span>
                  <span className="font-bold text-white">{mem.service || 'Payment API'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Error Code:</span>
                  <span className="font-mono text-amber-300">{mem.error_code || 'DB-504'}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block">Content Summary:</span>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {mem.content || JSON.stringify(mem, null, 2)}
                  </div>
                </div>

                {mem.root_cause && (
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-purple-300 font-bold block text-[11px]">Root Cause:</span>
                    <p className="text-slate-200">{mem.root_cause}</p>
                  </div>
                )}

                {mem.resolution && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-1">
                    <span className="text-emerald-400 font-bold block text-[11px]">Verified Resolution:</span>
                    <p className="text-emerald-200">{mem.resolution}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
