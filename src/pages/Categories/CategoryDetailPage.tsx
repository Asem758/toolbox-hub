import React from 'react';
import { tools } from '../../data/tools';
import { categories } from '../../data/categories';
import { ToolCard } from '../../components/tools/ToolCard';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { AdSlot } from '../../components/ads/AdSlot';

interface CategoryDetailPageProps {
  categoryId: string;
  onSelectTool: (slug: string) => void;
}

export const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({
  categoryId,
  onSelectTool,
}) => {
  const category = categories.find((c) => c.id === categoryId);
  const categoryTools = tools.filter((t) => t.category === categoryId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb
        items={[
          { label: 'Categories', href: '#/tools' },
          { label: category?.name || categoryId },
        ]}
      />

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {category?.name || 'Category'} Tools
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          {category?.description || 'Browse high-performance browser tools in this category.'}
        </p>
      </div>

      {categoryTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categoryTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500">No tools found in this category yet.</p>
        </div>
      )}

      <AdSlot placement="in-content" />
    </div>
  );
};
export default CategoryDetailPage;
