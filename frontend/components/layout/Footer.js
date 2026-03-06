import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-24 py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">S</div>
          <span className="font-display font-bold text-sm">Social<span className="text-brand-400">Hub</span></span>
          <span className="text-[var(--muted)] text-xs ml-1">— Free & Open Source</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-1 gap-y-1 text-sm">
          {[
            { href: '/downloader', label: 'Downloader' },
            { href: '/optimizer',  label: 'Optimizer'  },
            { href: '/dashboard',  label: 'Dashboard'  },
            { href: '/library',    label: 'Library'    },
            { href: '/settings',   label: 'Settings'   },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className="px-3 py-1 text-[var(--muted)] hover:text-[var(--text)] transition-colors text-xs">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="text-[0.7rem] text-[var(--muted)]">
          Powered by yt-dlp · FastAPI · Next.js — MIT License
        </p>
      </div>
    </footer>
  )
}
