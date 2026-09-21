import React from 'react';
import { blogPosts } from '../../data/blog';
import { tools } from '../../data/tools';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { ToolCard } from '../../components/tools/ToolCard';
import { AdSlot } from '../../components/ads/AdSlot';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';

interface BlogPostPageProps {
  slug: string;
  onSelectTool: (slug: string) => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug, onSelectTool }) => {
  const post = blogPosts.find((p) => p.slug === slug || p.id === slug);

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold">Guide Not Found</h1>
        <a href="#/blog" className="text-indigo-600 underline text-sm">
          Return to Blog Directory
        </a>
      </div>
    );
  }

  const relatedToolObjects = tools.filter((t) => post.relatedToolSlugs.includes(t.slug));

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb
        items={[
          { label: 'Guides', href: '#/blog' },
          { label: post.title },
        ]}
      />

      {/* Header */}
      <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
            {post.category}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">{post.readTime}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">{post.publishedDate}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          {post.title}
        </h1>
      </div>

      {/* Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base space-y-4 whitespace-pre-line">
        {post.content}
      </div>

      {/* Ad slot */}
      <AdSlot placement="tool-bottom" />

      {/* Related Tools Featured */}
      {relatedToolObjects.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Try the Mentioned Online Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedToolObjects.map((t) => (
              <ToolCard key={t.id} tool={t} onSelect={onSelectTool} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
export default BlogPostPage;
