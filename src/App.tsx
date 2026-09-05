import { useState, useEffect, useRef } from 'react';
import { UniversalPayment } from './types';
import { mfsStorage } from './services/storage';
import { Keypad } from './components/Keypad';
import { PaymentDisplay } from './components/PaymentDisplay';
import { AdminModal } from './components/AdminModal';
import {
  Search,
  Lock,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Smartphone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function App() {
  const [payments, setPayments] = useState<UniversalPayment[]>(mfsStorage.getPayments());
  const [digits, setDigits] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UniversalPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<UniversalPayment | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isKeypadOpen, setIsKeypadOpen] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Sync with storage updates
  useEffect(() => {
    const unsubscribe = mfsStorage.subscribe(() => {
      setPayments(mfsStorage.getPayments());
      // Re-run search if 3 digits are active
      if (digits.length === 3) {
        const matches = mfsStorage.searchByLast3Digits(digits);
        setSearchResults(matches);
      }
    });
    return unsubscribe;
  }, [digits]);

  // Handle digit input (from keypad or typing)
  const handleAddDigit = (digit: string) => {
    if (digits.length >= 3) {
      // If already 3 digits, replace or start new
      const newDigits = digit;
      setDigits(newDigits);
      setSelectedPayment(null);
      setHasSearched(false);
      return;
    }

    const nextDigits = digits + digit;
    setDigits(nextDigits);
    setSelectedPayment(null);

    // If 3 digits reached, automatically verify!
    if (nextDigits.length === 3) {
      triggerVerification(nextDigits);
    }
  };

  const handleDeleteDigit = () => {
    if (digits.length > 0) {
      const nextDigits = digits.slice(0, -1);
      setDigits(nextDigits);
      setHasSearched(false);
      setSelectedPayment(null);
      setSearchResults([]);
    }
  };

  const handleClearAllDigits = () => {
    setDigits('');
    setHasSearched(false);
    setSelectedPayment(null);
    setSearchResults([]);
  };

  const triggerVerification = (targetDigits: string = digits) => {
    if (targetDigits.length < 3) return;
    const matches = mfsStorage.searchByLast3Digits(targetDigits);
    setSearchResults(matches);
    setSelectedPayment(null);
    setHasSearched(true);
  };

  // Keyboard support for desktop users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input or textarea is active (e.g. inside admin modal)
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleAddDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteDigit();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (digits.length === 3) {
          triggerVerification(digits);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClearAllDigits();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [digits]);

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-50 via-zinc-100/60 to-zinc-200/40 text-zinc-900 flex flex-col antialiased selection:bg-zinc-900 selection:text-white">
      {/* Top Header: Company Name & Admin Login */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-zinc-200/80 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Company Name */}
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-zinc-900 tracking-tight leading-none">
                Unity Earning
              </h1>
              <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                MFS Payment Verification System
              </p>
            </div>
          </div>

          {/* Admin Login Button */}
          <button
            type="button"
            id="admin-login-btn"
            onClick={() => setIsAdminOpen(true)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs ${
              isAdminAuthenticated
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800 active:scale-95'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAdminAuthenticated ? 'অ্যাডমিন প্যানেল' : 'অ্যাডমিন লগইন'}</span>
          </button>
        </div>
      </header>

      {/* Main Minimalist Area */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 sm:py-10 flex flex-col items-center space-y-6">
        {/* Search Bar Container with 3 Dots */}
        <div className="w-full space-y-2">
          <div
            id="search-bar-box"
            onClick={() => {
              setIsKeypadOpen(true);
              hiddenInputRef.current?.focus();
            }}
            className={`w-full bg-white rounded-2xl border-2 transition-all p-4 shadow-sm cursor-pointer ${
              digits.length === 3
                ? 'border-zinc-900 ring-2 ring-zinc-900/10'
                : 'border-zinc-300 hover:border-zinc-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center">
                  <Search className="w-5 h-5 text-zinc-700" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    লাস্ট ৩ ডিজিট সার্চ করুন
                  </span>
                  <span className="text-xs text-zinc-500">
                    {digits.length === 0
                      ? 'ক্লিক করে শেষ ৩ ডিজিট দিন'
                      : `${digits.length}/৩ ডিজিট ইনপুট করা হয়েছে`}
                  </span>
                </div>
              </div>

              {/* The Three Dots / Digits Display */}
              <div className="flex items-center space-x-2">
                {[0, 1, 2].map((idx) => {
                  const hasChar = digits.length > idx;
                  const char = hasChar ? digits[idx] : null;

                  return (
                    <div
                      key={idx}
                      className={`w-9 h-11 sm:w-11 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl font-mono font-black transition-all ${
                        hasChar
                          ? 'bg-zinc-900 text-white border-2 border-zinc-900 scale-105 shadow-2xs'
                          : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                      }`}
                    >
                      {hasChar ? (
                        char
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 inline-block animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Clear or Toggle hint */}
          <div className="flex items-center justify-between px-2 text-[11px] text-zinc-500">
            <button
              type="button"
              onClick={() => setIsKeypadOpen(!isKeypadOpen)}
              className="flex items-center space-x-1 text-zinc-600 hover:text-zinc-900 font-medium cursor-pointer"
            >
              <span>{isKeypadOpen ? 'কিপ্যাড লুকান' : 'কিপ্যাড খুলুন'}</span>
              {isKeypadOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {digits.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllDigits}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>রিসেট করুন</span>
              </button>
            )}
          </div>
        </div>

        {/* Hidden input to capture physical keyboard if tapped */}
        <input
          ref={hiddenInputRef}
          type="text"
          maxLength={3}
          value={digits}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 3);
            setDigits(val);
            if (val.length === 3) triggerVerification(val);
          }}
          className="sr-only"
          aria-hidden="true"
        />

        {/* Payment Verification Result Display (Appears right under search) */}
        {hasSearched && digits.length === 3 && (
          <div className="w-full">
            <PaymentDisplay
              searchedDigits={digits}
              results={searchResults}
              selectedPayment={selectedPayment}
              onSelectPayment={(p) => setSelectedPayment(p)}
              onClearSearch={handleClearAllDigits}
            />
          </div>
        )}

        {/* Calculator Keypad (9 boxes: 1-9, then 0, cross, sign) */}
        {isKeypadOpen && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-150">
            <Keypad
              onDigit={handleAddDigit}
              onDelete={handleDeleteDigit}
              onClear={handleClearAllDigits}
              onSubmit={() => triggerVerification(digits)}
            />
          </div>
        )}
      </main>

      {/* Admin Login & Clearance Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        payments={payments}
        isAdminAuthenticated={isAdminAuthenticated}
        setIsAdminAuthenticated={setIsAdminAuthenticated}
      />

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-zinc-200/80 bg-white/70 py-3 text-center text-xs text-zinc-500">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between text-[11px]">
          <span>© {new Date().getFullYear()} <b>Unity Earning</b>. সর্বস্বত্ব সংরক্ষিত।</span>
          <span className="font-mono text-zinc-400">Zero-padding &amp; String Strict Match</span>
        </div>
      </footer>
    </div>
  );
}
