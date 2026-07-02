import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('jtool_token')
    const storedUser = localStorage.getItem('jtool_user')
    if (token && storedUser) setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [])

  function guardarSesion(data) {
    localStorage.setItem('jtool_token', data.token)
    localStorage.setItem('jtool_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    guardarSesion(data)
    return data
  }

  /* Login/registro con Google: recibe el credential que entrega
     Google Identity Services y lo valida contra nuestro backend */
  async function loginWithGoogle(credential) {
    const { data } = await api.post('/auth/google', { credential })
    guardarSesion(data)
    return data
  }

  function logout() {
    localStorage.removeItem('jtool_token')
    localStorage.removeItem('jtool_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, login, loginWithGoogle, logout, loading, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}