import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  

  // CHANGED: Add pending doctor check
  if (role === 'DOCTOR' && user?.detailsOfHealthCareProfessional?.approvalStatus === 'PENDING') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Under Review</h2>
          <p className="text-gray-600">
            Your doctor registration is pending admin approval. 
            You'll be notified once your account is verified.
          </p>
        </div>
      </div>
    )
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
