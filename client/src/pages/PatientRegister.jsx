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
      const nameParts = values.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
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
      
      await axiosInstance.post('/auth/register', payload)
      
      message.success('Registration successful! Please login to continue.')
      setSuccessMessage('Registration successful!')
      
      form.resetFields()
      setCurrentStep(0)
      
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