// App.jsx
import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { Layout, Menu, Dropdown, Avatar, Button, Badge, Space, Typography, ConfigProvider } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  ShopOutlined,
  CalendarOutlined,
  OrderedListOutlined,
  MenuOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LoginOutlined,
  UserAddOutlined,
  HomeOutlined,
  SettingOutlined,
  DollarOutlined,
  DownOutlined,
  AlertOutlined
} from '@ant-design/icons'
import RatingModalManager from './components/RatingModalManager'
import NotificationBell from './components/NotificationBell'

// Auth Pages
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOTP from './pages/VerifyOTP'
import ResetPassword from './pages/ResetPassword'
import PatientRegister from './pages/PatientRegister'
import DoctorRegister from './pages/DoctorRegister'


// Profile Pages
import PatientProfile from './pages/PatientProfile'
import DoctorProfile from './pages/DoctorProfile'
import DoctorSettings from './pages/DoctorSettings'
import DoctorEarnings from './pages/DoctorEarnings'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDoctors from './pages/admin/AdminDoctors'
import AdminPatients from './pages/admin/AdminPatients'
import AdminAppointments from './pages/admin/AdminAppointments'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminCategories from './pages/admin/AdminCategories'
import AdminIssues from './pages/admin/AdminIssues'
import AdminSettings from './pages/admin/AdminSettings'

// Other Pages
import Homepage from './pages/Homepage'
import DoctorDetails from './pages/DoctorDetails'
import DoctorBooking from './pages/DoctorBooking'
import Appointments from './pages/Appointments'
import Consultation from './pages/Consultation'
import Documents from './pages/Documents'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import DoctorDashboard from './pages/DoctorDashboard'

import ReportModal from './components/ReportModal'
import MyReports from './pages/MyReports'

const { Header, Content } = Layout
const { Title } = Typography

function Navigation() {
  const { isAuthenticated, user, logout, role } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [reportModalVisible, setReportModalVisible] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setDropdownOpen(false)
  }

  // ============ ADMIN NAVIGATION ============
  if (role === 'admin') {
    return (
      <>
        <Header className="bg-white shadow-sm px-6 flex items-center justify-between border-b sticky top-0 z-50" style={{ height: 64 }}>
          <div className="flex items-center gap-6">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <Title level={4} className="m-0 text-blue-700">
                ViQure Admin
              </Title>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <Button
              type="text"
              onClick={() => setReportModalVisible(true)}
              className="text-gray-700 hover:text-red-500 font-medium"
            >
              Report Issue
            </Button>
            <Dropdown
              menu={{
                items: [
                  { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined />, onClick: () => { navigate('/admin'); setDropdownOpen(false) } },
                  { key: 'documents', label: 'Documents', icon: <FileTextOutlined />, onClick: () => { navigate('/documents'); setDropdownOpen(false) } },
                  { type: 'divider' },
                  { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, onClick: handleLogout }
                ]
              }}
              placement="bottomRight"
            >
              <Button type="text" className="flex items-center gap-2">
                <Avatar icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Dropdown>
          </div>
        </Header>
        <ReportModal
          visible={reportModalVisible}
          onClose={() => setReportModalVisible(false)}
        />
      </>
    )
  }

  // ============ DOCTOR NAVIGATION ============
  if (role === 'doctor') {
    return (
      <>
        <Header className="bg-white shadow-sm px-4 md:px-6 flex items-center justify-between border-b sticky top-0 z-50" style={{ height: 64 }}>
          <Link to="/doctor/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <Title level={4} className="m-0 text-blue-700 hidden sm:block">
              ViQure
            </Title>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/doctor/dashboard">
              <Button type="text" className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600">
                <DashboardOutlined />
                <span>Dashboard</span>
              </Button>
            </Link>
            <Link to="/appointments">
              <Button type="text" className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600">
                <CalendarOutlined />
                <span>Appointments</span>
              </Button>
            </Link>
            <Link to="/doctor/earnings">
              <Button type="text" className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600">
                <DollarOutlined />
                <span>Earnings</span>
              </Button>
            </Link>
            <Link to="/doctor/settings">
              <Button type="text" className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600">
                <SettingOutlined />
                <span>Settings</span>
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <NotificationBell />
            <Button
              type="text"
              onClick={() => setReportModalVisible(true)}
              className="text-gray-700 hover:text-red-500 font-medium"
            >
              Report Issue
            </Button>
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', label: 'Profile', icon: <UserOutlined />, onClick: () => navigate('/doctor/profile') },
                  { key: 'documents', label: 'Documents', icon: <FileTextOutlined />, onClick: () => { navigate('/documents'); setDropdownOpen(false) } },
                  { key: 'appointments', label: 'Appointments', icon: <CalendarOutlined />, onClick: () => { navigate('/appointments'); setDropdownOpen(false) } },
                  { key: 'earnings', label: 'Earnings', icon: <DollarOutlined />, onClick: () => navigate('/doctor/earnings') },
                  { key: 'settings', label: 'Settings', icon: <SettingOutlined />, onClick: () => navigate('/doctor/settings') },
                  { key: 'divider', type: 'divider' },
                  { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, onClick: handleLogout, danger: true }
                ]
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button type="text" className="flex items-center gap-2 px-2">
                <Avatar icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                <span className="hidden sm:inline text-gray-700">
                  Dr. {user?.profile?.firstName || 'User'}
                </span>
                <DownOutlined className="text-xs text-gray-400" />
              </Button>
            </Dropdown>
          </div>
        </Header>
        <ReportModal
          visible={reportModalVisible}
          onClose={() => setReportModalVisible(false)}
        />
      </>
    )
  }

  // ============ PATIENT NAVIGATION ============
  const navItems = [
    { key: 'doctors', label: 'Find Doctors', icon: <UserOutlined />, path: '/' },
    { key: 'shop', label: 'Shop', icon: <ShopOutlined />, path: '/shop' },
  ]

  const authNavItems = [
    { key: 'appointments', label: 'My Appointments', icon: <CalendarOutlined />, path: '/appointments' },
    { key: 'orders', label: 'My Orders', icon: <OrderedListOutlined />, path: '/orders' },
  ]

  const profileMenuItems = [
    {
      key: 'profile',
      label: 'My Profile',
      icon: <UserOutlined />,
      onClick: () => {
        navigate('/patient/profile')
        setDropdownOpen(false)
      }
    },
    {
      key: 'documents',
      label: 'Documents',
      icon: <FileTextOutlined />,
      onClick: () => {
        navigate('/documents')
        setDropdownOpen(false)
      }
    },
    {
      key: 'appointments',
      label: 'Appointments',
      icon: <CalendarOutlined />,
      onClick: () => {
        navigate('/appointments')
        setDropdownOpen(false)
      }
    },
    {
      key: 'orders',
      label: 'Orders',
      icon: <OrderedListOutlined />,
      onClick: () => {
        navigate('/orders')
        setDropdownOpen(false)
      }
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true
    }
  ]

  return (
    <>
      <Header className="bg-white shadow-sm px-4 md:px-6 flex items-center justify-between border-b sticky top-0 z-50" style={{ height: 64 }}>
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <Title level={4} className="m-0 text-blue-700 hidden sm:block">
            ViQure
          </Title>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link key={item.key} to={item.path}>
              <Button type="text" className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600">
                {item.icon}
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}
          {isAuthenticated && authNavItems.map(item => (
            <Link key={item.key} to={item.path}>
              <Button type="text" className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600">
                {item.icon}
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>

        <div className="md:hidden">
          <Dropdown
            menu={{
              items: [
                ...navItems.map(item => ({
                  key: item.key,
                  label: <Link to={item.path} className="flex items-center gap-2">{item.icon} {item.label}</Link>
                })),
                ...(isAuthenticated ? authNavItems.map(item => ({
                  key: item.key,
                  label: <Link to={item.path} className="flex items-center gap-2">{item.icon} {item.label}</Link>
                })) : [])
              ]
            }}
            placement="bottomLeft"
          >
            <Button icon={<MenuOutlined />} type="text" />
          </Dropdown>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {isAuthenticated ? (
            <>
              <NotificationBell />
                <Button
                  type="text"
                  onClick={() => setReportModalVisible(true)}
                  className="text-gray-700 hover:text-red-500 font-medium"
                >
                  Report Issue
                </Button>
              <Dropdown
                menu={{ items: profileMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button
                  type="text"
                  className="flex items-center gap-2 px-3 py-1 h-auto"
                >
                  <Avatar icon={<UserOutlined />} className="bg-blue-100 text-blue-600" size="default" />
                  <span className="hidden sm:inline text-gray-700 font-medium">
                    {user?.profile?.firstName || 'User'}
                  </span>
                  <DownOutlined className="text-xs text-gray-400" />
                </Button>
              </Dropdown>
            </>
          ) : (
            <Space size="small">
              <Button type="link" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button type="primary" icon={<UserAddOutlined />} onClick={() => navigate('/register/patient')}>
                Sign Up
              </Button>
            </Space>
          )}
        </div>
      </Header>
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
      />
    </>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register/patient" element={<PatientRegister />} />
      <Route path="/register/doctor" element={<DoctorRegister />} />
      <Route path="/doctors" element={<Homepage />} />
      <Route path="/doctor/:id" element={<DoctorDetails />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetail />} />

      <Route path="/cart" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <Cart />
        </ProtectedRoute>
      } />

      <Route path="/checkout" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <Checkout />
        </ProtectedRoute>
      } />

      <Route path="/orders" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <Orders />
        </ProtectedRoute>
      } />

      <Route path="/orders/:id" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <OrderDetail />
        </ProtectedRoute>
      } />

      <Route path="/doctor/dashboard" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorDashboard />
        </ProtectedRoute>
      } />

      <Route path="/doctor/settings" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorSettings />
        </ProtectedRoute>
      } />

      <Route path="/doctor/earnings" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorEarnings />
        </ProtectedRoute>
      } />

      <Route path="/patient/profile" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <PatientProfile />
        </ProtectedRoute>
      } />

      <Route path="/doctor/profile" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorProfile />
        </ProtectedRoute>
      } />

      <Route path="/doctor/:id/book" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <DoctorBooking />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="doctors" element={<AdminDoctors />} />
        <Route path="patients" element={<AdminPatients />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="issues" element={<AdminIssues />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="/appointments" element={
        <ProtectedRoute allowedRoles={['patient', 'doctor']}>
          <Appointments />
        </ProtectedRoute>
      } />

      <Route path="/consultation/:id" element={
        <ProtectedRoute allowedRoles={['patient', 'doctor']}>
          <Consultation />
        </ProtectedRoute>
      } />

      <Route path="/documents" element={
        <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
          <Documents />
        </ProtectedRoute>
      } />
      <Route path="/my-reports" element={
        <ProtectedRoute allowedRoles={['patient', 'doctor']}>
          <MyReports />
        </ProtectedRoute>
      } />

    </Routes>
  )
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 12,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
          Layout: {
            headerBg: '#ffffff',
            headerPadding: '0 24px',
          },
          Button: {
            borderRadius: 10,
          },
          Card: {
            borderRadius: 16,
          },
        },
      }}
    >
      <Router>
        <AuthProvider>
          <Layout className="min-h-screen bg-gray-50">
            <Navigation />
            <Content className="p-4 md:p-6">
              <AppRoutes />
            </Content>
            <RatingModalManager />
          </Layout>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  )
}

export default App
