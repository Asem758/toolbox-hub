import React, { useState, useMemo } from 'react';
import { Copy, RefreshCw, Palette, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard } from '../../lib/utils';

export const ColorConverter: React.FC = () => {
  const [hex, setHex] = useState<string>('#6366f1');
  const { showToast } = useToast();

  const colorData = useMemo(() => {
    let cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }

    let r = 0, g = 0, b = 0;
    if (/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    }

    // RGB to HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
        case gNorm: h = (bNorm - rNorm) / d + 2; break;
        case bNorm: h = (rNorm - gNorm) / d + 4; break;
      }
      h /= 6;
    }

    const hDeg = Math.round(h * 360);
    const sPct = Math.round(s * 100);
    const lPct = Math.round(l * 100);

    // CMYK
    let c = 0, m = 0, y = 0, k = 1 - max;
    if (1 - k > 0) {
      c = (1 - rNorm - k) / (1 - k);
      m = (1 - gNorm - k) / (1 - k);
      y = (1 - bNorm - k) / (1 - k);
    }

    // Contrast ratio against white (255,255,255) and black (0,0,0)
    const getLuminance = (r: number, g: number, b: number) => {
      const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const lum = getLuminance(r, g, b);
    const contrastWhite = (1 + 0.05) / (lum + 0.05);
    const contrastBlack = (lum + 0.05) / (0 + 0.05);

    // Generate shades
    const shades = [10, 25, 40, 50, 60, 75, 90].map((light) => {
      return `hsl(${hDeg}, ${sPct}%, ${light}%)`;
    });

    return {
      hex: `#${cleanHex.toUpperCase()}`,
      rgb: `rgb(${r}, ${g}, ${b})`,
      rgba: `rgba(${r}, ${g}, ${b}, 1)`,
      hsl: `hsl(${hDeg}, ${sPct}%, ${lPct}%)`,
      cmyk: `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`,
      r, g, b, hDeg, sPct, lPct,
      contrastWhite: contrastWhite.toFixed(2),
      contrastBlack: contrastBlack.toFixed(2),
      shades,
    };
  }, [hex]);

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) showToast(`Copied ${label} (${text})!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Color Preview & Picker */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Swatch & Input */}
          <div className="md:col-span-4 flex flex-col items-center justify-center space-y-3">
            <div
              className="w-32 h-32 rounded-3xl shadow-md border-4 border-white dark:border-slate-800 relative overflow-hidden transition-transform hover:scale-105"
              style={{ backgroundColor: colorData.hex }}
            >
              <input
                type="color"
                value={colorData.hex}
                onChange={(e) => setHex(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs font-semibold text-slate-500">Click swatch to pick color</span>
          </div>

          {/* Hex Input & Contrast */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                HEX Color Code
              </label>
              <input
                type="text"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                placeholder="#6366F1"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-base font-bold uppercase focus:outline-indigo-500"
              />
            </div>

            {/* Contrast Checkers */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">vs Pure White</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{colorData.contrastWhite} : 1</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${Number(colorData.contrastWhite) >= 4.5 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {Number(colorData.contrastWhite) >= 4.5 ? 'AA Pass' : 'Fail'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">vs Pure Black</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{colorData.contrastBlack} : 1</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${Number(colorData.contrastBlack) >= 4.5 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {Number(colorData.contrastBlack) >= 4.5 ? 'AA Pass' : 'Fail'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Outputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'HEX', val: colorData.hex },
          { label: 'RGB', val: colorData.rgb },
          { label: 'HSL', val: colorData.hsl },
          { label: 'CMYK', val: colorData.cmyk },
        ].map((item, idx) => (
          <div
            key={idx}
            onClick={() => handleCopy(item.val, item.label)}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500 cursor-pointer transition-all group flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">{item.label}</span>
              <p className="font-mono text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">{item.val}</p>
            </div>
            <Copy className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
        ))}
      </div>

      {/* Shades / Tints Palette */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Harmonious Tints & Shades
        </h4>
        <div className="grid grid-cols-7 gap-2 h-14">
          {colorData.shades.map((shade, i) => (
            <div
              key={i}
              onClick={() => handleCopy(shade, `Shade ${i + 1}`)}
              style={{ backgroundColor: shade }}
              title={`Click to copy: ${shade}`}
              className="rounded-xl cursor-pointer shadow-xs hover:scale-105 transition-transform"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default ColorConverter;
