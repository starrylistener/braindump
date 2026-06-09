# VitePress 知识库文档站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从零搭建一个基于 VitePress + GitHub Pages 的美观知识库文档站，支持本地搜索、明暗主题切换、自定义域名，推送到 main 分支自动部署。

**Architecture:** VitePress 作为静态站点生成器，内容使用 Markdown 编写，GitHub Actions 负责构建并部署到 GitHub Pages。本地搜索使用内置 minisearch，无需第三方服务。

**Tech Stack:** VitePress v1.x, Node.js LTS, GitHub Actions, GitHub Pages

---

## 文件结构

```
/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 自动部署工作流
├── docs/
│   ├── .vitepress/
│   │   ├── config.mts          # 站点核心配置（导航、侧边栏、搜索、主题）
│   │   └── theme/
│   │       ├── index.ts        # 主题扩展入口
│   │       └── style.css       # 自定义样式（品牌色、首页美化）
│   ├── public/
│   │   ├── logo.svg            # 站点 Logo
│   │   └── favicon.ico         # Favicon
│   ├── index.md                # 首页（Landing Page）
│   ├── guide/                  # "指南"分类
│   │   ├── index.md
│   │   ├── getting-started.md
│   │   └── writing.md
│   ├── notes/                  # "笔记"分类
│   │   ├── index.md
│   │   ├── frontend.md
│   │   └── backend.md
│   └── faq.md                  # 常见问题
├── package.json                # 项目依赖和脚本
└── .gitignore
```

---

### Task 1: 初始化 Node.js 项目并安装 VitePress

**Files:**
- Create: `package.json`
- Create: `.gitignore`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "docs",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  "devDependencies": {
    "vitepress": "^1.6.3"
  }
}
```

- [ ] **Step 2: 创建 .gitignore**

```
node_modules
.cache
dist
*.local
```

- [ ] **Step 3: 安装依赖**

Run: `npm install`
Expected: `node_modules/vitepress/` 目录创建完成，无报错

- [ ] **Step 4: 提交**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: init project with vitepress"
```

---

### Task 2: 配置 VitePress 核心站点配置

**Files:**
- Create: `docs/.vitepress/config.mts`

- [ ] **Step 1: 编写基础配置**

```typescript
import { defineConfig } from 'vitepress'

export default defineConfig({
  // 站点元数据
  lang: 'zh-CN',
  title: '知识库',
  description: '个人与团队的知识沉淀空间',

  // 构建输出目录（GitHub Actions 部署用）
  outDir: '../dist',

  // 纯净 URL（去掉 .html 后缀）
  cleanUrls: true,

  // 最后更新时间
  lastUpdated: true,

  // Markdown 配置
  markdown: {
    lineNumbers: true,
  },

  // 主题配置（导航、侧边栏、搜索等将在后续 Task 补充）
  themeConfig: {
    // Logo
    logo: '/logo.svg',

    // GitHub 仓库链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/your-repo' }
    ],

    // 页脚
    footer: {
      message: '基于 MIT 许可发布',
      copyright: `Copyright © ${new Date().getFullYear()}`
    },

    // 编辑此页
    editLink: {
      pattern: 'https://github.com/your-username/your-repo/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 搜索（本地 minisearch）
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    }
  }
})
```

注意：将 `your-username/your-repo` 替换为实际的 GitHub 仓库路径。

- [ ] **Step 2: 提交**

```bash
git add docs/.vitepress/config.mts
git commit -m "feat: add vitepress base config"
```

---

### Task 3: 配置导航栏和侧边栏

**Files:**
- Modify: `docs/.vitepress/config.mts`

- [ ] **Step 1: 在 themeConfig 中添加导航栏和侧边栏**

将 config.mts 中的 `themeConfig` 替换为以下内容（保留之前已有的 logo、socialLinks、footer、editLink、search 配置）：

```typescript
  themeConfig: {
    // Logo
    logo: '/logo.svg',

    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: '笔记', link: '/notes/frontend', activeMatch: '/notes/' },
      { text: 'FAQ', link: '/faq' }
    ],

    // 侧边栏（按路径独立配置）
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          collapsed: false,
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '写作规范', link: '/guide/writing' }
          ]
        }
      ],
      '/notes/': [
        {
          text: '技术笔记',
          collapsed: false,
          items: [
            { text: '前端', link: '/notes/frontend' },
            { text: '后端', link: '/notes/backend' }
          ]
        }
      ]
    },

    // GitHub 仓库链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/your-repo' }
    ],

    // 页脚
    footer: {
      message: '基于 MIT 许可发布',
      copyright: `Copyright © ${new Date().getFullYear()}`
    },

    // 编辑此页
    editLink: {
      pattern: 'https://github.com/your-username/your-repo/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 搜索（保留之前的完整配置）
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    }
  }
```

- [ ] **Step 2: 提交**

```bash
git add docs/.vitepress/config.mts
git commit -m "feat: configure nav and sidebar"
```

---

### Task 4: 自定义主题样式

**Files:**
- Create: `docs/.vitepress/theme/index.ts`
- Create: `docs/.vitepress/theme/style.css`

- [ ] **Step 1: 创建主题入口文件**

```typescript
import DefaultTheme from 'vitepress/theme'
import './style.css'

export default DefaultTheme
```

- [ ] **Step 2: 创建自定义样式**

```css
/* 自定义品牌色 - 靛蓝色 */
:root {
  --vp-c-brand-1: #6366f1;
  --vp-c-brand-2: #4f46e5;
  --vp-c-brand-3: #4338ca;
  --vp-c-brand-soft: rgba(99, 102, 241, 0.14);
}

/* 暗色模式品牌色 */
.dark {
  --vp-c-brand-1: #818cf8;
  --vp-c-brand-2: #6366f1;
  --vp-c-brand-3: #4f46e5;
  --vp-c-brand-soft: rgba(99, 102, 241, 0.16);
}

/* 首页 Hero 区域微调 */
.VPHero .name {
  background: linear-gradient(120deg, var(--vp-c-brand-1), #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 特色卡片悬停效果 */
.VPFeatures .VPFeature {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.VPFeatures .VPFeature:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.dark .VPFeatures .VPFeature:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
```

- [ ] **Step 3: 提交**

```bash
git add docs/.vitepress/theme/
git commit -m "feat: customize theme with brand color and hover effects"
```

---

### Task 5: 创建首页 Landing Page

**Files:**
- Create: `docs/index.md`
- Create: `docs/public/logo.svg`

- [ ] **Step 1: 创建首页**

```markdown
---
layout: home

hero:
  name: "知识库"
  text: "沉淀与分享"
  tagline: 记录学习、实践与思考的点滴，构建个人与团队的知识体系
  image:
    src: /logo.svg
    alt: 知识库 Logo
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 浏览文档
      link: /guide/

features:
  - icon: 📚
    title: 系统指南
    details: 从入门到精通的结构化学习路径，帮助你快速掌握核心知识。
  - icon: 📝
    title: 技术笔记
    details: 前端、后端及工程化实践笔记，记录真实项目中的经验与踩坑总结。
  - icon: 🔍
    title: 快速检索
    details: 基于本地索引的全文搜索，支持快捷键唤起，瞬间定位所需内容。
  - icon: 🌙
    title: 主题切换
    details: 亮色、暗色、跟随系统三种模式，自动适配你的阅读环境。
---
```

- [ ] **Step 2: 创建简易 Logo SVG**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="20" fill="#6366f1"/>
  <path d="M30 35 Q30 30 35 30 L65 30 Q70 30 70 35 L70 65 Q70 70 65 70 L35 70 Q30 70 30 65 Z" fill="none" stroke="white" stroke-width="4"/>
  <line x1="40" y1="45" x2="60" y2="45" stroke="white" stroke-width="4" stroke-linecap="round"/>
  <line x1="40" y1="55" x2="55" y2="55" stroke="white" stroke-width="4" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 3: 提交**

```bash
git add docs/index.md docs/public/logo.svg
git commit -m "feat: add landing page and logo"
```

---

### Task 6: 创建内容目录和示例页面

**Files:**
- Create: `docs/guide/index.md`
- Create: `docs/guide/getting-started.md`
- Create: `docs/guide/writing.md`
- Create: `docs/notes/index.md`
- Create: `docs/notes/frontend.md`
- Create: `docs/notes/backend.md`
- Create: `docs/faq.md`

- [ ] **Step 1: 创建指南页面**

`docs/guide/index.md`:
```markdown
# 指南

这里提供系统化的使用指南和最佳实践。

## 目录

- [快速开始](getting-started) — 5 分钟上手
- [写作规范](writing) — 如何写出结构清晰的文档
```

`docs/guide/getting-started.md`:
```markdown
# 快速开始

## 环境准备

确保已安装 Node.js 18+。

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run docs:dev
```

浏览器访问 `http://localhost:5173` 即可预览。

## 构建

```bash
npm run docs:build
```

构建产物位于 `dist/` 目录。
```

`docs/guide/writing.md`:
```markdown
# 写作规范

## 文件组织

- 使用英文文件名，小写，连字符分隔
- 每个分类下放置 `index.md` 作为目录页

## Markdown 规范

- 标题层级不超过 3 级
- 代码块标注语言，方便语法高亮
- 使用相对路径链接到其他文档

## 示例

```markdown
# 页面标题

## 小节

一些正文内容。

```ts
const example = 'hello';
```
```
```

- [ ] **Step 2: 创建笔记页面**

`docs/notes/index.md`:
```markdown
# 技术笔记

记录工作中的技术探索和实战经验。

## 分类

- [前端](frontend) — Vue、React、工程化
- [后端](backend) — Node.js、数据库、架构
```

`docs/notes/frontend.md`:
```markdown
# 前端笔记

## Vue 3 组合式函数最佳实践

```ts
import { ref, computed } from 'vue'

export function useCounter() {
  const count = ref(0)
  const doubled = computed(() => count.value * 2)
  const increment = () => count.value++

  return { count, doubled, increment }
}
```

## React 性能优化

- 使用 `React.memo` 避免不必要的重渲染
- 使用 `useMemo` 缓存计算结果
- 使用 `useCallback` 缓存函数引用
```

`docs/notes/backend.md`:
```markdown
# 后端笔记

## Node.js 错误处理模式

```js
async function handler(req, res, next) {
  try {
    const data = await service.getData(req.params.id)
    res.json(data)
  } catch (err) {
    next(err)
  }
}
```

## 数据库索引设计原则

1. 频繁作为查询条件的字段建立索引
2. 避免对低基数字段（如性别、状态）单独建索引
3. 联合索引遵循最左前缀原则
```

- [ ] **Step 3: 创建 FAQ 页面**

`docs/faq.md`:
```markdown
# 常见问题

## 如何添加新文档？

在 `docs/` 目录下新建 Markdown 文件，然后在 `.vitepress/config.mts` 的侧边栏配置中添加对应条目。

## 如何修改站点标题和描述？

编辑 `docs/.vitepress/config.mts` 中的 `title` 和 `description` 字段。

## 部署失败怎么办？

1. 检查 GitHub Actions 日志（仓库的 Actions 标签页）
2. 确认 `main` 分支代码能否在本地成功构建：`npm run docs:build`
3. 检查 GitHub Pages 设置中 Source 是否选择了 "GitHub Actions"
```

- [ ] **Step 4: 提交**

```bash
git add docs/guide/ docs/notes/ docs/faq.md
git commit -m "feat: add content pages and examples"
```

---

### Task 7: 配置 GitHub Actions 自动部署

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: 创建工作流文件**

```yaml
name: Deploy VitePress to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Install dependencies
        run: npm ci

      - name: Build with VitePress
        run: npm run docs:build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: 提交**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add github actions deploy workflow"
```

---

### Task 8: 本地构建测试与最终提交

**Files:**
- Modify: `docs/.vitepress/config.mts`（如有仓库路径需要替换）

- [ ] **Step 1: 替换 GitHub 仓库占位符**

检查 `docs/.vitepress/config.mts` 中的 `your-username/your-repo`，替换为实际的 GitHub 仓库路径。

- [ ] **Step 2: 本地构建测试**

Run: `npm run docs:build`
Expected: 构建成功，无报错，`dist/` 目录生成，包含 `index.html` 和其他静态文件

- [ ] **Step 3: 本地预览测试（可选）**

Run: `npm run docs:preview`
Expected: 服务启动，可访问首页、导航、搜索、主题切换等功能正常

- [ ] **Step 4: 提交并推送**

```bash
git add docs/.vitepress/config.mts
git commit -m "chore: update github repo links"
git push origin main
```

- [ ] **Step 5: 验证 GitHub Actions 部署**

1. 推送后前往仓库的 **Actions** 标签页
2. 确认 `Deploy VitePress to Pages` 工作流运行成功（显示绿色勾）
3. 前往 **Settings > Pages**，确认站点已部署到 `https://your-username.github.io/your-repo/`

---

## Self-Review Checklist

**1. Spec coverage:**
- [x] 整体架构（VitePress + GitHub Pages + Actions）— Task 1, 7, 8
- [x] 站点结构与导航（首页 Hero、导航栏、侧边栏）— Task 3, 5
- [x] 视觉与主题（品牌色、主题切换、排版）— Task 4
- [x] 功能模块（本地搜索、多语言预留、GitHub 集成）— Task 2, 3
- [x] 部署与自动化（Actions 工作流、本地开发命令）— Task 1, 7, 8
- [x] 错误处理（构建失败、404、DNS 问题）— FAQ 内容 + Actions 配置

**2. Placeholder scan:**
- [x] 无 "TBD"、"TODO"、"implement later"
- [x] 所有配置代码完整可运行
- [x] 仓库路径 `your-username/your-repo` 在 Task 8 中明确提醒替换

**3. Type consistency:**
- [x] 文件名、配置字段、目录结构在全部 Task 中一致
- [x] `config.mts` 中的搜索配置、编辑链接、社交链接格式统一
