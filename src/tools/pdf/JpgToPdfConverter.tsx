import React, { useState, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import jsPDF from 'jspdf';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCw,
  Sparkles,
  Settings2,
  Check,
  Copy,
  Maximize2,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Sliders,
  Eye,
} from 'lucide-react';

interface ImageItem {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
}

export const JpgToPdfConverter: React.FC = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'legal' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>('auto');
  const [margin, setMargin] = useState<'none' | 'small' | 'medium' | 'large'>('small');
  const [imageFit, setImageFit] = useState<'contain' | 'cover' | 'original'>('contain');
  const [imageQuality, setImageQuality] = useState<number>(0.92);
  const [pdfTitle, setPdfTitle] = useState<string>('converted-document');
  const [addPageNumbers, setAddPageNumbers] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);

  // Load sample placeholder images for instant demonstration
  const handleLoadSample = () => {
    const createSampleCanvas = (title: string, color1: string, color2: string, text: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1600;
      const ctx = canvas.getContext('2d')!;
      
      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Card frame
      ctx.fillStyle = '#ffffff';
      ctx.roundRect(80, 80, canvas.width - 160, canvas.height - 160, 32);
      ctx.fill();

      // Header
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 56px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, canvas.width / 2, 280);

      // Divider
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(160, 340);
      ctx.lineTo(canvas.width - 160, 340);
      ctx.stroke();

      // Description text
      ctx.fillStyle = '#475569';
      ctx.font = '32px system-ui, sans-serif';
      ctx.fillText(text, canvas.width / 2, 440);
      ctx.fillText('100% Private, Client-Side Image to PDF Processing', canvas.width / 2, 500);

      // Graphic box
      ctx.fillStyle = '#f1f5f9';
      ctx.roundRect(160, 600, canvas.width - 320, 600, 24);
      ctx.fill();
      ctx.fillStyle = '#6366f1';
      ctx.font = 'bold 36px system-ui, sans-serif';
      ctx.fillText('📄 High-Resolution Document Render', canvas.width / 2, 920);

      return {
        id: Math.random().toString(36).substring(2, 9),
        name: `${title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        size: 145000,
        dataUrl: canvas.toDataURL('image/jpeg', 0.95),
        width: 1200,
        height: 1600,
        rotation: 0,
      };
    };

    const sample1 = createSampleCanvas('Project Invoice #1042', '#4f46e5', '#818cf8', 'Professional Service & Consulting Invoice');
    const sample2 = createSampleCanvas('Product Specification Sheet', '#0284c7', '#38bdf8', 'Hardware Dimension & Compliance Guide');

    setImages([sample1, sample2]);
    showToast('Loaded 2 sample document images', 'info');
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (validFiles.length === 0) {
      showToast('Please select valid image files (JPG, PNG, WebP)', 'error');
      return;
    }

    const promises = validFiles.map((file) => {
      return new Promise<ImageItem>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            resolve({
              id: Math.random().toString(36).substring(2, 9),
              name: file.name,
              size: file.size,
              dataUrl: e.target?.result as string,
              width: img.naturalWidth,
              height: img.naturalHeight,
              rotation: 0,
            });
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then((newItems) => {
      setImages((prev) => [...prev, ...newItems]);
      showToast(`Added ${newItems.length} image(s)`, 'success');
    });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setImages(next);
  };

  const handleRotate = (id: string) => {
    setImages(
      images.map((img) => {
        if (img.id !== id) return img;
        return {
          ...img,
          rotation: (img.rotation + 90) % 360,
        };
      })
    );
  };

  const handleRemove = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const handleClearAll = () => {
    setImages([]);
    showToast('Cleared all images', 'info');
  };

  // Helper to get image with rotation applied to a canvas
  const getRotatedImageDataUrl = (item: ImageItem): Promise<{ dataUrl: string; width: number; height: number }> => {
    return new Promise((resolve) => {
      if (item.rotation === 0) {
        resolve({ dataUrl: item.dataUrl, width: item.width, height: item.height });
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const is90or270 = item.rotation === 90 || item.rotation === 270;
        canvas.width = is90or270 ? img.naturalHeight : img.naturalWidth;
        canvas.height = is90or270 ? img.naturalWidth : img.naturalHeight;

        const ctx = canvas.getContext('2d')!;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((item.rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', imageQuality),
          width: canvas.width,
          height: canvas.height,
        });
      };
      img.src = item.dataUrl;
    });
  };

  const handleGeneratePdf = async () => {
    if (images.length === 0) {
      showToast('Please upload at least one image', 'error');
      return;
    }

    setIsGenerating(true);

    try {
      // Millimeter margin mappings
      const marginValues = {
        none: 0,
        small: 6,
        medium: 12,
        large: 20,
      };
      const marginMm = marginValues[margin];

      // Page dimensions in mm
      const standardSizes: Record<string, [number, number]> = {
        a4: [210, 297],
        letter: [215.9, 279.4],
        legal: [215.9, 355.6],
      };

      let pdf: jsPDF | null = null;

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        const { dataUrl, width: imgW, height: imgH } = await getRotatedImageDataUrl(item);

        let pageW: number;
        let pageH: number;
        let pageOrient: 'portrait' | 'landscape' = 'portrait';

        if (pageSize === 'fit') {
          // Convert pixels to mm (assuming ~96 DPI or standard 72 DPI ratio: 1px ≈ 0.264583 mm)
          pageW = imgW * 0.264583 + marginMm * 2;
          pageH = imgH * 0.264583 + marginMm * 2;
          pageOrient = pageW > pageH ? 'landscape' : 'portrait';
        } else {
          const [baseW, baseH] = standardSizes[pageSize];
          if (orientation === 'auto') {
            pageOrient = imgW > imgH ? 'landscape' : 'portrait';
          } else {
            pageOrient = orientation;
          }

          if (pageOrient === 'landscape') {
            pageW = Math.max(baseW, baseH);
            pageH = Math.min(baseW, baseH);
          } else {
            pageW = Math.min(baseW, baseH);
            pageH = Math.max(baseW, baseH);
          }
        }

        if (i === 0) {
          pdf = new jsPDF({
            orientation: pageOrient,
            unit: 'mm',
            format: pageSize === 'fit' ? [pageW, pageH] : pageSize,
          });
        } else {
          pdf!.addPage(pageSize === 'fit' ? [pageW, pageH] : pageSize, pageOrient);
        }

        // Usable area
        const printableW = pageW - marginMm * 2;
        const printableH = pageH - marginMm * 2;

        let drawW = printableW;
        let drawH = printableH;
        let drawX = marginMm;
        let drawY = marginMm;

        if (imageFit === 'contain') {
          const imgAspect = imgW / imgH;
          const printableAspect = printableW / printableH;

          if (imgAspect > printableAspect) {
            drawW = printableW;
            drawH = printableW / imgAspect;
            drawY = marginMm + (printableH - drawH) / 2;
          } else {
            drawH = printableH;
            drawW = printableH * imgAspect;
            drawX = marginMm + (printableW - drawW) / 2;
          }
        } else if (imageFit === 'original') {
          const originalWmm = imgW * 0.264583;
          const originalHmm = imgH * 0.264583;
          drawW = Math.min(originalWmm, printableW);
          drawH = Math.min(originalHmm, printableH);
          drawX = marginMm + (printableW - drawW) / 2;
          drawY = marginMm + (printableH - drawH) / 2;
        }

        // Add image to PDF
        pdf!.addImage(dataUrl, 'JPEG', drawX, drawY, drawW, drawH, undefined, 'FAST');

        // Optional page numbers
        if (addPageNumbers) {
          pdf!.setFontSize(9);
          pdf!.setTextColor(120, 120, 120);
          pdf!.text(
            `Page ${i + 1} of ${images.length}`,
            pageW / 2,
            pageH - Math.max(marginMm / 2, 4),
            { align: 'center' }
          );
        }
      }

      if (pdf) {
        const filename = `${pdfTitle.trim() || 'converted-document'}.pdf`;
        pdf.save(filename);
        showToast(`Successfully created and downloaded ${filename}`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to generate PDF: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Images
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/bmp"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <button
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample Images
          </button>

          {images.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Clear All ({images.length})
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGeneratePdf}
            disabled={images.length === 0 || isGenerating}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all ${
              images.length > 0 && !isGenerating
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Converting to PDF...' : `Save as PDF (${images.length} Pages)`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Image List & Drag Drop Area */}
        <div className="lg:col-span-7 space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[0.99]'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-400'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Drop JPG, PNG, or WebP files here, or <span className="text-indigo-600">browse</span>
              </p>
              <p className="text-xs text-slate-400">
                Supports multiple images · Reorder, rotate & combine into a single multi-page PDF
              </p>
            </div>
          </div>

          {/* Image Queue List */}
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Page Order ({images.length} {images.length === 1 ? 'Page' : 'Pages'})
                </span>
                <span className="text-[11px] text-slate-400">
                  Use arrows to arrange page sequence
                </span>
              </div>

              <div className="space-y-2.5">
                {images.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 text-xs font-black shrink-0">
                        {idx + 1}
                      </div>

                      <div className="relative w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={item.dataUrl}
                          alt={item.name}
                          style={{ transform: `rotate(${item.rotation}deg)` }}
                          className="w-full h-full object-cover transition-transform duration-200"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-xs">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.width} × {item.height}px · {(item.size / 1024).toFixed(0)} KB
                          {item.rotation !== 0 && (
                            <span className="ml-1.5 text-indigo-500 font-semibold">
                              (Rotated {item.rotation}°)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        title="Rotate 90 degrees"
                        onClick={() => handleRotate(item.id)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Move Up"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        className={`p-1.5 rounded-lg transition-colors ${
                          idx === 0
                            ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                            : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Move Down"
                        disabled={idx === images.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        className={`p-1.5 rounded-lg transition-colors ${
                          idx === images.length - 1
                            ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                            : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Delete Page"
                        onClick={() => handleRemove(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: PDF Settings & Live Document Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-indigo-600" />
              PDF Layout & Output Options
            </h3>

            {/* Document Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document File Name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  placeholder="converted-document"
                  className="flex-1 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
                <span className="text-xs font-mono text-slate-400">.pdf</span>
              </div>
            </div>

            {/* Page Size & Orientation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Page Size
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="a4">A4 (210 × 297 mm)</option>
                  <option value="letter">US Letter (8.5 × 11 in)</option>
                  <option value="legal">Legal (8.5 × 14 in)</option>
                  <option value="fit">Fit to Image Size</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Orientation
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  disabled={pageSize === 'fit'}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50"
                >
                  <option value="auto">Auto (Match Image)</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>

            {/* Margins & Fit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Page Margins
                </label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="none">No Margin (Full Bleed)</option>
                  <option value="small">Small (6 mm)</option>
                  <option value="medium">Medium (12 mm)</option>
                  <option value="large">Large (20 mm)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Image Scaling
                </label>
                <select
                  value={imageFit}
                  onChange={(e) => setImageFit(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="contain">Fit within page (Aspect Lock)</option>
                  <option value="original">Original resolution</option>
                </select>
              </div>
            </div>

            {/* Quality & Page numbers */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Image Compression Quality</span>
                  <span className="font-mono text-indigo-600">{Math.round(imageQuality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1.0}
                  step={0.05}
                  value={imageQuality}
                  onChange={(e) => setImageQuality(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Smaller File Size</span>
                  <span>Highest Quality</span>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={addPageNumbers}
                  onChange={(e) => setAddPageNumbers(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Add page numbers in footer (e.g. "Page 1 of {images.length || 1}")</span>
              </label>
            </div>

            {/* Document summary badge */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {images.length} Image(s) Ready
              </span>
              <span className="font-mono text-slate-400">
                {(images.reduce((acc, i) => acc + i.size, 0) / (1024 * 1024)).toFixed(2)} MB Source
              </span>
            </div>

            <button
              onClick={handleGeneratePdf}
              disabled={images.length === 0 || isGenerating}
              className={`w-full py-3 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
                images.length > 0 && !isGenerating
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              {isGenerating ? 'Generating High-Res PDF...' : 'Download Combined PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JpgToPdfConverter;
