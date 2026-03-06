import Link from 'next/link'

export default function EmptyState({ icon = '📭', title, desc, cta, ctaHref }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-5 opacity-40">{icon}</div>
      <p className="font-display font-semibold text-lg text-[var(--text)] mb-2">{title}</p>
      {desc && <p className="text-sm text-[var(--muted)] mb-6 max-w-xs">{desc}</p>}
      {cta && ctaHref && (
        <Link href={ctaHref} className="btn-primary text-sm">{cta}</Link>
      )}
    </div>
  )
}
