import React, { useState, useEffect } from 'react';
import { Upload, Download, Lock, Unlock, RefreshCw, Sliders } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { formatBytes, downloadBlob } from '../../lib/utils';

export const ImageResizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [format, setFormat] = useState<string>('image/jpeg');
  const [quality, setQuality] = useState<number>(90);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const { showToast } = useToast();

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) {
      showToast('Please upload an image', 'error');
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);

    const img = new Image();
    img.onload = () => {
      setOrigWidth(img.naturalWidth);
      setOrigHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = url;
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspectRatio && origWidth > 0) {
      const ratio = origHeight / origWidth;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspectRatio && origHeight > 0) {
      const ratio = origWidth / origHeight;
      setWidth(Math.round(val * ratio));
    }
  };

  const handleScalePreset = (percent: number) => {
    if (origWidth === 0) return;
    const w = Math.round((origWidth * percent) / 100);
    const h = Math.round((origHeight * percent) / 100);
    setWidth(w);
    setHeight(h);
    showToast(`Scaled to ${percent}% (${w}x${h})`, 'info');
  };

  const handleDownload = () => {
    if (!file || !preview) return;
    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // High quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
            downloadBlob(blob, `resized-${width}x${height}.${ext}`);
            showToast('Resized image downloaded!', 'success');
          }
          setIsProcessing(false);
        },
        format,
        quality / 100
      );
    };
    img.src = preview;
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-10 md:p-16 text-center bg-white dark:bg-slate-900 cursor-pointer hover:border-indigo-500 transition-all relative"
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Upload image to resize
              </p>
              <p className="text-xs text-slate-400 mt-1">Scale dimensions with pixel precision or percentage presets</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-6 space-y-5">
            {/* Dimension inputs */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Target Dimensions
                </span>
                <span className="text-xs text-slate-400 font-mono">Original: {origWidth} × {origHeight} px</span>
              </div>

              <div className="grid grid-cols-2 gap-3 relative items-center">
                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Lock Ratio Button */}
              <button
                onClick={() => setLockAspectRatio(!lockAspectRatio)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  lockAspectRatio
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                {lockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                {lockAspectRatio ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
              </button>

              {/* Quick Percentages */}
              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1.5">Quick Scale Presets</label>
                <div className="flex flex-wrap gap-1.5">
                  {[25, 50, 75, 100, 150, 200].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => handleScalePreset(pct)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Export Settings */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">Target Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                  >
                    <option value="image/jpeg">JPG / JPEG</option>
                    <option value="image/png">PNG (Lossless)</option>
                    <option value="image/webp">WebP (Modern)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">Quality ({quality}%)</label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Preview</span>
                <span className="font-mono">{width} × {height} px</span>
              </div>
              <div className="aspect-video rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800">
                {preview && <img src={preview} alt="Resize preview" className="w-full h-full object-contain" />}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFile(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Change Image
              </button>
              <button
                onClick={handleDownload}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Resized Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ImageResizer;
