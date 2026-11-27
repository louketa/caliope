// Cliente da API Laravel. Autenticação por sessão (cookie) via Sanctum, no mesmo domínio do front.
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
  liked: boolean
  mine: boolean
  createdAt: number
  featured: boolean
  // só romance: título e link externo (ex.: Drive); `text` é a prévia gratuita
  title?: string | null
  url?: string | null
}
export type NewPost = Pick<Post, 'kind' | 'lang' | 'text'> & Partial<Pick<Post, 'featured' | 'title' | 'url'>>
export interface Session { name: string; email: string }

export class ApiError extends Error {
  status: number
  errors: Record<string, string[]>
  constructor(status: number, errors: Record<string, string[]> = {}, message = '') {
    super(message)
    this.status = status
    this.errors = errors
  }
}

const xsrfToken = () => decodeURIComponent(document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)?.[1] ?? '')

async function ensureCsrf() {
  if (!xsrfToken()) await fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' })
}

async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase()
  if (method !== 'GET') await ensureCsrf()
  const res = await fetch(`/api${path}`, {
    ...init,
    credentials: 'same-origin',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrfToken() },
  })
  // 419 = token CSRF vencido: renova o cookie e tenta de novo uma vez
  if (res.status === 419 && retry) {
    await fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' })
    return api(path, init, false)
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string; errors?: Record<string, string[]> } | null
    throw new ApiError(res.status, body?.errors, body?.message ?? res.statusText)
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}

export const getPosts = async (kind: Kind, lang: Lang): Promise<Post[]> =>
  (await api<{ data: Post[] }>(`/posts?kind=${kind}&lang=${lang}`)).data
export const addPost = async (p: NewPost): Promise<Post> =>
  (await api<{ data: Post }>('/posts', { method: 'POST', body: JSON.stringify(p) })).data
export const toggleLike = async (id: string): Promise<Post> =>
  (await api<{ data: Post }>(`/posts/${id}/like`, { method: 'POST' })).data

export async function getSession(): Promise<Session | null> {
  try {
    return await api<Session>('/me')
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null
    throw e
  }
}
export const signIn = (email: string, password: string): Promise<Session> =>
  api('/login', { method: 'POST', body: JSON.stringify({ email, password }) })
export const signUp = (name: string, email: string, password: string): Promise<Session> =>
  api('/register', { method: 'POST', body: JSON.stringify({ name, email, password }) })
export const signOut = (): Promise<void> => api('/logout', { method: 'POST' })
