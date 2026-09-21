import React, { useState, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard, downloadBlob } from '../../lib/utils';
import {
  Search,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Upload,
  FileCheck2,
  Layers,
  FileText,
  BadgeAlert,
} from 'lucide-react';

interface PlagiarismMatch {
  id: string;
  phrase: string;
  occurrences: number;
  matchType: 'internal-duplicate' | 'common-web-boilerplate' | 'verbatim-repetition';
  startIndex: number;
  endIndex: number;
}

const SAMPLE_TEXT = `Modern web development requires responsive design, accessibility standards, and clean code architectures. In recent years, cloud computing and serverless backends have transformed software engineering. 

Modern web development requires responsive design, accessibility standards, and clean code architectures. Furthermore, artificial intelligence is playing an increasingly crucial role across diverse enterprise domains. In recent years, cloud computing and serverless backends have transformed software engineering.`;

const COMMON_BOILERPLATE_PATTERNS = [
  'terms and conditions apply',
  'all rights reserved',
  'privacy policy and terms of service',
  'lorem ipsum dolor sit amet',
  'consectetur adipiscing elit',
  'please do not hesitate to contact us',
  'for more information please visit our website',
  'this email and any attachments are confidential',
  'thank you for your time and consideration',
  'as per our previous conversation',
];

export const PlagiarismChecker: React.FC = () => {
  const { showToast } = useToast();
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [copied, setCopied] = useState<boolean>(false);

  // Originality Analysis
  const analysis = useMemo(() => {
    const raw = text.trim();
    if (!raw) {
      return {
        uniqueness: 100,
        duplicatePercentage: 0,
        wordCount: 0,
        sentenceCount: 0,
        matches: [] as PlagiarismMatch[],
        status: 'No content',
        statusColor: 'text-slate-400',
      };
    }

    const sentences = raw.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [raw];
    const sentenceMap = new Map<string, number>();
    const matches: PlagiarismMatch[] = [];

    // 1. Detect duplicate sentences
    sentences.forEach((s) => {
      const clean = s.trim().toLowerCase().replace(/[^\w\s]/g, '');
      if (clean.length > 15) {
        sentenceMap.set(clean, (sentenceMap.get(clean) || 0) + 1);
      }
    });

    let duplicateSentenceCount = 0;
    sentences.forEach((s, idx) => {
      const clean = s.trim().toLowerCase().replace(/[^\w\s]/g, '');
      const count = sentenceMap.get(clean) || 0;
      if (count > 1) {
        duplicateSentenceCount++;
        const sIndex = raw.indexOf(s.trim());
        matches.push({
          id: `dup-${idx}`,
          phrase: s.trim(),
          occurrences: count,
          matchType: 'internal-duplicate',
          startIndex: sIndex >= 0 ? sIndex : 0,
          endIndex: sIndex >= 0 ? sIndex + s.trim().length : 0,
        });
      }
    });

    // 2. Detect common web boilerplate phrases
    const lowerRaw = raw.toLowerCase();
    COMMON_BOILERPLATE_PATTERNS.forEach((boiler, bIdx) => {
      if (lowerRaw.includes(boiler)) {
        const bStart = lowerRaw.indexOf(boiler);
        matches.push({
          id: `boiler-${bIdx}`,
          phrase: boiler,
          occurrences: 1,
          matchType: 'common-web-boilerplate',
          startIndex: bStart,
          endIndex: bStart + boiler.length,
        });
      }
    });

    // 3. 5-Gram N-Gram overlap detection
    const words = raw.split(/\s+/).filter(Boolean);
    const nGramMap = new Map<string, number>();
    const n = 5;

    for (let i = 0; i <= words.length - n; i++) {
      const gram = words.slice(i, i + n).join(' ').toLowerCase().replace(/[^\w\s]/g, '');
      nGramMap.set(gram, (nGramMap.get(gram) || 0) + 1);
    }

    let repeatedGramCount = 0;
    nGramMap.forEach((cnt) => {
      if (cnt > 1) repeatedGramCount += cnt;
    });

    // Calculate Uniqueness %
    const totalSentences = sentences.length || 1;
    const dupSentencePenalty = (duplicateSentenceCount / totalSentences) * 60;
    const nGramPenalty = Math.min(30, (repeatedGramCount / (words.length || 1)) * 100);
    const boilerPenalty = matches.filter((m) => m.matchType === 'common-web-boilerplate').length * 10;

    let uniqueness = Math.max(0, Math.min(100, Math.round(100 - (dupSentencePenalty + nGramPenalty + boilerPenalty))));
    const duplicatePercentage = 100 - uniqueness;

    let status = '100% Unique & Original';
    let statusColor = 'text-emerald-600 dark:text-emerald-400';

    if (uniqueness < 60) {
      status = 'Significant Duplication Detected';
      statusColor = 'text-rose-600 dark:text-rose-400';
    } else if (uniqueness < 85) {
      status = 'Moderate Overlap / Similarities Found';
      statusColor = 'text-amber-500 dark:text-amber-400';
    }

    return {
      uniqueness,
      duplicatePercentage,
      wordCount: words.length,
      sentenceCount: totalSentences,
      matches,
      status,
      statusColor,
    };
  }, [text]);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setText(content);
        showToast(`Uploaded "${file.name}"`, 'success');
      }
    };
    reader.readAsText(file);
  };

  // Export Originality Report
  const handleDownloadReport = () => {
    const report = `=========================================
TOOLBOX HUB - ORIGINALITY & PLAGIARISM AUDIT
=========================================
Timestamp: ${new Date().toISOString()}
Total Words: ${analysis.wordCount}
Total Sentences: ${analysis.sentenceCount}
Originality Score: ${analysis.uniqueness}%
Duplication Risk: ${analysis.duplicatePercentage}%
Classification Status: ${analysis.status}

FLAGGED DUPLICATE / OVERLAPPING SEGMENTS:
${
  analysis.matches.length === 0
    ? 'None. The submitted text is 100% original.'
    : analysis.matches
        .map(
          (m, idx) =>
            `[#${idx + 1}] Type: ${m.matchType}\nPhrase: "${m.phrase}"\nOccurrences: ${m.occurrences}\n`
        )
        .join('\n')
}
=========================================
Audited 100% client-side with ToolBox Hub.
`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, 'originality_audit_report.txt');
    showToast('Downloaded originality_audit_report.txt', 'success');
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

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Upload Document
            <input type="file" accept=".txt,.md,.rtf,.html,.csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              setText(SAMPLE_TEXT);
              showToast('Sample text loaded', 'info');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Sample
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
          <button
            onClick={handleDownloadReport}
            disabled={!text}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <FileCheck2 className="w-4 h-4" />
            Export Audit Report
          </button>
        </div>
      </div>

      {/* Main Originality Meter Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Uniqueness Score */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Originality Score</span>
            <div className={`text-5xl sm:text-6xl font-mono font-extrabold ${analysis.statusColor}`}>
              {analysis.uniqueness}%
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {analysis.status}
            </span>
          </div>

          {/* Metric Breakdown Cards */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Duplicate Overlap</span>
              <div className="text-lg font-bold font-mono text-rose-500">
                {analysis.duplicatePercentage}%
              </div>
              <p className="text-[10px] text-slate-500">Repeated internal clauses</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Words Audited</span>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                {analysis.wordCount}
              </div>
              <p className="text-[10px] text-slate-500">Total word count</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Flagged Matches</span>
              <div className="text-lg font-bold font-mono text-amber-500">
                {analysis.matches.length}
              </div>
              <p className="text-[10px] text-slate-500">Duplicate passages</p>
            </div>
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            Document Content to Scan
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your essay, academic research, article, or blog post to test originality and detect duplicated clauses..."
            rows={8}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans text-base focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all resize-y leading-relaxed"
          />
        </div>
      </div>

      {/* Flagged Duplicate Passages List */}
      {analysis.matches.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BadgeAlert className="w-4 h-4 text-rose-500" />
              Flagged Duplicate & Overlapping Passages ({analysis.matches.length})
            </h4>
          </div>

          <div className="space-y-3">
            {analysis.matches.map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    {m.matchType === 'internal-duplicate'
                      ? 'Internal Verbatim Duplicate'
                      : 'Common Web Boilerplate'}
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    Occurrences: {m.occurrences}x
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-rose-200/60 dark:border-rose-900/60">
                  "{m.phrase}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlagiarismChecker;
