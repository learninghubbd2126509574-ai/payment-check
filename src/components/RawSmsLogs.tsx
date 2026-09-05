import { UnknownSmsLog } from '../types';
import { HelpCircle, Clock, Code, FileText } from 'lucide-react';

interface RawSmsLogsProps {
  logs: UnknownSmsLog[];
}

export function RawSmsLogs({ logs }: RawSmsLogsProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 p-6 text-center text-zinc-400 text-xs">
        <HelpCircle className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
        <p className="font-medium text-zinc-600">No unknown SMS logs</p>
        <p className="mt-0.5">
          Unrecognized SMS formats or promotional messages are safely captured in <code className="text-zinc-600">raw_sms_logs</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="border-b border-zinc-200 bg-zinc-50/70 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-zinc-900">
            Raw SMS Logs ({logs.length})
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          Collection: raw_sms_logs
        </span>
      </div>

      <div className="p-4 bg-zinc-50/40 border-b border-zinc-200 text-xs text-zinc-600">
        Non-payment messages, promotional texts, and unknown provider SMS are isolated here to keep the verified payments database clean while facilitating future parser upgrades.
      </div>

      <div className="divide-y divide-zinc-200">
        {logs.map((log, idx) => (
          <div key={`${log.id}-${idx}`} className="p-4 hover:bg-zinc-50/60 transition space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-zinc-500 text-[11px]">{log.id}</span>
              <div className="flex items-center space-x-1 text-zinc-400 text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(log.receivedAt).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="bg-zinc-900 text-zinc-200 p-3 rounded-lg font-mono text-xs overflow-x-auto">
              <pre className="text-amber-300 whitespace-pre-wrap font-sans text-xs mb-2">
                {log.rawSms}
              </pre>
              <div className="border-t border-zinc-800 pt-2 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>parseStatus: &quot;{log.parseStatus}&quot;</span>
                {log.detectedHint && <span className="italic text-zinc-500">{log.detectedHint}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
