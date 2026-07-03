// pages/DoctorDashboard.jsx
import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, Row, Col, Statistic, Button, Typography, Space } from 'antd'
import { 
  CalendarOutlined, 
  UserOutlined, 
  DollarOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

function DoctorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Mock stats - will be replaced with real data later
  const stats = {
    totalAppointments: 156,
    completedAppointments: 142,
    pendingAppointments: 14,
    totalEarnings: 42500,
    todayAppointments: 4,
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <Title level={2} className="mb-1">
          Welcome back, Dr. {user?.profile?.firstName || 'Doctor'} 👋
        </Title>
        <Text type="secondary">
          Here's what's happening with your practice today
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-8">
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
      <Title level={4} className="mb-4">Quick Actions</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center">
              <CalendarOutlined className="text-3xl text-blue-500 mb-3" />
              <Title level={5} className="mb-1">View Appointments</Title>
              <Text type="secondary" className="text-sm">Check your schedule</Text>
              <div className="mt-3">
                <Button type="primary" onClick={() => navigate('/appointments')}>
                  Go to Appointments <ArrowRightOutlined />
                </Button>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center">
              <UserOutlined className="text-3xl text-green-500 mb-3" />
              <Title level={5} className="mb-1">My Profile</Title>
              <Text type="secondary" className="text-sm">Manage your profile</Text>
              <div className="mt-3">
                <Button onClick={() => navigate('/doctor/profile')}>
                  View Profile <ArrowRightOutlined />
                </Button>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center">
              <DollarOutlined className="text-3xl text-purple-500 mb-3" />
              <Title level={5} className="mb-1">Earnings</Title>
              <Text type="secondary" className="text-sm">Track your income</Text>
              <div className="mt-3">
                <Button onClick={() => navigate('/doctor/earnings')}>
                  View Earnings <ArrowRightOutlined />
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DoctorDashboard