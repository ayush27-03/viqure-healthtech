/* eslint-disable react-hooks/exhaustive-deps */
// pages/DoctorBooking.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
import { payViaRazorpay } from '../services/razorpay'
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
  HomeOutlined,
  WarningOutlined,
  CreditCardOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { TextArea } = Input

const TAX_RATE = 0.18 // mirrors appointment.controller.js TAX_RATE — keep in sync

function DoctorBooking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bookingDetails, setBookingDetails] = useState({ reason: '', type: 'VIDEO' })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchDoctorDetails()
  }, [id, isAuthenticated])

  const fetchDoctorDetails = async () => {
    try {
      const response = await axiosInstance.get(`/users/doctors/${id}`)
      setDoctor(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching doctor:', error)
      message.error('Failed to load doctor details')
    } finally {
      setLoading(false)
    }
  }

  const professional = doctor?.detailsOfHealthCareProfessional || {}
  const consultationFee = professional.consultationFee || 0
  const isDoctorAvailable = professional.isAvailable !== false

  // Build a fully-qualified start Date for a slot so we can compare against "now".
  const slotStartDate = (slot) => {
    const d = new Date(slot.date)
    const [h, m] = (slot.startTime || '00:00').split(':').map(Number)
    d.setHours(h, m, 0, 0)
    return d
  }

  // Only future, unbooked slots are bookable. Group them by calendar date.
  const slotsByDate = useMemo(() => {
    const now = new Date()
    const open = (professional.timeSlots || [])
      .filter((s) => !s.isBooked && slotStartDate(s) > now)
      .sort((a, b) => slotStartDate(a) - slotStartDate(b))

    const groups = {}
    for (const s of open) {
      const key = dayjs(s.date).format('YYYY-MM-DD')
      if (!groups[key]) groups[key] = []
      groups[key].push(s)
    }
    return groups
  }, [doctor])

  const availableDates = Object.keys(slotsByDate).sort()

  const doctorName = doctor?.profile
    ? `${doctor.profile.firstName || ''} ${doctor.profile.lastName || ''}`.trim()
    : doctor?.doctorName || 'Doctor'

  // ── Cost preview (client-side mirror of the server calculation) ──
  const taxAmount = Math.round(consultationFee * TAX_RATE)
  const totalAmount = consultationFee + taxAmount

  const openConfirm = () => {
    if (!selectedSlot) {
      message.error('Please select a time slot')
      return
    }
    setShowConfirmModal(true)
  }

  const handleConfirmBooking = async () => {
    if (!selectedSlot?._id) {
      message.error('Please select a valid slot')
      return
    }
    setSubmitting(true)
    try {
      // 1) Create the appointment against the real slot.
      const res = await axiosInstance.post('/appointments', {
        doctorId: id,
        slotId: selectedSlot._id,
        reason: bookingDetails.reason,
        consultationType: bookingDetails.type
      })
      const appointment = res.data.data
      const appointmentId = appointment?._id
      message.success('Appointment booked! Opening payment…')

      // 2) Immediately open Razorpay for the consultation fee.
      await payViaRazorpay({
        context: 'APPOINTMENT',
        id: appointmentId,
        user,
        onSuccess: () => {
          message.success('Payment successful — your appointment is confirmed once the doctor accepts.')
          navigate(`/appointments?highlight=${appointmentId}`)
        },
        onFailure: (err) => {
          message.warning(
            (err?.message ? `${err.message}. ` : '') +
            'Your slot is booked but unpaid — you can pay from My Appointments.'
          )
          navigate(`/appointments?highlight=${appointmentId}`)
        }
      })
    } catch (error) {
      message.error(error.response?.data?.message || 'Booking failed')
    } finally {
      setSubmitting(false)
      setShowConfirmModal(false)
    }
  }

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

  const bookingStep = selectedSlot ? 2 : selectedDate ? 1 : 0

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
                  with {doctorName} • {professional.qualifications?.[0] || 'General Physician'}
                </Text>
              </Col>
              <Col xs={24} md={8} className="text-right">
                <Tag color="blue" className="text-base py-1 px-3">
                  <DollarOutlined /> ₹{consultationFee} consultation fee
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

        {!isDoctorAvailable && (
          <Alert
            message="Doctor Not Accepting Bookings"
            description="This doctor is currently not accepting new appointments. Please check back later or try another doctor."
            type="warning"
            showIcon
            className="mb-4"
          />
        )}

        <Card className="mb-6 shadow-sm">
          <Steps
            current={bookingStep}
            size="small"
            items={[
              { title: 'Select Date', icon: <CalendarOutlined /> },
              { title: 'Select Time', icon: <ClockCircleOutlined /> },
              { title: 'Confirm & Pay', icon: <CreditCardOutlined /> },
            ]}
          />
        </Card>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card className="shadow-sm">
              {!isDoctorAvailable ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🚫</div>
                  <Title level={4}>Bookings Disabled</Title>
                  <Text type="secondary">This doctor is currently not accepting new appointments.</Text>
                  <br />
                  <Button type="primary" className="mt-4" onClick={() => navigate('/doctors')}>
                    Find Another Doctor
                  </Button>
                </div>
              ) : availableDates.length === 0 ? (
                <div className="py-10">
                  <Empty description="No available slots. This doctor has no open time slots right now." />
                </div>
              ) : (
                <>
                  {/* Step 1 — pick a date */}
                  <div className="mb-6">
                    <Title level={5}>Select Date</Title>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {availableDates.map((dateStr) => {
                        const d = dayjs(dateStr)
                        const active = selectedDate === dateStr
                        return (
                          <button
                            key={dateStr}
                            onClick={() => {
                              setSelectedDate(dateStr)
                              setSelectedSlot(null)
                            }}
                            className={`p-3 rounded-lg text-center transition-all border-2 ${
                              active
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                                : 'bg-gray-50 text-gray-700 border-transparent hover:bg-blue-50'
                            }`}
                          >
                            <div className="text-xs uppercase">{d.format('MMM')}</div>
                            <div className="text-xl font-bold">{d.format('D')}</div>
                            <div className="text-xs">{d.format('ddd')}</div>
                            <div className="text-[10px] mt-1 opacity-75">
                              {slotsByDate[dateStr].length} slot{slotsByDate[dateStr].length > 1 ? 's' : ''}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Step 2 — pick a slot */}
                  {selectedDate && (
                    <>
                      <Divider />
                      <div className="mb-6">
                        <Title level={5}>Select Time Slot</Title>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-72 overflow-y-auto">
                          {slotsByDate[selectedDate].map((slot) => {
                            const active = selectedSlot?._id === slot._id
                            return (
                              <button
                                key={slot._id}
                                onClick={() => setSelectedSlot(slot)}
                                className={`p-3 rounded-lg text-center transition-all border ${
                                  active
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                                    : 'bg-green-50 text-gray-700 border-green-200 hover:bg-green-100'
                                }`}
                              >
                                <div className="font-medium">{slot.startTime}</div>
                                <div className="text-xs opacity-75">→ {slot.endTime}</div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {selectedSlot && (
                    <>
                      <Divider />
                      <Button
                        type="primary"
                        size="large"
                        block
                        onClick={openConfirm}
                        icon={<CalendarOutlined />}
                      >
                        Continue to Confirm & Pay
                      </Button>
                    </>
                  )}
                </>
              )}
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <Card className="shadow-sm mb-4">
              <div className="text-center">
                <div className="text-5xl mb-3">👨‍⚕️</div>
                <Title level={4} className="mb-0">{doctorName}</Title>
                <Text type="secondary">{professional.qualifications?.join(', ') || 'General Physician'}</Text>
                <div className="mt-2">
                  <Badge
                    count={`${professional.stats?.rating || professional.averageRating || 0} ★`}
                    style={{ backgroundColor: '#52c41a' }}
                  />
                </div>
              </div>

              <Divider />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Text type="secondary">Experience</Text>
                  <Text strong>{professional.yearsOfExperience || 0} years</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Fee</Text>
                  <Text strong className="text-blue-600">₹{consultationFee}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Location</Text>
                  <Text strong>{doctor?.addresses?.[0]?.city || 'N/A'}</Text>
                </div>
              </div>
            </Card>

            <Card className="shadow-sm">
              <Title level={5}>Booking Info</Title>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <SafetyCertificateOutlined className="text-green-500" />
                  <Text>Secure Razorpay payment</Text>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-blue-500" />
                  <Text>Doctor confirms your booking</Text>
                </div>
                <div className="flex items-center gap-2">
                  <VideoCameraOutlined className="text-purple-500" />
                  <Text>Video link generated on confirmation</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Confirmation + payment modal */}
      <Modal
        title="Confirm Your Appointment"
        open={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        footer={null}
        width={520}
        centered
      >
        <Form layout="vertical">
          <Form.Item label="Reason for Visit">
            <TextArea
              rows={3}
              value={bookingDetails.reason}
              onChange={(e) => setBookingDetails({ ...bookingDetails, reason: e.target.value })}
              placeholder="Briefly describe your symptoms or reason for the consultation"
            />
          </Form.Item>

          <Form.Item label="Consultation Type">
            <Radio.Group
              value={bookingDetails.type}
              onChange={(e) => setBookingDetails({ ...bookingDetails, type: e.target.value })}
              buttonStyle="solid"
            >
              <Radio.Button value="VIDEO"><VideoCameraOutlined /> Video</Radio.Button>
              <Radio.Button value="IN_PERSON"><HomeOutlined /> In-Person</Radio.Button>
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
                <Text strong>{selectedSlot?.startTime} - {selectedSlot?.endTime}</Text>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 mt-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <Text type="secondary">Consultation Fee:</Text>
                  <Text strong>₹{consultationFee}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">GST (18%):</Text>
                  <Text strong>₹{taxAmount}</Text>
                </div>
                <Divider className="my-1" />
                <div className="flex justify-between">
                  <Text strong>Total Payable:</Text>
                  <Text strong className="text-blue-600 text-lg">₹{totalAmount}</Text>
                </div>
              </div>
            </div>
          </div>

          <Space className="w-full" direction="vertical">
            <Button
              type="primary"
              block
              size="large"
              icon={<CreditCardOutlined />}
              onClick={handleConfirmBooking}
              loading={submitting}
            >
              Book & Pay ₹{totalAmount}
            </Button>
            <Button block size="large" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  )
}

export default DoctorBooking
