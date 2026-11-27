import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Logo } from './Logo'
import { LangToggle } from './LangToggle'
import { ApiError, signIn, signUp, type Session } from '../store'

export function Login({ onSession }: { onSession: (s: Session) => void }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || (mode === 'up' && !name.trim())) return setError('auth.invalid')
    setBusy(true)
    try {
      onSession(mode === 'up' ? await signUp(name.trim(), email, password) : await signIn(email, password))
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0
      if (status === 429) setError('auth.tooMany')
      else if (status === 422 && mode === 'up' && err instanceof ApiError && err.errors.email) setError('auth.emailTaken')
      else if (status === 422) setError(mode === 'in' ? 'auth.wrong' : 'auth.invalid')
      else setError('auth.offline')
    } finally { setBusy(false) }
  }

  return (
    <main className="auth">
      <LangToggle />
      <Logo slogan={t('brand.slogan')} />
      <p className="tagline">{t('brand.tagline')}</p>

      <div className="tabs" role="tablist">
        {(['in', 'up'] as const).map((m) => (
          <button key={m} role="tab" aria-selected={mode === m} type="button" onClick={() => { setMode(m); setError(null) }}>
            {t(m === 'in' ? 'auth.signIn' : 'auth.signUp')}
          </button>
        ))}
      </div>

      <form onSubmit={submit} noValidate>
        {mode === 'up' && (
          <label>
            <span>{t('auth.name')}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('auth.namePlaceholder')} autoComplete="name" />
          </label>
        )}
        <label>
          <span>{t('auth.email')}</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.emailPlaceholder')} autoComplete="email" />
        </label>
        <label>
          <span>{t('auth.password')}</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} />
        </label>
        {error && <p className="error" role="alert">{t(error)}</p>}
        <button className="primary" type="submit" disabled={busy}>{t(mode === 'in' ? 'auth.signIn' : 'auth.createAction')}</button>
      </form>

      <p className="footer">{t('brand.footer')}</p>
    </main>
  )
}
