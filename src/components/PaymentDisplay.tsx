import { UniversalPayment } from '../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Hash,
  Phone,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface PaymentDisplayProps {
  searchedDigits: string;
  results: UniversalPayment[];
  selectedPayment: UniversalPayment | null;
  onSelectPayment: (payment: UniversalPayment) => void;
  onClearSearch: () => void;
}

export function PaymentDisplay({
  searchedDigits,
  results,
  selectedPayment,
  onSelectPayment,
  onClearSearch,
}: PaymentDisplayProps) {
  const [copiedTxn, setCopiedTxn] = useState(false);

  if (!searchedDigits || searchedDigits.length < 3) {
    return null;
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'bKash':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'Nagad':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Rocket':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Upay':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  // Case 1: NOT FOUND (No matches)
  if (results.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl border-2 border-red-200 shadow-md p-6 text-center space-y-3 animate-in zoom-in-95 duration-150">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-red-700 tracking-tight">
            ✕ PAYMENT NOT RECEIVED
          </h3>
          <p className="text-xs text-zinc-500 mt-1">পেমেন্ট পাওয়া যায়নি</p>
        </div>

        <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-xs text-zinc-700 font-mono">
          অনুসন্ধানকৃত লাস্ট ৩ ডিজিট: <span className="font-extrabold text-red-700 text-sm">{searchedDigits}</span>
        </div>

        <p className="text-xs text-zinc-500">
          এই নম্বরের লাস্ট ৩ ডিজিট দিয়ে কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি। অনুগ্রহ করে সঠিক নম্বর যাচাই করুন।
        </p>

        <button
          type="button"
          onClick={onClearSearch}
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-xl transition cursor-pointer"
        >
          নতুন অনুসন্ধান করুন
        </button>
      </div>
    );
  }

  // Case 2: MULTIPLE PAYMENTS FOUND (and user hasn't singled one out)
  if (results.length > 1 && !selectedPayment) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl border-2 border-amber-300 shadow-md overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="bg-amber-50 px-5 py-4 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Multiple Payments Found
              </h3>
              <p className="text-[11px] text-amber-700">
                লাস্ট ৩ ডিজিট &apos;{searchedDigits}&apos; দিয়ে {results.length}টি পেমেন্ট পাওয়া গেছে
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
            {results.length}টি রেকর্ড
          </span>
        </div>

        <div className="p-4 bg-amber-50/30 text-xs text-zinc-600 border-b border-amber-100">
          নিচের তালিকা থেকে আপনার নির্দিষ্ট পেমেন্টটি বেছে নিন (সর্বশেষগুলো উপরে প্রদর্শিত):
        </div>

        <div className="divide-y divide-zinc-200 max-h-72 overflow-y-auto">
          {results.map((item, idx) => (
            <button
              key={`${item.id || item.transactionId}-${idx}`}
              type="button"
              onClick={() => onSelectPayment(item)}
              className="w-full text-left p-4 hover:bg-amber-50/60 transition flex items-center justify-between group cursor-pointer"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getProviderBadge(
                      item.provider
                    )}`}
                  >
                    {item.provider}
                  </span>
                  <span className="text-sm font-extrabold text-emerald-700">
                    ৳{item.amount.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-zinc-600 font-mono">
                  {item.phoneNumber} · TrxID: {item.transactionId}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {item.date} at {item.time}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Case 3: SINGLE MATCH (or one chosen from multiple) -> ✓ PAYMENT RECEIVED
  const payment = selectedPayment || results[0];

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border-2 border-emerald-400 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
      {/* Header Banner */}
      <div className="bg-emerald-600 text-white px-5 py-4 text-center space-y-1">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 mb-1">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-extrabold tracking-wide">
          ✓ PAYMENT RECEIVED
        </h3>
        <p className="text-xs text-emerald-100 font-medium">
          পেমেন্ট সফলভাবে গ্রহণ ও যাচাই করা হয়েছে
        </p>
      </div>

      {/* Amount Hero */}
      <div className="p-5 text-center bg-emerald-50/60 border-b border-emerald-100 space-y-1">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          প্রাপ্ত টাকা / Received Amount
        </span>
        <div className="text-3xl font-black text-emerald-800 tracking-tight">
          ৳{payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="inline-block mt-1">
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getProviderBadge(
              payment.provider
            )}`}
          >
            {payment.provider} Payment
          </span>
        </div>
      </div>

      {/* Receipt Details Grid */}
      <div className="p-5 space-y-3.5 text-xs text-zinc-700">
        {/* Phone Number */}
        <div className="flex items-center justify-between py-1 border-b border-zinc-100">
          <span className="flex items-center space-x-1.5 text-zinc-500">
            <Phone className="w-3.5 h-3.5" />
            <span>প্রেরকের নম্বর (Sender Number):</span>
          </span>
          <span className="font-mono font-bold text-zinc-900 text-sm">
            {payment.phoneNumber}
          </span>
        </div>

        {/* Last 3 Digits */}
        <div className="flex items-center justify-between py-1 border-b border-zinc-100">
          <span className="flex items-center space-x-1.5 text-zinc-500">
            <Hash className="w-3.5 h-3.5" />
            <span>লাস্ট ৩ ডিজিট (Last 3 Digits):</span>
          </span>
          <span className="font-mono font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-xs">
            {payment.last3Digits}
          </span>
        </div>

        {/* Transaction ID */}
        <div className="flex items-center justify-between py-1 border-b border-zinc-100">
          <span className="flex items-center space-x-1.5 text-zinc-500">
            <Hash className="w-3.5 h-3.5" />
            <span>ট্রানজেকশন আইডি (TrxID):</span>
          </span>
          <div className="flex items-center space-x-1.5 font-mono font-bold text-zinc-900">
            <span>{payment.transactionId}</span>
            <button
              type="button"
              onClick={() => handleCopy(payment.transactionId)}
              className="text-zinc-400 hover:text-zinc-700 p-1 rounded"
              title="Copy TrxID"
            >
              {copiedTxn ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex items-center justify-between py-1 border-b border-zinc-100">
          <span className="flex items-center space-x-1.5 text-zinc-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>তারিখ ও সময় (Date &amp; Time):</span>
          </span>
          <span className="font-medium text-zinc-800">
            {payment.date} · {payment.time}
          </span>
        </div>

        {/* Reference if available */}
        {payment.reference && (
          <div className="flex items-center justify-between py-1 border-b border-zinc-100">
            <span className="text-zinc-500">রেফারেন্স (Ref):</span>
            <span className="font-mono text-zinc-800">{payment.reference}</span>
          </div>
        )}
      </div>

      {/* Back / Clear Action */}
      <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
        {results.length > 1 && selectedPayment && (
          <button
            type="button"
            onClick={() => onSelectPayment(null as any)}
            className="text-xs text-amber-700 hover:underline font-semibold cursor-pointer"
          >
            ← অন্যান্য ফলাফল দেখুন
          </button>
        )}
        <button
          type="button"
          onClick={onClearSearch}
          className="ml-auto text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-300 hover:bg-zinc-100 px-3.5 py-1.5 rounded-lg transition cursor-pointer"
        >
          নতুন অনুসন্ধান
        </button>
      </div>
    </div>
  );
}
