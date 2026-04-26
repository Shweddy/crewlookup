'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

type Tab = 'search' | 'register' | 'settings'
type FormState = 'idle' | 'loading' | 'success' | 'error'
type SearchResult =
  | { found: false }
  | { found: true; crew: { crew_id: string; name: string; line_link: string } }
type MeResult =
  | { registered: false }
  | { registered: true; crew: { crew_id: string; name: string; line_link: string; is_visible: boolean } }

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <LoadingScreen />
  if (!session) return <LoginScreen />
  return <MainApp session={session} />
}

/* ─── Loading Screen ─── */
function LoadingScreen() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size={28} />
    </div>
  )
}

/* ─── Login Screen ─── */
function LoginScreen() {
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    await signIn('line')
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', position: 'relative' }}>
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse at 50% 0%, rgba(232,55,42,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--red-dim)', border: '1px solid rgba(232,55,42,0.3)', boxShadow: '0 0 20px var(--red-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#E8372A" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="7" r="4" stroke="#E8372A" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#E8372A" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>CrewLink</span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 10 }}>Cabin Crew Contact</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 40 }}>
          Log in with your LINE account to find and connect with crew members.
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '15px 0', borderRadius: 14, border: 'none',
            background: loading ? 'rgba(6,199,85,0.5)' : 'var(--line-green)',
            boxShadow: loading ? 'none' : '0 0 24px var(--line-glow)',
            color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
          }}
        >
          {loading ? <Spinner size={18} /> : <LineIcon size={20} />}
          {loading ? 'Opening LINE…' : 'Login with LINE'}
        </button>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 20, lineHeight: 1.6 }}>
          Your LINE profile name will be used to identify you. No other data is shared.
        </p>
      </div>
    </div>
  )
}

/* ─── Main App ─── */
function MainApp({ session }: { session: { user: { id: string; name?: string | null; image?: string | null } } }) {
  const [tab, setTab] = useState<Tab>('search')

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse at 50% 0%, rgba(232,55,42,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Topbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(12,12,15,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--red-dim)', border: '1px solid rgba(232,55,42,0.3)', boxShadow: '0 0 12px var(--red-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#E8372A" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="9" cy="7" r="4" stroke="#E8372A" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#E8372A" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>CrewLink</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Pill nav */}
            <nav style={{ display: 'flex', gap: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 100, padding: 3 }}>
              {([['search', 'Search'], ['register', 'Register'], ['settings', 'Settings']] as [Tab, string][]).map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} style={{ padding: '5px 13px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s', background: tab === id ? 'var(--red)' : 'transparent', color: tab === id ? '#fff' : 'var(--text-muted)', boxShadow: tab === id ? '0 0 10px var(--red-glow)' : 'none' }}>
                  {label}
                </button>
              ))}
            </nav>

            {/* Avatar */}
            {session.user.image ? (
              <img src={session.user.image} alt="" style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => signOut()} title="Sign out" />
            ) : (
              <button onClick={() => signOut()} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'inherit', cursor: 'pointer' }}>
                out
              </button>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px 80px', position: 'relative', zIndex: 1 }}>
        {tab === 'search' && <SearchTab />}
        {tab === 'register' && <RegisterTab session={session} />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </div>
  )
}

/* ─── Search Tab ─── */
function SearchTab() {
  const [crewId, setCrewId] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!crewId.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/crew/search?crew_id=${encodeURIComponent(crewId.trim())}`)
      setResult(await res.json())
    } catch {
      setResult({ found: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <SectionHeader title="Find a Crew Member" subtitle="Enter a Crew ID to get their LINE contact" />
      <form onSubmit={handleSearch} style={{ marginTop: 24 }}>
        <label style={labelStyle}>Crew ID</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="mono" value={crewId} onChange={e => setCrewId(e.target.value)} placeholder="e.g. 10234" maxLength={20} style={inputStyle} />
          <button type="submit" disabled={loading || !crewId.trim()} style={primaryButtonStyle(loading || !crewId.trim())}>
            {loading ? <Spinner size={14} /> : 'Search'}
          </button>
        </div>
      </form>

      {result && (
        <div style={{ marginTop: 24 }}>
          {result.found ? <ResultCard crew={result.crew} /> : <NotFoundCard crewId={crewId} />}
        </div>
      )}
    </div>
  )
}

function ResultCard({ crew }: { crew: { crew_id: string; name: string; line_link: string } }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, animation: 'fadeUp 0.25s ease' }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--red-dim)', border: '1px solid rgba(232,55,42,0.25)', boxShadow: '0 0 18px var(--red-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--red)' }}>
          {crew.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ fontWeight: 700, fontSize: 17 }}>{crew.name}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Crew ID</span>
        <span className="mono" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{crew.crew_id}</span>
      </div>
      <a href={crew.line_link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px 0', borderRadius: 12, background: 'var(--line-green)', boxShadow: '0 0 20px var(--line-glow)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', transition: 'opacity 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
        <LineIcon size={18} />
        Add on LINE
      </a>
    </div>
  )
}

function NotFoundCard({ crewId }: { crewId: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, textAlign: 'center', animation: 'fadeUp 0.25s ease' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Not Found</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        No crew member with ID <span className="mono" style={{ color: 'var(--text-secondary)' }}>{crewId}</span> is visible in the system.
      </div>
    </div>
  )
}

/* ─── Register Tab ─── */
function RegisterTab({ session }: { session: { user: { id: string; name?: string | null } } }) {
  const [form, setForm] = useState({ crew_id: '', name: session.user.name ?? '', line_link: '', is_visible: true })
  const [state, setState] = useState<FormState>('idle')
  const [msg, setMsg] = useState('')
  const [alreadyRegistered, setAlreadyRegistered] = useState<null | { crew_id: string; name: string }>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch('/api/crew/me')
      .then(r => r.json())
      .then((d: MeResult) => {
        if (d.registered) setAlreadyRegistered({ crew_id: d.crew.crew_id, name: d.crew.name })
      })
      .finally(() => setChecking(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setMsg('')
    try {
      const res = await fetch('/api/crew/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setState('error'); setMsg(data.error || 'Registration failed') }
      else { setState('success'); setMsg('You\'re registered! Others can now find you.'); setAlreadyRegistered({ crew_id: form.crew_id, name: form.name }) }
    } catch {
      setState('error'); setMsg('Network error. Please try again.')
    }
  }

  if (checking) return <div style={{ textAlign: 'center', padding: 40 }}><Spinner size={24} /></div>

  if (alreadyRegistered) {
    return (
      <div>
        <SectionHeader title="Register Yourself" subtitle="Add your contact so crew can reach you on LINE" />
        <div style={{ marginTop: 24, background: 'var(--surface)', border: '1px solid rgba(6,199,85,0.25)', borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 13, color: 'var(--line-green)', fontWeight: 600, marginBottom: 12 }}>✓ Already registered</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--surface2)', borderRadius: 10, padding: '10px 14px', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Name</span>
            <span style={{ fontSize: 13 }}>{alreadyRegistered.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--surface2)', borderRadius: 10, padding: '10px 14px' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Crew ID</span>
            <span className="mono" style={{ fontSize: 13 }}>{alreadyRegistered.crew_id}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 14, textAlign: 'center' }}>Manage visibility in the Settings tab.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <SectionHeader title="Register Yourself" subtitle="Add your contact so crew can reach you on LINE" />
      <form onSubmit={handleSubmit} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Crew ID" required>
          <input className="mono" value={form.crew_id} onChange={e => setForm(f => ({ ...f, crew_id: e.target.value }))} placeholder="e.g. 10234" maxLength={20} style={inputStyle} />
        </Field>

        <Field label="Name" required hint="Pre-filled from your LINE profile — edit if needed">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" maxLength={60} style={inputStyle} />
        </Field>

        <Field label="LINE Link" required hint="Format: https://line.me/ti/p/~yourid">
          <input value={form.line_link} onChange={e => setForm(f => ({ ...f, line_link: e.target.value }))} placeholder="https://line.me/ti/p/~yourid" style={inputStyle} />
        </Field>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Allow others to find me</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>You can change this in Settings</div>
          </div>
          <Toggle value={form.is_visible} onChange={v => setForm(f => ({ ...f, is_visible: v }))} />
        </div>

        {msg && <Alert type={state === 'success' ? 'success' : 'error'}>{msg}</Alert>}

        <button type="submit" disabled={state === 'loading'} style={{ ...primaryButtonStyle(state === 'loading'), marginTop: 4 }}>
          {state === 'loading' ? <><Spinner size={14} /> Registering…</> : 'Register'}
        </button>
      </form>
    </div>
  )
}

/* ─── Settings Tab ─── */
function SettingsTab() {
  const [me, setMe] = useState<MeResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    fetch('/api/crew/me').then(r => r.json()).then(setMe)
  }, [])

  async function toggleVisibility(newVal: boolean) {
    if (!me?.registered) return
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/crew/visibility', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_visible: newVal }) })
      if (res.ok) {
        setMe(prev => prev?.registered ? { ...prev, crew: { ...prev.crew, is_visible: newVal } } : prev)
        setMsgType('success')
        setMsg(newVal ? 'You are now visible to others.' : 'You are now hidden from search.')
      } else {
        setMsgType('error'); setMsg('Update failed.')
      }
    } catch {
      setMsgType('error'); setMsg('Network error.')
    } finally {
      setSaving(false)
    }
  }

  if (!me) return <div style={{ textAlign: 'center', padding: 40 }}><Spinner size={24} /></div>

  return (
    <div>
      <SectionHeader title="Settings" subtitle="Manage your visibility in the crew directory" />
      <div style={{ marginTop: 24 }}>
        {!me.registered ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>You haven&apos;t registered yet.<br />Go to the Register tab to add yourself.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Your Profile</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Name</span>
                <span style={{ fontSize: 13 }}>{me.crew.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Crew ID</span>
                <span className="mono" style={{ fontSize: 13 }}>{me.crew.crew_id}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{me.crew.is_visible ? 'Visible to others' : 'Hidden from search'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{me.crew.is_visible ? 'Crew can find and contact you' : 'No one will find you in search'}</div>
              </div>
              <Toggle value={me.crew.is_visible} onChange={toggleVisibility} disabled={saving} />
            </div>

            {msg && <Alert type={msgType}>{msg}</Alert>}

            <button onClick={() => signOut()} style={{ marginTop: 8, padding: '11px 0', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Shared Components ─── */
function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>{title}</h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>{subtitle}</p>
    </div>
  )
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{hint}</div>}
    </div>
  )
}

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={() => !disabled && onChange(!value)} style={{ width: 46, height: 26, borderRadius: 100, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', background: value ? 'var(--red)' : 'var(--surface2)', boxShadow: value ? '0 0 12px var(--red-glow)' : 'none', position: 'relative', transition: 'all 0.2s', flexShrink: 0, opacity: disabled ? 0.6 : 1 }} aria-pressed={value}>
      <div style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </button>
  )
}

function Alert({ type, children }: { type: 'success' | 'error'; children: React.ReactNode }) {
  return (
    <div style={{ padding: '12px 16px', borderRadius: 10, fontSize: 13, background: type === 'success' ? 'rgba(6,199,85,0.1)' : 'rgba(232,55,42,0.1)', border: `1px solid ${type === 'success' ? 'rgba(6,199,85,0.3)' : 'rgba(232,55,42,0.3)'}`, color: type === 'success' ? 'var(--line-green)' : 'var(--red)' }}>
      {children}
    </div>
  )
}

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
    </svg>
  )
}

function LineIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  )
}

/* ─── Styles ─── */
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 10, color: 'var(--text)', fontSize: 14,
  outline: 'none', fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: 'var(--text-muted)', marginBottom: 8,
  textTransform: 'uppercase', letterSpacing: '0.06em',
}

function primaryButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '12px 22px', borderRadius: 10, border: 'none',
    background: disabled ? 'rgba(232,55,42,0.35)' : 'var(--red)',
    color: disabled ? 'rgba(255,255,255,0.4)' : '#fff',
    fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled ? 'none' : '0 0 16px var(--red-glow)',
    transition: 'all 0.15s', whiteSpace: 'nowrap',
  }
}
