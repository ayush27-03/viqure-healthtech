import React, { useState, useEffect, useRef } from 'react'
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
  ArrowLeftOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

function VerifyOTP() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password')
      return
    }

    // Start timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [email, navigate])

  const handleVerify = async (values) => {
    setLoading(true)
    setError('')

    try {
      const response = await axiosInstance.post('/auth/verify-otp', {
        email,
        otp: values.otp
      })

      const { resetToken } = response.data
      message.success('OTP verified!')
      
      navigate('/reset-password', { state: { resetToken, email } })

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP')
      message.error(err.response?.data?.message || 'Invalid OTP')
      form.resetFields()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    setError('')
    setTimer(60)
    setCanResend(false)

    try {
      await axiosInstance.post('/auth/forgot-password', { email })
      message.success('OTP resent to your email!')
      
      // Restart timer
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
              <span className="text-3xl">📧</span>
            </div>
            <Title level={2} className="mb-1">Verify OTP</Title>
            <Text type="secondary" className="text-base">
              Enter the 6-digit code sent to <br />
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
            onFinish={handleVerify}
            size="large"
          >
            <Form.Item
              name="otp"
              label="Enter OTP"
              rules={[
                { required: true, message: 'Please enter the OTP' },
                { len: 6, message: 'OTP must be 6 digits' }
              ]}
            >
              <Input
                placeholder="123456"
                maxLength={6}
                className="rounded-xl text-center text-2xl tracking-widest"
                style={{ fontSize: '24px', letterSpacing: '12px' }}
              />
            </Form.Item>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-gray-500">
                <ClockCircleOutlined />
                <Text type="secondary">
                  {canResend ? 'OTP expired' : `Resend in ${formatTime(timer)}`}
                </Text>
              </div>
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || loading}
                className={`text-sm font-medium ${
                  canResend ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                Resend OTP
              </button>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-12 rounded-xl font-semibold"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </Form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-gray-500 hover:text-blue-600"
            >
              <ArrowLeftOutlined className="mr-1" /> Back to Forgot Password
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default VerifyOTP