import { Delete, Check, X } from 'lucide-react';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function Keypad({ onDigit, onDelete, onClear, onSubmit, disabled = false }: KeypadProps) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full max-w-xs mx-auto bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-zinc-200/80 shadow-lg select-none">
      <div className="grid grid-cols-3 gap-2.5">
        {/* Digits 1 to 9 */}
        {digits.map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={disabled}
            onClick={() => onDigit(digit)}
            className="h-14 rounded-xl text-xl font-bold text-zinc-800 bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200 border border-zinc-200/90 shadow-2xs hover:shadow-xs transition-all duration-100 flex items-center justify-center active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {digit}
          </button>
        ))}

        {/* Bottom row: Cross (Backspace/Clear), 0, Sign (Check) */}
        {/* Cross / Clear Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          onDoubleClick={onClear}
          title="মুছুন / Backspace (ডাবল ক্লিক করলে ক্লিয়ার)"
          className="h-14 rounded-xl text-zinc-700 bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 shadow-2xs hover:shadow-xs transition-all duration-100 flex items-center justify-center active:scale-95 disabled:opacity-50 cursor-pointer group"
        >
          <X className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform" />
        </button>

        {/* 0 Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDigit('0')}
          className="h-14 rounded-xl text-xl font-bold text-zinc-800 bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200 border border-zinc-200/90 shadow-2xs hover:shadow-xs transition-all duration-100 flex items-center justify-center active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          0
        </button>

        {/* Sign / Check Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={onSubmit}
          title="যাচাই করুন / Confirm"
          className="h-14 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 border border-emerald-600 shadow-2xs hover:shadow-xs transition-all duration-100 flex items-center justify-center active:scale-95 disabled:opacity-50 cursor-pointer group"
        >
          <Check className="w-6 h-6 text-white group-hover:scale-110 transition-transform stroke-[2.5]" />
        </button>
      </div>

      <div className="flex items-center justify-between mt-3 px-1 text-[11px] text-zinc-400">
        <span>✕ মুছুন</span>
        <span>• কিপ্যাড •</span>
        <span>✓ যাচাই</span>
      </div>
    </div>
  );
}
