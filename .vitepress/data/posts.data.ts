import { createContentLoader } from 'vitepress'

export interface Post {
  title: string
  url: string
  date: string
  year: string
  tags: string[]
  category: string
  excerpt: string
}

declare const data: Post[]
export { data }

export default createContentLoader('posts/**/*.md', {
  excerpt: true,
  transform(raw): Post[] {
    return raw
      .map(({ url, frontmatter, excerpt }) => ({
        title: frontmatter.title || url,
        url,
        date: String(frontmatter.date || ''),
        year: String(frontmatter.date || '').slice(0, 4),
        tags: frontmatter.tags || [],
        category: frontmatter.category || '未分类',
        // excerpt 可能是渲染函数，统一转成字符串
        excerpt: typeof excerpt === 'string' ? excerpt.replace(/<[^>]+>/g, '') : ''
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }
})
