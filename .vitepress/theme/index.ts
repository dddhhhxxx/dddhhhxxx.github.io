import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import LangSwitch from './components/LangSwitch.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 语言切换按钮放在站点标题之后（左上角），移动端同样可见
      'nav-bar-title-after': () => h(LangSwitch)
    })
  }
}
