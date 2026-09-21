import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Shuffle,
  Copy,
  Check,
  RefreshCw,
  Download,
  Sliders,
  Sparkles,
  ShieldCheck,
  FileCode,
  Key,
  Layers,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { copyToClipboard, downloadBlob } from '../../lib/utils';

const CHARSET_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CHARSET_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const CHARSET_NUMBERS = '0123456789';
const CHARSET_SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS_CHARS = new Set(['0', 'O', 'o', '1', 'l', 'I', '|', '`', '\'', '"']);

// Diceware memorable wordlist for passphrases
const MEMORABLE_WORDS = [
  'anchor', 'beacon', 'breeze', 'bridge', 'castle', 'canyon', 'cherry', 'cipher',
  'clover', 'comet', 'copper', 'cosmic', 'crater', 'crystal', 'delta', 'dragon',
  'drift', 'echo', 'ember', 'falcon', 'feather', 'forest', 'fossil', 'galaxy',
  'glacier', 'granite', 'harbor', 'horizon', 'island', 'jasper', 'jungle', 'knight',
  'lagoon', 'lantern', 'legend', 'lotus', 'marble', 'meadow', 'meteor', 'nebula',
  'oasis', 'orchid', 'pebble', 'phoenix', 'planet', 'prism', 'quartz', 'quiver',
  'radar', 'ranger', 'relic', 'ripple', 'river', 'rocket', 'saddle', 'safari',
  'sailor', 'shadow', 'shield', 'signal', 'silver', 'solar', 'spark', 'sphinx',
  'spiral', 'summit', 'sunset', 'timber', 'topaz', 'totem', 'trail', 'tundra',
  'valley', 'vapor', 'velvet', 'vessel', 'vortex', 'walnut', 'whisper', 'zenith',
];

export const RandomStringGenerator: React.FC = () => {
  const { showToast } = useToast();

  // Configuration state
  const [mode, setMode] = useState<'custom' | 'apikey' | 'hex' | 'base64' | 'passphrase'>('custom');
  const [length, setLength] = useState<number>(32);
  const [count, setCount] = useState<number>(5);
  
  // Character sets
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useLower, setUseLower] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);
  const [customChars, setCustomChars] = useState<string>('');
  
  // Formatting
  const [prefix, setPrefix] = useState<string>('');
  const [suffix, setSuffix] = useState<string>('');
  const [chunkSize, setChunkSize] = useState<number>(0); // 0 = no chunking
  const [chunkSeparator, setChunkSeparator] = useState<string>('-');
  const [passphraseWordCount, setPassphraseWordCount] = useState<number>(4);
  const [passphraseDelimiter, setPassphraseDelimiter] = useState<string>('-');

  // Generated results
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Generate cryptographically secure random numbers
  const getCryptoRandomInt = (max: number): number => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  };

  const generateStrings = () => {
    const generatedList: string[] = [];

    for (let i = 0; i < count; i++) {
      if (mode === 'passphrase') {
        const words: string[] = [];
        for (let w = 0; w < passphraseWordCount; w++) {
          const randWord = MEMORABLE_WORDS[getCryptoRandomInt(MEMORABLE_WORDS.length)];
          words.push(randWord);
        }
        let str = words.join(passphraseDelimiter);
        if (prefix) str = prefix + str;
        if (suffix) str = str + suffix;
        generatedList.push(str);
        continue;
      }

      if (mode === 'hex') {
        let pool = '0123456789abcdef';
        let str = '';
        for (let c = 0; c < length; c++) {
          str += pool[getCryptoRandomInt(pool.length)];
        }
        if (chunkSize > 0) {
          str = str.match(new RegExp(`.{1,${chunkSize}}`, 'g'))?.join(chunkSeparator) || str;
        }
        if (prefix) str = prefix + str;
        if (suffix) str = str + suffix;
        generatedList.push(str);
        continue;
      }

      if (mode === 'base64') {
        const byteCount = Math.ceil(length * 0.75);
        const bytes = new Uint8Array(byteCount);
        window.crypto.getRandomValues(bytes);
        let binary = '';
        for (let b = 0; b < bytes.length; b++) {
          binary += String.fromCharCode(bytes[b]);
        }
        let str = btoa(binary).substring(0, length);
        if (prefix) str = prefix + str;
        if (suffix) str = str + suffix;
        generatedList.push(str);
        continue;
      }

      if (mode === 'apikey') {
        const keyPrefix = prefix || 'sk_live_';
        let pool = CHARSET_LOWER + CHARSET_UPPER + CHARSET_NUMBERS;
        let str = '';
        for (let c = 0; c < (length || 32); c++) {
          str += pool[getCryptoRandomInt(pool.length)];
        }
        generatedList.push(keyPrefix + str + suffix);
        continue;
      }

      // Custom character pool
      let pool = '';
      if (useUpper) pool += CHARSET_UPPER;
      if (useLower) pool += CHARSET_LOWER;
      if (useNumbers) pool += CHARSET_NUMBERS;
      if (useSymbols) pool += CHARSET_SYMBOLS;
      if (customChars) pool += customChars;

      if (excludeAmbiguous) {
        pool = pool.split('').filter((c) => !AMBIGUOUS_CHARS.has(c)).join('');
      }

      if (!pool) {
        pool = CHARSET_LOWER + CHARSET_NUMBERS;
      }

      let str = '';
      for (let c = 0; c < length; c++) {
        str += pool[getCryptoRandomInt(pool.length)];
      }

      if (chunkSize > 0) {
        str = str.match(new RegExp(`.{1,${chunkSize}}`, 'g'))?.join(chunkSeparator) || str;
      }

      if (prefix) str = prefix + str;
      if (suffix) str = str + suffix;
      generatedList.push(str);
    }

    setResults(generatedList);
  };

  // Generate on initial load
  useEffect(() => {
    generateStrings();
  }, [mode]);

  const handleCopySingle = async (val: string, index: number) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedIndex(index);
      showToast('Copied string to clipboard!', 'success');
      setTimeout(() => setCopiedIndex(null), 1500);
    }
  };

  const handleCopyAll = async (delimiter: string = '\n') => {
    if (results.length === 0) return;
    const allText = results.join(delimiter);
    const ok = await copyToClipboard(allText);
    if (ok) {
      setCopiedAll(true);
      showToast(`Copied all ${results.length} strings!`, 'success');
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleDownloadTxt = () => {
    if (results.length === 0) return;
    const blob = new Blob([results.join('\n')], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, 'random-strings.txt');
    showToast('Downloaded TXT file!', 'success');
  };

  const handleDownloadJson = () => {
    if (results.length === 0) return;
    const jsonStr = JSON.stringify({ count: results.length, strings: results }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    downloadBlob(blob, 'random-strings.json');
    showToast('Downloaded JSON file!', 'success');
  };

  const handleDownloadCsv = () => {
    if (results.length === 0) return;
    const csvContent = 'ID,Random String\n' + results.map((s, idx) => `${idx + 1},"${s.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, 'random-strings.csv');
    showToast('Downloaded CSV file!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Preset Mode Tabs */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          {[
            { id: 'custom', label: 'Custom Character Pool', icon: Shuffle },
            { id: 'apikey', label: 'API Keys & Secrets', icon: Key },
            { id: 'hex', label: 'Hexadecimal (0-9, a-f)', icon: FileCode },
            { id: 'base64', label: 'Base64 Encoded', icon: Layers },
            { id: 'passphrase', label: 'Memorable Passphrase', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={generateStrings}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate Strings
        </button>
      </div>

      {/* Control Configuration Matrix */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Generation Settings
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Length slider */}
          {mode !== 'passphrase' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>String Length:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{length} characters</span>
              </div>
              <input
                type="range"
                min="4"
                max="128"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>4 chars</span>
                <span>32</span>
                <span>64</span>
                <span>128 chars</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Word Count:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{passphraseWordCount} words</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                value={passphraseWordCount}
                onChange={(e) => setPassphraseWordCount(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>2 words</span>
                <span>4</span>
                <span>6</span>
                <span>8 words</span>
              </div>
            </div>
          )}

          {/* Quantity Batch Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Quantity (Bulk Size):</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">{count} strings</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1</span>
              <span>10</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>

          {/* Prefix / Suffix */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Custom Prefix:
            </label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder={mode === 'apikey' ? 'sk_live_' : 'e.g. USER_'}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Custom Mode Character Checkboxes */}
        {mode === 'custom' && (
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Include Character Sets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useUpper}
                  onChange={(e) => setUseUpper(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Uppercase (A-Z)</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useLower}
                  onChange={(e) => setUseLower(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Lowercase (a-z)</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useNumbers}
                  onChange={(e) => setUseNumbers(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Numbers (0-9)</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSymbols}
                  onChange={(e) => setUseSymbols(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Symbols (!@#$...)</span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Exclude ambiguous lookalike characters (0, O, o, 1, l, I, |)</span>
              </label>
            </div>
          </div>
        )}

        {/* Chunking / Hyphen grouping options */}
        {mode !== 'passphrase' && (
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Group with separator every:</span>
              <select
                value={chunkSize}
                onChange={(e) => setChunkSize(parseInt(e.target.value))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="0">No Grouping</option>
                <option value="4">4 Characters (XXXX-XXXX)</option>
                <option value="5">5 Characters (XXXXX-XXXXX)</option>
                <option value="8">8 Characters</option>
              </select>
            </div>

            {chunkSize > 0 && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Separator:</span>
                <input
                  type="text"
                  value={chunkSeparator}
                  onChange={(e) => setChunkSeparator(e.target.value)}
                  className="w-12 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-mono text-xs text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>
        )}

        {mode === 'passphrase' && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span>Word Delimiter:</span>
            <select
              value={passphraseDelimiter}
              onChange={(e) => setPassphraseDelimiter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="-">Hyphen (-)</option>
              <option value="_">Underscore (_)</option>
              <option value=".">Dot (.)</option>
              <option value=" ">Space</option>
              <option value="">None (Concat)</option>
            </select>
          </div>
        )}
      </div>

      {/* Results Deck */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Generated Results ({results.length})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleCopyAll('\n')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedAll ? 'Copied All' : 'Copy All'}
            </button>

            <button
              onClick={handleDownloadTxt}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> TXT
            </button>

            <button
              onClick={handleDownloadJson}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> JSON
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
        </div>

        {/* String List Output */}
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {results.map((str, idx) => (
            <div
              key={idx}
              className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all gap-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-xs font-mono text-slate-400 w-6 text-right shrink-0">
                  {idx + 1}.
                </span>
                <span className="font-mono text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 break-all select-all">
                  {str}
                </span>
              </div>

              <button
                onClick={() => handleCopySingle(str, idx)}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700/80 transition-colors shrink-0"
                title="Copy to clipboard"
              >
                {copiedIndex === idx ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Security badge */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Entropy generated via <code>window.crypto.getRandomValues()</code>. All random strings are generated locally inside your browser and never cached on any server.
          </span>
        </div>
      </div>
    </div>
  );
};

export default RandomStringGenerator;
