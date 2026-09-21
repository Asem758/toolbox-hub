import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Download,
  Share2,
  Sparkles,
  Sliders,
  Check,
  LayoutGrid,
  CheckCircle2,
  RefreshCw,
  Layers,
  Crop,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { downloadBlob } from '../../lib/utils';

interface SocialPreset {
  id: string;
  platform: 'instagram' | 'youtube' | 'twitter' | 'facebook' | 'linkedin' | 'tiktok' | 'pinterest';
  platformName: string;
  name: string;
  width: number;
  height: number;
  aspectRatioLabel: string;
  badge: string;
  description: string;
}

const SOCIAL_PRESETS: SocialPreset[] = [
  // Instagram
  {
    id: 'ig-square',
    platform: 'instagram',
    platformName: 'Instagram',
    name: 'Square Feed Post',
    width: 1080,
    height: 1080,
    aspectRatioLabel: '1:1',
    badge: 'Feed',
    description: 'Standard square feed post format',
  },
  {
    id: 'ig-portrait',
    platform: 'instagram',
    platformName: 'Instagram',
    name: 'Portrait Feed Post',
    width: 1080,
    height: 1350,
    aspectRatioLabel: '4:5',
    badge: 'Popular',
    description: 'Takes up maximum vertical feed screen space',
  },
  {
    id: 'ig-story',
    platform: 'instagram',
    platformName: 'Instagram',
    name: 'Story & Reels',
    width: 1080,
    height: 1920,
    aspectRatioLabel: '9:16',
    badge: 'Stories',
    description: 'Full-screen 9:16 vertical stories and reels',
  },
  {
    id: 'ig-landscape',
    platform: 'instagram',
    platformName: 'Instagram',
    name: 'Landscape Post',
    width: 1080,
    height: 566,
    aspectRatioLabel: '1.91:1',
    badge: 'Feed',
    description: 'Horizontal panoramic photo feed post',
  },
  {
    id: 'ig-profile',
    platform: 'instagram',
    platformName: 'Instagram',
    name: 'Profile Avatar',
    width: 320,
    height: 320,
    aspectRatioLabel: '1:1',
    badge: 'Profile',
    description: 'High-resolution circular profile photo',
  },

  // YouTube
  {
    id: 'yt-thumb',
    platform: 'youtube',
    platformName: 'YouTube',
    name: 'Video Thumbnail',
    width: 1280,
    height: 720,
    aspectRatioLabel: '16:9',
    badge: 'Thumb',
    description: 'Standard 720p HD video cover thumbnail',
  },
  {
    id: 'yt-banner',
    platform: 'youtube',
    platformName: 'YouTube',
    name: 'Channel Banner',
    width: 2560,
    height: 1440,
    aspectRatioLabel: '16:9',
    badge: 'Header',
    description: 'Full TV/Desktop/Mobile responsive channel art',
  },
  {
    id: 'yt-icon',
    platform: 'youtube',
    platformName: 'YouTube',
    name: 'Channel Icon / Avatar',
    width: 800,
    height: 800,
    aspectRatioLabel: '1:1',
    badge: 'Avatar',
    description: 'Channel branding avatar and logo',
  },

  // Twitter / X
  {
    id: 'x-post',
    platform: 'twitter',
    platformName: 'Twitter / X',
    name: 'In-Stream Post Image',
    width: 1600,
    height: 900,
    aspectRatioLabel: '16:9',
    badge: 'Tweet',
    description: 'Crisp landscape post graphic for desktop and mobile feeds',
  },
  {
    id: 'x-header',
    platform: 'twitter',
    platformName: 'Twitter / X',
    name: 'Header Banner',
    width: 1500,
    height: 500,
    aspectRatioLabel: '3:1',
    badge: 'Banner',
    description: 'Top profile header cover graphic',
  },
  {
    id: 'x-avatar',
    platform: 'twitter',
    platformName: 'Twitter / X',
    name: 'Profile Picture',
    width: 400,
    height: 400,
    aspectRatioLabel: '1:1',
    badge: 'Avatar',
    description: 'Standard square profile picture',
  },

  // Facebook
  {
    id: 'fb-post',
    platform: 'facebook',
    platformName: 'Facebook',
    name: 'Feed Share Post',
    width: 1200,
    height: 630,
    aspectRatioLabel: '1.91:1',
    badge: 'Post',
    description: 'Optimal size for newsfeed posts and link shares',
  },
  {
    id: 'fb-cover',
    platform: 'facebook',
    platformName: 'Facebook',
    name: 'Page Cover Photo',
    width: 820,
    height: 312,
    aspectRatioLabel: '2.6:1',
    badge: 'Cover',
    description: 'Desktop & mobile page banner banner photo',
  },
  {
    id: 'fb-story',
    platform: 'facebook',
    platformName: 'Facebook',
    name: 'Facebook Story',
    width: 1080,
    height: 1920,
    aspectRatioLabel: '9:16',
    badge: 'Story',
    description: 'Full-screen mobile story post',
  },
  {
    id: 'fb-event',
    platform: 'facebook',
    platformName: 'Facebook',
    name: 'Event Cover Banner',
    width: 1920,
    height: 1005,
    aspectRatioLabel: '1.91:1',
    badge: 'Event',
    description: 'High-res header for Facebook events',
  },

  // LinkedIn
  {
    id: 'li-post',
    platform: 'linkedin',
    platformName: 'LinkedIn',
    name: 'Feed Post Graphic',
    width: 1200,
    height: 627,
    aspectRatioLabel: '1.91:1',
    badge: 'Post',
    description: 'Standard single post or article link thumbnail',
  },
  {
    id: 'li-banner',
    platform: 'linkedin',
    platformName: 'LinkedIn',
    name: 'Personal Profile Banner',
    width: 1584,
    height: 396,
    aspectRatioLabel: '4:1',
    badge: 'Profile',
    description: 'Header background banner for personal profiles',
  },
  {
    id: 'li-company',
    platform: 'linkedin',
    platformName: 'LinkedIn',
    name: 'Company Page Cover',
    width: 1128,
    height: 191,
    aspectRatioLabel: '5.9:1',
    badge: 'Company',
    description: 'Company organization page header',
  },

  // TikTok
  {
    id: 'tt-video',
    platform: 'tiktok',
    platformName: 'TikTok',
    name: 'Video & Story Cover',
    width: 1080,
    height: 1920,
    aspectRatioLabel: '9:16',
    badge: 'Cover',
    description: 'Standard 9:16 vertical TikTok thumbnail',
  },
  {
    id: 'tt-avatar',
    platform: 'tiktok',
    platformName: 'TikTok',
    name: 'Profile Picture',
    width: 200,
    height: 200,
    aspectRatioLabel: '1:1',
    badge: 'Avatar',
    description: 'Circular TikTok profile icon',
  },

  // Pinterest
  {
    id: 'pin-standard',
    platform: 'pinterest',
    platformName: 'Pinterest',
    name: 'Standard Pin',
    width: 1000,
    height: 1500,
    aspectRatioLabel: '2:3',
    badge: 'Best Pin',
    description: 'Recommended 2:3 vertical aspect ratio pin',
  },
  {
    id: 'pin-square',
    platform: 'pinterest',
    platformName: 'Pinterest',
    name: 'Square Pin',
    width: 1000,
    height: 1000,
    aspectRatioLabel: '1:1',
    badge: 'Square',
    description: 'Square pin format for carousel listings',
  },
];

type FitMode = 'cover' | 'contain-blur' | 'contain-solid' | 'stretch';

export const SocialMediaResizer: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('social-image');
  const [naturalWidth, setNaturalWidth] = useState<number>(0);
  const [naturalHeight, setNaturalHeight] = useState<number>(0);

  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedPreset, setSelectedPreset] = useState<SocialPreset>(SOCIAL_PRESETS[0]);
  const [fitMode, setFitMode] = useState<FitMode>('cover');
  const [solidBgColor, setSolidBgColor] = useState<string>('#FFFFFF');
  const [outputFormat, setOutputFormat] = useState<string>('image/jpeg');
  const [quality, setQuality] = useState<number>(92);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const { showToast } = useToast();

  const handleImageFile = (f: File) => {
    if (!f.type.startsWith('image/')) {
      showToast('Please upload an image file.', 'error');
      return;
    }
    setFileName(f.name.replace(/\.[^/.]+$/, ''));
    const url = URL.createObjectURL(f);
    setImageSrc(url);

    const img = new Image();
    img.onload = () => {
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      showToast(`Loaded ${f.name} (${img.naturalWidth}x${img.naturalHeight}px)`, 'success');
    };
    img.src = url;
  };

  const handleSample = () => {
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 1600;
    sampleCanvas.height = 1200;
    const ctx = sampleCanvas.getContext('2d');
    if (!ctx) return;

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 1600, 1200);
    grad.addColorStop(0, '#4f46e5');
    grad.addColorStop(0.5, '#7c3aed');
    grad.addColorStop(1, '#db2777');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1600, 1200);

    // Modern branding text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Social Media Master', 800, 560);
    ctx.font = '36px sans-serif';
    ctx.fillText('Instant resize for IG, YouTube, X, FB & LinkedIn', 800, 640);

    sampleCanvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'sample-social.jpg', { type: 'image/jpeg' });
        handleImageFile(file);
      }
    });
  };

  // Render a specific preset onto a canvas and return the blob
  const generatePresetBlob = (preset: SocialPreset, mode: FitMode, bg: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!imageSrc) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = preset.width;
        canvas.height = preset.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const targetW = preset.width;
        const targetH = preset.height;
        const srcW = img.naturalWidth;
        const srcH = img.naturalHeight;

        if (mode === 'stretch') {
          ctx.drawImage(img, 0, 0, targetW, targetH);
        } else if (mode === 'cover') {
          // Scale to cover completely, centering the crop
          const scale = Math.max(targetW / srcW, targetH / srcH);
          const scaledW = srcW * scale;
          const scaledH = srcH * scale;
          const offsetX = (targetW - scaledW) / 2;
          const offsetY = (targetH - scaledH) / 2;
          ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
        } else if (mode === 'contain-blur') {
          // Draw blurred background
          ctx.save();
          ctx.filter = 'blur(24px) brightness(0.7)';
          // Expand background slightly to avoid white blur bleed at borders
          ctx.drawImage(img, -20, -20, targetW + 40, targetH + 40);
          ctx.restore();

          // Draw contained foreground
          const scale = Math.min(targetW / srcW, targetH / srcH);
          const scaledW = srcW * scale;
          const scaledH = srcH * scale;
          const offsetX = (targetW - scaledW) / 2;
          const offsetY = (targetH - scaledH) / 2;
          ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
        } else if (mode === 'contain-solid') {
          // Solid background letterbox
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, targetW, targetH);

          const scale = Math.min(targetW / srcW, targetH / srcH);
          const scaledW = srcW * scale;
          const scaledH = srcH * scale;
          const offsetX = (targetW - scaledW) / 2;
          const offsetY = (targetH - scaledH) / 2;
          ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
        }

        canvas.toBlob(
          (blob) => resolve(blob),
          outputFormat,
          quality / 100
        );
      };
      img.src = imageSrc;
    });
  };

  const handleDownloadSingle = async (preset: SocialPreset) => {
    setIsProcessing(true);
    const blob = await generatePresetBlob(preset, fitMode, solidBgColor);
    if (blob) {
      const ext = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/webp' ? 'webp' : 'jpg';
      const cleanPlatform = preset.platformName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const cleanName = preset.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      downloadBlob(blob, `${fileName}-${cleanPlatform}-${cleanName}-${preset.width}x${preset.height}.${ext}`);
      showToast(`Downloaded ${preset.name} (${preset.width}x${preset.height})!`, 'success');
    }
    setIsProcessing(false);
  };

  const handleDownloadPlatformBatch = async () => {
    const list = filteredPresets;
    if (list.length === 0) return;

    setIsProcessing(true);
    showToast(`Generating ${list.length} resized formats...`, 'info');

    for (let i = 0; i < list.length; i++) {
      const preset = list[i];
      const blob = await generatePresetBlob(preset, fitMode, solidBgColor);
      if (blob) {
        const ext = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/webp' ? 'webp' : 'jpg';
        const cleanPlatform = preset.platformName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const cleanName = preset.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        downloadBlob(blob, `${fileName}-${cleanPlatform}-${cleanName}-${preset.width}x${preset.height}.${ext}`);
      }
      // Small pause between downloads to let browser process
      await new Promise((r) => setTimeout(r, 200));
    }

    setIsProcessing(false);
    showToast(`Downloaded all ${list.length} social formats!`, 'success');
  };

  const filteredPresets = selectedPlatform === 'all'
    ? SOCIAL_PRESETS
    : SOCIAL_PRESETS.filter((p) => p.platform === selectedPlatform);

  return (
    <div className="space-y-6">
      {/* Upload Box if no image */}
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
            <Share2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Upload Image for Social Media Resizing
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Automatically resize images for Instagram, YouTube, X/Twitter, Facebook, LinkedIn, TikTok, and Pinterest with smart auto-cropping and blur background fill.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm inline-flex items-center gap-2">
              <Upload className="w-4 h-4" /> Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                className="hidden"
              />
            </label>
            <button
              onClick={handleSample}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" /> Use Sample Image
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Controls: Fit Mode & Format Options */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Fit Mode Selector */}
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Image Fit Mode:
                </span>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {[
                    { mode: 'cover' as FitMode, label: 'Smart Fill & Crop (Cover)' },
                    { mode: 'contain-blur' as FitMode, label: 'Fit + Blur Background' },
                    { mode: 'contain-solid' as FitMode, label: 'Fit + Solid Letterbox' },
                    { mode: 'stretch' as FitMode, label: 'Stretch' },
                  ].map((item) => (
                    <button
                      key={item.mode}
                      onClick={() => setFitMode(item.mode)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        fitMode === item.mode
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}

                  {fitMode === 'contain-solid' && (
                    <input
                      type="color"
                      value={solidBgColor}
                      onChange={(e) => setSolidBgColor(e.target.value)}
                      className="w-7 h-7 rounded-md cursor-pointer border border-slate-300 ml-1"
                      title="Letterbox color"
                    />
                  )}
                </div>
              </div>

              {/* Format & Quality */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Format:</span>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold outline-none"
                  >
                    <option value="image/jpeg">JPG (Standard Web)</option>
                    <option value="image/png">PNG (Lossless)</option>
                    <option value="image/webp">WebP (Optimized)</option>
                  </select>
                </div>

                <button
                  onClick={handleDownloadPlatformBatch}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download All {selectedPlatform === 'all' ? 'Presets' : selectedPlatform.toUpperCase()} ({filteredPresets.length})
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Original: <strong>{naturalWidth} × {naturalHeight} px</strong></span>
              <label className="cursor-pointer text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" /> Change Source Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Platform Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'All Platforms' },
              { id: 'instagram', label: 'Instagram' },
              { id: 'youtube', label: 'YouTube' },
              { id: 'twitter', label: 'Twitter / X' },
              { id: 'facebook', label: 'Facebook' },
              { id: 'linkedin', label: 'LinkedIn' },
              { id: 'tiktok', label: 'TikTok' },
              { id: 'pinterest', label: 'Pinterest' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedPlatform(tab.id)}
                className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedPlatform === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPresets.map((preset) => (
              <div
                key={preset.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {preset.platformName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                      {preset.aspectRatioLabel}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {preset.name}
                  </h4>
                  <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                    {preset.width} × {preset.height} px
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {preset.description}
                  </p>
                </div>

                <button
                  onClick={() => handleDownloadSingle(preset)}
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download ({preset.width}×{preset.height})
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaResizer;
