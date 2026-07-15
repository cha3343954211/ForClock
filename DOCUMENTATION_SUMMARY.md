# For Clock 文档维护说明

最后更新：2026-07-15

对应分支：`yuhan`

## 当前文档

| 文档 | 面向对象 | 内容 |
|---|---|---|
| [README.md](README.md) | 所有人 | 功能、快速启动、技术栈、移动端和分支说明 |
| [README_CN.md](README_CN.md) | 中文用户 | 精简中文快速指南 |
| [DEVELOPMENT.md](DEVELOPMENT.md) | 开发者 | 架构、状态、AI、手势、PWA 和开发流程 |
| [DEPLOYMENT.md](DEPLOYMENT.md) | 部署人员 | Web/PWA、Android、iOS 和 CI/CD |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 贡献者 | 分支、提交、检查和 PR 规范 |
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | 维护者 | 项目定位、能力、架构和维护重点 |
| [IOS版开发文档.md](IOS版开发文档.md) | iOS 开发者 | Xcode、SPM、签名和 Archive |
| [docs/INDEX.md](docs/INDEX.md) | 所有人 | 文档导航和命令速查 |

## 当前版本基线

- Node.js 22+
- React 19.2
- TypeScript 5.8
- Vite 6.4
- Tailwind CSS 4.1
- Capacitor 8
- MediaPipe Tasks Vision 0.10.14
- 本地开发端口 `3000`
- 当前开发分支 `yuhan`
- 仓库 `https://github.com/cha3343954211/ForClock`

## 已修正的旧信息

- 仓库名从旧的 `oneclock` 统一为 `ForClock`
- 默认开发端口从旧文档中的 `5173` 修正为 `3000`
- Node.js 要求从 18+ 提升为 22+，匹配 Capacitor 8
- iOS 依赖说明从 CocoaPods 更新为 Swift Package Manager
- 本地开发分支统一为 `yuhan`
- 发布工作流说明与 `.github/workflows/` 当前配置保持一致
- 技术栈版本更新为 React 19、Vite 6、Tailwind CSS 4、Capacitor 8

## 归档文档

以下文档记录过去的 README 优化过程，不作为当前运行或部署依据：

- `docs/MOBILE_FIRST_UPDATE.md`
- `docs/QUICK_START_OPTIMIZATION.md`

如归档文档与核心文档冲突，以 `README.md`、`DEVELOPMENT.md`、`DEPLOYMENT.md` 和代码配置为准。

## 维护规则

发生以下变化时必须同步更新文档：

- Node.js、React、Vite、Tailwind 或 Capacitor 版本变化
- `package.json` 脚本变化
- Vite 端口、环境变量或 PWA 配置变化
- Android/iOS 构建工具链变化
- GitHub Actions 触发分支、产物或标签规则变化
- 新增组件、主题、粒子模式或 AI Provider

更新后建议运行：

```bash
rg -n 'oneclock|localhost:5173|Node.js 18|CocoaPods|clock3' -g '*.md' .
npm run build
```
