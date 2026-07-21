import React, { useState, useEffect, useRef } from 'react';
import { Type, Sparkles, Droplet, Palette, Layers, SlidersHorizontal, X } from 'lucide-react';
import { ElementConfig, WidgetType } from '../types';
import { COLOR_PRESETS } from '../constants';
import {
  FONT_PRESETS,
  getStylePresetsForType, hasFontPreset,
} from '../hooks/widgetPresets';

interface WidgetStyleConfig {
  widgetType: WidgetType;
  fontPreset?: string;
  stylePreset?: string;
  onFontPresetChange?: (key: string) => void;
  onStylePresetChange?: (key: string) => void;
  // analog 专属
  isSmooth?: boolean;
  showHourNumbers?: boolean;
  onIsSmoothChange?: (v: boolean) => void;
  onShowHourNumbersChange?: (v: boolean) => void;
}

interface LayerProps {
  zIndex: number;
  allZIndexes: number[];
  onLayerChange: (z: number) => void;
}

interface ElementSettingsProps {
    isOpen: boolean;
    elementId: string;
    elementLabel: string;
    config: ElementConfig;
    onConfigChange: (config: Partial<ElementConfig>) => void;
    onClose: () => void;
    onReset: () => void;
    onDelete?: () => void;
    /** 组件样式预设（字体、展示风格等）*/
    widgetStyle?: WidgetStyleConfig;
    /** 图层排列 */
    layerProps?: LayerProps;
}

export const ElementSettings: React.FC<ElementSettingsProps> = ({
    isOpen,
    elementId: _elementId,
    elementLabel,
    config,
    onConfigChange,
    onClose,
    onReset,
    onDelete,
    widgetStyle,
    layerProps,
}) => {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [customHex, setCustomHex] = useState(
        config.customColor && !config.customColor.includes('gradient')
            ? config.customColor
            : '#ffffff'
    );

    // 外部 customColor 变更时同步（例如通过预设色选择后，自定义输入框也应更新）
    useEffect(() => {
        if (config.customColor && !config.customColor.includes('gradient')) {
            setCustomHex(config.customColor);
        }
    }, [config.customColor]);

    // ESC 键关闭弹窗
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // 焦点管理：打开时记录当前焦点并移入弹窗，关闭时恢复
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
        if (!isOpen) return;
        // 记录触发元素，弹窗打开时焦点移入弹窗容器
        previousFocusRef.current = document.activeElement as HTMLElement;
        const t = setTimeout(() => dialogRef.current?.focus(), 0);
        return () => {
            clearTimeout(t);
            // 关闭时恢复焦点到触发元素
            previousFocusRef.current?.focus();
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleColorSelect = (color: string | null) => {
        onConfigChange({ customColor: color });
    };

    const handleCustomHexChange = (hex: string) => {
        setCustomHex(hex);
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            onConfigChange({ customColor: hex });
        }
    };

    const isCustomHex = config.customColor && !config.customColor.includes('gradient') && !COLOR_PRESETS.some(p => p.value === config.customColor);

    return (
        <div
            ref={dialogRef}
            tabIndex={-1}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[1px] outline-none"
            role="dialog"
            aria-modal="true"
            aria-label={`${elementLabel} 设置`}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 shadow-[0_10px_50px_rgba(0,0,0,0.6)] flex flex-col gap-4 w-[90vw] max-w-md max-h-[85vh] overflow-y-auto scrollbar-hide"
                style={{ animation: 'modal-pop 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <style>{`@keyframes modal-pop{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider font-medium">
                        <SlidersHorizontal size={12} />
                        <span>{elementLabel} 设置</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white/6 hover:bg-white/14 text-white/50 hover:text-white transition-all"
                        title="关闭"
                        aria-label="关闭设置"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="h-[1px] bg-white/10 w-full" />

                {/* ── Widget Style Presets ── */}
                {widgetStyle && (
                  <>
                    {/* Font Presets (digital / timer only) */}
                    {hasFontPreset(widgetStyle.widgetType) && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider font-medium">
                            <Type size={12} />
                            <span>字体</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {FONT_PRESETS.map(fp => (
                            <button
                              key={fp.key}
                              onClick={() => widgetStyle.onFontPresetChange?.(fp.key)}
                              className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border transition-all active:scale-95 ${
                                (widgetStyle.fontPreset || 'default') === fp.key
                                  ? 'bg-white/14 text-white ring-1 ring-white/20 shadow-inner border-white/20'
                                  : 'bg-white/5 hover:bg-white/15 border-white/10 hover:border-white/30 text-white/60 hover:text-white'
                              }`}
                            >
                              <div
                                className="font-bold leading-tight text-sm"
                                style={{ fontFamily: fp.family || undefined }}
                              >
                                {fp.key === 'default' ? '默认' : '01:23'}
                              </div>
                              <div className="text-[9px] opacity-70">{fp.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Style Presets */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider font-medium">
                        <Sparkles size={12} />
                        <span>样式</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getStylePresetsForType(widgetStyle.widgetType).map(sp => (
                          <button
                            key={sp.key}
                            onClick={() => widgetStyle.onStylePresetChange?.(sp.key)}
                            className={`px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all border ${
                              (widgetStyle.stylePreset || '') === sp.key
                                ? 'bg-white text-black border-white'
                                : 'bg-transparent text-white/60 border-white/20 hover:border-white/50'
                            }`}
                          >
                            {sp.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Analog 专属开关 */}
                    {widgetStyle.widgetType === 'analog' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => widgetStyle.onIsSmoothChange?.(!widgetStyle.isSmooth)}
                          className={`py-2 rounded-xl text-xs transition-all ${
                            widgetStyle.isSmooth
                              ? 'bg-white/14 text-white ring-1 ring-white/20 shadow-inner'
                              : 'text-white/40 hover:text-white/75 hover:bg-white/8'
                          }`}
                        >
                          平滑扫秒
                        </button>
                        <button
                          onClick={() => widgetStyle.onShowHourNumbersChange?.(!widgetStyle.showHourNumbers)}
                          className={`py-2 rounded-xl text-xs transition-all ${
                            widgetStyle.showHourNumbers
                              ? 'bg-white/14 text-white ring-1 ring-white/20 shadow-inner'
                              : 'text-white/40 hover:text-white/75 hover:bg-white/8'
                          }`}
                        >
                          数字标记
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* ── 透明度 ── */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider font-medium">
                        <Droplet size={12} />
                        <span>透明度</span>
                    </div>
                    <span className="text-[11px] text-white/65 font-mono tabular-nums">{((config.opacity ?? 1) * 100).toFixed(0)}%</span>
                  </div>
                  <input type="range" min={0} max={1} step={0.05} value={config.opacity ?? 1}
                    onChange={e => onConfigChange({ opacity: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div className="h-[1px] bg-white/10 w-full" />

                {/* ── 颜色 ── */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider font-medium">
                        <Palette size={12} />
                        <span>颜色</span>
                    </div>

                    {/* Preset Colors */}
                    <div className="flex flex-wrap gap-2">
                        {/* Default/Theme Color */}
                        <button
                            onClick={() => handleColorSelect(null)}
                            className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center
                ${config.customColor === null ? 'border-white scale-110' : 'border-white/30 hover:border-white/60'}
              `}
                            title="默认主题颜色"
                        >
                            <span className="text-xs text-white/70">默认</span>
                        </button>

                        {/* Preset Buttons */}
                        {COLOR_PRESETS.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => handleColorSelect(preset.value)}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110
                  ${config.customColor === preset.value ? 'border-white scale-110' : 'border-transparent'}
                `}
                                style={{
                                    background: preset.value
                                }}
                                title={preset.label}
                            />
                        ))}

                        {/* Custom Color Button */}
                        <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center
                ${isCustomHex ? 'border-white' : 'border-white/30 hover:border-white/60'}
              `}
                            style={{
                                background: isCustomHex ? config.customColor || '#fff' : 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)'
                            }}
                            title="自定义颜色"
                        >
                            {!isCustomHex && <span className="text-xs">+</span>}
                        </button>
                    </div>

                    {/* Custom Hex Input */}
                    {showColorPicker && (
                        <div className="flex gap-2 items-center p-3 bg-white/5 rounded-xl">
                            <input
                                type="color"
                                value={customHex}
                                onChange={(e) => handleCustomHexChange(e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={customHex}
                                onChange={(e) => handleCustomHexChange(e.target.value)}
                                placeholder="#RRGGBB"
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg text-xs text-white px-2 py-1.5 font-mono focus:outline-none focus:border-white/30"
                            />
                        </div>
                    )}
                </div>

                {/* ── 图层排列 ── */}
                {layerProps && (() => {
                  const maxZ = Math.max(...layerProps.allZIndexes);
                  const minZ = Math.min(...layerProps.allZIndexes);
                  const cur  = layerProps.zIndex;
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider font-medium">
                            <Layers size={12} />
                            <span>图层排列</span>
                        </div>
                        <span className="text-[11px] text-white/30 font-mono">当前层: {cur}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: '移到底部', disabled: cur <= minZ, z: () => Math.max(1, minZ - 1) },
                          { label: '下移一层', disabled: cur <= 1,    z: () => Math.max(1, cur - 1)  },
                          { label: '上移一层', disabled: false,        z: () => cur + 1               },
                          { label: '移到顶部', disabled: cur >= maxZ,  z: () => maxZ + 1              },
                        ].map(({ label, disabled, z }) => (
                          <button
                            key={label}
                            onClick={() => layerProps.onLayerChange(z())}
                            disabled={disabled}
                            className={`py-2 rounded-xl text-[11px] border transition-all ${
                              disabled
                                ? 'bg-white/3 text-white/25 border-white/8 cursor-not-allowed'
                                : 'bg-white/5 text-white/70 border-white/15 hover:bg-white/15 hover:text-white hover:border-white/30'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="h-[1px] bg-white/10 w-full" />

                {/* ── Action Buttons ── */}
                <div className="flex gap-2">
                    {onDelete && (
                        <button
                            onClick={() => { onDelete(); onClose(); }}
                            className="px-3.5 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/20 hover:border-red-500/40 text-sm font-medium transition-all active:scale-95"
                            title="删除此组件"
                        >删除</button>
                    )}
                    <button
                        onClick={onReset}
                        className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-sm font-medium transition-all active:scale-95"
                    >重置</button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 shadow-lg shadow-purple-500/20"
                        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                    >完成</button>
                </div>
            </div>
        </div>
    );
};
