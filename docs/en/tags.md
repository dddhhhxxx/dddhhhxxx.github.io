---
title: Tags
description: Browse all posts by tag
---

<script setup>
import { data as posts } from '@data/posts-en.data'

const tagMap = {}
for (const p of posts) {
  for (const t of p.tags) {
    if (!tagMap[t]) tagMap[t] = []
    tagMap[t].push(p)
  }
}
const tags = Object.keys(tagMap).sort()
</script>

# Tags

<div class="tag-cloud">
  <a v-for="t in tags" :key="t" class="tag-item" :href="'#' + t">{{ t }} · {{ tagMap[t].length }}</a>
</div>

<div v-for="t in tags" :key="t">
  <h2 :id="t" class="tag-group-title"># {{ t }}</h2>
  <ul class="post-list">
    <li v-for="post in tagMap[t]" :key="post.url">
      <a :href="post.url">{{ post.title }}</a>
      <span class="post-date">{{ post.date }}</span>
    </li>
  </ul>
</div>
