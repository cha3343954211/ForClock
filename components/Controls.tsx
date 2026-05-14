
import React, { useRef, useState } from 'react';
import {
  Maximize,
  Type,
  Clock,
  Sparkles,
  Palette,
  Image as ImageIcon,
  X,
  Snowflake,
  Camera,
  CameraOff,
  RefreshCcw,
  RotateCcw,
  Play,
  Pause,
  Timer,
  TimerOff,
  LayoutTemplate,
  Activity,
  FoldVertical,
  Bot,
  Settings2,
  Key,
  Link as LinkIcon,
  Cpu,
  ChevronDown,
  ChevronUp,
  Quote,
  AlarmClock
} from 'lucide-react';
import { ClockMode, ParticleMode, AIConfig, AIProvider } from '../types';
import { THEMES, COLOR_PRESETS } from '../constants';
import { useSettingsContext } from '../contexts/SettingsContext';

/** Controls 现在只需要 2 个外部 props（回调需要在 App 层执行的逻辑） */
interface ControlsProps {
  onGenerateWisdom: () => void;
  onUploadBackground: (file: File) => void;
}

export const Controls: React.FC<ControlsProps> = ({ onGenerateWisdom, onUploadBackground }) => {
  const { settings, layoutCtx, timer, isGeneratingWisdom, controlsVisible, setControlsVisible } = useSettingsContext();
  const { layout, dragSensitivity, setDragSensitivity, resetLayout, setLayerOrder } = layoutCtx;

  const {
    themeId, clockMode, particleMode, showSeconds, use24Hour, isSmooth, isFlip,
    showHourNumbers, isCameraEnabled, customBackground, customColor,
    showWisdom, aiConfig,
    setThemeId, setClockMode, setParticleMode,
    toggleSeconds, toggle24Hour, toggleSmooth, toggleFlip, toggleHourNumbers,
    toggleCamera, toggleWisdom, clearBackground, setAiConfig,
  } = settings;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAISettings, setShowAISettings] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadBackground(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleAIConfigChange = (key: keyof AIConfig, value: string) => {
    setAiConfig({ ...aiConfig, [key]: value });
  };

  const handleProviderChange = (provider: AIProvider) => {
    const defaults: Record<string, { baseUrl: string; model: string }> = {
      modelscope: { baseUrl: 'https://api-inference.modelscope.cn/v1', model: 'qwen-turbo' },
      gemini:     { baseUrl: '', model: 'gemini-3-flash-preview' },
    };
    const d = defaults[provider] ?? { baseUrl: aiConfig.baseUrl, model: aiConfig.model };
    setAiConfig({ ...aiConfig, provider, baseUrl: d.baseUrl, model: d.model });
  };

  const isCustomHex = customColor && !customColor.includes('gradient') && !COLOR_PRESETS.some(p => p.value === customColor);

  return (
    <div
      className={`fixed top-12 left-1/2 -translate-x-1/2 p-4 flex flex-col items-center justify-start transition-all duration-500 z-50 ${controlsVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-8 pointer-events-none'}`}
    >
      <div className="bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 shadow-[0_10px_50px_rgba(0,0,0,0.6)] flex flex-col gap-4 w-[90vw] max-w-lg transform transition-transform duration-300 max-h-[85vh] overflow-y-auto scrollbar-hide">

        {/* Top Row: Main Toggles */}
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2">
            <button
              onClick={() => setClockMode(ClockMode.DIGITAL)}
              className={`p-2.5 rounded-lg transition-all ${clockMode === ClockMode.DIGITAL ? 'bg-white/20 text-white shadow-inner' : 'text-white/50 hover:bg-white/10'}`}
              title="Digital Mode"
            >
              <Type size={18} />
            </button>
            <button
              onClick={() => setClockMode(ClockMode.ANALOG)}
              className={`p-2.5 rounded-lg transition-all ${clockMode === ClockMode.ANALOG ? 'bg-white/20 text-white shadow-inner' : 'text-white/50 hover:bg-white/10'}`}
              title="Analog Mode"
            >
              <Clock size={18} />
            </button>
            <button
              onClick={() => setClockMode(ClockMode.DUAL)}
              className={`p-2.5 rounded-lg transition-all ${clockMode === ClockMode.DUAL ? 'bg-white/20 text-white shadow-inner' : 'text-white/50 hover:bg-white/10'}`}
              title="Dual Mode"
            >
              <LayoutTemplate size={18} />
            </button>
          </div>

          <div className="flex gap-2 items-center">
            {/* Smooth Toggle (Analog/Dual) */}
            {(clockMode === ClockMode.ANALOG || clockMode === ClockMode.DUAL) && (
              <button
                onClick={toggleSmooth}
                className={`p-2 transition-all rounded-lg ${isSmooth ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                title={isSmooth ? "Disable Smooth Sweep" : "Enable Smooth Sweep"}
              >
                <Activity size={18} />
              </button>
            )}

            {/* Hour Numbers Toggle (Analog/Dual) */}
            {(clockMode === ClockMode.ANALOG || clockMode === ClockMode.DUAL) && (
              <button
                onClick={toggleHourNumbers}
                className={`p-2 transition-all rounded-lg ${showHourNumbers ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                title={showHourNumbers ? "隐藏时刻数字" : "显示时刻数字 (12/3/6/9)"}
              >
                <Clock size={18} />
              </button>
            )}

            {/* Flip Toggle (Digital/Dual) */}
            {(clockMode === ClockMode.DIGITAL || clockMode === ClockMode.DUAL) && (
              <button
                onClick={toggleFlip}
                className={`p-2 transition-all rounded-lg ${isFlip ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                title={isFlip ? "Disable Flip Animation" : "Enable Flip Animation"}
              >
                <FoldVertical size={18} />
              </button>
            )}

            {/* Seconds Toggle */}
            <button
              onClick={toggleSeconds}
              className={`p-2 transition-all rounded-lg ${showSeconds ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
              title={showSeconds ? "Hide Seconds" : "Show Seconds"}
            >
              {showSeconds ? <Timer size={18} /> : <TimerOff size={18} />}
            </button>

            {/* 24H / 12H Toggle */}
            <button
              onClick={toggle24Hour}
              className={`p-2 transition-all rounded-lg text-[11px] font-mono font-bold leading-none ${use24Hour ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
              title={use24Hour ? "切换到 12 小时制" : "切换到 24 小时制"}
            >
              {use24Hour ? '24H' : '12H'}
            </button>

            {/* Custom Background Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {customBackground ? (
              <button
                onClick={clearBackground}
                className="p-2 text-red-300 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors mr-1"
                title="Remove Custom Background"
              >
                <X size={18} />
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-white/50 hover:text-white transition-colors mr-1"
                title="Upload Custom Background"
              >
                <ImageIcon size={18} />
              </button>
            )}

            {/* Wisdom Toggle */}
            <button
              onClick={toggleWisdom}
              className={`p-2 transition-all rounded-lg ${showWisdom ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
              title={showWisdom ? "Hide Daily Quote" : "Show Daily Quote"}
            >
              <Quote size={18} />
            </button>

            {/* 计时器开关 */}
            <button
              onClick={() => timer.setVisible(!timer.visible)}
              className={`p-2 transition-all rounded-lg ${timer.visible ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
              title={timer.visible ? "隐藏计时器" : "显示计时器"}
            >
              <AlarmClock size={18} />
            </button>

            <button
              onClick={toggleCamera}
              className={`p-2 transition-all rounded-lg ${isCameraEnabled ? 'bg-red-500/20 text-red-200 animate-pulse' : 'text-white/50 hover:text-white'}`}
              title={isCameraEnabled ? "Disable Camera Gestures" : "Enable Camera Gestures"}
            >
              {isCameraEnabled ? <CameraOff size={18} /> : <Camera size={18} />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 text-white/50 hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize size={18} />
            </button>
          </div>
        </div>

        <div className="h-[1px] bg-white/10 w-full" />

        {/* Layout Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider font-medium">
            <LayoutTemplate size={12} />
            <span>布局控制</span>
          </div>

          {/* Drag Sensitivity */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-white/50">拖动灵敏度: {dragSensitivity.toFixed(2)}x</label>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={dragSensitivity}
              onChange={(e) => setDragSensitivity(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Layer Controls */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-white/50">图层堆叠顺序</label>
            <div className="flex flex-col gap-2">
              {/* Sort elements by zIndex for visual clarity */}
              {[
                { id: 'digitalClock', label: '数字时钟', zIndex: layout.digitalClock.zIndex },
                { id: 'analogClock', label: '圆形时钟', zIndex: layout.analogClock.zIndex },
                { id: 'dateLine', label: '日期', zIndex: layout.dateLine.zIndex },
              ]
                .sort((a, b) => b.zIndex - a.zIndex)
                .map((item, index, arr) => (
                  <div key={item.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-xs text-white/70">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/40 w-8 text-center">{item.zIndex}</span>
                      <button
                        onClick={() => {
                          // Move up: swap with the item above
                          if (index > 0) {
                            const aboveItem = arr[index - 1];
                            setLayerOrder(item.id, aboveItem.zIndex + 1);
                          } else {
                            setLayerOrder(item.id, item.zIndex + 1);
                          }
                        }}
                        className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded transition-all"
                        title="上移一层"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => {
                          // Move down: decrease zIndex
                          if (item.zIndex > 1) {
                            setLayerOrder(item.id, item.zIndex - 1);
                          }
                        }}
                        disabled={item.zIndex <= 1}
                        className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="下移一层"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetLayout}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
          >
            <RefreshCcw size={14} />
            复位所有元素
          </button>
        </div>

        <div className="h-[1px] bg-white/10 w-full" />

        {/* Theme Row */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider font-medium">
            <Palette size={12} />
            <span>Themes</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {Object.values(THEMES).map((theme) => (
              <button
                key={theme.id}
                onClick={() => setThemeId(theme.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all border ${themeId === theme.id
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-white/60 border-white/20 hover:border-white/50'
                  }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        {/* Particles Row */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider font-medium">
            <Snowflake size={12} />
            <span>Particles</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide items-center">
            {[
              { id: ParticleMode.NONE, label: 'None' },
              { id: ParticleMode.SNOW, label: 'Snow' },
              { id: ParticleMode.RAIN, label: 'Rain' },
              { id: ParticleMode.STARS, label: 'Stars' },
              { id: ParticleMode.MATRIX, label: 'Matrix' },
            ].map((pm) => (
              <button
                key={pm.id}
                onClick={() => setParticleMode(pm.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all border ${particleMode === pm.id
                  ? 'bg-blue-500 text-white border-blue-400'
                  : 'bg-transparent text-white/60 border-white/20 hover:border-white/50'
                  }`}
              >
                {pm.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 计时器控制区（timer.visible 时展开） ── */}
        {timer.visible && (() => {
          const { mode, status, countdownTarget, setMode, setCountdownTarget, start, pause, reset } = timer;
          const isRunning = status === 'running';
          const isFinished = status === 'finished';
          const isIdle = status === 'idle';
          const isStopwatch = mode === 'stopwatch';
          const targetSec = Math.floor(countdownTarget / 1000);
          const tMins = Math.floor(targetSec / 60);
          const tSecs = targetSec % 60;
          const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

          return (
            <div className="flex flex-col gap-3">
              <div className="h-[1px] bg-white/10 w-full" />
              <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider font-medium">
                <AlarmClock size={12} />
                <span>计时器</span>
                {status !== 'idle' && (
                  <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isFinished ? 'bg-red-500/20 text-red-300 animate-pulse' :
                    isRunning  ? 'bg-emerald-500/20 text-emerald-300' :
                                 'bg-white/10 text-white/50'
                  }`}>
                    {isFinished ? '完成' : isRunning ? '▶ 运行中' : '⏸ 已暂停'}
                  </span>
                )}
              </div>

              {/* 模式选择 */}
              <div className="flex bg-white/5 rounded-xl p-1 gap-1">
                <button
                  onClick={() => { if (!isRunning) setMode('stopwatch'); }}
                  disabled={isRunning}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isStopwatch ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/70 disabled:cursor-not-allowed'
                  }`}
                >
                  正计时
                </button>
                <button
                  onClick={() => { if (!isRunning) setMode('countdown'); }}
                  disabled={isRunning}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    !isStopwatch ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/70 disabled:cursor-not-allowed'
                  }`}
                >
                  倒计时
                </button>
              </div>

              {/* 倒计时目标（仅 idle 时显示） */}
              {!isStopwatch && isIdle && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/40 w-14">目标时长</span>
                  <input
                    type="number" min={0} max={99} value={tMins}
                    onChange={e => setCountdownTarget((clamp(+e.target.value||0,0,99)*60+tSecs)*1000)}
                    className="w-12 text-center bg-white/10 border border-white/15 rounded text-xs text-white font-mono py-1 focus:outline-none focus:border-white/40"
                  />
                  <span className="text-white/30 font-mono">:</span>
                  <input
                    type="number" min={0} max={59} value={String(tSecs).padStart(2,'0')}
                    onChange={e => setCountdownTarget((tMins*60+clamp(+e.target.value||0,0,59))*1000)}
                    className="w-12 text-center bg-white/10 border border-white/15 rounded text-xs text-white font-mono py-1 focus:outline-none focus:border-white/40"
                  />
                  <span className="text-white/30 text-[10px]">分 : 秒</span>
                </div>
              )}

              {/* 控制按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={reset}
                  className="flex-1 py-2 bg-white/8 hover:bg-white/15 text-white/60 hover:text-white rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all"
                >
                  <RotateCcw size={13} /> 重置
                </button>
                <button
                  onClick={isRunning ? pause : start}
                  disabled={isFinished}
                  className={`flex-2 flex-grow py-2 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    isRunning
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : isFinished
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {isRunning ? <><Pause size={14} />暂停</> : isFinished ? '已完成' : <><Play size={14} />开始</>}
                </button>
              </div>
            </div>
          );
        })()}

        {/* Bottom Row: AI Integration */}
        <div className="flex flex-col gap-3 mt-1">
          <button
            onClick={onGenerateWisdom}
            disabled={isGeneratingWisdom}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
          >
            <Sparkles size={16} className={isGeneratingWisdom ? "animate-spin" : ""} />
            {isGeneratingWisdom ? "Consulting..." : "Ask AI for Reflection"}
          </button>

          <button
            onClick={() => setShowAISettings(!showAISettings)}
            className="flex items-center justify-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors w-full py-1"
          >
            <Settings2 size={12} />
            <span>AI Settings</span>
            {showAISettings ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {/* Collapsible AI Settings */}
          {showAISettings && (
            <div className="bg-white/5 rounded-xl p-3 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">

              {/* Provider Selection */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium flex items-center gap-1">
                  <Bot size={10} /> Provider
                </label>
                <select
                  value={aiConfig.provider}
                  onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                  className="bg-black/40 border border-white/10 rounded-lg text-xs text-white px-2 py-1.5 focus:outline-none focus:border-white/30"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="modelscope">ModelScope (魔搭)</option>
                  <option value="custom">Custom (OpenAI Compatible)</option>
                </select>
              </div>

              {/* API Key */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium flex items-center gap-1">
                  <Key size={10} /> API Key
                </label>
                <input
                  type="password"
                  value={aiConfig.apiKey}
                  onChange={(e) => handleAIConfigChange('apiKey', e.target.value)}
                  placeholder={aiConfig.provider === 'gemini' ? 'Optional (uses default if empty)' : 'Required'}
                  className="bg-black/40 border border-white/10 rounded-lg text-xs text-white px-2 py-1.5 focus:outline-none focus:border-white/30"
                />
              </div>

              {/* Model Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium flex items-center gap-1">
                  <Cpu size={10} /> Model Name
                </label>
                <input
                  type="text"
                  value={aiConfig.model}
                  onChange={(e) => handleAIConfigChange('model', e.target.value)}
                  placeholder="e.g. gemini-pro or qwen-turbo"
                  className="bg-black/40 border border-white/10 rounded-lg text-xs text-white px-2 py-1.5 focus:outline-none focus:border-white/30"
                />
              </div>

              {/* Base URL (Only for non-Gemini) */}
              {aiConfig.provider !== 'gemini' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium flex items-center gap-1">
                    <LinkIcon size={10} /> API Base URL
                  </label>
                  <input
                    type="text"
                    value={aiConfig.baseUrl}
                    onChange={(e) => handleAIConfigChange('baseUrl', e.target.value)}
                    placeholder="https://api..."
                    className="bg-black/40 border border-white/10 rounded-lg text-xs text-white px-2 py-1.5 focus:outline-none focus:border-white/30"
                  />
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
