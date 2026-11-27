// Posts vêm da API (server/index.mjs). Login segue local, de demonstração.
import type { Lang } from './i18n'

export type Kind = 'aforismo' | 'poesia' | 'cordel' | 'conto' | 'romance' | 'letra'
export const KINDS: Kind[] = ['aforismo', 'poesia', 'cordel', 'conto', 'romance', 'letra']
export const ENABLED_KINDS: Kind[] = ['aforismo', 'romance']

export interface Post {
  id: string
  kind: Kind
  lang: Lang
  author: string
  text: string
  likes: number
  createdAt: number
  featured: boolean
  // só romance: título e link externo (ex.: Drive); `text` é a prévia gratuita
  title?: string
  url?: string
}
export type NewPost = Pick<Post, 'kind' | 'lang' | 'author' | 'text'> & Partial<Pick<Post, 'featured' | 'title' | 'url'>>
export interface Session { name: string; email: string }

const SESSION = 'caliope.session'

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...init })
  if (!res.ok) throw new Error(((await res.json().catch(() => null)) as { error?: string } | null)?.error ?? res.statusText)
  return res.json() as Promise<T>
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* sem storage */ }
}

export const getPosts = async (): Promise<Post[]> =>
  (await api<Post[]>('/posts')).sort((a, b) => b.createdAt - a.createdAt)
export const addPost = (p: NewPost): Promise<Post> => api('/posts', { method: 'POST', body: JSON.stringify(p) })
export const likePost = (id: string): Promise<Post> => api(`/posts/${id}/like`, { method: 'POST' })

// Login de demonstração: sem servidor, a senha não é guardada nem verificada.
export const getSession = (): Session | null => read<Session | null>(SESSION, null)
export function signIn(email: string, name?: string): Session {
  const s = { email, name: name?.trim() || email.split('@')[0] }
  write(SESSION, s)
  return s
}
export function signOut() { try { localStorage.removeItem(SESSION) } catch { /* sem storage */ } }
