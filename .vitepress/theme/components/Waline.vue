<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
// 注意：样式在 custom.css 里 @import，这里不要静态 import，否则 SSR 阶段会拉进浏览器端代码

// ======== Waline 配置：服务端部署好后只改 SERVER_URL ========
// 匿名评论 + 表情点赞，数据存在你自己的数据库里
const SERVER_URL = 'https://my-repository-smoky-six-63.vercel.app'
// ==========================================================

const route = useRoute()
const { lang } = useData()
const box = ref<HTMLDivElement | null>(null)
let instance: { destroy?: () => void } | null = null

// 只在文章页显示（首页/分类/归档/关于等页面不挂评论）
const enabled = computed(() => {
  const p = route.path
  return p.startsWith('/posts/') || p.startsWith('/en/posts/')
})

const isZh = computed(() => (lang.value || '').toLowerCase().startsWith('zh'))

async function mount() {
  if (!box.value || !enabled.value) return

  try {
    instance?.destroy?.()
  } catch {}
  box.value.innerHTML = ''

  // 动态 import：避免 SSR 阶段加载纯浏览器依赖
  const { init } = await import('@waline/client/full')

  instance = init({
    el: box.value,
    serverURL: SERVER_URL,
    path: route.path, // 每篇文章一个评论集合，中英文页面各自独立
    lang: isZh.value ? 'zh-CN' : 'en',
    dark: 'html.dark', // 跟随站点明暗（VitePress 暗色时 html 上有 .dark）
    // 用 emoji 字符代替默认的贴吧表情图（默认图托管在 unpkg.com，国内常加载失败）
    reaction: ['👍', '❤️', '🎉', '🤔', '👀', '🚀'],
    // 表情对应的提示文案（默认文案是"赞同/反对/酷..."，和自定义表情对不上，这里覆盖）
    locale: isZh.value
      ? {
          reaction0: '有帮助',
          reaction1: '喜欢',
          reaction2: '受教了',
          reaction3: '值得思考',
          reaction4: '持续关注',
          reaction5: '厉害'
        }
      : {
          reaction0: 'Helpful',
          reaction1: 'Love it',
          reaction2: 'Learned',
          reaction3: 'Thoughtful',
          reaction4: 'Following',
          reaction5: 'Awesome'
        },
    search: false,
    requiredMeta: [], // 昵称/邮箱都可留空 → 完全匿名可评
    meta: ['nick', 'mail', 'link'],
    copyright: false
  })
}

onMounted(() => nextTick(mount))
watch(() => route.path, () => nextTick(mount))
watch(() => lang.value, () => nextTick(mount))

onBeforeUnmount(() => {
  try {
    instance?.destroy?.()
  } catch {}
})
</script>

<template>
  <div v-if="enabled" class="post-feedback">
    <p class="post-feedback__tip">
      <span v-if="isZh">觉得这篇有帮助？点个赞再走 👍 &nbsp;无需登录即可留言</span>
      <span v-else>Found this helpful? Give it a 👍 &nbsp;No login needed to comment</span>
    </p>
    <div ref="box" class="post-feedback__waline" />
  </div>
</template>
