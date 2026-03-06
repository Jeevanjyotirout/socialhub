import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import URLInput from '../components/features/URLInput'
import VideoInfoCard from '../components/features/VideoInfoCard'
import DownloadStatus from '../components/features/DownloadStatus'
import { useDownload } from '../hooks/useDownload'

const SUPPORTED = [
  { icon:'▶️', name:'YouTube'  }, { icon:'📷', name:'Instagram' },
  { icon:'🎵', name:'TikTok'   }, { icon:'🐦', name:'Twitter/X' },
  { icon:'👥', name:'Facebook' }, { icon:'💼', name:'LinkedIn'  },
  { icon:'🤖', name:'Reddit'   }, { icon:'❓', name:'Quora'     },
]

export default function Downloader() {
  const { info, status, statusData, loading, analyze, startDownload, reset } = useDownload()

  return (
    <>
      <Head>
        <title>Video Downloader — SocialHub</title>
        <meta name="description" content="Download videos from YouTube, Instagram, TikTok, Twitter and more." />
      </Head>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-5">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} className="text-center mb-12">
            <span className="section-label">Free · No Limits · 8 Platforms</span>
            <h1 className="font-display text-5xl font-extrabold tracking-tight mt-3 mb-4">
              Video <span className="gradient-text">Downloader</span>
            </h1>
            <p className="text-[var(--muted)] max-w-md mx-auto">
              Paste a URL from any supported platform. Get the video, caption, hashtags & thumbnail instantly.
            </p>
          </motion.div>

          {/* Input card */}
          <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="card p-6 mb-5">
            <URLInput onSubmit={url => { reset(); analyze(url) }} loading={loading} />
          </motion.div>

          {/* Download progress */}
          <div className="mb-5">
            <DownloadStatus status={status} data={statusData} />
          </div>

          {/* Video result */}
          <AnimatePresence mode="wait">
            {info && (
              <motion.div key="info" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                <VideoInfoCard info={info} onDownload={() => startDownload(info.url)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Supported platforms */}
          {!info && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.25 }} className="mt-12">
              <p className="section-label text-center mb-5">Supported Platforms</p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {SUPPORTED.map(p => (
                  <div key={p.name} className="card-hover flex flex-col items-center gap-1.5 p-3 rounded-xl">
                    <span className="text-2xl">{p.icon}</span>
                    <span className="text-[0.68rem] text-[var(--muted)] font-medium text-center leading-tight">{p.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-[var(--muted)] mt-4">
                Only public content can be downloaded. Please respect copyright laws.
              </p>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
