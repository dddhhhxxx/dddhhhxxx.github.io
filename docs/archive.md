---
title: 文章归档
description: 全部文章按时间倒序排列
---

<script setup>
import { data as posts } from '@data/posts.data'

const groups = []
for (const p of posts) {
  let g = groups.find((x) => x.year === p.year)
  if (!g) {
    g = { year: p.year, items: [] }
    groups.push(g)
  }
  g.items.push(p)
}
</script>

# 文章归档

共 {{ posts.length }} 篇，按发布时间倒序。

<div v-for="g in groups" :key="g.year">
  <h2 class="archive-year">{{ g.year }} 年</h2>
  <ul class="post-list">
    <li v-for="post in g.items" :key="post.url">
      <a :href="post.url">{{ post.title }}</a>
      <span class="post-date">{{ post.date }}</span>
    </li>
  </ul>
</div>
