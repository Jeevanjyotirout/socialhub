import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Spinner from '../components/ui/Spinner'
import { authAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import clsx from 'clsx'

const TABS = [
  { id: 'profile',   label: '👤 Profile'  },
  { id: 'security',  label: '🔒 Security'  },
  { id: 'about',     label: 'ℹ️ About'     },
]

export default function Settings() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [tab, setTab] = useState('profile')

  // Password change
  const [curPwd,  setCurPwd]  = useState('')
  const [newPwd,  setNewPwd]  = useState('')
  const [confPwd, setConfPwd] = useState('')
  const [pwdLoad, setPwdLoad] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [user, authLoading])

  async function changePwd() {
    if (!curPwd || !newPwd || !confPwd) { toast.error('Please fill all fields'); return }
    if (newPwd !== confPwd) { toast.error('New passwords do not match'); return }
    if (newPwd.length < 6)  { toast.error('Password must be at least 6 characters'); return }
    setPwdLoad(true)
    try {
      await authAPI.changePassword({ current_password: curPwd, new_password: newPwd })
      toast.success('Password updated!')
      setCurPwd(''); setNewPwd(''); setConfPwd('')
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Password update failed')
    } finally {
      setPwdLoad(false)
    }
  }

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size={32} color="#5865f9" />
    </div>
  )

  return (
    <>
      <Head><title>Settings — SocialHub</title></Head>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-5">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} className="mb-8">
            <span className="section-label">Your Account</span>
            <h1 className="font-display text-4xl font-extrabold tracking-tight mt-2">Settings</h1>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-6">
            {/* Sidebar */}
            <div className="sm:w-48 flex-shrink-0">
              <nav className="flex sm:flex-col gap-1">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={clsx('px-4 py-2.5 rounded-xl text-sm font-display font-medium text-left transition-all w-full',
                      tab === t.id ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5')}>
                    {t.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">

              {/* Profile */}
              {tab === 'profile' && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="card p-6 space-y-5">
                  <h2 className="font-display font-bold text-lg">Profile Information</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-display font-bold text-2xl shadow-brand">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-display font-bold text-lg">{user?.username}</p>
                      <p className="text-sm text-[var(--muted)]">{user?.email}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/[0.07] space-y-3">
                    <div>
                      <label className="block text-[0.7rem] font-display font-semibold tracking-widest uppercase text-[var(--muted)] mb-2">Username</label>
                      <input type="text" defaultValue={user?.username} disabled className="input opacity-50 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-[0.7rem] font-display font-semibold tracking-widest uppercase text-[var(--muted)] mb-2">Email</label>
                      <input type="email" defaultValue={user?.email} disabled className="input opacity-50 cursor-not-allowed" />
                    </div>
                    <p className="text-xs text-[var(--muted)]">Profile editing coming soon.</p>
                  </div>
                </motion.div>
              )}

              {/* Security */}
              {tab === 'security' && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-5">
                  <div className="card p-6">
                    <h2 className="font-display font-bold text-lg mb-5">Change Password</h2>
                    <div className="space-y-4">
                      {[
                        { label:'Current Password', val: curPwd, set: setCurPwd },
                        { label:'New Password',     val: newPwd, set: setNewPwd },
                        { label:'Confirm New',      val: confPwd, set: setConfPwd },
                      ].map(f => (
                        <div key={f.label}>
                          <label className="block text-[0.7rem] font-display font-semibold tracking-widest uppercase text-[var(--muted)] mb-2">{f.label}</label>
                          <input type="password" value={f.val} onChange={e => f.set(e.target.value)} className="input" placeholder="••••••••" />
                        </div>
                      ))}
                    </div>
                    <button onClick={changePwd} disabled={pwdLoad}
                      className="btn-primary mt-5 disabled:opacity-40">
                      {pwdLoad ? <><Spinner size={14} />Updating…</> : 'Update Password'}
                    </button>
                  </div>

                  <div className="card p-6 border-red-500/20">
                    <h3 className="font-display font-bold text-red-400 mb-2">Danger Zone</h3>
                    <p className="text-sm text-[var(--muted)] mb-4">Once you log out, you will need your credentials to log back in.</p>
                    <button onClick={() => { logout(); router.push('/') }}
                      className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-semibold hover:bg-red-500/20 transition-colors">
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}

              {/* About */}
              {tab === 'about' && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="card p-6 space-y-5">
                  <h2 className="font-display font-bold text-lg">About SocialHub</h2>
                  <div className="space-y-3 text-sm text-[var(--muted)]">
                    {[
                      ['Version',    '1.0.0'],
                      ['Frontend',   'Next.js 14 + TailwindCSS'],
                      ['Backend',    'FastAPI + SQLite'],
                      ['Downloader', 'yt-dlp + ffmpeg'],
                      ['NLP',        'Rule-based (spaCy + NLTK)'],
                      ['License',    'MIT — Open Source'],
                    ].map(([k,v]) => (
                      <div key={k} className="flex justify-between py-2 border-b border-white/[0.05] last:border-0">
                        <span className="font-medium text-[var(--text)]">{k}</span>
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-2 px-4">
                      ⭐ GitHub
                    </a>
                    <a href="https://github.com/yt-dlp/yt-dlp" target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-2 px-4">
                      📦 yt-dlp
                    </a>
                  </div>
                </motion.div>
              )}

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
