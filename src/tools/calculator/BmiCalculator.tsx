import React, { useState } from 'react';
import { Activity, Scale, Heart, Info, RefreshCw, Copy, Check, TrendingUp, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const BmiCalculator: React.FC = () => {
  const { showToast } = useToast();

  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(28);

  // Metric inputs
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(70);

  // Imperial inputs
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(9);
  const [weightLbs, setWeightLbs] = useState<number>(154);

  // Activity level for TDEE
  const [activityLevel, setActivityLevel] = useState<number>(1.375); // Lightly active

  const [copied, setCopied] = useState<boolean>(false);

  // Unified calculations
  let effectiveHeightM = 0;
  let effectiveWeightKg = 0;

  if (unitSystem === 'metric') {
    effectiveHeightM = heightCm > 0 ? heightCm / 100 : 1.75;
    effectiveWeightKg = weightKg > 0 ? weightKg : 70;
  } else {
    const totalInches = (heightFt * 12) + (heightIn || 0);
    effectiveHeightM = (totalInches * 2.54) / 100;
    effectiveWeightKg = (weightLbs > 0 ? weightLbs : 154) * 0.45359237;
  }

  const bmi = effectiveHeightM > 0 ? effectiveWeightKg / (effectiveHeightM * effectiveHeightM) : 0;
  const bmiFormatted = bmi > 0 ? bmi.toFixed(1) : '0.0';

  // Healthy weight range for normal BMI (18.5 - 24.9)
  const minHealthyKg = 18.5 * (effectiveHeightM * effectiveHeightM);
  const maxHealthyKg = 24.9 * (effectiveHeightM * effectiveHeightM);

  const minHealthyDisplay = unitSystem === 'metric' ? `${minHealthyKg.toFixed(1)} kg` : `${(minHealthyKg * 2.20462).toFixed(1)} lbs`;
  const maxHealthyDisplay = unitSystem === 'metric' ? `${maxHealthyKg.toFixed(1)} kg` : `${(maxHealthyKg * 2.20462).toFixed(1)} lbs`;

  // Weight delta to healthy range
  let weightDeltaText = '';
  if (effectiveWeightKg < minHealthyKg) {
    const diff = minHealthyKg - effectiveWeightKg;
    const diffDisplay = unitSystem === 'metric' ? `${diff.toFixed(1)} kg` : `${(diff * 2.20462).toFixed(1)} lbs`;
    weightDeltaText = `Gain ${diffDisplay} to reach healthy weight`;
  } else if (effectiveWeightKg > maxHealthyKg) {
    const diff = effectiveWeightKg - maxHealthyKg;
    const diffDisplay = unitSystem === 'metric' ? `${diff.toFixed(1)} kg` : `${(diff * 2.20462).toFixed(1)} lbs`;
    weightDeltaText = `Lose ${diffDisplay} to reach healthy weight`;
  } else {
    weightDeltaText = 'You are currently in the healthy weight range!';
  }

  // Body Fat % (Deurenberg formula: (1.20 * BMI) + (0.23 * Age) - (10.8 * genderFactor) - 5.4)
  const genderFactor = gender === 'male' ? 1 : 0;
  const bodyFatEstimate = bmi > 0 ? Math.max(2, (1.2 * bmi) + (0.23 * age) - (10.8 * genderFactor) - 5.4) : 0;

  // BMR (Mifflin-St Jeor formula)
  // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
  // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
  const heightInCm = effectiveHeightM * 100;
  const bmr = gender === 'male'
    ? (10 * effectiveWeightKg) + (6.25 * heightInCm) - (5 * age) + 5
    : (10 * effectiveWeightKg) + (6.25 * heightInCm) - (5 * age) - 161;

  const tdee = Math.round(bmr * activityLevel);

  // WHO Categories
  interface BmiCategory {
    label: string;
    range: string;
    color: string;
    textColor: string;
    bgBadge: string;
    min: number;
    max: number;
    description: string;
  }

  const categories: BmiCategory[] = [
    { label: 'Underweight', range: '< 18.5', color: '#38bdf8', textColor: 'text-sky-600 dark:text-sky-400', bgBadge: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800', min: 0, max: 18.49, description: 'Higher risk of nutritional deficiency and osteoporosis.' },
    { label: 'Normal weight', range: '18.5 – 24.9', color: '#10b981', textColor: 'text-emerald-600 dark:text-emerald-400', bgBadge: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800', min: 18.5, max: 24.99, description: 'Lowest health risk and optimal cardiovascular balance.' },
    { label: 'Overweight', range: '25.0 – 29.9', color: '#f59e0b', textColor: 'text-amber-600 dark:text-amber-400', bgBadge: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800', min: 25, max: 29.99, description: 'Moderate risk; regular exercise and balanced diet advised.' },
    { label: 'Obesity Class I', range: '30.0 – 34.9', color: '#f97316', textColor: 'text-orange-600 dark:text-orange-400', bgBadge: 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800', min: 30, max: 34.99, description: 'High risk of hypertension, diabetes, and joint fatigue.' },
    { label: 'Obesity Class II & III', range: '≥ 35.0', color: '#ef4444', textColor: 'text-rose-600 dark:text-rose-400', bgBadge: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800', min: 35, max: 100, description: 'Very high health risk. Medical guidance recommended.' },
  ];

  const currentCategory = categories.find((c) => bmi >= c.min && bmi <= c.max) || categories[categories.length - 1];

  // Gauge pointer percentage (mapped from BMI 14 to 40)
  const gaugePercent = Math.min(Math.max(((bmi - 14) / (40 - 14)) * 100, 0), 100);

  const handleCopySummary = async () => {
    const text = `BMI Calculator Summary:\n• BMI: ${bmiFormatted} (${currentCategory.label})\n• Healthy Weight Range: ${minHealthyDisplay} - ${maxHealthyDisplay}\n• Estimated Body Fat: ${bodyFatEstimate.toFixed(1)}%\n• BMR: ${Math.round(bmr)} kcal/day\n• Daily Maintenance Calories (TDEE): ${tdee} kcal/day`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied BMI health metrics to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Unit switch & Quick controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setUnitSystem('metric')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                unitSystem === 'metric'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Metric (kg / cm)
            </button>
            <button
              onClick={() => setUnitSystem('imperial')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                unitSystem === 'imperial'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Imperial (lbs / ft-in)
            </button>
          </div>
        </div>

        <button
          onClick={handleCopySummary}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied Metrics' : 'Copy Summary'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              Body Parameters
            </h3>

            {/* Gender & Age */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      gender === 'male'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      gender === 'female'
                        ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Height Input */}
            {unitSystem === 'metric' ? (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Height
                  </label>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {heightCm} cm ({(heightCm / 100).toFixed(2)} m)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={100}
                    max={230}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="flex-1 accent-indigo-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min={50}
                    max={250}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-center text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Height
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      min={2}
                      max={7}
                      value={heightFt}
                      onChange={(e) => setHeightFt(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">ft</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={11}
                      value={heightIn}
                      onChange={(e) => setHeightIn(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">in</span>
                  </div>
                </div>
              </div>
            )}

            {/* Weight Input */}
            {unitSystem === 'metric' ? (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Weight
                  </label>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {weightKg} kg
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={30}
                    max={200}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="flex-1 accent-indigo-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min={20}
                    max={300}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-center text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Weight
                  </label>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {weightLbs} lbs
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={60}
                    max={450}
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(Number(e.target.value))}
                    className="flex-1 accent-indigo-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min={40}
                    max={600}
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(Number(e.target.value))}
                    className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-center text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Activity Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Activity Level (for TDEE Calorie Estimate)
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                <option value={1.2}>Sedentary (Little or no exercise)</option>
                <option value={1.375}>Light Exercise (1-3 days/week)</option>
                <option value={1.55}>Moderate Exercise (3-5 days/week)</option>
                <option value={1.725}>Very Active (6-7 days/week)</option>
                <option value={1.9}>Extra Active (Physical job or 2x training)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Results, Visual Gauge & Health Insights */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main BMI Score Display */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Your Body Mass Index
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                    {bmiFormatted}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">kg/m²</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold border ${currentCategory.bgBadge} ${currentCategory.textColor}`}
                  >
                    {currentCategory.label}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold text-slate-500">Healthy Range</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {minHealthyDisplay} – {maxHealthyDisplay}
                </div>
              </div>
            </div>

            {/* Visual Color Meter Gauge Bar */}
            <div className="space-y-2">
              <div className="relative h-4 rounded-full overflow-hidden flex shadow-inner">
                <div style={{ width: '20%' }} className="bg-sky-400" title="Underweight (<18.5)" />
                <div style={{ width: '30%' }} className="bg-emerald-500" title="Normal (18.5 - 24.9)" />
                <div style={{ width: '25%' }} className="bg-amber-400" title="Overweight (25.0 - 29.9)" />
                <div style={{ width: '15%' }} className="bg-orange-500" title="Obese I (30.0 - 34.9)" />
                <div style={{ width: '10%' }} className="bg-rose-500" title="Obese II/III (≥35.0)" />
              </div>

              {/* Marker Pointer */}
              <div className="relative h-4">
                <div
                  className="absolute -top-1 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                  style={{ left: `${gaugePercent}%` }}
                >
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-slate-900 dark:border-b-white" />
                  <span className="text-[10px] font-extrabold text-slate-900 dark:text-white font-mono">
                    {bmiFormatted}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-[10px] font-bold text-slate-400 pt-1">
                <span>14.0 (Under)</span>
                <span>18.5 (Normal)</span>
                <span>25.0 (Over)</span>
                <span>30.0 (Obese)</span>
                <span>40.0+</span>
              </div>
            </div>

            {/* Weight Guidance alert */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold">Health Insight: </span>
                {weightDeltaText} ({currentCategory.description})
              </div>
            </div>

            {/* Additional Advanced Health Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Est. Body Fat</div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {bodyFatEstimate.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400">Deurenberg formula</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Basal Metabolic Rate</div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {Math.round(bmr)} <span className="text-xs font-normal text-slate-400">kcal/day</span>
                </div>
                <div className="text-[10px] text-slate-400">Resting baseline</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Maintenance TDEE</div>
                <div className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {tdee.toLocaleString()} <span className="text-xs font-normal text-slate-400">kcal/day</span>
                </div>
                <div className="text-[10px] text-slate-400">Daily energy need</div>
              </div>
            </div>
          </div>

          {/* WHO Category Reference Table */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              World Health Organization (WHO) BMI Classifications
            </h4>
            <div className="space-y-1.5 text-xs">
              {categories.map((c) => {
                const isActive = currentCategory.label === c.label;
                return (
                  <div
                    key={c.label}
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                      isActive
                        ? `${c.bgBadge} border font-bold shadow-2xs`
                        : 'bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span>{c.label}</span>
                    </div>
                    <span className="font-mono font-semibold">{c.range} kg/m²</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BmiCalculator;
