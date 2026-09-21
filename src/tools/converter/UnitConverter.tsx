import React, { useState, useMemo } from 'react';
import { ArrowLeftRight, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard } from '../../lib/utils';

type UnitType = 'length' | 'weight' | 'temperature' | 'speed' | 'digital' | 'area';

interface ConversionFactor {
  name: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (base: number) => number;
}

const UNIT_SYSTEMS: Record<UnitType, { name: string; units: Record<string, ConversionFactor> }> = {
  length: {
    name: 'Length & Distance',
    units: {
      m: { name: 'Meters', symbol: 'm', toBase: (v) => v, fromBase: (b) => b },
      km: { name: 'Kilometers', symbol: 'km', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      cm: { name: 'Centimeters', symbol: 'cm', toBase: (v) => v / 100, fromBase: (b) => b * 100 },
      mm: { name: 'Millimeters', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
      mi: { name: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (b) => b / 1609.344 },
      yd: { name: 'Yards', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (b) => b / 0.9144 },
      ft: { name: 'Feet', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (b) => b / 0.3048 },
      in: { name: 'Inches', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (b) => b / 0.0254 },
    },
  },
  weight: {
    name: 'Weight & Mass',
    units: {
      kg: { name: 'Kilograms', symbol: 'kg', toBase: (v) => v, fromBase: (b) => b },
      g: { name: 'Grams', symbol: 'g', toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
      mg: { name: 'Milligrams', symbol: 'mg', toBase: (v) => v / 1e6, fromBase: (b) => b * 1e6 },
      lb: { name: 'Pounds', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (b) => b / 0.45359237 },
      oz: { name: 'Ounces', symbol: 'oz', toBase: (v) => v * 0.0283495, fromBase: (b) => b / 0.0283495 },
      ton: { name: 'Metric Ton', symbol: 't', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
    },
  },
  temperature: {
    name: 'Temperature',
    units: {
      c: { name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (b) => b },
      f: { name: 'Fahrenheit', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (b) => (b * 9) / 5 + 32 },
      k: { name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (b) => b + 273.15 },
    },
  },
  speed: {
    name: 'Speed & Velocity',
    units: {
      kmh: { name: 'Kilometers per Hour', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (b) => b * 3.6 },
      mph: { name: 'Miles per Hour', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (b) => b / 0.44704 },
      ms: { name: 'Meters per Second', symbol: 'm/s', toBase: (v) => v, fromBase: (b) => b },
      knot: { name: 'Knots', symbol: 'kn', toBase: (v) => v * 0.514444, fromBase: (b) => b / 0.514444 },
    },
  },
  digital: {
    name: 'Digital Data',
    units: {
      b: { name: 'Bytes', symbol: 'B', toBase: (v) => v, fromBase: (b) => b },
      kb: { name: 'Kilobytes (KB)', symbol: 'KB', toBase: (v) => v * 1024, fromBase: (b) => b / 1024 },
      mb: { name: 'Megabytes (MB)', symbol: 'MB', toBase: (v) => v * 1048576, fromBase: (b) => b / 1048576 },
      gb: { name: 'Gigabytes (GB)', symbol: 'GB', toBase: (v) => v * 1073741824, fromBase: (b) => b / 1073741824 },
      tb: { name: 'Terabytes (TB)', symbol: 'TB', toBase: (v) => v * 1.0995116e12, fromBase: (b) => b / 1.0995116e12 },
    },
  },
  area: {
    name: 'Area & Surface',
    units: {
      sqm: { name: 'Square Meters', symbol: 'm²', toBase: (v) => v, fromBase: (b) => b },
      sqkm: { name: 'Square Kilometers', symbol: 'km²', toBase: (v) => v * 1e6, fromBase: (b) => b / 1e6 },
      sqft: { name: 'Square Feet', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (b) => b / 0.092903 },
      acre: { name: 'Acres', symbol: 'ac', toBase: (v) => v * 4046.86, fromBase: (b) => b / 4046.86 },
      ha: { name: 'Hectares', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (b) => b / 10000 },
    },
  },
};

export const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<UnitType>('length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');
  const [inputValue, setInputValue] = useState<number>(100);

  const { showToast } = useToast();

  const currentCategoryUnits = UNIT_SYSTEMS[category].units;

  const result = useMemo(() => {
    const fromFactor = currentCategoryUnits[fromUnit];
    const toFactor = currentCategoryUnits[toUnit];
    if (!fromFactor || !toFactor) return 0;

    const baseVal = fromFactor.toBase(inputValue);
    return toFactor.fromBase(baseVal);
  }, [category, fromUnit, toUnit, inputValue, currentCategoryUnits]);

  // All cross units matrix
  const allUnitValues = useMemo(() => {
    const fromFactor = currentCategoryUnits[fromUnit];
    if (!fromFactor) return [];
    const baseVal = fromFactor.toBase(inputValue);

    return (Object.entries(currentCategoryUnits) as [string, ConversionFactor][]).map(([key, factor]) => ({
      key,
      name: factor.name,
      symbol: factor.symbol,
      value: factor.fromBase(baseVal),
    }));
  }, [category, fromUnit, inputValue, currentCategoryUnits]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleCategoryChange = (cat: UnitType) => {
    setCategory(cat);
    const keys = Object.keys(UNIT_SYSTEMS[cat].units);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {(Object.keys(UNIT_SYSTEMS) as UnitType[]).map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
              category === cat
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {UNIT_SYSTEMS[cat].name}
          </button>
        ))}
      </div>

      {/* Main Converter Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* From */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-semibold text-slate-500">From</label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-lg font-bold"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              {(Object.entries(currentCategoryUnits) as [string, ConversionFactor][]).map(([k, u]) => (
                <option key={k} value={k}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Swap */}
          <div className="md:col-span-1 flex justify-center pt-4">
            <button
              onClick={handleSwap}
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
              title="Swap Units"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* To */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-semibold text-slate-500">To (Calculated)</label>
            <div className="w-full px-4 py-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/40 text-lg font-extrabold text-indigo-700 dark:text-indigo-300 truncate">
              {Number(result.toFixed(6))} {currentCategoryUnits[toUnit]?.symbol}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              {(Object.entries(currentCategoryUnits) as [string, ConversionFactor][]).map(([k, u]) => (
                <option key={k} value={k}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cross Conversion Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Equivalent Values in All {UNIT_SYSTEMS[category].name} Units
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {allUnitValues.map((item) => (
            <div
              key={item.key}
              onClick={async () => {
                const ok = await copyToClipboard(String(item.value));
                if (ok) showToast(`Copied ${item.value} ${item.symbol}`, 'success');
              }}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 cursor-pointer transition-all group"
            >
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                <p className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {Number(item.value.toFixed(6))} {item.symbol}
                </p>
              </div>
              <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default UnitConverter;
