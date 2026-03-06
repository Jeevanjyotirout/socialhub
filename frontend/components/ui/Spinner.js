export default function Spinner({ size = 16, color = 'white' }) {
  return (
    <svg
      width={size} height={size}
      className="animate-spin flex-shrink-0"
      fill="none" viewBox="0 0 24 24"
      style={{ color }}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
