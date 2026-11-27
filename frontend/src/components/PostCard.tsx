import { useTranslation } from 'react-i18next'
import type { Post } from '../store'

const tone = (id: string) => [...id].reduce((a, c) => a + c.charCodeAt(0), 0) % 3
const size = (len: number) => (len < 60 ? 'lg' : len < 140 ? 'md' : 'sm')

export function PostCard({ post, onLike }: { post: Post; onLike: (id: string) => void }) {
  const { t } = useTranslation()
  return (
    <article className={`card tone-${tone(post.id)}${post.featured ? ' featured' : ''}`}>
      {post.featured && <span className="badge">★ {t('post.featured')}</span>}
      {post.title && <h3 className="work-title">{post.title}</h3>}
      <blockquote className={size(post.text.length)}>{post.text}</blockquote>
      {post.url && (
        <a className="read-more" href={post.url} target="_blank" rel="noopener noreferrer">{t('post.readFull')} →</a>
      )}
      <footer>
        <span>{t('post.by')} {post.author}</span>
        <button type="button" className={post.liked ? 'liked' : undefined} aria-pressed={post.liked} onClick={() => onLike(post.id)} aria-label={t('post.like')}>{post.liked ? '♥' : '♡'} {post.likes}</button>
      </footer>
    </article>
  )
}
