import React, { useState } from 'react';
import { Upload, Download, ArrowRight, RefreshCw, FileImage, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { formatBytes, downloadBlob } from '../../lib/utils';

export const JpgToPngConverter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { showToast } = useToast();

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    showToast(`Loaded ${f.name}`, 'info');
  };

  const handleConvert = () => {
    if (!file || !preview) return;
    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      const mimeType = targetFormat === 'png' ? 'image/png' : targetFormat === 'webp' ? 'image/webp' : 'image/jpeg';

      canvas.toBlob((blob) => {
        if (blob) {
          const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'converted';
          downloadBlob(blob, `${originalName}.${targetFormat}`);
          showToast(`Converted to .${targetFormat.toUpperCase()} and downloaded!`, 'success');
        }
        setIsProcessing(false);
      }, mimeType, 0.95);
    };
    img.src = preview;
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-10 md:p-16 text-center bg-white dark:bg-slate-900 cursor-pointer hover:border-indigo-500 transition-all relative">
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
              <FileImage className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Drop JPG / JPEG / WebP image here to convert
              </p>
              <p className="text-xs text-slate-400 mt-1">Converts with lossless transparency support</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                {preview && <img src={preview} alt="Thumb" className="w-full h-full object-cover" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Convert to:</span>
              {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setTargetFormat(fmt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    targetFormat === fmt
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Choose Another
            </button>
            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Convert & Download .{targetFormat.toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default JpgToPngConverter;
