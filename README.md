# For Clock

极简、沉浸式的多组件时钟应用，支持 Web/PWA、Android 与 iOS。

当前仓库：`cha3343954211/ForClock`

当前开发分支：`yuhan`

## 功能概览

- 自由画布：数字时钟、模拟时钟、日历、秒表/倒计时组件可自由添加、拖动、缩放和旋转
- 多种视觉样式：数字翻页/滑动/淡入淡出、罗马数字表盘、邮票风格日历等
- 五套主题：Midnight Void、Paper White、Cyberpunk Neon、Misty Forest、Retro Terminal
- 粒子效果：Snow、Rain、Stars、Matrix
- 手势控制：通过 MediaPipe 和摄像头控制粒子交互
- AI 时光感悟：支持 Google Gemini 与 OpenAI 兼容接口；未配置密钥时使用本地语句池
- 本地持久化：组件布局、主题和偏好保存在浏览器本地
- PWA 与移动端：支持安装为 PWA，并通过 Capacitor 构建 Android/iOS 应用

## 环境要求

- Node.js 22 或更高版本
- npm 10 或更高版本
- Android 构建：Android Studio、Android SDK、Java 21
- iOS 构建：macOS、Xcode；项目使用 Swift Package Manager

> Capacitor 8 要求 Node.js 22+。推荐使用 Node.js 22 或 24 的 LTS/稳定版本。

## 本地运行

```bash
git clone --branch yuhan --single-branch https://github.com/cha3343954211/ForClock.git
cd ForClock

npm ci
cp .env.local.example .env.local
npm run dev
```

打开 <http://localhost:3000>。

`GEMINI_API_KEY` 为可选配置。不配置时，应用仍可使用除在线 AI 生成外的全部核心功能，并自动使用本地感悟语句。

## 环境变量

复制示例文件后按需编辑：

```bash
cp .env.local.example .env.local
```

```dotenv
GEMINI_API_KEY=
```

也可以直接在应用的 AI Settings 中配置 Gemini 或 OpenAI 兼容服务。请勿提交 `.env.local`。

## 常用命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动 Vite 开发服务器，默认端口 `3000` |
| `npm run build` | 构建生产版 Web/PWA 到 `dist/` |
| `npm run preview` | 本地预览生产构建 |
| `npm run lint` | 执行 ESLint 检查 |
| `npm run format` | 使用 Prettier 格式化代码 |
| `npm run build:cap` | 构建 Web 并同步 Android/iOS 工程 |
| `npm run sync:android` | 同步 Web 资源到 Android |
| `npm run sync:ios` | 同步 Web 资源到 iOS |
| `npm run open:android` | 使用 Android Studio 打开 Android 工程 |
| `npm run open:ios` | 使用 Xcode 打开 iOS 工程 |
| `npm run generate-icons` | 重新生成应用图标 |

## 移动端构建

### Android

```bash
npm ci
npm run build:cap
npm run open:android
```

也可以直接构建 Debug APK：

```bash
cd android
./gradlew assembleDebug
```

APK 输出路径：`android/app/build/outputs/apk/debug/app-debug.apk`。

### iOS

```bash
npm ci
npm run build:cap
npm run open:ios
```

在 Xcode 中选择 `App` scheme 和目标设备后运行或 Archive。iOS 工程使用 Swift Package Manager，不需要执行 `pod install`。

## 技术栈

| 层级 | 技术 |
|---|---|
| UI | React 19、TypeScript 5.8 |
| 样式 | Tailwind CSS 4 |
| 构建 | Vite 6、vite-plugin-pwa |
| 手势识别 | MediaPipe Tasks Vision 0.10 |
| AI | Google Gen AI SDK、OpenAI 兼容接口 |
| 移动端 | Capacitor 8、Android、iOS |
| 图标 | Lucide React |

## 项目结构

```text
ForClock/
├── components/          # 时钟、日历、计时器、控制面板与粒子组件
├── contexts/            # 时间与全局设置上下文
├── hooks/               # 设置、组件状态与布局预设
├── services/            # AI 服务与本地感悟语句池
├── public/              # PWA 图标和 MediaPipe 静态资源
├── android/             # Capacitor Android 工程
├── ios/                 # Capacitor iOS 工程
├── scripts/             # 图标生成等维护脚本
├── App.tsx              # 应用入口组件
├── vite.config.ts       # Vite、PWA、开发服务器配置
└── capacitor.config.ts  # 移动端应用配置
```

## 分支与发布

- `yuhan`：当前开发分支，本地开发请优先使用该分支
- `main` / `master`：工作流识别为稳定发布分支，发布标签为 `latest-build`
- `pro`：工作流识别为功能发布分支，发布标签为 `latest-build-pro`

`.github/workflows/build-and-release.yml` 在推送到 `main`、`master` 或 `pro` 时构建 Android APK 和未签名 iOS IPA；也支持手动触发。`yuhan` 分支需要手动运行工作流，或合并到上述发布分支后触发自动发布。

## 更多文档

- [开发指南](DEVELOPMENT.md)
- [部署指南](DEPLOYMENT.md)
- [贡献指南](CONTRIBUTING.md)
- [项目概览](PROJECT_OVERVIEW.md)
- [iOS 开发指南](IOS版开发文档.md)
- [文档索引](docs/INDEX.md)

## License

[MIT](LICENSE)
