import React from 'react';
import { Breadcrumb } from '../../components/common/Breadcrumb';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumb items={[{ label: 'Terms of Service' }]} />

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-400">Last updated: August 2026</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none text-xs md:text-sm text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h3>
        <p>
          By accessing and using ToolBox Hub, you accept and agree to be bound by the terms and provisions of this agreement.
        </p>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Use License</h3>
        <p>
          Permission is granted to freely use ToolBox Hub's tools for personal, academic, or commercial purposes. You may not reverse engineer, attempt to disrupt service infrastructure, or bypass rate limits.
        </p>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Disclaimer of Warranties</h3>
        <p>
          The tools and materials on ToolBox Hub are provided on an "as is" basis without warranties of any kind, either express or implied.
        </p>
      </div>
    </div>
  );
};
export default TermsPage;
