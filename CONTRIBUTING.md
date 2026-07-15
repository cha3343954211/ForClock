# 贡献指南

感谢参与 For Clock。本文档对应当前 `yuhan` 开发分支。

## 开始之前

- 使用 Node.js 22+
- 阅读 [README.md](README.md) 和 [DEVELOPMENT.md](DEVELOPMENT.md)
- 搜索现有 Issue 或讨论，避免重复工作
- 不要提交 API Key、签名文件、证书或用户数据

## 本地开发

```bash
git clone --branch yuhan --single-branch https://github.com/cha3343954211/ForClock.git
cd ForClock
npm ci
cp .env.local.example .env.local
npm run dev
```

## 分支命名

从 `yuhan` 创建短期分支：

```bash
git checkout yuhan
git pull origin yuhan
git checkout -b feature/widget-name
```

推荐前缀：

- `feature/`：新功能
- `fix/`：缺陷修复
- `docs/`：文档更新
- `refactor/`：无行为变化的重构
- `chore/`：工具链或维护工作

## 开发原则

- 保持修改聚焦，不顺带重构无关代码
- 优先解决根因，避免仅覆盖症状
- 保持现有 React、TypeScript 和 Tailwind 风格
- 复用现有上下文、hooks、主题和预设系统
- 兼顾桌面、移动端、触摸和不同主题
- 修改持久化数据时兼容已有 `localStorage` 数据
- 修改 Web 代码后重新同步 Capacitor 工程

## 提交前检查

```bash
npm run lint
npm run build
```

如修改移动端相关逻辑：

```bash
npm run build:cap
```

至少手动验证：

- 数字钟、模拟钟、日历和计时器可添加与配置
- 拖动、缩放、旋转和默认布局复位正常
- 深色与浅色主题可读
- AI 无 Key 时能回退到本地语句
- 摄像头权限被拒绝时应用不会崩溃
- 浏览器控制台没有新增错误

## 提交信息

建议使用 Conventional Commits：

```text
feat(clock): add roman dial variant
fix(timer): preserve countdown after reload
docs(readme): update local setup instructions
refactor(widgets): simplify layout presets
```

常用类型：`feat`、`fix`、`docs`、`refactor`、`test`、`chore`。

## Pull Request

PR 描述应包括：

- 修改目的与实现概述
- 影响的 Web/Android/iOS 平台
- 验证命令和手动测试结果
- UI 修改前后截图或录屏（如适用）
- 配置、迁移或兼容性注意事项

避免在同一 PR 中混入无关格式化或大范围文件重排。

## 文档维护

功能、脚本、端口、环境要求或发布流程发生变化时，同步更新：

- `README.md`
- `README_CN.md`
- `DEVELOPMENT.md`
- `DEPLOYMENT.md`
- `docs/INDEX.md`

历史记录型文档可保留原始内容，但应明确标注为归档资料。
