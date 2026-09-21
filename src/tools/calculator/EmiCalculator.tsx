import React, { useState, useMemo } from 'react';
import { Calculator, PieChart, Coins, DollarSign, Download, Copy, Check, Sparkles, Building2, Car, UserCheck, GraduationCap, Briefcase } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface LoanPreset {
  id: string;
  name: string;
  icon: React.ElementType;
  amount: number;
  rate: number;
  tenureYears: number;
}

const PRESETS: LoanPreset[] = [
  { id: 'home', name: 'Home Loan', icon: Building2, amount: 300000, rate: 7.2, tenureYears: 25 },
  { id: 'car', name: 'Car / Auto Loan', icon: Car, amount: 35000, rate: 6.5, tenureYears: 5 },
  { id: 'personal', name: 'Personal Loan', icon: UserCheck, amount: 15000, rate: 11.5, tenureYears: 3 },
  { id: 'education', name: 'Education Loan', icon: GraduationCap, amount: 50000, rate: 8.5, tenureYears: 7 },
  { id: 'business', name: 'Business Loan', icon: Briefcase, amount: 100000, rate: 9.0, tenureYears: 10 },
];

export const EmiCalculator: React.FC = () => {
  const { showToast } = useToast();

  const [currency, setCurrency] = useState<string>('$');
  const [loanAmount, setLoanAmount] = useState<number>(300000);
  const [interestRate, setInterestRate] = useState<number>(7.2);
  const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('years');
  const [tenureValue, setTenureValue] = useState<number>(25);
  const [processingFeePercent, setProcessingFeePercent] = useState<number>(1.0);

  // Prepayment simulation
  const [enablePrepayment, setEnablePrepayment] = useState<boolean>(false);
  const [prepaymentLumpSum, setPrepaymentLumpSum] = useState<number>(10000);
  const [prepaymentMonth, setPrepaymentMonth] = useState<number>(12); // after 12 months

  const [copied, setCopied] = useState<boolean>(false);

  const applyPreset = (preset: LoanPreset) => {
    setLoanAmount(preset.amount);
    setInterestRate(preset.rate);
    setTenureUnit('years');
    setTenureValue(preset.tenureYears);
    showToast(`Loaded ${preset.name} parameters`, 'info');
  };

  const tenureInMonths = tenureUnit === 'years' ? tenureValue * 12 : tenureValue;

  const calculations = useMemo(() => {
    const principal = Math.max(0, loanAmount);
    const annualRate = Math.max(0, interestRate);
    const n = Math.max(1, tenureInMonths);
    const r = annualRate / 12 / 100;

    // Standard EMI formula: [P x R x (1+R)^N] / [(1+R)^N - 1]
    let emi = 0;
    if (r === 0) {
      emi = principal / n;
    } else {
      emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalRepaymentStandard = emi * n;
    const totalInterestStandard = totalRepaymentStandard - principal;
    const processingFeeAmount = (principal * processingFeePercent) / 100;

    // Schedule calculation with optional lump-sum prepayment
    let balance = principal;
    let totalInterestActual = 0;
    let actualMonths = 0;
    const monthlyList: {
      month: number;
      emi: number;
      principal: number;
      interest: number;
      prepayment: number;
      balance: number;
    }[] = [];

    for (let m = 1; m <= n * 2 && balance > 0.01; m++) {
      const interestPart = balance * r;
      let principalPart = emi - interestPart;

      let lump = 0;
      if (enablePrepayment && m === prepaymentMonth) {
        lump = prepaymentLumpSum;
      }

      if (balance <= principalPart + lump) {
        principalPart = balance;
        lump = 0;
        balance = 0;
      } else {
        balance = balance - principalPart - lump;
      }

      totalInterestActual += interestPart;
      actualMonths = m;

      monthlyList.push({
        month: m,
        emi: principalPart + interestPart,
        principal: principalPart + lump,
        interest: interestPart,
        prepayment: lump,
        balance: Math.max(0, balance),
      });
    }

    const interestSaved = enablePrepayment ? Math.max(0, totalInterestStandard - totalInterestActual) : 0;
    const monthsSaved = enablePrepayment ? Math.max(0, n - actualMonths) : 0;

    const principalShare = (principal / (principal + totalInterestStandard)) * 100;
    const interestShare = (totalInterestStandard / (principal + totalInterestStandard)) * 100;

    return {
      emi,
      totalPayment: totalRepaymentStandard,
      totalInterest: totalInterestStandard,
      processingFeeAmount,
      principalShare,
      interestShare,
      interestSaved,
      monthsSaved,
      monthlyList,
    };
  }, [loanAmount, interestRate, tenureInMonths, processingFeePercent, enablePrepayment, prepaymentLumpSum, prepaymentMonth]);

  const handleExportCsv = () => {
    const headers = ['Month', 'Monthly EMI', 'Principal Paid', 'Interest Paid', 'Prepayment', 'Remaining Balance'];
    const rows = calculations.monthlyList.map((m) =>
      [
        m.month,
        m.emi.toFixed(2),
        m.principal.toFixed(2),
        m.interest.toFixed(2),
        m.prepayment.toFixed(2),
        m.balance.toFixed(2),
      ].join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EMI_Schedule_${loanAmount}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported EMI Schedule to CSV', 'success');
  };

  const handleCopySummary = async () => {
    const text = `EMI Calculator Breakdown:
• Loan Amount: ${currency}${loanAmount.toLocaleString()}
• Interest Rate: ${interestRate}% p.a.
• Tenure: ${tenureValue} ${tenureUnit} (${tenureInMonths} months)
• Equated Monthly Installment (EMI): ${currency}${calculations.emi.toFixed(2)} / month
• Total Interest Payable: ${currency}${calculations.totalInterest.toFixed(2)}
• Total Repayment Amount: ${currency}${calculations.totalPayment.toFixed(2)}
• Processing Fees (${processingFeePercent}%): ${currency}${calculations.processingFeeAmount.toFixed(2)}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied EMI summary to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Quick Loan Archetypes Preset Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Loan Presets:
          </span>
          {PRESETS.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => applyPreset(p)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all hover:shadow-2xs"
              >
                <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                {p.name}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
          >
            <option value="$">$ (USD)</option>
            <option value="₹">₹ (INR)</option>
            <option value="€">€ (EUR)</option>
            <option value="£">£ (GBP)</option>
            <option value="৳">৳ (BDT)</option>
          </select>
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Sliders & Parameter Inputs */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-600" />
              EMI Calculator Parameters
            </h3>

            {/* Loan Amount */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Loan Amount
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  {currency}{loanAmount.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-sm font-bold text-slate-400">{currency}</span>
                <input
                  type="number"
                  min={1000}
                  step={5000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                />
              </div>
              <input
                type="range"
                min={10000}
                max={1500000}
                step={5000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer mt-2"
              />
            </div>

            {/* Interest Rate */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Interest Rate (p.a.)
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600">{interestRate}%</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={0.1}
                  max={30}
                  step={0.05}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0.01, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold pr-8"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">%</span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer mt-2"
              />
            </div>

            {/* Loan Tenure */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Loan Tenure ({tenureInMonths} months)
                </label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      if (tenureUnit === 'months') {
                        setTenureValue(Math.max(1, Math.round(tenureValue / 12)));
                        setTenureUnit('years');
                      }
                    }}
                    className={`px-2 py-0.5 rounded ${tenureUnit === 'years' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-2xs' : 'text-slate-500'}`}
                  >
                    Years
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (tenureUnit === 'years') {
                        setTenureValue(tenureValue * 12);
                        setTenureUnit('months');
                      }
                    }}
                    className={`px-2 py-0.5 rounded ${tenureUnit === 'months' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-2xs' : 'text-slate-500'}`}
                  >
                    Months
                  </button>
                </div>
              </div>
              <input
                type="number"
                min={1}
                max={tenureUnit === 'years' ? 40 : 480}
                value={tenureValue}
                onChange={(e) => setTenureValue(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
              />
              <input
                type="range"
                min={1}
                max={tenureUnit === 'years' ? 35 : 360}
                value={tenureValue}
                onChange={(e) => setTenureValue(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer mt-2"
              />
            </div>

            {/* Processing Fee */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bank Processing Fee (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  value={processingFeePercent}
                  onChange={(e) => setProcessingFeePercent(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold pr-8"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">%</span>
              </div>
            </div>

            {/* Prepayment Planner Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enablePrepayment}
                  onChange={(e) => setEnablePrepayment(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Simulate Lump-Sum Prepayment
                </span>
              </label>

              {enablePrepayment && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Prepayment Amount ({currency})
                    </label>
                    <input
                      type="number"
                      min={1000}
                      step={1000}
                      value={prepaymentLumpSum}
                      onChange={(e) => setPrepaymentLumpSum(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Pay After Month
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={tenureInMonths}
                      value={prepaymentMonth}
                      onChange={(e) => setPrepaymentMonth(Math.max(1, Number(e.target.value)))}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Output: EMI Display & Breakdown */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main EMI Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Monthly Loan EMI
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                    {currency}{calculations.emi.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">/ month</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold text-slate-500">Total Repayment</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {currency}{calculations.totalPayment.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Principal vs Interest Visual Ring & Distribution */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-indigo-600 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                  Principal: {currency}{loanAmount.toLocaleString()} ({calculations.principalShare.toFixed(1)}%)
                </span>
                <span className="text-amber-500 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Interest: {currency}{calculations.totalInterest.toFixed(2)} ({calculations.interestShare.toFixed(1)}%)
                </span>
              </div>

              <div className="h-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700">
                <div style={{ width: `${calculations.principalShare}%` }} className="bg-indigo-600" />
                <div style={{ width: `${calculations.interestShare}%` }} className="bg-amber-500" />
              </div>
            </div>

            {/* Prepayment savings badge */}
            {enablePrepayment && calculations.interestSaved > 0 && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 dark:text-emerald-300">
                  <span className="font-bold">Prepayment Impact: </span>
                  Paying {currency}{prepaymentLumpSum.toLocaleString()} at month {prepaymentMonth} saves{' '}
                  <span className="font-extrabold">{currency}{calculations.interestSaved.toFixed(2)} in interest</span> and shortens loan by{' '}
                  <span className="font-extrabold">{calculations.monthsSaved} months</span>.
                </div>
              </div>
            )}

            {/* Financial Summary Items */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <div className="text-slate-400 font-semibold">Total Interest</div>
                <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {currency}{calculations.totalInterest.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <div className="text-slate-400 font-semibold">Processing Fee</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {currency}{calculations.processingFeeAmount.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 col-span-2 sm:col-span-1">
                <div className="text-slate-400 font-semibold">Net Loan Outflow</div>
                <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {currency}{(calculations.totalPayment + calculations.processingFeeAmount).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Table Preview */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                First 12 Months Payment Schedule
              </h4>
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2">Mo</th>
                    <th className="p-2 text-right">Principal</th>
                    <th className="p-2 text-right">Interest</th>
                    <th className="p-2 text-right">Total EMI</th>
                    <th className="p-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {calculations.monthlyList.slice(0, 12).map((m) => (
                    <tr key={m.month} className="hover:bg-slate-50/50">
                      <td className="p-2 font-sans font-semibold text-slate-600 dark:text-slate-400">
                        Month {m.month}
                      </td>
                      <td className="p-2 text-right text-indigo-600 font-semibold">
                        {currency}{m.principal.toFixed(2)}
                      </td>
                      <td className="p-2 text-right text-amber-600">
                        {currency}{m.interest.toFixed(2)}
                      </td>
                      <td className="p-2 text-right font-bold text-slate-900 dark:text-white">
                        {currency}{m.emi.toFixed(2)}
                      </td>
                      <td className="p-2 text-right text-slate-500">
                        {currency}{m.balance.toFixed(2)}
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

export default EmiCalculator;
