import { defineConfig } from 'vitepress'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

// ======== 站点信息 ========
const SITE_TITLE = '嵌入式底层软件'
const SITE_DESC = '嵌入式底层软件开发笔记 —— 系统交付、平台与外设、复杂模块、性能与功耗'
const SITE_TITLE_EN = 'Embedded Low-Level Software'
const SITE_DESC_EN = 'Notes on embedded low-level software — delivery, platforms & peripherals, complex modules, performance & power'
const GITHUB_URL = 'https://github.com/dddhhhxxx/dddhhhxxx.github.io'
// =========================

// ======== 分类骨架：目录名 → 显示名，数组顺序即侧边栏顺序 ========
// 中英文共用同一套目录，只有显示名不同；新增分类时两边一起加
const DOCS_DIR = fileURLToPath(new URL('../docs', import.meta.url))

interface SubNode {
  dir: string
  text: string
}
interface CatNode {
  dir: string
  text: string
  subs: SubNode[]
}

const TREE_ZH: CatNode[] = [
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
  { dir: 'performance', text: '性能与功耗', subs: [] }
]

const TREE_EN: CatNode[] = [
  {
    dir: 'software-delivery',
    text: 'Software Delivery',
    subs: [
      { dir: 'mcu', text: 'MCU' },
      { dir: 'rtos', text: 'RTOS' },
      { dir: 'linux', text: 'Linux' },
      { dir: 'android', text: 'Android' }
    ]
  },
  {
    dir: 'hardware',
    text: 'Hardware & Peripherals',
    subs: [
      { dir: 'soc', text: 'SoC' },
      { dir: 'mcu', text: 'MCU' }
    ]
  },
  {
    dir: 'modules',
    text: 'Complex Modules',
    subs: [
      { dir: 'camera', text: 'Camera' },
      { dir: 'display', text: 'Display' }
    ]
  },
  { dir: 'performance', text: 'Performance & Power', subs: [] }
]
// ==============================================================

/** 从 Markdown 的 frontmatter 里读 title */
function readTitle(file: string): string {
  const content = fs.readFileSync(file, 'utf-8')
  const m = content.match(/^title:\s*(.+?)\s*$/m)
  return m ? m[1].replace(/^['"]|['"]$/g, '') : path.basename(file, '.md')
}

/**
 * 扫描 posts 目录，按分类骨架自动生成侧边栏（空分类不显示）
 * @param tree 分类骨架（决定显示名）
 * @param relDir 相对 docs/ 的文章根目录，如 'posts' 或 'en/posts'
 * @param linkPrefix 链接前缀，如 '/posts' 或 '/en/posts'
 */
function buildSidebar(tree: CatNode[], relDir: string, linkPrefix: string) {
  const base = path.join(DOCS_DIR, relDir)
  const groups: { text: string; items: any[] }[] = []

  for (const cat of tree) {
    const items: any[] = []
    // 无子分类时（如「性能与功耗」），文章直接放在大类目录下
    const subDirs = cat.subs.length ? cat.subs : [{ dir: '', text: '' }]

    for (const sub of subDirs) {
      const dir = path.join(base, cat.dir, sub.dir)
      if (!fs.existsSync(dir)) continue

      const files = fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.md'))
        .sort()

      if (!files.length) continue

      const links = files.map((f) => ({
        text: readTitle(path.join(dir, f)),
        link: [linkPrefix, cat.dir, sub.dir, f.replace(/\.md$/, '')].filter(Boolean).join('/')
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

  // ======== i18n：中文在根路径，英文在 /en/ ========
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: SITE_TITLE,
      description: SITE_DESC,
      themeConfig: {
        nav: [
          { text: '首页', link: '/' },
          { text: '分类', link: '/categories' },
          { text: '归档', link: '/archive' },
          { text: '标签', link: '/tags' },
          { text: '关于', link: '/about' }
        ],
        sidebar: {
          '/posts/': buildSidebar(TREE_ZH, 'posts', '/posts')
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
    },

    en: {
      label: 'English',
      lang: 'en-US',
      title: SITE_TITLE_EN,
      description: SITE_DESC_EN,
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Categories', link: '/en/categories' },
          { text: 'Archive', link: '/en/archive' },
          { text: 'Tags', link: '/en/tags' },
          { text: 'About', link: '/en/about' }
        ],
        sidebar: {
          '/en/posts/': buildSidebar(TREE_EN, 'en/posts', '/en/posts')
        },
        outline: { level: [2, 3], label: 'On this page' },
        lastUpdatedText: 'Last updated on',
        docFooter: { prev: 'Previous', next: 'Next' },
        footer: {
          message: 'Built with VitePress · corrections welcome',
          copyright: 'Copyright © 2026 · All rights reserved'
        },
        editLink: {
          pattern: `${GITHUB_URL}/edit/main/:path`,
          text: 'Edit this page on GitHub'
        }
      }
    }
  },

  themeConfig: {
    logo: '/logo.svg',
    socialLinks: [{ icon: 'github', link: GITHUB_URL }]
  }
})
