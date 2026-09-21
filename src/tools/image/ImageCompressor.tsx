import React, { useState, useRef } from 'react';
import { Upload, Download, Sliders, Image as ImageIcon, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { formatBytes, downloadBlob } from '../../lib/utils';

export const ImageCompressor: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedPreview, setCompressedPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(75);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const { showToast } = useToast();

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (JPG, PNG, WebP)', 'error');
      return;
    }
    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setOriginalPreview(url);
    compressImage(file, quality);
  };

  const compressImage = (file: File, q: number) => {
    setIsProcessing(true);
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        // Determine best output format
        const outputMime = file.type === 'image/png' ? 'image/webp' : file.type;
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setCompressedBlob(blob);
              if (compressedPreview) URL.revokeObjectURL(compressedPreview);
              setCompressedPreview(URL.createObjectURL(blob));
              showToast(`Compressed at ${q}% quality`, 'info');
            }
            setIsProcessing(false);
          },
          outputMime,
          q / 100
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleQualityChange = (newQ: number) => {
    setQuality(newQ);
    if (originalFile) {
      compressImage(originalFile, newQ);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob || !originalFile) return;
    const extension = originalFile.type === 'image/png' ? 'webp' : originalFile.name.split('.').pop();
    const nameWithoutExt = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || 'image';
    downloadBlob(compressedBlob, `${nameWithoutExt}-compressed.${extension}`);
    showToast('Compressed image downloaded!', 'success');
  };

  const originalSize = originalFile ? originalFile.size : 0;
  const compressedSize = compressedBlob ? compressedBlob.size : 0;
  const reduction = originalSize > 0 && compressedSize > 0
    ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      {!originalFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
          }}
          className={`relative border-2 border-dashed rounded-3xl p-10 md:p-16 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400'
          }`}
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
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Choose an image or drag & drop here
              </h3>
              <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WebP up to 50MB (100% locally in browser)</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  Compression Quality:
                </span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-lg">
                  {quality}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setOriginalFile(null);
                    setOriginalPreview(null);
                    setCompressedBlob(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Upload New
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!compressedBlob || isProcessing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Download Compressed
                </button>
              </div>
            </div>

            {/* Slider */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-slate-400">Max Compression (10%)</span>
              <input
                type="range"
                min="10"
                max="95"
                step="5"
                value={quality}
                onChange={(e) => handleQualityChange(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-400">Best Quality (95%)</span>
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Original Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Original Image</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatBytes(originalSize)}</span>
              </div>
              <div className="relative aspect-video rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800">
                {originalPreview && (
                  <img src={originalPreview} alt="Original" className="w-full h-full object-contain" />
                )}
              </div>
            </div>

            {/* Compressed Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Compressed Output</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatBytes(compressedSize)}
                  </span>
                  {reduction > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      -{reduction}%
                    </span>
                  )}
                </div>
              </div>
              <div className="relative aspect-video rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800">
                {compressedPreview ? (
                  <img src={compressedPreview} alt="Compressed preview" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-slate-400">Processing...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ImageCompressor;
