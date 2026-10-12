---
layout: home

hero:
  name: 嵌入式底层软件
  text: 从 MCU 到 Android 的系统交付笔记
  tagline: 系统交付 · 平台与外设 · 复杂模块 · 性能与功耗
  actions:
    - theme: brand
      text: 浏览分类
      link: /categories
    - theme: alt
      text: 全部文章
      link: /archive

features:
  - title: 软件系统交付
    details: MCU 裸机与 RTOS、Linux 内核与驱动、Android BSP —— 从 bring-up 到量产的整条交付链路。
    link: /categories
    linkText: 进入 →
  - title: 硬件平台与外设
    details: SoC 平台选型与评估、MCU 外围电路、各类外设的适配与联调，以及硬件数据通路的梳理。
    link: /categories
    linkText: 进入 →
  - title: 复杂模块
    details: 摄像头、显示这类链路长、牵扯软硬件两端的模块：从传感器到应用的数据通路拆解。
    link: /posts/modules/camera/rk3568-isp-rga
    linkText: 进入 →
  - title: 性能与功耗
    details: 启动时间、帧率与延迟、待机功耗与唤醒源 —— 量化测量、定位瓶颈、验证优化效果。
    link: /categories
    linkText: 进入 →
---

<script setup>
import { data as posts } from '@data/posts.data'
</script>

## 最新文章

<ul class="post-list">
  <li v-for="post in posts.slice(0, 8)" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
    <span class="post-cat">{{ post.category }}<template v-if="post.sub"> · {{ post.sub }}</template></span>
    <span class="post-date">{{ post.date }}</span>
  </li>
</ul>

<p style="margin-top: 20px;">
  <a href="/archive">查看全部 {{ posts.length }} 篇 →</a>
</p>

<style scoped>
.post-cat {
  font-size: 13px;
  color: var(--vp-c-text-3);
  margin-left: 10px;
}
</style>
