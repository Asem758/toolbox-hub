import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, ShieldCheck, ShieldAlert, Key, Check, ListFilter } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard } from '../../lib/utils';

export const PasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [length, setLength] = useState<number>(18);
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useLower, setUseLower] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);
  const [bulkList, setBulkList] = useState<string[]>([]);
  const [showBulk, setShowBulk] = useState<boolean>(false);

  const { showToast } = useToast();

  const generateSinglePassword = (
    len: number,
    upper: boolean,
    lower: boolean,
    nums: boolean,
    syms: boolean,
    noAmbiguous: boolean
  ): string => {
    let chars = '';
    if (upper) chars += noAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) chars += noAmbiguous ? 'abcdefghijkmnopqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    if (nums) chars += noAmbiguous ? '23456789' : '0123456789';
    if (syms) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

    const array = new Uint32Array(len);
    window.crypto.getRandomValues(array);
    let result = '';
    for (let i = 0; i < len; i++) {
      result += chars[array[i] % chars.length];
    }
    return result;
  };

  const handleGenerate = () => {
    const pwd = generateSinglePassword(length, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous);
    setPassword(pwd);

    if (showBulk) {
      const list = Array.from({ length: 6 }, () =>
        generateSinglePassword(length, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous)
      );
      setBulkList(list);
    }
  };

  useEffect(() => {
    handleGenerate();
  }, [length, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous, showBulk]);

  // Entropy evaluation
  const calculateEntropy = () => {
    let pool = 0;
    if (useUpper) pool += 26;
    if (useLower) pool += 26;
    if (useNumbers) pool += 10;
    if (useSymbols) pool += 30;
    if (pool === 0) pool = 26;

    const entropy = Math.round(length * Math.log2(pool));
    let strength: 'Weak' | 'Fair' | 'Strong' | 'Very Strong' = 'Weak';
    let color = 'bg-rose-500';

    if (entropy >= 80) {
      strength = 'Very Strong';
      color = 'bg-emerald-500';
    } else if (entropy >= 60) {
      strength = 'Strong';
      color = 'bg-teal-500';
    } else if (entropy >= 40) {
      strength = 'Fair';
      color = 'bg-amber-500';
    }

    return { entropy, strength, color };
  };

  const entropyData = calculateEntropy();

  const handleCopy = async (str = password) => {
    const ok = await copyToClipboard(str);
    if (ok) showToast('Password copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Generated Display Hero */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${entropyData.color} animate-pulse`} />
            <span className="text-xs font-semibold text-slate-300">
              Entropy: {entropyData.entropy} bits — {entropyData.strength}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">{length} chars</span>
        </div>

        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <span className="font-mono text-lg md:text-2xl font-bold tracking-wider break-all select-all text-emerald-400">
            {password}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleGenerate}
              className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
              title="Regenerate"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleCopy(password)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Options Panel */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        {/* Length Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 dark:text-slate-300">Password Length</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{length} characters</span>
          </div>
          <input
            type="range"
            min="6"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>6 (Short)</span>
            <span>18 (Recommended)</span>
            <span>64 (Ultra Secure)</span>
          </div>
        </div>

        {/* Checkbox Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200">
            <input
              type="checkbox"
              checked={useUpper}
              onChange={(e) => setUseUpper(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            Include Uppercase (A-Z)
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200">
            <input
              type="checkbox"
              checked={useLower}
              onChange={(e) => setUseLower(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            Include Lowercase (a-z)
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200">
            <input
              type="checkbox"
              checked={useNumbers}
              onChange={(e) => setUseNumbers(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            Include Numbers (0-9)
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200">
            <input
              type="checkbox"
              checked={useSymbols}
              onChange={(e) => setUseSymbols(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            Include Symbols (!@#$%^&*)
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200 sm:col-span-2">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            Exclude Ambiguous Characters (l, 1, I, O, 0, o)
          </label>
        </div>

        {/* Bulk Generate Toggle */}
        <div className="pt-2">
          <button
            onClick={() => setShowBulk(!showBulk)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
          >
            <ListFilter className="w-3.5 h-3.5" />
            {showBulk ? 'Hide Bulk Passwords' : 'Generate Multiple Passwords at Once'}
          </button>
        </div>
      </div>

      {/* Bulk Passwords List */}
      {showBulk && bulkList.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Bulk Generated Passwords (Click to Copy)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {bulkList.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleCopy(item)}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-500 group transition-all"
              >
                <span className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">{item}</span>
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default PasswordGenerator;
