import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'

function DoctorEarnings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    totalAppointments: 0,
    breakdownByStatus: []
  })
  const [monthlyData, setMonthlyData] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('all')

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    try {
      const response = await axiosInstance.get('/doctors/me/earnings')
      const data = response.data.data || { totalEarnings: 0, totalAppointments: 0, breakdownByStatus: [] }
      setEarnings(data)
      
      // Generate monthly data from breakdown (mock for now, server would provide)
      generateMonthlyData()
    } catch (error) {
      console.error('Error fetching earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyData = () => {
    // Mock monthly data - in production this comes from server
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    const data = []
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      data.push({
        month: months[monthIndex],
        earnings: Math.floor(Math.random() * 8000) + 2000,
        appointments: Math.floor(Math.random() * 20) + 5
      })
    }
    setMonthlyData(data)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-50'
      case 'CONFIRMED': return 'text-blue-600 bg-blue-50'
      case 'PENDING': return 'text-yellow-600 bg-yellow-50'
      case 'CANCELLED': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return '✅'
      case 'CONFIRMED': return '📅'
      case 'PENDING': return '⏳'
      case 'CANCELLED': return '❌'
      default: return '📊'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const filteredBreakdown = selectedFilter === 'all' 
    ? earnings.breakdownByStatus 
    : earnings.breakdownByStatus.filter(b => b._id === selectedFilter)

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 to-green-800 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Earnings Dashboard</h1>
                <p className="text-green-100 mt-1">Your financial overview</p>
              </div>
              <button
                onClick={() => navigate('/doctor/profile')}
                className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                ← Back to Profile
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-500">Total Earnings</p>
            <p className="text-3xl font-bold text-green-600">₹{earnings.totalEarnings}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-500">Total Appointments</p>
            <p className="text-3xl font-bold text-blue-600">{earnings.totalAppointments}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {earnings.breakdownByStatus?.find(b => b._id === 'COMPLETED')?.count || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-500">Confirmed (Pending)</p>
            <p className="text-3xl font-bold text-yellow-600">
              {earnings.breakdownByStatus?.find(b => b._id === 'CONFIRMED')?.count || 0}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                selectedFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {earnings.breakdownByStatus?.map(b => (
              <button
                key={b._id}
                onClick={() => setSelectedFilter(b._id)}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  selectedFilter === b._id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {b._id} ({b.count})
              </button>
            ))}
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Appointment Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tax</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg per Appointment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No data available</td>
                  </tr>
                ) : (
                  filteredBreakdown.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item._id)}`}>
                          {getStatusIcon(item._id)} {item._id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{item.count}</td>
                      <td className="px-6 py-4 text-green-600 font-semibold">₹{item.totalEarnings}</td>
                      <td className="px-6 py-4 text-gray-600">₹{item.totalTax || 0}</td>
                      <td className="px-6 py-4 text-gray-900">₹{Math.round(item.totalEarnings / (item.count || 1))}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Last 6 Months Trend</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {monthlyData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.month}</span>
                    <span className="font-semibold">₹{item.earnings} ({item.appointments} appointments)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((item.earnings / 10000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorEarnings
