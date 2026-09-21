import React, { useState, useMemo } from 'react';
import { Copy, Trash2, Download, Check, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard, downloadText } from '../../lib/utils';

export const CharacterCounter: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [charLimit, setCharLimit] = useState<number>(280); // Twitter default
  const { showToast } = useToast();

  const stats = useMemo(() => {
    const totalChars = text.length;
    const noSpaces = text.replace(/\s/g, '').length;
    const spaces = (text.match(/\s/g) || []).length;
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const digits = (text.match(/[0-9]/g) || []).length;
    const specials = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
    const lines = text ? text.split('\n').length : 0;
    const bytes = new Blob([text]).size;
    const remaining = charLimit - totalChars;
    const progress = Math.min(100, (totalChars / (charLimit || 1)) * 100);

    return {
      totalChars,
      noSpaces,
      spaces,
      letters,
      digits,
      specials,
      lines,
      bytes,
      remaining,
      progress,
    };
  }, [text, charLimit]);

  const socialPresets = [
    { label: 'X / Twitter Post', limit: 280 },
    { label: 'SEO Meta Title', limit: 60 },
    { label: 'SEO Meta Description', limit: 160 },
    { label: 'LinkedIn Post', limit: 3000 },
    { label: 'Instagram Caption', limit: 2200 },
  ];

  return (
    <div className="space-y-6">
      {/* Social presets limit selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Set Character Limit Preset:</span>
        <div className="flex flex-wrap items-center gap-2">
          {socialPresets.map((preset, i) => (
            <button
              key={i}
              onClick={() => {
                setCharLimit(preset.limit);
                showToast(`Limit set to ${preset.limit} chars (${preset.label})`, 'info');
              }}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                charLimit === preset.limit
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              {preset.label} ({preset.limit})
            </button>
          ))}
        </div>
      </div>

      {/* Main Text Area */}
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text to track characters, spaces, bytes, and check limits..."
          rows={8}
          className="w-full p-4 md:p-5 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none resize-y text-base leading-relaxed"
        />

        {/* Progress Bar for Character Limit */}
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full transition-all duration-300 ${
              stats.remaining < 0
                ? 'bg-rose-500'
                : stats.progress > 85
                ? 'bg-amber-500'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min(100, stats.progress)}%` }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={stats.remaining < 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-300'}>
              {stats.totalChars} / {charLimit} characters
            </span>
            <span className="text-slate-400">({stats.remaining >= 0 ? `${stats.remaining} left` : `${Math.abs(stats.remaining)} over limit`})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setText(''); showToast('Cleared text', 'info'); }}
              disabled={!text}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
            <button
              onClick={async () => {
                const ok = await copyToClipboard(text);
                if (ok) showToast('Copied to clipboard!', 'success');
              }}
              disabled={!text}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:pointer-events-none shadow-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Chars</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.totalChars}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">No Spaces</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.noSpaces}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Spaces</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.spaces}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Letters</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.letters}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Digits (0-9)</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.digits}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Special Chars</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.specials}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">UTF-8 Bytes</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.bytes} B</div>
        </div>
      </div>
    </div>
  );
};
export default CharacterCounter;
