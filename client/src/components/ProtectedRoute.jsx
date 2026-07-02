// components/ProtectedRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Spin, Result, Button, Typography, Space } from 'antd'
import { LoadingOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons'
import LoadingSpinner from './LoadingSpinner'

const { Title, Text, Paragraph } = Typography

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, user, loading } = useAuth()

  // Loading state - uses your LoadingSpinner component
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <LoadingSpinner size="lg" color="blue" />
          <p className="mt-4 text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Pending doctor approval
  if (role === 'doctor' && user?.detailsOfHealthCareProfessional?.approvalStatus === 'PENDING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
        <div className="max-w-md w-full">
          <Result
            icon={<ClockCircleOutlined className="text-6xl text-amber-500" />}
            title={
              <Title level={3} className="text-gray-800">
                Registration Under Review
              </Title>
            }
            subTitle={
              <Space direction="vertical" size="middle" className="w-full">
                <Paragraph type="secondary" className="text-center">
                  Your doctor registration is pending admin approval.
                  You'll be notified once your account is verified.
                </Paragraph>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <Text strong className="text-amber-700">What happens next?</Text>
                      <ul className="text-sm text-amber-600 mt-1 space-y-1 list-disc pl-4">
                        <li>Admin will review your credentials</li>
                        <li>You'll receive an email notification</li>
                        <li>Once approved, you can access all features</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => window.location.reload()}
                  className="mt-2"
                >
                  Check Status Again
                </Button>
              </Space>
            }
          />
        </div>
      </div>
    )
  }

  // Role not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <Navigate to="/" replace />
    )
  }

  return children
}

export default ProtectedRoute