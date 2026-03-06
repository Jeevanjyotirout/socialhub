import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <>
      <Head><title>404 — SocialHub</title></Head>
      <div className="min-h-screen flex items-center justify-center text-center px-5 bg-grid">
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
          <p className="font-mono text-8xl font-bold text-white/10 mb-6 select-none">404</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight mb-3">Page not found</h1>
          <p className="text-[var(--muted)] mb-8 max-w-xs mx-auto">The page you're looking for doesn't exist or has been moved.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/"           className="btn-primary">← Go Home</Link>
            <Link href="/downloader" className="btn-secondary">⬇️ Downloader</Link>
          </div>
        </motion.div>
      </div>
    </>
  )
}
