import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Heart,
  History,
  Grid,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { tools } from '../../data/tools';
import { categories } from '../../data/categories';
import { ToolCard } from '../../components/tools/ToolCard';
import { AdSlot } from '../../components/ads/AdSlot';
import { useFavorites } from '../../context/FavoritesContext';
import { ToolDefinition } from '../../types/tools';

interface HomePageProps {
  onOpenSearch: () => void;
  onSelectTool: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenSearch, onSelectTool }) => {
  const { favorites, recentTools } = useFavorites();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const popularTools = tools.filter((t) => t.popular).slice(0, 6);

  const favoriteToolObjects = tools.filter((t) => favorites.includes(t.id));
  const recentToolObjects = recentTools
    .map((id) => tools.find((t) => t.id === id || t.slug === id))
    .filter(Boolean) as ToolDefinition[];

  const filteredCategoryTools =
    selectedCategory === 'all'
      ? tools
      : tools.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-12 bg-linear-to-b from-indigo-50/50 via-transparent to-transparent dark:from-indigo-950/20 dark:via-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            100% Free, Private & In-Browser Tools
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.1]">
            Everything You Need.{' '}
            <span className="bg-linear-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
              One Powerful Toolbox.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Free online tools for work, study, business, development, creativity and everyday tasks. No signups, no uploads, instant results.
          </p>

          {/* Hero Big Search Trigger */}
          <div className="max-w-2xl mx-auto pt-2">
            <div
              onClick={onOpenSearch}
              className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-lg hover:shadow-xl cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 text-sm md:text-base font-medium">
                <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Search {tools.length}+ online tools (e.g., SEO, QR, Compress, JSON, Age)...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                ⌘K
              </kbd>
            </div>

            {/* Quick shortcuts */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 text-xs">
              <span className="text-slate-400 font-medium">Popular:</span>
              {[
                { label: 'Word Counter', slug: 'word-counter' },
                { label: 'QR Generator', slug: 'qr-code-generator' },
                { label: 'Image Compressor', slug: 'image-compressor' },
                { label: 'JSON Formatter', slug: 'json-formatter' },
                { label: 'Age Calculator', slug: 'age-calculator' },
                { label: 'Password Maker', slug: 'password-generator' },
              ].map((s) => (
                <a
                  key={s.slug}
                  href={`#/tools/${s.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool(s.slug);
                  }}
                  className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-2xs"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recents & Favorites Bar (if available) */}
      {(favoriteToolObjects.length > 0 || recentToolObjects.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                Your Saved & Recent Tools
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(favoriteToolObjects.length > 0 ? favoriteToolObjects : recentToolObjects)
                .slice(0, 4)
                .map((t) => (
                  <ToolCard key={t.id} tool={t} onSelect={onSelectTool} />
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Tools Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4" /> Top Utilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Most Popular Online Tools
            </h2>
          </div>
          <a
            href="#/tools"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            View All {tools.length}+ Tools <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
          ))}
        </div>
      </section>

      {/* Non-Intrusive Mid-Page Ad Slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSlot placement="banner" />
      </div>

      {/* Explore By Category Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Grid className="w-4 h-4" /> Tool Directory
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Browse Tools by Category
          </h2>
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Categories ({tools.length})
          </button>
          {categories.map((cat) => {
            const count = tools.filter((t) => t.category === cat.id).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Filtered Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategoryTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
          ))}
        </div>
      </section>

      {/* Why ToolBox Hub Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="p-8 md:p-12 rounded-3xl bg-slate-900 text-white shadow-xl space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Engineered Differently
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Why Professionals & Creators Choose ToolBox Hub
            </h2>
            <p className="text-sm text-slate-400">
              Unlike generic utility sites loaded with popups and backend tracking, ToolBox Hub is built around modern browser capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold">100% Client-Side Privacy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Images, text documents, passwords, and JSON payloads are processed in your local browser memory. Nothing is ever sent to our servers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold">Sub-Second Processing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero network latency. Calculations and conversions execute instantly via Web Workers, Canvas, and HTML5 APIs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold">Free & No Registration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every tool is immediately accessible without accounts, email verification, or hidden usage paywalls.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default HomePage;
