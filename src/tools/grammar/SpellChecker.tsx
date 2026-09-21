import React, { useState, useMemo, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard } from '../../lib/utils';
import {
  SpellCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  BookMarked,
  Plus,
  Trash2,
  Languages,
  CheckCheck,
  ArrowRight,
} from 'lucide-react';

interface MisspelledWord {
  id: string;
  original: string;
  cleanWord: string;
  suggestions: string[];
  startIndex: number;
  endIndex: number;
}

const COMMON_TYPOS: Record<string, string[]> = {
  // Common spelling mistakes
  'recieve': ['receive'],
  'recieved': ['received'],
  'recieving': ['receiving'],
  'seperate': ['separate'],
  'seperated': ['separated'],
  'seperation': ['separation'],
  'accomodate': ['accommodate'],
  'accomodation': ['accommodation'],
  'untill': ['until'],
  'definitly': ['definitely'],
  'definately': ['definitely'],
  'embarass': ['embarrass'],
  'embarassing': ['embarrassing'],
  'neccessary': ['necessary'],
  'necesary': ['necessary'],
  'calender': ['calendar'],
  'occurr': ['occur'],
  'occured': ['occurred'],
  'occurence': ['occurrence'],
  'occuring': ['occurring'],
  'goverment': ['government'],
  'enviroment': ['environment'],
  'wierd': ['weird'],
  'beleive': ['believe'],
  'acheive': ['achieve'],
  'peice': ['piece'],
  'freind': ['friend'],
  'tommorrow': ['tomorrow'],
  'tomorow': ['tomorrow'],
  'truely': ['truly'],
  'publically': ['publicly'],
  'mispell': ['misspell'],
  'mispelled': ['misspelled'],
  'agressive': ['aggressive'],
  'agression': ['aggression'],
  'sucess': ['success'],
  'succesful': ['successful'],
  'posession': ['possession'],
  'maintainance': ['maintenance'],
  'priviledge': ['privilege'],
  'guarentee': ['guarantee'],
  'garantee': ['guarantee'],
  'independant': ['independent'],
  'existance': ['existence'],
  'dilemna': ['dilemma'],
  'pronounciation': ['pronunciation'],
  'fourty': ['forty'],
  'harrass': ['harass'],
  'harasment': ['harassment'],
  'millenium': ['millennium'],
  'restarant': ['restaurant'],
  'restraunt': ['restaurant'],
  'collegue': ['colleague'],
  'concensus': ['consensus'],
  'convinient': ['convenient'],
  'dissapear': ['disappear'],
  'dissappoint': ['disappoint'],
  'foriegn': ['foreign'],
  'heigth': ['height'],
  'judgement': ['judgment', 'judgement'],
  'knowlege': ['knowledge'],
  'liason': ['liaison'],
  'managment': ['management'],
  'noticable': ['noticeable'],
  'parrallel': ['parallel'],
  'persue': ['pursue'],
  'rythm': ['rhythm'],
  'scheduele': ['schedule'],
  'threshhold': ['threshold'],
  'unforseen': ['unforeseen'],
  'wich': ['which'],
  'allready': ['already'],
  'alot': ['a lot'],
  'becuase': ['because'],
  'beutiful': ['beautiful'],
  'buisness': ['business'],
};

// UK vs US Dialect mappings
const DIALECT_MAP_US_TO_UK: Record<string, string> = {
  color: 'colour',
  colors: 'colours',
  flavor: 'flavour',
  flavors: 'flavours',
  honor: 'honour',
  humor: 'humour',
  neighbor: 'neighbour',
  center: 'centre',
  theater: 'theatre',
  meter: 'metre',
  organize: 'organise',
  organized: 'organised',
  realize: 'realise',
  realized: 'realised',
  analyze: 'analyse',
  defense: 'defence',
  license: 'licence',
};

const DIALECT_MAP_UK_TO_US: Record<string, string> = Object.fromEntries(
  Object.entries(DIALECT_MAP_US_TO_UK).map(([us, uk]) => [uk, us])
);

const SAMPLE_TEXT = `We recieved the calender for next year's scheduele. The accomodation was seperated into two wings. It was a truely wierd occurence that left everyone embarassed. Please maintain accurate records for the goverment enviroment audit.`;

export const SpellChecker: React.FC = () => {
  const { showToast } = useToast();
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [dialect, setDialect] = useState<'us' | 'uk'>('us');
  const [personalDict, setPersonalDict] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('toolbox_personal_dict');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState<boolean>(false);
  const [newWordInput, setNewWordInput] = useState<string>('');

  // Save personal dictionary
  useEffect(() => {
    try {
      localStorage.setItem('toolbox_personal_dict', JSON.stringify(personalDict));
    } catch {
      // ignore
    }
  }, [personalDict]);

  // Find spelling mistakes
  const errors = useMemo<MisspelledWord[]>(() => {
    if (!text.trim()) return [];

    const list: MisspelledWord[] = [];
    const wordRegex = /\b[a-zA-Z']+\b/g;
    let match: RegExpExecArray | null;

    const lowerPersonalDict = new Set(personalDict.map((w) => w.toLowerCase()));

    while ((match = wordRegex.exec(text)) !== null) {
      const rawWord = match[0];
      const clean = rawWord.toLowerCase().replace(/^'+|'+$/g, '');
      const startIndex = match.index;
      const endIndex = startIndex + rawWord.length;

      // Check if word is whitelisted in user dictionary
      if (lowerPersonalDict.has(clean)) continue;

      // 1. Check known typos
      if (COMMON_TYPOS[clean]) {
        const isCapitalized = rawWord[0] === rawWord[0].toUpperCase() && rawWord[0] !== rawWord[0].toLowerCase();
        const suggestions = COMMON_TYPOS[clean].map((s) =>
          isCapitalized ? s.charAt(0).toUpperCase() + s.slice(1) : s
        );

        list.push({
          id: `${startIndex}-${endIndex}-${clean}`,
          original: rawWord,
          cleanWord: clean,
          suggestions,
          startIndex,
          endIndex,
        });
      }
      // 2. Check dialect mismatch
      else if (dialect === 'uk' && DIALECT_MAP_US_TO_UK[clean]) {
        const target = DIALECT_MAP_US_TO_UK[clean];
        const isCap = rawWord[0] === rawWord[0].toUpperCase();
        list.push({
          id: `${startIndex}-${endIndex}-${clean}`,
          original: rawWord,
          cleanWord: clean,
          suggestions: [isCap ? target.charAt(0).toUpperCase() + target.slice(1) : target],
          startIndex,
          endIndex,
        });
      } else if (dialect === 'us' && DIALECT_MAP_UK_TO_US[clean]) {
        const target = DIALECT_MAP_UK_TO_US[clean];
        const isCap = rawWord[0] === rawWord[0].toUpperCase();
        list.push({
          id: `${startIndex}-${endIndex}-${clean}`,
          original: rawWord,
          cleanWord: clean,
          suggestions: [isCap ? target.charAt(0).toUpperCase() + target.slice(1) : target],
          startIndex,
          endIndex,
        });
      }
    }

    return list;
  }, [text, dialect, personalDict]);

  // Replace single word
  const handleReplace = (err: MisspelledWord, replacement: string) => {
    const before = text.substring(0, err.startIndex);
    const after = text.substring(err.endIndex);
    setText(before + replacement + after);
    showToast(`Replaced "${err.original}" with "${replacement}"`, 'success');
  };

  // Replace All instances
  const handleReplaceAll = () => {
    if (errors.length === 0) return;

    let updated = text;
    const sorted = [...errors].sort((a, b) => b.startIndex - a.startIndex);

    sorted.forEach((err) => {
      if (err.suggestions.length > 0) {
        const rep = err.suggestions[0];
        const before = updated.substring(0, err.startIndex);
        const after = updated.substring(err.endIndex);
        updated = before + rep + after;
      }
    });

    setText(updated);
    showToast(`Corrected all ${errors.length} spelling errors!`, 'success');
  };

  // Add word to user dictionary
  const handleAddToDict = (word: string) => {
    const clean = word.toLowerCase().trim();
    if (clean && !personalDict.includes(clean)) {
      setPersonalDict((prev) => [...prev, clean]);
      showToast(`Added "${clean}" to personal dictionary`, 'info');
    }
  };

  // Remove word from dictionary
  const handleRemoveFromDict = (word: string) => {
    setPersonalDict((prev) => prev.filter((w) => w !== word));
    showToast(`Removed "${word}" from dictionary`, 'info');
  };

  // Copy text
  const handleCopy = async () => {
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      showToast('Text copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const accuracy = wordCount > 0 ? Math.max(0, Math.round(((wordCount - errors.length) / wordCount) * 100)) : 100;

  return (
    <div className="space-y-6">
      {/* Top Header Deck */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Dialect Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setDialect('us')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dialect === 'us'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              US English
            </button>
            <button
              onClick={() => setDialect('uk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dialect === 'uk'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              UK English
            </button>
          </div>

          <button
            onClick={() => {
              setText(SAMPLE_TEXT);
              showToast('Sample text loaded', 'info');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Load Sample
          </button>

          <button
            onClick={() => setText('')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        <div className="flex items-center gap-2">
          {errors.length > 0 && (
            <button
              onClick={handleReplaceAll}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              Fix All ({errors.length})
            </button>
          )}

          <button
            onClick={handleCopy}
            disabled={!text}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Main Grid: Text Area & Spelling Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Editor & Stats */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <SpellCheck className="w-4 h-4 text-indigo-500" />
                Text to Spellcheck
              </label>
              <div className="text-xs font-medium text-slate-500">
                {wordCount} words &bull; {errors.length} errors
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text to check for misspellings and typos..."
              rows={12}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans text-base focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all resize-y leading-relaxed"
            />

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <div className="text-xs text-slate-500 font-medium">Spelling Accuracy</div>
                <div className={`text-xl font-bold font-mono ${accuracy >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                  {accuracy}%
                </div>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <div className="text-xs text-slate-500 font-medium">Misspellings</div>
                <div className={`text-xl font-bold font-mono ${errors.length === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                  {errors.length}
                </div>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <div className="text-xs text-slate-500 font-medium">Custom Dictionary</div>
                <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {personalDict.length} words
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Misspellings Panel & Personal Dictionary */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Misspelled Words ({errors.length})
              </h4>
            </div>

            {errors.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">All Words Spelled Correctly!</h5>
                <p className="text-[11px] text-slate-500">No spelling mistakes detected in your text.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {errors.map((err) => (
                  <div
                    key={err.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg">
                        {err.original}
                      </span>
                      <button
                        onClick={() => handleAddToDict(err.cleanWord)}
                        className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                        title="Add to dictionary so it is never flagged again"
                      >
                        <BookMarked className="w-3 h-3" />
                        Add to Dict
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-medium text-slate-500">Suggested Corrections:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {err.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleReplace(err, sug)}
                            className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold transition-colors border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Personal Dictionary Panel */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-indigo-500" />
              Personal Dictionary ({personalDict.length})
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                value={newWordInput}
                onChange={(e) => setNewWordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddToDict(newWordInput);
                    setNewWordInput('');
                  }
                }}
                placeholder="Add custom word (e.g. brand, name)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={() => {
                  handleAddToDict(newWordInput);
                  setNewWordInput('');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              >
                Add
              </button>
            </div>

            {personalDict.length > 0 && (
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-1">
                {personalDict.map((word) => (
                  <span
                    key={word}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                  >
                    {word}
                    <button
                      onClick={() => handleRemoveFromDict(word)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpellChecker;
