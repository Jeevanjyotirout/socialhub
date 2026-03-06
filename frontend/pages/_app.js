import '../styles/globals.css'
import { AuthProvider } from '../hooks/useAuth'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'

export default function App({ Component, pageProps }) {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  if (!ready) return null
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0e0f1d',
            color: '#ecedf8',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '12px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#5865f9', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  )
}
