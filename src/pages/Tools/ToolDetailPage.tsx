import React from 'react';
import { tools } from '../../data/tools';
import { ToolWrapper } from '../../components/tools/ToolWrapper';
import { ArrowLeft, Search } from 'lucide-react';

interface ToolDetailPageProps {
  slug: string;
}

export const ToolDetailPage: React.FC<ToolDetailPageProps> = ({ slug }) => {
  const tool = tools.find((t) => t.slug === slug || t.id === slug);

  if (!tool) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Tool Not Found</h1>
        <p className="text-sm text-slate-500">
          The tool you are looking for ("{slug}") does not exist or may have been renamed.
        </p>
        <div className="pt-4">
          <a
            href="#/tools"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse All Tools Directory
          </a>
        </div>
      </div>
    );
  }

  const ToolComponent = tool.component;

  return (
    <ToolWrapper tool={tool}>
      <ToolComponent />
    </ToolWrapper>
  );
};
export default ToolDetailPage;
