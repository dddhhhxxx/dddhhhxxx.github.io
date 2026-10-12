# 底层手记 · 技术博客

基于 [VitePress](https://vitepress.dev/) 的静态博客，部署到 GitHub Pages + 自有域名。内容方向：Android BSP / 嵌入式 Linux 底层开发。

## 本地运行

```bash
npm install
npm run dev      # 本地预览，默认 http://localhost:5173
npm run build    # 构建，产物在 .vitepress/dist
npm run preview  # 预览构建产物
```

## 目录结构

```
blog/
├── .vitepress/
│   ├── config.mts          站点配置（导航、侧边栏、搜索）
│   ├── data/posts.data.ts  文章内容加载器（自动扫描 docs/posts/）
│   └── theme/
│       ├── index.ts        主题入口
│       └── custom.css      自定义样式（品牌色、文章列表）
├── docs/                   文档源码目录
│   ├── index.md            首页（hero + 最新文章）
│   ├── archive.md          归档页（按年份分组）
│   ├── tags.md             标签页（自动聚合）
│   ├── about.md            关于页
│   └── posts/              文章目录
├── public/                 静态资源，会原样拷到产物根目录
│   └── CNAME               自定义域名
└── .github/workflows/      GitHub Actions 自动部署
```

> 注意：`package.json` 里有 `"type": "module"`，这是 data loader 正常工作必需的，别删。

## 写一篇新文章

在 `docs/posts/` 下新建 `.md` 文件：

```markdown
---
title: 文章标题
date: 2026-10-12
category: 内核与驱动
tags: [RK3568, 驱动]
---

这一段是摘要，会显示在首页和归档页。用下面的分隔线和正文隔开。

---

## 正文小标题

正文内容……
```

然后在 `.vitepress/config.mts` 的 `sidebar` 里加上这一条的链接，导航才会出现。

**frontmatter 字段说明：**

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 文章标题 |
| `date` | 是 | 发布日期，决定排序和归档年份 |
| `category` | 否 | 分类，用于侧边栏分组 |
| `tags` | 否 | 标签数组，自动聚合到 `/tags` |

## 上线前要改的 4 处

1. `.vitepress/config.mts` 顶部三行：`SITE_TITLE` / `SITE_DESC` / `GITHUB_URL`
2. `public/CNAME`：换成你的域名（不绑域名的话直接删掉这个文件）
3. `about.md`：换成你自己的介绍
4. `docs/posts/` 下的三篇示例文章：改成你自己的内容，或者直接删掉

## 部署到 GitHub Pages

仓库：`https://github.com/Jay/Jay.github.io`，线上地址 `https://Jay.github.io`（用户页形式，所以 `config.mts` 里 `base` 保持 `/`）。

日常发布：**双击 `push.bat`**，输入一句提交说明，回车就完事。它会 add → commit → push，GitHub Actions 自动构建发布，1~2 分钟生效。

部署进度看：https://github.com/Jay/Jay.github.io/actions

首次配置（已做过，备忘）：

1. GitHub 建空仓库 `Jay.github.io`（不要勾 README / .gitignore）
2. SSH 公钥加到 GitHub → Settings → SSH and GPG keys → New SSH key
3. 仓库 **Settings → Pages → Source** 选 **GitHub Actions**
4. 本地 remote 用的 SSH：`git@github.com:Jay/Jay.github.io.git`

绑自有域名时：加 `public/CNAME` 写域名 + 域名解析加 CNAME 记录指向 `Jay.github.io`，在 Pages 设置里填域名并勾 Enforce HTTPS。

## 可选增强

- **中文全文搜索**：内置的 local search 对中文分词支持一般（按空格切词）。要更好的中文搜索可以换 [Pagefind](https://pagefind.app/)，需要装 `vitepress-plugin-pagefind` 并在构建后跑一次索引
- **评论**：[Giscus](https://giscus.app/)，基于 GitHub Discussions，免后端
- **访问统计**：不蒜子（一行脚本）或自建 Umami
- **RSS**：VitePress 需要自己写插件生成，或用 `vitepress-plugin-rss`
