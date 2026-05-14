# For Clock Development Guide

This document provides comprehensive information for developers who want to contribute to or extend For Clock.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Code Structure](#code-structure)
4. [Core Components](#core-components)
5. [State Management](#state-management)
6. [AI Integration](#ai-integration)
7. [Particle System](#particle-system)
8. [Gesture Recognition](#gesture-recognition)
9. [Mobile Development](#mobile-development)
10. [Building and Deployment](#building-and-deployment)
11. [Testing](#testing)
12. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

For Clock is built with a modern React architecture using:

- **React 19** with functional components and hooks
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **Vite 6** as the build tool
- **Capacitor 8** for mobile app functionality

### Application Flow

```
User Input → Controls/Settings → State Updates → Component Re-renders → Visual Output
                                     ↓
                              LocalStorage Persistence
                                     ↓
                              AI Service (optional)
```

---

## Development Environment Setup

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **Git**

### For Mobile Development

**iOS:**
- macOS with latest Xcode
- Xcode Command Line Tools
- CocoaPods (`sudo gem install cocoapods`)
- Apple Developer account (for device testing)

**Android:**
- Android Studio (latest version)
- Android SDK (API 22 or higher)
- JDK 11 or higher
- Android Gradle Plugin

### Installation Steps

```bash
# Clone repository
git clone https://github.com/yourusername/zen-clock.git
cd zen-clock

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local and add your API key (optional)
# GEMINI_API_KEY=your_key_here

# Start development server
npm run dev
```

---

## Code Structure

### Directory Layout

```
zen-clock/
├── public/                    # Static assets
│   └── mediapipe/            # MediaPipe models
│       ├── hand_landmarker.task
│       └── vision_wasm_internal.js
│
├── src/
│   ├── components/           # React components
│   │   ├── AnalogClock.tsx   # Analog clock with smooth sweep
│   │   ├── DigitalClock.tsx  # Digital clock with flip animation
│   │   ├── DateLine.tsx      # Date display component
│   │   ├── ParticlesCanvas.tsx  # Particle effects renderer
│   │   ├── Controls.tsx      # Main control panel
│   │   ├── ElementSettings.tsx  # Per-element settings
│   │   ├── DraggableElement.tsx # Drag-and-drop wrapper
│   │   └── ErrorBoundary.tsx    # Error handling
│   │
│   ├── services/
│   │   └── geminiService.ts  # AI API integration
│   │
│   ├── constants.ts          # Theme configs, presets
│   ├── types.ts              # TypeScript definitions
│   ├── App.tsx               # Main application
│   └── index.tsx             # Entry point
│
├── android/                  # Android native project
├── ios/                      # iOS native project
├── capacitor.config.ts       # Capacitor configuration
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
└── package.json              # Dependencies
```

---

## Core Components

### App.tsx

The main application component that manages global state and coordinates all sub-components.

**Key Responsibilities:**
- Global state management (time, theme, mode, settings)
- LocalStorage persistence
- AI service integration
- Layout configuration

**State Structure:**
```typescript
interface AppState {
  time: TimeState;
  themeId: ThemeId;
  clockMode: ClockMode;
  particleMode: ParticleMode;
  layout: LayoutConfig;
  aiConfig: AIConfig;
  // ... more settings
}
```

### Clock Components

#### DigitalClock.tsx
- Renders digital time display
- Supports flip animation effect
- 12/24 hour format toggle
- Customizable colors and fonts

#### AnalogClock.tsx
- Renders analog clock face
- Smooth sweep or ticking seconds
- Optional hour markers (12, 3, 6, 9)
- SVG-based rendering for gradients

### DraggableElement.tsx

Provides drag-and-drop functionality for clock elements.

**Features:**
- Percentage-based positioning from center
- Rotation and scaling
- Touch and mouse support
- Configurable drag sensitivity

**Usage Example:**
```tsx
<DraggableElement
  id="digitalClock"
  config={layout.digitalClock}
  onConfigChange={handleConfigChange}
  dragSensitivity={1.0}
>
  <DigitalClock {...props} />
</DraggableElement>
```

### ParticlesCanvas.tsx

Renders particle effects using HTML5 Canvas.

**Supported Modes:**
- `NONE`: No particles
- `SNOW`: Falling snowflakes
- `STARS`: Floating stars with connections
- `RAIN`: Rain drops
- `MATRIX`: Code rain effect

---

## State Management

### LocalStorage Keys

For Clock persists user preferences in LocalStorage:

```typescript
// Layout configuration
localStorage.setItem('For Clock_layout_config', JSON.stringify(layout));

// AI configuration
localStorage.setItem('For Clock_ai_config', JSON.stringify(aiConfig));

// Drag sensitivity
localStorage.setItem('For Clock_drag_sensitivity', dragSensitivity.toString());
```

### State Updates

All state updates follow React best practices:

```typescript
const handleConfigChange = (id: string, newConfig: Partial<ElementConfig>) => {
  setLayout(prev => ({
    ...prev,
    [id]: { ...prev[id as keyof LayoutConfig], ...newConfig }
  }));
};
```

---

## AI Integration

### Service Architecture

Located in `services/geminiService.ts`, the AI service supports multiple providers:

1. **Google Gemini** (default)
2. **ModelScope**
3. **Custom OpenAI-compatible APIs**

### Implementation

```typescript
export const generateTimeReflection = async (
  timeString: string,
  themeLabel: string,
  config?: AIConfig
): Promise<string> => {
  const prompt = `
    You are a poetic clock screensaver assistant.
    The current time is ${timeString}.
    The visual theme is "${themeLabel}".
    Write a short, artistic, and abstract reflection on this specific time of day.
    Strictly follow this output format:
    Line 1: English sentence (max 15 words)
    Line 2: Chinese translation
  `;

  // Custom provider handling
  if (config && config.provider !== 'gemini') {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: "You are a poetic clock screensaver assistant." },
          { role: 'user', content: prompt }
        ]
      })
    });
    // ... handle response
  }

  // Gemini handling
  const aiClient = new GoogleGenAI({ apiKey: config?.apiKey || process.env.API_KEY });
  const response = await aiClient.models.generateContent({
    model: config?.model || 'gemini-3-flash-preview',
    contents: prompt
  });
  
  return response.text?.trim();
};
```

### Adding a New AI Provider

1. Add provider type to `types.ts`:
```typescript
export type AIProvider = 'gemini' | 'modelscope' | 'custom' | 'your-provider';
```

2. Implement provider logic in `geminiService.ts`:
```typescript
if (config.provider === 'your-provider') {
  // Your implementation
}
```

---

## Particle System

### Architecture

The particle system uses HTML5 Canvas with requestAnimationFrame for smooth animations.

### Particle Types

#### Snow
```typescript
interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  wind: number;
}
```

#### Stars
```typescript
interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
}
// Plus constellation lines between nearby stars
```

#### Rain
```typescript
interface Raindrop {
  x: number;
  y: number;
  length: number;
  speed: number;
}
```

#### Matrix
```typescript
interface CodeColumn {
  x: number;
  y: number;
  chars: string[];
  speed: number;
}
```

### Gesture Interaction

Particles respond to hand gestures through MediaPipe:

```typescript
// Example: Attraction effect
const applyGestureForce = (particle: Particle, handPosition: Vector2, gesture: Gesture) => {
  if (gesture === 'FIST') {
    const force = calculateAttraction(particle.position, handPosition);
    particle.velocity.add(force);
  } else if (gesture === 'OPEN_HAND') {
    const force = calculateRepulsion(particle.position, handPosition);
    particle.velocity.add(force);
  }
};
```

---

## Gesture Recognition

### MediaPipe Integration

For Clock uses MediaPipe Tasks Vision for hand tracking.

### Setup

```typescript
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

let handLandmarker: HandLandmarker | null = null;

const initializeHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
  );
  
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: '/mediapipe/hand_landmarker.task',
      delegate: 'GPU'
    },
    runningMode: 'VIDEO',
    numHands: 2
  });
};
```

### Gesture Detection

```typescript
const detectGesture = (landmarks: Array<{x: number, y: number, z: number}>): Gesture => {
  // Check finger states
  const isFist = checkFist(landmarks);
  const isOpenHand = checkOpenHand(landmarks);
  const isPointing = checkPointing(landmarks);
  
  if (isFist) return 'FIST';
  if (isOpenHand) return 'OPEN_HAND';
  if (isPointing) return 'POINTING';
  
  return 'NONE';
};
```

### Adding New Gestures

1. Define gesture in types:
```typescript
export type Gesture = 'FIST' | 'OPEN_HAND' | 'POINTING' | 'YOUR_GESTURE';
```

2. Implement detection logic:
```typescript
const checkYourGesture = (landmarks: Landmark[]): boolean => {
  // Your gesture recognition logic
  return true;
};
```

3. Add particle interaction in `ParticlesCanvas.tsx`

---

## Mobile Development

### Capacitor Configuration

`capacitor.config.ts`:
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.For Clock.app',
  appName: 'For Clock',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
  ios: {
    allowsLinkPreview: false,
  },
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  }
};

export default config;
```

### iOS Development

1. **Sync to iOS:**
```bash
npm run sync:ios
```

2. **Configure in Xcode:**
   - Open `ios/App/App.xcworkspace`
   - Select development team
   - Configure signing
   - Set bundle identifier

3. **Camera Permission:**
Add to `Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>For Clock uses camera for gesture control</string>
```

### Android Development

1. **Sync to Android:**
```bash
npm run sync:android
```

2. **Configure in Android Studio:**
   - Open `android/app`
   - Sync Gradle
   - Configure signing for release

3. **Camera Permission:**
Already declared in `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
```

---

## Building and Deployment

### Development Build

```bash
npm run dev
```

### Production Build

```bash
# Build web assets
npm run build

# Preview production build
npm run preview
```

### Mobile Build

```bash
# Build and sync
npm run build:cap

# Or separately
npm run build
npm run sync
```

### Environment Variables

Vite configuration injects environment variables:

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    }
  };
});
```

---

## Testing

### Manual Testing Checklist

**Core Functionality:**
- [ ] All clock modes work correctly
- [ ] Time updates every second
- [ ] All themes display properly
- [ ] Particle effects render smoothly
- [ ] Control panel opens/closes
- [ ] Settings persist after refresh

**Advanced Features:**
- [ ] AI reflection generation works
- [ ] Custom AI provider configuration works
- [ ] Gesture recognition detects hand
- [ ] Particle interactions respond to gestures
- [ ] Element dragging works smoothly
- [ ] Element settings save correctly

**Mobile:**
- [ ] App builds successfully for iOS/Android
- [ ] Camera permission prompts correctly
- [ ] Touch gestures work for dragging
- [ ] App runs in fullscreen

### Browser Testing

Test on multiple browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Troubleshooting

### Common Issues

#### 1. AI Not Working

**Problem:** AI reflection shows fallback text

**Solution:**
- Check if API key is set in `.env.local`
- Verify API key is valid
- Check browser console for errors
- Ensure network connection allows API access

#### 2. Camera Not Working

**Problem:** Gesture control doesn't detect hands

**Solution:**
- Grant camera permission in browser
- Check if camera is being used by another app
- Ensure MediaPipe models loaded correctly
- Try different browser

#### 3. Build Fails

**Problem:** `npm run build` fails

**Solution:**
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

#### 4. Mobile Sync Issues

**Problem:** Changes don't appear in mobile app

**Solution:**
```bash
# Clean and resync
npm run build
npm run sync:ios  # or sync:android
```

#### 5. Dragging Not Smooth

**Problem:** Element dragging is jerky

**Solution:**
- Reduce drag sensitivity in settings
- Check for browser performance issues
- Close other resource-intensive tabs

### Performance Optimization

If experiencing performance issues:

1. **Reduce particle count** in `ParticlesCanvas.tsx`
2. **Disable smooth sweep** for analog clock
3. **Lower canvas resolution**
4. **Use requestAnimationFrame** properly
5. **Memoize expensive calculations**

---

## Contributing Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Use functional components with hooks
- Avoid inline styles (use Tailwind classes)
- Add JSDoc comments for complex functions

### Commit Messages

Follow conventional commits:
```
feat: add new particle effect
fix: resolve gesture detection issue
docs: update development guide
style: improve button styling
refactor: optimize particle rendering
test: add unit tests for AI service
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes and test thoroughly
3. Update documentation if needed
4. Submit PR with clear description
5. Address review feedback
6. Squash commits before merge

---

## API Reference

### Types

See `types.ts` for complete type definitions:

```typescript
enum ClockMode { DIGITAL, ANALOG, DUAL, TEXT }
enum ThemeId { MINIMAL_DARK, MINIMAL_LIGHT, NEON_CYBERPUNK, FOREST_GLASS, TERMINAL_RETRO }
enum ParticleMode { NONE, SNOW, STARS, RAIN, MATRIX }

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface ElementConfig {
  id: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
  visible: boolean;
  opacity: number;
  customColor: string | null;
}
```

### Available Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "build:cap": "vite build && npx cap sync",
  "sync": "npx cap sync",
  "sync:ios": "npx cap sync ios",
  "sync:android": "npx cap sync android",
  "open:ios": "npx cap open ios",
  "open:android": "npx cap open android",
  "generate-icons": "node scripts/generate-icons.cjs"
}
```

---

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [MediaPipe](https://mediapipe.dev/)
- [Google Gemini API](https://ai.google.dev/docs)

---

## Support

For development questions:
- Check existing GitHub Issues
- Read this documentation thoroughly
- Join community discussions
- Contact maintainers

---

**Happy Coding! 🚀**
