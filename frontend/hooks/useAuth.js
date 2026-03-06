import { useState, useEffect, createContext, useContext } from 'react'
import Cookies from 'js-cookie'
import { authAPI } from '../utils/api'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('sh_token')
    if (!token) { setLoading(false); return }
    authAPI.me()
      .then(r  => setUser(r.data))
      .catch(() => Cookies.remove('sh_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    Cookies.set('sh_token', data.access_token, { expires: 1 })
    setUser(data.user)
    return data
  }

  const register = async (email, username, password) => {
    const { data } = await authAPI.register({ email, username, password })
    Cookies.set('sh_token', data.access_token, { expires: 1 })
    setUser(data.user)
    return data
  }

  const logout = () => {
    Cookies.remove('sh_token')
    setUser(null)
  }

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
