import React from 'react';
import { Wrench, ShieldCheck, Heart, Github, Twitter, Sparkles, Zap, Lock } from 'lucide-react';
import { siteConfig } from '../../config/site.config';
import { categories } from '../../data/categories';
import { tools } from '../../data/tools';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition-colors">
      {/* Value Trust Bar */}
      <div className="border-b border-slate-100 dark:border-slate-900 py-8 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">100% Client-Side Privacy</h4>
              <p className="text-xs text-slate-500">Your files, images, and text never leave your device.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Zero Latency Computation</h4>
              <p className="text-xs text-slate-500">Instant results powered by modern Web APIs and WASM.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Always Free & Accessible</h4>
              <p className="text-xs text-slate-500">No account required, no paywalls, zero rate limits.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sitemap Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
        {/* Brand Column */}
        <div className="col-span-2 space-y-4">
          <a href="#/" className="flex items-center gap-2 font-extrabold text-base text-slate-900 dark:text-white">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Wrench className="w-4 h-4" />
            </div>
            <span>ToolBox<span className="text-indigo-600 dark:text-indigo-400">Hub</span></span>
          </a>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            Free, fast, and powerful browser-based online tools designed for developers, students, writers, and digital professionals.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] border border-emerald-200 dark:border-emerald-800">
              • 15 Tools Online
            </span>
          </div>
        </div>

        {/* Popular Tools */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            Popular Tools
          </h4>
          <ul className="space-y-2">
            {tools.slice(0, 5).map((t) => (
              <li key={t.id}>
                <a href={`#/tools/${t.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  {t.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            Categories
          </h4>
          <ul className="space-y-2">
            {categories.slice(0, 5).map((c) => (
              <li key={c.id}>
                <a href={`#/category/${c.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Trust & Legal */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            Trust & Legal
          </h4>
          <ul className="space-y-2">
            <li>
              <a href="#/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                About Us
              </a>
            </li>
            <li>
              <a href="#/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Contact & Feedback
              </a>
            </li>
            <li>
              <a href="#/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#/disclaimer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Disclaimer
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-100 dark:border-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} ToolBox Hub. Built for productivity with 100% client privacy.</p>
          <div className="flex items-center gap-4">
            <a href="#/privacy" className="hover:underline">Privacy</a>
            <a href="#/terms" className="hover:underline">Terms</a>
            <a href="#/contact" className="hover:underline">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
