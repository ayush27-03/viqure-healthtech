/* eslint-disable react-hooks/exhaustive-deps */
// pages/DoctorBooking.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
import {
  Layout,
  Row,
  Col,
  Card,
  Typography,
  Button,
  Space,
  Steps,
  DatePicker,
  Select,
  Input,
  Modal,
  Alert,
  Spin,
  Tag,
  Divider,
  Statistic,
  Form,
  Radio,
  message,
  Empty,
  Badge,
  Timeline
} from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  VideoCameraOutlined,
  MessageOutlined,
  HomeOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { Step } = Steps
const { TextArea } = Input
const { Option } = Select

function DoctorBooking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedDuration, setSelectedDuration] = useState(null)
  const [selectedStartTime, setSelectedStartTime] = useState('')
  const [availableStartTimes, setAvailableStartTimes] = useState([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [availableRanges, setAvailableRanges] = useState([])
  const [costData, setCostData] = useState(null)
  const [fetchingCost, setFetchingCost] = useState(false)
  const [bookingDetails, setBookingDetails] = useState({
    reason: '',
    symptoms: '',
    type: 'VIDEO'
  })
  const [durationOptions, setDurationOptions] = useState([])
  const [availableDates, setAvailableDates] = useState([])
  const [fetchingSlots, setFetchingSlots] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchDoctorDetails()
  }, [id, isAuthenticated])

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots()
    }
  }, [selectedDate])

  useEffect(() => {
    if (selectedDuration && availableRanges.length > 0) {
      calculateAvailableStartTimes()
    }
  }, [selectedDuration, availableRanges])

  const fetchDoctorDetails = async () => {
    try {
      const response = await axiosInstance.get(`/users/doctors/${id}`)
      const data = response.data.data || response.data
      setDoctor(data)
      
      const settings = data.availabilitySettings || {}
      const min = settings.minAppointmentDuration || 10
      const max = settings.maxAppointmentDuration || 180
      const maxDays = settings.advanceBookingDays || 14
      
      const options = []
      for (let duration = min; duration <= max; duration += 10) {
        options.push(duration)
      }
      setDurationOptions(options)
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const dates = []
      const actualSlots = data.actualAvailableSlots || []
      
      for (let i = 0; i <= maxDays; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        
        const hasSlots = actualSlots.some(slot => slot.date === dateStr && slot.ranges?.length > 0)
        
        dates.push({
          date: date,
          dateStr: dateStr,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNum: date.getDate(),
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          isAvailable: hasSlots
        })
      }
      setAvailableDates(dates)
      
    } catch (error) {
      console.error('Error fetching doctor:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedDate) return
    setFetchingSlots(true)
    setAvailableRanges([])
    setAvailableStartTimes([])
    setSelectedDuration(null)
    setSelectedStartTime('')
    
    try {
      const response = await axiosInstance.get(`/doctors/${id}/available-slots`, {
        params: { date: selectedDate }
      })
      
      const data = response.data
      const ranges = data.ranges || []
      const minDuration = data.minDuration || 10
      const maxDuration = data.maxDuration || 180
      
      const options = []
      for (let duration = minDuration; duration <= maxDuration; duration += 10) {
        options.push(duration)
      }
      setDurationOptions(options)
      setAvailableRanges(ranges)
      
    } catch (error) {
      console.error('Error fetching slots:', error)
      setAvailableRanges([])
    } finally {
      setFetchingSlots(false)
    }
  }, [id, selectedDate])

  const calculateAvailableStartTimes = () => {
    const startTimes = []
    const now = new Date()
    const selectedDateObj = new Date(selectedDate)
    const isToday = selectedDateObj.toDateString() === now.toDateString()
    
    for (const range of availableRanges) {
      let current = range.start
      
      while (true) {
        const currentMinutes = timeToMinutes(current)
        const endMinutes = currentMinutes + selectedDuration
        const endTime = minutesToTime(endMinutes)
        
        if (endTime > range.end) break
        
        if (isToday) {
          const slotDateTime = new Date(selectedDateObj)
          const [slotHours, slotMins] = current.split(':').map(Number)
          slotDateTime.setHours(slotHours, slotMins, 0, 0)
          const minutesFromNow = (slotDateTime - now) / 1000 / 60
          
          if (minutesFromNow < 10) {
            current = addMinutes(current, 10)
            continue
          }
        }
        
        startTimes.push(current)
        current = addMinutes(current, 10)
      }
    }
    
    setAvailableStartTimes(startTimes)
  }

  function timeToMinutes(timeStr) {
    const [hours, mins] = timeStr.split(':').map(Number)
    return hours * 60 + mins
  }

  function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  }

  function addMinutes(timeStr, minutes) {
    const [hours, mins] = timeStr.split(':').map(Number)
    const total = hours * 60 + mins + minutes
    const newHours = Math.floor(total / 60)
    const newMins = total % 60
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`
  }

  const handleDateSelect = (dateStr, isAvailable) => {
    if (!isAvailable) return
    setSelectedDate(dateStr)
    setAvailableRanges([])
    setAvailableStartTimes([])
    setSelectedDuration(null)
    setSelectedStartTime('')
    setCurrentStep(1)
  }

  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration)
    setCurrentStep(2)
  }

  const handleStartTimeSelect = (startTime) => {
    setSelectedStartTime(startTime)
    setCurrentStep(3)
  }

  const getEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + duration
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
  }

  const handleProceedToBook = async () => {
    if (!selectedStartTime) {
      message.error('Please select a start time')
      return
    }
    
    setFetchingCost(true)
    try {
      const response = await axiosInstance.post('/booking/calculate-cost', {
        doctorId: id,
        date: selectedDate,
        startTime: selectedStartTime,
        endTime: getEndTime(selectedStartTime, selectedDuration),
        duration: selectedDuration,
        type: bookingDetails.type
      })
      
      setCostData(response.data)
      setShowConfirmModal(true)
      setBookingError('')
      setBookingSuccess(false)
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to calculate cost')
    } finally {
      setFetchingCost(false)
    }
  }

  const handleConfirmBooking = async () => {
    const endTime = getEndTime(selectedStartTime, selectedDuration)
    
    try {
      await axiosInstance.post('/appointment-requests', {
        doctorId: id,
        patientId: user?._id,
        date: selectedDate,
        startTime: selectedStartTime,
        endTime: endTime,
        duration: selectedDuration,
        reason: bookingDetails.reason,
        symptoms: bookingDetails.symptoms,
        type: bookingDetails.type
      })
      
      setBookingSuccess(true)
      message.success('Booking request submitted successfully!')
      
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Booking request failed')
      message.error(error.response?.data?.message || 'Booking request failed')
    }
  }

  const doctorName = doctor?.profile ? 
    `${doctor.profile.firstName || ''} ${doctor.profile.lastName || ''}`.trim() : 
    doctor?.doctorName || 'Doctor'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading doctor details..." />
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert
          message="Doctor Not Found"
          description="The doctor you're looking for doesn't exist or has been removed."
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => navigate('/doctors')}>
              Find Doctors
            </Button>
          }
        />
      </div>
    )
  }

  const settings = doctor.availabilitySettings || {}

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(`/doctor/${id}`)}
            className="mb-4"
          >
            Back to Doctor Profile
          </Button>
          
          <Card className="shadow-sm">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={16}>
                <Title level={3} className="mb-0">Book Appointment</Title>
                <Text type="secondary">
                  with {doctorName} • {doctor?.specializations?.[0] || 'General Physician'}
                </Text>
              </Col>
              <Col xs={24} md={8} className="text-right">
                <Tag color="blue" className="text-base py-1 px-3">
                  <DollarOutlined /> ₹{doctor?.consultationFee || 0} consultation fee
                </Tag>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Steps */}
        <Card className="mb-6 shadow-sm">
          <Steps current={currentStep} size="small">
            <Step title="Select Date" icon={<CalendarOutlined />} />
            <Step title="Duration" icon={<ClockCircleOutlined />} />
            <Step title="Time" icon={<ClockCircleOutlined />} />
            <Step title="Confirm" icon={<CheckCircleOutlined />} />
          </Steps>
        </Card>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {/* Main Booking Form */}
            <Card className="shadow-sm">
              {/* Step 1 - Select Date */}
              <div className="mb-6">
                <Title level={5}>Select Date</Title>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
                  {availableDates.map((dateInfo, index) => (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(dateInfo.dateStr, dateInfo.isAvailable)}
                      disabled={!dateInfo.isAvailable}
                      className={`p-3 rounded-lg text-center transition-all ${
                        !dateInfo.isAvailable
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                          : selectedDate === dateInfo.dateStr
                          ? 'bg-blue-600 text-white shadow-md scale-105'
                          : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:border-blue-300 border-2 border-transparent'
                      }`}
                    >
                      <div className="text-xs uppercase">{dateInfo.month}</div>
                      <div className="text-xl font-bold">{dateInfo.dayNum}</div>
                      <div className="text-xs">{dateInfo.dayName}</div>
                      {!dateInfo.isAvailable && (
                        <div className="text-[10px] mt-1 text-gray-400">Unavailable</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <>
                  <Divider />

                  {/* Step 2 - Select Duration */}
                  <div className="mb-6">
                    <Title level={5}>Select Duration</Title>
                    <Text type="secondary" className="block mb-3 text-sm">
                      Doctor allows {settings.minAppointmentDuration || 10} to {settings.maxAppointmentDuration || 180} minutes
                    </Text>
                    <div className="flex flex-wrap gap-2">
                      {durationOptions.map((duration) => (
                        <button
                          key={duration}
                          onClick={() => handleDurationSelect(duration)}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            selectedDuration === duration
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-50 text-gray-700 hover:bg-blue-50 border border-gray-200'
                          }`}
                        >
                          {duration} min
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedDate && selectedDuration && (
                <>
                  <Divider />

                  {/* Step 3 - Select Time */}
                  <div className="mb-6">
                    <Title level={5}>Select Start Time</Title>
                    {fetchingSlots ? (
                      <div className="text-center py-8">
                        <Spin tip="Loading available times..." />
                      </div>
                    ) : availableStartTimes.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto">
                        {availableStartTimes.map((startTime, index) => (
                          <button
                            key={index}
                            onClick={() => handleStartTimeSelect(startTime)}
                            className={`p-3 rounded-lg text-center transition-all ${
                              selectedStartTime === startTime
                                ? 'bg-blue-600 text-white shadow-md scale-105'
                                : 'bg-green-50 text-gray-700 hover:bg-green-100 border border-green-200'
                            }`}
                          >
                            <div className="font-medium">{startTime}</div>
                            <div className="text-xs opacity-75">
                              → {getEndTime(startTime, selectedDuration)}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <Empty
                          description="No available start times"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                          <Text type="secondary" className="text-sm">
                            Try a different duration or date
                          </Text>
                        </Empty>
                      </div>
                    )}
                  </div>
                </>
              )}

              {selectedStartTime && (
                <>
                  <Divider />
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleProceedToBook}
                    loading={fetchingCost}
                    icon={<CalendarOutlined />}
                  >
                    Proceed to Booking Details
                  </Button>
                </>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            {/* Doctor Info Sidebar */}
            <Card className="shadow-sm mb-4">
              <div className="text-center">
                <div className="text-5xl mb-3">{doctor?.profileIcon || '👨‍⚕️'}</div>
                <Title level={4} className="mb-0">{doctorName}</Title>
                <Text type="secondary">{doctor?.specializations?.join(', ') || 'General Physician'}</Text>
                <div className="mt-2">
                  <Badge 
                    count={`${doctor?.stats?.rating || 0} ★`} 
                    style={{ backgroundColor: '#52c41a' }}
                  />
                </div>
              </div>
              
              <Divider />
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Text type="secondary">Experience</Text>
                  <Text strong>{doctor?.yearsOfExperience || 0} years</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Fee</Text>
                  <Text strong className="text-blue-600">₹{doctor?.consultationFee || 0}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Location</Text>
                  <Text strong>{doctor?.addresses?.[0]?.city || 'N/A'}</Text>
                </div>
              </div>
            </Card>

            {/* Quick Info */}
            <Card className="shadow-sm">
              <Title level={5}>Booking Info</Title>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <SafetyCertificateOutlined className="text-green-500" />
                  <Text>Secure booking</Text>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-blue-500" />
                  <Text>Doctor will confirm</Text>
                </div>
                <div className="flex items-center gap-2">
                  <ClockCircleOutlined className="text-orange-500" />
                  <Text>Flexible rescheduling</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Confirmation Modal */}
      <Modal
        title="Booking Details"
        open={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        footer={null}
        width={520}
        centered
      >
        {bookingError ? (
          <div className="text-center py-4">
            <Alert message="Booking Failed" description={bookingError} type="error" showIcon />
            <Button 
              type="primary" 
              className="mt-4"
              onClick={() => {
                setBookingError('')
                setShowConfirmModal(false)
              }}
            >
              Close
            </Button>
          </div>
        ) : bookingSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleOutlined className="text-3xl text-green-600" />
            </div>
            <Title level={4}>Request Sent!</Title>
            <Text type="secondary">
              Your booking request has been submitted successfully. The doctor will review and respond.
            </Text>
            <Button 
              type="primary" 
              className="mt-4"
              block
              onClick={() => {
                setBookingSuccess(false)
                setShowConfirmModal(false)
                navigate(`/doctor/${id}`)
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <Form layout="vertical">
            <Form.Item label="Reason for Visit">
              <TextArea
                rows={3}
                value={bookingDetails.reason}
                onChange={(e) => setBookingDetails({...bookingDetails, reason: e.target.value})}
                placeholder="Please describe your symptoms or reason for visiting"
              />
            </Form.Item>

            <Form.Item label="Symptoms (Optional)">
              <TextArea
                rows={2}
                value={bookingDetails.symptoms}
                onChange={(e) => setBookingDetails({...bookingDetails, symptoms: e.target.value})}
                placeholder="Describe any specific symptoms"
              />
            </Form.Item>

            <Form.Item label="Consultation Type">
              <Radio.Group
                value={bookingDetails.type}
                onChange={(e) => setBookingDetails({...bookingDetails, type: e.target.value})}
                buttonStyle="solid"
              >
                <Radio.Button value="VIDEO"><VideoCameraOutlined /> Video</Radio.Button>
                <Radio.Button value="CHAT"><MessageOutlined /> Chat</Radio.Button>
                <Radio.Button value="CLINIC"><HomeOutlined /> In-Clinic</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Divider />

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <Text type="secondary">Doctor:</Text>
                  <Text strong>{doctorName}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Date:</Text>
                  <Text strong>{dayjs(selectedDate).format('DD MMM YYYY')}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Time:</Text>
                  <Text strong>{selectedStartTime} - {getEndTime(selectedStartTime, selectedDuration)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Duration:</Text>
                  <Text strong>{selectedDuration} minutes</Text>
                </div>
                {costData && (
                  <div className="bg-blue-50 rounded-lg p-3 mt-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <Text type="secondary">Consultation Fee:</Text>
                        <Text strong>₹{costData.subtotal}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text type="secondary">GST (18%):</Text>
                        <Text strong>₹{costData.tax}</Text>
                      </div>
                      <Divider className="my-1" />
                      <div className="flex justify-between">
                        <Text strong>Total Amount:</Text>
                        <Text strong className="text-blue-600 text-lg">₹{costData.total}</Text>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Alert
              message="This is a booking request"
              description="The doctor will review and confirm your appointment."
              type="info"
              showIcon
              className="mb-4"
            />

            <Space className="w-full">
              <Button 
                type="primary" 
                block
                size="large"
                onClick={handleConfirmBooking}
              >
                Submit Request
              </Button>
              <Button 
                block
                size="large"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
            </Space>
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default DoctorBooking
