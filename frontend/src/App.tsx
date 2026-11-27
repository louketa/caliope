import { useEffect, useState } from 'react'
import { Feed } from './components/Feed'
import { Login } from './components/Login'
import { getSession, type Session } from './store'

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  useEffect(() => { getSession().then(setSession).catch(() => setSession(null)) }, [])
  if (session === undefined) return null
  return session ? <Feed onLogout={() => setSession(null)} /> : <Login onSession={setSession} />
}
