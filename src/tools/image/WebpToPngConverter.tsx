import React, { useState } from 'react';
import {
  Upload,
  Download,
  Sparkles,
  Trash2,
  CheckCircle2,
  FileImage,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { formatBytes, downloadBlob } from '../../lib/utils';

interface ConvertedPngItem {
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

export const WebpToPngConverter: React.FC = () => {
  const [items, setItems] = useState<ConvertedPngItem[]>([]);
  const { showToast } = useToast();

  const handleFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(
      (f) => f.type === 'image/webp' || f.name.toLowerCase().endsWith('.webp') || f.type.startsWith('image/')
    );

    if (validFiles.length === 0) {
      showToast('Please upload WebP or standard image files.', 'error');
      return;
    }

    const newItems: ConvertedPngItem[] = validFiles.map((file) => {
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
    showToast(`Added ${newItems.length} file(s) for PNG conversion`, 'info');

    // Auto convert
    setTimeout(() => {
      newItems.forEach((item) => convertToPng(item));
    }, 100);
  };

  const convertToPng = (item: ConvertedPngItem) => {
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

      // Draw preserving alpha transparency
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
        'image/png'
      );
    };

    img.onerror = () => {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'error' } : i))
      );
    };

    img.src = item.originalUrl;
  };

  const handleDownloadSingle = (item: ConvertedPngItem) => {
    if (!item.convertedBlob) return;
    const baseName = item.originalFile.name.replace(/\.[^/.]+$/, '');
    downloadBlob(item.convertedBlob, `${baseName}.png`);
    showToast(`Downloaded ${baseName}.png`, 'success');
  };

  const handleDownloadAll = () => {
    const readyItems = items.filter((i) => i.convertedBlob !== null);
    if (readyItems.length === 0) return;

    readyItems.forEach((item, index) => {
      setTimeout(() => {
        handleDownloadSingle(item);
      }, index * 200);
    });
    showToast(`Downloading ${readyItems.length} converted PNGs...`, 'success');
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearAll = () => {
    setItems([]);
    showToast('All items cleared.', 'info');
  };

  const handleSample = () => {
    // Generate a transparent sample WebP
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 600;
    sampleCanvas.height = 600;
    const ctx = sampleCanvas.getContext('2d');
    if (!ctx) return;

    // Draw a star badge with transparent background
    ctx.clearRect(0, 0, 600, 600);
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(300, 300, 240, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Transparent', 300, 290);
    ctx.fillText('WebP Logo', 300, 345);

    sampleCanvas.toBlob((blob) => {
      if (blob) {
        const sampleFile = new File([blob], 'transparent-badge.webp', { type: 'image/webp' });
        handleFiles([sampleFile]);
      }
    }, 'image/webp');
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-8 text-center transition-all bg-white dark:bg-slate-900 shadow-sm"
      >
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-100 dark:border-indigo-900/50">
          <FileImage className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Convert WebP to Lossless PNG
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Convert WebP files to PNG with 100% full alpha transparency preservation and pixel-perfect quality.
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

      {/* Action Bar */}
      {items.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Lossless PNG format preserves 100% color fidelity and alpha channel transparency.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadAll}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download All PNGs ({items.filter((i) => i.status === 'done').length})
            </button>
          </div>
        </div>
      )}

      {/* Queue items */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Converted PNGs ({items.length})
          </div>

          <div className="grid grid-cols-1 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Checkered background for transparency */}
                  <div
                    className="w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
                      backgroundSize: '12px 12px',
                      backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                    }}
                  >
                    <img
                      src={item.convertedUrl || item.originalUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
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
                        PNG: {item.convertedSize > 0 ? formatBytes(item.convertedSize) : 'Converting...'}
                      </span>
                      {item.width > 0 && (
                        <span className="hidden md:inline text-slate-400">
                          • {item.width}×{item.height}px
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {item.status === 'done' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mr-2">
                      <CheckCircle2 className="w-4 h-4" /> PNG Ready
                    </span>
                  ) : null}

                  <button
                    onClick={() => handleDownloadSingle(item)}
                    disabled={item.status !== 'done'}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PNG
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebpToPngConverter;
