<div align="center">

<img width="1200" height="475" alt="For Clock Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# For Clock

**极简 · 禅意 · 沉浸式时钟屏保**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Build & Release](https://github.com/cha3343954211/oneclock/actions/workflows/build-and-release.yml/badge.svg)](https://github.com/cha3343954211/oneclock/actions/workflows/build-and-release.yml)

[下载应用](#-下载) · [功能特性](#-功能特性) · [使用说明](#-使用说明) · [开发指南](#-开发指南)

</div>

---

## 📥 下载

| 版本 | 平台 | 获取方式 |
|---|---|---|
| **For Clock** (稳定版) | Android | [Releases → `latest-build`](https://github.com/cha3343954211/oneclock/releases/tag/latest-build) 下载 `For-Clock-Android.apk` |
| **For Clock** (稳定版) | iOS | 同上，下载 `For-Clock-iOS-unsigned.ipa` |
| **For Clock Pro** (最新特性) | Android | [Releases → `latest-build-pro`](https://github.com/cha3343954211/oneclock/releases/tag/latest-build-pro) 下载 `For-Clock-Android.apk` |
| **For Clock Pro** (最新特性) | iOS | 同上，下载 `For-Clock-iOS-unsigned.ipa` |
| **Web / PWA** | 全平台 | `git clone` 后 `npm run dev`，或部署 `dist/` 目录 |

> **Android** 安装前需在「设置 → 安全」中开启**允许安装未知来源应用**。  
> **iOS** IPA 为未签名构建，用 [Sideloadly](https://sideloadly.io) 安装后，在「设置 → 通用 → VPN 与设备管理」信任证书。

---

## ✨ 功能特性

### �️ 多组件自由画布

For Clock 采用**多组件画布**设计，所有元素均可自由摆放：

| 组件类型 | 说明 |
|---|---|
| **数字时钟** | 翻页 / 滑动 / 渐隐多种动效，支持 12/24 小时制，可独立显示日期 |
| **模拟时钟** | 优雅表盘，可开启平滑扫描秒针，支持多种表盘风格 |
| **日历** | 展示当前日期与星期，多种排版样式 |
| **计时器** | 秒表 + 倒计时，多实例并行，毫秒精度 |

- **无限添加**：同类型组件可叠加（最多 12 个）
- **无极缩放**：鼠标滚轮 / 双指捏合，缩放范围 0.05× — 50×
- **拖拽定位**：任意拖移，支持旋转与透明度调节
- **默认排版复位**：一键还原美观的默认布局（圆形钟居左 · 数字钟居右）

### 🎨 五套主题

| 主题 | 风格 |
|---|---|
| **Midnight Void** | 极简黑，存在主义气质 |
| **Paper White** | 纸白，书写与诗意 |
| **Cyberpunk Neon** | 赛博霓虹，科技感 |
| **Misty Forest** | 自然森林，随机背景图 |
| **Retro Terminal** | 复古终端，绿色代码风 |

### 🌟 粒子特效

**飞雪 · 星空 · 雨滴 · 矩阵代码** — 四种粒子系统，支持鼠标与手势实时交互。

### ⏱️ 计时器

- **秒表**：毫秒精度，支持多个并行计时
- **倒计时**：自定义时长，结束声音提醒
- 每个计时器独立配色，互不干扰

### 🤖 AI 时光感悟

- 接入 **Google Gemini / 自定义 OpenAI 兼容接口** 生成诗意时光感悟
- **无需 API Key**：内置本地语句池，按主题 × 时段智能匹配，100+ 条双语句子

### 🎛️ 深度自定义

- **颜色**：实色或渐变（Sunset / Ocean / Aurora / Berry 等预设）
- **字体**：现代无衬线 / 衬线 / 等宽 / 板式等多种字体预设
- **背景**：上传本地图片，或使用主题自带背景
- **每组件独立配置**：双击任意元素 → 调整样式、透明度、层级

### ✋ 手势控制

开启摄像头后，使用 **MediaPipe** 识别手势，实时操控粒子效果：

| 手势 | 飞雪 / 星空 | 雨滴 | 矩阵 |
|---|---|---|---|
| ✊ 握拳 | 粒子聚拢 | 时间静止 | 系统崩溃 |
| 🖐 张掌 | 粒子散开 | 雨伞模式 | 力场扭曲 |
| 👆 食指 | 轻微吸引 | 风力控制 | 数据流向 |

---

## 🚀 使用说明

### 打开控制面板
鼠标移至屏幕**顶部中央**，出现白色提示条后点击即可打开设置面板，点击面板外侧关闭。

### 添加 / 管理组件
在控制面板顶部选择组件类型（数字钟 · 圆形钟 · 日历 · 计时器），点击「**+ 添加**」即可放置到画布。

### 单个组件设置
**双击**任意组件，打开该组件的独立配置面板，可调整：
- 样式预设（翻页 / 滑动 / 渐隐 / 表盘风格等）
- 透明度
- 显示日期（数字时钟专属）

### 缩放与布局
- **鼠标滚轮** 或 **双指捏合** 对单个组件无极缩放
- 拖拽移动，支持任意旋转
- 「**默认排版复位**」一键回到美观预设布局

### AI 感悟
无 API Key 时自动从本地语句池取句，有 Key 时调用 AI 实时生成。  
在设置 → AI 配置中填入 Gemini Key 或任意 OpenAI 兼容接口地址。

---

## 🛠️ 开发指南

### 环境要求

- Node.js 18+
- npm

### 快速启动

```bash
git clone https://github.com/cha3343954211/oneclock.git
cd oneclock

# 稳定版（main）
git checkout main

# 最新特性版（pro）
# git checkout pro

npm install
npm run dev        # http://localhost:5173
```

### 常用命令

```bash
npm run build          # 生产构建
npm run preview        # 预览构建产物
npm run build:cap      # 构建 Web 并同步至 Capacitor
npm run open:android   # 用 Android Studio 打开 Android 项目
npm run open:ios       # 用 Xcode 打开 iOS 项目
npm run lint           # ESLint 检查
npm run format         # Prettier 格式化
```

### 技术栈

| 层级 | 技术 |
|---|---|
| UI 框架 | React 19 + TypeScript 5.8 |
| 样式 | Tailwind CSS v4 |
| 构建工具 | Vite 6 + vite-plugin-pwa |
| 手势识别 | MediaPipe Tasks Vision |
| AI | Google Gemini / OpenAI 兼容接口 |
| 移动端封装 | Capacitor 8（iOS + Android） |
| 图标 | Lucide React |

### 项目结构

```
for-clock/
├── components/
│   ├── DigitalClock.tsx      # 数字时钟（翻页/滑动/渐隐动效）
│   ├── AnalogClock.tsx       # 模拟表盘
│   ├── TimerDisplay.tsx      # 计时器 / 秒表
│   ├── DateLine.tsx          # 日历组件
│   ├── ParticlesCanvas.tsx   # 粒子特效画布
│   ├── Controls.tsx          # 顶部控制面板
│   ├── ElementSettings.tsx   # 单组件设置面板
│   └── DraggableElement.tsx  # 拖拽 / 缩放 / 旋转容器
├── hooks/
│   ├── useSettings.ts        # 全局偏好设置
│   ├── useWidgets.ts         # 多组件状态管理与持久化
│   └── widgetPresets.ts      # 各类型样式预设定义
├── services/
│   ├── geminiService.ts      # AI 调用封装
│   └── wisdomPool.ts         # 本地语句池
├── contexts/
│   ├── SettingsContext.tsx
│   └── TimeContext.tsx
├── constants.ts              # 主题 / 颜色 / 字体预设
├── types.ts                  # TypeScript 类型定义
├── App.tsx
└── index.html
```

### 分支说明

| 分支 | 应用名 | 定位 |
|---|---|---|
| `main` | For Clock | 稳定版，面向最终用户 |
| `pro` | For Clock Pro | 最新特性，持续迭代 |

### CI / CD

推送至 `main` 或 `pro` 分支时自动触发 **Build & Release** 流水线：

```
push → build-android (ubuntu-latest) ┐
                                      ├─ 全部成功 → 创建 GitHub Release
       build-ios    (macos-latest)   ┘
```

| 分支 | Release Tag | 产物文件名 |
|---|---|---|
| `main` | `latest-build` | `For-Clock-Android.apk` · `For-Clock-iOS-unsigned.ipa` |
| `pro` | `latest-build-pro` | `For-Clock-Android.apk` · `For-Clock-iOS-unsigned.ipa` |

---

## 📄 License

[MIT](LICENSE) © For Clock

---

<div align="center">

**觉得有用？请给个 ⭐ 支持一下**

</div>