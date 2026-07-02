// pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import axiosInstance from "../../services/axiosConfig"
import { useAuth } from '../../contexts/AuthContext'
import {
  Layout,
  Menu,
  Card,
  Statistic,
  Row,
  Col,
  Spin,
  Button,
  Space,
  Avatar,
  Badge,
  Typography,
  Divider,
  List,
  Tag
} from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  BellOutlined,
  AppstoreOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography

function AdminDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    lowStockProducts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/admin/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    { key: '/admin', label: 'Overview', icon: <DashboardOutlined /> },
    { key: '/admin/doctors', label: 'Doctors', icon: <UserOutlined /> },
    { key: '/admin/patients', label: 'Patients', icon: <TeamOutlined /> },
    { key: '/admin/appointments', label: 'Appointments', icon: <CalendarOutlined /> },
    { key: '/admin/products', label: 'Products', icon: <MedicineBoxOutlined /> },
    { key: '/admin/orders', label: 'Orders', icon: <ShoppingCartOutlined /> },
    { key: '/admin/categories', label: 'Categories', icon: <AppstoreOutlined /> },
    { key: '/admin/settings', label: 'Settings', icon: <SettingOutlined /> }
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    )
  }

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="shadow-lg"
        theme="light"
        width={240}
      >
        <div className="p-4 border-b flex items-center gap-2">
          {!collapsed && (
            <>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-lg font-bold text-blue-600">ViQure Admin</span>
            </>
          )}
          {collapsed && (
            <div className="w-full text-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-sm">V</span>
              </div>
            </div>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-r-0"
        />
      </Sider>

      <Layout>
        <Header className="bg-white shadow-sm px-6 flex items-center justify-between border-b" style={{ height: 64 }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <Title level={4} className="mb-0">Dashboard</Title>
          </Space>
          <Space>
            <Badge count={stats.pendingApprovals} size="small">
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Button>
          </Space>
        </Header>

        <Content className="p-6 bg-gray-50">
          {location.pathname === '/admin' ? (
            <div>
              <div className="mb-6">
                <Title level={2} className="mb-0">Dashboard Overview</Title>
                <Text type="secondary">Welcome back, Admin</Text>
              </div>

              <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} sm={12} lg={6}>
                  <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                      title="Total Users"
                      value={stats.totalUsers}
                      prefix={<UserOutlined className="text-blue-500" />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                    <div className="mt-2 text-sm text-gray-500">
                      {stats.totalDoctors} Doctors | {stats.totalPatients} Patients
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                      title="Appointments"
                      value={stats.totalAppointments}
                      prefix={<CalendarOutlined className="text-green-500" />}
                      valueStyle={{ color: '#22c55e' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                      title="Orders"
                      value={stats.totalOrders || 0}
                      prefix={<ShoppingCartOutlined className="text-orange-500" />}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                      title="Revenue"
                      value={stats.totalRevenue}
                      prefix="₹"
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card
                    title="Pending Actions"
                    className="shadow-sm"
                    extra={
                      stats.pendingApprovals > 0 && (
                        <Button type="primary" size="small" onClick={() => navigate('/admin/doctors')}>
                          Review →
                        </Button>
                      )
                    }
                  >
                    {stats.pendingApprovals > 0 ? (
                      <div className="flex items-center gap-4">
                        <Badge count={stats.pendingApprovals} color="gold" />
                        <Text>{stats.pendingApprovals} doctors waiting for approval</Text>
                      </div>
                    ) : (
                      <Text type="secondary">No pending approvals</Text>
                    )}
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card
                    title="Quick Stats"
                    className="shadow-sm"
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={12}>
                        <Statistic
                          title="Low Stock Products"
                          value={stats.lowStockProducts || 0}
                          valueStyle={{ color: '#ff4d4f' }}
                        />
                      </Col>
                      <Col xs={12}>
                        <Statistic
                          title="Pending Approvals"
                          value={stats.pendingApprovals || 0}
                          valueStyle={{ color: '#faad14' }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </div>
          ) : (
            <Outlet />
          )}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminDashboard