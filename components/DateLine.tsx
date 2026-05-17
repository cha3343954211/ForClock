import React from 'react';
import { ThemeConfig } from '../types';
import { useTime } from '../contexts/TimeContext';

interface DateLineProps {
    theme: ThemeConfig;
    use24Hour: boolean;
    customColor: string | null;
    customFont: string | null;
    layoutStyle?: string;  // 'text' | 'badge' | 'card' | 'expanded'
}

export const DateLine: React.FC<DateLineProps> = ({
    theme,
    use24Hour,
    customColor,
    customFont,
    layoutStyle = 'text',
}) => {
    const time = useTime();
    const isGradient = customColor?.includes('gradient');
    const color = customColor && !isGradient ? customColor : undefined;

    const textStyle: React.CSSProperties = {
        color,
        fontFamily:           customFont || undefined,
        backgroundImage:      isGradient ? customColor || undefined : undefined,
        WebkitBackgroundClip: isGradient ? 'text' : undefined,
        backgroundClip:       isGradient ? 'text' : undefined,
        WebkitTextFillColor:  isGradient ? 'transparent' : undefined,
        userSelect:           'none',
        pointerEvents:        'none',
    };

    const cls = `${!customColor ? theme.textClass : ''} ${!customFont ? theme.fontFamily : ''}`;

    // 从 fullDate 拆分（通常格式如 "WEDNESDAY, 15 JANUARY 2025"）
    const parts = time.fullDate.split(/,\s*/);
    const dayName  = parts[0] ?? '';                      // "WEDNESDAY"
    const restParts = (parts[1] ?? '').trim().split(' '); // ["15", "JANUARY", "2025"]
    const dayNum   = restParts[0] ?? '';
    const monthStr = restParts[1] ?? '';
    const yearStr  = restParts[2] ?? '';

    // ── text (default) ── 加细线装饰，更礼仪化 ───────────────────────────
    if (layoutStyle === 'text') {
        return (
            <div className="flex flex-col items-center select-none" style={{ pointerEvents: 'none' }}>
                <div className="h-[1px] w-12 bg-current opacity-30 mb-2" />
                <div className={`tracking-[0.25em] uppercase font-medium opacity-85 ${cls}`}
                    style={{ ...textStyle, fontSize: 'clamp(0.8rem, 2vw, 1.4rem)' }}>
                    {time.fullDate}
                    {!use24Hour && (
                        <span className="ml-2 px-2 py-0.5 bg-white/10 rounded text-xs align-middle">
                            {time.period}
                        </span>
                    )}
                </div>
                <div className="h-[1px] w-12 bg-current opacity-30 mt-2" />
            </div>
        );
    }

    // ── badge ── 大日期数字 + 右侧元数据堆叠 ──────────────────────────────
    if (layoutStyle === 'badge') {
        const glassStyle: React.CSSProperties = {
            background:     'linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))',
            backdropFilter: 'blur(14px)',
            border:         `1px solid ${color ? color + '40' : 'rgba(255,255,255,0.18)'}`,
            boxShadow:      '0 4px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.08)',
        };
        return (
            <div className="flex items-center gap-3 pl-3 pr-5 py-2 rounded-2xl select-none" style={glassStyle}>
                <div className={`text-3xl font-bold leading-none ${cls}`}
                    style={{ ...textStyle, pointerEvents: 'none' }}>
                    {dayNum}
                </div>
                <div className="w-[1px] self-stretch bg-white/15 flex-shrink-0" />
                <div className="flex flex-col gap-0.5">
                    <span className={`text-[10px] tracking-[0.25em] uppercase font-semibold opacity-70 ${cls}`}
                        style={{ ...textStyle, pointerEvents: 'none' }}>
                        {dayName}
                    </span>
                    <span className={`text-[11px] tracking-[0.15em] font-medium opacity-90 ${cls}`}
                        style={{ ...textStyle, pointerEvents: 'none' }}>
                        {monthStr} {yearStr}
                    </span>
                </div>
                {!use24Hour && (
                    <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">
                        {time.period}
                    </span>
                )}
            </div>
        );
    }

    // ── card ── 大号日期 + 顶部装饰横线 + 立体玻璃质感 ──────────────────
    if (layoutStyle === 'card') {
        const cardStyle: React.CSSProperties = {
            background:     'linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))',
            backdropFilter: 'blur(16px)',
            border:         `1px solid ${color ? color + '30' : 'rgba(255,255,255,0.12)'}`,
            boxShadow:      '0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10)',
        };
        return (
            <div className="flex flex-col items-center select-none rounded-3xl px-10 py-5 min-w-[200px]"
                style={cardStyle}>
                {/* 顶部装饰横线 */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-[1px] w-6 bg-current opacity-40" />
                    <div className="w-1 h-1 rounded-full bg-current opacity-50" />
                    <div className="h-[1px] w-6 bg-current opacity-40" />
                </div>
                <div className={`text-[10px] tracking-[0.3em] uppercase opacity-60 font-semibold ${cls}`}
                    style={{ ...textStyle, pointerEvents: 'none' }}>
                    {dayName}
                </div>
                <div className={`font-black leading-none mt-2 ${cls}`}
                    style={{ ...textStyle, fontSize: 'clamp(3rem, 8vw, 6rem)', pointerEvents: 'none', textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
                    {dayNum}
                </div>
                <div className={`text-sm tracking-[0.2em] uppercase mt-2 opacity-75 font-medium ${cls}`}
                    style={{ ...textStyle, pointerEvents: 'none' }}>
                    {monthStr}
                </div>
                <div className={`text-[11px] tracking-[0.15em] mt-0.5 opacity-50 ${cls}`}
                    style={{ ...textStyle, pointerEvents: 'none' }}>
                    {yearStr}
                </div>
                {!use24Hour && (
                    <div className="mt-2 px-2 py-0.5 bg-white/10 rounded text-xs text-white/70 font-mono">
                        {time.period}
                    </div>
                )}
            </div>
        );
    }

    // ── stamp ── 邮票/印章风格：双层框 + 角点 ─────────────────────────────
    if (layoutStyle === 'stamp') {
        const stampStyle: React.CSSProperties = {
            border: `1.5px solid ${color || 'currentColor'}`,
            outline: `1px solid ${color || 'currentColor'}`,
            outlineOffset: '4px',
            opacity: 0.95,
        };
        return (
            <div className="relative select-none" style={{ pointerEvents: 'none' }}>
                <div className={`flex flex-col items-center px-8 py-4 ${cls}`}
                    style={{ ...textStyle, ...stampStyle }}>
                    <div className="text-[9px] tracking-[0.4em] uppercase opacity-60 font-semibold">
                        {dayName}
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-bold leading-none"
                            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                            {dayNum}
                        </span>
                        <span className="text-sm tracking-[0.15em] uppercase font-medium opacity-80">
                            {monthStr}
                        </span>
                    </div>
                    <div className="text-[10px] tracking-[0.3em] opacity-50 mt-1">
                        — {yearStr} —
                    </div>
                </div>
                {/* 四角装饰圆点 */}
                <span className="absolute -top-1.5 -left-1.5 w-1.5 h-1.5 rounded-full" style={{ background: color || 'currentColor', opacity: 0.6 }} />
                <span className="absolute -top-1.5 -right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: color || 'currentColor', opacity: 0.6 }} />
                <span className="absolute -bottom-1.5 -left-1.5 w-1.5 h-1.5 rounded-full" style={{ background: color || 'currentColor', opacity: 0.6 }} />
                <span className="absolute -bottom-1.5 -right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: color || 'currentColor', opacity: 0.6 }} />
            </div>
        );
    }

    // ── expanded ── 左大数字 + 右元数据列 ─────────────────────────────────
    return (
        <div className="flex items-center gap-4 select-none" style={{ pointerEvents: 'none' }}>
            <div className={`font-bold leading-none ${cls}`}
                style={{ ...textStyle, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
                {dayNum}
            </div>
            <div className="flex flex-col gap-1">
                <div className={`text-xs tracking-[0.3em] uppercase opacity-60 font-semibold ${cls}`}
                    style={{ ...textStyle }}>
                    {dayName}
                </div>
                <div className={`text-sm tracking-[0.2em] uppercase opacity-90 font-medium ${cls}`}
                    style={{ ...textStyle }}>
                    {monthStr} {yearStr}
                </div>
                {!use24Hour && (
                    <div className="mt-0.5">
                        <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">
                            {time.period}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
