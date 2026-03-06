import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import clsx from 'clsx'

const LINKS = [
  { href: '/downloader', label: 'Downloader' },
  { href: '/optimizer',  label: 'Optimizer'  },
  { href: '/library',    label: 'Library'    },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [open,     setOpen]     = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setOpen(false), [router.pathname])

  return (
    <motion.header
      initial={{ y: -72 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={clsx(
        'fixed top-0 inset-x-0 z-50 h-[62px] flex items-center transition-all duration-300',
        scrolled && 'bg-[#07080f]/85 backdrop-blur-xl border-b border-white/[0.06]'
      )}
    >
      <div className="max-w-7xl mx-auto px-5 w-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-brand-sm group-hover:shadow-brand transition-shadow">
            <span className="text-white text-sm font-bold font-display">S</span>
          </div>
          <span className="font-display font-bold text-[var(--text)] text-lg tracking-tight">
            Social<span className="text-brand-400">Hub</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className={clsx('btn-ghost text-sm', router.pathname === l.href && 'text-[var(--text)] bg-white/5')}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard" className={clsx('btn-ghost text-sm', router.pathname === '/dashboard' && 'text-[var(--text)] bg-white/5')}>
                <span className="w-5 h-5 rounded-full bg-brand-500/30 text-brand-300 text-xs font-bold flex items-center justify-center">
                  {user.username?.[0]?.toUpperCase()}
                </span>
                {user.username}
              </Link>
              <button onClick={logout} className="btn-ghost text-sm text-red-400/80 hover:text-red-400">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login"  className="btn-ghost text-sm">Log in</Link>
              <Link href="/signup" className="btn-primary text-sm">Get started →</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(v => !v)}
          className="md:hidden w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
          <div className="w-4 space-y-1">
            <span className={clsx('block h-0.5 bg-current transition-all', open && 'rotate-45 translate-y-[6px]')} />
            <span className={clsx('block h-0.5 bg-current transition-opacity', open && 'opacity-0')} />
            <span className={clsx('block h-0.5 bg-current transition-all', open && '-rotate-45 -translate-y-[6px]')} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full inset-x-0 bg-[#0e0f1d]/95 backdrop-blur-xl border-b border-white/[0.07]"
          >
            <div className="px-5 py-4 space-y-1">
              {LINKS.map(l => (
                <Link key={l.href} href={l.href}
                  className="block px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-medium">
                  {l.label}
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-white/[0.07] flex flex-col gap-2">
                {user ? (
                  <>
                    <Link href="/dashboard" className="btn-secondary text-sm justify-center">Dashboard</Link>
                    <button onClick={logout} className="btn-ghost text-sm text-red-400 justify-center">Sign out</button>
                  </>
                ) : (
                  <>
                    <Link href="/login"  className="btn-secondary text-sm justify-center">Log in</Link>
                    <Link href="/signup" className="btn-primary  text-sm justify-center">Get started →</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
