import { defineConfig } from 'vitepress'

export default defineConfig({
  // 站点元数据
  lang: 'zh-CN',
  title: 'Starry Listener 知识库',
  description: '个人与团队的知识沉淀空间',

  // 部署基础路径（GitHub Pages 项目站点需要）
  base: '/braindump/',

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

  // 主题配置
  themeConfig: {
    // Logo
    logo: '/logo.svg',

    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '文档', link: '/guide/universal-db-mcp', activeMatch: '/guide/' }
    ],

    // 侧边栏（按路径独立配置）
    sidebar: {
      '/guide/': [
        {
          text: '文档',
          collapsed: false,
          items: [
            { text: 'Universal DB MCP', link: '/guide/universal-db-mcp' }
          ]
        }
      ]
    },

    // GitHub 仓库链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/starrylistener/braindump' }
    ],

    // 页脚
    footer: {
      message: '基于 MIT 许可发布',
      copyright: `Copyright © ${new Date().getFullYear()}`
    },

    // 编辑此页
    editLink: {
      pattern: 'https://github.com/starrylistener/braindump/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 搜索
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
