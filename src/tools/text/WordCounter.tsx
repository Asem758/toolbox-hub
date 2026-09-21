import React, { useState, useMemo } from 'react';
import { Copy, Trash2, Download, FileText, Clock, Volume2, AlignLeft, Hash } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard, downloadText } from '../../lib/utils';

export const WordCounter: React.FC = () => {
  const [text, setText] = useState<string>('');
  const { showToast } = useToast();

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const wordsArray = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const wordCount = wordsArray.length;
    const charCount = text.length;
    const charNoSpacesCount = text.replace(/\s/g, '').length;
    const sentences = trimmed ? (trimmed.match(/[^.!?]+[.!?]+(\s|$)/g) || [trimmed]).length : 0;
    const paragraphs = trimmed ? text.split(/\n+/).filter((p) => p.trim().length > 0).length : 0;
    const lines = text ? text.split('\n').length : 0;
    const readingTime = Math.ceil(wordCount / 200); // 200 wpm
    const speakingTime = Math.ceil(wordCount / 130); // 130 wpm

    // Keyword density
    const frequencyMap: Record<string, number> = {};
    wordsArray.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/gi, '');
      if (clean.length > 2) {
        frequencyMap[clean] = (frequencyMap[clean] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({
        word,
        count,
        density: ((count / (wordCount || 1)) * 100).toFixed(1),
      }));

    return {
      words: wordCount,
      characters: charCount,
      charactersNoSpaces: charNoSpacesCount,
      sentences,
      paragraphs,
      lines,
      readingTime,
      speakingTime,
      topKeywords,
    };
  }, [text]);

  const handleCopy = async () => {
    if (!text) {
      showToast('Nothing to copy. Please enter some text.', 'info');
      return;
    }
    const success = await copyToClipboard(text);
    if (success) {
      showToast('Text copied to clipboard!', 'success');
    }
  };

  const handleDownload = () => {
    if (!text) {
      showToast('No text available to download.', 'info');
      return;
    }
    downloadText(text, `word-counter-export-${Date.now()}.txt`);
    showToast('File downloaded successfully!', 'success');
  };

  const handleClear = () => {
    setText('');
    showToast('Text cleared.', 'info');
  };

  const sampleTexts = [
    { label: 'Essay Sample', text: 'Artificial intelligence is revolutionizing modern computing by automating repetitive tasks and unlocking creative workflows for researchers worldwide. In this digital era, having fast, client-side tools guarantees privacy, performance, and accessibility without sending sensitive data to external servers.' },
    { label: 'Short Note', text: 'Meeting notes with design team at 2 PM. Review prototype, verify mobile responsive metrics, and finalize Q3 roadmap.' }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Samples */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Insert Sample:</span>
          {sampleTexts.map((sample, i) => (
            <button
              key={i}
              onClick={() => {
                setText(sample.text);
                showToast(`Loaded ${sample.label}`, 'info');
              }}
              className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-slate-200 dark:border-slate-700"
            >
              {sample.label}
            </button>
          ))}
        </div>
        <div className="text-slate-400">Live Real-Time Analysis</div>
      </div>

      {/* Main Text Input */}
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here to analyze words, characters, reading time, and density..."
          rows={10}
          className="w-full p-4 md:p-5 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none resize-y text-base leading-relaxed"
        />

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>{stats.words} Words</span>
            <span>•</span>
            <span>{stats.characters} Characters</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              disabled={!text}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
            <button
              onClick={handleCopy}
              disabled={!text}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:pointer-events-none shadow-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
            <button
              onClick={handleDownload}
              disabled={!text}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:pointer-events-none shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download .txt
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Words</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.words}</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
            <Hash className="w-4 h-4" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Characters</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.characters}</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
            <AlignLeft className="w-4 h-4" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">No Spaces</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.charactersNoSpaces}</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
            <AlignLeft className="w-4 h-4" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sentences</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.sentences}</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Reading</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.readingTime} <span className="text-xs font-normal text-slate-500">min</span></div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
            <Volume2 className="w-4 h-4" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Speaking</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.speakingTime} <span className="text-xs font-normal text-slate-500">min</span></div>
        </div>
      </div>

      {/* Top Keywords Analysis */}
      {stats.topKeywords.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Top Keyword Frequencies</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {stats.topKeywords.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate capitalize">{item.word}</div>
                <div className="text-slate-500 dark:text-slate-400 flex justify-between mt-1">
                  <span>{item.count} times</span>
                  <span>{item.density}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default WordCounter;
