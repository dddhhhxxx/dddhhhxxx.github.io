<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as zhPosts } from '../../data/posts.data'
import { data as enPosts } from '../../data/posts-en.data'

const { page } = useData()

// 中文文章的 URL 集合 / 英文文章的 URL 集合，用于判断目标语言有没有对应版本
const zhUrls = new Set(zhPosts.map((p) => p.url))
const enUrls = new Set(enPosts.map((p) => p.url))

const isEn = computed(() => page.value.relativePath.startsWith('en/'))

/**
 * 切换目标：同一篇文章有对应语言版本就跳过去，没有就落到该语言首页。
 * 分类 / 归档 / 标签 / 关于这些页面两种语言都有，直接换前缀。
 */
const target = computed(() => {
  const p = (page.value.filePath || '').replace(/\.md$/, '')
  // filePath 形如 posts/xxx 或 en/posts/xxx；首页与列表页是 index / en/index
  const isPost = p.includes('/posts/')

  if (isEn.value) {
    const stripped = p.replace(/^en\//, '')
    if (isPost) {
      // 去掉 en/ 后得到中文文章路径
      return zhUrls.has('/' + stripped) ? '/' + stripped : '/'
    }
    return stripped === 'index' ? '/' : '/' + stripped
  } else {
    if (isPost) {
      return enUrls.has('/en/' + p) ? '/en/' + p : '/en/'
    }
    return p === 'index' ? '/en/' : '/en/' + p
  }
})

const label = computed(() => (isEn.value ? '中文' : 'EN'))
const hint = computed(() =>
  isEn.value ? '切换到中文版' : 'Switch to English'
)
</script>

<template>
  <a class="lang-switch" :href="target" :title="hint" :aria-label="hint">
    <svg class="lang-switch-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.4 3.8 5.5 3.8 9s-1.3 6.6-3.8 9c-2.5-2.4-3.8-5.5-3.8-9S9.5 5.4 12 3z" />
    </svg>
    <span>{{ label }}</span>
  </a>
</template>

<style scoped>
.lang-switch {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-right: 14px;
  padding: 4px 10px 4px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  color: var(--vp-c-text-2);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.25s, border-color 0.25s, background-color 0.25s;
}

.lang-switch:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.lang-switch-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}
</style>
