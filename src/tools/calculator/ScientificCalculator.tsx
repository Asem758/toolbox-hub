import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Calculator,
  RotateCcw,
  Copy,
  Check,
  History,
  Trash2,
  Delete,
  Sparkles,
  Equal,
  Percent,
  Plus,
  Minus,
  X,
  Divide,
  CornerDownLeft,
  ChevronRight,
  Info,
  Layers,
} from 'lucide-react';
import { copyToClipboard } from '../../lib/utils';

interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export const ScientificCalculator: React.FC = () => {
  const { showToast } = useToast();

  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [isRadMode, setIsRadMode] = useState<boolean>(false); // false = DEG, true = RAD
  const [isSecondMode, setIsSecondMode] = useState<boolean>(false); // 2nd function shift
  const [isHypMode, setIsHypMode] = useState<boolean>(false); // Hyperbolic functions
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('toolbox_scientific_calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [lastCalculated, setLastCalculated] = useState<boolean>(false);

  const displayRef = useRef<HTMLDivElement>(null);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('toolbox_scientific_calc_history', JSON.stringify(history.slice(0, 50)));
    } catch {
      // ignore storage errors
    }
  }, [history]);

  // Factorial helper function
  const factorial = (n: number): number => {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= Math.min(n, 170); i++) {
      res *= i;
    }
    return res;
  };

  // Safe mathematical evaluation engine
  const evaluateExpression = useCallback((exprStr: string, radMode: boolean): { success: boolean; value: string; error?: string } => {
    if (!exprStr.trim()) {
      return { success: true, value: '0' };
    }

    try {
      // Clean string
      let sanitized = exprStr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/π/g, `${Math.PI}`)
        .replace(/e(?![a-zA-Z0-9_])/g, `${Math.E}`)
        .replace(/ϕ/g, `${(1 + Math.sqrt(5)) / 2}`);

      // Handle implicit multiplication like 2(3), (2)(3), 2π, 2sin(x), 2sqrt(x)
      sanitized = sanitized.replace(/(\d)(\()/g, '$1*(');
      sanitized = sanitized.replace(/(\))(\d)/g, '$1*$2');
      sanitized = sanitized.replace(/(\))(\()/g, '$1*(');
      sanitized = sanitized.replace(/(\d)(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|asinh|acosh|atanh|ln|log|sqrt|cbrt|abs)/g, '$1*$2');

      // Convert trig degrees to radians if in DEG mode
      const toRad = (angle: number) => (radMode ? angle : (angle * Math.PI) / 180);
      const fromRad = (val: number) => (radMode ? val : (val * 180) / Math.PI);

      // Custom Math environment context
      const customScope: Record<string, any> = {
        sin: (x: number) => Math.sin(toRad(x)),
        cos: (x: number) => Math.cos(toRad(x)),
        tan: (x: number) => {
          const rad = toRad(x);
          const cosVal = Math.cos(rad);
          if (Math.abs(cosVal) < 1e-15) throw new Error('Undefined');
          return Math.tan(rad);
        },
        asin: (x: number) => fromRad(Math.asin(x)),
        acos: (x: number) => fromRad(Math.acos(x)),
        atan: (x: number) => fromRad(Math.atan(x)),
        sinh: (x: number) => Math.sinh(x),
        cosh: (x: number) => Math.cosh(x),
        tanh: (x: number) => Math.tanh(x),
        asinh: (x: number) => Math.asinh(x),
        acosh: (x: number) => Math.acosh(x),
        atanh: (x: number) => Math.atanh(x),
        ln: (x: number) => Math.log(x),
        log: (x: number) => Math.log10(x),
        log2: (x: number) => Math.log2(x),
        sqrt: (x: number) => Math.sqrt(x),
        cbrt: (x: number) => Math.cbrt(x),
        abs: (x: number) => Math.abs(x),
        fact: factorial,
        floor: Math.floor,
        ceil: Math.ceil,
        round: Math.round,
        rand: () => Math.random(),
        PI: Math.PI,
        E: Math.E,
      };

      // Replace power operator `^` with `**`
      sanitized = sanitized.replace(/\^/g, '**');

      // Replace percentage `%` as `/100` when used as postfix
      sanitized = sanitized.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

      // Handle factorial `n!` with `fact(n)`
      sanitized = sanitized.replace(/(\d+(?:\.\d+)?)!/g, 'fact($1)');

      // Check for illegal identifiers (security check against eval injection)
      const allowedTokens = /^[0-9+\-*/()., %^!*<>&|~?:=a-zA-Z_]+$/;
      if (!allowedTokens.test(sanitized)) {
        return { success: false, value: 'Error', error: 'Invalid Characters' };
      }

      // Safe Function evaluation with custom scope parameters
      const scopeKeys = Object.keys(customScope);
      const scopeValues = Object.values(customScope);

      // eslint-disable-next-line no-new-func
      const evaluator = new Function(...scopeKeys, `"use strict"; return (${sanitized});`);
      const rawResult = evaluator(...scopeValues);

      if (rawResult === undefined || rawResult === null) {
        return { success: false, value: 'Error' };
      }

      if (typeof rawResult !== 'number' || isNaN(rawResult)) {
        return { success: false, value: 'Error', error: 'Undefined/NaN' };
      }

      if (!isFinite(rawResult)) {
        return { success: false, value: rawResult > 0 ? 'Infinity' : '-Infinity' };
      }

      // Format high-precision rounding to eliminate JS floating point inaccuracies (e.g. 0.1+0.2)
      let formatted: string;
      if (Math.abs(rawResult) < 1e-10 && rawResult !== 0) {
        formatted = rawResult.toExponential(6);
      } else if (Math.abs(rawResult) >= 1e15) {
        formatted = rawResult.toExponential(8);
      } else {
        // Round to 12 decimal places max, trim trailing zeros
        const fixed = parseFloat(rawResult.toPrecision(12));
        formatted = fixed.toString();
      }

      return { success: true, value: formatted };
    } catch (err: any) {
      return { success: false, value: 'Error', error: err.message || 'Syntax Error' };
    }
  }, []);

  // Handle equal button
  const handleCalculate = () => {
    if (!expression.trim()) return;

    const evalResult = evaluateExpression(expression, isRadMode);
    if (evalResult.success) {
      setResult(evalResult.value);
      setLastCalculated(true);

      const newItem: CalculationHistoryItem = {
        id: Date.now().toString(),
        expression,
        result: evalResult.value,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setHistory((prev) => [newItem, ...prev]);
    } else {
      setResult('Error');
      showToast(evalResult.error || 'Invalid mathematical expression', 'error');
    }
  };

  // Insert token to expression
  const handleInsert = (token: string, isFunction: boolean = false) => {
    if (lastCalculated && !['+', '-', '×', '÷', '^', '%'].includes(token)) {
      setExpression(isFunction ? `${token}(` : token);
      setLastCalculated(false);
      return;
    }

    if (lastCalculated && ['+', '-', '×', '÷', '^', '%'].includes(token)) {
      setExpression(result + token);
      setLastCalculated(false);
      return;
    }

    setLastCalculated(false);
    if (isFunction) {
      setExpression((prev) => prev + `${token}(`);
    } else {
      setExpression((prev) => prev + token);
    }
  };

  // Backspace
  const handleBackspace = () => {
    if (lastCalculated) {
      setExpression('');
      setLastCalculated(false);
      return;
    }
    setExpression((prev) => prev.slice(0, -1));
  };

  // Clear All
  const handleClear = () => {
    setExpression('');
    setResult('0');
    setLastCalculated(false);
  };

  // Memory operations
  const handleMemoryStore = () => {
    const num = parseFloat(result);
    if (!isNaN(num)) {
      setMemory(num);
      showToast(`Stored ${num} in Memory (M)`, 'info');
    }
  };

  const handleMemoryRecall = () => {
    handleInsert(memory.toString());
    showToast(`Recalled ${memory} from Memory`, 'info');
  };

  const handleMemoryAdd = () => {
    const num = parseFloat(result);
    if (!isNaN(num)) {
      setMemory((prev) => prev + num);
      showToast(`Added ${num} to Memory`, 'info');
    }
  };

  const handleMemorySubtract = () => {
    const num = parseFloat(result);
    if (!isNaN(num)) {
      setMemory((prev) => prev - num);
      showToast(`Subtracted ${num} from Memory`, 'info');
    }
  };

  const handleMemoryClear = () => {
    setMemory(0);
    showToast('Memory Cleared (MC)', 'info');
  };

  // Copy result
  const handleCopyResult = async () => {
    if (result && result !== 'Error') {
      const ok = await copyToClipboard(result);
      if (ok) {
        setCopied(true);
        showToast('Result copied to clipboard!', 'success');
        setTimeout(() => setCopied(false), 1500);
      }
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in other inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleInsert(e.key);
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        e.preventDefault();
        const map: Record<string, string> = { '*': '×', '/': '÷', '-': '−', '+': '+' };
        handleInsert(map[e.key] || e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleInsert('.');
      } else if (e.key === '(' || e.key === ')') {
        e.preventDefault();
        handleInsert(e.key);
      } else if (e.key === '^') {
        e.preventDefault();
        handleInsert('^');
      } else if (e.key === '%') {
        e.preventDefault();
        handleInsert('%');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression, lastCalculated, result, isRadMode]);

  return (
    <div className="space-y-6">
      {/* Top Header Controls Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Angle Mode DEG / RAD */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setIsRadMode(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !isRadMode
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              DEG
            </button>
            <button
              onClick={() => setIsRadMode(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isRadMode
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              RAD
            </button>
          </div>

          {/* 2nd Function Shift Key */}
          <button
            onClick={() => setIsSecondMode(!isSecondMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isSecondMode
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            2nd
          </button>

          {/* Hyperbolic Toggle */}
          <button
            onClick={() => setIsHypMode(!isHypMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isHypMode
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            hyp
          </button>

          {/* Memory Active Indicator */}
          {memory !== 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
              M = {memory}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistoryModal(!showHistoryModal)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            History ({history.length})
          </button>
        </div>
      </div>

      {/* Calculator Display Panel */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 space-y-4 relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Memory Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <button onClick={handleMemoryClear} className="hover:text-white transition-colors" title="Memory Clear">
              MC
            </button>
            <button onClick={handleMemoryRecall} className="hover:text-white transition-colors" title="Memory Recall">
              MR
            </button>
            <button onClick={handleMemoryAdd} className="hover:text-white transition-colors" title="Memory Add">
              M+
            </button>
            <button onClick={handleMemorySubtract} className="hover:text-white transition-colors" title="Memory Subtract">
              M-
            </button>
            <button onClick={handleMemoryStore} className="hover:text-white transition-colors" title="Memory Store">
              MS
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-300">
              {isRadMode ? 'Radian' : 'Degree'}
            </span>
          </div>
        </div>

        {/* Interactive Expression & Live Result View */}
        <div ref={displayRef} className="space-y-1 text-right">
          {/* Formula Line */}
          <div className="min-h-[28px] text-sm sm:text-base font-mono text-slate-400 overflow-x-auto whitespace-nowrap tracking-wide select-all">
            {expression || '0'}
          </div>

          {/* Primary Result Line */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <button
              onClick={handleCopyResult}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              title="Copy result"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <span className="text-3xl sm:text-4xl lg:text-5xl font-mono font-extrabold text-white tracking-tight break-all select-all">
              {result}
            </span>
          </div>
        </div>
      </div>

      {/* Main Scientific Keypad Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Keypad */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          {/* Scientific Function Rows */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-2.5">
            {/* Trigonometric & Functions */}
            <button
              onClick={() => handleInsert(isSecondMode ? (isHypMode ? 'asinh' : 'asin') : (isHypMode ? 'sinh' : 'sin'), true)}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              {isSecondMode ? (isHypMode ? 'sinh⁻¹' : 'sin⁻¹') : (isHypMode ? 'sinh' : 'sin')}
            </button>

            <button
              onClick={() => handleInsert(isSecondMode ? (isHypMode ? 'acosh' : 'acos') : (isHypMode ? 'cosh' : 'cos'), true)}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              {isSecondMode ? (isHypMode ? 'cosh⁻¹' : 'cos⁻¹') : (isHypMode ? 'cosh' : 'cos')}
            </button>

            <button
              onClick={() => handleInsert(isSecondMode ? (isHypMode ? 'atanh' : 'atan') : (isHypMode ? 'tanh' : 'tan'), true)}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              {isSecondMode ? (isHypMode ? 'tanh⁻¹' : 'tan⁻¹') : (isHypMode ? 'tanh' : 'tan')}
            </button>

            <button
              onClick={() => handleInsert(isSecondMode ? 'e^' : 'ln', isSecondMode ? false : true)}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              {isSecondMode ? 'eˣ' : 'ln'}
            </button>

            <button
              onClick={() => handleInsert(isSecondMode ? '10^' : 'log', isSecondMode ? false : true)}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              {isSecondMode ? '10ˣ' : 'log₁₀'}
            </button>

            <button
              onClick={() => handleInsert('log2', true)}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              log₂
            </button>

            {/* Powers & Roots */}
            <button
              onClick={() => handleInsert(isSecondMode ? '^3' : '^2')}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              {isSecondMode ? 'x³' : 'x²'}
            </button>

            <button
              onClick={() => handleInsert('^')}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              xʸ
            </button>

            <button
              onClick={() => handleInsert(isSecondMode ? 'cbrt' : 'sqrt', true)}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              {isSecondMode ? '∛x' : '√x'}
            </button>

            <button
              onClick={() => handleInsert('1/')}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              1/x
            </button>

            <button
              onClick={() => handleInsert('!')}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              n!
            </button>

            <button
              onClick={() => handleInsert('abs', true)}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              |x|
            </button>

            {/* Constants & Parentheses */}
            <button
              onClick={() => handleInsert('π')}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              π
            </button>

            <button
              onClick={() => handleInsert('e')}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              e
            </button>

            <button
              onClick={() => handleInsert('(')}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              (
            </button>

            <button
              onClick={() => handleInsert(')')}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              )
            </button>

            <button
              onClick={() => handleInsert('%')}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              %
            </button>

            <button
              onClick={() => handleInsert('rand()')}
              className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              rand
            </button>
          </div>

          <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

          {/* Standard Numeric & Arithmetic Keypad */}
          <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
            {/* Row 1 */}
            <button
              onClick={handleClear}
              className="h-13 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-extrabold text-sm sm:text-base transition-all"
            >
              AC
            </button>
            <button
              onClick={handleBackspace}
              className="h-13 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-sm sm:text-base transition-all flex items-center justify-center"
              title="Backspace"
            >
              <Delete className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleInsert('±')}
              className="h-13 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-sm sm:text-base transition-all"
            >
              ±
            </button>
            <button
              onClick={() => handleInsert('÷')}
              className="h-13 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-lg sm:text-xl transition-all"
            >
              ÷
            </button>

            {/* Row 2: 7, 8, 9, × */}
            <button
              onClick={() => handleInsert('7')}
              className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white font-bold text-lg sm:text-xl transition-all shadow-2xs"
            >
              7
            </button>
            <button
              onClick={() => handleInsert('8')}
              className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white font-bold text-lg sm:text-xl transition-all shadow-2xs"
            >
              8
            </button>
            <button
              onClick={() => handleInsert('9')}
              className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white font-bold text-lg sm:text-xl transition-all shadow-2xs"
            >
              9
            </button>
            <button
              onClick={() => handleInsert('×')}
              className="h-13 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-lg sm:text-xl transition-all"
            >
              ×
            </button>

            {/* Row 3: 4, 5, 6, - */}
            <button
              onClick={() => handleInsert('4')}
              className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white font-bold text-lg sm:text-xl transition-all shadow-2xs"
            >
              4
            </button>
            <button
              onClick={() => handleInsert('5')}
              className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white font-bold text-lg sm:text-xl transition-all shadow-2xs"
            >
              5
            </button>
            <button
              onClick={() => handleInsert('6')}
              className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white font-bold text-lg sm:text-xl transition-all shadow-2xs"
            >
              6
            </button>
            <button
              onClick={() => handleInsert('-')}
              className="h-13 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-lg sm:text-xl transition-all"
            >
              −
            </button>

            {/* Row 4: 1, 2, 3, + */}
            <button
              onClick={() => handleInsert('1')}
              className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white font-bold text-lg sm:text-xl transition-all shadow-2xs"
            >
              1
            </button>
            <button
              onClick={() => handleInsert('2')}
              className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white font-bold text-lg sm:text-xl transition-all shadow-2xs"
            >
              2
            </button>
            <button
              onClick={() => handleInsert('3')}
              className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white font-bold text-lg sm:text-xl transition-all shadow-2xs"
            >
              3
            </button>
            <button
              onClick={() => handleInsert('+')}
              className="h-13 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-lg sm:text-xl transition-all"
            >
              +
            </button>

            {/* Row 5: 0, ., Ans, = */}
            <button
              onClick={() => handleInsert('0')}
              className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white font-bold text-lg sm:text-xl transition-all shadow-2xs"
            >
              0
            </button>
            <button
              onClick={() => handleInsert('.')}
              className="h-13 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white font-bold text-lg sm:text-xl transition-all shadow-2xs"
            >
              .
            </button>
            <button
              onClick={() => {
                if (result && result !== 'Error') {
                  handleInsert(result);
                }
              }}
              className="h-13 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all"
            >
              Ans
            </button>
            <button
              onClick={handleCalculate}
              className="h-13 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xl transition-all shadow-md flex items-center justify-center"
            >
              <Equal className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Right Col: Calculation History Panel */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Recent History
              </h4>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    setHistory([]);
                    showToast('History cleared', 'info');
                  }}
                  className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <Calculator className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                <p>No calculation history yet.</p>
                <p className="text-[11px] text-slate-400">Past expressions and answers will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {history.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setExpression(item.expression);
                      setResult(item.result);
                      setLastCalculated(true);
                      showToast('Restored calculation to display', 'info');
                    }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group text-right"
                  >
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                      {item.expression} =
                    </div>
                    <div className="text-base font-mono font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {item.result}
                    </div>
                    <div className="text-[10px] text-slate-400 text-left">
                      {item.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Keyboard shortcuts guide */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-500" /> Keyboard Shortcuts
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <span><kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-700 border text-[10px]">Enter</kbd> : Calculate</span>
              <span><kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-700 border text-[10px]">Esc</kbd> : Clear (AC)</span>
              <span><kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-700 border text-[10px]">&bull;</kbd> : Decimal</span>
              <span><kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-700 border text-[10px]">( )</kbd> : Parentheses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScientificCalculator;
