import React from 'react';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { ShieldCheck, Lock, EyeOff } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumb items={[{ label: 'Privacy Policy' }]} />

      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          Client-First Privacy Architecture
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400">Last updated: August 2026</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none text-xs md:text-sm text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Core Privacy Philosophy</h3>
        <p>
          At ToolBox Hub, your privacy is our primary engineering requirement. The overwhelming majority of our online utilities (including Word Counters, JSON formatters, Image Compressors, QR Generators, and Age Calculators) run entirely inside your device's web browser using client-side JavaScript, Canvas, and HTML5 Web APIs.
        </p>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">2. No File or Document Retention</h3>
        <p>
          When you upload an image to be resized or compressed, or paste text/JSON to be formatted, your files are never transmitted to our web servers. Computation occurs directly within your local device memory and vanishes when you close the tab.
        </p>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Local Storage</h3>
        <p>
          ToolBox Hub uses your browser's local storage (LocalStorage) solely to store non-sensitive user preferences, such as your light/dark theme preference, tool bookmark favorites, and recent tool usage history.
        </p>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">4. Cookies and Advertising</h3>
        <p>
          To keep all utilities 100% free, we may display non-intrusive advertisements provided by third-party advertising partners (such as Google AdSense). These partners may use cookies to serve relevant advertisements. You can opt out of personalized advertising via your browser or Google Ad Settings.
        </p>
      </div>
    </div>
  );
};
export default PrivacyPage;
