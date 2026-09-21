import React, { useState } from 'react';
import { Tag, Percent, DollarSign, ArrowRight, Copy, Check, RefreshCw, Sparkles, ShoppingBag, Receipt } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const DiscountCalculator: React.FC = () => {
  const { showToast } = useToast();

  const [currency, setCurrency] = useState<string>('$');
  const [activeTab, setActiveTab] = useState<'standard' | 'double' | 'bogo' | 'reverse'>('standard');

  // Mode 1: Standard & Stacked Discount
  const [originalPrice, setOriginalPrice] = useState<number>(120);
  const [discountPercent, setDiscountPercent] = useState<number>(25);
  const [extraDiscountType, setExtraDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [extraDiscountValue, setExtraDiscountValue] = useState<number>(10);
  const [taxPercent, setTaxPercent] = useState<number>(8);

  // Mode 2: BOGO (Buy X Get Y at Z% off)
  const [itemPrice, setItemPrice] = useState<number>(45);
  const [buyQty, setBuyQty] = useState<number>(2);
  const [getQty, setGetQty] = useState<number>(1);
  const [getDiscountPercent, setGetDiscountPercent] = useState<number>(50); // 50% off or 100% (free)

  // Mode 3: Reverse Calculator (Find Original Price from final price and discount %)
  const [finalPaidPrice, setFinalPaidPrice] = useState<number>(75);
  const [reverseDiscountPercent, setReverseDiscountPercent] = useState<number>(25);

  const [copied, setCopied] = useState<boolean>(false);

  // Mode 1 Calculations
  const primaryDiscountAmount = (originalPrice * discountPercent) / 100;
  const priceAfterPrimary = Math.max(0, originalPrice - primaryDiscountAmount);

  let extraDiscountAmount = 0;
  if (extraDiscountType === 'percent') {
    extraDiscountAmount = (priceAfterPrimary * extraDiscountValue) / 100;
  } else {
    extraDiscountAmount = Math.min(priceAfterPrimary, extraDiscountValue);
  }

  const subtotalAfterDiscounts = Math.max(0, priceAfterPrimary - extraDiscountAmount);
  const totalSavings = originalPrice - subtotalAfterDiscounts;
  const effectiveDiscountPercent = originalPrice > 0 ? (totalSavings / originalPrice) * 100 : 0;

  const taxAmount = (subtotalAfterDiscounts * taxPercent) / 100;
  const finalPriceWithTax = subtotalAfterDiscounts + taxAmount;

  // BOGO Calculations
  const totalBogoItems = buyQty + getQty;
  const bogoFullPriceTotal = totalBogoItems * itemPrice;
  const bogoDiscountPerDiscountedItem = (itemPrice * getDiscountPercent) / 100;
  const bogoTotalSavings = getQty * bogoDiscountPerDiscountedItem;
  const bogoFinalTotal = bogoFullPriceTotal - bogoTotalSavings;
  const bogoEffectivePricePerItem = totalBogoItems > 0 ? bogoFinalTotal / totalBogoItems : 0;
  const bogoSavingsPercent = bogoFullPriceTotal > 0 ? (bogoTotalSavings / bogoFullPriceTotal) * 100 : 0;

  // Reverse Calculations
  const calculatedOriginalPrice = reverseDiscountPercent < 100
    ? finalPaidPrice / (1 - reverseDiscountPercent / 100)
    : 0;
  const calculatedSavings = calculatedOriginalPrice - finalPaidPrice;

  const handleCopyReceipt = async () => {
    let receiptText = '';
    if (activeTab === 'standard' || activeTab === 'double') {
      receiptText = `Discount Receipt Breakdown:
• Original Price: ${currency}${originalPrice.toFixed(2)}
• Primary Discount (${discountPercent}%): -${currency}${primaryDiscountAmount.toFixed(2)}
${extraDiscountValue > 0 ? `• Extra Promo (${extraDiscountValue}${extraDiscountType === 'percent' ? '%' : currency}): -${currency}${extraDiscountAmount.toFixed(2)}\n` : ''}• Subtotal: ${currency}${subtotalAfterDiscounts.toFixed(2)}
• Total Savings: ${currency}${totalSavings.toFixed(2)} (${effectiveDiscountPercent.toFixed(1)}% off)
• Tax (${taxPercent}%): +${currency}${taxAmount.toFixed(2)}
• Final Out-of-Pocket: ${currency}${finalPriceWithTax.toFixed(2)}`;
    } else if (activeTab === 'bogo') {
      receiptText = `Promotional Deal Breakdown:
• Deal: Buy ${buyQty} Get ${getQty} @ ${getDiscountPercent}% Off
• Regular Cost (${totalBogoItems} items): ${currency}${bogoFullPriceTotal.toFixed(2)}
• Promotional Savings: -${currency}${bogoTotalSavings.toFixed(2)} (${bogoSavingsPercent.toFixed(1)}% off)
• Final Total: ${currency}${bogoFinalTotal.toFixed(2)} (${currency}${bogoEffectivePricePerItem.toFixed(2)} / each)`;
    } else {
      receiptText = `Reverse Discount Calculation:
• Final Sale Price: ${currency}${finalPaidPrice.toFixed(2)}
• Discount Applied: ${reverseDiscountPercent}%
• Calculated Original Price: ${currency}${calculatedOriginalPrice.toFixed(2)}
• Total Saved: ${currency}${calculatedSavings.toFixed(2)}`;
    }

    await navigator.clipboard.writeText(receiptText);
    setCopied(true);
    showToast('Copied discount breakdown to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick matrix rates
  const matrixPercentages = [10, 15, 20, 25, 30, 40, 50, 60, 70, 75];

  return (
    <div className="space-y-8">
      {/* Top Selector & Currency Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('standard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'standard'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Standard Sale
            </button>
            <button
              onClick={() => setActiveTab('double')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'double'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Stacked Coupons
            </button>
            <button
              onClick={() => setActiveTab('bogo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'bogo'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Buy X Get Y
            </button>
            <button
              onClick={() => setActiveTab('reverse')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'reverse'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Reverse Find
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="$">$ (USD/CAD/AUD)</option>
              <option value="€">€ (EUR)</option>
              <option value="£">£ (GBP)</option>
              <option value="¥">¥ (JPY/CNY)</option>
              <option value="₹">₹ (INR)</option>
              <option value="৳">৳ (BDT)</option>
            </select>
          </div>

          <button
            onClick={handleCopyReceipt}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Breakdown'}
          </button>
        </div>
      </div>

      {/* Mode Views */}
      {(activeTab === 'standard' || activeTab === 'double') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Inputs */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                Price & Discount Details
              </h3>

              {/* Original Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Original Price
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Primary Discount % */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Discount Percentage
                  </label>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {discountPercent}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={95}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="flex-1 accent-indigo-600 cursor-pointer"
                  />
                  <div className="relative w-20">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-center pr-6"
                    />
                    <span className="absolute right-2 top-2 text-xs text-slate-400 font-bold">%</span>
                  </div>
                </div>

                {/* Quick discount chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[10, 15, 20, 25, 30, 50, 70].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDiscountPercent(p)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        discountPercent === p
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra Promo / Stacked coupon if in stacked mode */}
              {activeTab === 'double' && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                      Additional Extra Coupon / Promo
                    </span>
                    <div className="flex gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setExtraDiscountType('percent')}
                        className={`px-2 py-0.5 rounded font-bold ${
                          extraDiscountType === 'percent' ? 'bg-amber-600 text-white' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-800'
                        }`}
                      >
                        % Off
                      </button>
                      <button
                        type="button"
                        onClick={() => setExtraDiscountType('fixed')}
                        className={`px-2 py-0.5 rounded font-bold ${
                          extraDiscountType === 'fixed' ? 'bg-amber-600 text-white' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-800'
                        }`}
                      >
                        {currency} Off
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={extraDiscountValue}
                      onChange={(e) => setExtraDiscountValue(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                    <span className="absolute right-3 top-1.5 text-xs text-amber-600 font-bold">
                      {extraDiscountType === 'percent' ? '% extra' : `${currency} off`}
                    </span>
                  </div>
                </div>
              )}

              {/* Sales Tax % */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Estimated Sales Tax (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white pr-8"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* Highlight Headline */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Final Out-of-Pocket Price
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                      {currency}{finalPriceWithTax.toFixed(2)}
                    </span>
                    {taxPercent > 0 && (
                      <span className="text-xs text-slate-400 font-medium">
                        (incl. {taxPercent}% tax)
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-right">
                  <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">
                    Total Savings
                  </div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {currency}{totalSavings.toFixed(2)}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {effectiveDiscountPercent.toFixed(1)}% OFF
                  </div>
                </div>
              </div>

              {/* Progress Bar of Savings */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Pay {currency}{subtotalAfterDiscounts.toFixed(2)}</span>
                  <span className="text-emerald-600 font-bold">Save {currency}{totalSavings.toFixed(2)} ({effectiveDiscountPercent.toFixed(0)}%)</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div
                    style={{ width: `${Math.min(100, Math.max(0, 100 - effectiveDiscountPercent))}%` }}
                    className="bg-indigo-600"
                    title="Amount to pay"
                  />
                  <div
                    style={{ width: `${Math.min(100, Math.max(0, effectiveDiscountPercent))}%` }}
                    className="bg-emerald-500"
                    title="Amount saved"
                  />
                </div>
              </div>

              {/* Itemized Price Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-indigo-600" />
                  Itemized Price Receipt
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Original Listed Price</span>
                  <span className="font-mono font-semibold">{currency}{originalPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Primary Discount ({discountPercent}%)</span>
                  <span className="font-mono">- {currency}{primaryDiscountAmount.toFixed(2)}</span>
                </div>

                {extraDiscountAmount > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
                    <span>Extra Promo ({extraDiscountValue}{extraDiscountType === 'percent' ? '%' : currency})</span>
                    <span className="font-mono">- {currency}{extraDiscountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-800 dark:text-slate-200 font-bold pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Subtotal After Discounts</span>
                  <span className="font-mono">{currency}{subtotalAfterDiscounts.toFixed(2)}</span>
                </div>

                {taxPercent > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Estimated Sales Tax ({taxPercent}%)</span>
                    <span className="font-mono">+ {currency}{taxAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-900 dark:text-white font-extrabold text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Amount Due</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{currency}{finalPriceWithTax.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Quick Discount Lookup Matrix */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Quick Discount Matrix for {currency}{originalPrice.toFixed(2)}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {matrixPercentages.map((pct) => {
                  const save = (originalPrice * pct) / 100;
                  const pay = originalPrice - save;
                  return (
                    <div
                      key={pct}
                      onClick={() => setDiscountPercent(pct)}
                      className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                        discountPercent === pct
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-black text-indigo-600 dark:text-indigo-400">{pct}% OFF</div>
                      <div className="text-[11px] font-bold text-slate-900 dark:text-white mt-0.5">
                        {currency}{pay.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-emerald-600">Save {currency}{save.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode BOGO */}
      {activeTab === 'bogo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              Promotional Bundle Parameters
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Individual Item Price
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">{currency}</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={itemPrice}
                  onChange={(e) => setItemPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Buy Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={buyQty}
                  onChange={(e) => setBuyQty(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Get Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={getQty}
                  onChange={(e) => setGetQty(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Discount on Second Item
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[100, 50, 40].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setGetDiscountPercent(d)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      getDiscountPercent === d
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {d === 100 ? '100% (FREE)' : `${d}% OFF`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Bundle Cost ({totalBogoItems} Items)
                </span>
                <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {currency}{bogoFinalTotal.toFixed(2)}
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-right">
                <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">
                  Effective Price Each
                </div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {currency}{bogoEffectivePricePerItem.toFixed(2)}
                </div>
                <div className="text-[11px] font-bold text-emerald-600">
                  Save {bogoSavingsPercent.toFixed(1)}% total
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Standard Full Price ({totalBogoItems} × {currency}{itemPrice.toFixed(2)})</span>
                <span className="font-mono">{currency}{bogoFullPriceTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Promotional Discount Amount</span>
                <span className="font-mono">- {currency}{bogoTotalSavings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 dark:text-white font-extrabold text-sm pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Total Payment</span>
                <span className="font-mono text-emerald-600">{currency}{bogoFinalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Reverse */}
      {activeTab === 'reverse' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-600" />
              Reverse Price Finder
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Discounted Final Price Paid
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">{currency}</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={finalPaidPrice}
                  onChange={(e) => setFinalPaidPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Discount Percentage Applied (%)
              </label>
              <input
                type="number"
                min={0}
                max={99}
                value={reverseDiscountPercent}
                onChange={(e) => setReverseDiscountPercent(Math.min(99, Math.max(0, Number(e.target.value))))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
              />
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Calculated Original Listing Price
            </span>
            <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
              {currency}{calculatedOriginalPrice.toFixed(2)}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Calculated Initial Price</span>
                <span className="font-mono">{currency}{calculatedOriginalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Total Discount Saved ({reverseDiscountPercent}%)</span>
                <span className="font-mono">- {currency}{calculatedSavings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 dark:text-white font-bold pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Price You Paid</span>
                <span className="font-mono">{currency}{finalPaidPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountCalculator;
