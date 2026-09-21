import React, { useState, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard, downloadBlob } from '../../lib/utils';
import {
  FileText,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Download,
  Upload,
  Sliders,
  CheckCheck,
  AlignLeft,
  ArrowRight,
} from 'lucide-react';

const SAMPLE_RICH_TEXT = `“Welcome to ToolBox Hub!” — The world’s leading web utilities platform.
• Feature 1: Lossless image & PDF processing
• Feature 2: High-entropy cryptographic random generation
• Feature 3: Full Unicode & emoji support 🚀🔥

    This paragraph has irregular leading spaces, non-breaking spaces and multiple blank lines.


It also contains ’curly quotes’ and “smart double quotes” that break JSON or code parsers.`;

export const PlainTextConverter: React.FC = () => {
  const { showToast } = useToast();
  const [inputText, setInputText] = useState<string>(SAMPLE_RICH_TEXT);
  const [copied, setCopied] = useState<boolean>(false);

  // Conversion toggles
  const [convertSmartQuotes, setConvertSmartQuotes] = useState<boolean>(true);
  const [convertSmartDashes, setConvertSmartDashes] = useState<boolean>(true);
  const [normalizeBullets, setNormalizeBullets] = useState<boolean>(true);
  const [stripEmojis, setStripEmojis] = useState<boolean>(false);
  const [stripHtmlTags, setStripHtmlTags] = useState<boolean>(true);
  const [normalizeWhitespace, setNormalizeWhitespace] = useState<boolean>(true);
  const [removeDuplicateBlankLines, setRemoveDuplicateBlankLines] = useState<boolean>(true);
  const [trimLines, setTrimLines] = useState<boolean>(true);
  const [lineBreakMode, setLineBreakMode] = useState<'keep' | 'single' | 'crlf'>('keep');

  // Conversion engine
  const plainText = useMemo(() => {
    let text = inputText;
    if (!text) return '';

    // 1. Strip HTML tags
    if (stripHtmlTags) {
      text = text.replace(/<[^>]+>/g, '');
    }

    // 2. Convert Smart / Curly Quotes to standard ASCII quotes
    if (convertSmartQuotes) {
      text = text
        .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
        .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
        .replace(/«|»/g, '"');
    }

    // 3. Convert Smart Dashes (em-dash, en-dash, figure dash) to standard hyphens
    if (convertSmartDashes) {
      text = text.replace(/[\u2013\u2014\u2015\u2012]/g, '-');
    }

    // 4. Normalize Bullets to standard hyphen or clean character
    if (normalizeBullets) {
      text = text.replace(/^[\s]*[•◦⁃▶★▪▫◆◇]\s*/gm, '- ');
    }

    // 5. Strip Emojis
    if (stripEmojis) {
      text = text.replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        ''
      );
    }

    // 6. Normalize Unicode Whitespace (non-breaking space, zero-width space, etc.)
    if (normalizeWhitespace) {
      text = text
        .replace(/[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000\uFEFF]/g, ' ')
        .replace(/[\u200B-\u200D]/g, ''); // strip zero-width spaces
      text = text.replace(/[ \t]+/g, ' '); // collapse consecutive spaces
    }

    // 7. Trim lines
    if (trimLines) {
      text = text
        .split('\n')
        .map((line) => line.trim())
        .join('\n');
    }

    // 8. Remove duplicate blank lines
    if (removeDuplicateBlankLines) {
      text = text.replace(/\n{3,}/g, '\n\n');
    }

    // 9. Line break handling
    if (lineBreakMode === 'single') {
      text = text.replace(/\n+/g, ' ').trim();
    } else if (lineBreakMode === 'crlf') {
      text = text.replace(/\r?\n/g, '\r\n');
    }

    return text.trim();
  }, [
    inputText,
    convertSmartQuotes,
    convertSmartDashes,
    normalizeBullets,
    stripEmojis,
    stripHtmlTags,
    normalizeWhitespace,
    removeDuplicateBlankLines,
    trimLines,
    lineBreakMode,
  ]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
        showToast(`Loaded "${file.name}"`, 'success');
      }
    };
    reader.readAsText(file);
  };

  // Download converted text as .txt
  const handleDownload = () => {
    if (!plainText) return;
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, 'clean_plain_text.txt');
    showToast('Downloaded clean_plain_text.txt', 'success');
  };

  // Copy text
  const handleCopy = async () => {
    if (!plainText) return;
    const ok = await copyToClipboard(plainText);
    if (ok) {
      setCopied(true);
      showToast('Plain text copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inputCharCount = inputText.length;
  const outputCharCount = plainText.length;
  const inputLines = inputText ? inputText.split('\n').length : 0;
  const outputLines = plainText ? plainText.split('\n').length : 0;

  return (
    <div className="space-y-6">
      {/* Top Header Deck */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Upload File
            <input type="file" accept=".txt,.md,.rtf,.html,.csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              setInputText(SAMPLE_RICH_TEXT);
              showToast('Sample rich text loaded', 'info');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Sample
          </button>

          <button
            onClick={() => setInputText('')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={!plainText}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Download .txt
          </button>

          <button
            onClick={handleCopy}
            disabled={!plainText}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Plain Text'}
          </button>
        </div>
      </div>

      {/* Formatting & Conversion Options */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-500" />
          Text Cleaning & Sanitization Options
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={convertSmartQuotes}
              onChange={(e) => setConvertSmartQuotes(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>Quotes (“ ” ‘ ’ → " ')</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={convertSmartDashes}
              onChange={(e) => setConvertSmartDashes(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>Dashes (— – → -)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={normalizeBullets}
              onChange={(e) => setNormalizeBullets(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>Normalize Bullets (• → -)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={normalizeWhitespace}
              onChange={(e) => setNormalizeWhitespace(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>Normalize Spaces & Tabs</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={trimLines}
              onChange={(e) => setTrimLines(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>Trim Line Whitespace</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={removeDuplicateBlankLines}
              onChange={(e) => setRemoveDuplicateBlankLines(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>Remove Blank Lines</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={stripHtmlTags}
              onChange={(e) => setStripHtmlTags(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>Strip HTML & Markdown</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={stripEmojis}
              onChange={(e) => setStripEmojis(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>Strip Emojis 🚀</span>
          </label>
        </div>
      </div>

      {/* Main Dual Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Text */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Raw / Formatted Input
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {inputCharCount} chars &bull; {inputLines} lines
              </span>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste formatted rich text, copy-pasted documents, or articles..."
              rows={14}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all resize-y leading-relaxed"
            />
          </div>
        </div>

        {/* Right: Clean Plain Text Output */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <CheckCheck className="w-4 h-4" />
                Clean Plain Text Output
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {outputCharCount} chars &bull; {outputLines} lines
              </span>
            </div>

            <textarea
              readOnly
              value={plainText}
              rows={14}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-hidden resize-y leading-relaxed select-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlainTextConverter;
