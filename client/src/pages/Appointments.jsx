// pages/Appointments.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
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
  Alert,
  Avatar
} from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  DollarOutlined,
  UserOutlined,
  ReloadOutlined
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
      const response = await axiosInstance.get(`/appointments`)
      const appointmentsData = response.data.data || []
      
      // Filter out canceled and rejected appointments
      const activeAppointments = appointmentsData.filter(a => 
        a.appointmentStatus !== 'CANCELLED' && 
        a.appointmentStatus !== 'REJECTED'
      )
      setAppointments(activeAppointments)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const refreshAll = async () => {
    await fetchAllAppointments()
    message.success('Refreshed successfully')
  }

  const getFilteredItems = () => {
    const now = new Date()
    
    if (activeTab === 'upcoming') {
      return appointments.filter(a => {
        const aptDateTime = new Date(`${a.schedule.scheduledAt}T${a.schedule.endDateTime}:00`)
        return aptDateTime > now
      })
    } else if (activeTab === 'past') {
      return appointments.filter(a => {
        const aptDateTime = new Date(`${a.schedule.scheduledAt}T${a.schedule.endDateTime}:00`)
        return aptDateTime < now
      })
    }
    return []
  }

  const handleCancel = async (appointmentId) => {
    const isDoctor = role === 'doctor'
    Modal.confirm({
      title: isDoctor ? 'Cancel Appointment' : 'Cancel Appointment',
      content: isDoctor 
        ? 'Are you sure you want to cancel this appointment?'
        : 'Are you sure you want to cancel your appointment?',
      okText: 'Yes, Cancel',
      cancelText: 'No',
      okType: 'danger',
      onOk: async () => {
        setActionLoading(true)
        try {
          if (isDoctor) {
            await axiosInstance.patch(`/appointments/${appointmentId}/reject`, {
              reason: 'Cancelled by doctor'
            })
          } else {
            await axiosInstance.patch(`/appointments/${appointmentId}/cancel`, {
              reason: 'Cancelled by patient'
            })
          }
          await fetchAllAppointments()
          setDetailModalVisible(false)
          setSelectedItem(null)
          message.success('Appointment cancelled successfully')
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to cancel appointment')
        } finally {
          setActionLoading(false)
        }
      }
    })
  }

  const openDetailModal = (item) => {
    setSelectedItem(item)
    setDetailModalVisible(true)
  }

  const closeDetailModal = () => {
    setDetailModalVisible(false)
    setSelectedItem(null)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A'
    const [hours, minutes] = timeStr.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusColor = (status) => {
    const colors = {
      BOOKED: 'blue',
      COMPLETED: 'green'
    }
    return colors[status] || 'default'
  }

  const getStatusLabel = (status) => {
    const labels = {
      BOOKED: 'Upcoming',
      COMPLETED: 'Completed'
    }
    return labels[status] || status
  }

  const columns = [
    {
      title: role === 'patient' ? 'Doctor' : 'Patient',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
          <div>
            <Text strong>
              {role === 'patient' 
                ? record.doctorName || 'Doctor'
                : record.patientName || 'Patient'}
            </Text>
            <div className="text-xs text-gray-400">
              {role === 'patient' ? 'Doctor' : 'Patient'}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_, record) => (
        <div>
          <div><CalendarOutlined className="mr-1" /> {formatDate(record.schedule.scheduledAt)}</div>
          <div className="text-sm text-gray-500">
            <ClockCircleOutlined className="mr-1" /> {formatTime(record.schedule.startDateTime)} - {formatTime(record.schedule.endDateTime)}
          </div>
        </div>
      )
    },
    {
      title: 'Type',
      key: 'type',
      render: (_, record) => (
        <Tag color={record.meeting?.consultationType === 'VIDEO' ? 'blue' : 'green'}>
          {record.meeting?.consultationType === 'VIDEO' ? '🎥 Video' : '🏥 In-Clinic'}
        </Tag>
      )
    },
    {
      title: 'Fee',
      key: 'fee',
      render: (_, record) => (
        <Text strong className="text-blue-600">₹{record.financials?.consultationFee || 0}</Text>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        const isUpcoming = new Date(`${record.schedule.scheduledAt}T${record.schedule.endDateTime}:00`) > new Date()
        const isActive = record.appointmentStatus === 'BOOKED' && isUpcoming
        
        return (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => openDetailModal(record)}
            >
              View
            </Button>
            
            {isActive && (
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleCancel(record._id)}
                loading={actionLoading}
              >
                Cancel
              </Button>
            )}
          </Space>
        )
      }
    }
  ]

  const filteredItems = getFilteredItems()

  const getUpcomingCount = () => {
    const now = new Date()
    return appointments.filter(a => {
      const aptDateTime = new Date(`${a.schedule.scheduledAt}T${a.schedule.endDateTime}:00`)
      return aptDateTime > now
    }).length
  }

  const getPastCount = () => {
    const now = new Date()
    return appointments.filter(a => {
      const aptDateTime = new Date(`${a.schedule.scheduledAt}T${a.schedule.endDateTime}:00`)
      return aptDateTime < now
    }).length
  }

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
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={refreshAll}
          >
            Refresh
          </Button>
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
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} items`
            }}
            locale={{
              emptyText: (
                <Empty
                  description={`No ${activeTab} appointments`}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )
            }}
          />
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal
        title="Appointment Details"
        open={detailModalVisible}
        onCancel={closeDetailModal}
        footer={null}
        width={600}
      >
        {selectedItem && (
          <div className="space-y-4">
            <Card size="small" className="bg-gray-50">
              <Title level={5} className="mb-2">
                {role === 'patient' ? 'Doctor Information' : 'Patient Information'}
              </Title>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Name">
                  {role === 'patient' ? (selectedItem.doctorName || 'Doctor') : (selectedItem.patientName || 'Patient')}
                </Descriptions.Item>
                {role === 'patient' && (
                  <Descriptions.Item label="View Profile">
                    <Button
                      type="link"
                      onClick={() => {
                        closeDetailModal()
                        navigate(`/doctor/${selectedItem.doctorId}`)
                      }}
                      className="p-0"
                    >
                      View Full Doctor Profile →
                    </Button>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <Card size="small" className="bg-gray-50">
              <Title level={5} className="mb-2">Appointment Details</Title>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Date">
                  {formatDate(selectedItem.schedule.scheduledAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Time">
                  {formatTime(selectedItem.schedule.startDateTime)} - {formatTime(selectedItem.schedule.endDateTime)}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {selectedItem.duration || 
                    Math.round((new Date(`${selectedItem.schedule.scheduledAt}T${selectedItem.schedule.endDateTime}`) - 
                      new Date(`${selectedItem.schedule.scheduledAt}T${selectedItem.schedule.startDateTime}`)) / 60000)} minutes
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  {selectedItem.meeting?.consultationType === 'VIDEO' ? 'Video Consultation' : 'In-Clinic Visit'}
                </Descriptions.Item>
                <Descriptions.Item label="Fee">₹{selectedItem.financials?.consultationFee || 0}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(selectedItem.appointmentStatus)}>
                    {getStatusLabel(selectedItem.appointmentStatus)}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {(selectedItem.reason || selectedItem.symptoms) && (
              <Card size="small" className="bg-gray-50">
                <Title level={5} className="mb-2">Visit Details</Title>
                <Descriptions column={1} size="small">
                  {selectedItem.reason && (
                    <Descriptions.Item label="Reason">{selectedItem.reason}</Descriptions.Item>
                  )}
                  {selectedItem.symptoms && (
                    <Descriptions.Item label="Symptoms">{selectedItem.symptoms}</Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {selectedItem.meeting?.consultationType === 'VIDEO' && 
             selectedItem.appointmentStatus === 'BOOKED' &&
             new Date(`${selectedItem.schedule.scheduledAt}T${selectedItem.schedule.startDateTime}`) <= new Date() &&
             new Date(`${selectedItem.schedule.scheduledAt}T${selectedItem.schedule.endDateTime}`) >= new Date() && (
              <Button
                type="primary"
                size="large"
                block
                icon={<VideoCameraOutlined />}
                href={selectedItem.meeting?.meetingLink || `https://meet.viqure.com/${selectedItem._id}`}
                target="_blank"
                className="bg-green-600 hover:bg-green-700 border-0"
              >
                Join Meeting
              </Button>
            )}

            <Divider />
            <div className="flex gap-3">
              <Button onClick={closeDetailModal} className="flex-1">
                Close
              </Button>
              {selectedItem.appointmentStatus === 'BOOKED' && 
               new Date(`${selectedItem.schedule.scheduledAt}T${selectedItem.schedule.endDateTime}:00`) > new Date() && (
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleCancel(selectedItem._id)}
                  loading={actionLoading}
                  className="flex-1"
                >
                  Cancel Appointment
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