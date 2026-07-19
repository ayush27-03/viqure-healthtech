// pages/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  Typography, 
  Space, 
  Tag, 
  Spin, 
  Empty,
  Avatar,
  Tooltip,
  Segmented,
  Badge,
  Dropdown
} from 'antd'
import { 
  CalendarOutlined, 
  UserOutlined, 
  DollarOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  MessageOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ReloadOutlined,
  EllipsisOutlined,
  StarOutlined,
  StarFilled
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Title, Text } = Typography

function DoctorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [viewMode, setViewMode] = useState('day')
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    totalEarnings: 0,
    todayAppointments: 0
  })

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/appointments')
      const data = response.data.data || response.data || []
      setAppointments(data)
      calculateStats(data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    const today = dayjs().format('YYYY-MM-DD')
    const statsData = {
      totalAppointments: data.length,
      completedAppointments: data.filter(a => a.appointmentStatus === 'COMPLETED').length,
      pendingAppointments: data.filter(a => a.appointmentStatus === 'BOOKED').length,
      totalEarnings: data
        .filter(a => a.appointmentStatus === 'COMPLETED')
        .reduce((sum, a) => sum + (a.financials?.consultationFee || 0), 0),
      todayAppointments: data.filter(a => a.schedule?.scheduledAt === today).length
    }
    setStats(statsData)
  }

  const getFilteredAppointments = () => {
    const dateStr = selectedDate.format('YYYY-MM-DD')
    
    if (viewMode === 'day') {
      return appointments.filter(a => a.schedule?.scheduledAt === dateStr)
    } else if (viewMode === 'week') {
      const startOfWeek = selectedDate.startOf('week')
      const endOfWeek = selectedDate.endOf('week')
      return appointments.filter(a => {
        const aptDate = dayjs(a.schedule?.scheduledAt)
        return aptDate.isAfter(startOfWeek) && aptDate.isBefore(endOfWeek)
      })
    } else {
      const startOfMonth = selectedDate.startOf('month')
      const endOfMonth = selectedDate.endOf('month')
      return appointments.filter(a => {
        const aptDate = dayjs(a.schedule?.scheduledAt)
        return aptDate.isAfter(startOfMonth) && aptDate.isBefore(endOfMonth)
      })
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      'BOOKED': { color: '#1890ff', bg: '#e6f7ff', label: 'Upcoming', icon: <ClockCircleOutlined /> },
      'COMPLETED': { color: '#52c41a', bg: '#f6ffed', label: 'Completed', icon: <CheckCircleOutlined /> },
      'CANCELLED': { color: '#ff4d4f', bg: '#fff1f0', label: 'Cancelled', icon: <CloseCircleOutlined /> },
      'REJECTED': { color: '#ff4d4f', bg: '#fff1f0', label: 'Rejected', icon: <CloseCircleOutlined /> }
    }
    return configs[status] || { color: '#8c8c8c', bg: '#f5f5f5', label: status, icon: <FileTextOutlined /> }
  }

  const getConsultationIcon = (type) => {
    switch (type) {
      case 'VIDEO': return <VideoCameraOutlined />
      case 'CLINIC': return <HomeOutlined />
      case 'CHAT': return <MessageOutlined />
      default: return <VideoCameraOutlined />
    }
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${minutes} ${ampm}`
  }

  const filteredAppointments = getFilteredAppointments()
  const isToday = selectedDate.isSame(dayjs(), 'day')

  const sortedAppointments = [...filteredAppointments].sort((a, b) => 
    (a.schedule?.startDateTime || '').localeCompare(b.schedule?.startDateTime || '')
  )

  const navigateDay = (direction) => {
    setSelectedDate(selectedDate.add(direction, 'day'))
  }

  const goToToday = () => {
    setSelectedDate(dayjs())
  }

  // Get hours from 6 AM to 10 PM (16 hours)
  const getHours = () => {
    const hours = []
    for (let i = 6; i <= 22; i++) {
      hours.push(i)
    }
    return hours
  }

  const hours = getHours()

  // Get current time indicator position
  const getCurrentTimePosition = () => {
    const now = dayjs()
    const hour = now.hour()
    const minute = now.minute()
    if (hour < 6 || hour > 22) return null
    const totalMinutes = (hour - 6) * 60 + minute
    return (totalMinutes / (16 * 60)) * 100
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading appointments..." />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Welcome Section */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Title level={2} className="mb-1">
            Welcome back, Dr. {user?.profile?.firstName || user?.profile?.name || 'Doctor'} 👋
          </Title>
          <Text type="secondary">
            Here's what's happening with your practice today
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchAppointments}>
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Today's Appointments"
              value={stats.todayAppointments}
              prefix={<CalendarOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Total Appointments"
              value={stats.totalAppointments}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Pending"
              value={stats.pendingAppointments}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Total Earnings"
              value={stats.totalEarnings}
              prefix="₹"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/appointments')}>
            <div className="flex items-center justify-between">
              <div>
                <Text type="secondary">View All</Text>
                <div><Text strong>Appointments</Text></div>
              </div>
              <CalendarOutlined className="text-2xl text-blue-500" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/doctor/settings')}>
            <div className="flex items-center justify-between">
              <div>
                <Text type="secondary">Manage</Text>
                <div><Text strong>Availability</Text></div>
              </div>
              <SettingOutlined className="text-2xl text-green-500" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/doctor/earnings')}>
            <div className="flex items-center justify-between">
              <div>
                <Text type="secondary">Track</Text>
                <div><Text strong>Earnings</Text></div>
              </div>
              <DollarOutlined className="text-2xl text-purple-500" />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Timeline View */}
      <Card className="shadow-sm">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Title level={4} className="mb-0">
              <CalendarOutlined className="mr-2" />
              Schedule
            </Title>
            <Segmented
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: 'day', label: 'Day' },
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' }
              ]}
              size="small"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button icon={<LeftOutlined />} onClick={() => navigateDay(-1)} size="small" />
            <Button onClick={goToToday} size="small">
              {isToday ? 'Today' : 'Go to Today'}
            </Button>
            <Button icon={<RightOutlined />} onClick={() => navigateDay(1)} size="small" />
          </div>
        </div>

        {/* Date Header */}
        <div className="text-center mb-4">
          <Text strong className="text-lg">
            {selectedDate.format('dddd, MMMM D, YYYY')}
          </Text>
          {isToday && <Tag color="blue" className="ml-2">Today</Tag>}
          <div className="text-sm text-gray-400 mt-1">
            {sortedAppointments.length} appointment{sortedAppointments.length !== 1 ? 's' : ''}
          </div>
        </div>

        {sortedAppointments.length === 0 ? (
          <Empty 
            description="No appointments on this day"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div className="relative overflow-x-auto pb-4">
            <div className="min-w-[1100px]">
              {/* Time Labels */}
              <div className="flex mb-2">
                <div className="w-24 flex-shrink-0"></div>
                <div className="flex-1 flex">
                  {hours.map((hour) => (
                    <div key={hour} className="flex-1 text-center text-xs text-gray-400 font-medium">
                      {hour % 12 === 0 ? 12 : hour % 12}:00
                      <span className="text-[10px] text-gray-300 ml-0.5">{hour >= 12 ? 'PM' : 'AM'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Track */}
              <div className="relative h-52 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                {/* Hour Grid Lines */}
                {hours.map((hour, index) => (
                  <div 
                    key={index}
                    className="absolute top-0 bottom-0 border-r border-gray-200"
                    style={{ left: `${(index / hours.length) * 100}%` }}
                  />
                ))}

                {/* Half-hour markers */}
                {hours.map((hour, index) => {
                  if (index < hours.length - 1) {
                    return (
                      <div 
                        key={`half-${index}`}
                        className="absolute top-0 bottom-0 border-r border-gray-100"
                        style={{ left: `${((index + 0.5) / hours.length) * 100}%` }}
                      />
                    )
                  }
                  return null
                })}

                {/* Current Time Indicator */}
                {isToday && getCurrentTimePosition() !== null && (
                  <div 
                    className="absolute top-0 bottom-0 z-20"
                    style={{ left: `${getCurrentTimePosition()}%` }}
                  >
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="absolute top-0 bottom-0 w-0.5 bg-red-500"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-[10px] text-red-500 font-medium whitespace-nowrap">
                      {dayjs().format('h:mm A')}
                    </div>
                  </div>
                )}

                {/* Appointment Blocks */}
                {viewMode === 'day' && sortedAppointments.map((apt) => {
                  const startMinutes = parseInt(apt.schedule.startDateTime.split(':')[0]) * 60 + parseInt(apt.schedule.startDateTime.split(':')[1])
                  const endMinutes = parseInt(apt.schedule.endDateTime.split(':')[0]) * 60 + parseInt(apt.schedule.endDateTime.split(':')[1])
                  const durationMinutes = endMinutes - startMinutes
                  
                  const totalMinutes = 16 * 60
                  const startPercent = ((startMinutes - 6 * 60) / totalMinutes) * 100
                  const widthPercent = (durationMinutes / totalMinutes) * 100
                  
                  const statusConfig = getStatusConfig(apt.appointmentStatus)
                  
                  return (
                    <div
                      key={apt._id}
                      className="absolute top-1 bottom-1 rounded-lg shadow-sm transition-all hover:shadow-md cursor-pointer group"
                      style={{
                        left: `${Math.max(startPercent, 0)}%`,
                        width: `${Math.min(widthPercent, 100)}%`,
                        backgroundColor: statusConfig.bg,
                        border: `2px solid ${statusConfig.color}`,
                        minWidth: '50px'
                      }}
                      onClick={() => navigate(`/appointments?highlight=${apt._id}`)}
                    >
                      <div className="h-full flex flex-col justify-center px-3 py-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <Avatar 
                            size={28} 
                            icon={<UserOutlined />} 
                            className="bg-blue-100 text-blue-600 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Text strong className="text-sm truncate">
                                {apt.patientName || 'Patient'}
                              </Text>
                              <Tag 
                                color={statusConfig.color === '#1890ff' ? 'blue' : statusConfig.color === '#52c41a' ? 'green' : 'red'}
                                className="text-[10px] m-0 flex-shrink-0"
                              >
                                {statusConfig.label}
                              </Tag>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                {getConsultationIcon(apt.meeting?.consultationType)}
                                <span>{apt.meeting?.consultationType || 'Video'}</span>
                              </span>
                              <span>{formatTime(apt.schedule.startDateTime)} - {formatTime(apt.schedule.endDateTime)}</span>
                              <span className="font-medium text-blue-600">₹{apt.financials?.consultationFee || 0}</span>
                            </div>
                          </div>
                        </div>
                        {apt.appointmentStatus === 'BOOKED' && apt.meeting?.consultationType === 'VIDEO' && (
                          <Button 
                            type="primary" 
                            size="small" 
                            icon={<VideoCameraOutlined />}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 border-0 shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(apt.meeting?.meetingLink || `https://meet.viqure.com/${apt._id}`, '_blank')
                            }}
                          >
                            Join
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Week/Month View - Compact Timeline */}
                {(viewMode === 'week' || viewMode === 'month') && sortedAppointments.map((apt) => {
                  const startMinutes = parseInt(apt.schedule.startDateTime.split(':')[0]) * 60 + parseInt(apt.schedule.startDateTime.split(':')[1])
                  const endMinutes = parseInt(apt.schedule.endDateTime.split(':')[0]) * 60 + parseInt(apt.schedule.endDateTime.split(':')[1])
                  const durationMinutes = endMinutes - startMinutes
                  
                  const totalMinutes = 16 * 60
                  const startPercent = ((startMinutes - 6 * 60) / totalMinutes) * 100
                  const widthPercent = (durationMinutes / totalMinutes) * 100
                  
                  const statusConfig = getStatusConfig(apt.appointmentStatus)
                  const dateDisplay = dayjs(apt.schedule.scheduledAt).format('MMM D')
                  
                  return (
                    <div
                      key={apt._id}
                      className="absolute top-1 bottom-1 rounded-lg shadow-sm transition-all hover:shadow-md cursor-pointer group"
                      style={{
                        left: `${Math.max(startPercent, 0)}%`,
                        width: `${Math.min(widthPercent, 100)}%`,
                        backgroundColor: statusConfig.bg,
                        border: `2px solid ${statusConfig.color}`,
                        minWidth: '40px'
                      }}
                      onClick={() => navigate(`/appointments?highlight=${apt._id}`)}
                    >
                      <div className="h-full flex flex-col justify-center px-2 py-1 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <Avatar 
                            size={20} 
                            icon={<UserOutlined />} 
                            className="bg-blue-100 text-blue-600 flex-shrink-0"
                            style={{ width: 20, height: 20 }}
                          />
                          <div className="min-w-0 flex-1">
                            <Text strong className="text-xs truncate block">
                              {apt.patientName?.split(' ')[0] || 'Patient'}
                            </Text>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                              <span>{dateDisplay}</span>
                              <span>•</span>
                              <span>{formatTime(apt.schedule.startDateTime)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tag 
                            color={statusConfig.color === '#1890ff' ? 'blue' : statusConfig.color === '#52c41a' ? 'green' : 'red'}
                            className="text-[10px] m-0"
                          >
                            {statusConfig.label}
                          </Tag>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: '#e6f7ff', border: '1px solid #1890ff' }}></span>
                  <span>Upcoming</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: '#f6ffed', border: '1px solid #52c41a' }}></span>
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: '#fff1f0', border: '1px solid #ff4d4f' }}></span>
                  <span>Cancelled</span>
                </div>
                {viewMode !== 'day' && (
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <span className="text-xs">•</span>
                    <span>Compact view for {viewMode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default DoctorDashboard