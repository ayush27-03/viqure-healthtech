import React, { createContext, useState, useContext, useEffect } from 'react'
import axiosInstance from '../services/axiosConfig'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  // Session restoration - runs when app loads
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      const storedRole = localStorage.getItem('role')

      if (storedToken && storedUser && storedRole) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        setRole(storedRole)
        
        // Optional: Verify token with backend
        try {
          const response = await axiosInstance.get('/auth/verify')
          if (response.data.valid) {
            console.log('Session restored successfully')
          } else {
            // Token invalid, clear session
            logout()
          }
        } catch (err) {
          console.error('Session verification failed', err)
          logout()
        }
      }
      setLoading(false)
    }

    restoreSession()
  }, [])

  const login = (userData, authToken, userRole) => {
    setUser(userData)
    setToken(authToken)
    setRole(userRole)
    
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('role', userRole)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setRole(null)
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
  }

  const value = {
    user,
    token,
    role,
    loading,
    login,
    logout,
    isAuthenticated: !!token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}