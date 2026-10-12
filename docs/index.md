---
layout: home

hero:
  name: 底层手记
  text: Android BSP 与嵌入式 Linux 开发笔记
  tagline: 内核驱动 · U-Boot · bring-up · 现场调试
  actions:
    - theme: brand
      text: 全部文章
      link: /archive
    - theme: alt
      text: 按标签浏览
      link: /tags

features:
  - title: 内核与驱动
    details: Linux 内核驱动、设备树、中断与时钟、电源域，以及那些只在真机上才复现的竞态问题。
    link: /posts/rk3568-isp-rga
    linkText: 进入 →
  - title: 平台与外设
    details: RK3568 / 全志平台的 bring-up、U-Boot、外设适配，以及硬件数据通路的梳理。
    link: /posts/rk3568-usb-camera-isp
    linkText: 进入 →
  - title: 工程与测试
    details: BSP 自动化测试、调试方法、日志分析 —— 把零散的排查过程沉淀成可复用的流程。
    link: /posts/bsp-automation-testing
    linkText: 进入 →
---

<script setup>
import { data as posts } from '@data/posts.data'
</script>

## 最新文章

<ul class="post-list">
  <li v-for="post in posts.slice(0, 6)" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
    <span class="post-date">{{ post.date }}</span>
  </li>
</ul>

<p style="margin-top: 20px;">
  <a href="/archive">查看全部 {{ posts.length }} 篇 →</a>
</p>
