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
  ExternalLink,
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

  if (!isOpen) return null;

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === '212650') {
      setIsAdminAuthenticated(true);
      setErrorMsg('');
      setPasswordInput('');
    } else {
      setErrorMsg('ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন (Password: 212650)');
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
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
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
                    placeholder="পাসওয়ার্ড লিখুন (212650)"
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
            <div className="space-y-6">
              {/* Notification Banner */}
              {clearSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{clearSuccessMsg}</span>
                </div>
              )}

              {/* Cloud & Firebase Connection Status Card */}
              <div className="bg-zinc-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">Firebase Firestore ক্লাউড কানেক্টেড</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      Project: {firebaseConfig.projectId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[11px] bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-700 text-zinc-300">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Vercel Deploy Ready (vercel.json active)</span>
                </div>
              </div>

              {/* Data Clear Action Card (The primary request!) */}
              <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <h4 className="text-sm font-bold text-red-900">ডাটা ক্লিয়ার অপশন (All Clear)</h4>
                    </div>
                    <p className="text-xs text-red-700">
                      জমে থাকা সকল পেমেন্ট রেকর্ড এবং ক্লাউড মেসেজ হিস্ট্রি এক ক্লিকে সম্পূর্ণ মুছে ফেলতে নিচের বাটনে ক্লিক করুন।
                    </p>
                  </div>
                  <span className="text-xs font-bold text-zinc-700 bg-white px-2.5 py-1 rounded-lg border border-red-200 shrink-0">
                    মোট রেকর্ড: {payments.length}
                  </span>
                </div>

                {!showClearConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>অল ক্লিয়ার (Clear All Data)</span>
                  </button>
                ) : (
                  <div className="bg-white p-3.5 rounded-xl border border-red-300 space-y-2 animate-in fade-in">
                    <p className="text-xs font-bold text-red-700">
                      ⚠️ আপনি কি নিশ্চিত যে আপনি সকল ডাটা মুছে ফেলতে চান? এটি Firebase ক্লাউড থেকেও মুছে যাবে।
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleClearAllData}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer"
                      >
                        হ্যাঁ, সকল ডাটা মুছুন
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(false)}
                        className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition cursor-pointer"
                      >
                        বাতিল
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Phone SMS to Firebase Sync Guide */}
              <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center space-x-2 text-sky-950 font-bold text-sm">
                  <Smartphone className="w-4 h-4 text-sky-600" />
                  <h4>মোবাইল ফোন থেকে অফলাইন SMS স্বয়ংক্রিয়ভাবে পাঠানোর নিয়ম</h4>
                </div>

                <div className="text-xs text-sky-900 space-y-2 leading-relaxed">
                  <p>
                    আপনার অ্যান্ড্রয়েড ফোনে যখন bKash, Nagad বা Rocket এর SMS আসবে, তখন সেটি স্বয়ংক্রিয়ভাবে ফায়ারবেসে পাঠানোর জন্য নিচের যেকোনো একটি ফ্রি অ্যাপ ব্যবহার করতে পারেন:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 pl-1 text-[12px] font-medium text-sky-950">
                    <li>
                      <b>SMS Forwarder (by Lan兵)</b> অথবা <b>MacroDroid</b> অ্যাপটি গুগল প্লে-স্টোর থেকে ইনস্টল করুন।
                    </li>
                    <li>
                      একটি রুল তৈরি করুন: বিকাশ/নগদ/রকেট থেকে নতুন SMS এলে তা Webhook/URL এ পাঠাবে।
                    </li>
                    <li>
                      টার্গেট URL হিসেবে নিচের Firestore REST Endpoint ব্যবহার করুন:
                    </li>
                  </ol>

                  {/* Copyable Endpoint Box */}
                  <div className="bg-white p-2.5 rounded-xl border border-sky-300 flex items-center justify-between gap-2 font-mono text-[11px] text-zinc-800">
                    <span className="truncate">{firestoreApiUrl}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(firestoreApiUrl)}
                      className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-md font-sans text-xs flex items-center space-x-1 shrink-0 cursor-pointer"
                    >
                      {copiedEndpoint ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEndpoint ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-sky-800">
                    💡 <b>টিপ:</b> অথবা সরাসরি এই অ্যাডমিন প্যানেল থেকে যেকোনো সময় নতুন SMS পেস্ট করে যুক্ত করতে পারেন।
                  </p>
                </div>
              </div>

              {/* Add / Test Incoming SMS Section */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Play className="w-4 h-4 text-zinc-800" />
                    <h4 className="text-sm font-bold text-zinc-900">ম্যানুয়াল SMS ইনপুট (Add Incoming SMS)</h4>
                  </div>
                  <span className="text-[11px] text-zinc-500">bKash, Nagad, Rocket, Upay</span>
                </div>

                {smsFeedback && (
                  <div className="text-xs p-2.5 rounded-lg bg-zinc-900 text-emerald-400 font-medium">
                    {smsFeedback}
                  </div>
                )}

                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={testSms}
                    onChange={(e) => setTestSms(e.target.value)}
                    placeholder="যেকোনো পেমেন্ট SMS এখানে পেস্ট করুন..."
                    className="w-full p-2.5 text-xs font-mono bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleIngestSms}
                      disabled={!testSms.trim()}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>মেসেজ পার্স ও সেভ করুন</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stored Payments Overview */}
              <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                <div className="bg-zinc-100 px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-zinc-800">
                    <Database className="w-4 h-4 text-zinc-600" />
                    <span>সংরক্ষিত পেমেন্ট তালিকা ({payments.length})</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    মোট: {payments.length} টি
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto divide-y divide-zinc-200 text-xs">
                  {payments.length === 0 ? (
                    <div className="p-4 text-center text-zinc-400">
                      কোনো পেমেন্ট সংরক্ষিত নেই।
                    </div>
                  ) : (
                    payments.map((p, idx) => (
                      <div key={`${p.id}-${idx}`} className="p-3 flex items-center justify-between hover:bg-zinc-50">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2 font-mono">
                            <span className="font-bold text-zinc-900">{p.provider}</span>
                            <span className="text-emerald-700 font-bold">৳{p.amount.toFixed(2)}</span>
                            <span className="text-zinc-500">({p.phoneNumber})</span>
                          </div>
                          <div className="text-[11px] text-zinc-500 font-mono">
                            লাস্ট ৩ ডিজিট: <b className="text-zinc-800">{p.last3Digits}</b> · TrxID: {p.transactionId} · {p.time}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => mfsStorage.deletePayment(p.id)}
                          className="text-zinc-400 hover:text-red-600 p-1.5 rounded cursor-pointer"
                          title="মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

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
