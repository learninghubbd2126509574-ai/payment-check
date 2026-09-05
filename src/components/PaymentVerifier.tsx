import { useState, useMemo } from 'react';
import { UniversalPayment } from '../types';
import { mfsStorage } from '../services/storage';
import { CheckCircle2, XCircle, AlertTriangle, Search, Phone, Hash, Calendar, Clock, DollarSign, ShieldCheck } from 'lucide-react';

interface PaymentVerifierProps {
  onSelectPayment?: (payment: UniversalPayment) => void;
}

export function PaymentVerifier({ onSelectPayment }: PaymentVerifierProps) {
  const [inputLast3, setInputLast3] = useState('');
  const [expectedAmount, setExpectedAmount] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<UniversalPayment | null>(null);

  // Parse expected amount safely
  const numericExpectedAmount = expectedAmount.trim() ? parseFloat(expectedAmount) : undefined;

  // Search results strictly comparing strings
  const searchResults = useMemo(() => {
    const trimmed = inputLast3.trim();
    if (!trimmed) return [];
    return mfsStorage.searchByLast3Digits(trimmed, numericExpectedAmount);
  }, [inputLast3, numericExpectedAmount]);

  const hasSearched = inputLast3.trim().length > 0;
  const isMultiple = searchResults.length > 1;
  const isSingle = searchResults.length === 1;
  const isNotFound = hasSearched && searchResults.length === 0;

  // Active verified payment
  const activePayment = selectedMatch || (isSingle ? searchResults[0] : null);

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'bKash':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'Nagad':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Rocket':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Upay':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="border-b border-zinc-200 bg-zinc-50/70 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-zinc-900">Payment Matching & Verification</h2>
          </div>
          <span className="text-xs font-medium text-zinc-500 bg-zinc-200/70 px-2 py-0.5 rounded">
            String-Strict: &quot;049&quot; === &quot;049&quot;
          </span>
        </div>
        <p className="text-xs text-zinc-600 mt-1">
          Verify incoming payments by customer number&apos;s last 3 digits and optional expected amount.
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <label htmlFor="last-3-digits-input" className="block text-xs font-semibold text-zinc-700 mb-1">
              Customer Last 3 Digits <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="last-3-digits-input"
                type="text"
                maxLength={4}
                value={inputLast3}
                onChange={(e) => {
                  // Keep as string, allow leading zeroes like "049"
                  setInputLast3(e.target.value);
                  setSelectedMatch(null);
                }}
                placeholder="e.g. 049, 152, 823, 759"
                className="w-full pl-9 pr-3 py-2 text-sm font-mono tracking-wider bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
              <Hash className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-[11px] text-zinc-500">
              <span>Quick try:</span>
              <button
                type="button"
                onClick={() => {
                  setInputLast3('049');
                  setSelectedMatch(null);
                }}
                className="text-emerald-700 hover:underline font-mono"
              >
                049
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  setInputLast3('152');
                  setSelectedMatch(null);
                }}
                className="text-emerald-700 hover:underline font-mono"
              >
                152
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  setInputLast3('823');
                  setSelectedMatch(null);
                }}
                className="text-emerald-700 hover:underline font-mono"
              >
                823
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  setInputLast3('759');
                  setSelectedMatch(null);
                }}
                className="text-emerald-700 hover:underline font-mono"
              >
                759
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  setInputLast3('123');
                  setSelectedMatch(null);
                }}
                className="text-amber-700 font-semibold hover:underline font-mono"
                title="Test multiple matching payments"
              >
                123 (Multi)
              </button>
            </div>
          </div>

          <div className="sm:col-span-5">
            <label htmlFor="expected-amount-input" className="block text-xs font-semibold text-zinc-700 mb-1">
              Expected Amount (৳) <span className="text-zinc-400 font-normal">(Optional for disambiguation)</span>
            </label>
            <div className="relative">
              <input
                id="expected-amount-input"
                type="number"
                step="any"
                value={expectedAmount}
                onChange={(e) => {
                  setExpectedAmount(e.target.value);
                  setSelectedMatch(null);
                }}
                placeholder="e.g. 500.00"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
              <DollarSign className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Uses <span className="font-mono">last3Digits + expectedAmount</span> as preferred condition.
            </p>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              id="clear-verifier-btn"
              type="button"
              onClick={() => {
                setInputLast3('');
                setExpectedAmount('');
                setSelectedMatch(null);
              }}
              className="w-full py-2 px-3 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Dynamic Verification Output Display */}
        {!hasSearched && (
          <div className="border border-dashed border-zinc-300 rounded-lg p-6 text-center text-zinc-500">
            <Search className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
            <p className="text-sm font-medium text-zinc-700">Enter customer&apos;s last 3 digits above</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              The parser searches payment records without converting input to integers.
            </p>
          </div>
        )}

        {/* Case 1: NOT RECEIVED */}
        {isNotFound && (
          <div className="rounded-xl border border-red-200 bg-red-50/70 p-5 animate-in fade-in duration-200">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-100 rounded-full text-red-600 mt-0.5">
                <XCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-red-800 tracking-wide">✕ PAYMENT NOT RECEIVED</h3>
                <p className="text-sm text-red-700 font-medium">
                  No payment found for the last 3 digits: <span className="font-mono font-bold">{inputLast3}</span>
                  {numericExpectedAmount ? ` with amount ৳${numericExpectedAmount.toFixed(2)}` : ''}
                </p>
                <p className="text-xs text-red-600">
                  Please verify if the customer entered the correct sender number or if the SMS has arrived.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Case 2: MULTIPLE PAYMENTS FOUND (Section 7) */}
        {isMultiple && !selectedMatch && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-900">Multiple Payments Found</h3>
                  <p className="text-xs text-amber-800">
                    {searchResults.length} payments share last 3 digits &quot;{inputLast3}&quot;. Sorted by newest first.
                    Select the matching record to verify.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-200/80 text-amber-900 rounded-full">
                {searchResults.length} matches
              </span>
            </div>

            <div className="divide-y divide-amber-200/70 border border-amber-200 rounded-lg bg-white overflow-hidden">
              {searchResults.map((item, idx) => {
                const isAmountMatch =
                  numericExpectedAmount !== undefined &&
                  Math.abs(item.amount - numericExpectedAmount) < 0.01;

                return (
                  <div
                    key={`${item.id || item.transactionId}-${idx}`}
                    onClick={() => {
                      setSelectedMatch(item);
                      onSelectPayment?.(item);
                    }}
                    className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-amber-50/70 cursor-pointer transition ${
                      isAmountMatch ? 'bg-emerald-50/60 border-l-4 border-l-emerald-600' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded border ${getProviderBadge(
                          item.provider
                        )}`}
                      >
                        {item.provider}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-zinc-900">৳{item.amount.toFixed(2)}</span>
                          {isAmountMatch && (
                            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                              Preferred (Exact Amount)
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-zinc-600">
                          {item.phoneNumber} (ends {item.last3Digits}) · TrxID: {item.transactionId}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-4 text-xs text-zinc-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.date}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.time}</span>
                      </span>
                      <button
                        type="button"
                        className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded"
                      >
                        Select & Verify
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Case 3: SINGLE MATCH OR MULTIPLE RECORD CHOSEN -> PAYMENT RECEIVED (Section 6) */}
        {activePayment && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h3 className="text-lg font-extrabold text-emerald-900 tracking-wide">✓ PAYMENT RECEIVED</h3>
              </div>
              <div className="flex items-center space-x-2">
                {isMultiple && (
                  <button
                    type="button"
                    onClick={() => setSelectedMatch(null)}
                    className="text-xs text-emerald-800 underline hover:text-emerald-900 font-medium"
                  >
                    ← Back to {searchResults.length} matches
                  </button>
                )}
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded border ${getProviderBadge(
                    activePayment.provider
                  )}`}
                >
                  {activePayment.provider}
                </span>
              </div>
            </div>

            {/* Exact formatted fields as specified in Section 6 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white p-4 rounded-lg border border-emerald-200/80 text-sm">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-zinc-500">Provider</span>
                <p className="font-bold text-zinc-900">{activePayment.provider}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-medium text-zinc-500">Amount</span>
                <p className="font-extrabold text-emerald-700 text-base">৳{activePayment.amount.toFixed(2)}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-medium text-zinc-500">Number</span>
                <p className="font-mono font-semibold text-zinc-800 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{activePayment.phoneNumber}</span>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-medium text-zinc-500">Last 3 Digits</span>
                <p className="font-mono font-bold text-zinc-900 text-base">{activePayment.last3Digits}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-medium text-zinc-500">Transaction ID</span>
                <p className="font-mono font-bold text-zinc-800 select-all">{activePayment.transactionId}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-medium text-zinc-500">Date & Time</span>
                <p className="text-zinc-700 font-medium">
                  {activePayment.date} at {activePayment.time}
                </p>
              </div>

              {activePayment.reference && (
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-zinc-500">Reference (Ref)</span>
                  <p className="text-zinc-800 font-semibold">{activePayment.reference}</p>
                </div>
              )}

              {activePayment.paymentType && (
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-zinc-500">Type</span>
                  <p className="text-zinc-700 capitalize font-medium">{activePayment.paymentType.replace(/_/g, ' ')}</p>
                </div>
              )}
            </div>

            <div className="text-xs text-emerald-800/90 flex items-center justify-between">
              <span>Status: <strong className="uppercase">Received &amp; Verified</strong></span>
              <span className="text-zinc-500">Stored in normalized payments schema</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
