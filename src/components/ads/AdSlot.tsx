import React from 'react';
import { adsConfig } from '../../config/ads.config';

interface AdSlotProps {
  placement: 'tool-bottom' | 'sidebar' | 'banner' | 'in-content';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, className = '' }) => {
  if (!adsConfig.enabled) {
    return null;
  }

  // Prevent CLS (Cumulative Layout Shift) by providing a fixed minimum reserved height
  const getMinHeight = () => {
    switch (placement) {
      case 'tool-bottom':
        return 'min-h-[100px] md:min-h-[120px]';
      case 'sidebar':
        return 'min-h-[250px]';
      case 'banner':
        return 'min-h-[90px]';
      case 'in-content':
        return 'min-h-[120px]';
      default:
        return 'min-h-[90px]';
    }
  };

  return (
    <aside
      aria-label="Advertisement"
      className={`w-full my-6 flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-full max-w-4xl">
        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center mb-1 select-none">
          Advertisement
        </div>
        <div
          className={`w-full ${getMinHeight()} rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col items-center justify-center p-4 text-center transition-colors`}
        >
          {adsConfig.testMode ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Contextual Ad Space ({placement})
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Reserved container with zero Cumulative Layout Shift (CLS)
              </p>
            </div>
          ) : (
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client={adsConfig.client}
              data-ad-slot={adsConfig.slots.toolBottom}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          )}
        </div>
      </div>
    </aside>
  );
};
export default AdSlot;
