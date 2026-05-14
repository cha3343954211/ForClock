# For Clock iOS 开发指南

本文档详细说明了如何在 macOS 环境下配置、构建和发布 **For Clock** 的 iOS 版本。由于本项目是在 Windows 环境下初始化的，迁移到 Mac 进行编译时请务必阅读以下步骤。

---

## 1. 💻 环境准备 (Prerequisites)

iOS 应用开发必须在 **macOS** 系统上进行。

*   **硬件**: Mac 电脑 (MacBook / iMac / Mac mini)
*   **操作系统**: macOS Sonoma (14.0) 或更高版本推荐
*   **必需软件**:
    *   **Xcode**: 从 Mac App Store 下载安装（建议最新版）。
    *   **Node.js**: 建议 v18 或更高版本。
    *   **CocoaPods**: iOS 的依赖管理工具。
        ```bash
        sudo gem install cocoapods
        ```

---

## 2. 🚀 项目初始化 (在 Mac 上)

将项目文件复制到 Mac 后：

### 2.1 安装依赖
在项目根目录 (`clock3/clock3`) 打开终端：

```bash
# 安装 Node 依赖
npm install
```

### 2.2 同步 iOS 项目
本项目已经包含 `ios` 目录，不需要运行 `npx cap add ios`。你需要做的是将构建好的 Web 资源同步到 iOS 容器中：

```bash
# 构建 Web 资源并同步到 iOS
npm run build:cap
```
或者单独同步：
```bash
npm run sync:ios
```

---

## 3. ⚙️ 已配置的功能说明

本项目已针对 iOS 进行了以下必要的原生配置调整，无需手动修改：

### 3.1 权限与特性 (`Info.plist`)
文件位置: `ios/App/App/Info.plist`

*   **📷 相机权限**:
    *   `NSCameraUsageDescription`: 已添加描述 *"For Clock uses camera for hand gesture recognition to control particle effects"*。
    *   **用途**: 用于 MediaPipe 手势识别功能。
*   **🖥️ 全屏沉浸式**:
    *   `UIStatusBarHidden`: 设置为 `true`。
    *   `UIViewControllerBasedStatusBarAppearance`: 设置为 `false`。
    *   **效果**: 应用启动时自动隐藏顶部状态栏。

### 3.2 原生代码逻辑 (`AppDelegate.swift`)
文件位置: `ios/App/App/AppDelegate.swift`

*   **💡 屏幕常亮**:
    *   在 `application(_:didFinishLaunchingWithOptions:)` 方法中已添加：
        ```swift
        UIApplication.shared.isIdleTimerDisabled = true
        ```
    *   **效果**: 防止时钟运行时手机自动锁屏。

### 3.3 🖼️ 应用图标
*   **图标准备**: 脚本已生成高清图标 (`1024x1024`)。
*   **位置**: `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`
*   **Xcode 设置**: `AppIcon` 资源组已配置使用该图片作为单一来源 (Single Size)，适应所有 iOS 设备。
*   **重新生成**: 如果更换了源图片，运行 `npm run generate-icons` 即可更新。

---

## 4. 🛠️ 开发与调试 (Building & Running)

### 4.1 打开 Xcode
使用以下命令自动打开项目：

```bash
npm run open:ios
```
或者手动打开 `ios/App/App.xcworkspace` 文件。

### 4.2 配置签名 (Signing Team) - **关键步骤**
首次打开项目时，必须配置开发者账号才能运行：

1.  在 Xcode 左侧导航栏点击蓝色图标 **App**。
2.  在右侧主视图选择 **TARGETS** -> **App**。
3.  点击顶部的 **Signing & Capabilities** 选项卡。
4.  在 **Team** 下拉菜单中：
    *   **有开发者账号**: 选择你的 Team。
    *   **无开发者账号**: 选择 "Add an Account..." 登录你的 Apple ID（可以使用免费个人账号进行真机调试）。
5.  **Bundle Identifier**: 默认为 `com.For Clock.app`。如果使用免费个人账号，可能需要修改此 ID 为唯一的字符串（例如 `com.yourname.For Clock`）以避免冲突。

### 4.3 运行应用
1.  **连接设备**: 使用数据线将 iPhone/iPad 连接到 Mac（推荐真机以测试摄像头性能）。
2.  **选择设备**: 在 Xcode 顶部工具栏选择你的设备。
3.  **运行**: 点击左上角的 ▶️ Play 按钮 (或按 `Cmd + R`)。

> **⚠️ 注意**: Web 摄像头 API 在 iOS 模拟器上可能无法正常工作，强烈建议在真机上调试手势功能。

---

## 5. 📦 发布到 App Store (Deployment)

### 5.1 准备构建
1.  确保在 `package.json` 或 Capacitor 配置中更新了版本号。
2.  运行 `npm run build:cap` 确保最新的 Web 代码已同步。

### 5.2 打包 (Archive)
1.  在 Xcode 中，选择 **Generic iOS Device** (Any iOS Device) 作为目标。
2.  点击菜单栏 **Product** -> **Archive**。
3.  等待构建完成，Xcode 会自动打开 **Organizer** 窗口。

### 5.3 上传
1.  在 Organizer 中选中刚刚构建的版本。
2.  点击 **Distribute App**。
3.  选择 **App Store Connect** -> **Upload**。
4.  按照向导完成验证和上传。

---

## 6. 📝 常用命令速查表

| 命令 | 作用 | 说明 |
| :--- | :--- | :--- |
| `npm run dev` | 启动本地开发服务器 | 仅用于浏览器调试 |
| `npm run build` | 构建 React 项目 | 生成 `dist` 目录 |
| `npm run sync:ios` | 同步到 iOS | 将 `dist` 复制到 iOS 原生工程 |
| `npm run open:ios` | 打开 Xcode | 启动原生开发环境 |
| `npm run build:cap` | **一键构建并同步** | 推荐：修改代码后运行此命令 |
| `npm run generate-icons` | 生成图标 | 同时生成 Android 和 iOS 图标 |

---

*For Clock iOS 开发文档 - 生成于 2025-12-30*
