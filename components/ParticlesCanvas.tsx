import React, { useRef, useEffect, useState } from 'react';
import { ParticleMode, ThemeConfig, ThemeId } from '../types';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

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
      let radius = 300;
      if (interaction.type === GestureType.POINTING) radius = 200;
      if (interaction.type === GestureType.OPEN_HAND) radius = 500;
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
                const pullStrength = 40.0 * interaction.strength;
                const jitter = (Math.random() - 0.5) * 5;
                this.vx += Math.cos(angle) * pullStrength * force + jitter;
                this.vy += Math.sin(angle) * pullStrength * force + jitter;
                this.vx += Math.cos(angle + Math.PI / 2) * (pullStrength * 0.15);
                this.vy += Math.sin(angle + Math.PI / 2) * (pullStrength * 0.15);
                if (dist < 100) { this.vx *= 0.6; this.vy *= 0.6; }
                break;
              case GestureType.OPEN_HAND:
                const pushStrength = 15.0 * interaction.strength;
                this.vx -= Math.cos(angle) * force * pushStrength;
                this.vy -= Math.sin(angle) * force * pushStrength;
                break;
              case GestureType.POINTING:
                const magnetStrength = 0.8 * interaction.strength;
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

  // Hand Detection Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastGestureTypeRef = useRef<GestureType>(GestureType.NONE); // Optimization: Track last gesture

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
          // Use local WASM files for better Android WebView compatibility
          const wasmPath = '/mediapipe';
          const vision = await FilesetResolver.forVisionTasks(wasmPath);
          if (!isMounted) return;
          setModelStatus('WASM loaded, creating model...');

          // Try GPU first, fallback to CPU for Android WebView
          let landmarker: HandLandmarker | null = null;

          // Use local model file
          const modelPath = '/mediapipe/hand_landmarker.task';

          try {
            // First try with GPU
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
            console.log("HandLandmarker loaded with GPU");
          } catch (gpuError) {
            console.warn("GPU delegate failed, falling back to CPU:", gpuError);
            if (!isMounted) return;
            setModelStatus('GPU failed, trying CPU...');

            // Fallback to CPU
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
            console.log("HandLandmarker loaded with CPU fallback");
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
    if (isCameraEnabled) {
      const startVideo = async () => {
        setCameraStatus('Requesting camera...');
        try {
          // Check if mediaDevices API is available
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera API not available in this browser');
          }

          // Request camera permission with explicit front-facing camera
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 30 },
              facingMode: 'user' // Explicitly use front camera
            }
          });

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
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setCameraStatus(`Camera OK (${videoRef.current.videoWidth}x${videoRef.current.videoHeight})`);
            console.log("Camera started successfully:", videoRef.current.videoWidth, "x", videoRef.current.videoHeight);
          }
        } catch (err) {
          console.error("Camera Error:", err);
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          setCameraStatus(`Camera Error: ${errorMsg}`);
        }
      };
      startVideo();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraEnabled]);

  // 3. Main Animation & Detection Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isLightTheme = theme.id === ThemeId.MINIMAL_LIGHT;

    const initParticles = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      let count = 0;
      switch (mode) {
        case ParticleMode.SNOW: count = 200; break;
        case ParticleMode.STARS: count = 120; break;
        case ParticleMode.RAIN: count = 400; break; // Heavy rain
        case ParticleMode.MATRIX: count = 300; break;
        default: count = 0;
      }

      particlesRef.current = Array.from({ length: count }, () =>
        new Particle(canvas.width, canvas.height, mode, isLightTheme)
      );
    };

    const processHandGesture = (results: any): InteractionState => {
      if (!results.landmarks || results.landmarks.length === 0) {
        return { type: GestureType.NONE, x: 0, y: 0, strength: 0 };
      }

      const landmarks = results.landmarks[0];

      // Calculate screen positions
      const screenX = (1 - landmarks[0].x) * canvas.width;
      const screenY = landmarks[0].y * canvas.height;

      const indexTipX = (1 - landmarks[8].x) * canvas.width;
      const indexTipY = landmarks[8].y * canvas.height;

      const wrist = landmarks[0];
      const middleMCP = landmarks[9];

      const getDist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

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
      if (mode === ParticleMode.NONE) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      // 1. Detect Hands
      let currentInteraction: InteractionState = { type: GestureType.NONE, x: 0, y: 0, strength: 0 };

      if (isCameraEnabled && landmarkerRef.current && videoRef.current && videoRef.current.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = videoRef.current.currentTime;
        const startTimeMs = performance.now();
        const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
        currentInteraction = processHandGesture(results);

        // Optimization: Only update React state if the gesture type changes
        // This prevents 60fps re-renders of the component, significantly improving fluidity
        if (currentInteraction.type !== lastGestureTypeRef.current) {
          lastGestureTypeRef.current = currentInteraction.type;
          setGestureState(currentInteraction);
        }
      }

      // 2. Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 3. Visualize Interaction Zone -> REMOVED per user request for cleaner/smoother look

      // 4. Update Particles
      particlesRef.current.forEach(p => {
        p.update(canvas.width, canvas.height, mode, currentInteraction);
        p.draw(ctx, mode, currentInteraction);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    const handleResize = () => {
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [mode, theme.id, isCameraEnabled, isModelLoading]);

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