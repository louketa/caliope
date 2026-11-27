import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LangToggle } from './LangToggle'
import { PostCard } from './PostCard'
import { Composer } from './Composer'
import { ENABLED_KINDS, KINDS, addPost, getPosts, signOut, toggleLike, type Kind, type NewPost, type Post } from '../store'
import type { Lang } from '../i18n'

export function Feed({ onLogout }: { onLogout: () => void }) {
  const { t, i18n } = useTranslation()
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState(false)
  const [kind, setKind] = useState<Kind>('aforismo')
  const [writing, setWriting] = useState(false)

  const lang = i18n.language as Lang

  // a API já devolve filtrado e ordenado: destaques primeiro, depois do mais novo para o mais antigo
  const reload = useCallback(
    () => getPosts(kind, lang).then((p) => { setPosts(p); setError(false) }).catch(() => setError(true)),
    [kind, lang],
  )
  useEffect(() => { void reload() }, [reload])

  async function publish(data: Pick<NewPost, 'text' | 'title' | 'url' | 'featured'>) {
    try {
      await addPost({ ...data, kind, lang })
      await reload()
      setWriting(false)
    } catch { setError(true) }
  }

  return (
    <div className="app">
      <header className="bar">
        <img src="/logo-mark.svg" alt="Caliope" className="bar-mark" />
        <LangToggle />
        <button type="button" className="ghost" onClick={() => { signOut().finally(onLogout) }}>{t('feed.logout')}</button>
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

      {error && <p className="empty">{t('feed.error')}</p>}
      {posts.length === 0 ? (
        <p className="empty">{t('feed.empty')}</p>
      ) : (
        <section className="masonry">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} onLike={(id) => { toggleLike(id).then((u) => setPosts((all) => all.map((x) => (x.id === u.id ? u : x)))).catch(() => setError(true)) }} />
          ))}
        </section>
      )}

      <button type="button" className="fab" onClick={() => setWriting(true)}>✎ {t('feed.write')}</button>
      {writing && <Composer kind={kind} onPublish={publish} onClose={() => setWriting(false)} />}
    </div>
  )
}
