import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { detectPlatform, PLATFORMS } from '../../utils/api'
import Spinner from '../ui/Spinner'
import clsx from 'clsx'

const PLATFORM_BG = {
  youtube:   'border-red-500/30   bg-red-500/5',
  instagram: 'border-pink-500/30  bg-pink-500/5',
  tiktok:    'border-slate-400/30 bg-slate-500/5',
  twitter:   'border-sky-500/30   bg-sky-500/5',
  facebook:  'border-blue-500/30  bg-blue-500/5',
  linkedin:  'border-blue-600/30  bg-blue-600/5',
  reddit:    'border-orange-500/30 bg-orange-500/5',
  quora:     'border-red-600/30   bg-red-600/5',
}

export default function URLInput({ onSubmit, loading }) {
  const [url,      setUrl]      = useState('')
  const [platform, setPlatform] = useState(null)
  const [dragging, setDragging] = useState(false)

  const update = v => { setUrl(v); setPlatform(detectPlatform(v)) }

  const handleDrop = useCallback(e => {
    e.preventDefault(); setDragging(false)
    const t = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list')
    if (t) update(t)
  }, [])

  const p = platform ? PLATFORMS[platform] : null

  return (
    <div className="space-y-3">
      {/* Drop zone wrapper */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={clsx(
          'rounded-2xl border-2 border-dashed p-1 transition-all duration-300',
          dragging ? 'border-brand-400 bg-brand-500/8' :
          platform ? `${PLATFORM_BG[platform]} border-solid` :
          'border-white/10'
        )}
      >
        <div className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.03] rounded-xl">
          {/* Platform icon */}
          <AnimatePresence mode="wait">
            <motion.span
              key={platform || 'default'}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-shrink-0 text-xl w-8 text-center"
            >
              {p ? p.icon : '🔗'}
            </motion.span>
          </AnimatePresence>

          <input
            type="url"
            value={url}
            onChange={e => update(e.target.value)}
            onPaste={e => { const v = e.clipboardData.getData('text'); if (v) { e.preventDefault(); update(v) } }}
            onKeyDown={e => e.key === 'Enter' && url.trim() && !loading && onSubmit(url.trim())}
            placeholder="Paste any YouTube, Instagram, TikTok, Twitter URL…"
            className="flex-1 bg-transparent outline-none text-[var(--text)] placeholder-[var(--muted)] text-sm"
          />
          {url && (
            <button onClick={() => update('')} className="flex-shrink-0 text-[var(--muted)] hover:text-[var(--text)] transition-colors text-xs p-1">✕</button>
          )}
        </div>

        {dragging && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-brand-500/10">
            <p className="font-display font-semibold text-brand-300">Drop URL here</p>
          </div>
        )}
      </div>

      {/* Detected platform badge */}
      <AnimatePresence>
        {p && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-xs text-[var(--muted)] pl-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-sm" />
            Detected: <span className="text-[var(--text)] font-medium">{p.name}</span>
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        onClick={() => url.trim() && onSubmit(url.trim())}
        disabled={!url.trim() || loading}
        className="btn-primary w-full py-3.5 text-base shadow-brand disabled:opacity-40"
      >
        {loading ? <><Spinner size={16} /> Analyzing…</> : '⚡ Analyze URL'}
      </button>

      <p className="text-center text-xs text-[var(--muted)]">
        Drag & drop a link, or paste it. Supports 8 platforms. Only public content.
      </p>
    </div>
  )
}
