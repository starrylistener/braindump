# 常见问题

## 如何添加新文档？

在 `docs/` 目录下新建 Markdown 文件，然后在 `.vitepress/config.mts` 的侧边栏配置中添加对应条目。

## 如何修改站点标题和描述？

编辑 `docs/.vitepress/config.mts` 中的 `title` 和 `description` 字段。

## 部署失败怎么办？

1. 检查 GitHub Actions 日志（仓库的 Actions 标签页）
2. 确认 `main` 分支代码能否在本地成功构建：`npm run docs:build`
3. 检查 GitHub Pages 设置中 Source 是否选择了 "GitHub Actions"
