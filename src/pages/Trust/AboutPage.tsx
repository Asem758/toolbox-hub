import React from 'react';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { ShieldCheck, Zap, Heart, Lock, Code2, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumb items={[{ label: 'About Us' }]} />

      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About ToolBox Hub
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          ToolBox Hub is an open, high-performance platform dedicated to providing zero-friction, private, and instant utilities for everyday workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Zero Server Data Storage</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every transformation—whether resizing images, formatting JSON, counting characters, or computing age—happens strictly on the user's hardware.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Zero Latency</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            By avoiding server upload bottlenecks, actions finish in single-digit milliseconds even with unstable network connections.
          </p>
        </div>
      </div>
    </div>
  );
};
export default AboutPage;
