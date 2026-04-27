'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

function validateCrewId(v: string) {
  if (!v.trim()) return 'Crew ID is required'
  if (!/^\d{7}$/.test(v.trim())) return 'Crew ID must be exactly 7 digits'
  return ''
}

function validateLineLink(v: string) {
  if (!v.trim()) return 'LINE link is required'
  if (!v.trim().startsWith('https://line.me/')) return 'Must start with https://line.me/'
  return ''
}

type Tab = 'search' | 'settings'
type FormState = 'idle' | 'loading' | 'success' | 'error'
type SearchResult =
  | { found: false }
  | { found: true; crew: { crew_id: string; name: string; line_link: string } }
type CrewProfile = { crew_id: string; name: string; line_link: string; is_visible: boolean }

export default function Home() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<CrewProfile | null | 'loading'>('loading')

  useEffect(() => {
    if (!session) return
    fetch('/api/crew/me')
      .then(r => r.json())
      .then(d => setProfile(d.registered ? d.crew : null))
  }, [session])

  if (status === 'loading' || (session && profile === 'loading')) return <FullScreenSpinner />
  if (!session) return <LoginScreen />
  if (profile === null) return <OnboardingScreen session={session} onComplete={setProfile} />
  if (profile === 'loading') return <FullScreenSpinner />
  return <MainApp session={session} profile={profile} setProfile={setProfile} />
}

/* ─── Full Screen Spinner ─── */
function FullScreenSpinner() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size={28} />
    </div>
  )
}

/* ─── Login Screen ─── */
function LoginScreen() {
  const [loading, setLoading] = useState(false)
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', position: 'relative' }}>
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse at 50% 0%, rgba(232,55,42,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--red-dim)', border: '1px solid rgba(232,55,42,0.3)', boxShadow: '0 0 20px var(--red-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CrewIcon size={22} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>CrewLink</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 10 }}>Cabin Crew Contact</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 40 }}>Log in with LINE to find and connect with crew members.</p>
        <button onClick={() => { setLoading(true); signIn('line') }} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', background: loading ? 'rgba(6,199,85,0.5)' : 'var(--line-green)', boxShadow: loading ? 'none' : '0 0 24px var(--line-glow)', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
          {loading ? <Spinner size={18} /> : <LineIcon size={20} />}
          {loading ? 'Opening LINE…' : 'Login with LINE'}
        </button>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 20, lineHeight: 1.6 }}>Your LINE profile name will be used to identify you.</p>
      </div>
    </div>
  )
}

/* ─── Onboarding Screen ─── */
function OnboardingScreen({ session, onComplete }: { session: { user: { name?: string | null } }; onComplete: (p: CrewProfile) => void }) {
  const [form, setForm] = useState({ crew_id: '', name: session.user.name ?? '', line_link: '' })
  const [touched, setTouched] = useState({ crew_id: false, line_link: false })
  const [state, setState] = useState<FormState>('idle')
  const [msg, setMsg] = useState('')

  const crewIdErr = touched.crew_id ? validateCrewId(form.crew_id) : ''
  const lineLinkErr = touched.line_link ? validateLineLink(form.line_link) : ''
  const isValid = !validateCrewId(form.crew_id) && !validateLineLink(form.line_link) && form.name.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ crew_id: true, line_link: true })
    if (!isValid) return
    setState('loading'); setMsg('')
    try {
      const res = await fetch('/api/crew/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, is_visible: true }) })
      const data = await res.json()
      if (!res.ok) { setState('error'); setMsg(data.error || 'Registration failed') }
      else onComplete({ crew_id: form.crew_id.trim(), name: form.name.trim(), line_link: form.line_link.trim(), is_visible: true })
    } catch { setState('error'); setMsg('Network error. Please try again.') }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', position: 'relative' }}>
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse at 50% 0%, rgba(232,55,42,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--red-dim)', border: '1px solid rgba(232,55,42,0.3)', boxShadow: '0 0 12px var(--red-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CrewIcon size={16} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>CrewLink</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 8 }}>Complete Your Profile</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 28 }}>Two things needed to get started.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Name" required hint="Pre-filled from your LINE profile — edit if needed">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" maxLength={60} style={inputStyle} />
          </Field>
          <Field label="Crew ID" required>
            <input className="mono" value={form.crew_id}
              onChange={e => setForm(f => ({ ...f, crew_id: e.target.value }))}
              onBlur={() => setTouched(t => ({ ...t, crew_id: true }))}
              placeholder="e.g. 1004317" maxLength={7}
              style={{ ...inputStyle, borderColor: crewIdErr ? 'var(--red)' : 'var(--border)' }} />
            {crewIdErr && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 5 }}>{crewIdErr}</div>}
          </Field>
          <Field label="LINE Link" required hint="Format: https://line.me/ti/p/~yourid">
            <input value={form.line_link}
              onChange={e => setForm(f => ({ ...f, line_link: e.target.value }))}
              onBlur={() => setTouched(t => ({ ...t, line_link: true }))}
              placeholder="https://line.me/ti/p/~yourid"
              style={{ ...inputStyle, borderColor: lineLinkErr ? 'var(--red)' : 'var(--border)' }} />
            {lineLinkErr && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 5 }}>{lineLinkErr}</div>}
          </Field>
          <LineLinkHelper />
          {msg && <Alert type={state === 'error' ? 'error' : 'success'}>{msg}</Alert>}
          <button type="submit" disabled={state === 'loading' || !isValid} style={{ ...primaryButtonStyle(state === 'loading' || !isValid), width: '100%', marginTop: 4 }}>
            {state === 'loading' ? <><Spinner size={14} /> Setting up…</> : 'Complete Setup →'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ─── Main App ─── */
function MainApp({ session, profile, setProfile }: { session: { user: { id: string; name?: string | null; image?: string | null } }; profile: CrewProfile; setProfile: (p: CrewProfile) => void }) {
  const [tab, setTab] = useState<Tab>('search')

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse at 50% 0%, rgba(232,55,42,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(12,12,15,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--red-dim)', border: '1px solid rgba(232,55,42,0.3)', boxShadow: '0 0 12px var(--red-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CrewIcon size={16} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>CrewLink</span>
          </div>
          <nav style={{ display: 'flex', gap: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 100, padding: 3 }}>
            {([['search', 'Search'], ['settings', 'Settings']] as [Tab, string][]).map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding: '5px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s', background: tab === id ? 'var(--red)' : 'transparent', color: tab === id ? '#fff' : 'var(--text-muted)', boxShadow: tab === id ? '0 0 10px var(--red-glow)' : 'none' }}>
                {label}
              </button>
            ))}
          </nav>
          <div onClick={() => setTab('settings')} style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--red)', flexShrink: 0 }}>
            {session.user.image
              ? <img src={session.user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : profile.name.charAt(0).toUpperCase()
            }
          </div>
        </div>
      </header>
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px 80px', position: 'relative', zIndex: 1 }}>
        {tab === 'search' && <SearchTab />}
        {tab === 'settings' && <SettingsTab profile={profile} setProfile={setProfile} />}
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
    setLoading(true); setResult(null)
    try {
      const res = await fetch(`/api/crew/search?crew_id=${encodeURIComponent(crewId.trim())}`)
      setResult(await res.json())
    } catch { setResult({ found: false }) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <SectionHeader title="Find a Crew Member" subtitle="Enter a Crew ID to get their LINE contact" />
      <form onSubmit={handleSearch} style={{ marginTop: 24 }}>
        <label style={labelStyle}>Crew ID</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="mono" value={crewId} onChange={e => { if (/^\d{0,7}$/.test(e.target.value)) setCrewId(e.target.value) }} placeholder="e.g. 1004317" maxLength={7} style={inputStyle} />
          <button type="submit" disabled={loading || crewId.length !== 7} style={primaryButtonStyle(loading || crewId.length !== 7)}>
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
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
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
        <LineIcon size={18} />Add on LINE
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

/* ─── Settings Tab ─── */
function SettingsTab({ profile, setProfile }: { profile: CrewProfile; setProfile: (p: CrewProfile) => void }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: profile.name, line_link: profile.line_link })
  const [touchedEdit, setTouchedEdit] = useState({ line_link: false })
  const [saveState, setSaveState] = useState<FormState>('idle')
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'success' | 'error'>('success')
  const [togglingVisibility, setTogglingVisibility] = useState(false)

  const editLineLinkErr = touchedEdit.line_link ? validateLineLink(form.line_link) : ''
  const editIsValid = !validateLineLink(form.line_link) && form.name.trim()

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setTouchedEdit({ line_link: true })
    if (!editIsValid) return
    setSaveState('loading'); setMsg('')
    try {
      const res = await fetch('/api/crew/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setSaveState('error'); setMsgType('error'); setMsg(data.error || 'Update failed') }
      else { setProfile({ ...profile, name: form.name, line_link: form.line_link }); setSaveState('idle'); setMsgType('success'); setMsg('Profile updated.'); setEditing(false) }
    } catch { setSaveState('error'); setMsgType('error'); setMsg('Network error.') }
  }

  async function toggleVisibility(val: boolean) {
    setTogglingVisibility(true); setMsg('')
    try {
      const res = await fetch('/api/crew/visibility', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_visible: val }) })
      if (res.ok) { setProfile({ ...profile, is_visible: val }); setMsgType('success'); setMsg(val ? 'You are now visible.' : 'You are now hidden.') }
      else { setMsgType('error'); setMsg('Update failed.') }
    } catch { setMsgType('error'); setMsg('Network error.') }
    finally { setTogglingVisibility(false) }
  }

  return (
    <div>
      <SectionHeader title="Settings" subtitle="Manage your profile and visibility" />
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Profile card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: editing ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Profile</span>
            <button onClick={() => { setEditing(!editing); setForm({ name: profile.name, line_link: profile.line_link }); setMsg('') }} style={{ fontSize: 12, fontWeight: 600, color: editing ? 'var(--text-muted)' : 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {!editing ? (
            <div style={{ padding: '4px 0 8px' }}>
              {([['Name', profile.name, false], ['Crew ID', profile.crew_id, true], ['LINE Link', profile.line_link, false]] as [string, string, boolean][]).map(([label, value, mono]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 16px' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
                  <span className={mono ? 'mono' : ''} style={{ fontSize: 13, maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Name" required>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </Field>
              <Field label="LINE Link" required hint="Format: https://line.me/ti/p/~yourid">
                <input value={form.line_link}
                  onChange={e => setForm(f => ({ ...f, line_link: e.target.value }))}
                  onBlur={() => setTouchedEdit(t => ({ ...t, line_link: true }))}
                  style={{ ...inputStyle, borderColor: editLineLinkErr ? 'var(--red)' : 'var(--border)' }} />
                {editLineLinkErr && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 5 }}>{editLineLinkErr}</div>}
              </Field>
              <LineLinkHelper />
              <button type="submit" disabled={saveState === 'loading' || !editIsValid} style={primaryButtonStyle(saveState === 'loading' || !editIsValid)}>
                {saveState === 'loading' ? <><Spinner size={13} /> Saving…</> : 'Save Changes'}
              </button>
            </form>
          )}
        </div>

        {/* Visibility */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{profile.is_visible ? 'Visible to others' : 'Hidden from search'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{profile.is_visible ? 'Crew can find and contact you' : 'You won\'t appear in search'}</div>
          </div>
          <Toggle value={profile.is_visible} onChange={toggleVisibility} disabled={togglingVisibility} />
        </div>

        {msg && <Alert type={msgType}>{msg}</Alert>}

        <button onClick={() => signOut()} style={{ marginTop: 4, padding: '12px 0', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Sign Out
        </button>
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

function LineLinkHelper() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginTop: 8 }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, color: 'var(--line-green)', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 10, display: 'inline-block', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
        กดดูวิธีหา Line link
      </button>
      {open && (
        <div style={{ marginTop: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>วิธีหา LINE ID Link</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>(เอาไว้ให้คนอื่นกดแอดคุณ)</div>
          {[
            '1. เปิดแอป LINE',
            '2. ไปที่ ตั้งค่า (Settings)',
            '3. กด ที่รูปโปรไฟล์ (Profile)',
            '4. กด My QR code → กด copy link',
            '5. กดวาง ในช่อง LINE LINK',
          ].map(step => (
            <div key={step} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0', lineHeight: 1.5 }}>{step}</div>
          ))}
        </div>
      )}
    </div>
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
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
    </svg>
  )
}

function CrewIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#E8372A" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="9" cy="7" r="4" stroke="#E8372A" strokeWidth="2"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#E8372A" strokeWidth="2" strokeLinecap="round"/>
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
