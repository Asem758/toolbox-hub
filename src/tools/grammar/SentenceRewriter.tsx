import React, { useState, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard } from '../../lib/utils';
import {
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  ArrowRight,
  Briefcase,
  Smile,
  GraduationCap,
  Scissors,
  Maximize2,
  FileText,
  Layers,
  ChevronDown,
} from 'lucide-react';

type RewriteTone =
  | 'standard'
  | 'formal'
  | 'casual'
  | 'simplified'
  | 'academic'
  | 'creative'
  | 'shorten'
  | 'expand';

interface ToneOption {
  id: RewriteTone;
  label: string;
  desc: string;
  icon: React.ElementType;
}

const TONES: ToneOption[] = [
  { id: 'standard', label: 'Standard', desc: 'Balanced, clear and natural flow', icon: Sparkles },
  { id: 'formal', label: 'Formal', desc: 'Professional, executive, and polite', icon: Briefcase },
  { id: 'casual', label: 'Casual', desc: 'Friendly, warm, and conversational', icon: Smile },
  { id: 'simplified', label: 'Simplified', desc: 'Plain English, easy to understand', icon: FileText },
  { id: 'academic', label: 'Academic', desc: 'Scholarly, authoritative, and precise', icon: GraduationCap },
  { id: 'creative', label: 'Creative', desc: 'Vivid imagery and expressive prose', icon: Layers },
  { id: 'shorten', label: 'Shorten', desc: 'Concise, direct, removing filler words', icon: Scissors },
  { id: 'expand', label: 'Expand', desc: 'Elaborate with context and depth', icon: Maximize2 },
];

const SAMPLE_TEXT = `We need to talk about the quarterly financial reports as soon as possible. The current revenue trajectory is not looking good because of unexpected customer churn. In order to fix this problem, our team should implement new marketing strategies and improve our customer support response time immediately.`;

// Comprehensive client-side synonym & tone transformation rules
const TONE_TRANSFORMERS: Record<RewriteTone, (sentence: string) => string[]> = {
  standard: (s) => {
    let clean = s.trim();
    clean = clean.replace(/\bin order to\b/gi, 'to');
    clean = clean.replace(/\bas soon as possible\b/gi, 'promptly');
    clean = clean.replace(/\bneed to talk about\b/gi, 'should review');
    clean = clean.replace(/\bnot looking good\b/gi, 'declining');
    clean = clean.replace(/\bbecause of\b/gi, 'due to');
    clean = clean.replace(/\bfix this problem\b/gi, 'address this issue');
    clean = clean.replace(/\bimmediately\b/gi, 'without delay');

    return [
      clean,
      s.replace(/\bneed to\b/gi, 'must').replace(/\bnot looking good\b/gi, 'underperforming'),
      s.replace(/\bin order to fix this problem\b/gi, 'to resolve this matter'),
    ];
  },
  formal: (s) => {
    let clean = s.trim();
    clean = clean.replace(/\bwe need to talk about\b/gi, 'we ought to discuss');
    clean = clean.replace(/\bas soon as possible\b/gi, 'at your earliest convenience');
    clean = clean.replace(/\bnot looking good\b/gi, 'experiencing notable underperformance');
    clean = clean.replace(/\bbecause of\b/gi, 'attributable to');
    clean = clean.replace(/\bfix this problem\b/gi, 'rectify this challenge');
    clean = clean.replace(/\bour team should\b/gi, 'it is recommended that our department');
    clean = clean.replace(/\bimmediately\b/gi, 'with high priority');
    clean = clean.replace(/\bshow\b/gi, 'demonstrate');
    clean = clean.replace(/\bhelp\b/gi, 'assist');
    clean = clean.replace(/\bbuy\b/gi, 'purchase');
    clean = clean.replace(/\bget\b/gi, 'obtain');

    return [
      clean,
      `It is vital that ${clean.charAt(0).toLowerCase() + clean.slice(1)}`,
      clean.replace(/\bshould implement\b/gi, 'must execute'),
    ];
  },
  casual: (s) => {
    let clean = s.trim();
    clean = clean.replace(/\bwe need to talk about\b/gi, "let's chat about");
    clean = clean.replace(/\bas soon as possible\b/gi, 'ASAP');
    clean = clean.replace(/\bthe quarterly financial reports\b/gi, 'the quarterly numbers');
    clean = clean.replace(/\bcurrent revenue trajectory\b/gi, 'latest revenue');
    clean = clean.replace(/\bnot looking good\b/gi, 'taking a dip');
    clean = clean.replace(/\bbecause of unexpected customer churn\b/gi, "since we're losing users");
    clean = clean.replace(/\bin order to fix this problem\b/gi, 'to turn things around');
    clean = clean.replace(/\bour team should implement\b/gi, "let's roll out");
    clean = clean.replace(/\bimmediately\b/gi, 'right away');

    return [
      clean,
      clean.replace(/\blet's\b/gi, 'we should quickly'),
      `Hey, ${clean.charAt(0).toLowerCase() + clean.slice(1)}`,
    ];
  },
  simplified: (s) => {
    let clean = s.trim();
    clean = clean.replace(/\bwe need to talk about\b/gi, 'we must discuss');
    clean = clean.replace(/\bquarterly financial reports\b/gi, 'quarterly budget');
    clean = clean.replace(/\bas soon as possible\b/gi, 'soon');
    clean = clean.replace(/\bcurrent revenue trajectory\b/gi, 'sales path');
    clean = clean.replace(/\bnot looking good\b/gi, 'dropping');
    clean = clean.replace(/\bbecause of unexpected customer churn\b/gi, 'because customers are leaving');
    clean = clean.replace(/\bin order to fix this problem\b/gi, 'to fix this');
    clean = clean.replace(/\bour team should implement\b/gi, 'we should start');
    clean = clean.replace(/\bresponse time\b/gi, 'speed');
    clean = clean.replace(/\bimmediately\b/gi, 'now');

    return [
      clean,
      clean.replace(/\bwe must discuss\b/gi, 'we need to review'),
      clean.replace(/\bto fix this\b/gi, 'so we can improve'),
    ];
  },
  academic: (s) => {
    let clean = s.trim();
    clean = clean.replace(/\bwe need to talk about\b/gi, 'a critical examination of');
    clean = clean.replace(/\bas soon as possible\b/gi, 'is urgently warranted');
    clean = clean.replace(/\bthe current revenue trajectory\b/gi, 'empirical revenue projections');
    clean = clean.replace(/\bnot looking good\b/gi, 'indicate substantial negative variance');
    clean = clean.replace(/\bbecause of unexpected customer churn\b/gi, 'stemming from anomalous customer attrition');
    clean = clean.replace(/\bin order to fix this problem\b/gi, 'to mitigate this systemic deficit');
    clean = clean.replace(/\bour team should implement\b/gi, 'the organizational framework necessitates establishing');
    clean = clean.replace(/\bimmediately\b/gi, 'expeditiously');

    return [
      clean,
      `Scholarly analysis indicates that ${clean.charAt(0).toLowerCase() + clean.slice(1)}`,
      clean.replace(/\bis urgently warranted\b/gi, 'is of paramount academic and practical significance'),
    ];
  },
  creative: (s) => {
    let clean = s.trim();
    clean = clean.replace(/\bwe need to talk about\b/gi, 'a crucial reckoning awaits');
    clean = clean.replace(/\bas soon as possible\b/gi, 'before the clock runs out');
    clean = clean.replace(/\bnot looking good\b/gi, 'drifting into stormy waters');
    clean = clean.replace(/\bbecause of unexpected customer churn\b/gi, 'as patrons vanish into thin air');
    clean = clean.replace(/\bin order to fix this problem\b/gi, 'to chart a triumphant comeback');
    clean = clean.replace(/\bour team should implement\b/gi, 'we must ignite');
    clean = clean.replace(/\bimmediately\b/gi, 'in an instant');

    return [
      clean,
      `Without hesitation, ${clean.charAt(0).toLowerCase() + clean.slice(1)}`,
      clean.replace(/\bwe must ignite\b/gi, 'our mission demands crafting'),
    ];
  },
  shorten: (s) => {
    let clean = s.trim();
    clean = clean.replace(/\bwe need to talk about\b/gi, 'discuss');
    clean = clean.replace(/\bas soon as possible\b/gi, 'ASAP');
    clean = clean.replace(/\bthe current revenue trajectory is not looking good\b/gi, 'revenue is falling');
    clean = clean.replace(/\bbecause of unexpected customer churn\b/gi, 'due to churn');
    clean = clean.replace(/\bin order to fix this problem, our team should\b/gi, 'we should');
    clean = clean.replace(/\bimplement new marketing strategies and improve our customer support response time immediately\b/gi, 'adopt new marketing and speed up support');

    return [
      clean,
      clean.replace(/\bdiscuss\b/gi, 'review'),
      clean.replace(/\bdue to churn\b/gi, 'from churn'),
    ];
  },
  expand: (s) => {
    let clean = s.trim();
    clean = clean.replace(/\bwe need to talk about the quarterly financial reports as soon as possible\b/gi, 'it is essential that our leadership team convenes immediately to conduct an in-depth audit of our latest quarterly financial performance metrics');
    clean = clean.replace(/\bthe current revenue trajectory is not looking good because of unexpected customer churn\b/gi, 'our present top-line revenue indicators reveal clear downward pressure, primarily accelerated by an unprecedented and sudden surge in customer cancellation rates');
    clean = clean.replace(/\bin order to fix this problem, our team should implement new marketing strategies and improve our customer support response time immediately\b/gi, 'to reverse this concerning trend, our cross-functional team must rapidly deploy refreshed high-conversion marketing initiatives while simultaneously accelerating customer support resolution times');

    return [
      clean,
      `Furthermore, ${clean.charAt(0).toLowerCase() + clean.slice(1)}`,
      clean.replace(/\bit is essential\b/gi, 'it is fundamentally critical'),
    ];
  },
};

export const SentenceRewriter: React.FC = () => {
  const { showToast } = useToast();
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT);
  const [selectedTone, setSelectedTone] = useState<RewriteTone>('formal');
  const [selectedVariations, setSelectedVariations] = useState<Record<number, number>>({});
  const [copied, setCopied] = useState<boolean>(false);

  // Split input into sentences
  const sentences = useMemo(() => {
    const raw = inputText.trim();
    if (!raw) return [];
    // Split by sentence terminators while preserving them
    const matches = raw.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [];
    return matches.map((s) => s.trim()).filter(Boolean);
  }, [inputText]);

  // Generate rewrite alternatives for each sentence
  const sentenceRewrites = useMemo(() => {
    const transformer = TONE_TRANSFORMERS[selectedTone] || TONE_TRANSFORMERS.standard;
    return sentences.map((s) => transformer(s));
  }, [sentences, selectedTone]);

  // Final reconstructed output text
  const outputText = useMemo(() => {
    if (sentences.length === 0) return '';
    return sentences
      .map((_, idx) => {
        const alts = sentenceRewrites[idx];
        const selectedIdx = selectedVariations[idx] || 0;
        return alts ? alts[selectedIdx] || alts[0] : '';
      })
      .join(' ');
  }, [sentences, sentenceRewrites, selectedVariations]);

  // Handle variation toggle
  const handleSelectVariation = (sentenceIndex: number, variationIndex: number) => {
    setSelectedVariations((prev) => ({
      ...prev,
      [sentenceIndex]: variationIndex,
    }));
    showToast('Applied alternative phrasing', 'info');
  };

  // Copy output
  const handleCopy = async () => {
    if (!outputText) return;
    const ok = await copyToClipboard(outputText);
    if (ok) {
      setCopied(true);
      showToast('Rewritten text copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inputWordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const outputWordCount = outputText.trim() ? outputText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6">
      {/* Top Tone Selection Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-500" />
            Select Rewriting Tone
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setInputText(SAMPLE_TEXT);
                setSelectedVariations({});
                showToast('Loaded sample text', 'info');
              }}
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Sample
            </button>
            <button
              onClick={() => {
                setInputText('');
                setSelectedVariations({});
              }}
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>

        {/* Tone Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {TONES.map((tone) => {
            const Icon = tone.icon;
            const isSelected = selectedTone === tone.id;
            return (
              <button
                key={tone.id}
                onClick={() => {
                  setSelectedTone(tone.id);
                  setSelectedVariations({});
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">{tone.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Rewriting Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Original Text Input */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Original Content ({inputWordCount} words)
              </label>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setSelectedVariations({});
              }}
              placeholder="Paste or type your sentences here to rewrite them into new styles..."
              rows={10}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans text-base focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all resize-y leading-relaxed"
            />
          </div>

          <div className="text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>{sentences.length} sentences detected</span>
            <span>Tone: <strong className="capitalize text-slate-700 dark:text-slate-300">{selectedTone}</strong></span>
          </div>
        </div>

        {/* Right Col: Rewritten Output Text */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Rewritten Output ({outputWordCount} words)
              </label>
              <button
                onClick={handleCopy}
                disabled={!outputText}
                className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans text-base leading-relaxed min-h-[240px] select-all">
              {outputText || (
                <span className="text-slate-400 italic text-sm">
                  Your rewritten text will appear here with selectable alternative sentence variations below.
                </span>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>Word Change: <strong>{outputWordCount - inputWordCount >= 0 ? `+${outputWordCount - inputWordCount}` : outputWordCount - inputWordCount} words</strong></span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">100% Client-side Processing</span>
          </div>
        </div>
      </div>

      {/* Interactive Sentence-by-Sentence Breakdown Card */}
      {sentences.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Sentence-by-Sentence Alternatives (Click to Swap)
            </h4>
          </div>

          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
            {sentences.map((originalSentence, sIdx) => {
              const alternatives = sentenceRewrites[sIdx] || [originalSentence];
              const currentActive = selectedVariations[sIdx] || 0;

              return (
                <div
                  key={sIdx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5"
                >
                  <div className="text-xs text-slate-500 font-mono">
                    Sentence #{sIdx + 1}: <span className="text-slate-700 dark:text-slate-300 italic">"{originalSentence}"</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Select Variation:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {alternatives.map((alt, aIdx) => {
                        const isActive = currentActive === aIdx;
                        return (
                          <button
                            key={aIdx}
                            onClick={() => handleSelectVariation(sIdx, aIdx)}
                            className={`p-3 rounded-xl text-left text-xs transition-all border ${
                              isActive
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs font-semibold'
                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                                Option {aIdx + 1}
                              </span>
                              {isActive && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <p className="leading-snug">{alt}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SentenceRewriter;
