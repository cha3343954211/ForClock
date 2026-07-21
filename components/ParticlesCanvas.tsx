import React, { useRef, useEffect, useState } from 'react';
import { ParticleMode, ThemeConfig, ThemeId } from '../types';
// 注意：MediaPipe SDK 通过动态 import 加载，仅在 isCameraEnabled 时下载
// 这样关闭手势识别的用户可节省约 200KB 解析代码
import type { HandLandmarker as HandLandmarkerType } from '@mediapipe/tasks-vision';

interface ParticlesCanvasProps {
  mode: ParticleMode;
  theme: ThemeConfig;
  isCameraEnabled: boolean;
}

// Gesture Types
enum GestureType {
  NONE = 'NONE',
  OPEN_HAND = 'OPEN_HAND', // Scatter / Umbrella
  FIST = 'FIST',           // Super Gather / Time Stop / Crash
  POINTING = 'POINTING'    // Gentle Attraction / Wind / Hack
}

interface InteractionState {
  type: GestureType;
  x: number;
  y: number;
  strength: number;
}

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&';

/** MediaPipe 手部关键点结构 */
interface Landmark {
  x: number;
  y: number;
  z: number;
}

interface HandLandmarkerResult {
  landmarks: Landmark[][];
}

// --- 粒子配置常量 ---
const PARTICLE_COUNT = {
  SNOW: 200,
  STARS: 120,
  RAIN: 400,
  MATRIX: 300,
} as const;

const INTERACTION_RADIUS = {
  DEFAULT: 300,
  POINTING: 200,
  OPEN_HAND: 500,
} as const;

const PHYSICS = {
  FIST_PULL: 40.0,
  OPEN_PUSH: 15.0,
  POINT_MAGNET: 0.8,
  RAIN_WIND: 2,
  MATRIX_DISTORT: 5,
} as const;

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  color: string;
  baseColor: string;
  alpha: number;

  // New props for advanced modes
  char: string;
  speed: number;

  // Physics & State
  originalVx: number;
  originalVy: number;
  friction: number;
  isAffected: boolean;

  constructor(canvasWidth: number, canvasHeight: number, mode: ParticleMode, isLightTheme: boolean) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.isAffected = false;
    this.char = '';
    this.speed = 1;

    // Default Colors
    const baseColorStr = isLightTheme ? '0, 0, 0' : '255, 255, 255';
    this.baseColor = baseColorStr;
    this.color = baseColorStr;
    this.friction = 0.95; // Default friction

    switch (mode) {
      case ParticleMode.SNOW:
        this.y = Math.random() * -canvasHeight;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = Math.random() * 2 + 1;
        this.baseSize = Math.random() * 2 + 1;
        this.friction = 0.98;
        this.alpha = Math.random() * 0.5 + 0.3;
        break;

      case ParticleMode.STARS:
        this.vx = (Math.random() - 0.5) * 0.1;
        this.vy = (Math.random() - 0.5) * 0.1;
        this.baseSize = Math.random() * 1.5 + 0.5;
        this.alpha = Math.random() * 0.8 + 0.2;
        break;

      case ParticleMode.RAIN:
        this.y = Math.random() * -canvasHeight;
        this.vx = 0;
        this.vy = Math.random() * 15 + 10; // Fast falling
        this.baseSize = Math.random() * 20 + 10; // Length of rain drop
        this.baseColor = isLightTheme ? '100, 100, 150' : '150, 200, 255';
        this.color = this.baseColor;
        this.alpha = Math.random() * 0.3 + 0.1;
        this.friction = 0.9;
        break;

      case ParticleMode.MATRIX:
        this.y = Math.random() * -canvasHeight;
        this.x = Math.floor(Math.random() * (canvasWidth / 14)) * 14; // Grid alignment
        this.vx = 0;
        this.vy = Math.random() * 4 + 2;
        this.baseSize = 14; // Font size
        this.baseColor = isLightTheme ? '0, 100, 0' : '0, 255, 70'; // Matrix Green
        this.color = this.baseColor;
        this.alpha = Math.random() * 0.8 + 0.2;
        this.char = CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
        this.speed = Math.random() * 0.1; // Character switch speed
        break;

      default:
        this.vx = 0;
        this.vy = 0;
        this.baseSize = 0;
        this.alpha = 0;
    }

    this.size = this.baseSize;
    this.originalVx = this.vx;
    this.originalVy = this.vy;
  }

  update(width: number, height: number, mode: ParticleMode, interaction: InteractionState) {
    this.isAffected = false;

    // --- Advanced Gesture Physics ---
    if (interaction.type !== GestureType.NONE) {
      const dx = interaction.x - this.x;
      const dy = interaction.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Interaction Radius depends on gesture
      let radius: number = INTERACTION_RADIUS.DEFAULT;
      if (interaction.type === GestureType.POINTING) radius = INTERACTION_RADIUS.POINTING;
      if (interaction.type === GestureType.OPEN_HAND) radius = INTERACTION_RADIUS.OPEN_HAND;
      if (interaction.type === GestureType.FIST) radius = Math.max(width, height) * 2;

      if (dist < radius) {
        this.isAffected = true;
        const force = (radius - dist) / radius; // 0 to 1
        const angle = Math.atan2(dy, dx);

        switch (mode) {
          case ParticleMode.RAIN:
            // Rain Logic
            if (interaction.type === GestureType.FIST) {
              // Time Freeze
              this.vx *= 0.5;
              this.vy *= 0.1;
            } else if (interaction.type === GestureType.OPEN_HAND) {
              // Umbrella / Deflection
              // Push sideways away from hand
              this.vx -= Math.cos(angle) * force * 10;
              // If above hand, slow down y
              if (this.y < interaction.y) this.vy -= force * 2;
            } else if (interaction.type === GestureType.POINTING) {
              // Wind
              this.vx += Math.cos(angle) * force * 2;
            }
            break;

          case ParticleMode.MATRIX:
            // Matrix Logic
            if (interaction.type === GestureType.FIST) {
              // Crash / Glitch
              this.color = '255, 50, 50'; // Red error
              this.vx += (Math.random() - 0.5) * 10; // Shake
              this.vy = 0;
            } else if (interaction.type === GestureType.OPEN_HAND) {
              // Distortion Field
              this.vx -= Math.cos(angle) * force * 5;
              this.vy -= Math.sin(angle) * force * 5;
              this.color = '255, 255, 255'; // White hot
            } else if (interaction.type === GestureType.POINTING) {
              // Data Stream - Hacking effect with golden color
              this.vx += Math.cos(angle) * force * 2;
              this.vy += Math.sin(angle) * force * 2;
              this.color = '255, 215, 0'; // Golden hacker color
            }
            break;

          default:
            // Standard Logic for Snow/Stars
            switch (interaction.type) {
              case GestureType.FIST:
                const pullStrength = PHYSICS.FIST_PULL * interaction.strength;
                const jitter = (Math.random() - 0.5) * 5;
                this.vx += Math.cos(angle) * pullStrength * force + jitter;
                this.vy += Math.sin(angle) * pullStrength * force + jitter;
                this.vx += Math.cos(angle + Math.PI / 2) * (pullStrength * 0.15);
                this.vy += Math.sin(angle + Math.PI / 2) * (pullStrength * 0.15);
                if (dist < 100) { this.vx *= 0.6; this.vy *= 0.6; }
                break;
              case GestureType.OPEN_HAND:
                const pushStrength = PHYSICS.OPEN_PUSH * interaction.strength;
                this.vx -= Math.cos(angle) * force * pushStrength;
                this.vy -= Math.sin(angle) * force * pushStrength;
                break;
              case GestureType.POINTING:
                const magnetStrength = PHYSICS.POINT_MAGNET * interaction.strength;
                this.vx += Math.cos(angle) * force * magnetStrength;
                this.vy += Math.sin(angle) * force * magnetStrength;
                break;
            }
        }
      } else {
        // Reset Matrix color if not affected
        if (mode === ParticleMode.MATRIX) {
          this.color = this.baseColor;
        }
      }
    } else {
      if (mode === ParticleMode.MATRIX) this.color = this.baseColor;
    }

    // --- Basic Movement ---
    this.x += this.vx;
    this.y += this.vy;

    // --- Friction & Restoration ---
    // Specialized restoration for Rain/Matrix to maintain downward flow
    if (mode === ParticleMode.RAIN || mode === ParticleMode.MATRIX) {
      // Return to terminal velocity
      const terminalVy = mode === ParticleMode.RAIN ? this.originalVy : this.originalVy;
      this.vy += (terminalVy - this.vy) * 0.05;
      this.vx *= 0.9; // Air resistance for sideways movement
    } else {
      const dvx = this.vx - this.originalVx;
      const dvy = this.vy - this.originalVy;
      let restorationFactor = 1 - this.friction;
      if (interaction.type === GestureType.FIST && this.isAffected) {
        restorationFactor = 0.1;
      }
      this.vx -= dvx * restorationFactor;
      this.vy -= dvy * restorationFactor;
    }

    // --- Matrix Char Update ---
    if (mode === ParticleMode.MATRIX && Math.random() < this.speed) {
      this.char = CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
    }

    // --- Boundaries & Lifecycle ---
    switch (mode) {
      case ParticleMode.SNOW:
        this.x += Math.sin(this.y * 0.02) * 0.5;
        if (this.y > height + 10 || this.y < -height) {
          this.y = -10;
          this.x = Math.random() * width;
          this.vx = this.originalVx;
          this.vy = this.originalVy;
        }
        break;

      case ParticleMode.STARS:
        if (Math.random() < 0.01) this.alpha = Math.random();
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
        break;

      case ParticleMode.RAIN:
        if (this.y > height) {
          this.y = -50;
          this.x = Math.random() * width;
          this.vy = this.originalVy; // Reset speed
          this.vx = 0;
        }
        break;

      case ParticleMode.MATRIX:
        if (this.y > height) {
          this.y = -20;
          this.char = CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
          this.vy = this.originalVy;
          this.vx = 0;
        }
        break;
    }
  }

  draw(ctx: CanvasRenderingContext2D, mode: ParticleMode, interaction: InteractionState) {
    if (mode === ParticleMode.STARS && interaction.type !== GestureType.NONE && this.isAffected) {
      const dx = this.x - interaction.x;
      const dy = this.y - interaction.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const connectDist = interaction.type === GestureType.FIST ? 800 : 250;
      if (dist < connectDist) {
        const opacity = (1 - dist / connectDist) * 0.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(interaction.x, interaction.y);
        if (interaction.type === GestureType.FIST) ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
        else if (interaction.type === GestureType.OPEN_HAND) ctx.strokeStyle = `rgba(255, 100, 100, ${opacity})`;
        else ctx.strokeStyle = `rgba(255, 255, 200, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    if (mode === ParticleMode.RAIN) {
      ctx.beginPath();
      // Draw rain as a line
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.vx * 2, this.y + this.size);
      ctx.strokeStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (mode === ParticleMode.MATRIX) {
      ctx.font = `${this.size}px monospace`;
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.fillText(this.char, this.x, this.y);
    } else {
      // Default Circle Draw
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.fill();
    }
  }
}

export const ParticlesCanvas: React.FC<ParticlesCanvasProps> = ({ mode, theme, isCameraEnabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  // CSS 像素尺寸（与 devicePixelRatio 解耦），粒子坐标与边界判定统一使用此值
  const dimensionsRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  // Hand Detection Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const landmarkerRef = useRef<HandLandmarkerType | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastGestureTypeRef = useRef<GestureType>(GestureType.NONE);
  // 粒子物理直接读此 ref，不触发 React re-render
  const interactionRef = useRef<InteractionState>({ type: GestureType.NONE, x: 0, y: 0, strength: 0 });
  // 主题明暗标记用 ref 跟踪，主题切换时不重建整个粒子系统（仅影响新建粒子的颜色）
  const isLightThemeRef = useRef<boolean>(theme.id === ThemeId.MINIMAL_LIGHT);
  // 每隔 N 帧才跑一次推理（15fps 检测 + 60fps 渲染，分离两个循环）
  const frameCountRef = useRef<number>(0);
  const DETECT_EVERY_N = 4; // 60fps ÷ 4 ≈ 15fps 推理

  const [gestureState, setGestureState] = useState<InteractionState>({ type: GestureType.NONE, x: 0, y: 0, strength: 0 });
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<string>('');
  const [modelStatus, setModelStatus] = useState<string>('');

  // 1. Initialize HandLandmarker with GPU fallback to CPU
  useEffect(() => {
    let isMounted = true;

    if (isCameraEnabled) {
      const initLandmarker = async () => {
        if (!isMounted) return;
        setIsModelLoading(true);
        setModelStatus('Loading WASM...');

        try {
          // 动态加载 MediaPipe SDK（仅在用户启用摄像头时下载）
          setModelStatus('Loading SDK...');
          const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
          if (!isMounted) return;

          // Use local WASM files for better Android WebView compatibility
          const wasmPath = '/mediapipe';
          const vision = await FilesetResolver.forVisionTasks(wasmPath);
          if (!isMounted) return;
          setModelStatus('WASM loaded, creating model...');

          // Try GPU first, fallback to CPU for Android WebView
          let landmarker: HandLandmarkerType | null = null;

          // Use local model file
          const modelPath = '/mediapipe/hand_landmarker.task';

          try {
            // First try with GPU - HandLandmarker comes from dynamic import above
            landmarker = await HandLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: modelPath,
                delegate: "GPU"
              },
              runningMode: "VIDEO",
              numHands: 1
            });
            if (!isMounted) {
              landmarker.close();
              return;
            }
            setModelStatus('Model loaded (GPU)');
          } catch (gpuError) {
            console.warn("GPU delegate failed, falling back to CPU:", gpuError);
            if (!isMounted) return;
            setModelStatus('GPU failed, trying CPU...');

            // Fallback to CPU - HandLandmarker comes from dynamic import above
            landmarker = await HandLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: modelPath,
                delegate: "CPU"
              },
              runningMode: "VIDEO",
              numHands: 1
            });
            if (!isMounted) {
              landmarker.close();
              return;
            }
            setModelStatus('Model loaded (CPU)');
          }

          landmarkerRef.current = landmarker;
        } catch (e) {
          console.error("Failed to load MediaPipe:", e);
          if (isMounted) {
            setModelStatus(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
          }
        }
        if (isMounted) {
          setIsModelLoading(false);
        }
      };
      initLandmarker();
    } else {
      setModelStatus('');
      setCameraStatus('');
    }

    return () => {
      isMounted = false;
      // Clean up MediaPipe resources
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, [isCameraEnabled]);

  // 2. Initialize Camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;
    if (isCameraEnabled) {
      const startVideo = async () => {
        setCameraStatus('Requesting camera...');
        try {
          // Check if mediaDevices API is available
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera API not available in this browser');
          }

          // Request camera permission with explicit front-facing camera
          // 320×240@15fps — MediaPipe 精度足够，主线程压力减少 75%
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width:  { ideal: 320 },
              height: { ideal: 240 },
              frameRate: { ideal: 15, max: 20 },
              facingMode: 'user'
            }
          });

          // 组件在 await 期间卸载：立即释放刚拿到的 stream
          if (!isMounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }

          setCameraStatus('Camera stream obtained');

          if (!videoRef.current) {
            const video = document.createElement('video');
            video.width = 640;
            video.height = 480;
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;
            // Critical for Android WebView
            video.setAttribute('playsinline', 'true');
            video.setAttribute('webkit-playsinline', 'true');
            videoRef.current = video;
          }

          if (videoRef.current) {
            videoRef.current.width  = 320;
            videoRef.current.height = 240;
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            if (!isMounted) return;
            setCameraStatus(`Camera OK (${videoRef.current.videoWidth}x${videoRef.current.videoHeight})`);
          }
        } catch (err) {
          if (!isMounted) return;
          console.error("Camera Error:", err);
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          setCameraStatus(`Camera Error: ${errorMsg}`);
        }
      };
      startVideo();
    }

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      // 彻底释放 video 元素，避免 srcObject 持有已关闭的 stream
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };
  }, [isCameraEnabled]);

  // 3. Main Animation & Detection Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initParticles = () => {
      // 适配 devicePixelRatio：canvas 内部尺寸用设备像素，绘制坐标用 CSS 像素
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      dimensionsRef.current = { w, h };
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const COUNT_MAP: Partial<Record<ParticleMode, number>> = {
        [ParticleMode.SNOW]:   PARTICLE_COUNT.SNOW,
        [ParticleMode.STARS]:   PARTICLE_COUNT.STARS,
        [ParticleMode.RAIN]:   PARTICLE_COUNT.RAIN,
        [ParticleMode.MATRIX]: PARTICLE_COUNT.MATRIX,
      };
      const count = COUNT_MAP[mode] ?? 0;

      particlesRef.current = Array.from({ length: count }, () =>
        new Particle(w, h, mode, isLightThemeRef.current)
      );
    };

    const processHandGesture = (results: HandLandmarkerResult): InteractionState => {
      if (!results.landmarks || results.landmarks.length === 0) {
        return { type: GestureType.NONE, x: 0, y: 0, strength: 0 };
      }

      const landmarks = results.landmarks[0];

      // Calculate screen positions（使用 CSS 像素，与粒子坐标系一致）
      const { w: cw, h: ch } = dimensionsRef.current;
      const screenX = (1 - landmarks[0].x) * cw;
      const screenY = landmarks[0].y * ch;

      const indexTipX = (1 - landmarks[8].x) * cw;
      const indexTipY = landmarks[8].y * ch;

      const wrist = landmarks[0];
      const middleMCP = landmarks[9];

      const getDist = (p1: Landmark, p2: Landmark) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

      const palmSize = getDist(wrist, middleMCP);

      const EXTENDED_THRESHOLD = 1.6 * palmSize;
      const FOLDED_THRESHOLD = 1.2 * palmSize;

      const dIndex = getDist(wrist, landmarks[8]);
      const dMiddle = getDist(wrist, landmarks[12]);
      const dRing = getDist(wrist, landmarks[16]);
      const dPinky = getDist(wrist, landmarks[20]);

      const isIndexOpen = dIndex > EXTENDED_THRESHOLD;
      const isMiddleOpen = dMiddle > EXTENDED_THRESHOLD;
      const isRingOpen = dRing > EXTENDED_THRESHOLD;

      const isMiddleFolded = dMiddle < FOLDED_THRESHOLD;
      const isRingFolded = dRing < FOLDED_THRESHOLD;
      const isPinkyFolded = dPinky < FOLDED_THRESHOLD;
      const isIndexFolded = dIndex < FOLDED_THRESHOLD;

      // 1. POINTING
      if (isIndexOpen && isMiddleFolded && isRingFolded && isPinkyFolded) {
        return { type: GestureType.POINTING, x: indexTipX, y: indexTipY, strength: 1.0 };
      }

      // 2. FIST
      if (isIndexFolded && isMiddleFolded && isRingFolded && isPinkyFolded) {
        return { type: GestureType.FIST, x: screenX, y: screenY, strength: 1.0 };
      }

      // 3. OPEN
      if (isIndexOpen && isMiddleOpen && isRingOpen) {
        return { type: GestureType.OPEN_HAND, x: screenX, y: screenY, strength: 1.0 };
      }

      return { type: GestureType.NONE, x: screenX, y: screenY, strength: 0 };
    };

    const animate = () => {
      const { w, h } = dimensionsRef.current;
      if (mode === ParticleMode.NONE) {
        ctx.clearRect(0, 0, w, h);
        return;
      }

      // 1. Detect Hands（每 DETECT_EVERY_N 帧跑一次推理，其余帧复用上次结果）
      frameCountRef.current++;
      if (
        isCameraEnabled &&
        landmarkerRef.current &&
        videoRef.current &&
        frameCountRef.current % DETECT_EVERY_N === 0 &&
        videoRef.current.currentTime !== lastVideoTimeRef.current
      ) {
        lastVideoTimeRef.current = videoRef.current.currentTime;
        const results = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
        const detected = processHandGesture(results);
        interactionRef.current = detected; // 粒子物理读 ref，零 re-render

        // UI 指示器：仅手势类型变化时才触发 React 重渲染
        if (detected.type !== lastGestureTypeRef.current) {
          lastGestureTypeRef.current = detected.type;
          setGestureState(detected);
        }
      }

      // 2. Clear
      ctx.clearRect(0, 0, w, h);

      // 3. Update Particles（读 interactionRef，不依赖 React state，无需等待重渲染）
      const ci = interactionRef.current;
      particlesRef.current.forEach(p => {
        p.update(w, h, mode, ci);
        p.draw(ctx, mode, ci);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    // 防抖 200ms，避免拖拽窗口时频繁重建粒子丢失状态
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initParticles();
      }, 200);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  // 移除 isModelLoading 依赖：模型加载完毕不应重建整个粒子系统
  // landmarkerRef.current 在推理前会做 null 检查，无需在 effect 层感知
  // theme.id 不再作为依赖：主题切换仅更新 isLightThemeRef，不重建粒子系统
  }, [mode, isCameraEnabled]);

  // 主题切换时同步 isLightThemeRef（不触发粒子重建，仅影响新建粒子的颜色）
  useEffect(() => {
    isLightThemeRef.current = theme.id === ThemeId.MINIMAL_LIGHT;
  }, [theme.id]);

  if (mode === ParticleMode.NONE) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />
      {isCameraEnabled && (
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1 z-40 opacity-90 pointer-events-none select-none">
          {/* Debug status info */}
          {(cameraStatus || modelStatus) && (
            <div className="text-[9px] text-white/70 font-mono bg-black/30 px-2 py-1 rounded mb-1">
              {modelStatus && <div>Model: {modelStatus}</div>}
              {cameraStatus && <div>Camera: {cameraStatus}</div>}
            </div>
          )}

          {isModelLoading ? (
            <span className="text-xs text-yellow-400 font-mono animate-pulse">Loading Hand Vision...</span>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-300 ${gestureState.type === GestureType.FIST ? 'bg-cyan-400 text-cyan-400' :
                  gestureState.type === GestureType.OPEN_HAND ? 'bg-red-400 text-red-400' :
                    gestureState.type === GestureType.POINTING ? 'bg-yellow-400 text-yellow-400' :
                      'bg-gray-500 text-gray-500'
                  }`} />
                <span className="text-[10px] text-white/90 font-mono tracking-widest uppercase font-bold text-shadow">
                  {gestureState.type === GestureType.NONE ? "No Hand" : gestureState.type}
                </span>
              </div>
              <div className="text-[9px] text-white/50 flex flex-col items-end gap-0.5">
                {mode === ParticleMode.RAIN ? (
                  <>
                    <span>✊ Fist: Time Stop</span>
                    <span>🖐 Open: Umbrella</span>
                    <span>👆 Point: Wind</span>
                  </>
                ) : mode === ParticleMode.MATRIX ? (
                  <>
                    <span>✊ Fist: System Crash</span>
                    <span>🖐 Open: Distortion</span>
                    <span>👆 Point: Hack</span>
                  </>
                ) : (
                  <>
                    <span>✊ Fist: Super Gather</span>
                    <span>🖐 Open: Scatter</span>
                    <span>👆 Point: Gentle Pull</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};