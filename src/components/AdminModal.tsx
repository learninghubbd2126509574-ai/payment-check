import { useState, FormEvent } from 'react';
import { mfsStorage } from '../services/storage';
import { UniversalPayment } from '../types';
import {
  Lock,
  Unlock,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Play,
  Database,
  Eye,
  EyeOff,
  Cloud,
  Smartphone,
  Copy,
  Check,
  Globe,
  RefreshCw,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { firebaseConfig, databaseId } from '../services/firebase';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: UniversalPayment[];
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (val: boolean) => void;
}

export function AdminModal({
  isOpen,
  onClose,
  payments,
  isAdminAuthenticated,
  setIsAdminAuthenticated,
}: AdminModalProps) {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearSuccessMsg, setClearSuccessMsg] = useState('');
  const [testSms, setTestSms] = useState('');
  const [smsFeedback, setSmsFeedback] = useState<string | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [activeTab, setActiveTab] = useState<'payments' | 'logs' | 'setup'>('payments');

  if (!isOpen) return null;

  const duplicateLogs = mfsStorage.getDuplicateLogs();
  const rawSmsLogs = mfsStorage.getRawSmsLogs();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === '212650') {
      setIsAdminAuthenticated(true);
      setErrorMsg('');
      setPasswordInput('');
    } else {
      setErrorMsg('ভুল পাসওয়ার্ড! আবার চেষ্টা করুন');
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setPasswordInput('');
    setErrorMsg('');
  };

  const handleClearAllData = () => {
    mfsStorage.clearAll();
    setShowClearConfirm(false);
    setClearSuccessMsg('সকল ডাটা সফলভাবে ক্লিয়ার করা হয়েছে! (All Data Cleared from Local & Firebase)');
    setTimeout(() => setClearSuccessMsg(''), 3500);
  };

  const handleIngestSms = () => {
    if (!testSms.trim()) return;
    const result = mfsStorage.processIncomingSms(testSms);
    if (result.success && result.payment) {
      setSmsFeedback(`✓ SMS সফলভাবে যুক্ত ও ক্লাউডে সিঙ্ক হয়েছে! TrxID: ${result.payment.transactionId} (৳${result.payment.amount})`);
    } else if (result.duplicate) {
      setSmsFeedback(`⚠️ ডুপ্লিকেট ট্রানজেকশন ID: ${result.error || 'ইতিমধ্যে সংরক্ষিত আছে'}`);
    } else {
      setSmsFeedback(`❌ পার্স করা যায়নি, র-লগে সেভ হয়েছে।`);
    }
    setTimeout(() => setSmsFeedback(null), 4000);
  };

  const firestoreApiUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${databaseId || '(default)'}/documents/raw_sms`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              {isAdminAuthenticated ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Unity Earning · অ্যাডমিন প্যানেল</h2>
              <p className="text-[11px] text-zinc-400">
                {isAdminAuthenticated ? 'লগইন স্ট্যাটাস: অথরাইজড অ্যাডমিন' : 'অ্যাডমিন এক্সেস প্রয়োজন'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {!isAdminAuthenticated ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto py-6">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-zinc-100 mx-auto flex items-center justify-center text-zinc-600 mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900">অ্যাডমিন পাসওয়ার্ড দিন</h3>
                <p className="text-xs text-zinc-500">
                  ডাটা ক্লিয়ার বা ক্লাউড সিঙ্ক ম্যানেজ করতে পাসওয়ার্ড দিয়ে লগইন করুন।
                </p>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="পাসওয়ার্ড লিখুন..."
                    autoFocus
                    className="w-full px-4 py-2.5 text-sm bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 font-mono transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-600 font-medium text-center">{errorMsg}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-black text-white text-sm font-semibold transition cursor-pointer shadow-xs"
              >
                লগইন করুন
              </button>
            </form>
          ) : (
            /* Authenticated Admin Dashboard */
            <div className="space-y-5">
              {/* Notification Banner */}
              {clearSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{clearSuccessMsg}</span>
                </div>
              )}

              {/* Status Header */}
              <div className="bg-zinc-900 text-white p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">Firebase Firestore লাইভ কানেক্টেড</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Database: {databaseId || '(default)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-zinc-300">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Vercel Deploy Ready</span>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex border-b border-zinc-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('payments')}
                  className={`pb-2 px-3 border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
                    activeTab === 'payments'
                      ? 'border-zinc-900 text-zinc-900'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>সংরক্ষিত পেমেন্ট ({payments.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('logs')}
                  className={`pb-2 px-3 border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
                    activeTab === 'logs'
                      ? 'border-zinc-900 text-zinc-900'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>
                    ডুপ্লিকেট ও মেসেজ হিস্ট্রি ({duplicateLogs.length + rawSmsLogs.length})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('setup')}
                  className={`pb-2 px-3 border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
                    activeTab === 'setup'
                      ? 'border-zinc-900 text-zinc-900'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>মোবাইল অটো-সিঙ্ক ও ক্লিয়ার</span>
                </button>
              </div>

              {/* TAB 1: PAYMENTS */}
              {activeTab === 'payments' && (
                <div className="space-y-4">
                  {/* Manual Test Ingestion */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-zinc-800">
                        <Play className="w-3.5 h-3.5 text-zinc-700" />
                        <span>ম্যানুয়াল SMS যোগ করুন</span>
                      </div>
                      <span className="text-[10px] text-zinc-400">bKash, Nagad, Rocket, Upay</span>
                    </div>

                    {smsFeedback && (
                      <div className="text-xs p-2 rounded-lg bg-zinc-900 text-emerald-400 font-medium">
                        {smsFeedback}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={testSms}
                        onChange={(e) => setTestSms(e.target.value)}
                        placeholder="পেমেন্ট SMS পেস্ট করুন..."
                        className="flex-1 p-2 text-xs font-mono bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={handleIngestSms}
                        disabled={!testSms.trim()}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center space-x-1 cursor-pointer shrink-0"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>সেভ</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment List */}
                  <div className="border border-zinc-200 rounded-xl overflow-hidden">
                    <div className="bg-zinc-100 px-3.5 py-2.5 border-b border-zinc-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-800">
                        পেমেন্ট রেকর্ড তালিকা ({payments.length} টি)
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        লাস্ট ৩ ডিজিট সার্চের জন্য সক্রিয়
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-zinc-200 text-xs">
                      {payments.length === 0 ? (
                        <div className="p-6 text-center text-zinc-400">
                          কোনো পেমেন্ট রেকর্ড নেই।
                        </div>
                      ) : (
                        payments.map((p, idx) => (
                          <div
                            key={`${p.id}-${idx}`}
                            className="p-3 flex items-center justify-between hover:bg-zinc-50 transition"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2 font-mono">
                                <span className="font-bold text-zinc-900">{p.provider}</span>
                                <span className="text-emerald-700 font-bold">
                                  ৳{p.amount.toFixed(2)}
                                </span>
                                <span className="text-zinc-500">({p.phoneNumber})</span>
                              </div>
                              <div className="text-[11px] text-zinc-500 font-mono">
                                লাস্ট ৩ ডিজিট:{' '}
                                <b className="text-zinc-900 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                                  {p.last3Digits}
                                </b>{' '}
                                · TrxID: {p.transactionId} · {p.time}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => mfsStorage.deletePayment(p.id)}
                              className="text-zinc-400 hover:text-red-600 p-1.5 rounded transition cursor-pointer"
                              title="ডিলিট করুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LOGS & DUPLICATES */}
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>ডুপ্লিকেট ট্রানজেকশন প্রটেকশন তথ্য</span>
                    </div>
                    <p className="leading-relaxed text-[11.5px]">
                      একই TrxID দিয়ে যাতে প্রতারণা বা ডাবল পেমেন্ট ক্লেইম না হতে পারে, সেজন্য সিস্টেম একই TrxID দ্বিতীয়বার রিসিভ করলে তা স্বয়ংক্রিয়ভাবে ব্লক করে দেয়।
                    </p>
                  </div>

                  {/* Duplicate Logs Section */}
                  <div className="border border-zinc-200 rounded-xl overflow-hidden">
                    <div className="bg-zinc-100 px-3.5 py-2 border-b border-zinc-200 flex items-center justify-between text-xs font-bold text-zinc-800">
                      <span>আটকে যাওয়া ডুপ্লিকেট চেষ্টার তালিকা ({duplicateLogs.length})</span>
                    </div>

                    <div className="max-h-48 overflow-y-auto divide-y divide-zinc-200 text-xs">
                      {duplicateLogs.length === 0 ? (
                        <div className="p-4 text-center text-zinc-400">
                          কোনো ডুপ্লিকেট পেমেন্ট চেষ্টার রেকর্ড নেই।
                        </div>
                      ) : (
                        duplicateLogs.map((dup) => (
                          <div key={dup.id} className="p-3 bg-red-50/40 space-y-1">
                            <div className="flex items-center justify-between text-red-900 font-bold">
                              <span>TrxID: {dup.transactionId}</span>
                              <span className="text-[11px] text-zinc-500 font-normal">
                                {new Date(dup.attemptedAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-red-700">{dup.reason}</p>
                            <p className="text-[10px] text-zinc-500 font-mono truncate">
                              SMS: {dup.rawSms}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Raw Unparsed / Unknown Logs */}
                  {rawSmsLogs.length > 0 && (
                    <div className="border border-zinc-200 rounded-xl overflow-hidden">
                      <div className="bg-zinc-100 px-3.5 py-2 border-b border-zinc-200 text-xs font-bold text-zinc-800">
                        অন্যান্য মেসেজ লগ ({rawSmsLogs.length})
                      </div>
                      <div className="max-h-36 overflow-y-auto divide-y divide-zinc-200 text-xs">
                        {rawSmsLogs.map((log) => (
                          <div key={log.id} className="p-2.5 text-zinc-600 font-mono text-[11px]">
                            {log.rawSms}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SETUP & CLEAR */}
              {activeTab === 'setup' && (
                <div className="space-y-4">
                  {/* Phone Sync Setup */}
                  <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center space-x-2 text-sky-950 font-bold text-xs">
                      <Smartphone className="w-4 h-4 text-sky-600" />
                      <h4>মোবাইল MacroDroid কনফিগারেশন এন্ডপয়েন্ট</h4>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-sky-300 flex items-center justify-between gap-2 font-mono text-[11px] text-zinc-800">
                      <span className="truncate">{firestoreApiUrl}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(firestoreApiUrl)}
                        className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-md font-sans text-xs flex items-center space-x-1 shrink-0 cursor-pointer"
                      >
                        {copiedEndpoint ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedEndpoint ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-sky-800 leading-relaxed">
                      💡 <b>টিপস:</b> বিকাশ/নগদের মেসেজ ফোনে এলে MacroDroid এর মাধ্যমে এই URL এ POST
                      হয়ে ফায়ারবেসে জমা হবে। এরপর অ্যাপ স্বয়ংক্রিয়ভাবে ট্রানজেকশন প্রসেস করবে।
                    </p>
                  </div>

                  {/* All Clear Data Action */}
                  <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <h4 className="text-xs font-bold text-red-900">
                            ডাটা ক্লিয়ার অপশন (All Clear)
                          </h4>
                        </div>
                        <p className="text-[11px] text-red-700">
                          সকল ডেমো পেমেন্ট ও পুরনো মেসেজ সম্পূর্ণ মুছে ফেলতে অল ক্লিয়ার করুন।
                        </p>
                      </div>
                      <span className="text-xs font-bold text-zinc-700 bg-white px-2 py-0.5 rounded border border-red-200 shrink-0">
                        রেকর্ড: {payments.length}
                      </span>
                    </div>

                    {!showClearConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(true)}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>অল ক্লিয়ার (Clear All Data)</span>
                      </button>
                    ) : (
                      <div className="bg-white p-3 rounded-xl border border-red-300 space-y-2 animate-in fade-in">
                        <p className="text-xs font-bold text-red-700">
                          ⚠️ আপনি কি নিশ্চিত যে আপনি সকল ডাটা মুছে ফেলতে চান?
                        </p>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={handleClearAllData}
                            className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer"
                          >
                            হ্যাঁ, সকল ডাটা মুছুন
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowClearConfirm(false)}
                            className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition cursor-pointer"
                          >
                            বাতিল
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Logout button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-zinc-500 hover:text-zinc-900 underline font-medium cursor-pointer"
                >
                  অ্যাডমিন লগআউট করুন
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
