import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { dashboardAPI, PLATFORMS, timeAgo, formatBytes, formatDuration } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import clsx from 'clsx'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const pop = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function Dashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [stats,   setStats]   = useState(null)
  const [recent,  setRecent]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login'); return }
    load()
  }, [user, authLoading])

  async function load() {
    setLoading(true)
    try {
      const [s, r] = await Promise.all([dashboardAPI.stats(), dashboardAPI.recent()])
      setStats(s.data)
      setRecent(r.data)
    } catch {
      toast.error('Could not load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={32} color="#5865f9" />
      </div>
    )
  }

  const totalDl       = stats?.total_downloads || 0
  const totalCap      = stats?.total_captions  || 0
  const platformsUsed = stats?.platforms_used  || 0
  const byPlatform    = stats?.downloads_by_platform || {}
  const maxPlatCount  = Math.max(...Object.values(byPlatform), 1)

  return (
    <>
      <Head>
        <title>Dashboard — SocialHub</title>
      </Head>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-5">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <span className="section-label">Your Overview</span>
            <h1 className="font-display text-4xl font-extrabold tracking-tight mt-2 mb-2">
              Welcome back, <span className="gradient-text">{user?.username}</span> 👋
            </h1>
            <p className="text-[var(--muted)] mb-6">Here's everything you've been creating.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/downloader" className="btn-primary text-sm">⬇️ New Download</Link>
              <Link href="/optimizer"  className="btn-secondary text-sm">✍️ Optimize Caption</Link>
              <Link href="/library"    className="btn-secondary text-sm">📚 View Library</Link>
            </div>
          </motion.div>

          {/* Stat cards */}
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: '⬇️', value: totalDl,       label: 'Downloads',       color: 'text-brand-400'   },
              { icon: '✍️', value: totalCap,       label: 'Captions',        color: 'text-purple-400'  },
              { icon: '🌐', value: platformsUsed,  label: 'Platforms Used',  color: 'text-cyan-400'    },
              { icon: '🏷️', value: Object.values(byPlatform).reduce((a,b)=>a+b,0), label: 'Total Activity', color: 'text-emerald-400' },
            ].map(s => (
              <motion.div key={s.label} variants={pop} className="card p-5">
                <div className="text-2xl mb-3">{s.icon}</div>
                <div className={clsx('font-display font-extrabold text-3xl leading-none mb-1', s.color)}>{s.value}</div>
                <div className="text-xs text-[var(--muted)]">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Two column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Recent Downloads */}
            <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
              className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-[var(--text)]">📥 Recent Downloads</h2>
                <Link href="/library" className="btn-ghost text-xs py-1">View all →</Link>
              </div>
              {recent?.downloads?.length ? (
                <div className="space-y-1">
                  {recent.downloads.map(d => {
                    const p = PLATFORMS[d.platform] || { icon: '🔗', name: d.platform }
                    return (
                      <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                          {d.thumbnail
                            ? <img src={d.thumbnail} alt="" className="w-full h-full object-cover" />
                            : p.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-[var(--text)]">{d.title || 'Untitled'}</p>
                          <p className="text-xs text-[var(--muted)]">{p.name} · {timeAgo(d.created_at)}</p>
                        </div>
                        <span className={clsx('badge text-[0.65rem]',
                          d.status === 'completed' ? 'badge-green' : d.status === 'failed' ? 'badge-red' : 'badge-amber')}>
                          {d.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState icon="📥" title="No downloads yet" desc="Download a video to see it here." cta="Go to Downloader" ctaHref="/downloader" />
              )}
            </motion.div>

            {/* Downloads by Platform */}
            <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
              className="card p-6">
              <h2 className="font-display font-bold text-[var(--text)] mb-5">📊 Downloads by Platform</h2>
              {Object.keys(byPlatform).length ? (
                <div className="space-y-4">
                  {Object.entries(byPlatform).sort((a,b) => b[1]-a[1]).map(([plat, cnt]) => {
                    const p = PLATFORMS[plat] || { icon:'🔗', name: plat }
                    return (
                      <div key={plat}>
                        <div className="flex items-center justify-between mb-1.5 text-sm">
                          <span className="flex items-center gap-2">{p.icon} <span className="font-medium">{p.name}</span></span>
                          <span className="text-[var(--muted)]">{cnt}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(cnt / maxPlatCount) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-400"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState icon="📊" title="No data yet" desc="Your platform breakdown will appear here after your first download." />
              )}
            </motion.div>
          </div>

          {/* Recent Captions */}
          <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
            className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-[var(--text)]">✍️ Recent Captions</h2>
              <Link href="/library?tab=captions" className="btn-ghost text-xs py-1">View all →</Link>
            </div>
            {recent?.captions?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {recent.captions.map(c => (
                  <div key={c.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="badge-brand text-[0.65rem]">{c.tone}</span>
                      {c.score && <span className={clsx('text-xs font-bold font-display', c.score >= 80 ? 'text-emerald-400' : c.score >= 60 ? 'text-amber-400' : 'text-red-400')}>{c.score}/100</span>}
                      <span className="text-[0.65rem] text-[var(--muted)] ml-auto">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-xs text-[var(--muted)] line-clamp-3 leading-relaxed">{c.optimized || c.original}</p>
                    {c.hashtags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.hashtags.slice(0, 3).map((h, i) => (
                          <span key={i} className="text-[0.65rem] text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">{h}</span>
                        ))}
                        {c.hashtags.length > 3 && <span className="text-[0.65rem] text-[var(--muted)]">+{c.hashtags.length - 3}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="✍️" title="No captions yet" desc="Optimize a caption to see it here." cta="Go to Optimizer" ctaHref="/optimizer" />
            )}
          </motion.div>

        </div>
      </main>
      <Footer />
    </>
  )
}
