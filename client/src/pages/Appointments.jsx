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
  Badge,
  Spin,
  Empty,
  Modal,
  Input,
  DatePicker,
  TimePicker,
  Select,
  message,
  Descriptions,
  Divider,
  Alert,
  Avatar,
  Tooltip,
  Statistic,
  Row,
  Col,
  Form
} from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  MessageOutlined,
  PhoneOutlined,
  DollarOutlined,
  UserOutlined,
  PlusOutlined,
  FilterOutlined,
  ReloadOutlined,
  FileTextOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { TabPane } = Tabs

function Appointments() {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('requests')
  const [requests, setRequests] = useState([])
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [pastAppointments, setPastAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedItemType, setSelectedItemType] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [changeRequestData, setChangeRequestData] = useState({
    suggestedStartTime: '',
    suggestedEndTime: '',
    suggestedDuration: '',
    suggestedReason: ''
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'requests') {
        await fetchRequests()
      } else if (activeTab === 'upcoming') {
        await fetchUpcomingAppointments()
      } else if (activeTab === 'past') {
        await fetchPastAppointments()
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRequests = async () => {
    try {
      let response
      if (role === 'patient') {
        response = await axiosInstance.get(`/appointment-requests/patient/${user?.roleId}`)
      } else {
        response = await axiosInstance.get(`/appointment-requests/doctor/${user?.roleId}`)
      }
      const activeRequests = response.data.filter(r => r.status !== 'CANCELLED')
      setRequests(activeRequests)
    } catch (error) {
      console.error('Error fetching requests:', error)
      setRequests([])
    }
  }

  const fetchUpcomingAppointments = async () => {
    try {
      let response
      if (role === 'patient') {
        response = await axiosInstance.get(`/appointments/patient/${user?.roleId}`)
      } else {
        response = await axiosInstance.get(`/appointments/doctor/${user?.roleId}`)
      }
      const now = new Date()
      const upcoming = response.data.filter(apt => 
        apt.appointmentStatus === 'CONFIRMED' && 
        new Date(apt.appointmentStartDateTime) > now
      )
      setUpcomingAppointments(upcoming)
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error)
      setUpcomingAppointments([])
    }
  }

  const fetchPastAppointments = async () => {
    try {
      let response
      if (role === 'patient') {
        response = await axiosInstance.get(`/appointments/patient/${user?.roleId}`)
      } else {
        response = await axiosInstance.get(`/appointments/doctor/${user?.roleId}`)
      }
      const now = new Date()
      const past = response.data.filter(apt => 
        new Date(apt.appointmentStartDateTime) < now ||
        apt.appointmentStatus === 'COMPLETED'
      )
      setPastAppointments(past)
    } catch (error) {
      console.error('Error fetching past appointments:', error)
      setPastAppointments([])
    }
  }

  const refreshAll = async () => {
    await fetchData()
    message.success('Refreshed successfully')
  }

  const handleApprove = async (requestId) => {
    setActionLoading(true)
    try {
      await axiosInstance.put(`/appointment-requests/${requestId}/approve`)
      await fetchData()
      setDetailModalVisible(false)
      setSelectedItem(null)
      message.success('Appointment approved successfully')
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to approve request')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelRequest = async (requestId) => {
    Modal.confirm({
      title: 'Cancel Request',
      content: 'Are you sure you want to cancel this request?',
      okText: 'Yes',
      cancelText: 'No',
      okType: 'danger',
      onOk: async () => {
        setActionLoading(true)
        try {
          await axiosInstance.put(`/appointment-requests/${requestId}/cancel`, {
            reason: `Cancelled by ${role}`,
            cancelledBy: role === 'doctor' ? 'DOCTOR' : 'PATIENT'
          })
          await fetchData()
          setDetailModalVisible(false)
          setSelectedItem(null)
          message.success('Request cancelled successfully')
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to cancel request')
        } finally {
          setActionLoading(false)
        }
      }
    })
  }

  const handleRequestChange = async (requestId) => {
    if (!changeRequestData.suggestedStartTime || !changeRequestData.suggestedEndTime) {
      message.warning('Please fill in suggested time')
      return
    }
    setActionLoading(true)
    try {
      await axiosInstance.put(`/appointment-requests/${requestId}/request-change`, {
        suggestedStartTime: changeRequestData.suggestedStartTime,
        suggestedEndTime: changeRequestData.suggestedEndTime,
        suggestedDuration: changeRequestData.suggestedDuration,
        suggestedReason: changeRequestData.suggestedReason
      })
      setShowChangeRequestModal(false)
      setDetailModalVisible(false)
      setSelectedItem(null)
      setChangeRequestData({
        suggestedStartTime: '',
        suggestedEndTime: '',
        suggestedDuration: '',
        suggestedReason: ''
      })
      await fetchData()
      message.success('Change request submitted successfully')
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to request change')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePatientResponse = async (requestId, response) => {
    setActionLoading(true)
    try {
      await axiosInstance.put(`/appointment-requests/${requestId}/patient-response`, {
        response: response
      })
      await fetchData()
      setDetailModalVisible(false)
      setSelectedItem(null)
      message.success(`Request ${response.toLowerCase()}ed successfully`)
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to respond to request')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    Modal.confirm({
      title: 'Cancel Appointment',
      content: 'Are you sure you want to cancel this appointment?',
      okText: 'Yes',
      cancelText: 'No',
      okType: 'danger',
      onOk: async () => {
        setActionLoading(true)
        try {
          await axiosInstance.put(`/appointments/${appointmentId}/cancel`, {
            reason: `Cancelled by ${role}`,
            cancelledBy: role === 'doctor' ? 'DOCTOR' : 'PATIENT'
          })
          await fetchData()
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

  const openDetailModal = (item, type) => {
    setSelectedItem(item)
    setSelectedItemType(type)
    setDetailModalVisible(true)
  }

  const closeDetailModal = () => {
    setDetailModalVisible(false)
    setSelectedItem(null)
    setSelectedItemType(null)
  }

  const formatDate = (dateTimeStr) => {
    const date = new Date(dateTimeStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusConfig = (status) => {
    const configs = {
      'PENDING': { color: 'gold', icon: <ClockCircleOutlined />, label: 'Pending' },
      'CHANGE_REQUESTED': { color: 'orange', icon: <ExclamationCircleOutlined />, label: 'Change Requested' },
      'CONFIRMED': { color: 'green', icon: <CheckCircleOutlined />, label: 'Confirmed' },
      'COMPLETED': { color: 'blue', icon: <CheckCircleOutlined />, label: 'Completed' },
      'CANCELLED': { color: 'red', icon: <CloseCircleOutlined />, label: 'Cancelled' }
    }
    return configs[status] || { color: 'default', icon: <FileTextOutlined />, label: status }
  }

  const getFilteredItems = () => {
    let items = []
    if (activeTab === 'requests') {
      items = [...requests]
    } else if (activeTab === 'upcoming') {
      items = [...upcomingAppointments]
    } else {
      items = [...pastAppointments]
    }

    if (filterStatus === 'pending' && activeTab === 'requests') {
      items = items.filter(i => i.status === 'PENDING')
    } else if (filterStatus === 'change_requested' && activeTab === 'requests') {
      items = items.filter(i => i.status === 'CHANGE_REQUESTED')
    } else if (filterStatus === 'confirmed') {
      items = items.filter(i => i.appointmentStatus === 'CONFIRMED')
    } else if (filterStatus === 'completed') {
      items = items.filter(i => i.appointmentStatus === 'COMPLETED')
    }

    return items
  }

  const columns = [
    {
      title: 'Patient/Doctor',
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
          <div><CalendarOutlined className="mr-1" /> {formatDate(record.appointmentStartDateTime || `${record.date}T${record.startTime}`)}</div>
          <div className="text-sm text-gray-500">
            <ClockCircleOutlined className="mr-1" /> {formatTime(record.appointmentStartDateTime || `${record.date}T${record.startTime}`)} - {formatTime(record.appointmentEndDateTime || `${record.date}T${record.endTime}`)}
          </div>
        </div>
      )
    },
    {
      title: 'Type',
      key: 'type',
      render: (_, record) => (
        <Tag color={record.consultationType === 'VIDEO' || record.type === 'VIDEO' ? 'blue' : 'green'}>
          {record.consultationType === 'VIDEO' || record.type === 'VIDEO' ? '🎥 Video' : '🏥 In-Clinic'}
        </Tag>
      )
    },
    {
      title: 'Fee',
      key: 'fee',
      render: (_, record) => (
        <Text strong className="text-blue-600">₹{record.consultationFees || 0}</Text>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const status = record.status || record.appointmentStatus
        const config = getStatusConfig(status)
        return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => openDetailModal(record, activeTab === 'requests' ? 'request' : 'appointment')}
        >
          View
        </Button>
      )
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
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <Title level={2} className="mb-1">Appointments</Title>
            <Text type="secondary">Manage your appointments and requests</Text>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={refreshAll}
            >
              Refresh
            </Button>
          </Space>
        </div>

        <Card className="shadow-lg rounded-2xl border-0">
          {/* Tabs */}
          <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
            <TabPane tab={`Requests (${requests.length})`} key="requests" />
            <TabPane tab={`Upcoming (${upcomingAppointments.length})`} key="upcoming" />
            <TabPane tab={`Past (${pastAppointments.length})`} key="past" />
          </Tabs>

          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <Text strong><FilterOutlined /> Filter:</Text>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-40"
              size="middle"
            >
              <Option value="all">All</Option>
              {activeTab === 'requests' && (
                <>
                  <Option value="pending">Pending</Option>
                  <Option value="change_requested">Change Requested</Option>
                </>
              )}
              {activeTab !== 'requests' && (
                <>
                  <Option value="confirmed">Confirmed</Option>
                  <Option value="completed">Completed</Option>
                </>
              )}
            </Select>
            {filterStatus !== 'all' && (
              <Tag closable onClose={() => setFilterStatus('all')} color="blue">
                {filterStatus.replace('_', ' ').toUpperCase()}
              </Tag>
            )}
          </div>

          {/* Table */}
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
                  description={`No ${activeTab} found`}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )
            }}
          />
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <Title level={4} className="mb-0">
              {selectedItemType === 'request' ? 'Request Details' : 'Appointment Details'}
            </Title>
            {selectedItem && (
              <Tag color={getStatusConfig(selectedItem.status || selectedItem.appointmentStatus).color}>
                {getStatusConfig(selectedItem.status || selectedItem.appointmentStatus).label}
              </Tag>
            )}
          </Space>
        }
        open={detailModalVisible}
        onCancel={closeDetailModal}
        footer={null}
        width={600}
        className="appointment-detail-modal"
      >
        {selectedItem && (
          <div className="space-y-4">
            {/* Doctor/Patient Info */}
            <Card size="small" className="bg-gray-50">
              <Title level={5} className="mb-2">
                {role === 'patient' ? 'Doctor Information' : 'Patient Information'}
              </Title>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Name">
                  {role === 'patient' ? (selectedItem.doctorName || 'Doctor') : (selectedItem.patientName || 'Patient')}
                </Descriptions.Item>
                {role === 'doctor' && selectedItem.patientPhone && (
                  <Descriptions.Item label="Phone">{selectedItem.patientPhone}</Descriptions.Item>
                )}
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

            {/* Appointment Details */}
            <Card size="small" className="bg-gray-50">
              <Title level={5} className="mb-2">Appointment Details</Title>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Date & Time">
                  {formatDate(selectedItem.appointmentStartDateTime || `${selectedItem.date}T${selectedItem.startTime}`)} at {formatTime(selectedItem.appointmentStartDateTime || `${selectedItem.date}T${selectedItem.startTime}`)}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {selectedItem.duration || Math.round((new Date(selectedItem.appointmentEndDateTime) - new Date(selectedItem.appointmentStartDateTime)) / 60000)} minutes
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  {selectedItem.consultationType === 'VIDEO' || selectedItem.type === 'VIDEO' ? 'Video Consultation' : 'In-Clinic Visit'}
                </Descriptions.Item>
                <Descriptions.Item label="Fee">₹{selectedItem.consultationFees || 0}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Reason & Symptoms */}
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

            {/* Suggested Changes */}
            {selectedItemType === 'request' && selectedItem.status === 'CHANGE_REQUESTED' && selectedItem.suggestedStartTime && (
              <Alert
                message="Doctor Suggested Changes"
                description={
                  <div>
                    <Text strong>Suggested Time:</Text> {selectedItem.suggestedStartTime} - {selectedItem.suggestedEndTime}
                    <br />
                    <Text strong>Duration:</Text> {selectedItem.suggestedDuration} minutes
                    {selectedItem.suggestedReason && (
                      <>
                        <br />
                        <Text strong>Reason:</Text> {selectedItem.suggestedReason}
                      </>
                    )}
                  </div>
                }
                type="warning"
                showIcon
              />
            )}

            {/* Time Clash Note */}
            {selectedItem.timeClashNote && (
              <Alert message={selectedItem.timeClashNote} type="error" showIcon />
            )}

            {/* Join Meeting Button */}
            {selectedItem.consultationType === 'VIDEO' && 
             selectedItem.appointmentStatus === 'CONFIRMED' &&
             new Date(selectedItem.appointmentStartDateTime) <= new Date() &&
             new Date(selectedItem.appointmentEndDateTime) >= new Date() && (
              <Button
                type="primary"
                size="large"
                block
                icon={<VideoCameraOutlined />}
                href={selectedItem.meetingLink || `https://meet.viqure.com/${selectedItem._id}`}
                target="_blank"
                className="bg-green-600 hover:bg-green-700 border-0"
              >
                Join Meeting
              </Button>
            )}

            {/* Action Buttons */}
            <Divider />
            <div className="flex gap-3 flex-wrap">
              {/* Doctor actions for PENDING requests */}
              {selectedItemType === 'request' && role === 'doctor' && selectedItem.status === 'PENDING' && (
                <>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleApprove(selectedItem._id)}
                    loading={actionLoading}
                    className="flex-1"
                  >
                    Approve
                  </Button>
                  <Button
                    type="default"
                    icon={<ExclamationCircleOutlined />}
                    onClick={() => {
                      closeDetailModal()
                      setShowChangeRequestModal(true)
                    }}
                    className="flex-1"
                  >
                    Request Change
                  </Button>
                </>
              )}

              {/* Patient actions for CHANGE_REQUESTED requests */}
              {selectedItemType === 'request' && role === 'patient' && selectedItem.status === 'CHANGE_REQUESTED' && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handlePatientResponse(selectedItem._id, 'ACCEPT')}
                  loading={actionLoading}
                  block
                >
                  Accept Changes
                </Button>
              )}

              {/* Cancel button for ALL requests */}
              {selectedItemType === 'request' && selectedItem.status !== 'CONFIRMED' && (
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleCancelRequest(selectedItem._id)}
                  loading={actionLoading}
                  block
                >
                  Cancel Request
                </Button>
              )}

              {/* Cancel button for CONFIRMED appointments */}
              {selectedItemType === 'appointment' && selectedItem.appointmentStatus === 'CONFIRMED' && (
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleCancelAppointment(selectedItem._id)}
                  loading={actionLoading}
                  block
                >
                  Cancel Appointment
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Change Request Modal */}
      <Modal
        title="Request Time Change"
        open={showChangeRequestModal}
        onCancel={() => {
          setShowChangeRequestModal(false)
          setChangeRequestData({
            suggestedStartTime: '',
            suggestedEndTime: '',
            suggestedDuration: '',
            suggestedReason: ''
          })
        }}
        footer={null}
        width={500}
      >
        <Form layout="vertical">
          <Form.Item label="Original Time">
            <Text>{selectedItem?.startTime} - {selectedItem?.endTime}</Text>
          </Form.Item>

          <Form.Item label="Suggested Start Time" required>
            <Input
              type="time"
              value={changeRequestData.suggestedStartTime}
              onChange={(e) => {
                const start = e.target.value
                setChangeRequestData({
                  ...changeRequestData,
                  suggestedStartTime: start,
                  suggestedEndTime: changeRequestData.suggestedDuration ? 
                    getEndTimeFromDuration(start, changeRequestData.suggestedDuration) : ''
                })
              }}
              className="rounded-xl"
            />
          </Form.Item>

          <Form.Item label="Suggested Duration (minutes)">
            <Input
              type="number"
              min="10"
              max="180"
              step="10"
              value={changeRequestData.suggestedDuration}
              onChange={(e) => {
                const duration = e.target.value
                setChangeRequestData({
                  ...changeRequestData,
                  suggestedDuration: duration,
                  suggestedEndTime: changeRequestData.suggestedStartTime ? 
                    getEndTimeFromDuration(changeRequestData.suggestedStartTime, duration) : ''
                })
              }}
              className="rounded-xl"
            />
          </Form.Item>

          <Form.Item label="Reason for Change">
            <Input.TextArea
              value={changeRequestData.suggestedReason}
              onChange={(e) => setChangeRequestData({...changeRequestData, suggestedReason: e.target.value})}
              rows={3}
              placeholder="Explain why you want to reschedule..."
              className="rounded-xl"
            />
          </Form.Item>

          <div className="flex gap-3 pt-4">
            <Button
              type="primary"
              onClick={() => handleRequestChange(selectedItem?._id)}
              loading={actionLoading}
              className="flex-1"
            >
              Submit Change Request
            </Button>
            <Button
              onClick={() => {
                setShowChangeRequestModal(false)
                setChangeRequestData({
                  suggestedStartTime: '',
                  suggestedEndTime: '',
                  suggestedDuration: '',
                  suggestedReason: ''
                })
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

function getEndTimeFromDuration(startTime, duration) {
  if (!startTime || !duration) return ''
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + parseInt(duration)
  const endHours = Math.floor(totalMinutes / 60)
  const endMinutes = totalMinutes % 60
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
}

export default Appointments