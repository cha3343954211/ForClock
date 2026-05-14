import React, { createContext, useContext } from 'react';
import { TimeState } from '../types';

/**
 * DisplayTimeContext
 *
 * 提供"展示用时间"——可以是真实时间，也可以是计时器时间。
 * DigitalClock / AnalogClock / DateLine 统一从这里读取，
 * 而不直接调用 useTime()，从而实现「时钟复用为计时器」。
 */

interface DisplayTimeValue {
  time: TimeState;
  /** true = 当前展示计时器时间，false = 当前展示真实时间 */
  isTimerMode: boolean;
}

const initial: DisplayTimeValue = {
  time: { hours: 0, minutes: 0, seconds: 0, period: 'AM', fullDate: '' },
  isTimerMode: false,
};

const DisplayTimeContext = createContext<DisplayTimeValue>(initial);

export const DisplayTimeProvider: React.FC<{
  value: DisplayTimeValue;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <DisplayTimeContext.Provider value={value}>{children}</DisplayTimeContext.Provider>
);

export function useDisplayTime(): DisplayTimeValue {
  return useContext(DisplayTimeContext);
}
