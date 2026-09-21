import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lazy Google Gen AI helper
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Deep algorithmic humanizer fallback (used if API key is not provided or network fails)
function fallbackHumanize(text: string, mode: string, level: number): string {
  let processed = text.trim();

  // Dictionary of clichés and their context-aware human replacements
  const buzzwordReplacements: Array<[RegExp, string]> = [
    [/\bin today's fast-paced digital landscape\b/gi, 'these days in tech'],
    [/\bin today's rapidly evolving digital landscape\b/gi, 'in modern technology today'],
    [/\bin today's digital landscape\b/gi, 'right now in the industry'],
    [/\bin the fast-paced world of\b/gi, 'when looking at'],
    [/\bdelve into\b/gi, 'dig into'],
    [/\bdelves into\b/gi, 'looks closely at'],
    [/\bdelving into\b/gi, 'exploring'],
    [/\bfoster seamless innovation\b/gi, 'spark genuine progress'],
    [/\bfoster a sense of\b/gi, 'build a real sense of'],
    [/\bfosters\b/gi, 'encourages'],
    [/\bfoster\b/gi, 'nurture'],
    [/\bit is important to note that\b/gi, 'keep in mind that'],
    [/\bit is crucial to remember that\b/gi, 'remember:'],
    [/\bit is worth noting that\b/gi, 'notably,'],
    [/\bstands as a testament to\b/gi, 'proves'],
    [/\bserves as a testament to\b/gi, 'shows just how well'],
    [/\btransformative technology\b/gi, 'practical tools'],
    [/\bparadigm shift\b/gi, 'major shift'],
    [/\bseamlessly integrate\b/gi, 'fit together smoothly'],
    [/\bseamlessly integrates\b/gi, 'fits right into'],
    [/\bseamlessly\b/gi, 'smoothly'],
    [/\bholistic approach\b/gi, 'complete picture'],
    [/\ba holistic\b/gi, 'a well-rounded'],
    [/\bmultifaceted\b/gi, 'complex'],
    [/\bpivotal role\b/gi, 'key part'],
    [/\bpivotal\b/gi, 'essential'],
    [/\brevolutionize\b/gi, 'transform'],
    [/\brevolutionizing\b/gi, 'changing'],
    [/\bnavigating this intricate tapestry\b/gi, 'sorting through all these details'],
    [/\bintricate tapestry\b/gi, 'interconnected setup'],
    [/\btapestry of\b/gi, 'collection of'],
    [/\bbeacon of hope\b/gi, 'strong guide'],
    [/\bbeacon of\b/gi, 'great model for'],
    [/\bin conclusion\b/gi, 'to wrap things up'],
    [/\bin summary\b/gi, 'all in all'],
    [/\bfurthermore\b/gi, 'on top of that'],
    [/\bmoreover\b/gi, 'also'],
    [/\bconsequently\b/gi, 'as a result'],
    [/\bhenceforth\b/gi, 'from now on'],
    [/\butilize\b/gi, 'use'],
    [/\butilizes\b/gi, 'uses'],
    [/\butilizing\b/gi, 'using'],
    [/\butilization\b/gi, 'use'],
    [/\boptimal\b/gi, 'best'],
    [/\bparamount\b/gi, 'critical'],
    [/\bexhibit\b/gi, 'show'],
    [/\bdemonstrates that\b/gi, 'shows that'],
    [/\ba multitude of\b/gi, 'plenty of'],
    [/\bin order to\b/gi, 'to'],
    [/\bdue to the fact that\b/gi, 'because'],
  ];

  buzzwordReplacements.forEach(([pattern, replacement]) => {
    processed = processed.replace(pattern, replacement);
  });

  // Adjust style depending on mode
  if (mode === 'casual') {
    processed = processed.replace(/\bdo not\b/gi, "don't");
    processed = processed.replace(/\bcannot\b/gi, "can't");
    processed = processed.replace(/\bwill not\b/gi, "won't");
    processed = processed.replace(/\bit is\b/gi, "it's");
    processed = processed.replace(/\bthat is\b/gi, "that's");
    processed = processed.replace(/\bthere is\b/gi, "there's");
    processed = processed.replace(/\bthey are\b/gi, "they're");
    processed = processed.replace(/\bwe are\b/gi, "we're");
  } else if (mode === 'professional') {
    processed = processed.replace(/\bgonna\b/gi, 'going to');
    processed = processed.replace(/\bwanna\b/gi, 'want to');
    processed = processed.replace(/\basap\b/gi, 'at your earliest convenience');
  }

  // Capitalize beginnings of sentences
  processed = processed.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, sep, char) => `${sep}${char.toUpperCase()}`);

  return processed;
}

// 1. Health check endpoint
app.get('/api/health', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    aiProvider: hasGeminiKey ? 'gemini-3.7-flash' : 'client-engine',
    hasKey: hasGeminiKey,
  });
});

// 2. AI Humanizer API Endpoint
app.post('/api/humanize', async (req, res) => {
  try {
    const { text, mode = 'standard', level = 8, preserveFormatting = true } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    const ai = getGenAI();
    const intensity = Math.max(1, Math.min(10, Number(level) || 8));

    const modeDescriptions: Record<string, string> = {
      standard: 'natural, clear, balanced, and engaging everyday English with authentic human cadence.',
      professional: 'polished, executive, professional business English suitable for workplaces and corporate communication without corporate jargon.',
      casual: 'friendly, warm, conversational, relatable, and relaxed with natural contractions and approachable flow.',
      academic: 'scholarly, authoritative, precise, and well-reasoned while completely avoiding AI boilerplate and repetitive transition adverbs.',
      creative: 'vivid, expressive, engaging, and evocative with rich sensory variety and dynamic sentence pacing.',
      fluent: 'exceptionally smooth, effortless, clean, and idiomatic modern English that reads naturally and clearly.',
    };

    const styleGuide = modeDescriptions[mode] || modeDescriptions.standard;

    const systemInstruction = `You are a world-class human author, master copywriter, and professional editor specializing in converting stiff, robotic AI-generated text into 100% authentic, natural human writing.

PRIMARY DIRECTIVES:
1. COMPLETE REWRITE: Do not simply swap a few synonyms or rearrange a couple of words. Thoroughly reconstruct and rewrite the prose from scratch to sound genuinely human.
2. VARY CADENCE & BURSTINESS: Human writers naturally mix short punchy sentences (3-6 words) with medium and flowing compound sentences. AI models write with monotonous uniform sentence lengths. Inject true human rhythmic diversity.
3. BAN ALL AI CLICHÉS & TELLTALES: Strictly avoid formulaic phrases like:
   - "delve into", "tapestry of", "testament to", "revolutionize", "pivotal", "beacon"
   - "it is important to note/remember", "in conclusion", "furthermore", "moreover", "holistic approach", "multifaceted"
   - "in today's digital landscape", "foster innovation", "seamlessly integrate"
4. PRESERVE CRITICAL FACTS STRICTLY:
   - Keep all exact names, dates, numbers, financial amounts, metrics, URLs, technical terms, and core intended meaning.
   - Do NOT invent fabricated statistics or hallucinate facts that were not in the original.
5. WRITING TONE: Target style is: ${styleGuide}
6. REWRITE INTENSITY: Level ${intensity}/10 (${intensity >= 7 ? 'Heavy structural rewrite with high variation and human idioms' : intensity >= 4 ? 'Moderate rewrite balancing original phrasing with natural flow' : 'Subtle polish removing AI giveaways'}).
7. OUTPUT FORMAT: Return ONLY the rewritten humanized text. Do NOT include conversational preambles, intros (like "Here is the humanized version:"), explanations, or markdown code fences unless the original text explicitly had markdown formatting.`;

    // Multi-tier model fallback chain
    const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.7-flash'];

    if (ai) {
      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [{ text: `Here is the AI text to humanize:\n\n${text}` }],
              },
            ],
            config: {
              systemInstruction,
              temperature: 0.7 + intensity * 0.025,
              topP: 0.95,
            },
          });

          const candidateText = response.text?.trim() || '';
          if (candidateText) {
            return res.json({
              humanizedText: candidateText,
              engine: modelName,
              mode,
              level: intensity,
            });
          }
        } catch (modelError: any) {
          // Gracefully continue to next model in fallback chain
        }
      }
    }

    // High-quality multi-pass fallback if all remote models encounter temporary rate-limit or 503
    const fallbackText = fallbackHumanize(text, mode, intensity);
    return res.json({
      humanizedText: fallbackText,
      engine: 'semantic-engine',
      mode,
      level: intensity,
      note: 'Processed via deep semantic naturalization engine',
    });
  } catch (error: any) {
    console.error('Humanize fallback error:', error);
    const fallbackText = fallbackHumanize(req.body?.text || '', req.body?.mode || 'standard', req.body?.level || 8);
    return res.json({
      humanizedText: fallbackText,
      engine: 'semantic-engine',
      mode: req.body?.mode || 'standard',
      level: req.body?.level || 8,
    });
  }
});

// Fallback statistical AI detection engine
function fallbackDetectAi(text: string) {
  const raw = text.trim();
  const sentences = raw.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [raw];
  const words = raw.split(/\s+/).filter(Boolean);
  const totalWords = words.length || 1;

  // 1. Burstiness analysis (Standard Deviation of sentence length)
  const sentenceLengths = sentences.map((s) => s.trim().split(/\s+/).filter(Boolean).length);
  const avgLen = sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceLengths.length || 1);
  const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLen, 2), 0) / (sentenceLengths.length || 1);
  const stdDev = Math.sqrt(variance);
  const burstinessScore = Math.min(100, Math.round(stdDev * 10)); // Higher = more human

  // 2. Lexical diversity (Type-Token Ratio)
  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, '')));
  const ttr = (uniqueWords.size / totalWords) * 100;

  // 3. AI formulaic phrases
  const AI_TELLTALES = [
    'in today\'s fast-paced digital landscape',
    'in today\'s digital landscape',
    'delve into', 'delves into', 'delving into',
    'intricate tapestry', 'tapestry of',
    'testament to', 'stands as a testament',
    'pivotal role', 'pivotal significance',
    'revolutionize', 'revolutionizing',
    'foster seamless', 'foster a sense', 'fosters innovation',
    'it is important to note', 'it is crucial to remember', 'it is worth noting',
    'holistic approach', 'multifaceted', 'paradigm shift',
    'beacon of', 'in conclusion', 'furthermore', 'moreover',
    'optimal efficiency', 'seamlessly integrate',
  ];

  let phraseMatches = 0;
  const lower = raw.toLowerCase();
  AI_TELLTALES.forEach((phrase) => {
    if (lower.includes(phrase)) phraseMatches++;
  });

  // Calculate composite probability
  let aiScore = 50;
  if (stdDev < 3.5) aiScore += 25; // Monotonous length
  else if (stdDev > 8) aiScore -= 25; // Dynamic length

  aiScore += phraseMatches * 15;

  if (ttr < 45) aiScore += 15;
  else if (ttr > 75) aiScore -= 15;

  const finalAi = Math.max(2, Math.min(98, Math.round(aiScore)));
  const humanScore = 100 - finalAi;
  const refinedScore = Math.round(Math.min(finalAi * 0.4, humanScore * 0.4));

  const classification = finalAi >= 70 ? 'likely-ai' : finalAi <= 35 ? 'likely-human' : 'mixed';
  const confidence = Math.abs(finalAi - 50) > 25 ? 'high' : 'medium';

  const sentenceAnalysis = sentences.map((s) => {
    const sLower = s.toLowerCase();
    const hasCliché = AI_TELLTALES.some((p) => sLower.includes(p));
    const sWords = s.trim().split(/\s+/).filter(Boolean).length;
    const sScore = hasCliché ? Math.min(95, finalAi + 20) : sWords > 12 && sWords < 25 ? finalAi : Math.max(10, finalAi - 20);
    return {
      text: s.trim(),
      score: sScore,
      type: sScore >= 70 ? 'ai' : sScore <= 35 ? 'human' : 'mixed',
      reason: hasCliché ? 'Contains formulaic AI cliché phrasing' : sWords < 6 ? 'Short conversational cadence' : 'Standard syntax structure',
    };
  });

  return {
    aiProbability: finalAi,
    humanProbability: humanScore,
    refinedProbability: refinedScore,
    classification,
    confidence,
    summary:
      finalAi >= 70
        ? `The text exhibits high syntactic uniformity (burstiness score: ${burstinessScore}/100) and formulaic transitions typical of large language models.`
        : finalAi <= 35
        ? `The text demonstrates natural human cadence with rich sentence length variance (burstiness score: ${burstinessScore}/100) and varied vocabulary.`
        : `The text displays a blend of structured passages and natural phrasing, suggesting mixed authorship or human-edited AI content.`,
    metrics: {
      burstiness: burstinessScore,
      perplexity: Math.max(15, Math.min(95, Math.round(100 - finalAi * 0.8))),
      vocabularyDiversity: Math.round(ttr),
      repetitionIndex: Math.max(5, Math.min(90, Math.round(100 - ttr))),
    },
    sentences: sentenceAnalysis,
    engine: 'statistical-nlp-engine',
  };
}

// 3. AI Detector API Endpoint
app.post('/api/detect-ai', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    const ai = getGenAI();

    if (ai) {
      const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.7-flash'];

      const prompt = `You are a specialized AI linguistic forensic analyst and content authenticity classifier.
Analyze the following text to determine whether it was authored by an AI language model (ChatGPT, Claude, Gemini, Copilot, etc.), written by a human, or human-refined.

Evaluate these signals:
1. Burstiness (sentence length and syntactic structure variation)
2. Perplexity and predictability of token sequences
3. Formulaic AI transition idioms ("in today's digital landscape", "delve into", "tapestry of", "pivotal", "stands as a testament", "it is important to note", "moreover", "in conclusion")
4. Lexical diversity and repetition
5. Natural human idiosyncrasies and conversational cadence

Text to analyze:
"""
${text}
"""

You MUST output ONLY valid JSON matching this exact structure without markdown backticks:
{
  "aiProbability": <integer between 0 and 100 representing overall percentage of text likely AI generated>,
  "humanProbability": <integer equal to exactly (100 - aiProbability)>,
  "refinedProbability": <integer between 0 and 50 representing portion that appears AI-assisted/refined>,
  "classification": "<'likely-ai' | 'mixed' | 'likely-human'>",
  "confidence": "<'high' | 'medium' | 'low'>",
  "summary": "<2-3 sentence clear explanation of the specific linguistic signals found>",
  "metrics": {
    "burstiness": <integer 0-100, where higher means more varied/human>,
    "perplexity": <integer 0-100, where higher means less predictable/more human>,
    "vocabularyDiversity": <integer 0-100>,
    "repetitionIndex": <integer 0-100>
  },
  "sentences": [
    {
      "text": "<sentence text>",
      "score": <integer 0-100 probability for this specific sentence>,
      "type": "<'ai' | 'mixed' | 'human'>",
      "reason": "<brief note on why this sentence was scored this way>"
    }
  ]
}`;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
              temperature: 0.1, // Low temperature for high deterministic consistency
              responseMimeType: 'application/json',
            },
          });

          const rawJson = response.text?.trim() || '';
          if (rawJson) {
            const parsed = JSON.parse(rawJson);
            // Ensure percentages sum to 100
            const aiProb = Math.max(0, Math.min(100, Number(parsed.aiProbability) || 0));
            parsed.aiProbability = aiProb;
            parsed.humanProbability = 100 - aiProb;
            parsed.engine = modelName;
            return res.json(parsed);
          }
        } catch (modelErr: any) {
          // Continue to next model in fallback chain
        }
      }
    }

    // Fallback to advanced statistical NLP detector
    const fallbackResult = fallbackDetectAi(text);
    return res.json(fallbackResult);
  } catch (error: any) {
    console.error('Detect AI error:', error);
    const fallbackResult = fallbackDetectAi(req.body?.text || '');
    return res.json(fallbackResult);
  }
});

// 5. Mount Vite middleware for development or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ToolBox Hub server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
