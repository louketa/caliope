// Back-end mínimo: Node puro, sem dependências. Dados em server/data.json.
import { createServer } from 'node:http'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const FILE = fileURLToPath(new URL('./data.json', import.meta.url))
const PORT = Number(process.env.PORT) || 3001
const KINDS = ['aforismo', 'poesia', 'cordel', 'conto', 'romance', 'letra']
const LANGS = ['pt', 'es']
const MAX_TEXT = { aforismo: 280, romance: 1000 }

const seed = [
  ['pt', 'Quem escreve curto é obrigado a pensar longo.', 12],
  ['pt', 'O silêncio também tem rascunhos.', 8],
  ['es', 'Una frase breve es una puerta que se deja entreabierta.', 15],
  ['pt', 'Não se escreve para ser lido: escreve-se para não se perder no caminho de volta a si mesmo, mesmo quando ninguém espera por nós do outro lado da página.', 21],
  ['es', 'La memoria es un cuaderno que reescribe a quien lo lee.', 9],
  ['pt', 'Toda pressa é uma forma de ausência.', 17],
  ['es', 'Escribir es aprender a quedarse.', 6],
  ['pt', 'A palavra certa chega depois de todas as erradas.', 11],
].map(([lang, text, likes], i) => ({
  id: `s${i + 1}`, kind: 'aforismo', lang, author: 'Caliope', text, likes, createdAt: i + 1, featured: false,
}))

const load = () => (existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : seed)
const save = (posts) => writeFileSync(FILE, JSON.stringify(posts, null, 2))

const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}
const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (c) => { raw += c; if (raw.length > 20_000) { reject(new Error('grande')); req.destroy() } })
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}) } catch (e) { reject(e) } })
  })

const isHttpUrl = (s) => { try { return ['http:', 'https:'].includes(new URL(s).protocol) } catch { return false } }
const str = (v) => (typeof v === 'string' ? v.trim() : '')

function validate(b) {
  const kind = str(b.kind), lang = str(b.lang), author = str(b.author), text = str(b.text)
  if (!KINDS.includes(kind)) return 'kind inválido'
  if (!LANGS.includes(lang)) return 'lang inválido'
  if (!author) return 'author obrigatório'
  if (!text) return 'text obrigatório'
  if (text.length > (MAX_TEXT[kind] ?? 5000)) return 'text grande demais'
  const post = { kind, lang, author, text, featured: b.featured === true }
  if (kind === 'romance') {
    const title = str(b.title), url = str(b.url)
    if (!title || title.length > 120) return 'title obrigatório (até 120)'
    if (!isHttpUrl(url)) return 'url inválida (use http ou https)'
    post.title = title
    post.url = url
  }
  return post
}

createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://x')
    if (req.method === 'GET' && pathname === '/api/posts') return send(res, 200, load())
    if (req.method === 'POST' && pathname === '/api/posts') {
      const v = validate(await readBody(req))
      if (typeof v === 'string') return send(res, 400, { error: v })
      const post = { ...v, id: randomUUID(), likes: 0, createdAt: Date.now() }
      save([post, ...load()])
      return send(res, 201, post)
    }
    const like = pathname.match(/^\/api\/posts\/([^/]+)\/like$/)
    if (req.method === 'POST' && like) {
      const posts = load()
      const post = posts.find((p) => p.id === like[1])
      if (!post) return send(res, 404, { error: 'não encontrado' })
      post.likes += 1
      save(posts)
      return send(res, 200, post)
    }
    send(res, 404, { error: 'rota inexistente' })
  } catch {
    send(res, 400, { error: 'requisição inválida' })
  }
}).listen(PORT, () => console.log(`API em http://localhost:${PORT}`))
