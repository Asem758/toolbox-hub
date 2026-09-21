import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="text-6xl font-black text-indigo-600 dark:text-indigo-400">404</div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-md mx-auto">
        The page or tool you requested does not exist or may have been relocated.
      </p>
      <div className="flex items-center justify-center gap-3 pt-2">
        <a
          href="#/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Home className="w-4 h-4" />
          Go to Home
        </a>
        <a
          href="#/tools"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Browse All Tools
        </a>
      </div>
    </div>
  );
};
export default NotFoundPage;
