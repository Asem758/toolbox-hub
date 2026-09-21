import React, { useState, useMemo } from 'react';
import { Landmark, DollarSign, Calendar, TrendingUp, Download, Copy, Check, ChevronDown, ChevronUp, Clock, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface MonthlyAmortization {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  totalPayment: number;
  remainingBalance: number;
}

interface YearlyAmortization {
  year: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  endingBalance: number;
  monthlyDetails: MonthlyAmortization[];
}

export const LoanCalculator: React.FC = () => {
  const { showToast } = useToast();

  const [currency, setCurrency] = useState<string>('$');
  const [loanAmount, setLoanAmount] = useState<number>(250000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [termYears, setTermYears] = useState<number>(30);
  const [extraPaymentMonthly, setExtraPaymentMonthly] = useState<number>(100);
  const [startMonth, setStartMonth] = useState<number>(new Date().getMonth() + 1);
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());

  const [activeTab, setActiveTab] = useState<'summary' | 'yearly' | 'monthly'>('summary');
  const [expandedYear, setExpandedYear] = useState<number | null>(1);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  const calculations = useMemo(() => {
    const principal = Math.max(0, loanAmount);
    const annualRate = Math.max(0, interestRate);
    const totalMonths = Math.max(1, termYears * 12);
    const monthlyRate = annualRate / 100 / 12;

    // Standard Monthly Payment (without extra)
    let standardMonthlyPayment = 0;
    if (monthlyRate === 0) {
      standardMonthlyPayment = principal / totalMonths;
    } else {
      standardMonthlyPayment =
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    // Generate monthly schedule with extra payments
    let balance = principal;
    const monthlySchedule: MonthlyAmortization[] = [];
    let currentMonth = startMonth;
    let currentYear = startYear;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;
    let monthCounter = 1;

    while (balance > 0.001 && monthCounter <= totalMonths * 2) {
      const interestForMonth = balance * monthlyRate;
      let regularPrincipal = standardMonthlyPayment - interestForMonth;

      // Handle final partial payment
      let extra = extraPaymentMonthly;
      if (balance <= regularPrincipal + extra) {
        regularPrincipal = balance;
        extra = 0;
        balance = 0;
      } else {
        if (balance - regularPrincipal <= extra) {
          extra = balance - regularPrincipal;
          balance = 0;
        } else {
          balance = balance - (regularPrincipal + extra);
        }
      }

      const totalMonthPayment = regularPrincipal + interestForMonth + extra;
      totalInterestPaid += interestForMonth;
      totalPrincipalPaid += (regularPrincipal + extra);

      monthlySchedule.push({
        month: currentMonth,
        year: currentYear,
        payment: standardMonthlyPayment,
        principal: regularPrincipal + extra,
        interest: interestForMonth,
        extraPayment: extra,
        totalPayment: totalMonthPayment,
        remainingBalance: Math.max(0, balance),
      });

      monthCounter++;
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    // Group into yearly schedules
    const yearlyMap = new Map<number, YearlyAmortization>();
    monthlySchedule.forEach((m) => {
      if (!yearlyMap.has(m.year)) {
        yearlyMap.set(m.year, {
          year: m.year,
          principalPaid: 0,
          interestPaid: 0,
          totalPaid: 0,
          endingBalance: m.remainingBalance,
          monthlyDetails: [],
        });
      }
      const y = yearlyMap.get(m.year)!;
      y.principalPaid += m.principal;
      y.interestPaid += m.interest;
      y.totalPaid += m.totalPayment;
      y.endingBalance = m.remainingBalance;
      y.monthlyDetails.push(m);
    });

    const yearlySchedule = Array.from(yearlyMap.values());

    // Without extra calculation to show savings
    const baseTotalInterest = (standardMonthlyPayment * totalMonths) - principal;
    const actualTotalMonths = monthlySchedule.length;
    const monthsSaved = Math.max(0, totalMonths - actualTotalMonths);
    const interestSaved = Math.max(0, baseTotalInterest - totalInterestPaid);

    const payoffYear = monthlySchedule[monthlySchedule.length - 1]?.year || currentYear;
    const payoffMonth = monthlySchedule[monthlySchedule.length - 1]?.month || currentMonth;

    return {
      standardMonthlyPayment,
      actualMonthlyPayment: standardMonthlyPayment + extraPaymentMonthly,
      totalPayment: totalPrincipalPaid + totalInterestPaid,
      totalInterestPaid,
      totalPrincipalPaid,
      principalPercent: (principal / (principal + totalInterestPaid)) * 100,
      interestPercent: (totalInterestPaid / (principal + totalInterestPaid)) * 100,
      actualTotalMonths,
      monthsSaved,
      yearsSaved: (monthsSaved / 12).toFixed(1),
      interestSaved,
      payoffDate: `${new Date(payoffYear, payoffMonth - 1).toLocaleString('default', { month: 'short' })} ${payoffYear}`,
      monthlySchedule,
      yearlySchedule,
    };
  }, [loanAmount, interestRate, termYears, extraPaymentMonthly, startMonth, startYear]);

  const handleExportCsv = () => {
    const headers = ['Year', 'Month', 'Beginning Balance', 'Principal Paid', 'Interest Paid', 'Extra Payment', 'Total Payment', 'Remaining Balance'];
    let prevBal = loanAmount;
    const rows = calculations.monthlySchedule.map((m) => {
      const beg = prevBal;
      prevBal = m.remainingBalance;
      return [
        m.year,
        m.month,
        beg.toFixed(2),
        (m.principal - m.extraPayment).toFixed(2),
        m.interest.toFixed(2),
        m.extraPayment.toFixed(2),
        m.totalPayment.toFixed(2),
        m.remainingBalance.toFixed(2),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Loan_Amortization_Schedule_${loanAmount}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported Amortization Schedule to CSV', 'success');
  };

  const handleCopySummary = async () => {
    const text = `Loan Calculator Summary:
• Loan Principal: ${currency}${loanAmount.toLocaleString()}
• Interest Rate: ${interestRate}% (${termYears} Years)
• Monthly Payment: ${currency}${calculations.standardMonthlyPayment.toFixed(2)}${extraPaymentMonthly > 0 ? ` (+${currency}${extraPaymentMonthly}/mo extra)` : ''}
• Total Interest Payable: ${currency}${calculations.totalInterestPaid.toFixed(2)}
• Total Repayment: ${currency}${calculations.totalPayment.toFixed(2)}
• Projected Payoff Date: ${calculations.payoffDate}
${calculations.interestSaved > 0 ? `• Extra Payment Savings: ${currency}${calculations.interestSaved.toFixed(2)} saved & paid off ${calculations.yearsSaved} years earlier!` : ''}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied loan summary to clipboard', 'success');
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
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="$">$ (USD/CAD/AUD)</option>
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
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
        {/* Left Column: Loan Inputs */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-indigo-600" />
              Loan Terms & Financing
            </h3>

            {/* Loan Amount */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Loan Amount (Principal)
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  {currency}{loanAmount.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">{currency}</span>
                <input
                  type="number"
                  min={1000}
                  step={5000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>
              <input
                type="range"
                min={5000}
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
                  Annual Interest Rate (%)
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600">{interestRate}%</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={0.1}
                  max={30}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0.01, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white pr-8"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
              </div>
              <input
                type="range"
                min={1}
                max={18}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer mt-2"
              />
            </div>

            {/* Loan Term */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Loan Term (Years)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[10, 15, 20, 30].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setTermYears(yr)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      termYears === yr
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {yr} Yrs
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                max={50}
                value={termYears}
                onChange={(e) => setTermYears(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              />
            </div>

            {/* Extra Monthly Payment */}
            <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-1.5">
              <label className="block text-xs font-bold text-indigo-950 dark:text-indigo-300">
                Optional Extra Monthly Payment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-indigo-500">{currency}</span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={extraPaymentMonthly}
                  onChange={(e) => setExtraPaymentMonthly(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-xs font-bold"
                />
              </div>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400">
                Accelerates payoff and eliminates compound interest.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Key Outputs & Amortization Visuals */}
        <div className="lg:col-span-7 space-y-5">
          {/* Monthly Payment Summary Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Estimated Monthly Payment
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                    {currency}{calculations.standardMonthlyPayment.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">/ month</span>
                </div>
                {extraPaymentMonthly > 0 && (
                  <div className="text-xs font-bold text-indigo-600 mt-1">
                    Total with Extra: {currency}{calculations.actualMonthlyPayment.toFixed(2)}/mo
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold text-slate-500">Payoff Date</div>
                <div className="text-base font-black text-indigo-600 dark:text-indigo-400 flex items-center justify-end gap-1 mt-0.5">
                  <Calendar className="w-4 h-4" />
                  {calculations.payoffDate}
                </div>
              </div>
            </div>

            {/* Principal vs Interest Visual Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-indigo-600 font-bold">
                  Principal: {currency}{loanAmount.toLocaleString()} ({calculations.principalPercent.toFixed(0)}%)
                </span>
                <span className="text-amber-600 font-bold">
                  Interest: {currency}{calculations.totalInterestPaid.toFixed(2)} ({calculations.interestPercent.toFixed(0)}%)
                </span>
              </div>

              <div className="h-3.5 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                <div
                  style={{ width: `${calculations.principalPercent}%` }}
                  className="bg-indigo-600"
                  title="Principal Loan Amount"
                />
                <div
                  style={{ width: `${calculations.interestPercent}%` }}
                  className="bg-amber-500"
                  title="Total Interest"
                />
              </div>
            </div>

            {/* Extra Payment Benefit Card */}
            {extraPaymentMonthly > 0 && calculations.interestSaved > 0 && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 dark:text-emerald-300">
                  <div className="font-bold text-sm">
                    Save {currency}{calculations.interestSaved.toFixed(2)} in interest!
                  </div>
                  <div>
                    By paying an extra {currency}{extraPaymentMonthly}/mo, you will be debt-free{' '}
                    <span className="font-black">{calculations.yearsSaved} years earlier</span> ({calculations.monthsSaved} fewer months).
                  </div>
                </div>
              </div>
            )}

            {/* Loan Total Breakdown Table */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Principal</div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {currency}{loanAmount.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Interest</div>
                <div className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  {currency}{calculations.totalInterestPaid.toFixed(2)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 col-span-2 sm:col-span-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Payments</div>
                <div className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {currency}{calculations.totalPayment.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Amortization Schedule Table */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Amortization Breakdown ({calculations.yearlySchedule.length} Years)
              </h4>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setActiveTab('yearly')}
                  className={`px-3 py-1 rounded-lg ${activeTab === 'yearly' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-2xs' : 'text-slate-500'}`}
                >
                  Yearly
                </button>
                <button
                  onClick={() => setActiveTab('monthly')}
                  className={`px-3 py-1 rounded-lg ${activeTab === 'monthly' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-2xs' : 'text-slate-500'}`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96 rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2.5">Period</th>
                    <th className="p-2.5 text-right">Principal</th>
                    <th className="p-2.5 text-right">Interest</th>
                    <th className="p-2.5 text-right">Total Paid</th>
                    <th className="p-2.5 text-right">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {activeTab === 'yearly'
                    ? calculations.yearlySchedule.map((y) => (
                        <tr key={y.year} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="p-2.5 font-sans font-bold text-slate-900 dark:text-white">
                            Year {y.year}
                          </td>
                          <td className="p-2.5 text-right text-indigo-600 font-semibold">
                            {currency}{y.principalPaid.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right text-amber-600">
                            {currency}{y.interestPaid.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">
                            {currency}{y.totalPaid.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right font-semibold text-slate-500">
                            {currency}{y.endingBalance.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    : calculations.monthlySchedule.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="p-2.5 font-sans font-semibold text-slate-700 dark:text-slate-300">
                            {m.year}-{String(m.month).padStart(2, '0')}
                          </td>
                          <td className="p-2.5 text-right text-indigo-600">
                            {currency}{m.principal.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right text-amber-600">
                            {currency}{m.interest.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">
                            {currency}{m.totalPayment.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right text-slate-500">
                            {currency}{m.remainingBalance.toFixed(2)}
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

export default LoanCalculator;
