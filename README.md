<div align="center">

<img width="1200" height="475" alt="For Clock Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🕐 For Clock - 禅意时钟屏保

**一款融合美学、人工智能与互动体验的现代化时钟屏保应用**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Usage Guide](#-usage-guide) • [Development](#-development) • [Mobile Apps](#-mobile-apps) • [Contributing](#-contributing)

[English](#english) | [中文](#中文)

</div>

---

<div align="center">

## ✨ Features

</div>

### 🎨 Multiple Clock Modes
- **Digital Mode**: Classic digital display with realistic **flip animation** effect
- **Analog Mode**: Elegant clock face with optional **smooth sweep** second hand
- **Dual Mode**: Display both analog and mini flip clock simultaneously

### 🎭 Rich Theme Collection
- **Midnight Void**: Deep black minimalist design
- **Paper White**: Clean white background with ink-like text
- **Cyberpunk Neon**: Cool neon glow with high-contrast colors
- **Misty Forest**: Natural style with background imagery
- **Retro Terminal**: Green code style, tribute to vintage computers

### 🌟 Immersive Particle Effects
Interactive particle systems that respond to mouse and gestures:
- **None**: Pure clean background
- **Snow**: Gently falling snowflakes
- **Stars**: Slowly floating stars with constellation connections
- **Rain**: Heavy rainfall effect
- **Matrix**: Classic green code rain

### 🤖 AI-Powered Time Reflections
Integrated with **Google Gemini AI** to generate poetic reflections or philosophical thoughts about time based on current time and selected theme.

### 🎛️ Advanced Customization
- **Custom Colors**: Solid colors or gradients (Sunset, Ocean, Aurora, etc.)
- **Custom Fonts**: Modern sans-serif, serif, monospace, and more
- **Background Upload**: Use your own images as background
- **Element Positioning**: Freely adjust clock position, size, and rotation
- **Layer Control**: Manage z-index of each element

### 📱 Cross-Platform Support
- **Web Browser**: Run directly in any modern browser
- **Mobile Apps**: iOS and Android native apps via Capacitor

### 🎯 Perfect For
- 📱 **Mobile devices**: Primary platform for best experience
- 💻 Desktop screensaver replacement
- 🧘 Relaxation and mindfulness
- 🏢 Office ambient display
- 📺 Meditation and focus sessions

---

<div align="center">

## 📸 Screenshots

</div>

<div align="center">

| Digital Mode | Analog Mode | Particle Effects |
|:---:|:---:|:---:|
| Digital clock with flip animation | Elegant analog clock with smooth sweep | Interactive particle systems |
| *[Add screenshot]* | *[Add screenshot]* | *[Add screenshot]* |

</div>

> 💡 **Tip**: Add your screenshots by replacing the placeholders above with actual images from your application

---

<div align="center">

## 🚀 Quick Start

</div>

### 📱 Android 用户（强烈推荐）

**3 步安装，立即体验！**

1. **下载安装包**  
   从 [Releases](https://github.com/yourusername/zen-clock/releases) 下载最新 APK 文件

2. **安装应用**  
   在 Android 设备上启用"未知来源安装"，然后安装 APK

3. **开始使用**  
   打开 For Clock，享受禅意时光！  
   👉 授予相机权限（可选）以体验手势控制功能

**系统要求**：Android 8.0 或更高版本

---

### 🍎 iOS 用户

**即将推出** - 目前可通过以下方式体验：
- Web 版：使用 Safari 浏览器访问
- 关注 [Releases](https://github.com/yourusername/zen-clock/releases) 获取 TestFlight 测试邀请

---

### 💻 网页版 / 桌面版

#### 方式一：下载即用（推荐）
从 [Releases](https://github.com/yourusername/zen-clock/releases) 下载最新版本，解压后在浏览器中打开 `index.html`。

#### 方式二：本地开发

**前提条件：**
- **Node.js**（建议 v18+）
- **npm** 或 **yarn**

```bash
# 克隆项目
git clone https://github.com/yourusername/zen-clock.git
cd zen-clock

# 安装依赖
npm install

# 配置环境变量（可选，用于 AI 功能）
cp .env.local.example .env.local
# 编辑 .env.local 并添加你的 Gemini API 密钥

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000`

> **提示**：移动端应用提供最佳体验，推荐使用 Android 版本。

---

<div align="center">

## 📖 Usage Guide

</div>

### 🎮 Control Panel

**How to Open**: Move your mouse to the **top center** of the screen (a white indicator will appear), then click to open the settings panel. Click outside the panel to close.

### Control Panel Functions

| Icon | Function | Description |
|------|----------|-------------|
| 🕐 **Mode** | Switch clock mode | Toggle between Digital, Analog, and Dual modes |
| 🎬 **Effects** | Animation toggles | **Flip**: Enable/disable page flip animation<br>**Smooth**: Enable/disable smooth sweep seconds |
| ⚙️ **Display** | Show/hide elements | **Seconds**: Show/hide seconds<br>**24-Hour**: Toggle 12/24 hour format |
| 📹 **Camera** | Gesture control | Enable/disable hand gesture recognition |
| 📱 **Fullscreen** | Immersive mode | Enter/exit fullscreen mode |
| 🎨 **Appearance** | Visual customization | Choose colors, fonts, upload backgrounds |
| 🤖 **AI** | Time reflection | Generate AI-powered time poetry |

### ✋ Gesture Control (Camera Required)

For Clock uses **MediaPipe** technology to recognize hand gestures. Different particle modes have unique interactions:

**General Rule**: Hold your palm facing the camera, centered in the frame.

#### Snow / Stars Mode
| Gesture | Effect |
|---------|--------|
| ✊ **Fist** | **Super Attraction**: Particles are strongly attracted to the fist center |
| 🖐 **Open Hand** | **Repel**: Particles are pushed away like wind |
| 👆 **Pointing** | **Gentle Attraction**: Particles slowly gather toward the fingertip |

#### Rain Mode
| Gesture | Effect |
|---------|--------|
| ✊ **Fist** | **Time Freeze**: Raindrops suspend in mid-air, very slow speed |
| 🖐 **Open Hand** | **Umbrella Mode**: Raindrops avoid the palm area and slide off |
| 👆 **Pointing** | **Wind Control**: Change the direction of falling rain |

#### Matrix Mode
| Gesture | Effect |
|---------|--------|
| ✊ **Fist** | **System Crash**: Code turns red and vibrates violently |
| 🖐 **Open Hand** | **Field Distortion**: Creates spatial distortion field, pushing code away |
| 👆 **Pointing** | **Data Stream**: Code flows in the direction of your fingertip |

---

<div align="center">

## 🛠️ Development

</div>

### Tech Stack
- **Framework**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite 6
- **AI Integration**: Google Gemini API (`gemini-3-flash-preview`)
- **Computer Vision**: MediaPipe Tasks Vision (Hand Landmarker)
- **Icons**: Lucide React
- **Mobile**: Capacitor 8 (iOS/Android)

### Available Scripts

```bash
# Development
npm run dev              # Start development server (http://localhost:3000)

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Mobile Development
npm run build:cap        # Build web and sync with Capacitor
npm run sync             # Sync web assets to native projects
npm run sync:ios         # Sync to iOS project
npm run sync:android     # Sync to Android project
npm run open:ios         # Open iOS project in Xcode
npm run open:android     # Open Android project in Android Studio

# Utilities
npm run generate-icons   # Generate app icons
```

### Project Structure

```
zen-clock/
├── src/
│   ├── components/          # React components
│   │   ├── AnalogClock.tsx  # Analog clock component
│   │   ├── DigitalClock.tsx # Digital clock component
│   │   ├── DateLine.tsx     # Date display component
│   │   ├── ParticlesCanvas.tsx  # Particle effects canvas
│   │   ├── Controls.tsx     # Control panel UI
│   │   ├── ElementSettings.tsx  # Element configuration panel
│   │   ├── DraggableElement.tsx # Draggable container
│   │   └── ErrorBoundary.tsx    # Error boundary component
│   ├── services/
│   │   └── geminiService.ts # AI service integration
│   ├── constants.ts         # Theme configs, color presets
│   ├── types.ts             # TypeScript type definitions
│   ├── App.tsx              # Main application component
│   └── index.tsx            # Entry point
├── public/
│   └── mediapipe/           # MediaPipe models
├── android/                 # Android native project
├── ios/                     # iOS native project
├── capacitor.config.ts      # Capacitor configuration
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Gemini API Key (for AI features)
GEMINI_API_KEY=your_api_key_here
```

> **Note**: The app will work without an API key, but AI features will use fallback text.

### Custom AI Provider

For Clock supports custom AI providers (OpenAI-compatible APIs):

1. Open Settings in the app
2. Select "Custom AI Provider"
3. Enter:
   - **API Key**: Your API key
   - **Base URL**: API endpoint (e.g., `https://api.openai.com/v1`)
   - **Model**: Model name (e.g., `gpt-3.5-turbo`)

---

<div align="center">

## 📱 Download Mobile Apps

</div>

### ⭐ Recommended: Use Pre-built Apps

**The easiest way to experience For Clock - no development setup needed!**

#### Android
- **Download**: Get the latest APK from [Releases](https://github.com/yourusername/zen-clock/releases)
- **Installation**: Enable "Install from Unknown Sources" and install the APK
- **Permissions**: Grant camera access for gesture control (optional)
- **Requirements**: Android 8.0 or higher

#### iOS
- **Download**: Available on TestFlight or [Releases](https://github.com/yourusername/zen-clock/releases)
- **Installation**: Install via TestFlight or sideload
- **Permissions**: Allow camera access when prompted (optional)
- **Requirements**: iOS 14.0 or higher

### 🛠️ For Developers: Build from Source

Want to customize or contribute? Build the app yourself:

#### Building for iOS

**Prerequisites**:
- macOS with Xcode installed
- Apple Developer account (for device testing)

```bash
# Sync to iOS
npm run sync:ios

# Open in Xcode
npm run open:ios

# In Xcode:
# 1. Select your development team
# 2. Choose target device/simulator
# 3. Build and run (Cmd+R)
```

#### Building for Android

**Prerequisites**:
- Android Studio
- Android SDK
- Java Development Kit (JDK)

```bash
# Sync to Android
npm run sync:android

# Open in Android Studio
npm run open:android

# In Android Studio:
# 1. Sync Gradle files
# 2. Select target device/emulator
# 3. Build and run
```

### 📷 Camera Permissions

Both iOS and Android apps require camera permissions for gesture control:

- **iOS**: Automatically prompts for camera permission on first use
- **Android**: Camera permission is declared in `AndroidManifest.xml` and requested at runtime

> **Note**: Camera permission is optional. The app works without it, but gesture control features won't be available.

---

<div align="center">

## ⚙️ Configuration

</div>

### Element Positioning

Each clock element (Digital, Analog, Date) can be independently configured:

1. **Double-click** any element to open its settings panel
2. Adjust:
   - **Position X/Y**: Offset from center (percentage-based)
   - **Scale**: Size multiplier
   - **Rotation**: Angle in degrees
   - **Opacity**: Transparency (0-1)
   - **Z-Index**: Layer order
   - **Custom Color**: Element-specific color override

### Drag Sensitivity

Adjust drag sensitivity in Settings for precise positioning:
- **Lower values**: Slower, more precise movement
- **Higher values**: Faster movement

---

<div align="center">

## 🔒 Security Notes

</div>

### API Key Safety

- ✅ **No hardcoded keys**: API keys are stored in environment variables
- ✅ **Git ignored**: `.env.local` is excluded from version control
- ✅ **Client-side storage**: User-provided keys are stored in browser localStorage
- ⚠️ **Production warning**: For production use, consider using a backend proxy to hide API keys

### Best Practices

1. Never commit `.env.local` to version control
2. Use API key restrictions in Google Cloud Console
3. Consider rate limiting for AI features
4. For public deployments, use environment-specific build processes

---

<div align="center">

## 🤝 Contributing

</div>

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style (Prettier/ESLint)
- Write meaningful commit messages
- Add comments for complex logic
- Test on multiple browsers
- Ensure mobile compatibility

---

<div align="center">

## 📄 License

</div>

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

## 🙏 Acknowledgments

</div>

- [Google Gemini AI](https://ai.google.dev/) - AI model provider
- [MediaPipe](https://mediapipe.dev/) - Hand tracking technology
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Capacitor](https://capacitorjs.com/) - Cross-platform app framework
- [Lucide Icons](https://lucide.dev/) - Beautiful icons library

---

<div align="center">

## 📧 Contact

</div>

For questions, suggestions, or issues, please open an issue on GitHub or contact the maintainers.

**Enjoy your Zen moments with For Clock! 🧘‍♂️⏰**

---

<div align="center">

## 🇨🇳 中文文档

</div>

### 📱 Android 用户（强烈推荐）

**3 步安装，立即体验！**

1. **下载安装包**  
   从 [Releases](https://github.com/yourusername/zen-clock/releases) 下载最新 APK 文件

2. **安装应用**  
   在 Android 设备上启用"未知来源安装"，然后安装 APK

3. **开始使用**  
   打开 For Clock，享受禅意时光！  
   👉 授予相机权限（可选）以体验手势控制功能

**系统要求**：Android 8.0 或更高版本

---

### 🍎 iOS 用户

**即将推出** - 目前可通过以下方式体验：
- Web 版：使用 Safari 浏览器访问
- 关注 [Releases](https://github.com/yourusername/zen-clock/releases) 获取 TestFlight 测试邀请

---

### 💻 网页版 / 桌面版

#### 方式一：下载即用（推荐）
从 [Releases](https://github.com/yourusername/zen-clock/releases) 下载最新版本，解压后在浏览器中打开 `index.html`。

#### 方式二：本地开发

**前提条件：**
- **Node.js**（建议 v18+）
- **npm** 或 **yarn**

```bash
# 克隆项目
git clone https://github.com/yourusername/zen-clock.git
cd zen-clock

# 安装依赖
npm install

# 配置环境变量（可选，用于 AI 功能）
cp .env.local.example .env.local
# 编辑 .env.local 并添加你的 Gemini API 密钥

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000`

> **提示**：移动端应用提供最佳体验，推荐使用 Android 版本。

### 📖 使用说明

#### 打开控制面板
将鼠标移动到屏幕**正上方中央区域**（会出现白色提示条），点击即可打开设置面板。

#### 手势控制说明

**通用规则**：手掌正对摄像头，保持在画面中央。

| 粒子模式 | ✊ 握拳 | 🖐 张开手掌 | 👆 食指指点 |
|---------|--------|------------|------------|
| **飞雪/星空** | 超级聚拢 | 驱散粒子 | 轻微吸引 |
| **雨滴** | 时间静止 | 雨伞模式 | 风力操控 |
| **矩阵** | 系统崩溃 | 力场扭曲 | 数据流 |

### 🛠️ 开发

#### 技术栈
- **框架**: React 19, TypeScript
- **样式**: Tailwind CSS v4
- **构建工具**: Vite 6
- **AI**: Google Gemini API
- **视觉识别**: MediaPipe Tasks Vision
- **移动端**: Capacitor 8

#### 可用命令

```bash
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm run preview          # 预览生产构建
npm run build:cap        # 构建并同步到移动端
npm run sync:ios         # 同步到 iOS
npm run sync:android     # 同步到 Android
npm run open:ios         # 在 Xcode 中打开
npm run open:android     # 在 Android Studio 中打开
```

### 📱 下载移动应用

**推荐使用预构建的应用 - 无需开发环境！**

#### Android
- **下载**：从 [Releases](https://github.com/yourusername/zen-clock/releases) 获取最新 APK
- **安装**：启用"未知来源安装"，安装 APK
- **权限**：授予相机访问权限（可选）以使用手势控制
- **系统要求**：Android 8.0 或更高版本

#### iOS
- **下载**：通过 TestFlight 或 [Releases](https://github.com/yourusername/zen-clock/releases)
- **安装**：通过 TestFlight 或侧载安装
- **权限**：提示时允许相机访问（可选）
- **系统要求**：iOS 14.0 或更高版本

---

### 🛠️ 开发者：从源码构建

想要自定义或贡献代码？自己构建应用：

#### 构建 iOS
```bash
npm run sync:ios
npm run open:ios
# 在 Xcode 中选择开发团队并运行
```

#### 构建 Android
```bash
npm run sync:android
npm run open:android
# 在 Android Studio 中同步 Gradle 并运行
```

> **注意**：相机权限是可选的。没有相机权限应用仍可正常使用，但无法使用手势控制功能。

---

<div align="center">

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

### Ways to Contribute:
- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🌍 Add translations
- 🎨 Design improvements
- 🧪 Write tests

---

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/zen-clock/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/zen-clock/discussions)
- **Email**: your-email@example.com

**If you enjoy For Clock, please consider giving it a ⭐ star on GitHub!**

---

<div align="center">

**Made with ❤️ and ☕ by the For Clock Team**

**Enjoy your Zen moments! 🧘‍♂️⏰**

</div>
