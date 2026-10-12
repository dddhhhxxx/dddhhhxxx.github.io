import { createContentLoader } from 'vitepress'

export interface Post {
  title: string
  url: string
  date: string
  year: string
  tags: string[]
  category: string
  sub: string
  excerpt: string
}

declare const data: Post[]
export { data }

export default createContentLoader('en/posts/**/*.md', {
  excerpt: true,
  transform(raw): Post[] {
    return raw
      .map(({ url, frontmatter, excerpt }) => ({
        title: frontmatter.title || url,
        url,
        date: String(frontmatter.date || ''),
        year: String(frontmatter.date || '').slice(0, 4),
        tags: frontmatter.tags || [],
        category: frontmatter.category || 'Uncategorized',
        sub: frontmatter.sub || '',
        excerpt: typeof excerpt === 'string' ? excerpt.replace(/<[^>]+>/g, '') : ''
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }
})
