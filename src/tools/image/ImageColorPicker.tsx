import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Pipette,
  Copy,
  Download,
  Sparkles,
  Check,
  Trash2,
  Eye,
  Sliders,
  Layers,
  Palette,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard, downloadText } from '../../lib/utils';

interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
  name: string;
}

// Convert RGB to HEX
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert RGB to CMYK
function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - rNorm - k) / (1 - k);
  const m = (1 - gNorm - k) / (1 - k);
  const y = (1 - bNorm - k) / (1 - k);
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

// Approximate color name generator
function getColorName(hex: string, rgb: { r: number; g: number; b: number }): string {
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  if (hsl.l > 95) return 'Almost White';
  if (hsl.l < 10) return 'Almost Black';
  if (hsl.s < 12) return 'Neutral Gray';

  const h = hsl.h;
  if (h >= 345 || h < 15) return 'Crimson / Red';
  if (h >= 15 && h < 45) return 'Amber / Orange';
  if (h >= 45 && h < 70) return 'Golden Yellow';
  if (h >= 70 && h < 160) return 'Emerald / Green';
  if (h >= 160 && h < 195) return 'Teal / Cyan';
  if (h >= 195 && h < 255) return 'Sky / Royal Blue';
  if (h >= 255 && h < 290) return 'Indigo / Purple';
  if (h >= 290 && h < 345) return 'Magenta / Pink';
  return 'Custom Tone';
}

function buildColorInfo(r: number, g: number, b: number): ColorInfo {
  const hex = rgbToHex(r, g, b);
  const rgb = { r, g, b };
  const hsl = rgbToHsl(r, g, b);
  const cmyk = rgbToCmyk(r, g, b);
  const name = getColorName(hex, rgb);
  return { hex, rgb, hsl, cmyk, name };
}

export const ImageColorPicker: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [hoverColor, setHoverColor] = useState<ColorInfo | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorInfo>(buildColorInfo(99, 102, 241)); // Default indigo
  const [palette, setPalette] = useState<ColorInfo[]>([]);
  const [dominantColors, setDominantColors] = useState<ColorInfo[]>([]);
  const [loupePos, setLoupePos] = useState<{ x: number; y: number; show: boolean }>({
    x: 0,
    y: 0,
    show: false,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const handleImage = (f: File) => {
    if (!f.type.startsWith('image/')) {
      showToast('Please upload an image file.', 'error');
      return;
    }
    const url = URL.createObjectURL(f);
    setImageSrc(url);
    showToast(`Loaded ${f.name}`, 'success');
  };

  // Load image on canvas and extract dominant colors
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      // Extract Dominant Colors via sampling
      const sampleStep = Math.max(1, Math.floor((img.naturalWidth * img.naturalHeight) / 5000));
      const imgData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight).data;
      const buckets: Record<string, { r: number; g: number; b: number; count: number }> = {};

      for (let i = 0; i < imgData.length; i += 4 * sampleStep) {
        const a = imgData[i + 3];
        if (a < 128) continue; // Skip transparent

        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];

        // Quantize by rounding to nearest 24
        const qr = Math.round(r / 24) * 24;
        const qg = Math.round(g / 24) * 24;
        const qb = Math.round(b / 24) * 24;
        const key = `${qr},${qg},${qb}`;

        if (!buckets[key]) {
          buckets[key] = { r, g, b, count: 0 };
        }
        buckets[key].count++;
      }

      const sorted = Object.values(buckets)
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)
        .map((c) => buildColorInfo(c.r, c.g, c.b));

      setDominantColors(sorted);
      if (sorted.length > 0) {
        setSelectedColor(sorted[0]);
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Handle pointer move on canvas to read pixel
  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const color = buildColorInfo(pixel[0], pixel[1], pixel[2]);
      setHoverColor(color);
      setLoupePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        show: true,
      });
    }
  };

  const handleCanvasClick = () => {
    if (hoverColor) {
      setSelectedColor(hoverColor);
      // Add to palette if not already in palette
      if (!palette.some((c) => c.hex === hoverColor.hex)) {
        setPalette((prev) => [hoverColor, ...prev.slice(0, 15)]);
      }
      showToast(`Picked ${hoverColor.hex}`, 'success');
    }
  };

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      showToast(`Copied ${label}: ${text}`, 'success');
    }
  };

  const handleExportPalette = (format: 'css' | 'json' | 'txt') => {
    const list = palette.length > 0 ? palette : dominantColors;
    if (list.length === 0) {
      showToast('No colors to export.', 'info');
      return;
    }

    let output = '';
    if (format === 'css') {
      output = `:root {\n` + list.map((c, i) => `  --color-${i + 1}: ${c.hex}; /* ${c.name} */`).join('\n') + `\n}`;
    } else if (format === 'json') {
      output = JSON.stringify(list, null, 2);
    } else {
      output = list.map((c) => `${c.hex} - ${c.name} - rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`).join('\n');
    }

    downloadText(output, `color-palette-${Date.now()}.${format}`);
    showToast(`Palette exported as .${format}!`, 'success');
  };

  const handleSample = () => {
    // Generate a vibrant sample canvas
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 900;
    sampleCanvas.height = 600;
    const ctx = sampleCanvas.getContext('2d');
    if (!ctx) return;

    // Rich multi-colored scene
    const grad = ctx.createLinearGradient(0, 0, 900, 600);
    grad.addColorStop(0, '#f43f5e'); // Rose
    grad.addColorStop(0.33, '#8b5cf6'); // Violet
    grad.addColorStop(0.66, '#0ea5e9'); // Sky
    grad.addColorStop(1, '#10b981'); // Emerald
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 900, 600);

    // Circles
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(220, 200, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Hover & Click to Pick Colors', 450, 480);

    sampleCanvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'vibrant-artwork.png', { type: 'image/png' });
        handleImage(file);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload State if no image */}
      {!imageSrc ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleImage(e.dataTransfer.files[0]);
          }}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-10 text-center transition-all bg-white dark:bg-slate-900 shadow-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900/50">
            <Pipette className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Upload Image to Pick Colors
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Hover over any pixel on your image to inspect exact HEX, RGB, HSL, and CMYK values, or auto-extract dominant palettes.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm inline-flex items-center gap-2">
              <Upload className="w-4 h-4" /> Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])}
                className="hidden"
              />
            </label>
            <button
              onClick={handleSample}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" /> Try Sample Artwork
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Canvas Preview (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div
              ref={containerRef}
              className="relative rounded-2xl bg-slate-950/80 p-3 flex items-center justify-center overflow-hidden min-h-[380px] max-h-[520px] shadow-inner"
              onPointerLeave={() => setLoupePos((prev) => ({ ...prev, show: false }))}
            >
              <canvas
                ref={canvasRef}
                onPointerMove={handleCanvasPointerMove}
                onClick={handleCanvasClick}
                className="max-h-[480px] max-w-full object-contain cursor-crosshair rounded-lg block"
              />

              {/* Magnifier Loupe Tooltip */}
              {loupePos.show && hoverColor && (
                <div
                  className="absolute pointer-events-none p-2 rounded-xl bg-slate-900/95 text-white shadow-2xl border border-white/20 flex items-center gap-2.5 backdrop-blur-sm z-30 transition-transform"
                  style={{
                    left: `${Math.min(loupePos.x + 20, (containerRef.current?.clientWidth || 300) - 160)}px`,
                    top: `${Math.max(10, loupePos.y - 60)}px`,
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg border border-white/40 shadow-inner flex-shrink-0"
                    style={{ backgroundColor: hoverColor.hex }}
                  />
                  <div>
                    <div className="text-xs font-mono font-bold leading-tight">{hoverColor.hex}</div>
                    <div className="text-[10px] text-slate-300 leading-tight">Click to pin</div>
                  </div>
                </div>
              )}
            </div>

            {/* Instruction / Switcher */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
              <span className="flex items-center gap-1.5">
                <Pipette className="w-3.5 h-3.5 text-indigo-500" />
                Click anywhere on image to save color
              </span>
              <label className="cursor-pointer text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" /> Upload Different Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Right Panel: Selected Color Details & Palette (Col 5) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Active Selected Color Showcase Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-md flex-shrink-0"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Selected Color
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                    {selectedColor.hex}
                  </h3>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {selectedColor.name}
                  </p>
                </div>
              </div>

              {/* Formats Grid with 1-Click Copy */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {[
                  { label: 'HEX', val: selectedColor.hex },
                  { label: 'RGB', val: `rgb(${selectedColor.rgb.r}, ${selectedColor.rgb.g}, ${selectedColor.rgb.b})` },
                  { label: 'HSL', val: `hsl(${selectedColor.hsl.h}, ${selectedColor.hsl.s}%, ${selectedColor.hsl.l}%)` },
                  { label: 'CMYK', val: `cmyk(${selectedColor.cmyk.c}%, ${selectedColor.cmyk.m}%, ${selectedColor.cmyk.y}%, ${selectedColor.cmyk.k}%)` },
                  { label: 'CSS Var', val: `--picked-color: ${selectedColor.hex};` },
                ].map((fmt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                  >
                    <span className="font-semibold text-slate-500 dark:text-slate-400 w-16">{fmt.label}</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold truncate px-2">
                      {fmt.val}
                    </span>
                    <button
                      onClick={() => handleCopy(fmt.val, fmt.label)}
                      className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto Dominant Color Palette */}
            {dominantColors.length > 0 && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-indigo-500" /> Extracted Palette (8 Colors)
                  </h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleExportPalette('css')}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    >
                      CSS
                    </button>
                    <button
                      onClick={() => handleExportPalette('json')}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    >
                      JSON
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {dominantColors.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(color)}
                      className={`group relative aspect-square rounded-xl border transition-all ${
                        selectedColor.hex === color.hex
                          ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105'
                          : 'border-slate-200 dark:border-slate-700 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={`${color.hex} (${color.name})`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* User Saved Pin Palette */}
            {palette.length > 0 && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Saved Pins ({palette.length})
                  </h4>
                  <button
                    onClick={() => setPalette([])}
                    className="text-[11px] text-rose-500 hover:underline"
                  >
                    Clear Pins
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {palette.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(color)}
                      className={`w-9 h-9 rounded-xl border transition-all ${
                        selectedColor.hex === color.hex
                          ? 'ring-2 ring-indigo-500 ring-offset-2'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.hex}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageColorPicker;
