# For Clock 文档索引

本索引对应 `yuhan` 分支和当前 Capacitor 8 版本。

## 快速导航

### 我想运行项目

1. 阅读 [README](../README.md)
2. 安装 Node.js 22+
3. 执行：

```bash
npm ci
cp .env.local.example .env.local
npm run dev
```

访问 <http://localhost:3000>。

### 我想开发功能

- [开发指南](../DEVELOPMENT.md)
- [贡献指南](../CONTRIBUTING.md)
- [项目概览](../PROJECT_OVERVIEW.md)

### 我想部署

- [完整部署指南](../DEPLOYMENT.md)
- [iOS 开发指南](../IOS版开发文档.md)

### 我想了解文档状态

- [文档维护说明](../DOCUMENTATION_SUMMARY.md)

## 命令速查

```bash
# Web
npm run dev
npm run build
npm run preview
npm run lint

# Capacitor
npm run build:cap
npm run sync:android
npm run sync:ios
npm run open:android
npm run open:ios

# 资源
npm run generate-icons
```

## 配置文件速查

| 文件 | 用途 |
|---|---|
| `package.json` | 依赖和 npm 脚本 |
| `vite.config.ts` | 端口、PWA、构建和代码拆包 |
| `capacitor.config.ts` | App ID、应用名和移动端 WebView 配置 |
| `.env.local.example` | 可选 AI 环境变量模板 |
| `eslint.config.js` | ESLint 配置 |
| `tsconfig.json` | TypeScript 配置 |
| `.github/workflows/` | Android/iOS 构建和发布工作流 |

## 当前发布规则

- `main` / `master`：自动发布标签 `latest-build`
- `pro`：自动发布标签 `latest-build-pro`
- `yuhan`：当前开发分支，可手动触发工作流

## 归档资料

以下文件只记录过去的文档调整过程，不代表当前配置：

- [移动端优先更新记录](MOBILE_FIRST_UPDATE.md)
- [快速启动优化记录](QUICK_START_OPTIMIZATION.md)

发现冲突时，以源码、`package.json`、`vite.config.ts`、`capacitor.config.ts` 和核心文档为准。
