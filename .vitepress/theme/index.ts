import DefaultTheme from 'vitepress/theme'
import { defineClientComponent } from 'vitepress'
import { h } from 'vue'
import LangSwitch from './components/LangSwitch.vue'
import './custom.css'

// 评论区依赖浏览器 API，只在客户端加载（SSR 预渲染阶段不碰它）
const Waline = defineClientComponent(() => import('./components/Waline.vue'))

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 语言切换按钮放在站点标题之后（左上角），移动端同样可见
      'nav-bar-title-after': () => h(LangSwitch),
      // 文章正文之后挂点赞/评论区
      'doc-after': () => h(Waline)
    })
  }
}
