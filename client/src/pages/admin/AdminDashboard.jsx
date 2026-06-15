import React, { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import axiosInstance from "../../services/axiosConfig"
import { useAuth } from '../../contexts/AuthContext'

function AdminDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
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
    { path: '/admin', label: 'Overview', icon: '📊', exact: true },
    { path: '/admin/doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { path: '/admin/patients', label: 'Patients', icon: '👤' },
    { path: '/admin/appointments', label: 'Appointments', icon: '📅' },
    { path: '/admin/products', label: 'Products', icon: '💊' },
    { path: '/admin/orders', label: 'Orders', icon: '📦' },
    { path: '/admin/categories', label: 'Categories', icon: '📁' },    
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' }
  ]

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true
    if (path !== '/admin' && location.pathname.startsWith(path)) return true
    return false
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
            <p className="text-xs text-gray-500">Manage platform</p>
          </div>
          <nav className="py-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 transition ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
                {item.label === 'Doctors' && stats.pendingApprovals > 0 && (
                  <span className="ml-auto bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                    {stats.pendingApprovals}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-6">
            {location.pathname === '/admin' ? (
              // Dashboard Overview
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                  <p className="text-gray-500">Welcome back, Admin</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Total Users</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">👥</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {stats.totalDoctors} Doctors | {stats.totalPatients} Patients
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Appointments</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.totalAppointments}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">📅</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Orders</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.totalOrders || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">📦</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Revenue</p>
                        <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">💰</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Actions</h3>
                    {stats.pendingApprovals > 0 ? (
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-yellow-600">{stats.pendingApprovals} doctors waiting for approval</p>
                        </div>
                        <Link to="/admin/doctors" className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
                          Review →
                        </Link>
                      </div>
                    ) : (
                      <p className="text-gray-500">No pending approvals</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard