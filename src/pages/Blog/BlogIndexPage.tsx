import React from 'react';
import { BookOpen, Clock, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { blogPosts } from '../../data/blog';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { AdSlot } from '../../components/ads/AdSlot';

interface BlogIndexPageProps {
  onSelectPost: (slug: string) => void;
}

export const BlogIndexPage: React.FC<BlogIndexPageProps> = ({ onSelectPost }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: 'Guides & Articles' }]} />

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Productivity & Technical Guides
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          In-depth tutorials, privacy insights, and best practices for optimizing files, text, and code.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <a
            key={post.id}
            href={`#/blog/${post.slug}`}
            onClick={(e) => {
              e.preventDefault();
              onSelectPost(post.slug);
            }}
            className="group flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition-all space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {post.category}
                </span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              Read Guide <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        ))}
      </div>

      <AdSlot placement="in-content" />
    </div>
  );
};
export default BlogIndexPage;
