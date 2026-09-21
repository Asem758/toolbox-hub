import React, { useState } from 'react';
import { Copy, Trash2, Download, Check, AlertCircle, ArrowDownUp, Minimize2, Maximize2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard, downloadText } from '../../lib/utils';

export const JsonFormatter: React.FC = () => {
  const [inputJson, setInputJson] = useState<string>(
    JSON.stringify(
      {
        name: 'ToolBox Hub',
        version: '1.0.0',
        features: ['100% Client-Side', 'SEO Optimized', 'Privacy First'],
        analytics: { enabled: true, mode: 'anonymous' },
        settings: { theme: 'system', autoSave: true },
      },
      null,
      2
    )
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [indentSize, setIndentSize] = useState<number>(2);
  const { showToast } = useToast();

  const handleFormat = (spaces: number = indentSize) => {
    setErrorMessage(null);
    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, spaces);
      setInputJson(formatted);
      showToast(`Formatted with ${spaces} spaces indentation`, 'success');
    } catch (e: any) {
      setErrorMessage(e.message);
      showToast('Invalid JSON syntax', 'error');
    }
  };

  const handleMinify = () => {
    setErrorMessage(null);
    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setInputJson(minified);
      showToast('JSON minified (whitespace removed)', 'success');
    } catch (e: any) {
      setErrorMessage(e.message);
      showToast('Invalid JSON syntax', 'error');
    }
  };

  const handleSortKeys = () => {
    setErrorMessage(null);
    try {
      const sortObject = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(sortObject);
        } else if (obj !== null && typeof obj === 'object') {
          return Object.keys(obj)
            .sort()
            .reduce((acc: any, key) => {
              acc[key] = sortObject(obj[key]);
              return acc;
            }, {});
        }
        return obj;
      };

      const parsed = JSON.parse(inputJson);
      const sorted = sortObject(parsed);
      setInputJson(JSON.stringify(sorted, null, indentSize));
      showToast('Object keys sorted alphabetically', 'success');
    } catch (e: any) {
      setErrorMessage(e.message);
      showToast('Invalid JSON syntax', 'error');
    }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(inputJson);
    if (ok) showToast('JSON copied to clipboard!', 'success');
  };

  const handleDownload = () => {
    downloadText(inputJson, `formatted-${Date.now()}.json`, 'application/json');
    showToast('Downloaded JSON file!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleFormat(2)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            Prettify (2 Spaces)
          </button>
          <button
            onClick={() => handleFormat(4)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Prettify (4 Spaces)
          </button>
          <button
            onClick={handleMinify}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Minify (Compact)
          </button>
          <button
            onClick={handleSortKeys}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
            Sort Keys
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setInputJson(''); setErrorMessage(null); }}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            Download .json
          </button>
        </div>
      </div>

      {/* Editor & Validation State */}
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20">
        <textarea
          value={inputJson}
          onChange={(e) => {
            setInputJson(e.target.value);
            setErrorMessage(null);
          }}
          placeholder="Paste or write raw JSON here..."
          rows={16}
          spellCheck={false}
          className="w-full p-4 md:p-5 font-mono text-sm leading-relaxed bg-transparent text-slate-900 dark:text-emerald-400 placeholder-slate-400 outline-none resize-y"
        />

        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border-t border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-mono">{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default JsonFormatter;
