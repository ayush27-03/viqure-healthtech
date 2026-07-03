// pages/DoctorRegister.jsx - Full Revised Code
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../services/axiosConfig'
import {
  Card,
  Typography,
  Input,
  Button,
  Select,
  Alert,
  Row,
  Col,
  Steps,
  DatePicker,
  Divider
} from 'antd'
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  IdcardOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { Step } = Steps
const { TextArea } = Input

function DoctorRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    specialization: '',
    licenseNumber: '',
    experience: '',
    clinicName: '',
    clinicAddress: '',
    consultationFee: '',
    bio: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const navigate = useNavigate()

  const specializations = [
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Orthopedic',
    'Neurologist',
    'Gynecologist',
    'Ophthalmologist',
    'ENT Specialist',
    'Psychiatrist',
    'Dentist',
    'Ayurveda',
    'Homeopathy'
  ]

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.specialization) newErrors.specialization = 'Specialization is required'
    if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required'
    if (!formData.consultationFee) newErrors.consultationFee = 'Consultation fee is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleDateChange = (date, dateString) => {
    setFormData({ ...formData, dateOfBirth: dateString })
  }

  const handleSubmit = async () => {
    setErrors({})
    if (!validateForm()) return
    
    setLoading(true)
    setServerError('')
    setSuccessMessage('')
    
    try {
      const nameParts = formData.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      const payload = {
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'DOCTOR',
        gender: formData.gender.toUpperCase(),
        dob: formData.dateOfBirth,
        profile: {
          firstName: firstName,
          lastName: lastName
        },
        detailsOfHealthCareProfessional: {
          medicalLicense: formData.licenseNumber,
          consultationFee: parseFloat(formData.consultationFee),
          qualifications: [formData.specialization],
          yearsOfExperience: parseInt(formData.experience) || 0,
          bio: formData.bio,
          clinicName: formData.clinicName,
          clinicAddress: formData.clinicAddress
        }
      }
      
      await axiosInstance.post('/auth/register', payload)
      
      setSuccessMessage('Registration submitted for admin approval! You will be notified once approved.')
      
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        specialization: '',
        licenseNumber: '',
        experience: '',
        clinicName: '',
        clinicAddress: '',
        consultationFee: '',
        bio: ''
      })
      
      setTimeout(() => {
        navigate('/login')
      }, 3000)
      
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    setErrors({})
    
    if (currentStep === 0) {
      const step1Errors = {}
      if (!formData.name.trim()) step1Errors.name = 'Name is required'
      if (!formData.email.trim()) step1Errors.email = 'Email is required'
      if (!formData.specialization) step1Errors.specialization = 'Specialization is required'
      if (!formData.licenseNumber) step1Errors.licenseNumber = 'License number is required'
      if (!formData.consultationFee) step1Errors.consultationFee = 'Consultation fee is required'
      if (!formData.gender) step1Errors.gender = 'Gender is required'
      
      if (Object.keys(step1Errors).length > 0) {
        setErrors(step1Errors)
        return
      }
      setCurrentStep(1)
    } else if (currentStep === 1) {
      setCurrentStep(2)
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Specialization *
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.specialization ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.gender ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  License Number *
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Clinic Name
                </label>
                <input
                  type="text"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Consultation Fee (₹) *
                </label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.consultationFee ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.consultationFee && <p className="text-red-500 text-sm mt-1">{errors.consultationFee}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Clinic Address
              </label>
              <textarea
                name="clinicAddress"
                value={formData.clinicAddress}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Bio / About
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                placeholder="Tell patients about your experience, expertise, and approach..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Submitting for Approval...' : 'Register as Doctor'}
            </button>
          </form>
          
          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
=======
  const prevStep = () => {
    setErrors({})
    setCurrentStep(currentStep - 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <MedicineBoxOutlined className="text-3xl text-white" />
          </div>
          <Title level={2} className="mb-1">Doctor Registration</Title>
          <Text type="secondary" className="text-base">Join our platform and start helping patients</Text>
          <div className="mt-2">
            <Text type="secondary">
              Want to register as a patient?{' '}
              <Link to="/register/patient" className="text-blue-600 hover:text-blue-700 font-medium">
                Register here
              </Link>
            </Text>
          </div>
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
        </div>

        {/* Messages */}
        {successMessage && (
          <Alert
            message={successMessage}
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            className="mb-6 rounded-xl"
            closable
          />
        )}
        
        {serverError && (
          <Alert
            message={serverError}
            type="error"
            showIcon
            className="mb-6 rounded-xl"
            closable
            onClose={() => setServerError('')}
          />
        )}

        {/* Card */}
        <Card className="shadow-xl rounded-2xl border-0 overflow-hidden">
          <div className="px-6 pt-6">
            <Steps current={currentStep} size="default">
              <Step title="Personal & Professional" icon={<UserOutlined />} />
              <Step title="Clinic Details" icon={<MedicineBoxOutlined />} />
              <Step title="Security" icon={<LockOutlined />} />
            </Steps>
          </div>

          <Divider className="my-6" />

          <div className="px-6 pb-6">
            {/* Step 1 */}
            {currentStep === 0 && (
              <Row gutter={[24, 16]}>
                <Col xs={24}>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      size="large"
                      name="name"
                      placeholder="Dr. Ayush Sharma"
                      prefix={<UserOutlined className="text-gray-400" />}
                      value={formData.name}
                      onChange={handleChange}
                      className={`rounded-xl ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <Text type="danger" className="text-sm">{errors.name}</Text>}
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      size="large"
                      name="email"
                      type="email"
                      placeholder="doctor@example.com"
                      prefix={<MailOutlined className="text-gray-400" />}
                      value={formData.email}
                      onChange={handleChange}
                      className={`rounded-xl ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && <Text type="danger" className="text-sm">{errors.email}</Text>}
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                    <Input
                      size="large"
                      name="phone"
                      placeholder="9999999999"
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      value={formData.phone}
                      onChange={handleChange}
                      className="rounded-xl"
                      maxLength={10}
                    />
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Specialization <span className="text-red-500">*</span>
                    </label>
                    <Select
                      size="large"
                      placeholder="Select Specialization"
                      value={formData.specialization || undefined}
                      onChange={(value) => handleSelectChange('specialization', value)}
                      className={`w-full rounded-xl ${errors.specialization ? 'border-red-500' : ''}`}
                    >
                      {specializations.map(spec => (
                        <Option key={spec} value={spec}>{spec}</Option>
                      ))}
                    </Select>
                    {errors.specialization && <Text type="danger" className="text-sm">{errors.specialization}</Text>}
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Date of Birth</label>
                    <DatePicker
                      size="large"
                      className="w-full rounded-xl"
                      placeholder="Select date"
                      onChange={handleDateChange}
                      disabledDate={(current) => current && current > dayjs().endOf('day')}
                    />
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <Select
                      size="large"
                      placeholder="Select Gender"
                      value={formData.gender || undefined}
                      onChange={(value) => handleSelectChange('gender', value)}
                      className={`w-full rounded-xl ${errors.gender ? 'border-red-500' : ''}`}
                    >
                      <Option value="MALE">Male</Option>
                      <Option value="FEMALE">Female</Option>
                      <Option value="OTHER">Other</Option>
                    </Select>
                    {errors.gender && <Text type="danger" className="text-sm">{errors.gender}</Text>}
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      License Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      size="large"
                      name="licenseNumber"
                      placeholder="LIC-1234-5678"
                      prefix={<IdcardOutlined className="text-gray-400" />}
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className={`rounded-xl ${errors.licenseNumber ? 'border-red-500' : ''}`}
                    />
                    {errors.licenseNumber && <Text type="danger" className="text-sm">{errors.licenseNumber}</Text>}
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Years of Experience</label>
                    <Input
                      size="large"
                      name="experience"
                      type="number"
                      placeholder="0"
                      prefix={<ClockCircleOutlined className="text-gray-400" />}
                      value={formData.experience}
                      onChange={handleChange}
                      className="rounded-xl"
                      min={0}
                    />
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Consultation Fee (₹) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      size="large"
                      name="consultationFee"
                      type="number"
                      placeholder="500"
                      prefix={<DollarOutlined className="text-gray-400" />}
                      value={formData.consultationFee}
                      onChange={handleChange}
                      className={`rounded-xl ${errors.consultationFee ? 'border-red-500' : ''}`}
                      min={0}
                    />
                    {errors.consultationFee && <Text type="danger" className="text-sm">{errors.consultationFee}</Text>}
                  </div>
                </Col>
              </Row>
            )}

            {/* Step 2 */}
            {currentStep === 1 && (
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Clinic Name</label>
                    <Input
                      size="large"
                      name="clinicName"
                      placeholder="Your Clinic Name"
                      prefix={<BankOutlined className="text-gray-400" />}
                      value={formData.clinicName}
                      onChange={handleChange}
                      className="rounded-xl"
                    />
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Clinic Address</label>
                    <Input
                      size="large"
                      name="clinicAddress"
                      placeholder="Address, City, State"
                      prefix={<EnvironmentOutlined className="text-gray-400" />}
                      value={formData.clinicAddress}
                      onChange={handleChange}
                      className="rounded-xl"
                    />
                  </div>
                </Col>

                <Col xs={24}>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Bio / About</label>
                    <TextArea
                      name="bio"
                      rows={4}
                      placeholder="Tell patients about your experience, expertise, and approach to healthcare..."
                      value={formData.bio}
                      onChange={handleChange}
                      className="rounded-xl"
                      maxLength={500}
                      showCount
                    />
                  </div>
                </Col>

                <Col xs={24}>
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <CheckCircleOutlined className="text-blue-500 text-xl mt-0.5" />
                      <div>
                        <Text strong className="text-blue-700 text-base">Important Information</Text>
                        <ul className="text-sm text-blue-600 mt-2 space-y-1.5 list-disc pl-4">
                          <li>Your registration will be reviewed by our admin team</li>
                          <li>You will receive a confirmation email once approved</li>
                          <li>Make sure all details are accurate before submitting</li>
                          <li>You can update your profile after approval</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            )}

            {/* Step 3 */}
            {currentStep === 2 && (
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <Input.Password
                      size="large"
                      name="password"
                      placeholder="Enter password"
                      prefix={<LockOutlined className="text-gray-400" />}
                      value={formData.password}
                      onChange={handleChange}
                      className={`rounded-xl ${errors.password ? 'border-red-500' : ''}`}
                    />
                    {errors.password && <Text type="danger" className="text-sm">{errors.password}</Text>}
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <Input.Password
                      size="large"
                      name="confirmPassword"
                      placeholder="Confirm password"
                      prefix={<LockOutlined className="text-gray-400" />}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`rounded-xl ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                    {errors.confirmPassword && <Text type="danger" className="text-sm">{errors.confirmPassword}</Text>}
                  </div>
                </Col>

                <Col xs={24}>
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                    <Text strong className="text-blue-700 text-base">Password Requirements:</Text>
                    <ul className="text-sm text-blue-600 mt-2 space-y-1.5 list-disc pl-4">
                      <li>At least 6 characters long</li>
                      <li>At least one uppercase letter (A-Z)</li>
                      <li>At least one lowercase letter (a-z)</li>
                      <li>At least one number (0-9)</li>
                    </ul>
                  </div>
                </Col>
              </Row>
            )}

            {/* Navigation Buttons - FIXED */}
            <div className="flex gap-4 mt-8">
              {currentStep > 0 && (
                <Button
                  onClick={prevStep}
                  icon={<ArrowLeftOutlined />}
                  size="large"
                  className="flex-1 h-12 rounded-xl"
                >
                  Back
                </Button>
              )}
              {currentStep < 2 ? (
                <Button
                  type="primary"
                  onClick={nextStep}
                  icon={<ArrowRightOutlined />}
                  size="large"
                  className="flex-1 h-12 rounded-xl font-semibold"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={loading}
                  size="large"
                  className="flex-1 h-12 rounded-xl font-semibold"
                >
                  {loading ? 'Submitting...' : 'Register as Doctor'}
                </Button>
              )}
            </div>

            <Divider className="my-6" />

            <div className="text-center">
              <Text type="secondary">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Login here
                </Link>
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DoctorRegister
