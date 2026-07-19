// pages/DoctorBooking.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Steps,
  Input,
  Modal,
  Alert,
  Spin,
  Tag,
  Divider,
  Form,
  Radio,
  message,
  Empty,
  Badge,
  Space
} from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SafetyCertificateOutlined,
  VideoCameraOutlined,
  MessageOutlined,
  HomeOutlined,
  WarningOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Step } = Steps
const { TextArea } = Input

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
  const [costData, setCostData] = useState(null)
  const [fetchingCost, setFetchingCost] = useState(false)
  const [bookingDetails, setBookingDetails] = useState({
    reason: '',
    symptoms: '',
    type: 'VIDEO'
  })
  const [durationOptions, setDurationOptions] = useState([])
  const [availableDates, setAvailableDates] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [bookingAppointmentId, setBookingAppointmentId] = useState('')
  const [isDoctorAvailable, setIsDoctorAvailable] = useState(true)
  const [bookedSlots, setBookedSlots] = useState([])
  const [unavailableTimes, setUnavailableTimes] = useState([])
  const [workingHours, setWorkingHours] = useState([])
  const [settings, setSettings] = useState({})

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchDoctorDetails()
  }, [id, isAuthenticated])

  useEffect(() => {
    if (selectedDate && selectedDuration && doctor) {
      calculateAvailableStartTimes()
    }
  }, [selectedDate, selectedDuration, doctor, bookedSlots, unavailableTimes])

  const fetchDoctorDetails = async () => {
    try {
      const response = await axiosInstance.get(`/users/doctors/${id}`)
      const data = response.data.data || response.data
      setDoctor(data)
      
      // ✅ Get professional details
      const professional = data.detailsOfHealthCareProfessional || {}
      
      // ✅ Get availability status (from detailsOfHealthCareProfessional)
      const availability = professional.isAvailable !== false
      setIsDoctorAvailable(availability)
      
      // ✅ Get booked slots (timeSlots from detailsOfHealthCareProfessional)
      const slots = professional.timeSlots || []
      setBookedSlots(slots)
      
      // ✅ Get settings (availabilitySettings from detailsOfHealthCareProfessional)
      const settingsData = professional.availabilitySettings || {}
      setSettings(settingsData)
      
      // ✅ Get unavailable times
      const unavailable = settingsData.unavailableTimes || []
      setUnavailableTimes(unavailable)
      
      // ✅ Get working hours
      const working = settingsData.workingHours || []
      setWorkingHours(working)
      
      // ✅ Generate duration options
      const min = settingsData.minAppointmentDuration || 10
      const max = settingsData.maxAppointmentDuration || 180
      const options = []
      for (let duration = min; duration <= max; duration += 10) {
        options.push(duration)
      }
      setDurationOptions(options)
      
      // ✅ Generate available dates
      const maxDays = settingsData.advanceBookingDays || 14
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const dates = []
      
      for (let i = 0; i <= maxDays; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        
        const hasSlots = checkDateHasAvailableSlots(dateStr, working, slots, unavailable)
        
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
      message.error('Failed to load doctor details')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Check if a date has any available slots
  const checkDateHasAvailableSlots = (dateStr, workingHours, bookedSlots, unavailableTimes) => {
    const dayOfWeek = new Date(dateStr + 'T00:00:00').getDay()
    const daySetting = workingHours.find(w => w.dayOfWeek === dayOfWeek)
    
    if (!daySetting || !daySetting.isWorking) return false
    
    const bookedForDate = bookedSlots.filter(s => s.date === dateStr)
    const unavailableForDate = unavailableTimes.find(u => u.date === dateStr)
    
    for (const slot of daySetting.slots) {
      const slotStart = timeToMinutes(slot.start)
      const slotEnd = timeToMinutes(slot.end)
      
      // Check if fully booked
      let isFullyBooked = false
      for (const booked of bookedForDate) {
        const bookedStart = timeToMinutes(booked.startTime)
        const bookedEnd = timeToMinutes(booked.endTime)
        if (bookedStart <= slotStart && bookedEnd >= slotEnd) {
          isFullyBooked = true
          break
        }
      }
      
      if (!isFullyBooked) {
        // Check if within unavailable times
        let isUnavailable = false
        if (unavailableForDate) {
          for (const range of unavailableForDate.ranges) {
            const rangeStart = timeToMinutes(range.start)
            const rangeEnd = timeToMinutes(range.end)
            if (slotStart >= rangeStart && slotEnd <= rangeEnd) {
              isUnavailable = true
              break
            }
          }
        }
        
        if (!isUnavailable) {
          return true
        }
      }
    }
    
    return false
  }

  // ✅ Calculate available start times
  const calculateAvailableStartTimes = () => {
    if (!selectedDate || !selectedDuration || !doctor) {
      setAvailableStartTimes([])
      return
    }
    
    const startTimes = []
    const now = new Date()
    const selectedDateObj = new Date(selectedDate)
    const isToday = selectedDateObj.toDateString() === now.toDateString()
    const dayOfWeek = selectedDateObj.getDay()
    
    const daySetting = workingHours.find(w => w.dayOfWeek === dayOfWeek)
    if (!daySetting || !daySetting.isWorking) {
      setAvailableStartTimes([])
      return
    }
    
    const bookedForDate = bookedSlots.filter(s => s.date === selectedDate)
    const unavailableForDate = unavailableTimes.find(u => u.date === selectedDate)
    
    for (const range of daySetting.slots) {
      let current = range.start
      const rangeStart = timeToMinutes(range.start)
      const rangeEnd = timeToMinutes(range.end)
      
      while (true) {
        const currentMinutes = timeToMinutes(current)
        const endMinutes = currentMinutes + selectedDuration
        
        if (endMinutes > rangeEnd) break
        
        let isBooked = false
        for (const booked of bookedForDate) {
          const bookedStart = timeToMinutes(booked.startTime)
          const bookedEnd = timeToMinutes(booked.endTime)
          if (!(endMinutes <= bookedStart || currentMinutes >= bookedEnd)) {
            isBooked = true
            break
          }
        }
        
        let isUnavailable = false
        if (unavailableForDate) {
          for (const range of unavailableForDate.ranges) {
            const unavailStart = timeToMinutes(range.start)
            const unavailEnd = timeToMinutes(range.end)
            if (!(endMinutes <= unavailStart || currentMinutes >= unavailEnd)) {
              isUnavailable = true
              break
            }
          }
        }
        
        let isValidTime = true
        if (isToday && !isBooked && !isUnavailable) {
          const slotDateTime = new Date(selectedDateObj)
          const [slotHours, slotMins] = current.split(':').map(Number)
          slotDateTime.setHours(slotHours, slotMins, 0, 0)
          const minutesFromNow = (slotDateTime - now) / 1000 / 60
          if (minutesFromNow < 10) {
            isValidTime = false
          }
        }
        
        if (!isBooked && !isUnavailable && isValidTime) {
          startTimes.push(current)
        }
        
        current = addMinutes(current, 10)
      }
    }
    
    setAvailableStartTimes(startTimes)
  }

  // Helper functions
  function timeToMinutes(timeStr) {
    if (!timeStr) return 0
    const [hours, mins] = timeStr.split(':').map(Number)
    return hours * 60 + mins
  }

  function addMinutes(timeStr, minutes) {
    const [hours, mins] = timeStr.split(':').map(Number)
    const total = hours * 60 + mins + minutes
    const newHours = Math.floor(total / 60)
    const newMins = total % 60
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`
  }

  const handleDateSelect = (dateStr, isAvailable) => {
    if (!isAvailable || !isDoctorAvailable) return
    setSelectedDate(dateStr)
    setSelectedDuration(null)
    setSelectedStartTime('')
    setAvailableStartTimes([])
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
    setSubmitting(true)
    const endTime = getEndTime(selectedStartTime, selectedDuration)
    
    try {
      const response = await axiosInstance.post('/appointments', {
        doctorId: id,
        patientId: user?._id,
        date: selectedDate,
        startTime: selectedStartTime,
        endTime: endTime,
        duration: selectedDuration,
        reason: bookingDetails.reason,
        symptoms: bookingDetails.symptoms,
        consultationType: bookingDetails.type
      })
      
      setBookingSuccess(true)
      const appointmentId = response.data.data?._id
      setBookingAppointmentId(appointmentId)
      message.success('Booking request submitted successfully!')
      
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Booking request failed')
      message.error(error.response?.data?.message || 'Booking request failed')
    } finally {
      setSubmitting(false)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
                  <DollarOutlined /> ₹{doctor?.detailsOfHealthCareProfessional?.consultationFee || 0} consultation fee
                </Tag>
                {!isDoctorAvailable && (
                  <Tag color="red" className="text-base py-1 px-3 ml-2">
                    <WarningOutlined /> Not Accepting Bookings
                  </Tag>
                )}
              </Col>
            </Row>
          </Card>
        </div>

        {/* Doctor Not Available Warning */}
        {!isDoctorAvailable && (
          <Alert
            message="Doctor Not Accepting Bookings"
            description="This doctor is currently not accepting new appointments. Please check back later or try another doctor."
            type="warning"
            showIcon
            className="mb-4"
            icon={<ClockCircleOutlined />}
          />
        )}

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
              {!isDoctorAvailable ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🚫</div>
                  <Title level={4}>Bookings Disabled</Title>
                  <Text type="secondary">
                    This doctor is currently not accepting new appointments.
                  </Text>
                  <br />
                  <Button 
                    type="primary" 
                    className="mt-4"
                    onClick={() => navigate('/doctors')}
                  >
                    Find Another Doctor
                  </Button>
                </div>
              ) : (
                <>
                  {/* Step 1 - Select Date */}
                  <div className="mb-6">
                    <Title level={5}>Select Date</Title>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
                      {availableDates.map((dateInfo, index) => (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(dateInfo.dateStr, dateInfo.isAvailable)}
                          disabled={!dateInfo.isAvailable || !isDoctorAvailable}
                          className={`p-3 rounded-lg text-center transition-all ${
                            !dateInfo.isAvailable || !isDoctorAvailable
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
                    {availableDates.every(d => !d.isAvailable) && (
                      <div className="mt-4 text-center">
                        <Text type="secondary">No available dates in the next {settings.advanceBookingDays || 14} days</Text>
                      </div>
                    )}
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
                        {availableStartTimes.length > 0 ? (
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
                    count={`${doctor?.detailsOfHealthCareProfessional?.stats?.rating || 0} ★`} 
                    style={{ backgroundColor: '#52c41a' }}
                  />
                </div>
                {!isDoctorAvailable && (
                  <div className="mt-2">
                    <Tag color="red" icon={<WarningOutlined />}>Not Available</Tag>
                  </div>
                )}
              </div>
              
              <Divider />
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Text type="secondary">Experience</Text>
                  <Text strong>{doctor?.detailsOfHealthCareProfessional?.yearsOfExperience || 0} years</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Fee</Text>
                  <Text strong className="text-blue-600">₹{doctor?.detailsOfHealthCareProfessional?.consultationFee || 0}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Location</Text>
                  <Text strong>{doctor?.addresses?.[0]?.city || 'N/A'}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Status</Text>
                  <Tag color={isDoctorAvailable ? 'green' : 'red'}>
                    {isDoctorAvailable ? 'Accepting Bookings' : 'Not Accepting'}
                  </Tag>
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
            <Space direction="vertical" className="w-full mt-4">
              <Button 
                type="primary"
                block
                onClick={() => navigate(`/appointments?highlight=${bookingAppointmentId}`)}
              >
                View My Appointments
              </Button>
              <Button 
                block
                onClick={() => {
                  setBookingSuccess(false)
                  setShowConfirmModal(false)
                  navigate(`/doctor/${id}`)
                }}
              >
                Back to Doctor Profile
              </Button>
            </Space>
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

            <Space className="w-full" direction="vertical">
              <Button 
                type="primary" 
                block
                size="large"
                onClick={handleConfirmBooking}
                loading={submitting}
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