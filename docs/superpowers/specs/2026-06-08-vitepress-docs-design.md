# VitePress 知识库文档站设计文档

## 背景与目标

基于 GitHub Pages 搭建一个美观的个人/团队知识库站点，用于沉淀笔记、技术文档和最佳实践。要求视觉现代、维护简单、零成本运行。

---

## 架构

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 静态生成 | VitePress v1.x | 基于 Vite + Vue 3，默认主题美观 |
| 托管 | GitHub Pages | 免费、支持自定义域名和 HTTPS |
| CI/CD | GitHub Actions | 推送到 main 分支即自动构建部署 |
| 搜索 | minisearch (内置) | 本地全文搜索，无需第三方服务 |

### 部署流程

```
本地 Markdown 编辑
       ↓
 git push origin main
       ↓
GitHub Actions 触发
       ↓
  npm ci → vitepress build
       ↓
  部署到 GitHub Pages
       ↓
   站点自动更新
```

### 仓库结构

```
docs/                          # VitePress 项目根目录
├── .vitepress/
│   ├── config.mts             # 站点配置（导航、侧边栏、主题、搜索）
│   └── theme/
│       ├── index.ts           # 主题扩展入口
│       └── style.css          # 自定义样式覆盖
├── public/
│   ├── logo.svg               # 站点 Logo
│   └── favicon.ico            # Favicon
├── index.md                   # 首页（Landing Page）
├── guide/                     # "指南"分类
│   ├── index.md
│   ├── getting-started.md
│   └── writing.md
├── notes/                     # "笔记"分类
│   ├── index.md
│   ├── frontend.md
│   └── backend.md
├── api/                       # "API/参考"分类（预留）
│   └── index.md
└── faq.md                     # 常见问题
```

---

## 组件与设计

### 首页（Landing Page）

- **Hero 区域**：大标题 + 一句话描述 + 两个 CTA 按钮（"快速开始" / "浏览文档"）
- **特色卡片区**：3-4 个卡片展示知识库核心分类，带轻微阴影和悬停动画
- 整体风格简洁现代，默认跟随系统主题

### 导航栏

- 左侧：Logo + 站点名称
- 右侧：核心分类入口（"指南"、"笔记"、"FAQ"）+ 搜索框 + 主题切换按钮 + GitHub 仓库链接

### 侧边栏

- 按目录结构自动生成，支持多级折叠
- 每个顶级分类（如 `/guide/`、`/notes/`）有独立的侧边栏配置
- 当前页面高亮

### 内容页

- 右侧显示文章大纲（TOC，自动提取 H2/H3）
- "编辑此页"链接，跳转 GitHub 编辑界面
- 上一页/下一页导航
- 页面底部显示最后更新时间

---

## 视觉与主题

### 品牌色

- 主色（brand color）使用现代靛蓝色 `#6366f1`，替代默认紫色，提升辨识度
- 灰阶系统保持 VitePress 默认，确保文字层级清晰

### 主题切换

- 三种模式：亮色 / 暗色 / 跟随系统（默认）
- 手动切换状态持久化到 localStorage
- 过渡动画平滑

### 排版

- 正文宽度限制在可读范围（约 65-75 字符宽）
- 代码块暗色背景，与正文区分
- 引用块、表格、提示框（Tip/Warning/Info）使用默认样式

---

## 数据流

VitePress 是纯静态站点生成器，无运行时数据流：

1. **构建时**：VitePress 扫描所有 Markdown 文件，生成静态 HTML + 客户端路由
2. **运行时**：Vue SPA 接管，导航为客户端路由切换
3. **搜索索引**：构建时由 `minisearch` 生成 JSON 索引，随站点一起部署
4. **配置**：所有导航、侧边栏、主题配置集中在 `.vitepress/config.mts` 中

---

## 功能模块

### 本地全文搜索

- 引擎：VitePress 内置 minisearch
- 支持中文分词（通过配置分词逻辑优化）
- 快捷键：Cmd/Ctrl + K 唤起搜索框

### 多语言预留

- 配置文件中预留 `locales` 结构
- 目录按 `zh/`、`en/` 划分，初期只填充中文内容
- 后续启用英文版时只需翻译文件并激活配置

### GitHub 集成

- 导航栏 GitHub 图标链接到仓库
- 每页底部"最后更新时间"和"编辑此页"链接

### 响应式

- 移动端侧边栏变为抽屉式
- 页面加载进度条（内置）
- 个性化 404 页面

---

## 部署与自动化

### GitHub Actions 工作流

文件：`.github/workflows/deploy.yml`

触发条件：`main` 分支的 push 事件

步骤：
1. Checkout 代码
2. 安装 Node.js LTS
3. `npm ci`
4. `vitepress build`
5. `actions/deploy-pages` 部署到 GitHub Pages

### GitHub Pages 配置

- Source 选择 "GitHub Actions"
- 自定义域名在仓库 Settings > Pages 填写，自动创建 `CNAME` 文件
- 强制 HTTPS（默认启用）

### 本地开发命令

| 命令 | 作用 |
|------|------|
| `npm run docs:dev` | 本地实时预览（热更新） |
| `npm run docs:build` | 本地构建测试 |
| `npm run docs:preview` | 预览构建产物 |

---

## 错误处理

- **构建失败**：GitHub Actions 会通过邮件通知仓库所有者，可在 Actions 标签页查看日志
- **404 页面**：VitePress 提供默认 404，可自定义内容引导用户返回首页
- **搜索无结果**：搜索框显示友好提示"未找到相关内容"
- **自定义域名 DNS 问题**：GitHub Pages 设置页会显示 DNS 检测状态，按指引配置 CNAME 或 A 记录即可

---

## 测试

- **构建测试**：每次 PR 或本地提交前运行 `vitepress build`，确保无编译错误
- **链接检查**：使用 `markdown-link-check` 或 VitePress 插件检查死链（后续可扩展）
- **视觉回归**：初期以人工预览为主，站点稳定后可引入 Playwright 截图对比（可选）

---

## 后续可扩展项（不在本期范围）

- Algolia DocSearch 替换本地搜索
- 多语言正式启用
- Giscus 评论系统
- 站点访问统计（如 Umami、Google Analytics）
- 自动生成侧边栏（使用 vitepress-sidebar 插件）
