import React, { useState, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Copy,
  Check,
  Download,
  Search,
  AlertTriangle,
  Sparkles,
  Sliders,
  TrendingUp,
  Percent,
} from 'lucide-react';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both',
  'but', 'by', 'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does',
  'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
  'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s',
  'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its',
  'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of',
  'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so',
  'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t',
  'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when',
  'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s',
  'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve',
  'your', 'yours', 'yourself', 'yourselves',
]);

const SAMPLE_TEXT = `Search engine optimization, or SEO, is a fundamental digital marketing practice aimed at improving website visibility in organic search engine results. High-quality SEO requires a strategic blend of keyword research, on-page optimization, content creation, technical SEO, and backlink authority.

When conducting keyword research for your website, identify search intent and long-tail keyword variations that potential customers use. Content optimization ensures that your primary keyword and related terms appear naturally in your title tag, headings, meta description, and article body without engaging in keyword stuffing.

Technical SEO ensures fast page speed, mobile responsiveness, structured data schema markup, and clean URL architecture. By continually optimizing your SEO strategy, you can attract sustainable organic traffic and grow your brand authority online.`;

export const KeywordDensityChecker: React.FC = () => {
  const { showToast } = useToast();

  const [text, setText] = useState(SAMPLE_TEXT);
  const [ngramType, setNgramType] = useState<1 | 2 | 3>(1);
  const [filterStopWords, setFilterStopWords] = useState(true);
  const [minWordLength, setMinWordLength] = useState<number>(3);
  const [searchFilter, setSearchFilter] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('seo');

  // Tokenize words
  const words = useMemo(() => {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s'-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= minWordLength && (!filterStopWords || !STOP_WORDS.has(w)));
  }, [text, minWordLength, filterStopWords]);

  const totalRawWords = useMemo(() => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, [text]);

  // Compute N-grams
  const keywordStats = useMemo(() => {
    if (!words.length || totalRawWords === 0) return [];

    const map = new Map<string, number>();

    if (ngramType === 1) {
      for (const w of words) {
        map.set(w, (map.get(w) || 0) + 1);
      }
    } else if (ngramType === 2) {
      for (let i = 0; i < words.length - 1; i++) {
        const bigram = `${words[i]} ${words[i + 1]}`;
        map.set(bigram, (map.get(bigram) || 0) + 1);
      }
    } else if (ngramType === 3) {
      for (let i = 0; i < words.length - 2; i++) {
        const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        map.set(trigram, (map.get(trigram) || 0) + 1);
      }
    }

    const entries = Array.from(map.entries()).map(([phrase, count]) => {
      const density = (count / totalRawWords) * 100;
      return {
        phrase,
        count,
        density: Number(density.toFixed(2)),
        isStuffing: density > 3.5,
      };
    });

    // Sort descending by frequency
    return entries.sort((a, b) => b.count - a.count);
  }, [words, totalRawWords, ngramType]);

  // Filtered stats by user search
  const filteredKeywords = useMemo(() => {
    if (!searchFilter.trim()) return keywordStats;
    const q = searchFilter.toLowerCase();
    return keywordStats.filter((k) => k.phrase.includes(q));
  }, [keywordStats, searchFilter]);

  // Specific target keyword analysis
  const targetStat = useMemo(() => {
    if (!targetKeyword.trim() || totalRawWords === 0) return null;
    const cleanTarget = targetKeyword.toLowerCase().trim();
    const regex = new RegExp(`\\b${cleanTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = text.match(regex);
    const count = matches ? matches.length : 0;
    const density = Number(((count / totalRawWords) * 100).toFixed(2));

    return {
      keyword: cleanTarget,
      count,
      density,
      isOptimal: density >= 1.0 && density <= 2.5,
      isOver: density > 3.5,
    };
  }, [text, targetKeyword, totalRawWords]);

  const handleCopyKeywords = async () => {
    const lines = filteredKeywords.map((k) => `${k.phrase}: ${k.count} times (${k.density}%)`);
    await navigator.clipboard.writeText(lines.join('\n'));
    showToast(`Copied ${filteredKeywords.length} keywords to clipboard`, 'success');
  };

  const handleDownloadCsv = () => {
    const header = 'Keyword Phrase,Count,Density Percentage,Warning\n';
    const rows = filteredKeywords
      .map(
        (k) =>
          `"${k.phrase}",${k.count},${k.density}%,${k.isStuffing ? 'High Density (>3.5%)' : 'Optimal'}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keyword-density-report.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded keyword-density-report.csv', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setText(SAMPLE_TEXT)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample SEO Article
          </button>
          <button
            onClick={() => setText('')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Clear Text
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyKeywords}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Keywords
          </button>
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Target Focus Keyword Inspector */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Focus Primary Target Keyword
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                placeholder="e.g. SEO, productivity, coffee maker"
                className="w-full max-w-xs px-3 py-1.5 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          {targetStat && (
            <div className="flex flex-wrap items-center gap-4 sm:border-l sm:border-slate-100 dark:sm:border-slate-800 sm:pl-6">
              <div className="text-left">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Occurrences</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {targetStat.count} <span className="text-xs font-normal text-slate-400">times</span>
                </div>
              </div>

              <div className="text-left">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Density</div>
                <div
                  className={`text-lg font-black ${
                    targetStat.isOver
                      ? 'text-rose-600 dark:text-rose-400'
                      : targetStat.isOptimal
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  {targetStat.density}%
                </div>
              </div>

              <div className="text-left">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">SEO Assessment</div>
                <div className="text-xs font-bold">
                  {targetStat.isOver ? (
                    <span className="text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> High (Over-optimized)
                    </span>
                  ) : targetStat.isOptimal ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Optimal (1.0% - 2.5%)
                    </span>
                  ) : (
                    <span className="text-slate-500">Low (Under 1.0%)</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Text Box */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Article / Webpage Copy
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {totalRawWords} total words · {text.length} chars
              </span>
            </div>

            <textarea
              rows={16}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your blog post, landing page copy, or article text here..."
              className="w-full p-3.5 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none font-sans leading-relaxed"
            />
          </div>
        </div>

        {/* Right Density Table & Settings */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            {/* Phrase Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setNgramType(1)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    ngramType === 1
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  1 Word (Single)
                </button>
                <button
                  onClick={() => setNgramType(2)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    ngramType === 2
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  2 Words (Bigrams)
                </button>
                <button
                  onClick={() => setNgramType(3)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    ngramType === 3
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  3 Words (Trigrams)
                </button>
              </div>

              {/* Filter stop words toggle */}
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={filterStopWords}
                  onChange={(e) => setFilterStopWords(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Exclude Stop Words</span>
              </label>
            </div>

            {/* Keyword Search Field */}
            <div className="relative">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter keywords list..."
                className="w-full pl-8 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            </div>

            {/* Keyword Frequency Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Keyword Phrase</th>
                      <th className="py-2.5 px-3 text-center">Count</th>
                      <th className="py-2.5 px-3 text-right">Density</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredKeywords.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-slate-400">
                          No matching keywords found.
                        </td>
                      </tr>
                    ) : (
                      filteredKeywords.map((k, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-2 px-3 font-medium text-slate-900 dark:text-white capitalize">
                            {k.phrase}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-slate-600 dark:text-slate-400">
                            {k.count}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span
                              className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded ${
                                k.isStuffing
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                              }`}
                            >
                              {k.density}%
                              {k.isStuffing && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default KeywordDensityChecker;
