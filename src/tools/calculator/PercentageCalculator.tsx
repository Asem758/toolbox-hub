import React, { useState } from 'react';
import { Calculator, Percent, ArrowRight, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const PercentageCalculator: React.FC = () => {
  // Mode 1: What is X% of Y?
  const [val1A, setVal1A] = useState<number>(15);
  const [val1B, setVal1B] = useState<number>(200);

  // Mode 2: X is what percent of Y?
  const [val2A, setVal2A] = useState<number>(45);
  const [val2B, setVal2B] = useState<number>(180);

  // Mode 3: Percentage increase / decrease from X to Y
  const [val3A, setVal3A] = useState<number>(80);
  const [val3B, setVal3B] = useState<number>(120);

  const { showToast } = useToast();

  const res1 = ((val1A / 100) * val1B);
  const res2 = val2B !== 0 ? ((val2A / val2B) * 100) : 0;
  const res3Diff = val3B - val3A;
  const res3Percent = val3A !== 0 ? ((res3Diff / val3A) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Mode 1 */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">
            1
          </span>
          Calculate Percentage Value
        </h3>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>What is</span>
          <div className="relative">
            <input
              type="number"
              value={val1A}
              onChange={(e) => setVal1A(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
            />
            <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
          </div>
          <span>of</span>
          <input
            type="number"
            value={val1B}
            onChange={(e) => setVal1B(Number(e.target.value))}
            className="w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
          />
          <span>=</span>
          <div className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-extrabold text-base">
            {Number.isInteger(res1) ? res1 : res1.toFixed(2)}
          </div>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Formula: ({val1A} / 100) × {val1B} = {res1.toFixed(2)}
        </p>
      </div>

      {/* Mode 2 */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">
            2
          </span>
          Find Percentage Proportion
        </h3>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <input
            type="number"
            value={val2A}
            onChange={(e) => setVal2A(Number(e.target.value))}
            className="w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
          />
          <span>is what % of</span>
          <input
            type="number"
            value={val2B}
            onChange={(e) => setVal2B(Number(e.target.value))}
            className="w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
          />
          <span>=</span>
          <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-extrabold text-base">
            {Number.isInteger(res2) ? res2 : res2.toFixed(2)}%
          </div>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Formula: ({val2A} / {val2B}) × 100 = {res2.toFixed(2)}%
        </p>
      </div>

      {/* Mode 3 */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">
            3
          </span>
          Percentage Increase or Decrease
        </h3>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>From</span>
          <input
            type="number"
            value={val3A}
            onChange={(e) => setVal3A(Number(e.target.value))}
            className="w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
          />
          <span>to</span>
          <input
            type="number"
            value={val3B}
            onChange={(e) => setVal3B(Number(e.target.value))}
            className="w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
          />
          <span>=</span>
          <div
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border font-extrabold text-base ${
              res3Percent >= 0
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            }`}
          >
            {res3Percent >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(res3Percent).toFixed(2)}% {res3Percent >= 0 ? 'Increase' : 'Decrease'}
          </div>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Formula: (({val3B} - {val3A}) / {val3A}) × 100 = {res3Percent.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};
export default PercentageCalculator;
