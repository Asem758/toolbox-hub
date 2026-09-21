import React, { useState, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Copy, FileCode2, Layers } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard } from '../../lib/utils';

export const JsonValidator: React.FC = () => {
  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(
      {
        status: 'valid',
        code: 200,
        data: {
          items: ['item1', 'item2', 'item3'],
          active: true,
          rating: 4.95,
        },
      },
      null,
      2
    )
  );

  const { showToast } = useToast();

  const validationResult = useMemo(() => {
    if (!jsonText.trim()) {
      return { isValid: null, error: null, stats: null };
    }

    try {
      const parsed = JSON.parse(jsonText);

      // Deep inspection
      let keyCount = 0;
      let arrayCount = 0;
      let primitiveCount = 0;
      let maxDepth = 1;

      const traverse = (node: any, depth: number) => {
        if (depth > maxDepth) maxDepth = depth;

        if (Array.isArray(node)) {
          arrayCount++;
          node.forEach((item) => traverse(item, depth + 1));
        } else if (node !== null && typeof node === 'object') {
          const keys = Object.keys(node);
          keyCount += keys.length;
          keys.forEach((k) => traverse(node[k], depth + 1));
        } else {
          primitiveCount++;
        }
      };

      traverse(parsed, 1);

      return {
        isValid: true,
        error: null,
        stats: {
          rootType: Array.isArray(parsed) ? 'Array' : typeof parsed === 'object' && parsed !== null ? 'Object' : typeof parsed,
          keyCount,
          arrayCount,
          primitiveCount,
          maxDepth,
          byteSize: new Blob([jsonText]).size,
        },
      };
    } catch (err: any) {
      // Find line and column
      const match = err.message.match(/position\s+(\d+)/i) || err.message.match(/line\s+(\d+)/i);
      return {
        isValid: false,
        error: err.message,
        stats: null,
      };
    }
  }, [jsonText]);

  return (
    <div className="space-y-5">
      {/* Validation Status Header */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
          validationResult.isValid === true
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
            : validationResult.isValid === false
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
        }`}
      >
        <div className="flex items-center gap-3">
          {validationResult.isValid === true && <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
          {validationResult.isValid === false && <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />}
          {validationResult.isValid === null && <FileCode2 className="w-6 h-6 text-slate-400" />}
          <div>
            <h3 className="text-sm font-bold">
              {validationResult.isValid === true && 'Valid JSON Structure (RFC 8259 Compliant)'}
              {validationResult.isValid === false && 'Invalid JSON — Syntax Error Detected'}
              {validationResult.isValid === null && 'Awaiting JSON Input'}
            </h3>
            {validationResult.error && (
              <p className="text-xs font-mono mt-0.5 opacity-90">{validationResult.error}</p>
            )}
          </div>
        </div>

        <button
          onClick={async () => {
            const ok = await copyToClipboard(jsonText);
            if (ok) showToast('JSON copied to clipboard', 'success');
          }}
          disabled={!jsonText}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/80 dark:bg-slate-800/80 hover:bg-white border border-slate-200 dark:border-slate-700 shadow-xs"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy
        </button>
      </div>

      {/* Editor Box */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20">
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="Paste JSON snippet here to validate structure, types, and nesting..."
          rows={12}
          spellCheck={false}
          className="w-full p-4 md:p-5 font-mono text-sm leading-relaxed bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none resize-y"
        />
      </div>

      {/* Deep Inspection Stats */}
      {validationResult.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-xs text-slate-500 font-medium">Root Type</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 capitalize">
              {validationResult.stats.rootType}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-xs text-slate-500 font-medium">Object Keys</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {validationResult.stats.keyCount}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-xs text-slate-500 font-medium">Arrays</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {validationResult.stats.arrayCount}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-xs text-slate-500 font-medium">Max Depth</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {validationResult.stats.maxDepth} levels
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-xs text-slate-500 font-medium">Payload Size</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {validationResult.stats.byteSize} Bytes
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default JsonValidator;
