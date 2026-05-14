import React, { useState, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Timer, AlarmClock } from 'lucide-react';
import { TimerMode } from '../types';
import { UseTimerReturn, formatMs } from '../hooks/useTimer';

interface TimerDisplayProps {
  timer: UseTimerReturn;
  /** 主题文字颜色类 */
  textClass: string;
}

// ---- 倒计时输入行 ----
const CountdownInput: React.FC<{
  targetMs: number;
  onChange: (ms: number) => void;
}> = ({ targetMs, onChange }) => {
  const totalSec = Math.floor(targetMs / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

  return (
    <div className="flex items-center justify-center gap-1 mb-2">
      <input
        type="number"
        min={0}
        max={99}
        value={mins}
        onChange={e => {
          const m = clamp(parseInt(e.target.value) || 0, 0, 99);
          onChange((m * 60 + secs) * 1000);
        }}
        className="w-12 text-center bg-white/10 border border-white/20 rounded-lg text-white text-lg font-mono focus:outline-none focus:border-white/50 py-1"
      />
      <span className="text-white/60 text-xl font-mono">:</span>
      <input
        type="number"
        min={0}
        max={59}
        value={String(secs).padStart(2, '0')}
        onChange={e => {
          const s = clamp(parseInt(e.target.value) || 0, 0, 59);
          onChange((mins * 60 + s) * 1000);
        }}
        className="w-12 text-center bg-white/10 border border-white/20 rounded-lg text-white text-lg font-mono focus:outline-none focus:border-white/50 py-1"
      />
      <span className="text-white/40 text-xs ml-1">分 : 秒</span>
    </div>
  );
};

// ---- 主组件 ----
export const TimerDisplay: React.FC<TimerDisplayProps> = ({ timer, textClass }) => {
  const {
    mode, status, displayMs, countdownTarget,
    setMode, setCountdownTarget, start, pause, reset,
  } = timer;

  // 本地拖拽状态（由父层 DraggableElement 管理，这里只关注 UI）
  const isStopwatch = mode === 'stopwatch';
  const isFinished = status === 'finished';
  const isRunning = status === 'running';

  // 颜色逻辑
  const getDisplayColor = (): string => {
    if (isFinished) return 'text-red-400 animate-pulse';
    if (!isStopwatch && displayMs <= 10_000) return 'text-amber-400';
    if (!isStopwatch && displayMs <= 60_000) return 'text-yellow-300';
    return textClass || 'text-white';
  };

  // 是否显示百分秒（正计时 + 暂停或空闲时不动时显示）
  const showCs = isStopwatch;

  const handleModeSwitch = (m: TimerMode) => {
    if (status !== 'running') setMode(m);
  };

  return (
    <div
      className="relative select-none"
      style={{ minWidth: 220, userSelect: 'none' }}
    >
      {/* 面板背景 */}
      <div className="bg-black/70 backdrop-blur-xl border border-white/15 rounded-2xl px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col items-center gap-3">

        {/* 模式切换标签 */}
        <div className="flex bg-white/5 rounded-xl p-1 gap-1 w-full">
          <button
            onClick={() => handleModeSwitch('stopwatch')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all ${
              isStopwatch ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Timer size={12} />
            正计时
          </button>
          <button
            onClick={() => handleModeSwitch('countdown')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all ${
              !isStopwatch ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <AlarmClock size={12} />
            倒计时
          </button>
        </div>

        {/* 倒计时目标设置（仅在 idle 时显示） */}
        {!isStopwatch && status === 'idle' && (
          <CountdownInput targetMs={countdownTarget} onChange={setCountdownTarget} />
        )}

        {/* 主时间显示 */}
        <div
          className={`font-mono font-bold tracking-tight transition-colors duration-300 ${getDisplayColor()}`}
          style={{ fontSize: 'clamp(2.2rem, 7vw, 4rem)', letterSpacing: '-0.02em', lineHeight: 1 }}
        >
          {isFinished ? '完成!' : formatMs(displayMs, showCs)}
        </div>

        {/* 进度条（仅倒计时） */}
        {!isStopwatch && !isFinished && countdownTarget > 0 && (
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-100"
              style={{ width: `${Math.max(0, (displayMs / countdownTarget) * 100)}%` }}
            />
          </div>
        )}

        {/* 控制按钮 */}
        <div className="flex items-center gap-3 w-full justify-center">
          {/* 重置 */}
          <button
            onClick={reset}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
            title="重置"
          >
            <RotateCcw size={16} />
          </button>

          {/* 开始 / 暂停 */}
          <button
            onClick={isRunning ? pause : start}
            disabled={isFinished && isStopwatch}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-medium text-sm transition-all ${
              isFinished
                ? 'bg-red-500/20 text-red-300 cursor-default'
                : isRunning
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-white/20 text-white hover:bg-white/30 shadow-md'
            }`}
          >
            {isRunning
              ? <><Pause size={16} /> 暂停</>
              : isFinished
                ? <span className="text-xs">按重置继续</span>
                : <><Play size={16} /> 开始</>
            }
          </button>
        </div>

        {/* 倒计时完成后的重新开始提示 */}
        {isFinished && !isStopwatch && (
          <button
            onClick={reset}
            className="text-xs text-red-300/70 hover:text-red-200 transition-colors animate-pulse"
          >
            点击重置以重新设置
          </button>
        )}
      </div>
    </div>
  );
};
