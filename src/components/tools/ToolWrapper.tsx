import React, { useEffect, useState } from 'react';
import { ChevronDown, Sparkles, CheckCircle2, ShieldCheck, HelpCircle, ArrowRight, Zap } from 'lucide-react';
import { ToolDefinition } from '../../types/tools';
import { Breadcrumb } from '../common/Breadcrumb';
import { ToolHeader } from './ToolHeader';
import { ToolCard } from './ToolCard';
import { AdSlot } from '../ads/AdSlot';
import { tools } from '../../data/tools';
import { categories } from '../../data/categories';
import { useFavorites } from '../../context/FavoritesContext';

interface ToolWrapperProps {
  tool: ToolDefinition;
  children: React.ReactNode;
}

export const ToolWrapper: React.FC<ToolWrapperProps> = ({ tool, children }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const { recordToolUsage } = useFavorites();

  const categoryObj = categories.find((c) => c.id === tool.category);

  useEffect(() => {
    recordToolUsage(tool.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Inject document title and metadata
    document.title = tool.seo.title;
  }, [tool]);

  // Related tools
  const relatedTools = tools
    .filter((t) => t.id !== tool.id && (t.category === tool.category || tool.keywords.some((k) => t.keywords.includes(k))))
    .slice(0, 3);

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.description,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const faqJsonLd = tool.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: tool.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }
    : null;

  return (
    <article className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-10">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'All Tools', href: '#/tools' },
          { label: categoryObj?.name || tool.category, href: `#/category/${tool.category}` },
          { label: tool.name },
        ]}
      />

      {/* Standard Header */}
      <ToolHeader tool={tool} />

      {/* Interactive Tool Playground */}
      <main id="tool-workspace" className="space-y-6">
        {children}
      </main>

      {/* Contextual Non-Intrusive Ad Placement */}
      <AdSlot placement="tool-bottom" />

      {/* Educational & SEO Content Suite */}
      <section className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-10">
        {/* How to use */}
        {tool.howToUse?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              How to Use {tool.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tool.howToUse.map((step) => (
                <div
                  key={step.step}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2 shadow-xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                    {step.step}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features & Use cases dual grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Features */}
          {tool.features?.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Key Features
              </h3>
              <ul className="space-y-2.5">
                {tool.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Real-World Use Cases */}
          {tool.useCases?.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Real-World Applications
              </h3>
              <ul className="space-y-2.5">
                {tool.useCases.map((useCase, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* FAQs */}
        {tool.faqs?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-2.5">
              {tool.faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs md:text-sm text-slate-900 dark:text-white hover:text-indigo-600 transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180 text-indigo-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Related Tools in {categoryObj?.name || 'Same Category'}
              </h3>
              <a
                href="#/tools"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Browse All Tools
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedTools.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </div>
        )}
      </section>
    </article>
  );
};
export default ToolWrapper;
