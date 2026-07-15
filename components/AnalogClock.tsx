import React, { useEffect, useState, useRef } from 'react';
import { ThemeConfig } from '../types';
import { COLOR_PRESETS } from '../constants';
import { useTime } from '../contexts/TimeContext';

interface AnalogClockProps {
  theme: ThemeConfig;
  showSeconds: boolean;
  customColor: string | null;
  customFont: string | null;
  isSmooth?: boolean;
  showHourNumbers?: boolean;
  faceStyle?: string;  // 'classic' | 'minimal' | 'dots' | 'modern' | 'swiss'
}

export const AnalogClock: React.FC<AnalogClockProps> = ({
  theme,
  showSeconds,
  customColor,
  customFont,
  isSmooth = false,
  showHourNumbers = false,
  faceStyle = 'classic',
}) => {
  const time = useTime();
  const [internalAngles, setInternalAngles] = useState({ h: 0, m: 0, s: 0 });
  const rafRef = useRef<number>(0);

  // 非平滑模式：记录历史原始角度和累积角度，确保值只增不减
  const prevRawRef = useRef({ s: -1, m: -1, h: -1 });
  const accumRef  = useRef({ s: 0,  m: 0,  h: 0 });

  /** 将原始角度累计：跨过 360° 时加上一圈而非回零 */
  const accum = (prevRaw: number, currRaw: number, acc: number): number => {
    if (prevRaw < 0) return currRaw; // 首次渲染，直接使用当前值
    let delta = currRaw - prevRaw;
    if (delta < -180) delta += 360; // 正常跨圈：354°→0° 变为 delta=+6°
    return acc + delta;
  };

  useEffect(() => {
    if (isSmooth) {
      // 切换到平滑模式时重置 tick 累积器，避免切回时角度异常
      prevRawRef.current = { s: -1, m: -1, h: -1 };

      const loop = () => {
        const now = new Date();
        const h   = now.getHours();
        const m   = now.getMinutes();
        const s   = now.getSeconds();
        const ms  = now.getMilliseconds();

        // 从当天零点计算总秒数，全天单调递增，完全消除 360° 回绕闪烁
        const totalSec = h * 3600 + m * 60 + s + ms / 1000;

        setInternalAngles({
          s: (totalSec / 60)    * 360,   // 每 60s 转一圈
          m: (totalSec / 3600)  * 360,   // 每 60min 转一圈
          h: (totalSec / 43200) * 360,   // 每 12h 转一圈
        });

        rafRef.current = requestAnimationFrame(loop);
      };

      loop();
      return () => cancelAnimationFrame(rafRef.current);
    } else {
      // Tick 模式：用累积角度确保永远向前，消除 CSS transition 逆时针闪烁
      const rawS = time.seconds * 6;
      const rawM = (time.minutes / 60) * 360 + (time.seconds / 60) * 6;
      const rawH = ((time.hours % 12) / 12) * 360 + (time.minutes / 60) * 30;

      const s = accum(prevRawRef.current.s, rawS, accumRef.current.s);
      const m = accum(prevRawRef.current.m, rawM, accumRef.current.m);
      const h = accum(prevRawRef.current.h, rawH, accumRef.current.h);

      prevRawRef.current = { s: rawS, m: rawM, h: rawH };
      accumRef.current   = { s, m, h };

      setInternalAngles({ s, m, h });
    }
  }, [isSmooth, time]);

  // Destructure for rendering
  const { s: secondDegrees, m: minuteDegrees, h: hourDegrees } = internalAngles;

  const isNeon = theme.id.includes('NEON');
  const fontStyle = customFont ? { fontFamily: customFont } : {};

  // Find active preset if it matches customColor to get SVG stops
  const activePreset = customColor
    ? COLOR_PRESETS.find(p => p.value === customColor)
    : null;

  const isGradient = activePreset?.type === 'gradient';
  const gradientId = 'clock-gradient'; // ID for SVG def

  // Helper to determine stroke color
  const getStrokeColor = (_fallbackClass: string) => {
    if (isGradient) return `url(#${gradientId})`;
    if (customColor) return customColor;
    return 'currentColor'; // Will inherit from parent color if set, or rely on class
  };

  // If solid custom color, we set it on the container.
  // If gradient, we set the stroke explicitly to url(#id) and container color is ignored for those elements.
  const containerStyle = {
    ...fontStyle,
    ...(customColor && !isGradient ? { color: customColor } : {})
  };

  // Hour number positions (12, 3, 6, 9)
  const hourNumbers = [
    { num: '12', x: 50, y: 16 },
    { num: '3',  x: 86, y: 52 },
    { num: '6',  x: 50, y: 88 },
    { num: '9',  x: 14, y: 52 },
  ];

  // Roman numerals positions (12 hours)
  const romanNumerals = [
    'XII', 'I', 'II', 'III', 'IV', 'V',
    'VI',  'VII', 'VIII', 'IX', 'X', 'XI',
  ];

  const sc  = getStrokeColor(theme.textClass);
  const acc = getStrokeColor(theme.accentClass);
  const trans = !isSmooth;

  // Hour progress arc for 'modern'
  const hourFrac = (hourDegrees % 360) / 360;
  const minFrac  = (minuteDegrees % 360) / 360;
  const arcR    = 42;
  const arcR2   = 36;
  const arcC    = 2 * Math.PI * arcR;
  const arcC2   = 2 * Math.PI * arcR2;
  const arcLen  = hourFrac * arcC;
  const arcLen2 = minFrac  * arcC2;

  // Current hour for modern center display
  const displayHour = ((time.hours % 12) || 12).toString();

  const hasFace = faceStyle === 'classic' || faceStyle === 'dots'
                || faceStyle === 'swiss'  || faceStyle === 'roman';

  return (
    <div
      className={`relative w-[60vmin] h-[60vmin] max-w-[600px] max-h-[600px] ${!customFont ? theme.fontFamily : ''}`}
      style={containerStyle}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
        <defs>
          {isGradient && activePreset?.svgStops && (
            <linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
              {activePreset.svgStops.map((stop, i) => (
                <stop key={i} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
          )}
          {/* Soft radial face background for tactile depth */}
          <radialGradient id="faceGlow" cx="50%" cy="45%" r="60%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.06)" />
            <stop offset="70%"  stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
          </radialGradient>
          {/* Hand soft shadow filter */}
          <filter id="handShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.5" />
            <feOffset dx="0" dy="0.4" result="off" />
            <feComponentTransfer><feFuncA type="linear" slope="0.45" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── BACKGROUND DEPTH (除 minimal/modern 外都铺底) ────── */}
        {hasFace && (
          <circle cx="50" cy="50" r="46" fill="url(#faceGlow)" />
        )}

        {/* ── FACE ─────────────────────────────────────────────── */}

        {/* outer + inner rings for classic/dots/swiss/roman */}
        {hasFace && (
          <>
            <circle cx="50" cy="50" r="48" fill="none" stroke={sc}
              strokeWidth="0.5" opacity={0.28}
              className={!customColor && !isGradient ? theme.textClass : ''} />
            {(faceStyle === 'classic' || faceStyle === 'roman') && (
              <circle cx="50" cy="50" r="45.5" fill="none" stroke={sc}
                strokeWidth="0.25" opacity={0.18}
                className={!customColor && !isGradient ? theme.textClass : ''} />
            )}
          </>
        )}

        {/* classic: line markers */}
        {faceStyle === 'classic' && [...Array(60)].map((_, i) => {
          const isH = i % 5 === 0;
          return (
            <line key={i} x1="50" y1={isH ? 6 : 6.5}
              x2="50" y2={isH ? (showHourNumbers && i % 15 === 0 ? 8 : 11) : 8.5}
              transform={`rotate(${i * 6} 50 50)`}
              stroke={sc} strokeWidth={isH ? 1.4 : 0.4} strokeLinecap="round"
              opacity={isH ? 0.95 : 0.35}
              className={!customColor && !isGradient ? theme.textClass : ''} />
          );
        })}

        {/* classic: hour numbers */}
        {faceStyle === 'classic' && showHourNumbers && hourNumbers.map(({ num, x, y }) => (
          <text key={num} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fill={sc} style={{ fontSize: '7.5px', letterSpacing: '0.05em', fontWeight: 600 }}
            className={!customColor && !isGradient ? theme.textClass : ''}>
            {num}
          </text>
        ))}

        {/* roman: 12 numerals around the dial */}
        {faceStyle === 'roman' && romanNumerals.map((numeral, i) => {
          const angle = (i * 30 - 90) * Math.PI / 180;
          const r = 39;
          const x = 50 + r * Math.cos(angle);
          const y = 50 + r * Math.sin(angle);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              fill={sc} style={{ fontSize: '6.5px', letterSpacing: '0.04em', fontWeight: 500 }}
              opacity={0.85}
              className={!customColor && !isGradient ? theme.textClass : ''}>
              {numeral}
            </text>
          );
        })}
        {/* roman: minute tick dots */}
        {faceStyle === 'roman' && [...Array(60)].map((_, i) => {
          if (i % 5 === 0) return null;
          const rad = (i * 6 - 90) * Math.PI / 180;
          return (
            <circle key={i} cx={50 + 46 * Math.cos(rad)} cy={50 + 46 * Math.sin(rad)} r={0.35}
              fill={sc} opacity={0.4}
              className={!customColor && !isGradient ? theme.textClass : ''} />
          );
        })}

        {/* dots: circular dot markers */}
        {faceStyle === 'dots' && [...Array(60)].map((_, i) => {
          const isH = i % 5 === 0;
          const isQ = i % 15 === 0;
          const r   = isQ ? 1.8 : isH ? 1.2 : 0.55;
          const d   = 44;
          const rad = (i * 6 - 90) * Math.PI / 180;
          return (
            <circle key={i}
              cx={50 + d * Math.cos(rad)} cy={50 + d * Math.sin(rad)} r={r}
              fill={sc} opacity={isQ ? 1 : isH ? 0.85 : 0.32}
              className={!customColor && !isGradient ? theme.textClass : ''} />
          );
        })}

        {/* modern: dual arc + centered hour number */}
        {faceStyle === 'modern' && (
          <>
            {/* center disc - subtle background */}
            <circle cx="50" cy="50" r="30" fill={sc} opacity={0.04}
              className={!customColor && !isGradient ? theme.textClass : ''} />

            {/* outer ring (hour) - track + progress */}
            <circle cx="50" cy="50" r={arcR} fill="none" stroke={sc}
              strokeWidth="2.5" opacity={0.1} strokeLinecap="round" />
            <circle cx="50" cy="50" r={arcR} fill="none" stroke={sc}
              strokeWidth="2.5" opacity={0.85} strokeLinecap="round"
              strokeDasharray={arcC} strokeDashoffset={arcC - arcLen}
              transform="rotate(-90 50 50)"
              className={!customColor && !isGradient ? theme.textClass : ''} />

            {/* inner ring (minute) - thinner */}
            <circle cx="50" cy="50" r={arcR2} fill="none" stroke={sc}
              strokeWidth="1.2" opacity={0.08} strokeLinecap="round" />
            <circle cx="50" cy="50" r={arcR2} fill="none" stroke={acc}
              strokeWidth="1.2" opacity={0.6} strokeLinecap="round"
              strokeDasharray={arcC2} strokeDashoffset={arcC2 - arcLen2}
              transform="rotate(-90 50 50)"
              className={!customColor && !isGradient ? theme.accentClass : ''} />

            {/* current hour numeral at center */}
            <text x="50" y="51" textAnchor="middle" dominantBaseline="middle"
              fill={sc} style={{ fontSize: '20px', fontWeight: 300, letterSpacing: '-0.05em' }}
              className={!customColor && !isGradient ? theme.textClass : ''}>
              {displayHour}
            </text>
            <text x="50" y="64" textAnchor="middle" dominantBaseline="middle"
              fill={sc} opacity={0.4} style={{ fontSize: '4.5px', letterSpacing: '0.4em', fontWeight: 600 }}
              className={!customColor && !isGradient ? theme.textClass : ''}>
              {time.minutes.toString().padStart(2, '0')}
            </text>
          </>
        )}

        {/* swiss: rectangular markers */}
        {faceStyle === 'swiss' && [...Array(60)].map((_, i) => {
          const isH = i % 5 === 0;
          const w   = isH ? 1.8 : 0.8;
          const h   = isH ? 7   : 3.5;
          const y0  = 3;
          return (
            <rect key={i}
              x={50 - w / 2} y={y0} width={w} height={h}
              fill={sc} opacity={isH ? 0.9 : 0.45}
              transform={`rotate(${i * 6} 50 50)`}
              className={!customColor && !isGradient ? theme.textClass : ''} />
          );
        })}

        {/* ── HANDS ────────────────────────────────────────────── */}

        {/* Hour hand (with subtle tail for elegance, except modern) */}
        {faceStyle !== 'modern' && (
          faceStyle === 'swiss' ? (
            <rect x="48.2" y="22" width="3.6" height="32" rx="1.8"
              fill={sc} transform={`rotate(${hourDegrees} 50 50)`}
              className={`${!customColor && !isGradient ? theme.textClass : ''} ${trans ? 'transition-transform duration-300 ease-linear' : ''}`} />
          ) : (
            <g transform={`rotate(${hourDegrees} 50 50)`}
               className={trans ? 'transition-transform duration-300 ease-linear' : ''}>
              <line x1="50" y1="56" x2="50" y2="25"
                stroke={sc} strokeWidth={faceStyle === 'minimal' ? 2.2 : 2.6} strokeLinecap="round"
                filter="url(#handShadow)"
                className={!customColor && !isGradient ? theme.textClass : ''} />
            </g>
          )
        )}
        {/* modern: simple hour pointer arrow */}
        {faceStyle === 'modern' && (
          <line x1="50" y1="50" x2="50" y2="20"
            stroke={sc} strokeWidth="0.8" strokeLinecap="round"
            transform={`rotate(${hourDegrees} 50 50)`}
            opacity={0.55}
            className={`${!customColor && !isGradient ? theme.textClass : ''} ${trans ? 'transition-transform duration-300 ease-linear' : ''}`} />
        )}

        {/* Minute hand */}
        {faceStyle !== 'modern' && (
          faceStyle === 'swiss' ? (
            <rect x="48.8" y="12" width="2.4" height="42" rx="1.2"
              fill={sc} transform={`rotate(${minuteDegrees} 50 50)`}
              className={`${!customColor && !isGradient ? theme.textClass : ''} ${trans ? 'transition-transform duration-300 ease-linear' : ''}`} />
          ) : (
            <g transform={`rotate(${minuteDegrees} 50 50)`}
               className={trans ? 'transition-transform duration-300 ease-linear' : ''}>
              <line x1="50" y1="58" x2="50" y2="14"
                stroke={sc} strokeWidth={faceStyle === 'minimal' ? 1.4 : 1.6} strokeLinecap="round"
                filter="url(#handShadow)"
                className={!customColor && !isGradient ? theme.textClass : ''} />
            </g>
          )
        )}

        {/* Second hand (skip for modern - it has the inner arc) */}
        {showSeconds && faceStyle !== 'modern' && (
          faceStyle === 'swiss' ? (
            <g transform={`rotate(${secondDegrees} 50 50)`}
               className={trans ? 'transition-transform duration-75 ease-linear' : ''}>
              <line x1="50" y1="58" x2="50" y2="12" stroke="#ef4444" strokeWidth="0.7" strokeLinecap="round" />
              <circle cx="50" cy="12" r="2.5" fill="#ef4444" />
              <circle cx="50" cy="50" r="2" fill="#ef4444" />
            </g>
          ) : (
            <g transform={`rotate(${secondDegrees} 50 50)`}
               className={trans ? 'transition-transform duration-75 ease-linear' : ''}>
              <line x1="50" y1="58" x2="50" y2="10"
                stroke={acc} strokeWidth="0.55" strokeLinecap="round"
                className={`${!customColor && !isGradient ? theme.accentClass : ''} ${isNeon ? 'drop-shadow-[0_0_5px_rgba(34,211,238,1)]' : ''}`} />
              {/* second hand counterweight */}
              <circle cx="50" cy="56" r="0.9" fill={acc}
                className={!customColor && !isGradient ? theme.accentClass : ''} />
            </g>
          )
        )}

        {/* Center cap (layered for tactile feel) */}
        {faceStyle === 'swiss' ? (
          <circle cx="50" cy="50" r="2.5" fill="#ef4444" />
        ) : (
          <>
            <circle cx="50" cy="50" r="2.2" fill={sc}
              className={!customColor && !isGradient ? theme.textClass : ''} />
            <circle cx="50" cy="50" r="0.8" fill="rgba(0,0,0,0.45)" />
          </>
        )}
      </svg>
    </div>
  );
};