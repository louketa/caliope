// Camada de dados local (localStorage). Trocar por API real depois mantendo estas assinaturas.
import type { Lang } from './i18n'

export type Kind = 'aforismo' | 'poesia' | 'cordel' | 'conto' | 'novela'
export const KINDS: Kind[] = ['aforismo', 'poesia', 'cordel', 'conto', 'novela']
export const ENABLED_KINDS: Kind[] = ['aforismo']

export interface Post {
  id: string
  kind: Kind
  lang: Lang
  author: string
  text: string
  likes: number
  createdAt: number
}
export interface Session { name: string; email: string }

const POSTS = 'caliope.posts'
const SESSION = 'caliope.session'

const seed: Post[] = [
  { id: 's1', kind: 'aforismo', lang: 'pt', author: 'Caliope', text: 'Quem escreve curto é obrigado a pensar longo.', likes: 12, createdAt: 1 },
  { id: 's2', kind: 'aforismo', lang: 'pt', author: 'Caliope', text: 'O silêncio também tem rascunhos.', likes: 8, createdAt: 2 },
  { id: 's3', kind: 'aforismo', lang: 'es', author: 'Caliope', text: 'Una frase breve es una puerta que se deja entreabierta.', likes: 15, createdAt: 3 },
  { id: 's4', kind: 'aforismo', lang: 'pt', author: 'Caliope', text: 'Não se escreve para ser lido: escreve-se para não se perder no caminho de volta a si mesmo, mesmo quando ninguém espera por nós do outro lado da página.', likes: 21, createdAt: 4 },
  { id: 's5', kind: 'aforismo', lang: 'es', author: 'Caliope', text: 'La memoria es un cuaderno que reescribe a quien lo lee.', likes: 9, createdAt: 5 },
  { id: 's6', kind: 'aforismo', lang: 'pt', author: 'Caliope', text: 'Toda pressa é uma forma de ausência.', likes: 17, createdAt: 6 },
  { id: 's7', kind: 'aforismo', lang: 'es', author: 'Caliope', text: 'Escribir es aprender a quedarse.', likes: 6, createdAt: 7 },
  { id: 's8', kind: 'aforismo', lang: 'pt', author: 'Caliope', text: 'A palavra certa chega depois de todas as erradas.', likes: 11, createdAt: 8 },
]

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* sem storage */ }
}

export const getPosts = (): Post[] => read<Post[]>(POSTS, seed).sort((a, b) => b.createdAt - a.createdAt)
export function addPost(p: Pick<Post, 'kind' | 'lang' | 'author' | 'text'>): Post {
  const post: Post = { ...p, id: crypto.randomUUID(), likes: 0, createdAt: Date.now() }
  write(POSTS, [post, ...getPosts()])
  return post
}
export function likePost(id: string) {
  write(POSTS, getPosts().map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)))
}

// Login de demonstração: sem servidor, a senha não é guardada nem verificada.
export const getSession = (): Session | null => read<Session | null>(SESSION, null)
export function signIn(email: string, name?: string): Session {
  const s = { email, name: name?.trim() || email.split('@')[0] }
  write(SESSION, s)
  return s
}
export function signOut() { try { localStorage.removeItem(SESSION) } catch { /* sem storage */ } }
