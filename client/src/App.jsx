import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { useState, useEffect } from 'react'
import './App.css'

// Import all pages
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Shop from './pages/Shop'
import Appointments from './pages/Appointments'
import Login from './pages/Login'

// Health Check Component (your existing code)
function HealthCheck() {
  const [healthStatus, setHealthStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const checkHealth = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/health')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setHealthStatus(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching health:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Full Stack App
      </h1>
      
      <div className="space-y-4">
        <div className="border-t border-b border-gray-200 py-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Backend Health Check
          </h2>
          
          {loading && (
            <div className="text-blue-500 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              Checking server status...
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-600 font-medium">Error:</p>
              <p className="text-red-500 text-sm">{error}</p>
              <button 
                onClick={checkHealth}
                className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}
          
          {healthStatus && !loading && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-green-600 font-medium">✓ Connected!</p>
              <p className="text-gray-700 text-sm mt-1">
                Status: {healthStatus.status}
              </p>
              <p className="text-gray-700 text-sm">
                Message: {healthStatus.message}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Timestamp: {new Date(healthStatus.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </div>
        
        <button
          onClick={checkHealth}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Refresh Health Status
        </button>
      </div>
    </div>
  )
}

// Navigation Component
function Navigation() {
  const { isAuthenticated, user, logout, role } = useAuth()

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center">
        <Link to="/health" className="font-bold text-xl hover:text-blue-200">🏥 HealthApp</Link>
        
        {isAuthenticated && (
          <div className="flex gap-4">
            {role === 'patient' && (
              <Link to="/patient" className="hover:text-blue-200">Patient Dashboard</Link>
            )}
            {role === 'doctor' && (
              <Link to="/doctor" className="hover:text-blue-200">Doctor Dashboard</Link>
            )}
            {role === 'admin' && (
              <Link to="/admin" className="hover:text-blue-200">Admin Dashboard</Link>
            )}
            <Link to="/shop" className="hover:text-blue-200">Shop</Link>
            <Link to="/appointments" className="hover:text-blue-200">Appointments</Link>
          </div>
        )}
        
        <div className="ml-auto flex gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm">👋 Welcome, {user?.name || role}</span>
              <button onClick={logout} className="hover:text-blue-200">Logout</button>
            </>
          ) : (
            <Link to="/login" className="hover:text-blue-200">Login</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

// Main App Routes
function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {/* Health check route - accessible to everyone */}
        <Route path="/health" element={
          <div className="flex items-center justify-center py-12">
            <HealthCheck />
          </div>
        } />
        
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes with Role-Based Access */}
        <Route path="/patient" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/doctor" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/shop" element={
          <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
            <Shop />
          </ProtectedRoute>
        } />
        
        <Route path="/appointments" element={
          <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
            <Appointments />
          </ProtectedRoute>
        } />
        
        {/* Default route - redirect to health check */}
        <Route path="/" element={<Navigate to="/health" />} />
      </Routes>
    </div>
  )
}

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <Navigation />
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App