import { DuplicateAttemptLog } from '../types';
import { AlertOctagon, ShieldAlert, Clock, Hash, Smartphone } from 'lucide-react';

interface DuplicateLogsProps {
  logs: DuplicateAttemptLog[];
}

export function DuplicateLogs({ logs }: DuplicateLogsProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 p-6 text-center text-zinc-400 text-xs">
        <ShieldAlert className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
        <p className="font-medium text-zinc-600">No duplicate attempts recorded</p>
        <p className="mt-0.5">
          When an incoming SMS contains an existing Transaction ID, it is blocked and logged here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="border-b border-zinc-200 bg-amber-50/60 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertOctagon className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-semibold text-amber-900">
            Duplicate Protection Attempts ({logs.length})
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-800">
          Enforcing Strict Idempotency
        </span>
      </div>

      <div className="divide-y divide-zinc-200">
        {logs.map((log, idx) => (
          <div key={`${log.id}-${idx}`} className="p-4 hover:bg-zinc-50/60 transition space-y-2 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
                  REJECTED DUPLICATE
                </span>
                <span className="font-mono font-bold text-zinc-900 flex items-center space-x-1">
                  <Hash className="w-3.5 h-3.5 text-zinc-400" />
                  <span>TrxID: {log.transactionId}</span>
                </span>
                <span className="text-zinc-500">({log.provider} ৳{log.amount.toFixed(2)})</span>
              </div>

              <div className="flex items-center space-x-1 text-zinc-400 text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(log.attemptedAt).toLocaleTimeString()}</span>
              </div>
            </div>

            <p className="text-amber-800 bg-amber-50/80 p-2 rounded border border-amber-200/70 font-medium">
              {log.reason}
            </p>

            <div className="bg-zinc-50 p-2 rounded text-[11px] font-mono text-zinc-600 border border-zinc-200">
              <span className="text-zinc-400 block mb-0.5 font-sans">Incoming SMS:</span>
              <p className="line-clamp-2">{log.rawSms}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
