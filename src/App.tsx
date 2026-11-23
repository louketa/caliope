import { useState } from 'react'
import { Feed } from './components/Feed'
import { Login } from './components/Login'
import { getSession, type Session } from './store'

export default function App() {
  const [session, setSession] = useState<Session | null>(getSession)
  return session ? <Feed session={session} onLogout={() => setSession(null)} /> : <Login onSession={setSession} />
}
