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

const mapRole = (role) => {
  if (role === 'CUSTOMER') return 'patient'
  if (role === 'DOCTOR') return 'doctor'
  if (role === 'ADMIN') return 'admin'
  return role
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const getUserName = () => {
    if (!user) return ''
    if (user.profile?.firstName) {
      return `${user.profile.firstName} ${user.profile.lastName || ''}`.trim()
    }
    if (user.patientName) return user.patientName
    if (user.doctorName) return user.doctorName
    if (user.name) return user.name
    return ''
  }

  useEffect(() => {
    const restoreSession = () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      const storedRole = localStorage.getItem('role')

      if (storedToken && storedUser && storedRole) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        setRole(storedRole)
        console.log('Session restored from localStorage')
      }
      setLoading(false)
    }

    restoreSession()
  }, [])

  const login = (userData, authToken, userRole) => {
    const mappedRole = mapRole(userRole || userData.role)
    setUser(userData)
    setToken(authToken)
    setRole(mappedRole)
    
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('role', mappedRole)
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
    isAuthenticated: !!token,
    getUserName
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
