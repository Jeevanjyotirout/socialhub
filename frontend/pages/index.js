import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const FEATURES = [
  { icon: '⬇️', title: 'Video Downloader',   desc: 'Download from YouTube, Instagram, TikTok, Twitter, Facebook & more. Powered by yt-dlp.',       href: '/downloader', grad: 'from-brand-500/10'  },
  { icon: '✍️', title: 'Caption Optimizer',  desc: 'Rule-based NLP engine enhances captions with tone, engagement hooks & smart hashtags.',         href: '/optimizer',  grad: 'from-purple-500/10' },
  { icon: '📚', title: 'Content Library',    desc: 'Organize all your videos, captions, hashtags and draft posts in one searchable library.',        href: '/library',    grad: 'from-cyan-500/10'   },
  { icon: '📊', title: 'Analytics Dashboard',desc: 'Track downloads, caption history and performance across platforms with visual stats.',           href: '/dashboard',  grad: 'from-emerald-500/10'},
  { icon: '🔗', title: 'Smart Link Detector',desc: 'Paste any link — platform is auto-detected instantly. No configuration needed.',                href: '/downloader', grad: 'from-amber-500/10'  },
  { icon: '🚀', title: 'One-Click Share',    desc: 'Share to Facebook, Twitter, LinkedIn, Reddit & WhatsApp directly from the app.',                href: '/downloader', grad: 'from-pink-500/10'   },
]

const PLATFORMS = [
  '▶️ YouTube','📷 Instagram','🎵 TikTok','🐦 Twitter/X',
  '👥 Facebook','💼 LinkedIn','🤖 Reddit','❓ Quora',
]

const TONES = ['💼 Professional','🔥 Viral','🚀 Marketing','📖 Storytelling','😎 Casual']

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const pop     = { hidden: { opacity:0, y:24 }, show: { opacity:1, y:0, transition:{ duration:0.5, ease:[.25,.46,.45,.94] } } }

export default function Home() {
  return (
    <>
      <Head>
        <title>SocialHub — Free Social Media Optimizer & Downloader</title>
        <meta name="description" content="Download videos, optimize captions and manage content from Instagram, YouTube, TikTok & more. 100% free, open source." />
      </Head>
      <Navbar />
      <main className="bg-grid relative overflow-hidden">
        {/* ── Hero ── */}
        <section className="relative min-h-screen flex items-center justify-center text-center px-5 py-32">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.5 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/8 text-brand-300 text-xs font-display font-semibold mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-sm" />
                100% Free · Open Source · No API Keys
              </span>
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.07] mb-6">
                Your Social Media<br/>
                <span className="gradient-text">Command Center</span>
              </h1>
              <p className="text-[var(--muted)] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
                Download videos, extract captions & hashtags, optimize your content with NLP, and share across 8 platforms — completely free.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/downloader" className="btn-primary text-base px-8 py-4 shadow-brand">Start Downloading ⬇️</Link>
                <Link href="/optimizer"  className="btn-secondary text-base px-8 py-4">Optimize Captions ✍️</Link>
              </div>
            </motion.div>

            {/* Platform pills */}
            <motion.div
              initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3, duration:0.5 }}
              className="flex flex-wrap justify-center gap-2.5 mt-14"
            >
              {PLATFORMS.map(p => (
                <span key={p} className="px-4 py-2 rounded-full bg-[var(--surface)] border border-white/[0.07] text-sm font-medium hover:border-white/[0.13] hover:-translate-y-0.5 transition-all">
                  {p}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="py-10">
          <div className="max-w-4xl mx-auto px-5">
            <div className="grid grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
              {[['8+','Supported Platforms'],['5','Caption Tones'],['100%','Free Forever']].map(([n,l]) => (
                <div key={l} className="bg-[var(--surface)] py-8 text-center">
                  <div className="font-display font-extrabold text-3xl text-brand-400 mb-1">{n}</div>
                  <div className="text-sm text-[var(--muted)]">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="py-24 px-5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="section-label">Everything You Need</span>
              <h2 className="font-display text-4xl font-extrabold tracking-tight mt-3 mb-4">
                One platform, <span className="gradient-text">all your tools</span>
              </h2>
              <p className="text-[var(--muted)] max-w-md mx-auto">No subscriptions. No API keys. No limits. Just tools that work.</p>
            </div>

            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true, margin:'-80px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map(f => (
                <motion.div key={f.title} variants={pop}>
                  <Link href={f.href}
                    className={`card-hover group block p-6 bg-gradient-to-br ${f.grad} to-transparent`}>
                    <div className="text-3xl mb-4">{f.icon}</div>
                    <h3 className="font-display font-bold text-[var(--text)] mb-2 group-hover:text-brand-300 transition-colors">{f.title}</h3>
                    <p className="text-[var(--muted)] text-sm leading-relaxed">{f.desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-xs text-brand-400 mt-4 group-hover:gap-2.5 transition-all">Learn more →</span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Caption tones ── */}
        <section className="py-16 px-5">
          <div className="max-w-3xl mx-auto text-center">
            <span className="section-label">Caption Optimizer</span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight mt-3 mb-8">
              5 tones to match <span className="gradient-text">any audience</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {TONES.map((t, i) => (
                <motion.span key={t} initial={{ opacity:0, scale:0.8 }} whileInView={{ opacity:1, scale:1 }}
                  transition={{ delay: i * 0.08 }} viewport={{ once:true }}
                  className="px-5 py-2.5 rounded-full glass font-display font-semibold text-sm hover:bg-brand-500/15 hover:border-brand-500/30 transition-all cursor-default">
                  {t}
                </motion.span>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 px-5">
          <div className="max-w-3xl mx-auto">
            <div className="card p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/8 via-purple-500/5 to-cyan-500/8 rounded-2xl pointer-events-none" />
              <div className="relative">
                <h2 className="font-display text-4xl font-extrabold tracking-tight mb-4">Ready to get started?</h2>
                <p className="text-[var(--muted)] mb-8">Create a free account to save downloads, captions, and history.</p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link href="/signup"     className="btn-primary px-8 py-4 text-base shadow-brand">Create Free Account →</Link>
                  <Link href="/downloader" className="btn-secondary px-8 py-4 text-base">Try Without Account</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
