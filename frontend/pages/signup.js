import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'

const PERKS = [
  '100% free — no subscriptions, ever',
  'Save downloads and captions forever',
  'No API keys or credit card required',
  'Open source — verify the code yourself',
]

export default function Signup() {
  const router = useRouter()
  const { user, register } = useAuth()

  const [email,    setEmail]    = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)

  useEffect(() => { if (user) router.replace('/dashboard') }, [user])

  async function handle() {
    if (!email || !username || !password) { toast.error('Please fill all fields'); return }
    if (username.length < 3) { toast.error('Username must be at least 3 characters'); return }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(email, username, password)
      toast.success('Account created! Welcome 🎉')
      router.push('/dashboard')
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Create Account — SocialHub</title></Head>
      <div className="min-h-screen flex items-center justify-center px-5 py-20 bg-grid">
        <motion.div initial={{ opacity:0, y:20, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
          transition={{ duration:0.45 }} className="w-full max-w-md">

          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-brand group-hover:shadow-brand transition-shadow">
              <span className="text-white font-bold font-display">S</span>
            </div>
            <span className="font-display font-bold text-xl text-[var(--text)]">
              Social<span className="text-brand-400">Hub</span>
            </span>
          </Link>

          <div className="card p-8">
            <h1 className="font-display font-extrabold text-2xl text-[var(--text)] mb-1">Create free account</h1>
            <p className="text-[var(--muted)] text-sm mb-7">No credit card. No limits. Forever free.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-[0.7rem] font-display font-semibold tracking-widest uppercase text-[var(--muted)] mb-2">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className="input" />
              </div>
              <div>
                <label className="block text-[0.7rem] font-display font-semibold tracking-widest uppercase text-[var(--muted)] mb-2">Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="coolcreator" minLength={3} maxLength={30} className="input" />
                <p className="text-[0.7rem] text-[var(--muted)] mt-1">3–30 characters, no spaces</p>
              </div>
              <div>
                <label className="block text-[0.7rem] font-display font-semibold tracking-widest uppercase text-[var(--muted)] mb-2">Password</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters" className="input pr-16"
                    onKeyDown={e => e.key === 'Enter' && handle()} />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold font-display text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                    {showPwd ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>

            <button onClick={handle} disabled={loading}
              className="btn-primary w-full mt-6 py-3.5 text-base shadow-brand disabled:opacity-40">
              {loading ? <><Spinner size={16} />Creating account…</> : 'Create Account →'}
            </button>

            {/* Perks */}
            <div className="mt-6 pt-6 border-t border-white/[0.07] space-y-2.5">
              {PERKS.map(p => (
                <div key={p} className="flex items-center gap-2.5 text-xs text-[var(--muted)]">
                  <span className="text-emerald-400 font-bold text-sm">✓</span>
                  {p}
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-[var(--muted)] mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-400 font-semibold hover:underline">Log in →</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}
