import { ThumbnailLayout, ColorTheme, BrandKitData, ImageAdjustments, OverlayStyle, ViralGraphicsConfig } from './types';
import { FONTS_LIST } from './constants';

export interface RenderCanvasParams {
  canvas: HTMLCanvasElement;
  layout: ThumbnailLayout;
  theme: ColorTheme;
  fontFamily: string;
  fontSizeMultiplier: number;
  textStroke: boolean;
  boxedHighlight: boolean;
  overlayStyle: OverlayStyle | string;
  overlayOpacity?: number; // 0 to 1, defaults to 0.85
  punchyHeadline: string;
  punchySubtext: string;
  supportingBadge: string;
  timestampBadge: string;
  showTimestamp: boolean;
  bulletsList: string[];
  brandKit: BrandKitData;
  subcategory: string;
  viralConfig?: ViralGraphicsConfig;
  // Image assets
  loadedImage: HTMLImageElement | null;
  imageAdjustments: ImageAdjustments;
  logoImage?: HTMLImageElement | null;
}

/**
 * Draws an image with object-fit: cover logic and user pan/zoom adjustments
 * inside a defined rectangular or shaped bounding box without ANY distortion or overflow.
 */
export function drawFittedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  targetX: number,
  targetY: number,
  targetW: number,
  targetH: number,
  adjustments: ImageAdjustments,
  shape: 'rect' | 'circle' | 'rounded-card' | 'hexagon' | 'pill' | 'diamond' | 'cutout' | 'square' | 'device-mockup' = 'rect'
) {
  ctx.save();

  // 1. Establish clipping mask to ensure ZERO overflow
  ctx.beginPath();
  if (shape === 'circle') {
    const radius = Math.min(targetW, targetH) / 2;
    ctx.arc(targetX + targetW / 2, targetY + targetH / 2, radius, 0, Math.PI * 2);
  } else if (shape === 'rounded-card') {
    ctx.roundRect(targetX, targetY, targetW, targetH, 28);
  } else if (shape === 'pill') {
    ctx.roundRect(targetX, targetY, targetW, targetH, Math.min(targetW, targetH) / 2);
  } else if (shape === 'diamond') {
    const cx = targetX + targetW / 2;
    const cy = targetY + targetH / 2;
    ctx.moveTo(cx, targetY);
    ctx.lineTo(targetX + targetW, cy);
    ctx.lineTo(cx, targetY + targetH);
    ctx.lineTo(targetX, cy);
    ctx.closePath();
  } else if (shape === 'hexagon') {
    const cx = targetX + targetW / 2;
    const cy = targetY + targetH / 2;
    const r = Math.min(targetW, targetH) / 2;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const hx = cx + r * Math.cos(angle);
      const hy = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
  } else {
    ctx.rect(targetX, targetY, targetW, targetH);
  }
  ctx.clip();

  // 2. Calculate aspect-ratio preserving dimensions (object-fit: cover)
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const targetAspect = targetW / targetH;
  let baseDrawW: number;
  let baseDrawH: number;

  if (imgAspect > targetAspect) {
    // Image is wider than target
    baseDrawH = targetH;
    baseDrawW = targetH * imgAspect;
  } else {
    // Image is taller than target
    baseDrawW = targetW;
    baseDrawH = targetW / imgAspect;
  }

  // Apply user zoom
  const zoomFactor = adjustments.zoom / 100;
  const drawW = baseDrawW * zoomFactor;
  const drawH = baseDrawH * zoomFactor;

  // Apply user pan offset (percentage based relative to canvas size)
  const offsetX = (adjustments.panX / 100) * targetW;
  const offsetY = (adjustments.panY / 100) * targetH;

  // Base centered coordinates
  const centerX = targetX + (targetW - drawW) / 2 + offsetX;
  const centerY = targetY + (targetH - drawH) / 2 + offsetY;

  // Handle Flipping
  ctx.save();
  if (adjustments.flipH || adjustments.flipV) {
    ctx.translate(targetX + targetW / 2, targetY + targetH / 2);
    ctx.scale(adjustments.flipH ? -1 : 1, adjustments.flipV ? -1 : 1);
    ctx.translate(-(targetX + targetW / 2), -(targetY + targetH / 2));
  }

  // Handle Blur filter only if explicitly requested
  ctx.save();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (adjustments.blur > 0) {
    ctx.filter = `blur(${adjustments.blur}px)`;
  } else {
    ctx.filter = 'none';
  }

  // Draw the image
  ctx.drawImage(img, centerX, centerY, drawW, drawH);
  ctx.restore();

  // Draw Darkening Dim Overlay (only when explicitly set > 0)
  if (adjustments.dimming > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${adjustments.dimming / 100})`;
    ctx.fillRect(targetX, targetY, targetW, targetH);
  }

  ctx.restore();
}

/**
 * Draws sophisticated, authentic high-contrast Background Visual FX Overlays
 */
function drawBackgroundOverlay(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  overlayStyle: OverlayStyle | string,
  theme: ColorTheme,
  opacity: number = 0.85
) {
  if (overlayStyle === 'none' || opacity <= 0) return;

  ctx.save();
  ctx.globalAlpha = Math.min(1, Math.max(0, opacity));

  // 1. DARK VIGNETTE
  if (overlayStyle === 'vignette' || overlayStyle === 'dark-vignette') {
    const radGrad = ctx.createRadialGradient(W / 2, H / 2, 220, W / 2, H / 2, 760);
    radGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    radGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0.45)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.92)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, W, H);
  }

  // 2. SPOTLIGHT NEON RADIAL GLOW
  else if (overlayStyle === 'radial-glow') {
    const glowX = W * 0.45;
    const glowY = H * 0.45;
    const radGrad = ctx.createRadialGradient(glowX, glowY, 40, glowX, glowY, 650);
    const hex = theme.highlightColor || '#facc15';
    radGrad.addColorStop(0, hex);
    radGrad.addColorStop(0.35, theme.primaryAccent || hex);
    radGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.6)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.9)');

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = Math.min(1, opacity * 0.55);
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Dark edge vignette around glow
    const edgeGrad = ctx.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 750);
    edgeGrad.addColorStop(0, 'transparent');
    edgeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, W, H);
  }

  // 3. ACTION SPEED LINES (Anime / Manga Urgency)
  else if (overlayStyle === 'speed-lines') {
    const cx = W / 2;
    const cy = H / 2;
    const rayCount = 72;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';

    for (let i = 0; i < rayCount; i++) {
      const angle = (Math.PI * 2 * i) / rayCount;
      const length = 400 + ((i * 13) % 220);
      const innerR = 260 + ((i * 29) % 120);

      const x1 = cx + Math.cos(angle) * (cx + 400);
      const y1 = cy + Math.sin(angle) * (cy + 400);
      const x2 = cx + Math.cos(angle) * innerR;
      const y2 = cy + Math.sin(angle) * innerR;

      ctx.lineWidth = (i % 3 === 0 ? 3.5 : 1.5);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();

    // Dark center falloff vignette so speed lines frame the action
    const radGrad = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 750);
    radGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, W, H);
  }

  // 4. RADIANT SUNBURST RAYS (MrBeast Viral Comic Rays)
  else if (overlayStyle === 'sunburst-rays') {
    const cx = W / 2;
    const cy = H / 2;
    const numRays = 28;
    const maxRadius = Math.sqrt(W * W + H * H);

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < numRays; i += 2) {
      const a1 = (Math.PI * 2 * i) / numRays;
      const a2 = (Math.PI * 2 * (i + 1)) / numRays;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxRadius, a1, a2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Subtle edge dark vignette
    const radGrad = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 750);
    radGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, W, H);
  }

  // 5. CYBER TECH GRID & PERSPECTIVE HORIZON
  else if (overlayStyle === 'cyber-grid' || overlayStyle === 'grid') {
    ctx.save();
    ctx.strokeStyle = `${theme.highlightColor || '#00f0ff'}33`;
    ctx.lineWidth = 1.2;

    // Top subtle orthogonal grid
    for (let x = 0; x < W; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Glowing horizon line at bottom
    ctx.strokeStyle = theme.highlightColor || '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, H - 90);
    ctx.lineTo(W, H - 90);
    ctx.stroke();

    ctx.restore();
  }

  // 6. GLOWING FIRE SPARKS & EMBERS
  else if (overlayStyle === 'particles-sparks' || overlayStyle === 'particles') {
    ctx.save();
    const sparks = [
      { x: 120, y: 150, r: 4, a: 0.8 },
      { x: 280, y: 90, r: 6, a: 0.9 },
      { x: 450, y: 220, r: 3, a: 0.6 },
      { x: 750, y: 110, r: 5, a: 0.85 },
      { x: 920, y: 180, r: 7, a: 0.95 },
      { x: 1120, y: 80, r: 4, a: 0.75 },
      { x: 180, y: 520, r: 5, a: 0.8 },
      { x: 380, y: 610, r: 6, a: 0.9 },
      { x: 620, y: 540, r: 4, a: 0.7 },
      { x: 860, y: 620, r: 8, a: 0.95 },
      { x: 1040, y: 510, r: 5, a: 0.85 },
      { x: 1220, y: 590, r: 4, a: 0.75 },
      { x: 540, y: 80, r: 5, a: 0.9 },
      { x: 980, y: 340, r: 6, a: 0.85 },
    ];

    sparks.forEach((sp) => {
      ctx.save();
      ctx.shadowColor = theme.highlightColor || '#ff7a00';
      ctx.shadowBlur = 16;
      ctx.fillStyle = theme.highlightColor || '#ff7a00';
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // White hot core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }

  // 7. COMIC HALFTONE DOTS
  else if (overlayStyle === 'halftone-dots') {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    const spacing = 28;
    for (let x = 0; x < W; x += spacing) {
      for (let y = 0; y < H; y += spacing) {
        const distFromCenter = Math.sqrt(Math.pow(x - W / 2, 2) + Math.pow(y - H / 2, 2));
        const radius = Math.max(1, 4 - (distFromCenter / 700) * 3);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // 8. CAUTION CRIME TAPE
  else if (overlayStyle === 'warning-tape') {
    ctx.save();
    const tapeH = 50;
    const tapeY = H - tapeH - 20;

    // Yellow background banner
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, tapeY, W, tapeH);

    // Diagonal black warning stripes
    ctx.fillStyle = '#000000';
    for (let x = -50; x < W + 50; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, tapeY);
      ctx.lineTo(x + 25, tapeY);
      ctx.lineTo(x, tapeY + tapeH);
      ctx.lineTo(x - 25, tapeY + tapeH);
      ctx.closePath();
      ctx.fill();
    }

    // Top and bottom black borders
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, tapeY);
    ctx.lineTo(W, tapeY);
    ctx.moveTo(0, tapeY + tapeH);
    ctx.lineTo(W, tapeY + tapeH);
    ctx.stroke();

    ctx.restore();
  }

  // 9. GLITCH CRT SCANLINES
  else if (overlayStyle === 'glitch-scanlines') {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    for (let y = 0; y < H; y += 4) {
      ctx.fillRect(0, y, W, 2);
    }
    ctx.restore();
  }

  // 10. DIAGONAL ENERGY SLASHES
  else if (overlayStyle === 'diagonal-slits') {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3;
    for (let x = -200; x < W + 200; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 350, H);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 11. BOTTOM SUBTITLE FADE
  else if (overlayStyle === 'dark-fade-bottom') {
    const fadeGrad = ctx.createLinearGradient(0, H * 0.45, 0, H);
    fadeGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    fadeGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.65)');
    fadeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, 0, W, H);
  }

  // 12. TECH WORKSTATION & MONITORS (Developer studio with dual monitors & code glow)
  else if (overlayStyle === 'tech-workstation-neon') {
    drawDeveloperWorkstationBackdrop(ctx, W, H, theme);
  }

  // 13. NEON DATA HORIZON & GRID (Rising data wave with cyber horizon)
  else if (overlayStyle === 'neon-data-grid') {
    drawNeonDataGridOverlay(ctx, W, H, theme);
  }

  ctx.restore();
}

/**
 * Draws a High-Fidelity Modern Tech & Developer Workstation Backdrop
 * Features dual glowing widescreen monitors, code syntax highlighting, analytics graphs,
 * cyber perspective grid, and dramatic dual-tone cyan/purple ambient studio lighting.
 */
export function drawDeveloperWorkstationBackdrop(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  theme: ColorTheme
) {
  ctx.save();

  // 1. Dual-Tone Volumetric Atmosphere
  const cyanAura = ctx.createRadialGradient(W * 0.25, H * 0.35, 30, W * 0.25, H * 0.35, 520);
  cyanAura.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
  cyanAura.addColorStop(0.6, 'rgba(6, 182, 212, 0.08)');
  cyanAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = cyanAura;
  ctx.fillRect(0, 0, W, H);

  const purpleAura = ctx.createRadialGradient(W * 0.8, H * 0.3, 40, W * 0.8, H * 0.3, 560);
  purpleAura.addColorStop(0, 'rgba(192, 38, 211, 0.28)');
  purpleAura.addColorStop(0.6, 'rgba(147, 51, 234, 0.1)');
  purpleAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = purpleAura;
  ctx.fillRect(0, 0, W, H);

  // 2. Cyber Horizon Grid on lower canvas
  const horizonY = H * 0.54;
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
  ctx.lineWidth = 1.2;

  // Horizontal receding grid lines
  for (let i = 0; i < 9; i++) {
    const y = horizonY + Math.pow(i / 8, 1.8) * (H - horizonY);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Perspective vertical lines converging to center horizon
  const fovCenterX = W * 0.48;
  for (let x = -200; x <= W + 200; x += 75) {
    ctx.beginPath();
    ctx.moveTo(fovCenterX, horizonY);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Monitor #1 (Left Workstation Screen - Code Editor)
  ctx.save();
  const m1X = 60;
  const m1Y = 70;
  const m1W = 400;
  const m1H = 260;

  // Monitor Glow
  ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';
  ctx.shadowBlur = 32;

  // Monitor Frame & Glass Panel
  ctx.fillStyle = '#090d19';
  ctx.beginPath();
  ctx.roundRect(m1X, m1Y, m1W, m1H, 14);
  ctx.fill();

  // Bezel Border
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Top Window Header Bar
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(m1X, m1Y, m1W, 28, [14, 14, 0, 0]);
  ctx.fill();

  // Window Dots (Red, Yellow, Green)
  const dots = ['#ef4444', '#facc15', '#22c55e'];
  dots.forEach((color, idx) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(m1X + 18 + idx * 15, m1Y + 14, 4.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Editor Code Lines (Syntax Highlighted)
  const codeLines = [
    { indent: 14, w: 90, color: '#38bdf8' },
    { indent: 35, w: 140, color: '#facc15' },
    { indent: 35, w: 180, color: '#e2e8f0' },
    { indent: 55, w: 110, color: '#c084fc' },
    { indent: 55, w: 160, color: '#4ade80' },
    { indent: 35, w: 70, color: '#38bdf8' },
    { indent: 14, w: 120, color: '#f43f5e' },
    { indent: 35, w: 200, color: '#38bdf8' },
    { indent: 55, w: 130, color: '#facc15' },
    { indent: 35, w: 90, color: '#e2e8f0' },
  ];

  codeLines.forEach((line, idx) => {
    const lineY = m1Y + 46 + idx * 20;
    ctx.fillStyle = line.color;
    ctx.beginPath();
    ctx.roundRect(m1X + line.indent, lineY, line.w, 9, 3);
    ctx.fill();
  });

  ctx.restore();

  // 4. Monitor #2 (Center/Right Workstation Screen - Data Analytics & Charts)
  ctx.save();
  const m2X = 390;
  const m2Y = 110;
  const m2W = 350;
  const m2H = 230;

  // Monitor Glow
  ctx.shadowColor = 'rgba(192, 38, 211, 0.4)';
  ctx.shadowBlur = 32;

  // Monitor Frame & Glass Panel
  ctx.fillStyle = '#080914';
  ctx.beginPath();
  ctx.roundRect(m2X, m2Y, m2W, m2H, 14);
  ctx.fill();

  ctx.strokeStyle = 'rgba(217, 70, 239, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Window Header
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#110e24';
  ctx.beginPath();
  ctx.roundRect(m2X, m2Y, m2W, 28, [14, 14, 0, 0]);
  ctx.fill();

  // Bar Chart inside Monitor 2
  const barHeights = [45, 75, 110, 60, 95, 130, 85];
  barHeights.forEach((bh, i) => {
    const bx = m2X + 26 + i * 22;
    const by = m2Y + m2H - 32 - bh;
    const barGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
    barGrad.addColorStop(0, '#00f0ff');
    barGrad.addColorStop(1, '#6366f1');
    ctx.fillStyle = barGrad;
    ctx.beginPath();
    ctx.roundRect(bx, by, 14, bh, 3);
    ctx.fill();
  });

  // Circular Donut Metric Gauge
  const donutCx = m2X + 250;
  const donutCy = m2Y + 115;
  const donutR = 40;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(donutCx, donutCy, donutR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(donutCx, donutCy, donutR, -Math.PI * 0.5, Math.PI * 0.85);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('94%', donutCx, donutCy);

  ctx.restore();

  // 5. Desk Surface with Neon Edge Glow
  ctx.save();
  const deskGrad = ctx.createLinearGradient(0, H - 120, 0, H);
  deskGrad.addColorStop(0, 'rgba(8, 12, 24, 0.8)');
  deskGrad.addColorStop(1, 'rgba(3, 5, 12, 0.98)');
  ctx.fillStyle = deskGrad;
  ctx.fillRect(0, H - 120, W, 120);

  // Neon desk edge line
  ctx.strokeStyle = '#00f0ff';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 18;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, H - 120);
  ctx.lineTo(W, H - 120);
  ctx.stroke();
  ctx.restore();

  // 6. Ambient Lens Flare Stars
  const flares = [
    { x: m1X + m1W, y: m1Y + 20, r: 8, color: '#00f0ff' },
    { x: m2X + 15, y: m2Y + 30, r: 10, color: '#d946ef' },
    { x: W * 0.65, y: 90, r: 6, color: '#facc15' },
  ];

  flares.forEach((fl) => {
    ctx.save();
    ctx.shadowColor = fl.color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(fl.x, fl.y, fl.r * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // 4-point star cross
    ctx.strokeStyle = fl.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fl.x - fl.r * 2.2, fl.y);
    ctx.lineTo(fl.x + fl.r * 2.2, fl.y);
    ctx.moveTo(fl.x, fl.y - fl.r * 2.2);
    ctx.lineTo(fl.x, fl.y + fl.r * 2.2);
    ctx.stroke();
    ctx.restore();
  });

  ctx.restore();
}

/**
 * Draws a Neon Horizon & Dynamic Rising Data Grid Overlay
 */
export function drawNeonDataGridOverlay(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  theme: ColorTheme
) {
  ctx.save();
  const horizY = H * 0.52;

  // Horizon glow
  const horizGlow = ctx.createRadialGradient(W / 2, horizY, 20, W / 2, horizY, 650);
  horizGlow.addColorStop(0, 'rgba(0, 240, 255, 0.28)');
  horizGlow.addColorStop(0.5, 'rgba(168, 85, 247, 0.12)');
  horizGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = horizGlow;
  ctx.fillRect(0, 0, W, H);

  // Receding Grid Lines
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 10; i++) {
    const y = horizY + Math.pow(i / 9, 2) * (H - horizY);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Perspective Lines
  for (let x = -150; x <= W + 150; x += 65) {
    ctx.beginPath();
    ctx.moveTo(W / 2, horizY);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  // Glowing 3D wave in background
  drawDynamicDataWave(ctx, 40, H * 0.72, W - 60, H * 0.42, '#00f0ff', '#f59e0b');

  ctx.restore();
}

/**
 * Draws an Explosive 3D Comic Starburst Badge (High CTR Hook)
 * Used for "COMPLETE ROADMAP", "FULL COURSE", "100% FREE", etc.
 */
export function drawExplosiveStarburstBadge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number = 88,
  innerRadius?: number,
  numPoints: number = 18,
  text: string = 'COMPLETE ROADMAP',
  angleDeg: number = -10,
  colorScheme: 'gold' | 'red' | 'cyan' | 'green' | 'purple' | 'orange' | 'white' = 'gold',
  customFill1?: string,
  customFill2?: string,
  strokeColor: string = '#000000',
  textColor?: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((angleDeg * Math.PI) / 180);

  const actualInnerR = innerRadius || outerRadius * 0.74;

  // 1. Sharp 3D Multi-Layer Cast Drop Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.88)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 10;

  // Starburst Path
  ctx.beginPath();
  for (let i = 0; i < numPoints * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : actualInnerR;
    const a = (Math.PI / numPoints) * i;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  // Color gradient definitions
  let c1 = '#fef08a';
  let c2 = '#f59e0b';
  let c3 = '#ea580c';
  let defaultTextColor = '#000000';

  if (colorScheme === 'red') {
    c1 = '#fca5a5';
    c2 = '#ef4444';
    c3 = '#991b1b';
    defaultTextColor = '#ffffff';
  } else if (colorScheme === 'cyan') {
    c1 = '#a5f3fc';
    c2 = '#06b6d4';
    c3 = '#0284c7';
    defaultTextColor = '#000000';
  } else if (colorScheme === 'green') {
    c1 = '#86efac';
    c2 = '#22c55e';
    c3 = '#15803d';
    defaultTextColor = '#000000';
  } else if (colorScheme === 'purple') {
    c1 = '#f0abfc';
    c2 = '#a855f7';
    c3 = '#6b21a8';
    defaultTextColor = '#ffffff';
  } else if (colorScheme === 'orange') {
    c1 = '#ffedd5';
    c2 = '#f97316';
    c3 = '#c2410c';
    defaultTextColor = '#000000';
  } else if (colorScheme === 'white') {
    c1 = '#ffffff';
    c2 = '#e2e8f0';
    c3 = '#94a3b8';
    defaultTextColor = '#000000';
  }

  if (customFill1) c1 = customFill1;
  if (customFill2) c2 = customFill2;

  const grad = ctx.createRadialGradient(0, -10, 10, 0, 0, outerRadius);
  grad.addColorStop(0, c1);
  grad.addColorStop(0.7, c2);
  grad.addColorStop(1, c3);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  // 2. Thick Crisp Outer Stroke (Comic / High-CTR style)
  ctx.beginPath();
  for (let i = 0; i < numPoints * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : actualInnerR;
    const a = (Math.PI / numPoints) * i;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // 3. Inner White Specular Ring
  ctx.beginPath();
  ctx.arc(0, 0, actualInnerR * 0.78, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 4. Center Punchy Text (1, 2, or 3 lines with auto-fit)
  let lines: string[] = [];
  if (text.includes('\n')) {
    lines = text.split('\n').map((l) => l.trim().toUpperCase()).filter(Boolean);
  } else {
    const words = text.trim().split(/\s+/);
    if (words.length <= 1) {
      lines = [text.trim().toUpperCase()];
    } else if (words.length === 2) {
      lines = [words[0].toUpperCase(), words[1].toUpperCase()];
    } else {
      const mid = Math.ceil(words.length / 2);
      lines = [words.slice(0, mid).join(' ').toUpperCase(), words.slice(mid).join(' ').toUpperCase()];
    }
  }

  const finalTextColor = textColor || defaultTextColor;
  ctx.fillStyle = finalTextColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Calculate font size to fit comfortably inside the starburst inner circle
  const maxAllowedW = actualInnerR * 1.5;
  let baseFontSize = lines.length === 1 ? Math.round(actualInnerR * 0.42) : Math.round(actualInnerR * 0.32);
  baseFontSize = Math.max(12, Math.min(30, baseFontSize));

  ctx.font = `900 ${baseFontSize}px "Anton", Impact, sans-serif`;
  let maxLineW = Math.max(...lines.map((l) => ctx.measureText(l).width));
  while (maxLineW > maxAllowedW && baseFontSize > 10) {
    baseFontSize -= 1;
    ctx.font = `900 ${baseFontSize}px "Anton", Impact, sans-serif`;
    maxLineW = Math.max(...lines.map((l) => ctx.measureText(l).width));
  }

  const lineHeight = baseFontSize * 1.1;
  const startY = -((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, idx) => {
    const ly = startY + idx * lineHeight;
    if (finalTextColor === '#ffffff') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1.5;
    }
    ctx.fillText(line, 0, ly);
    ctx.shadowColor = 'transparent';
  });

  ctx.restore();
}

/**
 * Draws a Floating 3D Tech Logo Capsule Pill (Python, ChatGPT, SQL, PowerBI, Excel)
 */
export function draw3DTechLogoPill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: string,
  label: string
) {
  ctx.save();
  const w = 110;
  const h = 42;
  const r = 21;

  // 3D Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 6;

  // Frosted dark pill background
  const pillGrad = ctx.createLinearGradient(x, y, x, y + h);
  pillGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
  pillGrad.addColorStop(1, 'rgba(5, 10, 22, 0.98)');
  ctx.fillStyle = pillGrad;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();

  // Glow Border matching brand
  let glowColor = '#00f0ff';
  if (type === 'python') glowColor = '#38bdf8';
  else if (type === 'chatgpt') glowColor = '#10b981';
  else if (type === 'sql') glowColor = '#06b6d4';
  else if (type === 'powerbi') glowColor = '#f59e0b';
  else if (type === 'excel') glowColor = '#22c55e';

  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 8;
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Reset shadow for inner icons & text
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Icon drawing (left side of pill: x + 18, y + 21)
  const iconX = x + 20;
  const iconY = y + 21;

  if (type === 'python') {
    // Dual yellow/blue snake heads
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(iconX - 2, iconY - 3, 6, Math.PI * 0.5, Math.PI * 1.5);
    ctx.lineTo(iconX + 3, iconY - 7);
    ctx.arc(iconX + 3, iconY - 3, 4, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(iconX + 2, iconY + 3, 6, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.lineTo(iconX - 3, iconY + 7);
    ctx.arc(iconX - 3, iconY + 3, 4, Math.PI * 0.5, -Math.PI * 0.5);
    ctx.fill();

    // Eye dots
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(iconX - 3, iconY - 4, 1.2, 0, Math.PI * 2);
    ctx.arc(iconX + 3, iconY + 4, 1.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'chatgpt') {
    // OpenAI Rosette
    ctx.strokeStyle = '#10a37f';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const rx = iconX + Math.cos(a) * 4;
      const ry = iconY + Math.sin(a) * 4;
      ctx.arc(rx, ry, 5, a, a + Math.PI);
    }
    ctx.stroke();
  } else if (type === 'sql') {
    // 3D Database cylinder stack
    ctx.fillStyle = '#06b6d4';
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.2;
    for (let i = -1; i <= 1; i++) {
      const cy = iconY + i * 5;
      ctx.beginPath();
      ctx.ellipse(iconX, cy, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else if (type === 'powerbi') {
    // PowerBI 3-bar column growth
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(iconX - 7, iconY, 3, 8);
    ctx.fillRect(iconX - 2, iconY - 4, 3, 12);
    ctx.fillRect(iconX + 3, iconY - 8, 3, 16);
  } else if (type === 'excel') {
    // Excel green sheet box
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(iconX - 7, iconY - 7, 14, 14);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('X', iconX, iconY);
  } else {
    // Generic sparkle
    ctx.fillStyle = '#a855f7';
    ctx.font = '900 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', iconX, iconY);
  }

  // Label text
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 13px "Inter", "Montserrat", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, iconX + 14, iconY + 1);

  ctx.restore();
}

/**
 * Draws a Dynamic 3D Neon Data Wave (Growth / Trend Chart)
 */
export function drawDynamicDataWave(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color1: string = '#00f0ff',
  color2: string = '#d946ef'
) {
  ctx.save();
  const points = [
    { x: startX, y: startY },
    { x: startX + (endX - startX) * 0.18, y: startY - 45 },
    { x: startX + (endX - startX) * 0.35, y: startY - 20 },
    { x: startX + (endX - startX) * 0.52, y: startY - 90 },
    { x: startX + (endX - startX) * 0.70, y: startY - 65 },
    { x: startX + (endX - startX) * 0.88, y: startY - 140 },
    { x: endX, y: endY },
  ];

  // Neon Gradient Line
  const grad = ctx.createLinearGradient(startX, startY, endX, endY);
  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);

  // Soft Neon Glow Line
  ctx.shadowColor = color1;
  ctx.shadowBlur = 24;
  ctx.strokeStyle = grad;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();

  // White core line for electric brilliance
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Glowing Nodes
  points.forEach((p, idx) => {
    ctx.save();
    ctx.shadowColor = color1;
    ctx.shadowBlur = 14;
    ctx.fillStyle = idx === points.length - 1 ? '#facc15' : color1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, idx === points.length - 1 ? 7 : 5, 0, Math.PI * 2);
    ctx.fill();

    // White center pip
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Upward Arrow Head at the peak point
  const last = points[points.length - 1];
  ctx.save();
  ctx.translate(last.x, last.y);
  ctx.rotate(-Math.PI * 0.3);
  ctx.fillStyle = '#facc15';
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(-8, -8);
  ctx.lineTo(-4, 0);
  ctx.lineTo(-8, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/**
 * Draws High-Impact 3D Extruded Text with Multi-Layer Drop Shadow and Bevel Highlights
 */
export function draw3DExtrudedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  baseSize: number,
  fontFamily: string,
  weight: string,
  faceGradient: { colors: [string, string, string?]; dir?: 'vertical' | 'horizontal' },
  strokeColor: string = '#000000',
  strokeWidth: number = 14,
  extrusionDepth: number = 10,
  extrusionColor: string = '#090d1f',
  angleDeg: number = 0,
  align: CanvasTextAlign = 'left'
) {
  ctx.save();
  ctx.translate(x, y);
  if (angleDeg !== 0) ctx.rotate((angleDeg * Math.PI) / 180);

  ctx.font = `${weight} ${baseSize}px ${fontFamily}`;
  ctx.textAlign = align;

  // Auto shrink if exceeds max width
  let currentSize = baseSize;
  while (ctx.measureText(text).width > maxW && currentSize > 24) {
    currentSize -= 2;
    ctx.font = `${weight} ${currentSize}px ${fontFamily}`;
  }

  // 1. Deep Ambient Occlusion Drop Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 14;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = strokeWidth + 4;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeText(text, 0, 0);
  ctx.restore();

  // 2. 3D Extrusion Stack Layers (Down and right)
  if (extrusionDepth > 0) {
    ctx.save();
    ctx.fillStyle = extrusionColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    for (let d = extrusionDepth; d >= 1; d--) {
      const offX = d * 1.2;
      const offY = d * 1.5;
      ctx.strokeText(text, offX, offY);
      ctx.fillText(text, offX, offY);
    }
    ctx.restore();
  }

  // 3. Thick Outer Stroke Outline for extreme contrast
  if (strokeWidth > 0) {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(text, 0, 0);
    ctx.restore();
  }

  // 4. Vibrant Gradient Face
  ctx.save();
  const textH = currentSize;
  const grad = ctx.createLinearGradient(0, -textH, 0, 0);
  grad.addColorStop(0, faceGradient.colors[0]);
  grad.addColorStop(0.5, faceGradient.colors[1]);
  if (faceGradient.colors[2]) {
    grad.addColorStop(1, faceGradient.colors[2]);
  }
  ctx.fillStyle = grad;
  ctx.fillText(text, 0, 0);

  // 5. White Top Bevel Glint
  ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
  ctx.fillText(text, 0, -1);
  ctx.restore();

  ctx.restore();
}

/**
 * Draws Dramatic Dual-Tone Rim Lighting on Subject
 * Electric cyan on the left, magenta on the right, plus volumetric backlight halo.
 */
export function drawDualToneRimLight(
  ctx: CanvasRenderingContext2D,
  targetX: number,
  targetY: number,
  targetW: number,
  targetH: number
) {
  ctx.save();

  // 1. Volumetric Backlight Halo
  const halo = ctx.createRadialGradient(
    targetX + targetW * 0.5,
    targetY + targetH * 0.4,
    40,
    targetX + targetW * 0.5,
    targetY + targetH * 0.4,
    targetW * 0.75
  );
  halo.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
  halo.addColorStop(0.5, 'rgba(217, 70, 239, 0.2)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(targetX + targetW * 0.5, targetY + targetH * 0.4, targetW * 0.75, 0, Math.PI * 2);
  ctx.fill();

  // 2. Left Cyan Rim Flare
  ctx.save();
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 35;
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(targetX + 30, targetY + targetH - 20);
  ctx.lineTo(targetX + 8, targetY + targetH * 0.5);
  ctx.lineTo(targetX + 35, targetY + 30);
  ctx.stroke();
  ctx.restore();

  // 3. Right Magenta Rim Flare
  ctx.save();
  ctx.shadowColor = '#d946ef';
  ctx.shadowBlur = 35;
  ctx.strokeStyle = '#d946ef';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(targetX + targetW - 30, targetY + targetH - 20);
  ctx.lineTo(targetX + targetW - 8, targetY + targetH * 0.5);
  ctx.lineTo(targetX + targetW - 35, targetY + 30);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * Draws a 3D Glossy Neon Green Upward Trending Arrow (The #1 Viral YouTube Element)
 */
export function draw3DGreenGrowthArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number = 140,
  height: number = 170,
  angleDeg: number = 15
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angleDeg * Math.PI) / 180);

  // Outer Neon Drop Glow
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 35;

  const halfW = width / 2;
  const stemW = width * 0.46;
  const headH = height * 0.52;

  // 1. Dark 3D Extrusion Shadow Layer
  ctx.save();
  ctx.translate(6, 10);
  ctx.fillStyle = '#064e3b';
  ctx.beginPath();
  ctx.moveTo(0, -height / 2); // arrow tip
  ctx.lineTo(halfW, -height / 2 + headH); // right tip edge
  ctx.lineTo(stemW / 2, -height / 2 + headH); // right inner notch
  ctx.lineTo(stemW / 2, height / 2); // right stem bottom
  ctx.lineTo(-stemW / 2, height / 2); // left stem bottom
  ctx.lineTo(-stemW / 2, -height / 2 + headH); // left inner notch
  ctx.lineTo(-halfW, -height / 2 + headH); // left tip edge
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 2. Thick Outer Dark Stroke
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#000000';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 4;
  ctx.beginPath();
  ctx.moveTo(0, -height / 2);
  ctx.lineTo(halfW, -height / 2 + headH);
  ctx.lineTo(stemW / 2, -height / 2 + headH);
  ctx.lineTo(stemW / 2, height / 2);
  ctx.lineTo(-stemW / 2, height / 2);
  ctx.lineTo(-stemW / 2, -height / 2 + headH);
  ctx.lineTo(-halfW, -height / 2 + headH);
  ctx.closePath();
  ctx.stroke();

  // 3. Vibrant Green Gradient Face
  const grad = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
  grad.addColorStop(0, '#86efac'); // bright top highlight
  grad.addColorStop(0.3, '#22c55e'); // electric green
  grad.addColorStop(1, '#15803d'); // deep bottom green
  ctx.fillStyle = grad;
  ctx.fill();

  // 4. White Specular Top Flare Highlight
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, -height / 2 + 10);
  ctx.lineTo(halfW - 25, -height / 2 + headH - 12);
  ctx.lineTo(0, -height / 2 + headH - 15);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/**
 * Draws a Glossy 3D Red YouTube Play Button Badge
 */
export function drawGlossyYouTubeButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number = 80,
  height: number = 56,
  angleDeg: number = 0
) {
  ctx.save();
  ctx.translate(x, y);
  if (angleDeg !== 0) ctx.rotate((angleDeg * Math.PI) / 180);

  // 3D Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 6;

  // Red Beveled Shell
  const r = 16;
  const redGrad = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
  redGrad.addColorStop(0, '#ff1a1a');
  redGrad.addColorStop(0.7, '#cc0000');
  redGrad.addColorStop(1, '#990000');

  ctx.fillStyle = redGrad;
  ctx.beginPath();
  ctx.roundRect(-width / 2, -height / 2, width, height, r);
  ctx.fill();

  // Black Stroke Outline
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Top Gloss Reflection
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(-width / 2 + 4, -height / 2 + 3, width - 8, height / 2 - 2, [r - 2, r - 2, 4, 4]);
  const glossGrad = ctx.createLinearGradient(0, -height / 2, 0, 0);
  glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
  ctx.fillStyle = glossGrad;
  ctx.fill();
  ctx.restore();

  // Center White Play Triangle
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  const triW = width * 0.32;
  const triH = height * 0.42;
  ctx.moveTo(-triW * 0.4, -triH / 2);
  ctx.lineTo(triW * 0.65, 0);
  ctx.lineTo(-triW * 0.4, triH / 2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Draws Hand-Drawn White Chalk Focus Doodle Loop & Curved Pointer Arrow
 */
export function drawDoodleWhiteArrowAndLoop(
  ctx: CanvasRenderingContext2D,
  loopCenterX: number,
  loopCenterY: number,
  arrowStartX: number,
  arrowStartY: number,
  targetX: number,
  targetY: number
) {
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 10;

  // Hand-drawn double loop around focus point
  ctx.beginPath();
  ctx.ellipse(loopCenterX, loopCenterY, 130, 80, -0.1, 0, Math.PI * 1.85);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(loopCenterX + 4, loopCenterY - 3, 136, 84, -0.08, 0.3, Math.PI * 2.1);
  ctx.stroke();

  // Curved wavy arrow connecting to target
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(arrowStartX, arrowStartY);
  const midX = (arrowStartX + targetX) / 2 - 40;
  const midY = (arrowStartY + targetY) / 2 + 50;
  ctx.quadraticCurveTo(midX, midY, targetX, targetY);
  ctx.stroke();

  // Hand-drawn Arrowhead
  const angle = Math.atan2(targetY - midY, targetX - midX);
  const headLen = 28;
  ctx.beginPath();
  ctx.moveTo(targetX, targetY);
  ctx.lineTo(
    targetX - headLen * Math.cos(angle - Math.PI / 6),
    targetY - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    targetX - headLen * Math.cos(angle + Math.PI / 6),
    targetY - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Draws Neon Laser Eyes Effect shooting forward from subject face
 */
export function drawLaserEyes(
  ctx: CanvasRenderingContext2D,
  eye1X: number,
  eye1Y: number,
  eye2X: number,
  eye2Y: number,
  color: string = '#22c55e'
) {
  const eyes = [
    { x: eye1X, y: eye1Y },
    { x: eye2X, y: eye2Y },
  ];

  eyes.forEach((eye) => {
    ctx.save();
    // Huge Neon Blast Flare
    const rad = ctx.createRadialGradient(eye.x, eye.y, 4, eye.x, eye.y, 60);
    rad.addColorStop(0, '#ffffff');
    rad.addColorStop(0.2, color);
    rad.addColorStop(1, 'transparent');
    ctx.fillStyle = rad;
    ctx.beginPath();
    ctx.arc(eye.x, eye.y, 60, 0, Math.PI * 2);
    ctx.fill();

    // Laser Beam Ray shooting outward
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.strokeStyle = color;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(eye.x, eye.y);
    ctx.lineTo(eye.x - 280, eye.y - 40);
    ctx.stroke();

    // White Core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(eye.x, eye.y);
    ctx.lineTo(eye.x - 280, eye.y - 40);
    ctx.stroke();
    ctx.restore();

    // Starburst cross flares
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(eye.x - 30, eye.y);
    ctx.lineTo(eye.x + 30, eye.y);
    ctx.moveTo(eye.x, eye.y - 30);
    ctx.lineTo(eye.x, eye.y + 30);
    ctx.stroke();

    ctx.restore();
  });
}

/**
 * Draws Floating Cash Stacks and Dollar Symbols for Finance/Income Thumbnails
 */
export function drawMoneyStackGraphic(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Stack of 3 Banknote Bundles
  for (let i = 2; i >= 0; i--) {
    const offsetY = i * 14;
    const offsetX = i * 6;
    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Bill Body
    ctx.fillStyle = '#15803d';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(-70, -32, 140, 64, 6);
    ctx.fill();

    // Inner Border
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 2;
    ctx.strokeRect(-62, -26, 124, 52);

    // Center Emblem
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);

    // Strapping band
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-15, -32, 30, 64);
    ctx.fillStyle = '#000000';
    ctx.font = '900 10px sans-serif';
    ctx.fillText('10K', 0, 0);

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws Floating Mini Thumbnail Cards for Tutorial / Inception Showcases
 */
export function drawFloatingThumbnailCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  angleDeg: number,
  title: string,
  tag: string,
  color1: string,
  color2: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angleDeg * Math.PI) / 180);

  // Card Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;

  // Background Gradient
  const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 12);
  ctx.fill();

  // White Border
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Mini Badge
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 10, -h / 2 + 10, 65, 20, 4);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.font = '900 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(tag, -w / 2 + 42, -h / 2 + 24);

  // Mini Play Icon
  drawGlossyYouTubeButton(ctx, w / 2 - 24, h / 2 - 20, 30, 20, 0);

  // Mini Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, -w / 2 + 12, h / 2 - 12);

  ctx.restore();
}

/**
 * Main Canvas Render Function for 1280 × 720 HD YouTube Thumbnails
 */
export function renderThumbnailCanvas(params: RenderCanvasParams) {
  const {
    canvas,
    layout,
    theme,
    fontFamily,
    fontSizeMultiplier,
    textStroke,
    boxedHighlight,
    overlayStyle,
    overlayOpacity = 0.85,
    punchyHeadline,
    punchySubtext,
    supportingBadge,
    timestampBadge,
    showTimestamp,
    bulletsList,
    brandKit,
    subcategory,
    viralConfig,
    loadedImage,
    imageAdjustments,
  } = params;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = 1280;
  const H = 720;
  canvas.width = W;
  canvas.height = H;

  // GLOBAL CLIP TO 1280x720: Guaranteed no overflow!
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip();

  const fontObj = FONTS_LIST.find((f) => f.id === fontFamily) || FONTS_LIST[0];
  const selectedFont = fontObj.css;
  const selectedWeight = fontObj.weight || '900';

  // 1. Draw Base Background (Gradient or Full-Canvas Background Image)
  if (loadedImage && imageAdjustments.mode === 'background') {
    // Draw full background image with cover math and user dimming
    drawFittedImage(ctx, loadedImage, 0, 0, W, H, imageAdjustments, 'rect');
  } else {
    // Standard Rich Theme Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, theme.bgGradient[0]);
    bgGrad.addColorStop(1, theme.bgGradient[1]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);
  }

  // 2. Draw Background Overlay Effects with rich visual rendering & opacity
  drawBackgroundOverlay(ctx, W, H, overlayStyle, theme, overlayOpacity);

  // Helper text drawing function
  const drawFittedText = (
    text: string,
    x: number,
    y: number,
    maxW: number,
    baseSize: number,
    color: string,
    stroke: boolean = true,
    boxed: boolean = false,
    boxedBg: string = '#000000',
    align: CanvasTextAlign = 'left'
  ) => {
    ctx.save();
    const scaledSize = Math.round(baseSize * fontSizeMultiplier);
    ctx.font = `${selectedWeight} ${scaledSize}px ${selectedFont}`;
    ctx.textAlign = align;

    let currentSize = scaledSize;
    while (ctx.measureText(text).width > maxW && currentSize > 24) {
      currentSize -= 2;
      ctx.font = `${selectedWeight} ${currentSize}px ${selectedFont}`;
    }

    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    const padX = 22;
    const padY = 12;

    // Boxed Background Pill
    if (boxed) {
      const boxX = align === 'left' ? x - padX : align === 'center' ? x - textW / 2 - padX : x - textW - padX;
      const boxY = y - currentSize;
      const boxW = textW + padX * 2;
      const boxH = currentSize + padY * 2;

      ctx.fillStyle = boxedBg;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 12);
      ctx.fill();
    }

    // Stroke Outline for guaranteed mobile legibility
    if (stroke && textStroke) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(6, Math.round(currentSize * 0.12));
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(text, x, y);
    }

    // Main Text Fill
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  // Universal shape path generator
  const createShapePath = (
    c: CanvasRenderingContext2D,
    shape: string,
    tx: number,
    ty: number,
    tw: number,
    th: number
  ) => {
    c.beginPath();
    if (shape === 'circle') {
      const radius = Math.min(tw, th) / 2;
      c.arc(tx + tw / 2, ty + th / 2, radius, 0, Math.PI * 2);
    } else if (shape === 'rounded-card') {
      c.roundRect(tx, ty, tw, th, 28);
    } else if (shape === 'pill') {
      c.roundRect(tx, ty, tw, th, Math.min(tw, th) / 2);
    } else if (shape === 'diamond') {
      const cx = tx + tw / 2;
      const cy = ty + th / 2;
      c.moveTo(cx, ty);
      c.lineTo(tx + tw, cy);
      c.lineTo(cx, ty + th);
      c.lineTo(tx, cy);
      c.closePath();
    } else if (shape === 'hexagon') {
      const cx = tx + tw / 2;
      const cy = ty + th / 2;
      const r = Math.min(tw, th) / 2;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const hx = cx + r * Math.cos(angle);
        const hy = cy + r * Math.sin(angle);
        if (i === 0) c.moveTo(hx, hy);
        else c.lineTo(hx, hy);
      }
      c.closePath();
    } else {
      c.rect(tx, ty, tw, th);
    }
  };

  // Helper for Subject Cutout Drawing
  const drawSubjectFrame = (targetX: number, targetY: number, targetW: number, targetH: number) => {
    ctx.save();
    const effectiveShape = imageAdjustments.subjectShape || 'rounded-card';
    const effectiveGlowColor = imageAdjustments.glowColor || theme.highlightColor || '#facc15';
    const hasGlow = imageAdjustments.glowBlur > 0 || imageAdjustments.glowWidth > 0;
    const strokeW = Math.max(3, imageAdjustments.glowWidth || (imageAdjustments.glowBlur > 0 ? 5 : 0));

    if (loadedImage && imageAdjustments.mode === 'subject') {
      // 1. Draw image inside target frame with clipping
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      drawFittedImage(
        ctx,
        loadedImage,
        targetX,
        targetY,
        targetW,
        targetH,
        imageAdjustments,
        effectiveShape
      );

      // 2. Draw optional outline border with clean outer aura glow
      if (hasGlow && strokeW > 0) {
        ctx.save();
        if (imageAdjustments.glowBlur > 0) {
          ctx.shadowColor = effectiveGlowColor;
          ctx.shadowBlur = imageAdjustments.glowBlur;
        }
        ctx.strokeStyle = effectiveGlowColor;
        ctx.lineWidth = strokeW;
        createShapePath(ctx, effectiveShape, targetX, targetY, targetW, targetH);
        ctx.stroke();
        ctx.restore();
      }
    } else if (!loadedImage) {
      // Clean Subject Frame Placeholder ONLY when NO image is uploaded
      ctx.save();
      if (imageAdjustments.glowBlur > 0) {
        ctx.shadowColor = effectiveGlowColor;
        ctx.shadowBlur = imageAdjustments.glowBlur;
      }
      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = effectiveGlowColor;
      ctx.lineWidth = Math.max(2, strokeW);
      createShapePath(ctx, effectiveShape, targetX, targetY, targetW, targetH);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.shadowBlur = 0;
      ctx.fillStyle = theme.highlightColor;
      ctx.font = '900 56px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👤', targetX + targetW / 2, targetY + targetH / 2 - 15);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px sans-serif';
      ctx.fillText('PRESENTER / SUBJECT', targetX + targetW / 2, targetY + targetH / 2 + 40);

      ctx.fillStyle = theme.textMuted;
      ctx.font = '700 13px sans-serif';
      ctx.fillText('Upload photo or screenshot', targetX + targetW / 2, targetY + targetH / 2 + 68);
    }

    ctx.restore();
  };

  // =========================================================================
  // RENDER LAYOUTS
  // =========================================================================

  // 1. SPLIT FACE & 3D KEYWORD
  if (layout === 'split-face-punchy') {
    const pos = imageAdjustments.subjectPosition || 'right';
    const isLeft = pos === 'left';
    const isCenter = pos === 'center';

    if (isCenter) {
      drawSubjectFrame((W - 520) / 2, 105, 520, 500);

      if (supportingBadge.trim()) {
        ctx.fillStyle = theme.badgeBg;
        ctx.beginPath();
        ctx.roundRect((W - 280) / 2, 20, 280, 44, 22);
        ctx.fill();
        ctx.fillStyle = theme.badgeText;
        ctx.font = '900 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`★ ${supportingBadge.toUpperCase()}`, W / 2, 48);
      }

      drawFittedText(punchyHeadline.toUpperCase(), W / 2, 85, 950, 72, theme.highlightColor, true, boxedHighlight, '#000000', 'center');
      drawFittedText(punchySubtext.toUpperCase(), W / 2, H - 40, 950, 68, '#ffffff', true, boxedHighlight, theme.primaryAccent, 'center');
    } else {
      const subjX = isLeft ? 50 : 700;
      const subjY = 70;
      const subjW = 530;
      const subjH = 580;

      drawSubjectFrame(subjX, subjY, subjW, subjH);

      const textX = isLeft ? 630 : 60;
      let textY = 160;

      if (supportingBadge.trim()) {
        ctx.fillStyle = theme.badgeBg;
        ctx.beginPath();
        ctx.roundRect(textX, textY - 60, 240, 48, 24);
        ctx.fill();
        ctx.fillStyle = theme.badgeText;
        ctx.font = '900 19px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`★ ${supportingBadge.toUpperCase()}`, textX + 120, textY - 29);
      }

      drawFittedText(punchyHeadline.toUpperCase(), textX, textY + 60, 580, 84, theme.highlightColor, true, boxedHighlight, '#000000');
      textY += 140;
      drawFittedText(punchySubtext.toUpperCase(), textX, textY + 60, 580, 76, '#ffffff', true, boxedHighlight, theme.primaryAccent);

      const footerY = H - 90;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(textX, footerY, 350, 48, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = theme.highlightColor;
      ctx.font = '900 16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`▶  ${brandKit.channelName.toUpperCase()} • ${subcategory}`, textX + 18, footerY + 30);
    }
  }

  // 2. CENTERED SHOCK & DUAL BANNERS
  else if (layout === 'centered-shock') {
    ctx.fillStyle = theme.badgeBg;
    ctx.fillRect(0, 0, W, 90);
    ctx.fillStyle = theme.badgeText;
    ctx.font = `900 52px ${selectedFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(`⚡ ${punchyHeadline.toUpperCase()} ⚡`, W / 2, 64);

    drawSubjectFrame(W / 2 - 250, 110, 500, 480);

    ctx.fillStyle = theme.primaryAccent;
    ctx.fillRect(0, H - 110, W, 110);
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 56px ${selectedFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(punchySubtext.toUpperCase(), W / 2, H - 36);
  }

  // 3. BEFORE VS AFTER SPLIT
  else if (layout === 'before-after-split') {
    const halfW = W / 2;

    // Left "Before" zone
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.fillRect(0, 0, halfW, H);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(40, 40, 200, 50, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('❌ BEFORE', 140, 74);

    drawFittedText('WRONG WAY', 40, H - 60, halfW - 80, 56, '#f87171', true, true, 'rgba(0,0,0,0.85)');

    // Right "After" zone
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.fillRect(halfW, 0, halfW, H);

    // Subject/Product result showcase in the After side
    drawSubjectFrame(halfW + 40, 110, halfW - 80, H - 220);

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(halfW + 40, 40, 200, 50, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✅ AFTER', halfW + 140, 74);

    drawFittedText(punchyHeadline.toUpperCase(), halfW + 40, H - 60, halfW - 80, 56, '#34d399', true, true, 'rgba(0,0,0,0.85)');

    // Center Divider & VS Badge
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(halfW, 0);
    ctx.lineTo(halfW, H);
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(halfW, H / 2, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#000000';
    ctx.font = '900 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VS', halfW, H / 2 + 16);
  }

  // 4. CINEMATIC DARK LUXURY
  else if (layout === 'cinematic-dark-luxury') {
    const pos = imageAdjustments.subjectPosition || 'right';
    const isLeft = pos === 'left';
    const isCenter = pos === 'center';
    const subjX = isCenter ? (W - 480) / 2 : isLeft ? 50 : 740;
    const textX = isCenter ? 60 : isLeft ? 570 : 60;
    const leftW = isCenter ? W - 120 : 660;

    drawSubjectFrame(subjX, 70, 480, 580);

    ctx.fillStyle = theme.highlightColor;
    ctx.font = '900 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`◆  AN IN-DEPTH DOCUMENTARY  ◆`, textX, 70);

    drawFittedText(punchyHeadline.toUpperCase(), textX, 190, leftW, 90, theme.highlightColor, true, false);
    drawFittedText(punchySubtext.toUpperCase(), textX, 310, leftW, 70, '#ffffff', true, false);

    ctx.fillStyle = theme.cardBg;
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(textX, 420, 380, 80, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = theme.highlightColor;
    ctx.font = '900 36px sans-serif';
    ctx.fillText('99.4%', textX + 30, 474);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 16px sans-serif';
    ctx.fillText('VERIFIED CASE STUDY', textX + 150, 455);
    ctx.fillStyle = theme.textMuted;
    ctx.font = '600 13px sans-serif';
    ctx.fillText('Tested in 2026', textX + 150, 480);
  }

  // 5. TECH & AI CYBER MATRIX
  else if (layout === 'tech-cyber-neon') {
    const pos = imageAdjustments.subjectPosition || 'right';
    const isLeft = pos === 'left';
    const isCenter = pos === 'center';
    const subjX = isCenter ? (W - 490) / 2 : isLeft ? 50 : 740;
    const textX = isCenter ? 60 : isLeft ? 580 : 60;
    const leftW = isCenter ? W - 120 : 660;

    ctx.strokeStyle = theme.highlightColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(30, 80);
    ctx.lineTo(30, 30);
    ctx.lineTo(80, 30);
    ctx.moveTo(W - 80, 30);
    ctx.lineTo(W - 30, 30);
    ctx.lineTo(W - 30, 80);
    ctx.moveTo(30, H - 80);
    ctx.lineTo(30, H - 30);
    ctx.lineTo(80, H - 30);
    ctx.moveTo(W - 80, H - 30);
    ctx.lineTo(W - 30, H - 30);
    ctx.lineTo(W - 30, H - 80);
    ctx.stroke();

    drawSubjectFrame(subjX, 80, 490, 560);

    let curY = 120;
    ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
    ctx.strokeStyle = theme.highlightColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(textX, curY - 50, 300, 40, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = theme.highlightColor;
    ctx.font = '900 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`//  ${supportingBadge.toUpperCase()}  //`, textX + 150, curY - 24);

    drawFittedText(punchyHeadline.toUpperCase(), textX, curY + 60, leftW, 86, theme.highlightColor, true, true, 'rgba(0,0,0,0.85)');
    curY += 150;
    drawFittedText(punchySubtext.toUpperCase(), textX, curY + 60, leftW, 76, '#ffffff', true, true, theme.primaryAccent);

    const pillY = curY + 140;
    bulletsList.slice(0, 2).forEach((b, idx) => {
      const bX = textX + idx * 290;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bX, pillY, 270, 44, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = theme.highlightColor;
      ctx.font = '900 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`▶  ${b}`, bX + 16, pillY + 28);
    });
  }

  // 6. GAMING HIGH ENERGY
  else if (layout === 'gaming-high-energy') {
    const pos = imageAdjustments.subjectPosition || 'right';
    const isLeft = pos === 'left';
    const isCenter = pos === 'center';
    const subjX = isCenter ? (W - 600) / 2 : isLeft ? 50 : 620;
    const textX = isCenter ? 60 : isLeft ? 680 : 60;
    const textW = isCenter ? W - 120 : 540;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(W * 0.45, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, H);
    ctx.lineTo(W * 0.35, H);
    ctx.closePath();
    ctx.fillStyle = theme.cardBg;
    ctx.fill();
    ctx.strokeStyle = theme.highlightColor;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();

    drawSubjectFrame(subjX, 50, 600, 620);

    drawFittedText(punchyHeadline.toUpperCase(), textX, 180, textW, 94, theme.highlightColor, true, true, '#000000');
    drawFittedText(punchySubtext.toUpperCase(), textX, 310, textW, 84, '#ffffff', true, true, theme.primaryAccent);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(textX, 420, 280, 54, 16);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🔥 ${supportingBadge.toUpperCase()}`, textX + 140, 456);
  }

  // 7. EDUCATIONAL CHECKLIST
  else if (layout === 'educational-checklist') {
    const pos = imageAdjustments.subjectPosition || 'left';
    const isRight = pos === 'right';
    const isCenter = pos === 'center';
    const subjX = isCenter ? (W - 480) / 2 : isRight ? 740 : 60;
    const listX = isCenter ? 60 : isRight ? 60 : 580;

    drawSubjectFrame(subjX, 80, 480, 560);

    let listY = 90;
    if (supportingBadge.trim()) {
      ctx.fillStyle = theme.badgeBg;
      ctx.beginPath();
      ctx.roundRect(listX, listY, 260, 44, 12);
      ctx.fill();
      ctx.fillStyle = theme.badgeText;
      ctx.font = '900 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`★ ${supportingBadge.toUpperCase()}`, listX + 130, listY + 28);
      listY += 60;
    }

    drawFittedText(punchyHeadline.toUpperCase(), listX, listY + 70, 640, 78, theme.highlightColor, true, true, 'rgba(0,0,0,0.85)');
    listY += 130;

    bulletsList.slice(0, 3).forEach((item, idx) => {
      const itemY = listY + idx * 95;
      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(listX, itemY, 640, 80, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = theme.highlightColor;
      ctx.beginPath();
      ctx.arc(listX + 45, itemY + 40, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = '900 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${idx + 1}`, listX + 45, itemY + 48);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 26px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item, listX + 88, itemY + 50);
    });
  }

  // 8. BREAKING NEWS URGENT
  else if (layout === 'breaking-news-urgent') {
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, W, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚨 BREAKING NEWS ALERT 🚨', W / 2, 56);

    drawSubjectFrame(W / 2 - 250, 100, 500, 470);

    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, H - 130, W, 130);
    ctx.fillStyle = '#000000';
    ctx.font = `900 58px ${selectedFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(punchyHeadline.toUpperCase(), W / 2, H - 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px sans-serif';
    ctx.fillText(punchySubtext.toUpperCase(), W / 2, H - 24);
  }

  // 9. STAT SHOCK MINIMAL
  else if (layout === 'stat-shock-minimal') {
    const pos = imageAdjustments.subjectPosition || 'right';
    const isLeft = pos === 'left';
    const isCenter = pos === 'center';
    const subjX = isCenter ? (W - 480) / 2 : isLeft ? 50 : 740;
    const textX = isCenter ? 60 : isLeft ? 570 : 60;
    const leftW = isCenter ? W - 120 : 660;

    drawSubjectFrame(subjX, 80, 480, 560);

    ctx.fillStyle = theme.highlightColor;
    ctx.font = '900 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`★  REAL PROVEN CASE STUDY  ★`, textX, 90);

    drawFittedText(punchyHeadline.toUpperCase(), textX, 230, leftW, 110, theme.highlightColor, true, true, '#000000');
    drawFittedText(punchySubtext.toUpperCase(), textX, 360, leftW, 76, '#ffffff', true, true, theme.primaryAccent);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(textX, 480, 520, 80, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = theme.highlightColor;
    ctx.font = '900 32px sans-serif';
    ctx.fillText('100% NO CODE', textX + 30, 532);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 16px sans-serif';
    ctx.fillText('BEGINNER BLUEPRINT', textX + 270, 530);
  }

  // 10. DEVICE APP MOCKUP
  else if (layout === 'device-app-mockup') {
    const pos = imageAdjustments.subjectPosition || 'left';
    const isRight = pos === 'right';
    const isCenter = pos === 'center';
    const subjX = isCenter ? (W - 500) / 2 : isRight ? 720 : 60;
    const textX = isCenter ? 60 : isRight ? 60 : 600;
    const textW = isCenter ? W - 120 : 620;

    drawSubjectFrame(subjX, 80, 500, 560);

    let dY = 140;
    if (supportingBadge.trim()) {
      ctx.fillStyle = theme.badgeBg;
      ctx.beginPath();
      ctx.roundRect(textX, dY - 60, 240, 44, 12);
      ctx.fill();
      ctx.fillStyle = theme.badgeText;
      ctx.font = '900 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`★ ${supportingBadge.toUpperCase()}`, textX + 120, dY - 32);
    }

    drawFittedText(punchyHeadline.toUpperCase(), textX, dY + 60, textW, 84, theme.highlightColor, true, true, 'rgba(0,0,0,0.85)');
    dY += 140;
    drawFittedText(punchySubtext.toUpperCase(), textX, dY + 60, textW, 74, '#ffffff', true, true, theme.primaryAccent);
  }

  // 11. REACTION FACE BURST
  else if (layout === 'reaction-face-burst') {
    const pos = imageAdjustments.subjectPosition || 'right';
    const isLeft = pos === 'left';
    const isCenter = pos === 'center';
    const subjX = isCenter ? (W - 500) / 2 : isLeft ? 50 : 720;
    const textX = isCenter ? 60 : isLeft ? 600 : 60;
    const textW = isCenter ? W - 120 : 620;

    drawSubjectFrame(subjX, 60, 500, 600);

    drawFittedText(punchyHeadline.toUpperCase(), textX, 180, textW, 94, theme.highlightColor, true, true, '#000000');
    drawFittedText(punchySubtext.toUpperCase(), textX, 310, textW, 80, '#ffffff', true, true, theme.primaryAccent);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(textX, 430, 300, 60, 20);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`😱 ${supportingBadge.toUpperCase()}`, textX + 150, 470);
  }

  // 12. PODCAST INTERVIEW DUO
  else if (layout === 'podcast-interview-duo') {
    drawSubjectFrame(80, 140, 380, 480);
    drawSubjectFrame(820, 140, 380, 480);

    ctx.fillStyle = theme.badgeBg;
    ctx.fillRect(0, 0, W, 75);
    ctx.fillStyle = theme.badgeText;
    ctx.font = '900 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🎙️ ${brandKit.channelName.toUpperCase()} PODCAST • EPISODE #42`, W / 2, 50);

    // Audio Waveform Equalizer graphic in center
    const waveCenterX = W / 2;
    const waveCenterY = H / 2 - 20;
    const barHeights = [18, 42, 70, 95, 120, 80, 110, 60, 90, 40, 15];
    ctx.fillStyle = theme.highlightColor;
    barHeights.forEach((bh, i) => {
      const bx = waveCenterX - 110 + i * 22;
      ctx.beginPath();
      ctx.roundRect(bx, waveCenterY - bh / 2, 14, bh, 7);
      ctx.fill();
    });

    drawFittedText(punchyHeadline.toUpperCase(), W / 2, H - 70, 700, 72, theme.highlightColor, true, true, '#000000', 'center');
  }

  // 13. VERSUS RIVALRY & BATTLE (Red Corner vs Blue Corner)
  else if (layout === 'versus-rivalry-battle') {
    const halfW = W / 2;

    // Left Blue Corner
    const blueGrad = ctx.createLinearGradient(0, 0, halfW, H);
    blueGrad.addColorStop(0, 'rgba(14, 165, 233, 0.35)');
    blueGrad.addColorStop(1, 'rgba(2, 132, 199, 0.05)');
    ctx.fillStyle = blueGrad;
    ctx.fillRect(0, 0, halfW, H);

    // Right Red Corner
    const redGrad = ctx.createLinearGradient(halfW, 0, W, H);
    redGrad.addColorStop(0, 'rgba(239, 68, 68, 0.05)');
    redGrad.addColorStop(1, 'rgba(220, 38, 38, 0.35)');
    ctx.fillStyle = redGrad;
    ctx.fillRect(halfW, 0, halfW, H);

    // Left Fighter/Product Frame
    drawSubjectFrame(50, 90, 480, 480);
    // Right Fighter/Product Frame
    drawSubjectFrame(W - 530, 90, 480, 480);

    // Lightning diagonal center seam
    ctx.save();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(halfW + 30, 0);
    ctx.lineTo(halfW - 20, H * 0.4);
    ctx.lineTo(halfW + 25, H * 0.6);
    ctx.lineTo(halfW - 30, H);
    ctx.stroke();
    ctx.restore();

    // Center VS Battle Emblem
    ctx.save();
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 8;
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(halfW, H / 2, 68, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 54px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VS', halfW, H / 2 + 18);
    ctx.restore();

    // Top Title Bar
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(W / 2 - 320, 20, 640, 52, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.font = '900 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⚡ ${punchyHeadline.toUpperCase()} ⚡`, W / 2, 54);

    // Bottom Subtext Banner
    drawFittedText(punchySubtext.toUpperCase(), W / 2, H - 40, 800, 62, '#ffffff', true, true, '#000000', 'center');
  }

  // 14. THE SECRET REVEALED & RED ARROW (High Curiosity Hook)
  else if (layout === 'secret-revealed-blur') {
    const pos = imageAdjustments.subjectPosition || 'right';
    const isLeft = pos === 'left';
    const isCenter = pos === 'center';
    const subjX = isCenter ? (W - 520) / 2 : isLeft ? 50 : 700;
    const leftX = isCenter ? 60 : isLeft ? 590 : 60;
    const textW = isCenter ? W - 120 : 620;

    drawSubjectFrame(subjX, 70, 520, 580);

    let sY = 110;

    // Top High-Voltage Warning Pill
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.roundRect(leftX, sY, 320, 48, 24);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = '900 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ THE SECRET REVEALED', leftX + 160, sY + 31);
    sY += 80;

    // Massive 2-Line Shock Hook Text
    drawFittedText(punchyHeadline.toUpperCase(), leftX, sY + 60, textW, 86, '#ffffff', true, true, '#dc2626');
    sY += 140;
    drawFittedText(punchySubtext.toUpperCase(), leftX, sY + 60, textW, 76, theme.highlightColor, true, true, '#000000');

    // Canvas-Rendered Dramatic Red Curved Callout Arrow pointing at subject
    if (!isCenter) {
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = '#ef4444';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;

      if (isLeft) {
        // Arrow pointing from right to left subject
        ctx.beginPath();
        ctx.moveTo(leftX + 220, sY + 120);
        ctx.quadraticCurveTo(leftX + 100, sY + 150, 540, 360);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(520, 360);
        ctx.lineTo(570, 320);
        ctx.lineTo(555, 380);
        ctx.closePath();
        ctx.fill();
      } else {
        // Curved tail pointing from left to right subject
        ctx.beginPath();
        ctx.moveTo(leftX + 220, sY + 120);
        ctx.quadraticCurveTo(leftX + 450, sY + 150, 720, 360);
        ctx.stroke();

        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(740, 360);
        ctx.lineTo(690, 320);
        ctx.lineTo(705, 380);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Bottom Badge
    const stampY = H - 90;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(leftX, stampY, 360, 48, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.font = '900 17px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🔒  ${supportingBadge.toUpperCase() || 'DON’T MISS THIS'}`, leftX + 20, stampY + 31);
  }

  // 15. TOP LISTICLE RANKING & CROWN TROPHY (Listicles, Top 10, Tier Lists)
  else if (layout === 'top-listicle-ranking') {
    const pos = imageAdjustments.subjectPosition || 'right';
    const isLeft = pos === 'left';
    const isCenter = pos === 'center';
    const subjX = isCenter ? (W - 500) / 2 : isLeft ? 50 : 720;
    const leftX = isCenter ? 60 : isLeft ? 600 : 60;
    const textW = isCenter ? W - 120 : 640;

    drawSubjectFrame(subjX, 70, 500, 580);

    let rY = 90;

    // Gold Crown Trophy Pill
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.roundRect(leftX, rY, 300, 46, 23);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = '900 19px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👑 #1 RANKED CHOICE', leftX + 150, rY + 30);
    rY += 80;

    // Giant Rank Badge & Number
    ctx.save();
    const rankGrad = ctx.createLinearGradient(leftX, rY, leftX + 200, rY + 140);
    rankGrad.addColorStop(0, '#facc15');
    rankGrad.addColorStop(1, '#f97316');
    ctx.fillStyle = rankGrad;
    ctx.font = '900 120px Impact, sans-serif';
    ctx.textAlign = 'left';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 16;
    ctx.fillText('TOP 10', leftX, rY + 100);
    ctx.restore();

    rY += 130;

    // Headline & Subtext
    drawFittedText(punchyHeadline.toUpperCase(), leftX, rY + 60, textW, 78, '#ffffff', true, true, '#000000');
    rY += 120;
    drawFittedText(punchySubtext.toUpperCase(), leftX, rY + 60, textW, 68, theme.highlightColor, true, true, theme.primaryAccent);

    // Footer Verified Stamp
    const footY = H - 85;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeStyle = 'rgba(250,204,21,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(leftX, footY, 380, 44, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.font = '900 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`★  2026 DEFINITIVE RANKING LIST`, leftX + 20, footY + 28);
  }

  // 16. VIRAL 10X ARROW & SURPRISED CREATOR (Inspired by Top Fiverr/Legiit CTR Boosters)
  else if (layout === 'viral-10x-arrow') {
    const pos = imageAdjustments.subjectPosition || 'left';
    const isRight = pos === 'right';
    const isCenter = pos === 'center';
    const subjX = isCenter ? (W - 540) / 2 : isRight ? 700 : 30;
    const textX = isCenter ? 60 : isRight ? 50 : 540;
    const textW = isCenter ? W - 120 : 690;

    // Draw Subject Frame
    drawSubjectFrame(subjX, 40, 540, 640);

    // Dynamic Slanted Headline Group
    ctx.save();
    const tiltAngle = (viralConfig?.textAngle ?? -4) * (Math.PI / 180);
    ctx.translate(textX + textW / 2, 230);
    ctx.rotate(tiltAngle);

    // Boxed Warning Tag
    ctx.fillStyle = '#ff1a1a';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-textW / 2, -150, 310, 50, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 ' + (supportingBadge.toUpperCase() || 'GET MORE CLICKS'), -textW / 2 + 155, -118);

    // Line 1: Primary Headline (e.g. "BOOST CTR FAST") in High-Contrast White with Thick Black Stroke
    drawFittedText(
      punchyHeadline.toUpperCase(),
      -textW / 2,
      -30,
      textW,
      94,
      '#ffffff',
      true,
      true,
      '#000000'
    );

    // Line 2: Subtext in High-Voltage Yellow
    drawFittedText(
      punchySubtext.toUpperCase(),
      -textW / 2,
      70,
      textW,
      82,
      theme.highlightColor || '#facc15',
      true,
      true,
      '#000000'
    );

    ctx.restore();

    // Giant 3D Green Trending Upward Growth Arrow
    const arrowX = isRight ? 530 : 520;
    const arrowY = 480;
    draw3DGreenGrowthArrow(ctx, arrowX, arrowY, 150, 190, isRight ? -18 : 22);

    // "10X MORE VIEWS!" / CTR Pill Badge with Neon Green Glow
    const badgeX = isRight ? 80 : 660;
    const badgeY = 470;
    const badgeText = viralConfig?.ctrBadgeText || '10X MORE VIEWS!';

    ctx.save();
    ctx.translate(badgeX, badgeY);
    ctx.rotate(-4 * (Math.PI / 180));

    // Glow
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 30;

    // Green Badge Body
    ctx.fillStyle = '#15803d';
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(0, 0, 390, 80, 16);
    ctx.fill();
    ctx.stroke();

    // Specular inner box
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.roundRect(8, 8, 374, 64, 10);
    ctx.fill();

    // Badge text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10;
    ctx.fillText(badgeText.toUpperCase(), 195, 52);

    // Sub-metric pill tag (e.g. "+9.5% CTR")
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.roundRect(260, -18, 120, 32, 8);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = '900 14px sans-serif';
    ctx.fillText('⚡ +13.6% CTR', 320, 4);

    ctx.restore();
  }

  // 17. BOLD 3D TITLE PLATE & RED YOUTUBE BUTTON (Legiit & Fiverr High Seller Aesthetic)
  else if (layout === 'bold-3d-title-plate') {
    const pos = imageAdjustments.subjectPosition || 'right';
    const isLeft = pos === 'left';
    const isCenter = pos === 'center';
    const subjX = isCenter ? (W - 540) / 2 : isLeft ? 30 : 680;
    const textX = isCenter ? 60 : isLeft ? 570 : 60;
    const textW = isCenter ? W - 120 : 630;

    // Draw Subject
    drawSubjectFrame(subjX, 50, 560, 620);

    let tY = 110;

    // Line 1: Blue/Yellow Boxed Ribbon Hook
    ctx.save();
    const ribbonGrad = ctx.createLinearGradient(textX, tY, textX + 380, tY + 60);
    ribbonGrad.addColorStop(0, '#2563eb');
    ribbonGrad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = ribbonGrad;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(textX, tY, 360, 56, 12);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(supportingBadge.toUpperCase() || '★ VIRAL YOUTUBE', textX + 180, tY + 37);
    ctx.restore();

    tY += 85;

    // Line 2: 3D White Title Text with Heavy Black Outline
    drawFittedText(
      punchyHeadline.toUpperCase(),
      textX,
      tY + 60,
      textW,
      92,
      '#ffffff',
      true,
      true,
      '#000000'
    );

    tY += 135;

    // Line 3: Radiant Red 3D Extrusion Sub-box (e.g. "TITLE HERE")
    ctx.save();
    const redBoxGrad = ctx.createLinearGradient(textX, tY, textX + textW, tY + 110);
    redBoxGrad.addColorStop(0, '#dc2626');
    redBoxGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = redBoxGrad;
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.roundRect(textX, tY, Math.min(textW, 520), 105, 14);
    ctx.fill();

    // Stroke
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Text inside red box
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 68px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 12;
    ctx.fillText(punchySubtext.toUpperCase() || 'IN 3 HOURS', textX + Math.min(textW, 520) / 2, tY + 76);
    ctx.restore();

    // 3D Glossy YouTube Play Button
    const btnX = isLeft ? textX + 440 : textX + 540;
    const btnY = tY + 50;
    drawGlossyYouTubeButton(ctx, btnX, btnY, 95, 68, 12);
  }

  // 18. MONEY & WEALTH BLUEPRINT ($50,000/MO REVEAL)
  else if (layout === 'money-wealth-blueprint') {
    const pos = imageAdjustments.subjectPosition || 'right';
    const isLeft = pos === 'left';
    const isCenter = pos === 'center';
    const subjX = isCenter ? (W - 520) / 2 : isLeft ? 40 : 700;
    const leftX = isCenter ? 60 : isLeft ? 580 : 60;
    const textW = isCenter ? W - 120 : 640;

    // Subject
    drawSubjectFrame(subjX, 60, 520, 600);

    let mY = 100;

    // Top Urgency Yellow Ribbon
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.roundRect(leftX, mY, 340, 48, 10);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = '900 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💰 ' + (supportingBadge.toUpperCase() || 'PROVEN BLUEPRINT'), leftX + 170, mY + 31);

    mY += 80;

    // Massive Cash Number in High-Voltage Gold (e.g. "$50,000")
    ctx.save();
    const goldGrad = ctx.createLinearGradient(leftX, mY, leftX + 400, mY + 120);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.4, '#facc15');
    goldGrad.addColorStop(1, '#eab308');
    ctx.fillStyle = goldGrad;
    ctx.font = '900 108px Impact, sans-serif';
    ctx.textAlign = 'left';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 18;
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(punchyHeadline.toUpperCase() || '$50,000', leftX, mY + 90);
    ctx.fillText(punchyHeadline.toUpperCase() || '$50,000', leftX, mY + 90);
    ctx.restore();

    mY += 135;

    // Subtext Banner ("PER MONTH" / "IN PASSIVE INCOME")
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 68px Impact, sans-serif';
    ctx.textAlign = 'left';
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(punchySubtext.toUpperCase() || 'PER MONTH', leftX, mY + 60);
    ctx.fillText(punchySubtext.toUpperCase() || 'PER MONTH', leftX, mY + 60);
    ctx.restore();

    // Floating Cash Stacks Graphic
    drawMoneyStackGraphic(ctx, leftX + 460, mY + 30);

    // Green Trend Indicator Badge
    const footY = H - 85;
    ctx.fillStyle = '#16a34a';
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(leftX, footY, 320, 46, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📈 VERIFIED CASE STUDY RESULTS', leftX + 160, footY + 29);
  }

  // 19. DOODLE CHALK ARROW & CURIOSITY LOOP ("The Most Attractive Thumbnail")
  else if (layout === 'doodle-chalk-arrow') {
    const pos = imageAdjustments.subjectPosition || 'right';
    const isLeft = pos === 'left';
    const isCenter = pos === 'center';
    const subjX = isCenter ? (W - 500) / 2 : isLeft ? 50 : 700;
    const cardX = isCenter ? 60 : isLeft ? 580 : 60;
    const cardW = isCenter ? W - 120 : 600;

    // Subject
    drawSubjectFrame(subjX, 60, 520, 600);

    // White Rounded Card Plate Container
    const cardY = 160;
    const cardH = 340;

    ctx.save();
    // Card Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;

    // Pure White Card Plate
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 24);
    ctx.fill();

    // Black Border
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Mini Top Black Pill Tag ("THE MOST")
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(cardX + 40, cardY - 22, 220, 44, 10);
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.font = '900 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(supportingBadge.toUpperCase() || '🔥 THE MOST', cardX + 150, cardY + 6);

    // Headline inside white box (e.g. "ATTRACTIVE")
    ctx.fillStyle = '#000000';
    ctx.font = '900 76px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(punchyHeadline.toUpperCase() || 'ATTRACTIVE', cardX + cardW / 2, cardY + 115);

    // Black Sub-box for subtext (e.g. "THUMBNAIL")
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(cardX + 30, cardY + 160, cardW - 60, 110, 16);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 64px Impact, sans-serif';
    ctx.fillText(punchySubtext.toUpperCase() || 'THUMBNAIL', cardX + cardW / 2, cardY + 238);

    ctx.restore();

    // Hand-drawn Chalk White Loop & Curved Arrow Pointing to Face
    const faceTargetX = isLeft ? subjX + 320 : subjX + 180;
    const faceTargetY = 320;
    const arrowStartX = isLeft ? cardX + 50 : cardX + cardW - 40;
    const arrowStartY = cardY + 80;
    const loopX = cardX + 150;
    const loopY = cardY - 5;

    drawDoodleWhiteArrowAndLoop(ctx, loopX, loopY, arrowStartX, arrowStartY, faceTargetX, faceTargetY);
  }

  // 20. THUMBNAIL INCEPTION & SHOWCASE GRID ("How to Make Thumbnails Like This")
  else if (layout === 'thumbnail-inception-grid') {
    const pos = imageAdjustments.subjectPosition || 'center';
    const isLeft = pos === 'left';
    const isRight = pos === 'right';
    const subjX = isLeft ? 50 : isRight ? 720 : 380;

    // Draw Subject in center/side
    drawSubjectFrame(subjX, 70, 520, 580);

    // Floating Thumbnail Cards (Showcase Multi-Packs)
    drawFloatingThumbnailCard(ctx, 160, 180, 260, 150, -12, '10X VIEWS', 'HOT', '#ef4444', '#991b1b');
    drawFloatingThumbnailCard(ctx, 170, 460, 270, 155, 10, 'VIRAL 2026', 'NEW', '#2563eb', '#1e40af');
    drawFloatingThumbnailCard(ctx, 1100, 200, 260, 150, 14, '50K/MO', 'TOP', '#16a34a', '#14532d');
    drawFloatingThumbnailCard(ctx, 1090, 480, 270, 155, -8, 'CTR BOOST', 'PRO', '#9333ea', '#581c87');

    // Bottom Center Bold Banner
    const bannerW = 760;
    const bannerX = (W - bannerW) / 2;
    const bannerY = H - 150;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(bannerX, bannerY, bannerW, 110, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 40px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(punchyHeadline.toUpperCase() || 'HOW TO MAKE THUMBNAILS', W / 2, bannerY + 46);

    ctx.fillStyle = '#facc15';
    ctx.font = '900 44px Impact, sans-serif';
    ctx.fillText(punchySubtext.toUpperCase() || 'LIKE THIS!', W / 2, bannerY + 94);
    ctx.restore();
  }

  // 21. LASER EYES SURGE & ENERGY BLAST
  else if (layout === 'laser-eyes-shock') {
    const pos = imageAdjustments.subjectPosition || 'center';
    const isLeft = pos === 'left';
    const isRight = pos === 'right';
    const isCenter = pos === 'center';
    const subjX = isCenter ? (W - 540) / 2 : isLeft ? 50 : 680;
    const textX = isCenter ? 60 : isLeft ? 600 : 60;
    const textW = isCenter ? W - 120 : 620;

    // Draw Subject Frame
    drawSubjectFrame(subjX, 60, 540, 600);

    // Laser Eyes
    const eye1X = subjX + 230;
    const eye1Y = 240;
    const eye2X = subjX + 310;
    const eye2Y = 240;
    drawLaserEyes(ctx, eye1X, eye1Y, eye2X, eye2Y, theme.highlightColor || '#22c55e');

    let lY = 90;

    // Top Neon Pill Tag
    ctx.save();
    ctx.fillStyle = theme.highlightColor || '#22c55e';
    ctx.shadowColor = theme.highlightColor || '#22c55e';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(textX, lY, 340, 48, 12);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = '900 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ ' + (supportingBadge.toUpperCase() || 'INSANE ENERGY'), textX + 170, lY + 31);
    ctx.restore();

    lY += 85;

    // Headline with Neon Stroke
    drawFittedText(
      punchyHeadline.toUpperCase(),
      textX,
      lY + 60,
      textW,
      86,
      '#ffffff',
      true,
      true,
      '#000000'
    );

    lY += 135;

    // Subtext
    drawFittedText(
      punchySubtext.toUpperCase(),
      textX,
      lY + 60,
      textW,
      76,
      theme.highlightColor || '#22c55e',
      true,
      true,
      '#000000'
    );

    // Bottom "10X MORE VIEWS" Neon Box
    const footY = H - 90;
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = theme.highlightColor || '#22c55e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(textX, footY, 360, 52, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = theme.highlightColor || '#22c55e';
    ctx.font = '900 24px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💥 10X MORE VIEWS GUARANTEED', textX + 180, footY + 36);
    ctx.restore();
  }

  // 22. TECH & AI ROADMAP 3D (DATA ANALYTICS WITH AI + WORKSTATION + STARBURST + 3D LOGO PILLS)
  else if (layout === 'ai-roadmap-masterclass') {
    const pos = imageAdjustments.subjectPosition || 'right';
    const isLeft = pos === 'left';
    const isCenter = pos === 'center';
    const subjX = isCenter ? (W - 530) / 2 : isLeft ? 40 : 690;
    const subjY = 65;
    const subjW = 540;
    const subjH = 590;

    const leftX = isCenter ? 60 : isLeft ? 590 : 65;
    const maxTextW = isCenter ? W - 120 : 620;

    // Render developer workstation studio if no custom full-canvas background image
    if (!loadedImage || imageAdjustments.mode !== 'background') {
      drawDeveloperWorkstationBackdrop(ctx, W, H, theme);
    }

    // 1. Dual-Tone Volumetric Rim Light for Subject (Electric Cyan + Magenta)
    drawDualToneRimLight(ctx, subjX, subjY, subjW, subjH);

    // 2. Draw Subject Frame (uploaded photo cutout or stylized enthusiastic creator)
    drawSubjectFrame(subjX, subjY, subjW, subjH);

    // 3. Top Explosive 3D Starburst Badge (Directly Editable via starburstBadgeText or supportingBadge)
    const showStarburst = viralConfig?.showStarburstBadge !== false;
    if (showStarburst) {
      const starburstLabel = viralConfig?.starburstBadgeText?.trim() || supportingBadge.trim() || 'COMPLETE ROADMAP';
      const sbRadius = viralConfig?.starburstSize || 88;
      const sbAngle = viralConfig?.starburstAngle !== undefined
        ? viralConfig.starburstAngle
        : (viralConfig?.textAngle ? viralConfig.textAngle - 5 : -10);
      const sbColor = viralConfig?.starburstColor || 'gold';
      const sbSpikes = viralConfig?.starburstSpikes || 18;

      let sbX = isLeft ? leftX + 105 : leftX + 90;
      let sbY = 95;

      if (viralConfig?.starburstPositionPreset === 'top-center') {
        sbX = W / 2;
        sbY = 95;
      } else if (viralConfig?.starburstPositionPreset === 'top-right') {
        sbX = W - 140;
        sbY = 95;
      } else if (viralConfig?.starburstPositionPreset === 'above-headline') {
        sbX = leftX + 110;
        sbY = 120;
      }

      if (viralConfig?.starburstPosX !== undefined) sbX += viralConfig.starburstPosX;
      if (viralConfig?.starburstPosY !== undefined) sbY += viralConfig.starburstPosY;

      drawExplosiveStarburstBadge(
        ctx,
        sbX,
        sbY,
        sbRadius,
        sbRadius * 0.74,
        sbSpikes,
        starburstLabel,
        sbAngle,
        sbColor
      );
    }

    // 4. Line 1: Ultra-Heavy 3D White Title ("DATA ANALYTICS")
    const angleDeg = viralConfig?.textAngle ?? -4;
    const depth3d = viralConfig?.text3dDepth ?? 10;
    const headlineY = 240;

    draw3DExtrudedText(
      ctx,
      punchyHeadline.toUpperCase() || 'DATA ANALYTICS',
      leftX,
      headlineY,
      maxTextW,
      86,
      selectedFont,
      selectedWeight,
      { colors: ['#ffffff', '#f1f5f9', '#cbd5e1'] },
      '#000000',
      16,
      depth3d,
      '#080c1e',
      angleDeg,
      'left'
    );

    // 5. Line 2: Massive 3D Gradient Hook ("WITH AI")
    const subtextY = headlineY + 115;
    draw3DExtrudedText(
      ctx,
      punchySubtext.toUpperCase() || 'WITH AI',
      leftX,
      subtextY,
      maxTextW,
      102,
      selectedFont,
      selectedWeight,
      { colors: ['#ffea79', '#f59e0b', '#ea580c'] },
      '#000000',
      18,
      depth3d + 4,
      '#3f1d02',
      angleDeg,
      'left'
    );

    // 6. Floating 3D Tech Logo Capsules (Python, ChatGPT, SQL, PowerBI, Excel)
    const pillsY = subtextY + 45;
    const pillSpacing = 116;
    const pills = [
      { type: 'python', label: 'Python' },
      { type: 'chatgpt', label: 'ChatGPT' },
      { type: 'sql', label: 'SQL / DB' },
      { type: 'powerbi', label: 'Power BI' },
      { type: 'excel', label: 'Excel' },
    ];

    pills.forEach((p, idx) => {
      const px = leftX + idx * pillSpacing;
      if (px + 110 <= leftX + maxTextW + 30) {
        draw3DTechLogoPill(ctx, px, pillsY, p.type, p.label);
      }
    });

    // 7. Dynamic 3D Neon Data Wave across the bottom
    drawDynamicDataWave(ctx, leftX, H - 145, leftX + maxTextW, H - 245, '#00f0ff', '#f59e0b');

    // 8. Footer Channel / Roadmap Pill
    const footY = H - 85;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 240, 255, 0.35)';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.roundRect(leftX, footY, 390, 46, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#00f0ff';
    ctx.font = '900 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🚀  ${brandKit.channelName.toUpperCase()} • FULL COURSE 2026 • 100% FREE`, leftX + 18, footY + 28);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // GLOBAL TOGGLEABLE VIRAL GRAPHIC STICKERS (Available on ANY layout)
  // ---------------------------------------------------------------------------
  if (viralConfig) {
    if (viralConfig.showGrowthArrow && layout !== 'viral-10x-arrow') {
      draw3DGreenGrowthArrow(ctx, W - 220, H - 240, 140, 180, 20);
    }
    if (viralConfig.showPlayButtonBadge && layout !== 'bold-3d-title-plate') {
      drawGlossyYouTubeButton(ctx, 90, 80, 84, 58, -8);
    }
    if (viralConfig.showLaserEyes && layout !== 'laser-eyes-shock') {
      const subjX = imageAdjustments.subjectPosition === 'left' ? 240 : imageAdjustments.subjectPosition === 'center' ? W / 2 : W - 280;
      drawLaserEyes(ctx, subjX - 40, 220, subjX + 40, 220, '#22c55e');
    }
    if (viralConfig.showMoneyStacks && layout !== 'money-wealth-blueprint') {
      drawMoneyStackGraphic(ctx, 120, H - 140);
    }
    if (viralConfig.showDoodleArrows && layout !== 'doodle-chalk-arrow') {
      drawDoodleWhiteArrowAndLoop(ctx, 220, 180, 360, 240, W - 320, 280);
    }
    // High-CTR 3D Visual Accents:
    if (viralConfig.showStarburstBadge && layout !== 'ai-roadmap-masterclass') {
      const starburstLabel = viralConfig.starburstBadgeText?.trim() || supportingBadge.trim() || 'COMPLETE ROADMAP';
      const sbRadius = viralConfig?.starburstSize || 88;
      const sbAngle = viralConfig?.starburstAngle !== undefined
        ? viralConfig.starburstAngle
        : (viralConfig?.textAngle ? viralConfig.textAngle - 5 : -10);
      const sbColor = viralConfig?.starburstColor || 'gold';
      const sbSpikes = viralConfig?.starburstSpikes || 18;
      let sbX = 120;
      let sbY = 110;
      if (viralConfig?.starburstPositionPreset === 'top-center') {
        sbX = W / 2;
        sbY = 95;
      } else if (viralConfig?.starburstPositionPreset === 'top-right') {
        sbX = W - 140;
        sbY = 95;
      }
      if (viralConfig?.starburstPosX !== undefined) sbX += viralConfig.starburstPosX;
      if (viralConfig?.starburstPosY !== undefined) sbY += viralConfig.starburstPosY;
      drawExplosiveStarburstBadge(ctx, sbX, sbY, sbRadius, sbRadius * 0.74, sbSpikes, starburstLabel, sbAngle, sbColor);
    }
    if (viralConfig.showTechPills && layout !== 'ai-roadmap-masterclass') {
      const pY = H - 120;
      draw3DTechLogoPill(ctx, 60, pY, 'python', 'Python');
      draw3DTechLogoPill(ctx, 180, pY, 'chatgpt', 'ChatGPT');
      draw3DTechLogoPill(ctx, 300, pY, 'sql', 'SQL');
      draw3DTechLogoPill(ctx, 420, pY, 'powerbi', 'PowerBI');
      draw3DTechLogoPill(ctx, 540, pY, 'excel', 'Excel');
    }
    if (viralConfig.showDataWave && layout !== 'ai-roadmap-masterclass') {
      drawDynamicDataWave(ctx, 60, H - 180, W - 200, H - 340, '#00f0ff', '#f59e0b');
    }
    if (viralConfig.enhancedLighting && layout !== 'ai-roadmap-masterclass') {
      const subjX = imageAdjustments.subjectPosition === 'left' ? 40 : imageAdjustments.subjectPosition === 'center' ? (W - 520) / 2 : 700;
      drawDualToneRimLight(ctx, subjX, 70, 520, 580);
    }
  }

  // 4. Timestamp Pill (Simulating YouTube Player Tag)
  if (showTimestamp && timestampBadge) {
    const timeX = W - 140;
    const timeY = H - 56;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.beginPath();
    ctx.roundRect(timeX, timeY, 110, 38, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(timestampBadge, timeX + 55, timeY + 26);
  }

  ctx.restore();
}
