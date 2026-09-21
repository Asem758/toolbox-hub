import React, { useState, useMemo } from 'react';
import { TrendingUp, PiggyBank, Sparkles, Download, Copy, Check, Calendar, LineChart, Percent, DollarSign } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface CompoundingFrequency {
  id: string;
  name: string;
  timesPerYear: number;
}

const FREQUENCIES: CompoundingFrequency[] = [
  { id: 'annually', name: 'Annually (1x/yr)', timesPerYear: 1 },
  { id: 'semiannually', name: 'Semi-Annually (2x/yr)', timesPerYear: 2 },
  { id: 'quarterly', name: 'Quarterly (4x/yr)', timesPerYear: 4 },
  { id: 'monthly', name: 'Monthly (12x/yr)', timesPerYear: 12 },
  { id: 'daily', name: 'Daily (365x/yr)', timesPerYear: 365 },
];

interface YearRow {
  year: number;
  principalDeposited: number;
  interestEarnedThisYear: number;
  totalInterestAccumulated: number;
  endBalance: number;
  realBalanceInflationAdjusted: number;
}

export const CompoundInterestCalculator: React.FC = () => {
  const { showToast } = useToast();

  const [currency, setCurrency] = useState<string>('$');
  const [initialPrincipal, setInitialPrincipal] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [interestRate, setInterestRate] = useState<number>(8.0);
  const [compoundFrequency, setCompoundFrequency] = useState<number>(12); // monthly
  const [investmentYears, setInvestmentYears] = useState<number>(20);
  const [inflationRate, setInflationRate] = useState<number>(2.5);

  const [copied, setCopied] = useState<boolean>(false);

  const calculations = useMemo(() => {
    const P0 = Math.max(0, initialPrincipal);
    const PMT = Math.max(0, monthlyContribution);
    const r = Math.max(0, interestRate) / 100;
    const n = Math.max(1, compoundFrequency);
    const years = Math.max(1, investmentYears);
    const inf = Math.max(0, inflationRate) / 100;

    let balance = P0;
    let totalDeposited = P0;
    const yearlyRows: YearRow[] = [];

    // Monthly simulation step
    for (let yr = 1; yr <= years; yr++) {
      const startBalanceOfYear = balance;
      let yearDeposit = 0;

      for (let m = 1; m <= 12; m++) {
        // Add monthly contribution
        balance += PMT;
        yearDeposit += PMT;
        totalDeposited += PMT;

        // Interest compounded monthly equivalent
        // Rate per month depending on compounding frequency
        const monthlyEffectiveRate = Math.pow(1 + r / n, n / 12) - 1;
        const interestMonth = balance * monthlyEffectiveRate;
        balance += interestMonth;
      }

      const interestThisYear = balance - startBalanceOfYear - yearDeposit;
      const totalInterestAcc = balance - totalDeposited;
      const inflationFactor = Math.pow(1 + inf, yr);
      const realBalance = balance / inflationFactor;

      yearlyRows.push({
        year: yr,
        principalDeposited: totalDeposited,
        interestEarnedThisYear: interestThisYear,
        totalInterestAccumulated: totalInterestAcc,
        endBalance: balance,
        realBalanceInflationAdjusted: realBalance,
      });
    }

    const finalBalance = balance;
    const totalPrincipalInvested = totalDeposited;
    const totalInterestEarned = Math.max(0, finalBalance - totalPrincipalInvested);
    const growthMultiplier = totalPrincipalInvested > 0 ? (finalBalance / totalPrincipalInvested) : 1;

    const principalPercent = (totalPrincipalInvested / finalBalance) * 100;
    const interestPercent = (totalInterestEarned / finalBalance) * 100;

    return {
      finalBalance,
      totalPrincipalInvested,
      totalInterestEarned,
      growthMultiplier,
      principalPercent,
      interestPercent,
      yearlyRows,
      realPurchasingPower: yearlyRows[yearlyRows.length - 1]?.realBalanceInflationAdjusted || finalBalance,
    };
  }, [initialPrincipal, monthlyContribution, interestRate, compoundFrequency, investmentYears, inflationRate]);

  const handleExportCsv = () => {
    const headers = ['Year', 'Total Principal Deposited', 'Interest Earned This Year', 'Total Interest Accumulated', 'Future Balance', 'Inflation-Adjusted Purchasing Power'];
    const rows = calculations.yearlyRows.map((y) =>
      [
        y.year,
        y.principalDeposited.toFixed(2),
        y.interestEarnedThisYear.toFixed(2),
        y.totalInterestAccumulated.toFixed(2),
        y.endBalance.toFixed(2),
        y.realBalanceInflationAdjusted.toFixed(2),
      ].join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Compound_Interest_Projection_${investmentYears}Y.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported Compound Growth Schedule to CSV', 'success');
  };

  const handleCopySummary = async () => {
    const text = `Compound Interest Growth Projection:
• Initial Deposit: ${currency}${initialPrincipal.toLocaleString()}
• Monthly Contribution: ${currency}${monthlyContribution.toLocaleString()}/month
• Return Rate: ${interestRate}% p.a. (${investmentYears} Years)
• Total Invested Principal: ${currency}${calculations.totalPrincipalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}
• Total Compound Interest Earned: ${currency}${calculations.totalInterestEarned.toLocaleString(undefined, { maximumFractionDigits: 0 })}
• Future Projected Balance: ${currency}${calculations.finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${calculations.growthMultiplier.toFixed(2)}x Growth)
• Purchasing Power (at ${inflationRate}% inflation): ${currency}${calculations.realPurchasingPower.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied investment projection to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Currency:</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
          >
            <option value="$">$ (USD)</option>
            <option value="€">€ (EUR)</option>
            <option value="£">£ (GBP)</option>
            <option value="₹">₹ (INR)</option>
            <option value="¥">¥ (JPY/CNY)</option>
            <option value="৳">৳ (BDT)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Summary'}
          </button>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Schedule (CSV)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-indigo-600" />
              Investment & Growth Factors
            </h3>

            {/* Initial Deposit */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Initial Principal Deposit
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  {currency}{initialPrincipal.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-sm font-bold text-slate-400">{currency}</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={initialPrincipal}
                  onChange={(e) => setInitialPrincipal(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                />
              </div>
              <input
                type="range"
                min={0}
                max={200000}
                step={2500}
                value={initialPrincipal}
                onChange={(e) => setInitialPrincipal(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer mt-2"
              />
            </div>

            {/* Monthly Contribution */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Monthly Contribution
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  {currency}{monthlyContribution.toLocaleString()}/mo
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-sm font-bold text-slate-400">{currency}</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                />
              </div>
              <input
                type="range"
                min={0}
                max={10000}
                step={100}
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer mt-2"
              />
            </div>

            {/* Annual Return Rate */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Estimated Annual Return Rate (%)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-600">{interestRate}%</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={0.1}
                  max={30}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold pr-8"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">%</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                step={0.25}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer mt-2"
              />
            </div>

            {/* Investment Horizon */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Investment Horizon ({investmentYears} Years)
                </label>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[5, 10, 20, 30].map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setInvestmentYears(y)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      investmentYears === y
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {y} Yrs
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={investmentYears}
                onChange={(e) => setInvestmentYears(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Compounding Frequency & Inflation */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Compound Frequency
                </label>
                <select
                  value={compoundFrequency}
                  onChange={(e) => setCompoundFrequency(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.id} value={f.timesPerYear}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Est. Inflation (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  step={0.1}
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Math.max(0, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output: Total Future Value & Year-by-Year Growth Table */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Future Value Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Future Portfolio Value ({investmentYears} Years)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {currency}{calculations.finalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-right">
                <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">
                  Growth Multiplier
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {calculations.growthMultiplier.toFixed(2)}x
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  on invested capital
                </div>
              </div>
            </div>

            {/* Split Visual Bar (Principal Invested vs Compound Interest) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-indigo-600">
                  Total Deposits: {currency}{calculations.totalPrincipalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({calculations.principalPercent.toFixed(0)}%)
                </span>
                <span className="text-emerald-600">
                  Interest Earned: {currency}{calculations.totalInterestEarned.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({calculations.interestPercent.toFixed(0)}%)
                </span>
              </div>

              <div className="h-3.5 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                <div
                  style={{ width: `${calculations.principalPercent}%` }}
                  className="bg-indigo-600"
                  title="Principal Invested"
                />
                <div
                  style={{ width: `${calculations.interestPercent}%` }}
                  className="bg-emerald-500"
                  title="Compound Interest"
                />
              </div>
            </div>

            {/* Inflation adjustment callout */}
            {inflationRate > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold">Inflation-Adjusted Purchasing Power: </span>
                  At an estimated {inflationRate}% annual inflation rate, your future purchasing power is equivalent to{' '}
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {currency}{calculations.realPurchasingPower.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>{' '}
                  in today's dollars.
                </div>
              </div>
            )}

            {/* Growth Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <div className="text-slate-400 font-semibold">Total Deposits</div>
                <div className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {currency}{calculations.totalPrincipalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <div className="text-slate-400 font-semibold">Compound Returns</div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {currency}{calculations.totalInterestEarned.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <div className="text-slate-400 font-semibold">Annual Yield (APY)</div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {((Math.pow(1 + (interestRate / 100) / compoundFrequency, compoundFrequency) - 1) * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Year-by-Year Growth Table */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Year-by-Year Growth Schedule
            </h4>

            <div className="overflow-x-auto max-h-80 rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2">Year</th>
                    <th className="p-2 text-right">Deposited</th>
                    <th className="p-2 text-right">Interest / Yr</th>
                    <th className="p-2 text-right">Total Interest</th>
                    <th className="p-2 text-right">End Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {calculations.yearlyRows.map((y) => (
                    <tr key={y.year} className="hover:bg-slate-50/50">
                      <td className="p-2 font-sans font-bold text-slate-800 dark:text-slate-200">
                        Year {y.year}
                      </td>
                      <td className="p-2 text-right text-indigo-600">
                        {currency}{y.principalDeposited.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-2 text-right text-emerald-600 font-semibold">
                        +{currency}{y.interestEarnedThisYear.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-2 text-right text-slate-500">
                        {currency}{y.totalInterestAccumulated.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-2 text-right font-bold text-slate-900 dark:text-white">
                        {currency}{y.endBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompoundInterestCalculator;
