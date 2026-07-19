import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import axiosInstance from '../services/axiosConfig'
import {
  Card,
  Typography,
  Input,
  Button,
  Alert,
  message,
  Form
} from 'antd'
import {
  LockOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const resetToken = location.state?.resetToken
  const email = location.state?.email

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form] = Form.useForm()

  useEffect(() => {
    if (!resetToken || !email) {
      navigate('/forgot-password')
    }
  }, [resetToken, email, navigate])

  const handleSubmit = async (values) => {
    setLoading(true)
    setError('')

    try {
      await axiosInstance.post('/auth/reset-password', {
        resetToken,
        newPassword: values.newPassword
      })

      message.success('Password reset successfully!')
      
      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
      message.error(err.response?.data?.message || 'Failed to reset password')
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
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">🔑</span>
            </div>
            <Title level={2} className="mb-1">Reset Password</Title>
            <Text type="secondary" className="text-base">
              Create a new password for <br />
              <strong>{email}</strong>
            </Text>
          </div>

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

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
          >
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter a new password' },
                { min: 6, message: 'Password must be at least 6 characters' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain at least one uppercase, one lowercase, and one number'
                }
              ]}
              hasFeedback
            >
              <Input.Password
                placeholder="Enter new password"
                prefix={<LockOutlined className="text-gray-400" />}
                className="rounded-xl"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Passwords do not match'))
                  },
                }),
              ]}
              hasFeedback
            >
              <Input.Password
                placeholder="Confirm new password"
                prefix={<LockOutlined className="text-gray-400" />}
                className="rounded-xl"
              />
            </Form.Item>

            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <Text strong className="text-blue-700">Password Requirements:</Text>
              <ul className="text-sm text-blue-600 mt-2 space-y-1 list-disc pl-4">
                <li>At least 6 characters long</li>
                <li>At least one uppercase letter (A-Z)</li>
                <li>At least one lowercase letter (a-z)</li>
                <li>At least one number (0-9)</li>
              </ul>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-12 rounded-xl font-semibold"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-500 hover:text-blue-600"
            >
              <ArrowLeftOutlined className="mr-1" /> Back to Login
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default ResetPassword