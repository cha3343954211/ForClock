# For Clock iOS 开发指南

本文档对应当前 `yuhan` 分支、Capacitor 8 和 Swift Package Manager 工程。

## 1. 环境要求

- macOS
- Xcode（建议使用当前稳定版）
- Node.js 22+
- npm 10+
- 真机运行或发布时需要 Apple Developer 签名配置

项目不使用 CocoaPods，无需安装 CocoaPods 或执行 `pod install`。

## 2. 初始化

在项目根目录执行：

```bash
npm ci
cp .env.local.example .env.local
npm run build:cap
```

仓库已包含 `ios/`，不要再次运行 `npx cap add ios`。

打开 Xcode：

```bash
npm run open:ios
```

也可以直接打开 `ios/App/App.xcodeproj`。

## 3. 工程配置

当前 Capacitor 配置：

- App Name：`For Clock Pro`
- App ID：`com.zenclock.app.pro`
- Web 目录：`dist`
- iOS scheme：HTTPS
- WebView 背景色：`#1A1A1A`

如需发布自己的应用，请在 `capacitor.config.ts` 和 Xcode 中同步修改应用名、Bundle Identifier、Team 和签名配置。

## 4. Web 代码同步

每次修改 React/Web 代码后执行：

```bash
npm run build:cap
```

只同步 iOS：

```bash
npm run sync:ios
```

不要直接修改同步生成的 Web 资源，下一次 `cap sync` 会覆盖这些文件。

## 5. Xcode 运行

1. 打开 `ios/App/App.xcodeproj`
2. 选择 `App` scheme
3. 在 Signing & Capabilities 中选择 Team
4. 确认 Bundle Identifier 唯一
5. 选择模拟器或真机
6. 点击 Run

摄像头手势功能必须在支持摄像头的真机上完整验证。首次使用时，系统会请求摄像头权限。

## 6. 原生能力

项目包含以下 iOS 侧配置：

- 摄像头用途描述，用于 MediaPipe 手势识别
- 沉浸式状态栏设置
- 屏幕常亮逻辑，避免时钟运行时自动锁屏
- Capacitor HTTPS scheme，支持 `navigator.mediaDevices`

修改权限说明时检查 `ios/App/App/Info.plist`；修改应用生命周期行为时检查 `ios/App/App/AppDelegate.swift`。

## 7. Archive 与发布

在 Xcode 中：

1. 选择 `Any iOS Device (arm64)` 或 Generic iOS Device
2. 执行 Product → Archive
3. 在 Organizer 中执行 Validate App
4. 选择 Distribute App
5. 上传到 App Store Connect 或导出签名包

正式发布前确认：

- Version 和 Build Number 已更新
- 应用图标完整
- Bundle Identifier 与 App Store Connect 一致
- 隐私说明包含摄像头用途
- 真机测试布局、后台恢复和屏幕常亮
- AI Key 未打包进公开构建

## 8. 未签名 IPA

`.github/workflows/build-ios.yml` 和综合发布工作流通过 `xcodebuild archive` 生成未签名 IPA。该产物不能直接作为 App Store 包，需要自行签名。

工作流关键参数：

- `CODE_SIGNING_REQUIRED=NO`
- `CODE_SIGNING_ALLOWED=NO`
- `DEVELOPMENT_TEAM=""`

## 9. 常见问题

### Xcode 显示 Swift Package 解析失败

- File → Packages → Reset Package Caches
- File → Packages → Resolve Package Versions
- 确认网络可访问依赖源

### 页面仍是旧版本

```bash
npm run build:cap
```

然后在 Xcode 中执行 Product → Clean Build Folder 后重新运行。

### 摄像头不可用

- 使用真机测试
- 检查系统设置中的摄像头权限
- 确认 `Info.plist` 包含摄像头用途描述
- 确认 MediaPipe 资源已随 `dist/` 同步

### 签名失败

- 确认 Team 和 Bundle Identifier
- 检查证书与 Provisioning Profile
- 免费 Apple ID 签名存在设备数和有效期限制

## 10. 命令速查

```bash
npm run build:cap
npm run sync:ios
npm run open:ios
npm run generate-icons
```
