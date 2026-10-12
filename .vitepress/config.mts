import { defineConfig } from 'vitepress'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

// ======== 站点信息 ========
const SITE_TITLE = '嵌入式底层软件'
const SITE_DESC = '嵌入式底层软件开发笔记 —— 系统交付、平台与外设、复杂模块、性能与功耗'
const GITHUB_URL = 'https://github.com/dddhhhxxx/dddhhhxxx.github.io'
// =========================

// ======== 分类骨架：目录名 → 中文名，数组顺序即侧边栏顺序 ========
// 新增分类：在 docs/posts/ 下建对应目录，并在这里加一项即可
const POSTS_DIR = fileURLToPath(new URL('../docs/posts', import.meta.url))

const CATEGORY_TREE: { dir: string; text: string; subs: { dir: string; text: string }[] }[] = [
  {
    dir: 'software-delivery',
    text: '软件系统交付',
    subs: [
      { dir: 'mcu', text: 'MCU' },
      { dir: 'rtos', text: 'RTOS' },
      { dir: 'linux', text: 'Linux' },
      { dir: 'android', text: 'Android' }
    ]
  },
  {
    dir: 'hardware',
    text: '硬件平台与外设',
    subs: [
      { dir: 'soc', text: 'SoC' },
      { dir: 'mcu', text: 'MCU' }
    ]
  },
  {
    dir: 'modules',
    text: '复杂模块',
    subs: [
      { dir: 'camera', text: '摄像头' },
      { dir: 'display', text: '显示' }
    ]
  },
  {
    dir: 'performance',
    text: '性能与功耗',
    subs: []
  }
]
// ==============================================================

/** 从 Markdown 的 frontmatter 里读 title */
function readTitle(file: string): string {
  const content = fs.readFileSync(file, 'utf-8')
  const m = content.match(/^title:\s*(.+?)\s*$/m)
  return m ? m[1].replace(/^['"]|['"]$/g, '') : path.basename(file, '.md')
}

/** 扫描 posts/ 目录，按分类骨架自动生成侧边栏（空分类不显示） */
function buildSidebar() {
  const groups: { text: string; items: any[] }[] = []

  for (const cat of CATEGORY_TREE) {
    const items: any[] = []
    // 无子分类时（如「性能与功耗」），文章直接放在大类目录下
    const subDirs = cat.subs.length ? cat.subs : [{ dir: '', text: '' }]

    for (const sub of subDirs) {
      const dir = path.join(POSTS_DIR, cat.dir, sub.dir)
      if (!fs.existsSync(dir)) continue

      const files = fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.md'))
        .sort()

      if (!files.length) continue

      const links = files.map((f) => ({
        text: readTitle(path.join(dir, f)),
        link: ['/posts', cat.dir, sub.dir, f.replace(/\.md$/, '')].filter(Boolean).join('/')
      }))

      if (sub.text) items.push({ text: sub.text, items: links })
      else items.push(...links)
    }

    if (items.length) groups.push({ text: cat.text, items })
  }

  return groups
}

export default defineConfig({
  lang: 'zh-CN',
  title: SITE_TITLE,
  description: SITE_DESC,
  base: '/',
  srcDir: 'docs',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#1e6fd9' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh-CN' }],
    ['meta', { property: 'og:title', content: SITE_TITLE }],
    ['meta', { property: 'og:description', content: SITE_DESC }]
  ],

  markdown: {
    lineNumbers: true,
    languageAlias: {
      dts: 'cpp',
      dtsi: 'cpp'
    }
  },

  vite: {
    resolve: {
      alias: {
        '@data': fileURLToPath(new URL('./data', import.meta.url))
      }
    }
  },

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      { text: '分类', link: '/categories' },
      { text: '归档', link: '/archive' },
      { text: '标签', link: '/tags' },
      { text: '关于', link: '/about' }
    ],

    sidebar: {
      '/posts/': buildSidebar()
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
