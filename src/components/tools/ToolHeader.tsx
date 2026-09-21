import React from 'react';
import {
  FileText,
  Hash,
  ArrowRightLeft,
  QrCode,
  Camera,
  Sliders,
  Maximize2,
  Image as ImageIcon,
  FileCode2,
  CheckCircle2,
  Key,
  Calendar,
  Percent,
  Palette,
  Heart,
  Share2,
  ShieldCheck,
  Zap,
  Video,
} from 'lucide-react';
import { ToolDefinition } from '../../types/tools';
import { useFavorites } from '../../context/FavoritesContext';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard } from '../../lib/utils';

interface ToolHeaderProps {
  tool: ToolDefinition;
}

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  Hash,
  ArrowRightLeft,
  QrCode,
  Camera,
  Sliders,
  Maximize2,
  Image: ImageIcon,
  FileCode2,
  CheckCircle2,
  Key,
  Calendar,
  Percent,
  Palette,
  Video,
};

export const ToolHeader: React.FC<ToolHeaderProps> = ({ tool }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const IconComponent = ICON_MAP[tool.icon] || FileText;
  const favorite = isFavorite(tool.id);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: tool.name,
          text: tool.description,
          url,
        });
        showToast('Shared successfully!', 'success');
        return;
      } catch (err) {
        // Fallback to copy
      }
    }
    const ok = await copyToClipboard(url);
    if (ok) showToast('Tool URL copied to clipboard!', 'success');
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-xs">
          <IconComponent className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {tool.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              100% Private (Browser-Side)
            </span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {tool.description}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 self-start md:self-center">
        <button
          onClick={() => {
            toggleFavorite(tool.id);
            showToast(favorite ? 'Removed from favorites' : 'Added to favorites!', 'info');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            favorite
              ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-current' : ''}`} />
          {favorite ? 'Saved' : 'Favorite'}
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </button>
      </div>
    </div>
  );
};
export default ToolHeader;
