import { useState } from 'react';
import { SAMPLE_PROMPT_SMS, mfsStorage } from '../services/storage';
import { ParseResult } from '../types';
import { Play, Copy, Check, AlertOctagon, ArrowRight, Sparkles, RefreshCw, FileText } from 'lucide-react';

export function SmsSimulator() {
  const [smsText, setSmsText] = useState(SAMPLE_PROMPT_SMS[0].sms);
  const [lastResult, setLastResult] = useState<ParseResult | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleParseAndIngest = (textToParse: string = smsText) => {
    setIsProcessing(true);
    // Simulate instantaneous async feel
    setTimeout(() => {
      const result = mfsStorage.processIncomingSms(textToParse);
      setLastResult(result);
      setIsProcessing(false);
    }, 50);
  };

  const handleSelectSample = (sample: (typeof SAMPLE_PROMPT_SMS)[0]) => {
    setSmsText(sample.sms);
    handleParseAndIngest(sample.sms);
  };

  const handleCopyJson = () => {
    if (!lastResult) return;
    const jsonStr = JSON.stringify(lastResult.payment || lastResult.rawLog || lastResult, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="border-b border-zinc-200 bg-zinc-50/70 px-5 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-zinc-900">SMS Parser &amp; Ingestion Engine</h2>
          </div>
          <p className="text-xs text-zinc-600 mt-0.5">
            Test real SMS messages from bKash, Nagad, Rocket, and Upay through the multi-stage modular pipeline.
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Sample SMS Presets */}
        <div>
          <span className="block text-xs font-semibold text-zinc-700 mb-2">
            Quick Test Cases (from specification):
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PROMPT_SMS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition flex items-center space-x-1.5 ${
                  smsText === sample.sms
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                <span>{sample.title}</span>
              </button>
            ))}

            {/* Explicit Duplicate Test Button */}
            <button
              type="button"
              onClick={() => {
                // Submit the exact same bKash SMS twice to trigger Section 8 duplicate protection
                const dupSms = SAMPLE_PROMPT_SMS[0].sms;
                setSmsText(dupSms);
                handleParseAndIngest(dupSms);
              }}
              className="text-xs px-3 py-1.5 rounded-lg border font-semibold text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100 transition flex items-center space-x-1"
              title="Test Section 8: Duplicate TrxID Protection"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
              <span>Test Duplicate Prevention</span>
            </button>
          </div>
        </div>

        {/* SMS Textarea Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="sms-input-textarea" className="text-xs font-semibold text-zinc-700">
              Raw SMS Message Input
            </label>
            <span className="text-[11px] text-zinc-400">
              {smsText.length} characters · URLs like bKa.sh or bit.ly automatically ignored
            </span>
          </div>
          <textarea
            id="sms-input-textarea"
            rows={3}
            value={smsText}
            onChange={(e) => setSmsText(e.target.value)}
            placeholder="Paste bKash, Nagad, or Rocket SMS text here..."
            className="w-full p-3 font-mono text-xs bg-zinc-50/50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />

          <div className="flex items-center justify-between mt-2.5">
            <button
              id="parse-sms-btn"
              type="button"
              onClick={() => handleParseAndIngest()}
              disabled={isProcessing || !smsText.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg flex items-center space-x-2 transition shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isProcessing ? 'Processing Pipeline...' : 'Parse & Ingest SMS'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSmsText('')}
              className="text-xs text-zinc-500 hover:text-zinc-700 px-2 py-1"
            >
              Clear Text
            </button>
          </div>
        </div>

        {/* Pipeline Steps Execution Visualizer */}
        {lastResult && (
          <div className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50/40">
            <div className="px-4 py-3 bg-zinc-100/70 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-zinc-600" />
                <span className="text-xs font-semibold text-zinc-800">
                  Execution Pipeline (Modular Parsers Architecture)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {lastResult.success && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    PARSED &amp; SAVED
                  </span>
                )}
                {lastResult.duplicate && (
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    DUPLICATE BLOCKED
                  </span>
                )}
                {!lastResult.success && !lastResult.duplicate && (
                  <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                    UNKNOWN SMS LOGGED
                  </span>
                )}
              </div>
            </div>

            {/* Pipeline Stage Steps */}
            <div className="p-4 space-y-2.5">
              {lastResult.pipelineSteps?.map((step, idx) => {
                const isFail = step.step.includes('FAILED') || step.step.includes('Aborted');
                const isPass = step.step.includes('Passed') || step.step.includes('Execution') || step.step.includes('Normalization');

                return (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 text-xs p-2 rounded-lg bg-white border border-zinc-200"
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] bg-zinc-100 text-zinc-600 shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-zinc-900">{step.step}</span>
                        {isFail && (
                          <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.2 rounded">
                            Notice
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-600 mt-0.5">{step.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Parsed JSON Output Viewer */}
            {(lastResult.payment || lastResult.rawLog) && (
              <div className="border-t border-zinc-200 bg-zinc-900 text-zinc-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-300">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Universal Normalized JSON Output:</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center space-x-1 bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded transition"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-[11px] font-mono overflow-x-auto p-2.5 bg-black/40 rounded text-emerald-300 max-h-56">
                  {JSON.stringify(lastResult.payment || lastResult.rawLog, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
