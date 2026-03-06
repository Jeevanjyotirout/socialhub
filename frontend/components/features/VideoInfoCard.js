import { motion } from 'framer-motion'
import { PLATFORMS, shareUrl, formatDuration } from '../../utils/api'
import toast from 'react-hot-toast'

const SHARE_PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: '👥' },
  { id: 'twitter',  label: 'Twitter',  icon: '🐦' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'reddit',   label: 'Reddit',   icon: '🤖' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
]

export default function VideoInfoCard({ info, onDownload }) {
  const p = PLATFORMS[info.platform] || { name: info.platform, icon: '🔗' }

  const copy = text => {
    navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      {/* Thumbnail */}
      {info.thumbnail && (
        <div className="relative aspect-video bg-black overflow-hidden">
          <img src={info.thumbnail} alt={info.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <span className="absolute top-3 left-3 badge-brand">{p.icon} {p.name}</span>
          {info.duration > 0 && (
            <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white text-xs font-mono px-2 py-0.5 rounded">
              {formatDuration(info.duration)}
            </span>
          )}
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Title */}
        <div>
          <h3 className="font-display font-semibold text-[var(--text)] text-sm leading-snug line-clamp-2">{info.title || 'Untitled'}</h3>
          {info.uploader && <p className="text-xs text-[var(--muted)] mt-1">by {info.uploader}</p>}
        </div>

        {/* Meta */}
        {(info.view_count > 0 || info.duration > 0) && (
          <div className="flex flex-wrap gap-4 text-xs text-[var(--muted)]">
            {info.view_count > 0 && <span>👁 {info.view_count.toLocaleString()} views</span>}
            {info.duration > 0   && <span>⏱ {formatDuration(info.duration)}</span>}
            {info.formats?.length > 0 && <span>🎬 {info.formats.length} formats</span>}
          </div>
        )}

        {/* Hashtags */}
        {info.hashtags?.length > 0 && (
          <div className="space-y-2">
            <p className="section-label">Hashtags</p>
            <div className="flex flex-wrap gap-1.5">
              {info.hashtags.slice(0, 15).map((h, i) => (
                <button key={i} onClick={() => copy(h)} className="hashtag-chip">{h}</button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onDownload} className="btn-primary col-span-2 py-2.5 shadow-brand">
            ⬇️ Download Video
          </button>
          <button onClick={() => copy(info.description || info.title || '')} className="btn-secondary py-2.5 text-sm">
            📋 Copy Caption
          </button>
          <button onClick={() => copy((info.hashtags || []).join(' '))} className="btn-secondary py-2.5 text-sm">
            🏷️ Copy Hashtags
          </button>
        </div>

        {/* Share */}
        <div className="space-y-2">
          <p className="section-label">Share</p>
          <div className="flex flex-wrap gap-2">
            {SHARE_PLATFORMS.map(s => (
              <a
                key={s.id}
                href={shareUrl(s.id, { url: info.url, text: info.title || '' })}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-xs px-3 py-1.5 border border-white/10"
              >
                {s.icon} {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
