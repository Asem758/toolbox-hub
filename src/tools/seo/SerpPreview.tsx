import React, { useState, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Monitor,
  Smartphone,
  Copy,
  Check,
  Star,
  Calendar,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const SerpPreview: React.FC = () => {
  const { showToast } = useToast();

  const [title, setTitle] = useState('10 Best Productivity Tools for High-Performing Teams (2026)');
  const [url, setUrl] = useState('https://toolboxhub.app/blog/best-productivity-tools');
  const [description, setDescription] = useState(
    'Compare the top productivity software in 2026. Detailed feature matrix, pricing benchmarks, workflow automation comparisons, and expert ratings for agile squads.'
  );
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showRating, setShowRating] = useState(true);
  const [ratingScore, setRatingScore] = useState('4.9');
  const [ratingReviews, setRatingReviews] = useState('428');
  const [showDate, setShowDate] = useState(true);
  const [dateString, setDateString] = useState('Aug 12, 2026');
  const [searchQuery, setSearchQuery] = useState('best productivity tools');
  const [copied, setCopied] = useState(false);

  // Approximate Google pixel width estimation (Desktop max ~580px, Mobile max ~360px)
  // Average proportional character pixel widths in Arial/Roboto
  const pixelWidth = useMemo(() => {
    let px = 0;
    for (let i = 0; i < title.length; i++) {
      const char = title[i];
      if (/[MWmQ#@]/.test(char)) px += 13.5;
      else if (/[A-Z]/.test(char)) px += 10.5;
      else if (/[fijltrI.,:;'!]/.test(char)) px += 4.5;
      else if (/[w]/.test(char)) px += 12;
      else px += 8.2;
    }
    return Math.round(px);
  }, [title]);

  const maxPixels = device === 'desktop' ? 580 : 360;
  const isPixelOver = pixelWidth > maxPixels;
  const isTitleLengthGood = title.length >= 45 && title.length <= 60;
  const isDescLengthGood = description.length >= 120 && description.length <= 158;

  // Highlight matching keyword query terms in description/title
  const highlightQuery = (text: string) => {
    if (!searchQuery.trim()) return text;
    const words = searchQuery
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    if (!words.length) return text;
    const regex = new RegExp(`(${words.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  const handleCopyTags = async () => {
    const snippet = `<title>${title}</title>\n<meta name="description" content="${description}" />\n<link rel="canonical" href="${url}" />`;
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    showToast('Copied Title & Meta Description tags', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyPreset = (type: 'blog' | 'ecommerce' | 'saas') => {
    if (type === 'blog') {
      setTitle('15 Proven SEO Strategies to Rank #1 on Google Fast');
      setUrl('https://toolboxhub.app/guides/rank-number-one-google');
      setDescription(
        'Step-by-step masterclass on organic search ranking. Learn keyword research, search intent optimization, technical SEO fixes, and core web vitals.'
      );
      setSearchQuery('seo strategies google');
    } else if (type === 'ecommerce') {
      setTitle('Ultra-Light Wireless Noise Cancelling Headphones | Free Delivery');
      setUrl('https://audiophile.example.com/products/noise-cancelling-pro');
      setDescription(
        'Experience pure acoustic bliss with 45-hour battery life, active hybrid noise cancellation, and memory-foam ear cushions. 30-day money-back guarantee.'
      );
      setSearchQuery('noise cancelling headphones');
    } else {
      setTitle('ToolBox Hub - Free Private Online Tools for Developers & Creators');
      setUrl('https://toolboxhub.app');
      setDescription(
        'Zero-tracking in-browser utilities: image compressors, JSON formatters, QR code creators, unit converters, and security generators. 100% free and fast.'
      );
      setSearchQuery('private online tools');
    }
    showToast(`Loaded ${type.toUpperCase()} preset`, 'info');
  };

  // Truncate title simulation for display
  const truncatedTitle = useMemo(() => {
    if (pixelWidth <= maxPixels) return title;
    let currentPx = 0;
    let truncated = '';
    for (let i = 0; i < title.length; i++) {
      const char = title[i];
      const charPx = /[MWmQ#@]/.test(char)
        ? 13.5
        : /[A-Z]/.test(char)
        ? 10.5
        : /[fijltrI.,:;'!]/.test(char)
        ? 4.5
        : /[w]/.test(char)
        ? 12
        : 8.2;
      if (currentPx + charPx > maxPixels - 25) {
        return truncated + '...';
      }
      currentPx += charPx;
      truncated += char;
    }
    return truncated;
  }, [title, pixelWidth, maxPixels]);

  // Clean URL breadcrumb formatting
  const breadcrumbDisplay = useMemo(() => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/').filter(Boolean);
      return [u.hostname, ...parts].join(' › ');
    } catch {
      return url.replace('https://', '').replace('http://', '');
    }
  }, [url]);

  return (
    <div className="space-y-8">
      {/* Preset Buttons & Device Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Presets:</span>
          <button
            onClick={() => handleApplyPreset('saas')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition-colors"
          >
            SaaS Homepage
          </button>
          <button
            onClick={() => handleApplyPreset('blog')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition-colors"
          >
            Blog Post
          </button>
          <button
            onClick={() => handleApplyPreset('ecommerce')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition-colors"
          >
            E-Commerce Product
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setDevice('desktop')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                device === 'desktop'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                device === 'mobile'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile
            </button>
          </div>

          <button
            onClick={handleCopyTags}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Snippet'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Parameters */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              SERP Snippet Fields
            </h3>

            {/* Target Query */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Search Query (For Keyword Boldness Check)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. best productivity tools"
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>

            {/* SEO Title */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Title Tag</label>
                <span
                  className={`font-mono text-[11px] ${
                    isPixelOver ? 'text-rose-500 font-bold' : isTitleLengthGood ? 'text-emerald-500 font-bold' : 'text-slate-400'
                  }`}
                >
                  {pixelWidth}px / {maxPixels}px ({title.length} chars)
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* URL / Permalinks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Canonical Destination URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Meta Description</label>
                <span
                  className={`font-mono text-[11px] ${
                    isDescLengthGood ? 'text-emerald-500 font-bold' : description.length > 160 ? 'text-amber-500' : 'text-slate-400'
                  }`}
                >
                  {description.length}/160 chars
                </span>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Rich Snippets Toggle */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Rich Snippet Enhancements
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Rating */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={showRating}
                      onChange={(e) => setShowRating(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Star Review Rating</span>
                  </label>
                  {showRating && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ratingScore}
                        onChange={(e) => setRatingScore(e.target.value)}
                        placeholder="4.9"
                        className="w-16 px-2 py-1 rounded text-xs border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-center"
                      />
                      <span className="text-[11px] text-slate-400">({ratingReviews} votes)</span>
                    </div>
                  )}
                </div>

                {/* Published Date */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={showDate}
                      onChange={(e) => setShowDate(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Publication Date</span>
                  </label>
                  {showDate && (
                    <input
                      type="text"
                      value={dateString}
                      onChange={(e) => setDateString(e.target.value)}
                      placeholder="Aug 12, 2026"
                      className="w-full px-2 py-1 rounded text-xs border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Google Search Result Simulator */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Google Search Results Simulator ({device.toUpperCase()})
              </span>
              <span className="text-[11px] text-slate-400">Rendering Arial 18px title font metrics</span>
            </div>

            {/* Google Search Box Simulation */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <Search className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate font-medium">{searchQuery || 'best productivity tools'}</span>
            </div>

            {/* The Actual Simulated Google SERP Entry */}
            <div
              className={`p-5 rounded-2xl border bg-white dark:bg-[#1f1f1f] text-slate-900 dark:text-[#e8eaed] transition-all shadow-xs ${
                device === 'mobile' ? 'max-w-md mx-auto rounded-3xl border-slate-300 dark:border-slate-700 p-4' : 'w-full'
              }`}
            >
              {/* Site URL / Favicon header */}
              <div className="flex items-center gap-2 text-xs mb-1.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  T
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    {breadcrumbDisplay.split(' › ')[0]}
                  </span>
                  <span className="text-[11px] text-[#4d5156] dark:text-[#bdc1c6] truncate max-w-sm leading-tight">
                    {breadcrumbDisplay}
                  </span>
                </div>
              </div>

              {/* Title link */}
              <h3 className="text-base sm:text-[20px] font-normal leading-snug tracking-tight text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer">
                {truncatedTitle}
              </h3>

              {/* Rich snippet stars if enabled */}
              {showRating && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mt-1">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  </div>
                  <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300">
                    Rating: {ratingScore}/5 · {ratingReviews} reviews
                  </span>
                </div>
              )}

              {/* Snippet Description */}
              <p className="text-[13px] sm:text-[14px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed mt-1">
                {showDate && (
                  <span className="text-slate-500 dark:text-slate-400 mr-1.5 font-medium">{dateString} —</span>
                )}
                {highlightQuery(
                  description.length > 158 ? `${description.substring(0, 155)}...` : description
                )}
              </p>
            </div>

            {/* Pixel Gauge & Truncation Warnings */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Title Pixel Density Gauge:</span>
                <span
                  className={`font-mono font-bold ${
                    isPixelOver ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {pixelWidth}px / {maxPixels}px ({Math.round((pixelWidth / maxPixels) * 100)}%)
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isPixelOver ? 'bg-rose-500' : isTitleLengthGood ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, (pixelWidth / maxPixels) * 100)}%` }}
                />
              </div>

              {isPixelOver && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>
                    Your title exceeds the {maxPixels}px Google snippet budget. Google will cut it off with an ellipsis
                    (...) on {device}.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SerpPreview;
