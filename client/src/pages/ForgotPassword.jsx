import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
  MailOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

function ForgotPassword() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
    setLoading(true)
    setError('')

    try {
      const response = await axiosInstance.post('/auth/forgot-password', { 
        email: values.email 
      })
      
      message.success('OTP sent to your email!')
      
      // Navigate to OTP verification
      navigate('/verify-otp', { state: { email: values.email } })
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
      message.error(err.response?.data?.message || 'Failed to send OTP')
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
              <span className="text-3xl">🔐</span>
            </div>
            <Title level={2} className="mb-1">Forgot Password</Title>
            <Text type="secondary" className="text-base">
              Enter your email to receive OTP
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
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input
                placeholder="you@example.com"
                prefix={<MailOutlined className="text-gray-400" />}
                className="rounded-xl"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-12 rounded-xl font-semibold"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </Form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-gray-500 hover:text-blue-600">
              <ArrowLeftOutlined className="mr-1" /> Back to Login
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default ForgotPassword