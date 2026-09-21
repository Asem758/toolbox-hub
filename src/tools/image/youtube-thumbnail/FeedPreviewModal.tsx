import React, { useState } from 'react';
import {
  Smartphone,
  Tv,
  Search,
  ListVideo,
  Eye,
  CheckCircle,
  X,
  Share2,
  Clock,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import { QualityAuditScore } from './types';

interface FeedPreviewModalProps {
  canvasDataUrl: string;
  videoTitle: string;
  channelName: string;
  timestamp: string;
  auditScore: QualityAuditScore;
  onClose: () => void;
}

export const FeedPreviewModal: React.FC<FeedPreviewModalProps> = ({
  canvasDataUrl,
  videoTitle,
  channelName,
  timestamp,
  auditScore,
  onClose,
}) => {
  const [activeDevice, setActiveDevice] = useState<'mobile' | 'desktop' | 'search' | 'sidebar'>('mobile');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-lg">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black">YouTube Feed Simulator & Mobile Audit</h2>
              <p className="text-xs text-slate-400">
                Preview how your thumbnail renders across real YouTube environments
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Device Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
          {[
            { id: 'mobile', label: 'Mobile Home Feed', icon: Smartphone },
            { id: 'desktop', label: 'Desktop 3-Column Grid', icon: Tv },
            { id: 'search', label: 'Search Results Page', icon: Search },
            { id: 'sidebar', label: 'Sidebar Up Next', icon: ListVideo },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDevice(tab.id as any)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeDevice === tab.id
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Simulation Environment */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex justify-center">
          {/* Mobile Feed View */}
          {activeDevice === 'mobile' && (
            <div className="w-full max-w-sm bg-[#0f0f0f] rounded-2xl border border-slate-800 p-3 space-y-3 shadow-2xl">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                <img src={canvasDataUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[11px] font-bold text-white">
                  {timestamp || '14:20'}
                </span>
              </div>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-red-600 flex-shrink-0 flex items-center justify-center font-bold text-xs">
                  {channelName.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                    {videoTitle || 'How to Build an AI Automation System in 2026 (Full Step by Step Guide)'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {channelName} • 142K views • 2 hours ago
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Desktop View */}
          {activeDevice === 'desktop' && (
            <div className="w-full max-w-md bg-[#0f0f0f] rounded-2xl border border-slate-800 p-4 space-y-3">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                <img src={canvasDataUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[11px] font-bold text-white">
                  {timestamp || '14:20'}
                </span>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600 flex-shrink-0 flex items-center justify-center font-bold text-sm">
                  {channelName.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white line-clamp-2 leading-tight">
                    {videoTitle || 'How to Build an AI Automation System in 2026 (Full Step by Step Guide)'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {channelName} • 250K views • 1 day ago
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search Result View */}
          {activeDevice === 'search' && (
            <div className="w-full max-w-2xl bg-[#0f0f0f] rounded-2xl border border-slate-800 p-4 flex flex-col sm:flex-row gap-4">
              <div className="sm:w-72 aspect-video rounded-xl overflow-hidden bg-black flex-shrink-0 relative">
                <img src={canvasDataUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[11px] font-bold text-white">
                  {timestamp || '14:20'}
                </span>
              </div>
              <div className="flex-1 space-y-1.5">
                <h4 className="text-sm font-bold text-white line-clamp-2">
                  {videoTitle || 'How to Build an AI Automation System in 2026 (Full Step by Step Guide)'}
                </h4>
                <p className="text-xs text-slate-400">
                  {channelName} • 85K views • 3 days ago
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300">
                    4K Ultra HD
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300">
                    CC
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 pt-1">
                  Complete tutorial showing how to build and scale modern AI applications with zero code in under 30 minutes...
                </p>
              </div>
            </div>
          )}

          {/* Sidebar Up Next View */}
          {activeDevice === 'sidebar' && (
            <div className="w-full max-w-md bg-[#0f0f0f] rounded-2xl border border-slate-800 p-4 flex gap-3">
              <div className="w-40 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 relative">
                <img src={canvasDataUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[10px] font-bold text-white">
                  {timestamp || '14:20'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                  {videoTitle || 'How to Build an AI Automation System in 2026'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  {channelName}
                </p>
                <p className="text-[11px] text-slate-500">
                  420K views • 1 week ago
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Audit Score Card */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-xs font-bold text-slate-400">Mobile Readability</div>
            <div className="text-xl font-black text-emerald-400 mt-1">{auditScore.mobileReadability}%</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-xs font-bold text-slate-400">Visual Impact</div>
            <div className="text-xl font-black text-amber-400 mt-1">{auditScore.visualImpact}%</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-xs font-bold text-slate-400">Rule of Thirds</div>
            <div className="text-xl font-black text-cyan-400 mt-1">{auditScore.composition}%</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-xs font-bold text-slate-400">Overall Score</div>
            <div className="text-xl font-black text-red-400 mt-1">{auditScore.overallScore}/100</div>
          </div>
        </div>
      </div>
    </div>
  );
};
