/* eslint-disable no-unused-vars */
// pages/Login.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import axiosInstance from '../services/axiosConfig'
import {
  Card,
  Typography,
  Input,
  Button,
  Alert,
  Divider,
  Space,
  Form
} from 'antd'
import {
  MailOutlined,
  LockOutlined,
  LoginOutlined,
  UserAddOutlined,
  HomeOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axiosInstance.post('/auth/login', {
        email: formData.email,
        password: formData.password
      })
      
      const { data } = response.data
      const { user, token } = data
      
      login(user, token, user.role)
      
      if (user.role === 'CUSTOMER') navigate('/patient/profile')
      else if (user.role === 'DOCTOR') navigate('/doctor/dashboard')
      else if (user.role === 'ADMIN') navigate('/admin')
      else navigate('/')
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl rounded-2xl border-0 overflow-hidden">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">🏥</span>
            </div>
            <Title level={2} className="mb-1">Welcome Back</Title>
            <Text type="secondary" className="text-base">Sign in to your account</Text>
          </div>

          {/* Error Message */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="mb-6 rounded-xl"
              closable
              onClose={() => setError('')}
            />
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email Address
                </label>
                <Input
                  size="large"
                  type="email"
                  placeholder="you@example.com"
                  prefix={<MailOutlined className="text-gray-400" />}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="rounded-xl"
                  required
                />
              </div>


              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-700 font-medium">Password</label>
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot Password?
                  </Link>
                </div>
                <Input.Password
                  size="large"
                  placeholder="Enter your password"
                  prefix={<LockOutlined className="text-gray-400" />}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="rounded-xl"
                  required
                />
              </div>

              <Button
                type="primary"
                size="large"
                block
                htmlType="submit"
                loading={loading}
                icon={<LoginOutlined />}
                className="h-12 rounded-xl font-semibold mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>

          <Divider className="my-6">
            <Text type="secondary" className="text-sm">or</Text>
          </Divider>

          {/* Footer */}
          <div className="text-center">
            <Text type="secondary">
              Don't have an account?{' '}
              <Link to="/register/patient" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </Text>
            <div className="mt-3">
              <Link to="/" className="text-gray-400 hover:text-blue-600 text-sm">
                <HomeOutlined className="mr-1" /> Back to Home
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default Login
