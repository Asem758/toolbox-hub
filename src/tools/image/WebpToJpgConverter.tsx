import React, { useState } from 'react';
import {
  Upload,
  Download,
  Sliders,
  Sparkles,
  Trash2,
  CheckCircle2,
  FileImage,
  ArrowRight,
  Palette,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { formatBytes, downloadBlob } from '../../lib/utils';

interface ConvertedItem {
  id: string;
  originalFile: File;
  originalSize: number;
  originalUrl: string;
  width: number;
  height: number;
  convertedBlob: Blob | null;
  convertedSize: number;
  convertedUrl: string | null;
  status: 'pending' | 'processing' | 'done' | 'error';
}

export const WebpToJpgConverter: React.FC = () => {
  const [items, setItems] = useState<ConvertedItem[]>([]);
  const [quality, setQuality] = useState<number>(90);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [isProcessingAll, setIsProcessingAll] = useState<boolean>(false);

  const { showToast } = useToast();

  const handleFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(
      (f) => f.type === 'image/webp' || f.name.toLowerCase().endsWith('.webp') || f.type.startsWith('image/')
    );

    if (validFiles.length === 0) {
      showToast('Please upload WebP or standard image files.', 'error');
      return;
    }

    const newItems: ConvertedItem[] = validFiles.map((file) => {
      const url = URL.createObjectURL(file);
      return {
        id: Math.random().toString(36).substring(2, 9),
        originalFile: file,
        originalSize: file.size,
        originalUrl: url,
        width: 0,
        height: 0,
        convertedBlob: null,
        convertedSize: 0,
        convertedUrl: null,
        status: 'pending',
      };
    });

    setItems((prev) => [...prev, ...newItems]);
    showToast(`Added ${newItems.length} file(s) for conversion`, 'info');

    // Auto trigger conversion for new items
    setTimeout(() => {
      newItems.forEach((item) => convertSingleItem(item, quality, bgColor));
    }, 100);
  };

  const convertSingleItem = (
    item: ConvertedItem,
    targetQuality: number,
    targetBgColor: string
  ) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'processing' } : i))
    );

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill background color for transparent areas
      ctx.fillStyle = targetBgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw image
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const convertedUrl = URL.createObjectURL(blob);
            setItems((prev) =>
              prev.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      width: img.naturalWidth,
                      height: img.naturalHeight,
                      convertedBlob: blob,
                      convertedSize: blob.size,
                      convertedUrl,
                      status: 'done',
                    }
                  : i
              )
            );
          }
        },
        'image/jpeg',
        targetQuality / 100
      );
    };

    img.onerror = () => {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'error' } : i))
      );
    };

    img.src = item.originalUrl;
  };

  const handleReconvertAll = (newQuality: number, newBg: string) => {
    items.forEach((item) => convertSingleItem(item, newQuality, newBg));
  };

  const handleDownloadSingle = (item: ConvertedItem) => {
    if (!item.convertedBlob) return;
    const baseName = item.originalFile.name.replace(/\.[^/.]+$/, '');
    downloadBlob(item.convertedBlob, `${baseName}.jpg`);
    showToast(`Downloaded ${baseName}.jpg`, 'success');
  };

  const handleDownloadAll = () => {
    const readyItems = items.filter((i) => i.convertedBlob !== null);
    if (readyItems.length === 0) return;

    readyItems.forEach((item, index) => {
      setTimeout(() => {
        handleDownloadSingle(item);
      }, index * 200);
    });
    showToast(`Downloading ${readyItems.length} converted JPGs...`, 'success');
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearAll = () => {
    setItems([]);
    showToast('All items cleared.', 'info');
  };

  const handleSample = () => {
    // Generate a sample WebP image on canvas
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 800;
    sampleCanvas.height = 600;
    const ctx = sampleCanvas.getContext('2d');
    if (!ctx) return;

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 800, 600);
    grad.addColorStop(0, '#f97316');
    grad.addColorStop(1, '#ec4899');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WebP Sample Image', 400, 280);
    ctx.font = '22px sans-serif';
    ctx.fillText('Ready for WebP → JPG Conversion', 400, 340);

    sampleCanvas.toBlob((blob) => {
      if (blob) {
        const sampleFile = new File([blob], 'demo-graphic.webp', { type: 'image/webp' });
        handleFiles([sampleFile]);
      }
    }, 'image/webp');
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-8 text-center transition-all bg-white dark:bg-slate-900 shadow-sm"
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-100 dark:border-amber-900/50">
          <FileImage className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Convert WebP to High-Quality JPG
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Drag and drop one or multiple .webp images, or click to browse. 100% private in-browser conversion.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm inline-flex items-center gap-2">
            <Upload className="w-4 h-4" /> Select WebP Files
            <input
              type="file"
              multiple
              accept="image/webp,.webp,image/*"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />
          </label>
          <button
            onClick={handleSample}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500" /> Insert Sample WebP
          </button>
        </div>
      </div>

      {/* Global Conversion Settings Bar */}
      {items.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* JPG Quality Slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" /> JPG Quality:
              </span>
              <input
                type="range"
                min={40}
                max={100}
                step={2}
                value={quality}
                onChange={(e) => {
                  const q = Number(e.target.value);
                  setQuality(q);
                  handleReconvertAll(q, bgColor);
                }}
                className="w-28 sm:w-36 accent-indigo-600"
              />
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 w-9">
                {quality}%
              </span>
            </div>

            {/* Background Color for Transparency */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-500" /> Background:
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { name: 'White', color: '#FFFFFF' },
                  { name: 'Black', color: '#000000' },
                  { name: 'Light Gray', color: '#F1F5F9' },
                ].map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => {
                      setBgColor(preset.color);
                      handleReconvertAll(quality, preset.color);
                    }}
                    className={`w-6 h-6 rounded-full border transition-all ${
                      bgColor === preset.color
                        ? 'ring-2 ring-indigo-500 ring-offset-2'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                    style={{ backgroundColor: preset.color }}
                    title={`Fill transparent areas with ${preset.name}`}
                  />
                ))}
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => {
                    setBgColor(e.target.value);
                    handleReconvertAll(quality, e.target.value);
                  }}
                  className="w-6 h-6 rounded-md cursor-pointer border border-slate-300"
                  title="Custom background color"
                />
              </div>
            </div>

            {/* Batch Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAll}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                title="Clear all files"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownloadAll}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download All JPGs ({items.filter((i) => i.status === 'done').length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Converted Files List */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Queue ({items.length} file{items.length > 1 ? 's' : ''})
          </div>

          <div className="grid grid-cols-1 gap-3">
            {items.map((item) => {
              const percentDiff =
                item.convertedSize > 0 && item.originalSize > 0
                  ? (((item.convertedSize - item.originalSize) / item.originalSize) * 100).toFixed(1)
                  : null;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left: Thumbnail & Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <img
                        src={item.convertedUrl || item.originalUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {item.originalFile.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>WebP: {formatBytes(item.originalSize)}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          JPG: {item.convertedSize > 0 ? formatBytes(item.convertedSize) : 'Converting...'}
                        </span>
                        {item.width > 0 && (
                          <span className="hidden md:inline text-slate-400">
                            • {item.width}×{item.height}px
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    {item.status === 'done' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mr-2">
                        <CheckCircle2 className="w-4 h-4" /> Ready
                      </span>
                    ) : item.status === 'processing' ? (
                      <span className="text-xs font-medium text-amber-500 mr-2">Converting...</span>
                    ) : null}

                    <button
                      onClick={() => handleDownloadSingle(item)}
                      disabled={item.status !== 'done'}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <Download className="w-3.5 h-3.5" /> Download JPG
                    </button>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

export default WebpToJpgConverter;
