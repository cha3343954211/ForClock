# For Clock 开发指南

本文档对应当前 `yuhan` 分支。

## 1. 开发环境

### 必需工具

- Node.js 22+
- npm 10+
- Git

### 移动端附加工具

- Android：Android Studio、Android SDK、Java 21
- iOS：macOS、Xcode；依赖使用 Swift Package Manager

推荐使用 Node.js 22 或 24。Capacitor 8 不支持 Node.js 20 及更低版本。

## 2. 安装与启动

```bash
git clone --branch yuhan --single-branch https://github.com/cha3343954211/ForClock.git
cd ForClock
npm ci
cp .env.local.example .env.local
npm run dev
```

开发服务器由 `vite.config.ts` 配置，默认监听 `0.0.0.0:3000`。本机访问 <http://localhost:3000>。

## 3. 环境变量

`.env.local` 仅用于本地开发，已被 Git 忽略。

```dotenv
GEMINI_API_KEY=
```

API Key 是可选项。无 Key 时，AI 感悟功能会使用 `services/wisdomPool.ts` 中的本地语句池。应用内设置还支持自定义 OpenAI 兼容接口。

## 4. 架构

```text
index.tsx
└── App.tsx
    ├── TimeContext
    ├── SettingsContext
    ├── useWidgets
    ├── DraggableElement
    │   ├── DigitalClock
    │   ├── AnalogClock
    │   ├── DateLine
    │   └── TimerDisplay
    ├── ParticlesCanvas
    ├── Controls
    └── ElementSettings
```

### 主要目录

| 路径 | 作用 |
|---|---|
| `components/` | 页面组件、时钟组件、粒子画布和设置面板 |
| `contexts/` | 全局时间与设置上下文 |
| `hooks/` | 组件管理、设置持久化和布局预设 |
| `services/` | AI 请求和本地感悟语句 |
| `public/` | PWA 图标及 MediaPipe 模型/WASM 资源 |
| `android/` | Capacitor Android 原生工程 |
| `ios/` | Capacitor iOS 原生工程 |

## 5. 核心数据模型

`types.ts` 定义主要类型：

- `WidgetType`：`digital`、`analog`、`calendar`、`timer`
- `WidgetRecord`：组件位置、尺寸、旋转、样式及计时器状态
- `ParticleMode`：粒子效果模式
- `AIProvider` / `AIConfig`：AI 服务配置
- `Theme` / `Settings`：主题和应用偏好

新增组件类型时，至少同步更新：

1. `types.ts`
2. `hooks/useWidgets.ts`
3. `components/Controls.tsx`
4. `App.tsx`
5. 对应的展示与设置组件

## 6. 状态与持久化

- 全局设置通过 `SettingsContext` 和 `hooks/useSettings.ts` 管理
- 组件实例通过 `hooks/useWidgets.ts` 管理
- 配置和布局保存在浏览器 `localStorage`
- 时间更新集中在 `TimeContext`，避免每个时钟组件分别创建计时器

修改持久化结构时，应为旧数据提供默认值或迁移逻辑，避免用户升级后页面无法加载。

## 7. 样式与交互

- Tailwind CSS 4 通过 `@tailwindcss/vite` 集成
- 全局补充样式位于 `index.css`
- 主题、颜色和字体预设主要位于 `constants.ts`
- 组件样式预设位于 `hooks/widgetPresets.ts`
- 组件拖拽、缩放和旋转由 `components/DraggableElement.tsx` 处理

新增样式时应同时检查深色/浅色主题、桌面/移动端布局和触摸交互。

## 8. AI 服务

`services/geminiService.ts` 支持：

- Google Gemini
- OpenAI 兼容 Chat Completions 接口
- 无网络配置时回退到本地语句池

不要把 API Key 写入源码、示例截图或已提交的配置文件。浏览器端密钥对最终用户可见，仅适合个人本地使用。

## 9. 手势识别

`components/ParticlesCanvas.tsx` 使用 `@mediapipe/tasks-vision`。模型和 WASM 静态资源位于 `public/mediapipe/`，由 PWA 运行时缓存按需加载。

开发时 Vite 禁用 Service Worker，避免缓存干扰。摄像头功能需要安全上下文；`localhost`、Capacitor 的 HTTPS scheme 或正式 HTTPS 部署均可使用。

## 10. PWA

PWA 配置位于 `vite.config.ts`：

- 自动更新 Service Worker
- 预缓存构建资源
- MediaPipe 资源使用 CacheFirst 运行时缓存
- Google Fonts 使用长期缓存
- 开发模式禁用 Service Worker

修改缓存策略后请执行生产构建并使用 `npm run preview` 验证。

## 11. 质量检查

提交前建议执行：

```bash
npm run lint
npm run build
```

需要统一格式时：

```bash
npm run format
```

当前生产构建可能显示 Tailwind 生成的 orientation container CSS 警告；只要构建退出码为 0，产物仍会生成。若修改相关断点配置，应重新确认警告是否消失。

## 12. 移动端同步

修改 Web 代码后：

```bash
npm run build:cap
```

仅同步单个平台：

```bash
npm run sync:android
npm run sync:ios
```

不要直接修改 `android/app/src/main/assets/public/` 或 iOS 内复制的 Web 构建产物；这些内容会在同步时覆盖。

## 13. 分支工作流

```bash
git checkout yuhan
git pull origin yuhan
git checkout -b feature/short-description
```

完成功能后运行检查并提交。发布工作流只自动监听 `main`、`master` 和 `pro`；`yuhan` 上的构建需手动触发 GitHub Actions，或通过合并进入发布分支触发。
