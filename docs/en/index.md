---
layout: home

hero:
  name: Embedded Low-Level Software
  text: Notes from MCU to Android
  tagline: Delivery · Platforms & Peripherals · Complex Modules · Performance & Power
  image:
    src: /logo.svg
    alt: Embedded Low-Level Software
  actions:
    - theme: brand
      text: Browse Categories
      link: /en/categories
    - theme: alt
      text: All Posts
      link: /en/archive
---

## Topics

<div class="home-grid">
  <a class="home-card" href="/en/categories">
    <img class="cat-icon cat-icon-lg" src="/icons/layers.svg" alt="">
    <h3>Software Delivery</h3>
    <p>Bare-metal MCU and RTOS, Linux kernel drivers, Android BSP — the whole path from bring-up to production.</p>
  </a>
  <a class="home-card" href="/en/categories">
    <img class="cat-icon cat-icon-lg" src="/icons/board.svg" alt="">
    <h3>Hardware & Peripherals</h3>
    <p>SoC platform evaluation, MCU surrounding circuits, peripheral bring-up, and tracing the hardware data paths.</p>
  </a>
  <a class="home-card" href="/en/posts/modules/camera/rk3568-isp-rga">
    <img class="cat-icon cat-icon-lg" src="/icons/module.svg" alt="">
    <h3>Complex Modules</h3>
    <p>Camera and display: long pipelines that straddle hardware and software, taken apart from sensor to app.</p>
  </a>
  <a class="home-card" href="/en/categories">
    <img class="cat-icon cat-icon-lg" src="/icons/power.svg" alt="">
    <h3>Performance & Power</h3>
    <p>Boot time, framerate and latency, standby power and wakeup sources — measure, locate the bottleneck, verify.</p>
  </a>
</div>

<script setup>
import { data as posts } from '@data/posts-en.data'
</script>

## Latest Posts

<ul class="post-list">
  <li v-for="post in posts.slice(0, 8)" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
    <span class="post-cat">{{ post.category }}<template v-if="post.sub"> · {{ post.sub }}</template></span>
    <span class="post-date">{{ post.date }}</span>
  </li>
</ul>

<p style="margin-top: 20px;">
  <a href="/en/archive">All {{ posts.length }} posts →</a>
</p>

<style scoped>
.post-cat {
  font-size: 13px;
  color: var(--vp-c-text-3);
  margin-left: 10px;
}
</style>
