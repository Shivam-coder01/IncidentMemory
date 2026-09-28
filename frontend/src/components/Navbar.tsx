import React from 'react';
import { Brain, LayoutDashboard, Search, Database, Clock, Zap, Layers } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  demoMode,
  setDemoMode,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'investigate', label: 'Investigate', icon: Search },
    { id: 'explorer', label: 'Hindsight Explorer', icon: Database },
    { id: 'timeline', label: 'Incident Timeline', icon: Clock },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                Incident<span className="text-purple-400">Memory</span>
              </span>
              <span className="badge badge-hindsight text-[10px] py-0.5 px-2">
                Hindsight SDK
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Every incident becomes knowledge for the next one.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Demo Mode Toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-900/60 hover:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors">
            <Zap className={`h-4 w-4 ${demoMode ? 'text-amber-400 fill-amber-400/20' : 'text-slate-500'}`} />
            <span className="text-xs font-semibold text-slate-300">
              Demo Mode
            </span>
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-8 h-4 rounded-full transition-colors relative ${demoMode ? 'bg-purple-600' : 'bg-slate-700'}`}>
              <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${demoMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
          </label>
        </div>
      </div>
    </header>
  );
};
