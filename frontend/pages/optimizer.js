import { useState } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Spinner from '../components/ui/Spinner'
import { captionAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import clsx from 'clsx'

const TONES = [
  { id:'professional', label:'💼 Professional', desc:'Polished, business-ready' },
  { id:'viral',        label:'🔥 Viral',         desc:'Hook-heavy, shareable'   },
  { id:'marketing',    label:'🚀 Marketing',      desc:'Promo & sales focused'   },
  { id:'storytelling', label:'📖 Storytelling',   desc:'Narrative & emotional'   },
  { id:'casual',       label:'😎 Casual',         desc:'Relaxed & authentic'     },
]

const PLATFORMS = [
  { id:'instagram', label:'📷 Instagram' },
  { id:'twitter',   label:'🐦 Twitter'   },
  { id:'linkedin',  label:'💼 LinkedIn'  },
  { id:'tiktok',    label:'🎵 TikTok'    },
  { id:'facebook',  label:'👥 Facebook'  },
]

export default function Optimizer() {
  const { user } = useAuth()
  const [text,     setText]     = useState('')
  const [tone,     setTone]     = useState('professional')
  const [platform, setPlatform] = useState(null)
  const [result,   setResult]   = useState(null)
  const [tab,      setTab]      = useState('optimized')
  const [loading,  setLoading]  = useState(false)

  const optimize = async () => {
    if (!text.trim()) { toast.error('Please enter a caption'); return }
    setLoading(true)
    try {
      const { data } = await captionAPI.optimize({ text, tone, platform, add_hashtags:true, add_emoji:true, save:!!user })
      setResult(data.data)
      setTab('optimized')
      toast.success('Caption optimized! Score: ' + data.data.score + '/100 ✨')
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Optimization failed')
    } finally {
      setLoading(false)
    }
  }

  const copy = txt => { navigator.clipboard.writeText(txt); toast.success('Copied!') }

  const scoreColor = s => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400'
  const scoreGrad  = s => s >= 80 ? 'from-emerald-500 to-emerald-400' : s >= 60 ? 'from-amber-500 to-amber-400' : 'from-red-500 to-red-400'

  return (
    <>
      <Head>
        <title>Caption Optimizer — SocialHub</title>
        <meta name="description" content="Optimize social media captions with NLP. Add tone, hashtags & engagement hooks." />
      </Head>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-5">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} className="text-center mb-12">
            <span className="section-label">NLP-Powered · No API Key Required</span>
            <h1 className="font-display text-5xl font-extrabold tracking-tight mt-3 mb-4">
              Caption <span className="gradient-text">Optimizer</span>
            </h1>
            <p className="text-[var(--muted)] max-w-xl mx-auto">
              Transform plain text into engaging social media captions with tone selection, smart hashtags, and engagement boosters.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Left: Input ── */}
            <motion.div initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }} className="flex flex-col gap-5">

              {/* Caption textarea */}
              <div className="card p-5 space-y-3">
                <p className="section-label">Your Caption</p>
                <textarea
                  value={text} onChange={e => setText(e.target.value)}
                  placeholder={"Paste or type your caption here...\n\nExample: Just finished my morning workout. Feeling amazing!"}
                  rows={8} className="textarea text-sm"
                />
                <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>{text.length} chars · {text.trim().split(/\s+/).filter(Boolean).length} words</span>
                  {text && <button onClick={() => setText('')} className="hover:text-red-400 transition-colors">Clear ✕</button>}
                </div>
              </div>

              {/* Tone selector */}
              <div className="card p-5 space-y-3">
                <p className="section-label">Tone</p>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map(t => (
                    <button key={t.id} onClick={() => setTone(t.id)}
                      className={clsx('text-left p-3 rounded-xl border transition-all duration-200',
                        tone === t.id
                          ? 'border-brand-500/50 bg-brand-500/12'
                          : 'border-white/8 hover:border-white/15 hover:bg-white/5'
                      )}>
                      <div className="text-sm font-display font-semibold text-[var(--text)]">{t.label}</div>
                      <div className="text-xs text-[var(--muted)] mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform */}
              <div className="card p-5 space-y-3">
                <p className="section-label">Platform (optional — affects hashtag count)</p>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p.id}
                      onClick={() => setPlatform(platform === p.id ? null : p.id)}
                      className={clsx('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                        platform === p.id
                          ? 'border-brand-500/50 bg-brand-500/15 text-brand-300'
                          : 'border-white/10 text-[var(--muted)] hover:border-white/20 hover:text-[var(--text)]'
                      )}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={optimize} disabled={loading || !text.trim()}
                className="btn-primary w-full py-4 text-base shadow-brand disabled:opacity-40">
                {loading ? <><Spinner size={16} /> Optimizing…</> : '✨ Optimize Caption'}
              </button>
            </motion.div>

            {/* ── Right: Result ── */}
            <motion.div initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.15 }}>
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div key="result" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-4">
                    {/* Score */}
                    <div className="card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="section-label">Engagement Score</p>
                        <span className={clsx('font-display font-extrabold text-2xl', scoreColor(result.score))}>{result.score}/100</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width:0 }} animate={{ width:`${result.score}%` }} transition={{ duration:0.8, ease:'easeOut' }}
                          className={clsx('h-full rounded-full bg-gradient-to-r', scoreGrad(result.score))}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="badge-brand">{result.tone}</span>
                        <span className="badge-cyan">{result.word_count} words · {result.char_count} chars</span>
                      </div>
                    </div>

                    {/* Result tabs */}
                    <div className="card overflow-hidden">
                      <div className="flex border-b border-white/[0.07]">
                        {['optimized','original'].map(t => (
                          <button key={t} onClick={() => setTab(t)}
                            className={clsx('flex-1 py-3 text-sm font-display font-semibold capitalize transition-all',
                              tab === t ? 'text-[var(--text)] bg-white/5 border-b-2 border-brand-500' : 'text-[var(--muted)] hover:text-[var(--text)]')}>
                            {t === 'optimized' ? '✨ Optimized' : '📄 Original'}
                          </button>
                        ))}
                      </div>
                      <div className="p-5">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--text)] max-h-56 overflow-y-auto">
                          {tab === 'optimized' ? result.optimized : result.original}
                        </p>
                        <button onClick={() => copy(tab === 'optimized' ? result.optimized : result.original)}
                          className="btn-secondary mt-4 w-full py-2.5 text-sm">
                          📋 Copy {tab === 'optimized' ? 'Optimized' : 'Original'}
                        </button>
                      </div>
                    </div>

                    {/* Hashtags */}
                    {result.hashtags?.length > 0 && (
                      <div className="card p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="section-label">Suggested Hashtags ({result.hashtags.length})</p>
                          <button onClick={() => copy(result.hashtags.join(' '))} className="btn-ghost text-xs py-1">Copy all →</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.hashtags.map((h, i) => (
                            <button key={i} onClick={() => copy(h)} className="hashtag-chip">{h}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {result.suggestions?.length > 0 && (
                      <div className="card p-5 space-y-2">
                        <p className="section-label">💡 Suggestions</p>
                        {result.suggestions.map((s, i) => (
                          <p key={i} className="text-xs text-[var(--muted)] leading-relaxed">{s}</p>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="empty"
                    className="card h-full min-h-[460px] flex items-center justify-center">
                    <div className="text-center text-[var(--muted)] p-8">
                      <div className="text-5xl mb-4 opacity-30">✍️</div>
                      <p className="font-display font-semibold text-[var(--text)] mb-2">Your result will appear here</p>
                      <p className="text-sm">Enter a caption, choose a tone, and hit Optimize.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
