import React, { useState, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard } from '../../lib/utils';
import {
  Bot,
  UserCheck,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  Layers,
  Activity,
  Copy,
  Check,
  HelpCircle,
  Scan,
  RefreshCw,
  Zap,
  Info,
  ChevronRight,
  ShieldCheck,
  Upload,
} from 'lucide-react';

interface SentenceItem {
  text: string;
  score: number;
  type: 'ai' | 'mixed' | 'human';
  reason?: string;
}

interface DetectionResult {
  aiProbability: number;
  humanProbability: number;
  refinedProbability: number;
  classification: 'likely-ai' | 'mixed' | 'likely-human';
  confidence: 'high' | 'medium' | 'low';
  summary: string;
  metrics: {
    burstiness: number;
    perplexity: number;
    vocabularyDiversity: number;
    repetitionIndex: number;
  };
  sentences: SentenceItem[];
  engine?: string;
}

const SAMPLE_AI_TEXT = `In today's rapidly evolving digital landscape, artificial intelligence has emerged as a transformative force that is revolutionizing how modern enterprises operate. It is important to note that these multifaceted systems delve into massive datasets to foster seamless innovation and optimize customer experiences. Furthermore, the pivotal significance of this paradigm shift stands as a testament to technological progress. In conclusion, navigating this intricate tapestry requires a holistic and forward-thinking organizational strategy.`;

const SAMPLE_HUMAN_TEXT = `I spent yesterday afternoon wrestling with my old manual coffee grinder. It jammed right in the middle of preparing breakfast roast! After shaking it and tapping the counter with zero luck, I grabbed a tiny screwdriver and found a dark bean wedged sideways beneath the lower burr. Fixed it in two minutes flat, but by then my bagel was already cold.`;

const SAMPLE_MIXED_TEXT = `Artificial intelligence is rapidly changing how small businesses manage inventory and sales forecasting. I tested three different predictive tools last week on our local bakery's orders. While the automated models accurately predicted weekend croissant spikes, they failed to account for a sudden rainy Tuesday that cut our morning foot traffic in half.`;

export const AiDetector: React.FC = () => {
  const { showToast } = useToast();
  const [inputText, setInputText] = useState<string>(SAMPLE_AI_TEXT);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanVersion, setScanVersion] = useState<'V2' | 'V1'>('V2');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sentences'>('overview');

  // Input statistics
  const wordCount = useMemo(() => {
    return inputText.trim() ? inputText.trim().split(/\s+/).filter(Boolean).length : 0;
  }, [inputText]);

  const charCount = inputText.length;

  // Execute AI Detection
  const handleDetectAi = async () => {
    if (!inputText.trim()) {
      showToast('Please enter text to scan for AI patterns', 'warning');
      return;
    }

    if (isScanning) return;
    setIsScanning(true);

    try {
      const response = await fetch('/api/detect-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: DetectionResult = await response.json();
      setResult(data);

      const label =
        data.classification === 'likely-ai'
          ? 'High AI Probability'
          : data.classification === 'likely-human'
          ? 'Likely Human-Written'
          : 'Mixed / AI-Assisted';

      showToast(`Analysis complete: ${data.aiProbability}% AI Probability (${label})`, 'info');
    } catch (err: any) {
      console.error('Detection error:', err);
      showToast('Could not complete deep neural scan. Running local statistical analyzer...', 'info');

      // Local fallback analyzer
      const sentences = inputText.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [inputText];
      const words = inputText.trim().split(/\s+/).filter(Boolean);
      const sentenceLengths = sentences.map((s) => s.trim().split(/\s+/).length);
      const avg = sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceLengths.length || 1);
      const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / (sentenceLengths.length || 1);
      const stdDev = Math.sqrt(variance);

      const AI_PHRASES = ['delve', 'tapestry', 'revolutionize', 'pivotal', 'testament', 'furthermore', 'in conclusion', 'digital landscape', 'foster', 'holistic', 'multifaceted'];
      let matchCount = 0;
      const lower = inputText.toLowerCase();
      AI_PHRASES.forEach((p) => {
        if (lower.includes(p)) matchCount++;
      });

      let aiScore = 50 + matchCount * 15;
      if (stdDev < 3.5) aiScore += 25;
      else if (stdDev > 8) aiScore -= 25;

      const aiProb = Math.max(4, Math.min(98, Math.round(aiScore)));
      const humanProb = 100 - aiProb;

      const localResult: DetectionResult = {
        aiProbability: aiProb,
        humanProbability: humanProb,
        refinedProbability: Math.round(aiProb * 0.25),
        classification: aiProb >= 70 ? 'likely-ai' : aiProb <= 35 ? 'likely-human' : 'mixed',
        confidence: 'medium',
        summary: `Analysis based on sentence length variance (StdDev: ${stdDev.toFixed(1)}) and linguistic cadence.`,
        metrics: {
          burstiness: Math.min(100, Math.round(stdDev * 10)),
          perplexity: Math.max(10, 100 - aiProb),
          vocabularyDiversity: Math.min(100, Math.round((new Set(words.map((w) => w.toLowerCase())).size / (words.length || 1)) * 100)),
          repetitionIndex: Math.max(10, Math.round(100 - (new Set(words).size / (words.length || 1)) * 100)),
        },
        sentences: sentences.map((s) => ({
          text: s.trim(),
          score: aiProb,
          type: aiProb >= 70 ? 'ai' : aiProb <= 35 ? 'human' : 'mixed',
          reason: 'Calculated via linguistic rhythm analysis',
        })),
        engine: 'statistical-nlp-engine',
      };

      setResult(localResult);
    } finally {
      setIsScanning(false);
    }
  };

  // Copy Summary
  const handleCopySummary = async () => {
    if (!result) return;
    const summaryText = `AI Detection Report:
Overall AI Probability: ${result.aiProbability}%
Classification: ${result.classification.toUpperCase()} (${result.confidence} confidence)
Human-Written Probability: ${result.humanProbability}%
AI-Refined: ${result.refinedProbability}%
Summary: ${result.summary}`;

    const ok = await copyToClipboard(summaryText);
    if (ok) {
      setCopied(true);
      showToast('Detection summary copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        setInputText(content);
        setResult(null);
        showToast(`Loaded "${file.name}"`, 'success');
      }
    };
    reader.readAsText(file);
  };

  // Calculate Breakdown Segments (Ensure all sum to 100%)
  const breakdownSegments = useMemo(() => {
    if (!result) return { ai: 0, refined: 0, human: 0 };
    const ai = result.aiProbability;
    const human = result.humanProbability;
    const refined = Math.min(result.refinedProbability, Math.round(ai * 0.4));
    const pureAi = Math.max(0, ai - refined);
    return {
      ai: pureAi,
      refined: refined,
      human: human,
    };
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Scan className="w-6 h-6" />
              </span>
              AI Detector
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Paste any text to check how likely it is to be flagged as AI-generated.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Upload File
              <input type="file" accept=".txt,.md,.rtf,.docx" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => {
                setInputText(SAMPLE_AI_TEXT);
                setResult(null);
                showToast('Sample AI text loaded', 'info');
              }}
              className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5 text-amber-500" />
              AI Sample
            </button>

            <button
              onClick={() => {
                setInputText(SAMPLE_HUMAN_TEXT);
                setResult(null);
                showToast('Sample Human text loaded', 'info');
              }}
              className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              Human Sample
            </button>

            <button
              onClick={() => {
                setInputText(SAMPLE_MIXED_TEXT);
                setResult(null);
                showToast('Sample Mixed text loaded', 'info');
              }}
              className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Mixed Sample
            </button>

            <button
              onClick={() => {
                setInputText('');
                setResult(null);
              }}
              className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Main Dual Grid: Text Editor vs Results Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Text Input Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Text to Analyze
              </label>
              <div className="text-xs font-mono text-slate-400">
                {wordCount} words &bull; {charCount} chars
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (result) setResult(null);
              }}
              placeholder="Paste text here to check for AI detection (essays, articles, emails, marketing copy)..."
              rows={12}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans text-base focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all resize-y leading-relaxed"
            />

            {/* Bottom Toolbar with Version Switch & Prominent Scan Button */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-slate-500">
                  {wordCount}/5,000 words
                </span>

                {/* Scan Model Version Selector (V2 / V1) */}
                <div className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <span className="text-slate-500 font-semibold px-1 text-[11px]">Scan with</span>
                  <button
                    onClick={() => setScanVersion('V2')}
                    className={`px-2 py-0.5 rounded-lg font-mono font-bold transition-all ${
                      scanVersion === 'V2'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    V2 Neural
                  </button>
                  <button
                    onClick={() => setScanVersion('V1')}
                    className={`px-2 py-0.5 rounded-lg font-mono font-bold transition-all ${
                      scanVersion === 'V1'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    V1 NLP
                  </button>
                </div>
              </div>

              {/* Prominent Detect AI Action Button */}
              <button
                type="button"
                id="detect-ai-submit-btn"
                onClick={handleDetectAi}
                disabled={!inputText.trim() || isScanning}
                className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Scanning text...</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4" />
                    <span>Scan for AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Responsible AI Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              <strong>Methodology Note:</strong> AI content detection is probabilistic. The engine analyzes burstiness, vocabulary entropy, and syntactic predictability. Highly formal or structured human writing can occasionally display elevated predictability scores.
            </p>
          </div>
        </div>

        {/* Right Column: Detection Score & Forensic Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                Detection Score
              </h3>

              {result && (
                <button
                  onClick={handleCopySummary}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>

            {/* Score Result Panel */}
            {result ? (
              <div className="space-y-6">
                {/* Main Gauge + Breakdown Cards (Design inspired by reference image) */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* Left: Big Score & Caption */}
                    <div className="text-center sm:text-left space-y-1">
                      <div className="flex items-baseline gap-1 justify-center sm:justify-start">
                        <span
                          className={`text-5xl font-extrabold font-mono tracking-tight ${
                            result.aiProbability >= 70
                              ? 'text-amber-500'
                              : result.aiProbability <= 35
                              ? 'text-emerald-500'
                              : 'text-indigo-500'
                          }`}
                        >
                          {result.aiProbability}%
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        of text is likely AI
                      </p>
                    </div>

                    {/* Right: Three-Tier Complement Breakdown (Total = 100%) */}
                    <div className="w-full sm:w-auto space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-4 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                          AI-generated
                        </span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          {breakdownSegments.ai}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                          Human-written & AI-refined
                        </span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {breakdownSegments.refined}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                          Human-written
                        </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {breakdownSegments.human}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Classification & Confidence Badges */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Verdict:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                          result.classification === 'likely-ai'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : result.classification === 'likely-human'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                        }`}
                      >
                        {result.classification === 'likely-ai'
                          ? 'Likely AI'
                          : result.classification === 'likely-human'
                          ? 'Likely Human'
                          : 'Mixed / Refined'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span>Confidence:</span>
                      <span className="font-bold capitalize text-slate-700 dark:text-slate-300">
                        {result.confidence}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Text Analysis Summary */}
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1.5 text-xs">
                  <div className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Linguistic Signal Summary
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                {/* Multi-Signal Metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Linguistic Metrics</span>
                    <span className="text-[10px] font-mono">{result.engine || 'V2 Deep Neural'}</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {/* Burstiness */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          Burstiness (Sentence Variety)
                        </span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {result.metrics.burstiness}/100
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${result.metrics.burstiness}%` }}
                        />
                      </div>
                    </div>

                    {/* Perplexity */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          Perplexity (Unpredictability)
                        </span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {result.metrics.perplexity}/100
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${result.metrics.perplexity}%` }}
                        />
                      </div>
                    </div>

                    {/* Vocabulary Diversity */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-300">Lexical Richness</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {result.metrics.vocabularyDiversity}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${result.metrics.vocabularyDiversity}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sentence Breakdown Highlighter */}
                {result.sentences && result.sentences.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Sentence Heatmap ({result.sentences.length} clauses)
                    </span>

                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {result.sentences.map((sent, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border text-xs leading-relaxed space-y-1 ${
                            sent.type === 'ai'
                              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-slate-800 dark:text-slate-200'
                              : sent.type === 'human'
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-slate-800 dark:text-slate-200'
                              : 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span
                              className={
                                sent.type === 'ai'
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : sent.type === 'human'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-indigo-600 dark:text-indigo-400'
                              }
                            >
                              Sentence {idx + 1} &bull; {sent.score}% AI Risk
                            </span>
                            <span className="text-slate-400 font-normal text-[9px]">
                              {sent.reason || (sent.type === 'ai' ? 'Formulaic structure' : 'Natural flow')}
                            </span>
                          </div>
                          <p>{sent.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State (Matching reference image "No score yet") */
              <div className="py-16 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <Scan className="w-7 h-7" />
                </div>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No score yet
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Click "Scan for AI" to scan your text across burstiness, perplexity, and syntax predictability signals.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiDetector;
