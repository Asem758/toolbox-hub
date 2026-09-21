import React, { useState, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Link,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  Sliders,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const COMMON_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it',
  'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these',
  'they', 'this', 'to', 'was', 'will', 'with', 'what', 'when', 'where', 'who', 'why', 'how',
]);

export const UrlSlugGenerator: React.FC = () => {
  const { showToast } = useToast();

  const [input, setInput] = useState(
    '10 Proven Strategies to Supercharge Your SaaS Growth in 2026!'
  );
  const [separator, setSeparator] = useState<'-' | '_' | '.' | '/'>('-');
  const [lowercase, setLowercase] = useState(true);
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [removeNumbers, setRemoveNumbers] = useState(false);
  const [removeSpecialChars, setRemoveSpecialChars] = useState(true);
  const [maxLength, setMaxLength] = useState<number>(60);
  const [urlPrefix, setUrlPrefix] = useState('https://example.com/blog/');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkInput, setBulkInput] = useState(
    `10 Best Coffee Makers in 2026\nHow to Learn React in 30 Days (Complete Guide)\nTop 5 Remote Work Habits & Tools\nWhat is Technical SEO & Why It Matters?`
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedSingle, setCopiedSingle] = useState(false);

  // Transliterate accents and characters like é -> e, ü -> u, ñ -> n
  const transliterate = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/æ/g, 'ae')
      .replace(/œ/g, 'oe')
      .replace(/ß/g, 'ss')
      .replace(/ø/g, 'o')
      .replace(/å/g, 'a');
  };

  const createSlug = (text: string): string => {
    if (!text.trim()) return '';

    let clean = transliterate(text);

    if (lowercase) {
      clean = clean.toLowerCase();
    }

    if (removeNumbers) {
      clean = clean.replace(/[0-9]/g, ' ');
    }

    if (removeSpecialChars) {
      // Replace non-alphanumeric (except chosen separator if already present) with spaces
      clean = clean.replace(/[^a-zA-Z0-9\s-_]/g, ' ');
    }

    // Split words
    let words = clean.split(/\s+/).filter(Boolean);

    if (removeStopWords) {
      const filtered = words.filter((w) => !COMMON_STOP_WORDS.has(w.toLowerCase()));
      if (filtered.length > 0) {
        words = filtered;
      }
    }

    let slug = words.join(separator);

    // Apply max length without truncating mid-word if possible
    if (maxLength > 0 && slug.length > maxLength) {
      const truncated = slug.substring(0, maxLength);
      const lastSep = truncated.lastIndexOf(separator);
      slug = lastSep > 15 ? truncated.substring(0, lastSep) : truncated;
    }

    // Clean leading or trailing separators
    const escSep = separator === '.' || separator === '/' ? `\\${separator}` : separator;
    slug = slug.replace(new RegExp(`^${escSep}+|${escSep}+$`, 'g'), '');

    return slug;
  };

  // Single generated slug
  const singleSlug = useMemo(() => createSlug(input), [
    input,
    separator,
    lowercase,
    removeStopWords,
    removeNumbers,
    removeSpecialChars,
    maxLength,
  ]);

  // Bulk generated slugs
  const bulkSlugs = useMemo(() => {
    return bulkInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((title) => ({
        original: title,
        slug: createSlug(title),
      }));
  }, [
    bulkInput,
    separator,
    lowercase,
    removeStopWords,
    removeNumbers,
    removeSpecialChars,
    maxLength,
  ]);

  const handleCopySingle = async (fullUrl = false) => {
    const textToCopy = fullUrl ? `${urlPrefix}${singleSlug}` : singleSlug;
    await navigator.clipboard.writeText(textToCopy);
    setCopiedSingle(true);
    showToast(fullUrl ? 'Full URL copied' : 'Slug copied to clipboard', 'success');
    setTimeout(() => setCopiedSingle(false), 2000);
  };

  const handleCopyBulkSlug = async (slug: string, index: number) => {
    await navigator.clipboard.writeText(slug);
    setCopiedIndex(index);
    showToast('Slug copied', 'success');
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAllBulk = async () => {
    const all = bulkSlugs.map((b) => b.slug).join('\n');
    await navigator.clipboard.writeText(all);
    showToast(`Copied ${bulkSlugs.length} slugs to clipboard`, 'success');
  };

  const handleDownloadCsv = () => {
    const headers = 'Original Title,Generated Slug,Full URL\n';
    const rows = bulkSlugs
      .map(
        (b) =>
          `"${b.original.replace(/"/g, '""')}","${b.slug}","${urlPrefix}${b.slug}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'url-slugs.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded url-slugs.csv', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setIsBulkMode(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !isBulkMode
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Single Slug
          </button>
          <button
            onClick={() => setIsBulkMode(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isBulkMode
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Bulk Mode ({bulkSlugs.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isBulkMode ? (
            <>
              <button
                onClick={handleCopyAllBulk}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy All Slugs
              </button>
              <button
                onClick={handleDownloadCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </>
          ) : (
            <button
              onClick={() => handleCopySingle(false)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
            >
              {copiedSingle ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSingle ? 'Copied' : 'Copy Slug'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input & Result */}
        <div className="lg:col-span-7 space-y-6">
          {!isBulkMode ? (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Enter Title, Headline or Sentence
                </label>
                <textarea
                  rows={3}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. 10 Best Running Shoes for Marathon Training (2026 Update)"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Live Result Box */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Generated SEO URL Slug
                </label>

                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm break-all flex items-center justify-between gap-3 shadow-inner">
                  <span className="text-emerald-400">{singleSlug || '(enter text above)'}</span>
                  <button
                    onClick={() => handleCopySingle(false)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                    title="Copy Slug"
                  >
                    {copiedSingle ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Full URL Live Preview */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-slate-400">Full URL: </span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {urlPrefix}
                      <strong className="text-slate-900 dark:text-white">{singleSlug}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopySingle(true)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Bulk Mode Editor */
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Paste Multiple Titles (One per line)
                </label>
                <textarea
                  rows={6}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Bulk Results Table */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Bulk Slugs Preview ({bulkSlugs.length})
                </label>
                <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                  {bulkSlugs.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 text-xs flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                          {item.original}
                        </div>
                        <div className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                          {item.slug}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopyBulkSlug(item.slug, idx)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 shrink-0"
                        title="Copy slug"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Configuration & Rules Options */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Slug Formatting Rules
            </h3>

            {/* Separator Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Word Separator Character
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { char: '-', label: 'Hyphen (-)' },
                  { char: '_', label: 'Underscore (_)' },
                  { char: '.', label: 'Dot (.)' },
                  { char: '/', label: 'Slash (/)' },
                ].map((s) => (
                  <button
                    key={s.char}
                    type="button"
                    onClick={() => setSeparator(s.char as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                      separator === s.char
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-mono text-sm">{s.char}</div>
                    <div className="text-[10px] text-slate-400">{s.label.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* URL Prefix */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Domain & Subdirectory Prefix
              </label>
              <input
                type="text"
                value={urlPrefix}
                onChange={(e) => setUrlPrefix(e.target.value)}
                placeholder="https://example.com/blog/"
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Max Length Limit */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Maximum Slug Length
                </label>
                <span className="font-mono text-slate-400">{maxLength} characters</span>
              </div>
              <input
                type="range"
                min={20}
                max={120}
                step={5}
                value={maxLength}
                onChange={(e) => setMaxLength(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <span className="font-medium text-slate-700 dark:text-slate-300">Convert to Lowercase</span>
                <input
                  type="checkbox"
                  checked={lowercase}
                  onChange={(e) => setLowercase(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Filter Stop Words</span>
                  <p className="text-[10px] text-slate-400">Removes "the", "and", "in", "for", "with"</p>
                </div>
                <input
                  type="checkbox"
                  checked={removeStopWords}
                  onChange={(e) => setRemoveStopWords(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <span className="font-medium text-slate-700 dark:text-slate-300">Strip Special Characters & Accents</span>
                <input
                  type="checkbox"
                  checked={removeSpecialChars}
                  onChange={(e) => setRemoveSpecialChars(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <span className="font-medium text-slate-700 dark:text-slate-300">Remove Numeric Digits (0-9)</span>
                <input
                  type="checkbox"
                  checked={removeNumbers}
                  onChange={(e) => setRemoveNumbers(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default UrlSlugGenerator;
