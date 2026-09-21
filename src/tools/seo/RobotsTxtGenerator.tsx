import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface RuleBlock {
  id: string;
  userAgent: string;
  disallows: string[];
  allows: string[];
  crawlDelay?: string;
}

export const RobotsTxtGenerator: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'robots' | 'sitemap'>('robots');

  // Robots.txt state
  const [sitemapUrl, setSitemapUrl] = useState('https://example.com/sitemap.xml');
  const [hostUrl, setHostUrl] = useState('https://example.com');
  const [rules, setRules] = useState<RuleBlock[]>([
    {
      id: '1',
      userAgent: '*',
      disallows: ['/admin/', '/private/', '/api/', '/checkout/'],
      allows: ['/api/public/', '/blog/'],
      crawlDelay: '',
    },
  ]);
  const [blockAiBots, setBlockAiBots] = useState(false);
  const [copiedRobots, setCopiedRobots] = useState(false);

  // Sitemap generator state
  const [sitemapBaseUrl, setSitemapBaseUrl] = useState('https://example.com');
  const [sitemapUrlsText, setSitemapUrlsText] = useState(
    '/\n/about\n/pricing\n/blog\n/blog/best-seo-tools\n/contact'
  );
  const [changefreq, setChangefreq] = useState('weekly');
  const [priority, setPriority] = useState('0.8');
  const [copiedSitemap, setCopiedSitemap] = useState(false);

  // Generate Robots.txt Output
  const generateRobotsTxt = (): string => {
    let lines: string[] = [];
    lines.push('# ========================================================');
    lines.push('# Robots.txt created with ToolBox Hub SEO Generator');
    lines.push('# ========================================================\n');

    rules.forEach((rule) => {
      lines.push(`User-agent: ${rule.userAgent.trim() || '*'}`);
      if (rule.crawlDelay && rule.crawlDelay.trim()) {
        lines.push(`Crawl-delay: ${rule.crawlDelay.trim()}`);
      }
      rule.disallows.forEach((d) => {
        if (d.trim()) lines.push(`Disallow: ${d.trim()}`);
      });
      rule.allows.forEach((a) => {
        if (a.trim()) lines.push(`Allow: ${a.trim()}`);
      });
      lines.push('');
    });

    if (blockAiBots) {
      lines.push('# Block AI Data Scrapers & LLM Training Crawlers');
      const aiBots = ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'ClaudeBot', 'Google-Extended', 'Bytespider'];
      aiBots.forEach((bot) => {
        lines.push(`User-agent: ${bot}`);
        lines.push('Disallow: /');
        lines.push('');
      });
    }

    if (sitemapUrl.trim()) {
      lines.push(`Sitemap: ${sitemapUrl.trim()}`);
    }
    if (hostUrl.trim()) {
      lines.push(`Host: ${hostUrl.trim()}`);
    }

    return lines.join('\n');
  };

  // Generate Sitemap XML Output
  const generateSitemapXml = (): string => {
    const today = new Date().toISOString().split('T')[0];
    const rawPaths = sitemapUrlsText
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const base = sitemapBaseUrl.replace(/\/$/, '');
    const urlElements = rawPaths.map((p) => {
      const cleanPath = p.startsWith('/') ? p : `/${p}`;
      const full = `${base}${cleanPath}`;
      return `  <url>
    <loc>${full}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${cleanPath === '/' ? '1.0' : priority}</priority>
  </url>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements.join('\n')}
</urlset>`;
  };

  const handleApplyPreset = (type: 'allow-all' | 'block-all' | 'wordpress' | 'ecommerce') => {
    if (type === 'allow-all') {
      setRules([
        {
          id: '1',
          userAgent: '*',
          disallows: [],
          allows: ['/'],
          crawlDelay: '',
        },
      ]);
      setBlockAiBots(false);
    } else if (type === 'block-all') {
      setRules([
        {
          id: '1',
          userAgent: '*',
          disallows: ['/'],
          allows: [],
          crawlDelay: '',
        },
      ]);
    } else if (type === 'wordpress') {
      setRules([
        {
          id: '1',
          userAgent: '*',
          disallows: ['/wp-admin/', '/wp-includes/', '/trackback/', '/xmlrpc.php', '/feed/'],
          allows: ['/wp-admin/admin-ajax.php', '/wp-content/uploads/'],
          crawlDelay: '',
        },
      ]);
    } else if (type === 'ecommerce') {
      setRules([
        {
          id: '1',
          userAgent: '*',
          disallows: ['/cart', '/checkout', '/account', '/search', '/orders', '/*?*sort='],
          allows: ['/products/', '/collections/'],
          crawlDelay: '',
        },
      ]);
    }
    showToast(`Loaded ${type} preset`, 'info');
  };

  const handleAddDisallow = (ruleId: string) => {
    setRules(
      rules.map((r) => (r.id === ruleId ? { ...r, disallows: [...r.disallows, '/'] } : r))
    );
  };

  const handleUpdateDisallow = (ruleId: string, idx: number, val: string) => {
    setRules(
      rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              disallows: r.disallows.map((item, i) => (i === idx ? val : item)),
            }
          : r
      )
    );
  };

  const handleRemoveDisallow = (ruleId: string, idx: number) => {
    setRules(
      rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              disallows: r.disallows.filter((_, i) => i !== idx),
            }
          : r
      )
    );
  };

  const handleAddRuleBlock = () => {
    const newId = Date.now().toString();
    setRules([
      ...rules,
      {
        id: newId,
        userAgent: 'Googlebot',
        disallows: [],
        allows: ['/'],
      },
    ]);
  };

  const handleRemoveRuleBlock = (id: string) => {
    if (rules.length <= 1) {
      showToast('Must keep at least one rule set', 'error');
      return;
    }
    setRules(rules.filter((r) => r.id !== id));
  };

  const handleCopyRobots = async () => {
    await navigator.clipboard.writeText(generateRobotsTxt());
    setCopiedRobots(true);
    showToast('Copied robots.txt to clipboard', 'success');
    setTimeout(() => setCopiedRobots(false), 2000);
  };

  const handleDownloadRobots = () => {
    const blob = new Blob([generateRobotsTxt()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded robots.txt', 'success');
  };

  const handleCopySitemap = async () => {
    await navigator.clipboard.writeText(generateSitemapXml());
    setCopiedSitemap(true);
    showToast('Copied sitemap.xml to clipboard', 'success');
    setTimeout(() => setCopiedSitemap(false), 2000);
  };

  const handleDownloadSitemap = () => {
    const blob = new Blob([generateSitemapXml()], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded sitemap.xml', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('robots')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'robots'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Robots.txt Builder
          </button>
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'sitemap'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            XML Sitemap Generator
          </button>
        </div>

        {activeTab === 'robots' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRobots}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              {copiedRobots ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedRobots ? 'Copied' : 'Copy robots.txt'}
            </button>
            <button
              onClick={handleDownloadRobots}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download .txt
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySitemap}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              {copiedSitemap ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSitemap ? 'Copied' : 'Copy XML'}
            </button>
            <button
              onClick={handleDownloadSitemap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download .xml
            </button>
          </div>
        )}
      </div>

      {activeTab === 'robots' ? (
        /* Robots.txt Builder */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form */}
          <div className="lg:col-span-6 space-y-5">
            {/* Presets */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Quick Presets:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleApplyPreset('allow-all')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition-colors"
                >
                  Allow All (Clean Site)
                </button>
                <button
                  onClick={() => handleApplyPreset('wordpress')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition-colors"
                >
                  WordPress Standard
                </button>
                <button
                  onClick={() => handleApplyPreset('ecommerce')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition-colors"
                >
                  E-Commerce Store
                </button>
                <button
                  onClick={() => handleApplyPreset('block-all')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-800"
                >
                  Block All (Staging)
                </button>
              </div>
            </div>

            {/* General Site Directives */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Global Directives
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sitemap URL
                </label>
                <input
                  type="url"
                  value={sitemapUrl}
                  onChange={(e) => setSitemapUrl(e.target.value)}
                  placeholder="https://example.com/sitemap.xml"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Host Domain (Optional)
                </label>
                <input
                  type="text"
                  value={hostUrl}
                  onChange={(e) => setHostUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* AI Scraper Blocker Toggle */}
              <div className="p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900 dark:text-white">
                    <input
                      type="checkbox"
                      checked={blockAiBots}
                      onChange={(e) => setBlockAiBots(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Block AI Data Scrapers & Training Crawlers</span>
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    Appends disallow rules for GPTBot, CCBot, ClaudeBot, Bytespider, and Google-Extended to prevent AI web scraping.
                  </p>
                </div>
              </div>
            </div>

            {/* Rule Sets */}
            {rules.map((rule, rIdx) => (
              <div
                key={rule.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Rule Group #{rIdx + 1}
                  </span>
                  {rules.length > 1 && (
                    <button
                      onClick={() => handleRemoveRuleBlock(rule.id)}
                      className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Group
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      User-Agent
                    </label>
                    <input
                      type="text"
                      value={rule.userAgent}
                      onChange={(e) =>
                        setRules(
                          rules.map((r) => (r.id === rule.id ? { ...r, userAgent: e.target.value } : r))
                        )
                      }
                      placeholder="* or Googlebot"
                      className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Crawl-Delay (Seconds, optional)
                    </label>
                    <input
                      type="text"
                      value={rule.crawlDelay || ''}
                      onChange={(e) =>
                        setRules(
                          rules.map((r) => (r.id === rule.id ? { ...r, crawlDelay: e.target.value } : r))
                        )
                      }
                      placeholder="e.g. 5"
                      className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                {/* Disallow paths list */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                      Disallowed Directories / Paths ({rule.disallows.length})
                    </label>
                    <button
                      onClick={() => handleAddDisallow(rule.id)}
                      className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Path
                    </button>
                  </div>

                  <div className="space-y-2">
                    {rule.disallows.map((path, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={path}
                          onChange={(e) => handleUpdateDisallow(rule.id, pIdx, e.target.value)}
                          placeholder="/admin/"
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                        <button
                          onClick={() => handleRemoveDisallow(rule.id, pIdx)}
                          className="p-1.5 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleAddRuleBlock}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Another User-Agent Group
            </button>
          </div>

          {/* Right Live Preview */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live robots.txt Output
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid RFC Format
                </span>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto min-h-[380px] leading-relaxed">
                {generateRobotsTxt()}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        /* XML Sitemap Builder */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                Sitemap Configuration
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Base Website URL
                </label>
                <input
                  type="url"
                  value={sitemapBaseUrl}
                  onChange={(e) => setSitemapBaseUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Change Frequency
                  </label>
                  <select
                    value={changefreq}
                    onChange={(e) => setChangefreq(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="always">always</option>
                    <option value="hourly">hourly</option>
                    <option value="daily">daily</option>
                    <option value="weekly">weekly</option>
                    <option value="monthly">monthly</option>
                    <option value="yearly">yearly</option>
                    <option value="never">never</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Default Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="1.0">1.0 (Critical / Home)</option>
                    <option value="0.9">0.9</option>
                    <option value="0.8">0.8 (Primary Categories)</option>
                    <option value="0.6">0.6 (Articles/Products)</option>
                    <option value="0.4">0.4</option>
                    <option value="0.2">0.2 (Archive/Legal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  List of Relative Paths / URLs (One per line)
                </label>
                <textarea
                  rows={8}
                  value={sitemapUrlsText}
                  onChange={(e) => setSitemapUrlsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live sitemap.xml Output
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Sitemaps Schema 0.9
                </span>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto min-h-[380px] leading-relaxed">
                {generateSitemapXml()}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default RobotsTxtGenerator;
