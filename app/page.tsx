'use client'

import { useState } from 'react'

type Tab = 'search' | 'register' | 'visibility'

type SearchResult =
  | { found: false }
  | { found: true; crew: { crew_id: string; name: string; position: string | null; line_link: string } }

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function Home() {
  const [tab, setTab] = useState<Tab>('search')

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Ambient radial glow */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '300px',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(232,55,42,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Topbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(12,12,15,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--red-dim)',
              border: '1px solid rgba(232,55,42,0.3)',
              boxShadow: '0 0 12px var(--red-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#E8372A" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="9" cy="7" r="4" stroke="#E8372A" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#E8372A" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>CrewLink</span>
          </div>

          {/* Pill nav */}
          <nav style={{
            display: 'flex', gap: 2,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 100, padding: 3,
          }}>
            {([['search', 'Search'], ['register', 'Register'], ['visibility', 'Visibility']] as [Tab, string][]).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  padding: '5px 13px',
                  borderRadius: 100,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  background: tab === id ? 'var(--red)' : 'transparent',
                  color: tab === id ? '#fff' : 'var(--text-muted)',
                  boxShadow: tab === id ? '0 0 10px var(--red-glow)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px 80px', position: 'relative', zIndex: 1 }}>
        {tab === 'search' && <SearchTab />}
        {tab === 'register' && <RegisterTab />}
        {tab === 'visibility' && <VisibilityTab />}
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
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ found: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <SectionHeader
        title="Find a Crew Member"
        subtitle="Enter a Crew ID to get their LINE contact"
      />

      <form onSubmit={handleSearch} style={{ marginTop: 24 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Crew ID
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="mono"
            value={crewId}
            onChange={e => setCrewId(e.target.value)}
            placeholder="e.g. 10234"
            maxLength={20}
            style={inputStyle}
          />
          <button type="submit" disabled={loading || !crewId.trim()} style={primaryButtonStyle(loading || !crewId.trim())}>
            {loading ? <Spinner /> : 'Search'}
          </button>
        </div>
      </form>

      {result && (
        <div style={{ marginTop: 24 }}>
          {result.found ? (
            <ResultCard crew={result.crew} />
          ) : (
            <NotFoundCard crewId={crewId} />
          )}
        </div>
      )}
    </div>
  )
}

function ResultCard({ crew }: { crew: { crew_id: string; name: string; position: string | null; line_link: string } }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: 24,
      animation: 'fadeUp 0.25s ease',
    }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'var(--red-dim)',
          border: '1px solid rgba(232,55,42,0.25)',
          boxShadow: '0 0 18px var(--red-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 700, color: 'var(--red)',
        }}>
          {crew.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{crew.name}</div>
          {crew.position && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
              {crew.position}
            </div>
          )}
        </div>
      </div>

      {/* ID row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--surface2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16,
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Crew ID</span>
        <span className="mono" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{crew.crew_id}</span>
      </div>

      {/* LINE button */}
      <a
        href={crew.line_link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '13px 0', borderRadius: 12,
          background: 'var(--line-green)',
          boxShadow: '0 0 20px var(--line-glow)',
          color: '#fff', fontWeight: 700, fontSize: 15,
          textDecoration: 'none',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <LineIcon />
        Add on LINE
      </a>
    </div>
  )
}

function NotFoundCard({ crewId }: { crewId: string }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 16, padding: 28,
      textAlign: 'center',
      animation: 'fadeUp 0.25s ease',
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Not Found</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        No crew member with ID <span className="mono" style={{ color: 'var(--text-secondary)' }}>{crewId}</span> is visible in the system.
      </div>
    </div>
  )
}

/* ─── Register Tab ─── */
function RegisterTab() {
  const [form, setForm] = useState({ crew_id: '', name: '', position: '', line_link: '', is_visible: true })
  const [state, setState] = useState<FormState>('idle')
  const [msg, setMsg] = useState('')

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setMsg('')
    try {
      const res = await fetch('/api/crew/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setState('error')
        setMsg(data.error || 'Registration failed')
      } else {
        setState('success')
        setMsg('You\'re registered! Others can now find you.')
        setForm({ crew_id: '', name: '', position: '', line_link: '', is_visible: true })
      }
    } catch {
      setState('error')
      setMsg('Network error. Please try again.')
    }
  }

  return (
    <div>
      <SectionHeader
        title="Register Yourself"
        subtitle="Add your contact so crew can reach you on LINE"
      />

      <form onSubmit={handleSubmit} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Crew ID" required>
          <input className="mono" value={form.crew_id} onChange={e => set('crew_id', e.target.value)} placeholder="e.g. 10234" maxLength={20} style={inputStyle} />
        </Field>

        <Field label="Name" required>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" maxLength={60} style={inputStyle} />
        </Field>

        <Field label="Position">
          <div style={{ display: 'flex', gap: 8 }}>
            {['FA', 'Purser'].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => set('position', form.position === p ? '' : p)}
                style={{
                  padding: '8px 18px', borderRadius: 10, border: '1px solid',
                  borderColor: form.position === p ? 'var(--red)' : 'var(--border)',
                  background: form.position === p ? 'var(--red-dim)' : 'var(--surface)',
                  color: form.position === p ? 'var(--red)' : 'var(--text-muted)',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: form.position === p ? '0 0 10px var(--red-glow)' : 'none',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>

        <Field label="LINE Link" required hint="Format: https://line.me/ti/p/~yourid">
          <input value={form.line_link} onChange={e => set('line_link', e.target.value)} placeholder="https://line.me/ti/p/~yourid" style={inputStyle} />
        </Field>

        {/* Visibility toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Allow others to find me</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>You can change this later</div>
          </div>
          <Toggle value={form.is_visible} onChange={v => set('is_visible', v)} />
        </div>

        {msg && (
          <div style={{
            padding: '12px 16px', borderRadius: 10, fontSize: 13,
            background: state === 'success' ? 'rgba(6,199,85,0.1)' : 'rgba(232,55,42,0.1)',
            border: `1px solid ${state === 'success' ? 'rgba(6,199,85,0.3)' : 'rgba(232,55,42,0.3)'}`,
            color: state === 'success' ? 'var(--line-green)' : 'var(--red)',
          }}>
            {msg}
          </div>
        )}

        <button type="submit" disabled={state === 'loading'} style={{ ...primaryButtonStyle(state === 'loading'), marginTop: 4 }}>
          {state === 'loading' ? <><Spinner /> Registering…</> : 'Register'}
        </button>
      </form>
    </div>
  )
}

/* ─── Visibility Tab ─── */
function VisibilityTab() {
  const [crewId, setCrewId] = useState('')
  const [visible, setVisible] = useState(true)
  const [state, setState] = useState<FormState>('idle')
  const [msg, setMsg] = useState('')

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!crewId.trim()) return
    setState('loading')
    setMsg('')
    try {
      const res = await fetch('/api/crew/visibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crew_id: crewId.trim(), is_visible: visible }),
      })
      const data = await res.json()
      if (!res.ok) {
        setState('error')
        setMsg(data.error || 'Update failed')
      } else {
        setState('success')
        setMsg(`Visibility set to ${visible ? 'visible' : 'hidden'}.`)
      }
    } catch {
      setState('error')
      setMsg('Network error. Please try again.')
    }
  }

  return (
    <div>
      <SectionHeader
        title="Update Visibility"
        subtitle="Control whether others can find you in the system"
      />

      <form onSubmit={handleUpdate} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Crew ID" required>
          <input className="mono" value={crewId} onChange={e => setCrewId(e.target.value)} placeholder="e.g. 10234" maxLength={20} style={inputStyle} />
        </Field>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {visible ? 'Visible to others' : 'Hidden from search'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {visible ? 'Crew can find and contact you' : 'No one will find you in search'}
            </div>
          </div>
          <Toggle value={visible} onChange={setVisible} />
        </div>

        {msg && (
          <div style={{
            padding: '12px 16px', borderRadius: 10, fontSize: 13,
            background: state === 'success' ? 'rgba(6,199,85,0.1)' : 'rgba(232,55,42,0.1)',
            border: `1px solid ${state === 'success' ? 'rgba(6,199,85,0.3)' : 'rgba(232,55,42,0.3)'}`,
            color: state === 'success' ? 'var(--line-green)' : 'var(--red)',
          }}>
            {msg}
          </div>
        )}

        <button type="submit" disabled={state === 'loading' || !crewId.trim()} style={primaryButtonStyle(state === 'loading' || !crewId.trim())}>
          {state === 'loading' ? <><Spinner /> Updating…</> : 'Update Visibility'}
        </button>
      </form>
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
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}{required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{hint}</div>}
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        width: 46, height: 26, borderRadius: 100, border: 'none', cursor: 'pointer',
        background: value ? 'var(--red)' : 'var(--surface2)',
        boxShadow: value ? '0 0 12px var(--red-glow)' : 'none',
        position: 'relative', transition: 'all 0.2s', flexShrink: 0,
      }}
      aria-pressed={value}
    >
      <div style={{
        position: 'absolute', top: 3, left: value ? 23 : 3,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  )
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
    </svg>
  )
}

function LineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
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
  transition: 'border-color 0.15s',
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
