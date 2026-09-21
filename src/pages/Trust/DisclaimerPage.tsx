import React from 'react';
import { Breadcrumb } from '../../components/common/Breadcrumb';

export const DisclaimerPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumb items={[{ label: 'Disclaimer' }]} />

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Disclaimer
        </h1>
        <p className="text-xs text-slate-400">Last updated: August 2026</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none text-xs md:text-sm text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">1. General Information Only</h3>
        <p>
          All information and computation utilities on ToolBox Hub are published in good faith and for general utility, productivity, and calculation purposes only. ToolBox Hub does not make any warranties about the completeness, reliability, and precision of numerical approximations.
        </p>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">2. No Legal or Financial Advice</h3>
        <p>
          Calculations such as percentage differences, age, units, or password entropy are provided for convenient reference. They do not constitute formal legal, mathematical, or financial advice.
        </p>
      </div>
    </div>
  );
};
export default DisclaimerPage;
