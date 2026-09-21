import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Copy,
  Check,
  Download,
  Share2,
  Globe,
  Monitor,
  Smartphone,
  Eye,
  Code2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface MetaData {
  title: string;
  description: string;
  keywords: string;
  author: string;
  canonicalUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  viewport: string;
  themeColor: string;
  // Open Graph
  ogType: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogSiteName: string;
  // Twitter Card
  twitterCard: 'summary' | 'summary_large_image';
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterCreator: string;
}

const DEFAULT_META: MetaData = {
  title: 'ToolBox Hub - Free & Private All-in-One Online Tools',
  description: 'Fast, secure in-browser tools: QR code generators, image compression, JSON formatters, calculators, and SEO utilities with zero data collection.',
  keywords: 'online tools, seo generator, open graph generator, meta tags, image compressor',
  author: 'ToolBox Hub Team',
  canonicalUrl: 'https://toolboxhub.app',
  robotsIndex: true,
  robotsFollow: true,
  viewport: 'width=device-width, initial-scale=1.0',
  themeColor: '#4f46e5',
  ogType: 'website',
  ogTitle: '',
  ogDescription: '',
  ogImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&q=80',
  ogSiteName: 'ToolBox Hub',
  twitterCard: 'summary_large_image',
  twitterTitle: '',
  twitterDescription: '',
  twitterImage: '',
  twitterCreator: '@toolboxhub',
};

export const MetaTagGenerator: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<MetaData>(DEFAULT_META);
  const [previewTab, setPreviewTab] = useState<'google' | 'facebook' | 'twitter' | 'code'>('google');
  const [googleDevice, setGoogleDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  // Sync helpers
  const ogTitle = data.ogTitle || data.title;
  const ogDesc = data.ogDescription || data.description;
  const twitterTitle = data.twitterTitle || ogTitle;
  const twitterDesc = data.twitterDescription || ogDesc;
  const twitterImg = data.twitterImage || data.ogImage;

  // Character lengths & pixel calculation estimates
  const titleCharCount = data.title.length;
  const descCharCount = data.description.length;
  const isTitleOptimal = titleCharCount >= 40 && titleCharCount <= 60;
  const isDescOptimal = descCharCount >= 120 && descCharCount <= 160;

  const generateHtmlCode = () => {
    const robots = `${data.robotsIndex ? 'index' : 'noindex'}, ${data.robotsFollow ? 'follow' : 'nofollow'}`;

    return `<!-- Primary Meta Tags -->
<title>${data.title}</title>
<meta name="title" content="${data.title}" />
<meta name="description" content="${data.description}" />
${data.keywords ? `<meta name="keywords" content="${data.keywords}" />\n` : ''}${data.author ? `<meta name="author" content="${data.author}" />\n` : ''}<meta name="robots" content="${robots}" />
<meta name="viewport" content="${data.viewport}" />
${data.themeColor ? `<meta name="theme-color" content="${data.themeColor}" />\n` : ''}${data.canonicalUrl ? `<link rel="canonical" href="${data.canonicalUrl}" />\n` : ''}
<!-- Open Graph / Facebook -->
<meta property="og:type" content="${data.ogType}" />
<meta property="og:url" content="${data.canonicalUrl || 'https://yourwebsite.com'}" />
<meta property="og:title" content="${ogTitle}" />
<meta property="og:description" content="${ogDesc}" />
${data.ogImage ? `<meta property="og:image" content="${data.ogImage}" />\n` : ''}${data.ogSiteName ? `<meta property="og:site_name" content="${data.ogSiteName}" />\n` : ''}
<!-- Twitter -->
<meta name="twitter:card" content="${data.twitterCard}" />
<meta name="twitter:url" content="${data.canonicalUrl || 'https://yourwebsite.com'}" />
<meta name="twitter:title" content="${twitterTitle}" />
<meta name="twitter:description" content="${twitterDesc}" />
${twitterImg ? `<meta name="twitter:image" content="${twitterImg}" />\n` : ''}${data.twitterCreator ? `<meta name="twitter:creator" content="${data.twitterCreator}" />` : ''}`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generateHtmlCode());
      setCopied(true);
      showToast('HTML Meta Tags copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([generateHtmlCode()], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meta-tags.html';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded meta-tags.html', 'success');
  };

  const handleFillSample = () => {
    setData({
      title: 'Modern Coffee Maker - Brew Barista-Grade Espresso at Home',
      description: 'Discover the precision-crafted thermal espresso machine. PID temperature control, stainless steel dual boiler, and instant pre-infusion for perfect daily coffee.',
      keywords: 'espresso machine, coffee maker, barista coffee, home espresso, kitchen appliance',
      author: 'BrewTech Studios',
      canonicalUrl: 'https://brewtech.example.com/espresso-machine',
      robotsIndex: true,
      robotsFollow: true,
      viewport: 'width=device-width, initial-scale=1.0',
      themeColor: '#0f172a',
      ogType: 'product',
      ogTitle: 'Modern Coffee Maker | Brew Barista-Grade Espresso at Home',
      ogDescription: 'Precision dual-boiler espresso machine engineered for coffee enthusiasts.',
      ogImage: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=1200&h=630&fit=crop&q=80',
      ogSiteName: 'BrewTech',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Modern Coffee Maker - Dual Boiler Espresso',
      twitterDescription: 'Experience café-quality espresso in your kitchen with BrewTech.',
      twitterImage: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=1200&h=630&fit=crop&q=80',
      twitterCreator: '@brewtech',
    });
    showToast('Loaded sample product metadata', 'info');
  };

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={handleFillSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample Data
          </button>
          <button
            onClick={() => setData(DEFAULT_META)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Tags' : 'Copy HTML Tags'}
          </button>
          <button
            onClick={handleDownloadHtml}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
          >
            <Download className="w-3.5 h-3.5" />
            Export HTML
          </button>
        </div>
      </div>

      {/* Main Grid: Left Editor Forms, Right Live Social & SERP Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Inputs */}
        <div className="lg:col-span-6 space-y-6">
          {/* Primary Meta Section */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Primary Search Engine Meta Tags
            </h3>

            {/* Page Title */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Page Title <span className="text-rose-500">*</span>
                </label>
                <span
                  className={`font-mono text-[11px] ${
                    isTitleOptimal
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : titleCharCount > 60
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {titleCharCount}/60 chars {titleCharCount > 60 ? '(Will Truncate)' : ''}
                </span>
              </div>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                placeholder="e.g. Best Running Shoes 2026 - Ultimate Buyer's Guide"
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    titleCharCount > 60
                      ? 'bg-amber-500'
                      : isTitleOptimal
                      ? 'bg-emerald-500'
                      : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, (titleCharCount / 60) * 100)}%` }}
                />
              </div>
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Meta Description <span className="text-rose-500">*</span>
                </label>
                <span
                  className={`font-mono text-[11px] ${
                    isDescOptimal
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : descCharCount > 160
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {descCharCount}/160 chars
                </span>
              </div>
              <textarea
                rows={3}
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                placeholder="A concise, compelling summary of the page content that encourages search engine users to click through."
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Canonical URL & Keywords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={data.canonicalUrl}
                  onChange={(e) => setData({ ...data, canonicalUrl: e.target.value })}
                  placeholder="https://example.com/page"
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meta Keywords (Optional)
                </label>
                <input
                  type="text"
                  value={data.keywords}
                  onChange={(e) => setData({ ...data, keywords: e.target.value })}
                  placeholder="shoes, running, marathon"
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Indexing Robots Controls */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Robots Directives:</span>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.robotsIndex}
                    onChange={(e) => setData({ ...data, robotsIndex: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Index (Allow SERP)</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.robotsFollow}
                    onChange={(e) => setData({ ...data, robotsFollow: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Follow (Crawl Links)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Open Graph & Social Media */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-pink-500" />
              Social Media Open Graph & Twitter Cards
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Featured Social Share Image URL (1200x630px Recommended)
              </label>
              <input
                type="url"
                value={data.ogImage}
                onChange={(e) => setData({ ...data, ogImage: e.target.value })}
                placeholder="https://example.com/images/og-banner.jpg"
                className="w-full px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Site Name (og:site_name)
                </label>
                <input
                  type="text"
                  value={data.ogSiteName}
                  onChange={(e) => setData({ ...data, ogSiteName: e.target.value })}
                  placeholder="e.g. MyBrand"
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Twitter Card Format
                </label>
                <select
                  value={data.twitterCard}
                  onChange={(e) =>
                    setData({ ...data, twitterCard: e.target.value as 'summary' | 'summary_large_image' })
                  }
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="summary_large_image">Large Image Card (Recommended)</option>
                  <option value="summary">Compact Summary Card</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Author / Publisher
                </label>
                <input
                  type="text"
                  value={data.author}
                  onChange={(e) => setData({ ...data, author: e.target.value })}
                  placeholder="Author Name"
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Twitter Handle
                </label>
                <input
                  type="text"
                  value={data.twitterCreator}
                  onChange={(e) => setData({ ...data, twitterCreator: e.target.value })}
                  placeholder="@handle"
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Visual Previews */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            {/* Tab navigation */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPreviewTab('google')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    previewTab === 'google'
                      ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Google SERP
                </button>
                <button
                  onClick={() => setPreviewTab('facebook')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    previewTab === 'facebook'
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Facebook / LinkedIn
                </button>
                <button
                  onClick={() => setPreviewTab('twitter')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    previewTab === 'twitter'
                      ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Twitter / X
                </button>
                <button
                  onClick={() => setPreviewTab('code')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    previewTab === 'code'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  HTML Code
                </button>
              </div>

              {previewTab === 'google' && (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setGoogleDevice('desktop')}
                    className={`p-1 rounded ${
                      googleDevice === 'desktop' ? 'bg-white dark:bg-slate-700 shadow-xs text-indigo-600' : 'text-slate-400'
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setGoogleDevice('mobile')}
                    className={`p-1 rounded ${
                      googleDevice === 'mobile' ? 'bg-white dark:bg-slate-700 shadow-xs text-indigo-600' : 'text-slate-400'
                    }`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Google SERP Preview Box */}
            {previewTab === 'google' && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border bg-white dark:bg-slate-950 transition-all ${
                    googleDevice === 'mobile' ? 'max-w-sm mx-auto shadow-md' : 'w-full'
                  }`}
                >
                  {/* Google search result format */}
                  <div className="space-y-1.5 text-left font-sans">
                    <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">
                        T
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-slate-800 dark:text-slate-200 leading-none">
                          {data.ogSiteName || 'toolboxhub.app'}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                          {data.canonicalUrl || 'https://toolboxhub.app/tools/seo'}
                        </span>
                      </div>
                    </div>

                    <a
                      href="#preview"
                      onClick={(e) => e.preventDefault()}
                      className="block text-[#1a0dab] dark:text-[#8ab4f8] hover:underline text-base sm:text-lg font-medium leading-snug tracking-normal pt-1"
                    >
                      {data.title.length > 60 ? `${data.title.substring(0, 57)}...` : data.title || 'Page Title'}
                    </a>

                    <p className="text-[13px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed pt-0.5">
                      {data.description.length > 160
                        ? `${data.description.substring(0, 155)}...`
                        : data.description || 'Meta description will be displayed here as it appears on Google.'}
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div
                    className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                      isTitleOptimal
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {isTitleOptimal ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    )}
                    <div>
                      <div className="font-bold">Title Length: {titleCharCount}/60</div>
                      <div className="text-[11px] opacity-85">
                        {isTitleOptimal
                          ? 'Optimal length for Google SERP'
                          : titleCharCount > 60
                          ? 'May get clipped by Google'
                          : 'Too short, consider adding keywords'}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                      isDescOptimal
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {isDescOptimal ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    )}
                    <div>
                      <div className="font-bold">Description: {descCharCount}/160</div>
                      <div className="text-[11px] opacity-85">
                        {isDescOptimal
                          ? 'Optimal length for search snippets'
                          : descCharCount > 160
                          ? 'Exceeds recommended 160 chars'
                          : 'Under 120 chars, add more details'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Facebook / LinkedIn Social Share Card Preview */}
            {previewTab === 'facebook' && (
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm max-w-md mx-auto">
                  {data.ogImage ? (
                    <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={data.ogImage}
                        alt="OG Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-mono">
                      No Image URL specified (1200x630)
                    </div>
                  )}

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                      {data.canonicalUrl ? new URL(data.canonicalUrl).hostname : 'toolboxhub.app'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {ogTitle || 'Add a page title'}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {ogDesc || 'Add a meta description to see how it renders on Facebook & LinkedIn.'}
                    </p>
                  </div>
                </div>
                <p className="text-center text-xs text-slate-400">Simulates standard Open Graph 1.91:1 ratio card</p>
              </div>
            )}

            {/* Twitter / X Card Preview */}
            {previewTab === 'twitter' && (
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm max-w-md mx-auto">
                  {data.twitterCard === 'summary_large_image' ? (
                    <>
                      {twitterImg ? (
                        <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <img
                            src={twitterImg}
                            alt="Twitter Card"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-36 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-mono">
                          Image preview (Large Image Card)
                        </div>
                      )}
                      <div className="p-3.5 space-y-1 bg-white dark:bg-slate-900">
                        <span className="text-[11px] text-slate-400">
                          {data.canonicalUrl ? new URL(data.canonicalUrl).hostname : 'toolboxhub.app'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {twitterTitle}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {twitterDesc}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 flex items-center gap-3">
                      {twitterImg && (
                        <img
                          src={twitterImg}
                          alt="Twitter summary"
                          referrerPolicy="no-referrer"
                          className="w-20 h-20 rounded-xl object-cover shrink-0"
                        />
                      )}
                      <div className="min-w-0 space-y-1">
                        <span className="text-[10px] text-slate-400 block truncate">
                          {data.canonicalUrl ? new URL(data.canonicalUrl).hostname : 'toolboxhub.app'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {twitterTitle}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {twitterDesc}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-center text-xs text-slate-400">
                  Twitter {data.twitterCard === 'summary_large_image' ? 'Summary Large Image' : 'Compact Summary'} Preview
                </p>
              </div>
            )}

            {/* Generated Code View */}
            {previewTab === 'code' && (
              <div className="space-y-3">
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto max-h-96 leading-relaxed">
                    {generateHtmlCode()}
                  </pre>
                  <button
                    onClick={handleCopyCode}
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-indigo-600 text-white text-[11px] font-semibold hover:bg-indigo-700 transition-colors shadow"
                  >
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default MetaTagGenerator;
