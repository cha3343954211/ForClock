import { useState, useRef, useCallback, useEffect } from 'react';
import { TimerMode, TimerStatus } from '../types';

// ---- 位置持久化 ----
interface TimerPosition { x: number; y: number; }

function loadPosition(): TimerPosition {
  try {
    const s = localStorage.getItem('zenclock_timer_pos');
    return s ? JSON.parse(s) : { x: 30, y: 30 };
  } catch { return { x: 30, y: 30 }; }
}

// ---- Web Audio 提示音（不依赖任何音频文件） ----
function playAlertTone() {
  try {
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.connect(ctx.destination);
    master.gain.setValueAtTime(0.25, ctx.currentTime);

    const schedule = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.connect(env);
      env.connect(master);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      env.gain.setValueAtTime(0, ctx.currentTime + start);
      env.gain.linearRampToValueAtTime(1, ctx.currentTime + start + 0.02);
      env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    };

    schedule(880, 0,    0.15);
    schedule(1100, 0.2, 0.15);
    schedule(880, 0.4,  0.15);
    schedule(1320, 0.6, 0.3);
  } catch { /* 浏览器安全限制时静默失败 */ }
}

// ---- 格式化辅助 ----
export function formatMs(ms: number, showCentiseconds = false): string {
  const total = Math.max(0, ms);
  const h = Math.floor(total / 3_600_000);
  const m = Math.floor((total % 3_600_000) / 60_000);
  const s = Math.floor((total % 60_000) / 1_000);
  const cs = Math.floor((total % 1_000) / 10);

  const pad = (n: number) => String(n).padStart(2, '0');

  if (showCentiseconds) {
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
    return `${pad(m)}:${pad(s)}.${pad(cs)}`;
  }
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

// ---- Hook 返回类型 ----
export interface UseTimerReturn {
  mode: TimerMode;
  status: TimerStatus;
  displayMs: number;          // 当前展示的毫秒数
  countdownTarget: number;    // 倒计时目标 ms
  visible: boolean;
  position: TimerPosition;
  // 操作
  setMode: (m: TimerMode) => void;
  setVisible: (v: boolean) => void;
  setCountdownTarget: (ms: number) => void;
  setPosition: (pos: TimerPosition) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

const DEFAULT_COUNTDOWN = 5 * 60 * 1000; // 5 分钟

export function useTimer(): UseTimerReturn {
  const [mode, setMode_internal] = useState<TimerMode>('stopwatch');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [displayMs, setDisplayMs] = useState(0);
  const [countdownTarget, setCountdownTarget_internal] = useState(DEFAULT_COUNTDOWN);
  const [visible, setVisible] = useState(false);
  const [position, setPosition_internal] = useState<TimerPosition>(loadPosition);

  // 精确计时 refs（不触发重渲染）
  const intervalRef = useRef<number | null>(null);
  const startTsRef = useRef<number>(0);   // 最后一次 start 的时间戳
  const accRef = useRef<number>(0);        // 累计 ms（暂停时保存）

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback((target: number, isCd: boolean) => {
    const elapsed = accRef.current + (Date.now() - startTsRef.current);
    if (isCd) {
      const remaining = target - elapsed;
      if (remaining <= 0) {
        setDisplayMs(0);
        setStatus('finished');
        clearTimer();
        playAlertTone();
      } else {
        setDisplayMs(remaining);
      }
    } else {
      setDisplayMs(elapsed);
    }
  }, [clearTimer]);

  const start = useCallback(() => {
    startTsRef.current = Date.now();
    const isCd = mode === 'countdown';
    const target = countdownTarget;

    // 直接用 ref 快照避免 stale closure 问题
    intervalRef.current = window.setInterval(() => tick(target, isCd), 50);
    setStatus('running');
  }, [mode, countdownTarget, tick]);

  const pause = useCallback(() => {
    clearTimer();
    accRef.current += Date.now() - startTsRef.current;
    setStatus('paused');
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    accRef.current = 0;
    setStatus('idle');
    setDisplayMs(mode === 'countdown' ? countdownTarget : 0);
  }, [clearTimer, mode, countdownTarget]);

  // 切换模式时强制 reset
  const setMode = useCallback((m: TimerMode) => {
    clearTimer();
    accRef.current = 0;
    setStatus('idle');
    setMode_internal(m);
    setDisplayMs(m === 'countdown' ? countdownTarget : 0);
  }, [clearTimer, countdownTarget]);

  const setCountdownTarget = useCallback((ms: number) => {
    setCountdownTarget_internal(ms);
    if (status === 'idle') setDisplayMs(ms);
  }, [status]);

  const setPosition = useCallback((pos: TimerPosition) => {
    setPosition_internal(pos);
    localStorage.setItem('zenclock_timer_pos', JSON.stringify(pos));
  }, []);

  // 初始化 displayMs（倒计时默认显示目标时长）
  useEffect(() => {
    if (mode === 'countdown' && status === 'idle') {
      setDisplayMs(countdownTarget);
    }
  }, [mode, countdownTarget, status]);

  // 卸载时清除 interval
  useEffect(() => () => { clearTimer(); }, [clearTimer]);

  return {
    mode, status, displayMs, countdownTarget, visible, position,
    setMode, setVisible, setCountdownTarget, setPosition,
    start, pause, reset,
  };
}
