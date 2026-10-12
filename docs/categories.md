---
title: 分类
---

# 分类

<script setup>
import { data as posts } from '@data/posts.data'

const TREE = [
  { name: '软件系统交付', subs: ['MCU', 'RTOS', 'Linux', 'Android'] },
  { name: '硬件平台与外设', subs: ['SoC', 'MCU'] },
  { name: '复杂模块', subs: ['摄像头', '显示'] },
  { name: '性能与功耗', subs: [] }
]

function listOf(cat, sub) {
  return posts.filter((p) => p.category === cat && (!sub || p.sub === sub))
}
</script>

<div v-for="cat in TREE" :key="cat.name" class="cat-block">
  <h2>{{ cat.name }}</h2>

  <template v-if="cat.subs.length">
    <div v-for="sub in cat.subs" :key="sub" class="cat-sub">
      <h3>{{ sub }}</h3>
      <ul v-if="listOf(cat.name, sub).length" class="post-list">
        <li v-for="p in listOf(cat.name, sub)" :key="p.url">
          <a :href="p.url">{{ p.title }}</a>
          <span class="post-date">{{ p.date }}</span>
        </li>
      </ul>
      <p v-else class="cat-empty">暂无文章</p>
    </div>
  </template>

  <template v-else>
    <ul v-if="listOf(cat.name, '').length" class="post-list">
      <li v-for="p in listOf(cat.name, '')" :key="p.url">
        <a :href="p.url">{{ p.title }}</a>
        <span class="post-date">{{ p.date }}</span>
      </li>
    </ul>
    <p v-else class="cat-empty">暂无文章</p>
  </template>
</div>

<style scoped>
.cat-block {
  margin-bottom: 8px;
}
.cat-sub {
  margin-bottom: 12px;
}
.cat-sub h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 14px 0 6px;
  color: var(--vp-c-text-2);
}
.cat-empty {
  font-size: 14px;
  color: var(--vp-c-text-3);
  margin: 0;
}
</style>
