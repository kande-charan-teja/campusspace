import React from 'react';
import {
  Compass,
  Search,
  BarChart3,
  Building2,
  Database,
  BookOpen,
  Menu,
  X,
  Layers,
  AlertCircle
} from 'lucide-react';

export type NavTab = 'overview' | 'finder' | 'analytics' | 'rooms' | 'data' | 'methodology';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  datasetLoaded: boolean;
  isCustomData: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  datasetLoaded,
  isCustomData
}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: Compass },
    { id: 'finder' as NavTab, label: 'Smart Room Finder', icon: Search },
    { id: 'analytics' as NavTab, label: 'Demand Analytics', icon: BarChart3 },
    { id: 'rooms' as NavTab, label: 'Rooms Catalog', icon: Building2 },
    { id: 'data' as NavTab, label: 'Data Management', icon: Database },
    { id: 'methodology' as NavTab, label: 'Methodology & Ethics', icon: BookOpen },
  ];

  const handleSelect = (tab: NavTab) => {
    onTabChange(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm border border-teal-500/30">
            CS
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight text-white block">CampusSpace AI</span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">Datathon Space Engine</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Desktop Sidebar & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Zone */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                CampusSpace
                <span className="text-[11px] font-semibold text-teal-400 bg-teal-950/80 border border-teal-500/30 px-1.5 py-0.2 rounded">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">Datathon Space Allocation</p>
            </div>
          </div>
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Workspaces
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* System & Dataset Badge */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/80">
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Dataset Status</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                datasetLoaded ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-amber-950 text-amber-400'
              }`}>
                {datasetLoaded ? (isCustomData ? 'Custom CSV' : 'Active (4 CSVs)') : 'Loading'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              120 Rooms · 5K Classes · 1.8K Events · 5K Requests
            </p>
          </div>

          <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-500 leading-tight">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>Synthetic datathon dataset. Conflicts calculated from loaded records.</span>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}
    </>
  );
};
