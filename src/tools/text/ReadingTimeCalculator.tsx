import React, { useState, useMemo, useRef } from 'react';
import {
  Clock,
  Mic,
  BookOpen,
  Sliders,
  Copy,
  Trash2,
  Download,
  Upload,
  Sparkles,
  Award,
  FileText,
  Target,
  Check,
  Zap,
  Layers,
  ChevronDown,
  Info,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard, downloadText } from '../../lib/utils';

interface SpeedPreset {
  label: string;
  wpm: number;
  description: string;
}

const READING_PRESETS: SpeedPreset[] = [
  { label: 'Slow / Technical', wpm: 140, description: 'Complex docs, research & legal' },
  { label: 'Standard Adult', wpm: 200, description: 'Default online articles & blogs' },
  { label: 'Fast Reader', wpm: 260, description: 'Skimming & experienced readers' },
  { label: 'Speed Reader', wpm: 350, description: 'High-speed speed readers' },
];

const SPEAKING_PRESETS: SpeedPreset[] = [
  { label: 'Deliberate / Keynote', wpm: 110, description: 'Slow pace for major stages & slides' },
  { label: 'Conversational', wpm: 130, description: 'Podcasts, videos & standard talks' },
  { label: 'Fast / Broadcast', wpm: 160, description: 'Radio ads & rapid explainers' },
];

const SAMPLE_TEXTS = [
  {
    label: 'Blog Article',
    text: `The Rise of Modern Web Development: Why Client-Side Performance Matters

In the fast-moving landscape of web software engineering, user experience has shifted from bloated server roundtrips to instantaneous, client-side responsiveness. Modern web applications process massive datasets, render complex interfaces, and execute privacy-focused computations directly within the user's browser.

By minimizing roundtrips to remote cloud servers, web applications eliminate latency spikes, protect personal confidentiality, and remain fully functional even in offline environments. Tools like WebAssembly and client-side JavaScript enable interactive vector graphics, media conversions, and analytical statistics without sending sensitive documents over the wire.

As technology continues to mature, developer priorities are crystallizing around accessibility, sub-millisecond interactivity, and zero-footprint architectural designs. Embracing local-first utilities represents not merely an optimization, but a fundamental evolution in software architecture.`,
  },
  {
    label: 'Keynote Speech',
    text: `Good morning everyone. Thank you for joining us today.

Ten years ago, we embarked on a journey to transform how people interact with digital tools. We believed that technology should be intuitive, transparent, and respectful of your time. Today, I am thrilled to share the next chapter in that mission.

What you are seeing today is the culmination of relentless innovation, creative engineering, and thousands of hours listening to your feedback. We didn't just build a new platform; we re-imagined the entire workflow from the ground up.

As we look toward the future, our commitment remains unchanged: to empower creators, solve meaningful challenges, and bring high-performance solutions into everyone's hands. Thank you for being part of this incredible story.`,
  },
  {
    label: 'Technical Brief',
    text: `Distributed Consensus & State Synchronization Architecture

Modern distributed systems rely on Byzantine fault tolerance mechanisms to maintain immutable transactional states across decentralized nodes. Consensus protocols systematically resolve concurrency conflicts through quorum negotiation and cryptographically verified state machines.

When evaluating network throughput, practitioners must account for propagation latency, serialization overheads, and deterministic partition tolerances. Rigorous state pruning guarantees long-term durability while preserving microsecond query performance across high-frequency transaction boundaries.`,
  },
];

// Helper to count syllables in an English word
function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 0;
  if (clean.length <= 3) return 1;

  let formatted = clean
    .replace(/(?:[^laeiouy]|ed|es|e)$/, '')
    .replace(/^y/, '');
  
  const matches = formatted.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

// Format seconds into human readable time string
function formatDuration(totalSeconds: number): { text: string; short: string; minutes: number; seconds: number } {
  if (totalSeconds <= 0) {
    return { text: '0 sec', short: '0s', minutes: 0, seconds: 0 };
  }

  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;

  if (minutes === 0) {
    return {
      text: `${seconds} sec`,
      short: `${seconds}s`,
      minutes: 0,
      seconds,
    };
  }

  if (seconds === 0) {
    return {
      text: `${minutes} min`,
      short: `${minutes}m`,
      minutes,
      seconds: 0,
    };
  }

  return {
    text: `${minutes} min ${seconds} sec`,
    short: `${minutes}m ${seconds}s`,
    minutes,
    seconds,
  };
}

export const ReadingTimeCalculator: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [readingWpm, setReadingWpm] = useState<number>(200);
  const [speakingWpm, setSpeakingWpm] = useState<number>(130);
  const [targetSpeechMinutes, setTargetSpeechMinutes] = useState<number>(5);
  const [activeTab, setActiveTab] = useState<'reading' | 'speech' | 'readability'>('reading');
  const [copiedBadge, setCopiedBadge] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Core Statistics Calculation
  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;
    const charCount = text.length;
    const charNoSpaces = text.replace(/\s/g, '').length;
    
    // Sentences
    const rawSentences = trimmed ? trimmed.split(/[.!?]+(?:\s+|$)/).filter((s) => s.trim().length > 0) : [];
    const sentenceCount = Math.max(rawSentences.length, wordCount > 0 ? 1 : 0);
    
    // Paragraphs
    const paragraphs = trimmed ? trimmed.split(/\n+/).filter((p) => p.trim().length > 0).length : 0;
    const lines = text ? text.split('\n').length : 0;

    // Pages (standard ~250 words per page for double-spaced book, ~450 for dense single-spaced)
    const pagesBook = wordCount > 0 ? (wordCount / 250).toFixed(1) : '0';
    const pagesArticle = wordCount > 0 ? (wordCount / 450).toFixed(1) : '0';

    // Durations
    const readingSecs = wordCount > 0 ? (wordCount / readingWpm) * 60 : 0;
    const speakingSecs = wordCount > 0 ? (wordCount / speakingWpm) * 60 : 0;

    const readingDuration = formatDuration(readingSecs);
    const speakingDuration = formatDuration(speakingSecs);

    // Syllables & Readability (Flesch-Kincaid)
    let totalSyllables = 0;
    let complexWordsCount = 0; // 3+ syllables

    words.forEach((w) => {
      const syl = countSyllables(w);
      totalSyllables += syl;
      if (syl >= 3) complexWordsCount++;
    });

    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const avgSyllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0;
    const avgCharsPerWord = wordCount > 0 ? charNoSpaces / wordCount : 0;

    // Flesch Reading Ease Formula: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
    let fleschEase = 0;
    if (wordCount > 5 && sentenceCount > 0) {
      fleschEase = Math.max(0, Math.min(100, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord));
    }

    // Flesch-Kincaid Grade Level: 0.39 * (total words / total sentences) + 11.8 * (total syllables / total words) - 15.59
    let gradeLevel = 0;
    if (wordCount > 5 && sentenceCount > 0) {
      gradeLevel = Math.max(1, Math.min(18, 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59));
    }

    // Readability interpretation
    let readingEaseLabel = 'Neutral';
    let readingEaseColor = 'text-slate-600 dark:text-slate-400';
    let readingEaseBadge = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    
    if (wordCount <= 5) {
      readingEaseLabel = 'Enter more text to evaluate';
    } else if (fleschEase >= 90) {
      readingEaseLabel = 'Very Easy (5th grade level)';
      readingEaseColor = 'text-emerald-600 dark:text-emerald-400';
      readingEaseBadge = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    } else if (fleschEase >= 80) {
      readingEaseLabel = 'Easy (6th grade level)';
      readingEaseColor = 'text-emerald-600 dark:text-emerald-400';
      readingEaseBadge = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    } else if (fleschEase >= 70) {
      readingEaseLabel = 'Fairly Easy (7th grade level)';
      readingEaseColor = 'text-teal-600 dark:text-teal-400';
      readingEaseBadge = 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    } else if (fleschEase >= 60) {
      readingEaseLabel = 'Standard / Plain English (8th-9th grade)';
      readingEaseColor = 'text-indigo-600 dark:text-indigo-400';
      readingEaseBadge = 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    } else if (fleschEase >= 50) {
      readingEaseLabel = 'Fairly Difficult (10th-12th grade)';
      readingEaseColor = 'text-amber-600 dark:text-amber-400';
      readingEaseBadge = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    } else if (fleschEase >= 30) {
      readingEaseLabel = 'Difficult (College level)';
      readingEaseColor = 'text-orange-600 dark:text-orange-400';
      readingEaseBadge = 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    } else {
      readingEaseLabel = 'Very Difficult (Academic/Post-grad)';
      readingEaseColor = 'text-rose-600 dark:text-rose-400';
      readingEaseBadge = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    }

    // Target speech comparison
    const targetWordBudget = targetSpeechMinutes * speakingWpm;
    const wordDiff = wordCount - targetWordBudget;
    const timeDiffSecs = speakingSecs - (targetSpeechMinutes * 60);

    return {
      wordCount,
      charCount,
      charNoSpaces,
      sentenceCount,
      paragraphs,
      lines,
      pagesBook,
      pagesArticle,
      readingSecs,
      speakingSecs,
      readingDuration,
      speakingDuration,
      totalSyllables,
      complexWordsCount,
      complexPercentage: wordCount > 0 ? ((complexWordsCount / wordCount) * 100).toFixed(1) : '0',
      avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
      avgSyllablesPerWord: avgSyllablesPerWord.toFixed(2),
      avgCharsPerWord: avgCharsPerWord.toFixed(1),
      fleschEase: Math.round(fleschEase),
      gradeLevel: gradeLevel.toFixed(1),
      readingEaseLabel,
      readingEaseColor,
      readingEaseBadge,
      targetWordBudget,
      wordDiff,
      timeDiffSecs,
    };
  }, [text, readingWpm, speakingWpm, targetSpeechMinutes]);

  // Handle Badge Copy
  const handleCopyBadge = async (badgeText: string, badgeId: string) => {
    const success = await copyToClipboard(badgeText);
    if (success) {
      setCopiedBadge(badgeId);
      showToast('Badge copied to clipboard!', 'success');
      setTimeout(() => setCopiedBadge(null), 2000);
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('text') && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      showToast('Please upload a text file (.txt, .md).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content || '');
      showToast(`Loaded ${file.name} (${content.length} chars)`, 'success');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle Download Full Report
  const handleDownloadReport = () => {
    if (!text.trim()) {
      showToast('Please enter text to export report.', 'info');
      return;
    }

    const report = `=========================================
READING TIME & TEXT ANALYSIS REPORT
ToolBox Hub | Client-Side Text Analytics
Generated: ${new Date().toLocaleString()}
=========================================

SUMMARY:
• Total Words: ${stats.wordCount.toLocaleString()}
• Total Characters: ${stats.charCount.toLocaleString()} (without spaces: ${stats.charNoSpaces.toLocaleString()})
• Sentences: ${stats.sentenceCount}
• Paragraphs: ${stats.paragraphs}
• Standard Pages (~250 words): ${stats.pagesBook} pages

ESTIMATED DURATIONS:
• Silent Reading Time (@ ${readingWpm} WPM): ${stats.readingDuration.text}
• Speaking / Presentation Time (@ ${speakingWpm} WPM): ${stats.speakingDuration.text}

READABILITY & COMPLEXITY:
• Flesch Reading Ease: ${stats.fleschEase}/100 (${stats.readingEaseLabel})
• Flesch-Kincaid Grade Level: Grade ${stats.gradeLevel}
• Average Sentence Length: ${stats.avgWordsPerSentence} words/sentence
• Average Word Length: ${stats.avgCharsPerWord} characters/word
• Polysyllabic / Complex Words: ${stats.complexWordsCount} (${stats.complexPercentage}%)

-----------------------------------------
ORIGINAL TEXT:
-----------------------------------------
${text}
`;

    downloadText(report, `reading-time-report-${Date.now()}.txt`);
    showToast('Analysis report downloaded successfully!', 'success');
  };

  const handleCopyText = async () => {
    if (!text) {
      showToast('Nothing to copy.', 'info');
      return;
    }
    const success = await copyToClipboard(text);
    if (success) {
      showToast('Text copied to clipboard!', 'success');
    }
  };

  const handleClear = () => {
    setText('');
    showToast('Text cleared.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Quick Sample Selector & File Upload */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Sample text:</span>
          {SAMPLE_TEXTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setText(sample.text);
                showToast(`Inserted "${sample.label}" sample`, 'info');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-slate-200 dark:border-slate-700 font-medium"
            >
              {sample.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.text"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-slate-200 dark:border-slate-700 font-medium shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-500" />
            Upload File (.txt/.md)
          </button>
        </div>
      </div>

      {/* Main Textarea Input */}
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your article, speech, manuscript, or blog post here to calculate reading time..."
          rows={7}
          className="w-full p-4 bg-transparent resize-y text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none text-sm md:text-base leading-relaxed"
        />

        {/* Textarea Bottom Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 rounded-b-2xl">
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span><strong className="text-slate-700 dark:text-slate-200 font-semibold">{stats.wordCount.toLocaleString()}</strong> words</span>
            <span><strong className="text-slate-700 dark:text-slate-200 font-semibold">{stats.charCount.toLocaleString()}</strong> characters</span>
            <span className="hidden sm:inline"><strong className="text-slate-700 dark:text-slate-200 font-semibold">{stats.sentenceCount}</strong> sentences</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              disabled={!text}
              className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 disabled:opacity-40 disabled:hover:text-slate-400 rounded-md transition-colors"
              title="Clear text"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyText}
              disabled={!text}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 disabled:opacity-40 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Text
            </button>
            <button
              onClick={handleDownloadReport}
              disabled={!text}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Highlight Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Silent Reading Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/30 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Silent Reading
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              @{readingWpm} wpm
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stats.readingDuration.text}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standard speed for blogs, articles, and novels
          </p>
        </div>

        {/* Speaking / Speech Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50/70 via-white to-violet-50/30 dark:from-violet-950/30 dark:via-slate-900 dark:to-slate-900 border border-violet-100 dark:border-violet-900/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
              <Mic className="w-4 h-4" /> Speech / Presentation
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              @{speakingWpm} wpm
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stats.speakingDuration.text}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Speaking pace for presentations, podcasts & videos
          </p>
        </div>

        {/* Readability Score Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 border border-emerald-100 dark:border-emerald-900/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Readability Level
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Flesch Score: {stats.fleschEase}/100
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
            Grade {stats.gradeLevel}
          </div>
          <p className={`text-xs mt-1 font-medium ${stats.readingEaseColor}`}>
            {stats.readingEaseLabel}
          </p>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('reading')}
          className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'reading'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Reading Speeds
        </button>
        <button
          onClick={() => setActiveTab('speech')}
          className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'speech'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          Speech Pacing & Target Planner
        </button>
        <button
          onClick={() => setActiveTab('readability')}
          className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'readability'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Full Text Analytics & Badges
        </button>
      </div>

      {/* Tab 1: Reading Speeds & Custom WPM */}
      {activeTab === 'reading' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Reading Speed Calibration</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a standard reading profile or adjust custom words-per-minute (WPM).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                  {readingWpm} WPM
                </span>
              </div>
            </div>

            {/* Reading Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {READING_PRESETS.map((preset, i) => {
                const isActive = readingWpm === preset.wpm;
                const duration = formatDuration(stats.wordCount > 0 ? (stats.wordCount / preset.wpm) * 60 : 0);
                return (
                  <button
                    key={i}
                    onClick={() => setReadingWpm(preset.wpm)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 shadow-sm ring-1 ring-indigo-500/30'
                        : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {preset.label}
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        {preset.wpm} WPM
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mb-2">
                      {preset.description}
                    </p>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Time:</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{duration.text}</strong>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom WPM Slider */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">Custom Reading Speed:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{readingWpm} Words / Minute</span>
              </div>
              <input
                type="range"
                min={80}
                max={500}
                step={5}
                value={readingWpm}
                onChange={(e) => setReadingWpm(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>80 WPM (Careful study)</span>
                <span>200 WPM (Average)</span>
                <span>350 WPM (Skim)</span>
                <span>500 WPM (Speed reading)</span>
              </div>
            </div>
          </div>

          {/* Quick Comparison Matrix */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Reading Time Breakdown Across Audiences
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                    <th className="py-2.5 pr-4">Audience Profile</th>
                    <th className="py-2.5 px-4">Speed</th>
                    <th className="py-2.5 px-4">Estimated Time</th>
                    <th className="py-2.5 pl-4">Standard Use Case</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="py-2.5 pr-4 font-semibold text-slate-900 dark:text-white">Elementary / ESL Reader</td>
                    <td className="py-2.5 px-4">100 WPM</td>
                    <td className="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">{formatDuration(stats.wordCount > 0 ? (stats.wordCount / 100) * 60 : 0).text}</td>
                    <td className="py-2.5 pl-4 text-slate-500">Children's books, language learners</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-semibold text-slate-900 dark:text-white">Technical / Legal Reader</td>
                    <td className="py-2.5 px-4">140 WPM</td>
                    <td className="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">{formatDuration(stats.wordCount > 0 ? (stats.wordCount / 140) * 60 : 0).text}</td>
                    <td className="py-2.5 pl-4 text-slate-500">Contracts, whitepapers, dense academic code</td>
                  </tr>
                  <tr className="bg-indigo-50/40 dark:bg-indigo-950/20">
                    <td className="py-2.5 pr-4 font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-500" /> Average Adult (Default)
                    </td>
                    <td className="py-2.5 px-4 font-semibold">200 WPM</td>
                    <td className="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">{formatDuration(stats.wordCount > 0 ? (stats.wordCount / 200) * 60 : 0).text}</td>
                    <td className="py-2.5 pl-4 text-slate-500">Online blog posts, Medium articles, news</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-semibold text-slate-900 dark:text-white">Casual Skimmer</td>
                    <td className="py-2.5 px-4">260 WPM</td>
                    <td className="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">{formatDuration(stats.wordCount > 0 ? (stats.wordCount / 260) * 60 : 0).text}</td>
                    <td className="py-2.5 pl-4 text-slate-500">Social newsletters, email briefs</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-semibold text-slate-900 dark:text-white">Trained Speed Reader</td>
                    <td className="py-2.5 px-4">400 WPM</td>
                    <td className="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">{formatDuration(stats.wordCount > 0 ? (stats.wordCount / 400) * 60 : 0).text}</td>
                    <td className="py-2.5 pl-4 text-slate-500">Rapid review, research scanning</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Speech & Presentation Pacing Planner */}
      {activeTab === 'speech' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Speech & Keynote Time Planner</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target a specific presentation length and see if your draft matches your allotted stage time.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Speaking Pace:</span>
                <span className="px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 font-bold text-xs">
                  {speakingWpm} WPM
                </span>
              </div>
            </div>

            {/* Speaking Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SPEAKING_PRESETS.map((preset, idx) => {
                const isActive = speakingWpm === preset.wpm;
                return (
                  <button
                    key={idx}
                    onClick={() => setSpeakingWpm(preset.wpm)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-violet-50/80 dark:bg-violet-950/40 border-violet-500 dark:border-violet-500 ring-1 ring-violet-500/30'
                        : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{preset.label}</span>
                      <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400">{preset.wpm} WPM</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{preset.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Target Time Setting */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Speech Duration:
                </label>
                <div className="flex items-center gap-1.5">
                  {[2, 3, 5, 10, 15, 20].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setTargetSpeechMinutes(mins)}
                      className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                        targetSpeechMinutes === mins
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Comparison Banner */}
              <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Target: <strong className="text-slate-800 dark:text-slate-200">{targetSpeechMinutes} minutes</strong> (~{stats.targetWordBudget} words budget)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Current Draft: <strong className="text-slate-800 dark:text-slate-200">{stats.wordCount} words</strong> ({stats.speakingDuration.text})
                  </div>
                </div>

                <div className="text-right">
                  {stats.wordDiff === 0 ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                      <Check className="w-3.5 h-3.5" /> Perfect Word Match!
                    </span>
                  ) : stats.wordDiff > 0 ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
                      +{stats.wordDiff} words over target (cut ~{Math.abs(Math.round(stats.timeDiffSecs / 60))} min)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                      {Math.abs(stats.wordDiff)} words remaining (under by ~{Math.abs(Math.round(stats.timeDiffSecs / 60))} min)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Full Text Analytics & Embed Badges */}
      {activeTab === 'readability' && (
        <div className="space-y-6">
          {/* Detailed Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total Words</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.wordCount.toLocaleString()}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Characters</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.charCount.toLocaleString()}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Sentences</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.sentenceCount}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Paragraphs</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.paragraphs}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Book Pages (~250w)</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.pagesBook}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Complex Words</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.complexWordsCount} ({stats.complexPercentage}%)</div>
            </div>
          </div>

          {/* Readability Details & Formula Metrics */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Readability & Lexical Metrics
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Flesch Reading Ease</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {stats.fleschEase} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Higher score = easier to read</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Flesch-Kincaid Grade</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Grade {stats.gradeLevel}
                </div>
                <p className="text-xs text-slate-500 mt-1">US school grade reading requirement</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Sentence Length</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {stats.avgWordsPerSentence} <span className="text-xs text-slate-400 font-normal">words</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Target 15-20 for standard clarity</p>
              </div>
            </div>
          </div>

          {/* Copyable Blog & Metadata Badges */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                One-Click Blog Badges & Snippets
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any snippet to copy it directly into your Medium post, Substack newsletter, or Markdown document.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Badge 1 */}
              <button
                onClick={() => handleCopyBadge(`⏱️ ${stats.readingDuration.text} read`, 'badge1')}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-medium">Short Badge</span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                    ⏱️ {stats.readingDuration.text} read
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 group-hover:border-indigo-400">
                  {copiedBadge === 'badge1' ? 'Copied!' : 'Copy'}
                </span>
              </button>

              {/* Badge 2 */}
              <button
                onClick={() => handleCopyBadge(`⏱️ ${stats.readingDuration.text} read · ${stats.wordCount.toLocaleString()} words`, 'badge2')}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-medium">With Word Count</span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                    ⏱️ {stats.readingDuration.text} read · {stats.wordCount.toLocaleString()} words
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 group-hover:border-indigo-400">
                  {copiedBadge === 'badge2' ? 'Copied!' : 'Copy'}
                </span>
              </button>

              {/* Markdown */}
              <button
                onClick={() => handleCopyBadge(`*Estimated reading time: ${stats.readingDuration.text} (${stats.wordCount.toLocaleString()} words)*`, 'md')}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-medium">Markdown Snippet</span>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono truncate max-w-[200px]">
                    *Estimated reading time: {stats.readingDuration.text}*
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 group-hover:border-indigo-400">
                  {copiedBadge === 'md' ? 'Copied!' : 'Copy'}
                </span>
              </button>

              {/* HTML Snippet */}
              <button
                onClick={() => handleCopyBadge(`<span class="reading-time">${stats.readingDuration.text} read</span>`, 'html')}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-medium">HTML Tag</span>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono truncate max-w-[200px]">
                    &lt;span class="reading-time"&gt;{stats.readingDuration.text} read&lt;/span&gt;
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 group-hover:border-indigo-400">
                  {copiedBadge === 'html' ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingTimeCalculator;
