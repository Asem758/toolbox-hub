import React, { useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Sliders,
  Sparkles,
  Maximize2,
  Trash2,
  Check,
  Eye,
  Layers,
  Palette,
  FlipHorizontal,
  FlipVertical,
} from 'lucide-react';
import { ImageAdjustments } from './types';
import { useToast } from '../../../context/ToastContext';

interface ImageEditorPanelProps {
  imageAdjustments: ImageAdjustments;
  imageSource?: string | null;
  onChangeAdjustments: (updates: Partial<ImageAdjustments>) => void;
  onUploadImage: (file: File) => void;
  onRemoveImage: () => void;
  hasImage: boolean;
}

export const ImageEditorPanel: React.FC<ImageEditorPanelProps> = ({
  imageAdjustments,
  imageSource,
  onChangeAdjustments,
  onUploadImage,
  onRemoveImage,
  hasImage,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUploadImage(file);
    }
  };

  const handleResetPosition = () => {
    onChangeAdjustments({
      panX: 0,
      panY: 0,
      zoom: 100,
      flipH: false,
      flipV: false,
    });
    showToast('Reset image position and zoom to center', 'info');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-red-500" />
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Image Frame & Placement Controls
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Crop, fit, pan, and zoom without overflow or aspect-ratio distortion
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-full">
          Container Frame Locked
        </span>
      </div>

      {/* Upload Box / Image Status */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {!hasImage ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/20 group"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Click to Upload Photo or Drag & Drop
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports PNG, JPG, WebP, SVG • Automatically fitted to 16:9 frame
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              {imageSource ? (
                <img
                  src={imageSource}
                  alt="Uploaded preview"
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Image Active in Canvas</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Mode: <strong className="capitalize">{imageAdjustments.mode}</strong> • 16:9 Frame Protected
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={onRemoveImage}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                title="Remove Image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Layer Integration Mode Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Image Layer Mode
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              onChangeAdjustments({ mode: 'background' });
              showToast('Image set as Full Canvas Background', 'info');
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              imageAdjustments.mode === 'background'
                ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 font-bold shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="text-xs font-black mb-0.5">Full 16:9 Background</div>
            <div className="text-[11px] opacity-75">Spans entire 1280x720 canvas behind text</div>
          </button>

          <button
            type="button"
            onClick={() => {
              onChangeAdjustments({ mode: 'subject' });
              showToast('Image set as Presenter / Subject Cutout', 'info');
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              imageAdjustments.mode === 'subject'
                ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 font-bold shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="text-xs font-black mb-0.5">Presenter / Subject Cutout</div>
            <div className="text-[11px] opacity-75">Framed subject card with aura glow & shape</div>
          </button>
        </div>
      </div>

      {/* Positioning, Pan & Zoom Toolbar */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-red-500" />
            <span>Position, Pan & Zoom</span>
          </span>
          <button
            type="button"
            onClick={handleResetPosition}
            className="text-[11px] font-bold text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Center</span>
          </button>
        </div>

        {/* Zoom Control */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">Zoom Scale</span>
            <span className="font-bold text-slate-900 dark:text-white">{imageAdjustments.zoom}%</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeAdjustments({ zoom: Math.max(50, imageAdjustments.zoom - 10) })}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min={50}
              max={250}
              step={5}
              value={imageAdjustments.zoom}
              onChange={(e) => onChangeAdjustments({ zoom: Number(e.target.value) })}
              className="flex-1 accent-red-600"
            />
            <button
              type="button"
              onClick={() => onChangeAdjustments({ zoom: Math.min(250, imageAdjustments.zoom + 10) })}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Horizontal Pan (X) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">Horizontal Pan (Left / Right)</span>
            <span className="font-bold text-slate-900 dark:text-white">{imageAdjustments.panX}%</span>
          </div>
          <input
            type="range"
            min={-80}
            max={80}
            step={2}
            value={imageAdjustments.panX}
            onChange={(e) => onChangeAdjustments({ panX: Number(e.target.value) })}
            className="w-full accent-red-600"
          />
        </div>

        {/* Vertical Pan (Y) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">Vertical Pan (Up / Down)</span>
            <span className="font-bold text-slate-900 dark:text-white">{imageAdjustments.panY}%</span>
          </div>
          <input
            type="range"
            min={-80}
            max={80}
            step={2}
            value={imageAdjustments.panY}
            onChange={(e) => onChangeAdjustments({ panY: Number(e.target.value) })}
            className="w-full accent-red-600"
          />
        </div>

        {/* Flip Controls */}
        <div className="flex items-center gap-3 pt-1 border-t border-slate-200 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => onChangeAdjustments({ flipH: !imageAdjustments.flipH })}
            className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              imageAdjustments.flipH
                ? 'bg-red-500 text-white border-red-500'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span>Flip Horizontal</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeAdjustments({ flipV: !imageAdjustments.flipV })}
            className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              imageAdjustments.flipV
                ? 'bg-red-500 text-white border-red-500'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
            }`}
          >
            <FlipVertical className="w-3.5 h-3.5" />
            <span>Flip Vertical</span>
          </button>
        </div>
      </div>

      {/* Legibility & Contrast Dimming Overlay (Essential for AI Images) */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            <span>Background Dimming & Text Readability Overlay</span>
          </span>
          <span className="text-xs font-bold text-amber-500">{imageAdjustments.dimming}% Dim</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Darkens the background image behind typography to guarantee 100% mobile text contrast and high CTR
        </p>
        <input
          type="range"
          min={0}
          max={90}
          step={5}
          value={imageAdjustments.dimming}
          onChange={(e) => onChangeAdjustments({ dimming: Number(e.target.value) })}
          className="w-full accent-amber-500"
        />
      </div>

      {/* Subject Cutout Mode Specific Controls */}
      {imageAdjustments.mode === 'subject' && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Subject Frame Shape & Aura Glow</span>
            </span>
            <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">
              {imageAdjustments.subjectShape} • {imageAdjustments.subjectPosition}
            </span>
          </div>

          {/* Shape Selector (6 Balanced Shapes in 3x2 Grid) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Frame Cutout Shape
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'rounded-card', label: 'Rounded Studio', icon: '▢' },
                { id: 'cutout', label: 'Boxed Frame', icon: '▭' },
                { id: 'circle', label: 'Circular Avatar', icon: '○' },
                { id: 'hexagon', label: 'Hexagon Cyber', icon: '⬡' },
                { id: 'pill', label: 'Vertical Pill', icon: '⬯' },
                { id: 'diamond', label: 'Diamond Angle', icon: '◇' },
              ].map((sh) => (
                <button
                  key={sh.id}
                  type="button"
                  onClick={() => onChangeAdjustments({ subjectShape: sh.id as any })}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    imageAdjustments.subjectShape === sh.id
                      ? 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="text-sm opacity-80">{sh.icon}</span>
                  <span className="truncate">{sh.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Position Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Canvas Placement
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'left', label: 'Left Subject', icon: '◀' },
                { id: 'center', label: 'Center Focus', icon: '⦿' },
                { id: 'right', label: 'Right Subject', icon: '▶' },
              ].map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => onChangeAdjustments({ subjectPosition: pos.id as any })}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    imageAdjustments.subjectPosition === pos.id
                      ? 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="text-xs opacity-75">{pos.icon}</span>
                  <span>{pos.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aura Glow Intensity Slider */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700/60">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <span>Aura Glow Intensity</span>
                </span>
                <span className="font-bold text-amber-500">{imageAdjustments.glowBlur}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                step={2}
                value={imageAdjustments.glowBlur}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onChangeAdjustments({
                    glowBlur: val,
                    glowWidth: val === 0 ? 0 : Math.max(3, imageAdjustments.glowWidth || 4),
                  });
                }}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Aura Glow Outline Width */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Border Outline Width</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{imageAdjustments.glowWidth}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={12}
                step={1}
                value={imageAdjustments.glowWidth}
                onChange={(e) => onChangeAdjustments({ glowWidth: Number(e.target.value) })}
                className="w-full accent-red-600"
              />
            </div>

            {/* Aura Glow Color Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Aura & Border Color</span>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: imageAdjustments.glowColor || '#facc15' }}
                  />
                  <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {imageAdjustments.glowColor || '#facc15'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { name: 'Neon Gold', color: '#facc15' },
                  { name: 'Neon Cyan', color: '#06b6d4' },
                  { name: 'Crimson Red', color: '#ef4444' },
                  { name: 'Emerald', color: '#10b981' },
                  { name: 'Electric Purple', color: '#a855f7' },
                  { name: 'Hot Orange', color: '#f97316' },
                  { name: 'Pure White', color: '#ffffff' },
                ].map((swatch) => (
                  <button
                    key={swatch.color}
                    type="button"
                    title={swatch.name}
                    onClick={() => onChangeAdjustments({ glowColor: swatch.color, glowWidth: Math.max(3, imageAdjustments.glowWidth || 4) })}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      imageAdjustments.glowColor === swatch.color
                        ? 'ring-2 ring-red-500 ring-offset-2 scale-110 border-white'
                        : 'border-black/15 dark:border-white/20 hover:scale-105'
                    }`}
                    style={{ backgroundColor: swatch.color }}
                  />
                ))}

                {/* Custom Color Input */}
                <label className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300">
                  <input
                    type="color"
                    value={imageAdjustments.glowColor || '#facc15'}
                    onChange={(e) => onChangeAdjustments({ glowColor: e.target.value, glowWidth: Math.max(3, imageAdjustments.glowWidth || 4) })}
                    className="w-4 h-4 rounded cursor-pointer border-0 p-0"
                  />
                  <span>Custom</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
