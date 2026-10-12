---
title: Categories
---

# Categories

<script setup>
import { data as posts } from '@data/posts-en.data'

const TREE = [
  {
    name: 'Software Delivery',
    icon: '/icons/layers.svg',
    subs: [
      { name: 'MCU', icon: '/icons/chip.svg' },
      { name: 'RTOS', icon: '/icons/rtos.svg' },
      { name: 'Linux', icon: '/icons/tux.svg' },
      { name: 'Android', icon: '/icons/android.svg' }
    ]
  },
  {
    name: 'Hardware & Peripherals',
    icon: '/icons/board.svg',
    subs: [
      { name: 'SoC', icon: '/icons/soc.svg' },
      { name: 'MCU', icon: '/icons/chip.svg' }
    ]
  },
  {
    name: 'Complex Modules',
    icon: '/icons/module.svg',
    subs: [
      { name: 'Camera', icon: '/icons/camera.svg' },
      { name: 'Display', icon: '/icons/display.svg' }
    ]
  },
  { name: 'Performance & Power', icon: '/icons/power.svg', subs: [] }
]

function listOf(cat, sub) {
  return posts.filter((p) => p.category === cat && (!sub || p.sub === sub))
}
</script>

<div v-for="cat in TREE" :key="cat.name" class="cat-card">
  <div class="cat-head">
    <img class="cat-icon cat-icon-lg" :src="cat.icon" alt="">
    <h2>{{ cat.name }}</h2>
  </div>

  <div v-if="cat.subs.length">
    <div v-for="sub in cat.subs" :key="sub.name" class="cat-sub">
      <div class="cat-sub-head">
        <img class="cat-icon" :src="sub.icon" alt="">
        <h3>{{ sub.name }}</h3>
      </div>
      <ul v-if="listOf(cat.name, sub.name).length" class="post-list">
        <li v-for="p in listOf(cat.name, sub.name)" :key="p.url">
          <a :href="p.url">{{ p.title }}</a>
          <span class="post-date">{{ p.date }}</span>
        </li>
      </ul>
      <p v-else class="cat-empty">No posts yet</p>
    </div>
  </div>

  <div v-else>
    <ul v-if="listOf(cat.name, '').length" class="post-list">
      <li v-for="p in listOf(cat.name, '')" :key="p.url">
        <a :href="p.url">{{ p.title }}</a>
        <span class="post-date">{{ p.date }}</span>
      </li>
    </ul>
    <p v-else class="cat-empty">No posts yet</p>
  </div>
</div>
