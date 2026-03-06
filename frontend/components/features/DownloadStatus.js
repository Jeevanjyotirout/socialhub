import { motion, AnimatePresence } from 'framer-motion'
import { formatBytes } from '../../utils/api'
import clsx from 'clsx'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function DownloadStatus({ status, data }) {
  if (!status) return null

  const isDone   = status === 'completed'
  const isFailed = status === 'failed'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="card p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Download Status</span>
          <span className={clsx('badge', isDone ? 'badge-green' : isFailed ? 'badge-red' : 'badge-amber')}>
            {isDone ? '✅ Completed' : isFailed ? '❌ Failed' : '⏳ ' + (data?.status || 'Processing')}
          </span>
        </div>

        {/* Progress bar */}
        {!isDone && !isFailed && <div className="progress-bar w-full rounded-full" />}

        {/* Download file button */}
        {isDone && data?.file_url && (
          <a
            href={`${API}${data.file_url}`}
            download
            className="btn-primary w-full justify-center py-2.5 text-sm shadow-brand"
          >
            ⬇️ Save File {data.file_size ? `(${formatBytes(data.file_size)})` : ''}
          </a>
        )}

        {isFailed && data?.error_msg && (
          <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
            {data.error_msg}
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
