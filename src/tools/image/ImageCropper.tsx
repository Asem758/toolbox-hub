import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Download,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Grid,
  Check,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sliders,
  Sparkles,
  Crop as CropIcon,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { downloadBlob } from '../../lib/utils';

interface AspectRatioOption {
  label: string;
  value: number | null; // null for freeform, or width / height ratio
  iconText: string;
}

const ASPECT_RATIOS: AspectRatioOption[] = [
  { label: 'Freeform', value: null, iconText: 'Free' },
  { label: '1:1 Square', value: 1, iconText: '1:1' },
  { label: '16:9 Landscape', value: 16 / 9, iconText: '16:9' },
  { label: '9:16 Story/Reels', value: 9 / 16, iconText: '9:16' },
  { label: '4:5 IG Portrait', value: 4 / 5, iconText: '4:5' },
  { label: '4:3 Standard', value: 4 / 3, iconText: '4:3' },
  { label: '3:2 Classic Photo', value: 3 / 2, iconText: '3:2' },
  { label: '2:1 Twitter Banner', value: 2 / 1, iconText: '2:1' },
];

export const ImageCropper: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalWidth, setNaturalWidth] = useState<number>(0);
  const [naturalHeight, setNaturalHeight] = useState<number>(0);

  // Crop Coordinates in normalized percentages [0..100]
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });

  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<string>('image/png');
  const [quality, setQuality] = useState<number>(92);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragTypeRef = useRef<string | null>(null); // 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w'
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; box: typeof cropBox }>({
    mouseX: 0,
    mouseY: 0,
    box: { x: 0, y: 0, width: 0, height: 0 },
  });

  const { showToast } = useToast();

  const handleImageFile = (f: File) => {
    if (!f.type.startsWith('image/')) {
      showToast('Please upload a valid image file.', 'error');
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setImageSrc(url);

    const img = new Image();
    img.onload = () => {
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      // Reset crop box
      setCropBox({ x: 10, y: 10, width: 80, height: 80 });
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      showToast(`Loaded ${f.name} (${img.naturalWidth}x${img.naturalHeight}px)`, 'success');
    };
    img.src = url;
  };

  const handleSample = () => {
    // Generate a high quality landscape canvas sample
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 1200;
    sampleCanvas.height = 800;
    const ctx = sampleCanvas.getContext('2d');
    if (!ctx) return;

    // Beautiful gradient backdrop
    const grad = ctx.createLinearGradient(0, 0, 1200, 800);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(0.5, '#3b82f6');
    grad.addColorStop(1, '#06b6d4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 800);

    // Decorative shapes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(300, 400, 240, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(900, 300, 180, 0, Math.PI * 2);
    ctx.fill();

    // Typography on sample
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ToolBox Hub Image Cropper', 600, 380);
    ctx.font = '28px sans-serif';
    ctx.fillText('Drag handles to crop • 1200 x 800 px Sample', 600, 440);

    sampleCanvas.toBlob((blob) => {
      if (blob) {
        const sampleFile = new File([blob], 'sample-landscape.png', { type: 'image/png' });
        handleImageFile(sampleFile);
      }
    });
  };

  // Adjust crop box when aspect ratio changes
  const applyAspectRatio = (ratio: number | null) => {
    setSelectedRatio(ratio);
    if (ratio === null || naturalWidth === 0 || naturalHeight === 0) return;

    // Compute aspect ratio in percentage terms
    // ratio = (realWidth) / (realHeight) = (box.width * naturalWidth) / (box.height * naturalHeight)
    // box.width / box.height = ratio * (naturalHeight / naturalWidth)
    const imageAspect = naturalWidth / naturalHeight;
    const targetBoxAspect = ratio / imageAspect;

    let newWidth = cropBox.width;
    let newHeight = newWidth / targetBoxAspect;

    if (newHeight > 90) {
      newHeight = 90;
      newWidth = newHeight * targetBoxAspect;
    }
    if (newWidth > 90) {
      newWidth = 90;
      newHeight = newWidth / targetBoxAspect;
    }

    const newX = Math.max(0, Math.min(100 - newWidth, (100 - newWidth) / 2));
    const newY = Math.max(0, Math.min(100 - newHeight, (100 - newHeight) / 2));

    setCropBox({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  };

  // Calculated cropped pixel dimensions
  const croppedPixelWidth = Math.round((cropBox.width / 100) * naturalWidth);
  const croppedPixelHeight = Math.round((cropBox.height / 100) * naturalHeight);

  // Mouse / Touch handlers for dragging and resizing
  const handlePointerDown = (e: React.PointerEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    dragTypeRef.current = type;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      box: { ...cropBox },
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - dragStartRef.current.mouseX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - dragStartRef.current.mouseY) / rect.height) * 100;
      const start = dragStartRef.current.box;
      const type = dragTypeRef.current;

      let newBox = { ...start };

      if (type === 'move') {
        newBox.x = Math.max(0, Math.min(100 - start.width, start.x + deltaXPercent));
        newBox.y = Math.max(0, Math.min(100 - start.height, start.y + deltaYPercent));
      } else {
        // Resizing handles
        if (type?.includes('e')) {
          newBox.width = Math.max(10, Math.min(100 - start.x, start.width + deltaXPercent));
        }
        if (type?.includes('s')) {
          newBox.height = Math.max(10, Math.min(100 - start.y, start.height + deltaYPercent));
        }
        if (type?.includes('w')) {
          const possibleWidth = start.width - deltaXPercent;
          if (possibleWidth >= 10 && start.x + deltaXPercent >= 0) {
            newBox.x = start.x + deltaXPercent;
            newBox.width = possibleWidth;
          }
        }
        if (type?.includes('n')) {
          const possibleHeight = start.height - deltaYPercent;
          if (possibleHeight >= 10 && start.y + deltaYPercent >= 0) {
            newBox.y = start.y + deltaYPercent;
            newBox.height = possibleHeight;
          }
        }

        // Lock aspect ratio if selected
        if (selectedRatio && naturalWidth > 0 && naturalHeight > 0) {
          const imageAspect = naturalWidth / naturalHeight;
          const targetAspect = selectedRatio / imageAspect;
          newBox.height = newBox.width / targetAspect;
          if (newBox.y + newBox.height > 100) {
            newBox.height = 100 - newBox.y;
            newBox.width = newBox.height * targetAspect;
          }
        }
      }

      setCropBox(newBox);
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      dragTypeRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [selectedRatio, naturalWidth, naturalHeight]);

  const handleDownloadCrop = () => {
    if (!imageSrc || naturalWidth === 0 || naturalHeight === 0) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Step 1: Draw with rotation/flips on intermediate canvas
      const isRotated90or270 = rotation === 90 || rotation === 270;
      const transWidth = isRotated90or270 ? naturalHeight : naturalWidth;
      const transHeight = isRotated90or270 ? naturalWidth : naturalHeight;

      const transCanvas = document.createElement('canvas');
      transCanvas.width = transWidth;
      transCanvas.height = transHeight;
      const transCtx = transCanvas.getContext('2d');
      if (!transCtx) return;

      transCtx.translate(transWidth / 2, transHeight / 2);
      transCtx.rotate((rotation * Math.PI) / 180);
      transCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      transCtx.drawImage(img, -naturalWidth / 2, -naturalHeight / 2);

      // Step 2: Slice the crop area from transformed canvas
      const cropX = Math.round((cropBox.x / 100) * transWidth);
      const cropY = Math.round((cropBox.y / 100) * transHeight);
      const cropW = Math.max(1, Math.round((cropBox.width / 100) * transWidth));
      const cropH = Math.max(1, Math.round((cropBox.height / 100) * transHeight));

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = cropW;
      finalCanvas.height = cropH;
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) return;

      finalCtx.imageSmoothingEnabled = true;
      finalCtx.imageSmoothingQuality = 'high';

      // Background fill for JPG
      if (outputFormat === 'image/jpeg') {
        finalCtx.fillStyle = '#ffffff';
        finalCtx.fillRect(0, 0, cropW, cropH);
      }

      finalCtx.drawImage(transCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      finalCanvas.toBlob(
        (blob) => {
          if (blob) {
            const ext = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/webp' ? 'webp' : 'jpg';
            const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'cropped-image';
            downloadBlob(blob, `${baseName}-cropped-${cropW}x${cropH}.${ext}`);
            showToast(`Cropped image downloaded (${cropW}x${cropH}px)!`, 'success');
          }
          setIsProcessing(false);
        },
        outputFormat,
        quality / 100
      );
    };
    img.src = imageSrc;
  };

  const handleReset = () => {
    setCropBox({ x: 10, y: 10, width: 80, height: 80 });
    setSelectedRatio(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    showToast('Crop boundaries reset.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Upload State */}
      {!imageSrc ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleImageFile(e.dataTransfer.files[0]);
          }}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-10 text-center transition-all bg-white dark:bg-slate-900 shadow-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900/50">
            <CropIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Upload Image to Crop
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Drag & drop your JPG, PNG, or WebP file here, or click to browse.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm inline-flex items-center gap-2">
              <Upload className="w-4 h-4" /> Browse Image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                className="hidden"
              />
            </label>
            <button
              onClick={handleSample}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" /> Try Sample Image
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Controls Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            {/* Aspect Ratio Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
                Aspect Ratio:
              </span>
              {ASPECT_RATIOS.map((ratio, i) => {
                const isSelected = selectedRatio === ratio.value;
                return (
                  <button
                    key={i}
                    onClick={() => applyAspectRatio(ratio.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {ratio.iconText}
                  </button>
                );
              })}
            </div>

            {/* Transform Actions (Rotate, Flip, Grid, Reset) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setRotation((r) => (r + 270) % 360)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Rotate 90° CCW"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Rotate 90° CW"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFlipH((f) => !f)}
                className={`p-2 rounded-lg transition-colors ${
                  flipH
                    ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
                title="Flip Horizontal"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFlipV((f) => !f)}
                className={`p-2 rounded-lg transition-colors ${
                  flipV
                    ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
                title="Flip Vertical"
              >
                <FlipVertical className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowGrid((g) => !g)}
                className={`p-2 rounded-lg transition-colors ${
                  showGrid
                    ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
                title="Toggle Rule of Thirds Grid"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Reset Crop Box"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Canvas / Cropper Workspace */}
          <div className="relative rounded-2xl bg-slate-950/90 p-4 flex items-center justify-center overflow-hidden min-h-[420px] max-h-[580px] shadow-inner select-none">
            <div
              ref={containerRef}
              className="relative inline-block max-w-full max-h-[520px]"
              style={{
                transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                transition: 'transform 0.2s ease-out',
              }}
            >
              {/* Base Image */}
              <img
                src={imageSrc}
                alt="Crop preview"
                className="max-h-[500px] w-auto object-contain block pointer-events-none rounded-lg"
              />

              {/* Dark Overlay Outside Crop Area */}
              <div
                className="absolute inset-0 pointer-events-none bg-black/55"
                style={{
                  clipPath: `polygon(
                    0% 0%, 0% 100%, 100% 100%, 100% 0%,
                    ${cropBox.x}% 0%,
                    ${cropBox.x}% ${cropBox.y + cropBox.height}%,
                    ${cropBox.x + cropBox.width}% ${cropBox.y + cropBox.height}%,
                    ${cropBox.x + cropBox.width}% ${cropBox.y}%,
                    ${cropBox.x}% ${cropBox.y}%,
                    ${cropBox.x}% 0%
                  )`,
                }}
              />

              {/* Active Crop Box with Handles */}
              <div
                onPointerDown={(e) => handlePointerDown(e, 'move')}
                className="absolute border-2 border-indigo-400 dark:border-indigo-300 shadow-[0_0_0_1px_rgba(0,0,0,0.5)] cursor-move transition-shadow"
                style={{
                  left: `${cropBox.x}%`,
                  top: `${cropBox.y}%`,
                  width: `${cropBox.width}%`,
                  height: `${cropBox.height}%`,
                }}
              >
                {/* Rule of Thirds Grid */}
                {showGrid && (
                  <div className="w-full h-full pointer-events-none grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-white/30" />
                    <div className="border-r border-white/30" />
                    <div />
                  </div>
                )}

                {/* Dimension Badge */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900/90 text-white text-[11px] font-mono font-semibold rounded pointer-events-none whitespace-nowrap shadow border border-white/20">
                  {croppedPixelWidth} × {croppedPixelHeight} px
                </div>

                {/* 4 Corner Resize Handles */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'nw')}
                  className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-nwse-resize shadow-md"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'ne')}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-nesw-resize shadow-md"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'se')}
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-nwse-resize shadow-md"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'sw')}
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-nesw-resize shadow-md"
                />

                {/* 4 Midpoint Edge Handles */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'n')}
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-white border border-indigo-600 rounded-sm cursor-ns-resize"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 's')}
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-white border border-indigo-600 rounded-sm cursor-ns-resize"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'w')}
                  className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-6 bg-white border border-indigo-600 rounded-sm cursor-ew-resize"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'e')}
                  className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-6 bg-white border border-indigo-600 rounded-sm cursor-ew-resize"
                />
              </div>
            </div>
          </div>

          {/* Bottom Export Settings & Actions */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Output Info */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CropIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Target Output: {croppedPixelWidth} × {croppedPixelHeight} px
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Original: {naturalWidth} × {naturalHeight} px ({((croppedPixelWidth * croppedPixelHeight) / (naturalWidth * naturalHeight) * 100).toFixed(0)}% of original area)
                </p>
              </div>

              {/* Format & Quality Picker */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Format:</span>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="image/png">PNG (Lossless)</option>
                    <option value="image/jpeg">JPG (Standard)</option>
                    <option value="image/webp">WebP (Modern Web)</option>
                  </select>
                </div>

                {outputFormat !== 'image/png' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Quality:</span>
                    <input
                      type="range"
                      min={40}
                      max={100}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-24 accent-indigo-600"
                    />
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 w-8">{quality}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="cursor-pointer text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1.5 font-medium transition-colors">
                <Upload className="w-3.5 h-3.5" /> Choose different image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleDownloadCrop}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isProcessing ? 'Processing Crop...' : 'Download Cropped Image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCropper;
