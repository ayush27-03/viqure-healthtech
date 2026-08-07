// pages/Appointments.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
import { payViaRazorpay } from '../services/razorpay'
import {
  Card,
  Typography,
  Tabs,
  Table,
  Button,
  Space,
  Tag,
  Spin,
  Empty,
  Modal,
  message,
  Descriptions,
  Divider,
  Avatar
} from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  UserOutlined,
  ReloadOutlined,
  CreditCardOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { TabPane } = Tabs

function Appointments() {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)

  useEffect(() => {
    fetchAllAppointments()
  }, [])

  const fetchAllAppointments = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/appointments')
      const appointmentsData = response.data.data || []
      const active = appointmentsData.filter(
        (a) => a.appointmentStatus !== 'CANCELLED' && a.appointmentStatus !== 'REJECTED'
      )
      setAppointments(active)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const refreshAll = async () => {
    await fetchAllAppointments()
    message.success('Refreshed')
  }

  // ── date helpers (schedule.* are full ISO datetimes) ──
  const endOf = (a) =>
    new Date(a.schedule?.endDateTime || a.schedule?.startDateTime || a.schedule?.scheduledAt)

  const getFilteredItems = () => {
    const now = new Date()
    if (activeTab === 'upcoming') return appointments.filter((a) => endOf(a) >= now)
    if (activeTab === 'past') return appointments.filter((a) => endOf(a) < now)
    return []
  }

  const getUpcomingCount = () => appointments.filter((a) => endOf(a) >= new Date()).length
  const getPastCount = () => appointments.filter((a) => endOf(a) < new Date()).length

  const getPartyName = (record) => {
    const party = role === 'patient' ? record.doctorId : record.patientId
    if (party?.profile) {
      const name = `${party.profile.firstName || ''} ${party.profile.lastName || ''}`.trim()
      if (name) return role === 'patient' ? `Dr. ${name}` : name
    }
    return role === 'patient' ? 'Doctor' : 'Patient'
  }

  const getDoctorId = (record) => record.doctorId?._id || record.doctorId

  // ── formatting ──
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const isPaid = (record) => record.paymentDetails?.status === 'PAID'

  const statusMeta = (status) => {
    const map = {
      BOOKED: { color: 'blue', label: 'Booked' },
      CONFIRMED: { color: 'purple', label: 'Confirmed' },
      COMPLETED: { color: 'green', label: 'Completed' }
    }
    return map[status] || { color: 'default', label: status }
  }

  // ── actions ──
  const handleCancel = (appointmentId) => {
    const isDoctor = role === 'doctor'
    Modal.confirm({
      title: 'Cancel Appointment',
      content: 'Are you sure you want to cancel this appointment?',
      okText: 'Yes, Cancel',
      cancelText: 'No',
      okType: 'danger',
      onOk: async () => {
        setActionLoading(true)
        try {
          if (isDoctor) {
            await axiosInstance.patch(`/appointments/${appointmentId}/reject`, { reason: 'Cancelled by doctor' })
          } else {
            await axiosInstance.patch(`/appointments/${appointmentId}/cancel`, { cancelReason: 'Cancelled by patient' })
          }
          await fetchAllAppointments()
          closeDetailModal()
          message.success('Appointment cancelled')
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to cancel')
        } finally {
          setActionLoading(false)
        }
      }
    })
  }

  const handleConfirm = async (appointmentId) => {
    setActionLoading(true)
    try {
      await axiosInstance.patch(`/appointments/${appointmentId}/confirm`, {})
      await fetchAllAppointments()
      closeDetailModal()
      message.success('Appointment confirmed — video link generated')
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to confirm')
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async (appointmentId) => {
    setActionLoading(true)
    try {
      await axiosInstance.patch(`/appointments/${appointmentId}/complete`, {
        doctorRemarks: { text: 'Consultation completed', mode: 'Text' }
      })
      await fetchAllAppointments()
      closeDetailModal()
      message.success('Appointment marked complete')
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to complete')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePayNow = async (appointment) => {
    setActionLoading(true)
    await payViaRazorpay({
      context: 'APPOINTMENT',
      id: appointment._id,
      user,
      onSuccess: async () => {
        message.success('Payment successful!')
        await fetchAllAppointments()
      },
      onFailure: (err) => message.warning(err?.message || 'Payment was not completed')
    })
    setActionLoading(false)
  }

  const joinConsultation = (record) => {
    closeDetailModal()
    navigate(`/consultation/${record._id}`)
  }

  const canJoin = (record) =>
    record.appointmentStatus === 'CONFIRMED' &&
    record.meeting?.consultationType === 'VIDEO' &&
    !!record.meeting?.meetingLink

  const openDetailModal = (item) => {
    setSelectedItem(item)
    setDetailModalVisible(true)
  }

  const closeDetailModal = () => {
    setDetailModalVisible(false)
    setSelectedItem(null)
  }

  const columns = [
    {
      title: role === 'patient' ? 'Doctor' : 'Patient',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
          <div>
            <Text strong>{getPartyName(record)}</Text>
            <div className="text-xs text-gray-400">{role === 'patient' ? 'Doctor' : 'Patient'}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_, record) => (
        <div>
          <div><CalendarOutlined className="mr-1" /> {formatDate(record.schedule?.startDateTime || record.schedule?.scheduledAt)}</div>
          <div className="text-sm text-gray-500">
            <ClockCircleOutlined className="mr-1" />
            {formatTime(record.schedule?.startDateTime)} - {formatTime(record.schedule?.endDateTime)}
          </div>
        </div>
      )
    },
    {
      title: 'Type',
      key: 'type',
      render: (_, record) => (
        <Tag color={record.meeting?.consultationType === 'VIDEO' ? 'blue' : 'green'}>
          {record.meeting?.consultationType === 'VIDEO' ? '🎥 Video' : '🏥 In-Person'}
        </Tag>
      )
    },
    {
      title: 'Fee / Payment',
      key: 'fee',
      render: (_, record) => (
        <div>
          <Text strong className="text-blue-600">₹{record.financials?.totalAmount || record.financials?.consultationFee || 0}</Text>
          <div>
            <Tag color={isPaid(record) ? 'green' : 'orange'} className="mt-1">
              {isPaid(record) ? 'Paid' : 'Unpaid'}
            </Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const meta = statusMeta(record.appointmentStatus)
        return <Tag color={meta.color}>{meta.label}</Tag>
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        const upcoming = endOf(record) >= new Date()
        return (
          <Space wrap>
            <Button type="primary" size="small" icon={<EyeOutlined />} onClick={() => openDetailModal(record)}>
              View
            </Button>

            {/* Patient: pay for an unpaid booking */}
            {role === 'patient' && record.appointmentStatus === 'BOOKED' && !isPaid(record) && (
              <Button size="small" type="primary" ghost icon={<CreditCardOutlined />}
                onClick={() => handlePayNow(record)} loading={actionLoading}>
                Pay
              </Button>
            )}

            {/* Doctor: confirm a booking (generates the video room) */}
            {role === 'doctor' && record.appointmentStatus === 'BOOKED' && (
              <Button size="small" icon={<CheckCircleOutlined />}
                onClick={() => handleConfirm(record._id)} loading={actionLoading}>
                Confirm
              </Button>
            )}

            {/* Either party: join a confirmed video consult */}
            {canJoin(record) && (
              <Button size="small" className="bg-green-600 text-white border-0"
                icon={<VideoCameraOutlined />} onClick={() => joinConsultation(record)}>
                Join
              </Button>
            )}

            {['BOOKED', 'CONFIRMED'].includes(record.appointmentStatus) && upcoming && (
              <Button danger size="small" icon={<CloseCircleOutlined />}
                onClick={() => handleCancel(record._id)} loading={actionLoading}>
                Cancel
              </Button>
            )}
          </Space>
        )
      }
    }
  ]

  const filteredItems = getFilteredItems()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading appointments..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <Title level={2} className="mb-1">Appointments</Title>
            <Text type="secondary">View and manage your appointments</Text>
          </div>
          <Button type="primary" icon={<ReloadOutlined />} onClick={refreshAll}>Refresh</Button>
        </div>

        <Card className="shadow-lg rounded-2xl border-0">
          <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
            <TabPane tab={`Upcoming (${getUpcomingCount()})`} key="upcoming" />
            <TabPane tab={`Past (${getPastCount()})`} key="past" />
          </Tabs>

          <Table
            columns={columns}
            dataSource={filteredItems}
            rowKey="_id"
            scroll={{ x: 800 }}
            pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} items` }}
            locale={{
              emptyText: <Empty description={`No ${activeTab} appointments`} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            }}
          />
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal title="Appointment Details" open={detailModalVisible} onCancel={closeDetailModal} footer={null} width={600}>
        {selectedItem && (
          <div className="space-y-4">
            <Card size="small" className="bg-gray-50">
              <Title level={5} className="mb-2">{role === 'patient' ? 'Doctor' : 'Patient'} Information</Title>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Name">{getPartyName(selectedItem)}</Descriptions.Item>
                {role === 'patient' && (
                  <Descriptions.Item label="Profile">
                    <Button type="link" className="p-0"
                      onClick={() => { closeDetailModal(); navigate(`/doctor/${getDoctorId(selectedItem)}`) }}>
                      View Full Doctor Profile →
                    </Button>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <Card size="small" className="bg-gray-50">
              <Title level={5} className="mb-2">Appointment Details</Title>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Date">{formatDate(selectedItem.schedule?.startDateTime || selectedItem.schedule?.scheduledAt)}</Descriptions.Item>
                <Descriptions.Item label="Time">
                  {formatTime(selectedItem.schedule?.startDateTime)} - {formatTime(selectedItem.schedule?.endDateTime)}
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  {selectedItem.meeting?.consultationType === 'VIDEO' ? 'Video Consultation' : 'In-Person Visit'}
                </Descriptions.Item>
                <Descriptions.Item label="Fee">₹{selectedItem.financials?.totalAmount || selectedItem.financials?.consultationFee || 0}</Descriptions.Item>
                <Descriptions.Item label="Payment">
                  <Tag color={isPaid(selectedItem) ? 'green' : 'orange'}>
                    {isPaid(selectedItem) ? 'Paid' : 'Unpaid'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={statusMeta(selectedItem.appointmentStatus).color}>
                    {statusMeta(selectedItem.appointmentStatus).label}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {selectedItem.reason && (
              <Card size="small" className="bg-gray-50">
                <Title level={5} className="mb-2">Reason</Title>
                <Text>{selectedItem.reason}</Text>
              </Card>
            )}

            {/* Join video consultation */}
            {canJoin(selectedItem) && (
              <Button type="primary" size="large" block icon={<VideoCameraOutlined />}
                onClick={() => joinConsultation(selectedItem)}
                className="bg-green-600 hover:bg-green-700 border-0">
                Join Video Consultation
              </Button>
            )}

            <Divider />
            <div className="flex flex-wrap gap-3">
              <Button onClick={closeDetailModal} className="flex-1">Close</Button>

              {role === 'patient' && selectedItem.appointmentStatus === 'BOOKED' && !isPaid(selectedItem) && (
                <Button type="primary" icon={<CreditCardOutlined />} className="flex-1"
                  onClick={() => handlePayNow(selectedItem)} loading={actionLoading}>
                  Pay Now
                </Button>
              )}

              {role === 'doctor' && selectedItem.appointmentStatus === 'BOOKED' && (
                <Button type="primary" icon={<CheckCircleOutlined />} className="flex-1"
                  onClick={() => handleConfirm(selectedItem._id)} loading={actionLoading}>
                  Confirm
                </Button>
              )}

              {role === 'doctor' && selectedItem.appointmentStatus === 'CONFIRMED' && (
                <Button icon={<CheckCircleOutlined />} className="flex-1"
                  onClick={() => handleComplete(selectedItem._id)} loading={actionLoading}>
                  Mark Complete
                </Button>
              )}

              {['BOOKED', 'CONFIRMED'].includes(selectedItem.appointmentStatus) &&
                endOf(selectedItem) >= new Date() && (
                  <Button danger icon={<CloseCircleOutlined />} className="flex-1"
                    onClick={() => handleCancel(selectedItem._id)} loading={actionLoading}>
                    Cancel
                  </Button>
                )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Appointments
