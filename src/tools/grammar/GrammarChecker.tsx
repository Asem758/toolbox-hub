import React, { useState, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard } from '../../lib/utils';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Sliders,
  CheckCheck,
  FileText,
  Eye,
} from 'lucide-react';

interface GrammarIssue {
  id: string;
  type: 'grammar' | 'style' | 'punctuation' | 'wordiness' | 'redundancy';
  message: string;
  original: string;
  suggestion: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
}

const SAMPLE_TEXT = `He are going to the store in order to buy some groceries. There house is very unique and was built by a famous architect. Due to the fact that it was raining, they decided to to cancel the event. Its important to double check you're work before submitting.`;

const COMMON_RULES: Array<{
  pattern: RegExp;
  type: 'grammar' | 'style' | 'punctuation' | 'wordiness' | 'redundancy';
  message: string;
  getSuggestion: (match: string, ...args: any[]) => string;
  explanation: string;
}> = [
  // Subject Verb Agreement
  {
    pattern: /\b(he|she|it|someone|everyone|everybody|nobody|no one)\s+(are|were|have)\b/gi,
    type: 'grammar',
    message: 'Subject-verb agreement error',
    getSuggestion: (match, subj, verb) => {
      const v = verb.toLowerCase();
      const s = subj;
      const targetVerb = v === 'are' ? 'is' : v === 'were' ? 'was' : 'has';
      return `${s} ${targetVerb}`;
    },
    explanation: 'Singular third-person pronouns require singular verbs (is, was, has).',
  },
  {
    pattern: /\b(they|we|you)\s+(is|was|has)\b/gi,
    type: 'grammar',
    message: 'Subject-verb agreement error',
    getSuggestion: (match, subj, verb) => {
      const v = verb.toLowerCase();
      const s = subj;
      const targetVerb = v === 'is' ? 'are' : v === 'was' ? 'were' : 'have';
      return `${s} ${targetVerb}`;
    },
    explanation: 'Plural pronouns require plural verbs (are, were, have).',
  },
  // Confused Words / Homophones
  {
    pattern: /\bthere\s+(house|car|family|dog|cat|books|work|friend|parents|children)\b/gi,
    type: 'grammar',
    message: 'Possible homophone confusion ("their" vs "there")',
    getSuggestion: (match, noun) => `their ${noun}`,
    explanation: '"Their" indicates possession, while "there" refers to a place.',
  },
  {
    pattern: /\bthey're\s+(house|car|family|dog|cat|books|work|friend|parents|children)\b/gi,
    type: 'grammar',
    message: 'Possible homophone confusion ("their" vs "they\'re")',
    getSuggestion: (match, noun) => `their ${noun}`,
    explanation: '"Their" is possessive, while "they\'re" is a contraction for "they are".',
  },
  {
    pattern: /\byou're\s+(work|car|house|dog|name|time|email|file|code|password|account)\b/gi,
    type: 'grammar',
    message: 'Possible homophone confusion ("your" vs "you\'re")',
    getSuggestion: (match, noun) => `your ${noun}`,
    explanation: '"Your" shows ownership, whereas "you\'re" means "you are".',
  },
  {
    pattern: /\b(it's|its)\s+(important|crucial|essential|necessary|better|clear|obvious|time|likely|hard|easy|possible)\b/gi,
    type: 'grammar',
    message: 'Contraction error ("it\'s" vs "its")',
    getSuggestion: (match, pronoun, adj) => `it's ${adj}`,
    explanation: 'Use the contraction "it\'s" when you mean "it is".',
  },
  {
    pattern: /\bthan\s+(I\s+thought|you\s+think|ever|usual|before)\b/gi,
    type: 'grammar',
    message: 'Comparative preposition usage',
    getSuggestion: (match) => match,
    explanation: '"Than" is used for comparisons.',
  },
  {
    pattern: /\bthen\s+(I\s+did|he\s+did|she\s+did|they\s+did)\b/gi,
    type: 'grammar',
    message: 'Sequential adverb usage',
    getSuggestion: (match) => match,
    explanation: '"Then" refers to a point in time or sequence.',
  },
  {
    pattern: /\bcould\s+of\b/gi,
    type: 'grammar',
    message: 'Incorrect phrasing ("could of")',
    getSuggestion: () => 'could have',
    explanation: 'The correct modal phrase is "could have", not "could of".',
  },
  {
    pattern: /\bshould\s+of\b/gi,
    type: 'grammar',
    message: 'Incorrect phrasing ("should of")',
    getSuggestion: () => 'should have',
    explanation: 'The correct modal phrase is "should have", not "should of".',
  },
  {
    pattern: /\bwould\s+of\b/gi,
    type: 'grammar',
    message: 'Incorrect phrasing ("would of")',
    getSuggestion: () => 'would have',
    explanation: 'The correct modal phrase is "would have", not "would of".',
  },
  // Repeated Consecutive Words (e.g. "the the", "to to")
  {
    pattern: /\b([a-zA-Z]+)\s+\1\b/gi,
    type: 'grammar',
    message: 'Duplicated consecutive word',
    getSuggestion: (match, word) => word,
    explanation: 'Accidental duplicate word repetition.',
  },
  // Wordiness & Redundancy
  {
    pattern: /\bin\s+order\s+to\b/gi,
    type: 'wordiness',
    message: 'Wordy expression',
    getSuggestion: () => 'to',
    explanation: 'Simplifying "in order to" to "to" improves sentence conciseness.',
  },
  {
    pattern: /\bdue\s+to\s+the\s+fact\s+that\b/gi,
    type: 'wordiness',
    message: 'Wordy expression',
    getSuggestion: () => 'because',
    explanation: 'Replace "due to the fact that" with "because" for sharper prose.',
  },
  {
    pattern: /\bat\s+this\s+point\s+in\s+time\b/gi,
    type: 'wordiness',
    message: 'Wordy cliché',
    getSuggestion: () => 'now',
    explanation: '"At this point in time" can be replaced by "now" or "currently".',
  },
  {
    pattern: /\ba\s+large\s+number\s+of\b/gi,
    type: 'wordiness',
    message: 'Wordy phrase',
    getSuggestion: () => 'many',
    explanation: '"Many" or "numerous" is more concise.',
  },
  {
    pattern: /\bfor\s+the\s+purpose\s+of\b/gi,
    type: 'wordiness',
    message: 'Wordy phrase',
    getSuggestion: () => 'for',
    explanation: 'Replace "for the purpose of" with "to" or "for".',
  },
  {
    pattern: /\bin\s+spite\s+of\s+the\s+fact\s+that\b/gi,
    type: 'wordiness',
    message: 'Wordy phrase',
    getSuggestion: () => 'although',
    explanation: '"Although" or "even though" provides better flow.',
  },
  // Weak Modifiers / Clichés
  {
    pattern: /\bvery\s+unique\b/gi,
    type: 'style',
    message: 'Illogical modifier',
    getSuggestion: () => 'unique',
    explanation: '"Unique" is an absolute state; something cannot be "very unique".',
  },
  {
    pattern: /\bvery\s+essential\b/gi,
    type: 'style',
    message: 'Redundant modifier',
    getSuggestion: () => 'essential',
    explanation: '"Essential" is already an absolute term.',
  },
  {
    pattern: /\brevert\s+back\b/gi,
    type: 'redundancy',
    message: 'Redundant phrasing',
    getSuggestion: () => 'revert',
    explanation: '"Revert" already implies going back.',
  },
  {
    pattern: /\bfree\s+gift\b/gi,
    type: 'redundancy',
    message: 'Tautology / Redundancy',
    getSuggestion: () => 'gift',
    explanation: 'A gift is inherently free.',
  },
  {
    pattern: /\badvance\s+planning\b/gi,
    type: 'redundancy',
    message: 'Redundancy',
    getSuggestion: () => 'planning',
    explanation: 'Planning is always done in advance.',
  },
  // Punctuation & Spacing
  {
    pattern: /([a-zA-Z0-9]),([a-zA-Z])/g,
    type: 'punctuation',
    message: 'Missing space after comma',
    getSuggestion: (match, before, after) => `${before}, ${after}`,
    explanation: 'A space is required following a punctuation comma.',
  },
  {
    pattern: /([a-zA-Z0-9])\s+([,.;!?])/g,
    type: 'punctuation',
    message: 'Unwanted space before punctuation mark',
    getSuggestion: (match, text, punct) => `${text}${punct}`,
    explanation: 'Punctuation marks should attach directly to the preceding word without a space.',
  },
];

export const GrammarChecker: React.FC = () => {
  const { showToast } = useToast();
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [ignoredIssueIds, setIgnoredIssueIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Detect issues
  const issues = useMemo<GrammarIssue[]>(() => {
    if (!text.trim()) return [];

    const detected: GrammarIssue[] = [];
    let issueCounter = 0;

    COMMON_RULES.forEach((rule) => {
      let match: RegExpExecArray | null;
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);

      while ((match = regex.exec(text)) !== null) {
        const fullMatch = match[0];
        const startIndex = match.index;
        const endIndex = startIndex + fullMatch.length;
        const suggestion = rule.getSuggestion(fullMatch, match[1], match[2], match[3]);

        // Avoid adding if suggestion is identical to match
        if (suggestion !== fullMatch) {
          const id = `${startIndex}-${endIndex}-${rule.type}-${rule.message.replace(/\s+/g, '')}`;
          if (!ignoredIssueIds.has(id)) {
            detected.push({
              id,
              type: rule.type,
              message: rule.message,
              original: fullMatch,
              suggestion,
              explanation: rule.explanation,
              startIndex,
              endIndex,
            });
            issueCounter++;
          }
        }
      }
    });

    // Sort by position in text
    return detected.sort((a, b) => a.startIndex - b.startIndex);
  }, [text, ignoredIssueIds]);

  // Readability & Text Statistics
  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        words: 0,
        chars: 0,
        sentences: 0,
        readingTime: '0 min',
        readabilityScore: 100,
        readingGrade: 'Easy (5th grade)',
        grammarScore: 100,
      };
    }

    const words = trimmed.split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1;

    // Simple syllable counter heuristic
    let syllables = 0;
    const wordList = trimmed.toLowerCase().match(/[a-z]+/g) || [];
    wordList.forEach((w) => {
      if (w.length <= 3) {
        syllables += 1;
      } else {
        const matches = w.match(/[aeiouy]{1,2}/g);
        syllables += matches ? matches.length : 1;
      }
    });

    // Flesch Reading Ease: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
    const asw = words > 0 ? syllables / words : 1;
    const asl = words / sentences;
    let score = Math.round(206.835 - 1.015 * asl - 84.6 * asw);
    score = Math.max(0, Math.min(100, score));

    let grade = 'College level';
    if (score >= 90) grade = 'Very Easy (5th grade)';
    else if (score >= 80) grade = 'Easy (6th grade)';
    else if (score >= 70) grade = 'Fairly Easy (7th grade)';
    else if (score >= 60) grade = 'Standard (8th-9th grade)';
    else if (score >= 50) grade = 'Fairly Difficult (High School)';
    else if (score >= 30) grade = 'Difficult (College)';

    // Overall grammar resilience score
    const errorPenalty = Math.min(60, issues.length * 8);
    const grammarScore = Math.max(20, 100 - errorPenalty);

    const readingTimeSec = Math.ceil((words / 200) * 60);
    const readingTime = readingTimeSec < 60 ? `${readingTimeSec}s` : `${Math.ceil(readingTimeSec / 60)} min`;

    return {
      words,
      chars,
      sentences,
      readingTime,
      readabilityScore: score,
      readingGrade: grade,
      grammarScore,
    };
  }, [text, issues.length]);

  // Apply single fix
  const handleApplyFix = (issue: GrammarIssue) => {
    // Replace the exact instance
    const before = text.substring(0, issue.startIndex);
    const after = text.substring(issue.endIndex);
    setText(before + issue.suggestion + after);
    showToast(`Applied: "${issue.suggestion}"`, 'success');
  };

  // Ignore single issue
  const handleIgnore = (id: string) => {
    setIgnoredIssueIds((prev) => new Set([...prev, id]));
    showToast('Issue ignored', 'info');
  };

  // Apply All Fixes
  const handleFixAll = () => {
    if (issues.length === 0) return;

    // Apply from end of string to start so indices remain valid
    const sortedDescending = [...issues].sort((a, b) => b.startIndex - a.startIndex);
    let updatedText = text;

    sortedDescending.forEach((issue) => {
      const before = updatedText.substring(0, issue.startIndex);
      const after = updatedText.substring(issue.endIndex);
      updatedText = before + issue.suggestion + after;
    });

    setText(updatedText);
    showToast(`Fixed all ${issues.length} issues!`, 'success');
  };

  // Copy text
  const handleCopy = async () => {
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      showToast('Text copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Filtered issues
  const filteredIssues = useMemo(() => {
    if (selectedFilter === 'all') return issues;
    return issues.filter((i) => i.type === selectedFilter);
  }, [issues, selectedFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header Deck */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setText(SAMPLE_TEXT);
              setIgnoredIssueIds(new Set());
              showToast('Sample text loaded', 'info');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Load Sample
          </button>
          <button
            onClick={() => {
              setText('');
              setIgnoredIssueIds(new Set());
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        <div className="flex items-center gap-2">
          {issues.length > 0 && (
            <button
              onClick={handleFixAll}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              Fix All ({issues.length})
            </button>
          )}

          <button
            onClick={handleCopy}
            disabled={!text}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
        </div>
      </div>

      {/* Main Grid: Editor & Issue Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Text Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Text Editor
              </label>
              <div className="text-xs font-medium text-slate-500">
                {stats.words} words &bull; {stats.chars} characters
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type your content here to check grammar, punctuation, and style..."
              rows={12}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans text-base focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all resize-y leading-relaxed"
            />

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <div className="text-xs text-slate-500 font-medium">Grammar Score</div>
                <div className={`text-xl font-bold font-mono ${stats.grammarScore > 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                  {stats.grammarScore}%
                </div>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <div className="text-xs text-slate-500 font-medium">Readability</div>
                <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {stats.readabilityScore}/100
                </div>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <div className="text-xs text-slate-500 font-medium">Grade Level</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-1">
                  {stats.readingGrade}
                </div>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <div className="text-xs text-slate-500 font-medium">Reading Time</div>
                <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200">
                  {stats.readingTime}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Detected Issues & Suggestions */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              Suggestions ({issues.length})
            </h4>

            {/* Filter Pills */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border-transparent text-slate-700 dark:text-slate-300 font-semibold"
            >
              <option value="all">All Types</option>
              <option value="grammar">Grammar</option>
              <option value="wordiness">Wordiness</option>
              <option value="style">Style</option>
              <option value="punctuation">Punctuation</option>
              <option value="redundancy">Redundancy</option>
            </select>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">No Issues Found!</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Your text looks clean, polished, and ready to publish.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                      {issue.type}
                    </span>
                    <button
                      onClick={() => handleIgnore(issue.id)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Ignore
                    </button>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {issue.message}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="line-through text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                      {issue.original}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                      {issue.suggestion}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {issue.explanation}
                  </p>

                  <button
                    onClick={() => handleApplyFix(issue)}
                    className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Apply Fix
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrammarChecker;
