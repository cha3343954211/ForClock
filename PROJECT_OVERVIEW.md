# For Clock 项目概览

## 项目定位

For Clock 是一个强调沉浸感与自由布局的多组件时钟应用。它以 Web/PWA 为核心，通过 Capacitor 同步到 Android 和 iOS。

当前开发分支为 `yuhan`，移动端应用配置名称为 `For Clock Pro`，应用标识为 `com.zenclock.app.pro`。

## 当前能力

### 组件系统

- 数字时钟：多种数字切换动画，可选日期和秒显示
- 模拟时钟：多种表盘风格，包括罗马数字样式
- 日历：多种日期展示样式，包括邮票风格
- 计时器：秒表和倒计时模式，支持多个实例
- 自由布局：拖动、缩放、旋转、层级和独立透明度

### 视觉与交互

- 五套内置主题
- Snow、Rain、Stars、Matrix 粒子效果
- 自定义背景图片
- 桌面鼠标、触摸和移动端布局支持
- MediaPipe 摄像头手势识别

### 智能内容

- Google Gemini
- OpenAI 兼容接口
- 无 API Key 时使用本地双语语句池

### 平台能力

- Vite Web 应用
- PWA manifest、Service Worker 和离线缓存
- Capacitor 8 Android 工程
- Capacitor 8 iOS 工程（Swift Package Manager）
- GitHub Actions Android/iOS 自动构建与 Release

## 技术架构

| 范畴 | 当前实现 |
|---|---|
| 前端 | React 19.2、TypeScript 5.8 |
| 构建 | Vite 6.4 |
| 样式 | Tailwind CSS 4.1 |
| PWA | vite-plugin-pwa 1.3 |
| 手势 | MediaPipe Tasks Vision 0.10.14 |
| AI | Google Gen AI SDK 1.34、OpenAI 兼容 API |
| 移动端 | Capacitor 8 |
| 图标 | Lucide React |

## 设计原则

1. **沉浸优先**：默认界面减少干扰，控制面板按需出现。
2. **组件独立**：每个时钟、日历和计时器拥有独立布局及样式配置。
3. **本地优先**：布局和偏好保存在本地，AI 功能没有 Key 也能工作。
4. **跨平台一致**：Web 是单一 UI 源，移动端通过 Capacitor 复用。
5. **渐进增强**：PWA、摄像头手势和在线 AI 均为增强能力，不阻塞基础时钟功能。

## 关键文件

| 文件 | 职责 |
|---|---|
| `App.tsx` | 应用组合、组件渲染和主要交互入口 |
| `types.ts` | 全局数据模型 |
| `constants.ts` | 主题、颜色和字体配置 |
| `hooks/useWidgets.ts` | 组件实例、布局与计时器状态 |
| `hooks/useSettings.ts` | 偏好设置持久化 |
| `hooks/widgetPresets.ts` | 组件样式预设 |
| `components/ParticlesCanvas.tsx` | 粒子与手势识别 |
| `services/geminiService.ts` | AI 服务适配 |
| `vite.config.ts` | 开发服务、构建拆包和 PWA |
| `capacitor.config.ts` | Android/iOS 容器配置 |

## 构建与发布

- 本地开发：`npm run dev`，端口 `3000`
- Web 生产构建：`npm run build`
- 移动端同步：`npm run build:cap`
- CI Node.js：22
- Android CI：Java 21、Debug APK
- iOS CI：未签名 IPA

自动发布工作流监听 `main`、`master` 和 `pro`。当前 `yuhan` 分支可手动运行工作流，或合并到发布分支后自动触发。

## 近期维护重点

- 保持组件布局和持久化数据向后兼容
- 提升移动端触摸操作和不同屏幕尺寸体验
- 优化 PWA 缓存更新和 MediaPipe 资源加载
- 降低大型可选依赖对首屏包体的影响
- 保持 README、开发文档和工作流配置同步

## License

MIT License。详见 [LICENSE](LICENSE)。
