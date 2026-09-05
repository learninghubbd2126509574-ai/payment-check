import { Smartphone, RefreshCw, ShieldCheck, Database, Layers } from 'lucide-react';
import { mfsStorage } from '../services/storage';

interface HeaderProps {
  totalPayments: number;
  totalVolume: number;
  duplicateCount: number;
  rawLogsCount: number;
}

export function Header({
  totalPayments,
  totalVolume,
  duplicateCount,
  rawLogsCount,
}: HeaderProps) {
  const handleResetData = () => {
    if (window.confirm('সকল লোকাল ও ক্লাউড ডাটা ক্লিয়ার করতে চান?')) {
      mfsStorage.clearAll();
    }
  };

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Brand & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
                  MFS Payment SMS Parser
                </h1>
                <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Real-time Normalizer
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-zinc-500 mt-0.5">
                <span>Supported:</span>
                <span className="font-semibold text-pink-600">bKash</span>
                <span>·</span>
                <span className="font-semibold text-orange-600">Nagad</span>
                <span>·</span>
                <span className="font-semibold text-purple-600">Rocket</span>
                <span>·</span>
                <span className="font-semibold text-blue-600">Upay</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Stat: Payments */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-bold leading-none">
                  Verified
                </span>
                <span className="text-xs font-bold text-zinc-800">
                  {totalPayments} (৳{totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })})
                </span>
              </div>
            </div>

            {/* Stat: Duplicates Blocked */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-bold leading-none">
                  Dup Blocked
                </span>
                <span className="text-xs font-bold text-amber-700">{duplicateCount}</span>
              </div>
            </div>

            {/* Stat: Raw Logs */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-bold leading-none">
                  Raw Logs
                </span>
                <span className="text-xs font-bold text-indigo-700">{rawLogsCount}</span>
              </div>
            </div>

            {/* Reset / Reseed Button */}
            <button
              id="reseed-sample-btn"
              type="button"
              onClick={handleResetData}
              className="text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 px-3 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-xs"
              title="Reload sample SMS dataset from prompt specification"
            >
              <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
              <span>Reseed Samples</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
