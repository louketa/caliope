import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Logo } from './Logo'
import { LangToggle } from './LangToggle'
import { signIn, type Session } from '../store'

export function Login({ onSession }: { onSession: (s: Session) => void }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 6) return setError(true)
    onSession(signIn(email, mode === 'up' ? name : undefined))
  }

  return (
    <main className="auth">
      <LangToggle />
      <Logo slogan={t('brand.slogan')} />
      <p className="tagline">{t('brand.tagline')}</p>

      <div className="tabs" role="tablist">
        {(['in', 'up'] as const).map((m) => (
          <button key={m} role="tab" aria-selected={mode === m} type="button" onClick={() => { setMode(m); setError(false) }}>
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
        {error && <p className="error" role="alert">{t('auth.invalid')}</p>}
        <button className="primary" type="submit">{t(mode === 'in' ? 'auth.signIn' : 'auth.createAction')}</button>
      </form>

      <p className="footer">{t('brand.footer')}</p>
    </main>
  )
}
