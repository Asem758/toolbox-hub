import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import { downloadBlob, copyToClipboard } from '../../lib/utils';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Palette,
  Layout,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Eye,
  Layers,
  Upload,
  Zap,
  Star,
  CheckCheck,
  RefreshCw,
  FolderDown,
  Monitor,
  Smartphone,
  Maximize2,
  Trash2,
  Award,
  Type,
  Plus,
  Flame,
  Cpu,
  User,
  Wand2,
  Bot,
  Workflow,
  Mic,
  MessageSquare,
  Search,
} from 'lucide-react';

// Design styles available
type DesignStyle = 'modern' | 'tech' | 'creative' | 'corporate' | 'minimal' | 'bold-yellow';

// Layout presets matching reference images & top freelance gigs
type LayoutType =
  | 'boxed-accent-pills'     // Image 1 style: Boxed yellow keywords, white headline, 2x2/2x3 rounded pill badges
  | 'centered-flanked'       // Image 2 style: Centered portrait, top title, flanked by 3+3 logo cards
  | 'split-hero'             // Classic Pro: Left massive headline, glowing keyword hook, bottom stack badges row
  | 'modern-bullets'         // Agency Checklist: Top badge, massive headline, 4 vertical checklist cards
  | 'bento-grid'             // Bento Grid: Modular glass bento cards with metrics, primary stack icons & portrait
  | 'badge-flank-bottom'     // Header & 8-Tool Ribbon: Bold header, center preview, bottom 8-tool grid
  | 'minimalist-dark-card'   // Dark Luxury: High-contrast typography with floating glowing rating chips
  | 'split-showcase-metric'  // 3-Metric High Roller: Verified Level 2 / Pro Top Banner, 3 Big Metric Stats + Tech Stack
  | 'neon-cyber-agency'      // Neon Cyber Agency: Glowing Cyber frame, Triple Feature Badges, Neon Taglines
  | 'app-store-mockup'       // Phone & Web Mockup: App Store badge, dual device screen cards, high-ticket mobile dev
  | 'gradient-pill-saas';    // Modern SaaS Ribbon: Mega Gradient Badge, 3x2 Glass Deliverable Tiles, 24h Express Seal

// Color Palette Theme
interface ColorTheme {
  id: string;
  name: string;
  bgGradStart: string;
  bgGradEnd: string;
  cardBg: string;
  cardBorder: string;
  highlightColor: string; // Vibrant glowing keyword color
  primaryAccent: string;
  secondaryAccent: string;
  textColor: string;
  textMuted: string;
  badgeBg: string;
  badgeText: string;
  rimLight: string;
}

const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'sunset-crimson-gold',
    name: 'Sunset Flame & Radiant Glow (Image 1)',
    bgGradStart: '#09050b',
    bgGradEnd: '#1b0710',
    cardBg: 'rgba(25, 10, 18, 0.85)',
    cardBorder: 'rgba(255, 80, 0, 0.4)',
    highlightColor: '#facc15', // Vibrant Gold / Yellow Box
    primaryAccent: '#ff4500', // Sunset Flame Orange
    secondaryAccent: '#fbbf24',
    textColor: '#ffffff',
    textMuted: '#cbd5e1',
    badgeBg: '#facc15',
    badgeText: '#000000',
    rimLight: 'rgba(255, 70, 0, 0.65)',
  },
  {
    id: 'deep-teal-studio',
    name: 'Deep Studio Teal & Crisp White (Image 2)',
    bgGradStart: '#041619',
    bgGradEnd: '#082f35',
    cardBg: 'rgba(6, 38, 44, 0.8)',
    cardBorder: 'rgba(45, 212, 191, 0.35)',
    highlightColor: '#2dd4bf', // Glowing Teal / Aqua
    primaryAccent: '#0d9488',
    secondaryAccent: '#14b8a6',
    textColor: '#ffffff',
    textMuted: '#99f6e4',
    badgeBg: '#2dd4bf',
    badgeText: '#042f2e',
    rimLight: 'rgba(45, 212, 191, 0.45)',
  },
  {
    id: 'cyber-dark-gold',
    name: 'Pro Dark & Vibe Gold',
    bgGradStart: '#08080a',
    bgGradEnd: '#131318',
    cardBg: 'rgba(25, 25, 35, 0.75)',
    cardBorder: 'rgba(245, 158, 11, 0.35)',
    highlightColor: '#facc15', // Ultra prominent glowing yellow/gold
    primaryAccent: '#f59e0b',
    secondaryAccent: '#fbbf24',
    textColor: '#ffffff',
    textMuted: '#94a3b8',
    badgeBg: '#f59e0b',
    badgeText: '#000000',
    rimLight: 'rgba(245, 158, 11, 0.45)',
  },
  {
    id: 'royal-purple-vibe',
    name: 'Vibe Purple & Neon Cyan',
    bgGradStart: '#0d0728',
    bgGradEnd: '#240f5a',
    cardBg: 'rgba(40, 20, 95, 0.75)',
    cardBorder: 'rgba(168, 85, 247, 0.4)',
    highlightColor: '#38bdf8', // Neon Sky Cyan
    primaryAccent: '#a855f7',
    secondaryAccent: '#c084fc',
    textColor: '#ffffff',
    textMuted: '#cbd5e1',
    badgeBg: '#a855f7',
    badgeText: '#ffffff',
    rimLight: 'rgba(168, 85, 247, 0.5)',
  },
  {
    id: 'fiverr-emerald',
    name: 'Fiverr Emerald & Lime',
    bgGradStart: '#05120d',
    bgGradEnd: '#0d281e',
    cardBg: 'rgba(15, 45, 35, 0.75)',
    cardBorder: 'rgba(16, 185, 129, 0.35)',
    highlightColor: '#4ade80', // Glowing Neon Lime Green
    primaryAccent: '#10b981',
    secondaryAccent: '#34d399',
    textColor: '#ffffff',
    textMuted: '#94a3b8',
    badgeBg: '#10b981',
    badgeText: '#041f16',
    rimLight: 'rgba(16, 185, 129, 0.45)',
  },
  {
    id: 'cyber-cyan-navy',
    name: 'Cyber Cyan & Deep Navy',
    bgGradStart: '#030b17',
    bgGradEnd: '#0a1d36',
    cardBg: 'rgba(12, 38, 70, 0.75)',
    cardBorder: 'rgba(6, 182, 212, 0.4)',
    highlightColor: '#22d3ee', // Bright Cyan
    primaryAccent: '#06b6d4',
    secondaryAccent: '#38bdf8',
    textColor: '#ffffff',
    textMuted: '#94a3b8',
    badgeBg: '#06b6d4',
    badgeText: '#021824',
    rimLight: 'rgba(6, 182, 212, 0.45)',
  },
  {
    id: 'crimson-ruby',
    name: 'Crimson Flame & Amber',
    bgGradStart: '#140508',
    bgGradEnd: '#2e0a12',
    cardBg: 'rgba(60, 15, 25, 0.75)',
    cardBorder: 'rgba(244, 63, 94, 0.4)',
    highlightColor: '#fb7185', // Rose Flame
    primaryAccent: '#f43f5e',
    secondaryAccent: '#fda4af',
    textColor: '#ffffff',
    textMuted: '#cbd5e1',
    badgeBg: '#f43f5e',
    badgeText: '#ffffff',
    rimLight: 'rgba(244, 63, 94, 0.45)',
  },
  {
    id: 'minimal-slate-white',
    name: 'Clean Light & Royal Blue',
    bgGradStart: '#f8fafc',
    bgGradEnd: '#e2e8f0',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    cardBorder: 'rgba(148, 163, 184, 0.35)',
    highlightColor: '#0284c7', // Sharp Royal Blue
    primaryAccent: '#0f172a',
    secondaryAccent: '#2563eb',
    textColor: '#0f172a',
    textMuted: '#475569',
    badgeBg: '#0f172a',
    badgeText: '#ffffff',
    rimLight: 'rgba(37, 99, 235, 0.25)',
  },
];

// Tech stack / Skill badge categories
type BadgeCategory = 'all' | 'vibe-dev' | 'mobile-apps' | 'ai-automation' | 'ai-agents' | 'voice-chatbots' | 'backend-db';

// Tech stack / Skill badges
interface StackBadge {
  id: string;
  name: string;
  color: string;
  iconSymbol: string;
  category: BadgeCategory;
}

const POPULAR_STACK_BADGES: StackBadge[] = [
  // 1. Vibe Coding & AI-Powered Web App Builders
  { id: 'base44', name: 'Base44', color: '#ff5722', iconSymbol: '⚡', category: 'vibe-dev' },
  { id: 'replit', name: 'Replit Agent', color: '#f26207', iconSymbol: '💻', category: 'vibe-dev' },
  { id: 'blink', name: 'Blink.new', color: '#06b6d4', iconSymbol: '⚡', category: 'vibe-dev' },
  { id: 'lovable', name: 'Lovable.dev', color: '#ec4899', iconSymbol: '♥', category: 'vibe-dev' },
  { id: 'bolt', name: 'Bolt.new', color: '#eab308', iconSymbol: '⚡', category: 'vibe-dev' },
  { id: 'cursor', name: 'Cursor IDE', color: '#38bdf8', iconSymbol: '⭘', category: 'vibe-dev' },
  { id: 'windsurf', name: 'Windsurf Code', color: '#0ea5e9', iconSymbol: '🏄', category: 'vibe-dev' },
  { id: 'v0', name: 'v0.dev / Vercel', color: '#ffffff', iconSymbol: '▲', category: 'vibe-dev' },
  { id: 'marblism', name: 'Marblism', color: '#a855f7', iconSymbol: '🏛', category: 'vibe-dev' },
  { id: 'createxyz', name: 'Create.xyz', color: '#ec4899', iconSymbol: '✨', category: 'vibe-dev' },
  { id: 'websim', name: 'Websim.ai', color: '#8b5cf6', iconSymbol: '🌐', category: 'vibe-dev' },
  { id: 'pythagora', name: 'Pythagora AI', color: '#10b981', iconSymbol: '📐', category: 'vibe-dev' },
  { id: 'devin', name: 'Devin AI', color: '#6366f1', iconSymbol: '🤖', category: 'vibe-dev' },
  { id: 'copilot', name: 'GitHub Copilot', color: '#94a3b8', iconSymbol: '🐙', category: 'vibe-dev' },
  { id: 'react', name: 'React.js', color: '#06b6d4', iconSymbol: '⚛', category: 'vibe-dev' },
  { id: 'nextjs', name: 'Next.js', color: '#ffffff', iconSymbol: 'N', category: 'vibe-dev' },
  { id: 'tailwind', name: 'Tailwind CSS', color: '#38bdf8', iconSymbol: '🌊', category: 'vibe-dev' },
  { id: 'typescript', name: 'TypeScript', color: '#3178c6', iconSymbol: 'TS', category: 'vibe-dev' },
  { id: 'figma', name: 'Figma UI/UX', color: '#f43f5e', iconSymbol: '❖', category: 'vibe-dev' },

  // 2. AI Mobile App Tools & Frameworks
  { id: 'flutterflow', name: 'FlutterFlow', color: '#6366f1', iconSymbol: '📱', category: 'mobile-apps' },
  { id: 'react-native', name: 'React Native', color: '#06b6d4', iconSymbol: '📱', category: 'mobile-apps' },
  { id: 'expo', name: 'Expo Go', color: '#ffffff', iconSymbol: '▲', category: 'mobile-apps' },
  { id: 'flutter', name: 'Flutter App', color: '#0284c7', iconSymbol: '🎯', category: 'mobile-apps' },
  { id: 'draftbit', name: 'Draftbit', color: '#f97316', iconSymbol: '⚡', category: 'mobile-apps' },
  { id: 'ios-swift', name: 'iOS Swift', color: '#f43f5e', iconSymbol: '🍎', category: 'mobile-apps' },
  { id: 'android-kotlin', name: 'Android Kotlin', color: '#22c55e', iconSymbol: '🤖', category: 'mobile-apps' },
  { id: 'capacitor', name: 'Capacitor PWA', color: '#38bdf8', iconSymbol: '⚡', category: 'mobile-apps' },

  // 3. Backend, Database & Payment Gateways
  { id: 'supabase', name: 'Supabase DB', color: '#10b981', iconSymbol: '⚡', category: 'backend-db' },
  { id: 'firebase', name: 'Firebase', color: '#f59e0b', iconSymbol: '🔥', category: 'backend-db' },
  { id: 'postgresql', name: 'PostgreSQL', color: '#336791', iconSymbol: '🐘', category: 'backend-db' },
  { id: 'vercel', name: 'Vercel Deploy', color: '#ffffff', iconSymbol: '▲', category: 'backend-db' },
  { id: 'stripe', name: 'Stripe Pay', color: '#6366f1', iconSymbol: 'S', category: 'backend-db' },
  { id: 'node', name: 'Node.js API', color: '#22c55e', iconSymbol: '⬢', category: 'backend-db' },
  { id: 'cloudflare', name: 'Cloudflare', color: '#f97316', iconSymbol: '☁', category: 'backend-db' },
  { id: 'prisma', name: 'Prisma ORM', color: '#2dd4bf', iconSymbol: '💎', category: 'backend-db' },

  // 4. AI Automation & Workflow Tools
  { id: 'n8n', name: 'n8n', color: '#ff6d5a', iconSymbol: '🔀', category: 'ai-automation' },
  { id: 'make', name: 'Make.com', color: '#8b5cf6', iconSymbol: '🟣', category: 'ai-automation' },
  { id: 'zapier', name: 'Zapier', color: '#ff4a00', iconSymbol: '✴', category: 'ai-automation' },
  { id: 'activepieces', name: 'Activepieces', color: '#e11d48', iconSymbol: '🧩', category: 'ai-automation' },
  { id: 'gumloop', name: 'Gumloop AI', color: '#ec4899', iconSymbol: '🔄', category: 'ai-automation' },
  { id: 'openai', name: 'OpenAI API', color: '#10a37f', iconSymbol: '⚝', category: 'ai-automation' },
  { id: 'anthropic', name: 'Claude AI', color: '#d97706', iconSymbol: '✦', category: 'ai-automation' },
  { id: 'deepseek', name: 'DeepSeek', color: '#3b82f6', iconSymbol: '🐋', category: 'ai-automation' },
  { id: 'gemini', name: 'Gemini API', color: '#4285f4', iconSymbol: '✨', category: 'ai-automation' },
  { id: 'firecrawl', name: 'Firecrawl', color: '#f97316', iconSymbol: '🔥', category: 'ai-automation' },
  { id: 'relevance', name: 'Relevance AI', color: '#6366f1', iconSymbol: '⚡', category: 'ai-automation' },

  // 5. AI Agents & Multi-Agent Frameworks
  { id: 'crewai', name: 'CrewAI', color: '#fb923c', iconSymbol: '👥', category: 'ai-agents' },
  { id: 'langchain', name: 'LangChain', color: '#22c55e', iconSymbol: '🦜', category: 'ai-agents' },
  { id: 'autogen', name: 'AutoGen', color: '#38bdf8', iconSymbol: '🤖', category: 'ai-agents' },
  { id: 'llamaindex', name: 'LlamaIndex', color: '#ec4899', iconSymbol: '🦙', category: 'ai-agents' },
  { id: 'dify', name: 'Dify.ai', color: '#3b82f6', iconSymbol: '💡', category: 'ai-agents' },
  { id: 'custom-agents', name: 'Custom Agents', color: '#a855f7', iconSymbol: '🧠', category: 'ai-agents' },
  { id: 'flowise', name: 'Flowise AI', color: '#0284c7', iconSymbol: '🌊', category: 'ai-agents' },
  { id: 'pinecone', name: 'Pinecone / RAG', color: '#14b8a6', iconSymbol: '🌲', category: 'ai-agents' },
  { id: 'qdrant', name: 'Qdrant Vector', color: '#f43f5e', iconSymbol: '🔴', category: 'ai-agents' },
  { id: 'python', name: 'Python', color: '#3b82f6', iconSymbol: '🐍', category: 'ai-agents' },
  { id: 'fastapi', name: 'FastAPI', color: '#10b981', iconSymbol: '⚡', category: 'ai-agents' },
  { id: 'docker', name: 'Docker / Cloud', color: '#0ea5e9', iconSymbol: '🐳', category: 'ai-agents' },

  // 6. Voice & Chatbots
  { id: 'voiceflow', name: 'Voiceflow', color: '#2563eb', iconSymbol: '🎙', category: 'voice-chatbots' },
  { id: 'vapi', name: 'Vapi.ai', color: '#a855f7', iconSymbol: '📞', category: 'voice-chatbots' },
  { id: 'bland', name: 'Bland AI', color: '#f43f5e', iconSymbol: '🗣', category: 'voice-chatbots' },
  { id: 'elevenlabs', name: 'ElevenLabs', color: '#ffffff', iconSymbol: '🔊', category: 'voice-chatbots' },
  { id: 'retell', name: 'Retell AI', color: '#06b6d4', iconSymbol: '🎧', category: 'voice-chatbots' },
  { id: 'chatbots', name: 'AI Chatbot', color: '#06b6d4', iconSymbol: '💬', category: 'voice-chatbots' },
  { id: 'botpress', name: 'Botpress', color: '#8b5cf6', iconSymbol: '🤖', category: 'voice-chatbots' },
  { id: 'twilio', name: 'Twilio Voice', color: '#f43f5e', iconSymbol: '☎', category: 'voice-chatbots' },
];

// Quick Niche Presets (matching the user's reference images & high-demand freelance niches)
interface GigPreset {
  name: string;
  category: string;
  title: string;
  keywordHighlight: string;
  mainHeadline: string;
  subheading: string;
  bullets: string[];
  pillBadges?: string[];
  selectedStack: string[];
  badge: string;
  themeId: string;
  style: DesignStyle;
  layout: LayoutType;
}

const GIG_PRESETS: GigPreset[] = [
  {
    name: 'Base44 & Replit Full Stack',
    category: 'Programming & Tech',
    title: 'I will build, review and fix web and mobile apps using Base44, Replit Agent, and Lovable',
    keywordHighlight: 'BASE44 & REPLIT',
    mainHeadline: 'FULL STACK AI\nWEB & MOBILE APP',
    subheading: 'Base44 • Replit • Blink.new • Supabase • Stripe • Vercel',
    bullets: ['Base44 & Replit Agent Logic Architecture', 'Clean Database & Auth Setup (Supabase)', 'Stripe Checkout & Billing Workflows', 'Fast Production Vercel & PWA Deploy'],
    pillBadges: ['Base44 Full-Stack', 'Replit Agent Sync', 'Supabase Auth/DB', 'Stripe Connect', 'Responsive UI/UX', 'Live 24h Deploy'],
    selectedStack: ['base44', 'replit', 'blink', 'lovable', 'supabase', 'stripe', 'vercel', 'cursor'],
    badge: 'VIBE CODING PRO',
    themeId: 'cyber-dark-gold',
    style: 'bold-yellow',
    layout: 'boxed-accent-pills',
  },
  {
    name: 'Blink.new & Bolt Rapid MVP',
    category: 'AI Services',
    title: 'I will turn your prompt into a live production web application with Blink.new, Bolt, and Cursor',
    keywordHighlight: 'BLINK.NEW & BOLT',
    mainHeadline: 'RAPID AI MVP &\nFULL WEB APP',
    subheading: 'Blink.new • Bolt.new • Lovable • Cursor • Supabase • Vercel',
    bullets: ['Prompt-to-Product Full Architecture', 'Clean Code Export & GitHub Sync', 'Custom Responsive UI/UX & Tailwind', '100% Production-Ready Hosting'],
    pillBadges: ['Blink.new MVP', 'Bolt.new Speed', 'GitHub Clean Code', 'Live 24h Deploy', 'Supabase Backend', 'Mobile Responsive'],
    selectedStack: ['blink', 'bolt', 'cursor', 'lovable', 'v0', 'supabase'],
    badge: 'TOP RATED DEV',
    themeId: 'deep-teal-studio',
    style: 'modern',
    layout: 'bento-grid',
  },
  {
    name: 'FlutterFlow & AI Mobile Apps',
    category: 'Programming & Tech',
    title: 'I will build custom iOS and Android mobile apps using FlutterFlow, React Native, and Expo',
    keywordHighlight: 'AI MOBILE APP',
    mainHeadline: 'FLUTTERFLOW &\nREACT NATIVE',
    subheading: 'iOS & Android • Supabase Backend • AI Logic • App Store Ready',
    bullets: ['Pixel-Perfect Mobile UI/UX in FlutterFlow', 'Supabase & Firebase Auth, DB & Storage', 'In-App Purchases & Stripe Subscriptions', 'App Store & Google Play Store Setup'],
    pillBadges: ['iOS & Android', 'FlutterFlow Pro', 'Supabase Backend', 'Fast 48h Delivery', 'In-App Purchases', 'App Store Ready'],
    selectedStack: ['flutterflow', 'react-native', 'expo', 'flutter', 'supabase', 'firebase'],
    badge: 'MOBILE APP EXPERT',
    themeId: 'sunset-crimson-gold',
    style: 'tech',
    layout: 'centered-flanked',
  },
  {
    name: 'Custom Website Expert (Image 1)',
    category: 'Web Development',
    title: 'I will create custom responsive websites with modern UI and API integration',
    keywordHighlight: 'CUSTOM',
    mainHeadline: 'WEBSITE',
    subheading: 'EXPERT',
    bullets: ['Bugs/Issues Fix & Speed', 'Custom API & DB Integration', '100% Mobile Responsive', '3D WebGL / Canvas Rendering'],
    pillBadges: ['Bugs/Issues Fix', 'Custom APIs', 'Mobile Responsive', '3D Rendering', 'Database Setup', 'Fast 24h Delivery'],
    selectedStack: ['react', 'nextjs', 'node', 'supabase', 'vercel', 'stripe'],
    badge: 'TOP RATED SELLER',
    themeId: 'sunset-crimson-gold',
    style: 'bold-yellow',
    layout: 'boxed-accent-pills',
  },
  {
    name: 'Vibe Coding Teal Studio (Image 2)',
    category: 'Programming & Tech',
    title: 'I will review, fix and build web apps using Lovable, Bolt, Cursor and Supabase',
    keywordHighlight: 'VIBE CODING',
    mainHeadline: 'REVIEW, FIX, AND CREATE',
    subheading: 'Lovable • Bolt.new • Cursor • Vercel • Supabase • Stripe',
    bullets: ['Instant Bug & Logic Fixes', 'Supabase Auth & PostgreSQL', 'Stripe Payments Setup', 'Production Vercel Deploy'],
    pillBadges: ['Instant Fixes', 'Supabase DB', 'Stripe Connect', 'Clean Architecture', 'API Integration', 'Full PWA Support'],
    selectedStack: ['lovable', 'bolt', 'supabase', 'vercel', 'cursor', 'stripe'],
    badge: 'AI DEV EXPERT',
    themeId: 'deep-teal-studio',
    style: 'modern',
    layout: 'centered-flanked',
  },
  {
    name: 'n8n & Make AI Automation',
    category: 'AI Automation & Workflows',
    title: 'I will build intelligent n8n, Make and Zapier AI automation workflows for your business',
    keywordHighlight: 'AI AUTOMATION',
    mainHeadline: 'N8N & MAKE.COM\nWORKFLOWS & BOTS',
    subheading: 'CRM Sync • Lead Qualification • Auto-Reporting • Webhooks',
    bullets: ['Custom n8n & Make Workflow Architecture', 'OpenAI & Claude API Logic Integration', 'Webhook, Airtable & CRM Auto-Sync', 'Tested & Production-Ready Deployment'],
    pillBadges: ['n8n Workflows', 'OpenAI Logic', 'CRM Auto-Sync', 'Fast 24h Setup', 'Custom Webhooks', 'Error Handling'],
    selectedStack: ['n8n', 'make', 'zapier', 'openai', 'anthropic', 'supabase'],
    badge: 'AUTOMATION EXPERT',
    themeId: 'cyber-dark-gold',
    style: 'bold-yellow',
    layout: 'split-hero',
  },
  {
    name: 'CrewAI & Custom AI Agents',
    category: 'AI Agents & Multi-Agent Systems',
    title: 'I will build custom multi-agent AI systems with CrewAI, AutoGen, and LangChain',
    keywordHighlight: 'AI AGENTS DEV',
    mainHeadline: 'CREWAI & AUTOGEN\nMULTI-AGENT SYSTEM',
    subheading: 'Autonomous Reasoning • Tool Calling • Memory • RAG Knowledge',
    bullets: ['Multi-Agent Roleplay & Task Delegation', 'LangChain & LlamaIndex RAG Pipelines', 'Custom Tool Calling & Web Scraping', 'Fast Python/FastAPI Container Deployment'],
    pillBadges: ['CrewAI Agents', 'LangChain RAG', 'Tool Calling', 'Python FastAPI', 'Vector DB Sync', 'Multi-Agent Logic'],
    selectedStack: ['crewai', 'autogen', 'langchain', 'openai', 'llamaindex', 'pinecone'],
    badge: 'AI AGENT SPECIALIST',
    themeId: 'royal-purple-vibe',
    style: 'modern',
    layout: 'bento-grid',
  },
  {
    name: 'AI Voice Calling Agents',
    category: 'AI Chatbots & Voice Agents',
    title: 'I will create human-like AI voice agents for cold calling and customer support with Vapi and Bland AI',
    keywordHighlight: 'AI VOICE AGENTS',
    mainHeadline: 'VAPI & BLAND.AI\nCALLING BOT PRO',
    subheading: 'Ultra Low Latency • Human Emotion • Inbound & Outbound Calling',
    bullets: ['Sub-500ms Latency Real-Time Voice Bot', 'Twilio Phone Number & CRM Booking', 'Custom Prompt Engineering & Objection Handling', 'Live Transfer & Call Transcription Logs'],
    pillBadges: ['Sub-500ms Voice', 'Twilio Booking', 'Live Transfer', 'CRM Webhook Sync', 'Emotion Control', 'Call Logs API'],
    selectedStack: ['vapi', 'bland', 'voiceflow', 'openai', 'make', 'twilio'],
    badge: 'TOP RATED VOICE AI',
    themeId: 'cyber-cyan-navy',
    style: 'tech',
    layout: 'centered-flanked',
  },
  {
    name: 'Voiceflow & Knowledge Chatbots',
    category: 'AI Chatbots & Voice Agents',
    title: 'I will develop custom AI chatbots trained on your business data with Voiceflow and RAG',
    keywordHighlight: 'AI CHATBOTS',
    mainHeadline: 'VOICEFLOW & RAG\nKNOWLEDGE BASE BOT',
    subheading: 'Trained on Your Website, PDFs, Notion & Custom Database',
    bullets: ['Smart Lead Capture & Meeting Scheduler', 'Custom Vector RAG Retrieval (Pinecone)', 'WhatsApp, Telegram & Web Widget Setup', 'Analytics Dashboard & Admin Controls'],
    pillBadges: ['PDF/Notion RAG', 'Lead Capture Bot', 'WhatsApp Widget', 'Vector Database', 'Custom Prompts', 'Admin Analytics'],
    selectedStack: ['voiceflow', 'chatbots', 'openai', 'langchain', 'pinecone', 'make'],
    badge: 'CERTIFIED BOT BUILDER',
    themeId: 'fiverr-emerald',
    style: 'modern',
    layout: 'split-hero',
  },
  {
    name: 'Full Stack 8-Tool Ribbon Stack',
    category: 'Programming & Tech',
    title: 'I will build responsive web applications in React Next.js Node and Cloud databases',
    keywordHighlight: 'FULL STACK DEV',
    mainHeadline: 'MODERN WEB APPS\n& FAST APIS',
    subheading: 'React • Next.js • TypeScript • Node • Supabase • Stripe',
    bullets: ['Modern Component Design', 'REST & GraphQL APIs', 'SEO & Speed Optimized', '100% Responsive Design'],
    pillBadges: ['React & Next.js', 'PostgreSQL DB', 'Stripe Checkout', 'SEO Optimized', 'Node.js REST API', 'Docker Deploy'],
    selectedStack: ['react', 'nextjs', 'node', 'supabase', 'vercel', 'stripe', 'python', 'docker'],
    badge: 'PRO DEVELOPER',
    themeId: 'cyber-cyan-navy',
    style: 'tech',
    layout: 'badge-flank-bottom',
  },
  {
    name: 'Dark Luxury Brand & UI/UX',
    category: 'Graphics & Design',
    title: 'I will design high-converting minimalist UI UX and web layouts',
    keywordHighlight: 'UI/UX DESIGN',
    mainHeadline: 'MODERN MINIMAL\nPRODUCT DESIGN',
    subheading: 'Figma • High-Conversion UI • Mobile Responsive • Design Systems',
    bullets: ['3 High Fidelity UI Screens', 'Design Tokens & Typography', 'Clickable Figma Prototype', 'Commercial Rights Included'],
    pillBadges: ['Figma System', 'Responsive UI', 'Pixel Perfect', 'Fast 24h Delivery', 'Clean Typography', 'Asset Export'],
    selectedStack: ['figma', 'react', 'nextjs'],
    badge: 'TOP RATED QUALITY',
    themeId: 'minimalist-dark-card',
    style: 'minimal',
    layout: 'minimalist-dark-card',
  },
];

export const FiverrGigImageGenerator: React.FC = () => {
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Form States - Headline & Prominent Keyword
  const [gigTitle, setGigTitle] = useState<string>('I will create custom responsive websites with modern UI and API integration');
  const [serviceCategory, setServiceCategory] = useState<string>('Web Development');
  const [keywordHighlight, setKeywordHighlight] = useState<string>('CUSTOM');
  const [mainHeadline, setMainHeadline] = useState<string>('WEBSITE');
  const [subheading, setSubheading] = useState<string>('EXPERT');
  const [fontSizeTier, setFontSizeTier] = useState<'huge' | 'ultra' | 'massive'>('ultra');

  // Bullet points
  const [bullets, setBullets] = useState<string[]>([
    'Bugs/Issues Fix & Speed',
    'Custom API & DB Integration',
    '100% Mobile Responsive',
    '3D WebGL / Canvas Rendering',
  ]);

  // 2x3 Feature Pill Badges (For Image 1 Boxed layout and Bento grid)
  const [pillBadges, setPillBadges] = useState<string[]>([
    'Bugs/Issues Fix',
    'Custom APIs',
    'Mobile Responsive',
    '3D Rendering',
    'Database Setup',
    'Fast 24h Delivery',
  ]);

  // Stack badges selection & category filter
  const [selectedBadges, setSelectedBadges] = useState<string[]>(['react', 'nextjs', 'node', 'supabase', 'vercel', 'stripe']);
  const [badgeFilterCategory, setBadgeFilterCategory] = useState<BadgeCategory>('all');
  const [badgeSearchQuery, setBadgeSearchQuery] = useState<string>('');

  // Seller Details & Badges
  const [sellerName, setSellerName] = useState<string>('Alex Rivera');
  const [badgeText, setBadgeText] = useState<string>('TOP RATED SELLER');
  const [ratingText, setRatingText] = useState<string>('5.0 (480+ Reviews)');

  // Styling & Theme
  const [designStyle, setDesignStyle] = useState<DesignStyle>('bold-yellow');
  const [layoutType, setLayoutType] = useState<LayoutType>('boxed-accent-pills');
  const [selectedThemeId, setSelectedThemeId] = useState<string>('sunset-crimson-gold');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState<'fit' | 'thumbnail'>('fit');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Active theme
  const currentTheme = useMemo(() => {
    return COLOR_THEMES.find((t) => t.id === selectedThemeId) || COLOR_THEMES[0];
  }, [selectedThemeId]);

  // Filtered stack badges
  const filteredBadges = useMemo(() => {
    return POPULAR_STACK_BADGES.filter((b) => {
      const matchCat = badgeFilterCategory === 'all' || b.category === badgeFilterCategory;
      const matchSearch = b.name.toLowerCase().includes(badgeSearchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [badgeFilterCategory, badgeSearchQuery]);

  // Fiverr Policy & Compliance Audit Engine
  const complianceAudit = useMemo(() => {
    const issues: { type: 'error' | 'warning'; message: string; fix?: string }[] = [];
    const lowerTitle = gigTitle.toLowerCase();
    const lowerKeyword = keywordHighlight.toLowerCase();
    const lowerHeadline = mainHeadline.toLowerCase();
    const allText = `${lowerTitle} ${lowerKeyword} ${lowerHeadline} ${subheading.toLowerCase()} ${bullets.join(' ').toLowerCase()} ${badgeText.toLowerCase()}`;

    // 1. Prohibited Unsupported Guarantees
    if (allText.includes('guaranteed #1') || allText.includes('100% guarantee') || allText.includes('guaranteed rank') || allText.includes('guaranteed sales')) {
      issues.push({
        type: 'error',
        message: 'Unsupported guarantee found (e.g. "Guaranteed #1" or "100% sales"). Fiverr prohibits unrealistic outcome promises.',
        fix: 'Replace with "Proven Architecture" or "High-Converting Results".',
      });
    }

    // 2. Prohibited External Contact Info
    if (allText.includes('whatsapp') || allText.includes('telegram') || allText.includes('skype') || allText.includes('@') || allText.includes('email me') || allText.includes('+1') || allText.includes('.com/')) {
      issues.push({
        type: 'error',
        message: 'External contact info detected (WhatsApp, Telegram, email). Directing clients off-platform violates Fiverr TOS.',
        fix: 'Remove off-platform contact details from your image.',
      });
    }

    // 3. Prohibited Fake Official Badges
    if (badgeText.toLowerCase().includes('fiverr choice') || badgeText.toLowerCase().includes('fiverr select') || badgeText.toLowerCase().includes('fiverr official')) {
      issues.push({
        type: 'error',
        message: 'Imitating official platform badges like "Fiverr Choice" or "Fiverr Select" is prohibited.',
        fix: 'Use badges like "Top Rated Quality", "Expert Verified", or "Fast 24h Delivery".',
      });
    }

    // 4. Text Density / Readability
    const totalWords = `${keywordHighlight} ${mainHeadline} ${subheading} ${bullets.join(' ')}`.split(/\s+/).filter(Boolean).length;
    if (totalWords > 32) {
      issues.push({
        type: 'warning',
        message: `High text density (${totalWords} words). Fiverr recommends concise images with under 20-25 words for maximum mobile thumbnail CTR.`,
        fix: 'Keep headlines punchy and shorten bullet points.',
      });
    }

    const isCompliant = issues.filter((i) => i.type === 'error').length === 0;
    const score = Math.max(20, 100 - issues.length * 20);

    return { isCompliant, score, issues };
  }, [gigTitle, keywordHighlight, mainHeadline, subheading, bullets, badgeText]);

  // Load a preset
  const handleApplyPreset = (preset: GigPreset) => {
    setGigTitle(preset.title);
    setServiceCategory(preset.category);
    setKeywordHighlight(preset.keywordHighlight);
    setMainHeadline(preset.mainHeadline);
    setSubheading(preset.subheading);
    setBullets([...preset.bullets]);
    if (preset.pillBadges && preset.pillBadges.length > 0) {
      const fullPills = [...preset.pillBadges];
      while (fullPills.length < 6) {
        fullPills.push(`Deliverable #${fullPills.length + 1}`);
      }
      setPillBadges(fullPills.slice(0, 6));
    }
    setSelectedBadges([...preset.selectedStack]);
    setBadgeText(preset.badge);
    setSelectedThemeId(preset.themeId);
    setDesignStyle(preset.style);
    setLayoutType(preset.layout);
    showToast(`Loaded preset: "${preset.name}"`, 'success');
  };

  // Toggle stack badge
  const handleToggleBadge = (id: string) => {
    if (selectedBadges.includes(id)) {
      setSelectedBadges(selectedBadges.filter((b) => b !== id));
    } else {
      if (selectedBadges.length < 8) {
        setSelectedBadges([...selectedBadges, id]);
      } else {
        showToast('Maximum 8 badges recommended for clean visual spacing', 'info');
      }
    }
  };

  // Add/Remove bullet points
  const handleAddBullet = () => {
    if (bullets.length < 4) {
      setBullets([...bullets, 'Fast 24-Hour Express Turnaround']);
    } else {
      showToast('Maximum 4 bullet points recommended for best thumbnail clarity', 'info');
    }
  };

  const handleUpdateBullet = (index: number, value: string) => {
    const updated = [...bullets];
    updated[index] = value;
    setBullets(updated);
  };

  const handleRemoveBullet = (index: number) => {
    if (bullets.length > 1) {
      setBullets(bullets.filter((_, i) => i !== index));
    }
  };

  // Add/Remove Feature Pill Badges (Dynamic 1 to 6 badges)
  const handleAddPillBadge = () => {
    if (pillBadges.length < 6) {
      setPillBadges([...pillBadges, `Deliverable #${pillBadges.length + 1}`]);
      showToast(`Added Pill Badge #${pillBadges.length + 1}`, 'success');
    } else {
      showToast('Maximum 6 pill badges allowed for optimal layout design', 'info');
    }
  };

  const handleRemovePillBadge = (index: number) => {
    if (pillBadges.length > 1) {
      setPillBadges(pillBadges.filter((_, i) => i !== index));
      showToast('Pill badge removed', 'info');
    } else {
      showToast('At least 1 pill badge is required', 'info');
    }
  };

  // Update Feature Pill Badge
  const handleUpdatePillBadge = (index: number, value: string) => {
    const updated = [...pillBadges];
    updated[index] = value;
    setPillBadges(updated);
  };

  // Handle custom image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setUploadedImage(ev.target.result as string);
        showToast('Portrait image uploaded successfully', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Canvas Drawing Function (High-Resolution 1280x769)
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Helper 1: Fit Single Line Text into a maximum width with dynamic font scaling & ellipsis
    const fitSingleLineText = (
      text: string,
      maxWidth: number,
      initialSize: number,
      minSize: number = 14,
      fontFamily: string = 'system-ui, -apple-system, sans-serif',
      fontWeight: string = '900'
    ): { fontSize: number; fittedText: string; textWidth: number } => {
      let size = initialSize;
      let currentText = text.trim();
      if (!currentText) return { fontSize: size, fittedText: '', textWidth: 0 };

      ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
      let width = ctx.measureText(currentText).width;

      while (width > maxWidth && size > minSize) {
        size -= 2;
        ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
        width = ctx.measureText(currentText).width;
      }

      if (width > maxWidth) {
        while (currentText.length > 3 && width > maxWidth) {
          currentText = currentText.slice(0, -1);
          ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
          width = ctx.measureText(currentText + '...').width;
        }
        currentText += '...';
      }

      return { fontSize: size, fittedText: currentText, textWidth: width };
    };

    // Helper 2: Wrap & Fit Multi-Line Text into maximum width and max lines
    const wrapAndFitMultilineText = (
      rawText: string,
      maxWidth: number,
      maxLines: number,
      initialSize: number,
      minSize: number = 20,
      fontFamily: string = 'system-ui, -apple-system, sans-serif',
      fontWeight: string = '900'
    ): { lines: string[]; fontSize: number; lineHeight: number } => {
      let size = initialSize;
      const textToWrap = rawText.trim();
      if (!textToWrap) return { lines: [], fontSize: size, lineHeight: size * 1.15 };

      while (size >= minSize) {
        ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
        const resultLines: string[] = [];
        const paragraphs = textToWrap.split('\n');

        let fits = true;
        for (const paragraph of paragraphs) {
          const words = paragraph.split(/\s+/).filter(Boolean);
          if (words.length === 0) continue;

          let currentLine = words[0];
          for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            const testWidth = ctx.measureText(testLine).width;
            if (testWidth <= maxWidth) {
              currentLine = testLine;
            } else {
              resultLines.push(currentLine);
              currentLine = words[i];
              if (resultLines.length >= maxLines) {
                fits = false;
                break;
              }
            }
          }
          if (currentLine) {
            resultLines.push(currentLine);
          }
          if (resultLines.length > maxLines) {
            fits = false;
          }
          if (!fits) break;
        }

        if (fits && resultLines.length <= maxLines) {
          return {
            lines: resultLines,
            fontSize: size,
            lineHeight: size * 1.12,
          };
        }

        size -= 3;
      }

      // Hard fallback at minSize: wrap words and truncate last line
      size = minSize;
      ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
      const resultLines: string[] = [];
      const words = textToWrap.replace(/\n/g, ' ').split(/\s+/).filter(Boolean);
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        if (ctx.measureText(testLine).width <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) resultLines.push(currentLine);
          currentLine = word;
          if (resultLines.length >= maxLines - 1) {
            break;
          }
        }
      }
      if (currentLine && resultLines.length < maxLines) {
        let last = currentLine;
        while (last.length > 3 && ctx.measureText(last + '...').width > maxWidth) {
          last = last.slice(0, -1);
        }
        resultLines.push(last.length < currentLine.length ? last + '...' : last);
      }

      return {
        lines: resultLines.slice(0, maxLines),
        fontSize: size,
        lineHeight: size * 1.12,
      };
    };

    // Fiverr recommended standard resolution: 1280 x 769 px
    const W = 1280;
    const H = 769;

    canvas.width = W;
    canvas.height = H;

    const theme = currentTheme;

    // 1. Background Base Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, theme.bgGradStart);
    bgGrad.addColorStop(1, theme.bgGradEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle Grid/Pattern for tech and cyber vibes
    if (designStyle === 'tech' || designStyle === 'bold-yellow') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    }

    // Studio Rim Light / Radiant Glow
    const glowX = layoutType === 'centered-flanked' ? W / 2 : W * 0.78;
    const glowY = H * 0.45;
    const radialGlow = ctx.createRadialGradient(glowX, glowY, 40, glowX, glowY, 490);
    radialGlow.addColorStop(0, theme.rimLight);
    radialGlow.addColorStop(0.5, `${theme.primaryAccent}22`);
    radialGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, W, H);

    // =========================================================================
    // LAYOUT 1: BOXED ACCENT & 2x2 PILLS (Image 1 Style)
    // =========================================================================
    if (layoutType === 'boxed-accent-pills') {
      // 1. Warm Sunset Halo Behind Portrait
      const sunsetGlow = ctx.createRadialGradient(W * 0.76, H * 0.45, 30, W * 0.76, H * 0.45, 420);
      sunsetGlow.addColorStop(0, 'rgba(255, 110, 0, 0.85)');
      sunsetGlow.addColorStop(0.35, 'rgba(255, 60, 20, 0.5)');
      sunsetGlow.addColorStop(0.7, 'rgba(200, 20, 40, 0.2)');
      sunsetGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = sunsetGlow;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      // Left Content Area (Bound to maximum width of 630px to guarantee zero overlap with portrait card at 720px)
      const maxLeftW = 630;
      let curY = 65;

      // 1. Top Boxed Keyword (e.g. "[CUSTOM]")
      const rawTop = (keywordHighlight.trim() || 'CUSTOM').toUpperCase();
      const topFit = fitSingleLineText(rawTop, maxLeftW - 48, 52, 26);
      const topBoxW = Math.min(maxLeftW, topFit.textWidth + 48);

      ctx.fillStyle = theme.highlightColor;
      ctx.beginPath();
      ctx.roundRect(50, curY, topBoxW, 72, 16);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = `900 ${topFit.fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillText(topFit.fittedText, 74, curY + 52);

      curY += 86;

      // 2. Massive Middle Headline (Wrapped and auto-fitted safely within 630px max width)
      const headlineRaw = (mainHeadline.trim() || 'WEBSITE').toUpperCase();
      const headFit = wrapAndFitMultilineText(headlineRaw, maxLeftW, 2, 78, 38);

      ctx.font = `900 ${headFit.fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 16;

      headFit.lines.forEach((line, i) => {
        ctx.fillText(line, 50, curY + (i + 1) * (headFit.lineHeight * 0.95));
      });
      ctx.shadowBlur = 0;

      curY += headFit.lines.length * (headFit.lineHeight * 0.95) + 20;

      // 3. Bottom Boxed Keyword (e.g. "[EXPERT]")
      const rawBottom = (subheading.trim() || 'EXPERT').toUpperCase();
      const botFit = fitSingleLineText(rawBottom, maxLeftW - 48, 52, 26);
      const botBoxW = Math.min(maxLeftW, botFit.textWidth + 48);

      ctx.fillStyle = theme.highlightColor;
      ctx.beginPath();
      ctx.roundRect(50, curY, botBoxW, 72, 16);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = `900 ${botFit.fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillText(botFit.fittedText, 74, curY + 52);

      curY += 100;

      // 4. Dynamic Rounded White Pill Badges Grid (1 to 6 Badges)
      const pillsGrid = pillBadges.slice(0, 6);
      const isCompact = pillsGrid.length > 4;
      const colWidth = 300;
      const rowHeight = isCompact ? 52 : 56;
      const gapX = 20;
      const gapY = isCompact ? 12 : 14;

      pillsGrid.forEach((pillRaw, idx) => {
        const row = Math.floor(idx / 2);
        const col = idx % 2;
        const pX = 50 + col * (colWidth + gapX);
        const pY = curY + row * (rowHeight + gapY);

        // Pill Card Background (White)
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(pX, pY, colWidth, rowHeight, isCompact ? 26 : 28);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Pill Bullet Dot
        ctx.fillStyle = theme.primaryAccent;
        ctx.beginPath();
        ctx.arc(pX + 22, pY + rowHeight / 2, isCompact ? 6 : 6.5, 0, Math.PI * 2);
        ctx.fill();

        // Fit Pill Text inside 230px
        const pillText = pillRaw.trim() || `Core Feature #${idx + 1}`;
        const pillFit = fitSingleLineText(pillText, 230, isCompact ? 16.5 : 18, 11, 'system-ui, -apple-system, sans-serif', '800');
        ctx.font = `800 ${pillFit.fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = '#0f172a';
        ctx.fillText(pillFit.fittedText, pX + 38, pY + (isCompact ? 33 : 35));
      });
      ctx.restore();

      // Right Side: Portrait with Glowing White Contour
      const portX = 720;
      const portY = 55;
      const portW = 510;
      const portH = 655;

      ctx.save();
      // Outer Frame / Studio Card
      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(portX, portY, portW, portH, 36);
      ctx.fill();
      ctx.stroke();

      if (uploadedImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = uploadedImage;
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(portX + 16, portY + 16, portW - 32, portH - 32, 28);
          ctx.clip();
          ctx.drawImage(img, portX + 16, portY + 16, portW - 32, portH - 32);
          ctx.restore();
        };
      } else {
        // High Quality Studio Avatar
        ctx.fillStyle = `${theme.primaryAccent}33`;
        ctx.beginPath();
        ctx.roundRect(portX + 16, portY + 16, portW - 32, portH - 32, 28);
        ctx.fill();

        // Silhouette / Badge Icon
        ctx.fillStyle = theme.highlightColor;
        ctx.font = '900 72px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', portX + portW / 2, portY + 260);

        // Rating Chip
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px sans-serif';
        ctx.fillText('5.0 ★ TOP RATED PRO', portX + portW / 2, portY + 330);

        ctx.font = '700 18px sans-serif';
        ctx.fillStyle = theme.textMuted;
        ctx.fillText('Verified Full Stack Expert', portX + portW / 2, portY + 370);

        // Floating Trust Tag
        ctx.fillStyle = theme.highlightColor;
        ctx.beginPath();
        ctx.roundRect(portX + 60, portY + 440, portW - 120, 52, 26);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.font = '900 18px sans-serif';
        ctx.fillText('100% SATISFACTION', portX + portW / 2, portY + 473);
      }
      ctx.restore();
    }

    // =========================================================================
    // LAYOUT 2: DUAL-COLUMN FLANKED STUDIO (Image 2 Style)
    // =========================================================================
    else if (layoutType === 'centered-flanked') {
      ctx.save();
      // 1. Top Huge Centered Keyword Hook
      ctx.textAlign = 'center';
      if (keywordHighlight.trim()) {
        const topFit = fitSingleLineText(keywordHighlight.toUpperCase(), 1160, 74, 34);
        ctx.font = `900 ${topFit.fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = theme.textColor;
        ctx.shadowColor = theme.highlightColor;
        ctx.shadowBlur = 24;
        ctx.fillText(topFit.fittedText, W / 2, 90);
        ctx.shadowBlur = 0;
      }

      // 2. Subtitle Banner (e.g. "REVIEW, FIX, AND CREATE")
      const subText = (subheading.trim() || 'REVIEW, FIX, AND CREATE').toUpperCase();
      const subFit = fitSingleLineText(subText, 1160, 26, 16, 'system-ui, sans-serif', '800');
      ctx.font = `800 ${subFit.fontSize}px sans-serif`;
      ctx.fillStyle = theme.highlightColor;
      ctx.fillText(subFit.fittedText, W / 2, 136);
      ctx.restore();

      // 3. Center Portrait Frame
      const centerW = 410;
      const centerH = 550;
      const centerX = (W - centerW) / 2;
      const centerY = 168;

      ctx.save();
      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(centerX, centerY, centerW, centerH, 32);
      ctx.fill();
      ctx.stroke();

      if (uploadedImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = uploadedImage;
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(centerX + 12, centerY + 12, centerW - 24, centerH - 24, 24);
          ctx.clip();
          ctx.drawImage(img, centerX + 12, centerY + 12, centerW - 24, centerH - 24);
          ctx.restore();
        };
      } else {
        // Stylized Center Avatar
        ctx.fillStyle = `${theme.primaryAccent}22`;
        ctx.beginPath();
        ctx.roundRect(centerX + 12, centerY + 12, centerW - 24, centerH - 24, 24);
        ctx.fill();

        ctx.fillStyle = theme.highlightColor;
        ctx.font = '900 64px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', W / 2, centerY + 240);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 22px sans-serif';
        ctx.fillText('AI AUTOMATION PRO', W / 2, centerY + 320);

        ctx.fillStyle = theme.highlightColor;
        ctx.font = '800 16px sans-serif';
        ctx.fillText('★ 5.0 (500+ Reviews)', W / 2, centerY + 360);
      }
      ctx.restore();

      // 4. Left Stack Badges (3 items)
      ctx.save();
      const leftBadges = selectedBadges.slice(0, 3);
      leftBadges.forEach((badgeId, idx) => {
        const badge = POPULAR_STACK_BADGES.find((b) => b.id === badgeId);
        if (!badge) return;
        const bY = 215 + idx * 118;
        const bX = 55;
        const bW = 300;

        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = theme.cardBorder;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bX, bY, bW, 88, 22);
        ctx.fill();
        ctx.stroke();

        const badgeLabel = `${badge.iconSymbol}  ${badge.name}`;
        const bFit = fitSingleLineText(badgeLabel, 240, 23, 14, 'system-ui, sans-serif', '900');
        ctx.font = `900 ${bFit.fontSize}px system-ui, sans-serif`;
        ctx.fillStyle = badge.color || '#ffffff';
        ctx.fillText(bFit.fittedText, bX + 26, bY + 53);
      });

      // 5. Right Stack Badges (3 items)
      const rightBadges = selectedBadges.slice(3, 6);
      rightBadges.forEach((badgeId, idx) => {
        const badge = POPULAR_STACK_BADGES.find((b) => b.id === badgeId);
        if (!badge) return;
        const bY = 215 + idx * 118;
        const bX = W - 355;
        const bW = 300;

        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = theme.cardBorder;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bX, bY, bW, 88, 22);
        ctx.fill();
        ctx.stroke();

        const badgeLabel = `${badge.iconSymbol}  ${badge.name}`;
        const bFit = fitSingleLineText(badgeLabel, 240, 23, 14, 'system-ui, sans-serif', '900');
        ctx.font = `900 ${bFit.fontSize}px system-ui, sans-serif`;
        ctx.fillStyle = badge.color || '#ffffff';
        ctx.fillText(bFit.fittedText, bX + 26, bY + 53);
      });
      ctx.restore();
    }

    // =========================================================================
    // LAYOUT 3: BENTO SHOWCASE GRID
    // =========================================================================
    else if (layoutType === 'bento-grid') {
      ctx.save();
      // Card 1: Top-Left Hero Card (W: 660, H: 380)
      const c1X = 50;
      const c1Y = 45;
      const c1W = 660;
      const c1H = 380;

      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(c1X, c1Y, c1W, c1H, 28);
      ctx.fill();
      ctx.stroke();

      // Category Pill
      const catFit = fitSingleLineText(serviceCategory.toUpperCase(), 280, 14, 11, 'sans-serif', '800');
      ctx.fillStyle = `${theme.highlightColor}22`;
      ctx.beginPath();
      ctx.roundRect(c1X + 28, c1Y + 28, catFit.textWidth + 24, 32, 16);
      ctx.fill();
      ctx.font = `800 ${catFit.fontSize}px sans-serif`;
      ctx.fillStyle = theme.highlightColor;
      ctx.fillText(catFit.fittedText, c1X + 40, c1Y + 49);

      // Huge Glowing Keyword (Fitted inside 600px)
      let hY = c1Y + 115;
      if (keywordHighlight.trim()) {
        const kwFit = fitSingleLineText(keywordHighlight.toUpperCase(), 600, 56, 32);
        ctx.font = `900 ${kwFit.fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = theme.highlightColor;
        ctx.shadowColor = theme.highlightColor;
        ctx.shadowBlur = 18;
        ctx.fillText(kwFit.fittedText, c1X + 28, hY);
        ctx.shadowBlur = 0;
        hY += 15;
      }

      // Headline (Wrapped cleanly inside 600px)
      const headFit = wrapAndFitMultilineText(mainHeadline.toUpperCase(), 600, 2, 50, 28);
      ctx.font = `900 ${headFit.fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = theme.textColor;
      headFit.lines.forEach((l) => {
        hY += headFit.lineHeight;
        ctx.fillText(l, c1X + 28, hY);
      });

      // Subheading (Fitted inside 600px)
      if (subheading.trim()) {
        hY += 32;
        const subFit = fitSingleLineText(subheading, 600, 18, 13, 'sans-serif', '600');
        ctx.font = `600 ${subFit.fontSize}px sans-serif`;
        ctx.fillStyle = theme.textMuted;
        ctx.fillText(subFit.fittedText, c1X + 28, hY);
      }

      // Card 2: Bottom-Left Feature Pills Card (W: 410, H: 275)
      const c2X = 50;
      const c2Y = 445;
      const c2W = 410;
      const c2H = 275;

      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(c2X, c2Y, c2W, c2H, 28);
      ctx.fill();
      ctx.stroke();

      ctx.font = '800 15px sans-serif';
      ctx.fillStyle = theme.highlightColor;
      const bentoPills = pillBadges.slice(0, 6);
      ctx.fillText(`CORE DELIVERABLES (${bentoPills.length}/6)`, c2X + 24, c2Y + 32);

      if (bentoPills.length <= 3) {
        // Single column layout for 1-3 deliverables
        const bColW = c2W - 48;
        const bRowH = 50;
        const bGapY = 12;

        bentoPills.forEach((pill, idx) => {
          const pX = c2X + 24;
          const pY = c2Y + 48 + idx * (bRowH + bGapY);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
          ctx.beginPath();
          ctx.roundRect(pX, pY, bColW, bRowH, 14);
          ctx.fill();

          ctx.fillStyle = theme.highlightColor;
          ctx.font = '900 14px sans-serif';
          ctx.fillText('✓', pX + 16, pY + 30);

          const pillFit = fitSingleLineText(pill || `Deliverable #${idx + 1}`, bColW - 48, 15, 11, 'sans-serif', '700');
          ctx.fillStyle = '#ffffff';
          ctx.font = `700 ${pillFit.fontSize}px sans-serif`;
          ctx.fillText(pillFit.fittedText, pX + 38, pY + 30);
        });
      } else {
        // 2-column grid layout for 4-6 deliverables
        const bColW = (c2W - 48 - 12) / 2; // ~174px each
        const bRowH = 58;
        const bGapY = 10;

        bentoPills.forEach((pill, idx) => {
          const row = Math.floor(idx / 2);
          const col = idx % 2;
          const pX = c2X + 24 + col * (bColW + 12);
          const pY = c2Y + 46 + row * (bRowH + bGapY);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
          ctx.beginPath();
          ctx.roundRect(pX, pY, bColW, bRowH, 14);
          ctx.fill();

          ctx.fillStyle = theme.highlightColor;
          ctx.font = '900 13px sans-serif';
          ctx.fillText('✓', pX + 12, pY + 34);

          const pillFit = fitSingleLineText(pill || `Deliverable #${idx + 1}`, bColW - 34, 13.5, 10, 'sans-serif', '700');
          ctx.fillStyle = '#ffffff';
          ctx.font = `700 ${pillFit.fontSize}px sans-serif`;
          ctx.fillText(pillFit.fittedText, pX + 28, pY + 34);
        });
      }

      // Card 3: Bottom-Mid Metric Card (W: 230, H: 275)
      const c3X = 480;
      const c3Y = 445;
      const c3W = 230;
      const c3H = 275;

      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(c3X, c3Y, c3W, c3H, 28);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ 5.0', c3X + c3W / 2, c3Y + 80);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 18px sans-serif';
      ctx.fillText('TOP RATED', c3X + c3W / 2, c3Y + 120);

      ctx.fillStyle = theme.textMuted;
      ctx.font = '600 14px sans-serif';
      ctx.fillText('500+ Projects Done', c3X + c3W / 2, c3Y + 148);

      // Fast delivery tag
      ctx.fillStyle = theme.highlightColor;
      ctx.beginPath();
      ctx.roundRect(c3X + 20, c3Y + 190, c3W - 40, 52, 26);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = '900 16px sans-serif';
      ctx.fillText('⚡ 24H DELIVERY', c3X + c3W / 2, c3Y + 222);

      // Card 4: Right Big Portrait Card (W: 495, H: 675)
      const c4X = 735;
      const c4Y = 45;
      const c4W = 495;
      const c4H = 675;

      ctx.textAlign = 'left';
      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(c4X, c4Y, c4W, c4H, 32);
      ctx.fill();
      ctx.stroke();

      if (uploadedImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = uploadedImage;
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(c4X + 16, c4Y + 16, c4W - 32, c4H - 32, 24);
          ctx.clip();
          ctx.drawImage(img, c4X + 16, c4Y + 16, c4W - 32, c4H - 32);
          ctx.restore();
        };
      } else {
        ctx.fillStyle = `${theme.primaryAccent}22`;
        ctx.beginPath();
        ctx.roundRect(c4X + 16, c4Y + 16, c4W - 32, c4H - 32, 24);
        ctx.fill();

        ctx.fillStyle = theme.highlightColor;
        ctx.font = '900 72px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', c4X + c4W / 2, c4Y + 280);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 24px sans-serif';
        ctx.fillText('VERIFIED EXPERT', c4X + c4W / 2, c4Y + 360);
      }
      ctx.restore();
    }

    // =========================================================================
    // LAYOUT 4: HEADER & 8-TOOL STACK RIBBON GRID
    // =========================================================================
    else if (layoutType === 'badge-flank-bottom') {
      ctx.save();
      // Top Full Header
      const headY = 75;
      if (keywordHighlight.trim()) {
        const kwFit = fitSingleLineText(keywordHighlight.toUpperCase(), 1180, 66, 32);
        ctx.font = `900 ${kwFit.fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = theme.highlightColor;
        ctx.shadowColor = theme.highlightColor;
        ctx.shadowBlur = 18;
        ctx.fillText(kwFit.fittedText, 50, headY);
        ctx.shadowBlur = 0;
      }

      const mainText = mainHeadline.replace(/\n/g, ' • ').toUpperCase();
      const mainFit = fitSingleLineText(mainText, 1180, 50, 26);
      ctx.font = `900 ${mainFit.fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = theme.textColor;
      ctx.fillText(mainFit.fittedText, 50, headY + 58);

      // Middle Preview & Highlights (Y: 180 to 520)
      // Left 2 Value Cards
      bullets.slice(0, 2).forEach((bullet, idx) => {
        const bY = 185 + idx * 80;
        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = theme.cardBorder;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(50, bY, 340, 68, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = theme.highlightColor;
        ctx.font = '900 16px sans-serif';
        ctx.fillText('✓', 70, bY + 40);

        const bulFit = fitSingleLineText(bullet, 250, 17, 12, 'sans-serif', '700');
        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${bulFit.fontSize}px sans-serif`;
        ctx.fillText(bulFit.fittedText, 98, bY + 41);
      });

      // Center Portrait Frame (W: 420, H: 330)
      const cpX = 430;
      const cpY = 180;
      const cpW = 420;
      const cpH = 330;

      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cpX, cpY, cpW, cpH, 26);
      ctx.fill();
      ctx.stroke();

      if (uploadedImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = uploadedImage;
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(cpX + 10, cpY + 10, cpW - 20, cpH - 20, 20);
          ctx.clip();
          ctx.drawImage(img, cpX + 10, cpY + 10, cpW - 20, cpH - 20);
          ctx.restore();
        };
      } else {
        ctx.fillStyle = theme.highlightColor;
        ctx.font = '900 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', cpX + cpW / 2, cpY + 140);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 20px sans-serif';
        ctx.fillText('5.0 ★ VERIFIED PRO', cpX + cpW / 2, cpY + 200);
      }

      // Right 2 Value Cards
      ctx.textAlign = 'left';
      bullets.slice(2, 4).forEach((bullet, idx) => {
        const bY = 185 + idx * 80;
        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = theme.cardBorder;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(890, bY, 340, 68, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = theme.highlightColor;
        ctx.font = '900 16px sans-serif';
        ctx.fillText('✓', 910, bY + 40);

        const bulFit = fitSingleLineText(bullet, 250, 17, 12, 'sans-serif', '700');
        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${bulFit.fontSize}px sans-serif`;
        ctx.fillText(bulFit.fittedText, 938, bY + 41);
      });

      // Bottom 2x4 Full Stack Grid (8 badges total!)
      const allStack = selectedBadges.slice(0, 8);
      allStack.forEach((badgeId, idx) => {
        const badge = POPULAR_STACK_BADGES.find((b) => b.id === badgeId);
        if (!badge) return;

        const row = Math.floor(idx / 4);
        const col = idx % 4;
        const bX = 50 + col * 295;
        const bY = 550 + row * 85;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(bX, bY, 275, 68, 16);
        ctx.fill();
        ctx.stroke();

        const badgeLabel = `${badge.iconSymbol}  ${badge.name}`;
        const bFit = fitSingleLineText(badgeLabel, 230, 20, 13, 'sans-serif', '900');
        ctx.font = `900 ${bFit.fontSize}px sans-serif`;
        ctx.fillStyle = badge.color || '#ffffff';
        ctx.fillText(bFit.fittedText, bX + 18, bY + 42);
      });
      ctx.restore();
    }

    // =========================================================================
    // LAYOUT 5: DARK LUXURY & FLOATING STAT CHIPS
    // =========================================================================
    else if (layoutType === 'minimalist-dark-card') {
      ctx.save();
      const maxLeftW = 640;
      let curY = 110;

      if (badgeText.trim()) {
        const bFit = fitSingleLineText(badgeText.toUpperCase(), 320, 14, 11, 'sans-serif', '800');
        ctx.fillStyle = theme.badgeBg;
        ctx.beginPath();
        ctx.roundRect(60, curY, bFit.textWidth + 32, 34, 17);
        ctx.fill();
        ctx.font = `800 ${bFit.fontSize}px sans-serif`;
        ctx.fillStyle = theme.badgeText;
        ctx.fillText(bFit.fittedText, 76, curY + 22);
        curY += 55;
      }

      if (keywordHighlight.trim()) {
        const kwFit = fitSingleLineText(keywordHighlight.toUpperCase(), maxLeftW, 68, 34);
        ctx.font = `900 ${kwFit.fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = theme.highlightColor;
        ctx.shadowColor = theme.highlightColor;
        ctx.shadowBlur = 24;
        ctx.fillText(kwFit.fittedText, 60, curY + 58);
        ctx.shadowBlur = 0;
        curY += 72;
      }

      const headFit = wrapAndFitMultilineText(mainHeadline.toUpperCase(), maxLeftW, 3, 60, 30);
      ctx.font = `900 ${headFit.fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = theme.textColor;
      headFit.lines.forEach((line) => {
        curY += headFit.lineHeight;
        ctx.fillText(line, 60, curY);
      });

      if (subheading.trim()) {
        curY += 38;
        const subFit = fitSingleLineText(subheading, maxLeftW, 20, 14, 'sans-serif', '600');
        ctx.font = `600 ${subFit.fontSize}px sans-serif`;
        ctx.fillStyle = theme.textMuted;
        ctx.fillText(subFit.fittedText, 60, curY);
      }

      // Bottom floating chips
      const chips = [ratingText || '5.0 ★ (480+)', '⚡ Fast 24h Turnaround', '✔ 100% Guaranteed Quality'];
      let chipX = 60;
      chips.forEach((chip) => {
        const cFit = fitSingleLineText(chip, 260, 15, 12, 'sans-serif', '800');
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.roundRect(chipX, H - 95, cFit.textWidth + 32, 46, 23);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `800 ${cFit.fontSize}px sans-serif`;
        ctx.fillText(cFit.fittedText, chipX + 16, H - 66);
        chipX += cFit.textWidth + 48;
      });

      // Right Portrait Card
      const pX = 740;
      const pY = 60;
      const pW = 480;
      const pH = 650;

      ctx.fillStyle = 'rgba(20, 20, 30, 0.8)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(pX, pY, pW, pH, 32);
      ctx.fill();
      ctx.stroke();

      if (uploadedImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = uploadedImage;
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(pX + 16, pY + 16, pW - 32, pH - 32, 24);
          ctx.clip();
          ctx.drawImage(img, pX + 16, pY + 16, pW - 32, pH - 32);
          ctx.restore();
        };
      } else {
        ctx.fillStyle = theme.highlightColor;
        ctx.font = '900 64px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', pX + pW / 2, pY + 280);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 22px sans-serif';
        ctx.fillText('TOP PRO SELLER', pX + pW / 2, pY + 350);
      }
      ctx.restore();
    }

    // =========================================================================
    // LAYOUT 6: MODERN BULLETS (Vertical Feature Cards)
    // =========================================================================
    else if (layoutType === 'modern-bullets') {
      const maxLeftW = 640;
      ctx.save();

      // Top Badge
      if (badgeText.trim()) {
        const bText = `★  ${badgeText.toUpperCase()}`;
        const bFit = fitSingleLineText(bText, 320, 15, 11, 'sans-serif', '900');
        ctx.fillStyle = theme.badgeBg;
        ctx.beginPath();
        ctx.roundRect(50, 38, bFit.textWidth + 36, 36, 18);
        ctx.fill();
        ctx.font = `900 ${bFit.fontSize}px sans-serif`;
        ctx.fillStyle = theme.badgeText;
        ctx.fillText(bFit.fittedText, 68, 61);
      }

      // HUGE Main Heading (Fitted safely inside 640px)
      let headingY = 135;
      if (keywordHighlight.trim()) {
        const kwFit = fitSingleLineText(keywordHighlight.toUpperCase(), maxLeftW, 64, 32);
        ctx.font = `900 ${kwFit.fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = theme.highlightColor;
        ctx.shadowColor = theme.highlightColor;
        ctx.shadowBlur = 18;
        ctx.fillText(kwFit.fittedText, 50, headingY);
        ctx.shadowBlur = 0;
        headingY += 15;
      }

      const headFit = wrapAndFitMultilineText(mainHeadline.toUpperCase(), maxLeftW, 2, 56, 28);
      ctx.font = `900 ${headFit.fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = theme.textColor;
      headFit.lines.forEach((l) => {
        headingY += headFit.lineHeight;
        ctx.fillText(l, 50, headingY);
      });

      // Subheading line
      if (subheading.trim()) {
        headingY += 34;
        const subFit = fitSingleLineText(subheading, maxLeftW, 20, 14, 'sans-serif', '700');
        ctx.font = `700 ${subFit.fontSize}px sans-serif`;
        ctx.fillStyle = theme.highlightColor;
        ctx.fillText(subFit.fittedText, 50, headingY);
      }
      ctx.restore();

      // High-Contrast Bullet Cards
      const bulletsStartY = headingY + 34;
      const bulletSpacing = 58;

      bullets.slice(0, 4).forEach((bullet, idx) => {
        const bY = bulletsStartY + idx * bulletSpacing;
        if (bY > H - 55) return;

        ctx.save();
        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = theme.cardBorder;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(50, bY - 28, 640, 48, 14);
        ctx.fill();
        ctx.stroke();

        // Check Icon Circle
        ctx.fillStyle = theme.highlightColor;
        ctx.beginPath();
        ctx.arc(76, bY - 4, 13, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.font = '900 15px sans-serif';
        ctx.fillText('✓', 70, bY + 2);

        // Bullet Text fitted inside 530px
        const bulFit = fitSingleLineText(bullet, 530, 19, 13, 'sans-serif', '700');
        ctx.font = `700 ${bulFit.fontSize}px sans-serif`;
        ctx.fillStyle = theme.textColor;
        ctx.fillText(bulFit.fittedText, 102, bY + 3);
        ctx.restore();
      });

      // Right Portrait Card
      const cardX = 730;
      const cardY = 60;
      const cardW = 500;
      const cardH = 650;

      ctx.save();
      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 32);
      ctx.fill();
      ctx.stroke();

      if (uploadedImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = uploadedImage;
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(cardX + 16, cardY + 16, cardW - 32, cardH - 32, 24);
          ctx.clip();
          ctx.drawImage(img, cardX + 16, cardY + 16, cardW - 32, cardH - 32);
          ctx.restore();
        };
      } else {
        ctx.fillStyle = `${theme.primaryAccent}22`;
        ctx.beginPath();
        ctx.roundRect(cardX + 16, cardY + 16, cardW - 32, cardH - 32, 24);
        ctx.fill();

        ctx.fillStyle = theme.highlightColor;
        ctx.font = '900 64px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', cardX + cardW / 2, cardY + 260);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 22px sans-serif';
        ctx.fillText('VERIFIED PRO SELLER', cardX + cardW / 2, cardY + 340);
      }
      ctx.restore();
    }

    // =========================================================================
    // LAYOUT 7: SPLIT SHOWCASE METRIC (3-Metric High Roller • Client Pick)
    // =========================================================================
    else if (layoutType === 'split-showcase-metric') {
      ctx.save();
      const maxLeftW = 630;

      // Top Status Bar: Level 2 / Pro Badge + Category
      let topY = 40;
      const proBadgeText = `★  ${(badgeText || 'LEVEL 2 PRO SELLER').toUpperCase()}`;
      const proFit = fitSingleLineText(proBadgeText, 280, 14, 10, 'sans-serif', '900');
      ctx.fillStyle = theme.badgeBg;
      ctx.beginPath();
      ctx.roundRect(50, topY, proFit.textWidth + 28, 36, 18);
      ctx.fill();

      ctx.font = `900 ${proFit.fontSize}px sans-serif`;
      ctx.fillStyle = theme.badgeText;
      ctx.fillText(proFit.fittedText, 64, topY + 23);

      const catStr = serviceCategory.toUpperCase();
      const catFit = fitSingleLineText(catStr, 280, 14, 10, 'sans-serif', '800');
      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(64 + proFit.textWidth + 36, topY, catFit.textWidth + 28, 36, 18);
      ctx.fill();
      ctx.stroke();

      ctx.font = `800 ${catFit.fontSize}px sans-serif`;
      ctx.fillStyle = theme.highlightColor;
      ctx.fillText(catFit.fittedText, 64 + proFit.textWidth + 50, topY + 23);

      // Huge Headline Section
      let curY = 130;
      if (keywordHighlight.trim()) {
        const kwFit = fitSingleLineText(keywordHighlight.toUpperCase(), maxLeftW, 66, 32);
        ctx.font = `900 ${kwFit.fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = theme.highlightColor;
        ctx.shadowColor = theme.highlightColor;
        ctx.shadowBlur = 20;
        ctx.fillText(kwFit.fittedText, 50, curY);
        ctx.shadowBlur = 0;
        curY += 16;
      }

      const headFit = wrapAndFitMultilineText(mainHeadline.toUpperCase(), maxLeftW, 2, 54, 28);
      ctx.font = `900 ${headFit.fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = theme.textColor;
      headFit.lines.forEach((l) => {
        curY += headFit.lineHeight;
        ctx.fillText(l, 50, curY);
      });

      if (subheading.trim()) {
        curY += 34;
        const subFit = fitSingleLineText(subheading, maxLeftW, 19, 13, 'sans-serif', '700');
        ctx.font = `700 ${subFit.fontSize}px sans-serif`;
        ctx.fillStyle = theme.textMuted;
        ctx.fillText(subFit.fittedText, 50, curY);
      }

      // 3 High-Impact Metric Stat Cards
      const statCardW = 195;
      const statCardH = 100;
      const statGap = 20;
      const statY = curY + 28;

      const stats = [
        { val: '5.0 ★', label: '100% Top Rated', color: '#fbbf24' },
        { val: '24 HRS', label: 'Express Delivery', color: theme.highlightColor },
        { val: '100+', label: 'Apps Completed', color: '#ffffff' },
      ];

      stats.forEach((st, idx) => {
        const sX = 50 + idx * (statCardW + statGap);
        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = theme.cardBorder;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(sX, statY, statCardW, statCardH, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = st.color;
        ctx.font = '900 30px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(st.val, sX + statCardW / 2, statY + 48);

        ctx.fillStyle = theme.textMuted;
        ctx.font = '700 13px sans-serif';
        ctx.fillText(st.label, sX + statCardW / 2, statY + 76);
      });
      ctx.textAlign = 'left';

      // Bottom Tech Stack Badges Row
      if (selectedBadges.length > 0) {
        let bX = 50;
        const bY = H - 90;
        selectedBadges.slice(0, 5).forEach((badgeId) => {
          if (bX > maxLeftW + 30) return;
          const badge = POPULAR_STACK_BADGES.find((b) => b.id === badgeId);
          if (!badge) return;

          const label = `${badge.iconSymbol}  ${badge.name}`;
          const bFit = fitSingleLineText(label, 140, 15, 11, 'sans-serif', '800');

          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(bX, bY, bFit.textWidth + 24, 42, 12);
          ctx.fill();
          ctx.stroke();

          ctx.font = `800 ${bFit.fontSize}px sans-serif`;
          ctx.fillStyle = badge.color || '#ffffff';
          ctx.fillText(bFit.fittedText, bX + 12, bY + 26);

          bX += bFit.textWidth + 28;
        });
      }

      // Right Portrait Card (510 x 650)
      const rX = 720;
      const rY = 55;
      const rW = 510;
      const rH = 655;

      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(rX, rY, rW, rH, 32);
      ctx.fill();
      ctx.stroke();

      if (uploadedImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = uploadedImage;
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(rX + 16, rY + 16, rW - 32, rH - 32, 24);
          ctx.clip();
          ctx.drawImage(img, rX + 16, rY + 16, rW - 32, rH - 32);
          ctx.restore();
        };
      } else {
        ctx.fillStyle = `${theme.primaryAccent}22`;
        ctx.beginPath();
        ctx.roundRect(rX + 16, rY + 16, rW - 32, rH - 32, 24);
        ctx.fill();

        ctx.fillStyle = theme.highlightColor;
        ctx.font = '900 70px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', rX + rW / 2, rY + 240);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px sans-serif';
        ctx.fillText('FULL-STACK AGENCY', rX + rW / 2, rY + 310);

        ctx.font = '700 16px sans-serif';
        ctx.fillStyle = theme.textMuted;
        ctx.fillText('Top 1% Rated Fiverr Freelancer', rX + rW / 2, rY + 350);

        // Guarantee Tag
        ctx.fillStyle = theme.badgeBg;
        ctx.beginPath();
        ctx.roundRect(rX + 50, rY + 440, rW - 100, 56, 28);
        ctx.fill();

        ctx.fillStyle = theme.badgeText;
        ctx.font = '900 19px sans-serif';
        ctx.fillText('100% MONEY-BACK GUARANTEE', rX + rW / 2, rY + 475);
      }
      ctx.restore();
    }

    // =========================================================================
    // LAYOUT 8: NEON CYBER AGENCY (Ultra High CTR & Cyber Frame)
    // =========================================================================
    else if (layoutType === 'neon-cyber-agency') {
      ctx.save();
      const maxLeftW = 630;

      // Glowing Cyber Corner Accents
      ctx.strokeStyle = theme.highlightColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      // Top-Left Corner
      ctx.moveTo(30, 80);
      ctx.lineTo(30, 30);
      ctx.lineTo(80, 30);
      // Top-Right Corner
      ctx.moveTo(W - 80, 30);
      ctx.lineTo(W - 30, 30);
      ctx.lineTo(W - 30, 80);
      // Bottom-Left Corner
      ctx.moveTo(30, H - 80);
      ctx.lineTo(30, H - 30);
      ctx.lineTo(80, H - 30);
      // Bottom-Right Corner
      ctx.moveTo(W - 80, H - 30);
      ctx.lineTo(W - 30, H - 30);
      ctx.lineTo(W - 30, H - 80);
      ctx.stroke();

      // Top Cyber Tag
      const cyberBadge = `///  ${(badgeText || 'NEXT-GEN AI STUDIO').toUpperCase()}  ///`;
      const cbFit = fitSingleLineText(cyberBadge, 400, 14, 10, 'sans-serif', '900');
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.strokeStyle = theme.highlightColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(50, 40, cbFit.textWidth + 30, 36, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = `900 ${cbFit.fontSize}px sans-serif`;
      ctx.fillStyle = theme.highlightColor;
      ctx.fillText(cbFit.fittedText, 65, 63);

      // Keyword Hook with Neon Glow
      let startY = 135;
      if (keywordHighlight.trim()) {
        const kwFit = fitSingleLineText(keywordHighlight.toUpperCase(), maxLeftW, 66, 32);
        ctx.font = `900 ${kwFit.fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = theme.highlightColor;
        ctx.shadowColor = theme.highlightColor;
        ctx.shadowBlur = 28;
        ctx.fillText(kwFit.fittedText, 50, startY);
        ctx.shadowBlur = 0;
        startY += 18;
      }

      // Massive Headline
      const headFit = wrapAndFitMultilineText(mainHeadline.toUpperCase(), maxLeftW, 2, 54, 28);
      ctx.font = `900 ${headFit.fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = '#ffffff';
      headFit.lines.forEach((l) => {
        startY += headFit.lineHeight;
        ctx.fillText(l, 50, startY);
      });

      if (subheading.trim()) {
        startY += 34;
        const subFit = fitSingleLineText(subheading, maxLeftW, 19, 13, 'sans-serif', '700');
        ctx.font = `700 ${subFit.fontSize}px sans-serif`;
        ctx.fillStyle = theme.highlightColor;
        ctx.fillText(subFit.fittedText, 50, startY);
      }

      // Feature Pill Cards Grid (1 to 6 deliverables)
      const cyberPills = pillBadges.slice(0, 6);
      const cRowH = 50;
      const cGapY = 10;
      const cGridY = startY + 28;

      cyberPills.forEach((pill, idx) => {
        const row = Math.floor(idx / 2);
        const col = idx % 2;
        const cColW = (maxLeftW - 16) / 2;
        const pX = 50 + col * (cColW + 16);
        const pY = cGridY + row * (cRowH + cGapY);
        if (pY > H - 60) return;

        ctx.fillStyle = 'rgba(10, 20, 35, 0.85)';
        ctx.strokeStyle = theme.cardBorder;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(pX, pY, cColW, cRowH, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = theme.highlightColor;
        ctx.font = '900 14px sans-serif';
        ctx.fillText('▶', pX + 14, pY + 31);

        const pillFit = fitSingleLineText(pill || `Deliverable #${idx + 1}`, cColW - 40, 15, 11, 'sans-serif', '700');
        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${pillFit.fontSize}px sans-serif`;
        ctx.fillText(pillFit.fittedText, pX + 34, pY + 31);
      });

      // Right Cyber Portrait Box
      const portX = 720;
      const portY = 55;
      const portW = 510;
      const portH = 655;

      ctx.fillStyle = 'rgba(5, 15, 30, 0.9)';
      ctx.strokeStyle = theme.highlightColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(portX, portY, portW, portH, 20);
      ctx.fill();
      ctx.stroke();

      if (uploadedImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = uploadedImage;
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(portX + 12, portY + 12, portW - 24, portH - 24, 14);
          ctx.clip();
          ctx.drawImage(img, portX + 12, portY + 12, portW - 24, portH - 24);
          ctx.restore();
        };
      } else {
        ctx.fillStyle = theme.highlightColor;
        ctx.font = '900 64px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', portX + portW / 2, portY + 260);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px sans-serif';
        ctx.fillText('CYBER AI SPECIALIST', portX + portW / 2, portY + 330);

        ctx.fillStyle = theme.highlightColor;
        ctx.font = '800 16px sans-serif';
        ctx.fillText('★ 5.0 Rating • 24/7 Priority Support', portX + portW / 2, portY + 370);
      }
      ctx.restore();
    }

    // =========================================================================
    // LAYOUT 9: DUAL DEVICE SHOWCASE (App Store & Mobile Mockup Layout)
    // =========================================================================
    else if (layoutType === 'app-store-mockup') {
      ctx.save();
      const maxLeftW = 630;

      // Top App Store Badge
      const storeText = '★  APP STORE & PLAY STORE READY';
      const storeFit = fitSingleLineText(storeText, 340, 14, 10, 'sans-serif', '900');
      ctx.fillStyle = theme.badgeBg;
      ctx.beginPath();
      ctx.roundRect(50, 40, storeFit.textWidth + 30, 36, 18);
      ctx.fill();

      ctx.font = `900 ${storeFit.fontSize}px sans-serif`;
      ctx.fillStyle = theme.badgeText;
      ctx.fillText(storeFit.fittedText, 65, 63);

      // Huge Headline
      let startY = 130;
      if (keywordHighlight.trim()) {
        const kwFit = fitSingleLineText(keywordHighlight.toUpperCase(), maxLeftW, 64, 32);
        ctx.font = `900 ${kwFit.fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = theme.highlightColor;
        ctx.shadowColor = theme.highlightColor;
        ctx.shadowBlur = 20;
        ctx.fillText(kwFit.fittedText, 50, startY);
        ctx.shadowBlur = 0;
        startY += 16;
      }

      const headFit = wrapAndFitMultilineText(mainHeadline.toUpperCase(), maxLeftW, 2, 54, 28);
      ctx.font = `900 ${headFit.fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = '#ffffff';
      headFit.lines.forEach((l) => {
        startY += headFit.lineHeight;
        ctx.fillText(l, 50, startY);
      });

      if (subheading.trim()) {
        startY += 34;
        const subFit = fitSingleLineText(subheading, maxLeftW, 19, 13, 'sans-serif', '700');
        ctx.font = `700 ${subFit.fontSize}px sans-serif`;
        ctx.fillStyle = theme.textMuted;
        ctx.fillText(subFit.fittedText, 50, startY);
      }

      // Feature Bullet Cards (4 items)
      const bStartY = startY + 30;
      bullets.slice(0, 4).forEach((bullet, idx) => {
        const bY = bStartY + idx * 56;
        if (bY > H - 55) return;

        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = theme.cardBorder;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(50, bY, maxLeftW, 46, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = theme.highlightColor;
        ctx.font = '900 15px sans-serif';
        ctx.fillText('✓', 68, bY + 28);

        const bulFit = fitSingleLineText(bullet, maxLeftW - 56, 16, 11, 'sans-serif', '700');
        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${bulFit.fontSize}px sans-serif`;
        ctx.fillText(bulFit.fittedText, 94, bY + 28);
      });

      // Right Dual Mockup: Phone Device Mockup Frame (250 x 520) + Tablet / Web Frame (230 x 440)
      const phoneX = 720;
      const phoneY = 100;
      const phoneW = 240;
      const phoneH = 500;

      // Phone Frame
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = theme.highlightColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(phoneX, phoneY, phoneW, phoneH, 36);
      ctx.fill();
      ctx.stroke();

      // Notch
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.roundRect(phoneX + phoneW / 2 - 35, phoneY + 10, 70, 16, 8);
      ctx.fill();

      // Screen Content
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(phoneX + 12, phoneY + 34, phoneW - 24, phoneH - 46, 24);
      ctx.fill();

      ctx.fillStyle = theme.highlightColor;
      ctx.font = '900 40px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📱', phoneX + phoneW / 2, phoneY + 160);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 17px sans-serif';
      ctx.fillText('iOS & Android', phoneX + phoneW / 2, phoneY + 210);

      ctx.fillStyle = theme.textMuted;
      ctx.font = '600 12px sans-serif';
      ctx.fillText('FlutterFlow / React', phoneX + phoneW / 2, phoneY + 235);

      // Web/Tablet Card behind
      const tabX = 980;
      const tabY = 140;
      const tabW = 240;
      const tabH = 440;

      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(tabX, tabY, tabW, tabH, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = theme.highlightColor;
      ctx.font = '900 40px sans-serif';
      ctx.fillText('⚡', tabX + tabW / 2, tabY + 160);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 17px sans-serif';
      ctx.fillText('Web & Backend', tabX + tabW / 2, tabY + 210);

      ctx.fillStyle = theme.textMuted;
      ctx.font = '600 12px sans-serif';
      ctx.fillText('Supabase / API', tabX + tabW / 2, tabY + 235);

      // Top floating rating badge
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.roundRect(830, 45, 260, 48, 24);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = '900 17px sans-serif';
      ctx.fillText('★ 5.0 STAR TOP RATED', 960, 75);

      ctx.restore();
    }

    // =========================================================================
    // LAYOUT 10: MODERN SAAS RIBBON (Mega Badge + 3x2 Glass Deliverable Tiles)
    // =========================================================================
    else if (layoutType === 'gradient-pill-saas') {
      ctx.save();
      // Top Mega Gradient Ribbon Banner
      const gradRibbon = ctx.createLinearGradient(50, 40, W - 50, 40);
      gradRibbon.addColorStop(0, theme.primaryAccent);
      gradRibbon.addColorStop(1, theme.highlightColor);

      ctx.fillStyle = gradRibbon;
      ctx.beginPath();
      ctx.roundRect(50, 36, W - 100, 60, 30);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = '900 24px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      const megaBannerText = `⚡ ${(keywordHighlight || mainHeadline).toUpperCase()} ⚡`;
      const mbFit = fitSingleLineText(megaBannerText, 1100, 24, 16, 'system-ui, sans-serif', '900');
      ctx.fillText(mbFit.fittedText, W / 2, 73);

      // Main Left Headline Section
      ctx.textAlign = 'left';
      let curY = 155;

      const headFit = wrapAndFitMultilineText(mainHeadline.toUpperCase(), 640, 2, 54, 28);
      ctx.font = `900 ${headFit.fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = '#ffffff';
      headFit.lines.forEach((l) => {
        curY += headFit.lineHeight;
        ctx.fillText(l, 50, curY);
      });

      if (subheading.trim()) {
        curY += 34;
        const subFit = fitSingleLineText(subheading, 640, 20, 14, 'sans-serif', '700');
        ctx.font = `700 ${subFit.fontSize}px sans-serif`;
        ctx.fillStyle = theme.highlightColor;
        ctx.fillText(subFit.fittedText, 50, curY);
      }

      // 3x2 Glass Deliverable Grid (6 badges)
      const saasPills = pillBadges.slice(0, 6);
      const pillColW = 310;
      const pillRowH = 54;
      const pillGapX = 20;
      const pillGapY = 12;
      const pillStartY = curY + 28;

      saasPills.forEach((pill, idx) => {
        const row = Math.floor(idx / 2);
        const col = idx % 2;
        const pX = 50 + col * (pillColW + pillGapX);
        const pY = pillStartY + row * (pillRowH + pillGapY);
        if (pY > H - 55) return;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(pX, pY, pillColW, pillRowH, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = theme.highlightColor;
        ctx.font = '900 16px sans-serif';
        ctx.fillText('✦', pX + 18, pY + 34);

        const pillFit = fitSingleLineText(pill || `Deliverable #${idx + 1}`, 240, 16.5, 11, 'sans-serif', '800');
        ctx.fillStyle = '#ffffff';
        ctx.font = `800 ${pillFit.fontSize}px sans-serif`;
        ctx.fillText(pillFit.fittedText, pX + 42, pY + 34);
      });

      // Right Portrait Card
      const rX = 730;
      const rY = 125;
      const rW = 495;
      const rH = 585;

      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(rX, rY, rW, rH, 32);
      ctx.fill();
      ctx.stroke();

      if (uploadedImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = uploadedImage;
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(rX + 16, rY + 16, rW - 32, rH - 32, 24);
          ctx.clip();
          ctx.drawImage(img, rX + 16, rY + 16, rW - 32, rH - 32);
          ctx.restore();
        };
      } else {
        ctx.fillStyle = theme.highlightColor;
        ctx.font = '900 64px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏆', rX + rW / 2, rY + 230);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px sans-serif';
        ctx.fillText('TOP RECOMMENDED', rX + rW / 2, rY + 300);

        ctx.fillStyle = theme.textMuted;
        ctx.font = '700 16px sans-serif';
        ctx.fillText('Client Satisfaction Guaranteed', rX + rW / 2, rY + 340);

        ctx.fillStyle = theme.highlightColor;
        ctx.beginPath();
        ctx.roundRect(rX + 40, rY + 410, rW - 80, 56, 28);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.font = '900 18px sans-serif';
        ctx.fillText('⚡ 24-HOUR EXPRESS', rX + rW / 2, rY + 445);
      }

      ctx.restore();
    }

    // =========================================================================
    // LAYOUT 11: SPLIT HERO (Classic Pro Split Hero)
    // =========================================================================
    else {
      const maxLeftW = 640;
      // Top Category & Seller Bar
      ctx.save();
      const catFit = fitSingleLineText(serviceCategory.toUpperCase(), 300, 15, 11, 'sans-serif', '800');
      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(50, 36, catFit.textWidth + 28, 36, 18);
      ctx.fill();
      ctx.stroke();

      ctx.font = `800 ${catFit.fontSize}px sans-serif`;
      ctx.fillStyle = theme.highlightColor;
      ctx.fillText(catFit.fittedText, 64, 59);

      // Top Rating Star Badge
      if (sellerName) {
        const sellerStr = `★ ${ratingText}`;
        const sFit = fitSingleLineText(sellerStr, 220, 15, 11, 'sans-serif', '700');
        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = theme.cardBorder;
        ctx.beginPath();
        ctx.roundRect(maxLeftW - sFit.textWidth - 20, 36, sFit.textWidth + 28, 36, 18);
        ctx.fill();
        ctx.stroke();

        ctx.font = `700 ${sFit.fontSize}px sans-serif`;
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(sFit.fittedText, maxLeftW - sFit.textWidth - 6, 59);
      }
      ctx.restore();

      // ULTRA PROMINENT KEYWORD HOOK
      ctx.save();
      let startY = 140;

      if (keywordHighlight.trim()) {
        const kwFit = fitSingleLineText(keywordHighlight.toUpperCase(), maxLeftW, 68, 32);
        ctx.font = `900 ${kwFit.fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.shadowColor = theme.highlightColor;
        ctx.shadowBlur = 24;
        ctx.fillStyle = theme.highlightColor;
        ctx.fillText(kwFit.fittedText, 50, startY);
        ctx.shadowBlur = 0;
        startY += 18;
      }

      // MASSIVE HEADLINE (Wrapped and auto-fitted safely within 640px)
      const baseHeadlineSize = fontSizeTier === 'massive' ? 76 : fontSizeTier === 'ultra' ? 68 : 58;
      const headFit = wrapAndFitMultilineText(mainHeadline.toUpperCase(), maxLeftW, 3, baseHeadlineSize, 30);
      ctx.font = `900 ${headFit.fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = theme.textColor;

      headFit.lines.forEach((l) => {
        startY += headFit.lineHeight;
        ctx.fillText(l, 50, startY);
      });

      // Subheading line
      if (subheading.trim()) {
        startY += 38;
        const subFit = fitSingleLineText(subheading, maxLeftW, 20, 14, 'sans-serif', '600');
        ctx.font = `600 ${subFit.fontSize}px sans-serif`;
        ctx.fillStyle = theme.textMuted;
        ctx.fillText(subFit.fittedText, 50, startY);
      }
      ctx.restore();

      // Bottom Tech Stack Badges Row
      if (selectedBadges.length > 0) {
        ctx.save();
        const badgeY = H - 90;
        let badgeX = 50;

        selectedBadges.slice(0, 6).forEach((badgeId) => {
          if (badgeX > maxLeftW + 20) return;
          const badge = POPULAR_STACK_BADGES.find((b) => b.id === badgeId);
          if (!badge) return;

          const label = `${badge.iconSymbol}  ${badge.name}`;
          const bFit = fitSingleLineText(label, 140, 16, 11, 'sans-serif', '800');

          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, bFit.textWidth + 24, 42, 12);
          ctx.fill();
          ctx.stroke();

          ctx.font = `800 ${bFit.fontSize}px sans-serif`;
          ctx.fillStyle = badge.color || '#ffffff';
          ctx.fillText(bFit.fittedText, badgeX + 12, badgeY + 26);

          badgeX += bFit.textWidth + 28;
        });
        ctx.restore();
      }

      // Right Side: Portrait Photo or Graphic
      const portraitX = 720;
      const portraitY = 80;
      const portraitW = 510;
      const portraitH = 640;

      ctx.save();
      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(portraitX, portraitY, portraitW, portraitH, 32);
      ctx.fill();
      ctx.stroke();

      if (uploadedImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = uploadedImage;
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(portraitX + 16, portraitY + 16, portraitW - 32, portraitH - 32, 24);
          ctx.clip();
          ctx.drawImage(img, portraitX + 16, portraitY + 16, portraitW - 32, portraitH - 32);
          ctx.restore();
        };
      } else {
        ctx.save();
        const innerGrad = ctx.createLinearGradient(portraitX, portraitY, portraitX + portraitW, portraitY + portraitH);
        innerGrad.addColorStop(0, `${theme.primaryAccent}22`);
        innerGrad.addColorStop(1, `${theme.highlightColor}33`);
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.roundRect(portraitX + 16, portraitY + 16, portraitW - 32, portraitH - 32, 24);
        ctx.fill();

        ctx.strokeStyle = theme.highlightColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(portraitX + portraitW / 2, portraitY + 230, 95, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = theme.highlightColor;
        ctx.font = '900 56px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', portraitX + portraitW / 2, portraitY + 250);

        ctx.fillStyle = theme.badgeBg;
        ctx.beginPath();
        ctx.roundRect(portraitX + 48, portraitY + 360, portraitW - 96, 58, 29);
        ctx.fill();

        ctx.fillStyle = theme.badgeText;
        ctx.font = '900 20px sans-serif';
        ctx.fillText('100% TESTED WORKFLOWS', portraitX + portraitW / 2, portraitY + 396);

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 17px sans-serif';
        ctx.fillText('✓ Autonomous AI Agents & n8n', portraitX + portraitW / 2, portraitY + 460);
        ctx.fillText('✓ CRM, Database & API Integration', portraitX + portraitW / 2, portraitY + 496);
        ctx.fillText('✓ Fast 24-Hour Express Delivery', portraitX + portraitW / 2, portraitY + 532);
        ctx.restore();
      }
      ctx.restore();
    }
  }, [
    gigTitle,
    serviceCategory,
    keywordHighlight,
    mainHeadline,
    subheading,
    fontSizeTier,
    bullets,
    pillBadges,
    selectedBadges,
    sellerName,
    badgeText,
    ratingText,
    designStyle,
    layoutType,
    currentTheme,
    uploadedImage,
  ]);

  // Redraw canvas on state changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Export as PNG (High-Res 1280x769)
  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    canvas.toBlob((blob) => {
      if (blob) {
        const cleanName = (keywordHighlight || mainHeadline).toLowerCase().replace(/[^a-z0-9]/g, '_') || 'fiverr_gig';
        downloadBlob(blob, `${cleanName}_fiverr_1280x769_hd.png`);
        showToast('Downloaded high-resolution Fiverr Gig image (PNG)', 'success');
      }
      setIsExporting(false);
    }, 'image/png');
  };

  // Export as JPG (Fiverr Optimized < 2MB)
  const handleDownloadJpg = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    canvas.toBlob((blob) => {
      if (blob) {
        const cleanName = (keywordHighlight || mainHeadline).toLowerCase().replace(/[^a-z0-9]/g, '_') || 'fiverr_gig';
        downloadBlob(blob, `${cleanName}_fiverr_optimized.jpg`);
        showToast('Downloaded optimized Fiverr Gig image (JPG)', 'success');
      }
      setIsExporting(false);
    }, 'image/jpeg', 0.92);
  };

  // Copy Canvas Image to Clipboard
  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        // @ts-ignore
        if (navigator.clipboard && window.ClipboardItem) {
          // @ts-ignore
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          showToast('Image copied to clipboard!', 'success');
        } else {
          showToast('Direct clipboard image copy not supported in this browser. Use download instead.', 'info');
        }
      }, 'image/png');
    } catch (e) {
      showToast('Could not copy image to clipboard. Please download instead.', 'warning');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner with Quick Presets */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-amber-500/10 text-amber-500">
                <Flame className="w-6 h-6" />
              </span>
              Fiverr Gig Image Generator &bull; Vibe Coding, AI Apps & Agents
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Create ultra-high CTR Fiverr thumbnails with massive headline typography, glowing keyword hooks, Base44, Replit, Blink, FlutterFlow, Lovable, n8n, Make & AI Agent badges.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Trending Niches:
            </span>
            {GIG_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleApplyPreset(preset)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 hover:text-amber-500 dark:hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dual Workspace: Canvas Live Preview on Top/Right, Controls on Left */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Headline Typography & Controls (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          {/* Card 1: Ultra-Prominent Typography & Headline */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Type className="w-4 h-4 text-amber-500" />
                Headline & Ultra-Prominent Keyword
              </h3>
              <div className="flex items-center gap-1">
                {(['huge', 'ultra', 'massive'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setFontSizeTier(tier)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                      fontSizeTier === tier
                        ? 'bg-amber-500 text-black font-extrabold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyword Highlight Field (The Glowing Anchor) */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-500 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Primary Keyword Hook (Glowing Text)
                </label>
                <input
                  type="text"
                  value={keywordHighlight}
                  onChange={(e) => setKeywordHighlight(e.target.value)}
                  placeholder="e.g. AI AUTOMATION or AI AGENTS DEV"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-600 dark:text-amber-400 text-base font-black focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This key term commands maximum attention with bold weight and contrast in Fiverr search results.
                </p>
              </div>

              {/* Main Headline (Multi-line bold text) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Main Headline (Line Breaks Allowed)
                </label>
                <textarea
                  rows={2}
                  value={mainHeadline}
                  onChange={(e) => setMainHeadline(e.target.value)}
                  placeholder="e.g. N8N & MAKE.COM&#10;WORKFLOWS & BOTS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-extrabold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Subheading / Value Tagline */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Subheading / Value Hook
                </label>
                <input
                  type="text"
                  value={subheading}
                  onChange={(e) => setSubheading(e.target.value)}
                  placeholder="e.g. CRM Sync • Lead Qualification • Auto-Reporting"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Service Category Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Fiverr Service Category Tag
                </label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                >
                  <option value="AI Automation & Workflows">AI Automation & Workflows</option>
                  <option value="AI Agents & Multi-Agent Systems">AI Agents & Multi-Agent Systems</option>
                  <option value="AI Chatbots & Voice Agents">AI Chatbots & Voice Agents</option>
                  <option value="Programming & Tech">Programming & Tech</option>
                  <option value="AI Services">AI Services</option>
                  <option value="Graphics & Design">Graphics & Design</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Video & Animation">Video & Animation</option>
                  <option value="Writing & Translation">Writing & Translation</option>
                  <option value="Business & Consulting">Business & Consulting</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: AI & Tech Stack Badges Selection */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-amber-500" />
                Tool & Framework Badges ({selectedBadges.length}/8 active)
              </h3>
            </div>

            {/* Filter Tabs & Search */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All Badges' },
                  { id: 'vibe-dev', label: '⚡ Vibe & Web' },
                  { id: 'mobile-apps', label: '📱 Mobile Apps' },
                  { id: 'backend-db', label: '🗄 DB & Cloud' },
                  { id: 'ai-automation', label: '🔀 AI Automation' },
                  { id: 'ai-agents', label: '🤖 Agents & RAG' },
                  { id: 'voice-chatbots', label: '🎙 Voice & Bots' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setBadgeFilterCategory(tab.id as BadgeCategory)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      badgeFilterCategory === tab.id
                        ? 'bg-amber-500 text-black font-extrabold shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Badges Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={badgeSearchQuery}
                  onChange={(e) => setBadgeSearchQuery(e.target.value)}
                  placeholder="Search tools (Base44, Replit, Blink, FlutterFlow, Lovable, Bolt, Cursor)..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Badges Grid */}
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
                {filteredBadges.map((badge) => {
                  const isSelected = selectedBadges.includes(badge.id);
                  return (
                    <button
                      key={badge.id}
                      onClick={() => handleToggleBadge(badge.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 ring-2 ring-amber-500 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{badge.iconSymbol}</span>
                      <span>{badge.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Feature Pill Badges Editor (Used in Boxed Accent, Bento Grid, and SaaS Ribbon layouts) */}
            {(layoutType === 'boxed-accent-pills' || layoutType === 'bento-grid' || layoutType === 'gradient-pill-saas' || layoutType === 'neon-cyber-agency') && (
              <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      Feature Pill Badges ({pillBadges.length}/6)
                    </label>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">High-converting micro-badges</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPillBadge}
                    disabled={pillBadges.length >= 6}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Badge</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {pillBadges.map((pill, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 group">
                      <span className="text-xs font-bold text-slate-400 w-5 shrink-0">#{idx + 1}</span>
                      <div className="relative flex-1 flex items-center">
                        <input
                          type="text"
                          value={pill}
                          onChange={(e) => handleUpdatePillBadge(idx, e.target.value)}
                          placeholder={`Deliverable #${idx + 1}`}
                          className="w-full pl-2.5 pr-8 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:ring-1 focus:ring-amber-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePillBadge(idx)}
                          disabled={pillBadges.length <= 1}
                          title={pillBadges.length <= 1 ? "At least 1 badge is required" : "Delete this badge"}
                          className="absolute right-1.5 p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-25 disabled:hover:text-slate-400 transition-colors cursor-pointer rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bullets List (Used in Modern Bullets, Split Showcase Metric, and App Store layouts) */}
            {(layoutType === 'modern-bullets' || layoutType === 'split-showcase-metric' || layoutType === 'app-store-mockup') && (
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Feature Bullets ({bullets.length}/4)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    disabled={bullets.length >= 4}
                    className="text-xs font-bold text-amber-500 hover:underline disabled:opacity-50"
                  >
                    + Add Bullet
                  </button>
                </div>
                <div className="space-y-2">
                  {bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => handleUpdateBullet(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                      />
                      {bullets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBullet(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Layout & Theme Customization */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Layout className="w-4 h-4 text-amber-500" />
              Layout & Color Palette
            </h3>

            {/* Layout Preset Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Composition Layout (11 Pro Formats)
                </label>
                <span className="text-[11px] font-bold text-amber-500">★ Client Recommended</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
                {[
                  { id: 'boxed-accent-pills', label: 'Boxed Accents & Pills', hint: 'High CTR • 2x3 Badges Grid' },
                  { id: 'centered-flanked', label: 'Dual-Column Flanked', hint: 'Clean Studio • 6 Tool Badges' },
                  { id: 'split-showcase-metric', label: '3-Metric High Roller', hint: '★ Client Pick • Stats + Rating' },
                  { id: 'neon-cyber-agency', label: 'Neon Cyber Agency', hint: 'Glowing Cyber Accent • Ultra High CTR' },
                  { id: 'app-store-mockup', label: 'Dual Device Showcase', hint: 'Mobile Apps • App Store Ready' },
                  { id: 'gradient-pill-saas', label: 'Modern SaaS Ribbon', hint: 'Mega Badge • Glass Tiles' },
                  { id: 'split-hero', label: 'Split Hero & Badges', hint: 'Agency Standard • Left Focus' },
                  { id: 'modern-bullets', label: 'Headline & Feature Cards', hint: 'Service Checklist Cards' },
                  { id: 'bento-grid', label: 'Bento Showcase Grid', hint: 'Modular Glass Bento Layout' },
                  { id: 'badge-flank-bottom', label: '8-Tool Ribbon Stack', hint: 'Multi-Tool & Frameworks' },
                  { id: 'minimalist-dark-card', label: 'Dark Luxury & Stat Chips', hint: 'Minimalist High-Ticket UI' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLayoutType(l.id as LayoutType)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      layoutType === l.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold ring-1 ring-amber-500/30 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="font-extrabold flex items-center justify-between">
                      <span>{l.label}</span>
                    </div>
                    <div className="text-[10px] opacity-75 font-normal mt-0.5">{l.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Contrast Color Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_THEMES.map((theme) => {
                  const isSelected = selectedThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500/20 bg-slate-50 dark:bg-slate-800'
                          : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex gap-1 shrink-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: theme.highlightColor }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: theme.bgGradStart }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {theme.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upload Custom Portrait */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Seller Portrait Photo (PNG / JPG)
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-amber-500" />
                  {uploadedImage ? 'Change Photo' : 'Upload Seller Photo'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {uploadedImage && (
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold hover:bg-rose-500/20"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Canvas & Policy Audit (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          {/* Canvas Live Preview Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Live 1280 × 769 px Thumbnail Preview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewScale(previewScale === 'fit' ? 'thumbnail' : 'fit')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {previewScale === 'fit' ? 'Search Card View' : 'Full HD View'}
                </button>
              </div>
            </div>

            {/* Canvas Container with dynamic scaling */}
            <div className="w-full bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
              <div
                className={`transition-all duration-300 ${
                  previewScale === 'thumbnail' ? 'w-[360px] max-w-full' : 'w-full'
                }`}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto rounded-xl shadow-2xl block border border-white/5"
                />
              </div>
            </div>

            {/* Download & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleCopyImage}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                Copy Image to Clipboard
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadJpg}
                  disabled={isExporting}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-300" />
                  Download JPG (&lt;2MB)
                </button>
                <button
                  onClick={handleDownloadPng}
                  disabled={isExporting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-black" />
                  Download 1280×769 HD (PNG)
                </button>
              </div>
            </div>
          </div>

          {/* Fiverr Policy & Compliance Audit Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    complianceAudit.isCompliant
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-rose-500/10 text-rose-500'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Fiverr Policy & Content Compliance Audit
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Automated heuristic check against Fiverr marketplace guidelines & TOS.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Audit Score:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    complianceAudit.score >= 80
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}
                >
                  {complianceAudit.score}/100
                </span>
              </div>
            </div>

            {/* Audit Issues list */}
            {complianceAudit.issues.length > 0 ? (
              <div className="space-y-2.5 pt-2">
                {complianceAudit.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                      issue.type === 'error'
                        ? 'bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400'
                        : 'bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{issue.message}</span>
                    </div>
                    {issue.fix && (
                      <p className="pl-6 text-[11px] opacity-90">
                        <strong className="font-semibold">Recommended Fix:</strong> {issue.fix}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>
                  All content complies with standard Fiverr guidelines (No off-platform links, compliant text density, no unsupported promises).
                </span>
              </div>
            )}

            {/* Policy Advisory Reminder */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
              <span>
                <strong>Seller Notice:</strong> Always review the official Fiverr Community Standards before publishing your Gig. Ensure any badges or claims reflect your true skills and certifications.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiverrGigImageGenerator;
