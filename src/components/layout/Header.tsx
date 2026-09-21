import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  Sun,
  Moon,
  Laptop,
  Menu,
  X,
  Heart,
  Grid,
  BookOpen,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useFavorites } from '../../context/FavoritesContext';
import { siteConfig } from '../../config/site.config';
import { categories } from '../../data/categories';

interface HeaderProps {
  onOpenSearch: () => void;
  currentRoute: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, currentRoute }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const { favorites } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState<boolean>(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState<boolean>(false);

  // Close menus on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setThemeDropdownOpen(false);
    setCategoriesDropdownOpen(false);
  }, [currentRoute]);

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <a
          href="#/"
          className="flex items-center gap-2.5 font-extrabold text-lg text-slate-900 dark:text-white tracking-tight shrink-0 group"
        >
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
          <span className="flex items-center gap-1">
            <span>ToolBox</span>
            <span className="text-indigo-600 dark:text-indigo-400">Hub</span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
          <a
            href="#/"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              currentRoute === '/'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Home
          </a>

          <a
            href="#/tools"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              currentRoute.startsWith('/tools') && !currentRoute.includes('/tools/')
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Tools
          </a>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Categories</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {categoriesDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-64 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-1 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setCategoriesDropdownOpen(false)}
              >
                {categories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`#/category/${cat.id}`}
                    onClick={() => setCategoriesDropdownOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <span>{cat.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <a
            href="#/blog"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              currentRoute.startsWith('/blog')
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Guides & Blog
          </a>
        </nav>

        {/* Action Controls & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-medium transition-all shadow-2xs"
            title="Search tools (⌘K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search tools...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
              ⌘K
            </kbd>
          </button>

          {/* Theme Dropdown / Quick Toggle */}
          <div className="relative">
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              aria-label="Toggle theme"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {resolvedTheme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            {themeDropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-36 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-0.5 animate-in fade-in zoom-in-95 duration-100 text-xs font-medium"
                onMouseLeave={() => setThemeDropdownOpen(false)}
              >
                <button
                  onClick={() => {
                    setTheme('light');
                    setThemeDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-colors ${
                    theme === 'light'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  Light Mode
                </button>
                <button
                  onClick={() => {
                    setTheme('dark');
                    setThemeDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-colors ${
                    theme === 'dark'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  Dark Mode
                </button>
                <button
                  onClick={() => {
                    setTheme('system');
                    setThemeDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-colors ${
                    theme === 'system'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 text-slate-400" />
                  System Default
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <a
              href="#/"
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              Home
            </a>
            <a
              href="#/tools"
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              All Tools (15+)
            </a>
            <a
              href="#/blog"
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              Guides & Blog
            </a>
            <a
              href="#/about"
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              About Platform
            </a>
          </div>

          <div className="pt-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Tool Categories
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              {categories.map((c) => (
                <a
                  key={c.id}
                  href={`#/category/${c.id}`}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 truncate"
                >
                  {c.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
export default Header;
