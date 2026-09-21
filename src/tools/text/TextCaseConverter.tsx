import React, { useState } from 'react';
import { Copy, Trash2, ArrowRightLeft, Check, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard } from '../../lib/utils';

export const TextCaseConverter: React.FC = () => {
  const [inputText, setInputText] = useState<string>('Free online developer and productivity tools with zero data collection.');
  const { showToast } = useToast();

  const transformations = [
    {
      id: 'upper',
      label: 'UPPERCASE',
      desc: 'ALL CAPITAL LETTERS',
      fn: (s: string) => s.toUpperCase(),
    },
    {
      id: 'lower',
      label: 'lowercase',
      desc: 'all small letters',
      fn: (s: string) => s.toLowerCase(),
    },
    {
      id: 'title',
      label: 'Title Case',
      desc: 'Capitalize Every Word',
      fn: (s: string) =>
        s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()),
    },
    {
      id: 'sentence',
      label: 'Sentence case',
      desc: 'First letter of each sentence capitalized',
      fn: (s: string) => {
        const lower = s.toLowerCase();
        return lower.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
      },
    },
    {
      id: 'camel',
      label: 'camelCase',
      desc: 'javascriptVariableNames',
      fn: (s: string) => {
        return s
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (w, index) =>
            index === 0 ? w.toLowerCase() : w.toUpperCase()
          )
          .replace(/\s+/g, '')
          .replace(/[^a-zA-Z0-9]/g, '');
      },
    },
    {
      id: 'pascal',
      label: 'PascalCase',
      desc: 'ReactComponentNames',
      fn: (s: string) => {
        return s
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (w) => w.toUpperCase())
          .replace(/\s+/g, '')
          .replace(/[^a-zA-Z0-9]/g, '');
      },
    },
    {
      id: 'snake',
      label: 'snake_case',
      desc: 'python_and_database_columns',
      fn: (s: string) => {
        return s
          .trim()
          .toLowerCase()
          .replace(/[\s\W-]+/g, '_')
          .replace(/^_+|_+$/g, '');
      },
    },
    {
      id: 'kebab',
      label: 'kebab-case / slug',
      desc: 'url-friendly-slug-format',
      fn: (s: string) => {
        return s
          .trim()
          .toLowerCase()
          .replace(/[\s\W_]+/g, '-')
          .replace(/^-+|-+$/g, '');
      },
    },
    {
      id: 'constant',
      label: 'CONSTANT_CASE',
      desc: 'ENVIRONMENT_VARIABLE_NAMES',
      fn: (s: string) => {
        return s
          .trim()
          .toUpperCase()
          .replace(/[\s\W-]+/g, '_')
          .replace(/^_+|_+$/g, '');
      },
    },
    {
      id: 'alternating',
      label: 'aLtErNaTiNg cAsE',
      desc: 'sPoNgEbOb mOcKiNg tExT',
      fn: (s: string) => {
        return s
          .split('')
          .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
          .join('');
      },
    },
    {
      id: 'reverse',
      label: 'esreveR txeT',
      desc: 'Reverse all characters',
      fn: (s: string) => s.split('').reverse().join(''),
    },
  ];

  const applyTransformation = (fn: (s: string) => string, name: string) => {
    if (!inputText) {
      showToast('Please enter text first', 'info');
      return;
    }
    const result = fn(inputText);
    setInputText(result);
    showToast(`Converted to ${name}`, 'success');
  };

  const copyTransformed = async (fn: (s: string) => string, name: string) => {
    if (!inputText) {
      showToast('Enter text first', 'info');
      return;
    }
    const res = fn(inputText);
    const ok = await copyToClipboard(res);
    if (ok) showToast(`Copied ${name} to clipboard!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Input Area */}
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to convert to any case format..."
          rows={5}
          className="w-full p-4 md:p-5 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none resize-y text-base leading-relaxed"
        />

        <div className="flex items-center justify-between p-3 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500 font-medium">{inputText.length} characters</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setInputText(''); showToast('Cleared text', 'info'); }}
              disabled={!inputText}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
            <button
              onClick={async () => {
                const ok = await copyToClipboard(inputText);
                if (ok) showToast('Current text copied!', 'success');
              }}
              disabled={!inputText}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs disabled:opacity-40"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Case Options Grid */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Click to Convert in Place or Copy Directly
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {transformations.map((t) => {
            const preview = inputText ? t.fn(inputText).slice(0, 45) + (t.fn(inputText).length > 45 ? '...' : '') : t.desc;
            return (
              <div
                key={t.id}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-indigo-600 dark:text-indigo-400">{t.label}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono">{t.id}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-mono bg-slate-50 dark:bg-slate-800/60 p-2 rounded-md my-1.5 border border-slate-100 dark:border-slate-800 break-all">
                    {preview}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <button
                    onClick={() => applyTransformation(t.fn, t.label)}
                    className="flex-1 py-1 px-2 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Apply to Input
                  </button>
                  <button
                    onClick={() => copyTransformed(t.fn, t.label)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={`Copy as ${t.label}`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default TextCaseConverter;
