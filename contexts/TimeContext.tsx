import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { TimeState } from '../types';

/**
 * TimeContext - 全局共享时间状态
 *
 * 设计目标：
 * 1. 每秒只在 TimeProvider 内部触发一次重渲染
 * 2. 订阅者（useTime）只在自己组件树重渲染，不会污染 App 根
 * 3. 配合 React.memo 可彻底切断不需要时间的子树
 */

const initialTime: TimeState = {
  hours: 0,
  minutes: 0,
  seconds: 0,
  period: 'AM',
  fullDate: '',
};

const TimeContext = createContext<TimeState>(initialTime);

interface TimeProviderProps {
  children: React.ReactNode;
  /** 更新间隔（ms），默认 1000 */
  interval?: number;
}

export const TimeProvider: React.FC<TimeProviderProps> = ({ children, interval = 1000 }) => {
  const [time, setTime] = useState<TimeState>(() => buildTimeState(new Date()));
  const timerRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    setTime(buildTimeState(new Date()));
  }, []);

  useEffect(() => {
    // 立即对齐到下一秒的起点，减少误差
    const now = new Date();
    const msToNextSecond = 1000 - now.getMilliseconds();

    const startTimer = () => {
      timerRef.current = window.setInterval(tick, interval);
    };

    const alignTimer = window.setTimeout(() => {
      tick();
      startTimer();
    }, msToNextSecond);

    return () => {
      window.clearTimeout(alignTimer);
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [tick, interval]);

  return <TimeContext.Provider value={time}>{children}</TimeContext.Provider>;
};

/** 订阅当前时间状态 */
export const useTime = (): TimeState => useContext(TimeContext);

// ---------- helpers ----------

function buildTimeState(now: Date): TimeState {
  return {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
    period: now.getHours() >= 12 ? 'PM' : 'AM',
    fullDate: now.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };
}
