import { useState } from 'react';
import { UniversalPayment } from '../types';
import { mfsStorage } from '../services/storage';
import { Search, Copy, Check, ChevronDown, ChevronUp, Trash2, Filter, ExternalLink } from 'lucide-react';

interface PaymentsTableProps {
  payments: UniversalPayment[];
  onVerifyLast3?: (last3: string) => void;
}

export function PaymentsTable({ payments, onVerifyLast3 }: PaymentsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedTxn, setCopiedTxn] = useState<string | null>(null);

  const filtered = payments.filter((item) => {
    if (providerFilter !== 'ALL' && item.provider !== providerFilter) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.transactionId.toLowerCase().includes(q) ||
      item.phoneNumber.toLowerCase().includes(q) ||
      item.last3Digits.toLowerCase().includes(q) ||
      item.amount.toString().includes(q)
    );
  });

  const handleCopyTxn = (txn: string) => {
    navigator.clipboard.writeText(txn);
    setCopiedTxn(txn);
    setTimeout(() => setCopiedTxn(null), 2000);
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'bKash':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'Nagad':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Rocket':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Upay':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      {/* Header & Filters */}
      <div className="border-b border-zinc-200 bg-zinc-50/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            Parsed Payments Database ({payments.length})
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time normalized schema records stored from bKash, Nagad, Rocket, and Upay.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Provider Filter */}
          <div className="flex items-center space-x-1 bg-white border border-zinc-300 rounded-lg p-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400 ml-1" />
            {['ALL', 'bKash', 'Nagad', 'Rocket', 'Upay'].map((prov) => (
              <button
                key={prov}
                type="button"
                onClick={() => setProviderFilter(prov)}
                className={`px-2 py-1 rounded font-medium transition ${
                  providerFilter === prov
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {prov}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search TrxID, Phone, 3-digits..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 w-44 sm:w-56"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2" />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-700">
          <thead className="bg-zinc-100/70 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Provider</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Phone / Account</th>
              <th className="py-3 px-4">Last 3</th>
              <th className="py-3 px-4">Transaction ID</th>
              <th className="py-3 px-4">Date &amp; Time</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-zinc-400 text-xs">
                  No payment records found matching your filters.
                </td>
              </tr>
            ) : (
              filtered.map((payment, idx) => {
                const isExpanded = expandedId === payment.id;
                return (
                  <tr
                    key={`${payment.id || payment.transactionId}-${idx}`}
                    className="hover:bg-zinc-50/80 transition group"
                  >
                    <td className="py-3 px-4 font-semibold">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${getProviderBadge(
                          payment.provider
                        )}`}
                      >
                        {payment.provider}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize font-medium text-zinc-600">
                      {payment.paymentType.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700 text-sm">
                      ৳{payment.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-zinc-800">
                      {payment.phoneNumber}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => onVerifyLast3?.(payment.last3Digits)}
                        title="Click to test matching in Payment Verifier"
                        className="font-mono font-extrabold text-zinc-900 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded transition text-xs"
                      >
                        {payment.last3Digits}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-zinc-900">
                      <div className="flex items-center space-x-1.5">
                        <span>{payment.transactionId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyTxn(payment.transactionId)}
                          className="text-zinc-400 hover:text-zinc-700 transition"
                          title="Copy TrxID"
                        >
                          {copiedTxn === payment.transactionId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 whitespace-nowrap">
                      <span>{payment.date}</span> <span className="text-zinc-400">·</span>{' '}
                      <span>{payment.time}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : payment.id)}
                          className="text-zinc-500 hover:text-zinc-800 p-1 rounded hover:bg-zinc-100"
                          title="Inspect raw SMS &amp; JSON schema"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => mfsStorage.deletePayment(payment.id)}
                          className="text-zinc-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Expanded Row Detail Drawer/Modal if an item is expanded */}
      {expandedId && (
        (() => {
          const item = payments.find((p) => p.id === expandedId);
          if (!item) return null;
          return (
            <div className="border-t border-zinc-200 bg-zinc-900 text-zinc-200 p-4 space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                <span className="font-bold text-zinc-100">
                  Universal Record Inspector: TrxID {item.transactionId}
                </span>
                <button
                  type="button"
                  onClick={() => setExpandedId(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  Close [✕]
                </button>
              </div>

              <div>
                <span className="text-zinc-400 block mb-1">Original Raw SMS:</span>
                <p className="bg-zinc-800 p-2.5 rounded text-zinc-300 font-sans text-xs select-all whitespace-pre-wrap">
                  {item.rawSms}
                </p>
              </div>

              <div>
                <span className="text-zinc-400 block mb-1">Normalized Database Schema:</span>
                <pre className="bg-black/40 p-2.5 rounded text-emerald-300 overflow-x-auto text-[11px]">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}
