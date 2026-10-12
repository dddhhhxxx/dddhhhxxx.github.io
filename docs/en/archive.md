---
title: Archive
description: All posts in reverse chronological order
---

<script setup>
import { data as posts } from '@data/posts-en.data'

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

# Archive

{{ posts.length }} posts, newest first.

<div v-for="g in groups" :key="g.year">
  <h2 class="archive-year">{{ g.year }}</h2>
  <ul class="post-list">
    <li v-for="post in g.items" :key="post.url">
      <a :href="post.url">{{ post.title }}</a>
      <span class="post-date">{{ post.date }}</span>
    </li>
  </ul>
</div>
