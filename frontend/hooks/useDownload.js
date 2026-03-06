import { useState, useRef, useCallback } from 'react'
import { downloadAPI } from '../utils/api'
import toast from 'react-hot-toast'

export function useDownload() {
  const [info,       setInfo]       = useState(null)
  const [status,     setStatus]     = useState(null) // pending|completed|failed
  const [statusData, setStatusData] = useState(null)
  const [loading,    setLoading]    = useState(false)
  const pollRef = useRef(null)

  const analyze = useCallback(async url => {
    setLoading(true)
    setInfo(null)
    setStatus(null)
    setStatusData(null)
    try {
      const { data } = await downloadAPI.info(url)
      setInfo({ ...data.data, url })
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Could not analyze URL. Make sure it is public.')
    } finally {
      setLoading(false)
    }
  }, [])

  const startDownload = useCallback(async url => {
    setStatus('pending')
    try {
      const { data } = await downloadAPI.start(url)
      pollStatus(data.download_id)
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Download failed to start')
      setStatus('failed')
    }
  }, [])

  const pollStatus = id => {
    let tries = 0
    pollRef.current = setInterval(async () => {
      tries++
      if (tries > 90) { clearInterval(pollRef.current); setStatus('failed'); return }
      try {
        const { data } = await downloadAPI.status(id)
        setStatusData(data)
        if (data.status === 'completed') {
          clearInterval(pollRef.current)
          setStatus('completed')
          toast.success('✅ Download ready!')
        } else if (data.status === 'failed') {
          clearInterval(pollRef.current)
          setStatus('failed')
          toast.error('Download failed: ' + (data.error_msg || 'Unknown error'))
        }
      } catch {}
    }, 2500)
  }

  const reset = () => {
    clearInterval(pollRef.current)
    setInfo(null); setStatus(null); setStatusData(null); setLoading(false)
  }

  return { info, status, statusData, loading, analyze, startDownload, reset }
}
