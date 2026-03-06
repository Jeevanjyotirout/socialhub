import { useEffect, useState, useMemo } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { downloadAPI, captionAPI, PLATFORMS, timeAgo, formatBytes, formatDuration } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import clsx from 'clsx'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const TABS = [
  { id: 'videos',   label: '📹 Videos'   },
  { id: 'captions', label: '✍️ Captions'  },
  { id: 'hashtags', label: '🏷️ Hashtags'  },
]

export default function Library() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [tab,       setTab]       = useState('videos')
  const [search,    setSearch]    = useState('')
  const [videos,    setVideos]    = useState([])
  const [captions,  setCaptions]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [deleting,  setDeleting]  = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login'); return }
    // Read tab from query
    if (router.query.tab) setTab(router.query.tab)
    load()
  }, [user, authLoading])

  async function load() {
    setLoading(true)
    try {
      const [vRes, cRes] = await Promise.all([downloadAPI.list(), captionAPI.list()])
      setVideos(vRes.data)
      setCaptions(cRes.data)
    } catch {
      toast.error('Could not load library')
    } finally {
      setLoading(false)
    }
  }

  const allHashtags = useMemo(() => {
    const set = new Map()
    captions.forEach(c => (c.hashtags || []).forEach(h => set.set(h, (set.get(h) || 0) + 1)))
    return [...set.entries()].sort((a, b) => b[1] - a[1])
  }, [captions])

  const filteredVideos = useMemo(() => {
    if (!search) return videos
    const q = search.toLowerCase()
    return videos.filter(v => (v.title || '').toLowerCase().includes(q) || v.platform.includes(q))
  }, [videos, search])

  const filteredCaptions = useMemo(() => {
    if (!search) return captions
    const q = search.toLowerCase()
    return captions.filter(c =>
      (c.original || '').toLowerCase().includes(q) ||
      (c.optimized || '').toLowerCase().includes(q) ||
      (c.tone || '').includes(q)
    )
  }, [captions, search])

  const filteredHashtags = useMemo(() => {
    if (!search) return allHashtags
    const q = search.toLowerCase()
    return allHashtags.filter(([h]) => h.toLowerCase().includes(q))
  }, [allHashtags, search])

  async function deleteVideo(id) {
    setDeleting(id)
    try {
      await downloadAPI.remove(id)
      setVideos(v => v.filter(x => x.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  async function deleteCaption(id) {
    setDeleting('c' + id)
    try {
      await captionAPI.remove(id)
      setCaptions(c => c.filter(x => x.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const copy = txt => { navigator.clipboard.writeText(txt); toast.success('Copied!') }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={32} color="#5865f9" />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Content Library — SocialHub</title>
      </Head>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-5">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} className="mb-8">
            <span className="section-label">Your Content</span>
            <h1 className="font-display text-4xl font-extrabold tracking-tight mt-2 mb-6">
              Content <span className="gradient-text">Library</span>
            </h1>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm">🔍</span>
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search videos, captions, hashtags…"
                  className="input pl-9 py-2.5 text-sm"
                />
              </div>
              {/* Tabs */}
              <div className="flex bg-[var(--surface)] border border-white/[0.07] rounded-xl p-1 gap-1">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={clsx('px-3.5 py-2 rounded-lg text-xs font-display font-semibold transition-all',
                      tab === t.id ? 'bg-brand-500 text-white shadow-brand-sm' : 'text-[var(--muted)] hover:text-[var(--text)]')}>
                    {t.label}
                  </button>
                ))}
              </div>
              <Link href="/downloader" className="btn-primary text-sm">+ Add Video</Link>
            </div>
          </motion.div>

          {/* ── Videos Tab ── */}
          <AnimatePresence mode="wait">
            {tab === 'videos' && (
              <motion.div key="videos" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                {filteredVideos.length === 0 ? (
                  <EmptyState icon="📹" title="No videos yet" desc="Download a video to start building your library." cta="Go to Downloader" ctaHref="/downloader" />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredVideos.map((v, i) => {
                      const p = PLATFORMS[v.platform] || { icon: '🔗', name: v.platform }
                      return (
                        <motion.div key={v.id}
                          initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay: i * 0.04 }}
                          className="card overflow-hidden hover:border-white/[0.13] hover:-translate-y-0.5 transition-all group">
                          {/* Thumb */}
                          <div className="aspect-video bg-white/5 relative overflow-hidden">
                            {v.thumbnail
                              ? <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              : <div className="w-full h-full flex items-center justify-center text-3xl opacity-40">{p.icon}</div>}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-2 left-2">
                              <span className={clsx('badge text-[0.6rem]',
                                v.status === 'completed' ? 'badge-green' : v.status === 'failed' ? 'badge-red' : 'badge-amber')}>
                                {v.status}
                              </span>
                            </div>
                            {v.duration > 0 && (
                              <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[0.6rem] font-mono px-1.5 py-0.5 rounded">
                                {formatDuration(v.duration)}
                              </span>
                            )}
                            {/* Hover actions */}
                            <div className="absolute inset-x-0 bottom-0 p-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {v.file_url && (
                                <a href={`${API_URL}${v.file_url}`} download
                                  className="flex-1 text-center text-[0.65rem] font-semibold bg-brand-500 text-white px-2 py-1.5 rounded-lg">
                                  ⬇️ Save
                                </a>
                              )}
                              <button onClick={() => deleteVideo(v.id)} disabled={deleting === v.id}
                                className="text-[0.65rem] bg-red-500/20 text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-500/30 transition-colors">
                                {deleting === v.id ? '…' : '🗑️'}
                              </button>
                            </div>
                          </div>
                          {/* Meta */}
                          <div className="p-3">
                            <p className="text-xs font-medium line-clamp-2 leading-snug text-[var(--text)] mb-1">{v.title || 'Untitled'}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[0.65rem] text-[var(--muted)]">{p.icon} {p.name}</span>
                              {v.file_size && <span className="text-[0.65rem] text-[var(--muted)]">{formatBytes(v.file_size)}</span>}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Captions Tab ── */}
            {tab === 'captions' && (
              <motion.div key="captions" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                {filteredCaptions.length === 0 ? (
                  <EmptyState icon="✍️" title="No captions yet" desc="Optimize a caption to save it here." cta="Go to Optimizer" ctaHref="/optimizer" />
                ) : (
                  <div className="space-y-3">
                    {filteredCaptions.map((c, i) => (
                      <motion.div key={c.id}
                        initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.04 }}
                        className="card p-5 hover:border-white/[0.13] transition-colors group">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="badge-brand text-[0.65rem]">{c.tone}</span>
                              {c.platform && <span className="badge-cyan text-[0.65rem]">{c.platform}</span>}
                              {c.score && (
                                <span className={clsx('text-xs font-bold font-display',
                                  c.score >= 80 ? 'text-emerald-400' : c.score >= 60 ? 'text-amber-400' : 'text-red-400')}>
                                  {c.score}/100
                                </span>
                              )}
                              <span className="text-[0.65rem] text-[var(--muted)] ml-auto">{timeAgo(c.created_at)}</span>
                            </div>
                            {/* Text */}
                            <p className="text-sm text-[var(--text)] leading-relaxed line-clamp-3 mb-3">
                              {c.optimized || c.original}
                            </p>
                            {/* Hashtags */}
                            {c.hashtags?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {c.hashtags.slice(0, 8).map((h, j) => (
                                  <button key={j} onClick={() => copy(h)} className="hashtag-chip">{h}</button>
                                ))}
                                {c.hashtags.length > 8 && (
                                  <span className="text-xs text-[var(--muted)] self-center">+{c.hashtags.length - 8} more</span>
                                )}
                              </div>
                            )}
                          </div>
                          {/* Actions */}
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <button onClick={() => copy(c.optimized || c.original || '')}
                              className="btn-ghost text-xs px-3 py-1.5 border border-white/10">📋 Copy</button>
                            {c.hashtags?.length > 0 && (
                              <button onClick={() => copy((c.hashtags || []).join(' '))}
                                className="btn-ghost text-xs px-3 py-1.5 border border-white/10">🏷️ Tags</button>
                            )}
                            <button onClick={() => deleteCaption(c.id)} disabled={deleting === 'c' + c.id}
                              className="btn-ghost text-xs px-3 py-1.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10">
                              {deleting === 'c' + c.id ? '…' : '🗑️ Del'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Hashtags Tab ── */}
            {tab === 'hashtags' && (
              <motion.div key="hashtags" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                {filteredHashtags.length === 0 ? (
                  <EmptyState icon="🏷️" title="No hashtags yet" desc="Hashtags from optimized captions will appear here." cta="Optimize a Caption" ctaHref="/optimizer" />
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-sm text-[var(--muted)]">{filteredHashtags.length} unique hashtags collected</p>
                      <button onClick={() => copy(filteredHashtags.map(([h]) => h).join(' '))}
                        className="btn-secondary text-sm">Copy All →</button>
                    </div>
                    <div className="card p-6">
                      <div className="flex flex-wrap gap-2">
                        {filteredHashtags.map(([h, count], i) => (
                          <motion.button key={h}
                            initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} transition={{ delay: i * 0.015 }}
                            onClick={() => copy(h)}
                            className="hashtag-chip flex items-center gap-1.5 group"
                            title={`Used ${count} time${count !== 1 ? 's' : ''} — click to copy`}>
                            {h}
                            {count > 1 && (
                              <span className="w-4 h-4 rounded-full bg-brand-500/30 text-brand-200 text-[0.6rem] font-bold flex items-center justify-center">
                                {count}
                              </span>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  )
}
