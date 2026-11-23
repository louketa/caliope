import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LangToggle } from './LangToggle'
import { PostCard } from './PostCard'
import { Composer } from './Composer'
import { ENABLED_KINDS, KINDS, addPost, getPosts, likePost, signOut, type Kind, type Session } from '../store'
import type { Lang } from '../i18n'

export function Feed({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const { t, i18n } = useTranslation()
  const [posts, setPosts] = useState(getPosts)
  const [kind, setKind] = useState<Kind>('aforismo')
  const [writing, setWriting] = useState(false)

  const visible = posts.filter((p) => p.kind === kind && p.lang === i18n.language)

  function publish(text: string) {
    addPost({ kind, lang: i18n.language as Lang, author: session.name, text })
    setPosts(getPosts())
    setWriting(false)
  }

  return (
    <div className="app">
      <header className="bar">
        <img src="/logo-mark.svg" alt="Caliope" className="bar-mark" />
        <LangToggle />
        <button type="button" className="ghost" onClick={() => { signOut(); onLogout() }}>{t('feed.logout')}</button>
      </header>

      <nav className="chips">
        {KINDS.map((k) => {
          const on = ENABLED_KINDS.includes(k)
          return (
            <button key={k} type="button" disabled={!on} aria-pressed={kind === k} onClick={() => setKind(k)}>
              {t(`kinds.${k}`)}{!on && <small> · {t('soon')}</small>}
            </button>
          )
        })}
      </nav>

      {visible.length === 0 ? (
        <p className="empty">{t('feed.empty')}</p>
      ) : (
        <section className="masonry">
          {visible.map((p) => (
            <PostCard key={p.id} post={p} onLike={(id) => { likePost(id); setPosts(getPosts()) }} />
          ))}
        </section>
      )}

      <button type="button" className="fab" onClick={() => setWriting(true)}>✎ {t('feed.write')}</button>
      {writing && <Composer onPublish={publish} onClose={() => setWriting(false)} />}
    </div>
  )
}
