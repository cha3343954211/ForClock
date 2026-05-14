import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { THEMES } from './constants';
import { ThemeId, ClockMode, ParticleMode, AIConfig, LayoutConfig, ElementConfig } from './types';
import { DigitalClock } from './components/DigitalClock';
import { Controls } from './components/Controls';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DraggableElement } from './components/DraggableElement';
import { ElementSettings } from './components/ElementSettings';
import { DateLine } from './components/DateLine';
import { generateTimeReflection } from './services/geminiService';

// 代码分割：重型组件按需加载
// - AnalogClock: 仅 Analog/Dual 模式需要
// - ParticlesCanvas: 含 MediaPipe 依赖，仅在启用粒子效果时加载
const AnalogClock = lazy(() => import('./components/AnalogClock').then(m => ({ default: m.AnalogClock })));
const ParticlesCanvas = lazy(() => import('./components/ParticlesCanvas').then(m => ({ default: m.ParticlesCanvas })));

const App: React.FC = () => {
  // --- State ---
  // 注意：time 状态已抽离到 TimeContext，由 TimeProvider 管理
  // 子组件（DigitalClock/AnalogClock/DateLine）通过 useTime() 直接订阅
  // 这样 App 不再每秒重渲染整棵树
  const [themeId, setThemeId] = useState<ThemeId>(ThemeId.MINIMAL_DARK);
  const [clockMode, setClockMode] = useState<ClockMode>(ClockMode.DIGITAL);
  const [particleMode, setParticleMode] = useState<ParticleMode>(ParticleMode.NONE);
  const [showSeconds, setShowSeconds] = useState(true);
  const [use24Hour, setUse24Hour] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);

  // Aesthetic Modes
  const [isSmooth, setIsSmooth] = useState(false); // For Analog
  const [isFlip, setIsFlip] = useState(false); // For Digital
  const [showHourNumbers, setShowHourNumbers] = useState(false); // Show 12/3/6/9 on analog clock

  // Legacy customization state (kept for Control compatibility, but mostly overridden by layout config)
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [customFont, setCustomFont] = useState<string | null>(null);

  // Controls & UI state
  const [controlsVisible, setControlsVisible] = useState(false);
  const [wisdom, setWisdom] = useState<string>("");
  const [showWisdom, setShowWisdom] = useState(true);
  const [isGeneratingWisdom, setIsGeneratingWisdom] = useState(false);
  const [customBackground, setCustomBackground] = useState<string | null>(null);

  // Layout Configuration
  const [layout, setLayout] = useState<LayoutConfig>(() => {
    const saved = localStorage.getItem('zenclock_layout_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old values if they seem out of range for new system or missing opacity
      if (Math.abs(parsed.dateLine?.y) > 50 || parsed.digitalClock?.zIndex === undefined || parsed.digitalClock?.opacity === undefined) {
        localStorage.removeItem('zenclock_layout_config');
        return {
          digitalClock: { id: 'digitalClock', x: 0, y: -20, scale: 1, rotation: 0, zIndex: 10, visible: true, opacity: 1, customColor: null },
          analogClock: { id: 'analogClock', x: 0, y: 0, scale: 0.8, rotation: 0, zIndex: 8, visible: true, opacity: 1, customColor: null },
          dateLine: { id: 'dateLine', x: 0, y: 25, scale: 1, rotation: 0, zIndex: 5, visible: true, opacity: 1, customColor: null },
        };
      }
      return parsed;
    }
    return {
      digitalClock: { id: 'digitalClock', x: 0, y: -20, scale: 1, rotation: 0, zIndex: 10, visible: true, opacity: 1, customColor: null },
      analogClock: { id: 'analogClock', x: 0, y: 0, scale: 0.8, rotation: 0, zIndex: 8, visible: true, opacity: 1, customColor: null },
      dateLine: { id: 'dateLine', x: 0, y: 25, scale: 1, rotation: 0, zIndex: 5, visible: true, opacity: 1, customColor: null },
    };
  });

  const [dragSensitivity, setDragSensitivity] = useState(() => {
    const saved = localStorage.getItem('zenclock_drag_sensitivity');
    return saved ? parseFloat(saved) : 1.0;
  });

  const [activeSettingsId, setActiveSettingsId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // AI Configuration
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('zenclock_ai_config');
    return saved ? JSON.parse(saved) : {
      provider: 'gemini',
      apiKey: '',
      baseUrl: '',
      model: 'gemini-3-flash-preview'
    };
  });

  const currentTheme = THEMES[themeId];

  // --- Effects ---

  // Persist State
  useEffect(() => {
    localStorage.setItem('zenclock_ai_config', JSON.stringify(aiConfig));
  }, [aiConfig]);

  useEffect(() => {
    localStorage.setItem('zenclock_layout_config', JSON.stringify(layout));
  }, [layout]);

  useEffect(() => {
    localStorage.setItem('zenclock_drag_sensitivity', dragSensitivity.toString());
  }, [dragSensitivity]);

  // Clear wisdom on theme change
  useEffect(() => {
    setWisdom("");
  }, [themeId]);

  // --- Handlers ---

  const handleConfigChange = (id: string, newConfig: Partial<ElementConfig>) => {
    setLayout(prev => ({
      ...prev,
      [id]: { ...prev[id as keyof LayoutConfig], ...newConfig }
    }));
  };

  // Maps element ID back to readable label
  const getElementLabel = (id: string) => {
    switch (id) {
      case 'digitalClock': return '数字时钟';
      case 'analogClock': return '圆形时钟';
      case 'dateLine': return '日期显示';
      default: return '元素';
    }
  };

  const activeElementConfig = activeSettingsId ? layout[activeSettingsId as keyof LayoutConfig] : null;

  // Global Controls Handlers
  const handleTopClick = () => setControlsVisible(true);
  const handleBackdropClick = () => setControlsVisible(false);

  const handleGenerateWisdom = async () => {
    if (isGeneratingWisdom) return;
    setIsGeneratingWisdom(true);
    // 按需读取当前时间，避免维持时间状态
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const timeString = `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
    const result = await generateTimeReflection(timeString, currentTheme.label, aiConfig);
    setWisdom(result);
    setIsGeneratingWisdom(false);
  };

  const handleUploadBackground = (file: File) => {
    const url = URL.createObjectURL(file);
    setCustomBackground(url);
  };

  const handleClearBackground = () => {
    if (customBackground) URL.revokeObjectURL(customBackground);
    setCustomBackground(null);
  };

  const handleResetStyle = () => {
    setCustomColor(null);
    setCustomFont(null);
  };

  // --- Rendering Helpers ---

  // This function decides which elements to render based on ClockMode
  // However, technically with the new system, all elements are "available" if they are visible in layout.
  // To preserve the "Mode" feel, we can toggling visibility in layout when mode changes?
  // OR we can just only render the components relevant to the current mode, but let them keep their positions.
  // Let's go with: Only render relevant components for current mode.
  const renderElements = () => {
    const elements = [];

    // Digital Clock
    if (clockMode === ClockMode.DIGITAL || clockMode === ClockMode.DUAL) {
      elements.push(
        <DraggableElement
          key="digitalClock"
          id="digitalClock"
          config={layout.digitalClock}
          onConfigChange={handleConfigChange}
          onDoubleClick={setActiveSettingsId}
          containerRef={containerRef}
          dragSensitivity={dragSensitivity}
        >
          <DigitalClock
            theme={currentTheme}
            showSeconds={showSeconds}
            use24Hour={use24Hour}
            customColor={layout.digitalClock.customColor || customColor}
            customFont={customFont}
            isFlip={isFlip}
            compact={clockMode === ClockMode.DUAL}
            showDate={false} // We render date separately now
          />
        </DraggableElement>
      );
    }

    // Analog Clock
    if (clockMode === ClockMode.ANALOG || clockMode === ClockMode.DUAL) {
      elements.push(
        <DraggableElement
          key="analogClock"
          id="analogClock"
          config={layout.analogClock}
          onConfigChange={handleConfigChange}
          onDoubleClick={setActiveSettingsId}
          containerRef={containerRef}
          dragSensitivity={dragSensitivity}
        >
          <Suspense fallback={null}>
            <AnalogClock
              theme={currentTheme}
              showSeconds={showSeconds}
              customColor={layout.analogClock.customColor || customColor}
              customFont={customFont}
              isSmooth={isSmooth}
              showHourNumbers={showHourNumbers}
            />
          </Suspense>
        </DraggableElement>
      );
    }

    // Date Line (Always available unless explicitly hidden, or maybe tied to Digital/Analog?)
    // User asked for "Digital, Round, and Date" as three elements.
    // Let's render it in all modes.
    elements.push(
      <DraggableElement
        key="dateLine"
        id="dateLine"
        config={layout.dateLine}
        onConfigChange={handleConfigChange}
        onDoubleClick={setActiveSettingsId}
        containerRef={containerRef}
        dragSensitivity={dragSensitivity}
      >
        <DateLine
          theme={currentTheme}
          use24Hour={use24Hour}
          customColor={layout.dateLine.customColor || customColor}
          customFont={customFont}
        />
      </DraggableElement>
    );

    return elements;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden transition-colors duration-700 ease-in-out flex flex-col items-center justify-center ${currentTheme.bgClass}`}
    >
      {/* Background Image Layer */}
      {(customBackground || currentTheme.backgroundImage) && (
        <div
          className={`absolute inset-0 bg-cover bg-center z-0 transition-all duration-1000 ${customBackground
            ? 'opacity-100'
            : 'opacity-40 mix-blend-overlay'
            }`}
          style={{ backgroundImage: `url(${customBackground || currentTheme.backgroundImage})` }}
        />
      )}

      {/* Dim overlay */}
      {customBackground && (
        <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />
      )}

      {/* Particles - 按需加载，NONE 模式下不会加载 MediaPipe 代码 */}
      {particleMode !== ParticleMode.NONE && (
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <ParticlesCanvas
              mode={particleMode}
              theme={currentTheme}
              isCameraEnabled={isCameraEnabled}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Top Trigger */}
      <div
        className={`absolute top-0 left-0 w-full h-24 z-40 cursor-pointer flex justify-center items-start pt-2 group transition-all duration-300 ${controlsVisible ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        onClick={handleTopClick}
        title="Settings"
      >
        <div className="w-32 h-1 bg-white/10 rounded-full group-hover:bg-white/40 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
      </div>

      {/* Backdrop */}
      {controlsVisible && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={handleBackdropClick}
        />
      )}

      {/* Draggable Elements Layer */}
      {/* We use a full-screen absolute container for the drag functionality reference */}
      <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
        {/* Pointer events are enabled on the children (DraggableElements) */}
        <div className="relative w-full h-full pointer-events-auto">
          {renderElements()}
        </div>
      </div>

      {/* Fixed Non-Draggable Content (Wisdom) */}
      {/* Positioned at bottom but not draggable for now to avoid clutter, or could be made draggable later */}
      <div className="absolute bottom-12 w-full px-4 z-10 pointer-events-none">
        <div
          className={`max-w-2xl mx-auto text-center transition-all duration-1000 ${wisdom && showWisdom ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          <p
            className={`text-xl md:text-2xl font-light italic leading-relaxed whitespace-pre-line ${!customColor ? currentTheme.accentClass : ''} ${!customFont ? currentTheme.fontFamily : ''}`}
            style={{
              color: customColor || undefined,
              fontFamily: customFont || undefined,
              opacity: customColor ? 0.8 : undefined
            }}
          >
            {wisdom}
          </p>
        </div>
      </div>

      {/* Popups */}
      {activeSettingsId && activeElementConfig && (
        <ElementSettings
          isOpen={!!activeSettingsId}
          elementId={activeSettingsId}
          elementLabel={getElementLabel(activeSettingsId)}
          config={activeElementConfig}
          onConfigChange={(newConfig) => handleConfigChange(activeSettingsId, newConfig)}
          onClose={() => setActiveSettingsId(null)}
          onReset={() => {
            // Reset to default entry for this ID
            const defaults = { x: 0, y: 0, scale: 1, rotation: 0, visible: true, opacity: 1, customColor: null };
            handleConfigChange(activeSettingsId, defaults);
          }}
        />
      )}

      {/* Main Controls */}
      <Controls
        isVisible={controlsVisible}
        currentThemeId={themeId}
        clockMode={clockMode}
        particleMode={particleMode}
        showSeconds={showSeconds}
        use24Hour={use24Hour}
        customBackground={customBackground}
        dragSensitivity={dragSensitivity}
        isCameraEnabled={isCameraEnabled}
        customColor={customColor}
        customFont={customFont}
        isSmooth={isSmooth}
        isFlip={isFlip}
        showHourNumbers={showHourNumbers}
        aiConfig={aiConfig}
        showWisdom={showWisdom}
        layout={layout}
        onThemeChange={setThemeId}
        onModeChange={setClockMode}
        onParticleModeChange={setParticleMode}
        onToggleSeconds={() => setShowSeconds(prev => !prev)}
        onToggle24Hour={() => setUse24Hour(prev => !prev)}
        onToggleSmooth={() => setIsSmooth(prev => !prev)}
        onToggleFlip={() => setIsFlip(prev => !prev)}
        onToggleHourNumbers={() => setShowHourNumbers(prev => !prev)}
        onGenerateWisdom={handleGenerateWisdom}
        onUploadBackground={handleUploadBackground}
        onClearBackground={handleClearBackground}
        onToggleCamera={() => setIsCameraEnabled(prev => !prev)}
        onColorChange={setCustomColor}
        onFontChange={setCustomFont}
        onResetStyle={handleResetStyle}
        onAIConfigChange={setAiConfig}
        onToggleWisdom={() => setShowWisdom(prev => !prev)}
        onResetLayout={() => {
          setLayout(prev => ({
            digitalClock: { ...prev.digitalClock, x: 0, y: -20, scale: 1, rotation: 0, opacity: 1 },
            analogClock: { ...prev.analogClock, x: 0, y: 0, scale: 0.8, rotation: 0, opacity: 1 },
            dateLine: { ...prev.dateLine, x: 0, y: 25, scale: 1, rotation: 0, opacity: 1 },
          }));
        }}
        onDragSensitivityChange={setDragSensitivity}
        onLayerChange={(elementId, zIndex) => {
          setLayout(prev => ({
            ...prev,
            [elementId]: { ...prev[elementId as keyof LayoutConfig], zIndex }
          }));
        }}
        isGenerating={isGeneratingWisdom}
      />
    </div>
  );
};

export default App;
