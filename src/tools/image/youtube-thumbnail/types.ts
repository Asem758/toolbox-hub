export type YouTubeNiche =
  | 'education'
  | 'technology'
  | 'business'
  | 'entertainment'
  | 'news'
  | 'creative'
  | 'custom';

export type ThumbnailLayout =
  | 'split-face-punchy'      // 1. Left subject + Right massive 2-line punchy text with glowing boxed pill tag
  | 'centered-shock'         // 2. Center focal image/face + Top high-voltage yellow banner + Bottom red urgency box
  | 'before-after-split'     // 3. Left red "BEFORE" + Right green "AFTER" with glowing center "VS" badge
  | 'cinematic-dark-luxury'  // 4. Moody dark documentary vignette + gold embossed title + sleek stat chip
  | 'tech-cyber-neon'        // 5. Neon cyan/magenta grid + glowing subject outline + holographic badges
  | 'gaming-high-energy'     // 6. Dynamic diagonal split slash + electric flame aura + bold slanted typography
  | 'educational-checklist'  // 7. Left tutor portrait + Right 3 high-contrast numbered bullet pills with checkmarks
  | 'breaking-news-urgent'   // 8. Yellow/Black danger warning tape + bold red "BREAKING" stamp + headline box
  | 'stat-shock-minimal'     // 9. Huge bold stat display ("0 ➔ $50,000") + sleek subtitle + minimalist studio
  | 'device-app-mockup'      // 10. Floating smartphone/laptop screen mockup + glowing highlight border + tags
  | 'reaction-face-burst'    // 11. Right dramatic reaction headshot + Left comic explosion badge with punch text
  | 'podcast-interview-duo'  // 12. Dual circular avatar frames + soundwave graphic + microphone badge
  | 'versus-rivalry-battle'  // 13. Blue Corner vs Red Corner split with epic lightning & center VS badge
  | 'secret-revealed-blur'   // 14. Focal subject with red directional callout arrow & glowing "SECRET" pill
  | 'top-listicle-ranking'   // 15. Crown trophy rank pill + massive gradient number + 2-line subtext
  | 'viral-10x-arrow'        // 16. MrBeast / Top CTR: Shocked face + 3D Green Trending Up Arrow + "10X MORE VIEWS!" neon badge
  | 'bold-3d-title-plate'    // 17. Legiit Top Seller: Massive 3D Stacked Title + Glossy 3D Red YouTube Play Button + Shock face
  | 'money-wealth-blueprint' // 18. Finance Reveal: "50,000$ PER MONTH" + Cash Stacks + Gold Metric Glow + Pointing Presenter
  | 'doodle-chalk-arrow'     // 19. High Curiosity: Hand-drawn white circular loops + curved arrow pointing to shocked face
  | 'thumbnail-inception-grid' // 20. Showcase: Floating multi-thumbnail cards inception + presenter pointing + tutorial hook
  | 'laser-eyes-shock';      // 21. Neon laser eyes energy surge + 10X views neon badge + high octane backdrop

export interface ViralGraphicsConfig {
  showGrowthArrow?: boolean;       // 3D Neon Green Upward Trending Arrow
  showPlayButtonBadge?: boolean;   // 3D Glossy Red YouTube Play Button
  showDoodleArrows?: boolean;      // Hand-drawn chalk white circular loop & pointer arrow
  showLaserEyes?: boolean;         // Neon laser eye energy beams
  showMoneyStacks?: boolean;       // Floating cash stacks & dollar badges
  showCtrBadge?: boolean;          // "10X MORE VIEWS!" / "13.6% CTR" badge
  ctrBadgeText?: string;           // Custom text e.g. "10X MORE VIEWS!" or "13.6% CTR"
  textAngle?: number;              // -8 to +8 degrees dynamic action tilt
  text3dDepth?: number;            // 0 to 18 px 3D extrusion depth
}

export type OverlayStyle =
  | 'vignette'
  | 'dark-vignette'
  | 'radial-glow'
  | 'speed-lines'
  | 'cyber-grid'
  | 'sunburst-rays'
  | 'particles-sparks'
  | 'halftone-dots'
  | 'warning-tape'
  | 'glitch-scanlines'
  | 'diagonal-slits'
  | 'dark-fade-bottom'
  | 'none';

export interface LayoutMetadata {
  id: ThumbnailLayout;
  name: string;
  category: string;
  description: string;
  badge: string;
  icon: string;
  bestFor: string;
}

export interface ColorTheme {
  id: string;
  name: string;
  category: string;
  bgGradient: [string, string];
  primaryAccent: string;
  highlightColor: string;
  textColor: string;
  textMuted: string;
  badgeBg: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
  glowColor: string;
}

export interface NicheCategoryConfig {
  id: YouTubeNiche;
  name: string;
  subcategories: string[];
  defaultStyle: ThumbnailLayout;
  suggestedPalettes: string[];
  sampleTitles: string[];
}

export interface BrandKitData {
  channelName: string;
  channelHandle: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl?: string;
}

export interface QualityAuditScore {
  visualImpact: number;
  mobileReadability: number;
  topicRelevance: number;
  composition: number;
  overallScore: number;
  feedback: string[];
}

export interface ImageAdjustments {
  mode: 'background' | 'subject'; // Full 16:9 canvas backdrop or isolated subject
  panX: number; // -100 to 100 percentage
  panY: number; // -100 to 100 percentage
  zoom: number; // 50 to 300 percentage
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  dimming: number; // 0 to 90 percentage dark overlay for text contrast
  blur: number; // 0 to 20 px
  // Subject cutout specific
  subjectPosition: 'left' | 'center' | 'right' | 'custom';
  subjectShape: 'cutout' | 'rounded-card' | 'circle' | 'square' | 'hexagon' | 'pill' | 'diamond' | 'device-mockup';
  glowColor: string;
  glowBlur: number;
  glowWidth: number;
}

export interface FontPreset {
  id: string;
  name: string;
  category: 'Viral & Bold' | 'Condensed & Tall' | 'Gaming & Action' | 'Cinematic & Luxury' | 'Playful & 3D' | 'Modern & Clean';
  css: string;
  weight: string;
  previewName: string;
  description: string;
}
