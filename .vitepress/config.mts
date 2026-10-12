import { defineConfig } from 'vitepress'
import { fileURLToPath, URL } from 'node:url'

// ======== 需要你改成自己信息的三处 ========
const SITE_TITLE = '底层手记'
const SITE_DESC = 'Android BSP 与嵌入式 Linux 底层开发笔记 —— 内核驱动、U-Boot、bring-up 与调试排查'
const GITHUB_URL = 'https://github.com/Jay/Jay.github.io'
// ========================================

export default defineConfig({
  lang: 'zh-CN',
  title: SITE_TITLE,
  description: SITE_DESC,
  // 绑定自有域名时保持 '/'
  // 若用项目页形式（username.github.io/repo），改成 '/repo/'
  base: '/',
  // 文档源码目录（README、node_modules 等不会被当作页面）
  srcDir: 'docs',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['meta', { name: 'theme-color', content: '#1e6fd9' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh-CN' }],
    ['meta', { property: 'og:title', content: SITE_TITLE }],
    ['meta', { property: 'og:description', content: SITE_DESC }]
  ],

  markdown: {
    lineNumbers: true,
    // 代码块的复制按钮由主题提供，这里只做语言别名映射
    languageAlias: {
      dts: 'cpp',
      dtsi: 'cpp'
    }
  },

  vite: {
    resolve: {
      alias: {
        // 文章数据加载器，页面里用 '@data/posts.data' 引用
        '@data': fileURLToPath(new URL('./data', import.meta.url))
      }
    }
  },

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '归档', link: '/archive' },
      { text: '标签', link: '/tags' },
      { text: '关于', link: '/about' }
    ],

    sidebar: {
      '/posts/': [
        {
          text: '内核与驱动',
          items: [{ text: 'RK3568 的 ISP 与 RGA 分别是干嘛的', link: '/posts/rk3568-isp-rga' }]
        },
        {
          text: '平台与外设',
          items: [{ text: 'USB 摄像头还需要 SoC 的 ISP 吗', link: '/posts/rk3568-usb-camera-isp' }]
        },
        {
          text: '工程与测试',
          items: [{ text: 'RK3568 + Android 12 BSP 自动化测试方案', link: '/posts/bsp-automation-testing' }]
        }
      ]
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文章', buttonAriaLabel: '搜索文章' },
          modal: {
            noResultsText: '没有找到相关内容',
            resetButtonTitle: '清除查询',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        }
      }
    },

    socialLinks: [{ icon: 'github', link: GITHUB_URL }],

    outline: { level: [2, 3], label: '本页目录' },
    lastUpdatedText: '最后更新于',
    docFooter: { prev: '上一篇', next: '下一篇' },

    footer: {
      message: '基于 VitePress 构建 · 内容如有错漏欢迎指正',
      copyright: 'Copyright © 2026 · 保留所有权利'
    },

    editLink: {
      pattern: `${GITHUB_URL}/edit/main/:path`,
      text: '在 GitHub 上编辑本页'
    }
  }
})
