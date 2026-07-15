# For Clock · 中文快速指南

For Clock 是一个基于 React、Vite 和 Capacitor 的沉浸式多组件时钟应用。当前开发版本位于 `yuhan` 分支。

## 快速启动

环境要求：Node.js 22+、npm 10+。

```bash
git clone --branch yuhan --single-branch https://github.com/cha3343954211/ForClock.git
cd ForClock
npm ci
cp .env.local.example .env.local
npm run dev
```

浏览器访问 <http://localhost:3000>。

## 核心功能

- 数字时钟、模拟时钟、日历、秒表和倒计时
- 多组件自由拖拽、缩放、旋转和独立样式配置
- 五套主题与 Snow、Rain、Stars、Matrix 粒子效果
- MediaPipe 摄像头手势识别
- Gemini / OpenAI 兼容 AI 服务与本地感悟语句池
- PWA 离线缓存及 Android/iOS Capacitor 工程

## AI 配置

`GEMINI_API_KEY` 不是启动项目的必需项。需要在线生成 AI 感悟时，编辑 `.env.local`：

```dotenv
GEMINI_API_KEY=your_key
```

也可以在应用内的 `AI Settings` 中设置服务商、接口地址、模型和密钥。

## 常用命令

```bash
npm run dev          # 开发服务器：http://localhost:3000
npm run build        # 生产构建
npm run preview      # 预览生产构建
npm run lint         # ESLint 检查
npm run build:cap    # 构建并同步移动端工程
npm run open:android # Android Studio
npm run open:ios     # Xcode
```

## 移动端说明

- Android：需要 Java 21、Android Studio 和 Android SDK
- iOS：需要 macOS 和 Xcode，依赖由 Swift Package Manager 管理
- Capacitor 8 要求 Node.js 22+
- iOS 自动构建产物为未签名 IPA，需要自行签名后安装

## 当前技术版本

- React 19.2
- TypeScript 5.8
- Vite 6.4
- Tailwind CSS 4.1
- Capacitor 8
- MediaPipe Tasks Vision 0.10

完整说明请阅读 [README.md](README.md)、[DEVELOPMENT.md](DEVELOPMENT.md) 和 [DEPLOYMENT.md](DEPLOYMENT.md)。
