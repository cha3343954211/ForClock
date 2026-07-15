# For Clock 部署指南

本文档覆盖 Web/PWA、Android 和 iOS。当前技术基线为 Node.js 22+、Vite 6、React 19 和 Capacitor 8。

## 1. 生产构建

```bash
npm ci
cp .env.local.example .env.local
npm run build
```

输出目录为 `dist/`。部署前可本地预览：

```bash
npm run preview -- --host 127.0.0.1
```

## 2. 环境变量与安全

可选变量：

```dotenv
GEMINI_API_KEY=
```

Vite 会把该值注入浏览器构建产物，因此它不是服务器端秘密。公开部署时建议：

- 不在构建环境中写入私人 API Key
- 让用户在应用内自行配置密钥
- 或通过自建后端代理 AI 请求，并在代理端实施鉴权、限流和密钥保护

## 3. Web/PWA 部署

`dist/` 是静态站点，可部署到任意静态托管平台。

### 必需配置

- 将站点根目录指向 `dist/`
- 为单页应用配置回退到 `index.html`
- 使用 HTTPS，以便 Service Worker 和摄像头功能正常工作
- 正确返回 `.wasm`、`.task`、`.webmanifest` 文件

### Nginx 示例

```nginx
server {
    listen 80;
    server_name clock.example.com;
    root /var/www/forclock/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|svg|webp|ico|wasm|task)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
```

HTML 和 Service Worker 不应设置过长的不可变缓存，否则 PWA 更新可能延迟。

### 常见平台

- GitHub Pages：需要确认站点基础路径；当前 Vite 配置默认部署在域名根路径 `/`
- Netlify / Vercel：构建命令 `npm run build`，输出目录 `dist`
- Cloudflare Pages：构建命令 `npm run build`，输出目录 `dist`
- 自建服务器：上传 `dist/` 并配置 SPA 回退与 HTTPS

## 4. Android 构建

### 环境

- Node.js 22+
- Java 21
- Android Studio 和 Android SDK

### 同步并打开工程

```bash
npm ci
npm run build:cap
npm run open:android
```

### 命令行构建 Debug APK

```bash
cd android
./gradlew assembleDebug
```

输出：`android/app/build/outputs/apk/debug/app-debug.apk`。

正式发布需要在 Android Studio 或 Gradle 中配置自己的签名密钥，构建 signed AAB/APK，并自行保护 keystore 与密码。

## 5. iOS 构建

### 环境

- macOS
- Xcode
- Node.js 22+
- 有效 Apple Developer 签名配置（真机/App Store 发布时）

项目使用 Swift Package Manager，不需要 CocoaPods。

```bash
npm ci
npm run build:cap
npm run open:ios
```

在 Xcode 中：

1. 选择 `App` scheme
2. 配置 Team、Bundle Identifier 和签名
3. 选择设备运行，或执行 Product → Archive
4. 通过 Organizer 导出并上传

CI 生成的是未签名 IPA，只能在后续自行签名后安装。

## 6. GitHub Actions

当前工作流：

| 文件 | 触发方式 | 产物 |
|---|---|---|
| `.github/workflows/build-and-release.yml` | 推送 `main`、`master`、`pro` 或手动触发 | Android APK、未签名 iOS IPA、GitHub Release |
| `.github/workflows/build-android.yml` | 手动触发 | Debug APK Artifact |
| `.github/workflows/build-ios.yml` | 手动触发 | 未签名 IPA Artifact |

自动发布标签规则：

- `main` / `master` → `latest-build`
- 其他监听分支（当前为 `pro`）→ `latest-build-<branch>`

`yuhan` 当前不在自动 push 触发列表中，但可以在 Actions 页面手动运行工作流。

## 7. 发布检查清单

- `npm ci` 成功
- `npm run lint` 通过或已确认现有警告
- `npm run build` 退出码为 0
- 在目标浏览器验证数字钟、模拟钟、日历、计时器和设置面板
- 验证 PWA manifest、图标和 Service Worker 更新
- 通过 HTTPS 验证摄像头权限和 MediaPipe 模型加载
- Android/iOS 重新执行 `npm run build:cap`
- 未将 `.env.local`、签名文件、证书或私人密钥提交到 Git

## 8. 故障排查

### 页面空白

- 查看浏览器控制台和网络请求
- 确认服务器支持 SPA 回退
- 确认静态资源路径未被错误添加子目录前缀

### PWA 未更新

- 关闭旧标签页后重新打开
- 清除站点 Service Worker 与缓存
- 检查 `sw.js` 和 `workbox-*.js` 是否被代理缓存

### 摄像头不可用

- Web 部署必须使用 HTTPS 或 localhost
- 检查系统与浏览器摄像头权限
- 检查 `public/mediapipe/` 资源是否完整发布

### Capacitor 内容未更新

重新执行：

```bash
npm run build:cap
```
