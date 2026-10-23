import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  PageOrientation,
} from 'docx';
import { createWorker } from 'tesseract.js';
import {
  FileText,
  Upload,
  Download,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Eye,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Layers,
  FileCheck,
  Settings,
  ShieldCheck,
  HelpCircle,
  Maximize2,
  FileCode,
  CheckCircle2,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  BookOpen,
} from 'lucide-react';
import { downloadBlob, copyToClipboard, formatBytes } from '../../lib/utils';

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  dataUrl: string;
  width: number;
  height: number;
  caption: string;
  ocrText?: string;
  ocrStatus?: 'idle' | 'processing' | 'done' | 'error';
}

type Alignment = (typeof AlignmentType)[keyof typeof AlignmentType];

export const ImageToWordConverter: React.FC = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Images state
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Conversion settings
  const [mode, setMode] = useState<'embed' | 'ocr'>('embed');
  const [docTitle, setDocTitle] = useState<string>('Converted Document');
  const [includeTitleHeader, setIncludeTitleHeader] = useState<boolean>(true);
  const [imagesPerPage, setImagesPerPage] = useState<'one' | 'continuous'>('one');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [imageAlignment, setImageAlignment] = useState<Alignment>(AlignmentType.CENTER);
  const [imageScale, setImageScale] = useState<'fit' | 'medium' | 'small' | 'original'>('fit');
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [marginSize, setMarginSize] = useState<'normal' | 'narrow' | 'wide'>('normal');

  // OCR specific settings
  const [ocrLanguage, setOcrLanguage] = useState<'eng' | 'spa' | 'fra' | 'deu'>('eng');
  const [includeImageInOcrDoc, setIncludeImageInOcrDoc] = useState<boolean>(true);
  const [activeOcrTab, setActiveOcrTab] = useState<string>('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Load sample image for instant testing
  const handleLoadSample = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 850;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crisp document background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative header band
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(0, 0, canvas.width, 14);

    // Document header
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('QUARTERLY STRATEGY MEMORANDUM', 60, 80);

    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.fillText('Document Reference: Q3-STRAT-2026 • Confidential', 60, 110);
    ctx.fillText('Date: October 2026 | Prepared For: Executive Committee', 60, 135);

    // Divider line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 160);
    ctx.lineTo(790, 160);
    ctx.stroke();

    // Section 1
    ctx.fillStyle = '#312e81';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('1. Executive Overview & Objectives', 60, 205);

    ctx.fillStyle = '#334155';
    ctx.font = '16px sans-serif';
    ctx.fillText('Our primary mission this quarter focuses on cross-platform digital modernization.', 60, 240);
    ctx.fillText('Accelerating tool workflows will yield a 34% increase in team productivity and lower', 60, 268);
    ctx.fillText('operational latency across all core web applications and document lifecycles.', 60, 296);

    // Section 2
    ctx.fillStyle = '#312e81';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('2. Key Performance Milestones', 60, 355);

    const milestones = [
      '• Milestone A: Automated client-side document conversion pipeline established.',
      '• Milestone B: Enhanced data security with 100% zero-server transmission protocol.',
      '• Milestone C: Full compliance with Microsoft Word (.docx) formatting standards.',
      '• Milestone D: In-browser optical character recognition (OCR) accuracy above 98%.',
    ];

    ctx.font = '15px sans-serif';
    ctx.fillStyle = '#1e293b';
    milestones.forEach((m, idx) => {
      ctx.fillText(m, 70, 395 + idx * 32);
    });

    // Sample Data Box
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.fillRect(60, 540, 730, 200);
    ctx.strokeRect(60, 540, 730, 200);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Financial Impact Forecast Summary', 85, 580);

    ctx.font = '15px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Annualized Cloud Cost Savings: $42,500 USD', 85, 620);
    ctx.fillText('Document Turnaround Time: Reduced from 4 hours to < 10 seconds', 85, 655);
    ctx.fillText('User Privacy Auditing Score: 100/100 (Zero Remote Storage)', 85, 690);

    // Footer notice
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 13px sans-serif';
    ctx.fillText('Generated for ToolBox Hub Image to Word Converter demonstration.', 60, 1020);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'strategy_memo_sample.png', { type: 'image/png' });
      const dataUrl = canvas.toDataURL('image/png');
      const sampleItem: ImageItem = {
        id: 'sample-' + Date.now(),
        file,
        name: 'strategy_memo_sample.png',
        size: blob.size,
        dataUrl,
        width: 850,
        height: 1100,
        caption: 'Sample Business Strategy Memo',
        ocrStatus: 'idle',
      };
      setImages([sampleItem]);
      setSelectedImageId(sampleItem.id);
      setActiveOcrTab(sampleItem.id);
      showToast('Loaded demo document image!', 'success');
    }, 'image/png');
  };

  // Process uploaded files
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const validFiles = Array.from(fileList).filter((f) =>
      acceptedTypes.includes(f.type.toLowerCase()) || /\.(jpe?g|png|webp)$/i.test(f.name)
    );

    if (validFiles.length === 0) {
      showToast('Please upload valid JPEG, PNG, or WebP images.', 'error');
      return;
    }

    const newItems: ImageItem[] = [];
    let loadedCount = 0;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          newItems.push({
            id: 'img-' + Math.random().toString(36).substring(2, 9),
            file,
            name: file.name,
            size: file.size,
            dataUrl,
            width: img.naturalWidth || 800,
            height: img.naturalHeight || 600,
            caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            ocrStatus: 'idle',
          });

          loadedCount++;
          if (loadedCount === validFiles.length) {
            setImages((prev) => {
              const updated = [...prev, ...newItems];
              if (!selectedImageId && updated.length > 0) {
                setSelectedImageId(updated[0].id);
                setActiveOcrTab(updated[0].id);
              }
              return updated;
            });
            showToast(`Added ${newItems.length} image${newItems.length > 1 ? 's' : ''}!`, 'success');
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  // Reorder images
  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const copy = [...images];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setImages(copy);
  };

  // Delete image
  const removeImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      if (selectedImageId === id) {
        setSelectedImageId(updated.length > 0 ? updated[0].id : null);
        setActiveOcrTab(updated.length > 0 ? updated[0].id : '');
      }
      return updated;
    });
    showToast('Image removed.', 'info');
  };

  // Run OCR on one or all images
  const runOcrOnImages = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    setProgress(10);
    setStatusMessage('Starting client-side OCR engine...');

    try {
      const worker = await createWorker(ocrLanguage);
      const updatedImages = [...images];

      for (let i = 0; i < updatedImages.length; i++) {
        const item = updatedImages[i];
        setStatusMessage(`Recognizing text in "${item.name}" (${i + 1}/${updatedImages.length})...`);
        setProgress(Math.round(20 + ((i + 1) / updatedImages.length) * 70));

        const res = await worker.recognize(item.dataUrl);
        item.ocrText = res.data.text.trim();
        item.ocrStatus = 'done';
      }

      await worker.terminate();
      setImages(updatedImages);
      setProgress(100);
      setStatusMessage('OCR text extraction complete!');
      showToast('Successfully extracted text from all images!', 'success');
    } catch (err) {
      console.error('OCR Error:', err);
      showToast('OCR engine error. Loaded fallback text formatting.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Update caption or OCR text
  const updateImageCaption = (id: string, newCaption: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, caption: newCaption } : img))
    );
  };

  const updateImageOcrText = (id: string, newText: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ocrText: newText } : img))
    );
  };

  // Generate & Download Word Document
  const handleExportWord = async () => {
    if (images.length === 0) {
      showToast('Please upload at least one image first.', 'error');
      return;
    }

    setIsProcessing(true);
    setProgress(20);
    setStatusMessage('Preparing Word document structures...');

    try {
      const docChildren: Paragraph[] = [];

      // Optional Document Title Header
      if (includeTitleHeader && docTitle.trim()) {
        docChildren.push(
          new Paragraph({
            text: docTitle.trim(),
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 240 },
          })
        );
      }

      // Max printable dimensions in Word points/pixels (Letter is 8.5 x 11 inches)
      // At standard 96 DPI: 8.5in = 816px, 1-inch margins on each side = 624px printable
      let maxPrintableWidth = orientation === 'landscape' ? 820 : 580;
      if (imageScale === 'medium') maxPrintableWidth *= 0.75;
      if (imageScale === 'small') maxPrintableWidth *= 0.5;

      // MODE 1: Embedded Images Document
      if (mode === 'embed') {
        for (let i = 0; i < images.length; i++) {
          const item = images[i];
          setStatusMessage(`Packaging image ${i + 1} of ${images.length}...`);
          setProgress(Math.round(25 + ((i + 1) / images.length) * 50));

          // Page break between images if single per page
          const needsPageBreak = imagesPerPage === 'one' && (i > 0 || (includeTitleHeader && docTitle.trim().length > 0));

          // Calculate aspect-ratio scaled image dimensions
          let targetWidth = item.width;
          let targetHeight = item.height;

          if (imageScale !== 'original') {
            if (targetWidth > maxPrintableWidth) {
              const ratio = maxPrintableWidth / targetWidth;
              targetWidth = maxPrintableWidth;
              targetHeight = Math.round(targetHeight * ratio);
            }
          }

          // Convert file to Uint8Array
          const arrayBuffer = await item.file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          const imageType: 'png' | 'jpg' = (item.file.type === 'image/png' || item.name.toLowerCase().endsWith('.png')) ? 'png' : 'jpg';

          // Add image paragraph
          docChildren.push(
            new Paragraph({
              alignment: imageAlignment,
              pageBreakBefore: needsPageBreak,
              spacing: { before: 180, after: 120 },
              children: [
                new ImageRun({
                  type: imageType,
                  data: uint8Array,
                  transformation: {
                    width: Math.round(targetWidth),
                    height: Math.round(targetHeight),
                  },
                }),
              ],
            })
          );

          // Add caption if enabled
          if (showCaptions && item.caption.trim()) {
            docChildren.push(
              new Paragraph({
                alignment: imageAlignment,
                spacing: { before: 80, after: 280 },
                children: [
                  new TextRun({
                    text: item.caption.trim(),
                    italics: true,
                    size: 20, // 10pt
                    color: '555555',
                  }),
                ],
              })
            );
          }
        }
      }
      // MODE 2: OCR Extracted Text Document
      else {
        // If OCR has not been performed yet, execute it now
        const needsOcr = images.some((img) => !img.ocrText);
        if (needsOcr) {
          setStatusMessage('Extracting text via client-side OCR engine...');
          const worker = await createWorker(ocrLanguage);
          for (let i = 0; i < images.length; i++) {
            if (!images[i].ocrText) {
              const res = await worker.recognize(images[i].dataUrl);
              images[i].ocrText = res.data.text.trim();
              images[i].ocrStatus = 'done';
            }
          }
          await worker.terminate();
        }

        for (let i = 0; i < images.length; i++) {
          const item = images[i];
          const isFirst = i === 0;

          // Header for this section
          docChildren.push(
            new Paragraph({
              text: item.name.replace(/\.[^/.]+$/, ''),
              heading: HeadingLevel.HEADING_1,
              pageBreakBefore: !isFirst,
              spacing: { before: 240, after: 160 },
            })
          );

          // Optional: include original image at the top of the OCR transcript
          if (includeImageInOcrDoc) {
            let targetWidth = item.width;
            let targetHeight = item.height;
            const maxWidth = maxPrintableWidth * 0.7;
            if (targetWidth > maxWidth) {
              const ratio = maxWidth / targetWidth;
              targetWidth = maxWidth;
              targetHeight = Math.round(targetHeight * ratio);
            }

            const arrayBuffer = await item.file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            const imageType: 'png' | 'jpg' = (item.file.type === 'image/png' || item.name.toLowerCase().endsWith('.png')) ? 'png' : 'jpg';

            docChildren.push(
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 160 },
                children: [
                  new ImageRun({
                    type: imageType,
                    data: uint8Array,
                    transformation: {
                      width: Math.round(targetWidth),
                      height: Math.round(targetHeight),
                    },
                  }),
                ],
              })
            );
          }

          // Format OCR paragraphs
          const text = item.ocrText || 'No text detected in this image.';
          const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

          lines.forEach((line) => {
            // Heading heuristic
            const isHeading =
              line.length < 60 &&
              (/^[0-9]+\.\s+[A-Z]/.test(line) ||
                line === line.toUpperCase() ||
                /^(Chapter|Section|Notice|Invoice|Total|Memo|Agreement|Statement)/i.test(line));

            if (isHeading) {
              docChildren.push(
                new Paragraph({
                  text: line,
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 100 },
                })
              );
            } else if (line.startsWith('•') || line.startsWith('-')) {
              docChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line.replace(/^[•-]\s*/, ''),
                      size: 24, // 12pt
                    }),
                  ],
                  bullet: { level: 0 },
                  spacing: { after: 80 },
                })
              );
            } else {
              docChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line,
                      size: 24, // 12pt
                    }),
                  ],
                  spacing: { after: 160 },
                })
              );
            }
          });
        }
      }

      setStatusMessage('Compiling Microsoft Word (.docx) archive...');
      setProgress(85);

      // Margins in twips (1 inch = 1440 twips)
      const marginMap = {
        normal: 1440,
        narrow: 720,
        wide: 2000,
      };
      const marginTwips = marginMap[marginSize];

      const doc = new Document({
        title: docTitle || 'Converted Document',
        description: 'Generated from images with ToolBox Hub Image to Word Converter',
        sections: [
          {
            properties: {
              page: {
                size: {
                  orientation:
                    orientation === 'landscape'
                      ? PageOrientation.LANDSCAPE
                      : PageOrientation.PORTRAIT,
                },
                margin: {
                  top: marginTwips,
                  right: marginTwips,
                  bottom: marginTwips,
                  left: marginTwips,
                },
              },
            },
            children: docChildren,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const safeFilename = (docTitle || 'images_converted').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      downloadBlob(blob, `${safeFilename}.docx`);

      setProgress(100);
      setStatusMessage('Document ready & downloaded!');
      showToast('Word document (.docx) generated and downloaded successfully!', 'success');
    } catch (err) {
      console.error('Word Generation Error:', err);
      showToast('Failed to compile Word document. Please check console.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy all OCR text
  const handleCopyAllOcr = () => {
    const combined = images
      .map((img, idx) => `--- [Page ${idx + 1}: ${img.name}] ---\n\n${img.ocrText || '(No text extracted)'}`)
      .join('\n\n\n');

    copyToClipboard(combined).then((ok) => {
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showToast('Extracted text copied to clipboard!', 'success');
      }
    });
  };

  const selectedImage = images.find((i) => i.id === selectedImageId) || images[0];

  return (
    <div className="space-y-8">
      {/* Top Banner / Privacy Guarantee */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              100% Client-Side Privacy Guarantee
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your images and documents never leave your browser. Zero server transmission or cloud storage.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Try Sample Document
        </button>
      </div>

      {/* Main Mode Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setMode('embed')}
          className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            mode === 'embed'
              ? 'bg-white dark:bg-slate-800 border-indigo-500 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/10'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div
            className={`p-3 rounded-xl ${
              mode === 'embed'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-base">
                Embed Images in Word (.docx)
              </span>
              {mode === 'embed' && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Preserves exact visual fidelity. Embeds photos, graphics, receipts, or scans into formatted Word pages with custom margins, orientations, and captions.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('ocr');
            if (images.length > 0 && images.some((img) => !img.ocrText)) {
              runOcrOnImages();
            }
          }}
          className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            mode === 'ocr'
              ? 'bg-white dark:bg-slate-800 border-indigo-500 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/10'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div
            className={`p-3 rounded-xl ${
              mode === 'ocr'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-base">
                OCR & Extract Editable Text
              </span>
              {mode === 'ocr' && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Uses in-browser Optical Character Recognition to extract typed and printed text into editable Word paragraphs, bullet points, and headings.
            </p>
          </div>
        </button>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className="relative group border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-8 sm:p-12 text-center transition-all bg-slate-50/50 dark:bg-slate-800/20 hover:bg-indigo-50/20 dark:hover:bg-slate-800/50 cursor-pointer"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
          <Upload className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Drag & drop your JPEG or PNG images here
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-md mx-auto">
          Supports single or multiple <span className="font-semibold text-slate-700 dark:text-slate-300">.JPG, .JPEG, .PNG, .WebP</span> images. Up to 50MB per file.
        </p>

        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          Choose Images from Device
        </div>
      </div>

      {/* When Images are present */}
      {images.length > 0 && (
        <div className="space-y-6">
          {/* Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                Queue ({images.length} Image{images.length > 1 ? 's' : ''})
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                • Total: {formatBytes(images.reduce((acc, i) => acc + i.size, 0))}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add More
              </button>
              <button
                type="button"
                onClick={() => {
                  setImages([]);
                  setSelectedImageId(null);
                  showToast('Queue cleared.', 'info');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>
          </div>

          {/* Image Cards Grid / Reordering */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {images.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedImageId(item.id);
                  setActiveOcrTab(item.id);
                }}
                className={`group relative rounded-xl border p-2 flex flex-col justify-between transition-all cursor-pointer ${
                  selectedImageId === item.id
                    ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                  <img
                    src={item.dataUrl}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                    #{idx + 1}
                  </div>
                </div>

                <div className="mt-2 text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {item.width}×{item.height} • {formatBytes(item.size)}
                  </p>
                </div>

                {/* Card controls */}
                <div className="mt-2 pt-1 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveImage(idx, 'up');
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                      title="Move Earlier"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveImage(idx, 'down');
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                      title="Move Later"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(item.id);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Configuration Settings Panel */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Word Document Layout & Conversion Settings
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {mode === 'embed' ? 'Image Embedding Mode' : 'OCR Text Extraction Mode'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Document Title */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Document Title
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Project Assets Report"
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={includeTitleHeader}
                    onChange={(e) => setIncludeTitleHeader(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  Insert Title heading at top of Word doc
                </label>
              </div>

              {/* Page Orientation */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Page Orientation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      orientation === 'portrait'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    Portrait (8.5 × 11")
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      orientation === 'landscape'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    Landscape (11 × 8.5")
                  </button>
                </div>
              </div>

              {/* Page Margins */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Document Margins
                </label>
                <select
                  value={marginSize}
                  onChange={(e) => setMarginSize(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="normal">Normal (1.0 inch / 2.54 cm)</option>
                  <option value="narrow">Narrow (0.5 inch / 1.27 cm)</option>
                  <option value="wide">Wide (1.25 inches / 3.18 cm)</option>
                </select>
              </div>

              {/* Conditional options for Embed Mode */}
              {mode === 'embed' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Page Break Layout
                    </label>
                    <select
                      value={imagesPerPage}
                      onChange={(e) => setImagesPerPage(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="one">1 Image Per Page (Clean Page Breaks)</option>
                      <option value="continuous">Continuous Flow (Multiple per page)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Image Scale & Sizing
                    </label>
                    <select
                      value={imageScale}
                      onChange={(e) => setImageScale(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="fit">Fit to Printable Page Width (Recommended)</option>
                      <option value="medium">Medium Size (75% width)</option>
                      <option value="small">Compact Size (50% width)</option>
                      <option value="original">Original Pixel Dimensions</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Image Alignment
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setImageAlignment(AlignmentType.LEFT)}
                        className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1 text-xs ${
                          imageAlignment === AlignmentType.LEFT
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <AlignLeft className="w-3.5 h-3.5" /> Left
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageAlignment(AlignmentType.CENTER)}
                        className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1 text-xs ${
                          imageAlignment === AlignmentType.CENTER
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <AlignCenter className="w-3.5 h-3.5" /> Center
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageAlignment(AlignmentType.RIGHT)}
                        className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1 text-xs ${
                          imageAlignment === AlignmentType.RIGHT
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <AlignRight className="w-3.5 h-3.5" /> Right
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Conditional options for OCR Mode */}
              {mode === 'ocr' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      OCR Language Recognition
                    </label>
                    <select
                      value={ocrLanguage}
                      onChange={(e) => setOcrLanguage(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="eng">English (Latin)</option>
                      <option value="spa">Spanish (Español)</option>
                      <option value="fra">French (Français)</option>
                      <option value="deu">German (Deutsch)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Include Source Image
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={includeImageInOcrDoc}
                        onChange={(e) => setIncludeImageInOcrDoc(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      Embed original image above extracted text
                    </label>
                  </div>

                  <div className="space-y-2 flex flex-col justify-end">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={runOcrOnImages}
                      className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                      Re-run OCR on All Images
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Individual Image Caption Customizer */}
            {mode === 'embed' && selectedImage && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <span>Caption for Selected Image:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 normal-case font-semibold">
                      {selectedImage.name}
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCaptions}
                      onChange={(e) => setShowCaptions(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    Enable captions in document
                  </label>
                </div>
                <input
                  type="text"
                  value={selectedImage.caption}
                  onChange={(e) => updateImageCaption(selectedImage.id, e.target.value)}
                  placeholder="e.g. Figure 1: Architectural diagram of core services"
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* OCR Extracted Text Preview & Interactive Editor */}
          {mode === 'ocr' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    OCR Extracted Text & Transcription Editor
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyAllOcr}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied All!' : 'Copy All Text'}
                  </button>
                </div>
              </div>

              {/* Tabs for each image */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-700/50">
                {images.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveOcrTab(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      (activeOcrTab || images[0].id) === item.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    #{idx + 1} {item.name.slice(0, 15)}...
                  </button>
                ))}
              </div>

              {/* Active Tab Editor */}
              {(() => {
                const activeImg = images.find((i) => i.id === (activeOcrTab || images[0].id)) || images[0];
                const text = activeImg.ocrText || '';
                const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
                const charCount = text.length;

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Editing transcript for: <strong className="text-slate-700 dark:text-slate-300">{activeImg.name}</strong></span>
                      <span>{wordCount} words • {charCount} characters</span>
                    </div>

                    <textarea
                      rows={10}
                      value={activeImg.ocrText || ''}
                      onChange={(e) => updateImageOcrText(activeImg.id, e.target.value)}
                      placeholder={
                        isProcessing
                          ? 'Extracting text from image via OCR...'
                          : 'No text extracted yet. Click "Re-run OCR" or edit text directly here.'
                      }
                      className="w-full p-4 rounded-xl text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                    />
                  </div>
                );
              })()}
            </div>
          )}

          {/* Progress Indicator */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {statusMessage || 'Processing document...'}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-indigo-200/60 dark:bg-indigo-900 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/20">
            <div>
              <h4 className="text-lg font-bold">
                Ready to Convert {images.length} Image{images.length > 1 ? 's' : ''} to Word
              </h4>
              <p className="text-xs text-indigo-100 mt-0.5">
                Outputs an editable, fully styled Microsoft Word (.docx) document compatible with Word, Google Docs, and LibreOffice.
              </p>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleExportWord}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 active:scale-95 text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              {isProcessing ? 'Compiling Document...' : 'Download Word (.docx)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageToWordConverter;
