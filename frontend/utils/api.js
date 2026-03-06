/**
 * SocialHub – API Client & Utilities
 */
import axios from 'axios'
import Cookies from 'js-cookie'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const http = axios.create({ baseURL: BASE, timeout: 60000 })

// Inject JWT on every request
http.interceptors.request.use(cfg => {
  const token = Cookies.get('sh_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: body  => http.post('/api/auth/register', body),
  login:    body  => http.post('/api/auth/login', body),
  me:       ()    => http.get('/api/auth/me'),
  changePassword: body => http.put('/api/auth/password', body),
}

// ── Downloads ─────────────────────────────────────────────────────────────────
export const downloadAPI = {
  info:   url => http.post('/api/downloads/info', { url }),
  start:  url => http.post('/api/downloads/', { url }),
  status: id  => http.get(`/api/downloads/${id}/status`),
  list:   ()  => http.get('/api/downloads/'),
  remove: id  => http.delete(`/api/downloads/${id}`),
}

// ── Captions ──────────────────────────────────────────────────────────────────
export const captionAPI = {
  optimize: body => http.post('/api/captions/optimize', body),
  list:     ()   => http.get('/api/captions/'),
  remove:   id   => http.delete(`/api/captions/${id}`),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  stats:  () => http.get('/api/dashboard/stats'),
  recent: () => http.get('/api/dashboard/recent'),
}

// ── Platform metadata ─────────────────────────────────────────────────────────
export const PLATFORMS = {
  youtube:   { name: 'YouTube',   icon: '▶️', color: '#ff0000' },
  instagram: { name: 'Instagram', icon: '📷', color: '#e1306c' },
  tiktok:    { name: 'TikTok',    icon: '🎵', color: '#69c9d0' },
  twitter:   { name: 'Twitter/X', icon: '🐦', color: '#1da1f2' },
  facebook:  { name: 'Facebook',  icon: '👥', color: '#1877f2' },
  linkedin:  { name: 'LinkedIn',  icon: '💼', color: '#0a66c2' },
  reddit:    { name: 'Reddit',    icon: '🤖', color: '#ff4500' },
  quora:     { name: 'Quora',     icon: '❓', color: '#b92b27' },
}

// Client-side platform detector
export function detectPlatform(url) {
  if (!url) return null
  const u = url.toLowerCase()
  if (u.includes('youtube') || u.includes('youtu.be')) return 'youtube'
  if (u.includes('instagram'))                          return 'instagram'
  if (u.includes('tiktok'))                             return 'tiktok'
  if (u.includes('twitter') || u.includes('x.com'))    return 'twitter'
  if (u.includes('facebook') || u.includes('fb.watch')) return 'facebook'
  if (u.includes('linkedin'))                           return 'linkedin'
  if (u.includes('reddit') || u.includes('redd.it'))   return 'reddit'
  if (u.includes('quora'))                              return 'quora'
  return null
}

// Share URL builders
export function shareUrl(platform, { url, text = '' }) {
  const eu = encodeURIComponent(url)
  const et = encodeURIComponent(text)
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${eu}`,
    twitter:  `https://twitter.com/intent/tweet?url=${eu}&text=${et}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${eu}&title=${et}`,
    reddit:   `https://reddit.com/submit?url=${eu}&title=${et}`,
    whatsapp: `https://wa.me/?text=${et}%20${eu}`,
  }[platform]
}

// Formatters
export const formatBytes = n => {
  if (!n) return '0 B'
  const k = 1024, u = ['B','KB','MB','GB']
  const i = Math.floor(Math.log(n) / Math.log(k))
  return `${(n / Math.pow(k, i)).toFixed(1)} ${u[i]}`
}

export const formatDuration = s => {
  if (!s) return '0:00'
  const m = Math.floor(s / 60), sec = s % 60
  return `${m}:${String(sec).padStart(2,'0')}`
}

export const timeAgo = d => {
  const diff = (Date.now() - new Date(d)) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

export default http
