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
  Globe,
  Search,
  Link,
  FileCode,
  FileSpreadsheet,
  Heart,
  ArrowUpRight,
  Activity,
  Tag,
  Landmark,
  Calculator,
  TrendingUp,
  PiggyBank,
  Scale,
  BookOpen,
  Clock,
  Timer,
  Crop,
  Pipette,
  Share2,
  FileImage,
  LayoutGrid,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Fingerprint,
  Shuffle,
  Binary,
  KeyRound,
  PenTool,
  SpellCheck,
  Bot,
  UserCheck,
  FileCheck2,
  Code2,
  Eraser,
  Video,
} from 'lucide-react';
import { ToolDefinition } from '../../types/tools';
import { useFavorites } from '../../context/FavoritesContext';
import { useToast } from '../../context/ToastContext';

interface ToolCardProps {
  tool: ToolDefinition;
  onSelect?: (slug: string) => void;
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
  ImageIcon,
  FileCode2,
  CheckCircle2,
  Key,
  Calendar,
  Percent,
  Palette,
  Globe,
  Search,
  Link,
  FileCode,
  FileSpreadsheet,
  Activity,
  Tag,
  Landmark,
  Calculator,
  TrendingUp,
  PiggyBank,
  Scale,
  BookOpen,
  Clock,
  Timer,
  Crop,
  Pipette,
  Share2,
  FileImage,
  LayoutGrid,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Fingerprint,
  Shuffle,
  Binary,
  KeyRound,
  PenTool,
  SpellCheck,
  Bot,
  UserCheck,
  FileCheck2,
  Code2,
  Eraser,
  Video,
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const IconComponent = ICON_MAP[tool.icon] || FileText;
  const favorite = isFavorite(tool.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(tool.id);
    showToast(favorite ? `Removed from favorites` : `Added ${tool.name} to favorites!`, 'info');
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      e.preventDefault();
      onSelect(tool.slug);
    }
  };

  return (
    <a
      href={`#/tools/${tool.slug}`}
      onClick={handleClick}
      id={`tool-card-${tool.slug}`}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-md transition-all duration-200"
    >
      <div>
        {/* Top bar with icon and favorite */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-200">
            <IconComponent className="w-5 h-5" />
          </div>

          <button
            onClick={handleFavoriteClick}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-2 rounded-lg transition-colors ${
              favorite
                ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                : 'text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
          {tool.name}
          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-indigo-600 dark:text-indigo-400" />
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* Footer tags */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
        <span className="capitalize font-semibold text-slate-500 dark:text-slate-400">
          {tool.category}
        </span>
        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          100% Client-Side
        </span>
      </div>
    </a>
  );
};
export default ToolCard;
