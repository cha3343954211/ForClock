import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { ThemeConfig } from '../types';
import { UseTimerReturn } from '../hooks/useTimer';

interface TimerDisplayProps {
  timer: UseTimerReturn;
  theme: ThemeConfig;
  customColor?: string | null;
  customFont?: string | null;
}

// 单个数字块——与 DigitalClock FlipDigit 非翻页模式保持一致
const Digit: React.FC<{
  value: string;
  color: string;
  font: string;
  size: string;
  dim?: boolean;
}> = ({ value, color, font, size, dim }) => (
  <span
    className={`font-bold leading-none transition-colors duration-300 ${dim ? 'opacity-30' : 'opacity-100'}`}
    style={{ fontSize: size, color, fontFamily: font, letterSpacing: '-0.02em' }}
  >
    {value}
  </span>
);

// 分隔符
const Sep: React.FC<{ color: string; size: string; pulse?: boolean }> = ({ color, size, pulse }) => (
  <span
    className={`font-bold leading-none pb-[0.1em] ${pulse ? 'animate-pulse' : ''}`}
    style={{ fontSize: `calc(${size} * 0.55)`, color, opacity: 0.6 }}
  >
    :
  </span>
);

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ timer, theme, customColor, customFont }) => {
  const { mode, status, displayMs, countdownTarget, setMode, setCountdownTarget, start, pause, reset } = timer;

  const isStopwatch = mode === 'stopwatch';
  const isRunning   = status === 'running';
  const isFinished  = status === 'finished';
  const isIdle      = status === 'idle';

  // 颜色
  const isLightTheme = theme.bgClass.includes('stone-100') || theme.bgClass.includes('white');
  const baseColor = customColor ?? (isLightTheme ? '#333333' : '#eeeeee');
  const accentColor = isFinished
    ? '#f87171'
    : !isStopwatch && displayMs <= 10_000
      ? '#fb923c'
      : !isStopwatch && displayMs <= 60_000
        ? '#fbbf24'
        : baseColor;

  const fontFamily = customFont ?? (theme.fontFamily.includes('mono') ? 'monospace' : 'inherit');

  // 尺寸——与 DigitalClock compact 档位一致
  const mainSize = 'min(10vw, 120px)';
  const csSize   = 'min(5vw, 58px)';    // 百分秒（正计时专用）

  // 格式化
  const totalSec = Math.floor(Math.max(0, displayMs) / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  const cs = String(Math.floor((Math.max(0, displayMs) % 1000) / 10)).padStart(2, '0');

  // 倒计时目标编辑（idle 时）
  const targetSec = Math.floor(countdownTarget / 1000);
  const targetMins = Math.floor(targetSec / 60);
  const targetSecs = targetSec % 60;

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  return (
    <div className="flex flex-col items-center select-none" style={{ userSelect: 'none' }}>

      {/* ── 主时间显示（与 DigitalClock 同款透明大字） ── */}
      {isFinished ? (
        <span
          className="font-bold animate-pulse"
          style={{ fontSize: mainSize, color: '#f87171', fontFamily, letterSpacing: '-0.02em' }}
        >
          完 成
        </span>
      ) : (
        <div className="flex items-end gap-[0.15em]">
          {/* MM */}
          <Digit value={mm[0]} color={accentColor} font={fontFamily} size={mainSize} />
          <Digit value={mm[1]} color={accentColor} font={fontFamily} size={mainSize} />
          <Sep color={accentColor} size={mainSize} pulse={isRunning} />
          {/* SS */}
          <Digit value={ss[0]} color={accentColor} font={fontFamily} size={mainSize} />
          <Digit value={ss[1]} color={accentColor} font={fontFamily} size={mainSize} />
          {/* .cs — 正计时专用 */}
          {isStopwatch && (
            <>
              <span className="font-bold pb-[0.05em]"
                style={{ fontSize: `calc(${mainSize} * 0.4)`, color: accentColor, opacity: 0.5, fontFamily }}>.</span>
              <Digit value={cs[0]} color={accentColor} font={fontFamily} size={csSize} dim />
              <Digit value={cs[1]} color={accentColor} font={fontFamily} size={csSize} dim />
            </>
          )}
        </div>
      )}

      {/* ── 进度条（倒计时专用，细线条在时间正下方） ── */}
      {!isStopwatch && !isFinished && countdownTarget > 0 && (
        <div className="mt-2 rounded-full overflow-hidden" style={{ width: mainSize, height: 3, background: 'rgba(255,255,255,0.12)' }}>
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${Math.max(0, (displayMs / countdownTarget) * 100)}%`,
              background: displayMs <= 10_000 ? '#fb923c' : 'rgba(255,255,255,0.55)',
            }}
          />
        </div>
      )}

      {/* ── 倒计时目标编辑（idle 时显示小输入框） ── */}
      {!isStopwatch && isIdle && (
        <div className="flex items-center gap-1 mt-2 opacity-70">
          <input
            type="number" min={0} max={99} value={targetMins}
            onChange={e => setCountdownTarget((clamp(+e.target.value || 0, 0, 99) * 60 + targetSecs) * 1000)}
            className="w-10 text-center bg-white/10 border border-white/20 rounded text-sm font-mono focus:outline-none focus:border-white/50 py-0.5"
            style={{ color: baseColor }}
          />
          <span style={{ color: baseColor, opacity: 0.5 }} className="font-mono text-sm">:</span>
          <input
            type="number" min={0} max={59} value={String(targetSecs).padStart(2, '0')}
            onChange={e => setCountdownTarget((targetMins * 60 + clamp(+e.target.value || 0, 0, 59)) * 1000)}
            className="w-10 text-center bg-white/10 border border-white/20 rounded text-sm font-mono focus:outline-none focus:border-white/50 py-0.5"
            style={{ color: baseColor }}
          />
          <span style={{ color: baseColor, opacity: 0.35 }} className="text-xs ml-1">m : s</span>
        </div>
      )}

      {/* ── 控制栏（hover 时显现） ── */}
      <div className="flex items-center gap-4 mt-3 opacity-40 hover:opacity-90 transition-opacity duration-300">

        {/* 模式切换 */}
        <button
          onClick={() => { if (!isRunning) setMode(isStopwatch ? 'countdown' : 'stopwatch'); }}
          className="text-[10px] font-mono uppercase tracking-widest transition-colors hover:opacity-100"
          style={{ color: baseColor, opacity: isRunning ? 0.3 : 0.7 }}
          title={isStopwatch ? '切换为倒计时' : '切换为正计时'}
        >
          {isStopwatch ? '正计时' : '倒计时'}
        </button>

        {/* 重置 */}
        <button
          onClick={reset}
          className="transition-opacity hover:opacity-100"
          style={{ color: baseColor }}
          title="重置"
        >
          <RotateCcw size={14} />
        </button>

        {/* 开始 / 暂停 */}
        <button
          onClick={isRunning ? pause : start}
          className="transition-opacity hover:opacity-100"
          style={{ color: isFinished ? '#f87171' : baseColor }}
          title={isRunning ? '暂停' : isFinished ? '重置后继续' : '开始'}
          disabled={isFinished}
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>
    </div>
  );
};
