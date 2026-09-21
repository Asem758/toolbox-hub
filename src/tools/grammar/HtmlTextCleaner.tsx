import React, { useState, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard } from '../../lib/utils';
import {
  Code2,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Eye,
  FileCode,
  Sliders,
  Trash2,
  Minimize2,
  FileText,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';

const SAMPLE_HTML = `<div class="hero-section" id="banner-102" style="background-color: #f8fafc; padding: 20px; font-family: Arial, sans-serif;">
  <!-- Main Header Banner -->
  <h1 style="color: #1e293b; font-size: 28px; margin-bottom: 10px;">Welcome to <span style="font-weight: bold; color: #4f46e5;">ToolBox Hub</span>!</h1>
  <script type="text/javascript">console.log("analytics tracking loaded");</script>
  <p class="description" style="line-height: 1.6; color: #64748b;">
    Here is a paragraph with messy inline CSS styles, &amp; HTML entities like &quot;quotes&quot; &amp; &nbsp;&nbsp; extra spaces.
  </p>
  <p></p>
  <ul style="margin: 15px 0;">
    <li style="color: #334155;">Lossless client-side image compression</li>
    <li style="color: #334155;">Cryptographic random token generator</li>
  </ul>
  <iframe src="https://example.com/embed" style="border:none;"></iframe>
</div>`;

export const HtmlTextCleaner: React.FC = () => {
  const { showToast } = useToast();
  const [inputHtml, setInputHtml] = useState<string>(SAMPLE_HTML);
  const [activeTab, setActiveTab] = useState<'clean' | 'preview'>('clean');
  const [copied, setCopied] = useState<boolean>(false);

  // Configuration options
  const [stripAllTags, setStripAllTags] = useState<boolean>(false);
  const [stripInlineStyles, setStripInlineStyles] = useState<boolean>(true);
  const [stripClassesAndIds, setStripClassesAndIds] = useState<boolean>(true);
  const [stripScriptsAndStyles, setStripScriptsAndStyles] = useState<boolean>(true);
  const [stripComments, setStripComments] = useState<boolean>(true);
  const [stripIframes, setStripIframes] = useState<boolean>(true);
  const [removeEmptyTags, setRemoveEmptyTags] = useState<boolean>(true);
  const [decodeEntities, setDecodeEntities] = useState<boolean>(true);
  const [formatHtml, setFormatHtml] = useState<boolean>(true);

  // Entity decoder helper
  const decodeHtmlEntities = (str: string): string => {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&copy;/g, '©')
      .replace(/&reg;/g, '®')
      .replace(/&trade;/g, '™');
  };

  // Cleaning engine
  const cleanedHtml = useMemo(() => {
    let clean = inputHtml;
    if (!clean.trim()) return '';

    // 1. Strip script and style blocks entirely
    if (stripScriptsAndStyles) {
      clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    }

    // 2. Strip iframes
    if (stripIframes) {
      clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    }

    // 3. Strip HTML comments
    if (stripComments) {
      clean = clean.replace(/<!--[\s\S]*?-->/g, '');
    }

    // 4. If Strip All Tags is active, convert directly to clean plain text
    if (stripAllTags) {
      clean = clean.replace(/<br\s*[\/]?>/gi, '\n');
      clean = clean.replace(/<\/p>/gi, '\n\n');
      clean = clean.replace(/<\/li>/gi, '\n');
      clean = clean.replace(/<\/h[1-6]>/gi, '\n\n');
      clean = clean.replace(/<\/div>/gi, '\n');
      clean = clean.replace(/<[^>]+>/g, '');
      if (decodeEntities) {
        clean = decodeHtmlEntities(clean);
      }
      return clean
        .split('\n')
        .map((line) => line.trim())
        .filter((line, i, arr) => line !== '' || (i > 0 && arr[i - 1] !== ''))
        .join('\n')
        .trim();
    }

    // 5. Strip inline style attributes
    if (stripInlineStyles) {
      clean = clean.replace(/\s*style\s*=\s*(['"]).*?\1/gi, '');
    }

    // 6. Strip class and id attributes
    if (stripClassesAndIds) {
      clean = clean.replace(/\s*class\s*=\s*(['"]).*?\1/gi, '');
      clean = clean.replace(/\s*id\s*=\s*(['"]).*?\1/gi, '');
    }

    // 7. Decode entities
    if (decodeEntities) {
      clean = decodeHtmlEntities(clean);
    }

    // 8. Remove empty tags like <p></p>, <div></div>, <span></span>
    if (removeEmptyTags) {
      clean = clean.replace(/<([a-z1-6]+)\b[^>]*>([\s\u00A0]*?)<\/\1>/gi, '');
      clean = clean.replace(/<([a-z1-6]+)\b[^>]*>([\s\u00A0]*?)<\/\1>/gi, ''); // second pass
    }

    // 9. Format indentation
    if (formatHtml) {
      let formatted = '';
      let indent = 0;
      const tab = '  ';

      clean
        .replace(/>\s*</g, '>\n<')
        .split('\n')
        .forEach((element) => {
          const trimmed = element.trim();
          if (!trimmed) return;

          if (trimmed.match(/^<\/\w/)) {
            indent = Math.max(0, indent - 1);
          }

          formatted += tab.repeat(indent) + trimmed + '\n';

          if (
            trimmed.match(/^<\w[^>]*[^\/]>.*$/) &&
            !trimmed.startsWith('<!--') &&
            !trimmed.match(/<(img|hr|br|input|meta|link)[^>]*>/) &&
            !trimmed.match(/^<([a-z1-6]+)[^>]*>.*<\/\1>$/)
          ) {
            indent++;
          }
        });

      clean = formatted.trim();
    }

    return clean;
  }, [
    inputHtml,
    stripAllTags,
    stripInlineStyles,
    stripClassesAndIds,
    stripScriptsAndStyles,
    stripComments,
    stripIframes,
    removeEmptyTags,
    decodeEntities,
    formatHtml,
  ]);

  // Statistics
  const originalSize = new Blob([inputHtml]).size;
  const cleanedSize = new Blob([cleanedHtml]).size;
  const reduction = originalSize > 0 ? Math.round(((originalSize - cleanedSize) / originalSize) * 100) : 0;

  // Copy cleaned HTML
  const handleCopy = async () => {
    if (!cleanedHtml) return;
    const ok = await copyToClipboard(cleanedHtml);
    if (ok) {
      setCopied(true);
      showToast('Cleaned HTML copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Deck & Presets */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setInputHtml(SAMPLE_HTML);
              showToast('Sample HTML loaded', 'info');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Load Sample
          </button>
          <button
            onClick={() => setInputHtml('')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!cleanedHtml}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Clean Code' : 'Copy Output'}
          </button>
        </div>
      </div>

      {/* Cleaning Rule Toggles Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-500" />
          Cleaning Configuration & Filters
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={stripInlineStyles}
              onChange={(e) => setStripInlineStyles(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>Strip Inline Styles</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={stripClassesAndIds}
              onChange={(e) => setStripClassesAndIds(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>Strip Class & ID</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={stripScriptsAndStyles}
              onChange={(e) => setStripScriptsAndStyles(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>Remove Scripts & CSS</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={stripComments}
              onChange={(e) => setStripComments(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>Remove Comments</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={stripIframes}
              onChange={(e) => setStripIframes(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>Remove Iframes</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={removeEmptyTags}
              onChange={(e) => setRemoveEmptyTags(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>Remove Empty Tags</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={decodeEntities}
              onChange={(e) => setDecodeEntities(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>Decode HTML Entities</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={stripAllTags}
              onChange={(e) => setStripAllTags(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
            />
            <span className="font-bold text-rose-600 dark:text-rose-400">Extract Plain Text Only</span>
          </label>
        </div>
      </div>

      {/* Main Dual Workspace: Raw Input vs Cleaned Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Raw HTML */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-500" />
                Raw HTML Input
              </label>
              <span className="text-xs text-slate-400 font-mono">{originalSize} bytes</span>
            </div>

            <textarea
              value={inputHtml}
              onChange={(e) => setInputHtml(e.target.value)}
              placeholder="Paste raw HTML, WordPress/CMS code, or web page source code here..."
              rows={14}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all resize-y leading-relaxed"
            />
          </div>
        </div>

        {/* Right Col: Cleaned Output & Live Preview Tabs */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('clean')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'clean'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  Clean HTML Code
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Rendered Preview
                </button>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                {cleanedSize} bytes ({reduction > 0 ? `-${reduction}%` : '0%'})
              </span>
            </div>

            {activeTab === 'clean' ? (
              <textarea
                readOnly
                value={cleanedHtml}
                rows={14}
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-hidden resize-y leading-relaxed select-all"
              />
            ) : (
              <div
                className="w-full p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans text-sm min-h-[290px] overflow-y-auto leading-relaxed"
                dangerouslySetInnerHTML={{ __html: cleanedHtml }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HtmlTextCleaner;
