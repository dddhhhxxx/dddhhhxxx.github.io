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
│   ├── categories.md       分类总览（四大类 + 子类全貌，空类显示「暂无文章」）
│   ├── archive.md          归档页（按年份分组）
│   ├── tags.md             标签页（自动聚合）
│   ├── about.md            关于页
│   └── posts/              文章目录（**目录即分类，见下**）
└── .github/workflows/      GitHub Actions 自动部署
```

## 分类结构：目录即分类

文章放在哪个目录，就属于哪个分类。**侧边栏是按目录自动生成的，写完丢进对应目录就会出现，不用改 `config.mts`。**

```
docs/posts/
├── software-delivery/   软件系统交付
│   ├── mcu/                MCU
│   ├── rtos/               RTOS
│   ├── linux/              Linux
│   └── android/            Android
├── hardware/            硬件平台与外设
│   ├── soc/                SoC
│   └── mcu/                MCU
├── modules/             复杂模块
│   ├── camera/             摄像头
│   └── display/            显示
└── performance/         性能与功耗（文章直接放这里，无子分类）
```

对应表在 `.vitepress/config.mts` 的 `CATEGORY_TREE` 里维护（目录名 → 中文名，**数组顺序即侧边栏顺序**）。要加新分类：建目录 + 在 `CATEGORY_TREE` 里加一项。

> 注意：`package.json` 里有 `"type": "module"`，这是 data loader 正常工作必需的，别删。

## 写一篇新文章

**第一步：放到对应分类目录下。** 比如一篇 Linux 驱动文章 → `docs/posts/software-delivery/linux/xxx.md`。

**第二步：写 frontmatter。** `category` 和 `sub` 要跟所在目录对应（分类总览页靠这两个字段归组）：

```markdown
---
title: 文章标题
date: 2026-10-12
category: 软件系统交付
sub: Linux
tags: [RK3568, 驱动]
---

这一段是摘要，会显示在首页和归档页。用下面的分隔线和正文隔开。

---

## 正文小标题

正文内容……
```

> 侧边栏不需要手动加 —— 构建时按目录自动生成。

**frontmatter 字段说明：**

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 文章标题 |
| `date` | 是 | 发布日期，决定排序和归档年份 |
| `category` | 否 | 一级分类，中文名（软件系统交付 / 硬件平台与外设 / 复杂模块 / 性能与功耗） |
| `sub` | 否 | 二级分类，中文名（MCU / RTOS / Linux / Android / SoC / 摄像头 / 显示…） |
| `tags` | 否 | 标签数组，自动聚合到 `/tags` |

> `category` / `sub` 决定分类总览页的归组，**目录位置决定侧边栏**，两者保持一致就行。

## 上线前要改的 4 处

1. `.vitepress/config.mts` 顶部三行：`SITE_TITLE` / `SITE_DESC` / `GITHUB_URL`
2. `public/CNAME`：换成你的域名（不绑域名的话直接删掉这个文件）
3. `about.md`：换成你自己的介绍
4. `docs/posts/` 下的三篇示例文章：改成你自己的内容，或者直接删掉

## 部署到 GitHub Pages

仓库：`https://github.com/dddhhhxxx/dddhhhxxx.github.io`，线上地址 `https://dddhhhxxx.github.io`（用户页形式，所以 `config.mts` 里 `base` 保持 `/`）。

日常发布：**双击 `push.bat`**，输入一句提交说明，回车就完事。它会 add → commit → push，GitHub Actions 自动构建发布，1~2 分钟生效。

部署进度看：https://github.com/dddhhhxxx/dddhhhxxx.github.io/actions

首次配置（已做过，备忘）：

1. GitHub 建空仓库 `dddhhhxxx.github.io`（不要勾 README / .gitignore）
2. SSH 公钥加到 GitHub → Settings → SSH and GPG keys → New SSH key
3. 仓库 **Settings → Pages → Source** 选 **GitHub Actions**
4. 本地 remote 用的 SSH：`git@github.com:dddhhhxxx/dddhhhxxx.github.io.git`

绑自有域名时：加 `public/CNAME` 写域名 + 域名解析加 CNAME 记录指向 `dddhhhxxx.github.io`，在 Pages 设置里填域名并勾 Enforce HTTPS。

## 可选增强

- **中文全文搜索**：内置的 local search 对中文分词支持一般（按空格切词）。要更好的中文搜索可以换 [Pagefind](https://pagefind.app/)，需要装 `vitepress-plugin-pagefind` 并在构建后跑一次索引
- **评论**：[Giscus](https://giscus.app/)，基于 GitHub Discussions，免后端
- **访问统计**：不蒜子（一行脚本）或自建 Umami
- **RSS**：VitePress 需要自己写插件生成，或用 `vitepress-plugin-rss`
