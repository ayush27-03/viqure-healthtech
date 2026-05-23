import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Auth Pages
import Login from './pages/Login'
import PatientRegister from './pages/PatientRegister'
import DoctorRegister from './pages/DoctorRegister'

// Profile Pages (renamed from Dashboard)
import PatientProfile from './pages/PatientProfile'

import DoctorProfile from './pages/DoctorProfile'
import DoctorSettings from './pages/DoctorSettings'

import AdminDashboard from './pages/AdminDashboard'

import Documents from './pages/Documents'

// Other Pages
import Homepage from './pages/Homepage'

import DoctorDetails from './pages/DoctorDetails'
import DoctorBooking from './pages/DoctorBooking'
import Appointments from './pages/Appointments'

import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'

function Navigation() {
  const { isAuthenticated, user, logout, role } = useAuth()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  

  const handleProfileClick = () => {
    if (role === 'patient') {
      navigate('/patient/profile')
    } else if (role === 'doctor') {
      navigate('/doctor/profile')
    } else if (role === 'admin') {
      navigate('/admin/dashboard')
    }
    setShowProfileMenu(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setShowProfileMenu(false)
  }

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="flex justify-between items-center px-6">
        {/* Left side - Logo and links */}
        <div className="flex gap-6 items-center">
          <Link to="/" className="font-bold text-xl hover:text-blue-200">
            🏥 HealthApp
          </Link>

          {(!isAuthenticated || role === 'patient') && (
              <Link to="/doctors" className="hover:text-blue-200">Find Doctors</Link>
          )}
          <Link to="/shop" className="hover:text-blue-200">Shop</Link>
          
          {isAuthenticated && (
            <Link to="/appointments" className="hover:text-blue-200">My Appointments</Link>
          )}
        </div>
        


        {/* Right side - Profile Dropdown */}
        <div className="relative">
          {isAuthenticated ? (
            <div>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 px-3 py-2 rounded-full transition"
              >
                <span className="text-xl">👤</span>
                <span className="text-sm">
                  {role === 'doctor' ? `Dr. ${user?.name?.split(' ')[0] || ''}` : user?.name?.split(' ')[0] || 'User'}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
                  >
                    👤 My Profile
                  </button>

                  <Link
                    to="/documents"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    📄 Documents
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-b-lg"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="bg-white text-blue-600 px-5 py-1.5 rounded-lg hover:bg-blue-50 transition font-medium">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register/patient" element={<PatientRegister />} />
      <Route path="/register/doctor" element={<DoctorRegister />} />
      <Route path="/doctors" element={<Homepage />} />
      <Route path="/doctor/:id" element={<DoctorDetails />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <Cart />
        </ProtectedRoute>
      } />
      
      {/* Put specific routes BEFORE dynamic routes */}
      <Route path="/doctor/settings" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorSettings />
        </ProtectedRoute>
      } />

      {/* Protected Routes */}
      <Route path="/patient/profile" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <PatientProfile />
        </ProtectedRoute>
      } />
      
      <Route path="/doctor/profile" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorProfile />
        </ProtectedRoute>
      } />

      <Route path="/doctor/:id/book" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <DoctorBooking />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/appointments" element={
        <ProtectedRoute allowedRoles={['patient', 'doctor']}>
          <Appointments />
        </ProtectedRoute>
      } />

      <Route path="/documents" element={
        <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
          <Documents />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

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