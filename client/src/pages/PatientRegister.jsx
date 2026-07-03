// pages/PatientRegister.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../services/axiosConfig'
import {
  Layout,
  Row,
  Col,
  Card,
  Typography,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Divider,
  Alert,
  Spin,
  Steps,
  Space,
  Checkbox,
  Radio,
  message
} from 'antd'
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  CalendarOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  UserAddOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { Step } = Steps

function PatientRegister() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
    setLoading(true)
    setServerError('')
    setSuccessMessage('')
    
    try {
<<<<<<< HEAD
      const nameParts = formData.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      const payload = {
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'CUSTOMER',
        gender: formData.gender.toUpperCase(),
        dob: formData.dateOfBirth,
        profile: {
          firstName: firstName,
          lastName: lastName
        }
      }
      
      await axiosInstance.post('/auth/register', payload)
=======
      const nameParts = values.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
      
      const payload = {
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: 'CUSTOMER',
        gender: values.gender,
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : '',
        profile: {
          firstName: firstName,
          lastName: lastName
        }
      }
      
<<<<<<< HEAD
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        dateOfBirth: '',
        gender: ''
      })
=======
      await axiosInstance.post('/auth/register', payload)
      
      message.success('Registration successful! Please login to continue.')
      setSuccessMessage('Registration successful!')
      
      form.resetFields()
      setCurrentStep(0)
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
      
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed')
      message.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const onFinish = (values) => {
    if (currentStep === 0) {
      setCurrentStep(1)
    } else {
      handleSubmit(values)
    }
  }

<<<<<<< HEAD
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-600 text-sm">{successMessage}</p>
            </div>
          )}
          
          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{serverError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
=======
  const onFinishFailed = (errorInfo) => {
    message.error('Please fill in all required fields correctly')
  }

  const goToPreviousStep = () => {
    setCurrentStep(0)
  }

  const steps = [
    {
      title: 'Personal Info',
      icon: <UserOutlined />,
      content: (
        <>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: 'Please enter your full name' },
              { min: 2, message: 'Name must be at least 2 characters' }
            ]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="Ayush Sharma"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<MailOutlined className="text-gray-400" />} 
              placeholder="ayush@example.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
            ]}
          >
            <Input 
              prefix={<PhoneOutlined className="text-gray-400" />} 
              placeholder="9999999999"
              size="large"
              maxLength={10}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="dob"
                label="Date of Birth"
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Select date"
                  size="large"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="gender"
                label="Gender"
              >
                <Select 
                  placeholder="Select gender" 
                  size="large"
                >
                  <Option value="MALE">Male</Option>
                  <Option value="FEMALE">Female</Option>
                  <Option value="OTHER">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </>
      )
    },
    {
      title: 'Security',
      icon: <LockOutlined />,
      content: (
        <>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain at least one uppercase, one lowercase, and one number'
              }
            ]}
            hasFeedback
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Enter password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Passwords do not match'))
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Confirm password"
              size="large"
            />
          </Form.Item>

          <div className="bg-blue-50 rounded-lg p-4 mt-2">
            <Text strong className="text-blue-700">Password Requirements:</Text>
            <ul className="text-sm text-blue-600 mt-2 space-y-1 list-disc pl-4">
              <li>At least 6 characters long</li>
              <li>At least one uppercase letter (A-Z)</li>
              <li>At least one lowercase letter (a-z)</li>
              <li>At least one number (0-9)</li>
            </ul>
          </div>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              { validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('You must agree to the terms')) }
            ]}
            className="mt-4"
          >
            <Checkbox>
              I agree to the <a href="/terms" className="text-blue-600">Terms of Service</a> and <a href="/privacy" className="text-blue-600">Privacy Policy</a>
            </Checkbox>
          </Form.Item>
        </>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UserAddOutlined className="text-3xl text-white" />
          </div>
          <Title level={2} className="mb-1">Patient Registration</Title>
          <Text type="secondary">Create your account to book appointments</Text>
          <div className="mt-2">
            <Text type="secondary">
              Want to join as a doctor?{' '}
              <Link to="/register/doctor" className="text-blue-600 hover:text-blue-700 font-medium">
                Register here
              </Link>
            </Text>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert
            message="Success!"
            description={successMessage}
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            className="mb-6"
            closable
          />
        )}

        {/* Error Message */}
        {serverError && (
          <Alert
            message="Registration Failed"
            description={serverError}
            type="error"
            showIcon
            className="mb-6"
            closable
            onClose={() => setServerError('')}
          />
        )}

        {/* Registration Card */}
        <Card className="shadow-xl rounded-2xl overflow-hidden">
          {/* Steps */}
          <div className="mb-6 px-4 pt-4">
            <Steps current={currentStep} size="small">
              {steps.map((step, index) => (
                <Step key={index} title={step.title} icon={step.icon} />
              ))}
            </Steps>
          </div>

          <Divider className="my-0" />

          <div className="p-6">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              size="large"
            >
              {steps[currentStep].content}

              <div className="flex gap-3 mt-6">
                {currentStep === 1 && (
                  <Button
                    onClick={goToPreviousStep}
                    icon={<ArrowLeftOutlined />}
                    size="large"
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  icon={currentStep === 0 ? <ArrowRightOutlined /> : null}
                  className={currentStep === 0 ? 'flex-1' : 'flex-1'}
                >
                  {loading ? 'Creating Account...' : currentStep === 0 ? 'Continue' : 'Register'}
                </Button>
              </div>
            </Form>
          </div>
        </Card>

        {/* Login Link */}
        <div className="text-center mt-6">
          <Text type="secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Login here
            </Link>
          </Text>
        </div>
      </div>
    </div>
  )
}

export default PatientRegister
