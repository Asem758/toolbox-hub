import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles, Clock, History, FileText, QrCode, Sliders, FileCode2 } from 'lucide-react';
import { tools } from '../../data/tools';
import { useFavorites } from '../../context/FavoritesContext';
import { ToolDefinition } from '../../types/tools';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (slug: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
}) => {
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { recentTools } = useFavorites();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filter tools based on query
  const filteredTools = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return tools.filter((t) => {
      const matchName = t.name.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      const matchKeywords = t.keywords.some((k) => k.toLowerCase().includes(q));
      return matchName || matchDesc || matchCat || matchKeywords;
    });
  }, [query]);

  // Recent tools
  const recentToolObjects = React.useMemo(() => {
    return recentTools
      .map((id) => tools.find((t) => t.id === id || t.slug === id))
      .filter(Boolean) as ToolDefinition[];
  }, [recentTools]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const max = filteredTools.length > 0 ? filteredTools.length : recentToolObjects.length;
        setSelectedIndex((prev) => (prev + 1) % (max || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const max = filteredTools.length > 0 ? filteredTools.length : recentToolObjects.length;
        setSelectedIndex((prev) => (prev - 1 + max) % (max || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const list = filteredTools.length > 0 ? filteredTools : recentToolObjects;
        if (list[selectedIndex]) {
          onSelectTool(list[selectedIndex].slug);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTools, recentToolObjects, selectedIndex, onClose, onSelectTool]);

  if (!isOpen) return null;

  const popularKeywords = ['Meta Tag Generator', 'Word Counter', 'QR Generator', 'Image Compressor', 'JSON Formatter', 'SERP Preview', 'URL Slug'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={`Search ${tools.length}+ browser tools (e.g. meta tags, compress, qr, json, seo)...`}
            className="w-full bg-transparent text-sm md:text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-4">
          {/* If search query entered */}
          {query.trim() ? (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Search Results ({filteredTools.length})
              </div>
              {filteredTools.length > 0 ? (
                <div className="space-y-1">
                  {filteredTools.map((t, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          onSelectTool(t.slug);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 shrink-0 font-bold text-xs">
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold">{t.name}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">{t.description}</div>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                          {t.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs space-y-2">
                  <p>No tools found matching "{query}".</p>
                  <p className="text-[11px]">Try searching for keywords like "image", "qr", "format", or "counter".</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Quick Keywords */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Popular Suggestions
                </div>
                <div className="flex flex-wrap gap-1.5 px-3">
                  {popularKeywords.map((k) => (
                    <button
                      key={k}
                      onClick={() => setQuery(k)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/80 dark:border-slate-700"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Tools */}
              {recentToolObjects.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    Recently Opened
                  </div>
                  <div className="space-y-1">
                    {recentToolObjects.slice(0, 5).map((t, idx) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onSelectTool(t.slug);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{t.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">↑</kbd>
              <kbd className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 ml-1">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">↵</kbd> to select
            </span>
          </div>
          <span>{tools.length} Active Tools</span>
        </div>
      </div>
    </div>
  );
};
export default GlobalSearchModal;
